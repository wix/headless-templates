/**
 * Event-related utility functions for the application
 */
import { dispatchCustomEvent } from "./dom-utils";
import type { TimeSlot, BookingData } from "./booking-service";

/**
 * Event names used throughout the application
 */
export const EVENT_NAMES = {
  DATE_SELECTED: "dateSelected",
  TIME_SLOT_SELECTED: "timeSlotSelected",
  SESSION_TYPE_CHANGED: "sessionTypeChanged",
  BOOKING_COMPLETED: "bookingCompleted",
  BOOKING_FAILED: "bookingFailed",
};

/**
 * Types for custom events
 */
export interface DateSelectedEvent {
  date: Date;
}

export interface TimeSlotSelectedEvent {
  slot: TimeSlot;
}

export interface SessionTypeChangedEvent {
  type: "free" | "premium";
}

export interface BookingCompletedEvent {
  bookingData: BookingData;
}

export interface BookingFailedEvent {
  error: Error | unknown;
}

/**
 * Dispatch date selection event
 */
export function dispatchDateSelected(date: Date): void {
  dispatchCustomEvent<DateSelectedEvent>(EVENT_NAMES.DATE_SELECTED, { date });
}

/**
 * Dispatch time slot selection event
 */
export function dispatchTimeSlotSelected(slot: TimeSlot): void {
  dispatchCustomEvent<TimeSlotSelectedEvent>(EVENT_NAMES.TIME_SLOT_SELECTED, {
    slot,
  });
}

/**
 * Dispatch session type change event
 */
export function dispatchSessionTypeChanged(type: "free" | "premium"): void {
  dispatchCustomEvent<SessionTypeChangedEvent>(
    EVENT_NAMES.SESSION_TYPE_CHANGED,
    { type }
  );
}

/**
 * Dispatch booking completed event
 */
export function dispatchBookingCompleted(bookingData: BookingData): void {
  dispatchCustomEvent<BookingCompletedEvent>(EVENT_NAMES.BOOKING_COMPLETED, {
    bookingData,
  });
}

/**
 * Dispatch booking failed event
 */
export function dispatchBookingFailed(error: Error | unknown): void {
  dispatchCustomEvent<BookingFailedEvent>(EVENT_NAMES.BOOKING_FAILED, {
    error,
  });
}

/**
 * Register date selection event listener
 */
export function onDateSelected(callback: (date: Date) => void): () => void {
  const handler = (event: CustomEvent<DateSelectedEvent>) => {
    callback(event.detail.date);
  };

  document.addEventListener(
    EVENT_NAMES.DATE_SELECTED,
    handler as EventListener
  );

  // Return cleanup function
  return () => {
    document.removeEventListener(
      EVENT_NAMES.DATE_SELECTED,
      handler as EventListener
    );
  };
}

/**
 * Register time slot selection event listener
 */
export function onTimeSlotSelected(
  callback: (slot: TimeSlot) => void
): () => void {
  const handler = (event: CustomEvent<TimeSlotSelectedEvent>) => {
    callback(event.detail.slot);
  };

  document.addEventListener(
    EVENT_NAMES.TIME_SLOT_SELECTED,
    handler as EventListener
  );

  // Return cleanup function
  return () => {
    document.removeEventListener(
      EVENT_NAMES.TIME_SLOT_SELECTED,
      handler as EventListener
    );
  };
}

/**
 * Register session type change event listener
 */
export function onSessionTypeChanged(
  callback: (type: "free" | "premium") => void
): () => void {
  const handler = (event: CustomEvent<SessionTypeChangedEvent>) => {
    callback(event.detail.type);
  };

  document.addEventListener(
    EVENT_NAMES.SESSION_TYPE_CHANGED,
    handler as EventListener
  );

  // Return cleanup function
  return () => {
    document.removeEventListener(
      EVENT_NAMES.SESSION_TYPE_CHANGED,
      handler as EventListener
    );
  };
}
