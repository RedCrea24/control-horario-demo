import { apiRequest } from "@/lib/queryClient";

type StripeCheckoutPayload = {
  planName: string;
  successPath?: string;
  cancelPath?: string;
};

type StripeCheckoutResponse = {
  url: string;
};

export async function createStripeCheckoutSession(
  payload: StripeCheckoutPayload,
): Promise<string> {
  const response = await apiRequest(
    "POST",
    "/api/billing/stripe-checkout",
    payload,
  );
  const data = (await response.json()) as StripeCheckoutResponse;

  if (!data.url) {
    throw new Error("Stripe no devolvio una URL de pago valida.");
  }

  return data.url;
}
