import { ArrowUpRight, CodeXml, Github, Linkedin, ShieldCheck, Twitter } from 'lucide-react'
import { siteConfig } from '../data/content'

const profiles = [
  {
    name: 'GitHub',
    category: 'Developer & Professional Network',
    description: 'Open-source projects, code, and what I am building.',
    href: siteConfig.github,
    action: 'View GitHub Profile',
    icon: 'github',
  },
  {
    name: 'LinkedIn',
    category: 'Developer & Professional Network',
    description: 'Connect with me and explore my professional background.',
    href: siteConfig.linkedin,
    action: 'View LinkedIn Profile',
    icon: 'linkedin',
  },
  {
    name: 'X',
    category: 'Developer & Professional Network',
    description: 'Follow along with my updates and interests.',
    href: siteConfig.twitter,
    action: 'View X Profile',
    icon: 'x',
  },
  {
    name: 'LeetCode',
    category: 'Coding & Problem Solving',
    description: 'Problem-solving practice and algorithmic thinking.',
    href: 'https://leetcode.com/u/princemonga/',
    action: 'View LeetCode Profile',
    icon: 'code',
  },
  {
    name: 'Chess.com',
    category: 'Beyond Coding',
    description: 'I love playing chess — strategy, patience, and thinking a few moves ahead.',
    href: 'https://www.chess.com/member/growth_pr',
    action: 'View Chess Profile',
    icon: 'chess',
  },
  {
    name: 'TryHackMe',
    category: 'Cybersecurity & Ethical Hacking',
    description: 'Hands-on cybersecurity learning and ethical hacking labs.',
    href: siteConfig.tryhackme,
    action: 'View TryHackMe Profile',
    icon: 'security',
  },
] as const

export default function CodingProfiles() {
  return (
    <section
      aria-labelledby="coding-profiles-heading"
      className="section-padding container-wide border-t border-neutral-200/70 py-16 dark:border-neutral-800/70"
    >
      <div className="mb-7">
        <p className="eyebrow mb-2">Beyond the editor</p>
        <h2
          id="coding-profiles-heading"
          className="text-xl font-bold text-neutral-900 dark:text-neutral-100"
        >
          Coding profiles
        </h2>
        <p className="mt-1 max-w-xl text-sm text-neutral-500 dark:text-neutral-400">
          Coding, strategy, and cybersecurity profiles from beyond the editor.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {profiles.map(profile => (
          <article key={profile.name} className="profile-card interactive-card">
            <div className="profile-card-icon" aria-hidden="true">
              {profile.icon === 'github' ? <Github size={23} strokeWidth={1.7} />
                : profile.icon === 'linkedin' ? <Linkedin size={23} strokeWidth={1.7} />
                  : profile.icon === 'x' ? <Twitter size={23} strokeWidth={1.7} />
                    : profile.icon === 'code' ? <CodeXml size={23} strokeWidth={1.7} />
                      : profile.icon === 'security' ? <ShieldCheck size={23} strokeWidth={1.7} />
                        : <span className="chess-knight">♞</span>}
            </div>
            <div className="min-w-0 flex-1">
              <p className="eyebrow mb-1 text-[0.62rem]">{profile.category}</p>
              <h3 className="text-base font-semibold text-neutral-100">{profile.name}</h3>
              <p className="mt-1.5 text-sm leading-relaxed text-neutral-400">
                {profile.description}
              </p>
              <a
                className="profile-card-link mt-4 inline-flex min-h-10 items-center gap-1.5 text-sm font-medium"
                href={profile.href}
                target="_blank"
                rel="noopener noreferrer"
              >
                {profile.action}
                <ArrowUpRight size={15} aria-hidden="true" />
              </a>
            </div>
          </article>
        ))}
      </div>
    </section>
  )
}
