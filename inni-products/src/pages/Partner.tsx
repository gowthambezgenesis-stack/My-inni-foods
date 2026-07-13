import React, { useState } from 'react';
import { submitPartnerApplication, PartnershipType } from '../features/partner/partnerApi';

const PARTNERSHIP_OPTIONS: { value: PartnershipType; label: string }[] = [
  { value: 'restaurant_chef', label: 'Restaurant / Chef' },
  { value: 'retail_distributor', label: 'Retail Distributor' },
  { value: 'catering_events', label: 'Catering / Events' },
];

const inputClassName =
  'w-full bg-black border border-white/[0.1] rounded-2xl px-5 py-4 placeholder-neutral-700 text-white outline-none focus:border-white transition-colors';

export function Partner() {
  const [formData, setFormData] = useState({
    business_name: '',
    email: '',
    partnership_type: 'restaurant_chef' as PartnershipType,
    message: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleChange = (
    event: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>,
  ) => {
    const { name, value } = event.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setIsSubmitting(true);
    setError(null);

    try {
      await submitPartnerApplication({
        business_name: formData.business_name.trim(),
        email: formData.email.trim().toLowerCase(),
        partnership_type: formData.partnership_type,
        message: formData.message.trim() || undefined,
      });
      setSubmitted(true);
      setFormData({
        business_name: '',
        email: '',
        partnership_type: 'restaurant_chef',
        message: '',
      });
    } catch (err: unknown) {
      const message =
        (err as { response?: { data?: { error?: string } } })?.response?.data?.error ??
        'Unable to submit your application. Please try again later.';
      setError(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-black min-h-screen text-white pt-32 pb-24">
      <div className="max-w-screen-xl mx-auto px-6 grid grid-cols-1 lg:grid-cols-2 gap-16 items-start">
        <div className="sticky top-32">
          <h1 className="text-4xl md:text-6xl font-semibold tracking-tighter mb-6">Partner with inni.</h1>
          <p className="text-xl text-neutral-400 font-light mb-12">
            Bring the absolute highest grade of culinary flavor to your restaurant, retail space, or commercial kitchen.
          </p>

          <div className="space-y-8">
            <div>
              <h3 className="text-white font-medium text-xl mb-2">Wholesale Volumes</h3>
              <p className="text-neutral-500 font-light">Tiered pricing for bulk orders tailored to your operational scale.</p>
            </div>
            <div className="h-px bg-white/[0.08] w-full" />
            <div>
              <h3 className="text-white font-medium text-xl mb-2">Custom Blending</h3>
              <p className="text-neutral-500 font-light">Collaborate with our flavor architects for your signature spice blend.</p>
            </div>
          </div>
        </div>

        <div className="bg-[#111112] p-8 md:p-12 flex flex-col gap-6 rounded-[2.5rem] border border-white/[0.05] relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full blur-3xl" />

          <h2 className="text-2xl font-semibold z-10 relative mb-4">Application Form</h2>

          {submitted ? (
            <div className="z-10 relative text-center py-8">
              <p className="text-2xl font-semibold tracking-tight mb-2">Application submitted</p>
              <p className="text-neutral-400 font-light mb-8">
                Thank you for your interest. Our team will review your application and get in touch soon.
              </p>
              <button
                type="button"
                onClick={() => {
                  setSubmitted(false);
                  setError(null);
                }}
                className="text-sm text-neutral-400 hover:text-white transition-colors underline underline-offset-4 cursor-pointer"
              >
                Submit another application
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="flex flex-col gap-6 z-10 relative">
              <div className="space-y-2">
                <label htmlFor="business_name" className="text-xs text-neutral-400 font-medium tracking-wide uppercase">
                  Business Name
                </label>
                <input
                  id="business_name"
                  type="text"
                  name="business_name"
                  required
                  value={formData.business_name}
                  onChange={handleChange}
                  className={inputClassName}
                  placeholder="Acme Dining Group"
                />
              </div>

              <div className="space-y-2">
                <label htmlFor="partner-email" className="text-xs text-neutral-400 font-medium tracking-wide uppercase">
                  Email Address
                </label>
                <input
                  id="partner-email"
                  type="email"
                  name="email"
                  required
                  value={formData.email}
                  onChange={handleChange}
                  className={inputClassName}
                  placeholder="hello@example.com"
                />
              </div>

              <div className="space-y-2 text-white">
                <label htmlFor="partnership_type" className="text-xs text-neutral-400 font-medium tracking-wide uppercase">
                  Partnership Type
                </label>
                <select
                  id="partnership_type"
                  name="partnership_type"
                  required
                  value={formData.partnership_type}
                  onChange={handleChange}
                  className={`${inputClassName} appearance-none`}
                >
                  {PARTNERSHIP_OPTIONS.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-2">
                <label htmlFor="partner-message" className="text-xs text-neutral-400 font-medium tracking-wide uppercase">
                  Additional Notes <span className="text-neutral-600 normal-case">(optional)</span>
                </label>
                <textarea
                  id="partner-message"
                  name="message"
                  rows={4}
                  value={formData.message}
                  onChange={handleChange}
                  className={`${inputClassName} resize-none`}
                  placeholder="Tell us about your business and goals..."
                />
              </div>

              {error && <p className="text-sm text-red-400">{error}</p>}

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-white text-black py-4 rounded-xl font-medium mt-2 hover:scale-[1.02] transition-transform disabled:opacity-60 disabled:cursor-not-allowed disabled:hover:scale-100 cursor-pointer"
              >
                {isSubmitting ? 'Submitting...' : 'Submit Application'}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
