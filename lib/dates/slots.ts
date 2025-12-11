import { addMinutes, format, isBefore, parseISO } from "date-fns";

type OpeningHour = {
  weekday: number; // 0-6
  open_time: string | null; // "HH:mm"
  close_time: string | null; // "HH:mm"
  is_closed: boolean;
};

type ClosedDay = {
  date: string; // "YYYY-MM-DD"
};

export function generateDailySlots(args: {
  date: string; // ISO date YYYY-MM-DD
  openingHours: OpeningHour[];
  closedDays?: ClosedDay[];
}): string[] {
  const { date, openingHours, closedDays = [] } = args;
  const weekday = new Date(date).getDay(); // 0 Sunday ... 6 Saturday
  const isClosedDay = closedDays.some((d) => d.date === date);
  if (isClosedDay) return [];

  // Map Sunday (0) to 6 for our 0=Mon style if needed
  const mappedWeekday = weekday === 0 ? 6 : weekday - 1;
  const oh = openingHours.find((o) => o.weekday === mappedWeekday);

  if (!oh || oh.is_closed || !oh.open_time || !oh.close_time) {
    return [];
  }

  const start = parseISO(`${date}T${oh.open_time}:00`);
  const end = parseISO(`${date}T${oh.close_time}:00`);
  if (!isBefore(start, end)) {
    return [];
  }

  const slots: string[] = [];
  let cursor = start;
  while (isBefore(cursor, end)) {
    slots.push(format(cursor, "HH:mm"));
    cursor = addMinutes(cursor, 30);
  }
  return slots;
}
