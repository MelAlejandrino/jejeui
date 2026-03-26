import { RootProvider } from 'fumadocs-ui/provider/next';
import './global.css';
import { Inter } from 'next/font/google';
import { Toaster } from '@/components/ui/sonner';
import { Metadata } from 'next';

const inter = Inter({
  subsets: ['latin'],
});

export const metadata: Metadata = {
  title: 'jeje/ui',
  description:
    'Practical, copy-paste React components built on top of shadcn/ui. Designed for dashboards, admin panels, and internal tools — but flexible enough for any project.',
  openGraph: {
    title: 'jeje/ui',
    description:
      'Practical, copy-paste React components built on top of shadcn/ui. Designed for dashboards, admin panels, and internal tools — but flexible enough for any project.',
    images: '/icon.png',
  },
};

export default function Layout({ children }: LayoutProps<'/'>) {
  return (
    <html lang="en" className={inter.className} suppressHydrationWarning>
      <body className="flex flex-col min-h-screen">
        <RootProvider>{children}</RootProvider>
        <Toaster />
      </body>
    </html>
  );
}
