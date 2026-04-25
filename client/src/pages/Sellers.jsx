import { useState, useRef, useMemo } from 'react';
import { useShop } from '@/contexts/ShopContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator } from '@/components/ui/dropdown-menu';
import { Plus, Pencil, Trash2, UserCheck, ShoppingCart, Camera, ImageIcon, MoreVertical, Eye, MapPin, Phone, TrendingUp } from 'lucide-react';
import { toast } from 'sonner';

export default function Sellers() {
  const { sellers, products, purchases, addSeller, updateSeller, deleteSeller, addPurchase, deletePurchase } = useShop();
  const [sellerOpen, setSellerOpen] = useState(false);
  const [editId, setEditId] = useState(null);
  const [form, setForm] = useState({ name: '', location: '', phone: '' });
  const [purchaseOpen, setPurchaseOpen] = useState(false);
  const [pForm, setPForm] = useState({
    sellerId: '', itemName: '', quantity: 1, totalPrice: 0, sellPrice: 0, date: new Date().toISOString().split('T')[0], image: '', dueAmount: 0
  });
  const [itemSuggestions, setItemSuggestions] = useState([]);
  const fileRef = useRef(null);
  const cameraRef = useRef(null);
  const [detailSeller, setDetailSeller] = useState(null);

  const perUnit = pForm.quantity > 0 ? Math.round(pForm.totalPrice / pForm.quantity) : 0;
  const estimatedProfit = pForm.quantity * (pForm.sellPrice - perUnit);

  const reset = () => { setForm({ name: '', location: '', phone: '' }); setEditId(null); };

  const handleSave = () => {
    if (!form.name.trim()) { toast.error('Enter seller name'); return; }
    if (editId) { updateSeller(editId, form); toast.success('Updated'); }
    else { addSeller(form); toast.success('Seller added'); }
    reset(); setSellerOpen(false);
  };

  const handleEdit = (s) => {
    setForm({ name: s.name, location: s.location, phone: s.phone || '' }); setEditId(s._id); setSellerOpen(true);
  };

  const compressImage = (file) => {
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        const img = new Image();
        img.onload = () => {
          const canvas = document.createElement('canvas');
          let { width, height } = img;
          const maxDim = 1200;
          if (width > maxDim || height > maxDim) {
            if (width > height) { height = (height / width) * maxDim; width = maxDim; }
            else { width = (width / height) * maxDim; height = maxDim; }
          }
          canvas.width = width; canvas.height = height;
          canvas.getContext('2d').drawImage(img, 0, 0, width, height);
          resolve(canvas.toDataURL('image/jpeg', 0.5));
        };
        img.src = reader.result;
      };
      reader.readAsDataURL(file);
    });
  };

  const handleImageChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 10 * 1024 * 1024) { toast.error('Max 10MB'); return; }
    const compressed = await compressImage(file);
    setPForm(f => ({ ...f, image: compressed }));
  };

  const handleItemNameChange = (val) => {
    setPForm(f => ({ ...f, itemName: val }));
    if (val.trim()) {
      setItemSuggestions(products.filter(p => p.itemName.toLowerCase().includes(val.toLowerCase())).map(p => p.itemName).slice(0, 5));
    } else setItemSuggestions([]);
  };

  const selectItemSuggestion = (name) => {
    const p = products.find(x => x.itemName === name);
    setPForm(f => ({ ...f, itemName: name, sellPrice: p?.sellPrice || 0 }));
    setItemSuggestions([]);
  };

  const handlePurchase = () => {
    if (!pForm.sellerId) { toast.error('Select seller'); return; }
    if (!pForm.itemName.trim()) { toast.error('Enter item name'); return; }
    if (pForm.quantity <= 0) { toast.error('Enter quantity'); return; }
    const seller = sellers.find(s => s._id === pForm.sellerId);
    const existingProduct = products.find(p => p.itemName.toLowerCase() === pForm.itemName.toLowerCase());
    addPurchase({
      sellerId: pForm.sellerId, sellerName: seller?.name || '',
      itemId: existingProduct?._id || '', itemName: pForm.itemName,
      quantity: pForm.quantity, purchasePrice: perUnit,
      totalAmount: pForm.totalPrice, dueAmount: pForm.dueAmount,
      date: pForm.date, image: pForm.image, estimatedProfit, sellPrice: pForm.sellPrice,
    });
    toast.success('Purchase recorded! Stock updated.');
    setPForm({ sellerId: '', itemName: '', quantity: 1, totalPrice: 0, sellPrice: 0, date: new Date().toISOString().split('T')[0], image: '', dueAmount: 0 });
    setPurchaseOpen(false);
  };

  // Seller stats
  const sellerStats = useMemo(() => {
    return sellers.map(s => {
      const sp = purchases.filter(p => p.sellerId === s._id);
      const totalPurchased = sp.reduce((sum, p) => sum + p.totalAmount, 0);
      const totalDue = sp.reduce((sum, p) => sum + p.dueAmount, 0);
      const totalItems = sp.reduce((sum, p) => sum + p.quantity, 0);
      return { ...s, totalPurchased, totalDue, totalItems, purchaseCount: sp.length };
    });
  }, [sellers, purchases]);

  const detailS = detailSeller ? sellerStats.find(s => s._id === detailSeller) : null;

  return (
    <div className="max-w-4xl mx-auto">
      <div className="flex items-center justify-between mb-5">
        <div>
          <h2 className="text-2xl font-black text-foreground">Buy / Sellers</h2>
          <p className="text-sm text-muted-foreground font-medium">{sellers.length} sellers • {purchases.length} purchases</p>
        </div>
        <div className="flex gap-2">
          <Dialog open={purchaseOpen} onOpenChange={setPurchaseOpen}>
            <DialogTrigger asChild><Button size="default" className="gap-2 font-bold h-11"><ShoppingCart className="h-4 w-4" />Buy</Button></DialogTrigger>
            <DialogContent className="max-h-[90vh] overflow-y-auto">
              <DialogHeader><DialogTitle className="text-lg font-black">New Purchase</DialogTitle></DialogHeader>
              <div className="space-y-4 pt-2">
                <div>
                  <Label className="text-xs font-bold">Seller</Label>
                  <Select value={pForm.sellerId} onValueChange={v => setPForm({...pForm, sellerId: v})}>
                    <SelectTrigger className="h-11 mt-1"><SelectValue placeholder="Select seller" /></SelectTrigger>
                    <SelectContent>{sellers.map(s => <SelectItem key={s._id} value={s._id}>{s.name}</SelectItem>)}</SelectContent>
                  </Select>
                </div>
                <div className="relative">
                  <Label className="text-xs font-bold">Item Name</Label>
                  <Input value={pForm.itemName} onChange={e => handleItemNameChange(e.target.value)} className="h-11 mt-1" placeholder="Search or add new item" />
                  {itemSuggestions.length > 0 && (
                    <div className="absolute z-50 w-full mt-1 bg-popover border border-border rounded-xl shadow-lg max-h-40 overflow-y-auto">
                      {itemSuggestions.map(name => (
                        <button key={name} className="w-full px-4 py-2.5 text-left hover:bg-muted text-sm font-medium" onClick={() => selectItemSuggestion(name)}>
                          {name}
                        </button>
                      ))}
                      <button className="w-full px-4 py-2.5 text-left hover:bg-muted text-sm text-primary font-bold" onClick={() => setItemSuggestions([])}>
                        + New: "{pForm.itemName}"
                      </button>
                    </div>
                  )}
                </div>
                {/* Image */}
                <div>
                  <Label className="text-xs font-bold">Product Image</Label>
                  <div className="mt-2 flex items-center gap-3">
                    {pForm.image ? (
                      <img src={pForm.image} alt="" className="h-16 w-16 rounded-xl object-cover border-2" />
                    ) : (
                      <div className="h-16 w-16 rounded-xl bg-muted flex items-center justify-center border-2"><ImageIcon className="h-6 w-6 text-muted-foreground" /></div>
                    )}
                    <div className="flex flex-col gap-1.5">
                      <Button variant="outline" size="sm" onClick={() => cameraRef.current?.click()} className="text-xs gap-1.5"><Camera className="h-3.5 w-3.5" />Capture</Button>
                      <Button variant="outline" size="sm" onClick={() => fileRef.current?.click()} className="text-xs gap-1.5"><ImageIcon className="h-3.5 w-3.5" />Browse</Button>
                    </div>
                    <input ref={cameraRef} type="file" accept="image/*" capture="environment" className="hidden" onChange={handleImageChange} />
                    <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleImageChange} />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div><Label className="text-xs font-bold">Quantity</Label><Input type="number" value={pForm.quantity} onChange={e => setPForm({...pForm, quantity: +e.target.value})} className="h-11 mt-1" /></div>
                  <div><Label className="text-xs font-bold">Total Price (₹)</Label><Input type="number" value={pForm.totalPrice} onChange={e => setPForm({...pForm, totalPrice: +e.target.value})} className="h-11 mt-1" /></div>
                </div>
                <div className="p-3 bg-muted rounded-xl text-sm space-y-1">
                  <div className="flex justify-between"><span className="font-medium">Per Unit Price:</span><span className="font-black">₹{perUnit}</span></div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div><Label className="text-xs font-bold">Sell Price (₹)</Label><Input type="number" value={pForm.sellPrice} onChange={e => setPForm({...pForm, sellPrice: +e.target.value})} className="h-11 mt-1" /></div>
                  <div><Label className="text-xs font-bold">Due Amount (₹)</Label><Input type="number" value={pForm.dueAmount} onChange={e => setPForm({...pForm, dueAmount: +e.target.value})} className="h-11 mt-1" /></div>
                </div>
                <div className={`p-3 rounded-xl text-center font-black ${estimatedProfit >= 0 ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400' : 'bg-red-500/10 text-red-500'}`}>
                  Est. Profit: ₹{estimatedProfit.toLocaleString()} ({pForm.quantity} × ₹{pForm.sellPrice - perUnit})
                </div>
                <div><Label className="text-xs font-bold">Date</Label><Input type="date" value={pForm.date} onChange={e => setPForm({...pForm, date: e.target.value})} className="h-11 mt-1" /></div>
                <Button onClick={handlePurchase} className="w-full h-12 font-black text-base">Record Purchase</Button>
              </div>
            </DialogContent>
          </Dialog>
          <Dialog open={sellerOpen} onOpenChange={(v) => { setSellerOpen(v); if (!v) reset(); }}>
            <DialogTrigger asChild><Button size="default" variant="outline" className="gap-2 font-bold h-11"><Plus className="h-4 w-4" />Seller</Button></DialogTrigger>
            <DialogContent>
              <DialogHeader><DialogTitle className="text-lg font-black">{editId ? 'Edit' : 'Add'} Seller</DialogTitle></DialogHeader>
              <div className="space-y-4 pt-2">
                <div><Label className="text-xs font-bold">Name</Label><Input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} className="h-11 mt-1" /></div>
                <div><Label className="text-xs font-bold">Phone</Label><Input value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} className="h-11 mt-1" /></div>
                <div><Label className="text-xs font-bold">Location</Label><Input value={form.location} onChange={e => setForm({ ...form, location: e.target.value })} className="h-11 mt-1" /></div>
                <Button onClick={handleSave} className="w-full h-12 font-black text-base">{editId ? 'Update' : 'Add'} Seller</Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <Tabs defaultValue="purchases">
        <TabsList className="mb-4">
          <TabsTrigger value="purchases" className="text-sm font-bold">Purchases</TabsTrigger>
          <TabsTrigger value="sellers" className="text-sm font-bold">Sellers</TabsTrigger>
        </TabsList>

        <TabsContent value="purchases">
          {purchases.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <ShoppingCart className="h-10 w-10 mx-auto mb-3 opacity-40" /><p className="text-sm font-medium">No purchases yet</p>
            </div>
          ) : (
            <div className="space-y-3">
              {[...purchases].reverse().map(p => (
                <div key={p._id} className="bg-card rounded-2xl border-2 border-border p-4 hover:border-primary/30 transition-all">
                  <div className="flex gap-3">
                    {p.image && <img src={p.image} alt="" className="h-14 w-14 rounded-xl object-cover shrink-0 border-2" />}
                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between items-start">
                        <div>
                          <p className="font-black text-base">{p.itemName}</p>
                          <p className="text-xs text-muted-foreground font-medium">From: {p.sellerName} • Qty: {p.quantity} • ₹{p.purchasePrice}/unit</p>
                        </div>
                        <div className="text-right flex items-center gap-1">
                          <div>
                            <p className="font-black text-base">₹{p.totalAmount.toLocaleString()}</p>
                            <p className="text-[10px] text-muted-foreground font-medium">{p.date}</p>
                          </div>
                          <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => { deletePurchase(p._id); toast.success('Deleted'); }}>
                            <Trash2 className="h-3.5 w-3.5 text-destructive" />
                          </Button>
                        </div>
                      </div>
                      {p.estimatedProfit !== undefined && (
                        <p className={`text-xs font-bold mt-1 ${p.estimatedProfit >= 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-500'}`}>
                          Est. Profit: ₹{p.estimatedProfit.toLocaleString()}
                        </p>
                      )}
                      {p.dueAmount > 0 && <p className="text-xs text-orange-500 font-bold">Due: ₹{p.dueAmount}</p>}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="sellers">
          {sellers.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <UserCheck className="h-10 w-10 mx-auto mb-3 opacity-40" /><p className="text-sm font-medium">No sellers yet</p>
            </div>
          ) : (
            <div className="space-y-3">
              {sellerStats.map(s => (
                <div key={s._id} className="bg-card rounded-2xl border-2 border-border p-4 hover:border-primary/30 transition-all">
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="font-black text-base">{s.name}</p>
                      <div className="flex flex-wrap gap-3 text-xs text-muted-foreground mt-1">
                        {s.phone && <span className="flex items-center gap-1"><Phone className="h-3 w-3" />{s.phone}</span>}
                        {s.location && <span className="flex items-center gap-1"><MapPin className="h-3 w-3" />{s.location}</span>}
                      </div>
                      <div className="flex gap-3 mt-2 text-xs">
                        <span className="bg-primary/10 text-primary font-bold px-2 py-1 rounded-lg">{s.purchaseCount} orders</span>
                        <span className="bg-muted font-bold px-2 py-1 rounded-lg">{s.totalItems} items</span>
                        <span className="bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-bold px-2 py-1 rounded-lg">₹{s.totalPurchased.toLocaleString()}</span>
                        {s.totalDue > 0 && <span className="bg-orange-500/10 text-orange-500 font-bold px-2 py-1 rounded-lg">Due: ₹{s.totalDue}</span>}
                      </div>
                    </div>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8"><MoreVertical className="h-4 w-4" /></Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => handleEdit(s)} className="gap-2"><Pencil className="h-4 w-4" /> Edit</DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem onClick={() => { deleteSeller(s._id); toast.success('Deleted'); }} className="gap-2 text-destructive"><Trash2 className="h-4 w-4" /> Delete</DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
