import { useState, useRef, useMemo } from 'react';
import { useShop } from '@/contexts/ShopContext';
import { useLanguage, PRODUCT_CATEGORIES } from '@/contexts/LanguageContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator } from '@/components/ui/dropdown-menu';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Package, Pencil, Trash2, Search, Filter, AlertTriangle, MoreVertical, Eye, IndianRupee } from 'lucide-react';
import { toast } from 'sonner';

export default function Products() {
  const { products, updateProduct, deleteProduct } = useShop();
  const { t } = useLanguage();
  const [editOpen, setEditOpen] = useState(false);
  const [editId, setEditId] = useState(null);
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [detailProduct, setDetailProduct] = useState(null);
  const [form, setForm] = useState({ itemName: '', printPrice: 0, purchasePrice: 0, sellPrice: 0, image: '', category: '' });
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const fileRef = useRef(null);
  const cameraRef = useRef(null);

  const reset = () => { setForm({ itemName: '', printPrice: 0, purchasePrice: 0, sellPrice: 0, image: '', category: '' }); setEditId(null); };

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
          resolve(canvas.toDataURL('image/jpeg', 0.6));
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
    setForm(f => ({ ...f, image: compressed }));
  };

  const handleSave = () => {
    if (!form.itemName.trim()) { toast.error(t('Enter product name')); return; }
    if (editId) { updateProduct(editId, form); toast.success(t('Updated')); }
    reset(); setEditOpen(false);
  };

  const handleEdit = (p) => {
    setForm({ itemName: p.itemName, printPrice: p.printPrice, purchasePrice: p.purchasePrice, sellPrice: p.sellPrice, image: p.image || '', category: p.category || '' });
    setEditId(p._id); setEditOpen(true);
  };

  const handleDelete = (id) => {
    deleteProduct(id); toast.success(t('Deleted')); setDeleteConfirm(null);
  };

  const usedCategories = useMemo(() => {
    const cats = new Set(products.map(p => p.category || 'Uncategorized'));
    return Array.from(cats).sort();
  }, [products]);

  const filtered = useMemo(() => {
    let result = products;
    if (selectedCategory !== 'all') result = result.filter(p => (p.category || 'Uncategorized') === selectedCategory);
    if (search.trim()) result = result.filter(p => p.itemName.toLowerCase().includes(search.toLowerCase()));
    return result;
  }, [products, search, selectedCategory]);

  const detailP = detailProduct ? products.find(p => p._id === detailProduct) : null;

  return (
    <div className="max-w-4xl mx-auto">
      <div className="flex items-center justify-between mb-5">
        <div>
          <h2 className="text-2xl font-black text-foreground">{t('Products')}</h2>
          <p className="text-sm text-muted-foreground font-medium">{products.length} {t('items in stock')}</p>
        </div>
        <p className="text-xs text-muted-foreground bg-muted px-3 py-1.5 rounded-full font-semibold">
          Add products via Buy/Sellers
        </p>
      </div>

      {/* Search + Filter */}
      <div className="flex gap-3 mb-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-3 h-5 w-5 text-muted-foreground" />
          <Input value={search} onChange={e => setSearch(e.target.value)} className="h-11 pl-11 text-sm" placeholder={t('Search products...')} />
        </div>
        <Select value={selectedCategory} onValueChange={setSelectedCategory}>
          <SelectTrigger className="h-11 w-auto min-w-[120px]">
            <Filter className="h-4 w-4 mr-2" /><SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">{t('All Categories')}</SelectItem>
            {usedCategories.map(c => <SelectItem key={c} value={c}>{t(c)}</SelectItem>)}
          </SelectContent>
        </Select>
      </div>

      {/* Category chips */}
      <div className="flex gap-2 overflow-x-auto pb-3 mb-4 scrollbar-hide">
        <button onClick={() => setSelectedCategory('all')}
          className={`shrink-0 px-4 py-2 rounded-full text-xs font-bold transition-colors ${selectedCategory === 'all' ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground hover:bg-accent'}`}
        >
          {t('All')} ({products.length})
        </button>
        {usedCategories.map(c => {
          const count = products.filter(p => (p.category || 'Uncategorized') === c).length;
          return (
            <button key={c} onClick={() => setSelectedCategory(c)}
              className={`shrink-0 px-4 py-2 rounded-full text-xs font-bold transition-colors ${selectedCategory === c ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground hover:bg-accent'}`}
            >{t(c)} ({count})</button>
          );
        })}
      </div>

      {filtered.length === 0 ? (
        <div className="text-center py-16 text-muted-foreground">
          <Package className="h-12 w-12 mx-auto mb-3 opacity-40" />
          <p className="text-base font-medium">{search ? t('No products found') : t('No products yet')}</p>
          <p className="text-sm mt-1">Add products from Buy/Sellers section</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
          {filtered.map(p => (
            <div key={p._id} className="bg-card rounded-2xl border-2 border-border overflow-hidden hover:shadow-xl transition-all group hover:border-primary/40 relative">
              <div className="aspect-square bg-muted relative">
                {p.image ? (
                  <img src={p.image} alt={p.itemName} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <Package className="h-10 w-10 text-muted-foreground/30" />
                  </div>
                )}
                <span className={`absolute top-2 right-2 text-xs font-black px-2.5 py-1 rounded-full shadow ${
                  p.stock === 0 ? 'bg-destructive text-destructive-foreground' : p.stock <= 5 ? 'bg-secondary text-secondary-foreground' : 'bg-primary text-primary-foreground'
                }`}>{p.stock}</span>
                {p.category && (
                  <span className="absolute top-2 left-2 text-[10px] font-bold px-2 py-1 rounded-full bg-card/90 backdrop-blur-sm text-foreground shadow">
                    {t(p.category)}
                  </span>
                )}
              </div>
              <div className="p-3">
                <div className="flex items-start justify-between gap-1">
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-bold text-foreground truncate">{p.itemName}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-sm font-black text-primary">₹{p.sellPrice}</span>
                      {p.printPrice > p.sellPrice && (
                        <span className="text-xs text-muted-foreground line-through">₹{p.printPrice}</span>
                      )}
                    </div>
                  </div>
                  {/* 3-dot menu */}
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-8 w-8 shrink-0">
                        <MoreVertical className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-44">
                      <DropdownMenuItem onClick={() => setDetailProduct(p._id)} className="gap-2">
                        <Eye className="h-4 w-4" /> View Details
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => handleEdit(p)} className="gap-2">
                        <Pencil className="h-4 w-4" /> Edit
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem onClick={() => setDeleteConfirm(p._id)} className="gap-2 text-destructive">
                        <Trash2 className="h-4 w-4" /> Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Product Detail Dialog */}
      <Dialog open={detailProduct !== null} onOpenChange={(v) => !v && setDetailProduct(null)}>
        <DialogContent className="max-w-sm">
          <DialogHeader><DialogTitle className="text-lg font-black">Product Details</DialogTitle></DialogHeader>
          {detailP && (
            <div className="space-y-4">
              {detailP.image && (
                <img src={detailP.image} alt={detailP.itemName} className="w-full aspect-square rounded-2xl object-cover border-2" />
              )}
              <div>
                <h3 className="text-xl font-black text-foreground">{detailP.itemName}</h3>
                {detailP.category && <span className="text-xs font-bold text-primary bg-primary/10 px-2 py-1 rounded-full">{detailP.category}</span>}
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-muted rounded-xl p-3 text-center">
                  <p className="text-[10px] font-bold text-muted-foreground">MRP</p>
                  <p className="text-lg font-black text-foreground">₹{detailP.printPrice}</p>
                </div>
                <div className="bg-muted rounded-xl p-3 text-center">
                  <p className="text-[10px] font-bold text-muted-foreground">Sell Price</p>
                  <p className="text-lg font-black text-primary">₹{detailP.sellPrice}</p>
                </div>
                <div className="bg-muted rounded-xl p-3 text-center">
                  <p className="text-[10px] font-bold text-muted-foreground">Buy Price</p>
                  <p className="text-lg font-black text-foreground">₹{detailP.purchasePrice}</p>
                </div>
                <div className="bg-muted rounded-xl p-3 text-center">
                  <p className="text-[10px] font-bold text-muted-foreground">Stock</p>
                  <p className={`text-lg font-black ${detailP.stock <= 5 ? 'text-destructive' : 'text-emerald-600'}`}>{detailP.stock}</p>
                </div>
              </div>
              <div className="bg-emerald-500/10 dark:bg-emerald-500/20 rounded-xl p-3 text-center">
                <p className="text-xs font-bold text-muted-foreground">Profit per unit</p>
                <p className="text-xl font-black text-emerald-600 dark:text-emerald-400">
                  ₹{(detailP.sellPrice - detailP.purchasePrice).toLocaleString()}
                </p>
              </div>
              <div className="flex gap-2">
                <Button onClick={() => { setDetailProduct(null); handleEdit(detailP); }} className="flex-1 gap-2">
                  <Pencil className="h-4 w-4" /> Edit
                </Button>
                <Button variant="destructive" onClick={() => { setDetailProduct(null); setDeleteConfirm(detailP._id); }} className="gap-2">
                  <Trash2 className="h-4 w-4" /> Delete
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Edit Dialog */}
      <Dialog open={editOpen} onOpenChange={(v) => { setEditOpen(v); if (!v) reset(); }}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader><DialogTitle className="text-lg font-black">Edit Product</DialogTitle></DialogHeader>
          <div className="space-y-4 pt-2">
            <div>
              <Label className="text-xs font-bold">Product Image</Label>
              <div className="mt-2 flex items-center gap-4">
                {form.image ? (
                  <img src={form.image} alt="" className="h-20 w-20 rounded-xl object-cover border-2" />
                ) : (
                  <div className="h-20 w-20 rounded-xl bg-muted flex items-center justify-center border-2"><Package className="h-8 w-8 text-muted-foreground" /></div>
                )}
                <div className="flex flex-col gap-2">
                  <Button variant="outline" size="sm" onClick={() => cameraRef.current?.click()} className="text-xs">📷 Capture</Button>
                  <Button variant="outline" size="sm" onClick={() => fileRef.current?.click()} className="text-xs">📁 Browse</Button>
                  {form.image && <Button variant="ghost" size="sm" onClick={() => setForm(f => ({...f, image: ''}))} className="text-xs text-destructive">Remove</Button>}
                </div>
                <input ref={cameraRef} type="file" accept="image/*" capture="environment" className="hidden" onChange={handleImageChange} />
                <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleImageChange} />
              </div>
            </div>
            <div>
              <Label className="text-xs font-bold">Item Name</Label>
              <Input value={form.itemName} onChange={e => setForm({ ...form, itemName: e.target.value })} className="h-11 mt-1" />
            </div>
            <div>
              <Label className="text-xs font-bold">Category</Label>
              <Select value={form.category || 'Other'} onValueChange={v => setForm({ ...form, category: v })}>
                <SelectTrigger className="h-11 mt-1"><SelectValue /></SelectTrigger>
                <SelectContent>
                  {PRODUCT_CATEGORIES.map(c => <SelectItem key={c} value={c}>{t(c)}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-3 gap-3">
              <div><Label className="text-xs font-bold">MRP (₹)</Label><Input type="number" value={form.printPrice} onChange={e => setForm({ ...form, printPrice: +e.target.value })} className="h-11 mt-1" /></div>
              <div><Label className="text-xs font-bold">Buy (₹)</Label><Input type="number" value={form.purchasePrice} onChange={e => setForm({ ...form, purchasePrice: +e.target.value })} className="h-11 mt-1" /></div>
              <div><Label className="text-xs font-bold">Sell (₹)</Label><Input type="number" value={form.sellPrice} onChange={e => setForm({ ...form, sellPrice: +e.target.value })} className="h-11 mt-1" /></div>
            </div>
            <Button onClick={handleSave} className="w-full h-12 text-base font-bold">Update Product</Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Delete */}
      <AlertDialog open={deleteConfirm !== null} onOpenChange={(open) => !open && setDeleteConfirm(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2 text-lg">
              <AlertTriangle className="h-5 w-5 text-destructive" /> Delete Product?
            </AlertDialogTitle>
            <AlertDialogDescription>
              {deleteConfirm && <>Delete <strong>{products.find(p => p._id === deleteConfirm)?.itemName}</strong>? This cannot be undone.</>}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="h-11">Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={() => deleteConfirm && handleDelete(deleteConfirm)} className="h-11 bg-destructive text-destructive-foreground hover:bg-destructive/90 font-bold">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
