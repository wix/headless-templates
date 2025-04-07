import { ArrowLeftIcon } from "lucide-react";
import React, { useState, useEffect } from "react";
import { useBrandConfig } from "../lib/brandConfig";
import App from "./App";
import BookingForm from "./BookingForm";
import DatePicker from "./DatePicker";
import Logo from "./Logo";
import Navbar from "./Navbar";
import AnimatedContainer from "./shared/AnimatedContainer";
import Footer from "./shared/Footer";
import TimeSlots from "./TimeSlots";
import { Button } from "./ui/button";
import { format } from "date-fns";

// Self-contained version without context dependencies
const Schedule = () => {
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined);
  const [selectedSlot, setSelectedSlot] = useState<any | null>(null);
  const [sessionType, setSessionType] = useState<"free" | "premium">("free");
  const { businessName } = useBrandConfig();

  const handleSessionTypeChange = (type: "free" | "premium") => {
    setSessionType(type);
    setSelectedSlot(null); // Reset selected slot when session type changes
  };

  const handleTimeSelected = (slot: any) => {
    setSelectedSlot(slot);
    setTimeout(() => {
      const bookingForm = document.getElementById("booking-form");
      if (bookingForm) {
        bookingForm.scrollIntoView({ behavior: "smooth" });
      }
    }, 100);
  };

  return (
    <App>
      <div className="min-h-screen bg-gradient-to-b from-white to-secondary/10">
        <Navbar />

        <div className="max-w-7xl mx-auto pt-32 pb-16 px-4">
          <AnimatedContainer>
            <Button variant="ghost" asChild className="mb-6">
              <a href="/" className="flex items-center space-x-2">
                <ArrowLeftIcon className="h-4 w-4" />
                <span>Back to Home</span>
              </a>
            </Button>
          </AnimatedContainer>

          <AnimatedContainer animation="fade-up" className="text-center mb-8">
            <Logo size="lg" className="mx-auto mb-4" />
            <h1 className="text-3xl md:text-4xl font-bold mb-2 bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
              Schedule Your Appointment
            </h1>
          </AnimatedContainer>

          <AnimatedContainer
            animation="fade-up"
            delay="100"
            className="text-center"
          >
            <p className="text-muted-foreground mb-12 max-w-2xl mx-auto">
              Select a date and time that works for you, and fill in your
              details to complete the booking with {businessName}.
            </p>
          </AnimatedContainer>

          <AnimatedContainer
            animation="fade-up"
            delay="100"
            className="text-center mb-8"
          >
            <div className="flex justify-center space-x-4">
              <label className="flex items-center space-x-2">
                <input
                  type="radio"
                  name="sessionType"
                  value="free"
                  checked={sessionType === "free"}
                  onChange={() => handleSessionTypeChange("free")}
                />
                <span>Free Session (0.5h)</span>
              </label>
              <label className="flex items-center space-x-2">
                <input
                  type="radio"
                  name="sessionType"
                  value="premium"
                  checked={sessionType === "premium"}
                  onChange={() => handleSessionTypeChange("premium")}
                />
                <span>Premium Session (2h, 100€)</span>
              </label>
            </div>
          </AnimatedContainer>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <AnimatedContainer animation="fade-up" delay="200">
              <div className="glass-panel p-6 overflow-hidden">
                <div className="mb-4 text-center">
                  <p className="text-sm font-medium text-muted-foreground">
                    Select a date for your appointment
                  </p>
                </div>
                
                <DatePicker date={selectedDate} setDate={setSelectedDate} />
              </div>
            </AnimatedContainer>

            <AnimatedContainer animation="fade-up" delay="300">
              <TimeSlots
                sessionType={sessionType}
                selectedDate={selectedDate}
                onTimeSelected={handleTimeSelected}
                selectedSlot={selectedSlot}
              />
            </AnimatedContainer>

            <AnimatedContainer
              animation="fade-up"
              delay="400"
              id="booking-form"
            >
              <BookingForm
                sessionType={sessionType}
                selectedDate={selectedDate}
                selectedSlot={selectedSlot}
              />
            </AnimatedContainer>
          </div>
        </div>

        <Footer />
      </div>
    </App>
  );
};

export default Schedule;