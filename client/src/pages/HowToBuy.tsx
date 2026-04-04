import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { MessageCircle, CheckCircle2, ArrowRight, BarChart3, Users, Zap, Shield, Clock } from "lucide-react";
import { Link } from "wouter";

export default function HowToBuy() {
  const steps = [
    {
      number: 1,
      title: "Explora la Demo",
      description: "Accede a nuestra versión de demostración gratuita y prueba todas las funcionalidades sin compromiso.",
      icon: Zap,
      action: "Probar Demo",
      link: "/demo-app"
    },
    {
      number: 2,
      title: "Elige tu Plan",
      description: "Selecciona el plan que mejor se adapta a las necesidades de tu empresa (Gratuito, Profesional o Empresarial).",
      icon: BarChart3,
      action: "Ver Precios",
      link: "/precios"
    },
    {
      number: 3,
      title: "Regístrate",
      description: "Crea tu cuenta con tus datos empresariales. Recibirás acceso inmediato a la plataforma.",
      icon: Users,
      isDone: false
    },
    {
      number: 4,
      title: "Realiza el Pago",
      description: "Elige entre Tarjeta de Crédito, PayPal o Transferencia Bancaria. Tu transacción es 100% segura.",
      icon: Shield,
      isDone: false
    },
    {
      number: 5,
      title: "Importa tu Equipo",
      description: "Añade los empleados de tu empresa y comienza a registrar jornadas al instante.",
      icon: Users,
      isDone: false
    },
    {
      number: 6,
      title: "Empeza a Usar",
      description: "¡Listo! Tu equipo puede comenzar a usar Control Horario PRO desde ese momento.",
      icon: Clock,
      isDone: false
    }
  ];

  const benefits = [
    {
      title: "Acceso Inmediato",
      description: "No hay esperas. Comienza a usar la aplicación en el mismo día de tu compra.",
      icon: "⚡"
    },
    {
      title: "Soporte Dedicado",
      description: "Nuestro equipo te ayuda en la instalación y durante toda la implantación.",
      icon: "🤝"
    },
    {
      title: "30 días de Garantía",
      description: "Si no estás satisfecho, devolvemos tu dinero en los primeros 30 días.",
      icon: "✅"
    },
    {
      title: "Actualizaciones Incluidas",
      description: "Todas las nuevas funcionalidades y mejoras están incluidas en tu suscripción.",
      icon: "🔄"
    },
    {
      title: "Seguridad de Datos",
      description: "Tus datos están protegidos con encriptación de nivel empresarial.",
      icon: "🔒"
    },
    {
      title: "Escalabilidad",
      description: "Puedes cambiar de plan en cualquier momento según el crecimiento de tu empresa.",
      icon: "📈"
    }
  ];

  return (
    <div className="space-y-8 max-w-5xl mx-auto pb-12">
      {/* Header */}
      <div className="text-center space-y-4 py-8">
        <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight">
          6 Pasos para Digitalizar tu Empresa
        </h1>
        <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
          Un proceso simple, rápido y sin complicaciones. En menos de 30 minutos podrás estar usando Control Horario PRO.
        </p>
      </div>

      {/* Timeline Steps */}
      <div className="space-y-4">
        {steps.map((step, index) => {
          const Icon = step.icon;
          return (
            <div key={step.number} className="relative">
              {/* Connector Line */}
              {index < steps.length - 1 && (
                <div className="absolute left-8 top-20 h-12 w-0.5 bg-primary/20"></div>
              )}

              <Card className="relative">
                <CardContent className="p-6 flex gap-6">
                  {/* Step Number Circle */}
                  <div className="flex-shrink-0">
                    <div className="flex items-center justify-center w-16 h-16 rounded-full bg-primary text-primary-foreground font-bold text-xl shadow-lg">
                      {step.number}
                    </div>
                  </div>

                  {/* Step Content */}
                  <div className="flex-grow">
                    <div className="flex items-start justify-between">
                      <div className="flex-grow">
                        <h3 className="text-2xl font-bold mb-2 flex items-center gap-2">
                          <Icon className="w-6 h-6 text-primary" />
                          {step.title}
                        </h3>
                        <p className="text-muted-foreground text-lg">
                          {step.description}
                        </p>
                      </div>
                    </div>

                    {/* Action Button */}
                    {step.link && (
                      <div className="mt-4">
                        <Link href={step.link}>
                          <Button variant="outline" className="flex items-center gap-2">
                            {step.action}
                            <ArrowRight className="w-4 h-4" />
                          </Button>
                        </Link>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
          );
        })}
      </div>

      {/* Benefits Section */}
      <div className="space-y-6 mt-12">
        <div className="text-center">
          <h2 className="text-3xl font-bold mb-4">Por qué elegir Control Horario PRO</h2>
          <p className="text-lg text-muted-foreground">
            Beneficios exclusivos para nuestros clientes
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {benefits.map((benefit, index) => (
            <Card key={index}>
              <CardContent className="p-6 text-center space-y-3">
                <div className="text-4xl">{benefit.icon}</div>
                <h3 className="text-lg font-bold">{benefit.title}</h3>
                <p className="text-muted-foreground">{benefit.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* FAQ Section */}
      <div className="space-y-6 mt-12">
        <div className="text-center">
          <h2 className="text-3xl font-bold mb-4">Preguntas Frecuentes</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>¿Cuánto tiempo tarda la instalación?</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                Menos de 30 minutos. No requiere instalación en servidores, es 100% en la nube.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>¿Necesito formación especial?</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                No, la interfaz es intuitiva. Además, te proporcionamos guías y soporte dedicado.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>¿Puedo cambiar de plan después?</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                Claro, puedes escalar o reducir tu plan en cualquier momento. Los cambios se aplican al siguiente ciclo de facturación.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>¿Qué incluye el soporte?</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                Email prioritario, llamadas telefónicas y actualizaciones de software. Los planes Profesional y Empresarial incluyen soporte intensivo.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>¿Mis datos están seguros?</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                100% seguro. Usamos encriptación SSL/TLS, backups automáticos diarios y cumplimos GDPR.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>¿Hay contrato de larga duración?</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                No, es mes a mes. Puedes cancelar en cualquier momento sin penalización.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* CTA Section */}
      <Card className="bg-gradient-to-r from-primary to-primary/80 text-primary-foreground overflow-hidden mt-12">
        <CardContent className="p-8 md:p-12 text-center space-y-6">
          <h2 className="text-3xl font-bold">
            ¿Listo para comenzar?
          </h2>
          <p className="text-primary-foreground/90 text-lg max-w-2xl mx-auto">
            Únete a cientos de empresas que ya están digitalizando su control horario con Control Horario PRO.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
            <Link href="/demo-app">
              <Button size="lg" variant="secondary" className="px-8">
                Probar Demo Gratis
              </Button>
            </Link>
            <a
              href="https://wa.me/34610056859?text=Estaria%20interesado%20en%20esta%20App%2C%20me%20pueden%20informar%2C%20Gracias"
              target="_blank"
              rel="noopener noreferrer"
            >
              <Button size="lg" className="px-8 flex items-center gap-2 bg-white text-primary hover:bg-gray-100">
                <MessageCircle className="w-5 h-5" />
                Hablar con un Asesor
              </Button>
            </a>
          </div>

        <p className="text-sm text-primary-foreground/70 pt-4">
            Tras la compra podras activar tu cuenta y entrar directamente a tu app funcional.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
