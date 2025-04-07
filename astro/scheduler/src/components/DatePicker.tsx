import * as React from "react";
import { format } from "date-fns";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "../lib/utils";
import { Calendar } from "./ui/calendar";

interface DatePickerProps {
  date: Date | undefined;
  setDate: (date: Date | undefined) => void;
  className?: string;
}

const DatePicker: React.FC<DatePickerProps> = ({ date, setDate, className }) => {
  const today = new Date();
  const futureDate = new Date();
  futureDate.setDate(today.getDate() + 60); // Allow booking 60 days ahead

  return (
    <div className={cn(className)}>
      <div className="mb-4 text-center">
        <p className="text-sm font-medium text-muted-foreground">
          Select a date for your appointment
        </p>
      </div>
      <Calendar
        mode="single"
        selected={date}
        onSelect={setDate}
        disabled={(date) => date < today || date > futureDate}
        initialFocus
        className={cn("p-3 pointer-events-auto rounded-lg")}
        components={{
          IconLeft: () => <ChevronLeft className="h-4 w-4" />,
          IconRight: () => <ChevronRight className="h-4 w-4" />,
        }}
      />
      {date && (
        <div className="mt-4 text-center animate-slideUp">
          <p className="text-sm font-medium text-foreground">
            Selected: <span className="font-bold">{format(date, "PPP")}</span>
          </p>
        </div>
      )}
    </div>
  );
};

export default DatePicker;