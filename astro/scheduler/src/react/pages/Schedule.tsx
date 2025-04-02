
import React, { useState } from "react";
import { ArrowLeftIcon } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "../components/ui/button";
import Navbar from "../components/Navbar";
import DatePicker from "../components/DatePicker";
import TimeSlots from "../components/TimeSlots";
import BookingForm from "../components/BookingForm";
import AnimatedContainer from "../components/shared/AnimatedContainer";
import Logo from "../components/Logo";
import { useBrandConfig } from "../lib/brandConfig";

const Schedule = () => {
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined);
  const [selectedTime, setSelectedTime] = useState<string | null>(null);
  const { businessName } = useBrandConfig();

  const handleTimeSelected = (time: string) => {
    setSelectedTime(time);
    // Scroll to the booking form
    setTimeout(() => {
      const bookingForm = document.getElementById("booking-form");
      if (bookingForm) {
        bookingForm.scrollIntoView({ behavior: "smooth" });
      }
    }, 100);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-secondary/10">
      <Navbar />
      
      <div className="max-w-7xl mx-auto pt-32 pb-16 px-4">
        <AnimatedContainer>
          <Button variant="ghost" asChild className="mb-6">
            <Link to="/" className="flex items-center space-x-2">
              <ArrowLeftIcon className="h-4 w-4" />
              <span>Back to Home</span>
            </Link>
          </Button>
        </AnimatedContainer>
        
        <AnimatedContainer animation="fade-up" className="text-center mb-8">
          <Logo size="lg" className="mx-auto mb-4" />
          <h1 className="text-3xl md:text-4xl font-bold mb-2 bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
            Schedule Your Appointment
          </h1>
        </AnimatedContainer>
        
        <AnimatedContainer animation="fade-up" delay="100" className="text-center">
          <p className="text-muted-foreground mb-12 max-w-2xl mx-auto">
            Select a date and time that works for you, and fill in your details to complete the booking with {businessName}.
          </p>
        </AnimatedContainer>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <AnimatedContainer animation="fade-up" delay="200">
            <DatePicker 
              date={selectedDate} 
              setDate={setSelectedDate} 
            />
          </AnimatedContainer>
          
          <AnimatedContainer animation="fade-up" delay="300">
            <TimeSlots 
              selectedDate={selectedDate} 
              onTimeSelected={handleTimeSelected} 
            />
          </AnimatedContainer>
          
          <AnimatedContainer animation="fade-up" delay="400" id="booking-form">
            <BookingForm 
              selectedDate={selectedDate} 
              selectedTime={selectedTime} 
            />
          </AnimatedContainer>
        </div>
      </div>
      
      {/* Footer */}
      <footer className="py-8 px-4 bg-gradient-to-r from-primary/5 via-secondary/5 to-accent/5">
        <div className="max-w-7xl mx-auto text-center">
          <Logo size="sm" className="mx-auto mb-3" />
          <p className="text-sm text-muted-foreground">
            © {new Date().getFullYear()} {businessName}. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
};

export default Schedule;
