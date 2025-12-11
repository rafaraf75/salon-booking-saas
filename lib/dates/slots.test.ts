import { generateDailySlots } from "./slots";

describe("generateDailySlots", () => {
  const openingHours = [
    { weekday: 0, open_time: "09:00", close_time: "17:00", is_closed: false }, // Monday
    { weekday: 1, open_time: "09:00", close_time: "17:00", is_closed: false },
    { weekday: 2, open_time: "09:00", close_time: "17:00", is_closed: false },
    { weekday: 3, open_time: "09:00", close_time: "17:00", is_closed: false },
    { weekday: 4, open_time: "09:00", close_time: "17:00", is_closed: false },
    { weekday: 5, open_time: null, close_time: null, is_closed: true },
    { weekday: 6, open_time: null, close_time: null, is_closed: true },
  ];

  it("generates slots for open day", () => {
    const slots = generateDailySlots({
      date: "2025-12-08", // Monday
      openingHours,
    });
    expect(slots[0]).toBe("09:00");
    expect(slots[slots.length - 1]).toBe("16:30");
  });

  it("returns empty for closed day", () => {
    const slots = generateDailySlots({
      date: "2025-12-13", // Saturday mapped to weekday 5 => closed
      openingHours,
    });
    expect(slots).toHaveLength(0);
  });

  it("returns empty for day in closedDays", () => {
    const slots = generateDailySlots({
      date: "2025-12-09",
      openingHours,
      closedDays: [{ date: "2025-12-09" }],
    });
    expect(slots).toHaveLength(0);
  });
});
