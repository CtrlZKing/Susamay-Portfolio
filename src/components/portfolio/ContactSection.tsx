import { useState, FormEvent } from 'react';
import { Mail, Send, CheckCircle2, AlertCircle, ArrowUpRight, Loader2 } from 'lucide-react';
import { api } from '../../lib/api.ts';
import { Profile, SiteSettings, SocialLink } from '../../types/portfolio.ts';

interface ContactSectionProps {
  profile: Profile;
  settings: SiteSettings;
  socialLinks: SocialLink[];
}

export function ContactSection({ profile, settings, socialLinks }: ContactSectionProps) {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: '',
  });

  const [status, setStatus] = useState<'idle' | 'submitting' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState('');

  const contactEmail = settings.contact_email || profile.contact_email || 'contact@example.com';

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.email.trim() || !formData.message.trim()) {
      setStatus('error');
      setErrorMessage('Please fill in your name, email, and message.');
      return;
    }

    setStatus('submitting');
    setErrorMessage('');

    try {
      await api.sendContactMessage(formData);
      setStatus('success');
      setFormData({ name: '', email: '', subject: '', message: '' });
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to send inquiry.';
      setStatus('error');
      setErrorMessage(msg);
    }
  };

  return (
    <section id="contact" className="py-20 md:py-28 px-6 max-w-7xl mx-auto border-t border-zinc-200/80">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-start">
        {/* Left Column: Direct contact info */}
        <div className="lg:col-span-5 space-y-6">
          <div className="space-y-2">
            <span className="text-xs uppercase tracking-widest text-zinc-400 font-mono">
              Inquiries &amp; Collaboration
            </span>
            <h2 className="font-display text-3xl md:text-4xl font-bold tracking-tight text-zinc-900">
              Let&apos;s Build Something Memorable
            </h2>
          </div>

          <p className="text-sm md:text-base text-zinc-600 leading-relaxed">
            Have a project in mind, an inquiry for commercial 3D art, or looking for a collaborative concept artist? Feel free to reach out via direct email or the contact form.
          </p>

          <div className="space-y-3 pt-4 border-t border-zinc-200/80">
            <span className="text-xs font-mono uppercase text-zinc-400 block">
              Direct Contact
            </span>
            <a
              href={`mailto:${contactEmail}`}
              className="inline-flex items-center gap-2 text-base font-semibold text-zinc-900 hover:text-zinc-600 transition-colors"
            >
              <Mail className="w-4 h-4 text-zinc-400" />
              <span>{contactEmail}</span>
            </a>
          </div>

          {/* Social Profiles Grid */}
          {socialLinks.length > 0 && (
            <div className="space-y-3 pt-4 border-t border-zinc-200/80">
              <span className="text-xs font-mono uppercase text-zinc-400 block">
                Connect Online
              </span>
              <div className="flex flex-wrap gap-2">
                {socialLinks.map((link) => (
                  <a
                    key={link.id}
                    href={link.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-zinc-100 hover:bg-zinc-200 text-zinc-800 text-xs font-medium rounded-xs transition-colors"
                  >
                    <span>{link.platform}</span>
                    <ArrowUpRight className="w-3 h-3 text-zinc-400" />
                  </a>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Right Column: Contact Form */}
        <div className="lg:col-span-7 bg-zinc-50/50 p-6 md:p-8 rounded-xs border border-zinc-200/80">
          <h3 className="font-display text-xl font-bold text-zinc-900 mb-6">
            Send an Inquiry
          </h3>

          {status === 'success' ? (
            <div className="p-6 bg-white border border-emerald-200 rounded-xs space-y-3">
              <div className="flex items-center gap-2 text-emerald-700">
                <CheckCircle2 className="w-5 h-5" />
                <h4 className="font-semibold text-sm">Message received</h4>
              </div>
              <p className="text-xs text-zinc-600 leading-relaxed">
                Thank you for getting in touch. Elias will review your message and respond shortly.
              </p>
              <button
                type="button"
                onClick={() => setStatus('idle')}
                className="mt-2 text-xs font-medium text-zinc-900 hover:underline cursor-pointer"
              >
                Send another message
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-medium text-zinc-700">Your Name *</label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="e.g. Maya Lin"
                    className="w-full px-3.5 py-2.5 text-xs bg-white border border-zinc-200 rounded-xs focus:outline-none focus:border-zinc-900 transition-colors"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-medium text-zinc-700">Email Address *</label>
                  <input
                    type="email"
                    required
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder="maya@studio.com"
                    className="w-full px-3.5 py-2.5 text-xs bg-white border border-zinc-200 rounded-xs focus:outline-none focus:border-zinc-900 transition-colors"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-medium text-zinc-700">Subject or Project Scope</label>
                <input
                  type="text"
                  value={formData.subject}
                  onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                  placeholder="3D Environment Visualization / Character Commission"
                  className="w-full px-3.5 py-2.5 text-xs bg-white border border-zinc-200 rounded-xs focus:outline-none focus:border-zinc-900 transition-colors"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-medium text-zinc-700">Message *</label>
                <textarea
                  required
                  rows={4}
                  value={formData.message}
                  onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                  placeholder="Tell me about your project, timeline, and requirements..."
                  className="w-full px-3.5 py-2.5 text-xs bg-white border border-zinc-200 rounded-xs focus:outline-none focus:border-zinc-900 transition-colors resize-y"
                />
              </div>

              {status === 'error' && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-xs text-xs text-red-600 flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{errorMessage || 'Failed to send message.'}</span>
                </div>
              )}

              <button
                type="submit"
                disabled={status === 'submitting'}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 text-xs font-semibold uppercase tracking-wider text-white bg-zinc-900 hover:bg-zinc-800 disabled:opacity-50 transition-colors rounded-xs cursor-pointer shadow-xs"
              >
                {status === 'submitting' ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    <span>Submitting...</span>
                  </>
                ) : (
                  <>
                    <span>Submit Inquiry</span>
                    <Send className="w-3.5 h-3.5" />
                  </>
                )}
              </button>
            </form>
          )}
        </div>
      </div>
    </section>
  );
}
