import { useState } from 'react';
import { useShop } from '@/contexts/ShopContext';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Plus, Trash2, TrendingDown, Filter, Wallet } from 'lucide-react';
import { toast } from 'sonner';

const CATEGORIES = ['Rent', 'Electricity', 'Salary', 'Transport', 'Packaging', 'Marketing', 'Maintenance', 'Other'];

export default function Expenditure() {
  const { expenses, addExpense } = useShop();
  const [open, setOpen] = useState(false);
  const [category, setCategory] = useState('');
  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [filterMonth, setFilterMonth] = useState(new Date().toISOString().slice(0, 7));

  const handleAdd = (e) => {
    e.preventDefault();
    if (!category || !amount || !date) { toast.error('Fill all fields'); return; }
    addExpense({ category, amount: Number(amount), title: description, date });
    toast.success('Expense added');
    setCategory(''); setAmount(''); setDescription('');
    setOpen(false);
  };

  const filtered = expenses.filter(e => e.date.startsWith(filterMonth)).sort((a, b) => b.date.localeCompare(a.date));
  const totalFiltered = filtered.reduce((s, e) => s + e.amount, 0);

  const byCategory = {};
  filtered.forEach(e => { byCategory[e.category || 'Other'] = (byCategory[e.category || 'Other'] || 0) + e.amount; });

  return (
    <div className="max-w-3xl mx-auto">
      <div className="flex items-center justify-between mb-5">
        <div>
          <h2 className="text-2xl font-black text-foreground flex items-center gap-2">
            <TrendingDown className="h-6 w-6 text-destructive" /> Expenditure
          </h2>
          <p className="text-sm text-muted-foreground font-medium">Track all shop expenses</p>
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button size="default" className="gap-2 font-bold h-11"><Plus className="h-4 w-4" /> Add</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader><DialogTitle className="text-lg font-black">Add Expense</DialogTitle></DialogHeader>
            <form onSubmit={handleAdd} className="space-y-4 pt-2">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label className="text-xs font-bold">Category</Label>
                  <Select value={category} onValueChange={setCategory}>
                    <SelectTrigger className="mt-1 h-11"><SelectValue placeholder="Select" /></SelectTrigger>
                    <SelectContent>
                      {CATEGORIES.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label className="text-xs font-bold">Amount (₹)</Label>
                  <Input type="number" value={amount} onChange={e => setAmount(e.target.value)} placeholder="0" className="mt-1 h-11" />
                </div>
              </div>
              <div>
                <Label className="text-xs font-bold">Description</Label>
                <Input value={description} onChange={e => setDescription(e.target.value)} placeholder="Optional note" className="mt-1 h-11" />
              </div>
              <div>
                <Label className="text-xs font-bold">Date</Label>
                <Input type="date" value={date} onChange={e => setDate(e.target.value)} className="mt-1 h-11" />
              </div>
              <Button type="submit" className="w-full h-12 font-black text-base">Add Expense</Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Filter & Total */}
      <div className="flex items-center gap-3 mb-5">
        <div className="flex items-center gap-2">
          <Filter className="h-4 w-4 text-muted-foreground" />
          <Input type="month" value={filterMonth} onChange={e => setFilterMonth(e.target.value)} className="h-10 w-44 text-sm" />
        </div>
        <div className="ml-auto text-right">
          <p className="text-xs text-muted-foreground font-semibold">Total</p>
          <p className="text-2xl font-black text-destructive">₹{totalFiltered.toLocaleString()}</p>
        </div>
      </div>

      {/* Category Breakdown */}
      {Object.keys(byCategory).length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-5">
          {Object.entries(byCategory).sort((a, b) => b[1] - a[1]).map(([cat, amt]) => (
            <div key={cat} className="rounded-2xl bg-destructive/5 dark:bg-destructive/10 border-2 border-destructive/10 p-3 text-center">
              <p className="text-xs text-muted-foreground font-bold">{cat}</p>
              <p className="text-base font-black text-destructive">₹{amt.toLocaleString()}</p>
            </div>
          ))}
        </div>
      )}

      {/* List */}
      <div className="space-y-3">
        {filtered.length === 0 && (
          <div className="text-center py-12 text-muted-foreground">
            <Wallet className="h-10 w-10 mx-auto mb-3 opacity-40" />
            <p className="text-sm font-medium">No expenses this month</p>
          </div>
        )}
        {filtered.map(e => (
          <Card key={e._id} className="border-2 border-border hover:border-destructive/30 transition-all">
            <CardContent className="py-4 px-5 flex items-center justify-between">
              <div>
                <p className="text-base font-bold text-foreground">{e.category || 'Other'}</p>
                {e.title && <p className="text-sm text-muted-foreground">{e.title}</p>}
                <p className="text-xs text-muted-foreground mt-0.5 font-medium">{e.date}</p>
              </div>
              <p className="text-xl font-black text-destructive">₹{e.amount.toLocaleString()}</p>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
