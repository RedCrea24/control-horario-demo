import type { Express, Request, Response } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { customerStorage, type PlanName } from "./customer-storage";

const STRIPE_SECRET_KEY = process.env.STRIPE_SECRET_KEY?.trim();
const STRIPE_WEBHOOK_SECRET = process.env.STRIPE_WEBHOOK_SECRET?.trim();
const STRIPE_PRICE_IDS: Record<string, string | undefined> = {
  Profesional: process.env.STRIPE_PRICE_ID_PROFESIONAL?.trim(),
  Empresarial: process.env.STRIPE_PRICE_ID_EMPRESARIAL?.trim(),
};

function isStripeConfigured() {
  return Boolean(
    STRIPE_SECRET_KEY &&
      STRIPE_PRICE_IDS.Profesional &&
      STRIPE_PRICE_IDS.Empresarial,
  );
}

function getAppBaseUrl(req: Request) {
  const origin = req.get("origin");
  if (origin) {
    return origin.replace(/\/$/, "");
  }

  const protocol = (req.get("x-forwarded-proto") || req.protocol || "https")
    .split(",")[0]
    .trim();
  const host = (req.get("x-forwarded-host") || req.get("host") || "localhost:5001")
    .split(",")[0]
    .trim();

  return `${protocol}://${host}`;
}

function getAbsoluteReturnUrl(baseUrl: string, path: string) {
  return new URL(path.startsWith("/") ? path : `/${path}`, baseUrl).toString();
}

function getPlanNameFromMetadata(value: unknown): PlanName | undefined {
  return value === "Profesional" || value === "Empresarial" ? value : undefined;
}

async function resolveStripePriceId(planName: string) {
  const configuredId = STRIPE_PRICE_IDS[planName];

  if (!configuredId) {
    return undefined;
  }

  if (configuredId.startsWith("price_")) {
    return configuredId;
  }

  if (!configuredId.startsWith("prod_") || !STRIPE_SECRET_KEY) {
    return undefined;
  }

  const productResponse = await fetch(
    `https://api.stripe.com/v1/products/${configuredId}?expand[]=default_price`,
    {
      headers: {
        Authorization: `Bearer ${STRIPE_SECRET_KEY}`,
      },
    },
  );

  const productData = await productResponse.json();

  if (!productResponse.ok) {
    const stripeMessage =
      typeof productData?.error?.message === "string"
        ? productData.error.message
        : `Stripe no pudo resolver el producto del plan ${planName}.`;
    throw new Error(stripeMessage);
  }

  const defaultPrice = productData?.default_price;

  if (typeof defaultPrice === "string" && defaultPrice.startsWith("price_")) {
    return defaultPrice;
  }

  if (
    typeof defaultPrice?.id === "string" &&
    defaultPrice.id.startsWith("price_")
  ) {
    return defaultPrice.id;
  }

  return undefined;
}

async function stripeApiRequest(
  endpoint: string,
  init?: RequestInit,
) {
  if (!STRIPE_SECRET_KEY) {
    throw new Error("Falta configurar STRIPE_SECRET_KEY en el servidor.");
  }

  const response = await fetch(`https://api.stripe.com/v1/${endpoint}`, {
    ...init,
    headers: {
      Authorization: `Bearer ${STRIPE_SECRET_KEY}`,
      ...(init?.headers || {}),
    },
  });
  const data = await response.json();

  if (!response.ok) {
    const stripeMessage =
      typeof data?.error?.message === "string"
        ? data.error.message
        : "Stripe devolvio un error inesperado.";
    throw new Error(stripeMessage);
  }

  return data;
}

