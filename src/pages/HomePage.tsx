import { Helmet } from 'react-helmet-async'
import Hero from '../components/Hero'
import FeaturedProjects from '../components/FeaturedProjects'
import LatestWriting from '../components/LatestWriting'
import JourneyPreview from '../components/JourneyPreview'
import DailyBuilding from '../components/DailyBuilding'
import AboutPreview from '../components/AboutPreview'
import CodingProfiles from '../components/CodingProfiles'
import Contact from '../components/Contact'
import { publicApi } from '../lib/publicApi'
import { usePublicFetch } from '../hooks/usePublicFetch'
import { siteConfig } from '../data/content'

export default function HomePage() {
  const { data } = usePublicFetch(() => publicApi.siteImages.get())
  const socialImage = data?.data.og_image_url || siteConfig.ogImage || undefined

  return (
    <>
      <Helmet>
        <title>Prince Monga | Full-Stack Developer &amp; Cybersecurity Learner</title>
        <meta
          name="description"
          content="Prince Monga is a full-stack developer and cybersecurity learner from Gurugram, India. Building with React, Java, and Python while documenting the journey openly."
        />
        {socialImage && <meta property="og:image" content={socialImage} />}
        {socialImage && <meta name="twitter:image" content={socialImage} />}
        <meta name="twitter:card" content={socialImage ? 'summary_large_image' : 'summary'} />
      </Helmet>

      <main id="main-content">
        <Hero />
        <FeaturedProjects />
        <LatestWriting />
        <JourneyPreview />
        <DailyBuilding />
        <AboutPreview />
        <CodingProfiles />
        <Contact />
      </main>
    </>
  )
}
