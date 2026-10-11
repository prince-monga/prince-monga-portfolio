import { Helmet } from 'react-helmet-async'
import { siteConfig } from '../data/content'

interface PageMetaProps {
  title: string
  description: string
  /** Path segment appended to canonicalUrl, e.g. "blog/my-post" */
  slug?: string
  type?: 'website' | 'article'
  /** Suppress indexing for thin/placeholder/draft pages */
  noindex?: boolean
  /** Absolute URL to a social sharing image (1200×630). Falls back to siteConfig.ogImage */
  ogImage?: string
  /** ISO date string for article published time */
  publishedTime?: string
  /** ISO date string for article modified time */
  modifiedTime?: string
  /** Inline JSON-LD structured data object — serialised safely */
  structuredData?: object
}

export default function PageMeta({
  title,
  description,
  slug,
  type = 'website',
  noindex = false,
  ogImage,
  publishedTime,
  modifiedTime,
  structuredData,
}: PageMetaProps) {
  const fullTitle = title.includes('Prince Monga') ? title : `${title} | Prince Monga`

  const base = siteConfig.canonicalUrl.replace(/\/$/, '')
  const canonical = base ? `${base}${slug ? `/${slug}` : ''}` : undefined

  const socialImage = ogImage || siteConfig.ogImage || undefined

  const hasGsc = Boolean(siteConfig.gscVerification)

  return (
    <Helmet>
      <title>{fullTitle}</title>
      <meta name="description" content={description} />

      {/* Indexing control */}
      {noindex && <meta name="robots" content="noindex, nofollow" />}

      {/* Canonical */}
      {canonical && <link rel="canonical" href={canonical} />}

      {/* Google Search Console verification — only rendered when value is set */}
      {hasGsc && (
        <meta name="google-site-verification" content={siteConfig.gscVerification} />
      )}

      {/* Open Graph */}
      <meta property="og:site_name" content="Prince Monga" />
      <meta property="og:type" content={type} />
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={description} />
      {canonical && <meta property="og:url" content={canonical} />}
      {socialImage && <meta property="og:image" content={socialImage} />}
      {socialImage && <meta property="og:image:width" content="1200" />}
      {socialImage && <meta property="og:image:height" content="630" />}
      {publishedTime && <meta property="article:published_time" content={publishedTime} />}
      {modifiedTime && <meta property="article:modified_time" content={modifiedTime} />}

      {/* Twitter / X Card */}
      <meta name="twitter:card" content={socialImage ? 'summary_large_image' : 'summary'} />
      <meta name="twitter:title" content={fullTitle} />
      <meta name="twitter:description" content={description} />
      {socialImage && <meta name="twitter:image" content={socialImage} />}

      {/* JSON-LD structured data */}
      {structuredData && (
        <script type="application/ld+json">
          {JSON.stringify(structuredData)}
        </script>
      )}
    </Helmet>
  )
}
