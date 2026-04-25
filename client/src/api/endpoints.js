import apiClient from './client.js';

export const registerUser = (data) => apiClient.post('/api/auth/register', data);
export const loginUser = (data) => apiClient.post('/api/auth/login', data);
export const getMe = () => apiClient.get('/api/auth/me');

export const getCustomers = () => apiClient.get('/api/customers');
export const createCustomer = (data) => apiClient.post('/api/customers', data);
export const updateCustomer = (id, data) => apiClient.put(`/api/customers/${id}`, data);
export const deleteCustomer = (id) => apiClient.delete(`/api/customers/${id}`);

export const getSellers = () => apiClient.get('/api/sellers');
export const createSeller = (data) => apiClient.post('/api/sellers', data);
export const updateSeller = (id, data) => apiClient.put(`/api/sellers/${id}`, data);
export const deleteSeller = (id) => apiClient.delete(`/api/sellers/${id}`);

export const getProducts = () => apiClient.get('/api/products');
export const createProduct = (data) => apiClient.post('/api/products', data);
export const updateProduct = (id, data) => apiClient.put(`/api/products/${id}`, data);
export const deleteProduct = (id) => apiClient.delete(`/api/products/${id}`);

export const getPurchases = () => apiClient.get('/api/purchases');
export const createPurchase = (data) => apiClient.post('/api/purchases', data);
export const updatePurchase = (id, data) => apiClient.put(`/api/purchases/${id}`, data);
export const deletePurchase = (id) => apiClient.delete(`/api/purchases/${id}`);

export const getSales = () => apiClient.get('/api/sales');
export const createSale = (data) => apiClient.post('/api/sales', data);
export const updateSale = (id, data) => apiClient.put(`/api/sales/${id}`, data);
export const deleteSale = (id) => apiClient.delete(`/api/sales/${id}`);
export const getNextInvoice = () => apiClient.get('/api/sales/next-invoice');

export const getExpenses = () => apiClient.get('/api/expenses');
export const createExpense = (data) => apiClient.post('/api/expenses', data);
export const deleteExpense = (id) => apiClient.delete(`/api/expenses/${id}`);

export const getPayments = () => apiClient.get('/api/payments');
export const createPayment = (data) => apiClient.post('/api/payments', data);

export const getEmployees = () => apiClient.get('/api/employees');
export const createEmployee = (data) => apiClient.post('/api/employees', data);
export const updateEmployee = (id, data) => apiClient.put(`/api/employees/${id}`, data);
export const deleteEmployee = (id) => apiClient.delete(`/api/employees/${id}`);

export const getAttendance = (month) =>
  apiClient.get(`/api/employees/attendance${month ? `?month=${encodeURIComponent(month)}` : ''}`);
export const markAttendance = (data) => apiClient.post('/api/employees/attendance', data);

export const getSalaryPayments = () => apiClient.get('/api/employees/salary-payments');
export const createSalaryPayment = (data) => apiClient.post('/api/employees/salary-payments', data);

export const getDailyEntries = () => apiClient.get('/api/daily-entries');
export const createDailyEntry = (data) => apiClient.post('/api/daily-entries', data);
export const updateDailyEntry = (id, data) => apiClient.put(`/api/daily-entries/${id}`, data);
export const deleteDailyEntry = (id) => apiClient.delete(`/api/daily-entries/${id}`);
