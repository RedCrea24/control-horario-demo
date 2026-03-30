import { useState } from "react";
import { useActiveCompany, useStore, Employee, TimeEntry } from "@/lib/store";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Download, Printer, ShieldCheck } from "lucide-react";

export default function Reports() {
  const { activeCompany } = useActiveCompany();
  const [employees] = useStore<Employee[]>('employees');
  const [entries] = useStore<TimeEntry[]>('entries');
  
  const [month, setMonth] = useState(new Date().getMonth().toString());
  const [year, setYear] = useState(new Date().getFullYear().toString());
  const [selectedEmp, setSelectedEmp] = useState<string>("all");

  const companyEmployees = employees?.filter(e => e.companyId === activeCompany?.id) || [];
  
  const reportEntries = (entries || []).filter(entry => {
    const entryDate = new Date(entry.date);
    const inMonth = entryDate.getMonth().toString() === month && entryDate.getFullYear().toString() === year;
    const isCompanyEmp = companyEmployees.some(e => e.id === entry.employeeId);
    const isSelectedEmp = selectedEmp === "all" || entry.employeeId === selectedEmp;
    return inMonth && isCompanyEmp && isSelectedEmp;
  }).sort((a, b) => new Date(`${a.date}T${a.clockIn}`).getTime() - new Date(`${b.date}T${b.clockIn}`).getTime());

  const handlePrint = () => window.print();

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center print:hidden">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Auditoría e Informes</h1>
          <p className="text-muted-foreground mt-1">Documentos oficiales para inspección de trabajo</p>
        </div>
        <div className="flex gap-2">
          <Button onClick={handlePrint} className="gap-2">
            <Printer className="w-4 h-4" /> Imprimir Documento Oficial
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
                  <SelectItem key={i} value={i.toString()}>{new Date(2000, i, 1).toLocaleString('es-ES', { month: 'long' })}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>Año</Label>
            <Select value={year} onValueChange={setYear}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                {[2023, 2024, 2025, 2026].map(y => <SelectItem key={y} value={y.toString()}>{y}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2 md:col-span-2">
            <Label>Empleado</Label>
            <Select value={selectedEmp} onValueChange={setSelectedEmp}>
              <SelectTrigger><SelectValue placeholder="Todos los empleados" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Resumen global</SelectItem>
                {companyEmployees.map(emp => <SelectItem key={emp.id} value={emp.id}>{emp.name}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Printable Area - styled explicitly to look like an official document */}
      <div className="print:block space-y-8 bg-white text-black border rounded-xl p-12 shadow-sm print:shadow-none print:border-none print:p-0 min-h-[800px]">
        <div className="flex items-start justify-between border-b-2 border-black pb-6">
          <div className="flex items-center gap-4">
            {activeCompany?.logo ? (
              <img src={activeCompany.logo} alt="Logo" className="w-20 h-20 object-contain grayscale print:grayscale-0" />
            ) : (
              <div className="w-20 h-20 bg-gray-100 border border-gray-300 rounded flex items-center justify-center text-gray-500 font-bold text-sm text-center p-2">
                Logotipo Empresa
              </div>
            )}
            <div>
              <h2 className="text-2xl font-bold font-sans uppercase">{activeCompany?.name}</h2>
              <p className="text-sm text-gray-600">CIF/NIF: {activeCompany?.nif}</p>
              <p className="text-sm text-gray-600">{activeCompany?.address}</p>
            </div>
          </div>
          <div className="text-right">
            <h3 className="font-bold text-xl uppercase tracking-widest text-black">Registro Diario de Jornada</h3>
            <p className="text-sm text-gray-600 mt-1">Art. 34.9 Estatuto de los Trabajadores</p>
            <p className="text-sm font-medium mt-2">
              Periodo: {new Date(parseInt(year), parseInt(month), 1).toLocaleString('es-ES', { month: 'long', year: 'numeric' }).toUpperCase()}
            </p>
          </div>
        </div>

        {selectedEmp !== "all" && (
          <div className="border-2 border-black p-4 grid grid-cols-2 gap-4 text-sm">
            <div><span className="font-bold">Trabajador/a:</span> {companyEmployees.find(e => e.id === selectedEmp)?.name}</div>
            <div><span className="font-bold">NIF/NIE:</span> ___________________</div>
            <div><span className="font-bold">Centro de Trabajo:</span> {activeCompany?.address}</div>
            <div><span className="font-bold">Mes/Año:</span> {parseInt(month)+1}/{year}</div>
          </div>
        )}

        <Table className="border-collapse border border-black w-full text-sm">
          <TableHeader>
            <TableRow className="border-b-2 border-black bg-gray-50 hover:bg-gray-50">
              <TableHead className="border-r border-black font-bold text-black h-10 py-2">Día</TableHead>
              {selectedEmp === "all" && <TableHead className="border-r border-black font-bold text-black h-10 py-2">Empleado</TableHead>}
              <TableHead className="border-r border-black font-bold text-black h-10 py-2">Entrada</TableHead>
              <TableHead className="border-r border-black font-bold text-black h-10 py-2">Salida</TableHead>
              <TableHead className="border-r border-black font-bold text-black h-10 py-2">Estado</TableHead>
              <TableHead className="font-bold text-black h-10 py-2">Firma / Validación</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {reportEntries.map(entry => {
              const emp = companyEmployees.find(e => e.id === entry.employeeId);
              return (
                <TableRow key={entry.id} className="border-b border-black hover:bg-transparent">
                  <TableCell className="border-r border-black py-2">{new Date(entry.date).toLocaleDateString('es-ES')}</TableCell>
                  {selectedEmp === "all" && <TableCell className="border-r border-black py-2">{emp?.name}</TableCell>}
                  <TableCell className="border-r border-black py-2">{entry.clockIn}</TableCell>
                  <TableCell className="border-r border-black py-2">{entry.clockOut || '-'}</TableCell>
                  <TableCell className="border-r border-black py-2 text-xs">
                    {entry.status === 'validated' ? 'Validado' : 'Pendiente'}
                  </TableCell>
                  <TableCell className="py-2 text-[10px] text-gray-500 italic max-w-[200px] truncate">
                    {entry.employeeSignature ? (
                      <div className="flex items-center gap-1"><ShieldCheck className="w-3 h-3"/> {entry.employeeSignature}</div>
                    ) : '____________________'}
                  </TableCell>
                </TableRow>
              )
            })}
          </TableBody>
        </Table>

        <div className="pt-20 grid grid-cols-2 gap-16 text-center">
          <div>
            <div className="border-t border-black w-64 mx-auto pt-2 font-bold mb-4">Firma y Sello de la Empresa</div>
            {activeCompany?.logo && (
              <img src={activeCompany.logo} alt="Logo Sello" className="w-24 h-24 object-contain grayscale print:grayscale-0 mx-auto opacity-50 mb-2" />
            )}
            <p className="text-xs text-gray-500 mt-2">D/Dña. ___________________________</p>
            <p className="text-xs text-gray-500 mt-1">Fecha: {new Date().toLocaleDateString('es-ES')}</p>
          </div>
          <div>
            <div className="border-t border-black w-64 mx-auto pt-2 font-bold mb-4">Firma de la persona trabajadora</div>
            <p className="text-xs text-gray-500 mt-16">Conforme con el registro de horas</p>
            <p className="text-xs text-gray-500 mt-1">Fecha: {new Date().toLocaleDateString('es-ES')}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
