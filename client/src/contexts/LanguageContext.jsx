import React, { createContext, useContext, useState, useEffect } from 'react';

const translations = {
  // Sidebar
  'Dashboard': { en: 'Dashboard', hi: 'डैशबोर्ड' },
  'Products': { en: 'Products', hi: 'उत्पाद' },
  'Sales': { en: 'Sales', hi: 'बिक्री' },
  'Customers': { en: 'Customers', hi: 'ग्राहक' },
  'Buy / Sellers': { en: 'Buy / Sellers', hi: 'खरीद / विक्रेता' },
  'Expenditure': { en: 'Expenditure', hi: 'खर्च' },
  'Employees': { en: 'Employees', hi: 'कर्मचारी' },
  'Daily Tracker': { en: 'Daily Tracker', hi: 'दैनिक ट्रैकर' },
  'Logout': { en: 'Logout', hi: 'लॉगआउट' },
  "Today's Sales": { en: "Today's Sales", hi: 'आज की बिक्री' },
  "Today's Expenses": { en: "Today's Expenses", hi: 'आज का खर्च' },
  'Total Revenue': { en: 'Total Revenue', hi: 'कुल राजस्व' },
  'Total Expenses': { en: 'Total Expenses', hi: 'कुल खर्च' },
  'Total Due': { en: 'Total Due', hi: 'कुल बकाया' },
  'Investment': { en: 'Investment', hi: 'निवेश' },
  'Net Profit': { en: 'Net Profit', hi: 'शुद्ध लाभ' },
  'Salary Paid': { en: 'Salary Paid', hi: 'वेतन भुगतान' },
  'Admin Section': { en: 'Admin Section', hi: 'एडमिन सेक्शन' },
  'Show': { en: 'Show', hi: 'दिखाएं' },
  'Hide': { en: 'Hide', hi: 'छुपाएं' },
  'Quick Summary': { en: 'Quick Summary', hi: 'त्वरित सारांश' },
  'Total Income': { en: 'Total Income', hi: 'कुल आय' },
  'Balance Due': { en: 'Balance Due', hi: 'बकाया शेष' },
  'Payments Received': { en: 'Payments Received', hi: 'भुगतान प्राप्त' },
  'Top 10 Products': { en: 'Top 10 Products', hi: 'शीर्ष 10 उत्पाद' },
  'Least Selling': { en: 'Least Selling', hi: 'कम बिकने वाले' },
  'Top Customers (Visits)': { en: 'Top Customers (Visits)', hi: 'शीर्ष ग्राहक (दौरे)' },
  'Top Customers (Revenue)': { en: 'Top Customers (Revenue)', hi: 'शीर्ष ग्राहक (राजस्व)' },
  'Expenses by Category': { en: 'Expenses by Category', hi: 'श्रेणी अनुसार खर्च' },
  'Low Stock Alert': { en: 'Low Stock Alert', hi: 'कम स्टॉक चेतावनी' },
  'Out of Stock': { en: 'Out of Stock', hi: 'स्टॉक खत्म' },
  'left': { en: 'left', hi: 'बाकी' },
  'No data': { en: 'No data', hi: 'कोई डेटा नहीं' },
  'visits': { en: 'visits', hi: 'दौरे' },
  'items in stock': { en: 'items in stock', hi: 'आइटम स्टॉक में' },
  'Add': { en: 'Add', hi: 'जोड़ें' },
  'Edit': { en: 'Edit', hi: 'संपादित करें' },
  'Delete': { en: 'Delete', hi: 'हटाएं' },
  'Product': { en: 'Product', hi: 'उत्पाद' },
  'Search products...': { en: 'Search products...', hi: 'उत्पाद खोजें...' },
  'No products yet': { en: 'No products yet', hi: 'अभी कोई उत्पाद नहीं' },
  'No products found': { en: 'No products found', hi: 'कोई उत्पाद नहीं मिला' },
  'Product Image': { en: 'Product Image', hi: 'उत्पाद छवि' },
  'Capture': { en: 'Capture', hi: 'कैप्चर' },
  'Browse': { en: 'Browse', hi: 'ब्राउज़' },
  'Remove': { en: 'Remove', hi: 'हटाएं' },
  'Item Name': { en: 'Item Name', hi: 'आइटम नाम' },
  'Category': { en: 'Category', hi: 'श्रेणी' },
  'All': { en: 'All', hi: 'सभी' },
  'All Categories': { en: 'All Categories', hi: 'सभी श्रेणियां' },
  'Update': { en: 'Update', hi: 'अपडेट' },
  'Updated': { en: 'Updated', hi: 'अपडेट किया' },
  'Deleted': { en: 'Deleted', hi: 'हटा दिया' },
  'Product added': { en: 'Product added', hi: 'उत्पाद जोड़ा गया' },
  'Enter product name': { en: 'Enter product name', hi: 'उत्पाद का नाम दर्ज करें' },
  'Image added': { en: 'Image added', hi: 'छवि जोड़ी गई' },
  'Image too large. Max 10MB': { en: 'Image too large. Max 10MB', hi: 'छवि बहुत बड़ी है। अधिकतम 10MB' },
  'New Sale': { en: 'New Sale', hi: 'नई बिक्री' },
  'Sales History': { en: 'Sales History', hi: 'बिक्री इतिहास' },
  'Invoice': { en: 'Invoice', hi: 'बिल' },
  'Print': { en: 'Print', hi: 'प्रिंट' },
  'Share': { en: 'Share', hi: 'साझा करें' },
  'Discount': { en: 'Discount', hi: 'छूट' },
  'Total': { en: 'Total', hi: 'कुल' },
  'Customer Name': { en: 'Customer Name', hi: 'ग्राहक का नाम' },
  'Phone': { en: 'Phone', hi: 'फोन' },
  'Payment Mode': { en: 'Payment Mode', hi: 'भुगतान मोड' },
  'Add Employee': { en: 'Add Employee', hi: 'कर्मचारी जोड़ें' },
  'Name': { en: 'Name', hi: 'नाम' },
  'Role': { en: 'Role', hi: 'भूमिका' },
  'Salary': { en: 'Salary', hi: 'वेतन' },
  'Save': { en: 'Save', hi: 'सहेजें' },
  'Cancel': { en: 'Cancel', hi: 'रद्द करें' },
  'Date': { en: 'Date', hi: 'तारीख' },
  'Amount': { en: 'Amount', hi: 'राशि' },
  'Quantity': { en: 'Quantity', hi: 'मात्रा' },
  'Price': { en: 'Price', hi: 'कीमत' },
  'Select': { en: 'Select', hi: 'चुनें' },
  'Settings': { en: 'Settings', hi: 'सेटिंग्स' },
  'Garments': { en: 'Garments', hi: 'कपड़े' },
  'Accessories': { en: 'Accessories', hi: 'सहायक उपकरण' },
  'Cosmetics': { en: 'Cosmetics', hi: 'सौंदर्य प्रसाधन' },
  'Footwear': { en: 'Footwear', hi: 'जूते' },
  'Jewelry': { en: 'Jewelry', hi: 'गहने' },
  'Bags': { en: 'Bags', hi: 'बैग' },
  'Electronics': { en: 'Electronics', hi: 'इलेक्ट्रॉनिक्स' },
  'Home & Decor': { en: 'Home & Decor', hi: 'घर और सजावट' },
  'Toys': { en: 'Toys', hi: 'खिलौने' },
  'Stationery': { en: 'Stationery', hi: 'स्टेशनरी' },
  'Other': { en: 'Other', hi: 'अन्य' },
  'Uncategorized': { en: 'Uncategorized', hi: 'अवर्गीकृत' },
};

const LanguageContext = createContext(null);

export const LanguageProvider = ({ children }) => {
  const [language, setLanguage] = useState(() => {
    const saved = localStorage.getItem('shop_language');
    return saved === 'hi' ? 'hi' : 'en';
  });

  useEffect(() => {
    localStorage.setItem('shop_language', language);
  }, [language]);

  const t = (key) => {
    return translations[key]?.[language] || key;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const ctx = useContext(LanguageContext);
  if (!ctx) throw new Error('useLanguage must be inside LanguageProvider');
  return ctx;
};

export const PRODUCT_CATEGORIES = [
  'Garments', 'Accessories', 'Cosmetics', 'Footwear', 'Jewelry',
  'Bags', 'Electronics', 'Home & Decor', 'Toys', 'Stationery', 'Other'
];
