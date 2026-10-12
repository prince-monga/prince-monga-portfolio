import { useParams, Link } from 'react-router-dom'
import { ArrowLeft, Clock, Calendar, Loader2 } from 'lucide-react'
import PageMeta from '../components/PageMeta'
import Breadcrumb from '../components/Breadcrumb'
import { publicApi } from '../lib/publicApi'
import { usePublicFetch } from '../hooks/usePublicFetch'
import { blogPosts as staticPosts, contentSettings } from '../data/content'
import ContentImage from '../components/ContentImage'

function estimateReadingTime(content: string): number {
  return Math.max(1, Math.ceil(content.trim().split(/\s+/).length / 200))
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('en-IN', {
    year: 'numeric', month: 'long', day: 'numeric',
  })
}

/** Render inline markdown: `code`, **bold**, *italic*, [text](url) */
function renderInline(text: string): React.ReactNode {
  const parts: React.ReactNode[] = []
  // Simple tokeniser for inline patterns
  const re = /(!\[[^\]]*\]\([^)]+\)|`[^`]+`|\*\*[^*]+\*\*|\*[^*]+\*|\[[^\]]+\]\([^)]+\))/g
  let last = 0
  let m: RegExpExecArray | null
  let key = 0
  while ((m = re.exec(text)) !== null) {
    if (m.index > last) parts.push(text.slice(last, m.index))
    const token = m[0]
    if (token.startsWith('![')) {
      const imageMatch = token.match(/^!\[([^\]]*)\]\(([^)]+)\)$/)
      if (imageMatch) {
        const src = imageMatch[2].trim()
        if (/^https:\/\//i.test(src)) {
          parts.push(
            <ContentImage
              key={key++}
              src={src}
              alt={imageMatch[1]}
              className="my-5 max-h-[36rem] w-full rounded-lg bg-neutral-100 object-contain dark:bg-neutral-800"
            />
          )
        } else {
          parts.push(imageMatch[1])
          key++
        }
      }
    } else if (token.startsWith('`')) {
      parts.push(<code key={key++} className="px-1.5 py-0.5 rounded bg-neutral-100 dark:bg-neutral-800 text-neutral-800 dark:text-neutral-200 font-mono text-[0.8em]">{token.slice(1, -1)}</code>)
    } else if (token.startsWith('**')) {
      parts.push(<strong key={key++} className="font-semibold text-neutral-900 dark:text-neutral-100">{token.slice(2, -2)}</strong>)
    } else if (token.startsWith('*')) {
      parts.push(<em key={key++}>{token.slice(1, -1)}</em>)
    } else {
      const linkMatch = token.match(/\[([^\]]+)\]\(([^)]+)\)/)
      if (linkMatch) {
        const href = linkMatch[2].trim()
        const isSafe = /^(https?:|mailto:|\/|#)/i.test(href) && !href.startsWith('//')
        if (!isSafe) {
          parts.push(linkMatch[1])
          last = m.index + token.length
          continue
        }
        const isExternal = /^https?:/i.test(href)
        parts.push(
          <a
            key={key++}
            href={href}
            {...(isExternal ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
            className="text-blue-600 dark:text-blue-400 underline underline-offset-2 hover:no-underline"
          >
            {linkMatch[1]}
          </a>
        )
      }
    }
    last = m.index + token.length
  }
  if (last < text.length) parts.push(text.slice(last))
  return parts.length === 1 && typeof parts[0] === 'string' ? parts[0] : <>{parts}</>
}

