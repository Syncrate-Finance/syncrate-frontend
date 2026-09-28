'use client'

import { useState } from 'react'
import { GeistSans } from 'geist/font/sans'
import { GeistMono } from 'geist/font/mono'

interface FormData {
  name: string
  twitter: string
  telegram: string
  discord: string
  walletAddress: string
  referredBy: string
}

export default function PrimeBetaOnboardingPage() {
  const [formData, setFormData] = useState<FormData>({
    name: '',
    twitter: '',
    telegram: '',
    discord: '',
    walletAddress: '',
    referredBy: '',
  })

  const [loading, setLoading] = useState(false)
  const [submitted, setSubmitted] = useState(false)

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    // TODO: Send formData to your backend API endpoint / database
    await new Promise((resolve) => setTimeout(resolve, 1200))

    setLoading(false)
    setSubmitted(true)
  }

  return (
    <div
      className={`min-h-screen bg-[#030303] text-[#F5F5F5] p-4 sm:p-6 flex flex-col items-center justify-center antialiased ${GeistSans.variable} ${GeistMono.variable}`}
      style={{ fontFamily: 'var(--font-geist-sans), -apple-system, sans-serif' }}
    >
      <div className="w-full max-w-lg bg-[#0A0A0A] border border-[#111111] rounded-2xl p-6 sm:p-8 shadow-2xl flex flex-col gap-6 relative overflow-hidden my-8">
        {/* Subtle Ambient Glow */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-48 h-48 bg-[#0037FF]/5 rounded-full blur-3xl pointer-events-none" />

        {/* Header */}
        <div className="flex flex-col gap-2 relative z-10">
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full bg-[#0037FF]/10 border border-[#0037FF]/20 text-[10px] font-mono uppercase tracking-wider text-[#0037FF] font-semibold">
              Beta Access
            </span>
            <span className="text-[10px] font-mono text-[#666666] uppercase">
              Syncrate Prime
            </span>
          </div>
          <h1 className="text-2xl font-semibold text-white tracking-tight mt-1">
            Apply for Syncrate Prime
          </h1>
          <p className="text-xs text-[#888888] leading-relaxed">
            Fill out the details below to request early onboarding access to Syncrate Prime.
          </p>
        </div>

        {submitted ? (
          /* Success Screen */
          <div className="bg-[#030303] border border-emerald-950/40 rounded-xl p-6 text-center flex flex-col items-center gap-3 animate-in fade-in zoom-in-95 duration-300 my-4">
            <div className="w-10 h-10 rounded-full bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center">
              <span className="text-emerald-400 text-base">✓</span>
            </div>
            <h3 className="text-sm font-medium text-white">Application Received</h3>
            <p className="text-xs text-[#666666] leading-relaxed max-w-xs">
              Your application for Syncrate Prime beta access has been submitted. We'll reach out via your provided handles once verified.
            </p>
          </div>
        ) : (
          /* Onboarding Form */
          <form onSubmit={handleSubmit} className="flex flex-col gap-4 relative z-10">
            {/* Preferred Name */}
            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] font-mono tracking-wider text-[#888888] uppercase flex justify-between">
                <span>Preferred Name <span className="text-amber-500">*</span></span>
                <span className="text-[#555555] lowercase font-sans text-[10px]">(Legal name not required)</span>
              </label>
              <input
                type="text"
                name="name"
                required
                placeholder="e.g. Satoshi"
                value={formData.name}
                onChange={handleChange}
                disabled={loading}
                className="bg-[#030303] border border-[#222222] rounded-xl px-4 py-3 text-sm text-white placeholder-[#333333] focus:outline-none focus:border-[#444444] font-mono transition-colors"
              />
            </div>

            {/* Social Handles Group */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* X / Twitter */}
              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] font-mono tracking-wider text-[#888888] uppercase">
                  X / Twitter Handle <span className="text-amber-500">*</span>
                </label>
                <input
                  type="text"
                  name="twitter"
                  required
                  placeholder="@handle"
                  value={formData.twitter}
                  onChange={handleChange}
                  disabled={loading}
                  className="bg-[#030303] border border-[#222222] rounded-xl px-4 py-3 text-sm text-white placeholder-[#333333] focus:outline-none focus:border-[#444444] font-mono transition-colors"
                />
              </div>

              {/* Telegram */}
              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] font-mono tracking-wider text-[#666666] uppercase">
                  Telegram Handle
                </label>
                <input
                  type="text"
                  name="telegram"
                  placeholder="@handle"
                  value={formData.telegram}
                  onChange={handleChange}
                  disabled={loading}
                  className="bg-[#030303] border border-[#222222] rounded-xl px-4 py-3 text-sm text-white placeholder-[#333333] focus:outline-none focus:border-[#444444] font-mono transition-colors"
                />
              </div>
            </div>

            {/* Discord */}
            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] font-mono tracking-wider text-[#666666] uppercase">
                Discord Handle
              </label>
              <input
                type="text"
                name="discord"
                placeholder="username"
                value={formData.discord}
                onChange={handleChange}
                disabled={loading}
                className="bg-[#030303] border border-[#222222] rounded-xl px-4 py-3 text-sm text-white placeholder-[#333333] focus:outline-none focus:border-[#444444] font-mono transition-colors"
              />
            </div>

            {/* Wallet Address */}
            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] font-mono tracking-wider text-[#888888] uppercase">
                Interaction Wallet Address <span className="text-amber-500">*</span>
              </label>
              <input
                type="text"
                name="walletAddress"
                required
                placeholder="0x..."
                value={formData.walletAddress}
                onChange={handleChange}
                disabled={loading}
                className="bg-[#030303] border border-[#222222] rounded-xl px-4 py-3 text-sm text-white placeholder-[#333333] focus:outline-none focus:border-[#444444] font-mono transition-colors"
              />
              {/* SGLD Funding Notice */}
              <p className="text-[11px] text-[#666666] leading-normal mt-0.5">
                Syncrate Prime is funded by SGLD, so applying users should already have minted. If you haven't yet, you can mint SGLD on our{' '}
                <a
                  href="https://syncrate.org/sgld"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-white underline underline-offset-2 hover:text-[#0037FF] transition-colors"
                >
                  SGLD Minting Page
                </a>.
              </p>
            </div>

            {/* Referral Name */}
            <div className="flex flex-col gap-1.5 mt-1">
              <label className="text-[10px] font-mono tracking-wider text-[#666666] uppercase">
                Referred By (Name)
              </label>
              <input
                type="text"
                name="referredBy"
                placeholder="Name or handle of referrer"
                value={formData.referredBy}
                onChange={handleChange}
                disabled={loading}
                className="bg-[#030303] border border-[#222222] rounded-xl px-4 py-3 text-sm text-white placeholder-[#333333] focus:outline-none focus:border-[#444444] font-mono transition-colors"
              />
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading || !formData.name || !formData.twitter || !formData.walletAddress}
              className="w-full py-4 mt-2 bg-white text-[#030303] hover:bg-[#E5E5E5] font-medium text-sm rounded-lg transition-all flex items-center justify-center gap-2 disabled:opacity-30 disabled:hover:bg-white"
            >
              {loading ? (
                <>
                  <span className="w-4 h-4 border-2 border-t-transparent border-[#030303] rounded-full animate-spin" />
                  Submitting Application...
                </>
              ) : (
                'Submit Application'
              )}
            </button>
          </form>
        )}
      </div>
    </div>
  )
}
