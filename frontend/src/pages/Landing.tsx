import { useEffect } from 'react'
import HeroSection from '../components/landing/HeroSection'
import WhatIsSection from '../components/landing/WhatIsSection'
import FeaturesSection from '../components/landing/FeaturesSection'
import HowItWorks from '../components/landing/HowItWorks'
import CTASection from '../components/landing/CTASection'
import Footer from '../components/landing/Footer'

export default function Landing() {
  useEffect(() => {
    // Scroll to top on mount
    window.scrollTo(0, 0)
  }, [])

  return (
    <div className="min-h-screen bg-background-light">
      <HeroSection />
      <WhatIsSection />
      <FeaturesSection />
      <HowItWorks />
      <CTASection />
      <Footer />
    </div>
  )
}
