import { useEffect, useState } from "react";
import { CreditCard, LoaderCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { createStripeCheckoutSession } from "@/lib/stripe";
import { useToast } from "@/hooks/use-toast";

type SubscriptionCheckoutButtonsProps = {
  planName: string;
  paypalHref: string;
  returnPath?: string;
  primaryVariant?: "default" | "outline";
};

export function SubscriptionCheckoutButtons({
  planName,
  paypalHref,
  returnPath = "/precios",
  primaryVariant = "default",
}: SubscriptionCheckoutButtonsProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [isStripeAvailable, setIsStripeAvailable] = useState(true);
  const [isCheckingAvailability, setIsCheckingAvailability] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    let isMounted = true;

    async function loadBillingConfig() {
      try {
        const response = await fetch("/api/billing/config", {
          credentials: "include",
        });

        if (!response.ok) {
          throw new Error("No se pudo comprobar la disponibilidad de Stripe.");
        }

        const data = (await response.json()) as { stripeEnabled?: boolean };

        if (isMounted) {
          setIsStripeAvailable(Boolean(data.stripeEnabled));
        }
      } catch {
        if (isMounted) {
          setIsStripeAvailable(false);
        }
      } finally {
        if (isMounted) {
          setIsCheckingAvailability(false);
        }
      }
    }

    loadBillingConfig();

    return () => {
      isMounted = false;
    };
  }, []);

  const handleStripeCheckout = async () => {
    if (!isStripeAvailable) {
      toast({
        title: "Stripe pendiente de configurar",
        description:
          "Ahora mismo este metodo de pago no esta activo. Puedes continuar con PayPal.",
        variant: "destructive",
      });
      return;
    }

    try {
      setIsLoading(true);

      const checkoutUrl = await createStripeCheckoutSession({
        planName,
        successPath: "/activar?session_id={CHECKOUT_SESSION_ID}",
        cancelPath: returnPath,
      });

      window.location.assign(checkoutUrl);
    } catch (error) {
      const description =
        error instanceof Error
          ? error.message.replace(/^\d+:\s*/, "")
          : "No se pudo iniciar el pago con Stripe.";

      toast({
        title: "Stripe no esta disponible",
        description,
        variant: "destructive",
      });
      setIsLoading(false);
    }
  };

  return (
    <div className="grid w-full gap-3">
      <Button
        className="w-full allow-demo-click"
        variant={primaryVariant}
        onClick={handleStripeCheckout}
        disabled={isLoading || isCheckingAvailability || !isStripeAvailable}
        title={
          !isStripeAvailable
            ? "Stripe aun no esta configurado en este entorno."
            : undefined
        }
      >
        {isLoading || isCheckingAvailability ? (
          <LoaderCircle className="animate-spin" />
        ) : (
          <CreditCard />
        )}
        {isCheckingAvailability
          ? "Comprobando Stripe..."
          : isStripeAvailable
            ? "Suscribirse con Stripe"
            : "Stripe no disponible"}
      </Button>

      <Button asChild className="w-full allow-demo-click" variant="outline">
        <a
          href={paypalHref}
          target="_blank"
          rel="noopener noreferrer"
          className="allow-demo-click"
        >
          Continuar con PayPal
        </a>
      </Button>
    </div>
  );
}
