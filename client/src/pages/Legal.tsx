import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { useRoute } from "wouter";
import { ArrowLeft } from "lucide-react";
import { Link } from "wouter";

const guidelinesContent = {
  title: "Rules & Guidelines",
  sections: [
    {
      title: "1. General Conduct",
      items: [
        "Treat all members with respect. Harassment, bullying, hate speech, or personal attacks are strictly prohibited.",
        "Keep language appropriate. Excessive profanity, sexual content, or offensive slurs are not allowed.",
        "Avoid spam or self-promotion outside designated areas. Promote your music only in approved channels or submissions.",
        "Do not impersonate other users, artists, or SongVersus staff."
      ]
    },
    {
      title: "2. Content Guidelines",
      items: [
        "Only upload music, beats, or vocals that you own the rights to, or have permission to use. Unauthorized use of copyrighted material is prohibited.",
        "All submissions must comply with SongVersus rules and cannot contain illegal, explicit, or harmful content.",
        "Misleading titles, tags, or metadata (e.g., claiming your song is by a famous artist when it isn't) are not allowed.",
        "Song files must be clear and audible. Extremely low-quality, corrupted, or incomplete files may be removed."
      ]
    },
    {
      title: "2a. AI Content Rules",
      items: [
        "No fully AI-generated songs are allowed, except in specific tournament contexts. This ensures the community maintains creative integrity and fair competition.",
        "AI vocals may be used in a production sense (e.g., backing harmonies, ad-libs, or texture layers), but the main performance must be human unless otherwise stated in tournament rules.",
        "Songs that rely entirely on AI for vocals, lyrics, or production will be removed unless participating in an AI-allowed tournament.",
        "Any use of AI must be disclosed in the submission metadata (e.g., \"Contains AI-generated backing vocals\").",
        "Violations of AI content rules may result in removal of the song and/or account penalties."
      ]
    },
    {
      title: "3. Battles & Challenges",
      items: [
        "Respect the competitive nature of SongVersus: critiques should be constructive. Personal attacks toward other participants are forbidden.",
        "Submissions to battles must meet deadlines. Late submissions may be disqualified.",
        "Votes should reflect personal opinion on music quality and creativity, not personal relationships.",
        "Do not manipulate votes or create fake accounts to boost rankings."
      ]
    },
    {
      title: "4. Intellectual Property",
      items: [
        "By uploading to SongVersus, you confirm you own the rights or have proper licenses for all submitted content.",
        "SongVersus reserves the right to remove content that violates copyright laws, community standards, or AI content rules.",
        "Users retain ownership of their music but grant SongVersus permission to display, stream, and promote submissions on the platform."
      ]
    },
    {
      title: "5. Account & Safety",
      items: [
        "One account per user. Multiple accounts to bypass bans or manipulate votes are prohibited.",
        "Keep your login information secure. SongVersus is not responsible for account theft due to sharing passwords.",
        "Report any suspicious activity to SongVersus staff immediately."
      ]
    },
    {
      title: "6. Moderation & Enforcement",
      items: [
        "Violation of any rules may result in warnings, content removal, temporary bans, or permanent account suspension.",
        "Decisions by SongVersus moderators are final. Disputes will be reviewed fairly but respectfully.",
        "Users can appeal moderation decisions through official support channels."
      ]
    },
    {
      title: "7. Community Engagement",
      items: [
        "Constructive feedback is encouraged. Give detailed critiques rather than just positive/negative reactions.",
        "Collaborations are encouraged but must follow the same rules as individual submissions.",
        "Celebrate diversity: SongVersus welcomes all genres, styles, and backgrounds."
      ]
    },
    {
      title: "8. AI & Tournaments Exception",
      items: [
        "Certain tournaments may allow fully AI-generated songs, but this will always be explicitly stated in the tournament rules.",
        "Users entering these tournaments must follow the rules outlined for AI use in that specific competition.",
        "Outside of tournaments, submissions must prioritize human creativity. AI can assist in production but cannot replace main creative elements."
      ]
    },
    {
      title: "9. Updates to Rules",
      items: [
        "SongVersus reserves the right to update rules and guidelines at any time. Users are responsible for reviewing them regularly.",
        "Major changes will be communicated via email or platform notifications."
      ]
    }
  ]
};

