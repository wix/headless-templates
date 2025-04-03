import React from "react";
import { Link } from "react-router-dom";
import { ArrowRightIcon, CalendarClock, CheckCircle } from "lucide-react";
import { Button } from "./ui/button";
import Navbar from "./Navbar";
import AnimatedContainer from "./shared/AnimatedContainer";

const features = [
  {
    title: "Effortless Scheduling",
    description:
      "Book appointments with just a few clicks, no registration required",
    icon: CalendarClock,
  },
  {
    title: "Instant Confirmation",
    description: "Receive immediate confirmation for your appointment",
    icon: CheckCircle,
  },
  {
    title: "Reminder Notifications",
    description: "Get timely reminders so you never miss an appointment",
    icon: CheckCircle,
  },
];

const Index = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />

      {/* Hero Section */}
      <section className="pt-32 pb-16 md:pt-40 md:pb-20 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <AnimatedContainer>
                <h1 className="text-4xl md:text-5xl font-bold leading-tight">
                  Seamless Scheduling,{" "}
                  <span className="text-primary">Simplified</span>
                </h1>
              </AnimatedContainer>

              <AnimatedContainer delay="100">
                <p className="mt-4 text-lg text-muted-foreground">
                  Book appointments with ease, manage your schedule, and never
                  miss an important meeting again.
                </p>
              </AnimatedContainer>

              <AnimatedContainer delay="200">
                <div className="mt-8 flex flex-col sm:flex-row gap-4">
                  <Button
                    asChild
                    size="lg"
                    className="rounded-lg px-6 font-medium"
                  >
                    <Link to="/schedule">Schedule Now</Link>
                  </Button>
                  <Button
                    variant="outline"
                    size="lg"
                    className="rounded-lg px-6 font-medium"
                  >
                    Learn More
                  </Button>
                </div>
              </AnimatedContainer>
            </div>

            <AnimatedContainer animation="scale-in" delay="300">
              <div className="glass-panel p-8 rounded-2xl relative overflow-hidden">
                <div className="absolute bg-primary/5 w-64 h-64 rounded-full -top-32 -right-32"></div>
                <div className="absolute bg-primary/10 w-40 h-40 rounded-full -bottom-20 -left-20"></div>

                <div className="relative z-10 space-y-6">
                  <div className="flex justify-between items-center pb-4 border-b">
                    <h3 className="text-lg font-semibold">November 2023</h3>
                    <div className="flex gap-2">
                      <span className="w-8 h-8 flex items-center justify-center rounded-full bg-secondary">
                        ←
                      </span>
                      <span className="w-8 h-8 flex items-center justify-center rounded-full bg-secondary">
                        →
                      </span>
                    </div>
                  </div>

                  <div className="grid grid-cols-7 gap-1 text-center">
                    {["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"].map((day) => (
                      <span
                        key={day}
                        className="text-xs font-medium text-muted-foreground p-2"
                      >
                        {day}
                      </span>
                    ))}

                    {[...Array(35)].map((_, i) => {
                      const day = i - 2;
                      const isToday = day === 15;
                      const isSelected = day === 23;
                      const isPast = day < 15 && day > 0;

                      if (day <= 0 || day > 30) {
                        return <span key={i} className="text-xs p-2"></span>;
                      }

                      return (
                        <span
                          key={i}
                          className={`text-xs rounded-full w-8 h-8 flex items-center justify-center mx-auto ${
                            isToday
                              ? "bg-secondary font-medium"
                              : isSelected
                                ? "bg-primary text-white font-medium"
                                : isPast
                                  ? "text-muted-foreground"
                                  : ""
                          }`}
                        >
                          {day}
                        </span>
                      );
                    })}
                  </div>

                  <div className="space-y-2">
                    <h4 className="text-sm font-medium">Upcoming</h4>
                    <div className="p-3 bg-secondary/50 rounded-lg">
                      <div className="flex justify-between">
                        <span className="text-xs font-medium">
                          Product Demo
                        </span>
                        <span className="text-xs text-muted-foreground">
                          30 min
                        </span>
                      </div>
                      <div className="text-xs text-muted-foreground mt-1">
                        Nov 23, 11:00 AM
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </AnimatedContainer>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 px-4 bg-secondary/30">
        <div className="max-w-7xl mx-auto">
          <AnimatedContainer>
            <h2 className="text-3xl font-bold text-center">
              Why Choose Our Scheduler
            </h2>
          </AnimatedContainer>

          <AnimatedContainer delay="100">
            <p className="mt-4 text-center text-muted-foreground max-w-2xl mx-auto">
              Our scheduling platform is designed to make booking appointments
              as simple and efficient as possible.
            </p>
          </AnimatedContainer>

          <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <AnimatedContainer
                key={feature.title}
                delay={
                  (index * 100 + 200).toString() as
                    | "100"
                    | "200"
                    | "300"
                    | "400"
                    | "500"
                }
              >
                <div className="glass-panel p-6 h-full">
                  <feature.icon className="h-10 w-10 text-primary mb-4" />
                  <h3 className="text-xl font-medium mb-2">{feature.title}</h3>
                  <p className="text-muted-foreground">{feature.description}</p>
                </div>
              </AnimatedContainer>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="glass-panel p-8 md:p-12 rounded-2xl relative overflow-hidden">
            <div className="absolute bg-primary/5 w-64 h-64 rounded-full -top-32 -right-32"></div>
            <div className="absolute bg-primary/10 w-40 h-40 rounded-full -bottom-20 -left-20"></div>

            <div className="relative z-10 text-center max-w-3xl mx-auto">
              <AnimatedContainer>
                <h2 className="text-3xl md:text-4xl font-bold">
                  Ready to Streamline Your Scheduling?
                </h2>
              </AnimatedContainer>

              <AnimatedContainer delay="100">
                <p className="mt-4 text-lg text-muted-foreground">
                  Experience the simplicity of our scheduling platform and take
                  control of your calendar.
                </p>
              </AnimatedContainer>

              <AnimatedContainer delay="200">
                <Button
                  asChild
                  size="lg"
                  className="mt-8 rounded-lg px-8 font-medium"
                >
                  <Link to="/schedule" className="flex items-center">
                    Get Started
                    <ArrowRightIcon className="ml-2 h-5 w-5" />
                  </Link>
                </Button>
              </AnimatedContainer>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 px-4 mt-auto bg-secondary/30">
        <div className="max-w-7xl mx-auto text-center">
          <p className="text-sm text-muted-foreground">
            © {new Date().getFullYear()} Scheduler. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
};

export default Index;
