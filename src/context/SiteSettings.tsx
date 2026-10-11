import { createContext, useContext, useEffect, useState, type ReactNode } from 'react'
import { siteConfig } from '../data/content'
import { publicApi, type PublicSiteSettings } from '../lib/publicApi'

export interface SiteProfileSettings {
  displayName: string
  tagline: string
  githubUrl: string
  linkedinUrl: string
  twitterUrl: string
  email: string
}

const defaultSettings: SiteProfileSettings = {
  displayName: siteConfig.name,
  tagline: siteConfig.tagline,
  githubUrl: siteConfig.github,
  linkedinUrl: siteConfig.linkedin,
  twitterUrl: siteConfig.twitter,
  email: siteConfig.email,
}

function fromApi(settings: PublicSiteSettings): SiteProfileSettings {
  return {
    displayName: settings.display_name ?? defaultSettings.displayName,
    tagline: settings.tagline ?? defaultSettings.tagline,
    githubUrl: settings.github_url ?? defaultSettings.githubUrl,
    linkedinUrl: settings.linkedin_url ?? defaultSettings.linkedinUrl,
    twitterUrl: settings.twitter_url ?? defaultSettings.twitterUrl,
    email: settings.email ?? defaultSettings.email,
  }
}

interface SiteSettingsValue {
  settings: SiteProfileSettings
  applyApiSettings: (settings: PublicSiteSettings) => void
}

const SiteSettingsContext = createContext<SiteSettingsValue>({
  settings: defaultSettings,
  applyApiSettings: () => {},
})

export function SiteSettingsProvider({ children }: { children: ReactNode }) {
  const [settings, setSettings] = useState(defaultSettings)

  useEffect(() => {
    let active = true
    publicApi.siteSettings.get()
      .then(response => {
        if (active) setSettings(fromApi(response.data))
      })
      .catch(() => {
        if (active) console.error('Could not load public site settings')
      })
    return () => { active = false }
  }, [])

  function applyApiSettings(apiSettings: PublicSiteSettings) {
    setSettings(fromApi(apiSettings))
  }

  return (
    <SiteSettingsContext.Provider value={{ settings, applyApiSettings }}>
      {children}
    </SiteSettingsContext.Provider>
  )
}

export function useSiteSettings() {
  return useContext(SiteSettingsContext)
}
