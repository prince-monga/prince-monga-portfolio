import { Link } from 'react-router-dom'
import { ArrowRight } from 'lucide-react'

export default function AboutPreview() {
  return (
    <section
      aria-labelledby="about-heading"
      className="section-padding container-wide py-16 border-t border-neutral-100 dark:border-neutral-800"
    >
      <div className="grid sm:grid-cols-2 gap-10 max-w-3xl">
        <div>
          <h2
            id="about-heading"
            className="text-xl font-bold text-neutral-900 dark:text-neutral-100 mb-4"
          >
            A bit about me
          </h2>
          <div className="space-y-3 text-sm text-neutral-600 dark:text-neutral-400 leading-relaxed">
            <p>
              I'm Prince — a developer from Gurugram, India. I finished my BCA and I'm currently
              working through an online MCA in Cyber Security while building real projects on the side.
            </p>
            <p>
              My focus is full-stack web development and secure application design. I've worked
              with Java, JavaScript, React, Node.js, Express, and PostgreSQL.
            </p>
          </div>
          <Link
            to="/about"
            className="mt-5 inline-flex items-center gap-1 text-sm text-blue-600 dark:text-blue-400 hover:underline"
          >
            More about me <ArrowRight size={14} />
          </Link>
        </div>

        <div>
          <p className="text-xs font-mono text-neutral-400 dark:text-neutral-600 mb-3 uppercase tracking-wide">
            Currently
          </p>
          <ul className="space-y-2">
            {[
              'MCA in Cyber Security at LPU Online',
              'Building full-stack projects with React & PostgreSQL',
              'Deepening Java backend and secure design skills',
              'Network security labs on TryHackMe',
            ].map(item => (
              <li key={item} className="flex items-start gap-2 text-sm text-neutral-600 dark:text-neutral-400">
                <span
                  className="mt-1.5 w-1.5 h-1.5 rounded-full bg-blue-600 dark:bg-blue-400 flex-shrink-0"
                  aria-hidden="true"
                />
                {item}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  )
}
