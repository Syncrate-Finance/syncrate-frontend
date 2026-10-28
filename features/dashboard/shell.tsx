'use client'
import Link from 'next/link'
import { ConnectButton } from '@rainbow-me/rainbowkit'
import { ArrowUpRight, ChevronDown, Menu } from 'lucide-react'
import { GeistSans } from 'geist/font/sans'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogTitle,
  DialogDescription,
  DialogClose,
} from '@/components/ui/dialog'
import styles from './dashboard.module.css'
const navigation = [
  { href: '/dashboard', label: 'Overview' },
  { href: '/sgld', label: 'SGLD' },
  { href: '/sgld#transparency', label: 'Transparency' },
  { href: 'https://docs.syncrate.org', label: 'Docs', external: true },
]
export function BaseIcon() {
  return (
    <span className={styles.baseIcon} aria-hidden="true">
      <span />
    </span>
  )
}
export function Brand({ footer = false }: { footer?: boolean }) {
  return (
    <Link
      href={footer ? '/' : '/dashboard'}
      className={styles.brand}
      aria-label={footer ? 'Syncrate home' : 'Syncrate overview'}
    >
      <span className={styles.brandMark} aria-hidden="true" />
    </Link>
  )
}
export function WalletControl({ compact = false }: { compact?: boolean }) {
  return (
    <ConnectButton.Custom>
      {({
        account,
        chain,
        openAccountModal,
        openChainModal,
        openConnectModal,
        mounted,
      }) => {
        const wrongNetwork = account && chain?.id !== 8453
        return (
          <Button
            type="button"
            variant="gold"
            size={compact ? 'default' : 'sm'}
            disabled={!mounted}
            className={styles.walletButton}
            onClick={
              account
                ? wrongNetwork
                  ? openChainModal
                  : openAccountModal
                : openConnectModal
            }
            aria-label={
              account
                ? wrongNetwork
                  ? 'Switch wallet to Base'
                  : 'Open connected wallet'
                : 'Connect wallet'
            }
          >
            {account ? (
              <>
                <BaseIcon />
                {wrongNetwork ? 'Switch to Base' : account.displayName}
                <ChevronDown size={13} />
              </>
            ) : (
              'Connect Wallet'
            )}
          </Button>
        )
      }}
    </ConnectButton.Custom>
  )
}
export function DashboardHeader({
  active = 'overview',
}: {
  active?: 'overview' | 'information'
}) {
  return (
    <header className={styles.header}>
      <div className={styles.headerInner}>
        <Brand />
        <nav className={styles.desktopNavigation} aria-label="Main navigation">
          {navigation.map((item) => (
            <Link
              key={item.label}
              href={item.href}
              {...(item.external
                ? { target: '_blank', rel: 'noopener noreferrer' }
                : {})}
              className={
                active === 'overview' && item.label === 'Overview'
                  ? styles.activeNavigation
                  : undefined
              }
              aria-current={
                active === 'overview' && item.label === 'Overview'
                  ? 'page'
                  : undefined
              }
            >
              {item.label}
              {item.external && <ArrowUpRight size={12} />}
            </Link>
          ))}
        </nav>
        <div className={styles.headerActions}>
          <WalletControl />
          <Dialog>
            <DialogTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className={styles.mobileMenu}
                aria-label="Open navigation"
              >
                <Menu size={20} />
              </Button>
            </DialogTrigger>
            <DialogContent className={styles.navigationDialog}>
              <DialogTitle className={styles.dialogTitle}>
                Explore Syncrate
              </DialogTitle>
              <DialogDescription className={styles.dialogDescription}>
                Products, transparency and documentation.
              </DialogDescription>
              <nav
                className={styles.mobileNavigation}
                aria-label="Mobile navigation"
              >
                {navigation.map((item) => (
                  <DialogClose asChild key={item.label}>
                    <Link
                      href={item.href}
                      {...(item.external
                        ? { target: '_blank', rel: 'noopener noreferrer' }
                        : {})}
                    >
                      {item.label}
                      <ArrowUpRight size={16} />
                    </Link>
                  </DialogClose>
                ))}
              </nav>
            </DialogContent>
          </Dialog>
        </div>
      </div>
    </header>
  )
}
export function DashboardFooter() {
  return (
    <footer className={styles.footer}>
      <div className={styles.footerTop}>
        <div>
          <Brand footer />
          <p>Gold, built for onchain finance.</p>
          <a
            href="https://docs.syncrate.org"
            target="_blank"
            rel="noopener noreferrer"
            className={styles.footerDocs}
          >
            Read the documentation <ArrowUpRight size={14} />
          </a>
        </div>
        <div className={styles.footerLinks}>
          <h2>Products</h2>
          <Link href="/sgld">SGLD</Link>
          <Link href="/sysgld">sySGLD</Link>
          <Link href="/dashboard">Overview</Link>
        </div>
        <div className={styles.footerLinks}>
          <h2>Resources</h2>
          <Link href="/insights">Insights</Link>
          <Link href="/terms">Terms & disclosures</Link>
          <a
            href="https://github.com/Syncrate-Finance"
            target="_blank"
            rel="noopener noreferrer"
          >
            GitHub <ArrowUpRight size={12} />
          </a>
        </div>
      </div>
      <div className={styles.footerBottom}>
        <span>© 2026 Syncrate</span>
        <span>
          <BaseIcon /> Built on Base
        </span>
      </div>
    </footer>
  )
}
export function DashboardShell({
  children,
  active = 'overview',
}: {
  children: React.ReactNode
  active?: 'overview' | 'information'
}) {
  return (
    <div className={`${styles.dashboard} ${GeistSans.variable}`}>
      <a className={styles.skipLink} href="#main-content">
        Skip to content
      </a>
      <DashboardHeader active={active} />
      {children}
      <DashboardFooter />
    </div>
  )
}
