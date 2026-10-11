import { Link } from 'react-router-dom'
import { Globe, Layout, Server, Wrench, ArrowRight } from 'lucide-react'
import PageMeta from '../components/PageMeta'
import { services } from '../data/content'

const iconMap: Record<string, React.ReactNode> = {
  Globe: <Globe size={20} />,
  Layout: <Layout size={20} />,
  Server: <Server size={20} />,
  Wrench: <Wrench size={20} />,
}

export default function ServicesPage() {
  return (
    <>
      <PageMeta
        title="Services | Prince Monga"
        description="Freelance web development services by Prince Monga — business websites, React frontend, Node.js APIs, and website improvements."
        slug="services"
      />

      <main id="main-content" className="section-padding container-narrow py-16">
        <h1 className="text-3xl font-bold text-neutral-900 dark:text-neutral-100 mb-2">
          Services
        </h1>
        <p className="text-sm text-neutral-500 dark:text-neutral-400 mb-2 max-w-xl">
          Areas where I'm available for freelance and collaborative work. I'm early in my
          career and focused on building real experience through real projects.
        </p>
        <p className="text-xs text-neutral-400 dark:text-neutral-600 mb-10 font-mono">
          No fabricated client history or guaranteed outcomes — just honest work.
        </p>

        {/* Service cards */}
        <div className="space-y-6 mb-12">
          {services.map(service => (
            <div
              key={service.id}
              className="border border-neutral-200 dark:border-neutral-800 rounded-lg p-6"
            >
              <div className="flex items-start gap-4">
                <div
                  aria-hidden="true"
                  className="flex-shrink-0 w-10 h-10 flex items-center justify-center rounded-md bg-blue-50 dark:bg-blue-950 text-blue-600 dark:text-blue-400"
                >
                  {iconMap[service.icon]}
                </div>
                <div className="flex-1">
                  <h2 className="text-base font-semibold text-neutral-900 dark:text-neutral-100 mb-1">
                    {service.title}
                  </h2>
                  <p className="text-sm text-neutral-600 dark:text-neutral-400 leading-relaxed mb-3">
                    {service.description}
                  </p>
                  {service.details && (
                    <ul className="space-y-1">
                      {service.details.map(detail => (
                        <li
                          key={detail}
                          className="flex items-center gap-2 text-xs text-neutral-500 dark:text-neutral-400"
                        >
                          <span
                            className="w-1 h-1 rounded-full bg-blue-600 dark:bg-blue-400 flex-shrink-0"
                            aria-hidden="true"
                          />
                          {detail}
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Process */}
        <section aria-labelledby="process-heading" className="mb-12 pb-12 border-b border-neutral-100 dark:border-neutral-800">
          <h2 id="process-heading" className="text-lg font-semibold text-neutral-900 dark:text-neutral-100 mb-4">
            How I work
          </h2>
          <ol className="space-y-4">
            {[
              { step: '01', title: 'Understand the problem', desc: 'I start by understanding what you actually need, not just what you asked for.' },
              { step: '02', title: 'Agree on scope', desc: 'Clear scope, timeline, and expectations before any code is written.' },
              { step: '03', title: 'Build and communicate', desc: 'Regular updates, working code, and honest progress reports.' },
              { step: '04', title: 'Deliver and hand over', desc: 'Clean code, documentation, and a smooth handover.' },
            ].map(item => (
              <li key={item.step} className="flex gap-4">
                <span className="text-xs font-mono text-neutral-300 dark:text-neutral-700 w-6 flex-shrink-0 pt-0.5">
                  {item.step}
                </span>
                <div>
                  <p className="text-sm font-semibold text-neutral-900 dark:text-neutral-100">{item.title}</p>
                  <p className="text-sm text-neutral-600 dark:text-neutral-400">{item.desc}</p>
                </div>
              </li>
            ))}
          </ol>
        </section>

        {/* CTA */}
        <section aria-labelledby="cta-heading">
          <h2 id="cta-heading" className="text-lg font-semibold text-neutral-900 dark:text-neutral-100 mb-2">
            Have a project in mind?
          </h2>
          <p className="text-sm text-neutral-600 dark:text-neutral-400 leading-relaxed mb-5">
            I'm open to small projects, collaborations, and learning opportunities. If you have
            something interesting, I'd like to hear about it.
          </p>
          <Link
            to="/contact"
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-md transition-colors"
          >
            Start a conversation <ArrowRight size={15} />
          </Link>
        </section>
      </main>
    </>
  )
}
