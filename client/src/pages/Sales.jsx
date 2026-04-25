import { useState, useMemo } from 'react';
import { useShop } from '@/contexts/ShopContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator } from '@/components/ui/dropdown-menu';
import { Receipt, Plus, Trash2, MessageCircle, Mail, Printer, ChevronDown, ChevronUp, MoreVertical, ShoppingCart } from 'lucide-react';
import { toast } from 'sonner';


export default function Sales() {
  const { customers, products, sales, addSale, deleteSale, addCustomer, shopName } = useShop();
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [paymentMode, setPaymentMode] = useState('Cash');
  const [items, setItems] = useState([]);
  const [date] = useState(new Date().toISOString().split('T')[0]);
  const [selProduct, setSelProduct] = useState('');
  const [selQty, setSelQty] = useState(1);
  const [selDiscount, setSelDiscount] = useState(0);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [expandedSale, setExpandedSale] = useState(null);

  const totalDiscount = items.reduce((s, i) => s + (i.discount * i.quantity), 0);
  const totalBill = items.reduce((s, i) => s + i.total, 0);
  const shop = shopName || 'Verma Fancy Store';

  const suggestions = useMemo(() => {
    if (!customerName.trim()) return [];
    return customers.filter(c => c.name.toLowerCase().includes(customerName.toLowerCase())).slice(0, 5);
  }, [customerName, customers]);

  const selectCustomer = (c) => {
    setCustomerName(c.name); setCustomerPhone(c.phone || ''); setShowSuggestions(false);
  };

  const addItem = () => {
    const p = products.find(x => x._id === selProduct);
    if (!p) { toast.error('Select a product'); return; }
    if (items.find(i => i.productId === p._id)) { toast.error('Already added'); return; }
    const itemDiscount = selDiscount || (p.printPrice - p.sellPrice);
    const price = p.printPrice - itemDiscount;
    setItems([...items, { productId: p._id, productName: p.itemName, quantity: selQty, sellPrice: price, mrp: p.printPrice, discount: itemDiscount, total: selQty * price }]);
    setSelProduct(''); setSelQty(1); setSelDiscount(0);
  };

  const removeItem = (pid) => setItems(items.filter(i => i.productId !== pid));

  const generateInvoiceText = (sale) => {
    let text = `*${shop}*\nInvoice: ${sale.invoiceNo}\nDate: ${sale.date}\nCustomer: ${sale.customerName}\n`;
    if (sale.customerPhone) text += `Phone: ${sale.customerPhone}\n`;
    text += `─────────────────\n`;
    sale.items.forEach((i, idx) => {
      text += `${idx + 1}. ${i.productName}\n   ${i.quantity} × ₹${i.sellPrice} = ₹${i.total}`;
      if (i.discount > 0) text += ` (Save ₹${i.discount * i.quantity})`;
      text += `\n`;
    });
    text += `─────────────────\n`;
    if (sale.totalDiscount > 0) text += `Discount: ₹${sale.totalDiscount}\n`;
    text += `*Total: ₹${sale.totalBill.toLocaleString()}*\nPayment: ${sale.paymentMode}\n\nThank you! 🙏`;
    return text;
  };

  const shareWhatsApp = (sale) => {
    const text = generateInvoiceText(sale);
    const phone = sale.customerPhone?.replace(/\D/g, '') || '';
    window.open(phone ? `https://wa.me/91${phone}?text=${encodeURIComponent(text)}` : `https://wa.me/?text=${encodeURIComponent(text)}`, '_blank');
  };

  const shareEmail = (sale) => {
    const text = generateInvoiceText(sale);
    window.open(`mailto:?subject=${encodeURIComponent(`Invoice ${sale.invoiceNo} - ${shop}`)}&body=${encodeURIComponent(text)}`);
  };

  const printInvoice = (sale) => {
    const win = window.open('', '_blank');
    if (!win) return;
    win.document.write(`<html><head><title>Invoice ${sale.invoiceNo}</title>
      <style>body{font-family:Arial;padding:20px;max-width:400px;margin:auto}table{width:100%;border-collapse:collapse;margin:12px 0}th,td{border:1px solid #ddd;padding:8px;text-align:left;font-size:13px}th{background:#f5f5f5}.center{text-align:center}.total{font-size:20px;font-weight:bold;text-align:right;margin-top:12px}.footer{text-align:center;margin-top:20px;font-size:11px;color:#888}</style>
      </head><body>
      <div class="center"><h2 style="margin:0">${shop}</h2><p style="color:#888;font-size:13px">Invoice: ${sale.invoiceNo} | ${sale.date}</p></div>
      <p><b>Customer:</b> ${sale.customerName}${sale.customerPhone ? ` | ${sale.customerPhone}` : ''}</p>
      <table><thead><tr><th>#</th><th>Item</th><th>Qty</th><th>Price</th><th>Total</th></tr></thead><tbody>
      ${sale.items.map((i, idx) => `<tr><td>${idx + 1}</td><td>${i.productName}</td><td>${i.quantity}</td><td>₹${i.sellPrice}</td><td>₹${i.total}</td></tr>`).join('')}
      </tbody></table>
      ${sale.totalDiscount > 0 ? `<p style="text-align:right;color:green">You saved ₹${sale.totalDiscount}</p>` : ''}
      <div class="total">Total: ₹${sale.totalBill.toLocaleString()}</div>
      <p>Payment: ${sale.paymentMode}</p>
      <div class="footer">Thank you for shopping at ${shop}! 🙏</div>
      </body></html>`);
    win.document.close(); win.print();
  };

  const handleSale = () => {
    if (!customerName.trim()) { toast.error('Enter customer name'); return; }
    if (items.length === 0) { toast.error('Add products'); return; }
    let customer = customers.find(c => c.name.toLowerCase() === customerName.toLowerCase());
    if (!customer) addCustomer({ name: customerName, phone: customerPhone, location: '', dueAmount: 0 });
    addSale({ customerId: customer?._id || '', customerName, customerPhone, items, totalBill, totalDiscount, paymentMode, date });
    toast.success('Sale recorded!');
    setItems([]); setCustomerName(''); setCustomerPhone('');
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="flex items-center justify-between mb-5">
        <div>
          <h2 className="text-2xl font-black text-foreground flex items-center gap-2">
            <ShoppingCart className="h-6 w-6 text-primary" /> Sales
          </h2>
          <p className="text-sm text-muted-foreground font-medium">Create invoice & manage sales</p>
        </div>
      </div>

      <Card className="mb-5 border-2">
        <CardHeader className="pb-3"><CardTitle className="text-base font-black">📝 New Invoice</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <div className="relative">
            <Label className="text-xs font-bold">Customer Name</Label>
            <Input value={customerName} onChange={e => { setCustomerName(e.target.value); setShowSuggestions(true); }}
              onFocus={() => setShowSuggestions(true)} className="h-11 mt-1" placeholder="Customer name" />
            {showSuggestions && suggestions.length > 0 && (
              <div className="absolute z-50 w-full mt-1 bg-popover border border-border rounded-xl shadow-lg max-h-40 overflow-y-auto">
                {suggestions.map(c => (
                  <button key={c._id} className="w-full px-4 py-2.5 text-left hover:bg-muted text-sm" onClick={() => selectCustomer(c)}>
                    <span className="font-bold">{c.name}</span>
                    {c.phone && <span className="text-muted-foreground ml-2">📞 {c.phone}</span>}
                  </button>
                ))}
              </div>
            )}
          </div>
          <div>
            <Label className="text-xs font-bold">Phone</Label>
            <Input value={customerPhone} onChange={e => setCustomerPhone(e.target.value)} className="h-11 mt-1" placeholder="Phone number" />
          </div>

          <div className="p-4 bg-muted rounded-2xl space-y-3">
            <Label className="text-xs font-black">Add Product</Label>
            <div className="flex gap-2">
              <Select value={selProduct} onValueChange={v => {
                setSelProduct(v);
                const p = products.find(x => x._id === v);
                if (p) setSelDiscount(p.printPrice - p.sellPrice);
              }}>
                <SelectTrigger className="h-10 flex-1 text-sm"><SelectValue placeholder="Select" /></SelectTrigger>
                <SelectContent>
                  {products.map(p => (
                    <SelectItem key={p._id} value={p._id}>
                      <span className="text-sm">{p.itemName} (₹{p.sellPrice}) [{p.stock}]</span>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Input type="number" value={selQty} onChange={e => setSelQty(+e.target.value)} className="h-10 w-16 text-sm" min={1} placeholder="Qty" />
              <Input type="number" value={selDiscount} onChange={e => setSelDiscount(+e.target.value)} className="h-10 w-16 text-sm" min={0} placeholder="Disc" />
              <Button onClick={addItem} size="icon" className="h-10 w-10 shrink-0"><Plus className="h-4 w-4" /></Button>
            </div>
          </div>

          {items.length > 0 && (
            <div className="space-y-2">
              {items.map(i => (
                <div key={i.productId} className="flex items-center justify-between p-3 bg-card border-2 rounded-xl text-sm">
                  <div>
                    <span className="font-bold">{i.productName}</span>
                    <div className="flex gap-3 text-muted-foreground mt-0.5 text-xs">
                      <span>Qty: {i.quantity}</span>
                      <span>MRP: ₹{i.mrp}</span>
                      {i.discount > 0 && <span className="text-emerald-600">-₹{i.discount}</span>}
                      <span className="font-bold text-foreground">= ₹{i.total}</span>
                    </div>
                  </div>
                  <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => removeItem(i.productId)}><Trash2 className="h-4 w-4 text-destructive" /></Button>
                </div>
              ))}
            </div>
          )}

          <Select value={paymentMode} onValueChange={v => setPaymentMode(v )}>
            <SelectTrigger className="h-11"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="Cash">💵 Cash</SelectItem>
              <SelectItem value="Online">📱 Online</SelectItem>
              <SelectItem value="Due">📋 Due</SelectItem>
            </SelectContent>
          </Select>

          <div className="p-4 bg-primary/10 rounded-2xl text-center">
            {totalDiscount > 0 && <p className="text-sm text-emerald-600 dark:text-emerald-400 font-bold mb-1">Discount: ₹{totalDiscount}</p>}
            <span className="text-3xl font-black text-foreground">₹{totalBill.toLocaleString()}</span>
          </div>

          <Button onClick={handleSale} className="w-full h-12 font-black text-base">Create Invoice</Button>
        </CardContent>
      </Card>

      {/* History */}
      <h3 className="text-base font-black mb-3">Sales History ({sales.length})</h3>
      {sales.length === 0 ? (
        <div className="text-center py-12 text-muted-foreground">
          <Receipt className="h-10 w-10 mx-auto mb-3 opacity-40" /><p className="text-sm font-medium">No sales yet</p>
        </div>
      ) : (
        <div className="space-y-3">
          {[...sales].reverse().map(s => {
            const isExpanded = expandedSale === s._id;
            return (
              <Card key={s._id} className="border-2 border-border hover:border-primary/30 transition-all">
                <CardContent className="py-4 px-5">
                  <div className="flex justify-between items-start cursor-pointer" onClick={() => setExpandedSale(isExpanded ? null : s._id)}>
                    <div>
                      <p className="font-black text-base">{s.customerName}</p>
                      <p className="text-sm text-muted-foreground font-medium">{s.invoiceNo} • {s.items.length} items • {s.paymentMode}</p>
                    </div>
                    <div className="text-right flex items-center gap-2">
                      <div>
                        <p className="font-black text-lg">₹{s.totalBill.toLocaleString()}</p>
                        <p className="text-xs text-muted-foreground font-medium">{s.date}</p>
                      </div>
                      {isExpanded ? <ChevronUp className="h-5 w-5" /> : <ChevronDown className="h-5 w-5" />}
                    </div>
                  </div>
                  {isExpanded && (
                    <div className="mt-3 pt-3 border-t-2 border-border">
                      {s.items.map((i, idx) => (
                        <div key={idx} className="flex justify-between text-sm py-1">
                          <span className="font-medium">{i.productName} × {i.quantity}</span>
                          <span className="font-bold">₹{i.total}</span>
                        </div>
                      ))}
                      {s.totalDiscount > 0 && <p className="text-sm text-emerald-600 dark:text-emerald-400 font-bold mt-1">Saved: ₹{s.totalDiscount}</p>}
                      <div className="flex gap-2 mt-3 flex-wrap">
                        <Button size="sm" variant="outline" className="h-9 text-xs gap-1.5 font-bold" onClick={() => printInvoice(s)}>
                          <Printer className="h-3.5 w-3.5" />Print
                        </Button>
                        <Button size="sm" variant="outline" className="h-9 text-xs gap-1.5 font-bold" onClick={() => shareWhatsApp(s)}>
                          <MessageCircle className="h-3.5 w-3.5" />WhatsApp
                        </Button>
                        <Button size="sm" variant="outline" className="h-9 text-xs gap-1.5 font-bold" onClick={() => shareEmail(s)}>
                          <Mail className="h-3.5 w-3.5" />Email
                        </Button>
                        <Button size="sm" variant="destructive" className="h-9 text-xs gap-1.5 font-bold" onClick={() => { deleteSale(s._id); toast.success('Sale deleted'); }}>
                          <Trash2 className="h-3.5 w-3.5" />Delete
                        </Button>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}


 