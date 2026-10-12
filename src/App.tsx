import { Routes, Route } from 'react-router-dom'
import Nav from './components/Nav'
import Footer from './components/Footer'
import PointerAtmosphere from './components/PointerAtmosphere'
import { BackToTop, ScrollToTop } from './components/ScrollToTop'
import HomePage from './pages/HomePage'
import AboutPage from './pages/AboutPage'
import ProjectsPage from './pages/ProjectsPage'
import ProjectDetailPage from './pages/ProjectDetailPage'
import BlogPage from './pages/BlogPage'
import BlogArticlePage from './pages/BlogArticlePage'
import JourneyPage from './pages/JourneyPage'
import JournalPage from './pages/JournalPage'
import StreakPage from './pages/StreakPage'
import ServicesPage from './pages/ServicesPage'
import ContactPage from './pages/ContactPage'
import NotFoundPage from './pages/NotFoundPage'
import { AuthProvider } from './admin/hooks/useAuth'
import ProtectedRoute from './admin/components/ProtectedRoute'
import AdminLayout from './admin/components/AdminLayout'
import AdminLoginPage from './admin/pages/AdminLoginPage'
import AdminDashboard from './admin/pages/AdminDashboard'
import ProjectsManager from './admin/pages/ProjectsManager'
import BlogManager from './admin/pages/BlogManager'
import JourneyManager from './admin/pages/JourneyManager'
import JournalManager from './admin/pages/JournalManager'
import AdminStreakPage from './admin/pages/StreakPage'
import InquiriesManager from './admin/pages/InquiriesManager'
import SettingsPage from './admin/pages/SettingsPage'

export default function App() {
  return (
    <AuthProvider>
      <div className="app-shell">
        <PointerAtmosphere />
        <ScrollToTop />
        <div className="app-content">
          <Routes>
            {/* Admin routes — no public Nav/Footer */}
            <Route path="/admin/login" element={<AdminLoginPage />} />
            <Route
              path="/admin/*"
              element={
                <ProtectedRoute>
                  <AdminLayout>
                    <Routes>
                      <Route index element={<AdminDashboard />} />
                      <Route path="projects" element={<ProjectsManager />} />
                      <Route path="blog" element={<BlogManager />} />
                      <Route path="journey" element={<JourneyManager />} />
                      <Route path="journal" element={<JournalManager />} />
                      <Route path="streak" element={<AdminStreakPage />} />
                      <Route path="inquiries" element={<InquiriesManager />} />
                      <Route path="settings" element={<SettingsPage />} />
                    </Routes>
                  </AdminLayout>
                </ProtectedRoute>
              }
            />

            {/* Public routes */}
            <Route
              path="/*"
              element={
                <div className="min-h-screen flex flex-col">
                  <a
                    href="#main-content"
                    className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-50 focus:px-4 focus:py-2 focus:bg-blue-600 focus:text-white focus:rounded-md focus:text-sm focus:font-medium"
                  >
                    Skip to main content
                  </a>
                  <Nav />
                  <div className="flex-1">
                    <Routes>
                      <Route path="/" element={<HomePage />} />
                      <Route path="/about" element={<AboutPage />} />
                      <Route path="/projects" element={<ProjectsPage />} />
                      <Route path="/projects/:slug" element={<ProjectDetailPage />} />
                      <Route path="/blog" element={<BlogPage />} />
                      <Route path="/blog/:slug" element={<BlogArticlePage />} />
                      <Route path="/journey" element={<JourneyPage />} />
                      <Route path="/journal" element={<JournalPage />} />
                      <Route path="/streak" element={<StreakPage />} />
                      <Route path="/services" element={<ServicesPage />} />
                      <Route path="/contact" element={<ContactPage />} />
                      <Route path="*" element={<NotFoundPage />} />
                    </Routes>
                  </div>
                  <Footer />
                  <BackToTop />
                </div>
              }
            />
          </Routes>
        </div>
      </div>
    </AuthProvider>
  )
}
