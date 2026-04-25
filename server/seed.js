import 'dotenv/config';

import connectDB from './config/db.js';
import User from './models/User.js';
import Customer from './models/Customer.js';
import Product from './models/Product.js';
import Seller from './models/Seller.js';
import Employee from './models/Employee.js';
import Expense from './models/Expense.js';
import DailyEntry from './models/DailyEntry.js';
import Sale from './models/Sale.js';
import bcrypt from 'bcryptjs';

const seedData = async () => {
  try {
    await connectDB();

    // Clean up existing data
    await Sale.deleteMany({});
    await DailyEntry.deleteMany({});
    await Expense.deleteMany({});
    await Employee.deleteMany({});
    await Seller.deleteMany({});
    await Product.deleteMany({});
    await Customer.deleteMany({});
    await User.deleteMany({ email: 'webwithavi@gmail.com' });


    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash('bbbbbb', salt);

    const user = await User.create({
      shopName: 'Avi\'s Shop',
      email: 'webwithavi@gmail.com',
      password: hashedPassword,
    });

    const userId = user._id;

    const customers = [];
    for (let i = 1; i <= 10; i++) {
      customers.push({
        name: `Customer ${i}`,
        phone: `123456789${i}`,
        location: `Location ${i}`,
        userId,
      });
    }
    const createdCustomers = await Customer.insertMany(customers);

    const products = [];
    const productImages = [
        'https://images.unsplash.com/photo-1523275335684-37898b6baf30',
        'https://images.unsplash.com/photo-1505740420928-5e560c06d30e',
        'https://images.unsplash.com/photo-1542291026-7eec264c27ff',
        'https://images.unsplash.com/photo-1572635196237-14b3f281503f',
        'https://images.unsplash.com/photo-1491553693928-2f2b41f3c39e',
        'https://images.unsplash.com/photo-1581235720704-06d3acfcb36f',
        'https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f',
        'https://images.unsplash.com/photo-1560769629-975ec94e6a86',
        'https://images.unsplash.com/photo-1549298916-b41d501d3772',
        'https://images.unsplash.com/photo-1543512214-31b5a55ef19a'
    ];
    for (let i = 1; i <= 10; i++) {
      products.push({
        itemName: `Product ${i}`,
        printPrice: 100 + i * 10,
        purchasePrice: 80 + i * 10,
        sellPrice: 120 + i * 10,
        stock: 50 + i * 5,
        image: productImages[i-1],
        category: `Category ${i % 3}`,
        userId,
      });
    }
    const createdProducts = await Product.insertMany(products);

    const sellers = [];
    for (let i = 1; i <= 5; i++) {
      sellers.push({
        name: `Seller ${i}`,
        phone: `987654321${i}`,
        location: `Seller Location ${i}`,
        userId,
      });
    }
    await Seller.insertMany(sellers);

    const employees = [];
    for (let i = 1; i <= 5; i++) {
      employees.push({
        name: `Employee ${i}`,
        phone: `555555555${i}`,
        role: i % 2 === 0 ? 'Cashier' : 'Sales Associate',
        salary: 30000 + i * 1000,
        joinDate: new Date().toISOString().split('T')[0],
        userId,
      });
    }
    await Employee.insertMany(employees);

    const expenses = [];
    for (let i = 1; i <= 10; i++) {
      expenses.push({
        title: `Expense ${i}`,
        amount: 100 + i * 20,
        date: new Date().toISOString().split('T')[0],
        category: i % 2 === 0 ? 'Utilities' : 'Supplies',
        userId,
      });
    }
    await Expense.insertMany(expenses);

    const dailyEntries = [];
    for (let i = 1; i <= 5; i++) {
        dailyEntries.push({
            type: 'revenue',
            title: `Sale ${i}`,
            amount: 200 + i * 50,
            category: 'Sales',
            date: new Date().toISOString().split('T')[0],
            time: new Date().toLocaleTimeString(),
            userId,
        });
        dailyEntries.push({
            type: 'expenditure',
            title: `Purchase ${i}`,
            amount: 100 + i * 20,
            category: 'Purchases',
            date: new Date().toISOString().split('T')[0],
            time: new Date().toLocaleTimeString(),
            userId,
        });
    }
    await DailyEntry.insertMany(dailyEntries);

    const sales = [];
    for (let i = 0; i < 5; i++) {
        const customer = createdCustomers[i];
        const product1 = createdProducts[i];
        const product2 = createdProducts[i+5];
        sales.push({
            invoiceNo: `INV-00${i + 1}`,
            customerId: customer._id.toString(),
            customerName: customer.name,
            customerPhone: customer.phone,
            items: [
                {
                    productId: product1._id.toString(),
                    productName: product1.itemName,
                    quantity: 2,
                    sellPrice: product1.sellPrice,
                    mrp: product1.printPrice,
                    discount: 10,
                    total: product1.sellPrice * 2 - 10,
                },
                {
                    productId: product2._id.toString(),
                    productName: product2.itemName,
                    quantity: 1,
                    sellPrice: product2.sellPrice,
                    mrp: product2.printPrice,
                    discount: 5,
                    total: product2.sellPrice * 1 - 5,
                }
            ],
            totalBill: (product1.sellPrice * 2 - 10) + (product2.sellPrice * 1 - 5),
            totalDiscount: 15,
            paymentMode: i % 2 === 0 ? 'Cash' : 'Online',
            date: new Date().toISOString().split('T')[0],
            userId,
        });
    }
    await Sale.insertMany(sales);


    console.log('Data seeded successfully!');
    process.exit();
  } catch (error) {
    console.error(`Error seeding data: ${error}`);
    process.exit(1);
  }
};

seedData();
