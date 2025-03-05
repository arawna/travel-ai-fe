import type { Metadata } from "next";
import styles from './login.module.css';

export const metadata: Metadata = {
  title: "Travel AI | Login",
  description: "Plan your next trip with AI",
};

export default function LoginLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className={styles.backgroundWrapper}>
      {children}
    </div>
  );
}