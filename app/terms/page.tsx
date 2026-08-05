import React from 'react';

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-black text-neutral-300 font-sans selection:bg-neutral-800 selection:text-white">
      <main className="max-w-4xl mx-auto px-6 py-20">
        
        {/* Header */}
        <header className="mb-16 border-b border-neutral-800 pb-10">
          <h1 className="text-4xl font-medium tracking-tight text-white mb-4">
            Terms & Legal Disclosures
          </h1>
          <p className="text-sm text-neutral-500">
            Last Updated: August 2026
          </p>
        </header>

        {/* Navigation Index */}
        <nav className="mb-16 p-6 rounded-lg bg-neutral-950 border border-neutral-900">
          <h2 className="text-xs uppercase tracking-widest text-neutral-400 mb-4 font-semibold">
            Table of Contents
          </h2>
          <ul className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm text-neutral-400">
            <li><a href="#terms-of-service" className="hover:text-white transition-colors">1. Terms of Service</a></li>
            <li><a href="#minting-redemption" className="hover:text-white transition-colors">2. Token Minting & Redemption Terms</a></li>
            <li><a href="#aml-kyc" className="hover:text-white transition-colors">3. AML/KYC Notice</a></li>
            <li><a href="#privacy-policy" className="hover:text-white transition-colors">4. Privacy Policy</a></li>
            <li><a href="#cookie-policy" className="hover:text-white transition-colors">5. Cookie Policy</a></li>
            <li><a href="#disclaimer" className="hover:text-white transition-colors">6. Virtual Asset & Smart Contract Risk Disclosure</a></li>
          </ul>
        </nav>

        {/* Content Sections */}
        <div className="space-y-16 text-sm leading-relaxed text-neutral-400">

          {/* 1. Terms of Service */}
<section id="terms-of-use" className="scroll-mt-12">
  <h2 className="text-xl font-medium text-white mb-4 border-b border-neutral-900 pb-2">
    1. Terms of Service
  </h2>

  <h3 className="text-l font-medium text-white mb-3 tracking-tight">
    Acceptance of Terms
  </h3>
  <p className="mb-2">
    These Terms of Service (“Terms”) govern your access to and use of the Syncrate website, applications, smart contracts, and related services (collectively, the “Services”).
  </p>
  <p className="mb-2">
    By accessing or using the Services, you acknowledge that you have read, understood, and agree to be legally bound by these Terms. If you do not agree with any part of these Terms, you must not access or use the Services.
  </p>
  <p className="mb-2">
    These Terms constitute a legally binding agreement between you and Syncrate (or its applicable operating or issuing entity, depending on the Service provided).
  </p>

  <h3 className="text-l font-medium text-white mt-10 mb-3 tracking-tight">
    Eligibility
  </h3>
  <p className="mb-2">
    You may only use the Services if:
  </p>
  <ul className="list-disc list-outside ml-6 space-y-2 pl-1 mb-2">
    <li>
      you are at least 18 years old (or the legal age of majority in your jurisdiction);
    </li>
    <li>
      you have the legal capacity to enter into binding agreements;
    </li>
    <li>
      your use of the Services complies with all applicable laws and regulations;
    </li>
    <li>
      you are not located in, or ordinarily resident in, any jurisdiction where access to the Services would violate applicable law or where Syncrate has restricted access.
    </li>
  </ul>
  <p className="mb-2">
    Syncrate reserves the right to refuse or terminate access to the Services at any time where required for legal, regulatory, compliance, or security reasons.
  </p>

  <h3 className="text-l font-medium text-white mt-10 mb-3 tracking-tight">
    Nature of the Services
  </h3>
  <p className="mb-2">
    Syncrate provides technology infrastructure designed to facilitate the issuance, management, redemption, and transfer of tokenized real-world assets and related digital asset products.
  </p>
  <p className="mb-2">
    The Services may include:
  </p>
  <ul className="list-disc list-outside ml-6 space-y-3 pl-1 mb-6">
    <li>digital asset issuance;</li>
    <li>minting and redemption functionality;</li>
    <li>blockchain-based smart contracts;</li>
    <li>user dashboards;</li>
    <li>transaction history;</li>
    <li>informational content;</li>
    <li>APIs;</li>
    <li>documentation;</li>
    <li>other related services.</li>
  </ul>
  
  <p className="mb-2">
    Certain Services may require identity verification, additional documentation, or compliance reviews before access is granted.
  </p>
  <p className="mb-2">
    Availability of particular Services may vary depending on jurisdiction, regulatory requirements, or product eligibility.
  </p>
