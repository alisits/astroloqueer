import React from "react";


const PrivacyPolicy = () => {
  return (
    <div className="container mx-auto max-w-3xl px-6 py-12 leading-relaxed text-base">
      {/* Header */}
      <h1 className="text-4xl font-bold mb-6">Privacy Policy</h1>
      <p className="mb-6 text-sm italic">Last updated: 20 June 2025</p>

      {/* Intro */}
      <p className="mb-4">
        Astroloqueer ("<strong>we</strong>", "<strong>us</strong>", "<strong>our</strong>")
        is committed to protecting your privacy. This Policy explains what
        personal data we collect, how we use it, and the rights you have under
        the General Data Protection Regulation (GDPR) and other applicable
        laws.
      </p>

      {/* Data We Collect */}
      <h2 className="text-2xl font-semibold mt-8 mb-4">1. Information We Collect</h2>
      <ul className="list-disc pl-6 space-y-2">
        <li>
          <strong>Birth Details&nbsp;you provide</strong> – date, exact time, and place
          of birth that you enter into our form to generate a personalised
          reading.
        </li>
        <li>
          <strong>Personal Data</strong> – name, gender, sexual orientation, or pronouns if you
          choose to supply them.
        </li>
        <li>
          <strong>Usage Data</strong> – anonymised analytics such as IP address, device
          type, browser, referral URL, and on‑page actions collected via Google
          Analytics 4.
        </li>
        <li>
          <strong>Cookies & Tracking Technologies</strong> – small files placed on your
          device to remember preferences and, where enabled, personalise ads via
          Google AdSense.
        </li>
      </ul>

      {/* Purpose of Use */}
      <h2 className="text-2xl font-semibold mt-8 mb-4">
        2. How We Use Your Information
      </h2>
      <ul className="list-disc pl-6 space-y-2">
        <li>Create your natal chart or daily horoscope report in real time.</li>
        <li>Improve site performance, content relevance, and user experience.</li>
        <li>
          Serve non‑intrusive, contextual or personalised advertisements (only on
          pages with substantial content).
        </li>
        <li>Respond to enquiries and provide customer support.</li>
        <li>Comply with legal obligations and prevent misuse of our services.</li>
      </ul>

      {/* Legal Basis */}
      <h2 className="text-2xl font-semibold mt-8 mb-4">3. Legal Bases for Processing</h2>
      <p className="mb-4">
        We process your data according to one or more of the following legal
        grounds:
      </p>
      <ul className="list-disc pl-6 space-y-2">
        <li>
          <strong>Consent</strong> – when you actively provide birth details or accept
          non‑essential cookies.
        </li>
        <li>
          <strong>Contract</strong> – when processing is necessary to deliver the
          chart or horoscope you requested.
        </li>
        <li>
          <strong>Legitimate Interest</strong> – for security, analytics, and basic ads
          that keep our service free while respecting your privacy.
        </li>
      </ul>

      {/* Sharing */}
      <h2 className="text-2xl font-semibold mt-8 mb-4">4. Who We Share Data With</h2>
      <ul className="list-disc pl-6 space-y-2">
        <li>
          <strong>Hosting provider (Vercel EU)</strong> – stores our database and static
          assets in ISO‑certified data centres.
        </li>
        <li>
          <strong>Google Ireland Ltd.</strong> – for Analytics and AdSense. Google may set
          or read cookies to personalise ads if you give consent.
        </li>
        <li>
          <strong>No Sale of Personal Data</strong> – we never sell or rent your
          information to third parties.
        </li>
      </ul>

      {/* Cookies */}
      <h2 className="text-2xl font-semibold mt-8 mb-4">5. Cookies & Local Storage</h2>
      <p className="mb-4">
        When you first visit Astroloqueer, a banner allows you to accept,
        reject, or customise non‑essential cookies. Essential cookies (e.g.,
        session ID) are always active because the site cannot function without
        them.
      </p>
      <p className="mb-4">
        You can change or withdraw consent at any time via the “Cookie
        Preferences” link in the footer or through your browser settings.
      </p>

      {/* Retention */}
      <h2 className="text-2xl font-semibold mt-8 mb-4">6. Data Retention</h2>
      <ul className="list-disc pl-6 space-y-2">
        <li>
          Birth details are stored in pseudonymised form and purged after
          <strong>12 months</strong> unless you create an account to keep them longer.
        </li>
        <li>
          Analytics and ad‑interaction data are retained for
          <strong>14 months</strong> (Google Analytics default) then automatically
          deleted.
        </li>
      </ul>

      {/* Security */}
      <h2 className="text-2xl font-semibold mt-8 mb-4">7. Security Measures</h2>
      <p className="mb-4">
        We use HTTPS encryption, least‑privilege access controls, and regular
        security patching. No online service can guarantee absolute security,
        but we take commercially reasonable steps to protect your data.
      </p>

      {/* User Rights */}
      <h2 className="text-2xl font-semibold mt-8 mb-4">8. Your Rights</h2>
      <p className="mb-4">
        Under GDPR you have the right to access, rectify, erase, restrict, or
        port your personal data, and to object to certain processing. You may
        also withdraw consent at any time without affecting the lawfulness of
        processing based on consent before its withdrawal.
      </p>
      <p className="mb-4">
        To exercise any of these rights, contact us at
        <a href="mailto:alicka.lyre@gmail.com" className="underline ml-1">
          alicka.lyre@gmail.com
        </a>
        . We will respond within 30 days.
      </p>

      {/* Children */}
      <h2 className="text-2xl font-semibold mt-8 mb-4">9. Children’s Privacy</h2>
      <p className="mb-4">
        Astroloqueer is not directed at persons under 16. If you are a parent or
        guardian and believe your child has provided us with personal data,
        please contact us so we can delete it.
      </p>

      {/* Changes */}
      <h2 className="text-2xl font-semibold mt-8 mb-4">10. Changes to This Policy</h2>
      <p className="mb-4">
        We may update this Policy from time to time. We will post any changes on
        this page and, if they are significant, we will provide a more
        prominent notice (e.g., site banner). Please review the Policy regularly
        to stay informed.
      </p>

      {/* Contact */}
      <h2 className="text-2xl font-semibold mt-8 mb-4">11. Contact Us</h2>
      <p>
        For questions about this Privacy Policy or our data practices, email us
        at
        <a href="mailto:alicka.lyre@gmail.com" className="underline ml-1">
          alicka.lyre@gmail.com
        </a>
        
      </p>
    </div>
  );
};

export default PrivacyPolicy;
