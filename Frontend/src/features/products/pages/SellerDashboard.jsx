import React, { useState, useEffect, useMemo } from 'react';
import { Link, useNavigate } from 'react-router';
import { useSelector } from 'react-redux';
import {
  Package,
  Plus,
  ArrowRight,
  TrendingUp,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  Search,
  Filter,
  SlidersHorizontal,
  ExternalLink,
  Edit3,
  Layers,
  Sparkles,
  ShoppingBag,
  DollarSign,
  User,
  ArrowUpDown,
  RefreshCw,
  Box,
  Eye,
  ChevronRight
} from 'lucide-react';
import useProduct from '../Hooks/useProduct.js';

export default function SellerDashboard() {
  const navigate = useNavigate();
  const { user } = useSelector((state) => state.auth || {});
  const { sellerProduct, loading, handleGetSellerProducts } = useProduct();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('ALL');
  const [stockStatusFilter, setStockStatusFilter] = useState('ALL');
  const [sortBy, setSortBy] = useState('newest'); // 'newest' | 'stock-desc' | 'stock-asc' | 'price-desc' | 'price-asc'
  const [viewMode, setViewMode] = useState('grid'); // 'grid' | 'table'

  useEffect(() => {
    handleGetSellerProducts();
  }, []);

  const products = useMemo(() => {
    return Array.isArray(sellerProduct) ? sellerProduct : [];
  }, [sellerProduct]);

  // Derived metrics for inventory
  const stats = useMemo(() => {
    const totalProducts = products.length;
    let totalUnits = 0;
    let totalValuation = 0;
    let inStockCount = 0;
    let lowStockCount = 0;
    let outOfStockCount = 0;

    products.forEach((p) => {
      const stock = typeof p.stock === 'number' ? p.stock : 0;
      const price = typeof p.price === 'object' ? (p.price?.amount || 0) : (Number(p.price) || 0);

      totalUnits += stock;
      totalValuation += stock * price;

      if (stock === 0 || p.status === 'Out of Stock') {
        outOfStockCount++;
      } else if (stock <= 10 || p.status === 'Low Stock') {
        lowStockCount++;
      } else {
        inStockCount++;
      }
    });

    return {
      totalProducts,
      totalUnits,
      totalValuation,
      inStockCount,
      lowStockCount,
      outOfStockCount,
    };
  }, [products]);

  // Filter and sort products
  const filteredProducts = useMemo(() => {
    return products
      .filter((p) => {
        const title = (p.title || '').toLowerCase();
        const desc = (p.description || '').toLowerCase();
        const type = (p.type || '').toLowerCase();
        const query = searchQuery.toLowerCase();

        const matchesSearch = title.includes(query) || desc.includes(query) || type.includes(query);
        if (!matchesSearch) return false;

        if (selectedCategory !== 'ALL') {
          const category = (p.category || '').toUpperCase();
          if (category !== selectedCategory.toUpperCase()) return false;
        }

        if (stockStatusFilter === 'IN_STOCK') {
          if ((p.stock || 0) <= 10) return false;
        } else if (stockStatusFilter === 'LOW_STOCK') {
          if ((p.stock || 0) > 10 || (p.stock || 0) === 0) return false;
        } else if (stockStatusFilter === 'OUT_OF_STOCK') {
          if ((p.stock || 0) > 0) return false;
        }

        return true;
      })
      .sort((a, b) => {
        if (sortBy === 'newest') {
          return new Date(b.createdAt || 0) - new Date(a.createdAt || 0);
        }
        if (sortBy === 'stock-desc') {
          return (b.stock || 0) - (a.stock || 0);
        }
        if (sortBy === 'stock-asc') {
          return (a.stock || 0) - (b.stock || 0);
        }
        if (sortBy === 'price-desc') {
          const pA = typeof a.price === 'object' ? a.price.amount : a.price;
          const pB = typeof b.price === 'object' ? b.price.amount : b.price;
          return (pB || 0) - (pA || 0);
        }
        if (sortBy === 'price-asc') {
          const pA = typeof a.price === 'object' ? a.price.amount : a.price;
          const pB = typeof b.price === 'object' ? b.price.amount : b.price;
          return (pA || 0) - (pB || 0);
        }
        return 0;
      });
  }, [products, searchQuery, selectedCategory, stockStatusFilter, sortBy]);

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(amount || 0);
  };

  const getProductImage = (prod) => {
    if (prod.images && prod.images.length > 0) {
      const img = prod.images[0];
      return typeof img === 'string' ? img : img?.url;
    }
    return null;
  };

  return (
    <div className="min-h-screen bg-[#fafafa] text-zinc-900 selection:bg-zinc-900 selection:text-white font-body">

      {/* ═══════════════════════ TOP SELLER STUDIO NAV ═══════════════════════ */}
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-zinc-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-8 h-20 flex items-center justify-between">
          
          {/* Brand & Studio Title */}
          <div className="flex items-center gap-6">
            <Link to="/seller/dashboard" className="flex flex-col group">
              <span className="font-heading font-black text-xl sm:text-2xl tracking-[0.35em] text-zinc-900 uppercase">
                S N I T C H
              </span>
              <span className="text-[10px] font-bold tracking-[0.2em] text-zinc-400 uppercase -mt-0.5">
                SELLER STUDIO &bull; INVENTORY PORTAL
              </span>
            </Link>

            <div className="h-6 w-px bg-zinc-200 hidden md:block"></div>

            {/* Quick Internal Nav */}
            <nav className="hidden md:flex items-center gap-5 text-xs font-bold tracking-wider uppercase">
              <Link
                to="/seller/dashboard"
                className="text-zinc-900 border-b-2 border-zinc-900 pb-0.5"
              >
                Dashboard
              </Link>
            </nav>
          </div>

          {/* Right Header: CTA + Profile Logo */}
          <div className="flex items-center gap-3 sm:gap-4">
            
            {/* Create Product Button */}
            <Link
              to="/products/create"
              className="hidden sm:inline-flex items-center gap-2 px-4 py-2.5 bg-zinc-900 hover:bg-black text-white rounded-full text-xs font-bold tracking-wider uppercase transition-all shadow-sm hover:shadow active:scale-95 cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>New Product</span>
            </Link>

            <div className="h-6 w-px bg-zinc-200"></div>

            {/* Profile Avatar & Logo Button (Takes user to Profile Page) */}
            <Link
              to="/profile"
              className="group flex items-center gap-3 p-1.5 sm:px-3 sm:py-2 rounded-full hover:bg-zinc-100 transition-all border border-zinc-200/80 cursor-pointer"
              title="Click to view Seller Profile & Account"
            >
              {user?.avatar ? (
                <img
                  src={user.avatar}
                  alt={user.fullName || 'Seller profile'}
                  className="w-8 h-8 rounded-full object-cover border border-zinc-300 ring-2 ring-transparent group-hover:ring-zinc-400 transition-all"
                />
              ) : (
                <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-zinc-900 to-zinc-700 text-white font-heading font-black text-xs flex items-center justify-center shadow-sm group-hover:scale-105 transition-transform">
                  {user?.fullName ? user.fullName.charAt(0).toUpperCase() : 'S'}
                </div>
              )}

              <div className="hidden lg:flex flex-col text-left">
                <span className="text-xs font-bold text-zinc-900 leading-none truncate max-w-[120px]">
                  {user?.fullName || 'Seller'}
                </span>
                <span className="text-[10px] text-zinc-400 font-medium leading-tight mt-0.5 flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                  Verified Seller
                </span>
              </div>
            </Link>

          </div>

        </div>
      </header>

      {/* ═══════════════════════ MAIN CONTENT ═══════════════════════ */}
      <main className="max-w-7xl mx-auto px-4 sm:px-8 py-8 sm:py-10 space-y-8">
        
        {/* HERO TITLE BAR */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-zinc-200/70 text-zinc-700 text-[11px] font-bold tracking-widest uppercase mb-2">
              <Package className="w-3 h-3 text-zinc-600" />
              <span>Live Inventory Overview</span>
            </div>
            <h1 className="font-heading font-extrabold text-2xl sm:text-3xl lg:text-4xl text-zinc-900 tracking-tight">
              Seller Dashboard
            </h1>
            <p className="mt-1 text-xs sm:text-sm text-zinc-500">
              Manage your Snitch fashion catalog, monitor live per-size stock, and create new apparel drops.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => handleGetSellerProducts()}
              className="inline-flex items-center gap-2 px-3.5 py-2 text-xs font-bold text-zinc-600 bg-white hover:bg-zinc-50 border border-zinc-200 rounded-xl transition-colors cursor-pointer"
              title="Refresh inventory data"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin text-zinc-900' : ''}`} />
              <span>Refresh</span>
            </button>
            <Link
              to="/products/create"
              className="sm:hidden inline-flex items-center gap-1.5 px-4 py-2 bg-zinc-900 text-white rounded-xl text-xs font-bold uppercase tracking-wider"
            >
              <Plus className="w-4 h-4" />
              <span>Add</span>
            </Link>
          </div>
        </div>

        {/* ═══════════════════════ STATS RIBBON ═══════════════════════ */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          
          {/* Card 1: Total Products */}
          <div className="bg-white p-5 sm:p-6 rounded-2xl border border-zinc-200 shadow-sm relative overflow-hidden">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold uppercase tracking-wider text-zinc-500">
                Total Products
              </span>
              <div className="p-2 bg-zinc-100 rounded-xl text-zinc-800">
                <Box className="w-4 h-4" />
              </div>
            </div>
            <div className="mt-3">
              <span className="text-2xl sm:text-3xl font-heading font-extrabold text-zinc-900">
                {stats.totalProducts}
              </span>
              <span className="text-xs text-zinc-400 ml-1.5 font-medium">SKUs</span>
            </div>
            <p className="mt-2 text-[11px] text-zinc-500">
              Active in Snitch catalog
            </p>
          </div>

          {/* Card 2: Total Units In Stock */}
          <div className="bg-white p-5 sm:p-6 rounded-2xl border border-zinc-200 shadow-sm relative overflow-hidden">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold uppercase tracking-wider text-zinc-500">
                Total Stock
              </span>
              <div className="p-2 bg-emerald-50 rounded-xl text-emerald-700">
                <Package className="w-4 h-4" />
              </div>
            </div>
            <div className="mt-3">
              <span className="text-2xl sm:text-3xl font-heading font-extrabold text-zinc-900">
                {stats.totalUnits}
              </span>
              <span className="text-xs text-emerald-600 font-semibold ml-1.5">units</span>
            </div>
            <div className="mt-2 flex items-center gap-2 text-[11px]">
              <span className="text-emerald-700 font-bold">{stats.inStockCount} healthy</span>
              <span className="text-zinc-300">&bull;</span>
              <span className="text-amber-600 font-bold">{stats.lowStockCount} low</span>
            </div>
          </div>

          {/* Card 3: Stock Health Alert */}
          <div className="bg-white p-5 sm:p-6 rounded-2xl border border-zinc-200 shadow-sm relative overflow-hidden">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold uppercase tracking-wider text-zinc-500">
                Needs Attention
              </span>
              <div className="p-2 bg-rose-50 rounded-xl text-rose-700">
                <AlertTriangle className="w-4 h-4" />
              </div>
            </div>
            <div className="mt-3 flex items-baseline gap-2">
              <span className="text-2xl sm:text-3xl font-heading font-extrabold text-zinc-900">
                {stats.lowStockCount + stats.outOfStockCount}
              </span>
              <span className="text-xs font-semibold text-rose-600">
                ({stats.outOfStockCount} Out of Stock)
              </span>
            </div>
            <p className="mt-2 text-[11px] text-zinc-500">
              Restock sizes soon to prevent lost sales
            </p>
          </div>

          {/* Card 4: Inventory Valuation */}
          <div className="bg-white p-5 sm:p-6 rounded-2xl border border-zinc-200 shadow-sm relative overflow-hidden">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold uppercase tracking-wider text-zinc-500">
                Inventory Value
              </span>
              <div className="p-2 bg-zinc-900 rounded-xl text-white">
                <DollarSign className="w-4 h-4" />
              </div>
            </div>
            <div className="mt-3">
              <span className="text-2xl sm:text-3xl font-heading font-extrabold text-zinc-900">
                {formatCurrency(stats.totalValuation)}
              </span>
            </div>
            <p className="mt-2 text-[11px] text-zinc-500">
              Based on active retail prices
            </p>
          </div>

        </div>

        {/* ═══════════════════════ SEARCH, FILTERS & CONTROLS ═══════════════════════ */}
        <div className="bg-white p-4 sm:p-6 rounded-2xl border border-zinc-200 shadow-sm space-y-4">
          
          <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
            
            {/* Search Input */}
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-zinc-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search products by title, type, category..."
                className="w-full bg-zinc-50 hover:bg-zinc-100/70 focus:bg-white border border-zinc-200 rounded-xl pl-10 pr-4 py-2.5 text-xs sm:text-sm font-medium outline-none focus:border-zinc-900 transition-all"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-600 text-xs font-bold"
                >
                  ✕
                </button>
              )}
            </div>

            {/* Category Dropdown */}
            <div className="flex items-center gap-2">
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="bg-zinc-50 border border-zinc-200 rounded-xl px-3.5 py-2.5 text-xs font-bold text-zinc-700 outline-none focus:border-zinc-900 cursor-pointer"
              >
                <option value="ALL">All Categories</option>
                <option value="SHIRTS">Shirts</option>
                <option value="JACKETS">Jackets</option>
                <option value="PANTS">Pants</option>
                <option value="SNEAKERS">Sneakers</option>
                <option value="ACCESSORIES">Accessories</option>
              </select>

              {/* Stock Status Filter */}
              <select
                value={stockStatusFilter}
                onChange={(e) => setStockStatusFilter(e.target.value)}
                className="bg-zinc-50 border border-zinc-200 rounded-xl px-3.5 py-2.5 text-xs font-bold text-zinc-700 outline-none focus:border-zinc-900 cursor-pointer"
              >
                <option value="ALL">All Stock Status</option>
                <option value="IN_STOCK">In Stock (&gt;10)</option>
                <option value="LOW_STOCK">Low Stock (1-10)</option>
                <option value="OUT_OF_STOCK">Out of Stock (0)</option>
              </select>

              {/* Sort selector */}
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="bg-zinc-50 border border-zinc-200 rounded-xl px-3.5 py-2.5 text-xs font-bold text-zinc-700 outline-none focus:border-zinc-900 cursor-pointer"
              >
                <option value="newest">Newest First</option>
                <option value="stock-desc">Highest Stock</option>
                <option value="stock-asc">Lowest Stock</option>
                <option value="price-desc">Price: High to Low</option>
                <option value="price-asc">Price: Low to High</option>
              </select>
            </div>

          </div>

          {/* Quick Active Filters & Count */}
          <div className="flex items-center justify-between text-xs text-zinc-500 pt-2 border-t border-zinc-100">
            <span>
              Showing <strong className="text-zinc-900">{filteredProducts.length}</strong> of{' '}
              {products.length} products
            </span>

            <div className="flex items-center gap-1.5">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-1.5 rounded-lg transition-colors ${
                  viewMode === 'grid' ? 'bg-zinc-900 text-white' : 'bg-zinc-100 text-zinc-600 hover:bg-zinc-200'
                }`}
                title="Grid View"
              >
                <Layers className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => setViewMode('table')}
                className={`p-1.5 rounded-lg transition-colors ${
                  viewMode === 'table' ? 'bg-zinc-900 text-white' : 'bg-zinc-100 text-zinc-600 hover:bg-zinc-200'
                }`}
                title="Table View"
              >
                <SlidersHorizontal className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

        </div>

        {/* ═══════════════════════ PRODUCTS PRESENTATION ═══════════════════════ */}
        {filteredProducts.length === 0 ? (
          <div className="bg-white rounded-3xl border border-zinc-200 p-12 text-center max-w-lg mx-auto shadow-sm my-8">
            <div className="w-16 h-16 rounded-full bg-zinc-100 flex items-center justify-center mx-auto mb-4 text-zinc-400">
              <Package className="w-8 h-8" />
            </div>
            <h3 className="font-heading font-bold text-xl text-zinc-900">
              {products.length === 0 ? 'No Products in Your Store Yet' : 'No Matching Products Found'}
            </h3>
            <p className="mt-2 text-xs sm:text-sm text-zinc-500 leading-relaxed">
              {products.length === 0
                ? 'Start building your fashion line on Snitch by publishing your very first apparel piece with sizes, stock, colors, and material details.'
                : 'Try clearing your search query or adjusting your category/stock filter.'}
            </p>
            <div className="mt-6 flex items-center justify-center gap-3">
              {products.length > 0 && (
                <button
                  onClick={() => {
                    setSearchQuery('');
                    setSelectedCategory('ALL');
                    setStockStatusFilter('ALL');
                  }}
                  className="px-4 py-2 border border-zinc-300 rounded-full text-xs font-bold text-zinc-700 hover:bg-zinc-50"
                >
                  Clear Filters
                </button>
              )}
              <Link
                to="/products/create"
                className="inline-flex items-center gap-2 px-6 py-2.5 bg-zinc-900 hover:bg-black text-white rounded-full text-xs font-bold uppercase tracking-wider shadow-sm transition-all"
              >
                <Plus className="w-4 h-4" />
                <span>Create First Product</span>
              </Link>
            </div>
          </div>
        ) : viewMode === 'grid' ? (
          /* GRID VIEW */
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredProducts.map((product) => {
              const stock = typeof product.stock === 'number' ? product.stock : 0;
              const price = typeof product.price === 'object' ? product.price.amount : product.price;
              const imgUrl = getProductImage(product);
              const sizes = product.sizeStock || { S: 0, M: 0, L: 0, XL: 0, XXL: 0 };
              const colors = Array.isArray(product.colors) ? product.colors : [];

              return (
                <div
                  key={product._id}
                  className="bg-white rounded-2xl border border-zinc-200/90 shadow-sm hover:shadow-md transition-all overflow-hidden flex flex-col group"
                >
                  {/* Top Image Preview & Quick Badges */}
                  <div className="relative aspect-[4/3] bg-zinc-100 overflow-hidden">
                    {imgUrl ? (
                      <img
                        src={imgUrl}
                        alt={product.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                    ) : (
                      <div className="w-full h-full flex flex-col items-center justify-center text-zinc-300">
                        <Package className="w-10 h-10 mb-1" />
                        <span className="text-[10px] uppercase font-bold tracking-widest">No Image</span>
                      </div>
                    )}

                    {/* Stock Status Pill */}
                    <div className="absolute top-3 left-3">
                      {stock === 0 ? (
                        <span className="px-2.5 py-1 bg-rose-500 text-white rounded-full text-[10px] font-bold uppercase tracking-wider flex items-center gap-1 shadow-sm">
                          <XCircle className="w-3 h-3" />
                          Out of Stock
                        </span>
                      ) : stock <= 10 ? (
                        <span className="px-2.5 py-1 bg-amber-500 text-white rounded-full text-[10px] font-bold uppercase tracking-wider flex items-center gap-1 shadow-sm">
                          <AlertTriangle className="w-3 h-3" />
                          Low Stock ({stock})
                        </span>
                      ) : (
                        <span className="px-2.5 py-1 bg-emerald-600 text-white rounded-full text-[10px] font-bold uppercase tracking-wider flex items-center gap-1 shadow-sm">
                          <CheckCircle2 className="w-3 h-3" />
                          In Stock ({stock})
                        </span>
                      )}
                    </div>

                    {/* Category / Type Tag */}
                    <div className="absolute top-3 right-3 bg-white/90 backdrop-blur-md px-2.5 py-1 rounded-full text-[10px] font-bold text-zinc-800 uppercase tracking-wider border border-zinc-200">
                      {product.type || product.category || 'Apparel'}
                    </div>
                  </div>

                  {/* Body Content */}
                  <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                    
                    <div>
                      {/* Title & Price */}
                      <div className="flex items-start justify-between gap-2 mb-1.5">
                        <h3 className="font-heading font-bold text-base text-zinc-900 line-clamp-1 group-hover:text-zinc-700 transition-colors">
                          {product.title}
                        </h3>
                        <span className="font-heading font-extrabold text-sm text-zinc-900 whitespace-nowrap">
                          {formatCurrency(price)}
                        </span>
                      </div>

                      <p className="text-xs text-zinc-500 line-clamp-2 leading-relaxed">
                        {product.description || 'No description provided.'}
                      </p>
                    </div>

                    {/* Size-Stock Distribution Pill Grid */}
                    <div className="bg-zinc-50 p-3 rounded-xl border border-zinc-100">
                      <div className="flex items-center justify-between text-[11px] font-bold text-zinc-500 uppercase tracking-wider mb-2">
                        <span>Size Stock</span>
                        <span className="text-zinc-900 font-extrabold">{stock} total</span>
                      </div>
                      
                      <div className="grid grid-cols-5 gap-1.5 text-center">
                        {['S', 'M', 'L', 'XL', 'XXL'].map((sz) => {
                          const count = Number(sizes[sz]) || 0;
                          return (
                            <div
                              key={sz}
                              className={`py-1.5 px-1 rounded-lg border text-[11px] font-semibold transition-colors ${
                                count === 0
                                  ? 'bg-rose-50/70 border-rose-200 text-rose-600'
                                  : count <= 3
                                  ? 'bg-amber-50 border-amber-200 text-amber-700'
                                  : 'bg-white border-zinc-200 text-zinc-800'
                              }`}
                            >
                              <div className="text-[9px] font-bold uppercase text-zinc-400">{sz}</div>
                              <div className="font-bold">{count}</div>
                            </div>
                          );
                        })}
                      </div>
                    </div>

                    {/* Colors & Build Summary */}
                    {(colors.length > 0 || product.buildSummary) && (
                      <div className="space-y-1.5 text-xs text-zinc-600">
                        {colors.length > 0 && (
                          <div className="flex items-center gap-1.5 flex-wrap">
                            <span className="text-[10px] font-bold text-zinc-400 uppercase">Colors:</span>
                            {colors.map((c, idx) => (
                              <span
                                key={idx}
                                className="px-2 py-0.5 bg-zinc-100 rounded-md text-[10px] font-medium text-zinc-700"
                              >
                                {c}
                              </span>
                            ))}
                          </div>
                        )}
                        {product.buildSummary && (
                          <p className="text-[11px] text-zinc-500 line-clamp-1 italic">
                            Spec: {product.buildSummary}
                          </p>
                        )}
                      </div>
                    )}

                    {/* Card Actions */}
                    <div className="pt-3 border-t border-zinc-100 flex items-center justify-between gap-2">
                      <Link
                        to={`/product/${product._id}`}
                        className="text-xs font-semibold text-zinc-500 hover:text-zinc-900 flex items-center gap-1 transition-colors"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        <span>Storefront Preview</span>
                      </Link>

                      <Link
                        to={`/seller/product/${product._id}`}
                        className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-zinc-900 hover:bg-black text-white rounded-lg text-xs font-bold transition-all shadow-sm active:scale-95"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                        <span>Manage Stock</span>
                      </Link>
                    </div>

                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          /* TABLE VIEW */
          <div className="bg-white rounded-2xl border border-zinc-200 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-zinc-50 text-zinc-500 font-bold uppercase tracking-wider border-b border-zinc-200">
                  <tr>
                    <th className="px-5 py-3.5">Product</th>
                    <th className="px-4 py-3.5">Category / Type</th>
                    <th className="px-4 py-3.5">Retail Price</th>
                    <th className="px-4 py-3.5">Total Stock</th>
                    <th className="px-4 py-3.5">Size Breakdown (S - M - L - XL - XXL)</th>
                    <th className="px-4 py-3.5">Status</th>
                    <th className="px-5 py-3.5 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-100">
                  {filteredProducts.map((product) => {
                    const stock = typeof product.stock === 'number' ? product.stock : 0;
                    const price = typeof product.price === 'object' ? product.price.amount : product.price;
                    const imgUrl = getProductImage(product);
                    const sizes = product.sizeStock || { S: 0, M: 0, L: 0, XL: 0, XXL: 0 };

                    return (
                      <tr key={product._id} className="hover:bg-zinc-50/70 transition-colors">
                        <td className="px-5 py-4">
                          <div className="flex items-center gap-3">
                            <div className="w-12 h-14 bg-zinc-100 rounded-lg overflow-hidden flex-shrink-0 border border-zinc-200">
                              {imgUrl ? (
                                <img
                                  src={imgUrl}
                                  alt={product.title}
                                  className="w-full h-full object-cover"
                                />
                              ) : (
                                <div className="w-full h-full flex items-center justify-center text-zinc-300">
                                  <Package className="w-5 h-5" />
                                </div>
                              )}
                            </div>
                            <div className="max-w-[200px]">
                              <p className="font-heading font-bold text-zinc-900 line-clamp-1">
                                {product.title}
                              </p>
                              <p className="text-[10px] text-zinc-400 mt-0.5 truncate">
                                ID: {product._id?.substring(0, 10)}...
                              </p>
                            </div>
                          </div>
                        </td>

                        <td className="px-4 py-4 font-semibold text-zinc-700">
                          {product.type || product.category || 'Shirts'}
                        </td>

                        <td className="px-4 py-4 font-heading font-extrabold text-zinc-900">
                          {formatCurrency(price)}
                        </td>

                        <td className="px-4 py-4">
                          <span className="font-heading font-extrabold text-sm text-zinc-900">
                            {stock}
                          </span>
                          <span className="text-[10px] text-zinc-400 ml-1">units</span>
                        </td>

                        <td className="px-4 py-4">
                          <div className="flex items-center gap-1.5">
                            {['S', 'M', 'L', 'XL', 'XXL'].map((sz) => (
                              <span
                                key={sz}
                                className="px-2 py-0.5 bg-zinc-100 rounded text-[11px] font-mono font-medium text-zinc-700 border border-zinc-200"
                              >
                                {sz}:{Number(sizes[sz]) || 0}
                              </span>
                            ))}
                          </div>
                        </td>

                        <td className="px-4 py-4">
                          {stock === 0 ? (
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-rose-50 text-rose-700 border border-rose-200 rounded-full text-[10px] font-bold uppercase">
                              <XCircle className="w-3 h-3" />
                              Out of Stock
                            </span>
                          ) : stock <= 10 ? (
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-amber-50 text-amber-700 border border-amber-200 rounded-full text-[10px] font-bold uppercase">
                              <AlertTriangle className="w-3 h-3" />
                              Low Stock
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-full text-[10px] font-bold uppercase">
                              <CheckCircle2 className="w-3 h-3" />
                              In Stock
                            </span>
                          )}
                        </td>

                        <td className="px-5 py-4 text-right">
                          <div className="flex items-center justify-end gap-2">
                            <Link
                              to={`/product/${product._id}`}
                              className="p-1.5 text-zinc-400 hover:text-zinc-800 hover:bg-zinc-100 rounded-lg transition-colors"
                              title="Storefront Preview"
                            >
                              <ExternalLink className="w-4 h-4" />
                            </Link>
                            <Link
                              to={`/seller/product/${product._id}`}
                              className="px-3 py-1.5 bg-zinc-900 hover:bg-black text-white rounded-lg text-xs font-bold transition-all shadow-sm"
                            >
                              Edit Stock
                            </Link>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}

      </main>

    </div>
  );
}
