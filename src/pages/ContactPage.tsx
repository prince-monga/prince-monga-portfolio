import { useState } from 'react'
import { Mail, Github, Linkedin, CheckCircle, AlertCircle } from 'lucide-react'
import PageMeta from '../components/PageMeta'
import { siteConfig } from '../data/content'
import { publicApi, ApiError } from '../lib/publicApi'

const projectTypes = [
  'Business website',
  'Frontend development',
  'REST API / Backend',
  'Full-stack application',
  'Website improvement',
  'Other / Not sure yet',
]

const budgetRanges = [
  'Not sure yet',
  'Under ₹10,000',
  '₹10,000 – ₹30,000',
  '₹30,000 – ₹75,000',
  '₹75,000+',
  'Open to discuss',
]

const inputClass =
  'w-full px-3 py-2 text-sm bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-700 rounded-md text-neutral-900 dark:text-neutral-100 placeholder-neutral-400 dark:placeholder-neutral-600 focus:outline-none focus:ring-2 focus:ring-blue-600 dark:focus:ring-blue-400 transition-colors'

const labelClass = 'block text-xs font-medium text-neutral-700 dark:text-neutral-300 mb-1.5'

export default function ContactPage() {
  const hasGithub = !siteConfig.github.startsWith('<!--')
  const hasLinkedin = !siteConfig.linkedin.startsWith('<!--')

  const [form, setForm] = useState({
    name: '',
    email: '',
    projectType: '',
    budget: '',
    message: '',
  })
  const [errors, setErrors] = useState<Partial<typeof form>>({})
  const [status, setStatus] = useState<'idle' | 'submitting' | 'success' | 'error'>('idle')
  const [serverError, setServerError] = useState<string | null>(null)

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target
    setForm(f => ({ ...f, [name]: value }))
    if (errors[name as keyof typeof errors]) {
      setErrors(er => ({ ...er, [name]: undefined }))
    }
  }

  function validate(): boolean {
    const errs: Partial<typeof form> = {}
    if (!form.name.trim()) errs.name = 'Name is required'
    if (!form.email.trim()) errs.email = 'Email is required'
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) errs.email = 'Enter a valid email'
    if (!form.message.trim()) errs.message = 'Message is required'
    else if (form.message.trim().length < 10) errs.message = 'Message must be at least 10 characters'
    setErrors(errs)
    return Object.keys(errs).length === 0
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!validate()) return
    setStatus('submitting')
    setServerError(null)
    try {
      await publicApi.contact.submit({
        name: form.name.trim(),
        email: form.email.trim(),
        project_type: form.projectType,
        budget_range: form.budget,
        message: form.message.trim(),
      })
      setStatus('success')
      setForm({ name: '', email: '', projectType: '', budget: '', message: '' })
    } catch (err) {
      setStatus('error')
      setServerError(
        err instanceof ApiError ? err.message : 'Something went wrong. Please try again.'
      )
    }
  }

  return (
    <>
      <PageMeta
        title="Contact | Prince Monga"
        description="Get in touch with Prince Monga for freelance web development projects, collaborations, or professional enquiries."
        slug="contact"
      />

      <main id="main-content" className="section-padding container-narrow py-16">
        <h1 className="text-3xl font-bold text-neutral-900 dark:text-neutral-100 mb-2">
          Get in touch
        </h1>
        <p className="text-sm text-neutral-500 dark:text-neutral-400 mb-10 max-w-md">
          Open to freelance projects, collaborations, and professional opportunities. Fill in
          the form and I'll get back to you.
        </p>

        <div className="grid lg:grid-cols-3 gap-10">
          {/* Form */}
          <div className="lg:col-span-2">
            {status === 'success' ? (
              <div className="flex flex-col items-start gap-4 py-8">
                <div className="flex items-center gap-3 text-green-600 dark:text-green-400">
                  <CheckCircle size={20} />
                  <span className="font-medium text-sm">Message sent</span>
                </div>
                <p className="text-sm text-neutral-600 dark:text-neutral-400 leading-relaxed max-w-sm">
                  Your enquiry has been received. I'll get back to you within a few days.
                </p>
                <button
                  onClick={() => setStatus('idle')}
                  className="text-sm text-blue-600 dark:text-blue-400 hover:underline"
                >
                  Send another message
                </button>
              </div>
            ) : (
              <form
                onSubmit={handleSubmit}
                aria-label="Project enquiry form"
                className="space-y-5"
                noValidate
              >
                {status === 'error' && serverError && (
                  <div className="flex items-start gap-2 px-4 py-3 bg-red-50 dark:bg-red-950 border border-red-200 dark:border-red-800 rounded-md">
                    <AlertCircle size={14} className="text-red-500 flex-shrink-0 mt-0.5" aria-hidden="true" />
                    <p className="text-xs text-red-700 dark:text-red-300">{serverError}</p>
                  </div>
                )}

                <div className="grid sm:grid-cols-2 gap-5">
                  <div>
                    <label htmlFor="name" className={labelClass}>
                      Your name <span aria-hidden="true" className="text-blue-600">*</span>
                    </label>
                    <input
                      id="name"
                      name="name"
                      type="text"
                      required
                      autoComplete="name"
                      placeholder="Your name"
                      value={form.name}
                      onChange={handleChange}
                      aria-describedby={errors.name ? 'name-error' : undefined}
                      aria-invalid={!!errors.name}
                      className={`${inputClass} ${errors.name ? 'border-red-400 dark:border-red-600' : ''}`}
                    />
                    {errors.name && (
                      <p id="name-error" className="mt-1 text-xs text-red-600 dark:text-red-400">{errors.name}</p>
                    )}
                  </div>
                  <div>
                    <label htmlFor="email" className={labelClass}>
                      Your email <span aria-hidden="true" className="text-blue-600">*</span>
                    </label>
                    <input
                      id="email"
                      name="email"
                      type="email"
                      required
                      autoComplete="email"
                      placeholder="you@example.com"
                      value={form.email}
                      onChange={handleChange}
                      aria-describedby={errors.email ? 'email-error' : undefined}
                      aria-invalid={!!errors.email}
                      className={`${inputClass} ${errors.email ? 'border-red-400 dark:border-red-600' : ''}`}
                    />
                    {errors.email && (
                      <p id="email-error" className="mt-1 text-xs text-red-600 dark:text-red-400">{errors.email}</p>
                    )}
                  </div>
                </div>

                <div>
                  <label htmlFor="projectType" className={labelClass}>
                    Project type
                  </label>
                  <select
                    id="projectType"
                    name="projectType"
                    value={form.projectType}
                    onChange={handleChange}
                    className={inputClass}
                  >
                    <option value="">Select a type…</option>
                    {projectTypes.map(t => (
                      <option key={t} value={t}>{t}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label htmlFor="budget" className={labelClass}>
                    Budget range
                  </label>
                  <select
                    id="budget"
                    name="budget"
                    value={form.budget}
                    onChange={handleChange}
                    className={inputClass}
                  >
                    <option value="">Select a range…</option>
                    {budgetRanges.map(b => (
                      <option key={b} value={b}>{b}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label htmlFor="message" className={labelClass}>
                    Message <span aria-hidden="true" className="text-blue-600">*</span>
                  </label>
                  <textarea
                    id="message"
                    name="message"
                    required
                    rows={5}
                    placeholder="Tell me about your project, what you need, and any relevant context…"
                    value={form.message}
                    onChange={handleChange}
                    aria-describedby={errors.message ? 'message-error' : undefined}
                    aria-invalid={!!errors.message}
                    className={`${inputClass} resize-y ${errors.message ? 'border-red-400 dark:border-red-600' : ''}`}
                  />
                  {errors.message && (
                    <p id="message-error" className="mt-1 text-xs text-red-600 dark:text-red-400">{errors.message}</p>
                  )}
                </div>

                <button
                  type="submit"
                  disabled={status === 'submitting'}
                  className="inline-flex items-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 disabled:opacity-60 disabled:cursor-not-allowed text-white text-sm font-medium rounded-md transition-colors"
                >
                  {status === 'submitting' ? (
                    <>
                      <span className="w-3.5 h-3.5 border-2 border-white/40 border-t-white rounded-full animate-spin" aria-hidden="true" />
                      Sending…
                    </>
                  ) : (
                    <>
                      <Mail size={15} /> Send message
                    </>
                  )}
                </button>
              </form>
            )}
          </div>

          {/* Sidebar */}
          <aside className="space-y-6">
            <div>
              <h2 className="text-sm font-semibold text-neutral-900 dark:text-neutral-100 mb-3">
                Direct contact
              </h2>
              <a
                href={`mailto:${siteConfig.email}`}
                className="inline-flex items-center gap-2 text-sm text-blue-600 dark:text-blue-400 hover:underline"
              >
                <Mail size={14} /> {siteConfig.email}
              </a>
            </div>

            {(hasGithub || hasLinkedin) && (
              <div>
                <h2 className="text-sm font-semibold text-neutral-900 dark:text-neutral-100 mb-3">
                  Find me online
                </h2>
                <div className="space-y-2">
                  {hasGithub && (
                    <a
                      href={siteConfig.github}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 text-sm text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-neutral-100 transition-colors"
                    >
                      <Github size={14} /> GitHub
                    </a>
                  )}
                  {hasLinkedin && (
                    <a
                      href={siteConfig.linkedin}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 text-sm text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-neutral-100 transition-colors"
                    >
                      <Linkedin size={14} /> LinkedIn
                    </a>
                  )}
                </div>
              </div>
            )}

            <div>
              <h2 className="text-sm font-semibold text-neutral-900 dark:text-neutral-100 mb-2">
                Response time
              </h2>
              <p className="text-xs text-neutral-500 dark:text-neutral-400 leading-relaxed">
                I aim to respond within a few days. I'm a student and developer, not a
                full-time agency — I'll be honest about availability.
              </p>
            </div>
          </aside>
        </div>
      </main>
    </>
  )
}
