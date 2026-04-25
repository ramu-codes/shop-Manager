
import { useShop } from '@/contexts/ShopContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Package, Users, UserCheck, TrendingUp, TrendingDown, AlertCircle,
  ShoppingCart, Wallet, UserCheck2, Eye, EyeOff, Store, Clock,
  CreditCard, Star, Zap, Target, BarChart2, ArrowUpRight, ArrowDownRight,
  Gift, Activity, RefreshCw, Award
} from 'lucide-react';
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, CartesianGrid, AreaChart, Area,
  LineChart, Line, Legend, RadarChart, Radar, PolarGrid,
  PolarAngleAxis, PolarRadiusAxis, ComposedChart
} from 'recharts';
import { useMemo, useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';

const COLORS = ['#0f766e', '#f59e0b', '#3b82f6', '#ef4444', '#10b981', '#8b5cf6', '#f97316', '#06b6d4'];

/* ─── Helpers ────────────────────────────────────────────── */
const fmt = (n) => `₹${Number(n || 0).toLocaleString('en-IN')}`;
const pct = (a, b) => (b > 0 ? (((a - b) / b) * 100).toFixed(1) : 0);

function DeltaBadge({ current, previous }) {
  const diff = pct(current, previous);
  const up = diff >= 0;
  return (
    <span className={`inline-flex items-center gap-0.5 text-xs font-black px-2 py-0.5 rounded-full ${up ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400' : 'bg-red-500/10 text-red-500'}`}>
      {up ? <ArrowUpRight className="h-3 w-3" /> : <ArrowDownRight className="h-3 w-3" />}
      {Math.abs(diff)}%
    </span>
  );
}

/* ─── Custom Tooltip ─────────────────────────────────────── */
const CustomTooltip = ({ active, payload, label, prefix = '₹' }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-card border border-border rounded-lg shadow-lg p-3 text-xs font-bold">
        {label && <p className="text-muted-foreground mb-1">{label}</p>}
        {payload.map((p, i) => (
          <p key={i} style={{ color: p.color }}>{p.name}: {prefix}{Number(p.value).toLocaleString('en-IN')}</p>
        ))}
      </div>
    );
  }
  return null;
};

/* ─── Section Header ─────────────────────────────────────── */
function SectionTitle({ icon: Icon, title, color = 'text-primary', sub }) {
  return (
    <div className="flex items-center gap-3 mb-6">
      <div className={`p-2 rounded-lg bg-primary/10`}>
        <Icon className={`h-5 w-5 ${color}`} />
      </div>
      <div>
        <h2 className="text-xl font-black uppercase tracking-widest text-foreground">{title}</h2>
        {sub && <p className="text-xs text-muted-foreground font-bold uppercase tracking-wider">{sub}</p>}
      </div>
    </div>
  );
}

