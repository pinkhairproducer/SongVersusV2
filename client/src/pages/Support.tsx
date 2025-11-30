import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { ArrowLeft, MessageCircle, Mail, HelpCircle, Bug, Lightbulb } from "lucide-react";
import { Link } from "wouter";

export default function Support() {
  return (
    <div className="min-h-screen bg-sv-black">
      <Navbar />
      
      <div className="max-w-4xl mx-auto px-4 py-12">
        <Link href="/" className="inline-flex items-center gap-2 text-gray-400 hover:text-sv-pink transition-colors mb-8" data-testid="link-back-home">
          <ArrowLeft className="w-4 h-4" />
          <span className="font-hud text-sm">Back to Home</span>
        </Link>

        <div className="bg-sv-dark border border-sv-gray rounded-xl p-8 md:p-12">
          <h1 className="text-3xl md:text-4xl font-cyber font-bold text-white mb-4" data-testid="text-support-title">
            Support Center
          </h1>
          <p className="text-gray-400 font-body text-lg mb-10">
            Need help? We're here for you. Choose how you'd like to get in touch.
          </p>

          <div className="grid gap-6 md:grid-cols-2">
            <a 
              href="https://discord.gg/pNdgdWqW4j" 
              target="_blank" 
              rel="noopener noreferrer"
              className="group bg-sv-black border border-sv-gray hover:border-sv-purple rounded-xl p-6 transition-all duration-300"
              data-testid="link-discord-support"
            >
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-sv-purple/20 rounded-lg flex items-center justify-center group-hover:bg-sv-purple/30 transition-colors">
                  <MessageCircle className="w-6 h-6 text-sv-purple" />
                </div>
                <div>
                  <h3 className="text-lg font-cyber font-bold text-white mb-2">Discord Community</h3>
                  <p className="text-gray-400 font-body text-sm">
                    Join our Discord server for real-time support, community discussions, and the latest updates.
                  </p>
                  <span className="text-sv-purple font-hud text-sm mt-3 inline-block group-hover:underline">
                    Join Discord →
                  </span>
                </div>
              </div>
            </a>

            <a 
              href="mailto:support@songversus.com"
              className="group bg-sv-black border border-sv-gray hover:border-sv-pink rounded-xl p-6 transition-all duration-300"
              data-testid="link-email-support"
            >
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-sv-pink/20 rounded-lg flex items-center justify-center group-hover:bg-sv-pink/30 transition-colors">
                  <Mail className="w-6 h-6 text-sv-pink" />
                </div>
                <div>
                  <h3 className="text-lg font-cyber font-bold text-white mb-2">Email Support</h3>
                  <p className="text-gray-400 font-body text-sm">
                    Send us an email and we'll get back to you within 24-48 hours.
                  </p>
                  <span className="text-sv-pink font-hud text-sm mt-3 inline-block group-hover:underline">
                    support@songversus.com
                  </span>
                </div>
              </div>
            </a>
          </div>

          <div className="mt-10 border-t border-sv-gray pt-10">
            <h2 className="text-xl font-cyber font-bold text-sv-gold mb-6">Common Topics</h2>
            
            <div className="space-y-4">
              <div className="flex items-start gap-4 p-4 bg-sv-black rounded-lg border border-sv-gray">
                <HelpCircle className="w-5 h-5 text-sv-gold mt-0.5 flex-shrink-0" />
                <div>
                  <h4 className="font-cyber font-bold text-white mb-1">Account Issues</h4>
                  <p className="text-gray-400 font-body text-sm">
                    Problems logging in, resetting password, or managing your account settings.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4 p-4 bg-sv-black rounded-lg border border-sv-gray">
                <Bug className="w-5 h-5 text-sv-pink mt-0.5 flex-shrink-0" />
                <div>
                  <h4 className="font-cyber font-bold text-white mb-1">Bug Reports</h4>
                  <p className="text-gray-400 font-body text-sm">
                    Found something broken? Let us know so we can fix it quickly.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4 p-4 bg-sv-black rounded-lg border border-sv-gray">
                <Lightbulb className="w-5 h-5 text-sv-purple mt-0.5 flex-shrink-0" />
                <div>
                  <h4 className="font-cyber font-bold text-white mb-1">Feature Requests</h4>
                  <p className="text-gray-400 font-body text-sm">
                    Have an idea to make SongVersus better? We'd love to hear it!
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-10 p-6 bg-gradient-to-r from-sv-purple/20 to-sv-pink/20 rounded-xl border border-sv-purple/30">
            <p className="text-center text-gray-300 font-body">
              For the fastest response, join our{" "}
              <a 
                href="https://discord.gg/pNdgdWqW4j" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-sv-pink hover:underline font-bold"
              >
                Discord server
              </a>{" "}
              where our team and community are ready to help!
            </p>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}
