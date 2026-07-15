import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Send, ArrowRight, MapPin } from 'lucide-react';
import { submitContactMessage } from '../features/contact/contactApi';
import { cn } from '../lib/utils';

const labelClassName =
  'text-[10px] uppercase tracking-[0.2em] text-neutral-500 font-semibold';

const fieldClassName =
  'w-full bg-white/[0.02] border border-white/[0.08] rounded-2xl px-4 py-3.5 text-white placeholder-neutral-600 outline-none transition-all duration-300 focus:border-[#E33E2B]/50 focus:bg-white/[0.04] focus:ring-2 focus:ring-[#E33E2B]/10';

export function Contact() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleChange = (
    event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = event.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setIsSubmitting(true);
    setError(null);

    try {
      await submitContactMessage({
        name: formData.name.trim(),
        email: formData.email.trim().toLowerCase(),
        subject: formData.subject.trim(),
        message: formData.message.trim(),
      });
      setSubmitted(true);
      setFormData({ name: '', email: '', subject: '', message: '' });
    } catch (err: unknown) {
      const message =
        (err as { response?: { data?: { error?: string } } })?.response?.data?.error ??
        'Unable to send your message. Please try again later.';
      setError(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="relative bg-black text-white min-h-screen overflow-hidden">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,rgba(227,62,43,0.06),transparent_55%)]" />
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_left,rgba(180,83,9,0.04),transparent_50%)]" />

      <div className="relative flex items-center justify-center px-6 py-28 md:py-32">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.55 }}
          className="w-full max-w-5xl rounded-[2.5rem] border border-white/[0.08] bg-gradient-to-br from-white/[0.04] to-white/[0.01] p-8 md:p-12 lg:p-14 shadow-[0_40px_100px_-40px_rgba(0,0,0,0.8)]"
        >
          {/* Header */}
          <div className="mb-12 md:mb-16">
            <p className="text-[10px] uppercase tracking-[0.35em] text-[#E33E2B] font-semibold mb-4">
              Get in Touch
            </p>
            <h1 className="text-4xl md:text-6xl lg:text-7xl font-semibold tracking-tighter leading-[0.95]">
              Contact us
            </h1>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 items-start mb-14 md:mb-16">
            {/* Left info */}
            <aside className="lg:col-span-4 space-y-5">
              <div className="rounded-2xl border border-white/[0.06] bg-black/30 p-5">
                <div className="flex items-start gap-3">
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-white/[0.08] bg-white/[0.03] text-[#E33E2B]">
                    <MapPin size={16} strokeWidth={1.75} />
                  </div>
                  <p className="text-neutral-400 text-sm font-light leading-relaxed pt-1.5">
                    Bangalore, India
                  </p>
                </div>
              </div>
            </aside>

            {/* Form */}
            <div className="lg:col-span-8">
              {submitted ? (
                <div className="rounded-3xl border border-white/[0.06] bg-black/20 px-6 py-10 md:py-14 text-center">
                  <div className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-full border border-emerald-500/20 bg-emerald-500/10">
                    <Send size={22} className="text-emerald-400" />
                  </div>
                  <p className="text-2xl font-semibold tracking-tight mb-2">Message sent</p>
                  <p className="text-neutral-400 font-light mb-8 max-w-sm mx-auto leading-relaxed">
                    Thanks for reaching out. A flavor specialist will reply within 24 hours.
                  </p>
                  <button
                    type="button"
                    onClick={() => {
                      setSubmitted(false);
                      setError(null);
                    }}
                    className="text-sm text-neutral-400 hover:text-white transition-colors underline underline-offset-4 cursor-pointer"
                  >
                    Send another message
                  </button>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-6 md:space-y-7">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-7">
                    <div className="space-y-2">
                      <label htmlFor="contact-name" className={labelClassName}>
                        Name <span className="text-[#E33E2B]">*</span>
                      </label>
                      <input
                        id="contact-name"
                        type="text"
                        name="name"
                        required
                        value={formData.name}
                        onChange={handleChange}
                        placeholder="Your name"
                        className={fieldClassName}
                      />
                    </div>

                    <div className="space-y-2">
                      <label htmlFor="contact-email" className={labelClassName}>
                        Email Address <span className="text-[#E33E2B]">*</span>
                      </label>
                      <input
                        id="contact-email"
                        type="email"
                        name="email"
                        required
                        value={formData.email}
                        onChange={handleChange}
                        placeholder="you@example.com"
                        className={fieldClassName}
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label htmlFor="contact-subject" className={labelClassName}>
                      Subject <span className="text-[#E33E2B]">*</span>
                    </label>
                    <input
                      id="contact-subject"
                      type="text"
                      name="subject"
                      required
                      value={formData.subject}
                      onChange={handleChange}
                      placeholder="How can we help?"
                      className={fieldClassName}
                    />
                  </div>

                  <div className="space-y-2">
                    <label htmlFor="contact-message" className={labelClassName}>
                      Your Message <span className="text-[#E33E2B]">*</span>
                    </label>
                    <textarea
                      id="contact-message"
                      name="message"
                      required
                      rows={5}
                      value={formData.message}
                      onChange={handleChange}
                      placeholder="Tell us about your inquiry..."
                      className={cn(fieldClassName, 'resize-none min-h-[140px]')}
                    />
                  </div>

                  {error && (
                    <p className="rounded-xl border border-red-500/20 bg-red-500/5 px-4 py-3 text-sm text-red-400">
                      {error}
                    </p>
                  )}

                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="group relative inline-flex items-center justify-center gap-2.5 overflow-hidden rounded-full px-10 py-4 text-sm font-semibold tracking-[0.12em] uppercase transition-all duration-300 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    <span className="absolute inset-0 bg-white" />
                    <span className="absolute inset-0 bg-gradient-to-r from-[#E33E2B] to-amber-600 opacity-0 transition-opacity duration-300 group-hover:opacity-100 group-disabled:opacity-0" />
                    <span className="relative z-10 text-black transition-colors duration-300 group-hover:text-white">
                      {isSubmitting ? 'Sending...' : 'Send Message'}
                    </span>
                    {!isSubmitting && (
                      <ArrowRight className="relative z-10 h-4 w-4 text-black transition-all duration-300 group-hover:translate-x-0.5 group-hover:text-white" />
                    )}
                  </button>
                </form>
              )}
            </div>
          </div>

          {/* Business & contact details */}
          <div className="border-t border-white/[0.06] pt-10 md:pt-12">
            <div className="grid grid-cols-1 gap-8 md:grid-cols-2 md:gap-10 lg:gap-14">
              <div className="space-y-6">
                <div>
                  <p className={labelClassName}>Email</p>
                  <a
                    href="mailto:vasanthamachaih@oakroad.industries"
                    className="mt-2 inline-block text-sm sm:text-base font-medium tracking-tight text-white transition-colors duration-300 hover:text-[#E33E2B]"
                  >
                    vasanthamachaih@oakroad.industries
                  </a>
                </div>

                <div>
                  <p className={labelClassName}>Phone</p>
                  <a
                    href="tel:+918197046698"
                    className="mt-2 inline-block text-sm sm:text-base font-medium tracking-tight text-white transition-colors duration-300 hover:text-[#E33E2B]"
                  >
                    +91 81970 46698
                  </a>
                </div>

                <div>
                  <p className={labelClassName}>Business Information</p>
                  <p className="mt-2 text-sm text-neutral-300 font-light leading-relaxed">
                    Oakroad Ventures private limited
                  </p>
                </div>
              </div>

              <div className="rounded-2xl border border-white/[0.06] bg-black/30 p-5 md:p-6">
                <div className="flex items-start gap-3">
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-white/[0.08] bg-white/[0.03] text-[#E33E2B]">
                    <MapPin size={16} strokeWidth={1.75} />
                  </div>
                  <div>
                    <p className={labelClassName}>Business Address</p>
                    <address className="mt-3 not-italic text-sm text-neutral-400 font-light leading-relaxed space-y-0.5">
                      <span className="block text-neutral-300">Oakroad Ventures private limited</span>
                      <span className="block">Site No. 2</span>
                      <span className="block">Survey No. 50/5</span>
                      <span className="block">Off Bileshivale main road</span>
                      <span className="block">Shani mahatma temple road</span>
                      <span className="block">Kyalasanahalli, Bangalore – 560077</span>
                    </address>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
