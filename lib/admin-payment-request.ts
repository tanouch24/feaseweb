export function canRequestPayment(input: {
  validationStatus?: string | null;
  prospectStatus?: string | null;
  paymentConfirmed: boolean;
}) {
  return input.validationStatus !== "approved"
    && input.prospectStatus !== "perdu"
    && !input.paymentConfirmed;
}
