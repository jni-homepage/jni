import Header from '@/components/Header'
import Footer from '@/components/Footer'
import JsonLd from '@/components/JsonLd'
import { organizationSchema } from '@/lib/seo/schemas'

export default function SiteLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <>
      <JsonLd data={organizationSchema()} />
      <Header />
      <main>{children}</main>
      <Footer />
    </>
  )
}
