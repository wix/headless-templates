import React, { useState, useEffect } from "react";
import { cn } from "../lib/utils";
import { format } from "date-fns";
import { Button } from "../components/ui/button";
import { Clock } from "lucide-react";
import AnimatedContainer from "./shared/AnimatedContainer";

interface TimeSlotsProps {
  selectedDate: Date | undefined;
  onTimeSelected: (time: string) => void;
  className?: string;
}

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
  const [selectedTime, setSelectedTime] = useState<string | null>(null);
  const [timeSlots, setTimeSlots] = useState<
    Array<{ time: string; display: string; available: boolean }>
  >([]);

  useEffect(() => {
    if (selectedDate) {
      setTimeSlots(generateTimeSlots(selectedDate));
      setSelectedTime(null); // Reset selected time when date changes
    }
  }, [selectedDate]);

  const handleTimeSelection = (time: string) => {
    setSelectedTime(time);
    onTimeSelected(time);
  };

  if (!selectedDate) {
    return (
      <div className={cn("glass-panel p-6 text-center", className)}>
        <Clock className="w-6 h-6 mx-auto mb-2 text-muted-foreground" />
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

        {timeSlots.length === 0 ? (
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
                  variant={slot.time === selectedTime ? "default" : "outline"}
                  className={cn(
                    "w-full text-sm rounded-lg",
                    !slot.available && "opacity-50 cursor-not-allowed"
                  )}
                  disabled={!slot.available}
                  onClick={() => handleTimeSelection(slot.time)}
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
