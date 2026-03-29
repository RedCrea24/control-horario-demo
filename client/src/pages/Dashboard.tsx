import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useActiveCompany, useStore, Employee, TimeEntry } from "@/lib/store";
import { Users, Clock, LogIn, LogOut, CheckCircle2, AlertCircle } from "lucide-react";

export default function Dashboard() {
  const { activeCompany } = useActiveCompany();
  const [employees] = useStore<Employee[]>('employees');
  const [entries] = useStore<TimeEntry[]>('entries');

  const companyEmployees = employees?.filter(e => e.companyId === activeCompany?.id) || [];
  
  const today = new Date().toISOString().split('T')[0];
  const todaysEntries = entries?.filter(e => 
    e.date === today && 
    companyEmployees.some(emp => emp.id === e.employeeId)
  ) || [];

  const activeNow = todaysEntries.filter(e => e.clockIn && !e.clockOut).length;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground mt-1">Resumen del estado actual de {activeCompany?.name}</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="hover-elevate">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Empleados Activos</CardTitle>
            <Users className="w-4 h-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{companyEmployees.length}</div>
            <p className="text-xs text-muted-foreground mt-1">Registrados en la plataforma</p>
          </CardContent>
        </Card>

        <Card className="hover-elevate">
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

        <Card className="hover-elevate">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Fichajes Hoy</CardTitle>
            <CheckCircle2 className="w-4 h-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{todaysEntries.length}</div>
            <p className="text-xs text-muted-foreground mt-1">Registros creados hoy</p>
          </CardContent>
        </Card>

        <Card className="hover-elevate">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Ausencias Hoy</CardTitle>
            <AlertCircle className="w-4 h-4 text-orange-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">0</div>
            <p className="text-xs text-muted-foreground mt-1">Vacaciones o bajas activas</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card className="col-span-1">
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
                        <p className="text-xs text-muted-foreground">{entry.clockOut ? 'Salida' : 'Entrada'}</p>
                      </div>
                    </div>
                    <div className="text-sm font-medium">
                      {entry.clockOut || entry.clockIn}
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
      </div>
    </div>
  );
}
