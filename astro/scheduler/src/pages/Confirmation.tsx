import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { CheckCircle, Calendar, ArrowLeftIcon } from "lucide-react";
import { Button } from "../components/ui/button";
import { Link } from "react-router-dom";
import Navbar from "../components/Navbar";
import AnimatedContainer from "../components/shared/AnimatedContainer";

interface BookingData {
  name: string;
  email: string;
  phone: string;
  date: string;
  time: string;
  displayDate: string;
  displayTime: string;
  notes?: string;
}

const Confirmation = () => {
  const [bookingData, setBookingData] = useState<BookingData | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    // Retrieve booking data from sessionStorage
    const data = sessionStorage.getItem("bookingData");

    if (!data) {
      // Redirect if no booking data is found
      navigate("/schedule");
      return;
    }

    setBookingData(JSON.parse(data));
  }, [navigate]);

  if (!bookingData) {
    return null; // Redirecting or loading
  }

  return (
    <div className="min-h-screen">
      <Navbar />

      <div className="max-w-3xl mx-auto pt-32 pb-16 px-4">
        <AnimatedContainer>
          <Button variant="ghost" asChild className="mb-6">
            <Link to="/" className="flex items-center space-x-2">
              <ArrowLeftIcon className="h-4 w-4" />
              <span>Back to Home</span>
            </Link>
          </Button>
        </AnimatedContainer>

        <div className="glass-panel p-8 md:p-12 text-center">
          <AnimatedContainer animation="scale-in">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 mb-6">
              <CheckCircle className="h-8 w-8 text-primary" />
            </div>
          </AnimatedContainer>

          <AnimatedContainer animation="fade-up">
            <h1 className="text-3xl font-bold mb-4">Appointment Confirmed!</h1>
          </AnimatedContainer>

          <AnimatedContainer animation="fade-up" delay="100">
            <p className="text-muted-foreground mb-8 max-w-xl mx-auto">
              Your appointment has been successfully scheduled. We've sent a
              confirmation email to {bookingData.email}.
            </p>
          </AnimatedContainer>

          <AnimatedContainer animation="fade-up" delay="200">
            <div className="bg-secondary/40 p-6 rounded-xl mb-8 inline-block mx-auto">
              <div className="flex items-center justify-center gap-3 mb-4">
                <Calendar className="h-5 w-5 text-primary" />
                <span className="font-medium text-lg">Appointment Details</span>
              </div>

              <div className="text-left space-y-2">
                <p>
                  <span className="text-muted-foreground">Name:</span>{" "}
                  {bookingData.name}
                </p>
                <p>
                  <span className="text-muted-foreground">Date:</span>{" "}
                  {bookingData.displayDate}
                </p>
                <p>
                  <span className="text-muted-foreground">Time:</span>{" "}
                  {bookingData.displayTime}
                </p>
                <p>
                  <span className="text-muted-foreground">Email:</span>{" "}
                  {bookingData.email}
                </p>
                <p>
                  <span className="text-muted-foreground">Phone:</span>{" "}
                  {bookingData.phone}
                </p>
                {bookingData.notes && (
                  <p>
                    <span className="text-muted-foreground">Notes:</span>{" "}
                    {bookingData.notes}
                  </p>
                )}
              </div>
            </div>
          </AnimatedContainer>

          <AnimatedContainer animation="fade-up" delay="300">
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button asChild variant="outline" className="rounded-lg">
                <Link to="/">Return to Home</Link>
              </Button>
              <Button asChild className="rounded-lg">
                <Link to="/schedule">Book Another Appointment</Link>
              </Button>
            </div>
          </AnimatedContainer>
        </div>
      </div>

      {/* Footer */}
      <footer className="py-8 px-4 bg-secondary/30 mt-auto">
        <div className="max-w-7xl mx-auto text-center">
          <p className="text-sm text-muted-foreground">
            © {new Date().getFullYear()} Scheduler. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
};

export default Confirmation;
