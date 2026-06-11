import { Image } from '@/components/ui/image';
import { motion } from 'framer-motion';
import { SEO } from '@wix/seo/components';
import { useEffect } from 'react';

export default function AboutPage() {
  const values = [
    {
      title: 'Quality First',
      description: 'We source only the finest materials and partner with manufacturers who share our commitment to excellence.'
    },
    {
      title: 'Sustainable Practices',
      description: 'Environmental responsibility guides our decisions, from material selection to packaging and distribution.'
    },
    {
      title: 'Customer Focus',
      description: 'Your satisfaction drives everything we do. We stand behind every product with comprehensive support.'
    }
  ];

  const team = [
    {
      name: 'Sarah Mitchell',
      role: 'Founder & CEO',
      image: 'https://static.wixstatic.com/media/48031e_a6703183730342cebae0c35629a3e448~mv2.png?originWidth=384&originHeight=512'
    },
    {
      name: 'James Rodriguez',
      role: 'Head of Product',
      image: 'https://static.wixstatic.com/media/48031e_c0b75e146c234f9d97c97a05ef7b1e34~mv2.png?originWidth=384&originHeight=512'
    },
    {
      name: 'Emily Chen',
      role: 'Design Director',
      image: 'https://static.wixstatic.com/media/48031e_95d7fdf9620c4cd8980b7fe7df9f44fb~mv2.png?originWidth=384&originHeight=512'
    }
  ];

  return (
    <>
      <SEO.UpdateTagsTrigger>
        {({ updateSeoTags }) => {
          useEffect(() => {
            if (typeof window !== 'undefined') {
              updateSeoTags(undefined, {
                pageName: 'About',
                seoData: {
                  tags: [
                    {
                      type: 'title',
                      children: 'Our Story - About Us',
                    },
                    {
                      type: 'meta',
                      props: {
                        content: 'Founded on the belief that exceptional athletic performance begins with exceptional equipment. Learn about our mission, values, and team.',
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
            OUR STORY
          </h1>
          <p className="font-paragraph text-xl lg:text-2xl italic text-secondary leading-relaxed">
            Founded on the belief that exceptional athletic performance begins with exceptional equipment
          </p>
        </motion.div>
      </section>

      {/* Mission Section */}
      <section className="w-full max-w-[100rem] mx-auto px-8 lg:px-16 py-16 lg:py-24">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-20 items-center">
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <div className="relative aspect-[4/3] rounded-2xl overflow-hidden bg-mutedgray/10">
              <Image
                src="https://static.wixstatic.com/media/48031e_bdd05f1c873b4a38850661a3bcc3cbc8~mv2.png?originWidth=640&originHeight=512"
                alt="Our mission"
                className="w-full h-full object-cover"
                width={700}
              />
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <h2 className="font-heading text-4xl lg:text-5xl uppercase text-primary mb-6 tracking-tight">
              OUR MISSION
            </h2>
            <p className="font-paragraph text-lg italic text-secondary mb-6 leading-relaxed">
              We exist to empower athletes at every level with gear that enhances performance, inspires confidence, and stands the test of time. Our commitment extends beyond products to building a community united by passion for sport and dedication to excellence.
            </p>
            <p className="font-paragraph text-lg italic text-secondary leading-relaxed">
              Through rigorous testing, sustainable practices, and continuous innovation, we create sporting goods that meet the demands of modern athletes while respecting our planet's future.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Values Section */}
      <section className="w-full max-w-[100rem] mx-auto px-8 lg:px-16 py-16 lg:py-24">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <h2 className="font-heading text-4xl lg:text-5xl uppercase text-primary mb-6 tracking-tight">
            OUR VALUES
          </h2>
          <p className="font-paragraph text-lg italic text-secondary max-w-2xl mx-auto">
            The principles that guide every decision we make
          </p>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-12 lg:gap-16">
          {values.map((value, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              className="text-center"
            >
              <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-primary/5 border-2 border-subtleborder flex items-center justify-center">
                <span className="font-heading text-3xl text-primary">{index + 1}</span>
              </div>
              <h3 className="font-heading text-2xl uppercase text-primary mb-4 tracking-tight">
                {value.title}
              </h3>
              <p className="font-paragraph text-base italic text-secondary leading-relaxed">
                {value.description}
              </p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Team Section */}
      <section className="w-full max-w-[100rem] mx-auto px-8 lg:px-16 py-16 lg:py-24">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <h2 className="font-heading text-4xl lg:text-5xl uppercase text-primary mb-6 tracking-tight">
            MEET THE TEAM
          </h2>
          <p className="font-paragraph text-lg italic text-secondary max-w-2xl mx-auto">
            The passionate individuals behind our brand
          </p>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-12 lg:gap-16">
          {team.map((member, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              className="group"
            >
              <div className="relative mb-6 overflow-hidden rounded-2xl aspect-[3/4] bg-mutedgray/10">
                <Image
                  src={member.image}
                  alt={member.name}
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                  width={400}
                />
              </div>
              <h3 className="font-heading text-xl uppercase text-primary mb-2 tracking-tight">
                {member.name}
              </h3>
              <p className="font-paragraph text-base italic text-secondary">
                {member.role}
              </p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Commitment Section */}
      <section className="w-full max-w-[100rem] mx-auto px-8 lg:px-16 py-16 lg:py-24">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="bg-primary text-primary-foreground rounded-2xl p-12 lg:p-20 text-center"
        >
          <h2 className="font-heading text-4xl lg:text-5xl uppercase mb-6 tracking-tight">
            BUILT FOR PERFORMANCE
          </h2>
          <p className="font-paragraph text-lg lg:text-xl italic max-w-3xl mx-auto opacity-90 leading-relaxed">
            Every product undergoes rigorous testing by professional athletes and everyday enthusiasts alike. We don't release anything until it meets our exacting standards for quality, durability, and performance.
          </p>
        </motion.div>
      </section>
    </div>
    </>
  );
}
