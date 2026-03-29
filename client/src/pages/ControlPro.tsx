import { useState } from "react";
import { useStore, Employee, TimeEntry, Company, useCurrentUser } from "@/lib/store";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Search, Save, Trash2, Edit2, ShieldAlert, History } from "lucide-react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { Switch } from "@/components/ui/switch";

export default function ControlPro() {
  const { currentUser } = useCurrentUser();
  const [employees, setEmployees] = useStore<Employee[]>('employees');
  const [entries, setEntries] = useStore<TimeEntry[]>('entries');
  const [companies] = useStore<Company[]>('companies');
  
  const { toast } = useToast();
  const [search, setSearch] = useState("");

  const [editEmployee, setEditEmployee] = useState<Employee | null>(null);
  const [editEntry, setEditEntry] = useState<TimeEntry | null>(null);
  const [viewHistory, setViewHistory] = useState<TimeEntry['history']>(null);

  // Security check
  if (currentUser?.systemRole !== 'admin') {
    return (
      <div className="flex flex-col items-center justify-center h-full p-12 text-center">
        <ShieldAlert className="w-16 h-16 text-destructive mb-4" />
        <h2 className="text-2xl font-bold">Acceso Denegado</h2>
        <p className="text-muted-foreground mt-2">El módulo Control Pro está reservado exclusivamente para administradores del sistema.</p>
      </div>
    );
  }

  const filteredEntries = entries?.filter(e => {
    const emp = employees?.find(emp => emp.id === e.employeeId);
    return emp?.name.toLowerCase().includes(search.toLowerCase()) || e.date.includes(search);
  }) || [];

  const saveEntry = () => {
    if(editEntry) {
      // Check if trying to edit a validated entry
      const original = entries.find(e => e.id === editEntry.id);
      if (original?.status === 'validated' && editEntry.status === 'validated') {
        toast({ title: "Registro bloqueado", description: "No se puede editar un fichaje ya validado.", variant: "destructive" });
        return;
      }

      const updatedHistory = [
        ...(editEntry.history || []),
        { timestamp: new Date().toISOString(), action: 'Edición administrativa Control Pro', by: currentUser.id }
      ];

      setEntries(entries.map(e => e.id === editEntry.id ? { ...editEntry, history: updatedHistory } : e));
      setEditEntry(null);
      toast({ title: "Fichaje actualizado y auditado" });
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center bg-primary/5 p-4 rounded-xl border border-primary/20">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-primary flex items-center gap-2">
            <ShieldAlert className="w-6 h-6" /> Control Pro: Auditoría y Edición
          </h1>
          <p className="text-sm text-muted-foreground mt-1">Todos los cambios realizados aquí quedan registrados en el log de auditoría legal.</p>
        </div>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input placeholder="Buscar..." className="pl-10 w-64 bg-background" value={search} onChange={e => setSearch(e.target.value)} />
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Corrector de Fichajes</CardTitle>
          <CardDescription>Ajuste manual de horas y estados. Los fichajes validados se bloquearán automáticamente.</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Fecha</TableHead>
                <TableHead>Empleado</TableHead>
                <TableHead>Horas</TableHead>
                <TableHead>Estado</TableHead>
                <TableHead className="text-right">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredEntries.map(entry => (
                <TableRow key={entry.id} className={entry.status === 'validated' ? "bg-muted/30" : ""}>
                  <TableCell>{entry.date}</TableCell>
                  <TableCell>{employees?.find(e => e.id === entry.employeeId)?.name}</TableCell>
                  <TableCell className="font-mono text-sm">{entry.clockIn} - {entry.clockOut || '...'}</TableCell>
                  <TableCell>
                    <Badge variant={entry.status === 'validated' ? 'default' : 'secondary'} className={entry.status === 'validated' ? 'bg-green-100 text-green-700' : ''}>
                      {entry.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <Button variant="ghost" size="icon" onClick={() => setViewHistory(entry.history)}><History className="w-4 h-4" /></Button>
                    <Button variant="ghost" size="icon" onClick={() => setEditEntry(entry)} disabled={entry.status === 'validated'}><Edit2 className="w-4 h-4 text-blue-600" /></Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Edit Entry Dialog */}
      <Dialog open={!!editEntry} onOpenChange={(open) => !open && setEditEntry(null)}>
        <DialogContent>
          <DialogHeader><DialogTitle>Edición Forzada de Fichaje</DialogTitle></DialogHeader>
          {editEntry && (
            <div className="space-y-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2"><Label>Hora Entrada</Label><Input type="time" value={editEntry.clockIn} onChange={e => setEditEntry({...editEntry, clockIn: e.target.value})} /></div>
                <div className="space-y-2"><Label>Hora Salida</Label><Input type="time" value={editEntry.clockOut || ''} onChange={e => setEditEntry({...editEntry, clockOut: e.target.value})} /></div>
              </div>
              <div className="space-y-2">
                <Label>Estado de Validación</Label>
                <Select value={editEntry.status} onValueChange={(v: any) => setEditEntry({...editEntry, status: v})}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="pending">Pendiente</SelectItem>
                    <SelectItem value="validated">Validado (Bloquea edición futura)</SelectItem>
                    <SelectItem value="rejected">Rechazado</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2"><Label>Observaciones de corrección (Requerido para auditoría)</Label><Input value={editEntry.notes || ''} onChange={e => setEditEntry({...editEntry, notes: e.target.value})} /></div>
              <Button onClick={saveEntry} className="w-full mt-4 bg-primary text-primary-foreground"><Save className="w-4 h-4 mr-2"/> Guardar y Auditar</Button>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* History Dialog */}
      <Dialog open={!!viewHistory} onOpenChange={(open) => !open && setViewHistory(null)}>
        <DialogContent>
          <DialogHeader><DialogTitle>Registro de Auditoría (Trazabilidad)</DialogTitle></DialogHeader>
          <div className="space-y-4 py-4">
            {viewHistory?.map((h, i) => (
              <div key={i} className="flex flex-col gap-1 border-b pb-2 text-sm">
                <span className="font-medium">{h.action}</span>
                <span className="text-xs text-muted-foreground">{new Date(h.timestamp).toLocaleString('es-ES')} - Usuario ID: {h.by}</span>
              </div>
            ))}
            {!viewHistory?.length && <p className="text-sm text-muted-foreground">No hay registro de historial.</p>}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
