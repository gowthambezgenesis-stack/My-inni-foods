import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Send } from 'lucide-react';
import { cn } from '../lib/utils';

const fieldClassName =
  'w-full bg-transparent border-0 border-b border-white/20 py-3 text-white placeholder-neutral-600 outline-none focus:border-[#E33E2B]/80 transition-colors duration-300';

const labelClassName = 'text-sm text-neutral-400';

export function Contact() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleChange = (
    event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = event.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setIsSubmitting(true);

    await new Promise((resolve) => setTimeout(resolve, 800));

    setIsSubmitting(false);
    setSubmitted(true);
    setFormData({ name: '', email: '', subject: '', message: '' });
  };

  return (
    <div className="bg-black text-white min-h-screen flex items-center justify-center px-6 py-28 md:py-32">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-5xl bg-[#111112] border border-white/[0.08] rounded-[2.5rem] p-8 md:p-12 lg:p-14 shadow-2xl"
      >
        <h1 className="text-4xl md:text-6xl lg:text-7xl font-semibold tracking-tighter leading-[0.95] mb-10 md:mb-14">
          Contact us
        </h1>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 items-start mb-14 md:mb-16">
          <aside className="lg:col-span-4 space-y-8 pt-1">
            <p className="text-neutral-400 text-sm font-light leading-relaxed">
              Bangalore, India
            </p>
            <div>
              <p className="text-neutral-400 text-sm font-light">Monday — Friday</p>
              <p className="text-neutral-400 text-sm font-light">9 AM — 6 PM IST</p>
            </div>
          </aside>

          <div className="lg:col-span-8">
            {submitted ? (
              <div className="text-center py-8 md:py-12">
                <div className="w-14 h-14 rounded-full bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center mx-auto mb-5">
                  <Send size={22} className="text-emerald-400" />
                </div>
                <p className="text-2xl font-semibold tracking-tight mb-2">Message sent</p>
                <p className="text-neutral-400 font-light mb-8 max-w-sm mx-auto">
                  Thanks for reaching out. A flavor specialist will reply within 24 hours.
                </p>
                <button
                  type="button"
                  onClick={() => setSubmitted(false)}
                  className="text-sm text-neutral-400 hover:text-white transition-colors underline underline-offset-4 cursor-pointer"
                >
                  Send another message
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-8 md:space-y-10">
                <div className="space-y-3">
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

                <div className="space-y-3">
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

                <div className="space-y-3">
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

                <div className="space-y-3">
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

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="bg-white text-black px-10 py-3.5 rounded-full font-medium hover:bg-neutral-200 transition-colors disabled:opacity-60 disabled:cursor-not-allowed cursor-pointer"
                >
                  {isSubmitting ? 'Sending...' : 'Send Message'}
                </button>
              </form>
            )}
          </div>
        </div>

        <div className="border-t border-white/[0.08] pt-10 md:pt-12">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-10 mb-8 md:mb-10">
            <a
              href="mailto:inni@gmail.com"
              className="text-2xl sm:text-3xl md:text-4xl font-semibold tracking-tighter hover:text-[#E33E2B] transition-colors duration-300 break-all"
            >
              inni@gmail.com
            </a>
            <a
              href="tel:+919876543210"
              className="text-2xl sm:text-3xl md:text-4xl font-semibold tracking-tighter hover:text-[#E33E2B] transition-colors duration-300"
            >
              (+91) 98765 43210
            </a>
          </div>

          <div className="space-y-1">
            <p className="text-neutral-500 text-sm font-light">Bangalore, India</p>
            <p className="text-neutral-500 text-sm font-light">Monday — Friday / 9 AM — 6 PM IST</p>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
