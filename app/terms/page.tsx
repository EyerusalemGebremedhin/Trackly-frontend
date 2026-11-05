"use client";

import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-background py-12 px-4">
      <div className="max-w-3xl mx-auto">
        <Link href="/signup" className="flex items-center gap-2 text-primary hover:underline mb-8">
          <ArrowLeft size={16} />
          Back to Sign Up
        </Link>
        
        <div className="bg-surface border border-border rounded-xl p-8">
          <h1 className="text-3xl font-bold mb-2" style={{ fontFamily: 'var(--font-serif)' }}>Terms of Service</h1>
          <p className="text-text-secondary mb-8">Last updated: November 3, 2026</p>
          
          <div className="space-y-6 text-sm">
            <section>
              <h2 className="text-lg font-semibold mb-3">1. Acceptance of Terms</h2>
              <p className="text-text-secondary leading-relaxed">
                By accessing and using Trackly ("the Service"), you accept and agree to be bound by the terms and provision of this agreement.
              </p>
            </section>

            <section>
              <h2 className="text-lg font-semibold mb-3">2. Use License</h2>
              <p className="text-text-secondary leading-relaxed mb-2">
                Permission is granted to temporarily use Trackly for personal, non-commercial transitory viewing only. This is the grant of a license, not a transfer of title, and under this license you may not:
              </p>
              <ul className="list-disc list-inside space-y-1 text-text-secondary ml-4">
                <li>modify or copy the materials</li>
                <li>use the materials for any commercial purpose or for any public display</li>
                <li>attempt to reverse engineer any software contained on Trackly</li>
                <li>remove any copyright or other proprietary notations from the materials</li>
              </ul>
            </section>

            <section>
              <h2 className="text-lg font-semibold mb-3">3. User Accounts</h2>
              <p className="text-text-secondary leading-relaxed">
                You are responsible for safeguarding the password and for all activities that occur under your account. You agree not to disclose your password to any third party and to take sole responsibility for any activities or actions under your account.
              </p>
            </section>

            <section>
              <h2 className="text-lg font-semibold mb-3">4. Privacy</h2>
              <p className="text-text-secondary leading-relaxed">
                Your use of Trackly is also governed by our Privacy Policy. Please review our Privacy Policy, which also governs the site and informs users of our data collection practices.
              </p>
            </section>

            <section>
              <h2 className="text-lg font-semibold mb-3">5. Limitations</h2>
              <p className="text-text-secondary leading-relaxed">
                In no event shall Trackly or its suppliers be liable for any damages (including, without limitation, damages for loss of data or profit, or due to business interruption) arising out of the use or inability to use Trackly.
              </p>
            </section>

            <section>
              <h2 className="text-lg font-semibold mb-3">6. Governing Law</h2>
              <p className="text-text-secondary leading-relaxed">
                These terms and conditions are governed by and construed in accordance with the laws and you irrevocably submit to the exclusive jurisdiction of the courts in that state or location.
              </p>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
}
