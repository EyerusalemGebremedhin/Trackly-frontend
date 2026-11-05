"use client";

import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-background py-12 px-4">
      <div className="max-w-3xl mx-auto">
        <Link href="/signup" className="flex items-center gap-2 text-primary hover:underline mb-8">
          <ArrowLeft size={16} />
          Back to Sign Up
        </Link>
        
        <div className="bg-surface border border-border rounded-xl p-8">
          <h1 className="text-3xl font-bold mb-2" style={{ fontFamily: 'var(--font-serif)' }}>Privacy Policy</h1>
          <p className="text-text-secondary mb-8">Last updated: November 3, 2026</p>
          
          <div className="space-y-6 text-sm">
            <section>
              <h2 className="text-lg font-semibold mb-3">1. Information We Collect</h2>
              <p className="text-text-secondary leading-relaxed mb-2">
                We collect information you provide directly to us, such as when you create an account, use our services, or communicate with us. This may include:
              </p>
              <ul className="list-disc list-inside space-y-1 text-text-secondary ml-4">
                <li>Name and email address</li>
                <li>Account credentials</li>
                <li>Task and project data</li>
                <li>Communications with us</li>
              </ul>
            </section>

            <section>
              <h2 className="text-lg font-semibold mb-3">2. How We Use Your Information</h2>
              <p className="text-text-secondary leading-relaxed mb-2">
                We use the information we collect to:
              </p>
              <ul className="list-disc list-inside space-y-1 text-text-secondary ml-4">
                <li>Provide, maintain, and improve our services</li>
                <li>Process transactions and send related information</li>
                <li>Send technical notices and support messages</li>
                <li>Respond to your comments and questions</li>
                <li>Protect against fraud and abuse</li>
              </ul>
            </section>

            <section>
              <h2 className="text-lg font-semibold mb-3">3. Information Sharing</h2>
              <p className="text-text-secondary leading-relaxed">
                We do not sell, trade, or otherwise transfer your personal information to third parties without your consent, except as described in this policy. We may share information with service providers who assist us in operating our platform.
              </p>
            </section>

            <section>
              <h2 className="text-lg font-semibold mb-3">4. Data Security</h2>
              <p className="text-text-secondary leading-relaxed">
                We implement appropriate security measures to protect your personal information against unauthorized access, alteration, disclosure, or destruction. However, no method of transmission over the Internet is 100% secure.
              </p>
            </section>

            <section>
              <h2 className="text-lg font-semibold mb-3">5. Data Retention</h2>
              <p className="text-text-secondary leading-relaxed">
                We retain your personal information for as long as necessary to provide our services and as required by law. You may request deletion of your account and data at any time.
              </p>
            </section>

            <section>
              <h2 className="text-lg font-semibold mb-3">6. Your Rights</h2>
              <p className="text-text-secondary leading-relaxed">
                You have the right to access, update, or delete your personal information. You may also opt out of certain communications from us. To exercise these rights, please contact us.
              </p>
            </section>

            <section>
              <h2 className="text-lg font-semibold mb-3">7. Changes to This Policy</h2>
              <p className="text-text-secondary leading-relaxed">
                We may update this privacy policy from time to time. We will notify you of any changes by posting the new policy on this page and updating the "Last updated" date.
              </p>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
}
