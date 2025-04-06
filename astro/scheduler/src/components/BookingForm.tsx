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
import { availabilityCalendar, services } from "@wix/bookings";
import { redirects } from "@wix/redirects";
import { createClient, OAuthStrategy } from "@wix/sdk";

interface BookingFormProps {
  selectedDate: Date | undefined;
  selectedSlot: any | null;
  className?: string;
}

const bookingFormSchema = z.object({
  name: z.string().min(2, { message: "Name must be at least 2 characters" }),
  email: z.string().email({ message: "Please enter a valid email address" }),
  phone: z.string().min(7, { message: "Please enter a valid phone number" }),
  notes: z.string().optional(),
});

type BookingFormValues = z.infer<typeof bookingFormSchema>;

const wixClient = createClient({
  modules: { services, availabilityCalendar, redirects },
  auth: OAuthStrategy({
    clientId: "30e9f47f-67ff-46b9-b9f0-bffcf702080d",
  }),
});

const BookingForm: React.FC<BookingFormProps> = ({
  selectedDate,
  selectedSlot,
  className,
}) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  const form = useForm<BookingFormValues>({
    // resolver: zodResolver(bookingFormSchema),
    defaultValues: {
      name: "",
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

    setIsSubmitting(true);

    const redirect = await wixClient.redirects.createRedirectSession({
      // We pass an object that specifies the slotAvailability for the bookingsCheckout.
      bookingsCheckout: {
        slotAvailability: selectedSlot.entity,
        timezone: "UTC",
      },
      // We also specify the postFlowUrl to be the current page URL. This is where the user will be redirected after the checkout flow.
      callbacks: { postFlowUrl: window.location.href },
    });

    setIsSubmitting(false);

    // Finally, we redirect the user to the URL generated by the redirect session.
    window.location = redirect.redirectSession.fullUrl;

    // // Simulate API call
    // setTimeout(() => {
    //   // Store booking data in session storage (in a real app, this would be sent to a server)
    //   const bookingData = {
    //     ...data,
    //     date: format(selectedDate, "yyyy-MM-dd"),
    //     time: selectedTime,
    //     displayDate: format(selectedDate, "MMMM d, yyyy"),
    //     displayTime: selectedTime,
    //   };

    //   sessionStorage.setItem("bookingData", JSON.stringify(bookingData));

    //   // Navigate to confirmation page
    //   window.location.href = "/confirmation";
    //   setIsSubmitting(false);
    // }, 1500);
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
      </div>
    </div>
  );
};

export default BookingForm;
