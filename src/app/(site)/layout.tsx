import Script from 'next/script'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import JsonLd from '@/components/JsonLd'
import PopupModal from '@/components/PopupModal'
import { organizationSchema } from '@/lib/seo/schemas'

const GA_MEASUREMENT_ID = 'G-SFN8R0VMMR'

export default function SiteLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <>
      {/* Google Analytics (GA4) */}
      <Script
        src={`https://www.googletagmanager.com/gtag/js?id=${GA_MEASUREMENT_ID}`}
        strategy="afterInteractive"
      />
      <Script id="google-analytics" strategy="afterInteractive">
        {`
          window.dataLayer = window.dataLayer || [];
          function gtag(){dataLayer.push(arguments);}
          gtag('js', new Date());
          gtag('config', '${GA_MEASUREMENT_ID}');
        `}
      </Script>

      <JsonLd data={organizationSchema()} />
      <Header />
      <main>{children}</main>
      <Footer />
      <PopupModal />
    </>
  )
}
