import { useState, useEffect } from "react";
import { useCurrentUser, useStore, Employee, TimeEntry } from "@/lib/store";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Play, Square, Pause, History, Clock, ShieldCheck, PenTool, CheckCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";

export default function TimeEntries() {
  const { currentUser } = useCurrentUser();
  const [employees] = useStore<Employee[]>('employees');
  const [entries, setEntries] = useStore<TimeEntry[]>('entries');
  const { toast } = useToast();
  
  const [currentTime, setCurrentTime] = useState(new Date());
  const [signatureModal, setSignatureModal] = useState<string | null>(null);

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  if (!currentUser) return null;

  const todayStr = currentTime.toISOString().split('T')[0];
  const activeEntry = entries?.find(e => e.employeeId === currentUser.id && e.date === todayStr && !e.clockOut);

  const canValidate = currentUser.systemRole === 'admin' || currentUser.systemRole === 'supervisor';

  const handleClockIn = () => {
    const timeStr = new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'});
    const newEntry: TimeEntry = {
      id: 't' + Date.now(),
      employeeId: currentUser.id,
      date: todayStr,
      clockIn: timeStr,
      type: 'regular',
      status: 'pending',
      history: [{ timestamp: new Date().toISOString(), action: 'Entrada', by: currentUser.id }]
    };
    setEntries([newEntry, ...(entries || [])]);
    toast({ title: "Fichaje iniciado", description: `Hora: ${timeStr}` });
  };

  const handleClockOut = () => {
    if (!activeEntry) return;
    const timeStr = new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'});
    const updated = (entries || []).map(e => 
      e.id === activeEntry.id ? { 
        ...e, 
        clockOut: timeStr,
        history: [...(e.history||[]), { timestamp: new Date().toISOString(), action: 'Salida', by: currentUser.id }]
      } : e
    );
    setEntries(updated);
    toast({ title: "Fichaje finalizado", description: `Hora: ${timeStr}` });
  };

  const handleBreakStart = () => {
    if (!activeEntry) return;
    const timeStr = new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'});
    const updated = (entries || []).map(e => 
      e.id === activeEntry.id ? { 
        ...e, 
        breakStart: timeStr,
        history: [...(e.history||[]), { timestamp: new Date().toISOString(), action: 'Inicio Descanso', by: currentUser.id }]
      } : e
    );
    setEntries(updated);
    toast({ title: "Descanso iniciado", description: `Hora: ${timeStr}` });
  };

  const handleBreakEnd = () => {
    if (!activeEntry) return;
    const timeStr = new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'});
    const updated = (entries || []).map(e => 
      e.id === activeEntry.id ? { 
        ...e, 
        breakEnd: timeStr,
        history: [...(e.history||[]), { timestamp: new Date().toISOString(), action: 'Fin Descanso', by: currentUser.id }]
      } : e
    );
    setEntries(updated);
    toast({ title: "Descanso finalizado", description: `Hora: ${timeStr}` });
  };

  const signEntry = (id: string) => {
    const updated = entries.map(e => 
      e.id === id ? { 
        ...e, 
        employeeSignature: `Firmado por ${currentUser.name} el ${new Date().toLocaleString()}`,
        history: [...(e.history||[]), { timestamp: new Date().toISOString(), action: 'Firma', by: currentUser.id }]
      } : e
    );
    setEntries(updated);
    setSignatureModal(null);
    toast({ title: "Documento firmado digitalmente" });
  };

  const validateEntry = (id: string) => {
    const updated = entries.map(e => 
      e.id === id ? { 
        ...e, 
        status: 'validated' as const,
        validatedBy: currentUser.id,
        history: [...(e.history||[]), { timestamp: new Date().toISOString(), action: 'Validación', by: currentUser.id }]
      } : e
    );
    setEntries(updated);
    toast({ title: "Fichaje validado por supervisor" });
  };

  const getDuration = (inTime: string, outTime?: string) => {
    if (!outTime) return "En curso";
    const [inH, inM] = inTime.split(':').map(Number);
    const [outH, outM] = outTime.split(':').map(Number);
    let diffMins = (outH * 60 + outM) - (inH * 60 + inM);
    if (diffMins < 0) diffMins += 24 * 60;
    const h = Math.floor(diffMins / 60);
    const m = diffMins % 60;
    return `${h}h ${m}m`;
  };

  const getExtraHours = (inTime: string, outTime?: string, weeklyHours: number = 40) => {
    if (!outTime) return null;
    const [inH, inM] = inTime.split(':').map(Number);
    const [outH, outM] = outTime.split(':').map(Number);
    let diffMins = (outH * 60 + outM) - (inH * 60 + inM);
    if (diffMins < 0) diffMins += 24 * 60;
    
    // Asumimos 5 días laborales para calcular las horas diarias estimadas
    const expectedDailyMins = (weeklyHours / 5) * 60;
    const extraMins = diffMins - expectedDailyMins;
    
    if (extraMins > 0) {
      const h = Math.floor(extraMins / 60);
      const m = Math.floor(extraMins % 60);
      return `+${h}h ${m}m extra`;
    }
    return null;
  };

  const visibleEntries = (entries || [])
    .filter(e => canValidate ? true : e.employeeId === currentUser.id)
    .sort((a, b) => new Date(`${b.date}T${b.clockIn}`).getTime() - new Date(`${a.date}T${a.clockIn}`).getTime())
    .slice(0, 15);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Fichajes y Registro de Jornada</h1>
        <p className="text-muted-foreground mt-1">Cumplimiento de la normativa de registro horario (Art. 34.9 ET)</p>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        <Card className="md:col-span-1 border-primary/20 shadow-md h-fit">
          <CardHeader className="text-center pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Terminal Virtual</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col items-center justify-center space-y-6">
            <div className="text-5xl font-mono tracking-tighter font-light tabular-nums text-primary">
              {currentTime.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit', second: '2-digit'})}
            </div>
            
            <div className="w-full flex flex-col gap-3 pt-4 border-t">
              {!activeEntry ? (
                <Button size="lg" className="w-full h-16 text-lg bg-green-600 hover:bg-green-700" onClick={handleClockIn}>
                  <Play className="w-5 h-5 mr-2" fill="currentColor" /> Entrada
                </Button>
              ) : (
                <div className="flex flex-col gap-2 w-full">
                  {!activeEntry.breakStart ? (
                    <Button size="lg" variant="outline" className="w-full h-12 text-orange-600 border-orange-200 hover:bg-orange-50" onClick={handleBreakStart}>
                      <Pause className="w-5 h-5 mr-2" fill="currentColor" /> Iniciar Descanso
                    </Button>
                  ) : !activeEntry.breakEnd ? (
                    <Button size="lg" variant="outline" className="w-full h-12 text-blue-600 border-blue-200 hover:bg-blue-50" onClick={handleBreakEnd}>
                      <Play className="w-5 h-5 mr-2" fill="currentColor" /> Finalizar Descanso
                    </Button>
                  ) : null}
                  <Button size="lg" variant="destructive" className="w-full h-16 text-lg mt-2" onClick={handleClockOut}>
                    <Square className="w-5 h-5 mr-2" fill="currentColor" /> Salida
                  </Button>
                </div>
              )}
            </div>
          </CardContent>
          <CardFooter className="bg-secondary/30 p-4 text-xs text-muted-foreground text-center flex items-center justify-center gap-2 border-t">
            <ShieldCheck className="w-4 h-4 text-primary" />
            Registro protegido contra manipulaciones
          </CardFooter>
        </Card>

        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <History className="w-5 h-5 text-primary" />
              {canValidate ? 'Registros de la Empresa' : 'Mis Registros'}
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0 overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Fecha</TableHead>
                  {canValidate && <TableHead>Empleado</TableHead>}
                  <TableHead>Horas</TableHead>
                  <TableHead>Estado</TableHead>
                  <TableHead>Firma Empleado</TableHead>
                  {canValidate && <TableHead className="text-right">Acción</TableHead>}
                </TableRow>
              </TableHeader>
              <TableBody>
                {visibleEntries.map((entry) => {
                  const emp = employees.find(e => e.id === entry.employeeId);
                  const isOwner = entry.employeeId === currentUser.id;
                  
                  return (
                    <TableRow key={entry.id} className={entry.status === 'validated' ? 'bg-secondary/10' : ''}>
                      <TableCell className="font-medium">{new Date(entry.date).toLocaleDateString('es-ES')}</TableCell>
                      {canValidate && <TableCell>{emp?.name}</TableCell>}
                      <TableCell>
                        <div className="text-sm">{entry.clockIn} - {entry.clockOut || '...'}</div>
                        {entry.breakStart && (
                          <div className="text-xs text-orange-600">Descanso: {entry.breakStart} - {entry.breakEnd || '...'}</div>
                        )}
                        <div className="flex items-center gap-2 mt-1">
                          <span className="text-xs text-muted-foreground">{getDuration(entry.clockIn, entry.clockOut)}</span>
                          {entry.clockOut && getExtraHours(entry.clockIn, entry.clockOut, emp?.weeklyHours || 40) && (
                            <Badge variant="secondary" className="text-[10px] bg-orange-100 text-orange-700 hover:bg-orange-100 border-orange-200 py-0 h-4">
                              {getExtraHours(entry.clockIn, entry.clockOut, emp?.weeklyHours || 40)}
                            </Badge>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        {entry.status === 'validated' ? 
                          <Badge className="bg-green-100 text-green-700 shadow-none border-green-200"><CheckCircle className="w-3 h-3 mr-1"/> Validado</Badge> : 
                          <Badge variant="outline" className="text-orange-600 border-orange-200 bg-orange-50">Pendiente</Badge>
                        }
                      </TableCell>
                      <TableCell>
                        {entry.employeeSignature ? (
                          <Badge variant="secondary" className="text-[10px] bg-blue-50 text-blue-700 border-blue-200">Firmado</Badge>
                        ) : (
                          isOwner && entry.clockOut && entry.status !== 'validated' ? (
                            <Button variant="outline" size="sm" className="h-7 text-xs" onClick={() => setSignatureModal(entry.id)}>
                              <PenTool className="w-3 h-3 mr-1" /> Firmar
                            </Button>
                          ) : <span className="text-xs text-muted-foreground">-</span>
                        )}
                      </TableCell>
                      {canValidate && (
                        <TableCell className="text-right">
                          {entry.status === 'pending' && entry.clockOut && (
                            <Button variant="ghost" size="sm" className="text-green-600" onClick={() => validateEntry(entry.id)}>
                              Validar
                            </Button>
                          )}
                        </TableCell>
                      )}
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>

      <Dialog open={!!signatureModal} onOpenChange={(open) => !open && setSignatureModal(null)}>
        <DialogContent>
          <DialogHeader><DialogTitle>Firma Digital de Fichaje</DialogTitle></DialogHeader>
          <div className="space-y-4 py-4">
              <p className="text-sm text-muted-foreground">
                <strong>Pasos para firmar:</strong><br />
                1. Revisa que las horas de entrada, salida y descansos sean correctas.<br />
                2. Si estás de acuerdo, haz clic en "Confirmar Firma" abajo.<br />
                3. Esto añadirá una marca de tiempo digital equivalente a tu firma física.
              </p>
            <div className="p-4 bg-secondary/30 rounded-lg text-center font-mono border-2 border-dashed border-muted-foreground/30">
              <div className="font-handwriting text-2xl text-primary">{currentUser.name}</div>
              <div className="text-xs text-muted-foreground mt-2">{new Date().toLocaleString()}</div>
            </div>
            <Button onClick={() => signatureModal && signEntry(signatureModal)} className="w-full gap-2">
              <PenTool className="w-4 h-4" /> Confirmar Firma
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
