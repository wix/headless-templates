// HPI 1.5-V
import React, { useEffect, useState, useRef } from 'react';
import { Link } from 'react-router-dom';
import { BaseCrudService } from '@/integrations';
import { CatalogItems } from '@/entities';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { Image } from '@/components/ui/image';
import { ArrowRight, ArrowUpRight, MoveRight, CheckCircle2, Layers, Box } from 'lucide-react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';

// --- Utility Components for Motion & Layout ---

/**
 * A wrapper that triggers a reveal animation when the element enters the viewport.
 * Uses IntersectionObserver for performance.
 */
const Reveal = ({ children, className = "", delay = 0 }: { children: React.ReactNode; className?: string; delay?: number }) => {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const element = ref.current;
    if (!element) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setTimeout(() => {
            element.classList.add('opacity-100', 'translate-y-0');
            element.classList.remove('opacity-0', 'translate-y-8');
          }, delay);
          observer.unobserve(element);
        }
      },
      { threshold: 0.1, rootMargin: '0px 0px -50px 0px' }
    );

    observer.observe(element);
    return () => observer.disconnect();
  }, [delay]);

  return (
    <div ref={ref} className={`transition-all duration-1000 ease-out opacity-0 translate-y-8 ${className}`}>
      {children}
    </div>
  );
};

/**
 * A sticky section header that stays pinned while content scrolls.
 */
const StickyHeader = ({ title, subtitle, children }: { title: string; subtitle?: string; children?: React.ReactNode }) => (
  <div className="lg:sticky lg:top-32 h-fit mb-12 lg:mb-0">
    {subtitle && (
      <span className="block font-paragraph text-xs uppercase tracking-[0.2em] text-foreground/60 mb-4">
        {subtitle}
      </span>
    )}
    <h2 className="font-heading text-4xl md:text-5xl lg:text-6xl leading-[0.95] text-foreground mb-8">
      {title}
    </h2>
    {children}
  </div>
);

// --- Main Component ---

