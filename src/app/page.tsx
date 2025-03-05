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
            TRAVEL AI
          </Link>
          <div className={styles.navLinks}>
            <Link href="/login" className={styles.navLink}>
              Login
            </Link>
            <Link href="/register" className={styles.navLink}>
              Register
            </Link>
          </div>
        </div>
      </nav>

      <section className={styles.heroSection}>
        <div className={styles.heroContent}>
          <h1 className={styles.heroTitle}>The Future of Travel Planning with AI</h1>
          <p className={styles.heroSubtitle}>
            Travel AI uses specially trained artificial intelligence technology to simplify your travel planning. 
            Create personalized travel plans based on your budget, preferences, and dreams.
          </p>
          <Link href="/register">
            <button className={styles.ctaButton}>Get Started</button>
          </Link>
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
    </div>
  );
}
