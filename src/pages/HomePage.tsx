import { Helmet } from 'react-helmet-async'
import Hero from '../components/Hero'
import FeaturedProjects from '../components/FeaturedProjects'
import LatestWriting from '../components/LatestWriting'
import JourneyPreview from '../components/JourneyPreview'
import DailyBuilding from '../components/DailyBuilding'
import AboutPreview from '../components/AboutPreview'
import Contact from '../components/Contact'

export default function HomePage() {
  return (
    <>
      <Helmet>
        <title>Prince Monga | Full-Stack Developer &amp; Cybersecurity Learner</title>
        <meta
          name="description"
          content="Prince Monga is a full-stack developer and cybersecurity learner from Gurugram, India. Building with React, Java, and Python while documenting the journey openly."
        />
      </Helmet>

      <main id="main-content">
        <Hero />
        <FeaturedProjects />
        <LatestWriting />
        <JourneyPreview />
        <DailyBuilding />
        <AboutPreview />
        <Contact />
      </main>
    </>
  )
}
