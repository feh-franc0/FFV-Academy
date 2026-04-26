import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'SistemaX — Protótipo Copiloto IA',
  description: 'Protótipo v1 do Copiloto IA interno — fluxos mocados',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR" className="dark">
      <body>{children}</body>
    </html>
  )
}
