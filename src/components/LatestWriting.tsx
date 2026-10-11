import { Link } from 'react-router-dom'
import { ArrowRight } from 'lucide-react'
import { publicApi, type ApiBlogPost } from '../lib/publicApi'
import { usePublicFetch } from '../hooks/usePublicFetch'
import ContentImage from './ContentImage'

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('en-IN', { year: 'numeric', month: 'short', day: 'numeric' })
}

export default function LatestWriting() {
  const { data } = usePublicFetch(() => publicApi.blog.list({ limit: 4 }))

  const posts: ApiBlogPost[] = data?.data ?? []

  return (
    <section
      aria-labelledby="writing-heading"
      className="section-padding container-wide py-16 border-t border-neutral-100 dark:border-neutral-800"
    >
      <div className="flex items-baseline justify-between mb-8">
        <div>
          <h2
            id="writing-heading"
            className="text-xl font-bold text-neutral-900 dark:text-neutral-100"
          >
            Writing
          </h2>
          <p className="mt-1 text-sm text-neutral-500 dark:text-neutral-400">
            Technical articles, learning notes, and personal reflections.
          </p>
        </div>
        {posts.length > 0 && (
          <Link
            to="/blog"
            className="hidden sm:inline-flex items-center gap-1 text-sm text-blue-600 dark:text-blue-400 hover:underline"
          >
            All posts <ArrowRight size={14} />
          </Link>
        )}
      </div>

      {posts.length === 0 ? (
        <div className="py-6">
          <p className="text-sm text-neutral-400 dark:text-neutral-600">
            No articles published yet. Writing is in progress.
          </p>
          <Link
            to="/blog"
            className="mt-3 inline-flex items-center gap-1 text-sm text-blue-600 dark:text-blue-400 hover:underline"
          >
            Visit the blog <ArrowRight size={14} />
          </Link>
        </div>
      ) : (
        <>
          <div className="flex flex-col divide-y divide-neutral-100 dark:divide-neutral-800">
            {posts.map(post => (
              <article key={post.id} className="py-5 first:pt-0 last:pb-0">
                <div className="flex items-center gap-2 mb-1.5">
                  <span className="text-xs font-mono text-blue-600 dark:text-blue-400">
                    {post.category}
                  </span>
                  {post.published_at && (
                    <time
                      dateTime={post.published_at}
                      className="text-xs text-neutral-400 dark:text-neutral-500 ml-auto"
                    >
                      {formatDate(post.published_at)}
                    </time>
                  )}
                </div>

                <h3 className="text-base font-semibold text-neutral-900 dark:text-neutral-100 leading-snug">
                  <Link
                    to={`/blog/${post.slug}`}
                    className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                  >
                    {post.title}
                  </Link>
                </h3>

                {post.cover_image_url && (
                  <ContentImage
                    src={post.cover_image_url}
                    alt={post.cover_image_alt || post.title}
                    className="mt-3 aspect-[16/8] w-full max-w-md rounded-md bg-neutral-100 object-cover dark:bg-neutral-800"
                  />
                )}

                <p className="mt-1 text-sm text-neutral-600 dark:text-neutral-400 leading-relaxed max-w-2xl">
                  {post.excerpt}
                </p>
              </article>
            ))}
          </div>

          <div className="mt-6 sm:hidden">
            <Link
              to="/blog"
              className="inline-flex items-center gap-1 text-sm text-blue-600 dark:text-blue-400 hover:underline"
            >
              All posts <ArrowRight size={14} />
            </Link>
          </div>
        </>
      )}
    </section>
  )
}
