import { createContext, useContext, useState, ReactNode } from "react";
import { format } from "date-fns";
import { useWixClient } from "./use-wix-client";
import { useToast } from "./use-toast";

interface BookingContextType {
  selectedDate: Date | undefined;
  selectedSlot: any | null;
  sessionType: "free" | "premium";
  setSelectedDate: (date: Date | undefined) => void;
  setSelectedSlot: (slot: any) => void;
  setSessionType: (type: "free" | "premium") => void;
  saveBooking: (formData: any) => Promise<void>;
  createRedirectSession: (slot: any) => Promise<void>;
}

const BookingContext = createContext<BookingContextType | undefined>(undefined);

export const BookingProvider = ({ children }: { children: ReactNode }) => {
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined);
  const [selectedSlot, setSelectedSlot] = useState<any | null>(null);
  const [sessionType, setSessionType] = useState<"free" | "premium">("free");
  const wixClient = useWixClient();
  const { toast } = useToast();

  const saveBooking = async (formData: any) => {
    if (!selectedDate || !selectedSlot) {
      toast({
        title: "Error",
        description: "Please select both a date and time",
        variant: "destructive",
      });
      throw new Error("Please select both a date and time");
    }

    try {
      const booking = await wixClient.bookings.createBooking({
        bookedEntity: selectedSlot.entity,
        totalParticipants: 1,
        contactDetails: {
          firstName: formData.name.split(" ")[0],
          lastName: formData.name.split(" ")[1] || "",
          fullAddress: {
            addressLine: formData.address,
          },
          email: formData.email,
          phone: formData.phone,
        },
      });

      const bookingData = {
        ...formData,
        date: format(selectedDate, "yyyy-MM-dd"),
        time: selectedSlot.time,
        displayDate: format(selectedDate, "MMMM d, yyyy"),
        displayTime: selectedSlot.display,
      };
      sessionStorage.setItem("bookingData", JSON.stringify(bookingData));
      window.location.href = `/confirmation`;
    } catch (error) {
      console.error("Error creating booking:", error);
      toast({
        title: "Error",
        description: "There was a problem creating your booking.",
        variant: "destructive",
      });
      throw error;
    }
  };

  const createRedirectSession = async (slot: any) => {
    try {
      const redirect = await wixClient.redirects.createRedirectSession({
        bookingsCheckout: { slotAvailability: slot, timezone: "UTC" },
        callbacks: { postFlowUrl: window.location.href },
      });
      window.location.href = redirect.redirectSession!.fullUrl;
    } catch (error) {
      console.error("Error creating redirect session:", error);
      toast({
        title: "Error",
        description: "There was a problem redirecting to checkout.",
        variant: "destructive",
      });
      throw error;
    }
  };

  return (
    <BookingContext.Provider
      value={{
        selectedDate,
        selectedSlot,
        sessionType,
        setSelectedDate,
        setSelectedSlot,
        setSessionType,
        saveBooking,
        createRedirectSession,
      }}
    >
      {children}
    </BookingContext.Provider>
  );
};

export const useBooking = () => {
  const context = useContext(BookingContext);
  if (context === undefined) {
    throw new Error("useBooking must be used within a BookingProvider");
  }
  return context;
};