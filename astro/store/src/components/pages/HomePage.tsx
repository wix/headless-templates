// HPI 1.5-V
import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { Image } from '@/components/ui/image';
import { Button } from '@/components/ui/button';
import { ArrowRight, ShoppingBag, Menu, Star, ArrowDownRight } from 'lucide-react';
import { motion, useScroll, useTransform, useSpring, useInView } from 'framer-motion';
import { SEO } from '@wix/seo/components';

// --- Types ---
interface ValueItem {
  title: string;
  description: string;
  image: string;
}

// --- Canonical Data Sources ---
const VALUES_DATA: ValueItem[] = [
  {
    title: 'Premium Quality',
    description: 'Carefully selected materials engineered for peak performance and lasting durability.',
    image: 'https://static.wixstatic.com/media/48031e_523baa4407a4452b93491f6c11d63839~mv2.png?originWidth=576&originHeight=704'
  },
  {
    title: 'Sustainable Design',
    description: 'Thoughtfully crafted with eco-conscious materials and responsible manufacturing practices.',
    image: 'https://static.wixstatic.com/media/48031e_8f57d2ffa90749d0b9ed11f4bf4b763f~mv2.png?originWidth=576&originHeight=704'
  },
  {
    title: 'Performance Driven',
    description: 'Engineered to enhance your athletic experience with innovative technology and design.',
    image: 'https://static.wixstatic.com/media/48031e_cbb8604f99a44514891f607bdb5358c4~mv2.png?originWidth=576&originHeight=704'
  }
];

// --- Utility Components ---

const Reveal = ({ children, className = "", delay = 0 }: { children: React.ReactNode, className?: string, delay?: number }) => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-10% 0px" });

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 40 }}
      animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 40 }}
      transition={{ duration: 0.8, ease: [0.21, 0.47, 0.32, 0.98], delay }}
      className={className}
    >
      {children}
    </motion.div>
  );
};

const ParallaxImage = ({ src, alt, className }: { src: string, alt: string, className?: string }) => {
  const ref = useRef(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"]
  });
  const y = useTransform(scrollYProgress, [0, 1], ["-10%", "10%"]);

  return (
    <div ref={ref} className={`overflow-hidden ${className}`}>
      <motion.div style={{ y }} className="w-full h-[120%] -mt-[10%]">
        <Image src={src} alt={alt} className="w-full h-full object-cover" width={1200} />
      </motion.div>
    </div>
  );
};

const Marquee = ({ text }: { text: string }) => {
  return (
    <div className="w-full overflow-hidden bg-primary py-4 border-y border-primary">
      <motion.div
        className="whitespace-nowrap flex gap-8"
        animate={{ x: [0, -1000] }}
        transition={{ repeat: Infinity, duration: 20, ease: "linear" }}
      >
        {[...Array(8)].map((_, i) => (
          <span key={i} className="text-primary-foreground font-heading text-lg uppercase tracking-widest flex items-center gap-8">
            {text} <Star className="w-4 h-4 fill-current" />
          </span>
        ))}
      </motion.div>
    </div>
  );
};

// --- Main Component ---

