import React, { useState, useEffect } from "react";
import { cn } from "../lib/utils";
import { format } from "date-fns";
import { Button } from "./ui/button";
import { Clock, Loader2 } from "lucide-react";
import AnimatedContainer from "./shared/AnimatedContainer";
import Panel from "./shared/Panel";
import { useWixClient } from "../hooks/use-wix-client";

interface TimeSlotsProps {
  className?: string;
  sessionType: "free" | "premium";
  selectedDate: Date | undefined;
  selectedSlot: any | null;
  onTimeSelected: (slot: any) => void;
}

const TimeSlots: React.FC<TimeSlotsProps> = ({
  className,
  sessionType,
  selectedDate,
  selectedSlot,
  onTimeSelected
}) => {
  const [timeSlots, setTimeSlots] = useState<
    Array<{ time: string; display: string; available: boolean; entity: any }>
  >([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const wixClient = useWixClient();

  useEffect(() => {
    if (selectedDate) {
      const fetchAvailability = async () => {
        setLoading(true);
        setError(null);
        try {
          const { items } = await wixClient.services.queryServices().find();

          const consultingService =
            sessionType === "free" ? items[1] : items[0];

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

          const slots = availability.availabilityEntries.map((item) => ({
            time: item.slot?.startDate!,
            display: Intl.DateTimeFormat("en-US", {
              hour: "numeric",
              minute: "numeric",
              hour12: true,
              timeZone: "UTC",
            }).format(new Date(item.slot?.startDate!)),
            available: item.bookable!,
            entity: item,
          }));

          setTimeSlots(slots);
        } catch (err) {
          console.error("Error fetching available slots:", err);
          setError("Failed to load available time slots");
        } finally {
          setLoading(false);
        }
      };

      fetchAvailability();
    } else {
      setTimeSlots([]);
    }
  }, [selectedDate, sessionType, wixClient]);

  const handleTimeSelection = (slot: any) => {
    onTimeSelected(slot);
  };

  if (!selectedDate) {
    return (
      <Panel 
        className={className}
        isEmpty
        icon={<Clock />}
        emptyMessage="Please select a date first"
      />
    );
  }

  return (
    <Panel 
      className={cn("glass-panel", className)} 
      title={`Available Times for ${format(selectedDate, "MMMM d, yyyy")}`}
    >
      {loading ? (
        <div className="flex justify-center items-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <span className="ml-2 text-sm text-muted-foreground">
            Loading available slots...
          </span>
        </div>
      ) : error ? (
        <p className="text-sm text-red-500 text-center py-4">
          {error}
        </p>
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
    </Panel>
  );
};

export default TimeSlots;