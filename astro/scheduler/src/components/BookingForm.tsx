import React, { useState } from "react";
import { format } from "date-fns";
import { cn } from "../lib/utils";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { Button } from "./ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "./ui/form";
import { Input } from "./ui/input";
import { Textarea } from "./ui/textarea";
import { CalendarClock } from "lucide-react";
import AnimatedContainer from "./shared/AnimatedContainer";
import Panel from "./shared/Panel";
import { useWixClient } from "../hooks/use-wix-client";
import { useToast } from "../hooks/use-toast";

interface BookingFormProps {
  className?: string;
  sessionType: "free" | "premium";
  selectedDate: Date | undefined;
  selectedSlot: any | null;
}

const bookingFormSchema = z.object({
  name: z.string().min(2, { message: "Name must be at least 2 characters" }),
  address: z
    .string()
    .min(2, { message: "Address must be at least 2 characters" }),
  email: z.string().email({ message: "Please enter a valid email address" }),
  phone: z.string().min(7, { message: "Please enter a valid phone number" }),
  notes: z.string().optional(),
});

type BookingFormValues = z.infer<typeof bookingFormSchema>;

const BookingForm: React.FC<BookingFormProps> = ({ 
  className,
  sessionType,
  selectedDate,
  selectedSlot
}) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const wixClient = useWixClient();
  const { toast } = useToast();

  const form = useForm<BookingFormValues>({
    resolver: zodResolver(bookingFormSchema),
    defaultValues: {
      name: "",
      address: "",
      email: "",
      phone: "",
      notes: "",
    },
  });

  const saveBooking = async (formData: BookingFormValues) => {
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
    }
  };

  const onSubmit = async (data: BookingFormValues) => {
    setIsSubmitting(true);
    try {
      await saveBooking(data);
    } catch (error) {
      console.error("Error submitting form:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!selectedDate || !selectedSlot) {
    return (
      <Panel
        className={className}
        isEmpty
        icon={<CalendarClock />}
        emptyMessage="Please select both a date and time to proceed with booking"
      />
    );
  }

  return (
    <Panel className={cn("glass-panel", className)} title="Complete Your Booking">
      <AnimatedContainer animation="fade-up" delay="100">
        <div className="mb-6 p-3 bg-secondary/50 rounded-lg">
          <p className="text-sm font-medium">
            <span className="text-muted-foreground">Date: </span>
            {format(selectedDate, "MMMM d, yyyy")}
          </p>
          <p className="text-sm font-medium">
            <span className="text-muted-foreground">Time: </span>
            {selectedSlot?.display}
          </p>
        </div>
      </AnimatedContainer>

      {sessionType === "free" ? (
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <AnimatedContainer animation="fade-up" delay="200">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Name</FormLabel>
                    <FormControl>
                      <Input placeholder="Your full name" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </AnimatedContainer>

            <AnimatedContainer animation="fade-up" delay="300">
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <Input placeholder="you@example.com" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </AnimatedContainer>

            <AnimatedContainer animation="fade-up" delay="400">
              <FormField
                control={form.control}
                name="phone"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Phone</FormLabel>
                    <FormControl>
                      <Input placeholder="Your phone number" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </AnimatedContainer>

            <AnimatedContainer animation="fade-up" delay="500">
              <FormField
                control={form.control}
                name="address"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Address</FormLabel>
                    <FormControl>
                      <Input placeholder="Your full address" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </AnimatedContainer>

            <AnimatedContainer animation="fade-up" delay="500">
              <FormField
                control={form.control}
                name="notes"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Notes (optional)</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Any additional information..."
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </AnimatedContainer>

            <AnimatedContainer animation="fade-up" delay="500">
              <Button
                type="submit"
                className="w-full rounded-lg"
                disabled={isSubmitting}
              >
                {isSubmitting ? "Confirming..." : "Confirm Booking"}
              </Button>
            </AnimatedContainer>
          </form>
        </Form>
      ) : (
        <div className="text-center">
          <Button
            className="w-full rounded-lg"
            onClick={() => createRedirectSession(selectedSlot.entity)}
          >
            Checkout
          </Button>
        </div>
      )}
    </Panel>
  );
};

export default BookingForm;