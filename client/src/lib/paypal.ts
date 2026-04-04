const DEFAULT_PAYPAL_BUSINESS_EMAIL = "info@redcrea24.es";

export const PAYPAL_BUSINESS_EMAIL =
  import.meta.env.VITE_PAYPAL_BUSINESS_EMAIL?.trim() ||
  DEFAULT_PAYPAL_BUSINESS_EMAIL;

const PAYPAL_LINK_PROFESIONAL = import.meta.env.VITE_PAYPAL_LINK_PROFESIONAL?.trim();
const PAYPAL_LINK_EMPRESARIAL = import.meta.env.VITE_PAYPAL_LINK_EMPRESARIAL?.trim();

const getCustomPlanLink = (planName: string) => {
  const normalized = planName.toLowerCase();
  if (normalized === "profesional") return PAYPAL_LINK_PROFESIONAL;
  if (normalized === "empresarial") return PAYPAL_LINK_EMPRESARIAL;
  return undefined;
};

export const createPaypalCheckoutUrl = (planName: string, amount?: string) => {
  const customPlanLink = getCustomPlanLink(planName);
  if (customPlanLink) {
    return customPlanLink;
  }

  const params = new URLSearchParams({
    cmd: "_xclick",
    business: PAYPAL_BUSINESS_EMAIL,
    item_name: `Control Horario Empresarial PRO - ${planName}`,
    currency_code: "EUR",
  });

  if (amount) {
    params.set("amount", amount);
  }

  return `https://www.paypal.com/cgi-bin/webscr?${params.toString()}`;
};
