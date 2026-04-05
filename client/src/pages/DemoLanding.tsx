import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CheckCircle2, PlayCircle, ShieldCheck } from "lucide-react";
import { Link } from "wouter";
import { createPaypalCheckoutUrl } from "@/lib/paypal";
import { SubscriptionCheckoutButtons } from "@/components/SubscriptionCheckoutButtons";
import redcreaLogo from "@/assets/redcrea-logo.png";

export default function DemoLanding() {
  const professionalUrl = createPaypalCheckoutUrl("Profesional", "19.00");
  const enterpriseUrl = createPaypalCheckoutUrl("Empresarial", "49.00");

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 via-white to-emerald-50/40">
      <div className="mx-auto max-w-6xl px-4 py-10 md:py-14">
        <div className="text-center max-w-3xl mx-auto">
          <div className="mb-8 flex justify-center">
            <img
              src={redcreaLogo}
              alt="RedCrea24"
              className="h-24 w-auto md:h-32 object-contain drop-shadow-[0_10px_30px_rgba(15,23,42,0.12)]"
            />
          </div>
          <Badge className="bg-emerald-600 hover:bg-emerald-600 text-white mb-4">
            PRUEBA LA PLATAFORMA
          </Badge>
          <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight text-slate-900">
            Control Horario Empresarial PRO
          </h1>
          <p className="mt-4 text-lg md:text-xl text-slate-600">
            Descubre una forma mas sencilla de gestionar fichajes, empleados, vacaciones e informes
            desde una unica plataforma. Cuando quieras dar el paso, puedes suscribirte al instante con Stripe o PayPal.
          </p>

          <div className="mt-8 flex flex-col sm:flex-row justify-center gap-3">
            <Button asChild size="lg" className="bg-slate-900 text-white hover:bg-slate-800">
              <Link href="/demo-app">
                <PlayCircle className="w-5 h-5 mr-2" />
                Ver Demo Interactiva
              </Link>
            </Button>
            <div className="w-full max-w-sm">
              <SubscriptionCheckoutButtons
                planName="Profesional"
                paypalHref={professionalUrl}
                returnPath="/demo"
                primaryVariant="outline"
              />
            </div>
          </div>
        </div>

        <div className="mt-12 grid gap-6 md:grid-cols-3">
          <Card className="border-l-4 border-l-emerald-500">
            <CardHeader>
              <CardTitle>Experiencia Real de la Plataforma</CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-slate-600">
              Explora una vista completa de la aplicacion y comprueba como seria el trabajo diario de tu empresa dentro del sistema.
            </CardContent>
          </Card>

          <Card className="border-l-4 border-l-blue-500">
            <CardHeader>
              <CardTitle>Planes Claros y Contratacion Inmediata</CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-slate-600 space-y-3">
              <div className="font-semibold text-slate-800">Plan Profesional 19 EUR/mes</div>
              <div className="font-semibold text-slate-800">Plan Empresarial 49 EUR/mes</div>
              <p>Elige el plan que mejor encaje con tu empresa y completa la suscripcion mensual de forma segura con Stripe o PayPal.</p>
            </CardContent>
          </Card>

          <Card className="border-l-4 border-l-orange-500">
            <CardHeader>
              <CardTitle>Rapidez, Seguridad y Comodidad</CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-slate-600">
              <div className="flex items-start gap-2 mb-2">
                <CheckCircle2 className="w-4 h-4 mt-0.5 text-orange-500" />
                <span>Interfaz clara, intuitiva y preparada para empezar desde el primer dia.</span>
              </div>
              <div className="flex items-start gap-2">
                <ShieldCheck className="w-4 h-4 mt-0.5 text-orange-500" />
                <span>Proceso de pago seguro y activacion inmediata para acceder a tu cuenta.</span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
