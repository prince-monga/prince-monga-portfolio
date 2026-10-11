import { NavLink } from 'react-router-dom'
import { Github, Linkedin, Shield } from 'lucide-react'
import { siteConfig } from '../data/content'
import { useSiteSettings } from '../context/SiteSettings'

const footerSections = [
  {
    heading: 'Work',
    links: [
      { to: '/projects', label: 'Projects' },
      { to: '/services', label: 'Services' },
      { to: '/contact', label: 'Contact' },
    ],
  },
  {
    heading: 'Writing & Learning',
    links: [
      { to: '/blog', label: 'Blog' },
      { to: '/journal', label: 'Journal' },
      { to: '/streak', label: 'Build Streak' },
    ],
  },
  {
    heading: 'About',
    links: [
      { to: '/about', label: 'About me' },
      { to: '/journey', label: 'Journey' },
    ],
  },
]

export default function Footer() {
  const { settings } = useSiteSettings()
  const year = new Date().getFullYear()
  const hasGithub = Boolean(settings.githubUrl)
  const hasLinkedin = Boolean(settings.linkedinUrl)

  return (
    <footer className="border-t border-neutral-200 dark:border-neutral-800 mt-8">
      <div className="section-padding container-wide py-12">
        {/* Top row */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-8 mb-10">
          {/* Brand */}
          <div className="col-span-2 sm:col-span-1">
            <NavLink
              to="/"
              className="font-mono text-sm font-semibold text-neutral-900 dark:text-neutral-100 hover:text-blue-600 dark:hover:text-blue-400 transition-colors block mb-2"
              aria-label={`${settings.displayName} — home`}
            >
              pm<span className="text-blue-600 dark:text-blue-400">.</span>
            </NavLink>
            <p className="text-xs text-neutral-400 dark:text-neutral-600 leading-relaxed">
              {settings.tagline}
            </p>
            {(hasGithub || hasLinkedin) && (
              <div className="mt-3 flex items-center gap-3">
                {hasGithub && (
                  <a
                    href={settings.githubUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label="GitHub"
                    className="text-neutral-400 hover:text-neutral-900 dark:hover:text-neutral-100 transition-colors"
                  >
                    <Github size={15} />
                  </a>
                )}
                {hasLinkedin && (
                  <a
                    href={settings.linkedinUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label="LinkedIn"
                    className="text-neutral-400 hover:text-neutral-900 dark:hover:text-neutral-100 transition-colors"
                  >
                    <Linkedin size={15} />
                  </a>
                )}
                <a
                  href={siteConfig.tryhackme}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="TryHackMe"
                  className="text-neutral-400 hover:text-neutral-900 dark:hover:text-neutral-100 transition-colors"
                >
                  <Shield size={15} />
                </a>
              </div>
            )}
          </div>

          {/* Nav sections */}
          {footerSections.map(section => (
            <nav key={section.heading} aria-label={`${section.heading} links`}>
              <p className="text-xs font-semibold text-neutral-900 dark:text-neutral-100 mb-3 uppercase tracking-wide">
                {section.heading}
              </p>
              <ul className="space-y-2" role="list">
                {section.links.map(link => (
                  <li key={link.to}>
                    <NavLink
                      to={link.to}
                      className="text-xs text-neutral-500 hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-neutral-100 transition-colors"
                    >
                      {link.label}
                    </NavLink>
                  </li>
                ))}
              </ul>
            </nav>
          ))}
        </div>

        {/* Bottom row */}
        <div className="pt-6 border-t border-neutral-100 dark:border-neutral-800 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <p className="text-xs text-neutral-400 dark:text-neutral-600">
            &copy; {year} Prince Monga. Built with React, Vite, and Tailwind CSS.
          </p>
          <p className="text-xs text-neutral-400 dark:text-neutral-600">
            Gurugram, Haryana, India
          </p>
        </div>
      </div>
    </footer>
  )
}