async function storeCheckoutSession(sessionId: string) {
  const sessionData = await stripeApiRequest(
    `checkout/sessions/${sessionId}?expand[]=line_items.data.price.product&expand[]=customer&expand[]=subscription`,
  );

  const lineItem = sessionData?.line_items?.data?.[0];
  const price = lineItem?.price;
  const product = price?.product;
  const customerEmail =
    sessionData?.customer_details?.email ||
    sessionData?.customer_email ||
    sessionData?.customer?.email;
  const planName = getPlanNameFromMetadata(sessionData?.metadata?.plan_name);

  if (!customerEmail || !planName) {
    throw new Error("No se pudo identificar el correo o el plan de la compra.");
  }

  return customerStorage.upsertCheckoutSession({
    email: customerEmail,
    planName,
    stripeSessionId: sessionData.id,
    stripeCustomerId:
      typeof sessionData.customer === "string"
        ? sessionData.customer
        : sessionData.customer?.id,
    stripeSubscriptionId:
      typeof sessionData.subscription === "string"
        ? sessionData.subscription
        : sessionData.subscription?.id,
    stripeProductId:
      typeof product === "string" ? product : product?.id,
    stripePriceId: typeof price?.id === "string" ? price.id : undefined,
    stripePaymentStatus: sessionData.payment_status,
  });
}

async function verifyStripeWebhook(req: Request) {
  if (!STRIPE_WEBHOOK_SECRET) {
    throw new Error("Falta configurar STRIPE_WEBHOOK_SECRET.");
  }

  const signature = req.get("stripe-signature");
  if (!signature) {
    throw new Error("Falta la firma del webhook de Stripe.");
  }

  const rawBodyBuffer = Buffer.isBuffer(req.rawBody)
    ? req.rawBody
    : Buffer.from(String(req.rawBody || ""));
  const headerItems = Object.fromEntries(
    signature.split(",").map((entry) => {
      const [key, value] = entry.split("=");
      return [key, value];
    }),
  );

  const timestamp = headerItems.t;
  const signedPayload = headerItems.v1;

  if (!timestamp || !signedPayload) {
    throw new Error("La firma del webhook no es valida.");
  }

  const signedContent = `${timestamp}.${rawBodyBuffer.toString("utf8")}`;
  const crypto = await import("crypto");
  const expectedSignature = crypto
    .createHmac("sha256", STRIPE_WEBHOOK_SECRET)
    .update(signedContent)
    .digest("hex");

  if (expectedSignature !== signedPayload) {
    throw new Error("La firma del webhook de Stripe no coincide.");
  }

  return JSON.parse(rawBodyBuffer.toString("utf8"));
}

