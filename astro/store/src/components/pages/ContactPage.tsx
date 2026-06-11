import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Mail, Phone, MapPin } from 'lucide-react';
import { motion } from 'framer-motion';
import { SEO } from '@wix/seo/components';

export default function ContactPage() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: ''
  });

  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
    setTimeout(() => {
      setFormData({ name: '', email: '', subject: '', message: '' });
      setSubmitted(false);
    }, 3000);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  return (
    <>
      <SEO.UpdateTagsTrigger>
        {({ updateSeoTags }) => {
          useEffect(() => {
            if (typeof window !== 'undefined') {
              updateSeoTags(undefined, {
                pageName: 'Contact',
                seoData: {
                  tags: [
                    {
                      type: 'title',
                      children: 'Get In Touch - Contact Us',
                    },
                    {
                      type: 'meta',
                      props: {
                        content: "We're here to help with any questions about our products or services. Contact us today.",
                        name: 'description',
                      },
                    },
                  ],
                },
              });
            }
          }, [updateSeoTags]);

          return null;
        }}
      </SEO.UpdateTagsTrigger>

      <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="w-full max-w-[100rem] mx-auto px-8 lg:px-16 py-24 lg:py-32">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-center max-w-4xl mx-auto"
        >
          <h1 className="font-heading text-5xl lg:text-7xl uppercase text-primary mb-8 tracking-tight">
            GET IN TOUCH
          </h1>
          <p className="font-paragraph text-xl lg:text-2xl italic text-secondary leading-relaxed">
            We're here to help with any questions about our products or services
          </p>
        </motion.div>
      </section>

      {/* Contact Information & Form */}
      <section className="w-full max-w-[100rem] mx-auto px-8 lg:px-16 pb-24 lg:pb-32">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-20">
          {/* Contact Information */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <h2 className="font-heading text-3xl lg:text-4xl uppercase text-primary mb-8 tracking-tight">
              CONTACT INFORMATION
            </h2>
            
            <div className="space-y-8">
              <div className="flex gap-4">
                <div className="w-12 h-12 rounded-full bg-primary/5 border border-subtleborder flex items-center justify-center flex-shrink-0">
                  <Mail className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <h3 className="font-heading text-lg uppercase text-primary mb-2 tracking-tight">
                    Email
                  </h3>
                  <p className="font-paragraph text-base italic text-secondary">
                    support@sportgear.com
                  </p>
                  <p className="font-paragraph text-base italic text-secondary">
                    sales@sportgear.com
                  </p>
                </div>
              </div>

              <div className="flex gap-4">
                <div className="w-12 h-12 rounded-full bg-primary/5 border border-subtleborder flex items-center justify-center flex-shrink-0">
                  <Phone className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <h3 className="font-heading text-lg uppercase text-primary mb-2 tracking-tight">
                    Phone
                  </h3>
                  <p className="font-paragraph text-base italic text-secondary">
                    +1 (555) 123-4567
                  </p>
                  <p className="font-paragraph text-sm italic text-secondary/80">
                    Mon-Fri: 9am - 6pm EST
                  </p>
                </div>
              </div>

              <div className="flex gap-4">
                <div className="w-12 h-12 rounded-full bg-primary/5 border border-subtleborder flex items-center justify-center flex-shrink-0">
                  <MapPin className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <h3 className="font-heading text-lg uppercase text-primary mb-2 tracking-tight">
                    Address
                  </h3>
                  <p className="font-paragraph text-base italic text-secondary">
                    123 Athletic Avenue
                  </p>
                  <p className="font-paragraph text-base italic text-secondary">
                    New York, NY 10001
                  </p>
                </div>
              </div>
            </div>

            <div className="mt-12 p-8 bg-primary/5 border border-subtleborder rounded-2xl">
              <h3 className="font-heading text-xl uppercase text-primary mb-4 tracking-tight">
                BUSINESS HOURS
              </h3>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="font-paragraph text-base italic text-secondary">Monday - Friday</span>
                  <span className="font-paragraph text-base italic text-primary">9:00 AM - 6:00 PM</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-paragraph text-base italic text-secondary">Saturday</span>
                  <span className="font-paragraph text-base italic text-primary">10:00 AM - 4:00 PM</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-paragraph text-base italic text-secondary">Sunday</span>
                  <span className="font-paragraph text-base italic text-primary">Closed</span>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Contact Form */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <div className="bg-background border-2 border-subtleborder rounded-2xl p-8 lg:p-10">
              <h2 className="font-heading text-3xl lg:text-4xl uppercase text-primary mb-8 tracking-tight">
                SEND A MESSAGE
              </h2>

              {submitted ? (
                <div className="py-12 text-center">
                  <div className="w-16 h-16 mx-auto mb-6 rounded-full bg-primary/10 border-2 border-primary flex items-center justify-center">
                    <Mail className="w-8 h-8 text-primary" />
                  </div>
                  <h3 className="font-heading text-2xl uppercase text-primary mb-4 tracking-tight">
                    MESSAGE SENT
                  </h3>
                  <p className="font-paragraph text-base italic text-secondary">
                    Thank you for reaching out. We'll get back to you soon.
                  </p>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div>
                    <Label htmlFor="name" className="font-heading text-sm uppercase tracking-wide text-primary mb-2 block">
                      Name *
                    </Label>
                    <Input
                      id="name"
                      name="name"
                      type="text"
                      required
                      value={formData.name}
                      onChange={handleChange}
                      className="w-full font-paragraph italic border-subtleborder focus:border-primary"
                      placeholder="Your full name"
                    />
                  </div>

                  <div>
                    <Label htmlFor="email" className="font-heading text-sm uppercase tracking-wide text-primary mb-2 block">
                      Email *
                    </Label>
                    <Input
                      id="email"
                      name="email"
                      type="email"
                      required
                      value={formData.email}
                      onChange={handleChange}
                      className="w-full font-paragraph italic border-subtleborder focus:border-primary"
                      placeholder="your.email@example.com"
                    />
                  </div>

                  <div>
                    <Label htmlFor="subject" className="font-heading text-sm uppercase tracking-wide text-primary mb-2 block">
                      Subject *
                    </Label>
                    <Input
                      id="subject"
                      name="subject"
                      type="text"
                      required
                      value={formData.subject}
                      onChange={handleChange}
                      className="w-full font-paragraph italic border-subtleborder focus:border-primary"
                      placeholder="How can we help?"
                    />
                  </div>

                  <div>
                    <Label htmlFor="message" className="font-heading text-sm uppercase tracking-wide text-primary mb-2 block">
                      Message *
                    </Label>
                    <Textarea
                      id="message"
                      name="message"
                      required
                      value={formData.message}
                      onChange={handleChange}
                      rows={6}
                      className="w-full font-paragraph italic border-subtleborder focus:border-primary resize-none"
                      placeholder="Tell us more about your inquiry..."
                    />
                  </div>

                  <Button
                    type="submit"
                    size="lg"
                    className="w-full bg-primary text-primary-foreground hover:bg-primary/90 font-heading uppercase tracking-wide"
                  >
                    Send Message
                  </Button>
                </form>
              )}
            </div>
          </motion.div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="w-full max-w-[100rem] mx-auto px-8 lg:px-16 pb-24 lg:pb-32">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <h2 className="font-heading text-4xl lg:text-5xl uppercase text-primary mb-6 tracking-tight">
            FREQUENTLY ASKED
          </h2>
          <p className="font-paragraph text-lg italic text-secondary max-w-2xl mx-auto">
            Quick answers to common questions
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="p-6 border border-subtleborder rounded-xl"
          >
            <h3 className="font-heading text-lg uppercase text-primary mb-3 tracking-tight">
              Shipping Information
            </h3>
            <p className="font-paragraph text-base italic text-secondary leading-relaxed">
              We offer free shipping on orders over $100. Standard delivery takes 3-5 business days.
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="p-6 border border-subtleborder rounded-xl"
          >
            <h3 className="font-heading text-lg uppercase text-primary mb-3 tracking-tight">
              Returns & Exchanges
            </h3>
            <p className="font-paragraph text-base italic text-secondary leading-relaxed">
              30-day return policy on all items. Products must be unused with original tags attached.
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="p-6 border border-subtleborder rounded-xl"
          >
            <h3 className="font-heading text-lg uppercase text-primary mb-3 tracking-tight">
              Product Care
            </h3>
            <p className="font-paragraph text-base italic text-secondary leading-relaxed">
              Care instructions are included with each product. Most items are machine washable.
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="p-6 border border-subtleborder rounded-xl"
          >
            <h3 className="font-heading text-lg uppercase text-primary mb-3 tracking-tight">
              Warranty Coverage
            </h3>
            <p className="font-paragraph text-base italic text-secondary leading-relaxed">
              All products come with a 1-year warranty against manufacturing defects.
            </p>
          </motion.div>
        </div>
      </section>
    </div>
    </>
  );
}
