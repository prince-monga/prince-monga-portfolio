import { Link } from 'react-router-dom'
import { ArrowRight, Github, Linkedin, Shield } from 'lucide-react'
import { siteConfig } from '../data/content'

export default function Hero() {
  const twitterUrl = siteConfig.twitter?.trim()
  const hasTwitter = Boolean(twitterUrl && !twitterUrl.startsWith('<!--') && !twitterUrl.includes('REPLACE'))

  return (
    <section
      aria-labelledby="hero-heading"
      className="section-padding container-wide py-20 md:py-28"
    >
      {/* Typographic avatar */}
      <div
        aria-hidden="true"
        className="inline-flex items-center justify-center w-14 h-14 rounded-xl bg-blue-600 text-white font-mono font-bold text-lg mb-8 select-none"
      >
        PM
      </div>

      <p className="text-sm font-mono text-blue-600 dark:text-blue-400 mb-3 tracking-wide">
        Hi, I'm Prince Monga
      </p>

      <h1
        id="hero-heading"
        className="text-3xl sm:text-4xl md:text-5xl font-bold text-neutral-900 dark:text-neutral-100 leading-tight tracking-tight max-w-2xl"
      >
        I build software and document the journey.
      </h1>

      <p className="mt-5 text-base sm:text-lg text-neutral-600 dark:text-neutral-400 max-w-xl leading-relaxed">
        Full-stack developer and cybersecurity learner from Gurugram, India. I work with React,
        Java, Python, and Flask — and I write openly about what I'm building and figuring out.
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
          href={siteConfig.github}
          target="_blank"
          rel="noopener noreferrer"
          aria-label="Prince Monga on GitHub"
          className="text-neutral-500 hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-neutral-100 transition-colors"
        >
          <Github size={18} />
        </a>
        <a
          href={siteConfig.linkedin}
          target="_blank"
          rel="noopener noreferrer"
          aria-label="Prince Monga on LinkedIn"
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
        {hasTwitter && twitterUrl && (
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
