import React from 'react';
import AdminLayoutShell from './AdminLayoutShell';

export const metadata = {
  title: 'Safety Road GH Admin',
  description: 'Road accident and hazard management dashboard for Ghana.',
};

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return <AdminLayoutShell>{children}</AdminLayoutShell>;
}
