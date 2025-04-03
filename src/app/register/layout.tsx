import type { Metadata } from "next";
import styles from './register.module.css';

export const metadata: Metadata = {
  title: "Plan Voyage AI | Register",
  description: "Plan your next trip with AI",
};

export default function RegisterLayout({
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