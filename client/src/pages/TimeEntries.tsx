import { useState, useEffect } from "react";
import { useActiveCompany, useStore, Employee, TimeEntry } from "@/lib/store";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Play, Square, Pause, History, Clock } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";

export default function TimeEntries() {
  const { activeCompany } = useActiveCompany();
  const [employees] = useStore<Employee[]>('employees');
  const [entries, setEntries] = useStore<TimeEntry[]>('entries');
  const { toast } = useToast();
  
  // For demo purposes, we pick the first employee of the company to simulate "My User"
  const companyEmployees = employees?.filter(e => e.companyId === activeCompany?.id) || [];
  const currentUser = companyEmployees[0];

  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const todayStr = currentTime.toISOString().split('T')[0];
  
  // Find open entry for current user today
  const activeEntry = entries?.find(e => 
    e.employeeId === currentUser?.id && 
    e.date === todayStr && 
    !e.clockOut
  );

  const handleClockIn = () => {
    if (!currentUser) return;
    const now = new Date();
    const timeStr = now.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'});
    
    const newEntry: TimeEntry = {
      id: 't' + Date.now(),
      employeeId: currentUser.id,
      date: todayStr,
      clockIn: timeStr,
      type: 'regular'
    };
    
    setEntries([newEntry, ...(entries || [])]);
    toast({ title: "Fichaje iniciado", description: `Hora de entrada registrada: ${timeStr}` });
  };

  const handleClockOut = () => {
    if (!activeEntry) return;
    const now = new Date();
    const timeStr = now.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'});
    
    const updated = (entries || []).map(e => 
      e.id === activeEntry.id ? { ...e, clockOut: timeStr } : e
    );
    
    setEntries(updated);
    toast({ title: "Fichaje finalizado", description: `Hora de salida registrada: ${timeStr}` });
  };

  // Helper to calculate duration
  const getDuration = (inTime: string, outTime?: string) => {
    if (!outTime) return "En curso";
    const [inH, inM] = inTime.split(':').map(Number);
    const [outH, outM] = outTime.split(':').map(Number);
    
    let diffMins = (outH * 60 + outM) - (inH * 60 + inM);
    if (diffMins < 0) diffMins += 24 * 60; // crossover midnight
    
    const h = Math.floor(diffMins / 60);
    const m = diffMins % 60;
    return `${h}h ${m}m`;
  };

  // Recent entries for this company
  const recentEntries = (entries || [])
    .filter(e => companyEmployees.some(emp => emp.id === e.employeeId))
    .sort((a, b) => new Date(`${b.date}T${b.clockIn}`).getTime() - new Date(`${a.date}T${a.clockIn}`).getTime())
    .slice(0, 10);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Fichajes</h1>
        <p className="text-muted-foreground mt-1">Registro de jornada laboral interactivo</p>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        {/* Terminal/Clock In Card */}
        <Card className="md:col-span-1 border-primary/20 shadow-md">
          <CardHeader className="text-center pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Terminal Virtual</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col items-center justify-center space-y-6">
            <div className="text-5xl font-mono tracking-tighter font-light tabular-nums text-primary">
              {currentTime.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit', second: '2-digit'})}
            </div>
            
            <div className="text-sm text-muted-foreground">
              {currentTime.toLocaleDateString('es-ES', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
            </div>

            <div className="w-full flex flex-col gap-3 pt-4 border-t">
              <div className="text-center mb-2">
                <span className="text-sm text-muted-foreground">Usuario activo: </span>
                <span className="font-medium">{currentUser?.name || 'Selecciona empleado'}</span>
              </div>
              
              {!activeEntry ? (
                <Button 
                  size="lg" 
                  className="w-full h-16 text-lg bg-green-600 hover:bg-green-700 hover-elevate"
                  onClick={handleClockIn}
                  disabled={!currentUser}
                >
                  <Play className="w-5 h-5 mr-2" fill="currentColor" />
                  Entrada
                </Button>
              ) : (
                <div className="flex gap-2">
                  <Button 
                    size="lg" 
                    variant="outline"
                    className="flex-1 h-16 hover-elevate bg-orange-50 text-orange-600 hover:bg-orange-100 hover:text-orange-700 border-orange-200"
                  >
                    <Pause className="w-5 h-5 mr-2" fill="currentColor" />
                    Pausa
                  </Button>
                  <Button 
                    size="lg" 
                    variant="destructive"
                    className="flex-1 h-16 hover-elevate"
                    onClick={handleClockOut}
                  >
                    <Square className="w-5 h-5 mr-2" fill="currentColor" />
                    Salida
                  </Button>
                </div>
              )}
            </div>
            
            {activeEntry && (
              <div className="animate-in fade-in slide-in-from-bottom-2 text-sm text-green-600 font-medium flex items-center gap-2">
                <span className="relative flex h-3 w-3">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-3 w-3 bg-green-500"></span>
                </span>
                Fichaje activo desde las {activeEntry.clockIn}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Recent Entries */}
        <Card className="md:col-span-2">
          <CardHeader className="flex flex-row items-center justify-between pb-2 border-b">
            <div>
              <CardTitle className="flex items-center gap-2">
                <History className="w-5 h-5 text-primary" />
                Registros Recientes
              </CardTitle>
              <CardDescription>Últimos movimientos de la empresa</CardDescription>
            </div>
            <Button variant="outline" size="sm">Ver todos</Button>
          </CardHeader>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Empleado</TableHead>
                  <TableHead>Fecha</TableHead>
                  <TableHead>Entrada</TableHead>
                  <TableHead>Salida</TableHead>
                  <TableHead className="text-right">Total</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {recentEntries.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center h-24 text-muted-foreground">
                      No hay registros todavía
                    </TableCell>
                  </TableRow>
                ) : (
                  recentEntries.map((entry) => {
                    const emp = companyEmployees.find(e => e.id === entry.employeeId);
                    return (
                      <TableRow key={entry.id}>
                        <TableCell className="font-medium">{emp?.name || 'Desconocido'}</TableCell>
                        <TableCell>{new Date(entry.date).toLocaleDateString('es-ES')}</TableCell>
                        <TableCell>
                          <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                            {entry.clockIn}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          {entry.clockOut ? (
                            <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200">
                              {entry.clockOut}
                            </Badge>
                          ) : (
                            <span className="text-xs text-muted-foreground italic flex items-center gap-1">
                              <Clock className="w-3 h-3" /> En curso
                            </span>
                          )}
                        </TableCell>
                        <TableCell className="text-right font-medium text-muted-foreground">
                          {getDuration(entry.clockIn, entry.clockOut)}
                        </TableCell>
                      </TableRow>
                    );
                  })
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
