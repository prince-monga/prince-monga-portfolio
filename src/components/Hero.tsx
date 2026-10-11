import { Link } from 'react-router-dom'
import { ArrowRight, Github, Linkedin, Shield } from 'lucide-react'
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
      className="section-padding container-wide py-20 md:py-28"
    >
      <div className="mb-8 inline-flex h-14 w-14 items-center justify-center overflow-hidden rounded-xl">
        <ContentImage
          src={profileImage}
          alt={profileImageAlt}
          className="h-full w-full rounded-xl object-cover"
          fallback={
            <div
              aria-hidden="true"
              className="inline-flex h-full w-full items-center justify-center rounded-xl bg-blue-600 font-mono text-lg font-bold text-white select-none"
            >
              PM
            </div>
          }
        />
      </div>

      <p className="text-sm font-mono text-blue-600 dark:text-blue-400 mb-3 tracking-wide">
        Hi, I'm {settings.displayName}
      </p>

      <h1
        id="hero-heading"
        className="text-3xl sm:text-4xl md:text-5xl font-bold text-neutral-900 dark:text-neutral-100 leading-tight tracking-tight max-w-2xl"
      >
        I build software and document the journey.
      </h1>

      <p className="mt-5 text-base sm:text-lg text-neutral-600 dark:text-neutral-400 max-w-xl leading-relaxed">
        {settings.tagline}
      </p>

      <div className="mt-8 flex flex-wrap items-center gap-3">
        <Link
          to="/projects"
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-md transition-colors"
        >
          Explore Projects
          <ArrowRight size={15} />
        </Link>
        <Link
          to="/journey"
          className="inline-flex items-center gap-2 px-4 py-2.5 border border-neutral-300 dark:border-neutral-700 text-neutral-700 dark:text-neutral-300 hover:border-neutral-400 dark:hover:border-neutral-500 text-sm font-medium rounded-md transition-colors"
        >
          Read My Journey
        </Link>
      </div>

      {/* Social links */}
      <div className="mt-6 flex items-center gap-4">
        <a
          href={settings.githubUrl}
          target="_blank"
          rel="noopener noreferrer"
          aria-label={`${settings.displayName} on GitHub`}
          className="text-neutral-500 hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-neutral-100 transition-colors"
        >
          <Github size={18} />
        </a>
        <a
          href={settings.linkedinUrl}
          target="_blank"
          rel="noopener noreferrer"
          aria-label={`${settings.displayName} on LinkedIn`}
          className="text-neutral-500 hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-neutral-100 transition-colors"
        >
          <Linkedin size={18} />
        </a>
        <a
          href={siteConfig.tryhackme}
          target="_blank"
          rel="noopener noreferrer"
          aria-label="Prince Monga on TryHackMe"
          className="text-neutral-500 hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-neutral-100 transition-colors"
        >
          <Shield size={18} />
        </a>
        {twitterUrl && (
          <a
            href={twitterUrl}
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Prince Monga on Twitter"
            className="text-neutral-500 hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-neutral-100 transition-colors"
          >
            <span className="text-sm font-mono">𝕏</span>
          </a>
        )}
      </div>
    </section>
  )
}