/* ─── Main Component ─────────────────────────────────────── */
export default function Dashboard() {

  /* Live clock */
  const [now, setNow] = useState(new Date());
  useEffect(() => {
    const t = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(t);
  }, []);

  const formattedDate = now.toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' });
  const formattedTime = now.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', second: '2-digit' });

  /* Context */
  const { customers = [], sellers = [], products = [], sales = [], expenses = [], purchases = [], employees = [], salaryPayments = [], payments = [], shopName } = useShop();
  const [showAdmin, setShowAdmin] = useState(false);
  const [compareMode, setCompareMode] = useState('weekly'); // 'weekly' | 'monthly'
  const navigate = useNavigate();

  /* ── Date helpers ── */
  const today = new Date().toISOString().split('T')[0];
  const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];
  const currentMonth = new Date().toISOString().slice(0, 7);
  const lastMonth = new Date(new Date().setMonth(new Date().getMonth() - 1)).toISOString().slice(0, 7);
  const currentWeekStart = (() => { const d = new Date(); d.setDate(d.getDate() - d.getDay()); return d.toISOString().split('T')[0]; })();
  const lastWeekStart = (() => { const d = new Date(); d.setDate(d.getDate() - d.getDay() - 7); return d.toISOString().split('T')[0]; })();
  const lastWeekEnd = (() => { const d = new Date(); d.setDate(d.getDate() - d.getDay() - 1); return d.toISOString().split('T')[0]; })();

  /* ── Aggregates ── */
  const totalSales = sales.reduce((s, x) => s + x.totalBill, 0);
  const totalExpenses = expenses.reduce((s, x) => s + x.amount, 0);
  const totalPurchases = purchases.reduce((s, x) => s + x.totalAmount, 0);
  const totalDue = customers.reduce((s, c) => s + (c.dueAmount || 0), 0);
  const totalSalaryPaid = salaryPayments.reduce((s, p) => s + p.amount, 0);
  const totalInvestment = totalPurchases + totalExpenses + totalSalaryPaid;
  const profit = totalSales - totalInvestment;
  const totalPaymentsReceived = payments.reduce((s, p) => s + p.amount, 0);
  const profitMargin = totalSales > 0 ? ((profit / totalSales) * 100).toFixed(1) : 0;

  /* ── Today vs Yesterday ── */
  const todaySales = sales.filter(s => s.date === today).reduce((s, x) => s + x.totalBill, 0);
  const yesterdaySales = sales.filter(s => s.date === yesterday).reduce((s, x) => s + x.totalBill, 0);
  const todayExpenses = expenses.filter(e => e.date === today).reduce((s, x) => s + x.amount, 0);
  const yesterdayExpenses = expenses.filter(e => e.date === yesterday).reduce((s, x) => s + x.amount, 0);
  const todayOrders = sales.filter(s => s.date === today).length;
  const yesterdayOrders = sales.filter(s => s.date === yesterday).length;
  const todayCustomers = [...new Set(sales.filter(s => s.date === today).map(s => s.customerId))].length;

  /* ── Monthly ── */
  const monthlySales = sales.filter(s => s.date.startsWith(currentMonth)).reduce((s, x) => s + x.totalBill, 0);
  const lastMonthlySales = sales.filter(s => s.date.startsWith(lastMonth)).reduce((s, x) => s + x.totalBill, 0);
  const monthlyExpenses = expenses.filter(e => e.date.startsWith(currentMonth)).reduce((s, x) => s + x.amount, 0);
  const lastMonthlyExpenses = expenses.filter(e => e.date.startsWith(lastMonth)).reduce((s, x) => s + x.amount, 0);
  const monthlyPurchases = purchases.filter(p => p.date.startsWith(currentMonth)).reduce((s, x) => s + x.totalAmount, 0);
  const monthlySalary = salaryPayments.filter(p => p.month === currentMonth).reduce((s, x) => s + x.amount, 0);
  const monthlyProfit = monthlySales - monthlyPurchases - monthlyExpenses - monthlySalary;

  /* ── Weekly ── */
  const weekSales = sales.filter(s => s.date >= currentWeekStart).reduce((s, x) => s + x.totalBill, 0);
  const lastWeekSales = sales.filter(s => s.date >= lastWeekStart && s.date <= lastWeekEnd).reduce((s, x) => s + x.totalBill, 0);

  /* ── Last 7 days trend ── */
  const last7Days = Array.from({ length: 7 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - 6 + i);
    return d.toISOString().split('T')[0];
  });

  const salesTrend = last7Days.map(date => ({
    name: new Date(date).toLocaleDateString('en-IN', { weekday: 'short' }),
    Sales: sales.filter(s => s.date === date).reduce((sum, s) => sum + s.totalBill, 0),
    Expenses: expenses.filter(e => e.date === date).reduce((sum, e) => sum + e.amount, 0),
  }));

  /* ── Last 12 weeks / months for comparison chart ── */
  const trendData = useMemo(() => {
    if (compareMode === 'weekly') {
      return Array.from({ length: 8 }, (_, i) => {
        const weekStart = new Date();
        weekStart.setDate(weekStart.getDate() - weekStart.getDay() - (7 * (7 - i)));
        const weekEnd = new Date(weekStart);
        weekEnd.setDate(weekStart.getDate() + 6);
        const ws = weekStart.toISOString().split('T')[0];
        const we = weekEnd.toISOString().split('T')[0];
        return {
          name: `W${i + 1}`,
          Sales: sales.filter(s => s.date >= ws && s.date <= we).reduce((sum, s) => sum + s.totalBill, 0),
          Expenses: expenses.filter(e => e.date >= ws && e.date <= we).reduce((sum, e) => sum + e.amount, 0),
          Profit: sales.filter(s => s.date >= ws && s.date <= we).reduce((sum, s) => sum + s.totalBill, 0) -
            expenses.filter(e => e.date >= ws && e.date <= we).reduce((sum, e) => sum + e.amount, 0),
        };
      });
    } else {
      return Array.from({ length: 6 }, (_, i) => {
        const d = new Date();
        d.setMonth(d.getMonth() - (5 - i));
        const m = d.toISOString().slice(0, 7);
        return {
          name: d.toLocaleDateString('en-IN', { month: 'short' }),
          Sales: sales.filter(s => s.date.startsWith(m)).reduce((sum, s) => sum + s.totalBill, 0),
          Expenses: expenses.filter(e => e.date.startsWith(m)).reduce((sum, e) => sum + e.amount, 0),
          Profit: sales.filter(s => s.date.startsWith(m)).reduce((sum, s) => sum + s.totalBill, 0) -
            expenses.filter(e => e.date.startsWith(m)).reduce((sum, e) => sum + e.amount, 0),
        };
      });
    }
  }, [sales, expenses, compareMode]);

  /* ── Product data ── */
  const productPerformance = useMemo(() => {
    const map = {};
    products.forEach(p => { map[p._id] = { name: p.itemName, qty: 0, revenue: 0, stock: p.stock || 0 }; });
    sales.forEach(s => s.items.forEach(i => {
      if (map[i.productId]) {
        map[i.productId].qty += i.quantity;
        map[i.productId].revenue += (i.price || 0) * i.quantity;
      }
    }));
    const sorted = Object.values(map).sort((a, b) => b.qty - a.qty);
    return { top: sorted.slice(0, 6), least: [...sorted].reverse().slice(0, 6) };
  }, [sales, products]);

  // Stock health segmentation
  const stockHealth = useMemo(() => {
    const outOfStock = products.filter(p => (p.stock || 0) === 0).length;
    const critical = products.filter(p => (p.stock || 0) > 0 && (p.stock || 0) <= 5).length;
    const low = products.filter(p => (p.stock || 0) > 5 && (p.stock || 0) <= 20).length;
    const healthy = products.filter(p => (p.stock || 0) > 20).length;
    return [
      { name: 'Out of Stock', value: outOfStock, color: '#ef4444' },
      { name: 'Critical (≤5)', value: critical, color: '#f97316' },
      { name: 'Low (6–20)', value: low, color: '#f59e0b' },
      { name: 'Healthy (20+)', value: healthy, color: '#10b981' },
    ].filter(d => d.value > 0);
  }, [products]);

  // Total items dispensed to employees (if tracking)
  const totalItemsSold = useMemo(() => sales.reduce((s, sale) => s + (sale.items?.reduce((ss, i) => ss + i.quantity, 0) || 0), 0), [sales]);
  const avgOrderValue = sales.length > 0 ? (totalSales / sales.length) : 0;
  const repeatCustomers = useMemo(() => {
    const map = {};
    sales.forEach(s => { map[s.customerId] = (map[s.customerId] || 0) + 1; });
    return Object.values(map).filter(v => v > 1).length;
  }, [sales]);

  /* ── Customer data ── */
  const customerLoyalty = useMemo(() => {
    const map = {};
    sales.forEach(s => {
      if (!map[s.customerId]) map[s.customerId] = { name: s.customerName, visits: 0, total: 0, lastVisit: s.date };
      map[s.customerId].visits++;
      map[s.customerId].total += s.totalBill;
      if (s.date > map[s.customerId].lastVisit) map[s.customerId].lastVisit = s.date;
    });
    const list = Object.values(map);
    return {
      byRevenue: [...list].sort((a, b) => b.total - a.total).slice(0, 5),
      byVisits: [...list].sort((a, b) => b.visits - a.visits).slice(0, 5),
    };
  }, [sales]);

  // Purchase frequency distribution
  const purchaseFrequency = useMemo(() => {
    const map = {};
    sales.forEach(s => { map[s.customerId] = (map[s.customerId] || 0) + 1; });
    const bins = { '1 visit': 0, '2–3 visits': 0, '4–6 visits': 0, '7+ visits': 0 };
    Object.values(map).forEach(v => {
      if (v === 1) bins['1 visit']++;
      else if (v <= 3) bins['2–3 visits']++;
      else if (v <= 6) bins['4–6 visits']++;
      else bins['7+ visits']++;
    });
    return Object.entries(bins).map(([name, value]) => ({ name, value }));
  }, [sales]);

  /* ── Expense by category ── */
  const expenseByCategory = useMemo(() => {
    const map = {};
    expenses.forEach(e => { map[e.category || 'Other'] = (map[e.category || 'Other'] || 0) + e.amount; });
    return Object.entries(map).map(([name, value]) => ({ name, value })).sort((a, b) => b.value - a.value);
  }, [expenses]);

  /* ── Employee salary utilization ── */
  const salaryUtilization = useMemo(() => {
    return employees.map(emp => {
      const paid = salaryPayments.filter(p => p.employeeId === emp._id).reduce((s, p) => s + p.amount, 0);
      return { name: emp.name?.split(' ')[0] || 'Emp', salary: emp.salary || 0, paid, balance: Math.max(0, (emp.salary || 0) - paid) };
    }).slice(0, 6);
  }, [employees, salaryPayments]);

  /* ── Low stock ── */
  const lowStockProducts = useMemo(() =>
    products.filter(p => (p.stock || 0) <= 5).sort((a, b) => (a.stock || 0) - (b.stock || 0)).slice(0, 8),
    [products]);

  /* ── Admin stats ── */
  const adminStats = [
    { label: 'Total Revenue', value: totalSales, icon: TrendingUp, color: 'text-emerald-600 dark:text-emerald-400', bg: 'bg-emerald-500/10', route: '/sales' },
    { label: 'Total Expenses', value: totalExpenses, icon: TrendingDown, color: 'text-red-500 dark:text-red-400', bg: 'bg-red-500/10', route: '/expenditure' },
    { label: 'Total Due', value: totalDue, icon: AlertCircle, color: 'text-orange-500 dark:text-orange-400', bg: 'bg-orange-500/10', route: '/customers' },
    { label: 'Investment', value: totalInvestment, icon: ShoppingCart, color: 'text-blue-500 dark:text-blue-400', bg: 'bg-blue-500/10', route: '/sellers' },
    { label: 'Net Profit', value: profit, icon: Wallet, color: profit >= 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-500', bg: profit >= 0 ? 'bg-emerald-500/10' : 'bg-red-500/10', route: '/daily-tracker' },
    { label: 'Salary Paid', value: totalSalaryPaid, icon: UserCheck2, color: 'text-purple-500 dark:text-purple-400', bg: 'bg-purple-500/10', route: '/employees' },
  ];

  const quickStats = [
    { label: 'Products', value: products.length, icon: Package, route: '/products' },
    { label: 'Customers', value: customers.length, icon: Users, route: '/customers' },
    { label: 'Sellers', value: sellers.length, icon: UserCheck, route: '/sellers' },
    { label: 'Employees', value: employees.length, icon: UserCheck2, route: '/employees' },
  ];

  const maskValue = (val) => showAdmin ? fmt(val) : '₹ • • • •';

  /* ═══════════════════════════════════════════════════════ */
  return (
    <div className="max-w-6xl mx-auto space-y-10 pb-16">

      {/* ── Header ── */}
      <div className="flex flex-col md:flex-row md:items-end justify-between pb-6 border-b-2 border-border/60">
        <div>
          <h1 className="text-4xl md:text-5xl font-black tracking-tight text-foreground uppercase">
            {shopName || 'Dashboard'}
          </h1>
          <p className="text-lg font-medium text-muted-foreground mt-1 uppercase tracking-wider">
            Business Intelligence & Performance
          </p>
        </div>
        <div className="mt-4 md:mt-0 text-left md:text-right bg-muted/30 p-4 rounded-xl border border-border/50 shadow-sm">
          <p className="text-3xl font-extrabold text-foreground tracking-tight">{formattedTime}</p>
          <p className="text-sm font-bold text-primary mt-1 uppercase tracking-widest">{formattedDate}</p>
        </div>
      </div>

      {/* ── KPI Strip: Today vs Yesterday ── */}
      <div>
        <SectionTitle icon={Activity} title="Today at a Glance" sub="Compared to yesterday" />
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { label: "Today's Revenue", current: todaySales, prev: yesterdaySales, icon: TrendingUp, color: 'text-emerald-600 dark:text-emerald-400', bg: 'bg-emerald-500/10', fmt: true },
            { label: "Today's Expenses", current: todayExpenses, prev: yesterdayExpenses, icon: TrendingDown, color: 'text-red-500 dark:text-red-400', bg: 'bg-red-500/10', fmt: true },
            { label: 'Orders Today', current: todayOrders, prev: yesterdayOrders, icon: ShoppingCart, color: 'text-blue-500 dark:text-blue-400', bg: 'bg-blue-500/10', fmt: false },
            { label: 'Unique Customers', current: todayCustomers, prev: 0, icon: Users, color: 'text-purple-500 dark:text-purple-400', bg: 'bg-purple-500/10', fmt: false },
          ].map(s => (
            <Card key={s.label} className="border-border/80 hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 cursor-pointer">
              <CardContent className="p-5">
                <div className="flex items-start justify-between mb-3">
                  <div className={`p-2 rounded-lg ${s.bg}`}>
                    <s.icon className={`h-4 w-4 ${s.color}`} />
                  </div>
                  <DeltaBadge current={s.current} previous={s.prev} />
                </div>
                <p className="text-3xl font-black text-foreground tracking-tighter">
                  {s.fmt ? `₹${s.current.toLocaleString('en-IN')}` : s.current}
                </p>
                <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider mt-1">{s.label}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* ── Primary Cards: Sparklines + Monthly ── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Today's Sales Sparkline */}
        <Card className="relative overflow-hidden cursor-pointer hover:shadow-lg hover:-translate-y-1 transition-all duration-300 border-border/80 bg-card" onClick={() => navigate('/sales')}>
          <CardContent className="p-6 pb-0 flex flex-col justify-between h-full">
            <div className="flex justify-between items-start mb-2">
              <div className="z-10">
                <p className="text-sm font-bold text-muted-foreground uppercase tracking-wider mb-1">Today's Revenue</p>
                <p className="text-5xl font-black text-foreground tracking-tighter">₹{todaySales.toLocaleString('en-IN')}</p>
                <p className="text-xs text-muted-foreground mt-1">vs ₹{yesterdaySales.toLocaleString('en-IN')} yesterday</p>
              </div>
              <div className="p-3 bg-emerald-500/10 rounded-xl z-10">
                <TrendingUp className="h-6 w-6 text-emerald-600 dark:text-emerald-400" />
              </div>
            </div>
            <div className="h-[80px] w-full mt-4 -mx-6 -mb-1">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={salesTrend}>
                  <defs>
                    <linearGradient id="cSales" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <Tooltip content={<CustomTooltip />} />
                  <Area type="monotone" dataKey="Sales" stroke="#10b981" strokeWidth={3} fillOpacity={1} fill="url(#cSales)" dot={false} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Today's Expenses Sparkline */}
        <Card className="relative overflow-hidden cursor-pointer hover:shadow-lg hover:-translate-y-1 transition-all duration-300 border-border/80 bg-card" onClick={() => navigate('/expenditure')}>
          <CardContent className="p-6 pb-0 flex flex-col justify-between h-full">
            <div className="flex justify-between items-start mb-2">
              <div className="z-10">
                <p className="text-sm font-bold text-muted-foreground uppercase tracking-wider mb-1">Today's Expenses</p>
                <p className="text-5xl font-black text-foreground tracking-tighter">₹{todayExpenses.toLocaleString('en-IN')}</p>
                <p className="text-xs text-muted-foreground mt-1">vs ₹{yesterdayExpenses.toLocaleString('en-IN')} yesterday</p>
              </div>
              <div className="p-3 bg-red-500/10 rounded-xl z-10">
                <TrendingDown className="h-6 w-6 text-red-600 dark:text-red-400" />
              </div>
            </div>
            <div className="h-[80px] w-full mt-4 -mx-6 -mb-1">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={salesTrend}>
                  <defs>
                    <linearGradient id="cExp" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#ef4444" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#ef4444" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <Tooltip content={<CustomTooltip />} />
                  <Area type="monotone" dataKey="Expenses" stroke="#ef4444" strokeWidth={3} fillOpacity={1} fill="url(#cExp)" dot={false} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Monthly Summary */}
        <Card className="border-border/80 bg-gradient-to-br from-card to-muted/30 shadow-sm flex flex-col justify-between">
          <CardContent className="p-6">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-base font-extrabold text-foreground uppercase tracking-widest">
                {new Date().toLocaleString('default', { month: 'long', year: 'numeric' })}
              </h3>
              <span className="px-3 py-1 bg-primary/10 text-primary font-bold text-xs rounded-full uppercase tracking-wider">
                {profitMargin}% Margin
              </span>
            </div>
            <div className="space-y-5">
              <div>
                <div className="flex justify-between items-end mb-1">
                  <span className="text-sm font-bold text-muted-foreground uppercase tracking-wider">Sales</span>
                  <span className="text-xl font-black text-foreground">₹{monthlySales.toLocaleString('en-IN')}</span>
                </div>
                <div className="w-full bg-muted rounded-full h-2.5">
                  <div className="bg-emerald-500 h-2.5 rounded-full transition-all" style={{ width: '100%' }} />
                </div>
              </div>
              <div>
                <div className="flex justify-between items-end mb-1">
                  <span className="text-sm font-bold text-muted-foreground uppercase tracking-wider">Costs</span>
                  <span className="text-xl font-black text-foreground">₹{(monthlyExpenses + monthlyPurchases + monthlySalary).toLocaleString('en-IN')}</span>
                </div>
                <div className="w-full bg-muted rounded-full h-2.5">
                  <div className="bg-red-500 h-2.5 rounded-full transition-all" style={{ width: monthlySales > 0 ? `${Math.min(((monthlyExpenses + monthlyPurchases + monthlySalary) / monthlySales) * 100, 100)}%` : '0%' }} />
                </div>
              </div>
              <div className="pt-4 border-t-2 border-border/50 flex justify-between items-center">
                <span className="text-sm font-black text-foreground uppercase tracking-widest">Net Profit</span>
                <span className={`text-2xl font-black tracking-tight ${monthlyProfit >= 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-600 dark:text-red-400'}`}>
                  ₹{monthlyProfit.toLocaleString('en-IN')}
                </span>
              </div>
              <div className="flex justify-between text-xs font-bold text-muted-foreground uppercase">
                <span>vs last month</span>
                <DeltaBadge current={monthlySales} previous={lastMonthlySales} />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* ── Business Vitals ── */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Avg. Order Value', value: `₹${Math.round(avgOrderValue).toLocaleString('en-IN')}`, icon: Target, color: 'text-teal-600', bg: 'bg-teal-500/10' },
          { label: 'Repeat Customers', value: repeatCustomers, icon: RefreshCw, color: 'text-blue-600 dark:text-blue-400', bg: 'bg-blue-500/10' },
          { label: 'Items Dispensed', value: totalItemsSold.toLocaleString('en-IN'), icon: Zap, color: 'text-amber-600 dark:text-amber-400', bg: 'bg-amber-500/10' },
          { label: 'This Week Sales', value: `₹${weekSales.toLocaleString('en-IN')}`, icon: BarChart2, color: 'text-purple-600 dark:text-purple-400', bg: 'bg-purple-500/10', delta: { current: weekSales, prev: lastWeekSales } },
        ].map(s => (
          <Card key={s.label} className="border-border/80 hover:shadow-md transition-all duration-200">
            <CardContent className="p-5">
              <div className="flex items-center justify-between mb-3">
                <div className={`p-2 rounded-lg ${s.bg}`}>
                  <s.icon className={`h-4 w-4 ${s.color}`} />
                </div>
                {s.delta && <DeltaBadge current={s.delta.current} previous={s.delta.prev} />}
              </div>
              <p className="text-2xl font-black text-foreground tracking-tighter">{s.value}</p>
              <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider mt-1">{s.label}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* ── Admin Console ── */}
      <Card className="border-2 border-border/80 shadow-md bg-card overflow-hidden">
        <CardHeader className="flex flex-row items-center justify-between p-6 bg-muted/20 border-b-2 border-border/50">
          <CardTitle className="text-xl font-black text-foreground uppercase tracking-widest flex items-center gap-3">
            <span className="flex h-3 w-3 relative">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75" />
              <span className="relative inline-flex rounded-full h-3 w-3 bg-primary" />
            </span>
            Admin Console
          </CardTitle>
          <Button variant="default" size="sm" onClick={() => setShowAdmin(!showAdmin)} className="h-10 px-6 font-bold uppercase tracking-wider shadow-md">
            {showAdmin ? <EyeOff className="h-4 w-4 mr-2" /> : <Eye className="h-4 w-4 mr-2" />}
            {showAdmin ? 'Mask Metrics' : 'Reveal Data'}
          </Button>
        </CardHeader>
        <CardContent className="p-0">
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 divide-x divide-y lg:divide-y-0 divide-border/50">
            {adminStats.map((s, i) => (
              <div
                key={s.label}
                onClick={() => navigate(s.route)}
                className={`p-6 flex flex-col gap-3 cursor-pointer hover:bg-muted/40 transition-colors ${i < 3 ? 'border-b border-border/50 lg:border-b-0' : ''}`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider">{s.label}</span>
                  <s.icon className="h-5 w-5 text-muted-foreground opacity-50" />
                </div>
                <span className={`text-2xl font-black tracking-tighter ${s.color}`}>
                  {maskValue(s.value)}
                </span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* ── Comparison Chart: Weekly / Monthly ── */}
      <div>
        <div className="flex items-center justify-between mb-6">
          <SectionTitle icon={BarChart2} title={compareMode === 'weekly' ? 'Weekly Comparison' : 'Monthly Comparison'} sub="Sales vs Expenses vs Profit" />
          <div className="flex gap-2">
            {['weekly', 'monthly'].map(m => (
              <button
                key={m}
                onClick={() => setCompareMode(m)}
                className={`px-4 py-2 text-xs font-black uppercase tracking-widest rounded-lg border transition-all ${compareMode === m ? 'bg-primary text-primary-foreground border-primary' : 'bg-muted/30 text-muted-foreground border-border/50 hover:bg-muted/60'}`}
              >
                {m}
              </button>
            ))}
          </div>
        </div>
        <Card className="border-border/80 shadow-sm">
          <CardContent className="p-6">
            <div className="h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <ComposedChart data={trendData} margin={{ top: 10, right: 20, left: 0, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" opacity={0.5} />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 11, fontWeight: 700, fill: 'hsl(var(--muted-foreground))' }} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 11, fontWeight: 700, fill: 'hsl(var(--muted-foreground))' }} tickFormatter={v => `₹${v >= 1000 ? `${(v / 1000).toFixed(0)}k` : v}`} />
                  <Tooltip content={<CustomTooltip />} />
                  <Legend wrapperStyle={{ fontSize: 11, fontWeight: 700 }} />
                  <Bar dataKey="Sales" fill="#10b981" radius={[4, 4, 0, 0]} maxBarSize={28} opacity={0.9} />
                  <Bar dataKey="Expenses" fill="#ef4444" radius={[4, 4, 0, 0]} maxBarSize={28} opacity={0.9} />
                  <Line type="monotone" dataKey="Profit" stroke="#f59e0b" strokeWidth={2.5} dot={{ r: 4, fill: '#f59e0b' }} />
                </ComposedChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* ── 7-Day Sales vs Expenses Dual Area ── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="border-border/80 shadow-sm">
          <CardHeader className="pb-4 border-b border-border/50">
            <CardTitle className="text-lg font-black uppercase tracking-widest flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-emerald-600" /> 7-Day Revenue Trend
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-4">
            <div className="h-[200px]">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={salesTrend}>
                  <defs>
                    <linearGradient id="g1" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10b981" stopOpacity={0.25} />
                      <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="g2" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#ef4444" stopOpacity={0.2} />
                      <stop offset="95%" stopColor="#ef4444" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" opacity={0.4} />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 11, fontWeight: 700 }} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10 }} tickFormatter={v => `₹${v >= 1000 ? `${(v / 1000).toFixed(0)}k` : v}`} />
                  <Tooltip content={<CustomTooltip />} />
                  <Legend wrapperStyle={{ fontSize: 11, fontWeight: 700 }} />
                  <Area type="monotone" dataKey="Sales" stroke="#10b981" strokeWidth={2.5} fillOpacity={1} fill="url(#g1)" dot={{ r: 3, fill: '#10b981' }} />
                  <Area type="monotone" dataKey="Expenses" stroke="#ef4444" strokeWidth={2.5} fillOpacity={1} fill="url(#g2)" dot={{ r: 3, fill: '#ef4444' }} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Customer Purchase Frequency */}
        <Card className="border-border/80 shadow-sm">
          <CardHeader className="pb-4 border-b border-border/50">
            <CardTitle className="text-lg font-black uppercase tracking-widest flex items-center gap-2">
              <Users className="h-5 w-5 text-blue-500" /> Customer Frequency
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-4">
            <div className="h-[200px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={purchaseFrequency} margin={{ top: 5, right: 10, left: -20, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" opacity={0.4} />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 11, fontWeight: 700 }} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10 }} />
                  <Tooltip content={<CustomTooltip prefix="" />} />
                  <Bar dataKey="value" name="Customers" radius={[4, 4, 0, 0]} maxBarSize={40}>
                    {purchaseFrequency.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* ── Product Performance ── */}
      <div>
        <SectionTitle icon={Package} title="Product Intelligence" sub="Velocity & stock analysis" />
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card className="border-border/80 shadow-sm border-l-4 border-l-emerald-500">
            <CardHeader className="pb-4 border-b border-border/50">
              <CardTitle className="text-xl font-black uppercase tracking-tighter flex items-center justify-between">
                <span>🔥 Top Movers</span>
                <span className="text-xs font-bold text-muted-foreground tracking-widest">High Velocity</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-6">
              <div className="h-[220px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={productPerformance.top} layout="vertical" margin={{ left: 10, right: 30 }}>
                    <XAxis type="number" hide />
                    <YAxis dataKey="name" type="category" axisLine={false} tickLine={false} tick={{ fontSize: 11, fontWeight: 700 }} width={90} />
                    <Tooltip content={<CustomTooltip prefix="" />} />
                    <Bar dataKey="qty" name="Units Sold" fill="#10b981" radius={[0, 4, 4, 0]} barSize={16} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          <Card className="border-border/80 shadow-sm border-l-4 border-l-red-500">
            <CardHeader className="pb-4 border-b border-border/50">
              <CardTitle className="text-xl font-black uppercase tracking-tighter flex items-center justify-between">
                <span>🧊 Stagnant Stock</span>
                <span className="text-xs font-bold text-muted-foreground tracking-widest">Low Velocity</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-6">
              <div className="h-[220px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={productPerformance.least} layout="vertical" margin={{ left: 10, right: 30 }}>
                    <XAxis type="number" hide />
                    <YAxis dataKey="name" type="category" axisLine={false} tickLine={false} tick={{ fontSize: 11, fontWeight: 700 }} width={90} />
                    <Tooltip content={<CustomTooltip prefix="" />} />
                    <Bar dataKey="qty" name="Units Sold" fill="#ef4444" radius={[0, 4, 4, 0]} barSize={16} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* ── Stock Health + Low Stock ── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Stock Health Donut */}
        <Card className="border-border/80 shadow-sm">
          <CardHeader className="pb-4 border-b border-border/50">
            <CardTitle className="text-lg font-black uppercase tracking-widest flex items-center gap-2">
              <Package className="h-5 w-5 text-amber-500" /> Stock Health
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-4">
            {stockHealth.length === 0 ? (
              <div className="h-[200px] flex items-center justify-center text-sm font-bold text-muted-foreground uppercase">No Products</div>
            ) : (
              <>
                <div className="h-[160px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie data={stockHealth} dataKey="value" cx="50%" cy="50%" innerRadius={50} outerRadius={70} paddingAngle={3}>
                        {stockHealth.map((s, i) => <Cell key={i} fill={s.color} stroke="transparent" />)}
                      </Pie>
                      <Tooltip contentStyle={{ borderRadius: '8px', fontWeight: 'bold', border: '1px solid hsl(var(--border))' }} />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                <div className="space-y-1.5 mt-2">
                  {stockHealth.map(s => (
                    <div key={s.name} className="flex items-center justify-between text-xs font-bold">
                      <span className="flex items-center gap-1.5">
                        <span className="h-2.5 w-2.5 rounded-full flex-shrink-0" style={{ background: s.color }} />
                        <span className="text-muted-foreground">{s.name}</span>
                      </span>
                      <span className="text-foreground">{s.value} SKUs</span>
                    </div>
                  ))}
                </div>
              </>
            )}
          </CardContent>
        </Card>

        {/* Low Stock Alert */}
        <Card className="lg:col-span-2 border-red-500/30 shadow-sm bg-gradient-to-b from-card to-red-500/5">
          <CardHeader className="pb-4 border-b border-red-500/20">
            <CardTitle className="text-lg font-black uppercase tracking-widest flex items-center gap-2 text-red-600 dark:text-red-400">
              <AlertCircle className="h-5 w-5" /> Critical Stock Alerts
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            {lowStockProducts.length === 0 ? (
              <div className="p-8 text-center text-sm font-bold text-muted-foreground uppercase">Inventory Healthy</div>
            ) : (
              <div className="divide-y divide-red-500/10">
                {lowStockProducts.map(p => (
                  <div key={p._id} className="flex justify-between items-center p-4 hover:bg-red-500/5 transition-colors">
                    <div className="flex items-center gap-3">
                      {p.image ? (
                        <img src={p.image} alt="" className="h-10 w-10 rounded-lg object-cover border border-border" />
                      ) : (
                        <div className="h-10 w-10 rounded-lg bg-muted flex items-center justify-center">
                          <Package className="h-5 w-5 text-muted-foreground" />
                        </div>
                      )}
                      <div>
                        <span className="font-bold text-sm leading-tight max-w-[140px] truncate block">{p.itemName}</span>
                        <span className="text-xs text-muted-foreground">{p.category || 'Uncategorized'}</span>
                      </div>
                    </div>
                    <span className={`px-2.5 py-1 rounded-md text-xs font-black uppercase tracking-wider ${(p.stock || 0) === 0 ? 'bg-red-500 text-white' : 'bg-orange-500/20 text-orange-600 dark:text-orange-400'}`}>
                      {(p.stock || 0) === 0 ? 'Out of Stock' : `${p.stock} Left`}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* ── Expense Distribution ── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="border-border/80 shadow-sm">
          <CardHeader className="pb-4 border-b border-border/50">
            <CardTitle className="text-lg font-black uppercase tracking-widest flex items-center gap-2">
              <TrendingDown className="h-5 w-5 text-red-500" /> Expense Breakdown
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-4">
            {expenseByCategory.length === 0 ? (
              <div className="h-[240px] flex items-center justify-center text-sm font-bold text-muted-foreground uppercase">No Data</div>
            ) : (
              <div className="h-[240px]">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={expenseByCategory}
                      dataKey="value"
                      nameKey="name"
                      cx="50%" cy="50%"
                      innerRadius={60} outerRadius={90}
                      paddingAngle={3}
                      label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                      labelLine={false}
                    >
                      {expenseByCategory.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} stroke="transparent" />)}
                    </Pie>
                    <Tooltip contentStyle={{ borderRadius: '8px', fontWeight: 'bold', border: '1px solid hsl(var(--border))' }} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Salary Utilization */}
        <Card className="border-border/80 shadow-sm">
          <CardHeader className="pb-4 border-b border-border/50">
            <CardTitle className="text-lg font-black uppercase tracking-widest flex items-center gap-2">
              <UserCheck2 className="h-5 w-5 text-purple-500" /> Salary Utilization
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-4">
            {salaryUtilization.length === 0 ? (
              <div className="h-[240px] flex items-center justify-center text-sm font-bold text-muted-foreground uppercase">No Employees</div>
            ) : (
              <div className="h-[240px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={salaryUtilization} margin={{ top: 5, right: 10, left: -20, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" opacity={0.4} />
                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 11, fontWeight: 700 }} />
                    <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10 }} tickFormatter={v => `₹${v >= 1000 ? `${(v / 1000).toFixed(0)}k` : v}`} />
                    <Tooltip content={<CustomTooltip />} />
                    <Legend wrapperStyle={{ fontSize: 11, fontWeight: 700 }} />
                    <Bar dataKey="paid" name="Paid" fill="#8b5cf6" radius={[4, 4, 0, 0]} maxBarSize={24} stackId="a" />
                    <Bar dataKey="balance" name="Balance" fill="#e9d5ff" radius={[4, 4, 0, 0]} maxBarSize={24} stackId="a" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* ── Customer Intelligence ── */}
      <div>
        <SectionTitle icon={Star} title="Customer Intelligence" sub="Loyalty & revenue insights" />
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">

          {/* Top Revenue Clients */}
          <Card className="lg:col-span-7 border-border/80 shadow-sm">
            <CardHeader className="pb-4 border-b border-border/50">
              <CardTitle className="text-lg font-black uppercase tracking-widest flex items-center gap-2">
                <Wallet className="h-5 w-5 text-emerald-600" /> High-Value Clients
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              {customerLoyalty.byRevenue.length === 0 ? (
                <div className="p-8 text-center text-sm font-bold text-muted-foreground uppercase">No Data</div>
              ) : (
                <div className="divide-y divide-border/50">
                  {customerLoyalty.byRevenue.map((c, i) => (
                    <div key={i} className="flex justify-between items-center p-4 hover:bg-emerald-500/5 transition-colors">
                      <div className="flex items-center gap-4">
                        <div className="h-8 w-8 rounded-full bg-emerald-500/10 text-emerald-600 flex items-center justify-center font-black text-sm flex-shrink-0">
                          {i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : i + 1}
                        </div>
                        <div>
                          <p className="font-bold text-foreground">{c.name}</p>
                          <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider">{c.visits} visits · Last: {c.lastVisit}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-lg font-black text-emerald-600 dark:text-emerald-400">₹{c.total.toLocaleString('en-IN')}</p>
                        <p className="text-xs text-muted-foreground">₹{Math.round(c.total / c.visits).toLocaleString('en-IN')}/visit</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Loyalists */}
          <Card className="lg:col-span-5 border-border/80 shadow-sm">
            <CardHeader className="pb-4 border-b border-border/50">
              <CardTitle className="text-lg font-black uppercase tracking-widest flex items-center gap-2">
                <Award className="h-5 w-5 text-primary" /> Top Loyalists
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              {customerLoyalty.byVisits.length === 0 ? (
                <div className="p-8 text-center text-sm font-bold text-muted-foreground uppercase">No Data</div>
              ) : (
                <div className="divide-y divide-border/50">
                  {customerLoyalty.byVisits.map((c, i) => (
                    <div key={i} className="flex justify-between items-center p-4 hover:bg-primary/5 transition-colors">
                      <div className="flex items-center gap-3">
                        <span className="text-xl font-black text-muted-foreground/30">0{i + 1}</span>
                        <div>
                          <p className="text-sm font-extrabold text-foreground uppercase">{c.name}</p>
                          <p className="text-xs font-bold text-primary">{c.visits} visits</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-xs font-bold text-muted-foreground uppercase">LTV</p>
                        <p className="text-base font-black tracking-tighter">₹{c.total.toLocaleString('en-IN')}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* ── Directory + Cash Flow ── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <Card className="lg:col-span-5 border-border/80 shadow-sm bg-card">
          <CardHeader className="pb-2 border-b border-border/50">
            <CardTitle className="text-lg font-black uppercase tracking-widest text-foreground">Directory Overview</CardTitle>
          </CardHeader>
          <CardContent className="p-4">
            <div className="grid grid-cols-2 gap-4">
              {quickStats.map(s => (
                <div key={s.label} onClick={() => navigate(s.route)} className="bg-muted/30 rounded-xl border border-border/50 p-4 text-center cursor-pointer hover:bg-muted/50 hover:shadow-sm transition-all">
                  <s.icon className="h-6 w-6 mx-auto mb-2 text-primary opacity-80" />
                  <p className="text-3xl font-black text-foreground tracking-tighter">{s.value}</p>
                  <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider mt-1">{s.label}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card className="lg:col-span-7 border-border/80 shadow-sm bg-card">
          <CardHeader className="pb-2 border-b border-border/50">
            <CardTitle className="text-lg font-black uppercase tracking-widest text-foreground">Cash Flow & Liquidity</CardTitle>
          </CardHeader>
          <CardContent className="p-4">
            <div className="grid grid-cols-2 gap-4">
              {[
                { label: 'Total Income', value: totalSales, color: 'emerald', icon: TrendingUp, route: '/daily-tracker' },
                { label: 'Total Expenses', value: totalExpenses, color: 'red', icon: TrendingDown, route: '/expenditure' },
                { label: 'Pending Dues', value: totalDue, color: 'orange', icon: Clock, route: '/customers' },
                { label: 'Payments In', value: totalPaymentsReceived, color: 'blue', icon: CreditCard, route: '/customers' },
              ].map(s => (
                <div key={s.label} onClick={() => navigate(s.route)} className={`flex items-center gap-4 p-4 rounded-xl border border-border/50 bg-gradient-to-br from-${s.color}-500/5 to-transparent cursor-pointer hover:border-${s.color}-500/30 transition-all`}>
                  <div className={`p-3 bg-${s.color}-500/10 rounded-lg flex-shrink-0`}>
                    <s.icon className={`h-5 w-5 text-${s.color}-600 dark:text-${s.color}-400`} />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider">{s.label}</p>
                    <p className={`text-xl font-black text-${s.color}-600 dark:text-${s.color}-400`}>₹{s.value.toLocaleString('en-IN')}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* ── Quick Actions / Offers Banner ── */}
      <Card className="border-2 border-primary/20 bg-gradient-to-r from-primary/5 via-card to-emerald-500/5 shadow-md">
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-primary/10 rounded-xl">
                <Gift className="h-6 w-6 text-primary" />
              </div>
              <div>
                <h3 className="text-lg font-black text-foreground uppercase tracking-wider">Business Actions</h3>
                <p className="text-sm text-muted-foreground font-bold">Quick access to key operations</p>
              </div>
            </div>
            <div className="flex flex-wrap gap-3">
              {[
                { label: '+ New Sale', route: '/sales', color: 'bg-emerald-500 hover:bg-emerald-600 text-white' },
                { label: '+ Add Product', route: '/products', color: 'bg-blue-500 hover:bg-blue-600 text-white' },
                { label: '+ Add Expense', route: '/expenditure', color: 'bg-red-500 hover:bg-red-600 text-white' },
                { label: 'Daily Tracker', route: '/daily-tracker', color: 'bg-amber-500 hover:bg-amber-600 text-white' },
              ].map(a => (
                <button
                  key={a.label}
                  onClick={() => navigate(a.route)}
                  className={`px-4 py-2 rounded-lg text-xs font-black uppercase tracking-widest transition-all ${a.color} shadow-sm hover:shadow-md hover:-translate-y-0.5`}
                >
                  {a.label}
                </button>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

    </div>
  );
}