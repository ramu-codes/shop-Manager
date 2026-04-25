import { useState, useMemo } from 'react';
import { useShop } from '@/contexts/ShopContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Plus, Pencil, Trash2, Users, ChevronDown, ChevronUp, CreditCard, Search } from 'lucide-react';
import { toast } from 'sonner';

export default function Customers() {
  const { customers, sales, payments, addCustomer, updateCustomer, deleteCustomer, addPayment } = useShop();
  const [open, setOpen] = useState(false);
  const [editId, setEditId] = useState(null);
  const [form, setForm] = useState({ name: '', phone: '', location: '', dueAmount: 0 });
  const [expandedId, setExpandedId] = useState(null);
  const [search, setSearch] = useState('');
  const [payOpen, setPayOpen] = useState(false);
  const [payForm, setPayForm] = useState({ customerId: '', amount: 0, date: new Date().toISOString().split('T')[0] });

  const reset = () => { setForm({ name: '', phone: '', location: '', dueAmount: 0 }); setEditId(null); };

  const handleSave = () => {
    if (!form.name.trim()) { toast.error('Enter name'); return; }
    if (editId) { updateCustomer(editId, form); toast.success('Updated'); }
    else { addCustomer(form); toast.success('Added'); }
    reset(); setOpen(false);
  };

  const handleEdit = (c) => {
    setForm({ name: c.name, phone: c.phone || '', location: c.location, dueAmount: c.dueAmount });
    setEditId(c._id); setOpen(true);
  };

  const handlePay = () => {
    if (!payForm.customerId) { toast.error('Select customer'); return; }
    const cust = customers.find(c => c._id === payForm.customerId);
    addPayment({ customerId: payForm.customerId, customerName: cust?.name || '', amount: payForm.amount, date: payForm.date });
    toast.success('Payment recorded');
    setPayForm({ customerId: '', amount: 0, date: new Date().toISOString().split('T')[0] });
    setPayOpen(false);
  };

  const getCustomerHistory = (customerId) => sales.filter(s => s.customerId === customerId).sort((a, b) => b.date.localeCompare(a.date));

  const dueCustomers = customers.filter(c => c.dueAmount > 0);

  const filtered = useMemo(() => {
    if (!search.trim()) return customers;
    return customers.filter(c => c.name.toLowerCase().includes(search.toLowerCase()) || c.phone?.includes(search));
  }, [customers, search]);

  return (
    <div className="max-w-4xl mx-auto">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-xl font-bold text-foreground">Customers</h2>
          <p className="text-xs text-muted-foreground">{customers.length} customers • Due: ₹{dueCustomers.reduce((s, c) => s + c.dueAmount, 0).toLocaleString()}</p>
        </div>
        <div className="flex gap-1.5">
          <Dialog open={payOpen} onOpenChange={setPayOpen}>
            <DialogTrigger asChild><Button variant="outline" size="sm" className="gap-1 text-xs"><CreditCard className="h-3.5 w-3.5" />Pay</Button></DialogTrigger>
            <DialogContent>
              <DialogHeader><DialogTitle>Record Payment</DialogTitle></DialogHeader>
              <div className="space-y-3 pt-2">
                <div>
                  <Label className="text-xs">Customer</Label>
                  <Select value={payForm.customerId} onValueChange={v => setPayForm({...payForm, customerId: v})}>
                    <SelectTrigger className="h-10 mt-1"><SelectValue placeholder="Select" /></SelectTrigger>
                    <SelectContent>{dueCustomers.map(c => <SelectItem key={c._id} value={c._id}>{c.name} (Due: ₹{c.dueAmount})</SelectItem>)}</SelectContent>
                  </Select>
                </div>
                <div><Label className="text-xs">Amount (₹)</Label><Input type="number" value={payForm.amount} onChange={e => setPayForm({...payForm, amount: +e.target.value})} className="h-10 mt-1" /></div>
                <div><Label className="text-xs">Date</Label><Input type="date" value={payForm.date} onChange={e => setPayForm({...payForm, date: e.target.value})} className="h-10 mt-1" /></div>
                <Button onClick={handlePay} className="w-full h-10 font-semibold">Record Payment</Button>
              </div>
            </DialogContent>
          </Dialog>
          <Dialog open={open} onOpenChange={(v) => { setOpen(v); if (!v) reset(); }}>
            <DialogTrigger asChild><Button size="sm" className="gap-1 text-xs"><Plus className="h-3.5 w-3.5" />Add</Button></DialogTrigger>
            <DialogContent>
              <DialogHeader><DialogTitle>{editId ? 'Edit' : 'Add'} Customer</DialogTitle></DialogHeader>
              <div className="space-y-3 pt-2">
                <div><Label className="text-xs">Name</Label><Input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} className="h-10 mt-1" /></div>
                <div><Label className="text-xs">Phone</Label><Input value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} className="h-10 mt-1" /></div>
                <div><Label className="text-xs">Location</Label><Input value={form.location} onChange={e => setForm({ ...form, location: e.target.value })} className="h-10 mt-1" /></div>
                <Button onClick={handleSave} className="w-full h-10 font-semibold">{editId ? 'Update' : 'Add'}</Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <div className="relative mb-3">
        <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
        <Input value={search} onChange={e => setSearch(e.target.value)} className="h-9 pl-9 text-sm" placeholder="Search customers..." />
      </div>

      {filtered.length === 0 ? (
        <div className="text-center py-10 text-muted-foreground">
          <Users className="h-8 w-8 mx-auto mb-2 opacity-40" />
          <p className="text-xs">{search ? 'No results' : 'No customers yet'}</p>
        </div>
      ) : (
        <div className="space-y-2">
          {filtered.map(c => {
            const history = getCustomerHistory(c._id);
            const isExpanded = expandedId === c._id;
            return (
              <div key={c._id} className="stat-card">
                <div className="flex items-center justify-between">
                  <div className="flex-1 cursor-pointer" onClick={() => setExpandedId(isExpanded ? null : c._id)}>
                    <p className="font-semibold text-sm">{c.name}</p>
                    <div className="flex gap-2 text-xs text-muted-foreground">
                      {c.phone && <span>📞 {c.phone}</span>}
                      {c.location && <span>📍 {c.location}</span>}
                    </div>
                    {c.dueAmount > 0 && <p className="text-xs text-red-500 font-medium mt-0.5">Due: ₹{c.dueAmount.toLocaleString()}</p>}
                    <p className="text-[10px] text-muted-foreground mt-0.5">{history.length} orders</p>
                  </div>
                  <div className="flex gap-0.5 items-center">
                    <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => setExpandedId(isExpanded ? null : c._id)}>
                      {isExpanded ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />}
                    </Button>
                    <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => handleEdit(c)}><Pencil className="h-3.5 w-3.5" /></Button>
                    <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => { deleteCustomer(c._id); toast.success('Deleted'); }}><Trash2 className="h-3.5 w-3.5 text-destructive" /></Button>
                  </div>
                </div>
                {isExpanded && history.length > 0 && (
                  <div className="mt-2 pt-2 border-t border-border space-y-1">
                    <p className="text-[10px] font-semibold text-muted-foreground">Purchase History</p>
                    {history.slice(0, 10).map(s => (
                      <div key={s._id} className="flex justify-between items-center text-xs py-0.5">
                        <div>
                          <span className="font-medium">{s.invoiceNo}</span>
                          <span className="text-muted-foreground ml-1">{s.items.length} items</span>
                        </div>
                        <div className="text-right">
                          <span className="font-semibold">₹{s.totalBill.toLocaleString()}</span>
                          <span className={`ml-1 text-[10px] ${s.paymentMode === 'Cash' ? 'text-emerald-600' : s.paymentMode === 'Online' ? 'text-blue-500' : 'text-orange-500'}`}>{s.paymentMode}</span>
                          <span className="text-[10px] text-muted-foreground ml-1">{s.date}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
