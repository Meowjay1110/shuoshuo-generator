import './globals.css'
import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import { Toaster } from "@/components/ui/toaster"
import { ThemeProvider } from "@/components/theme-provider"

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: '说说管理器',
  description: '生成并管理你的说说',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="zh" suppressHydrationWarning>
      <head />
      <body>
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
          {children}
          <Toaster />
        </ThemeProvider>
      </body>
    </html>
  )
}