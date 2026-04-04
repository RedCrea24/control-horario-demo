import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Check, X, Play } from "lucide-react";
import { Link } from "wouter";
import { createPaypalCheckoutUrl } from "@/lib/paypal";
import { SubscriptionCheckoutButtons } from "@/components/SubscriptionCheckoutButtons";

const plans = [
  {
    name: "Gratuito",
    price: "0€",
    period: "mes",
    description: "Ideal para pequeñas empresas o pruebas",
    features: [
      { name: "Hasta 5 empleados", included: true },
      { name: "Registro de horas básico", included: true },
      { name: "Informes simples", included: true },
      { name: "Soporte por email", included: true },
      { name: "Integraciones avanzadas", included: false },
      { name: "Gestión de vacaciones", included: false },
      { name: "Análisis avanzado", included: false },
    ],
    buttonText: "Empezar gratis",
    popular: false,
    href: "/demo-app",
    external: false,
  },
  {
    name: "Profesional",
    price: "19€",
    period: "mes",
    description: "Para empresas en crecimiento",
    features: [
      { name: "Hasta 50 empleados", included: true },
      { name: "Registro de horas avanzado", included: true },
      { name: "Informes detallados", included: true },
      { name: "Soporte prioritario", included: true },
      { name: "Integraciones avanzadas", included: true },
      { name: "Gestión de vacaciones", included: true },
      { name: "Análisis avanzado", included: false },
    ],
    popular: true,
    paypalHref: createPaypalCheckoutUrl("Profesional", "19.00"),
  },
  {
    name: "Empresarial",
    price: "49€",
    period: "mes",
    description: "Para grandes organizaciones",
    features: [
      { name: "Empleados ilimitados", included: true },
      { name: "Registro de horas completo", included: true },
      { name: "Informes personalizados", included: true },
      { name: "Soporte 24/7", included: true },
      { name: "Integraciones avanzadas", included: true },
      { name: "Gestión de vacaciones", included: true },
      { name: "Análisis avanzado", included: true },
    ],
    popular: false,
    paypalHref: createPaypalCheckoutUrl("Empresarial", "49.00"),
  },
];

export default function Pricing() {
  return (
    <div className="container mx-auto py-8 px-4">
      <div className="text-center mb-12">
        <div className="bg-primary/10 rounded-lg p-6 mb-8">
          <h2 className="text-2xl font-bold mb-2">¡Prueba nuestra Demo Interactiva!</h2>
          <p className="text-muted-foreground mb-4">
            Explora todas las funcionalidades sin límites de tiempo. La versión demo te permite navegar por la aplicación y ver cómo funciona.
          </p>
          <Link href="/demo-app">
            <Button size="lg" className="bg-primary hover:bg-primary/90">
              <Play className="w-5 h-5 mr-2" />
              Probar Demo Ahora
            </Button>
          </Link>
        </div>
        <h1 className="text-4xl font-bold mb-4">Planes de Precios</h1>
        <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
          Elige el plan perfecto para digitalizar el control horario de tu empresa.
          Todos los planes incluyen actualizaciones gratuitas y seguridad de datos.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
        {plans.map((plan) => (
          <Card key={plan.name} className={`relative ${plan.popular ? 'border-primary shadow-lg' : ''}`}>
            {plan.popular && (
              <Badge className="absolute -top-3 left-1/2 transform -translate-x-1/2 bg-primary">
                Más popular
              </Badge>
            )}
            <CardHeader className="text-center">
              <CardTitle className="text-2xl">{plan.name}</CardTitle>
              <CardDescription>{plan.description}</CardDescription>
              <div className="mt-4">
                <span className="text-4xl font-bold">{plan.price}</span>
                <span className="text-muted-foreground">/{plan.period}</span>
              </div>
            </CardHeader>
            <CardContent>
              <ul className="space-y-3">
                {plan.features.map((feature, index) => (
                  <li key={index} className="flex items-center">
                    {feature.included ? (
                      <Check className="h-5 w-5 text-green-500 mr-3 flex-shrink-0" />
                    ) : (
                      <X className="h-5 w-5 text-red-500 mr-3 flex-shrink-0" />
                    )}
                    <span className={feature.included ? '' : 'text-muted-foreground line-through'}>
                      {feature.name}
                    </span>
                  </li>
                ))}
              </ul>
            </CardContent>
            <CardFooter>
              {"paypalHref" in plan ? (
                <SubscriptionCheckoutButtons
                  planName={plan.name}
                  paypalHref={plan.paypalHref}
                  returnPath="/precios"
                  primaryVariant={plan.popular ? "default" : "outline"}
                />
              ) : (
                <Button asChild className="w-full" variant={plan.popular ? 'default' : 'outline'}>
                  <Link href={plan.href}>{plan.buttonText}</Link>
                </Button>
              )}
            </CardFooter>
          </Card>
        ))}
      </div>

      <div className="text-center mt-12">
        <h2 className="text-2xl font-semibold mb-4">Formas de Pago Aceptadas</h2>
        <div className="flex justify-center items-center space-x-8">
          <div className="flex items-center space-x-2">
            <span className="text-2xl">💳</span>
            <span>Stripe y Tarjeta</span>
          </div>
          <div className="flex items-center space-x-2">
            <span className="text-2xl">🅿️</span>
            <span>PayPal</span>
          </div>
          <div className="flex items-center space-x-2">
            <span className="text-2xl">🏦</span>
            <span>Transferencia Bancaria</span>
          </div>
        </div>
        <p className="text-muted-foreground mt-4">
          Puedes suscribirte con Stripe o PayPal. Todas las transacciones son seguras y protegidas.
        </p>
        <p className="text-sm text-muted-foreground mt-3">
          Si ya has comprado, puedes <Link href="/activar"><span className="text-primary cursor-pointer font-medium">activar tu cuenta</span></Link> o <Link href="/acceso"><span className="text-primary cursor-pointer font-medium">acceder aqui</span></Link>.
        </p>
      </div>
    </div>
  );
}
