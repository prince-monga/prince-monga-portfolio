import { Link } from 'react-router-dom'
import { ArrowRight, Code2, Github, Linkedin, MapPin, Shield } from 'lucide-react'
import { siteConfig } from '../data/content'
import { useSiteSettings } from '../context/SiteSettings'
import { publicApi } from '../lib/publicApi'
import { usePublicFetch } from '../hooks/usePublicFetch'
import ContentImage from './ContentImage'

export default function Hero() {
  const { settings } = useSiteSettings()
  const { data } = usePublicFetch(() => publicApi.siteImages.get())
  const profileImage = data?.data.profile_image_url
  const profileImageAlt = data?.data.profile_image_alt ?? ''
  const twitterUrl = settings.twitterUrl.trim()

  return (
    <section
      aria-labelledby="hero-heading"
      className="hero-section section-padding container-wide py-14 sm:py-20 md:py-24"
    >
      <div className="hero-layout">
        <div className="hero-copy min-w-0">
          <p className="eyebrow hero-kicker mb-5 inline-flex items-center gap-2">
            <Code2 size={14} aria-hidden="true" />
            Hi, I'm {settings.displayName}
          </p>

          <h1
            id="hero-heading"
            className="page-title hero-heading max-w-3xl text-4xl font-semibold leading-[1.04] text-neutral-950 dark:text-white sm:text-5xl md:text-6xl"
          >
            I build software{' '}
            <span className="hero-title-accent block">and document the journey.</span>
          </h1>

          <p className="mt-6 max-w-xl text-base leading-7 text-neutral-600 dark:text-neutral-400 sm:text-lg sm:leading-8">
            {settings.tagline}
          </p>

          <div className="hero-actions mt-8 flex flex-wrap items-center gap-3">
            <Link
              to="/projects"
              className="primary-action inline-flex min-h-12 items-center justify-center gap-2 rounded-lg bg-blue-600 px-5 py-3 text-sm font-semibold text-white transition-colors hover:bg-blue-700"
            >
              Explore projects
              <ArrowRight size={15} />
            </Link>
            <Link
              to="/journey"
              className="secondary-action inline-flex min-h-12 items-center justify-center gap-2 rounded-lg border border-neutral-300 bg-white/60 px-5 py-3 text-sm font-medium text-neutral-700 transition-colors hover:border-blue-300 hover:text-blue-700 dark:border-neutral-700 dark:bg-neutral-900/60 dark:text-neutral-200 dark:hover:border-blue-500/50 dark:hover:text-blue-300"
            >
              Read my journey
            </Link>
          </div>

          <div className="mt-8 flex items-center gap-2.5" aria-label="Social profiles">
            <span className="mr-1 text-xs text-neutral-500 dark:text-neutral-500">Find me</span>
            <a
              href={settings.githubUrl}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={`${settings.displayName} on GitHub`}
              className="hero-social-link"
            >
              <Github size={17} />
            </a>
            <a
              href={settings.linkedinUrl}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={`${settings.displayName} on LinkedIn`}
              className="hero-social-link"
            >
              <Linkedin size={17} />
            </a>
            <a
              href={siteConfig.tryhackme}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={`${settings.displayName} on TryHackMe`}
              className="hero-social-link"
            >
              <Shield size={17} />
            </a>
            {twitterUrl && (
              <a
                href={twitterUrl}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={`${settings.displayName} on Twitter`}
                className="hero-social-link"
              >
                <span className="text-sm font-mono">𝕏</span>
              </a>
            )}
          </div>
        </div>

        <div className="hero-visual surface-card" aria-label={`${settings.displayName} profile`}>
          <div className="hero-visual-grid" aria-hidden="true" />
          <div className="hero-portrait">
            <ContentImage
              src={profileImage}
              alt={profileImageAlt}
              className="h-full w-full rounded-2xl object-cover"
              fallback={
                <div
                  aria-hidden="true"
                  className="inline-flex h-full w-full items-center justify-center rounded-2xl bg-gradient-to-br from-green-500 to-emerald-800 font-mono text-4xl font-bold text-white select-none"
                >
                  PM
                </div>
              }
            />
          </div>
          <div className="hero-profile-caption relative mt-5 flex items-end justify-between gap-4">
            <div className="min-w-0">
              <p className="font-semibold text-neutral-900 dark:text-neutral-100">{settings.displayName}</p>
              <p className="mt-1 inline-flex items-center gap-1.5 text-xs text-neutral-500 dark:text-neutral-400">
                <MapPin size={12} aria-hidden="true" />
                {siteConfig.location}
              </p>
            </div>
            <span className="hero-profile-tag rounded-full border border-blue-500/20 bg-blue-500/10 px-2.5 py-1 font-mono text-[0.65rem] uppercase tracking-wider text-blue-700 dark:text-blue-300">
              Build · Learn · Share
            </span>
          </div>
        </div>
      </div>
    </section>
  )
}
