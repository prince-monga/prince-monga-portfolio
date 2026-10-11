import { Link } from 'react-router-dom'
import { Github, ExternalLink, ArrowRight } from 'lucide-react'
import { publicApi, type ApiProject } from '../lib/publicApi'
import { projects as staticProjects } from '../data/content'
import { usePublicFetch } from '../hooks/usePublicFetch'

function ProjectCard({ project }: { project: ApiProject }) {
  return (
    <article className="border border-neutral-200 dark:border-neutral-800 rounded-lg p-5 flex flex-col gap-3 hover:border-neutral-300 dark:hover:border-neutral-700 transition-colors bg-white dark:bg-neutral-900">
      <div>
        <span className="text-xs font-mono text-blue-600 dark:text-blue-400 block mb-1">
          {project.category}
        </span>
        <h3 className="font-semibold text-neutral-900 dark:text-neutral-100 text-base leading-snug">
          <Link
            to={`/projects/${project.slug}`}
            className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
          >
            {project.title}
          </Link>
        </h3>
        <p className="mt-1 text-sm text-neutral-500 dark:text-neutral-400 leading-relaxed">
          {project.summary}
        </p>
      </div>

      <div className="flex flex-wrap gap-1.5 flex-1">
        {project.technologies.slice(0, 5).map(t => (
          <span
            key={t}
            className="text-xs font-mono px-2 py-0.5 bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400 rounded"
          >
            {t}
          </span>
        ))}
      </div>

      <div className="flex items-center gap-3 pt-1">
        {project.repository_url && (
          <a
            href={project.repository_url}
            target="_blank"
            rel="noopener noreferrer"
            aria-label={`${project.title} source code on GitHub`}
            className="inline-flex items-center gap-1.5 text-xs text-neutral-500 hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-neutral-100 transition-colors"
          >
            <Github size={13} /> Source
          </a>
        )}
        {project.live_demo_url && (
          <a
            href={project.live_demo_url}
            target="_blank"
            rel="noopener noreferrer"
            aria-label={`${project.title} live demo`}
            className="inline-flex items-center gap-1.5 text-xs text-neutral-500 hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-neutral-100 transition-colors"
          >
            <ExternalLink size={13} /> Live
          </a>
        )}
        <Link
          to={`/projects/${project.slug}`}
          className="text-xs text-blue-600 dark:text-blue-400 hover:underline ml-auto"
        >
          Details →
        </Link>
      </div>
    </article>
  )
}

// Convert static project to ApiProject shape for display
function staticToApi(p: typeof staticProjects[0]): ApiProject {
  return {
    id: parseInt(p.id.replace('project-', ''), 10) || 0,
    title: p.title,
    slug: p.slug,
    summary: p.problem,
    description: p.description,
    technologies: p.tech,
    category: p.category,
    repository_url: p.repoUrl ?? null,
    live_demo_url: p.liveUrl ?? null,
    image_url: null,
    featured: p.featured ?? false,
    status: 'published',
    created_at: '',
    updated_at: '',
  }
}

export default function FeaturedProjects() {
  const { data } = usePublicFetch(() => publicApi.projects.list({ featured: true, limit: 6 }))

  // Use API featured projects, or fall back to static non-placeholder projects
  const displayProjects: ApiProject[] = (() => {
    if (data?.data && data.data.length > 0) return data.data
    return staticProjects
      .filter(p => p.status !== 'placeholder' && p.featured)
      .map(staticToApi)
  })()

  if (displayProjects.length === 0) return null

  return (
    <section
      aria-labelledby="projects-heading"
      className="section-padding container-wide py-16 border-t border-neutral-100 dark:border-neutral-800"
    >
      <div className="flex items-baseline justify-between mb-8">
        <div>
          <h2
            id="projects-heading"
            className="text-xl font-bold text-neutral-900 dark:text-neutral-100"
          >
            Projects
          </h2>
          <p className="mt-1 text-sm text-neutral-500 dark:text-neutral-400">
            Things I've built or am currently building.
          </p>
        </div>
        <Link
          to="/projects"
          className="hidden sm:inline-flex items-center gap-1 text-sm text-blue-600 dark:text-blue-400 hover:underline"
        >
          All projects <ArrowRight size={14} />
        </Link>
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {displayProjects.map(p => (
          <ProjectCard key={p.id} project={p} />
        ))}
      </div>

      <div className="mt-6 sm:hidden">
        <Link
          to="/projects"
          className="inline-flex items-center gap-1 text-sm text-blue-600 dark:text-blue-400 hover:underline"
        >
          All projects <ArrowRight size={14} />
        </Link>
      </div>
    </section>
  )
}
