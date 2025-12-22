import { Button } from "../components/ui/button"
import { Card, CardContent } from "../components/ui/card"
import { Mail, Phone, Clock, Sparkles, ArrowLeft } from "lucide-react"

export default function ContactPage() {
  const goHome = () => {
    // You can replace this with your navigation logic
    window.location.href = '/'
  }

  return (
    <div
      className="min-h-screen relative bg-cover bg-repeat bg-center bg-fixed scroll-smooth"
      style={{ backgroundImage: 'url("bg.jpg")' }}
    >
      {/* Background Overlay */}
      <div className="fixed inset-0 pointer-events-none z-0 bg-[#F0EEEA]/30" />
      
      {/* Content Container */}
      <div className="relative z-10">
        {/* Navigation */}
        <nav className="flex items-center justify-between p-6 lg:px-12 backdrop-blur-sm shadow-sm bg-[#F2C3B9]">
          <div className="flex items-center space-x-2 cursor-pointer" onClick={goHome}>
            <div className="w-8 h-8 bg-gradient-to-br from-[#97B3AE] to-[#D2E0D3] rounded-full flex items-center justify-center">
              <Sparkles className="w-4 h-4 text-white" />
            </div>
            <span className="text-2xl font-bold text-[#486856]">SageWillow</span>
          </div>
          
          <Button variant="ghost" className="text-[#486856] hover:bg-white/20" onClick={goHome}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Home
          </Button>
        </nav>

        {/* Hero Section */}
        <section className="text-center py-16 px-6">
          <div className="max-w-4xl mx-auto">
            <h1 className="text-5xl md:text-6xl font-light text-[black] mb-6 leading-tight">
              Get in
              <span className="block text-[#90745b]">Touch</span>
            </h1>
            <p className="text-xl text-[#769121] mb-8 max-w-2xl mx-auto leading-relaxed">
              We'd love to hear from you. Reach out to us directly through email or phone.
            </p>
          </div>
        </section>

        {/* Contact Section */}
        <section className="py-12 px-6">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-light text-[black] mb-6">Let's Connect</h2>
              <p className="text-lg text-[#6B8E7A] mb-8 leading-relaxed max-w-2xl mx-auto">
                Whether you have questions about our wellness features, need support, or want to share feedback, 
                we're here to help you on your journey to inner peace.
              </p>
            </div>

            {/* Contact Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-3xl mx-auto">
              <Card className="border-none shadow-lg bg-gradient-to-br from-[#D2E0D3] to-[#F0EEEA] rounded-2xl hover:shadow-xl transition-all duration-300">
                <CardContent className="p-8 text-center">
                  <div className="w-16 h-16 bg-white/40 rounded-full flex items-center justify-center backdrop-blur-sm mx-auto mb-4">
                    <Mail className="w-8 h-8 text-[#486856]" />
                  </div>
                  <h3 className="text-xl font-semibold text-[#486856] mb-3">Email Us</h3>
                  <a 
                    href="mailto:anjalisugandhapai@gmail.com" 
                    className="text-[#97B3AE] hover:text-[#486856] transition-colors text-lg font-medium"
                  >
                    anjalisugandhapai@gmail.com
                  </a>
                  <p className="text-[#6B8E7A] text-sm mt-2">We'll respond within 24 hours</p>
                </CardContent>
              </Card>

              <Card className="border-none shadow-lg bg-gradient-to-br from-[#F2C3B9] to-[#F0DDD6] rounded-2xl hover:shadow-xl transition-all duration-300">
                <CardContent className="p-8 text-center">
                  <div className="w-16 h-16 bg-white/40 rounded-full flex items-center justify-center backdrop-blur-sm mx-auto mb-4">
                    <Phone className="w-8 h-8 text-[#486856]" />
                  </div>
                  <h3 className="text-xl font-semibold text-[#486856] mb-3">Call Us</h3>
                  <a 
                    href="tel:+917619234859" 
                    className="text-[#97B3AE] hover:text-[#486856] transition-colors text-lg font-medium"
                  >
                    +91 7619234859
                  </a>
                  <p className="text-[#6B8E7A] text-sm mt-2">Available during business hours</p>
                </CardContent>
              </Card>
            </div>

            {/* Additional Info Card */}
            <Card className="border-none shadow-lg bg-gradient-to-br from-[#97B3AE] to-[#D2E0D3] rounded-2xl mt-8 max-w-2xl mx-auto">
              <CardContent className="p-8 text-center">
                <div className="w-16 h-16 bg-white/40 rounded-full flex items-center justify-center backdrop-blur-sm mx-auto mb-4">
                  <Clock className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-xl font-semibold text-white mb-3">Response Time</h3>
                <p className="text-white/90 text-lg">Usually within 24 hours</p>
                <p className="text-white/70 text-sm mt-2">We're committed to helping you on your wellness journey</p>
              </CardContent>
            </Card>
          </div>
        </section>

        {/* FAQ Section */}
        <section className="py-16 px-6">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-light text-[black] mb-4">
                Frequently Asked Questions
              </h2>
              <p className="text-lg text-[#6B8E7A]">
                Quick answers to common questions
              </p>
            </div>

            <div className="space-y-6">
              <Card className="border-none shadow-lg bg-white/60 backdrop-blur-sm rounded-2xl">
                <CardContent className="p-6">
                  <h3 className="text-lg font-semibold text-[#486856] mb-2">
                    How do I get started with SageWillow?
                  </h3>
                  <p className="text-[#6B8E7A]">
                    Simply sign up for a free account and begin exploring our wellness features. 
                    Start with journaling or gratitude check to begin your mindfulness journey.
                  </p>
                </CardContent>
              </Card>

              <Card className="border-none shadow-lg bg-white/60 backdrop-blur-sm rounded-2xl">
                <CardContent className="p-6">
                  <h3 className="text-lg font-semibold text-[#486856] mb-2">
                    Is my data private and secure?
                  </h3>
                  <p className="text-[#6B8E7A]">
                    Absolutely. Your personal wellness data is encrypted and kept completely private. 
                    We never share your journal entries or personal information with third parties.
                  </p>
                </CardContent>
              </Card>

              <Card className="border-none shadow-lg bg-white/60 backdrop-blur-sm rounded-2xl">
                <CardContent className="p-6">
                  <h3 className="text-lg font-semibold text-[#486856] mb-2">
                    Can I use SageWillow on my mobile device?
                  </h3>
                  <p className="text-[#6B8E7A]">
                    Yes! SageWillow is designed to work seamlessly across all devices. 
                    Access your wellness tools anytime, anywhere from your phone, tablet, or computer.
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        {/* Footer */}
        <footer className="py-12 px-6 border-t border-[#97B3AE]/40">
          <div className="max-w-6xl mx-auto flex flex-col md:flex-row justify-between items-center">
            <div className="flex items-center space-x-2 mb-4 md:mb-0">
              <div className="w-6 h-6 bg-gradient-to-br from-[#97B3AE] to-[#D2E0D3] rounded-full flex items-center justify-center">
                <Sparkles className="w-3 h-3 text-white" />
              </div>
              <span className="text-xl font-bold text-[#97B3AE]">SageWillow</span>
            </div>
            <div className="flex space-x-6 text-[#97B3AE]">
              <a href="#" className="hover:text-[#486856] transition-colors">Privacy</a>
              <a href="#" className="hover:text-[#486856] transition-colors">Terms</a>
              <a href="#" className="hover:text-[#486856] transition-colors">Support</a>
            </div>
          </div>
        </footer>
      </div>
    </div>
  )
}