/**
 * Event-related utility functions for the application
 */
import { dispatchCustomEvent } from './dom-utils';

/**
 * Event names used throughout the application
 */
export const EVENT_NAMES = {
  DATE_SELECTED: 'dateSelected',
  TIME_SLOT_SELECTED: 'timeSlotSelected',
  SESSION_TYPE_CHANGED: 'sessionTypeChanged',
  BOOKING_COMPLETED: 'bookingCompleted',
  BOOKING_FAILED: 'bookingFailed',
};

/**
 * Dispatch date selection event
 */
export function dispatchDateSelected(date: Date): void {
  dispatchCustomEvent(EVENT_NAMES.DATE_SELECTED, { date });
}

/**
 * Dispatch time slot selection event
 */
export function dispatchTimeSlotSelected(slot: any): void {
  dispatchCustomEvent(EVENT_NAMES.TIME_SLOT_SELECTED, { slot });
}

/**
 * Dispatch session type change event
 */
export function dispatchSessionTypeChanged(type: 'free' | 'premium'): void {
  dispatchCustomEvent(EVENT_NAMES.SESSION_TYPE_CHANGED, { type });
}

/**
 * Dispatch booking completed event
 */
export function dispatchBookingCompleted(bookingData: any): void {
  dispatchCustomEvent(EVENT_NAMES.BOOKING_COMPLETED, { bookingData });
}

/**
 * Dispatch booking failed event
 */
export function dispatchBookingFailed(error: any): void {
  dispatchCustomEvent(EVENT_NAMES.BOOKING_FAILED, { error });
}

/**
 * Register date selection event listener
 */
export function onDateSelected(callback: (date: Date) => void): () => void {
  const handler = (event: any) => {
    callback(event.detail.date);
  };
  
  document.addEventListener(EVENT_NAMES.DATE_SELECTED, handler);
  
  // Return cleanup function
  return () => {
    document.removeEventListener(EVENT_NAMES.DATE_SELECTED, handler);
  };
}

/**
 * Register time slot selection event listener
 */
export function onTimeSlotSelected(callback: (slot: any) => void): () => void {
  const handler = (event: any) => {
    callback(event.detail.slot);
  };
  
  document.addEventListener(EVENT_NAMES.TIME_SLOT_SELECTED, handler);
  
  // Return cleanup function
  return () => {
    document.removeEventListener(EVENT_NAMES.TIME_SLOT_SELECTED, handler);
  };
}

/**
 * Register session type change event listener
 */
export function onSessionTypeChanged(callback: (type: 'free' | 'premium') => void): () => void {
  const handler = (event: any) => {
    callback(event.detail.type);
  };
  
  document.addEventListener(EVENT_NAMES.SESSION_TYPE_CHANGED, handler);
  
  // Return cleanup function
  return () => {
    document.removeEventListener(EVENT_NAMES.SESSION_TYPE_CHANGED, handler);
  };
}