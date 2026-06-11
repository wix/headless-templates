import { useState } from 'react';
import { Mail, Phone, MapPin, Send } from 'lucide-react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';

export default function ContactPage() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: '',
  });
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Simulate form submission
    setIsSubmitted(true);
    setTimeout(() => {
      setFormData({ name: '', email: '', subject: '', message: '' });
      setIsSubmitted(false);
    }, 3000);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />

      {/* Hero Section */}
      <section className="w-full bg-primary text-primary-foreground py-16 lg:py-24">
        <div className="max-w-[100rem] mx-auto px-6 md:px-12">
          <p className="font-paragraph text-sm uppercase tracking-wider mb-4 opacity-90">
            Get in Touch
          </p>
          <h1 className="font-heading text-4xl md:text-5xl lg:text-6xl mb-6 max-w-4xl">
            Let's start a conversation
          </h1>
          <p className="font-paragraph text-lg md:text-xl max-w-3xl leading-relaxed opacity-95">
            We're here to answer your questions, discuss your needs, and explore how we can work together.
          </p>
        </div>
      </section>

      {/* Contact Content */}
      <section className="w-full py-16 lg:py-24">
        <div className="max-w-[100rem] mx-auto px-6 md:px-12">
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-20">
            {/* Contact Information */}
            <div>
              <h2 className="font-heading text-3xl md:text-4xl text-foreground mb-8">
                Contact Information
              </h2>
              <p className="font-paragraph text-lg text-foreground opacity-80 leading-relaxed mb-12">
                Reach out to us through any of the following channels. We're available to assist you and look forward to hearing from you.
              </p>

              <div className="space-y-8">
                <div className="flex items-start gap-4">
                  <div className="bg-secondary p-4 flex-shrink-0">
                    <Mail className="w-6 h-6 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-heading text-xl text-foreground mb-2">Email</h3>
                    <p className="font-paragraph text-base text-foreground opacity-80">
                      info@example.com
                    </p>
                    <p className="font-paragraph text-base text-foreground opacity-80">
                      support@example.com
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="bg-secondary p-4 flex-shrink-0">
                    <Phone className="w-6 h-6 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-heading text-xl text-foreground mb-2">Phone</h3>
                    <p className="font-paragraph text-base text-foreground opacity-80">
                      +1 (555) 123-4567
                    </p>
                    <p className="font-paragraph text-base text-foreground opacity-80">
                      Monday - Friday, 9:00 AM - 6:00 PM EST
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="bg-secondary p-4 flex-shrink-0">
                    <MapPin className="w-6 h-6 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-heading text-xl text-foreground mb-2">Address</h3>
                    <p className="font-paragraph text-base text-foreground opacity-80">
                      123 Main Street
                    </p>
                    <p className="font-paragraph text-base text-foreground opacity-80">
                      Suite 100
                    </p>
                    <p className="font-paragraph text-base text-foreground opacity-80">
                      City, State 12345
                    </p>
                  </div>
                </div>
              </div>

              {/* Office Hours */}
              <div className="mt-12 bg-secondary p-8">
                <h3 className="font-heading text-2xl text-secondary-foreground mb-4">
                  Office Hours
                </h3>
                <div className="space-y-3">
                  <div className="flex justify-between font-paragraph text-base text-secondary-foreground">
                    <span>Monday - Friday</span>
                    <span className="opacity-80">9:00 AM - 6:00 PM</span>
                  </div>
                  <div className="flex justify-between font-paragraph text-base text-secondary-foreground">
                    <span>Saturday</span>
                    <span className="opacity-80">10:00 AM - 4:00 PM</span>
                  </div>
                  <div className="flex justify-between font-paragraph text-base text-secondary-foreground">
                    <span>Sunday</span>
                    <span className="opacity-80">Closed</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Contact Form */}
            <div>
              <h2 className="font-heading text-3xl md:text-4xl text-foreground mb-8">
                Send Us a Message
              </h2>

              {isSubmitted ? (
                <div className="bg-secondary p-8 text-center">
                  <Send className="w-12 h-12 text-primary mx-auto mb-4" />
                  <h3 className="font-heading text-2xl text-secondary-foreground mb-3">
                    Thank You!
                  </h3>
                  <p className="font-paragraph text-base text-secondary-foreground opacity-80">
                    Your message has been sent successfully. We'll get back to you soon.
                  </p>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div>
                    <label htmlFor="name" className="block font-paragraph text-base text-foreground mb-2">
                      Name *
                    </label>
                    <input
                      type="text"
                      id="name"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      required
                      className="w-full px-4 py-3 bg-secondary text-secondary-foreground font-paragraph text-base border-none focus:outline-none focus:ring-2 focus:ring-primary"
                    />
                  </div>

                  <div>
                    <label htmlFor="email" className="block font-paragraph text-base text-foreground mb-2">
                      Email *
                    </label>
                    <input
                      type="email"
                      id="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      required
                      className="w-full px-4 py-3 bg-secondary text-secondary-foreground font-paragraph text-base border-none focus:outline-none focus:ring-2 focus:ring-primary"
                    />
                  </div>

                  <div>
                    <label htmlFor="subject" className="block font-paragraph text-base text-foreground mb-2">
                      Subject *
                    </label>
                    <input
                      type="text"
                      id="subject"
                      name="subject"
                      value={formData.subject}
                      onChange={handleChange}
                      required
                      className="w-full px-4 py-3 bg-secondary text-secondary-foreground font-paragraph text-base border-none focus:outline-none focus:ring-2 focus:ring-primary"
                    />
                  </div>

                  <div>
                    <label htmlFor="message" className="block font-paragraph text-base text-foreground mb-2">
                      Message *
                    </label>
                    <textarea
                      id="message"
                      name="message"
                      value={formData.message}
                      onChange={handleChange}
                      required
                      rows={6}
                      className="w-full px-4 py-3 bg-secondary text-secondary-foreground font-paragraph text-base border-none focus:outline-none focus:ring-2 focus:ring-primary resize-none"
                    />
                  </div>

                  <button
                    type="submit"
                    className="w-full bg-primary text-primary-foreground px-8 py-4 font-paragraph text-base hover:bg-opacity-90 transition-all flex items-center justify-center gap-3"
                  >
                    Send Message
                    <Send className="w-5 h-5" />
                  </button>
                </form>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Map Section */}
      <section className="w-full bg-secondary py-16 lg:py-24">
        <div className="max-w-[100rem] mx-auto px-6 md:px-12">
          <div className="text-center mb-12">
            <h2 className="font-heading text-3xl md:text-4xl text-secondary-foreground mb-4">
              Visit Our Location
            </h2>
            <p className="font-paragraph text-lg text-secondary-foreground opacity-80">
              We're conveniently located and easy to reach.
            </p>
          </div>
          <div className="bg-background h-[400px] flex items-center justify-center">
            <p className="font-paragraph text-base text-foreground opacity-60">
              Map placeholder - Integration available upon request
            </p>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