export default function HomePage() {
  // Scroll progress for sticky header effect or other global scroll needs
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, {
    stiffness: 100,
    damping: 30,
    restDelta: 0.001
  });

  return (
    <>
      <SEO.UpdateTagsTrigger>
        {({ updateSeoTags }) => {
          useEffect(() => {
            if (typeof window !== 'undefined') {
              updateSeoTags(undefined, {
                pageName: 'Home',
                seoData: {
                  tags: [
                    {
                      type: 'title',
                      children: 'Gear Built For Champions - Premium Sporting Goods',
                    },
                    {
                      type: 'meta',
                      props: {
                        content: 'Discover premium sporting goods designed to elevate your performance and inspire your journey to excellence.',
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

      <div className="bg-background text-foreground selection:bg-primary selection:text-primary-foreground overflow-x-hidden">
        
        {/* Progress Bar */}
        <motion.div
          className="fixed top-0 left-0 right-0 h-1 bg-primary origin-left z-50"
          style={{ scaleX }}
        />

      {/* --- HERO SECTION --- */}
      {/* Replicating the layout structure of the inspiration image: Split view, large typography left, rounded image right */}
      <section className="relative w-full max-w-[120rem] mx-auto px-4 sm:px-6 lg:px-12 pt-6 pb-12 lg:pt-10 lg:pb-24 min-h-screen flex flex-col">

        <div className="flex-1 grid lg:grid-cols-12 gap-8 lg:gap-16 items-start">
          {/* Left Content - Typography Heavy */}
          <div className="lg:col-span-5 flex flex-col justify-between h-full min-h-[60vh] lg:min-h-[70vh]">
            <div className="space-y-8">
              <Reveal>
                <h1 className="font-heading text-6xl sm:text-7xl xl:text-8xl leading-[0.9] uppercase tracking-tighter text-primary">
                  Gear Built<br />
                  For<br />
                  Champions
                </h1>
              </Reveal>
              
              <Reveal delay={0.2}>
                <div className="w-24 h-[1px] bg-primary/30 my-8" />
              </Reveal>
            </div>

            <Reveal delay={0.4} className="mt-auto">
              <div className="flex flex-col gap-6">
                <p className="font-paragraph text-xl lg:text-2xl italic text-secondary max-w-md leading-relaxed">
                  Discover premium sporting goods designed to elevate your performance and inspire your journey to excellence.
                </p>
                <Link to="/store" className="group inline-flex items-center gap-2 text-lg font-heading uppercase tracking-wide border-b border-primary pb-1 w-fit hover:text-mutedgray hover:border-mutedgray transition-colors">
                  Explore Collection
                  <ArrowRight className="w-5 h-5 transition-transform group-hover:translate-x-1" />
                </Link>
              </div>
            </Reveal>
          </div>

          {/* Right Content - Image Block */}
          <div className="lg:col-span-7 h-full min-h-[50vh] lg:min-h-[80vh] relative">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, borderRadius: "100px" }}
              animate={{ opacity: 1, scale: 1, borderRadius: "32px" }}
              transition={{ duration: 1.2, ease: [0.22, 1, 0.36, 1] }}
              className="w-full h-full bg-[#E5E5E5] rounded-[2rem] overflow-hidden relative group"
            >
              <Image
                src="https://static.wixstatic.com/media/48031e_99a3153219db46799f2e638acb53f1d3~mv2.png?originWidth=1344&originHeight=896"
                alt="Premium Athletic Gear"
                className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-105"
                width={1400}
              />
              
              {/* Floating Badge */}
              <div className="absolute bottom-8 left-8 bg-background/90 backdrop-blur-sm p-6 rounded-xl max-w-xs hidden md:block">
                <p className="font-heading text-sm uppercase tracking-wider mb-1 text-mutedgray">Featured</p>
                <p className="font-paragraph italic text-lg">The new standard in athletic performance.</p>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* --- MARQUEE SEPARATOR --- */}
      <Marquee text="Performance • Durability • Style • Innovation •" />

      {/* --- VALUES SECTION (Why Choose Us) --- */}
      <section className="w-full max-w-[120rem] mx-auto px-4 sm:px-6 lg:px-12 py-24 lg:py-32">
        <div className="grid lg:grid-cols-12 gap-12 lg:gap-24">
          
          {/* Sticky Title */}
          <div className="lg:col-span-4 relative">
            <div className="sticky top-32">
              <Reveal>
                <h2 className="font-heading text-5xl lg:text-6xl uppercase leading-none mb-6">
                  Why<br />Choose<br />Us
                </h2>
                <p className="font-paragraph text-lg italic text-secondary max-w-xs mb-8">
                  Our commitment to excellence drives every product we create.
                </p>
                <div className="hidden lg:block w-full h-[1px] bg-subtleborder" />
              </Reveal>
            </div>
          </div>

          {/* Scrolling Content */}
          <div className="lg:col-span-8 space-y-32">
            {VALUES_DATA.map((value, index) => (
              <div key={index} className="group grid md:grid-cols-2 gap-8 items-center">
                <div className={`order-2 ${index % 2 === 0 ? 'md:order-1' : 'md:order-2'}`}>
                  <Reveal delay={0.1}>
                    <span className="font-heading text-9xl text-subtleborder/30 absolute -translate-y-12 -translate-x-4 z-0">
                      0{index + 1}
                    </span>
                    <div className="relative z-10">
                      <h3 className="font-heading text-3xl uppercase mb-4">{value.title}</h3>
                      <p className="font-paragraph text-xl italic text-secondary leading-relaxed">
                        {value.description}
                      </p>
                    </div>
                  </Reveal>
                </div>
                <div className={`order-1 ${index % 2 === 0 ? 'md:order-2' : 'md:order-1'}`}>
                  <Reveal delay={0.2}>
                    <div className="aspect-[4/5] rounded-2xl overflow-hidden bg-mutedgray/10 relative">
                      <div className="absolute inset-0 bg-primary/0 group-hover:bg-primary/5 transition-colors duration-500 z-10" />
                      <Image
                        src={value.image}
                        alt={value.title}
                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                        width={600}
                      />
                    </div>
                  </Reveal>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* --- FEATURED COLLECTION (New Arrivals) --- */}
      <section className="w-full bg-[#EAEAEA] py-24 lg:py-32 overflow-hidden">
        <div className="max-w-[120rem] mx-auto px-4 sm:px-6 lg:px-12">
          <div className="flex flex-col md:flex-row justify-between items-end mb-16 gap-8">
            <Reveal>
              <h2 className="font-heading text-5xl lg:text-7xl uppercase tracking-tight">New<br />Arrivals</h2>
            </Reveal>
            <Reveal delay={0.2}>
              <div className="flex flex-col items-start md:items-end gap-4">
                <p className="font-paragraph text-xl italic text-secondary max-w-md text-left md:text-right">
                  Explore our latest collection of premium sporting goods designed for athletes who demand the best.
                </p>
                <Link to="/store">
                  <Button variant="outline" className="rounded-full border-primary text-primary hover:bg-primary hover:text-primary-foreground px-8">
                    View All Products
                  </Button>
                </Link>
              </div>
            </Reveal>
          </div>

          {/* Magazine Style Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 lg:gap-8 h-auto md:h-[80vh]">
            {/* Large Feature */}
            <div className="md:col-span-2 h-[60vh] md:h-full relative group overflow-hidden rounded-2xl">
              <ParallaxImage 
                src="https://static.wixstatic.com/media/48031e_4ebbf624cc074f7386158a4e00ed24a8~mv2.png?originWidth=1152&originHeight=896" 
                alt="New Arrival Feature" 
                className="w-full h-full"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 flex flex-col justify-end p-8 lg:p-12">
                <h3 className="text-white font-heading text-3xl uppercase mb-2 translate-y-4 group-hover:translate-y-0 transition-transform duration-500">The Pro Series</h3>
                <p className="text-white/90 font-paragraph italic text-lg translate-y-4 group-hover:translate-y-0 transition-transform duration-500 delay-75">Engineered for the elite.</p>
              </div>
            </div>

            {/* Stacked Smaller Items */}
            <div className="flex flex-col gap-4 lg:gap-8 h-full">
              <div className="flex-1 relative group overflow-hidden rounded-2xl bg-white">
                 <Image
                    src="https://static.wixstatic.com/media/48031e_4f1dd16ab6e94068a1b2f11543a70d34~mv2.png?originWidth=1152&originHeight=896"
                    alt="Accessory"
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                    width={500}
                  />
                  <div className="absolute top-4 right-4 bg-white/90 backdrop-blur rounded-full p-2">
                    <ArrowDownRight className="w-5 h-5" />
                  </div>
              </div>
              <div className="flex-1 relative group overflow-hidden rounded-2xl bg-white">
                 <Image
                    src="https://static.wixstatic.com/media/48031e_06b1cefcaa384a52bf2bb9d3d568fb06~mv2.png?originWidth=1152&originHeight=896"
                    alt="Equipment"
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                    width={500}
                  />
                  <div className="absolute bottom-6 left-6">
                    <span className="font-heading uppercase text-sm bg-primary text-primary-foreground px-3 py-1 rounded-full">New</span>
                  </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* --- PROMO / NARRATIVE SECTION --- */}
      <section className="w-full max-w-[120rem] mx-auto px-4 sm:px-6 lg:px-12 py-24 lg:py-40">
        <div className="relative rounded-[3rem] overflow-hidden bg-primary text-primary-foreground">
          <div className="grid lg:grid-cols-2 min-h-[80vh]">
            
            {/* Content Side */}
            <div className="p-12 lg:p-24 flex flex-col justify-center relative z-10">
              <Reveal>
                <div className="inline-flex items-center gap-2 border border-primary-foreground/30 rounded-full px-4 py-1 mb-8">
                  <span className="w-2 h-2 rounded-full bg-destructive animate-pulse" />
                  <span className="font-heading text-xs uppercase tracking-widest">Editorial</span>
                </div>
                <h2 className="font-heading text-5xl lg:text-7xl uppercase leading-[0.9] mb-8">
                  Performance<br />Meets<br />Style
                </h2>
                <p className="font-paragraph text-lg lg:text-xl italic text-primary-foreground/80 mb-8 leading-relaxed max-w-md">
                  Every piece in our collection combines cutting-edge athletic technology with timeless design principles. From moisture-wicking fabrics to ergonomic accessories, we ensure your gear works as hard as you do.
                </p>
                <div className="flex flex-col sm:flex-row gap-6">
                  <Link to="/about">
                    <Button size="lg" className="bg-primary-foreground text-primary hover:bg-white w-full sm:w-auto font-heading uppercase tracking-wide">
                      Read Our Story
                    </Button>
                  </Link>
                  <Link to="/store">
                    <Button size="lg" variant="outline" className="border-primary-foreground text-primary-foreground hover:bg-primary-foreground hover:text-primary w-full sm:w-auto font-heading uppercase tracking-wide">
                      Shop Collection
                    </Button>
                  </Link>
                </div>
              </Reveal>
            </div>

            {/* Image Side */}
            <div className="relative h-[500px] lg:h-auto overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-r from-primary via-transparent to-transparent z-10 lg:hidden" />
              <ParallaxImage 
                src="https://static.wixstatic.com/media/48031e_87327d34fac347ef9cb33f6d2b284f62~mv2.png?originWidth=1152&originHeight=448"
                alt="Performance Lifestyle"
                className="w-full h-full"
              />
            </div>
          </div>
        </div>
      </section>

    </div>
    </>
  );
}