export default function HomePage() {
  // 1. Data Fidelity Protocol: Canonize Data Sources
  const [featuredItems, setFeaturedItems] = useState<CatalogItems[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // 2. Data Fidelity Protocol: Preserve Logic
  useEffect(() => {
    loadFeaturedItems();
  }, []);

  const loadFeaturedItems = async () => {
    try {
      const result = await BaseCrudService.getAll<CatalogItems>('catalogitems', {}, { limit: 3 });
      setFeaturedItems(result.items.filter(item => item.isFeatured));
    } catch (error) {
      console.error('Failed to load featured items:', error);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <LoadingSpinner />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background overflow-clip selection:bg-primary selection:text-primary-foreground">
      <Header />

      <main className="w-full">
        
        {/* --- HERO SECTION --- 
            Replicating the structure of the inspiration image: 
            Split layout, Left Image, Right Dark Content Block.
        */}
        <section className="w-full max-w-[120rem] mx-auto">
          <div className="grid lg:grid-cols-2 min-h-[90vh]">
            {/* Left: Full Bleed Image */}
            <div className="relative h-[60vh] lg:h-auto overflow-hidden group">
              <div className="absolute inset-0 bg-black/10 z-10" />
              <Image
                src="https://static.wixstatic.com/media/48031e_512afb7f84a843ebb755dff25f2ae9ad~mv2.png?originWidth=1152&originHeight=640"
                alt="Abstract architectural form"
                className="w-full h-full object-cover transition-transform duration-[2s] ease-out group-hover:scale-105"
                width={1200}
              />
            </div>

            {/* Right: Dark Content Block */}
            <div className="bg-primary text-primary-foreground flex flex-col justify-center px-8 md:px-16 lg:px-24 py-20 lg:py-0 relative">
              <Reveal>
                <span className="block font-paragraph text-xs uppercase tracking-[0.2em] opacity-70 mb-8">
                  The Way We Do It
                </span>
              </Reveal>
              
              <Reveal delay={100}>
                <h1 className="font-heading text-4xl md:text-5xl lg:text-6xl leading-[1.1] mb-10">
                  Our journey begins where conventionality ends. We have never been accustomed to the word "impossible".
                </h1>
              </Reveal>

              <Reveal delay={200}>
                <div className="max-w-xl">
                  <p className="font-paragraph text-lg md:text-xl leading-relaxed opacity-90 mb-12">
                    At Finnegan & Fahr we are exceptionally skilled at our craft. Challenges are our guiding stars, and innovation is our trusted compass.
                  </p>
                  
                  <Link 
                    to="/catalog" 
                    className="group inline-flex items-center gap-4 text-lg font-medium border-b border-primary-foreground/30 pb-1 hover:border-primary-foreground transition-colors"
                  >
                    Explore Collection
                    <ArrowRight className="w-5 h-5 transition-transform duration-300 group-hover:translate-x-2" />
                  </Link>
                </div>
              </Reveal>
            </div>
          </div>
        </section>

        {/* --- NARRATIVE TICKER --- 
            A visual breather that adds motion and reinforces the brand's scale.
        */}
        <div className="w-full bg-secondary overflow-hidden py-6 border-b border-foreground/5">
          <div className="flex whitespace-nowrap animate-marquee">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="flex items-center mx-8 opacity-60">
                <span className="font-heading text-2xl md:text-3xl text-secondary-foreground mx-4">STRATEGIC DESIGN</span>
                <span className="w-2 h-2 bg-secondary-foreground rounded-full" />
                <span className="font-heading text-2xl md:text-3xl text-secondary-foreground mx-4">SUSTAINABLE FUTURE</span>
                <span className="w-2 h-2 bg-secondary-foreground rounded-full" />
                <span className="font-heading text-2xl md:text-3xl text-secondary-foreground mx-4">GLOBAL VISION</span>
                <span className="w-2 h-2 bg-secondary-foreground rounded-full" />
              </div>
            ))}
          </div>
          <style>{`
            @keyframes marquee {
              0% { transform: translateX(0); }
              100% { transform: translateX(-50%); }
            }
            .animate-marquee {
              animation: marquee 30s linear infinite;
            }
          `}</style>
        </div>

        {/* --- FEATURED COLLECTION (Data Driven) --- 
            Using the "Project Spotlight" layout motif from the inspiration image.
            Asymmetrical layout with large typography.
        */}
        <section className="w-full bg-secondary py-24 lg:py-32">
          <div className="max-w-[100rem] mx-auto px-6 md:px-12">
            
            {/* Section Header - Inspired by the bottom half of the inspiration image */}
            <div className="grid lg:grid-cols-12 gap-12 mb-20 items-end border-b border-foreground/10 pb-12">
              <div className="lg:col-span-7">
                <Reveal>
                  <span className="block font-paragraph text-xs uppercase tracking-[0.2em] text-foreground/60 mb-6">
                    Project Spotlight
                  </span>
                  <h2 className="font-heading text-5xl md:text-6xl lg:text-7xl text-foreground leading-[0.9]">
                    The Scheindorf,<br />Washington D.C.
                  </h2>
                </Reveal>
              </div>
              <div className="lg:col-span-5 flex flex-col justify-end">
                <Reveal delay={100}>
                  <p className="font-paragraph text-lg text-foreground/80 leading-relaxed mb-8 max-w-md ml-auto">
                    Our curated selection represents the pinnacle of design thinking. Each item is a testament to form following function in the most elegant way possible.
                  </p>
                  <div className="flex justify-end">
                    <Link to="/catalog" className="inline-flex items-center gap-2 text-foreground hover:opacity-70 transition-opacity">
                      <span className="font-paragraph text-sm uppercase tracking-widest">View Full Catalog</span>
                      <ArrowRight className="w-4 h-4" />
                    </Link>
                  </div>
                </Reveal>
              </div>
            </div>

            {/* Dynamic Items Grid */}
            {featuredItems.length > 0 ? (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-16">
                {featuredItems.map((item, index) => (
                  <Reveal key={item._id} delay={index * 100} className="group block">
                    <Link to={`/catalog/${item._id}`} className="block h-full">
                      <div className="relative aspect-[3/4] overflow-hidden bg-white mb-6">
                        <div className="absolute inset-0 bg-primary/0 group-hover:bg-primary/10 transition-colors duration-500 z-10" />
                        <Image
                          src={item.mainImage || 'https://static.wixstatic.com/media/48031e_444a57495795462ba9ba46fa5902148c~mv2.png?originWidth=576&originHeight=768'}
                          alt={item.itemName || 'Featured Item'}
                          className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-110"
                          width={600}
                        />
                        {/* Floating Action Button */}
                        <div className="absolute bottom-0 right-0 bg-primary text-primary-foreground p-4 translate-y-full group-hover:translate-y-0 transition-transform duration-300 z-20">
                          <ArrowUpRight className="w-6 h-6" />
                        </div>
                      </div>
                      
                      <div className="flex flex-col border-t border-foreground/10 pt-6">
                        <div className="flex justify-between items-start mb-2">
                          <span className="font-paragraph text-xs uppercase tracking-wider text-foreground/50">
                            {item.category || 'Design'}
                          </span>
                          <span className="font-paragraph text-xs font-medium text-foreground/40">
                            0{index + 1}
                          </span>
                        </div>
                        <h3 className="font-heading text-2xl text-foreground mb-3 group-hover:underline decoration-1 underline-offset-4">
                          {item.itemName}
                        </h3>
                        <p className="font-paragraph text-sm text-foreground/70 line-clamp-2 leading-relaxed">
                          {item.shortDescription}
                        </p>
                      </div>
                    </Link>
                  </Reveal>
                ))}
              </div>
            ) : (
              <div className="py-20 text-center border border-dashed border-foreground/20 rounded-lg">
                <p className="font-paragraph text-foreground/60">Catalog items are currently being curated.</p>
              </div>
            )}
          </div>
        </section>

        {/* --- SERVICES / CAPABILITIES --- 
            Sticky layout pattern. Left side sticks, right side scrolls.
            Clean, architectural lines.
        */}
        <section className="w-full bg-background py-24 lg:py-32 border-t border-foreground/5">
          <div className="max-w-[100rem] mx-auto px-6 md:px-12">
            <div className="grid lg:grid-cols-12 gap-12 lg:gap-24">
              
              {/* Sticky Sidebar */}
              <div className="lg:col-span-4">
                <StickyHeader title="Core Capabilities" subtitle="Expertise">
                  <p className="font-paragraph text-lg text-foreground/70 leading-relaxed mb-8">
                    We combine technical precision with creative intuition to deliver spaces and objects that stand the test of time.
                  </p>
                  <Link to="/about" className="inline-flex items-center gap-2 font-medium text-primary hover:gap-4 transition-all">
                    More about our process <MoveRight className="w-4 h-4" />
                  </Link>
                </StickyHeader>
              </div>

              {/* Scrolling Content */}
              <div className="lg:col-span-8 flex flex-col gap-16">
                {[
                  {
                    title: "Architectural Planning",
                    desc: "Comprehensive spatial analysis and structural design that prioritizes human flow and environmental harmony.",
                    icon: <Box className="w-6 h-6" />
                  },
                  {
                    title: "Interior Curation",
                    desc: "Sourcing and bespoke creation of furniture, lighting, and textiles that define the character of a space.",
                    icon: <Layers className="w-6 h-6" />
                  },
                  {
                    title: "Sustainable Development",
                    desc: "Forward-thinking material selection and energy-efficient systems integration for a responsible future.",
                    icon: <CheckCircle2 className="w-6 h-6" />
                  }
                ].map((service, idx) => (
                  <Reveal key={idx} delay={idx * 100} className="group">
                    <div className="flex flex-col md:flex-row gap-8 border-t border-foreground/10 pt-8 hover:border-foreground/40 transition-colors duration-500">
                      <div className="md:w-1/4">
                        <span className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-secondary text-primary mb-4 group-hover:scale-110 transition-transform duration-300">
                          {service.icon}
                        </span>
                      </div>
                      <div className="md:w-3/4">
                        <h3 className="font-heading text-3xl text-foreground mb-4">{service.title}</h3>
                        <p className="font-paragraph text-lg text-foreground/70 leading-relaxed max-w-2xl">
                          {service.desc}
                        </p>
                      </div>
                    </div>
                  </Reveal>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* --- IMMERSIVE IMAGE BREAK --- 
            A full-width parallax moment to cleanse the palette.
        */}
        <section className="w-full h-[80vh] relative overflow-hidden">
          <div className="absolute inset-0 bg-black/20 z-10" />
          <div className="absolute inset-0 bg-fixed bg-center bg-cover" style={{ backgroundImage: "url('https://static.wixstatic.com/media/48031e_ea6a1185a1d040f4aadc6b243bb30462~mv2.png?originWidth=1920&originHeight=1024')" }}>
            {/* CSS Parallax Fallback */}
          </div>
          <div className="relative z-20 h-full flex items-center justify-center text-center px-6">
            <div className="max-w-4xl">
              <h2 className="font-heading text-5xl md:text-7xl lg:text-8xl text-white mb-8 drop-shadow-lg">
                Design for the ages.
              </h2>
              <p className="font-paragraph text-xl text-white/90 max-w-2xl mx-auto">
                We believe that good design is not just seen, but felt. It is an experience that resonates on a deeper level.
              </p>
            </div>
          </div>
        </section>

        {/* --- CTA SECTION --- 
            Minimalist, high-contrast footer lead-in.
        */}
        <section className="w-full bg-primary text-primary-foreground py-32">
          <div className="max-w-[100rem] mx-auto px-6 md:px-12 text-center">
            <Reveal>
              <h2 className="font-heading text-4xl md:text-6xl lg:text-7xl mb-12">
                Ready to start your journey?
              </h2>
              <div className="flex flex-col md:flex-row items-center justify-center gap-6">
                <Link 
                  to="/contact" 
                  className="px-10 py-5 bg-secondary text-secondary-foreground font-paragraph font-medium text-lg hover:bg-white transition-colors duration-300 min-w-[200px]"
                >
                  Get in Touch
                </Link>
                <Link 
                  to="/about" 
                  className="px-10 py-5 border border-primary-foreground/30 text-primary-foreground font-paragraph font-medium text-lg hover:bg-primary-foreground/10 transition-colors duration-300 min-w-[200px]"
                >
                  Read Our Story
                </Link>
              </div>
            </Reveal>
          </div>
        </section>

      </main>
      <Footer />
    </div>
  );
}