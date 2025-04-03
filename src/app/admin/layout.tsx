import type { Metadata } from "next";
import styles from './admin.module.css';
import { Toaster } from 'react-hot-toast';

export const metadata: Metadata = {
  title: "Travel AI | Admin",
  description: "Plan your next trip with AI",
};

export default function AdminLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div>
      <Toaster position="top-right" />
      {children}
    </div>
  );
}