import type { Metadata } from "next";
import { Open_Sans } from 'next/font/google';
import "./globals.css";
import { Toaster } from 'react-hot-toast';
import { ReduxProvider } from '@/components/ReduxProvider';

const openSans = Open_Sans({
  subsets: ['latin'],
  weight: ['300', '400', '500', '600', '700', '800'],
  variable: '--font-open-sans',
});

export const metadata: Metadata = {
  title: "ADMINTO Dashboard",
  description: "Modern dashboard application",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${openSans.variable} font-sans antialiased`}>
      <Toaster
  position="bottom-right"
  reverseOrder={false}
/>
        <ReduxProvider>
          {children}
        </ReduxProvider>
      </body>
    </html>
  );
}