import { useState, useMemo } from 'react';
import { useShop } from '@/contexts/ShopContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent } from '@/components/ui/card';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator } from '@/components/ui/dropdown-menu';
import { Plus, Trash2, IndianRupee, ChevronLeft, ChevronRight, MoreVertical, Pencil, Users, Calendar, Wallet } from 'lucide-react';
import { toast } from 'sonner';

export default function Employees() {
  const { employees, attendance, salaryPayments, addEmployee, updateEmployee, deleteEmployee, markAttendance, addSalaryPayment } = useShop();
  const [open, setOpen] = useState(false);
  const [editId, setEditId] = useState(null);
  const [form, setForm] = useState({ name: '', phone: '', role: '', salary: 0, joinDate: new Date().toISOString().split('T')[0] });
  const [calMonth, setCalMonth] = useState(new Date().toISOString().slice(0, 7));
  const [salaryOpen, setSalaryOpen] = useState(false);
  const [salaryForm, setSalaryForm] = useState({ employeeId: '', amount: 0, month: new Date().toISOString().slice(0, 7), date: new Date().toISOString().split('T')[0], note: '' });

  const handleSave = () => {
    if (!form.name.trim()) { toast.error('Enter name'); return; }
    if (editId) { updateEmployee(editId, form); toast.success('Updated'); }
    else { addEmployee(form); toast.success('Added'); }
    setForm({ name: '', phone: '', role: '', salary: 0, joinDate: new Date().toISOString().split('T')[0] });
    setEditId(null); setOpen(false);
  };

  const startEdit = (e) => {
    setEditId(e._id);
    setForm({ name: e.name, phone: e.phone, role: e.role, salary: e.salary, joinDate: e.joinDate });
    setOpen(true);
  };

  const handlePaySalary = () => {
    const emp = employees.find(e => e._id === salaryForm.employeeId);
    if (!emp) { toast.error('Select employee'); return; }
    addSalaryPayment({ ...salaryForm, employeeName: emp.name });
    toast.success('Salary paid');
    setSalaryForm({ employeeId: '', amount: 0, month: new Date().toISOString().slice(0, 7), date: new Date().toISOString().split('T')[0], note: '' });
    setSalaryOpen(false);
  };

  const calendarData = useMemo(() => {
    const [year, month] = calMonth.split('-').map(Number);
    const daysInMonth = new Date(year, month, 0).getDate();
    return Array.from({ length: daysInMonth }, (_, i) => ({
      date: `${calMonth}-${String(i + 1).padStart(2, '0')}`,
      day: i + 1
    }));
  }, [calMonth]);

  const getStatus = (empId, date) => attendance.find(x => x.employeeId === empId && x.date === date)?.status || null;

  const statusColor = (s) => {
    if (s === 'Present') return 'bg-emerald-500 text-white';
    if (s === 'Absent') return 'bg-red-500 text-white';
    if (s === 'Half Day') return 'bg-yellow-500 text-white';
    return 'bg-muted text-muted-foreground';
  };

  const statusLabel = (s) => s === 'Present' ? 'P' : s === 'Absent' ? 'A' : s === 'Half Day' ? 'H' : '—';

  const cycleStatus = (empId, date) => {
    const current = getStatus(empId, date);
    const next = !current ? 'Present' : current === 'Present' ? 'Absent' : current === 'Absent' ? 'Half Day' : 'Present';
    markAttendance({ employeeId: empId, date, status: next });
  };

  const prevMonth = () => { const [y, m] = calMonth.split('-').map(Number); setCalMonth(new Date(y, m - 2, 1).toISOString().slice(0, 7)); };
  const nextMonth = () => { const [y, m] = calMonth.split('-').map(Number); setCalMonth(new Date(y, m, 1).toISOString().slice(0, 7)); };

  const monthlySummary = useMemo(() => {
    return employees.map(emp => {
      const monthAtt = attendance.filter(a => a.employeeId === emp._id && a.date.startsWith(calMonth));
      const present = monthAtt.filter(a => a.status === 'Present').length;
      const absent = monthAtt.filter(a => a.status === 'Absent').length;
      const halfDay = monthAtt.filter(a => a.status === 'Half Day').length;
      const paid = salaryPayments.filter(p => p.employeeId === emp._id && p.month === calMonth).reduce((s, p) => s + p.amount, 0);
      return { ...emp, present, absent, halfDay, paid };
    });
  }, [employees, attendance, salaryPayments, calMonth]);

  return (
    <div className="max-w-4xl mx-auto">
      <div className="flex items-center justify-between mb-5">
        <div>
          <h2 className="text-2xl font-black text-foreground flex items-center gap-2">
            <Users className="h-6 w-6 text-primary" /> Employees
          </h2>
          <p className="text-sm text-muted-foreground font-medium">{employees.length} staff members</p>
        </div>
        <div className="flex gap-2">
          <Dialog open={salaryOpen} onOpenChange={setSalaryOpen}>
            <DialogTrigger asChild><Button variant="outline" size="default" className="gap-2 font-bold h-11"><IndianRupee className="h-4 w-4" />Pay</Button></DialogTrigger>
            <DialogContent>
              <DialogHeader><DialogTitle className="text-lg font-black">Pay Salary</DialogTitle></DialogHeader>
              <div className="space-y-4 pt-2">
                <div>
                  <Label className="text-xs font-bold">Employee</Label>
                  <Select value={salaryForm.employeeId} onValueChange={v => {
                    const emp = employees.find(e => e._id === v);
                    setSalaryForm({ ...salaryForm, employeeId: v, amount: emp?.salary || 0 });
                  }}>
                    <SelectTrigger className="h-11 mt-1"><SelectValue placeholder="Select" /></SelectTrigger>
                    <SelectContent>{employees.map(e => <SelectItem key={e._id} value={e._id}>{e.name} - ₹{e.salary.toLocaleString()}</SelectItem>)}</SelectContent>
                  </Select>
                </div>
                <div><Label className="text-xs font-bold">Amount (₹)</Label><Input type="number" value={salaryForm.amount} onChange={e => setSalaryForm({ ...salaryForm, amount: +e.target.value })} className="h-11 mt-1" /></div>
                <div><Label className="text-xs font-bold">Month</Label><Input type="month" value={salaryForm.month} onChange={e => setSalaryForm({ ...salaryForm, month: e.target.value })} className="h-11 mt-1" /></div>
                <div><Label className="text-xs font-bold">Date</Label><Input type="date" value={salaryForm.date} onChange={e => setSalaryForm({ ...salaryForm, date: e.target.value })} className="h-11 mt-1" /></div>
                <div><Label className="text-xs font-bold">Note</Label><Input value={salaryForm.note} onChange={e => setSalaryForm({ ...salaryForm, note: e.target.value })} className="h-11 mt-1" placeholder="Optional" /></div>
                <Button onClick={handlePaySalary} className="w-full h-12 font-black text-base">Pay Salary</Button>
              </div>
            </DialogContent>
          </Dialog>
          <Dialog open={open} onOpenChange={(o) => { setOpen(o); if (!o) { setEditId(null); setForm({ name: '', phone: '', role: '', salary: 0, joinDate: new Date().toISOString().split('T')[0] }); } }}>
            <DialogTrigger asChild><Button size="default" className="gap-2 font-bold h-11"><Plus className="h-4 w-4" />Add</Button></DialogTrigger>
            <DialogContent>
              <DialogHeader><DialogTitle className="text-lg font-black">{editId ? 'Edit' : 'Add'} Employee</DialogTitle></DialogHeader>
              <div className="space-y-4 pt-2">
                <div><Label className="text-xs font-bold">Name</Label><Input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} className="h-11 mt-1" /></div>
                <div><Label className="text-xs font-bold">Phone</Label><Input value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} className="h-11 mt-1" /></div>
                <div><Label className="text-xs font-bold">Role</Label><Input value={form.role} onChange={e => setForm({ ...form, role: e.target.value })} className="h-11 mt-1" placeholder="e.g. Cashier" /></div>
                <div><Label className="text-xs font-bold">Salary (₹)</Label><Input type="number" value={form.salary} onChange={e => setForm({ ...form, salary: +e.target.value })} className="h-11 mt-1" /></div>
                <div><Label className="text-xs font-bold">Join Date</Label><Input type="date" value={form.joinDate} onChange={e => setForm({ ...form, joinDate: e.target.value })} className="h-11 mt-1" /></div>
                <Button onClick={handleSave} className="w-full h-12 font-black text-base">{editId ? 'Update' : 'Add'}</Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <Tabs defaultValue="grid">
        <TabsList className="mb-4">
          <TabsTrigger value="grid" className="text-sm font-bold gap-1.5"><Calendar className="h-4 w-4" /> Attendance</TabsTrigger>
          <TabsTrigger value="list" className="text-sm font-bold gap-1.5"><Users className="h-4 w-4" /> Staff</TabsTrigger>
          <TabsTrigger value="salary" className="text-sm font-bold gap-1.5"><Wallet className="h-4 w-4" /> Salary</TabsTrigger>
        </TabsList>

        <TabsContent value="grid">
          <div className="flex items-center justify-between mb-3">
            <Button variant="ghost" size="icon" className="h-9 w-9" onClick={prevMonth}><ChevronLeft className="h-5 w-5" /></Button>
            <h3 className="font-black text-sm">{new Date(calMonth + '-01').toLocaleString('default', { month: 'long', year: 'numeric' })}</h3>
            <Button variant="ghost" size="icon" className="h-9 w-9" onClick={nextMonth}><ChevronRight className="h-5 w-5" /></Button>
          </div>

          {employees.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <Users className="h-10 w-10 mx-auto mb-3 opacity-40" />
              <p className="text-sm font-medium">No employees yet</p>
            </div>
          ) : (
            <div className="overflow-x-auto border-2 border-border rounded-2xl">
              <table className="w-full text-[11px]">
                <thead>
                  <tr className="bg-muted">
                    <th className="sticky left-0 bg-muted px-3 py-2 text-left font-black min-w-[90px] border-r border-border">Name</th>
                    {calendarData.map(d => (
                      <th key={d.date} className="px-0.5 py-2 text-center font-bold min-w-[28px] border-r border-border">{d.day}</th>
                    ))}
                    <th className="px-2 py-2 text-center font-black min-w-[30px] text-emerald-600">P</th>
                    <th className="px-2 py-2 text-center font-black min-w-[30px] text-red-500">A</th>
                    <th className="px-2 py-2 text-center font-black min-w-[30px] text-yellow-600">H</th>
                  </tr>
                </thead>
                <tbody>
                  {monthlySummary.map(emp => (
                    <tr key={emp._id} className="border-t border-border hover:bg-muted/50">
                      <td className="sticky left-0 bg-card px-3 py-1.5 font-bold border-r border-border">
                        <div className="truncate max-w-[90px]">{emp.name}</div>
                      </td>
                      {calendarData.map(d => {
                        const status = getStatus(emp._id, d.date);
                        return (
                          <td key={d.date} className="px-0 py-0.5 text-center border-r border-border">
                            <button onClick={() => cycleStatus(emp._id, d.date)}
                              className={`w-6 h-6 rounded-lg text-[10px] font-black ${statusColor(status)} hover:opacity-80 transition-opacity`}>
                              {statusLabel(status)}
                            </button>
                          </td>
                        );
                      })}
                      <td className="px-1 py-1 text-center font-black text-emerald-600">{emp.present}</td>
                      <td className="px-1 py-1 text-center font-black text-red-500">{emp.absent}</td>
                      <td className="px-1 py-1 text-center font-black text-yellow-600">{emp.halfDay}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          <div className="flex gap-4 mt-3 text-xs font-bold">
            <div className="flex items-center gap-1.5"><div className="w-4 h-4 rounded bg-emerald-500" /><span>Present</span></div>
            <div className="flex items-center gap-1.5"><div className="w-4 h-4 rounded bg-red-500" /><span>Absent</span></div>
            <div className="flex items-center gap-1.5"><div className="w-4 h-4 rounded bg-yellow-500" /><span>Half Day</span></div>
          </div>
        </TabsContent>

        <TabsContent value="list">
          {employees.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <Users className="h-10 w-10 mx-auto mb-3 opacity-40" /><p className="text-sm font-medium">No employees</p>
            </div>
          ) : (
            <div className="space-y-3">
              {monthlySummary.map(e => (
                <Card key={e._id} className="border-2 border-border hover:border-primary/30 transition-all">
                  <CardContent className="py-4 px-5">
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="font-black text-base">{e.name}</p>
                        <p className="text-sm text-muted-foreground font-medium">{e.role} • {e.phone}</p>
                        <p className="text-xs text-muted-foreground mt-0.5">₹{e.salary.toLocaleString()}/mo • Joined: {e.joinDate}</p>
                      </div>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-8 w-8"><MoreVertical className="h-4 w-4" /></Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => startEdit(e)} className="gap-2"><Pencil className="h-4 w-4" /> Edit</DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem onClick={() => { deleteEmployee(e._id); toast.success('Deleted'); }} className="gap-2 text-destructive"><Trash2 className="h-4 w-4" /> Delete</DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                    <div className="flex gap-3 mt-2 text-xs">
                      <span className="bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-bold px-2 py-1 rounded-lg">P: {e.present}</span>
                      <span className="bg-red-500/10 text-red-500 font-bold px-2 py-1 rounded-lg">A: {e.absent}</span>
                      <span className="bg-yellow-500/10 text-yellow-600 font-bold px-2 py-1 rounded-lg">H: {e.halfDay}</span>
                      <span className="bg-muted font-bold px-2 py-1 rounded-lg">Paid: ₹{e.paid.toLocaleString()}</span>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="salary">
          {salaryPayments.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <Wallet className="h-10 w-10 mx-auto mb-3 opacity-40" /><p className="text-sm font-medium">No salary payments</p>
            </div>
          ) : (
            <div className="space-y-3">
              {[...salaryPayments].reverse().map(p => (
                <Card key={p._id} className="border-2 border-border hover:border-primary/30 transition-all">
                  <CardContent className="py-4 px-5 flex justify-between items-center">
                    <div>
                      <p className="font-black text-base">{p.employeeName}</p>
                      <p className="text-sm text-muted-foreground font-medium">{p.month} • {p.date}</p>
                      {p.note && <p className="text-xs text-muted-foreground">{p.note}</p>}
                    </div>
                    <span className="font-black text-lg text-primary">₹{p.amount.toLocaleString()}</span>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
