import type { Metadata } from "next";
import styles from './chat.module.css';

export const metadata: Metadata = {
  title: "Travel AI | Chat",
  description: "Plan your next trip with AI",
};

export default function ChatLayout({
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