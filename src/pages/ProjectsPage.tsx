import { useState, useMemo } from 'react'
import { Link } from 'react-router-dom'
import { Github, ExternalLink, Loader2 } from 'lucide-react'
import PageMeta from '../components/PageMeta'
import TechTag from '../components/TechTag'
import { publicApi, type ApiProject } from '../lib/publicApi'
import { projects as staticProjects, projectCategories } from '../data/content'
import { usePublicFetch } from '../hooks/usePublicFetch'
import type { Project } from '../types'
import ContentImage from '../components/ContentImage'

// Normalise API project to the shape used by the UI
function fromApi(p: ApiProject): Project {
  return {
    id: String(p.id),
    slug: p.slug,
    title: p.title,
    problem: p.summary,
    description: p.description,
    tech: p.technologies,
    category: p.category as Project['category'],
    repoUrl: p.repository_url ?? undefined,
    liveUrl: p.live_demo_url ?? undefined,
    status: 'complete',
    featured: p.featured,
    imageUrl: p.image_url ?? undefined,
    imageAlt: p.image_alt_text,
    imageGallery: p.gallery_images.map(image => ({
      assetId: image.asset_id,
      url: image.url,
      altText: image.alt_text,
      caption: image.caption,
    })),
  }
}

function ProjectRow({ project }: { project: Project }) {
  return (
    <article className="py-6 border-b border-neutral-100 dark:border-neutral-800 last:border-0">
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
        <div className="flex min-w-0 flex-1 items-start gap-4">
          {project.imageUrl && (
            <ContentImage
              src={project.imageUrl}
              alt={project.imageAlt ?? ''}
              className="h-16 w-20 shrink-0 rounded-md bg-neutral-100 object-cover dark:bg-neutral-800"
            />
          )}
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2 mb-1">
              <span className="text-xs font-mono text-blue-600 dark:text-blue-400">
                {project.category}
              </span>
              {project.status === 'in-progress' && (
                <span className="text-xs font-mono text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950 px-1.5 py-0.5 rounded">
                  in progress
                </span>
              )}
            </div>

            <h2 className="text-base font-semibold text-neutral-900 dark:text-neutral-100 leading-snug">
              <Link
                to={`/projects/${project.slug}`}
                className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
              >
                {project.title}
              </Link>
            </h2>

            <p className="mt-1 text-sm text-neutral-600 dark:text-neutral-400 leading-relaxed">
              {project.problem}
            </p>

            <div className="mt-3 flex flex-wrap gap-1.5">
              {project.tech.map(t => (
                <TechTag key={t} label={t} />
              ))}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3 sm:flex-col sm:items-end sm:gap-2 flex-shrink-0">
          {project.repoUrl && (
            <a
              href={project.repoUrl}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={`${project.title} source code`}
              className="inline-flex items-center gap-1.5 text-xs text-neutral-500 hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-neutral-100 transition-colors"
            >
              <Github size={13} /> Source
            </a>
          )}
          {project.liveUrl && (
            <a
              href={project.liveUrl}
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
            className="text-xs text-blue-600 dark:text-blue-400 hover:underline"
          >
            Details →
          </Link>
        </div>
      </div>
    </article>
  )
}

export default function ProjectsPage() {
  const [activeCategory, setActiveCategory] = useState<string>('All')

  const { data, loading, error } = usePublicFetch(() => publicApi.projects.list({ limit: 50 }))

  // Use API data when available, fall back to static (non-placeholder) projects
  const allProjects: Project[] = useMemo(() => {
    if (data?.data && data.data.length > 0) {
      return data.data.map(fromApi)
    }
    return staticProjects.filter(p => p.status !== 'placeholder')
  }, [data])

  const filtered = useMemo(() =>
    activeCategory === 'All'
      ? allProjects
      : allProjects.filter(p => p.category === activeCategory),
    [allProjects, activeCategory]
  )

  return (
    <>
      <PageMeta
        title="Projects | Prince Monga"
        description="Full-stack development projects by Prince Monga — React, Node.js, Java, Spring Boot, and PostgreSQL."
        slug="projects"
      />

      <main id="main-content" className="section-padding container-wide py-16">
        <h1 className="text-3xl font-bold text-neutral-900 dark:text-neutral-100 mb-2">
          Projects
        </h1>
        <p className="text-sm text-neutral-500 dark:text-neutral-400 mb-8 max-w-xl">
          Things I've built or am currently building. A mix of full-stack apps, backend services,
          and frontend experiments.
        </p>

        {/* Category filters */}
        <div
          role="group"
          aria-label="Filter projects by category"
          className="flex flex-wrap gap-2 mb-8"
        >
          {projectCategories.map(cat => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              aria-pressed={activeCategory === cat}
              className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
                activeCategory === cat
                  ? 'bg-blue-600 text-white'
                  : 'bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400 hover:bg-neutral-200 dark:hover:bg-neutral-700'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {loading && (
          <div className="flex items-center gap-2 py-4 text-sm text-neutral-400">
            <Loader2 size={14} className="animate-spin" aria-hidden="true" />
            Loading projects…
          </div>
        )}

        {error && !loading && allProjects.length === 0 && (
          <p className="text-sm text-neutral-400 dark:text-neutral-600 py-4">
            Could not load projects from the server. Showing local data.
          </p>
        )}

        {/* Results count */}
        {!loading && (
          <p className="text-xs text-neutral-400 dark:text-neutral-600 mb-4 font-mono">
            {filtered.length} project{filtered.length !== 1 ? 's' : ''}
            {activeCategory !== 'All' ? ` in ${activeCategory}` : ''}
          </p>
        )}

        {/* Project list */}
        <div>
          {filtered.length > 0 ? (
            filtered.map(p => <ProjectRow key={p.id} project={p} />)
          ) : !loading ? (
            <p className="text-sm text-neutral-400 dark:text-neutral-600 py-8">
              No projects in this category yet.
            </p>
          ) : null}
        </div>
      </main>
    </>
  )
}
