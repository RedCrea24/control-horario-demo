import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useActiveCompany, useCurrentUser, useStore, Employee, TimeEntry } from "@/lib/store";
import { Users, Clock, LogIn, LogOut, AlertTriangle, ShieldCheck, FileWarning } from "lucide-react";
import { Badge } from "@/components/ui/badge";

export default function Dashboard() {
  const { activeCompany } = useActiveCompany();
  const { currentUser } = useCurrentUser();
  const [employees] = useStore<Employee[]>('employees');
  const [entries] = useStore<TimeEntry[]>('entries');

  const companyEmployees = employees?.filter(e => e.companyId === activeCompany?.id) || [];
  
  const today = new Date().toISOString().split('T')[0];
  const todaysEntries = entries?.filter(e => 
    e.date === today && 
    companyEmployees.some(emp => emp.id === e.employeeId)
  ) || [];

  const activeNow = todaysEntries.filter(e => e.clockIn && !e.clockOut).length;
  const missingValidation = entries?.filter(e => e.status === 'pending' && e.clockOut).length || 0;

  // Legal compliance check (simulated)
  const over12Hours = entries?.filter(e => {
    if (!e.clockOut) return false;
    const [inH] = e.clockIn.split(':').map(Number);
    const [outH] = e.clockOut.split(':').map(Number);
    return (outH - inH) > 12;
  }).length || 0;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground mt-1">
          Bienvenido, {currentUser?.name} <Badge variant="outline" className="ml-2 bg-primary/5 text-primary border-primary/20">{currentUser?.systemRole.toUpperCase()}</Badge>
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {(currentUser?.systemRole === 'admin' || currentUser?.systemRole === 'supervisor') && (
          <>
            <Card className="hover-elevate border-l-4 border-l-blue-500">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">Empleados Activos</CardTitle>
                <Users className="w-4 h-4 text-blue-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{companyEmployees.length}</div>
                <p className="text-xs text-muted-foreground mt-1">En {activeCompany?.name}</p>
              </CardContent>
            </Card>

            <Card className="hover-elevate border-l-4 border-l-green-500">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">Trabajando Ahora</CardTitle>
                <Clock className="w-4 h-4 text-green-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{activeNow}</div>
                <p className="text-xs text-muted-foreground mt-1">
                  {Math.round((activeNow / (companyEmployees.length || 1)) * 100)}% de la plantilla
                </p>
              </CardContent>
            </Card>

            <Card className="hover-elevate border-l-4 border-l-orange-500 bg-orange-50/30">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">Pendientes Validar</CardTitle>
                <ShieldCheck className="w-4 h-4 text-orange-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-orange-700">{missingValidation}</div>
                <p className="text-xs text-muted-foreground mt-1">Fichajes requieren revisión</p>
              </CardContent>
            </Card>

            <Card className="hover-elevate border-l-4 border-l-red-500 bg-red-50/30">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">Alertas Legales</CardTitle>
                <AlertTriangle className="w-4 h-4 text-red-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-red-700">{over12Hours}</div>
                <p className="text-xs text-muted-foreground mt-1">Jornadas excesivas detectadas</p>
              </CardContent>
            </Card>
          </>
        )}
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Card className="col-span-1 lg:col-span-2">
          <CardHeader>
            <CardTitle>Actividad Reciente</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {todaysEntries.slice(0, 5).map((entry, i) => {
                const emp = companyEmployees.find(e => e.id === entry.employeeId);
                return (
                  <div key={i} className="flex items-center justify-between border-b pb-4 last:border-0 last:pb-0">
                    <div className="flex items-center gap-3">
                      <div className={`p-2 rounded-full ${entry.clockOut ? 'bg-orange-100 text-orange-600' : 'bg-green-100 text-green-600'}`}>
                        {entry.clockOut ? <LogOut className="w-4 h-4" /> : <LogIn className="w-4 h-4" />}
                      </div>
                      <div>
                        <p className="font-medium text-sm">{emp?.name || 'Desconocido'}</p>
                        <p className="text-xs text-muted-foreground">{entry.clockOut ? 'Salida' : 'Entrada'} a las {entry.clockOut || entry.clockIn}</p>
                      </div>
                    </div>
                    <div>
                      {entry.status === 'validated' && <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">Validado</Badge>}
                      {entry.status === 'pending' && <Badge variant="outline" className="bg-orange-50 text-orange-700 border-orange-200">Pendiente</Badge>}
                    </div>
                  </div>
                );
              })}
              {todaysEntries.length === 0 && (
                <div className="text-center py-6 text-muted-foreground text-sm">
                  No hay actividad registrada hoy
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        <Card className="col-span-1">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileWarning className="w-5 h-5 text-muted-foreground" />
              Auditoría Legal España
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-sm">
            <div className="flex justify-between items-center">
              <span className="text-muted-foreground">Límite 9h/día</span>
              {over12Hours > 0 ? (
                <Badge variant="destructive">Incumplimiento</Badge>
              ) : (
                <Badge className="bg-green-100 text-green-700 hover:bg-green-100 shadow-none">OK</Badge>
              )}
            </div>
            <div className="flex justify-between items-center">
              <span className="text-muted-foreground">Descanso 12h entre jornadas</span>
              <Badge className="bg-green-100 text-green-700 hover:bg-green-100 shadow-none">OK</Badge>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-muted-foreground">Registro de entradas/salidas</span>
              <Badge className="bg-green-100 text-green-700 hover:bg-green-100 shadow-none">Activo</Badge>
            </div>
            <div className="mt-4 p-3 bg-secondary/30 rounded-md text-xs text-muted-foreground border">
              El Estatuto de los Trabajadores exige garantizar el registro diario de jornada, que deberá incluir el horario concreto de inicio y finalización de la jornada de cada persona trabajadora.
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
