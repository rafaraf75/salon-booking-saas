type EmailType = "created" | "updated" | "cancelled";

type AppointmentEmailPayload = {
  to: string;
  clientName?: string | null;
  serviceName?: string | null;
  startAt: string;
  locale?: "es" | "pl" | "en";
};

/**
 * Mock wysyłki e-maili. W produkcji podłącz tu provider (Resend/SMTP).
 */
export async function sendAppointmentEmail(
  type: EmailType,
  payload: AppointmentEmailPayload,
) {
  // eslint-disable-next-line no-console
  console.log("[email]", type, payload);
  return { ok: true };
}
