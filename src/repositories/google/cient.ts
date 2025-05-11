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

// TODO: google APIの設定が終わったら実装に着手 (2025/05/10)
export class GoogleCalendarClient implements IGoogleCalendarClient {
  saveCredentials(): Promise<void> {
    return Promise.resolve();
  }

  loadCredentials(): Promise<void> {
    return Promise.resolve();
  }

  authorize(apiKey: string): Promise<void> {
    return Promise.resolve();
  }

  fetchCalendar(): Promise<google.calendar_v3.Schema$Calendar> {
    return Promise.resolve({} as google.calendar_v3.Schema$Calendar);
  }

  fetchEvents(): Promise<google.calendar_v3.Schema$Event[]> {
    return Promise.resolve([] as google.calendar_v3.Schema$Event[]);
  }

  fetchEvent(eventId: string): Promise<google.calendar_v3.Schema$Event> {
    return Promise.resolve({} as google.calendar_v3.Schema$Event);
  }

  createEvent(
    event: google.calendar_v3.Schema$Event,
  ): Promise<google.calendar_v3.Schema$Event> {
    return Promise.resolve({} as google.calendar_v3.Schema$Event);
  }

  updateEvent(
    eventId: string,
    event: google.calendar_v3.Schema$Event,
  ): Promise<google.calendar_v3.Schema$Event> {
    return Promise.resolve({} as google.calendar_v3.Schema$Event);
  }

  deleteEvent(eventId: string): Promise<void> {
    return Promise.resolve();
  }
}
