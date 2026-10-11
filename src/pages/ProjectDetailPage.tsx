import { useParams, Link } from 'react-router-dom'
import { Github, ExternalLink, ArrowLeft, Loader2 } from 'lucide-react'
import PageMeta from '../components/PageMeta'
import Breadcrumb from '../components/Breadcrumb'
import TechTag from '../components/TechTag'
import { publicApi } from '../lib/publicApi'
import { usePublicFetch } from '../hooks/usePublicFetch'
import { projects as staticProjects } from '../data/content'

export default function ProjectDetailPage() {
  const { slug } = useParams<{ slug: string }>()

  const { data, loading, error } = usePublicFetch(
    () => publicApi.projects.get(slug!),
    [slug]
  )

  const staticProject = staticProjects.find(p => p.slug === slug)

  if (loading) {
    return (
      <main id="main-content" className="section-padding container-narrow py-16">
        <div className="flex items-center gap-2 text-sm text-neutral-400">
          <Loader2 size={14} className="animate-spin" aria-hidden="true" />
          Loading project…
        </div>
      </main>
    )
  }

  const apiProject = data?.data ?? null

  // Prefer API data; fall back to static
  if (!apiProject && !staticProject) {
    return (
      <>
        <PageMeta title="Project not found | Prince Monga" description="This project doesn't exist." />
        <main id="main-content" className="section-padding container-narrow py-16">
          <p className="text-neutral-500 dark:text-neutral-400 mb-4">Project not found.</p>
          <Link to="/projects" className="text-sm text-blue-600 dark:text-blue-400 hover:underline">
            ← Back to projects
          </Link>
        </main>
      </>
    )
  }

  // Merge: API data takes precedence; static fills in rich detail fields
  const title = apiProject?.title ?? staticProject!.title
  const category = apiProject?.category ?? staticProject!.category
  const problem = apiProject?.summary ?? staticProject!.problem
  const description = apiProject?.description ?? staticProject!.description
  const tech = apiProject?.technologies ?? staticProject!.tech
  const repoUrl = apiProject?.repository_url ?? staticProject?.repoUrl ?? null
  const liveUrl = apiProject?.live_demo_url ?? staticProject?.liveUrl ?? null
  const isInProgress = (apiProject?.status ?? staticProject?.status) === 'in-progress'

  // Rich detail fields only available in static data for now
  const goals = staticProject?.goals
  const features = staticProject?.features
  const architecture = staticProject?.architecture
  const challenges = staticProject?.challenges
  const decisions = staticProject?.decisions
  const learnings = staticProject?.learnings

  return (
    <>
      <PageMeta
        title={`${title} | Prince Monga`}
        description={problem}
        slug={`projects/${slug}`}
        type="article"
      />

      <main id="main-content" className="section-padding container-narrow py-16">
        <Breadcrumb
          crumbs={[
            { label: 'Home', to: '/' },
            { label: 'Projects', to: '/projects' },
            { label: title },
          ]}
        />

        {/* Header */}
        <div className="mb-8">
          <div className="flex flex-wrap items-center gap-2 mb-3">
            <span className="text-xs font-mono text-blue-600 dark:text-blue-400">
              {category}
            </span>
            {isInProgress && (
              <span className="text-xs font-mono text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950 px-1.5 py-0.5 rounded">
                in progress
              </span>
            )}
          </div>

          <h1 className="text-2xl sm:text-3xl font-bold text-neutral-900 dark:text-neutral-100 leading-tight mb-3">
            {title}
          </h1>

          <p className="text-base text-neutral-600 dark:text-neutral-400 leading-relaxed mb-4">
            {problem}
          </p>

          <div className="flex flex-wrap gap-1.5 mb-5">
            {tech.map(t => (
              <TechTag key={t} label={t} size="sm" />
            ))}
          </div>

          {(repoUrl || liveUrl) && (
            <div className="flex flex-wrap gap-3">
              {repoUrl && (
                <a
                  href={repoUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 border border-neutral-200 dark:border-neutral-700 text-sm text-neutral-700 dark:text-neutral-300 hover:border-neutral-400 dark:hover:border-neutral-500 rounded-md transition-colors"
                >
                  <Github size={14} /> View source
                </a>
              )}
              {liveUrl && (
                <a
                  href={liveUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-sm rounded-md transition-colors"
                >
                  <ExternalLink size={14} /> Live demo
                </a>
              )}
            </div>
          )}
        </div>

        <hr className="border-neutral-100 dark:border-neutral-800 mb-8" />

        <Section title="Overview">
          <p className="text-sm text-neutral-600 dark:text-neutral-400 leading-relaxed">
            {description}
          </p>
        </Section>

        {goals && goals.length > 0 && (
          <Section title="Goals">
            <ul className="space-y-1.5">
              {goals.map((g, i) => (
                <li key={i} className="flex items-start gap-2 text-sm text-neutral-600 dark:text-neutral-400">
                  <span className="mt-1.5 w-1 h-1 rounded-full bg-blue-600 dark:bg-blue-400 flex-shrink-0" aria-hidden="true" />
                  {g}
                </li>
              ))}
            </ul>
          </Section>
        )}

        {features && features.length > 0 && (
          <Section title="Features">
            <ul className="space-y-1.5">
              {features.map((f, i) => (
                <li key={i} className="flex items-start gap-2 text-sm text-neutral-600 dark:text-neutral-400">
                  <span className="mt-1.5 w-1 h-1 rounded-full bg-neutral-400 dark:bg-neutral-600 flex-shrink-0" aria-hidden="true" />
                  {f}
                </li>
              ))}
            </ul>
          </Section>
        )}

        {architecture && (
          <Section title="Architecture">
            <p className="text-sm text-neutral-600 dark:text-neutral-400 leading-relaxed">{architecture}</p>
          </Section>
        )}

        {challenges && (
          <Section title="Challenges">
            <p className="text-sm text-neutral-600 dark:text-neutral-400 leading-relaxed">{challenges}</p>
          </Section>
        )}

        {decisions && (
          <Section title="Key decisions">
            <p className="text-sm text-neutral-600 dark:text-neutral-400 leading-relaxed">{decisions}</p>
          </Section>
        )}

        {learnings && (
          <Section title="What I learned">
            <p className="text-sm text-neutral-600 dark:text-neutral-400 leading-relaxed">{learnings}</p>
          </Section>
        )}

        {error && !staticProject && (
          <p className="text-xs text-neutral-400 dark:text-neutral-600 mb-4">
            Could not load full project details from the server.
          </p>
        )}

        <div className="mt-10 pt-8 border-t border-neutral-100 dark:border-neutral-800">
          <Link
            to="/projects"
            className="inline-flex items-center gap-1.5 text-sm text-neutral-500 hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-neutral-100 transition-colors"
          >
            <ArrowLeft size={14} /> All projects
          </Link>
        </div>
      </main>
    </>
  )
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="mb-8">
      <h2 className="text-sm font-semibold text-neutral-900 dark:text-neutral-100 uppercase tracking-wide mb-3">
        {title}
      </h2>
      {children}
    </section>
  )
}
