import { useMemo, useRef, useState, useCallback, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useShop } from "@/contexts/ShopContext";
import { useLanguage } from "@/contexts/LanguageContext";
import {
  LayoutDashboard, Package, Users, UserCheck, Receipt,
  LogOut, Store, UserCheck2, Calculator, TrendingDown,
  ChevronRight, Settings, User, X
} from "lucide-react";
import { cn } from "@/lib/utils";
import {
  Sidebar, SidebarContent, SidebarFooter, useSidebar
} from "@/components/ui/sidebar";

/* ─── Nav config ─────────────────────────────────────────── */
const NAV_ITEMS = [
  { section: "Main",    title: "Dashboard",     url: "/",              icon: LayoutDashboard },
  { section: "Main",    title: "Products",      url: "/products",      icon: Package,      hasFlyout: true },
  { section: "Main",    title: "Sales",         url: "/sales",         icon: Receipt,      badge: 3 },
  { section: "Main",    title: "Customers",     url: "/customers",     icon: Users },
  { section: "Finance", title: "Expenditure",   url: "/expenditure",   icon: TrendingDown },
  { section: "Finance", title: "Buy / Sellers", url: "/sellers",       icon: UserCheck },
  { section: "HR",      title: "Employees",     url: "/employees",     icon: UserCheck2 },
  { section: "HR",      title: "Daily Tracker", url: "/daily-tracker", icon: Calculator },
];

const SECTIONS = ["Main", "Finance", "HR"];

