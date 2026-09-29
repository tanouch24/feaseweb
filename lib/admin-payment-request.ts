export function canRequestPayment(input: {
  appointmentStatus?: string | null;
  validationStatus?: string | null;
  prospectStatus?: string | null;
  paymentConfirmed: boolean;
}) {
  return input.appointmentStatus === "completed"
    && input.validationStatus !== "approved"
    && input.prospectStatus !== "perdu"
    && !input.paymentConfirmed;
}
