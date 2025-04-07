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
import { useToast } from "../hooks/use-toast";
import AnimatedContainer from "./shared/AnimatedContainer";
import { useWixClient } from "../hooks/use-wix-client";

interface BookingFormProps {
  sessionType: "free" | "premium";
  selectedDate: Date | undefined;
  selectedSlot: any | null;
  className?: string;
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
  sessionType,
  selectedDate,
  selectedSlot,
  className,
}) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();
  const wixClient = useWixClient();

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

  const onSubmit = async (data: BookingFormValues) => {
    if (!selectedDate || !selectedSlot) {
      toast({
        title: "Error",
        description: "Please select both a date and time",
        variant: "destructive",
      });
      return;
    }

    try {
      const booking = await wixClient.bookings.createBooking({
        bookedEntity: selectedSlot.entity,
        totalParticipants: 1,
        contactDetails: {
          firstName: data.name.split(" ")[0],
          lastName: data.name.split(" ")[1] || "",
          fullAddress: {
            addressLine: data.address,
          },
          email: data.email,
          phone: data.phone,
        },
        // status: bookings.BookingStatus.CONFIRMED,
      });

      const bookingData = {
        ...data,
        date: format(selectedDate, "yyyy-MM-dd"),
        time: selectedSlot.time,
        displayDate: format(selectedDate, "MMMM d, yyyy"),
        displayTime: selectedSlot.display,
      };
      sessionStorage.setItem("bookingData", JSON.stringify(bookingData));
      window.location.href = `/confirmation`;
    } catch (error) {
      console.error("Error creating booking:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const createRedirect = async (slot: any) => {
    const redirect = await wixClient.redirects.createRedirectSession({
      bookingsCheckout: { slotAvailability: slot, timezone: "UTC" },
      callbacks: { postFlowUrl: window.location.href },
    });
    window.location.href = redirect.redirectSession!.fullUrl;
  };

  if (!selectedDate || !selectedSlot) {
    return (
      <div className={cn("glass-panel p-6 text-center", className)}>
        <CalendarClock className="w-6 h-6 mx-auto mb-2 text-muted-foreground" />
        <p className="text-sm text-muted-foreground">
          Please select both a date and time to proceed with booking
        </p>
      </div>
    );
  }

  return (
    <div className={cn("glass-panel", className)}>
      <div className="p-6">
        <AnimatedContainer animation="fade-up">
          <h3 className="text-base font-medium mb-4">Complete Your Booking</h3>
        </AnimatedContainer>

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
              onClick={() => createRedirect(selectedSlot.entity)}
            >
              Checkout
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};

export default BookingForm;
