import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAppTheme } from '../theme/AppThemeProvider';
import '../styles/landing.css';

function AnimatedCounter({ to, suffix = '' }: { to: number; suffix?: string }) {
  return (
    <span>
      {to.toLocaleString()}
      {suffix}
    </span>
  );
}

function Reveal({
  children,
  delay = 0,
  className = '',
}: {
  children: React.ReactNode;
  delay?: number;
  className?: string;
}) {
  return (
    <div
      className={['lp-reveal', className].filter(Boolean).join(' ')}
      style={delay > 0 ? { animationDelay: `${delay}s` } : undefined}
    >
      {children}
    </div>
  );
}

function FeatureCard({
  icon,
  title,
  description,
  delay,
}: {
  icon: string;
  title: string;
  description: string;
  delay: number;
}) {
  return (
    <Reveal delay={delay}>
      <div className="lp-feature-card">
        <div className="lp-feature-icon">
          <span className="material-icon" style={{ fontSize: 22 }}>
            {icon}
          </span>
        </div>
        <h3 className="lp-feature-title">{title}</h3>
        <p className="lp-feature-desc">{description}</p>
      </div>
    </Reveal>
  );
}

function StepCard({
  number,
  title,
  description,
  icon,
  delay,
}: {
  number: string;
  title: string;
  description: string;
  icon: string;
  delay: number;
}) {
  return (
    <Reveal delay={delay} className="h-full">
      <div className="lp-step-card">
        <div className="lp-step-number">{number}</div>
        <div className="lp-step-icon-wrap">
          <span className="material-icon" style={{ fontSize: 24 }}>
            {icon}
          </span>
        </div>
        <h3 className="lp-step-title">{title}</h3>
        <p className="lp-step-desc">{description}</p>
      </div>
    </Reveal>
  );
}

const operators = [
  { name: 'Jio', abbr: 'JI', color: '#0070ff' },
  { name: 'Airtel', abbr: 'AT', color: '#ed1c24' },
  { name: 'Vi', abbr: 'Vi', color: '#6b2fa0' },
  { name: 'BSNL', abbr: 'BS', color: '#003399' },
  { name: 'Idea', abbr: 'ID', color: '#f27d00' },
  { name: 'MTNL', abbr: 'MT', color: '#00853e' },
];

