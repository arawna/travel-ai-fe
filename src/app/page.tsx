import Image from 'next/image';
import Link from 'next/link';
import styles from './page.module.css';

export default function Home() {
  return (
    <div className={styles.container}>
      <div style={{ position: 'absolute', width: '100%', height: '100%', zIndex: -1 }}>
        <Image
          src="/background-image.jpg"
          alt="Travel background"
          fill
          style={{ objectFit: 'cover' }}
          priority
        />
      </div>

      <nav className={styles.navbar}>
        <div className={styles.navbarContainer}>
          <Link href="/" className={styles.logo}>
            <span className={styles.logoIcon}>🌍</span>
            <span className={styles.logoText}>TRAVEL AI</span>
          </Link>
          <div className={styles.navLinks}>
            <Link href="/login" className={styles.navLink}>
              Login
            </Link>
            <Link href="/register" className={styles.navButton}>
              Get Started
            </Link>
          </div>
          <button className={styles.mobileMenuButton}>
            <span></span>
            <span></span>
            <span></span>
          </button>
        </div>
      </nav>

      <section className={styles.heroSection}>
        <div className={styles.heroContent}>
          <div className={styles.heroLeft}>
            <div className={styles.gradientBadge}>
              <span className={styles.badgeIcon}>🤖</span>
              AI-Powered Travel Planning
            </div>
            <h1 className={styles.heroTitle}>
              Experience Smart
              <span className={styles.gradientText}> Travel Planning</span>
              <br />
              Powered by AI
            </h1>
            <p className={styles.heroSubtitle}>
              Let our AI create your perfect journey. Get personalized travel plans tailored to your 
              <span className={styles.highlightText}> preferences</span>,
              <span className={styles.highlightText}> budget</span>, and
              <span className={styles.highlightText}> dreams</span>.
            </p>
            <div className={styles.ctaContainer}>
              <Link href="/register" className={styles.ctaButton}>
                Start Planning Now
                <span className={styles.ctaArrow}>→</span>
              </Link>
              <div className={styles.statsBadge}>
                <span className={styles.statsNumber}>50K+</span>
                <span className={styles.statsText}>Travel Plans Created</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className={styles.featuresSection}>
        <div className={styles.featuresContainer}>
          <h2 className={styles.sectionTitle}>Why Travel AI?</h2>
          <div className={styles.featuresGrid}>
            <div className={styles.featureCard}>
              <div className={styles.featureIcon}>✈️</div>
              <h3 className={styles.featureTitle}>Personalized Travel Plans</h3>
              <p className={styles.featureDescription}>
                Create customized travel plans based on your preferences, budget, and travel style. 
                Our AI assistant recommends the most suitable routes, accommodation options, and activities for you.
              </p>
            </div>
            
            <div className={styles.featureCard}>
              <div className={styles.featureIcon}>🗺️</div>
              <h3 className={styles.featureTitle}>Detailed Itineraries</h3>
              <p className={styles.featureDescription}>
                Discover must-see spots, local cuisines, and hidden gems at your destinations. 
                Our AI assistant creates daily plans to maximize your local experiences.
              </p>
            </div>
            
            <div className={styles.featureCard}>
              <div className={styles.featureIcon}>💰</div>
              <h3 className={styles.featureTitle}>Budget Optimization</h3>
              <p className={styles.featureDescription}>
                Get recommendations that help you use your budget most efficiently. 
                Our AI assistant helps you find the best-priced options without compromising on quality.
              </p>
            </div>
            
            <div className={styles.featureCard}>
              <div className={styles.featureIcon}>🔄</div>
              <h3 className={styles.featureTitle}>Real-Time Updates</h3>
              <p className={styles.featureDescription}>
                Receive alternative plans for weather changes, flight cancellations, or other unexpected situations. 
                Our AI assistant guides you throughout your journey.
              </p>
            </div>
            
            <div className={styles.featureCard}>
              <div className={styles.featureIcon}>📱</div>
              <h3 className={styles.featureTitle}>Easy to Use</h3>
              <p className={styles.featureDescription}>
                Plan your travel quickly and easily with our user-friendly interface. 
                Plan the trip of your dreams with just a few clicks.
              </p>
            </div>
            
            <div className={styles.featureCard}>
              <div className={styles.featureIcon}>🌍</div>
              <h3 className={styles.featureTitle}>Multilingual Support</h3>
              <p className={styles.featureDescription}>
                Our AI assistant provides service in multiple languages, allowing users from around the world 
                to create travel plans in their own language.
              </p>
            </div>
          </div>
        </div>
      </section>

      <footer className={styles.footer}>
        <div className={styles.footerContent}>
          <div className={styles.footerGrid}>
            <div className={styles.footerColumn}>
              <div className={styles.footerLogo}>
                <span className={styles.logoIcon}>🌍</span>
                <span className={styles.footerLogoText}>TRAVEL AI</span>
              </div>
              <p className={styles.footerDescription}>
                Experience the future of travel planning with AI-powered personalized recommendations.
              </p>
              <div className={styles.socialLinks}>
                <a href="#" className={styles.socialLink}>Twitter</a>
                <a href="#" className={styles.socialLink}>LinkedIn</a>
                <a href="#" className={styles.socialLink}>Instagram</a>
              </div>
            </div>

            <div className={styles.footerColumn}>
              <h3 className={styles.footerTitle}>Company</h3>
              <Link href="/about" className={styles.footerLink}>About Us</Link>
              <Link href="/careers" className={styles.footerLink}>Careers</Link>
              <Link href="/press" className={styles.footerLink}>Press</Link>
              <Link href="/blog" className={styles.footerLink}>Blog</Link>
            </div>

            <div className={styles.footerColumn}>
              <h3 className={styles.footerTitle}>Support</h3>
              <Link href="/help" className={styles.footerLink}>Help Center</Link>
              <Link href="/contact" className={styles.footerLink}>Contact Us</Link>
              <Link href="/privacy" className={styles.footerLink}>Privacy Policy</Link>
              <Link href="/terms" className={styles.footerLink}>Terms of Service</Link>
            </div>

            <div className={styles.footerColumn}>
              <h3 className={styles.footerTitle}>Newsletter</h3>
              <p className={styles.newsletterText}>
                Subscribe to our newsletter for travel tips and updates.
              </p>
              <div className={styles.newsletterForm}>
                <input
                  type="email"
                  placeholder="Enter your email"
                  className={styles.newsletterInput}
                />
                <button className={styles.newsletterButton}>
                  Subscribe
                </button>
              </div>
            </div>
          </div>

          <div className={styles.footerBottom}>
            <p className={styles.copyright}>
              © {new Date().getFullYear()} Travel AI. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
