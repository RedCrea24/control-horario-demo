import { Card, CardContent } from "@/components/ui/card";
import { Clock, CheckCircle2, Shield, FileText, Smartphone, Target, TrendingUp, Phone, Mail } from "lucide-react";

export default function MoreInfo() {
  return (
    <div className="space-y-8 max-w-4xl mx-auto pb-12">
      <div className="text-center space-y-4 py-8">
        <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight flex items-center justify-center gap-3 text-primary">
          <Clock className="w-10 h-10" />
          Control Horario Empresarial PRO
        </h1>
        <p className="text-xl text-muted-foreground font-medium">
          Digitaliza tu empresa. Controla tu tiempo. Cumple la ley.
        </p>
        <p className="max-w-2xl mx-auto text-muted-foreground">
          Gestiona de forma profesional el control horario de tu empresa con una solución moderna, intuitiva y adaptada a la normativa laboral en España.
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card className="border-primary/20 bg-primary/5">
          <CardContent className="p-6 space-y-4">
            <h2 className="text-xl font-bold flex items-center gap-2">
              <CheckCircle2 className="w-6 h-6 text-primary" />
              Todo lo que tu empresa necesita
            </h2>
            <ul className="space-y-2">
              {[
                "Registro de jornada en tiempo real",
                "Control total de empleados",
                "Gestión de vacaciones, bajas e incidencias",
                "Cálculo automático de horas y horas extra",
                "Informes listos para inspección laboral",
                "Acceso desde móvil, tablet y ordenador"
              ].map((item, i) => (
                <li key={i} className="flex items-start gap-2 text-sm">
                  <CheckCircle2 className="w-4 h-4 text-green-500 shrink-0 mt-0.5" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6 space-y-4">
            <h2 className="text-xl font-bold flex items-center gap-2">
              <Target className="w-6 h-6 text-blue-500" />
              Diseñado para empresas reales
            </h2>
            <p className="text-sm text-muted-foreground font-medium">Olvídate de Excel, papeles o sistemas complicados.</p>
            <ul className="space-y-2">
              {[
                "Saber quién está trabajando en cada momento",
                "Detectar errores o incumplimientos al instante",
                "Corregir fichajes fácilmente (modo Control PRO)",
                "Tener toda la información centralizada",
                "Ahorrar tiempo y mejorar la organización"
              ].map((item, i) => (
                <li key={i} className="flex items-start gap-2 text-sm">
                  <div className="w-1.5 h-1.5 rounded-full bg-blue-500 shrink-0 mt-1.5" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6 space-y-4">
            <h2 className="text-xl font-bold flex items-center gap-2">
              <Shield className="w-6 h-6 text-orange-500" />
              Control PRO (nivel profesional)
            </h2>
            <p className="text-sm text-muted-foreground font-medium">Accede a un sistema avanzado con control total:</p>
            <ul className="space-y-2">
              {[
                "Edita fichajes y datos en segundos",
                "Elimina o corrige registros",
                "Gestiona empleados completamente",
                "Auditoría y control interno",
                "Acceso protegido con contraseña"
              ].map((item, i) => (
                <li key={i} className="flex items-start gap-2 text-sm">
                  <div className="w-1.5 h-1.5 rounded-full bg-orange-500 shrink-0 mt-1.5" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
            <div className="pt-2">
              <span className="inline-flex items-center rounded-md bg-orange-50 px-2 py-1 text-xs font-medium text-orange-700 ring-1 ring-inset ring-orange-600/20">
                Pensado para responsables, gerencia y RRHH
              </span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6 space-y-4">
            <h2 className="text-xl font-bold flex items-center gap-2">
              <FileText className="w-6 h-6 text-purple-500" />
              Informes profesionales automáticos
            </h2>
            <ul className="space-y-2">
              {[
                "Por día, semana o mes",
                "Por empleado o empresa",
                "Horas trabajadas y horas extra",
                "Vacaciones e incidencias"
              ].map((item, i) => (
                <li key={i} className="flex items-start gap-2 text-sm">
                  <CheckCircle2 className="w-4 h-4 text-purple-500 shrink-0 mt-0.5" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
            <div className="flex gap-2 flex-wrap pt-2">
              <span className="inline-flex items-center rounded-md bg-secondary px-2 py-1 text-xs font-medium">Exportables a PDF, Excel y CSV</span>
              <span className="inline-flex items-center rounded-md bg-secondary px-2 py-1 text-xs font-medium">Listos para imprimir</span>
              <span className="inline-flex items-center rounded-md bg-secondary px-2 py-1 text-xs font-medium">Con logo de tu empresa</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6 space-y-4">
            <h2 className="text-xl font-bold flex items-center gap-2">
              <span className="text-2xl">🇪🇸</span>
              Cumple con la normativa laboral
            </h2>
            <p className="text-sm text-muted-foreground">Adaptado al registro obligatorio de jornada en España:</p>
            <ul className="space-y-2">
              {[
                "Registro diario de fichajes",
                "Control de horas trabajadas",
                "Histórico disponible",
                "Preparado para inspecciones"
              ].map((item, i) => (
                <li key={i} className="flex items-start gap-2 text-sm">
                  <CheckCircle2 className="w-4 h-4 text-green-600 shrink-0 mt-0.5" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6 space-y-4">
            <h2 className="text-xl font-bold flex items-center gap-2">
              <Smartphone className="w-6 h-6 text-pink-500" />
              100% accesible desde cualquier dispositivo
            </h2>
            <div className="flex justify-around py-4">
              <div className="text-center space-y-1">
                <span className="text-3xl">📱</span>
                <p className="text-xs font-medium">Móvil</p>
              </div>
              <div className="text-center space-y-1">
                <span className="text-3xl">💻</span>
                <p className="text-xs font-medium">Tablet</p>
              </div>
              <div className="text-center space-y-1">
                <span className="text-3xl">🖥</span>
                <p className="text-xs font-medium">Ordenador</p>
              </div>
            </div>
            <p className="text-center text-sm font-medium text-pink-600 bg-pink-50 rounded-md p-2">Sin instalaciones, sin complicaciones.</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <Card className="border-t-4 border-t-indigo-500">
          <CardContent className="p-6">
            <h3 className="font-bold text-lg mb-4">🎯 ¿Para quién es esta solución?</h3>
            <ul className="space-y-2">
              <li className="flex items-center gap-2 text-sm"><CheckCircle2 className="w-4 h-4 text-indigo-500" /> Empresas de cualquier sector</li>
              <li className="flex items-center gap-2 text-sm"><CheckCircle2 className="w-4 h-4 text-indigo-500" /> PYMES y autónomos</li>
              <li className="flex items-center gap-2 text-sm"><CheckCircle2 className="w-4 h-4 text-indigo-500" /> Industria, oficinas, comercios</li>
              <li className="flex items-center gap-2 text-sm"><CheckCircle2 className="w-4 h-4 text-indigo-500" /> Equipos con trabajo presencial o teletrabajo</li>
            </ul>
          </CardContent>
        </Card>
        
        <Card className="border-t-4 border-t-emerald-500">
          <CardContent className="p-6">
            <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-emerald-500" />
              Convierte el control horario en una ventaja
            </h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="flex items-center gap-2 text-sm font-medium"><span className="text-xl">✔️</span> Más control</div>
              <div className="flex items-center gap-2 text-sm font-medium"><span className="text-xl">✔️</span> Más organización</div>
              <div className="flex items-center gap-2 text-sm font-medium"><span className="text-xl">✔️</span> Menos errores</div>
              <div className="flex items-center gap-2 text-sm font-medium"><span className="text-xl">✔️</span> Más productividad</div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="bg-primary text-primary-foreground overflow-hidden">
        <CardContent className="p-8 md:p-12 text-center space-y-6">
          <h2 className="text-2xl md:text-3xl font-bold">Solicita información sin compromiso</h2>
          <p className="text-primary-foreground/80 max-w-2xl mx-auto">
            Te ayudamos a implantarla en tu empresa de forma rápida y personalizada. Da el salto a una gestión profesional del tiempo en tu empresa.
          </p>
          
          <div className="bg-primary-foreground/10 rounded-xl p-6 max-w-md mx-auto backdrop-blur-sm border border-primary-foreground/20">
            <p className="text-sm uppercase tracking-wider font-semibold text-primary-foreground/60 mb-4">Esta solución ha sido desarrollada por:</p>
            <p className="text-2xl font-bold mb-6">RedCrea24.es</p>
            
            <div className="space-y-3">
              <a href="tel:610056859" className="flex items-center justify-center gap-3 text-lg font-medium hover:bg-primary-foreground/20 p-2 rounded-md transition-colors">
                <Phone className="w-5 h-5" /> 610 05 68 59
              </a>
              <a href="mailto:info@redcrea24.es" className="flex items-center justify-center gap-3 text-lg font-medium hover:bg-primary-foreground/20 p-2 rounded-md transition-colors">
                <Mail className="w-5 h-5" /> info@redcrea24.es
              </a>
            </div>
          </div>
          
          <div className="pt-4">
            <a 
              href="https://wa.me/34610056859?text=Estaria%20interesado%20en%20esta%20App%2C%20me%20pueden%20informar%2C%20Gracias" 
              target="_blank" 
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 bg-white text-primary px-6 py-3 rounded-full font-bold text-lg shadow-lg hover:bg-gray-100 transition-colors cursor-pointer"
            >
              🔥 Contacta ahora y solicita tu demo
            </a>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