<h3 className="text-l font-medium text-white mt-10 mb-3 tracking-tight">
    Changes to these Terms
  </h3>
  <p className="mb-2">
    Syncrate may update these Terms from time to time to reflect changes in applicable law, regulatory requirements, technology, or the Services.
  </p>
  <p className="mb-2">
    Your continued use of the Services after revised Terms become effective constitutes acceptance of the updated Terms.
  </p>
<h3 className="text-l font-medium text-white mt-10 mb-3 tracking-tight">
    No Investment, Financial or Legal Advice
  </h3>
<p className="mb-2">
    The information provided through the Services is for general informational purposes only and should not be interpreted as financial, investment, legal, accounting, tax, or other professional advice.
  </p>
  <p className="mb-2">
    Nothing contained within the Services constitutes: an offer to sell securities, investment advice, portfolio management, financial planning, or a recommendation to buy, sell, or hold any digital asset.
  </p>
<p className="mb-2">
Users remain solely responsible for evaluating the suitability of any transaction and obtaining independent professional advice where appropriate.
</p>
</section>


          {/* 2. Token Minting & Redemption Terms */}
          <section id="minting-redemption" className="scroll-mt-12">
            <h2 className="text-xl font-medium text-white mb-4 border-b border-neutral-900 pb-2">
              2. Token Minting & Redemption Terms
            </h2>
  <h3 className="text-l font-medium text-white mb-3 tracking-tight">
    Overview
  </h3>
  <p className="mb-2">
    These Token Minting & Redemption Terms govern the creation (“Minting”) and redemption of XAUs through the Syncrate protocol.
  </p>
  <p className="mb-2">
    By minting or redeeming XAUs, you acknowledge and agree to these terms in addition to the Syncrate Terms of Service.
  </p>
<h3 className="text-l font-medium text-white mt-10 mb-3 tracking-tight">
    Minting
  </h3>
  <p className="mb-2">
  XAUs may only be minted by depositing a supported stablecoin through the Syncrate protocol. The amount of XAUs issued is calculated using the applicable gold reference price available at the time the transaction is processed. No XAUs are created without the successful receipt of the required collateral.
  </p>
<p className="mb-2">
Syncrate reserves the right to reject or suspend mint requests where required for legal, regulatory, compliance, security, or operational reasons.
</p>
<h3 className="text-l font-medium text-white mt-10 mb-3 tracking-tight">
    Redemption
  </h3>
  <p className="mb-2">
XAUs holders may redeem XAUs through the Syncrate protocol, subject to applicable eligibility requirements, fees, and operational procedures. Redemption proceeds are settled in supported stablecoins unless otherwise specified.
</p>
<p className="mb-2">
Where immediate liquidity is unavailable, redemption requests may be processed through the protocol’s redemption queue in accordance with the protocol’s operating procedures.
</p>
<p className="mb-2">
Redemption is considered complete only once settlement has been successfully processed by the protocol.
  </p>
<h3 className="text-l font-medium text-white mt-10 mb-3 tracking-tight">
    Pricing
  </h3>
  <p className="mb-2">
    Minting and redemption calculations are based on the protocol’s designated pricing mechanism at the time of execution.