/* ─── Category Flyout ────────────────────────────────────── */
function CategoryFlyout({ categoryData, sidebarWidth, onNavigate, onClose }) {
  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-[998] bg-black/20 backdrop-blur-[2px]"
        onClick={onClose}
      />

      {/* Panel */}
      <div
        className="fixed top-0 h-screen z-[999] bg-white dark:bg-[#0f1117] border-l border-zinc-200 dark:border-zinc-800 shadow-2xl flex flex-col"
        style={{ left: sidebarWidth, width: Math.min(540, window.innerWidth - sidebarWidth) }}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-zinc-100 dark:border-zinc-800">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-indigo-50 dark:bg-indigo-500/10">
              <Package className="h-4 w-4 text-indigo-600 dark:text-indigo-400" />
            </div>
            <div>
              <h2 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">
                Product Categories
              </h2>
              <p className="text-xs text-zinc-400 mt-0.5">
                {categoryData.length} {categoryData.length === 1 ? "category" : "categories"}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-md text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Grid */}
        <div className="flex-1 overflow-y-auto p-6">
          {categoryData.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-48 gap-3">
              <div className="p-4 rounded-2xl bg-zinc-100 dark:bg-zinc-800">
                <Package className="h-8 w-8 text-zinc-300 dark:text-zinc-600" />
              </div>
              <p className="text-sm text-zinc-400">No categories yet</p>
            </div>
          ) : (
            <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
              {categoryData.map((cat) => (
                <button
                  key={cat.name}
                  onClick={() => onNavigate(cat.name)}
                  className="group flex flex-col items-center gap-2 p-3 rounded-xl border border-zinc-100 dark:border-zinc-800 hover:border-indigo-300 dark:hover:border-indigo-500 hover:bg-indigo-50 dark:hover:bg-indigo-500/5 transition-all duration-200 text-left"
                >
                  <div className="w-12 h-12 rounded-lg bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 overflow-hidden flex items-center justify-center">
                    {cat.image ? (
                      <img
                        src={cat.image}
                        alt={cat.name}
                        className="max-h-full object-contain group-hover:scale-110 transition-transform duration-200"
                      />
                    ) : (
                      <Package className="h-5 w-5 text-zinc-400" />
                    )}
                  </div>
                  <p className="text-xs font-medium text-zinc-700 dark:text-zinc-300 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 text-center leading-tight line-clamp-2">
                    {cat.name}
                  </p>
                  <span className="text-[10px] text-zinc-400 font-medium">
                    {cat.count} {cat.count === 1 ? "item" : "items"}
                  </span>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </>
  );
}

/* ─── Main Sidebar ───────────────────────────────────────── */
export function AppSidebar() {
  const { state } = useSidebar();
  const collapsed = state === "collapsed";
  const sidebarWidth = collapsed ? 64 : 240;

  const { shopName, logout, products = [], user } = useShop();
  const { t } = useLanguage();
  const navigate = useNavigate();
  const location = useLocation();

  const [flyoutOpen, setFlyoutOpen] = useState(false);

  // Close flyout on route change
  useEffect(() => {
    setFlyoutOpen(false);
  }, [location.pathname]);

  // Close flyout on Escape key
  useEffect(() => {
    const handler = (e) => { if (e.key === "Escape") setFlyoutOpen(false); };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, []);

  /* Category data */
  const categoryData = useMemo(() => {
    const catMap = new Map();
    for (const p of products) {
      if (!p.category) continue;
      const existing = catMap.get(p.category);
      if (!existing) {
        catMap.set(p.category, { count: 1, image: p.image ?? null });
      } else {
        existing.count++;
      }
    }
    return Array.from(catMap.entries()).map(([name, data]) => ({ name, ...data }));
  }, [products]);

  const isActive = useCallback(
    (url) => (url === "/" ? location.pathname === "/" : location.pathname.startsWith(url)),
    [location.pathname]
  );

  const handleNavClick = (item) => {
    navigate(item.url);
    if (item.hasFlyout) {
      setFlyoutOpen((prev) => !prev);
    } else {
      setFlyoutOpen(false);
    }
  };

  return (
    <>
      <Sidebar collapsible="icon" className="border-r border-zinc-200 dark:border-zinc-800">
        <SidebarContent className="bg-white dark:bg-[#0f1117] flex flex-col h-full">

          {/* Logo / Brand */}
          <div className={cn(
            "h-16 flex items-center gap-3 border-b border-zinc-100 dark:border-zinc-800 px-4 flex-shrink-0",
            collapsed && "justify-center px-0"
          )}>
            <div className="p-2 rounded-xl bg-indigo-600 flex-shrink-0">
              <Store className="h-4 w-4 text-white" />
            </div>
            {!collapsed && (
              <>
                <span className="font-bold text-sm text-zinc-900 dark:text-zinc-100 truncate flex-1">
                  {shopName || "EasyShop"}
                </span>
                <span className="text-[10px] font-bold bg-indigo-100 dark:bg-indigo-500/20 text-indigo-600 dark:text-indigo-400 px-2 py-0.5 rounded-full tracking-wide flex-shrink-0">
                  PRO
                </span>
              </>
            )}
          </div>

          {/* Navigation */}
          <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-5">
            {SECTIONS.map((section) => {
              const items = NAV_ITEMS.filter((n) => n.section === section);
              return (
                <div key={section}>
                  {!collapsed && (
                    <p className="text-[10px] font-bold uppercase tracking-widest text-zinc-400 dark:text-zinc-500 px-2 mb-2">
                      {section}
                    </p>
                  )}
                  <div className="space-y-0.5">
                    {items.map((item) => {
                      const active = isActive(item.url);
                      const isFlyoutActive = item.hasFlyout && flyoutOpen;

                      return (
                        <button
                          key={item.title}
                          onClick={() => handleNavClick(item)}
                          title={collapsed ? String(t(item.title)) : undefined}
                          className={cn(
                            "w-full flex items-center gap-2.5 rounded-lg text-sm font-medium transition-all duration-150 outline-none focus-visible:ring-2 focus-visible:ring-indigo-500",
                            collapsed ? "justify-center h-10 w-10 mx-auto" : "px-3 py-2.5",
                            active || isFlyoutActive
                              ? "bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400"
                              : "text-zinc-500 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800/60 hover:text-zinc-900 dark:hover:text-zinc-100"
                          )}
                        >
                          {/* Left accent */}
                          {(active || isFlyoutActive) && !collapsed && (
                            <span className="absolute left-3 w-0.5 h-4 bg-indigo-500 rounded-full" aria-hidden />
                          )}

                          <item.icon className={cn(
                            "h-[18px] w-[18px] flex-shrink-0 transition-colors",
                            (active || isFlyoutActive) ? "text-indigo-600 dark:text-indigo-400" : ""
                          )} />

                          {!collapsed && (
                            <span className="flex-1 text-left">{t(item.title)}</span>
                          )}

                          {!collapsed && item.badge && (
                            <span className="bg-red-500 text-white text-[10px] font-bold min-w-[18px] h-[18px] rounded-full flex items-center justify-center px-1 flex-shrink-0">
                              {item.badge}
                            </span>
                          )}

                          {!collapsed && item.hasFlyout && (
                            <ChevronRight
                              className={cn(
                                "h-3.5 w-3.5 flex-shrink-0 transition-transform duration-200",
                                isFlyoutActive ? "rotate-90 text-indigo-500" : "text-zinc-300 dark:text-zinc-600"
                              )}
                            />
                          )}
                        </button>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </nav>
        </SidebarContent>

        {/* Footer */}
        <SidebarFooter className="p-3 border-t border-zinc-100 dark:border-zinc-800 bg-white dark:bg-[#0f1117] space-y-1.5">
          {/* User info */}
          {!collapsed ? (
            <div className="flex items-center gap-2.5 px-3 py-2.5 rounded-lg hover:bg-zinc-50 dark:hover:bg-zinc-800/60 transition-colors cursor-pointer group">
              <div className="h-7 w-7 rounded-full bg-indigo-100 dark:bg-indigo-500/20 flex items-center justify-center flex-shrink-0">
                <User className="h-3.5 w-3.5 text-indigo-600 dark:text-indigo-400" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-semibold text-zinc-900 dark:text-zinc-100 truncate">
                  {user?.name ?? "Admin"}
                </p>
                <p className="text-[10px] text-zinc-400">Owner</p>
              </div>
              <Settings className="h-3.5 w-3.5 text-zinc-300 dark:text-zinc-600 group-hover:text-zinc-500 transition-colors" />
            </div>
          ) : (
            <div className="flex justify-center">
              <div className="h-8 w-8 rounded-full bg-indigo-100 dark:bg-indigo-500/20 flex items-center justify-center">
                <User className="h-3.5 w-3.5 text-indigo-600 dark:text-indigo-400" />
              </div>
            </div>
          )}

          {/* Logout */}
          <button
            onClick={logout}
            className={cn(
              "flex items-center gap-2.5 w-full rounded-lg font-semibold text-sm transition-all duration-150 outline-none focus-visible:ring-2 focus-visible:ring-red-400",
              "text-red-500 hover:bg-red-500 hover:text-white",
              collapsed ? "justify-center h-9 w-9 mx-auto" : "px-3 py-2"
            )}
            title={collapsed ? "Logout" : undefined}
          >
            <LogOut className="h-4 w-4 flex-shrink-0" />
            {!collapsed && <span>Logout</span>}
          </button>
        </SidebarFooter>
      </Sidebar>

      {/* Flyout Panel */}
      {flyoutOpen && (
        <CategoryFlyout
          categoryData={categoryData}
          sidebarWidth={sidebarWidth}
          onNavigate={(cat) => {
            setFlyoutOpen(false);
            navigate(`/products?category=${encodeURIComponent(cat)}`);
          }}
          onClose={() => setFlyoutOpen(false)}
        />
      )}
    </>
  );
}