function ArticleContent({ content }: { content: string }) {
  const blocks: string[] = []
  let current: string[] = []
  let fence: string | null = null

  for (const line of content.split(/\r?\n/)) {
    if (fence) {
      current.push(line)
      if (line.startsWith(fence)) {
        blocks.push(current.join('\n'))
        current = []
        fence = null
      }
    } else if (line.startsWith('```') || line.startsWith('~~~')) {
      if (current.length) blocks.push(current.join('\n'))
      current = [line]
      fence = line.slice(0, 3)
    } else if (!line.trim()) {
      if (current.length) blocks.push(current.join('\n'))
      current = []
    } else {
      current.push(line)
    }
  }
  if (current.length) blocks.push(current.join('\n'))
  let key = 0

  return (
    <div className="article-body space-y-5 text-base text-neutral-700 dark:text-neutral-300 leading-[1.85]">
      {blocks.map(block => {
        const k = key++

        // Fenced code block
        if (block.startsWith('```') || block.startsWith('~~~')) {
          const lines = block.split('\n')
          const fence = lines[0].slice(0, 3)
          const lang = lines[0].slice(3).trim()
          const code = lines.slice(1, lines[lines.length - 1]?.startsWith(fence) ? -1 : undefined).join('\n')
          return (
            <div key={k} className="relative group">
              {lang && (
                <span className="absolute top-2 right-3 text-xs font-mono text-neutral-400 dark:text-neutral-600 select-none">
                  {lang}
                </span>
              )}
              <pre className="overflow-x-auto rounded-md bg-neutral-100 dark:bg-neutral-800 p-4 text-xs font-mono text-neutral-800 dark:text-neutral-200 leading-relaxed">
                <code>{code}</code>
              </pre>
            </div>
          )
        }

        // Headings
        if (block.startsWith('### ')) return <h3 key={k} className="text-base font-semibold text-neutral-900 dark:text-neutral-100 mt-6 mb-1">{renderInline(block.slice(4))}</h3>
        if (block.startsWith('## ')) return <h2 key={k} className="text-lg font-semibold text-neutral-900 dark:text-neutral-100 mt-8 mb-1">{renderInline(block.slice(3))}</h2>
        if (block.startsWith('# ')) return <h2 key={k} className="text-xl font-bold text-neutral-900 dark:text-neutral-100 mt-8 mb-1">{renderInline(block.slice(2))}</h2>

        // Blockquote
        if (block.startsWith('> ')) {
          return (
            <blockquote key={k} className="border-l-2 border-neutral-300 dark:border-neutral-600 pl-4 text-neutral-500 dark:text-neutral-400 italic">
              {renderInline(block.slice(2))}
            </blockquote>
          )
        }

        // Unordered list
        if (block.split('\n').every(l => l.startsWith('- ') || l.startsWith('* '))) {
          return (
            <ul key={k} className="space-y-1 pl-4 list-disc list-outside marker:text-neutral-400">
              {block.split('\n').map((l, i) => (
                <li key={i}>{renderInline(l.slice(2))}</li>
              ))}
            </ul>
          )
        }

        // Ordered list
        if (block.split('\n').every(l => /^\d+\.\s/.test(l))) {
          return (
            <ol key={k} className="space-y-1 pl-4 list-decimal list-outside marker:text-neutral-400">
              {block.split('\n').map((l, i) => (
                <li key={i}>{renderInline(l.replace(/^\d+\.\s/, ''))}</li>
              ))}
            </ol>
          )
        }

        const tableLines = block.split('\n').filter(line => line.trim())
        if (tableLines.length >= 2 && tableLines.every(line => line.trim().startsWith('|')) && /^\|?\s*:?-{3,}/.test(tableLines[1].trim())) {
          const cells = (line: string) => line.trim().replace(/^\||\|$/g, '').split('|').map(cell => cell.trim())
          return (
            <div key={k} className="overflow-x-auto">
              <table className="w-full border-collapse text-left text-sm">
                <thead>
                  <tr className="border-b border-neutral-300 dark:border-neutral-700">
                    {cells(tableLines[0]).map((cell, i) => <th key={i} className="px-3 py-2 font-semibold">{renderInline(cell)}</th>)}
                  </tr>
                </thead>
                <tbody>
                  {tableLines.slice(2).map((line, row) => (
                    <tr key={row} className="border-b border-neutral-200 dark:border-neutral-800">
                      {cells(line).map((cell, i) => <td key={i} className="px-3 py-2">{renderInline(cell)}</td>)}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )
        }

        // Horizontal rule
        if (/^---+$/.test(block.trim())) {
          return <hr key={k} className="border-neutral-200 dark:border-neutral-800" />
        }

        return <p key={k}>{renderInline(block)}</p>
      })}
    </div>
  )
}

export default function BlogArticlePage() {
  const { slug } = useParams<{ slug: string }>()

  const { data, loading, error } = usePublicFetch(
    () => publicApi.blog.get(slug!),
    [slug]
  )

  const staticPost = staticPosts.find(p =>
    p.slug === slug && p.status === 'published' && (contentSettings.demoMode || !p.isDemo)
  )

  if (loading) {
    return (
      <main id="main-content" className="article-page section-padding container-narrow py-16">
        <div className="flex items-center gap-2 text-sm text-neutral-400">
          <Loader2 size={14} className="animate-spin" aria-hidden="true" />
          Loading article…
        </div>
      </main>
    )
  }

  const post = data?.data ?? null

  if (!post && !staticPost) {
    const unavailable = Boolean(error && !/404|not found/i.test(error))
    return (
      <>
        <PageMeta
          title={unavailable ? 'Article unavailable | Prince Monga' : 'Article not found | Prince Monga'}
          description={unavailable ? 'The article service is temporarily unavailable.' : 'This article does not exist.'}
          noindex
        />
        <main id="main-content" className="section-padding container-narrow py-16">
          <p role={unavailable ? 'alert' : undefined} className="text-neutral-500 dark:text-neutral-400 mb-4">
            {unavailable ? `The article could not be loaded: ${error}` : 'Article not found.'}
          </p>
          <Link to="/blog" className="text-sm text-blue-600 dark:text-blue-400 hover:underline">
            ← Back to writing
          </Link>
        </main>
      </>
    )
  }

  const title = post?.title ?? staticPost?.title ?? ''
  const description = post?.meta_description ?? staticPost?.description ?? ''
  const category = post?.category ?? staticPost?.category ?? ''
  const tags = post?.tags ?? staticPost?.tags ?? []
  const publishedAt = post?.published_at ?? staticPost?.date ?? null
  const content = post?.content ?? staticPost?.content ?? null
  const readingTime = post?.reading_time_minutes ?? staticPost?.readingTimeMinutes ?? (content ? estimateReadingTime(content) : null)
  const coverImageUrl = post?.cover_image_url ?? undefined
  const articleImages = post?.article_images ?? []

  return (
    <>
      <PageMeta
        title={post?.seo_title ?? staticPost?.seoTitle ?? title}
        description={description}
        slug={`blog/${slug}`}
        type="article"
        publishedTime={publishedAt ?? undefined}
        noindex={Boolean(staticPost?.isDemo && !post)}
        ogImage={coverImageUrl}
      />

      <main id="main-content" className="section-padding container-narrow py-16">
        <Breadcrumb
          crumbs={[
            { label: 'Home', to: '/' },
            { label: 'Writing', to: '/blog' },
            { label: title },
          ]}
        />

        <header className="mb-8">
          <div className="flex flex-wrap items-center gap-3 mb-3 text-xs text-neutral-400 dark:text-neutral-500">
            <span className="font-mono text-blue-600 dark:text-blue-400">{category}</span>
            {publishedAt && (
              <span className="inline-flex items-center gap-1">
                <Calendar size={11} aria-hidden="true" />
                <time dateTime={publishedAt}>{formatDate(publishedAt)}</time>
              </span>
            )}
            {readingTime && (
              <span className="inline-flex items-center gap-1">
                <Clock size={11} aria-hidden="true" />
                {readingTime} min read
              </span>
            )}
          </div>

          <h1 className="page-title text-2xl sm:text-3xl font-bold text-neutral-900 dark:text-neutral-100 leading-tight mb-3">
            {title}
          </h1>

          {description && (
            <p className="text-base text-neutral-600 dark:text-neutral-400 leading-relaxed">
              {description}
            </p>
          )}

          {tags.length > 0 && (
            <div className="mt-4 flex flex-wrap gap-1.5">
              {tags.map(tag => (
                <span
                  key={tag}
                  className="text-xs font-mono px-1.5 py-0.5 bg-neutral-100 dark:bg-neutral-800 text-neutral-500 dark:text-neutral-500 rounded"
                >
                  {tag}
                </span>
              ))}
            </div>
          )}
          {staticPost?.isDemo && !post && (
            <p className="mt-4 inline-block rounded-sm bg-amber-100 px-2 py-1 text-xs font-semibold text-amber-800 dark:bg-amber-950 dark:text-amber-200">
              DEMO CONTENT · Replace with your reviewed article
            </p>
          )}
        </header>

        {coverImageUrl && (
          <figure className="mb-8">
            <ContentImage
              src={coverImageUrl}
              alt={post?.cover_image_alt || title}
              className="aspect-[16/9] w-full rounded-lg bg-neutral-100 object-cover dark:bg-neutral-800"
            />
          </figure>
        )}

        {error && staticPost && (
          <p role="status" className="mb-5 text-xs text-amber-700 dark:text-amber-300">
            The live article service is unavailable; showing the local demo version.
          </p>
        )}

        <hr className="border-neutral-100 dark:border-neutral-800 mb-8" />

        {content ? (
          <ArticleContent content={content} />
        ) : (
          <div className="border border-dashed border-neutral-200 dark:border-neutral-800 rounded-lg p-10 text-center">
            <p className="text-sm text-neutral-400 dark:text-neutral-600">
              Article content not yet written.
            </p>
          </div>
        )}

        {articleImages.length > 0 && (
          <section aria-labelledby="article-images-heading" className="mt-8 space-y-4">
            <h2 id="article-images-heading" className="text-xs font-semibold uppercase tracking-wide text-neutral-500">
              Article images
            </h2>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              {articleImages.map((image, index) => (
                <figure key={`${image.asset_id}-${index}`}>
                  <ContentImage
                    src={image.url}
                    alt={image.alt_text}
                    className="aspect-[4/3] w-full rounded-lg bg-neutral-100 object-cover dark:bg-neutral-800"
                  />
                  {image.caption && (
                    <figcaption className="mt-2 text-xs text-neutral-500 dark:text-neutral-400">
                      {image.caption}
                    </figcaption>
                  )}
                </figure>
              ))}
            </div>
          </section>
        )}

        <div className="mt-10 pt-8 border-t border-neutral-100 dark:border-neutral-800">
          <Link
            to="/blog"
            className="inline-flex items-center gap-1.5 text-sm text-neutral-500 hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-neutral-100 transition-colors"
          >
            <ArrowLeft size={14} /> All writing
          </Link>
        </div>
      </main>
    </>
  )
}
