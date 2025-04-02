import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { format } from "date-fns";
import { cn } from "../lib/utils";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { Button } from "../components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "../components/ui/form";
import { Input } from "../components/ui/input";
import { Textarea } from "../components/ui/textarea";
import { CalendarClock } from "lucide-react";
import { useToast } from "../hooks/use-toast";
import AnimatedContainer from "./shared/AnimatedContainer";

interface BookingFormProps {
  selectedDate: Date | undefined;
  selectedTime: string | null;
  className?: string;
}

const bookingFormSchema = z.object({
  name: z.string().min(2, { message: "Name must be at least 2 characters" }),
  email: z.string().email({ message: "Please enter a valid email address" }),
  phone: z.string().min(7, { message: "Please enter a valid phone number" }),
  notes: z.string().optional(),
});

type BookingFormValues = z.infer<typeof bookingFormSchema>;

const BookingForm: React.FC<BookingFormProps> = ({
  selectedDate,
  selectedTime,
  className,
}) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  const form = useForm<BookingFormValues>({
    resolver: zodResolver(bookingFormSchema),
    defaultValues: {
      name: "",
      email: "",
      phone: "",
      notes: "",
    },
  });

  const onSubmit = (data: BookingFormValues) => {
    if (!selectedDate || !selectedTime) {
      toast({
        title: "Error",
        description: "Please select both a date and time",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);

    // Simulate API call
    setTimeout(() => {
      // Store booking data in session storage (in a real app, this would be sent to a server)
      const bookingData = {
        ...data,
        date: format(selectedDate, "yyyy-MM-dd"),
        time: selectedTime,
        displayDate: format(selectedDate, "MMMM d, yyyy"),
        displayTime: selectedTime,
      };

      sessionStorage.setItem("bookingData", JSON.stringify(bookingData));

      // Navigate to confirmation page
      navigate("/confirmation");
      setIsSubmitting(false);
    }, 1500);
  };

  if (!selectedDate || !selectedTime) {
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
              {selectedTime}
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
