import '@/styles/tailwind.css'
import type { Metadata } from 'next'
import { AuthProvider } from '@/contexts/auth-context'

export const metadata: Metadata = {
  title: {
    template: '%s - Qayed',
    default: 'Qayed - Cashflow Management Platform',
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <head>
        <link
          rel="stylesheet"
          href="https://api.fontshare.com/css?f%5B%5D=switzer@400,500,600,700&amp;display=swap"
        />
        <link
          rel="alternate"
          type="application/rss+xml"
          title="The Qayed Blog"
          href="/blog/feed.xml"
        />
      </head>
      <body className="text-gray-950 antialiased">
        <AuthProvider>
          {children}
        </AuthProvider>
      </body>
    </html>
  )
}
