import { Link } from 'react-router-dom'
import { ArrowRight, Mail } from 'lucide-react'
import { siteConfig } from '../data/content'

export default function Contact() {
  return (
    <section
      id="contact"
      aria-labelledby="contact-heading"
      className="section-padding container-wide py-16 border-t border-neutral-100 dark:border-neutral-800"
    >
      <div className="max-w-xl">
        <h2
          id="contact-heading"
          className="text-xl font-bold text-neutral-900 dark:text-neutral-100 mb-2"
        >
          Get in touch
        </h2>
        <p className="text-sm text-neutral-600 dark:text-neutral-400 leading-relaxed mb-6">
          Open to freelance projects, collaborations, and professional opportunities. If you have
          something interesting in mind, I'd like to hear about it.
        </p>

        <div className="flex flex-wrap items-center gap-3">
          <Link
            to="/contact"
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-md transition-colors"
          >
            <Mail size={15} aria-hidden="true" />
            Start a conversation
            <ArrowRight size={14} aria-hidden="true" />
          </Link>
          <a
            href={`mailto:${siteConfig.email}`}
            className="text-sm text-neutral-500 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-neutral-100 transition-colors"
          >
            {siteConfig.email}
          </a>
        </div>
      </div>
    </section>
  )
}