export async function registerRoutes(
  _httpServer: Server | undefined,
  app: Express
): Promise<void> {
  // put application routes here
  // prefix all routes with /api

  // use storage to perform CRUD operations on the storage interface
  // e.g. storage.insertUser(user) or storage.getUserByUsername(username)

  app.get("/api/billing/config", (_req: Request, res: Response) => {
    return res.json({
      stripeEnabled: isStripeConfigured(),
    });
  });

  app.get("/api/onboarding/session", async (req: Request, res: Response) => {
    const sessionId =
      typeof req.query.session_id === "string" ? req.query.session_id.trim() : "";

    if (!sessionId) {
      return res.status(400).json({ message: "Falta el identificador de sesion." });
    }

    try {
      const customer =
        customerStorage.getBySessionId(sessionId) || (await storeCheckoutSession(sessionId));

      return res.json({
        email: customer.email,
        planName: customer.planName,
        activationToken: customer.activationToken,
        status: customer.status,
        companyName: customer.companyName,
        adminName: customer.adminName,
        workspaceSeed: customer.workspaceSeed,
      });
    } catch (error) {
      return res.status(400).json({
        message:
          error instanceof Error ? error.message : "No se pudo validar la compra.",
      });
    }
  });

  app.post("/api/onboarding/activate", async (req: Request, res: Response) => {
    const activationToken =
      typeof req.body?.activationToken === "string"
        ? req.body.activationToken.trim()
        : "";
    const companyName =
      typeof req.body?.companyName === "string" ? req.body.companyName.trim() : "";
    const adminName =
      typeof req.body?.adminName === "string" ? req.body.adminName.trim() : "";
    const password =
      typeof req.body?.password === "string" ? req.body.password : "";

    if (!activationToken || !companyName || !adminName || password.length < 8) {
      return res.status(400).json({
        message:
          "Necesitas token de activacion, empresa, administrador y una contrasena de al menos 8 caracteres.",
      });
    }

    try {
      const customer = customerStorage.activateCustomer({
        activationToken,
        companyName,
        adminName,
        password,
      });

      return res.json({
        workspaceSeed: customer.workspaceSeed,
        email: customer.email,
        planName: customer.planName,
      });
    } catch (error) {
      return res.status(400).json({
        message:
          error instanceof Error ? error.message : "No se pudo activar la cuenta.",
      });
    }
  });

  app.post("/api/auth/login", async (req: Request, res: Response) => {
    const email = typeof req.body?.email === "string" ? req.body.email.trim() : "";
    const password = typeof req.body?.password === "string" ? req.body.password : "";

    if (!email || !password) {
      return res.status(400).json({ message: "Correo y contrasena son obligatorios." });
    }

    const customer = customerStorage.authenticateCustomer(email, password);
    if (!customer?.workspaceSeed) {
      return res.status(401).json({ message: "Acceso no valido." });
    }

    return res.json({
      workspaceSeed: customer.workspaceSeed,
      planName: customer.planName,
      companyName: customer.companyName,
    });
  });

  app.post("/api/billing/stripe-webhook", async (req: Request, res: Response) => {
    try {
      const event = await verifyStripeWebhook(req);

      if (event.type === "checkout.session.completed") {
        await storeCheckoutSession(event.data.object.id);
      }

      if (
        event.type === "customer.subscription.deleted" ||
        event.type === "customer.subscription.updated"
      ) {
        const subscription = event.data.object;
        if (subscription?.id) {
          customerStorage.updateSubscriptionStatus(
            subscription.id,
            subscription.status === "active" ? "active" : "canceled",
          );
        }
      }

      return res.json({ received: true });
    } catch (error) {
      return res.status(400).json({
        message:
          error instanceof Error ? error.message : "Webhook de Stripe no valido.",
      });
    }
  });

  app.post("/api/billing/stripe-checkout", async (req: Request, res: Response) => {
    const planName =
      typeof req.body?.planName === "string" ? req.body.planName.trim() : "";
    const successPath =
      typeof req.body?.successPath === "string" && req.body.successPath.trim()
        ? req.body.successPath.trim()
        : "/precios";
    const cancelPath =
      typeof req.body?.cancelPath === "string" && req.body.cancelPath.trim()
        ? req.body.cancelPath.trim()
        : successPath;

    if (!(planName in STRIPE_PRICE_IDS)) {
      return res.status(400).json({ message: "Plan de suscripcion no valido." });
    }

    if (!STRIPE_SECRET_KEY) {
      return res.status(500).json({
        message: "Falta configurar STRIPE_SECRET_KEY en el servidor.",
      });
    }

    const priceId = await resolveStripePriceId(planName);
    if (!priceId) {
      return res.status(500).json({
        message: `Falta configurar un precio activo de Stripe para el plan ${planName}.`,
      });
    }

    const baseUrl = getAppBaseUrl(req);
    const payload = new URLSearchParams({
      mode: "subscription",
      success_url: getAbsoluteReturnUrl(baseUrl, successPath),
      cancel_url: getAbsoluteReturnUrl(baseUrl, cancelPath),
      "line_items[0][price]": priceId,
      "line_items[0][quantity]": "1",
      "metadata[plan_name]": planName,
      allow_promotion_codes: "true",
      billing_address_collection: "auto",
    });

    const stripeData = await stripeApiRequest("checkout/sessions", {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: payload.toString(),
    });

    if (typeof stripeData?.url !== "string") {
      return res.status(500).json({
        message: "Stripe no devolvio una URL de checkout valida.",
      });
    }

    return res.json({ url: stripeData.url });
  });

}
