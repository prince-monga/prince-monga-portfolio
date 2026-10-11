import { useState, useMemo } from 'react'
import { Link } from 'react-router-dom'
import { Search, Loader2 } from 'lucide-react'
import PageMeta from '../components/PageMeta'
import { publicApi, type ApiBlogPost } from '../lib/publicApi'
import { blogPosts as staticPosts, contentSettings } from '../data/content'
import { usePublicFetch } from '../hooks/usePublicFetch'

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('en-IN', {
    year: 'numeric', month: 'short', day: 'numeric',
  })
}

export default function BlogPage() {
  const [query, setQuery] = useState('')
  const [activeCategory, setActiveCategory] = useState('All')

  const { data, loading, error } = usePublicFetch(() =>
    publicApi.blog.list({ limit: 50 })
  )

  // Published API posts win on duplicate slugs; static demos fill missing previews.
  const allPosts = useMemo(() => {
    const publishedApiPosts = (data?.data ?? []).filter(post => post.status === 'published')
    const apiSlugs = new Set(publishedApiPosts.map(post => post.slug))
    const staticPublished = staticPosts
      .filter(post => post.status === 'published' && (contentSettings.demoMode || !post.isDemo))
      .filter(post => !apiSlugs.has(post.slug))
      .map(p => ({
        id: Number(p.id.replace('b', '')),
        title: p.title,
        slug: p.slug ?? '',
        excerpt: p.excerpt,
        content: p.content ?? '',
        category: p.category,
        tags: p.tags,
        seo_title: p.seoTitle ?? null,
        meta_description: p.description ?? null,
        cover_image_url: null,
        status: 'published',
        published_at: p.date ?? null,
        created_at: p.date ?? '',
        updated_at: p.date ?? '',
        reading_time_minutes: p.readingTimeMinutes,
        is_demo: p.isDemo,
      } as ApiBlogPost))
    return [...publishedApiPosts, ...staticPublished]
  }, [data])

  const categories = useMemo(
    () => ['All', ...new Set(allPosts.map(post => post.category).filter(Boolean))],
    [allPosts]
  )

  const filtered = useMemo(() => {
    return allPosts.filter(post => {
      const matchesCategory = activeCategory === 'All' || post.category === activeCategory
      const q = query.toLowerCase()
      const matchesSearch =
        !q ||
        post.title.toLowerCase().includes(q) ||
        post.excerpt.toLowerCase().includes(q) ||
        post.tags.some(t => t.toLowerCase().includes(q))
      return matchesCategory && matchesSearch
    })
  }, [allPosts, query, activeCategory])

  const hasContent = allPosts.length > 0

  return (
    <>
      <PageMeta
        title="Blog | Prince Monga"
        description="Technical writing by Prince Monga — JavaScript, React, Node.js, backend development, and learning in public."
        slug="blog"
      />

      <main id="main-content" className="section-padding container-wide py-16">
        <h1 className="text-3xl font-bold text-neutral-900 dark:text-neutral-100 mb-2">
          Writing
        </h1>
        <p className="text-sm text-neutral-500 dark:text-neutral-400 mb-8 max-w-xl">
          Technical articles, learning notes, and personal reflections on software development
          and the journey of building things.
        </p>

        {/* Search */}
        <div className="relative mb-6 max-w-sm">
          <Search
            size={14}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400 dark:text-neutral-600"
            aria-hidden="true"
          />
          <input
            type="search"
            placeholder="Search articles…"
            value={query}
            onChange={e => setQuery(e.target.value)}
            aria-label="Search articles"
            className="w-full pl-8 pr-3 py-2 text-sm bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-700 rounded-md text-neutral-900 dark:text-neutral-100 placeholder-neutral-400 dark:placeholder-neutral-600 focus:outline-none focus:ring-2 focus:ring-blue-600 dark:focus:ring-blue-400"
          />
        </div>

        {/* Category filters */}
        <div
          role="group"
          aria-label="Filter by category"
          className="flex flex-wrap gap-2 mb-8"
        >
          {categories.map(cat => (
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
            Loading articles…
          </div>
        )}

        {error && allPosts.length > 0 && (
          <p role="status" className="mb-5 text-xs text-amber-700 dark:text-amber-300">
            Live articles could not be refreshed. Showing available published and demo content.
          </p>
        )}

        {error && allPosts.length === 0 && (
          <div role="alert" className="mb-6 border border-red-200 dark:border-red-900 rounded-md p-4 text-sm text-red-700 dark:text-red-300">
            Articles could not be loaded. Please try again later.
          </div>
        )}

        {!loading && !hasContent && (
          <div className="py-12 text-center">
            <p className="text-sm text-neutral-500 dark:text-neutral-400 mb-1">
              No articles published yet.
            </p>
            <p className="text-xs text-neutral-400 dark:text-neutral-600">
              Check back soon — writing is in progress.
            </p>
          </div>
        )}

        {!loading && hasContent && (
          <>
            <p className="text-xs text-neutral-400 dark:text-neutral-600 mb-4 font-mono">
              {filtered.length} article{filtered.length !== 1 ? 's' : ''}
            </p>

            {filtered.length === 0 ? (
              <p className="text-sm text-neutral-400 dark:text-neutral-600 py-8">
                No articles match your search.
              </p>
            ) : (
              <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
                {filtered.map(post => (
                  <article key={post.slug} className="overflow-hidden rounded-md border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900">
                    <div className="relative aspect-[16/8] overflow-hidden bg-neutral-100 dark:bg-neutral-800">
                      <div className="absolute inset-0 flex items-center justify-center">
                        <span aria-hidden="true" className="text-6xl font-semibold text-neutral-300 dark:text-neutral-700">
                          {(post.category || 'W').slice(0, 1).toUpperCase()}
                        </span>
                        <span className="absolute bottom-3 left-4 font-mono text-xs text-neutral-500 dark:text-neutral-400">
                          {post.category || 'Writing'}
                        </span>
                      </div>
                      {post.cover_image_url && (
                        <img
                          src={post.cover_image_url}
                          alt={post.cover_image_alt || post.title}
                          loading="lazy"
                          className="relative h-full w-full object-cover"
                          onError={event => { event.currentTarget.style.display = 'none' }}
                        />
                      )}
                    </div>
                    <div className="p-5">
                      <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mb-3 text-xs">
                        <span className="font-mono text-blue-600 dark:text-blue-400">{post.category}</span>
                        {post.published_at && (
                          <time dateTime={post.published_at} className="text-neutral-400 dark:text-neutral-500">
                            {formatDate(post.published_at)}
                          </time>
                        )}
                        {post.reading_time_minutes && (
                          <span className="text-neutral-400 dark:text-neutral-500">{post.reading_time_minutes} min read</span>
                        )}
                        {post.is_demo && (
                          <span className="ml-auto rounded-sm bg-amber-100 px-1.5 py-0.5 font-medium text-amber-800 dark:bg-amber-950 dark:text-amber-200">
                            DEMO CONTENT
                          </span>
                        )}
                      </div>
                      <h2 className="text-lg font-semibold leading-snug text-neutral-900 dark:text-neutral-100">
                        <Link to={`/blog/${post.slug}`} className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
                          {post.title}
                        </Link>
                      </h2>
                      <p className="mt-2 mb-4 text-sm leading-relaxed text-neutral-600 dark:text-neutral-400">
                        {post.excerpt}
                      </p>
                      <div className="flex flex-wrap gap-1.5">
                        {post.tags.map(tag => (
                          <span key={tag} className="rounded-sm bg-neutral-100 px-1.5 py-0.5 text-xs font-mono text-neutral-500 dark:bg-neutral-800 dark:text-neutral-400">
                            {tag}
                          </span>
                        ))}
                      </div>
                      <Link to={`/blog/${post.slug}`} className="mt-5 inline-block text-sm font-medium text-blue-700 hover:underline dark:text-blue-400">
                        Read article <span aria-hidden="true">→</span>
                      </Link>
                    </div>
                  </article>
                ))}
              </div>
            )}
          </>
        )}
      </main>
    </>
  )
}
