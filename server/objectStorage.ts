import {
  S3Client,
  GetObjectCommand,
  PutObjectCommand,
  HeadObjectCommand,
  CopyObjectCommand,
  NotFound,
} from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { Response } from "express";
import { randomUUID } from "crypto";
import { Readable } from "stream";

// Re-export types from objectAcl to avoid circular dependency issues if we were to import them
// But for now we will implement the ACL logic directly here or update objectAcl.ts
// Let's define the interface for the "File" equivalent
export interface S3File {
  bucket: string;
  key: string;
}

const s3Client = new S3Client({
  region: process.env.AWS_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
  },
});

const BUCKET_NAME = process.env.AWS_BUCKET_NAME!;

export class ObjectNotFoundError extends Error {
  constructor() {
    super("Object not found");
    this.name = "ObjectNotFoundError";
    Object.setPrototypeOf(this, ObjectNotFoundError.prototype);
  }
}

export class ObjectStorageService {
  constructor() { }

  async getObjectEntityUploadURL(): Promise<string> {
    const objectId = randomUUID();
    const key = `uploads/${objectId}`;

    const command = new PutObjectCommand({
      Bucket: BUCKET_NAME,
      Key: key,
      ContentType: "application/octet-stream", // Default, client can override
    });

    // Expires in 15 minutes
    return getSignedUrl(s3Client, command, { expiresIn: 900 });
  }

  async getObjectEntityFile(objectPath: string): Promise<S3File> {
    if (!objectPath.startsWith("/objects/")) {
      throw new ObjectNotFoundError();
    }

    const entityId = objectPath.slice("/objects/".length);
    const key = `uploads/${entityId}`; // Assuming all uploads go to uploads/ prefix

    try {
      await s3Client.send(new HeadObjectCommand({ Bucket: BUCKET_NAME, Key: key }));
      return { bucket: BUCKET_NAME, key };
    } catch (error: any) {
      if (error.name === "NotFound" || error.$metadata?.httpStatusCode === 404) {
        throw new ObjectNotFoundError();
      }
      throw error;
    }
  }

  async downloadObject(file: S3File, res: Response, cacheTtlSec: number = 3600) {
    try {
      const command = new GetObjectCommand({
        Bucket: file.bucket,
        Key: file.key,
      });

      const response = await s3Client.send(command);

      // Handle ACL/Visibility check if needed, but for now we assume public read if they have the link
      // or we can check metadata.
      // For simplicity in this migration, we will check metadata if it exists.

      const isPublic = response.Metadata?.["visibility"] === "public";

      res.set({
        "Content-Type": response.ContentType || "application/octet-stream",
        "Content-Length": response.ContentLength?.toString(),
        "Cache-Control": `${isPublic ? "public" : "private"}, max-age=${cacheTtlSec}`,
      });

      if (response.Body instanceof Readable) {
        response.Body.pipe(res);
      } else {
        // Handle other body types if necessary (e.g. Blob, stream web)
        // Node.js SDK usually returns Readable for Body
        res.status(500).json({ error: "Unexpected stream type" });
      }
    } catch (error) {
      console.error("Error downloading file:", error);
      if (!res.headersSent) {
        res.status(500).json({ error: "Error downloading file" });
      }
    }
  }

  normalizeObjectEntityPath(rawPath: string): string {
    // If it's already a full URL, we might want to extract the ID
    // But for S3, we usually store the key.
    // If the client sends the full S3 URL, we need to parse it.
    // Example: https://sngv.s3.us-east-2.amazonaws.com/uploads/uuid

    try {
      const url = new URL(rawPath);
      if (url.hostname.includes("amazonaws.com")) {
        const parts = url.pathname.split("/");
        const uploadIndex = parts.indexOf("uploads");
        if (uploadIndex !== -1 && parts[uploadIndex + 1]) {
          return `/objects/${parts[uploadIndex + 1]}`;
        }
      }
    } catch (e) {
      // Not a URL, maybe a path
    }

    if (rawPath.startsWith("/objects/")) {
      return rawPath;
    }

    // Fallback or return as is if it doesn't match expected patterns
    return rawPath;
  }

  async trySetObjectEntityAclPolicy(
    rawPath: string,
    aclPolicy: { owner: string; visibility: "public" | "private" }
  ): Promise<string> {
    const normalizedPath = this.normalizeObjectEntityPath(rawPath);
    const file = await this.getObjectEntityFile(normalizedPath);

    // In S3, to update metadata, we must copy the object to itself
    const copyCommand = new CopyObjectCommand({
      Bucket: file.bucket,
      CopySource: `${file.bucket}/${file.key}`,
      Key: file.key,
      Metadata: {
        "owner": aclPolicy.owner,
        "visibility": aclPolicy.visibility,
        "acl-policy": JSON.stringify(aclPolicy)
      },
      MetadataDirective: "REPLACE",
    });

    await s3Client.send(copyCommand);

    return normalizedPath;
  }
}
