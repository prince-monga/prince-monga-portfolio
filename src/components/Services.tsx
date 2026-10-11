import { Globe, Layout, Server, Wrench } from 'lucide-react'
import { services } from '../data/content'

const iconMap: Record<string, React.ReactNode> = {
  Globe: <Globe size={18} />,
  Layout: <Layout size={18} />,
  Server: <Server size={18} />,
  Wrench: <Wrench size={18} />,
}

export default function Services() {
  return (
    <section
      aria-labelledby="services-heading"
      className="section-padding container-wide py-16 border-t border-neutral-100 dark:border-neutral-800"
    >
      <h2
        id="services-heading"
        className="text-xl font-bold text-neutral-900 dark:text-neutral-100 mb-1"
      >
        What I Can Help With
      </h2>
      <p className="text-sm text-neutral-500 dark:text-neutral-400 mb-8">
        Areas where I'm available for freelance and collaborative work.
      </p>

      <div className="grid sm:grid-cols-2 gap-4">
        {services.map(service => (
          <div
            key={service.id}
            className="flex gap-4 p-5 border border-neutral-200 dark:border-neutral-800 rounded-lg"
          >
            <div
              aria-hidden="true"
              className="flex-shrink-0 w-8 h-8 flex items-center justify-center rounded-md bg-blue-50 dark:bg-blue-950 text-blue-600 dark:text-blue-400"
            >
              {iconMap[service.icon]}
            </div>
            <div>
              <h3 className="text-sm font-semibold text-neutral-900 dark:text-neutral-100">
                {service.title}
              </h3>
              <p className="mt-1 text-sm text-neutral-600 dark:text-neutral-400 leading-relaxed">
                {service.description}
              </p>
            </div>
          </div>
        ))}
      </div>

      <p className="mt-5 text-xs text-neutral-400 dark:text-neutral-600">
        Currently building experience. Open to small projects, collaborations, and learning
        opportunities.
      </p>
    </section>
  )
}
