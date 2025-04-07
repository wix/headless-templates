import { useState, useEffect } from "react";
import { useWixClient } from "./use-wix-client";
import { useWixServices } from "./use-wix-services";

interface TimeSlot {
  time: string;
  display: string;
  available: boolean;
  entity: any;
}

interface UseTimeSlotsResult {
  timeSlots: TimeSlot[];
  loading: boolean;
  error: string | null;
  refreshSlots: () => Promise<void>;
}

export const useTimeSlots = (
  selectedDate: Date | undefined,
  sessionType: "free" | "premium"
): UseTimeSlotsResult => {
  const [timeSlots, setTimeSlots] = useState<TimeSlot[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const wixClient = useWixClient();
  const { getServiceByType } = useWixServices();

  const fetchAvailableSlots = async () => {
    if (!selectedDate) {
      setTimeSlots([]);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const service = getServiceByType(sessionType);
      
      if (!service) {
        throw new Error(`No ${sessionType} service found`);
      }

      const today = selectedDate;
      const tomorrow = new Date(today);
      tomorrow.setDate(tomorrow.getDate() + 1);

      const availability = await wixClient.availabilityCalendar.queryAvailability(
        {
          filter: {
            serviceId: [service._id],
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
      setTimeSlots([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAvailableSlots();
  }, [selectedDate, sessionType]);

  return {
    timeSlots,
    loading,
    error,
    refreshSlots: fetchAvailableSlots,
  };
};