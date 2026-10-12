import { GraduationCap, MapPin, Code2, Shield, ExternalLink } from 'lucide-react'
import { Link } from 'react-router-dom'
import PageMeta from '../components/PageMeta'
import ContentImage from '../components/ContentImage'
import { siteConfig, skillGroups, certifications, githubAchievements } from '../data/content'
import { publicApi } from '../lib/publicApi'
import { usePublicFetch } from '../hooks/usePublicFetch'

export default function AboutPage() {
  const { data } = usePublicFetch(() => publicApi.siteImages.get())

  return (
    <>
      <PageMeta
        title="About | Prince Monga"
        description="About Prince Monga — full-stack developer and cybersecurity learner from Gurugram, India. Background, education, skills, and certifications."
        slug="about"
      />

      <main id="main-content" className="section-padding container-narrow py-16">
        <h1 className="page-title text-3xl font-bold text-neutral-900 dark:text-neutral-100 mb-2 sm:text-4xl">
          About me
        </h1>
        <p className="text-sm text-neutral-500 dark:text-neutral-400 mb-10">
          Full-stack developer and cybersecurity learner from Gurugram, India.
        </p>

        {data?.data.profile_image_url && (
          <ContentImage
            src={data.data.profile_image_url}
            alt={data.data.profile_image_alt}
            className="mb-8 h-24 w-24 rounded-full object-cover"
          />
        )}

        {/* Quick facts */}
        <div className="surface-card flex flex-wrap gap-x-5 gap-y-3 mb-10 rounded-xl p-4 sm:p-5">
          <span className="inline-flex items-center gap-1.5 text-sm text-neutral-600 dark:text-neutral-400">
            <MapPin size={14} className="text-blue-600 dark:text-blue-400" aria-hidden="true" />
            {siteConfig.location}
          </span>
          <span className="inline-flex items-center gap-1.5 text-sm text-neutral-600 dark:text-neutral-400">
            <GraduationCap size={14} className="text-blue-600 dark:text-blue-400" aria-hidden="true" />
            BCA (CGPA 8.4) · MCA Cyber Security in progress
          </span>
          <span className="inline-flex items-center gap-1.5 text-sm text-neutral-600 dark:text-neutral-400">
            <Code2 size={14} className="text-blue-600 dark:text-blue-400" aria-hidden="true" />
            Full-stack development
          </span>
          <span className="inline-flex items-center gap-1.5 text-sm text-neutral-600 dark:text-neutral-400">
            <Shield size={14} className="text-blue-600 dark:text-blue-400" aria-hidden="true" />
            Network security &amp; cybersecurity
          </span>
        </div>

        {/* Bio */}
        <section
          aria-labelledby="bio-heading"
          className="mb-10 pb-10 border-b border-neutral-100 dark:border-neutral-800"
        >
          <h2
            id="bio-heading"
            className="text-lg font-semibold text-neutral-900 dark:text-neutral-100 mb-4"
          >
            Background
          </h2>
          <div className="space-y-4 text-sm text-neutral-600 dark:text-neutral-400 leading-relaxed">
            <p>
              I'm Prince — a developer from Gurugram, India. I completed my BCA at Chaudhary Devi
              Lal University in Sirsa with a CGPA of 8.4, and I'm currently pursuing an online MCA
              specialising in Cyber Security at Lovely Professional University.
            </p>
            <p>
              I started as a web development intern at Podosphere Technologies in Jaipur, where I
              built and maintained 15+ client websites using React.js, WordPress, and Shopify. I
              was promoted to team lead in the final month and received a full-time offer. That
              experience taught me how to work on real codebases under real constraints — and how
              much leadership is about communication, not just code.
            </p>
            <p>
              After that I worked part-time at VidiPixels in Sirsa, handling web operations,
              technical asset management, and site maintenance. Both roles confirmed that I learn
              best by building things and running into problems.
            </p>
            <p>
              My interests sit at the intersection of full-stack development and security. I want
              to build things that work well and are designed to be secure from the start — not
              patched after the fact.
            </p>
          </div>
        </section>

        {/* Current focus */}
        <section
          aria-labelledby="focus-heading"
          className="mb-10 pb-10 border-b border-neutral-100 dark:border-neutral-800"
        >
          <h2
            id="focus-heading"
            className="text-lg font-semibold text-neutral-900 dark:text-neutral-100 mb-4"
          >
            Current focus
          </h2>
          <ul className="space-y-2 text-sm text-neutral-600 dark:text-neutral-400">
            {[
              'MCA in Cyber Security at LPU Online',
              'Building full-stack projects with React, Python/Flask, and PostgreSQL',
              'Deepening Java backend skills and secure application design',
              'Network security — Wireshark, Nmap, Kali Linux, and TryHackMe labs',
              'Documenting everything through this site',
            ].map(item => (
              <li key={item} className="flex items-start gap-2">
                <span
                  className="mt-1.5 w-1 h-1 rounded-full bg-blue-600 dark:bg-blue-400 flex-shrink-0"
                  aria-hidden="true"
                />
                {item}
              </li>
            ))}
          </ul>
        </section>

        {/* Skills */}
        <section
          aria-labelledby="skills-heading"
          className="mb-10 pb-10 border-b border-neutral-100 dark:border-neutral-800"
        >
          <h2
            id="skills-heading"
            className="text-lg font-semibold text-neutral-900 dark:text-neutral-100 mb-5"
          >
            Technologies &amp; tools
          </h2>
          <div className="space-y-4">
            {skillGroups.map(group => (
              <div
                key={group.group}
                className="flex flex-col sm:flex-row sm:items-start gap-2 sm:gap-4"
              >
                <span className="text-xs font-mono text-neutral-400 dark:text-neutral-600 w-36 flex-shrink-0 pt-0.5">
                  {group.group}
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {group.items.map(item => (
                    <span
                      key={item}
                      className="text-xs font-mono px-2 py-0.5 bg-neutral-100 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300 rounded"
                    >
                      {item}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Certifications */}
        <section
          aria-labelledby="certs-heading"
          className="mb-10 pb-10 border-b border-neutral-100 dark:border-neutral-800"
        >
          <h2
            id="certs-heading"
            className="text-lg font-semibold text-neutral-900 dark:text-neutral-100 mb-4"
          >
            Certifications
          </h2>
          <ul className="space-y-3">
            {certifications.map(cert => (
              <li key={cert.id} className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-sm font-medium text-neutral-900 dark:text-neutral-100">
                    {cert.title}
                  </p>
                  <p className="text-xs text-neutral-500 dark:text-neutral-400">{cert.issuer}</p>
                </div>
                {cert.url && (
                  <a
                    href={cert.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={`View ${cert.title} certificate`}
                    className="flex-shrink-0 text-neutral-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                  >
                    <ExternalLink size={13} />
                  </a>
                )}
              </li>
            ))}
          </ul>

          {/* GitHub achievements */}
          <div className="mt-6">
            <p className="text-xs font-mono text-neutral-400 dark:text-neutral-600 mb-2">
              GitHub achievements
            </p>
            <div className="flex flex-wrap gap-2">
              {githubAchievements.map(a => (
                <span
                  key={a}
                  className="text-xs font-mono px-2 py-0.5 bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400 rounded"
                >
                  {a}
                </span>
              ))}
            </div>
          </div>
        </section>

        {/* Philosophy */}
        <section
          aria-labelledby="philosophy-heading"
          className="mb-10 pb-10 border-b border-neutral-100 dark:border-neutral-800"
        >
          <h2
            id="philosophy-heading"
            className="text-lg font-semibold text-neutral-900 dark:text-neutral-100 mb-4"
          >
            How I think about software
          </h2>
          <div className="space-y-4 text-sm text-neutral-600 dark:text-neutral-400 leading-relaxed">
            <p>
              I care about building things that are simple, maintainable, and secure. Security
              isn't something you add at the end — it has to be part of the design from the start.
            </p>
            <p>
              I'm drawn to cost-efficient architecture. Constraints force clarity. When you can't
              throw resources at a problem, you have to actually understand it.
            </p>
            <p>
              I believe in documenting the process — not just the polished results, but the
              confusion, the wrong turns, and the moments where something finally clicked. That's
              what this site is for.
            </p>
          </div>
        </section>

        {/* This site */}
        <section aria-labelledby="site-heading">
          <h2
            id="site-heading"
            className="text-lg font-semibold text-neutral-900 dark:text-neutral-100 mb-4"
          >
            About this site
          </h2>
          <p className="text-sm text-neutral-600 dark:text-neutral-400 leading-relaxed mb-4">
            Built with React, Vite, TypeScript, and Tailwind CSS on the frontend, and Node.js,
            Express, TypeScript, and PostgreSQL on the backend. The goal is a long-term digital
            home: portfolio, blog, journal, and archive all in one place.
          </p>
          <div className="flex flex-wrap gap-4">
            <Link to="/projects" className="text-sm text-blue-600 dark:text-blue-400 hover:underline">
              See my projects →
            </Link>
            <Link to="/journey" className="text-sm text-blue-600 dark:text-blue-400 hover:underline">
              Read my journey →
            </Link>
            <Link to="/contact" className="text-sm text-blue-600 dark:text-blue-400 hover:underline">
              Get in touch →
            </Link>
          </div>
        </section>
      </main>
    </>
  )
}