const aiRulesContent = {
  title: "AI Rules",
  sections: [
    {
      title: "1. General AI Policy",
      items: [
        "Fully AI-generated songs are NOT allowed (except in tournaments).",
        "AI vocals are allowed only for production purposes: backing harmonies, ad-libs, and vocal textures.",
        "Main performance must always be human outside tournaments."
      ]
    },
    {
      title: "2. AI Usage Disclosure",
      items: [
        "Always disclose AI use in your submission metadata. Example: \"Contains AI-generated backing vocals\"",
        "Failure to disclose may lead to song removal or account penalties."
      ]
    },
    {
      title: "3. Tournaments & Exceptions",
      items: [
        "Some tournaments may allow fully AI-generated songs.",
        "Check the tournament rules carefully before submitting.",
        "Outside of these tournaments, human creativity is required."
      ]
    },
    {
      title: "4. Best Practices",
      items: [
        "Use AI to enhance your music, not replace it.",
        "Keep the main vocals, lyrics, and composition human.",
        "Transparency is key: your listeners should know what is AI-generated."
      ]
    },
    {
      title: "5. Quick Reference",
      items: [
        "Fully AI-generated song: NOT allowed outside AI tournaments",
        "AI backing vocals / production: ALLOWED (with disclosure)",
        "Main vocals AI-generated: NOT allowed outside AI tournaments",
        "AI-assisted instruments/effects: ALLOWED"
      ]
    }
  ]
};

const privacyContent = {
  title: "Privacy Policy",
  lastUpdated: "November 2024",
  sections: [
    {
      title: "1. Information We Collect",
      items: [
        "Account information: email address, username, profile picture, and password (encrypted).",
        "Content you upload: music files, beats, and associated metadata.",
        "Usage data: how you interact with our platform, including battles participated in, votes cast, and pages visited.",
        "Device information: browser type, IP address, and device identifiers for security and analytics purposes."
      ]
    },
    {
      title: "2. How We Use Your Information",
      items: [
        "To provide and maintain the SongVersus platform and services.",
        "To personalize your experience and show relevant content.",
        "To process transactions and manage your account.",
        "To communicate with you about updates, promotions, and platform changes.",
        "To detect and prevent fraud, abuse, and security issues."
      ]
    },
    {
      title: "3. Information Sharing",
      items: [
        "We do not sell your personal information to third parties.",
        "We may share data with service providers who help us operate the platform (e.g., hosting, analytics).",
        "Your public profile and submitted content are visible to other users as part of the platform experience.",
        "We may disclose information if required by law or to protect our rights and safety."
      ]
    },
    {
      title: "4. Data Security",
      items: [
        "We use industry-standard encryption to protect your data in transit and at rest.",
        "Passwords are securely hashed and never stored in plain text.",
        "We regularly review our security practices and update them as needed."
      ]
    },
    {
      title: "5. Your Rights",
      items: [
        "You can access, update, or delete your account information at any time through your profile settings.",
        "You can request a copy of your data or ask us to delete your account by contacting support.",
        "You can opt out of promotional emails using the unsubscribe link in any email."
      ]
    },
    {
      title: "6. Cookies & Tracking",
      items: [
        "We use cookies to maintain your session and remember your preferences.",
        "We use analytics tools to understand how users interact with the platform.",
        "You can control cookies through your browser settings."
      ]
    },
    {
      title: "7. Contact Us",
      items: [
        "If you have questions about this Privacy Policy, please contact us through our support channels or Discord server."
      ]
    }
  ]
};

const termsContent = {
  title: "Terms of Service",
  lastUpdated: "November 2024",
  sections: [
    {
      title: "1. Acceptance of Terms",
      items: [
        "By accessing or using SongVersus, you agree to be bound by these Terms of Service.",
        "If you do not agree to these terms, you may not use the platform.",
        "We reserve the right to modify these terms at any time. Continued use constitutes acceptance of changes."
      ]
    },
    {
      title: "2. Account Registration",
      items: [
        "You must be at least 13 years old to create an account.",
        "You are responsible for maintaining the security of your account credentials.",
        "You agree to provide accurate and complete information during registration.",
        "One account per person. Creating multiple accounts is prohibited."
      ]
    },
    {
      title: "3. User Content",
      items: [
        "You retain ownership of all content you upload to SongVersus.",
        "By uploading content, you grant SongVersus a non-exclusive license to display, stream, and promote your content on the platform.",
        "You represent that you own or have the necessary rights to all content you upload.",
        "SongVersus may remove content that violates our guidelines or applicable laws."
      ]
    },
    {
      title: "4. Virtual Currency (ORBs/Coins)",
      items: [
        "Virtual currency purchased or earned on SongVersus has no real-world monetary value.",
        "Virtual currency cannot be exchanged for cash or transferred between accounts.",
        "SongVersus reserves the right to modify the virtual economy at any time.",
        "Unused virtual currency is non-refundable."
      ]
    },
    {
      title: "5. Subscriptions & Payments",
      items: [
        "Subscription fees are billed according to the plan you select (monthly/yearly).",
        "Subscriptions auto-renew unless cancelled before the renewal date.",
        "Refunds are handled on a case-by-case basis according to our refund policy.",
        "Prices may change with reasonable notice to subscribers."
      ]
    },
    {
      title: "6. Prohibited Activities",
      items: [
        "Uploading content you do not have rights to use.",
        "Manipulating votes, rankings, or battle outcomes.",
        "Harassing, threatening, or abusing other users.",
        "Attempting to hack, exploit, or disrupt the platform.",
        "Using bots or automated tools without authorization."
      ]
    },
    {
      title: "7. Termination",
      items: [
        "We may suspend or terminate your account for violating these terms.",
        "You may delete your account at any time through your settings.",
        "Upon termination, your access to the platform and any purchased virtual currency will be revoked."
      ]
    },
    {
      title: "8. Limitation of Liability",
      items: [
        "SongVersus is provided \"as is\" without warranties of any kind.",
        "We are not liable for any indirect, incidental, or consequential damages.",
        "Our total liability is limited to the amount you paid us in the past 12 months."
      ]
    },
    {
      title: "9. Governing Law",
      items: [
        "These terms are governed by the laws of the United States.",
        "Any disputes will be resolved through binding arbitration."
      ]
    }
  ]
};

