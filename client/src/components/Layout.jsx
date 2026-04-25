import { useState, useEffect, useRef } from "react";
import { Outlet, useNavigate } from "react-router-dom";
import { useLanguage } from "@/contexts/LanguageContext";
import { useTheme } from "@/contexts/ThemeContext";
import { useShop } from "@/contexts/ShopContext";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import { Search, PlusCircle, Bell, Moon, Sun, Globe, Package, Users } from "lucide-react";
import { AppSidebar } from "./AppSidebar";

export default function Layout() {
  const { theme, toggleTheme } = useTheme();
  const { language, setLanguage } = useLanguage();
  const navigate = useNavigate();
  
  // Bring in data for search
  const { products, customers } = useShop();
  
  // Search state
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState({ products: [], customers: [] });
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const searchRef = useRef(null);

  // Handle outside click to close search dropdown
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        setIsSearchOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Real-time filtering effect
  useEffect(() => {
    if (searchQuery.trim().length > 0) {
      const query = searchQuery.toLowerCase();
      
      // Filter products and limit to top 5
      const filteredProducts = products?.filter(p => 
        p.itemName?.toLowerCase().includes(query) || 
        p.category?.toLowerCase().includes(query)
      ).slice(0, 5) || [];

      // Filter customers and limit to top 3
      const filteredCustomers = customers?.filter(c => 
        c.name?.toLowerCase().includes(query) || 
        c.phone?.includes(query)
      ).slice(0, 3) || [];

      setSearchResults({ products: filteredProducts, customers: filteredCustomers });
      setIsSearchOpen(true);
    } else {
      setSearchResults({ products: [], customers: [] });
      setIsSearchOpen(false);
    }
  }, [searchQuery, products, customers]);

  const handleResultClick = (route) => {
    navigate(route);
    setIsSearchOpen(false);
    setSearchQuery("");
  };

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-background">
        <AppSidebar />
        <div className="flex-1 flex flex-col min-w-0">
          <header className="h-16 flex items-center justify-between border-b-2 border-border/60 bg-card px-4 md:px-6 shrink-0 z-10 sticky top-0">
            <div className="flex items-center gap-4">
              <SidebarTrigger className="h-9 w-9 border-2 border-border/50 rounded-lg hover:bg-muted" />
            </div>

            <div className="hidden md:flex flex-1 max-w-xl mx-8">
              <div className="relative w-full flex items-center" ref={searchRef}>
                <Search className="absolute left-3 h-4 w-4 text-muted-foreground" />
                <input 
                  type="text" 
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onFocus={() => searchQuery.trim().length > 0 && setIsSearchOpen(true)}
                  placeholder="Search products, orders, or customers..." 
                  className="w-full bg-muted/40 border-2 border-border/50 rounded-full py-2 pl-10 pr-4 text-sm font-medium text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary/50 focus:ring-2 focus:ring-primary/20 transition-all"
                />

                {/* Real-time Search Dropdown */}
                {isSearchOpen && (searchResults.products.length > 0 || searchResults.customers.length > 0) && (
                  <div className="absolute top-full mt-2 w-full bg-popover border-2 border-border/80 shadow-xl rounded-xl overflow-hidden z-50 animate-in fade-in slide-in-from-top-2 duration-200">
                    
                    {searchResults.products.length > 0 && (
                      <div className="py-2">
                        <div className="px-4 py-1 text-[10px] font-black text-muted-foreground uppercase tracking-widest bg-muted/20">
                          Products
                        </div>
                        {searchResults.products.map((product) => (
                          <div 
                            key={product._id} 
                            onClick={() => handleResultClick('/products')}
                            className="flex items-center justify-between px-4 py-2 hover:bg-primary/10 cursor-pointer transition-colors"
                          >
                            <div className="flex items-center gap-3 overflow-hidden">
                              <Package className="h-4 w-4 text-primary shrink-0" />
                              <div className="truncate">
                                <p className="text-sm font-bold text-foreground truncate">{product.itemName}</p>
                                <p className="text-xs font-semibold text-muted-foreground">{product.category}</p>
                              </div>
                            </div>
                            <span className="text-xs font-black text-foreground ml-2 shrink-0">₹{product.price}</span>
                          </div>
                        ))}
                      </div>
                    )}

                    {searchResults.customers.length > 0 && (
                      <div className="py-2 border-t border-border/50">
                        <div className="px-4 py-1 text-[10px] font-black text-muted-foreground uppercase tracking-widest bg-muted/20">
                          Customers
                        </div>
                        {searchResults.customers.map((customer) => (
                          <div 
                            key={customer._id || customer.phone} 
                            onClick={() => handleResultClick('/customers')}
                            className="flex items-center gap-3 px-4 py-2 hover:bg-blue-500/10 cursor-pointer transition-colors"
                          >
                            <Users className="h-4 w-4 text-blue-500 shrink-0" />
                            <div className="truncate">
                              <p className="text-sm font-bold text-foreground truncate">{customer.name}</p>
                              <p className="text-xs font-semibold text-muted-foreground">{customer.phone}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
                {/* No results state */}
                {isSearchOpen && searchQuery.trim().length > 0 && searchResults.products.length === 0 && searchResults.customers.length === 0 && (
                  <div className="absolute top-full mt-2 w-full bg-popover border-2 border-border/80 shadow-xl rounded-xl p-4 text-center z-50">
                    <p className="text-sm font-bold text-muted-foreground">No matches found for "{searchQuery}"</p>
                  </div>
                )}
              </div>
            </div>

            <div className="flex items-center gap-3">
              <Button onClick={() => navigate('/sales')} className="hidden sm:flex bg-primary hover:bg-primary/90 text-primary-foreground font-black uppercase tracking-wider text-xs px-5 rounded-full shadow-md">
                <PlusCircle className="h-4 w-4 mr-2" /> Quick Sale
              </Button>
              <div className="w-px h-6 bg-border/80 mx-1 hidden sm:block"></div>
              <Button variant="ghost" size="icon" className="h-9 w-9 rounded-full border-2 border-transparent hover:border-border/50" onClick={toggleTheme}>
                {theme === 'light' ? <Moon className="h-4 w-4" /> : <Sun className="h-4 w-4" />}
              </Button>
              <Button variant="ghost" size="sm" className="h-9 px-3 rounded-full border-2 border-transparent hover:border-border/50 font-bold text-xs gap-1.5" onClick={() => setLanguage(language === 'en' ? 'hi' : 'en')}>
                <Globe className="h-3.5 w-3.5" />
                {language === 'en' ? 'हिं' : 'EN'}
              </Button>
              <Button variant="ghost" size="icon" className="h-9 w-9 rounded-full relative border-2 border-transparent hover:border-border/50">
                <Bell className="h-4 w-4" />
                <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-red-500 animate-pulse"></span>
              </Button>
            </div>
          </header>
          <main className="flex-1 overflow-auto p-4 md:p-8">
            <Outlet />
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}