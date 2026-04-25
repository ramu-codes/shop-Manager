import { useState, useMemo } from 'react';
import { useShop } from '@/contexts/ShopContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Plus, TrendingUp, TrendingDown, Pencil, Trash2, Calculator } from 'lucide-react';
import { toast } from 'sonner';

const CATEGORIES = ['Sales', 'Shop Expense', 'Personal', 'Transport', 'Food', 'Supplier Payment', 'Rent', 'Utility', 'Other'];

export default function DailyTracker() {
  const { dailyEntries, addDailyEntry, updateDailyEntry, deleteDailyEntry } = useShop();
  const [open, setOpen] = useState(false);
  const [editId, setEditId] = useState(null);
  const [form, setForm] = useState({
    type: 'revenue',
    title: '', amount: 0, category: 'Other',
    date: new Date().toISOString().split('T')[0],
    time: new Date().toTimeString().slice(0, 5),
  });
  const [viewTab, setViewTab] = useState('daily');
  const [filterDate, setFilterDate] = useState(new Date().toISOString().split('T')[0]);

  const reset = () => {
    setForm({ type: 'revenue', title: '', amount: 0, category: 'Other', date: new Date().toISOString().split('T')[0], time: new Date().toTimeString().slice(0, 5) });
    setEditId(null);
  };

  const handleSave = () => {
    if (!form.title.trim()) { toast.error('Enter title'); return; }
    if (form.amount <= 0) { toast.error('Enter amount'); return; }
    if (editId) { updateDailyEntry(editId, form); toast.success('Updated'); }
    else { addDailyEntry(form); toast.success('Added'); }
    reset(); setOpen(false);
  };

  const handleEdit = (e) => {
    setForm({ type: e.type, title: e.title, amount: e.amount, category: e.category, date: e.date, time: e.time });
    setEditId(e._id); setOpen(true);
  };

  const dailySummary = useMemo(() => {
    const entries = dailyEntries.filter(e => e.date === filterDate);
    const revenue = entries.filter(e => e.type === 'revenue').reduce((s, e) => s + e.amount, 0);
    const expenditure = entries.filter(e => e.type === 'expenditure').reduce((s, e) => s + e.amount, 0);
    return { entries: entries.sort((a, b) => b.time.localeCompare(a.time)), revenue, expenditure, net: revenue - expenditure };
  }, [dailyEntries, filterDate]);

  const weeklySummary = useMemo(() => {
    const today = new Date(filterDate);
    const weekStart = new Date(today);
    weekStart.setDate(today.getDate() - today.getDay());
    const days = Array.from({ length: 7 }, (_, i) => {
      const d = new Date(weekStart); d.setDate(weekStart.getDate() + i);
      const ds = d.toISOString().split('T')[0];
      const dayEntries = dailyEntries.filter(e => e.date === ds);
      return { date: ds, revenue: dayEntries.filter(e => e.type === 'revenue').reduce((s, e) => s + e.amount, 0), expenditure: dayEntries.filter(e => e.type === 'expenditure').reduce((s, e) => s + e.amount, 0) };
    });
    return { days, totalRev: days.reduce((s, d) => s + d.revenue, 0), totalExp: days.reduce((s, d) => s + d.expenditure, 0), net: days.reduce((s, d) => s + d.revenue - d.expenditure, 0) };
  }, [dailyEntries, filterDate]);

  const monthlySummary = useMemo(() => {
    const month = filterDate.slice(0, 7);
    const entries = dailyEntries.filter(e => e.date.startsWith(month));
    const revenue = entries.filter(e => e.type === 'revenue').reduce((s, e) => s + e.amount, 0);
    const expenditure = entries.filter(e => e.type === 'expenditure').reduce((s, e) => s + e.amount, 0);
    const catMap = {};
    entries.forEach(e => {
      if (!catMap[e.category]) catMap[e.category] = { rev: 0, exp: 0 };
      if (e.type === 'revenue') catMap[e.category].rev += e.amount;
      else catMap[e.category].exp += e.amount;
    });
    return { revenue, expenditure, net: revenue - expenditure, categories: Object.entries(catMap) };
  }, [dailyEntries, filterDate]);

  const SummaryCards = ({ rev, exp, net, labels }) => (
    <div className="grid grid-cols-3 gap-2 mb-3">
      <Card className="border-emerald-200 dark:border-emerald-800">
        <CardContent className="pt-3 pb-2 text-center">
          <TrendingUp className="h-4 w-4 mx-auto mb-0.5 text-emerald-600" />
          <p className="text-[10px] text-muted-foreground">{labels[0]}</p>
          <p className="text-sm font-bold text-emerald-600">₹{rev.toLocaleString()}</p>
        </CardContent>
      </Card>
      <Card className="border-red-200 dark:border-red-800">
        <CardContent className="pt-3 pb-2 text-center">
          <TrendingDown className="h-4 w-4 mx-auto mb-0.5 text-red-500" />
          <p className="text-[10px] text-muted-foreground">{labels[1]}</p>
          <p className="text-sm font-bold text-red-500">₹{exp.toLocaleString()}</p>
        </CardContent>
      </Card>
      <Card className={`${net >= 0 ? 'border-emerald-200 dark:border-emerald-800' : 'border-red-200 dark:border-red-800'}`}>
        <CardContent className="pt-3 pb-2 text-center">
          <Calculator className="h-4 w-4 mx-auto mb-0.5 text-primary" />
          <p className="text-[10px] text-muted-foreground">{labels[2]}</p>
          <p className={`text-sm font-bold ${net >= 0 ? 'text-emerald-600' : 'text-red-500'}`}>₹{net.toLocaleString()}</p>
        </CardContent>
      </Card>
    </div>
  );

  return (
    <div className="max-w-4xl mx-auto">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-xl font-bold text-foreground">Daily Tracker</h2>
          <p className="text-xs text-muted-foreground">Revenue & expense calculator</p>
        </div>
        <Dialog open={open} onOpenChange={(v) => { setOpen(v); if (!v) reset(); }}>
          <DialogTrigger asChild><Button size="sm" className="gap-1 text-xs"><Plus className="h-3.5 w-3.5" />Add</Button></DialogTrigger>
          <DialogContent>
            <DialogHeader><DialogTitle>{editId ? 'Edit' : 'Add'} Entry</DialogTitle></DialogHeader>
            <div className="space-y-3 pt-2">
              <div>
                <Label className="text-xs">Type</Label>
                <Select value={form.type} onValueChange={v => setForm({ ...form, type: v  })}>
                  <SelectTrigger className="h-10 mt-1"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="revenue">💰 Revenue</SelectItem>
                    <SelectItem value="expenditure">💸 Expenditure</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div><Label className="text-xs">Title</Label><Input value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} className="h-10 mt-1" placeholder="e.g. Shop sale" /></div>
              <div><Label className="text-xs">Amount (₹)</Label><Input type="number" value={form.amount} onChange={e => setForm({ ...form, amount: +e.target.value })} className="h-10 mt-1" /></div>
              <div>
                <Label className="text-xs">Category</Label>
                <Select value={form.category} onValueChange={v => setForm({ ...form, category: v })}>
                  <SelectTrigger className="h-10 mt-1"><SelectValue /></SelectTrigger>
                  <SelectContent>{CATEGORIES.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div><Label className="text-xs">Date</Label><Input type="date" value={form.date} onChange={e => setForm({ ...form, date: e.target.value })} className="h-10 mt-1" /></div>
                <div><Label className="text-xs">Time</Label><Input type="time" value={form.time} onChange={e => setForm({ ...form, time: e.target.value })} className="h-10 mt-1" /></div>
              </div>
              <Button onClick={handleSave} className="w-full h-10 font-semibold">{editId ? 'Update' : 'Add'}</Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <Input type="date" value={filterDate} onChange={e => setFilterDate(e.target.value)} className="h-9 max-w-[160px] mb-3 text-sm" />

      <Tabs value={viewTab} onValueChange={setViewTab}>
        <TabsList className="mb-3">
          <TabsTrigger value="daily" className="text-xs">Daily</TabsTrigger>
          <TabsTrigger value="weekly" className="text-xs">Weekly</TabsTrigger>
          <TabsTrigger value="monthly" className="text-xs">Monthly</TabsTrigger>
        </TabsList>

        <TabsContent value="daily">
          <SummaryCards rev={dailySummary.revenue} exp={dailySummary.expenditure} net={dailySummary.net} labels={['Revenue', 'Expense', 'Net']} />
          {dailySummary.entries.length === 0 ? (
            <p className="text-center py-8 text-muted-foreground text-xs">No entries for {filterDate}</p>
          ) : (
            <div className="space-y-1.5">
              {dailySummary.entries.map(e => (
                <div key={e._id} className="stat-card flex items-center justify-between py-3">
                  <div className="flex items-center gap-2">
                    <div className={`h-7 w-7 rounded-lg flex items-center justify-center ${e.type === 'revenue' ? 'bg-emerald-100 text-emerald-600 dark:bg-emerald-900' : 'bg-red-100 text-red-500 dark:bg-red-900'}`}>
                      {e.type === 'revenue' ? <TrendingUp className="h-3.5 w-3.5" /> : <TrendingDown className="h-3.5 w-3.5" />}
                    </div>
                    <div>
                      <p className="font-medium text-xs">{e.title}</p>
                      <p className="text-[10px] text-muted-foreground">{e.time} • {e.category}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-1">
                    <span className={`font-bold text-xs ${e.type === 'revenue' ? 'text-emerald-600' : 'text-red-500'}`}>
                      {e.type === 'revenue' ? '+' : '-'}₹{e.amount.toLocaleString()}
                    </span>
                    <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => handleEdit(e)}><Pencil className="h-3 w-3" /></Button>
                    <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => { deleteDailyEntry(e._id); toast.success('Deleted'); }}><Trash2 className="h-3 w-3 text-destructive" /></Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="weekly">
          <SummaryCards rev={weeklySummary.totalRev} exp={weeklySummary.totalExp} net={weeklySummary.net} labels={['Weekly Rev', 'Weekly Exp', 'Net']} />
          <div className="space-y-1.5">
            {weeklySummary.days.map(d => (
              <div key={d.date} className="stat-card flex justify-between items-center py-2.5">
                <span className="text-xs font-medium">{new Date(d.date).toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'short' })}</span>
                <div className="flex gap-3 text-xs">
                  <span className="text-emerald-600 font-medium">+₹{d.revenue.toLocaleString()}</span>
                  <span className="text-red-500 font-medium">-₹{d.expenditure.toLocaleString()}</span>
                  <span className={`font-bold ${d.revenue - d.expenditure >= 0 ? 'text-emerald-600' : 'text-red-500'}`}>₹{(d.revenue - d.expenditure).toLocaleString()}</span>
                </div>
              </div>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="monthly">
          <SummaryCards rev={monthlySummary.revenue} exp={monthlySummary.expenditure} net={monthlySummary.net} labels={['Monthly Rev', 'Monthly Exp', 'Net']} />
          {monthlySummary.categories.length > 0 && (
            <Card>
              <CardContent className="pt-3 pb-3">
                <p className="text-xs font-semibold mb-2">Category Breakdown</p>
                <div className="space-y-1.5">
                  {monthlySummary.categories.map(([cat, data]) => (
                    <div key={cat} className="flex justify-between items-center py-1 border-b border-border last:border-0 text-xs">
                      <span className="font-medium">{cat}</span>
                      <div className="flex gap-2">
                        {data.rev > 0 && <span className="text-emerald-600">+₹{data.rev.toLocaleString()}</span>}
                        {data.exp > 0 && <span className="text-red-500">-₹{data.exp.toLocaleString()}</span>}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