const copyrightContent = {
  title: "Copyright Policy",
  lastUpdated: "November 2024",
  sections: [
    {
      title: "1. Respect for Copyright",
      items: [
        "SongVersus respects the intellectual property rights of others and expects our users to do the same.",
        "Uploading content that infringes on the copyright of others is strictly prohibited.",
        "Repeat infringers may have their accounts terminated."
      ]
    },
    {
      title: "2. Your Rights as a Creator",
      items: [
        "You retain full ownership of all original content you create and upload to SongVersus.",
        "By uploading, you grant SongVersus a license to display and stream your content on the platform.",
        "You can remove your content at any time, which will revoke the license granted to SongVersus."
      ]
    },
    {
      title: "3. DMCA Takedown Requests",
      items: [
        "If you believe your copyrighted work has been posted on SongVersus without permission, you may submit a DMCA takedown notice.",
        "Notices must include: identification of the copyrighted work, location of the infringing content, your contact information, and a statement of good faith belief.",
        "We will respond to valid takedown requests within a reasonable timeframe."
      ]
    },
    {
      title: "4. Counter-Notification",
      items: [
        "If you believe your content was wrongly removed, you may submit a counter-notification.",
        "Counter-notifications must include your contact information, identification of the removed content, and a statement under penalty of perjury.",
        "Content may be restored if no legal action is taken within 10-14 business days."
      ]
    },
    {
      title: "5. Reporting Infringement",
      items: [
        "To report copyright infringement, contact us through our support channels.",
        "Include as much detail as possible about the original work and the infringing content.",
        "False claims of infringement may result in account suspension."
      ]
    },
    {
      title: "6. Licensing & Samples",
      items: [
        "If you use samples, loops, or stems from other sources, ensure you have proper licenses.",
        "Royalty-free content must still be used according to its license terms.",
        "When in doubt, create original content or obtain explicit permission."
      ]
    }
  ]
};

const contentMap: Record<string, typeof guidelinesContent> = {
  guidelines: guidelinesContent,
  ai: aiRulesContent,
  privacy: privacyContent,
  terms: termsContent,
  copyright: copyrightContent
};

export default function Legal() {
  const [, params] = useRoute("/legal/:type");
  const type = params?.type || "guidelines";
  const content = contentMap[type] || guidelinesContent;

  return (
    <div className="min-h-screen bg-sv-black">
      <Navbar />
      
      <div className="max-w-4xl mx-auto px-4 py-12">
        <Link href="/" className="inline-flex items-center gap-2 text-gray-400 hover:text-sv-pink transition-colors mb-8" data-testid="link-back-home">
          <ArrowLeft className="w-4 h-4" />
          <span className="font-hud text-sm">Back to Home</span>
        </Link>

        <div className="bg-sv-dark border border-sv-gray rounded-xl p-8 md:p-12">
          <h1 className="text-3xl md:text-4xl font-cyber font-bold text-white mb-2" data-testid="text-legal-title">
            {content.title}
          </h1>
          
          {'lastUpdated' in content && (
            <p className="text-gray-500 font-hud text-sm mb-8">
              Last Updated: {(content as any).lastUpdated}
            </p>
          )}

          <div className="space-y-8">
            {content.sections.map((section, idx) => (
              <div key={idx} className="border-l-2 border-sv-purple pl-6">
                <h2 className="text-xl font-cyber font-bold text-sv-gold mb-4" data-testid={`text-section-${idx}`}>
                  {section.title}
                </h2>
                <ul className="space-y-3">
                  {section.items.map((item, itemIdx) => (
                    <li key={itemIdx} className="text-gray-300 font-body leading-relaxed flex items-start gap-3">
                      <span className="text-sv-pink mt-1.5 text-xs">●</span>
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          <div className="mt-12 pt-8 border-t border-sv-gray">
            <p className="text-gray-500 font-body text-sm text-center">
              Questions? Contact us on{" "}
              <a 
                href="https://discord.gg/pNdgdWqW4j" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-sv-pink hover:text-sv-purple transition-colors"
              >
                Discord
              </a>{" "}
              or through our support channels.
            </p>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}