</p>
<p className="mb-2">
    Users acknowledge that quoted amounts may differ from estimates shown prior to transaction execution due to market movements, oracle updates, transaction timing, network conditions, or applicable fees.
</p>
<h3 className="text-l font-medium text-white mt-10 mb-3 tracking-tight">
    Fees
  </h3>
  <p className="mb-2">
    Syncrate may charge minting, redemption, or other protocol fees. Applicable fees will be disclosed through the user interface before a transaction is confirmed and may be updated from time to time.
</p>
<h3 className="text-l font-medium text-white mt-10 mb-3 tracking-tight">
    Finality
  </h3>
  <p className="mb-2">
    Blockchain transactions are irreversible once confirmed on the applicable network. Users are solely responsible for verifying wallet addresses, transaction details, and amounts before submitting any mint or redemption request.
</p>
<h3 className="text-l font-medium text-white mt-10 mb-3 tracking-tight">
    Suspension of Services
  </h3>
  <p className="mb-2">
    Syncrate may temporarily suspend minting or redemption where necessary to protect users or protocol reserves, respond to security incidents or technical failures, comply with legal or regulatory obligations and perform protocol maintenance or upgrades.
</p>
<p className="mb-2">
Where reasonably practicable, users will be notified of planned service interruptions.
</p>
          </section>

          {/* 3. AML/KYC Notice */}
          <section id="aml-kyc" className="scroll-mt-12">
            <h2 className="text-xl font-medium text-white mb-4 border-b border-neutral-900 pb-2">
              3. Anti-Money Laundering (AML) & KYC Notice
            </h2>
            <p className="mb-2">
              Syncrate is committed to maintaining the integrity of its platform and complying with applicable anti-money laundering (“AML”), counter-terrorist financing (“CTF”), sanctions, and know-your-customer (“KYC”) laws and regulations. Interface endpoints actively screen connected Web3 wallet addresses against global sanctions registries (including OFAC, EU, and UN lists).
            </p>
            <p className="mb-2">
              Certain Services, including the minting and redemption of XAUs, require identity verification before access is granted. Users may be asked to provide personal information, identification documents, proof of address, source of funds, or other information reasonably required to satisfy applicable compliance obligations.
            </p>
           <p className="mb-2">
              Syncrate reserves the right to request additional information or documentation at any time, delay, suspend, or reject transactions pending compliance review, refuse access to the Services where legal or regulatory requirements cannot be satisfied and report suspicious activity to the appropriate authorities where required by applicable law.
            </p>
         <p className="mb-2">
              Users represent and warrant that they are not subject to applicable sanctions, acting on behalf of sanctioned persons or entities, or engaging in activities prohibited under applicable laws and regulations.
            </p>
<p className="mb-2">
By using the Services, you acknowledge that compliance checks may be conducted before or after a transaction and agree to cooperate with any reasonable requests necessary to satisfy Syncrate’s legal and regulatory obligations.
</p>
          </section>

          {/* 4. Privacy Policy */}
          <section id="privacy-policy" className="scroll-mt-12">
            <h2 className="text-xl font-medium text-white mb-4 border-b border-neutral-900 pb-2">
              4. Privacy Policy
            </h2>
          <h3 className="text-l font-medium text-white mt-10 mb-3 tracking-tight">
    Information We Collect
  </h3>
            <p className="mb-2">
              Syncrate may collect personal and technical information necessary to provide its Services, including: name and contact information; identity verification (KYC) documentation where required; wallet addresses and blockchain transaction data; device, browser, and usage information; communications submitted through our website or support channels. 
            </p>
            <p className="mb-2">
              Blockchain transactions are publicly recorded on their respective networks and are not controlled by Syncrate.
            </p>
<h3 className="text-l font-medium text-white mt-10 mb-3 tracking-tight">
    How We Use Your Information
  </h3>
            <p className="mb-2">
              Information collected may be used to provide and improve the Services, verify user identity and satisfy regulatory obligations, process minting and redemption requests, communicate with users regarding their accounts or transactions, maintain platform security and prevent fraud, comply with applicable legal and regulatory requirements.
            </p>
            <p className="mb-2">
              Syncrate does not sell users’ personal information to third parties.
            </p>
