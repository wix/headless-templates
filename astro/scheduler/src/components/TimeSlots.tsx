import React, { useState, useEffect } from "react";
import { cn } from "../lib/utils";
import { format } from "date-fns";
import { Button } from "./ui/button";
import { Clock, Loader2 } from "lucide-react";
import AnimatedContainer from "./shared/AnimatedContainer";
import { Calendar } from "./ui/calendar";
import { availabilityCalendar, services } from "@wix/bookings";
import { createClient, OAuthStrategy } from "@wix/sdk";

interface TimeSlotsProps {
  selectedDate: Date | undefined;
  onTimeSelected: (time: string) => void;
  className?: string;
}

const wixClient = createClient({
  modules: { services, availabilityCalendar },
  auth: OAuthStrategy({
    clientId: "30e9f47f-67ff-46b9-b9f0-bffcf702080d",
  }),
});

// In a real app, these would come from an API
const generateTimeSlots = (date: Date) => {
  // Generate fake time slots between 9am and 5pm
  const slots = [];
  const isToday = new Date().toDateString() === date.toDateString();
  const currentHour = new Date().getHours();

  // Simulate some slots being unavailable randomly
  const unavailableSlots = new Set([
    Math.floor(Math.random() * 8) + 9,
    Math.floor(Math.random() * 8) + 9,
  ]);

  for (let hour = 9; hour < 17; hour++) {
    // Skip times in the past if it's today
    if (isToday && hour <= currentHour) continue;

    const isAvailable = !unavailableSlots.has(hour);

    slots.push({
      time: `${hour}:00`,
      display: format(new Date().setHours(hour, 0, 0, 0), "h:mm a"),
      available: isAvailable,
    });

    // Add 30-min slot if we're not at the end of the business day
    if (hour < 16) {
      const halfHourAvailable = !unavailableSlots.has(hour + 0.5);
      slots.push({
        time: `${hour}:30`,
        display: format(new Date().setHours(hour, 30, 0, 0), "h:mm a"),
        available: halfHourAvailable,
      });
    }
  }

  return slots;
};

const TimeSlots: React.FC<TimeSlotsProps> = ({
  selectedDate,
  onTimeSelected,
  className,
}) => {
  const [selectedSlot, setSelectedSlot] = useState<any>(null);
  const [timeSlots, setTimeSlots] = useState<
    Array<{ time: string; display: string; available: boolean; entity: any }>
  >([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (selectedDate) {
      const fetchAvailability = async () => {
        setIsLoading(true);
        try {
          const {
            items: [consultingService],
          } = await wixClient.services.queryServices().find();

          const today = selectedDate;
          const tomorrow = new Date(today);
          tomorrow.setDate(tomorrow.getDate() + 1);

          const availability =
            await wixClient.availabilityCalendar.queryAvailability(
              {
                filter: {
                  serviceId: [consultingService._id],
                  startDate: today.toISOString(),
                  endDate: tomorrow.toISOString(),
                },
              },
              { timezone: "UTC" }
            );

          const timeSlots = availability.availabilityEntries.map((item) => ({
            time: item.slot?.startDate!,
            display: format(item.slot?.startDate!, "h:mm a"),
            available: item.bookable!,
            entity: item,
          }));

          setTimeSlots(timeSlots);
        } catch (error) {
        } finally {
          setIsLoading(false);
        }
      };

      fetchAvailability();
      setSelectedSlot(null); // Reset selected time when date changes
    }
  }, [selectedDate]);

  const handleTimeSelection = (slot: any) => {
    setSelectedSlot(slot);

    onTimeSelected(slot);
  };

  if (!selectedDate) {
    return (
      <div className={cn("glass-panel p-6 text-center", className)}>
        <div className="w-6 h-6 mx-auto mb-2 text-muted-foreground">
          {/* Clock icon placeholder */}
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <circle cx="12" cy="12" r="10" />
            <polyline points="12 6 12 12 16 14" />
          </svg>
        </div>
        <p className="text-sm text-muted-foreground">
          Please select a date first
        </p>
      </div>
    );
  }

  return (
    <div className={cn("glass-panel", className)}>
      <div className="p-6">
        <h3 className="text-base font-medium mb-4">
          Available Times for {format(selectedDate, "MMMM d, yyyy")}
        </h3>

        {isLoading ? (
          <div className="flex justify-center items-center py-12">
            <div className="h-8 w-8 animate-spin text-primary">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M21 12a9 9 0 1 1-6.219-8.56" />
              </svg>
            </div>
            <span className="ml-2 text-sm text-muted-foreground">
              Loading available slots...
            </span>
          </div>
        ) : timeSlots.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-4">
            No available slots for this date
          </p>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            {timeSlots.map((slot, index) => (
              <AnimatedContainer
                key={slot.time}
                animation="scale-in"
                delay={
                  ((index % 5) * 100).toString() as
                    | "100"
                    | "200"
                    | "300"
                    | "400"
                    | "500"
                }
              >
                <Button
                  variant={
                    slot.time === selectedSlot?.time ? "default" : "outline"
                  }
                  className={cn(
                    "w-full text-sm rounded-lg",
                    !slot.available && "opacity-50 cursor-not-allowed"
                  )}
                  disabled={!slot.available}
                  onClick={() => handleTimeSelection(slot)}
                >
                  {slot.display}
                </Button>
              </AnimatedContainer>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default TimeSlots;
