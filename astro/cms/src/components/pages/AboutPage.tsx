import { Image } from '@/components/ui/image';
import { Target, Users, Award, TrendingUp } from 'lucide-react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';

export default function AboutPage() {
  const values = [
    {
      icon: Target,
      title: 'Our Mission',
      description: 'To deliver exceptional solutions that exceed expectations and drive meaningful results for our clients and partners.',
    },
    {
      icon: Users,
      title: 'Our Team',
      description: 'A diverse group of talented professionals united by passion, expertise, and commitment to excellence.',
    },
    {
      icon: Award,
      title: 'Our Quality',
      description: 'We maintain the highest standards in everything we do, ensuring consistent quality and reliability.',
    },
    {
      icon: TrendingUp,
      title: 'Our Growth',
      description: 'Continuously evolving and adapting to meet the changing needs of our industry and clients.',
    },
  ];

  const stats = [
    { value: '500+', label: 'Projects Completed' },
    { value: '15+', label: 'Years Experience' },
    { value: '200+', label: 'Happy Clients' },
    { value: '50+', label: 'Team Members' },
  ];

  return (
    <div className="min-h-screen bg-background">
      <Header />

      {/* Hero Section */}
      <section className="w-full bg-primary text-primary-foreground py-16 lg:py-24">
        <div className="max-w-[100rem] mx-auto px-6 md:px-12">
          <p className="font-paragraph text-sm uppercase tracking-wider mb-4 opacity-90">
            About Us
          </p>
          <h1 className="font-heading text-4xl md:text-5xl lg:text-6xl mb-6 max-w-4xl">
            Building excellence through innovation and dedication
          </h1>
          <p className="font-paragraph text-lg md:text-xl max-w-3xl leading-relaxed opacity-95">
            We are a team of passionate professionals committed to delivering outstanding results and creating lasting value for our clients.
          </p>
        </div>
      </section>

      {/* Story Section */}
      <section className="w-full py-16 lg:py-24">
        <div className="max-w-[100rem] mx-auto px-6 md:px-12">
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-20 items-center">
            <div>
              <p className="font-paragraph text-sm uppercase tracking-wider mb-4 text-foreground opacity-60">
                Our Story
              </p>
              <h2 className="font-heading text-3xl md:text-4xl lg:text-5xl text-foreground mb-6">
                A journey of passion and purpose
              </h2>
              <p className="font-paragraph text-lg text-foreground opacity-80 leading-relaxed mb-6">
                Founded with a vision to transform the industry, we've grown from a small startup to a recognized leader in our field. Our journey has been marked by continuous innovation, unwavering commitment to quality, and a deep understanding of our clients' needs.
              </p>
              <p className="font-paragraph text-lg text-foreground opacity-80 leading-relaxed mb-6">
                Every project we undertake is an opportunity to push boundaries, challenge conventions, and deliver solutions that make a real difference. We believe in the power of collaboration, the importance of integrity, and the value of sustainable practices.
              </p>
              <p className="font-paragraph text-lg text-foreground opacity-80 leading-relaxed">
                Today, we continue to evolve, embracing new technologies and methodologies while staying true to the core values that have defined us from the beginning.
              </p>
            </div>
            <div className="relative h-[500px] lg:h-[600px]">
              <Image
                src="https://static.wixstatic.com/media/48031e_c171ccd8dc5741138a3d6220b6effb2f~mv2.png?originWidth=768&originHeight=576"
                alt="Our team and workspace"
                className="w-full h-full object-cover"
                width={800}
              />
            </div>
          </div>
        </div>
      </section>

      {/* Values Section */}
      <section className="w-full bg-secondary py-16 lg:py-24">
        <div className="max-w-[100rem] mx-auto px-6 md:px-12">
          <div className="text-center mb-16">
            <p className="font-paragraph text-sm uppercase tracking-wider mb-4 text-secondary-foreground opacity-60">
              What Drives Us
            </p>
            <h2 className="font-heading text-3xl md:text-4xl lg:text-5xl text-secondary-foreground mb-6">
              Our Core Values
            </h2>
            <p className="font-paragraph text-lg md:text-xl text-secondary-foreground max-w-3xl mx-auto leading-relaxed opacity-80">
              The principles that guide our work and define our culture.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-12">
            {values.map((value, index) => {
              const Icon = value.icon;
              return (
                <div key={index} className="bg-background p-8">
                  <Icon className="w-12 h-12 text-primary mb-6" />
                  <h3 className="font-heading text-2xl text-foreground mb-4">
                    {value.title}
                  </h3>
                  <p className="font-paragraph text-base text-foreground opacity-80 leading-relaxed">
                    {value.description}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="w-full py-16 lg:py-24">
        <div className="max-w-[100rem] mx-auto px-6 md:px-12">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-12">
            {stats.map((stat, index) => (
              <div key={index} className="text-center">
                <p className="font-heading text-5xl md:text-6xl text-primary mb-3">
                  {stat.value}
                </p>
                <p className="font-paragraph text-base text-foreground opacity-70 uppercase tracking-wider">
                  {stat.label}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Approach Section */}
      <section className="w-full bg-primary text-primary-foreground py-16 lg:py-24">
        <div className="max-w-[100rem] mx-auto px-6 md:px-12">
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-20 items-center">
            <div className="relative h-[500px] lg:h-[600px]">
              <Image
                src="https://static.wixstatic.com/media/48031e_c8ff6c824a7b42129e3ec53705057331~mv2.png?originWidth=768&originHeight=576"
                alt="Our approach to work"
                className="w-full h-full object-cover"
                width={800}
              />
            </div>
            <div>
              <p className="font-paragraph text-sm uppercase tracking-wider mb-4 opacity-90">
                Our Approach
              </p>
              <h2 className="font-heading text-3xl md:text-4xl lg:text-5xl mb-6">
                How we work with you
              </h2>
              <p className="font-paragraph text-lg leading-relaxed mb-6 opacity-95">
                We believe in a collaborative approach that puts our clients at the center of everything we do. From initial consultation to final delivery, we work closely with you to understand your goals, challenges, and vision.
              </p>
              <p className="font-paragraph text-lg leading-relaxed mb-6 opacity-95">
                Our process is transparent, efficient, and designed to deliver results that exceed expectations. We combine strategic thinking with creative execution, ensuring that every solution is both innovative and practical.
              </p>
              <p className="font-paragraph text-lg leading-relaxed opacity-95">
                Whether you're looking to launch a new initiative or optimize existing operations, we bring the expertise, dedication, and passion needed to help you succeed.
              </p>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