<h3 className="text-l font-medium text-white mt-10 mb-3 tracking-tight">
    Data Sharing
  </h3>
            <p className="mb-2">
              Information may be shared with trusted service providers, compliance partners, custodians, legal advisers, auditors, or competent regulatory authorities where necessary to operate the Services or comply with applicable law.
            </p>
<h3 className="text-l font-medium text-white mt-10 mb-3 tracking-tight">
    Data Security
  </h3>
            <p className="mb-2">
              Syncrate implements reasonable administrative, technical, and organizational safeguards designed to protect personal information. However, no method of electronic storage or transmission can be guaranteed to be completely secure.
</p>
<h3 className="text-l font-medium text-white mt-10 mb-3 tracking-tight">
    Your Rights
  </h3>
            <p className="mb-2">
              Subject to applicable law, users may request access to, correction of, or deletion of their personal information by contacting Syncrate. Certain information may be retained where required for legal, regulatory, or compliance purposes.
</p>
          </section>

          {/* 5. Cookie Policy */}
          <section id="cookie-policy" className="scroll-mt-12">
            <h2 className="text-xl font-medium text-white mb-4 border-b border-neutral-900 pb-2">
              5. Cookie Policy
            </h2>
            <p className="mb-2">
              The Syncrate web application uses essential session storage and local browser storage strictly to maintain user preferences (such as connected wallet state and RPC network selections). We do not utilize third-party tracking cookies, behavioral analytics cookies, or cross-site advertising scripts.
            </p>
<p className="mb-2">
Users may manage or disable cookies through their browser settings. Disabling certain cookies may affect the availability or functionality of parts of the website.
</p>
          </section>

          {/* 6. Virtual Asset & Smart Contract Risk Disclosure */}
          <section id="disclaimer" className="scroll-mt-12">
            <h2 className="text-xl font-medium text-white mb-4 border-b border-neutral-900 pb-2">
              6. Virtual Asset & Smart Contract Risk Disclosure
            </h2>
            <p className="mb-2">
              XAUs is a synthetic software token and does not represent direct legal ownership or physical custody of physical gold bullion. Interactions with smart contracts, decentralized finance protocols, and digital assets carry inherent software risks, including potential bugs, oracle latency, and network congestion.
            </p>
            <p className="mb-2">
              All smart-contract interactions are executed autonomously onchain on an "AS IS" and "AS AVAILABLE" basis without warranties of any kind. Users are solely responsible for safeguarding their wallets, private keys, recovery phrases, and access credentials. Syncrate cannot recover lost private keys or reverse blockchain transactions.
            </p>
<p className="mb-2">
Users are solely responsible for safeguarding their wallets, private keys, recovery phrases, and access credentials. Syncrate cannot recover lost private keys or reverse blockchain transactions.
</p>
<p className="mb-2">
Nothing in the Services guarantees uninterrupted availability, error-free operation, or protection from all technical or cybersecurity risks. Users should carefully evaluate the risks associated with digital assets before using the Services.
</p>
<p className="mb-2">
To the maximum extent permitted by applicable law, Syncrate shall not be liable for losses arising from blockchain network failures, smart contract vulnerabilities, third-party infrastructure failures, user error, unauthorized wallet access, or other risks inherent to decentralized technologies.
</p>
<p className="mb-2">
By accessing or using the Services, you acknowledge that you understand these risks and assume responsibility for your use of the Services.
</p>
          </section>

        </div>

        {/* Footer */}
        <footer className="mt-20 pt-8 border-t border-neutral-900 text-xs text-neutral-600 text-center">
          © 2026 Syncrate Protocol. All rights reserved.
        </footer>

      </main>
    </div>
  );
}
