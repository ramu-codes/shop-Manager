import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import * as api from '@/api';

const ShopContext = createContext(null);

export const ShopProvider = ({ children }) => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [shopName, setShopName] = useState('');
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [dataLoadError, setDataLoadError] = useState(null);

  const [customers, setCustomers] = useState([]);
  const [sellers, setSellers] = useState([]);
  const [products, setProducts] = useState([]);
  const [purchases, setPurchases] = useState([]);
  const [sales, setSales] = useState([]);
  const [expenses, setExpenses] = useState([]);
  const [payments, setPayments] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [attendance, setAttendance] = useState([]);
  const [salaryPayments, setSalaryPayments] = useState([]);
  const [dailyEntries, setDailyEntries] = useState([]);

  const fetchAllData = useCallback(async () => {
    setDataLoadError(null);
    try {
      const [
        custRes, selRes, prodRes, purchRes, saleRes,
        expRes, payRes, empRes, attRes, salPayRes, dailyRes,
      ] = await Promise.all([
        api.getCustomers(),
        api.getSellers(),
        api.getProducts(),
        api.getPurchases(),
        api.getSales(),
        api.getExpenses(),
        api.getPayments(),
        api.getEmployees(),
        api.getAttendance(),
        api.getSalaryPayments(),
        api.getDailyEntries(),
      ]);
      setCustomers(custRes.data);
      setSellers(selRes.data);
      setProducts(prodRes.data);
      setPurchases(purchRes.data);
      setSales(saleRes.data);
      setExpenses(expRes.data);
      setPayments(payRes.data);
      setEmployees(empRes.data);
      setAttendance(attRes.data);
      setSalaryPayments(salPayRes.data);
      setDailyEntries(dailyRes.data);
    } catch (err) {
      const msg = err.response?.data?.message || err.message || 'Failed to load data';
      setDataLoadError(msg);
      console.error('Failed to fetch data:', err);
    }
  }, []);

  useEffect(() => {
    const init = async () => {
      const token = localStorage.getItem('easyshop_token');
      const savedShopName = localStorage.getItem('easyshop_shopName');
      if (!token) {
        setLoading(false);
        return;
      }
      try {
        const { data } = await api.getMe();
        setIsLoggedIn(true);
        setShopName(data.shopName || savedShopName || '');
        setUser(data);
        await fetchAllData();
      } catch {
        localStorage.removeItem('easyshop_token');
        localStorage.removeItem('easyshop_shopName');
        setIsLoggedIn(false);
        setShopName('');
        setUser(null);
      } finally {
        setLoading(false);
      }
    };
    init();
  }, [fetchAllData]);

  const login = useCallback(async (email, password) => {
    try {
      const { data } = await api.loginUser({ email, password });
      localStorage.setItem('easyshop_token', data.token);
      localStorage.setItem('easyshop_shopName', data.shopName);
      setIsLoggedIn(true);
      setShopName(data.shopName);
      setUser(data);
      await fetchAllData();
      return true;
    } catch {
      return false;
    }
  }, [fetchAllData]);

  const register = useCallback(async (shopNameValue, email, password) => {
    try {
      const { data } = await api.registerUser({ shopName: shopNameValue, email, password });
      localStorage.setItem('easyshop_token', data.token);
      localStorage.setItem('easyshop_shopName', data.shopName);
      setIsLoggedIn(true);
      setShopName(data.shopName);
      setUser(data);
      await fetchAllData();
      return true;
    } catch {
      return false;
    }
  }, [fetchAllData]);

  const logout = useCallback(() => {
    localStorage.removeItem('easyshop_token');
    localStorage.removeItem('easyshop_shopName');
    setIsLoggedIn(false);
    setShopName('');
    setUser(null);
    setDataLoadError(null);
    setCustomers([]);
    setSellers([]);
    setProducts([]);
    setPurchases([]);
    setSales([]);
    setExpenses([]);
    setPayments([]);
    setEmployees([]);
    setAttendance([]);
    setSalaryPayments([]);
    setDailyEntries([]);
  }, []);

  const clearDataLoadError = useCallback(() => setDataLoadError(null), []);

  const addCustomer = useCallback(async (c) => {
    const { data } = await api.createCustomer(c);
    setCustomers((prev) => [data, ...prev]);
  }, []);
  const updateCustomer = useCallback(async (id, c) => {
    const { data } = await api.updateCustomer(id, c);
    setCustomers((prev) => prev.map((x) => (x._id === id ? data : x)));
  }, []);
  const deleteCustomer = useCallback(async (id) => {
    await api.deleteCustomer(id);
    setCustomers((prev) => prev.filter((x) => x._id !== id));
  }, []);

  const addSeller = useCallback(async (s) => {
    const { data } = await api.createSeller(s);
    setSellers((prev) => [data, ...prev]);
  }, []);
  const updateSeller = useCallback(async (id, s) => {
    const { data } = await api.updateSeller(id, s);
    setSellers((prev) => prev.map((x) => (x._id === id ? data : x)));
  }, []);
  const deleteSeller = useCallback(async (id) => {
    await api.deleteSeller(id);
    setSellers((prev) => prev.filter((x) => x._id !== id));
  }, []);

  const addProduct = useCallback(async (p) => {
    const { data } = await api.createProduct(p);
    setProducts((prev) => [data, ...prev]);
  }, []);
  const updateProduct = useCallback(async (id, p) => {
    const { data } = await api.updateProduct(id, p);
    setProducts((prev) => prev.map((x) => (x._id === id ? data : x)));
  }, []);
  const deleteProduct = useCallback(async (id) => {
    await api.deleteProduct(id);
    setProducts((prev) => prev.filter((x) => x._id !== id));
  }, []);

  const addPurchase = useCallback(async (p) => {
    const { data } = await api.createPurchase(p);
    setPurchases((prev) => [data, ...prev]);
    const prodRes = await api.getProducts();
    setProducts(prodRes.data);
  }, []);
  const updatePurchase = useCallback(async (id, p) => {
    const { data } = await api.updatePurchase(id, p);
    setPurchases((prev) => prev.map((x) => (x._id === id ? data : x)));
  }, []);
  const deletePurchase = useCallback(async (id) => {
    await api.deletePurchase(id);
    setPurchases((prev) => prev.filter((x) => x._id !== id));
    const prodRes = await api.getProducts();
    setProducts(prodRes.data);
  }, []);

  const getNextInvoiceNo = useCallback(async () => {
    const { data } = await api.getNextInvoice();
    return data.invoiceNo;
  }, []);

  const addSale = useCallback(async (s) => {
    const { data } = await api.createSale(s);
    setSales((prev) => [data, ...prev]);
    const [prodRes, custRes] = await Promise.all([api.getProducts(), api.getCustomers()]);
    setProducts(prodRes.data);
    setCustomers(custRes.data);
  }, []);
  const updateSale = useCallback(async (id, s) => {
    const { data } = await api.updateSale(id, s);
    setSales((prev) => prev.map((x) => (x._id === id ? data : x)));
  }, []);
  const deleteSale = useCallback(async (id) => {
    await api.deleteSale(id);
    setSales((prev) => prev.filter((x) => x._id !== id));
    const [prodRes, custRes] = await Promise.all([api.getProducts(), api.getCustomers()]);
    setProducts(prodRes.data);
    setCustomers(custRes.data);
  }, []);

  const addExpense = useCallback(async (e) => {
    const { data } = await api.createExpense(e);
    setExpenses((prev) => [data, ...prev]);
  }, []);

  const addPayment = useCallback(async (p) => {
    const { data } = await api.createPayment(p);
    setPayments((prev) => [data, ...prev]);
    const custRes = await api.getCustomers();
    setCustomers(custRes.data);
  }, []);

  const addEmployee = useCallback(async (e) => {
    const { data } = await api.createEmployee(e);
    setEmployees((prev) => [data, ...prev]);
  }, []);
  const updateEmployee = useCallback(async (id, e) => {
    const { data } = await api.updateEmployee(id, e);
    setEmployees((prev) => prev.map((x) => (x._id === id ? data : x)));
  }, []);
  const deleteEmployee = useCallback(async (id) => {
    await api.deleteEmployee(id);
    setEmployees((prev) => prev.filter((x) => x._id !== id));
  }, []);

  const markAttendance = useCallback(async (a) => {
    const { data } = await api.markAttendance(a);
    setAttendance((prev) => {
      const idx = prev.findIndex(
        (x) => x.employeeId === a.employeeId && x.date === a.date
      );
      if (idx >= 0) return prev.map((x, i) => (i === idx ? data : x));
      return [...prev, data];
    });
  }, []);

  const addSalaryPayment = useCallback(async (p) => {
    const { data } = await api.createSalaryPayment(p);
    setSalaryPayments((prev) => [data, ...prev]);
  }, []);

  const addDailyEntry = useCallback(async (e) => {
    const { data } = await api.createDailyEntry(e);
    setDailyEntries((prev) => [data, ...prev]);
  }, []);
  const updateDailyEntry = useCallback(async (id, e) => {
    const { data } = await api.updateDailyEntry(id, e);
    setDailyEntries((prev) => prev.map((x) => (x._id === id ? data : x)));
  }, []);
  const deleteDailyEntry = useCallback(async (id) => {
    await api.deleteDailyEntry(id);
    setDailyEntries((prev) => prev.filter((x) => x._id !== id));
  }, []);

  return (
    <ShopContext.Provider
      value={{
        isLoggedIn, shopName, user, loading, login, register, logout,
        dataLoadError, clearDataLoadError,
        customers, sellers, products, purchases, sales, expenses, payments,
        employees, attendance, salaryPayments, dailyEntries,
        addCustomer, updateCustomer, deleteCustomer,
        addSeller, updateSeller, deleteSeller,
        addProduct, updateProduct, deleteProduct,
        addPurchase, updatePurchase, deletePurchase,
        addSale, updateSale, deleteSale, getNextInvoiceNo,
        addExpense, addPayment,
        addEmployee, updateEmployee, deleteEmployee,
        markAttendance, addSalaryPayment,
        addDailyEntry, updateDailyEntry, deleteDailyEntry,
        fetchAllData,
      }}
    >
      {children}
    </ShopContext.Provider>
  );
};

export const useShop = () => {
  const ctx = useContext(ShopContext);
  if (!ctx) throw new Error('useShop must be inside ShopProvider');
  return ctx;
};
