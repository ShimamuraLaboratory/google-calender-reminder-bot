export abstract class BaseHandler {
  protected abstract validateDates(startAt: string, endAt: string): void;
}
