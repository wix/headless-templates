/**
 * Custom events used to coordinate the scheduling components
 */
import type { TimeSlot } from "./booking-service";

/**
 * The service the visitor picked, identified by its real Wix service id
 */
export interface SelectedService {
  serviceId: string;
  requiresPayment: boolean;
}

function dispatch<T>(name: string, detail: T): void {
  document.dispatchEvent(new CustomEvent(name, { detail }));
}

function on<T>(name: string, callback: (detail: T) => void): void {
  document.addEventListener(name, (event) =>
    callback((event as CustomEvent<T>).detail)
  );
}

export const dispatchDateSelected = (date: Date) =>
  dispatch("dateSelected", date);
export const onDateSelected = (callback: (date: Date) => void) =>
  on<Date>("dateSelected", callback);

export const dispatchTimeSlotSelected = (slot: TimeSlot) =>
  dispatch("timeSlotSelected", slot);
export const onTimeSlotSelected = (callback: (slot: TimeSlot) => void) =>
  on<TimeSlot>("timeSlotSelected", callback);

export const dispatchServiceSelected = (service: SelectedService) =>
  dispatch("serviceSelected", service);
export const onServiceSelected = (callback: (service: SelectedService) => void) =>
  on<SelectedService>("serviceSelected", callback);
