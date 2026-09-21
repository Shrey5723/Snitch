import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import userModel from '../models/user.model.js';
import productModel from '../models/product.model.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.resolve(__dirname, '../../.env') });

const mongoUri = process.env.MONGO_URI;

async function seed() {
  try {
    console.log('Connecting to MongoDB...');
    await mongoose.connect(mongoUri);
    console.log('Connected to MongoDB successfully.');

    // 1. Seed Demo Buyer
    let buyer = await userModel.findOne({ email: 'buyer@snitch.com' });
    if (!buyer) {
      buyer = await userModel.create({
        email: 'buyer@snitch.com',
        password: 'password123',
        fullName: 'Shrey Patel',
        contactNumber: '9876543210',
        role: 'buyer',
        addresses: [
          {
            label: 'Home',
            street: 'Flat 402, Signature Palms, Linking Road',
            city: 'Mumbai',
            state: 'Maharashtra',
            zipCode: '400050',
            isDefault: true,
          },
          {
            label: 'Studio',
            street: 'Suite 12, Fashion District, Lower Parel',
            city: 'Mumbai',
            state: 'Maharashtra',
            zipCode: '400013',
            isDefault: false,
          },
        ],
      });
      console.log('Created Demo Buyer:', buyer.email);
    } else {
      console.log('Demo Buyer already exists.');
    }

    // 2. Seed Demo Seller
    let seller = await userModel.findOne({ email: 'seller@snitch.com' });
    if (!seller) {
      seller = await userModel.create({
        email: 'seller@snitch.com',
        password: 'password123',
        fullName: 'Snitch Atelier Official',
        contactNumber: '9876543211',
        role: 'seller',
      });
      console.log('Created Demo Seller:', seller.email);
    } else {
      console.log('Demo Seller already exists.');
    }

    // 3. Seed Luxury Products if none exist
    const existingProductsCount = await productModel.countDocuments();
    if (existingProductsCount === 0) {
      const sampleProducts = [
        {
          title: 'Obsidian Oversized Linen Shirt',
          description: 'Crafted from 100% European flax linen with dropped shoulder seams and relaxed silhouette. Designed for effortlessly refined summer tailoring.',
          seller: seller._id,
          price: { amount: 2499, currency: 'INR' },
          category: 'Shirts',
          stock: 45,
          sizeStock: { S: 8, M: 15, L: 12, XL: 7, XXL: 3 },
          status: 'In Stock',
          images: [
            {
              url: 'https://images.unsplash.com/photo-1602810318383-e386cc2a3ccf?auto=format&fit=crop&w=800&q=80',
              alt: 'Obsidian Oversized Linen Shirt',
            },
          ],
        },
        {
          title: 'Tokyo Minimalist Bomber Jacket',
          description: 'Water-repellent matte nylon shell with ribbed wool-blend trims and bespoke Japanese hardware. Minimalist luxury with a contemporary edge.',
          seller: seller._id,
          price: { amount: 4999, currency: 'INR' },
          category: 'Jackets',
          stock: 30,
          sizeStock: { S: 5, M: 10, L: 8, XL: 5, XXL: 2 },
          status: 'In Stock',
          images: [
            {
              url: 'https://images.unsplash.com/photo-1544441893-675973e31985?auto=format&fit=crop&w=800&q=80',
              alt: 'Tokyo Minimalist Bomber Jacket',
            },
          ],
        },
        {
          title: 'Cobalt Pleated Wide-Leg Trousers',
          description: 'Precision double-pleated front with high-rise waist and flowing tailored drape. Designed to sit effortlessly over designer sneakers or formal loafers.',
          seller: seller._id,
          price: { amount: 3299, currency: 'INR' },
          category: 'Pants',
          stock: 25,
          sizeStock: { S: 5, M: 8, L: 7, XL: 3, XXL: 2 },
          status: 'In Stock',
          images: [
            {
              url: 'https://images.unsplash.com/photo-1624378439575-d8705ad7ae80?auto=format&fit=crop&w=800&q=80',
              alt: 'Cobalt Pleated Wide-Leg Trousers',
            },
          ],
        },
        {
          title: 'Veloce Monochromatic Leather Sneakers',
          description: 'Handcrafted Italian nappa leather upper paired with lightweight vulcanized rubber soles and memory foam insoles for unmatched all-day comfort.',
          seller: seller._id,
          price: { amount: 5499, currency: 'INR' },
          category: 'Sneakers',
          stock: 20,
          sizeStock: { S: 4, M: 6, L: 5, XL: 3, XXL: 2 },
          status: 'In Stock',
          images: [
            {
              url: 'https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?auto=format&fit=crop&w=800&q=80',
              alt: 'Veloce Monochromatic Leather Sneakers',
            },
          ],
        },
        {
          title: 'Brutalist Matte Metal Signet Ring',
          description: 'Cast in surgical-grade 316L stainless steel with an oxidized brushed gunmetal finish. Subdued architectural jewelry piece.',
          seller: seller._id,
          price: { amount: 1299, currency: 'INR' },
          category: 'Accessories',
          stock: 50,
          sizeStock: { S: 10, M: 15, L: 15, XL: 5, XXL: 5 },
          status: 'In Stock',
          images: [
            {
              url: 'https://images.unsplash.com/photo-1605100804763-247f67b3557e?auto=format&fit=crop&w=800&q=80',
              alt: 'Brutalist Matte Metal Signet Ring',
            },
          ],
        },
        {
          title: 'Milano Structured Trench Coat',
          description: 'Double-breasted storm flap trench coat crafted in heavy twill cotton with horn-effect buttons and removable waist sash.',
          seller: seller._id,
          price: { amount: 7999, currency: 'INR' },
          category: 'Jackets',
          stock: 18,
          sizeStock: { S: 3, M: 6, L: 5, XL: 3, XXL: 1 },
          status: 'In Stock',
          images: [
            {
              url: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&w=800&q=80',
              alt: 'Milano Structured Trench Coat',
            },
          ],
        },
        {
          title: 'Noir Washed Raw Denim Jeans',
          description: '13.5oz Japanese selvedge denim in a relaxed tapered cut with authentic vintage washing and copper rivets.',
          seller: seller._id,
          price: { amount: 3799, currency: 'INR' },
          category: 'Pants',
          stock: 35,
          sizeStock: { S: 6, M: 12, L: 10, XL: 5, XXL: 2 },
          status: 'In Stock',
          images: [
            {
              url: 'https://images.unsplash.com/photo-1542272604-780c96856592?auto=format&fit=crop&w=800&q=80',
              alt: 'Noir Washed Raw Denim Jeans',
            },
          ],
        },
        {
          title: 'Silk Blend Cuban Collar Shirt',
          description: 'Fluid mulberry silk and modal blend with camp collar and micro geometric art-deco motif. Lightweight and breathable.',
          seller: seller._id,
          price: { amount: 2899, currency: 'INR' },
          category: 'Shirts',
          stock: 40,
          sizeStock: { S: 8, M: 14, L: 10, XL: 6, XXL: 2 },
          status: 'In Stock',
          images: [
            {
              url: 'https://images.unsplash.com/photo-1596755094514-f87e34085b2c?auto=format&fit=crop&w=800&q=80',
              alt: 'Silk Blend Cuban Collar Shirt',
            },
          ],
        },
      ];

      await productModel.insertMany(sampleProducts);
      console.log(`Seeded ${sampleProducts.length} luxury products successfully.`);
    } else {
      console.log(`Products already exist (${existingProductsCount} found).`);
    }

    console.log('Seeding complete!');
    process.exit(0);
  } catch (error) {
    console.error('Seeding failed:', error);
    process.exit(1);
  }
}

seed();
