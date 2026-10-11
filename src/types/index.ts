export interface Project {
  id: string
  slug: string
  title: string
  problem: string
  description: string
  tech: string[]
  category: 'Frontend' | 'Backend' | 'Full Stack' | 'Experiment'
  repoUrl?: string
  liveUrl?: string
  status: 'in-progress' | 'complete' | 'placeholder'
  // Detail page fields
  goals?: string[]
  features?: string[]
  architecture?: string
  challenges?: string
  decisions?: string
  learnings?: string
  featured?: boolean
}

export interface JourneyMilestone {
  id: string
  period: string
  title: string
  description: string
  tags?: string[]
  type: 'education' | 'experience' | 'learning' | 'milestone'
}

export interface BlogPost {
  id: string
  slug: string
  title: string
  description: string       // meta description
  seoTitle?: string         // override title tag if needed
  category: string
  tags: string[]
  excerpt: string
  content?: string          // plain text / markdown for now
  date?: string             // ISO YYYY-MM-DD when published
  lastModified?: string     // ISO YYYY-MM-DD
  readingTimeMinutes?: number
  status: 'published' | 'draft' | 'placeholder'
  related?: string[]        // slugs of related posts
  relatedProjects?: string[] // project slugs
  author?: string
  ogImage?: string          // absolute URL when available
  canonicalOverride?: string // only when genuinely needed
  isDemo?: boolean           // demo content must remain visibly identified
}

export interface Article {
  id: string
  title: string
  category: string
  excerpt: string
  date?: string
  slug?: string
  status: 'published' | 'placeholder'
}

export interface Service {
  id: string
  title: string
  description: string
  icon: string
  details?: string[]
}

export interface JournalEntry {
  id: string
  date: string              // ISO date string YYYY-MM-DD
  title?: string
  worked_on: string
  learned?: string
  challenges?: string
  next_steps?: string
  mood?: 'great' | 'good' | 'okay' | 'tough'
  tags?: string[]
  isSample?: boolean        // flag to clearly mark demo data
}

export interface StreakDay {
  date: string              // ISO date string YYYY-MM-DD
  level: 0 | 1 | 2 | 3 | 4 // 0 = no activity, 4 = most active
  note?: string
  isSample?: boolean
}

export interface ContactFormData {
  name: string
  email: string
  projectType: string
  budget: string
  message: string
}

export interface Certification {
  id: string
  title: string
  issuer: string
  url?: string
}

export interface SkillGroup {
  group: string
  items: string[]
}
