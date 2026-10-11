import { siteConfig } from '../data/content'
import type { BlogPost, Project } from '../types'

const base = () => siteConfig.canonicalUrl.replace(/\/$/, '')
const url = (path = '') => (base() ? `${base()}${path}` : undefined)

function personRef() {
  return {
    '@type': 'Person',
    name: 'Prince Monga',
    ...(url('/about') && { url: url('/about') }),
  }
}

export function websiteSchema() {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: 'Prince Monga',
    description: siteConfig.tagline,
    ...(url() && { url: url() }),
    author: personRef(),
  }
}

export function personSchema() {
  return {
    '@context': 'https://schema.org',
    '@type': 'Person',
    name: 'Prince Monga',
    jobTitle: 'Full-Stack Developer',
    description:
      'Full-stack developer and cybersecurity learner from Gurugram, India. Building web applications with React, Java, and Python.',
    ...(url() && { url: url() }),
    email: siteConfig.email,
    sameAs: [
      siteConfig.github,
      siteConfig.linkedin,
      siteConfig.tryhackme,
    ].filter((u): u is string => Boolean(u) && !u.startsWith('<!--')),
    address: {
      '@type': 'PostalAddress',
      addressLocality: 'Gurugram',
      addressRegion: 'Haryana',
      addressCountry: 'IN',
    },
  }
}

export function breadcrumbSchema(crumbs: { label: string; path?: string }[]) {
  if (!base()) return null
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: crumbs.map((crumb, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      name: crumb.label,
      ...(crumb.path && { item: `${base()}${crumb.path}` }),
    })),
  }
}

export function blogPostingSchema(post: BlogPost) {
  if (post.status !== 'published' || !post.date) return null
  const postUrl = url(`/blog/${post.slug}`)
  return {
    '@context': 'https://schema.org',
    '@type': 'BlogPosting',
    headline: post.title,
    description: post.description,
    ...(postUrl && { url: postUrl }),
    datePublished: post.date,
    ...(post.lastModified && { dateModified: post.lastModified }),
    author: personRef(),
    ...(post.ogImage && {
      image: { '@type': 'ImageObject', url: post.ogImage, width: 1200, height: 630 },
    }),
    publisher: { '@type': 'Person', name: 'Prince Monga' },
    ...(postUrl && { mainEntityOfPage: { '@type': 'WebPage', '@id': postUrl } }),
  }
}

export function projectSchema(project: Project) {
  if (project.status !== 'complete') return null
  const projectUrl = url(`/projects/${project.slug}`)
  return {
    '@context': 'https://schema.org',
    '@type': 'SoftwareApplication',
    name: project.title,
    description: project.description,
    applicationCategory: 'WebApplication',
    ...(projectUrl && { url: projectUrl }),
    ...(project.liveUrl && { installUrl: project.liveUrl }),
    author: personRef(),
    programmingLanguage: project.tech,
  }
}
