import React from 'react';

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-black text-neutral-300 font-sans selection:bg-neutral-800 selection:text-white">
      <main className="max-w-4xl mx-auto px-6 py-20">
        
        {/* Header */}
        <header className="mb-16 border-b border-neutral-800 pb-10">
          <h1 className="text-4xl font-light tracking-tight text-white mb-4">
            Legal Terms & Disclosures
          </h1>
          <p className="text-sm text-neutral-500 uppercase tracking-widest">
            Last Updated: 5th August 2026
          </p>
        </header>

        {/* Navigation Index */}
        <nav className="mb-16 p-6 rounded-lg bg-neutral-950 border border-neutral-900">
          <h2 className="text-xs uppercase tracking-widest text-neutral-400 mb-4 font-semibold">
            Table of Contents
          </h2>
          <ul className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm text-neutral-400">
            <li><a href="#terms-of-use" className="hover:text-white transition-colors">1. Terms of Use</a></li>
            <li><a href="#minting-redemption" className="hover:text-white transition-colors">2. Token Minting & Redemption Terms</a></li>
            <li><a href="#aml-kyc" className="hover:text-white transition-colors">3. AML/KYC Notice</a></li>
            <li><a href="#privacy-policy" className="hover:text-white transition-colors">4. Privacy Policy</a></li>
            <li><a href="#cookie-policy" className="hover:text-white transition-colors">5. Cookie Policy</a></li>
            <li><a href="#disclaimer" className="hover:text-white transition-colors">6. Virtual Asset & Smart Contract Disclaimer</a></li>
          </ul>
        </nav>

        {/* Content Sections */}
        <div className="space-y-16 text-sm leading-relaxed text-neutral-400">

          {/* 1. Terms of Use */}
          <section id="terms-of-use" className="scroll-mt-12">
            <h2 className="text-xl font-medium text-white mb-4 border-b border-neutral-900 pb-2">
              1. Terms of Use
            </h2>
            <p className="mb-3">
              By accessing or using the Syncrate interface, smart contracts, or protocol (collectively, the "Platform"), you agree to be bound by these Terms of Use. If you do not agree to all terms, you must immediately cease accessing and using the Platform.
            </p>
            <p className="mb-3">
              The Platform provides decentralized smart-contract routing for synthetic gold exposure (XAUs) on the Base network[span_1](start_span)[span_1](end_span). You represent and warrant that you are legally permitted to interact with Web3 software in your jurisdiction and are not located in or a resident of any restricted or sanctioned territory.
            </p>
          </section>

          {/* 2. Token Minting & Redemption Terms */}
          <section id="minting-redemption" className="scroll-mt-12">
            <h2 className="text-xl font-medium text-white mb-4 border-b border-neutral-900 pb-2">
              2. Token Minting & Redemption Terms
            </h2>
            <p className="mb-3">
              <strong>Minting:</strong> Minting XAUs requires depositing permitted USD-denominated stablecoin collateral into the Syncrate Engine[span_2](start_span)[span_2](end_span). All mint transactions are fee-free (0%) and execute synchronously based on real-time Chainlink Gold/USD oracle feeds[span_3](start_span)[span_3](end_span).
            </p>
            <p className="mb-3">
              <strong>Redemptions:</strong> Redemptions burn XAUs to release equivalent underlying stablecoin collateral minus a standard 0.25% protocol fee[span_4](start_span)[span_4](end_span). 
            </p>
            <p className="mb-3">
              <strong>Dual-Path Settlement:</strong> Immediate redemption is subject to available contract liquidity buffers[span_5](start_span)[span_5](end_span). If buffer liquidity is insufficient, redemptions automatically enter an asynchronous First-In, First-Out (FIFO) queue[span_6](start_span)[span_6](end_span). Tokens are burned immediately upon queuing to lock economic claims[span_7](start_span)[span_7](end_span). Queue processing relies on public execution (`processQueue`) as collateral buffers are replenished[span_8](start_span)[span_8](end_span).
            </p>
          </section>

          {/* 3. AML/KYC Notice */}
          <section id="aml-kyc" className="scroll-mt-12">
            <h2 className="text-xl font-medium text-white mb-4 border-b border-neutral-900 pb-2">
              3. Anti-Money Laundering (AML) & Sanctions Notice
            </h2>
            <p className="mb-3">
              Syncrate is committed to compliance with applicable international sanctions laws and anti-money laundering regulations. Interface endpoints actively screen connected Web3 wallet addresses against global sanctions registries (including OFAC, EU, and UN lists).
            </p>
            <p className="mb-3">
              Addresses identified as interacting with sanctioned entities, mixing services, or illicit activities will be restricted from using the web interface.
            </p>
          </section>

          {/* 4. Privacy Policy */}
          <section id="privacy-policy" className="scroll-mt-12">
            <h2 className="text-xl font-medium text-white mb-4 border-b border-neutral-900 pb-2">
              4. Privacy Policy
            </h2>
            <p className="mb-3">
              Syncrate does not collect, store, or sell personal identifying information such as names, physical addresses, or government identification numbers. 
            </p>
            <p className="mb-3">
              Public blockchain data (including wallet addresses, transaction hashes, and on-chain interactions with the XAUs token and Syncrate Engine contracts) is inherently transparent and immutable on the Base blockchain[span_9](start_span)[span_9](end_span). Web interface hosting services may record basic network telemetry (such as IP addresses and browser headers) strictly for security and DDoS mitigation.
            </p>
          </section>

          {/* 5. Cookie Policy */}
          <section id="cookie-policy" className="scroll-mt-12">
            <h2 className="text-xl font-medium text-white mb-4 border-b border-neutral-900 pb-2">
              5. Cookie Policy
            </h2>
            <p className="mb-3">
              The Syncrate web application uses essential session storage and local browser storage strictly to maintain user preferences (such as connected wallet state and RPC network selections). We do not utilize third-party tracking cookies, behavioral analytics cookies, or cross-site advertising scripts.
            </p>
          </section>

          {/* 6. Virtual Asset & Smart Contract Disclaimer */}
          <section id="disclaimer" className="scroll-mt-12">
            <h2 className="text-xl font-medium text-white mb-4 border-b border-neutral-900 pb-2">
              6. Virtual Asset & Smart Contract Disclaimer
            </h2>
            <p className="mb-3">
              XAUs is a synthetic software token and does not represent direct legal ownership or physical custody of physical gold bullion. Interactions with smart contracts, decentralized finance protocols, and digital assets carry inherent software risks, including potential bugs, oracle latency, and network congestion[span_10](start_span)[span_10](end_span).
            </p>
            <p className="mb-3">
              All smart-contract interactions are executed autonomously on-chain on an "AS IS" and "AS AVAILABLE" basis without warranties of any kind. You assume total responsibility for all risks associated with cryptographic wallet management and protocol interactions.
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
