import type google from "googleapis";

export interface IGoogleCalendarClient {
  saveCredentials(): Promise<void>;
  loadCredentials(): Promise<void>;
  authorize(apiKey: string): Promise<void>;
  fetchCalendar(): Promise<google.calendar_v3.Schema$Calendar>;
  fetchEvents(): Promise<google.calendar_v3.Schema$Event[]>;
  fetchEvent(eventId: string): Promise<google.calendar_v3.Schema$Event>;
  createEvent(
    event: google.calendar_v3.Schema$Event,
  ): Promise<google.calendar_v3.Schema$Event>;
  updateEvent(
    eventId: string,
    event: google.calendar_v3.Schema$Event,
  ): Promise<google.calendar_v3.Schema$Event>;
  deleteEvent(eventId: string): Promise<void>;
}
