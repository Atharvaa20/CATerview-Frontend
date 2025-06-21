import './globals.css'
import { Inter, Poppins } from 'next/font/google'
import ClientLayout from './ClientLayout'

// Font definitions
const inter = Inter({ 
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap'
})

const poppins = Poppins({
  weight: ['400', '500', '600', '700'],
  subsets: ['latin'],
  variable: '--font-poppins',
  display: 'swap'
})

export const metadata = {
  title: 'CATerview - CAT Interview Experience Sharing Platform',
  description: 'A platform for MBA aspirants to read and share verified B-school interview experiences.',
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#ffffff' },
    { media: '(prefers-color-scheme: dark)', color: '#111827' },
  ],
}

export default function RootLayout({ children }) {
  return (
    <html lang="en" className={`${inter.variable} ${poppins.variable} font-sans`}>
      <body className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 text-gray-800 dark:text-gray-100 transition-colors duration-200">
        <ClientLayout>
          {children}
        </ClientLayout>
      </body>
    </html>
  )
}