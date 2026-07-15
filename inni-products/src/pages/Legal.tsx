import React, { useEffect } from 'react';
import { motion } from 'motion/react';
import { useLocation } from 'react-router-dom';

const sections = [
  {
    id: 'contact',
    title: '1. Contact Us',
    content: (
      <dl className="space-y-3 text-sm sm:text-base text-neutral-700 leading-relaxed">
        <div>
          <dt className="text-neutral-500 text-xs uppercase tracking-[0.14em] mb-1">Business Legal Name</dt>
          <dd>OAKROAD VENTURES PRIVATE LIMITED</dd>
        </div>
        <div>
          <dt className="text-neutral-500 text-xs uppercase tracking-[0.14em] mb-1">GSTIN</dt>
          <dd>29AAECO6061C1ZJ</dd>
        </div>
        <div>
          <dt className="text-neutral-500 text-xs uppercase tracking-[0.14em] mb-1">Registered Office Address</dt>
          <dd>
            OAKROAD VENTURES PRIVATE LIMITED
            <br />
            SITE NO: 2, SURVEY NO. 50/5 BILESHIVALE MAIN ROAD, NEAR SHANIMAHATHMA TEMPLEROD, KYALASNAHALLI, BANGALORE-550077
          </dd>
        </div>
        <div>
          <dt className="text-neutral-500 text-xs uppercase tracking-[0.14em] mb-1">Customer Support Email</dt>
          <dd>
            <a
              href="mailto:vasanthamachaiah@oakroad.industries"
              className="hover:text-[#E33E2B] transition-colors"
            >
              vasanthamachaiah@oakroad.industries
            </a>
          </dd>
        </div>
        <div>
          <dt className="text-neutral-500 text-xs uppercase tracking-[0.14em] mb-1">Customer Support Phone</dt>
          <dd>
            <a href="tel:+918197046698" className="hover:text-[#E33E2B] transition-colors">
              +91 81970 46698
            </a>
          </dd>
        </div>
      </dl>
    ),
  },
  {
    id: 'privacy',
    title: '2. Privacy Policy',
    content: (
      <p className="text-sm sm:text-base text-neutral-700 leading-relaxed">
        We value your privacy. We collect your name, email, and shipping address solely to process your
        orders. Your payment information is processed securely through our verified payment partners and is
        not stored on our servers. We do not sell, trade, or rent your personal information to third
        parties. We use cookies to improve your shopping experience.
      </p>
    ),
  },
  {
    id: 'terms',
    title: '3. Terms & Conditions',
    content: (
      <p className="text-sm sm:text-base text-neutral-700 leading-relaxed">
        By using this website, you agree to these terms. All products are subject to availability. Prices
        are subject to change. OAKROAD VENTURES PRIVATE LIMITED is not responsible for any indirect damages
        arising from the use of our products. All disputes are subject to the jurisdiction of the courts in
        BANGALORE.
      </p>
    ),
  },
  {
    id: 'refunds',
    title: '4. Cancellation & Refund Policy',
    content: (
      <div className="space-y-4 text-sm sm:text-base text-neutral-700 leading-relaxed">
        <p>
          <span className="font-medium text-neutral-900">Cancellations:</span> Orders can be cancelled
          within 1 hour of placement by contacting our support team via email or phone.
        </p>
        <p>
          <span className="font-medium text-neutral-900">Refunds:</span> If you receive a damaged product,
          please reach out to us within 1 days of delivery with photos of the item. Approved refunds will
          be processed to the original payment method within 7 business days.
        </p>
        <p>
          <span className="font-medium text-neutral-900">Contact for Refunds:</span>{' '}
          <a href="tel:+918197046698" className="hover:text-[#E33E2B] transition-colors">
            +91 81970 46698
          </a>
        </p>
      </div>
    ),
  },
];

export function Legal() {
  const { hash } = useLocation();

  useEffect(() => {
    if (!hash) {
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }
    const id = hash.replace('#', '');
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }, [hash]);

  return (
    <div className="bg-white text-neutral-900 min-h-screen">
      <div className="px-6 py-28 md:py-32">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45 }}
          className="mx-auto w-full max-w-3xl"
        >
          <p className="text-[10px] uppercase tracking-[0.35em] text-[#E33E2B] font-semibold mb-4">
            Legal
          </p>
          <h1 className="text-4xl md:text-5xl font-semibold tracking-tighter leading-[0.95] mb-4 text-neutral-950">
            Privacy Policy & Terms
          </h1>
          <p className="text-neutral-500 font-light mb-12 md:mb-16 max-w-2xl">
            Contact details, privacy practices, terms of use, and cancellation & refund policy for INNI
            by Oakroad Ventures Private Limited.
          </p>

          <div className="space-y-12 md:space-y-14">
            {sections.map((section) => (
              <section key={section.id} id={section.id} className="scroll-mt-28">
                <h2 className="text-lg md:text-xl font-semibold tracking-tight text-neutral-950 mb-4">
                  {section.title}
                </h2>
                {section.content}
              </section>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  );
}

export default Legal;