const LandingPage: React.FC = () => {
  const { theme, toggleTheme } = useAppTheme();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const isDark = theme === 'dark';

  return (
    <div className="lp-root">
      <nav className="lp-nav">
        <div className="lp-nav-inner">
          <Link to="/" className="lp-logo">
            <div className="lp-logo-icon">
              <span className="material-icon" style={{ color: '#fff', fontSize: 18 }}>
                bolt
              </span>
            </div>
            <span className="lp-logo-text">OmniCharge</span>
          </Link>

          <div className="lp-nav-links">
            <a href="#features" className="lp-nav-link">
              Features
            </a>
            <a href="#how-it-works" className="lp-nav-link">
              How it works
            </a>
            <a href="#operators" className="lp-nav-link">
              Operators
            </a>
            <a href="#testimonials" className="lp-nav-link">
              Reviews
            </a>
          </div>

          <div className="lp-nav-actions">
            <button onClick={toggleTheme} className="lp-theme-btn" title="Toggle theme" aria-label="Toggle theme">
              <span className="material-icon" style={{ fontSize: 18 }}>
                {isDark ? 'light_mode' : 'dark_mode'}
              </span>
            </button>
            <Link to="/login" className="lp-btn-ghost">
              Sign in
            </Link>
            <Link to="/register" className="lp-btn-primary">
              Get started
            </Link>
            <button
              className="lp-hamburger"
              onClick={() => setMobileMenuOpen((value) => !value)}
              aria-label="Menu"
            >
              <span className="material-icon" style={{ fontSize: 20 }}>
                {mobileMenuOpen ? 'close' : 'menu'}
              </span>
            </button>
          </div>
        </div>
      </nav>

      {mobileMenuOpen && (
        <div className="lp-mobile-menu">
          <div className="lp-mobile-top-actions">
            <button onClick={toggleTheme} className="lp-mobile-theme-btn" title="Toggle theme" aria-label="Toggle theme">
              <span className="material-icon" style={{ fontSize: 18 }}>
                {isDark ? 'light_mode' : 'dark_mode'}
              </span>
            </button>
            <Link to="/login" className="lp-mobile-cta secondary" onClick={() => setMobileMenuOpen(false)}>
              Sign in
            </Link>
            <Link to="/register" className="lp-mobile-cta primary" onClick={() => setMobileMenuOpen(false)}>
              Get started
            </Link>
          </div>
          <a href="#features" className="lp-mobile-link" onClick={() => setMobileMenuOpen(false)}>
            Features
          </a>
          <a href="#how-it-works" className="lp-mobile-link" onClick={() => setMobileMenuOpen(false)}>
            How it works
          </a>
          <a href="#operators" className="lp-mobile-link" onClick={() => setMobileMenuOpen(false)}>
            Operators
          </a>
          <a href="#testimonials" className="lp-mobile-link" onClick={() => setMobileMenuOpen(false)}>
            Reviews
          </a>
          <div className="lp-mobile-divider" />
        </div>
      )}

      <section className="lp-hero">
        <div className="lp-hero-bg" />
        <div className="lp-hero-dots" />

        <div className="lp-hero-inner">
          <div className="lp-hero-badge">
            <div className="lp-hero-badge-dot" />
            Trusted by 2M+ subscribers across India
          </div>

          <h1 className="lp-hero-title">
            Recharge smarter.
            <br />
            <span>In seconds.</span>
          </h1>

          <p className="lp-hero-subtitle">
            The fastest way to top up any mobile number in India. All operators, all plans, one platform with secure
            payment flow.
          </p>

          <div className="lp-hero-actions">
            <Link to="/register" className="lp-btn-primary lp-btn-xl">
              <span className="material-icon" style={{ fontSize: 18 }}>
                bolt
              </span>
              Start for free
            </Link>
            <a href="#how-it-works" className="lp-btn-outline-xl">
              See how it works
              <span className="material-icon" style={{ fontSize: 18 }}>
                arrow_downward
              </span>
            </a>
          </div>

          <div className="lp-hero-proof">
            <span>
              <span className="material-icon lp-proof-icon">verified</span>
              No registration fee
            </span>
            <div className="lp-hero-proof-dot" />
            <span>
              <span className="material-icon lp-proof-icon">lock</span>
              Bank-grade security
            </span>
            <div className="lp-hero-proof-dot" />
            <span>
              <span className="material-icon lp-proof-icon">schedule</span>
              Instant activation
            </span>
          </div>
        </div>

        <div className="lp-mockup-wrap">
          <div className="lp-mockup">
            <div className="lp-mockup-bar">
              <div className="lp-mockup-dot lp-red" />
              <div className="lp-mockup-dot lp-yellow" />
              <div className="lp-mockup-dot lp-green" />
              <div className="lp-mockup-url">
                <span className="material-icon lp-success-text" style={{ fontSize: 12 }}>
                  lock
                </span>
                app.omnicharge.site/dashboard
              </div>
            </div>
            <div className="lp-mockup-body">
              <div className="lp-mockup-heading">Good morning, Rahul</div>
              <div className="lp-mockup-grid">
                {[
                  { label: 'Total Recharges', val: '48', cls: '' },
                  { label: 'Successful', val: '46', cls: 'green' },
                  { label: 'Total Spent', val: '₹8,340', cls: 'blue' },
                  { label: 'Transactions', val: '46', cls: '' },
                ].map((stat) => (
                  <div key={stat.label} className="lp-mockup-stat">
                    <div className="lp-mockup-stat-label">{stat.label}</div>
                    <div className={['lp-mockup-stat-val', stat.cls].filter(Boolean).join(' ')}>{stat.val}</div>
                  </div>
                ))}
              </div>

              {[
                { op: 'Jio', plan: 'Plan #14', amt: '₹299', status: 'success', statusLabel: 'SUCCESS' },
                { op: 'Airtel', plan: 'Plan #7', amt: '₹399', status: 'success', statusLabel: 'SUCCESS' },
                { op: 'Vi', plan: 'Plan #22', amt: '₹199', status: 'pending', statusLabel: 'PENDING' },
              ].map((row) => (
                <div key={`${row.op}${row.plan}`} className="lp-mockup-row">
                  <div className="lp-mockup-row-left">
                    <div className="lp-mockup-row-icon">
                      <span className="material-icon lp-primary-text" style={{ fontSize: 16 }}>
                        phone_iphone
                      </span>
                    </div>
                    <div>
                      <div className="lp-mockup-row-name">{row.op} Recharge</div>
                      <div className="lp-mockup-row-sub">{row.plan}</div>
                    </div>
                  </div>
                  <div className="lp-mockup-row-right">
                    <span className="lp-mockup-row-amt">{row.amt}</span>
                    <span className={`lp-mockup-row-badge ${row.status}`}>{row.statusLabel}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <div className="lp-stats-band">
        <div className="lp-stats-inner">
          {[
            { num: 2000000, suffix: '+', label: 'Happy users' },
            { num: 50000000, suffix: '+', label: 'Recharges processed' },
            { num: 99, suffix: '.9%', label: 'Uptime SLA' },
            { num: 3, suffix: 'sec', label: 'Avg recharge time' },
          ].map((stat) => (
            <div key={stat.label} className="lp-stat-item">
              <div className="lp-stat-num">
                <AnimatedCounter to={stat.num} suffix={stat.suffix} />
              </div>
              <div className="lp-stat-label">{stat.label}</div>
            </div>
          ))}
        </div>
      </div>

      <section className="lp-section" id="features">
        <div className="lp-section-inner">
          <Reveal>
            <div className="lp-section-tag">
              <span className="material-icon" style={{ fontSize: 14 }}>
                star
              </span>
              Features
            </div>
            <h2 className="lp-section-title">
              Everything you need,
              <br />
              nothing you don&apos;t.
            </h2>
            <p className="lp-section-subtitle">
              Built for simplicity without compromising on power. Whether you recharge daily or manage the platform at
              scale.
            </p>
          </Reveal>

          <div className="lp-features-grid">
            {[
              {
                icon: 'flash_on',
                title: 'Instant Recharge',
                description: 'Plans activate in under 3 seconds on average.',
                delay: 0.05,
              },
              {
                icon: 'verified_user',
                title: 'Secure Payments',
                description: 'Protected payment flow with verified backend confirmation.',
                delay: 0.1,
              },
              {
                icon: 'history',
                title: 'Recharge History',
                description: 'Track every recharge and transaction with clear status labels.',
                delay: 0.15,
              },
              {
                icon: 'cell_tower',
                title: 'All Major Operators',
                description: 'Jio, Airtel, Vi, BSNL, and more in one place.',
                delay: 0.2,
              },
              {
                icon: 'admin_panel_settings',
                title: 'Admin Workspace',
                description: 'Manage operators, plans, users, and recharges from one dashboard.',
                delay: 0.25,
              },
              {
                icon: 'notifications_active',
                title: 'Smart Alerts',
                description: 'Get OTP, recharge, and payment feedback without hunting around the UI.',
                delay: 0.3,
              },
            ].map((feature) => (
              <FeatureCard key={feature.title} {...feature} />
            ))}
          </div>
        </div>
      </section>

      <section className="lp-section lp-section-alt" id="how-it-works">
        <div className="lp-section-inner">
          <Reveal>
            <div className="lp-section-tag">
              <span className="material-icon" style={{ fontSize: 14 }}>
                route
              </span>
              How it works
            </div>
            <h2 className="lp-section-title">
              Recharge in four
              <br />
              simple steps.
            </h2>
            <p className="lp-section-subtitle">
              From selecting an operator to payment confirmation, the whole flow is guided and quick.
            </p>
          </Reveal>

          <div className="lp-steps-grid">
            <StepCard number="01" icon="cell_tower" title="Pick an operator" description="Choose any supported telecom operator." delay={0.05} />
            <StepCard number="02" icon="list_alt" title="Select a plan" description="Browse plans with validity and benefits clearly shown." delay={0.1} />
            <StepCard number="03" icon="payment" title="Enter details" description="Add your number and choose a payment method." delay={0.15} />
            <StepCard number="04" icon="check_circle" title="Confirm and done" description="Review, pay, and activate instantly." delay={0.2} />
          </div>
        </div>
      </section>

      <section className="lp-section">
        <div className="lp-section-inner">
          <div className="lp-split">
            <Reveal>
              <div className="lp-section-tag">
                <span className="material-icon" style={{ fontSize: 14 }}>
                  shield
                </span>
                Why OmniCharge
              </div>
              <h2 className="lp-section-title">Built for reliability and trust.</h2>
              <p className="lp-section-subtitle lp-zero-bottom">
                We&apos;ve made every core decision with security, clarity, and speed in mind.
              </p>
              <div className="lp-split-checklist">
                {[
                  ['JWT + refresh token auth', 'Stay signed in securely with automatic token refresh.'],
                  ['Role-based access control', 'Admins manage the platform while users only see their own data.'],
                  ['Verified payment flow', 'The payment flow is confirmed against backend verification.'],
                  ['Schema-based validation', 'Forms are validated consistently before bad data reaches the API.'],
                ].map(([title, detail]) => (
                  <div key={title} className="lp-split-check-item">
                    <div className="lp-split-check-icon">
                      <span className="material-icon" style={{ fontSize: 13, color: '#fff' }}>
                        check
                      </span>
                    </div>
                    <div>
                      <div className="lp-split-check-title">{title}</div>
                      <div className="lp-split-check-text">{detail}</div>
                    </div>
                  </div>
                ))}
              </div>
            </Reveal>

            <Reveal delay={0.1}>
              <div className="lp-split-visual">
                <div className="lp-security-label">Security overview</div>
                {[
                  { label: 'Token handling', val: 'Session based', icon: 'key' },
                  { label: 'Payment verification', val: 'Backend checked', icon: 'verified_user' },
                  { label: 'Session storage', val: 'Scoped tokens', icon: 'lock' },
                  { label: 'Input validation', val: 'Zod schemas', icon: 'rule' },
                  { label: 'Route access', val: 'Role guarded', icon: 'admin_panel_settings' },
                  { label: 'API communication', val: 'Gateway ready', icon: 'https' },
                ].map((item) => (
                  <div key={item.label} className="lp-security-row">
                    <div className="lp-security-left">
                      <div className="lp-security-icon">
                        <span className="material-icon lp-primary-text" style={{ fontSize: 15 }}>
                          {item.icon}
                        </span>
                      </div>
                      <span className="lp-security-text">{item.label}</span>
                    </div>
                    <span className="lp-security-badge">{item.val}</span>
                  </div>
                ))}
              </div>
            </Reveal>
          </div>
        </div>
      </section>

      <section className="lp-section lp-section-alt" id="operators">
        <div className="lp-section-inner lp-center-text">
          <Reveal>
            <div className="lp-section-tag lp-center-tag">
              <span className="material-icon" style={{ fontSize: 14 }}>
                cell_tower
              </span>
              Supported operators
            </div>
            <h2 className="lp-section-title">All operators. One platform.</h2>
            <p className="lp-section-subtitle lp-centered-subtitle">
              We cover the major telecom operators in India, so the user flow stays simple no matter the network.
            </p>
          </Reveal>
          <div className="lp-operators-strip">
            {operators.map((operator, index) => (
              <Reveal key={operator.name} delay={index * 0.06}>
                <div className="lp-operator-pill">
                  <div className="lp-operator-avatar" style={{ background: operator.color }}>
                    {operator.abbr}
                  </div>
                  <span className="lp-operator-name">{operator.name}</span>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <section className="lp-section" id="testimonials">
        <div className="lp-section-inner">
          <Reveal>
            <div className="lp-section-tag">
              <span className="material-icon" style={{ fontSize: 14 }}>
                forum
              </span>
              User reviews
            </div>
            <h2 className="lp-section-title">What our users say.</h2>
          </Reveal>
          <div className="lp-testimonials-grid">
            {[
              {
                name: 'Priya Sharma',
                role: 'Software Engineer, Bengaluru',
                initials: 'PS',
                text: 'Recharges feel effortless now and the history tracking is genuinely useful.',
                delay: 0.05,
              },
              {
                name: 'Arjun Mehta',
                role: 'Product Manager, Mumbai',
                initials: 'AM',
                text: 'The admin panel and plan management flow save a lot of time.',
                delay: 0.1,
              },
              {
                name: 'Sneha Rao',
                role: 'Freelancer, Hyderabad',
                initials: 'SR',
                text: 'This finally feels like a modern recharge product instead of a cluttered utility page.',
                delay: 0.15,
              },
              {
                name: 'Vikram Nair',
                role: 'Student, Chennai',
                initials: 'VN',
                text: 'I can compare plans fast and finish a recharge without guessing what comes next.',
                delay: 0.2,
              },
              {
                name: 'Anjali Gupta',
                role: 'Teacher, Delhi',
                initials: 'AG',
                text: 'The step-by-step flow is very clear even if you are not very technical.',
                delay: 0.25,
              },
              {
                name: 'Rohit Singh',
                role: 'Startup Founder, Pune',
                initials: 'RS',
                text: 'Role-based admin access and transaction history were exactly what we needed.',
                delay: 0.3,
              },
            ].map((testimonial) => (
              <Reveal key={testimonial.name} delay={testimonial.delay}>
                <div className="lp-testimonial-card">
                  <div className="lp-testimonial-stars">★★★★★</div>
                  <p className="lp-testimonial-text">&quot;{testimonial.text}&quot;</p>
                  <div className="lp-testimonial-author">
                    <div className="lp-testimonial-avatar">{testimonial.initials}</div>
                    <div>
                      <div className="lp-testimonial-name">{testimonial.name}</div>
                      <div className="lp-testimonial-role">{testimonial.role}</div>
                    </div>
                  </div>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <section className="lp-cta-section">
        <div className="lp-cta-bg" />
        <div className="lp-cta-content">
          <Reveal>
            <h2 className="lp-cta-title">Ready to recharge faster?</h2>
            <p className="lp-cta-sub">Create your free account in under a minute and start with a cleaner workflow.</p>
            <Link to="/register" className="lp-btn-white">
              <span className="material-icon" style={{ fontSize: 18 }}>
                bolt
              </span>
              Get started for free
            </Link>
          </Reveal>
        </div>
      </section>

      <footer className="lp-footer">
        <div className="lp-footer-inner">
          <div className="lp-footer-top">
            <div className="lp-footer-brand">
              <Link to="/" className="lp-logo lp-inline-logo">
                <div className="lp-logo-icon">
                  <span className="material-icon" style={{ color: '#fff', fontSize: 18 }}>
                    bolt
                  </span>
                </div>
                <span className="lp-logo-text">OmniCharge</span>
              </Link>
              <p className="lp-footer-tagline">
                The faster, cleaner mobile recharge platform for India with strong user and admin flows.
              </p>
            </div>

            <div>
              <div className="lp-footer-col-title">Product</div>
              <a href="#features" className="lp-footer-link">
                Features
              </a>
              <a href="#how-it-works" className="lp-footer-link">
                How it works
              </a>
              <a href="#operators" className="lp-footer-link">
                Operators
              </a>
            </div>

            <div>
              <div className="lp-footer-col-title">Account</div>
              <Link to="/login" className="lp-footer-link">
                Sign in
              </Link>
              <Link to="/register" className="lp-footer-link">
                Register
              </Link>
              <Link to="/forgot-password" className="lp-footer-link">
                Reset password
              </Link>
            </div>

            <div>
              <div className="lp-footer-col-title">Platform</div>
              <span className="lp-footer-link lp-static-link">React 18</span>
              <span className="lp-footer-link lp-static-link">TypeScript</span>
              <span className="lp-footer-link lp-static-link">Payment ready</span>
            </div>
          </div>

          <div className="lp-footer-bottom">
            <div className="lp-footer-meta">
              <span>© {new Date().getFullYear()} OmniCharge. All rights reserved.</span>
              <a href="mailto:akshatmastaadmi@gmail.com" className="lp-support-link">
                Support: akshatmastaadmi@gmail.com
                <span className="material-icon" style={{ fontSize: 14 }}>
                  favorite
                </span>
              </a>
            </div>
            <div className="lp-footer-actions">
              <button onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })} className="lp-go-top-btn">
                <span className="material-icon" style={{ fontSize: 16 }}>
                  arrow_upward
                </span>
                <span>Go to top</span>
              </button>
              <button onClick={toggleTheme} className="lp-footer-theme-toggle" aria-label="Toggle theme">
                <span className="lp-theme-btn lp-small-theme-btn">
                  <span className="material-icon" style={{ fontSize: 16 }}>
                    {isDark ? 'light_mode' : 'dark_mode'}
                  </span>
                </span>
                <span className="lp-theme-copy">{isDark ? 'Switch to light mode' : 'Switch to dark mode'}</span>
              </button>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
