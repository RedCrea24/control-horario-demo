import { useState } from "react";
import { useActiveCompany, useStore, Employee, TimeEntry, Company } from "@/lib/store";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { FileText, Download, Printer } from "lucide-react";

export default function Reports() {
  const { activeCompany } = useActiveCompany();
  const [employees] = useStore<Employee[]>('employees');
  const [entries] = useStore<TimeEntry[]>('entries');
  
  const [month, setMonth] = useState(new Date().getMonth().toString());
  const [year, setYear] = useState(new Date().getFullYear().toString());
  const [selectedEmp, setSelectedEmp] = useState<string>("all");

  const companyEmployees = employees?.filter(e => e.companyId === activeCompany?.id) || [];
  
  // Filter entries for the report
  const reportEntries = (entries || []).filter(entry => {
    const entryDate = new Date(entry.date);
    const inMonth = entryDate.getMonth().toString() === month && entryDate.getFullYear().toString() === year;
    const isCompanyEmp = companyEmployees.some(e => e.id === entry.employeeId);
    const isSelectedEmp = selectedEmp === "all" || entry.employeeId === selectedEmp;
    
    return inMonth && isCompanyEmp && isSelectedEmp;
  }).sort((a, b) => new Date(`${a.date}T${a.clockIn}`).getTime() - new Date(`${b.date}T${b.clockIn}`).getTime());

  // Aggregate by employee for summary
  const summaryByEmp = companyEmployees.filter(e => selectedEmp === "all" || e.id === selectedEmp).map(emp => {
    const empEntries = reportEntries.filter(entry => entry.employeeId === emp.id);
    let totalMinutes = 0;
    
    empEntries.forEach(entry => {
      if (entry.clockOut) {
        const [inH, inM] = entry.clockIn.split(':').map(Number);
        const [outH, outM] = entry.clockOut.split(':').map(Number);
        let diffMins = (outH * 60 + outM) - (inH * 60 + inM);
        if (diffMins < 0) diffMins += 24 * 60;
        totalMinutes += diffMins;
      }
    });
    
    return {
      emp,
      entriesCount: empEntries.length,
      totalHours: Math.floor(totalMinutes / 60),
      totalMinutes: totalMinutes % 60
    };
  });

  const handlePrint = () => {
    window.print();
  };

  const handleExportCSV = () => {
    const headers = ["Fecha", "Empleado", "Entrada", "Salida", "Tipo"];
    const rows = reportEntries.map(e => {
      const empName = companyEmployees.find(emp => emp.id === e.employeeId)?.name || 'Desconocido';
      return `${e.date},${empName},${e.clockIn},${e.clockOut || ''},${e.type}`;
    });
    
    const csvContent = [headers.join(","), ...rows].join("\n");
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `informe_${activeCompany?.name}_${month}_${year}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center print:hidden">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Informes</h1>
          <p className="text-muted-foreground mt-1">Generador de reportes de control horario legales</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={handleExportCSV} className="gap-2">
            <Download className="w-4 h-4" /> CSV
          </Button>
          <Button onClick={handlePrint} className="gap-2">
            <Printer className="w-4 h-4" /> Imprimir / PDF
          </Button>
        </div>
      </div>

      <Card className="print:hidden">
        <CardContent className="p-6 grid gap-4 md:grid-cols-4">
          <div className="space-y-2">
            <Label>Mes</Label>
            <Select value={month} onValueChange={setMonth}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                {Array.from({length: 12}).map((_, i) => (
                  <SelectItem key={i} value={i.toString()}>
                    {new Date(2000, i, 1).toLocaleString('es-ES', { month: 'long' })}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>Año</Label>
            <Select value={year} onValueChange={setYear}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                {[2023, 2024, 2025, 2026].map(y => (
                  <SelectItem key={y} value={y.toString()}>{y}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2 md:col-span-2">
            <Label>Empleado</Label>
            <Select value={selectedEmp} onValueChange={setSelectedEmp}>
              <SelectTrigger><SelectValue placeholder="Todos los empleados" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos los empleados</SelectItem>
                {companyEmployees.map(emp => (
                  <SelectItem key={emp.id} value={emp.id}>{emp.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Printable Area */}
      <div className="print:block space-y-8 bg-card border rounded-xl p-8 shadow-sm print:shadow-none print:border-none print:p-0">
        
        {/* Report Header for Print */}
        <div className="flex items-start justify-between border-b pb-6">
          <div className="flex items-center gap-4">
            {activeCompany?.logo ? (
              <img src={activeCompany.logo} alt="Logo" className="w-16 h-16 object-contain" />
            ) : (
              <div className="w-16 h-16 bg-primary/10 rounded flex items-center justify-center text-primary font-bold">
                LOGO
              </div>
            )}
            <div>
              <h2 className="text-xl font-bold">{activeCompany?.name}</h2>
              <p className="text-sm text-muted-foreground">NIF: {activeCompany?.nif}</p>
              <p className="text-sm text-muted-foreground">{activeCompany?.address}</p>
            </div>
          </div>
          <div className="text-right">
            <h3 className="font-bold text-lg uppercase tracking-wider text-primary">Registro de Jornada</h3>
            <p className="text-sm text-muted-foreground">
              Mes: {new Date(parseInt(year), parseInt(month), 1).toLocaleString('es-ES', { month: 'long', year: 'numeric' })}
            </p>
          </div>
        </div>

        {selectedEmp !== "all" && summaryByEmp[0] ? (
          <div className="bg-secondary/20 p-4 rounded-lg flex justify-between">
            <div>
              <p className="text-sm font-bold">Trabajador: <span className="font-normal">{summaryByEmp[0].emp.name}</span></p>
              <p className="text-sm font-bold">DNI/NIE: <span className="font-normal">___________</span></p>
            </div>
            <div className="text-right">
              <p className="text-sm font-bold">Total Horas Ordinarias: <span className="font-normal">{summaryByEmp[0].totalHours}h {summaryByEmp[0].totalMinutes}m</span></p>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {summaryByEmp.map(sum => (
              <div key={sum.emp.id} className="border p-3 rounded text-sm">
                <div className="font-bold truncate">{sum.emp.name}</div>
                <div className="text-muted-foreground">{sum.totalHours}h {sum.totalMinutes}m</div>
              </div>
            ))}
          </div>
        )}

        <div>
          <h3 className="font-bold mb-4 flex items-center gap-2">
            <FileText className="w-5 h-5 text-primary" />
            Detalle de Movimientos
          </h3>
          <Table>
            <TableHeader>
              <TableRow className="bg-secondary/50">
                <TableHead>Fecha</TableHead>
                {selectedEmp === "all" && <TableHead>Empleado</TableHead>}
                <TableHead>Hora Entrada</TableHead>
                <TableHead>Hora Salida</TableHead>
                <TableHead>Firma Trabajador</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {reportEntries.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center h-24">No hay datos en el periodo seleccionado</TableCell>
                </TableRow>
              ) : (
                reportEntries.map(entry => {
                  const emp = companyEmployees.find(e => e.id === entry.employeeId);
                  return (
                    <TableRow key={entry.id}>
                      <TableCell>{new Date(entry.date).toLocaleDateString('es-ES')}</TableCell>
                      {selectedEmp === "all" && <TableCell>{emp?.name}</TableCell>}
                      <TableCell>{entry.clockIn}</TableCell>
                      <TableCell>{entry.clockOut || '-'}</TableCell>
                      <TableCell className="border-b border-dashed border-muted-foreground/30 w-32"></TableCell>
                    </TableRow>
                  )
                })
              )}
            </TableBody>
          </Table>
        </div>
        
        <div className="pt-16 grid grid-cols-2 gap-8 text-center print:block hidden">
          <div>
            <div className="border-t border-black w-48 mx-auto pt-2">Firma de la Empresa</div>
          </div>
          <div>
            <div className="border-t border-black w-48 mx-auto pt-2">Firma del Trabajador</div>
          </div>
        </div>
      </div>
    </div>
  );
}
