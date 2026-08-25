import React, { useState, useEffect, useMemo } from 'react';
import { Link, useNavigate } from 'react-router';
import {
  Plus,
  Search,
  SlidersHorizontal,
  Grid,
  List,
  RefreshCw,
  Eye,
  ShoppingBag,
  ExternalLink,
  Package,
  Layers,
  Sparkles,
  TrendingUp,
  DollarSign,
  Calendar,
  Image as ImageIcon,
  ArrowUpDown,
  Tag,
  X,
  CheckCircle2,
  AlertCircle,
  Loader2,
  ChevronRight,
  Share2,
  Filter
} from 'lucide-react';
import useProduct from '../Hooks/useProduct.js';

const CATEGORY_FILTERS = [
  'All',
  'Oversized',
  'Streetwear',
  'Outerwear',
  'Heavyweight',
  'Tops & Shirts',
  'Bottoms',
];

const CURRENCY_SYMBOLS = {
  INR: '₹',
  USD: '$',
  EUR: '€',
  GBP: '£',
};

export default function ViewAllProducts() {
  const navigate = useNavigate();
  const { handleGetSellerProducts, sellerProduct, loading, error, clearMessages } = useProduct();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [sortBy, setSortBy] = useState('newest'); // 'newest', 'oldest', 'price-low', 'price-high', 'title'
  const [viewMode, setViewMode] = useState('grid'); // 'grid' or 'list'
  const [selectedProductForModal, setSelectedProductForModal] = useState(null);
  const [activeModalImageIndex, setActiveModalImageIndex] = useState(0);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [copiedToast, setCopiedToast] = useState(false);

  // Fetch seller products on mount
  useEffect(() => {
    handleGetSellerProducts();
  }, []);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await handleGetSellerProducts();
    setTimeout(() => setIsRefreshing(false), 600);
  };

  // Safe helper to extract image URL
  const getProductImageUrl = (product, index = 0) => {
    if (!product || !product.images || product.images.length === 0) return null;
    const img = product.images[index] || product.images[0];
    if (typeof img === 'string') return img;
    return img?.url || null;
  };

  // Helper to format currency and price
  const formatPrice = (priceObj) => {
    if (!priceObj) return '₹0';
    const amount = Number(priceObj.amount || 0);
    const currency = priceObj.currency || 'INR';
    const symbol = CURRENCY_SYMBOLS[currency] || currency;
    return `${symbol}${amount.toLocaleString()}`;
  };

  // Helper to format creation date
  const formatDate = (dateString) => {
    if (!dateString) return 'Recent Drop';
    try {
      const d = new Date(dateString);
      return d.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      });
    } catch {
      return 'Recent Drop';
    }
  };

  // Filter and Sort products
  const filteredAndSortedProducts = useMemo(() => {
    const products = Array.isArray(sellerProduct) ? [...sellerProduct] : [];

    // Filter by search query
    let result = products.filter((p) => {
      const titleMatch = (p.title || '').toLowerCase().includes(searchQuery.toLowerCase());
      const descMatch = (p.description || '').toLowerCase().includes(searchQuery.toLowerCase());
      return titleMatch || descMatch;
    });

    // Filter by category tag (searches in title or description)
    if (selectedCategory !== 'All') {
      result = result.filter((p) => {
        const text = `${p.title || ''} ${p.description || ''}`.toLowerCase();
        return text.includes(selectedCategory.toLowerCase());
      });
    }

    // Sort
    result.sort((a, b) => {
      if (sortBy === 'newest') {
        return new Date(b.createdAt || 0) - new Date(a.createdAt || 0);
      }
      if (sortBy === 'oldest') {
        return new Date(a.createdAt || 0) - new Date(b.createdAt || 0);
      }
      if (sortBy === 'price-low') {
        return (Number(a.price?.amount) || 0) - (Number(b.price?.amount) || 0);
      }
      if (sortBy === 'price-high') {
        return (Number(b.price?.amount) || 0) - (Number(a.price?.amount) || 0);
      }
      if (sortBy === 'title') {
        return (a.title || '').localeCompare(b.title || '');
      }
      return 0;
    });

    return result;
  }, [sellerProduct, searchQuery, selectedCategory, sortBy]);

  // Calculate stats
  const stats = useMemo(() => {
    const products = Array.isArray(sellerProduct) ? sellerProduct : [];
    const totalCount = products.length;
    const totalValuation = products.reduce(
      (sum, p) => sum + (Number(p.price?.amount) || 0),
      0
    );
    const avgPrice = totalCount > 0 ? Math.round(totalValuation / totalCount) : 0;

    return {
      totalCount,
      totalValuation,
      avgPrice,
    };
  }, [sellerProduct]);

  const handleShareProduct = (product, e) => {
    e.stopPropagation();
    const url = window.location.origin;
    if (navigator.clipboard) {
      navigator.clipboard.writeText(`${url}/#product-${product._id}`);
      setCopiedToast(true);
      setTimeout(() => setCopiedToast(false), 2000);
    }
  };

  return (
    <div className="min-h-screen bg-white text-zinc-900 selection:bg-zinc-900 selection:text-white flex flex-col">

      {/* TOP STICKY EDITORIAL NAVBAR */}
      <header className="sticky top-0 z-40 bg-white/90 backdrop-blur-md border-b border-zinc-100 transition-all">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
          
          {/* Brand Logo & Studio Subtitle */}
          <div className="flex items-center gap-4 sm:gap-6">
            <Link to="/" className="inline-block group">
              <span className="font-heading font-black text-xl sm:text-2xl tracking-[0.35em] text-zinc-900 uppercase">
                S N I T C H
              </span>
            </Link>

            <div className="h-4 w-px bg-zinc-200 hidden md:block"></div>

            <div className="hidden md:flex items-center gap-2 text-xs font-semibold tracking-wider uppercase text-zinc-400">
              <span>Seller Studio</span>
              <span>•</span>
              <span className="text-zinc-800">Collection Inventory</span>
            </div>
          </div>

          {/* Top Actions: Refresh, Status Badge & Create Drop Button */}
          <div className="flex items-center gap-2 sm:gap-4">
            
            {copiedToast && (
              <span className="animate-fade-in inline-flex items-center gap-1.5 px-3 py-1 bg-zinc-900 text-white text-xs font-medium rounded-full shadow-sm">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                Link Copied
              </span>
            )}

            <button
              type="button"
              onClick={handleRefresh}
              title="Refresh inventory"
              className="p-2 sm:p-2.5 rounded-full hover:bg-zinc-100 text-zinc-500 hover:text-zinc-900 transition-colors cursor-pointer"
            >
              <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin text-zinc-900' : ''}`} />
            </button>

            <Link
              to="/products/create"
              className="editorial-black-pill px-4 sm:px-6 py-2.5 sm:py-3 flex items-center gap-1.5 sm:gap-2 text-xs font-bold whitespace-nowrap cursor-pointer shadow-md hover:shadow-lg"
            >
              <Plus className="w-4 h-4" />
              <span>Create New Drop</span>
            </Link>

          </div>

        </div>
      </header>

      {/* MAIN CONTENT CONTAINER WITH AMPLE BREATHING SPACE */}
      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 w-full">

        {/* HERO SECTION: TITLE, DESCRIPTION & TOTAL PRODUCTS PILL */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-8 sm:mb-10">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-zinc-100 text-zinc-700 text-[11px] font-bold tracking-widest uppercase mb-3">
              <Layers className="w-3.5 h-3.5 text-zinc-500" />
              <span>Merchant Lookbook</span>
            </div>
            <h1 className="font-heading font-extrabold text-3xl sm:text-4xl lg:text-5xl text-zinc-900 tracking-tight">
              Seller Catalog
            </h1>
            <p className="mt-2 text-sm sm:text-base text-zinc-500 max-w-2xl leading-relaxed">
              Manage your active high-fashion apparel collection drops, monitor listings, and view detailed customer-facing product specifications.
            </p>
          </div>

          {/* Quick Counter Badge */}
          <div className="flex items-center gap-2 self-start md:self-auto bg-zinc-50 border border-zinc-200/80 px-4 py-2 rounded-2xl">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
            <span className="text-xs font-bold text-zinc-800 tracking-wider uppercase">
              {stats.totalCount} {stats.totalCount === 1 ? 'Product Live' : 'Products Live'}
            </span>
          </div>
        </div>

        {/* STATS OVERVIEW RIBBON (RESPONSIVE 4-GRID: Desktop 4-col, iPad 2-col, Phone 2-col) */}
        {stats.totalCount > 0 && (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-8 sm:mb-12">
            
            {/* Total Drops */}
            <div className="bg-zinc-50/70 border border-zinc-200/70 rounded-2xl p-4 sm:p-5 flex flex-col justify-between">
              <div className="flex items-center justify-between text-zinc-400 mb-2">
                <span className="text-[11px] font-bold tracking-wider uppercase">Total Drops</span>
                <Package className="w-4 h-4 text-zinc-600" />
              </div>
              <p className="font-heading font-extrabold text-2xl sm:text-3xl text-zinc-900">
                {stats.totalCount}
              </p>
              <span className="text-[10px] text-zinc-400 font-medium mt-1">
                Published in Snitch store
              </span>
            </div>

            {/* Catalog Valuation */}
            <div className="bg-zinc-50/70 border border-zinc-200/70 rounded-2xl p-4 sm:p-5 flex flex-col justify-between">
              <div className="flex items-center justify-between text-zinc-400 mb-2">
                <span className="text-[11px] font-bold tracking-wider uppercase">Inventory Value</span>
                <TrendingUp className="w-4 h-4 text-emerald-600" />
              </div>
              <p className="font-heading font-extrabold text-2xl sm:text-3xl text-zinc-900">
                ₹{stats.totalValuation.toLocaleString()}
              </p>
              <span className="text-[10px] text-emerald-600 font-semibold mt-1">
                Cumulative drop value
              </span>
            </div>

            {/* Average Price */}
            <div className="bg-zinc-50/70 border border-zinc-200/70 rounded-2xl p-4 sm:p-5 flex flex-col justify-between">
              <div className="flex items-center justify-between text-zinc-400 mb-2">
                <span className="text-[11px] font-bold tracking-wider uppercase">Avg. Drop Price</span>
                <Sparkles className="w-4 h-4 text-amber-500" />
              </div>
              <p className="font-heading font-extrabold text-2xl sm:text-3xl text-zinc-900">
                ₹{stats.avgPrice.toLocaleString()}
              </p>
              <span className="text-[10px] text-zinc-400 font-medium mt-1">
                Per garment unit
              </span>
            </div>

            {/* Curation Health */}
            <div className="bg-zinc-50/70 border border-zinc-200/70 rounded-2xl p-4 sm:p-5 flex flex-col justify-between">
              <div className="flex items-center justify-between text-zinc-400 mb-2">
                <span className="text-[11px] font-bold tracking-wider uppercase">Store Status</span>
                <CheckCircle2 className="w-4 h-4 text-emerald-500" />
              </div>
              <p className="font-heading font-extrabold text-2xl sm:text-3xl text-zinc-900">
                100%
              </p>
              <span className="text-[10px] text-emerald-600 font-semibold mt-1">
                Verified Seller Active
              </span>
            </div>

          </div>
        )}

        {/* ERROR NOTIFICATION BANNER */}
        {error && (
          <div className="mb-6 p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-900 flex items-center justify-between">
            <div className="flex items-center gap-2.5 text-xs sm:text-sm font-medium">
              <AlertCircle className="w-4 h-4 text-rose-600 flex-shrink-0" />
              <span>{error}</span>
            </div>
            <button
              onClick={clearMessages}
              className="text-xs font-bold text-rose-700 hover:text-rose-900 underline"
            >
              Dismiss
            </button>
          </div>
        )}

        {/* SEARCH, SORT, FILTER & VIEW CONTROLS TOOLBAR */}
        <div className="bg-white border border-zinc-200/80 rounded-2xl p-4 mb-8 shadow-xs space-y-4">
          
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
            
            {/* Search Input */}
            <div className="relative flex-1 max-w-lg">
              <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search collection drops by title or material..."
                className="w-full bg-zinc-50 border border-zinc-200/80 rounded-xl pl-10 pr-9 py-2.5 text-sm font-medium text-zinc-900 placeholder:text-zinc-400 outline-none focus:bg-white focus:border-zinc-900 transition-all"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-800"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            {/* Sort & View Mode Selector */}
            <div className="flex items-center gap-3 self-end sm:self-auto w-full sm:w-auto justify-between sm:justify-end">
              
              {/* Sort Dropdown */}
              <div className="flex items-center gap-2">
                <ArrowUpDown className="w-3.5 h-3.5 text-zinc-400 hidden sm:block" />
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="bg-zinc-50 border border-zinc-200/80 rounded-xl px-3 py-2 text-xs font-semibold text-zinc-800 outline-none focus:border-zinc-900 cursor-pointer transition-colors"
                >
                  <option value="newest">Newest Drops First</option>
                  <option value="oldest">Oldest Drops First</option>
                  <option value="price-low">Price: Low to High</option>
                  <option value="price-high">Price: High to Low</option>
                  <option value="title">Alphabetical (A-Z)</option>
                </select>
              </div>

              {/* View Toggle (Grid / List) */}
              <div className="flex items-center bg-zinc-100 p-1 rounded-xl border border-zinc-200/60">
                <button
                  type="button"
                  onClick={() => setViewMode('grid')}
                  title="Grid Lookbook View"
                  className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                    viewMode === 'grid'
                      ? 'bg-white text-zinc-900 shadow-xs font-bold'
                      : 'text-zinc-400 hover:text-zinc-700'
                  }`}
                >
                  <Grid className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={() => setViewMode('list')}
                  title="Editorial List View"
                  className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                    viewMode === 'list'
                      ? 'bg-white text-zinc-900 shadow-xs font-bold'
                      : 'text-zinc-400 hover:text-zinc-700'
                  }`}
                >
                  <List className="w-4 h-4" />
                </button>
              </div>

            </div>

          </div>

          {/* Category Filter Chips */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none pt-1 border-t border-zinc-100">
            <span className="text-[11px] font-bold uppercase tracking-wider text-zinc-400 mr-1 flex items-center gap-1 flex-shrink-0">
              <Filter className="w-3 h-3" />
              Tags:
            </span>
            {CATEGORY_FILTERS.map((cat) => {
              const isSelected = selectedCategory === cat;
              return (
                <button
                  key={cat}
                  type="button"
                  onClick={() => setSelectedCategory(cat)}
                  className={`text-xs px-3 py-1.5 rounded-full font-medium whitespace-nowrap transition-all cursor-pointer flex-shrink-0 ${
                    isSelected
                      ? 'bg-zinc-900 text-white shadow-xs'
                      : 'bg-zinc-100 text-zinc-600 hover:bg-zinc-200'
                  }`}
                >
                  {cat}
                </button>
              );
            })}
          </div>

        </div>

        {/* LOADING SKELETON STATE */}
        {loading && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {[1, 2, 3, 4, 5, 6, 7, 8].map((n) => (
              <div
                key={n}
                className="editorial-card overflow-hidden animate-pulse p-4 space-y-4"
              >
                <div className="aspect-[3/4] bg-zinc-200 rounded-2xl w-full"></div>
                <div className="h-4 bg-zinc-200 rounded w-3/4"></div>
                <div className="h-3 bg-zinc-100 rounded w-1/2"></div>
                <div className="flex justify-between items-center pt-2">
                  <div className="h-5 bg-zinc-200 rounded w-1/3"></div>
                  <div className="h-7 bg-zinc-200 rounded-full w-16"></div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* EMPTY STATE: NO PRODUCTS CREATED YET */}
        {!loading && filteredAndSortedProducts.length === 0 && (
          <div className="editorial-card p-10 sm:p-16 text-center max-w-2xl mx-auto my-8">
            <div className="w-20 h-20 rounded-3xl bg-zinc-100 border border-zinc-200 flex items-center justify-center mx-auto mb-6 text-zinc-700 shadow-sm">
              <Package className="w-9 h-9 text-zinc-500 stroke-1" />
            </div>

            {searchQuery || selectedCategory !== 'All' ? (
              <>
                <h3 className="font-heading font-extrabold text-2xl text-zinc-900">
                  No matching drops found
                </h3>
                <p className="mt-2 text-sm text-zinc-500 max-w-md mx-auto">
                  We couldn't find any collection items matching "{searchQuery || selectedCategory}". Try clearing your filters or searching another keyword.
                </p>
                <button
                  type="button"
                  onClick={() => {
                    setSearchQuery('');
                    setSelectedCategory('All');
                  }}
                  className="editorial-secondary-pill mt-6 px-6 py-2.5 text-xs font-bold cursor-pointer"
                >
                  Clear All Filters
                </button>
              </>
            ) : (
              <>
                <h3 className="font-heading font-extrabold text-2xl sm:text-3xl text-zinc-900">
                  Your Catalog is Empty
                </h3>
                <p className="mt-2 text-sm sm:text-base text-zinc-500 max-w-md mx-auto leading-relaxed">
                  You haven't published any fashion collection items yet. Launch your first luxury apparel drop today to start showcasing your creations.
                </p>
                <Link
                  to="/products/create"
                  className="editorial-black-pill inline-flex items-center gap-2 mt-6 px-8 py-3.5 text-xs font-bold cursor-pointer shadow-lg"
                >
                  <Plus className="w-4 h-4" />
                  <span>Create Your First Drop</span>
                </Link>
              </>
            )}
          </div>
        )}

        {/* PRODUCTS LISTING: GRID VIEW */}
        {!loading && viewMode === 'grid' && filteredAndSortedProducts.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 sm:gap-8">
            {filteredAndSortedProducts.map((product) => {
              const coverImg = getProductImageUrl(product, 0);
              const imageCount = product.images?.length || 0;

              return (
                <div
                  key={product._id}
                  onClick={() => {
                    setSelectedProductForModal(product);
                    setActiveModalImageIndex(0);
                  }}
                  className="group editorial-card overflow-hidden hover:shadow-xl transition-all duration-300 flex flex-col justify-between cursor-pointer"
                >
                  
                  {/* Top Image Showcase (3:4 High-Fashion Portrait Ratio) */}
                  <div className="relative aspect-[3/4] bg-zinc-100 overflow-hidden rounded-t-[27px]">
                    {coverImg ? (
                      <img
                        src={coverImg}
                        alt={product.title}
                        className="w-full h-full object-cover object-center transition-transform duration-700 group-hover:scale-105"
                      />
                    ) : (
                      <div className="w-full h-full flex flex-col items-center justify-center p-6 text-center text-zinc-400 bg-zinc-100">
                        <ImageIcon className="w-10 h-10 mb-2 stroke-1 text-zinc-300" />
                        <span className="text-xs font-medium">No Image Uploaded</span>
                      </div>
                    )}

                    {/* Status Pill Badge */}
                    <div className="absolute top-3.5 left-3.5 flex flex-col gap-1.5">
                      <span className="bg-zinc-900/90 backdrop-blur-md text-white text-[10px] font-black uppercase tracking-widest px-2.5 py-1 rounded-md shadow">
                        Live Drop
                      </span>
                    </div>

                    {/* Image Counter Badge */}
                    {imageCount > 1 && (
                      <div className="absolute top-3.5 right-3.5 bg-black/60 backdrop-blur-md text-white text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1 shadow">
                        <ImageIcon className="w-3 h-3" />
                        <span>{imageCount}</span>
                      </div>
                    )}

                    {/* Hover Quick Actions Overlay (Desktop) */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end justify-between p-4">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedProductForModal(product);
                          setActiveModalImageIndex(0);
                        }}
                        className="bg-white/95 hover:bg-white text-zinc-900 text-xs font-bold px-3.5 py-1.5 rounded-full shadow flex items-center gap-1.5 transition-transform hover:scale-105 cursor-pointer"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        <span>Quick Look</span>
                      </button>

                      <button
                        type="button"
                        onClick={(e) => handleShareProduct(product, e)}
                        className="w-8 h-8 rounded-full bg-white/95 hover:bg-white text-zinc-800 flex items-center justify-center shadow transition-transform hover:scale-105 cursor-pointer"
                        title="Share Product Link"
                      >
                        <Share2 className="w-3.5 h-3.5" />
                      </button>
                    </div>

                  </div>

                  {/* Product Details Section */}
                  <div className="p-5 sm:p-6 flex-1 flex flex-col justify-between space-y-3">
                    
                    <div>
                      <div className="flex items-center justify-between text-[10px] font-bold tracking-[0.2em] text-zinc-400 uppercase mb-1">
                        <span>S N I T C H</span>
                        <span>{formatDate(product.createdAt)}</span>
                      </div>

                      <h3 className="font-heading font-bold text-base text-zinc-900 line-clamp-1 group-hover:text-zinc-700 transition-colors">
                        {product.title}
                      </h3>

                      <p className="text-xs text-zinc-500 line-clamp-2 mt-1.5 leading-relaxed font-normal">
                        {product.description}
                      </p>
                    </div>

                    {/* Price and Action Footer */}
                    <div className="pt-3 border-t border-zinc-100 flex items-center justify-between">
                      <div>
                        <span className="text-[10px] font-semibold text-zinc-400 uppercase tracking-wider block">
                          Drop Price
                        </span>
                        <span className="font-heading font-extrabold text-lg text-zinc-900">
                          {formatPrice(product.price)}
                        </span>
                      </div>

                      <div className="px-3 py-1.5 rounded-full bg-zinc-100 group-hover:bg-zinc-900 group-hover:text-white text-zinc-700 text-xs font-bold transition-colors flex items-center gap-1">
                        <span>View</span>
                        <ChevronRight className="w-3.5 h-3.5" />
                      </div>
                    </div>

                  </div>

                </div>
              );
            })}
          </div>
        )}

        {/* PRODUCTS LISTING: EDITORIAL LIST VIEW */}
        {!loading && viewMode === 'list' && filteredAndSortedProducts.length > 0 && (
          <div className="space-y-4">
            {filteredAndSortedProducts.map((product) => {
              const coverImg = getProductImageUrl(product, 0);
              const imageCount = product.images?.length || 0;

              return (
                <div
                  key={product._id}
                  onClick={() => {
                    setSelectedProductForModal(product);
                    setActiveModalImageIndex(0);
                  }}
                  className="editorial-card p-4 sm:p-5 hover:shadow-lg transition-all flex flex-col sm:flex-row items-center justify-between gap-5 cursor-pointer group"
                >
                  {/* Thumbnail & Basic Info */}
                  <div className="flex items-center gap-4 sm:gap-6 w-full sm:w-auto">
                    
                    <div className="relative w-20 h-24 sm:w-24 sm:h-28 bg-zinc-100 rounded-xl overflow-hidden flex-shrink-0 border border-zinc-200/60">
                      {coverImg ? (
                        <img
                          src={coverImg}
                          alt={product.title}
                          className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-500"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-zinc-300">
                          <ImageIcon className="w-6 h-6 stroke-1" />
                        </div>
                      )}
                      {imageCount > 1 && (
                        <span className="absolute bottom-1 right-1 bg-black/60 text-white text-[9px] font-bold px-1.5 py-0.2 rounded">
                          +{imageCount}
                        </span>
                      )}
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 text-[10px] font-bold tracking-widest text-zinc-400 uppercase mb-0.5">
                        <span>S N I T C H</span>
                        <span>•</span>
                        <span>{formatDate(product.createdAt)}</span>
                      </div>

                      <h3 className="font-heading font-bold text-base sm:text-lg text-zinc-900 line-clamp-1 group-hover:text-zinc-700 transition-colors">
                        {product.title}
                      </h3>

                      <p className="text-xs text-zinc-500 line-clamp-2 mt-1 max-w-xl font-normal leading-relaxed">
                        {product.description}
                      </p>
                    </div>

                  </div>

                  {/* Price & Action Button */}
                  <div className="flex items-center justify-between sm:justify-end gap-6 w-full sm:w-auto pt-3 sm:pt-0 border-t sm:border-t-0 border-zinc-100 flex-shrink-0">
                    <div className="text-left sm:text-right">
                      <span className="text-[10px] font-semibold text-zinc-400 uppercase tracking-wider block">
                        Retail Price
                      </span>
                      <span className="font-heading font-extrabold text-xl text-zinc-900">
                        {formatPrice(product.price)}
                      </span>
                    </div>

                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedProductForModal(product);
                        setActiveModalImageIndex(0);
                      }}
                      className="editorial-black-pill px-5 py-2.5 text-xs font-bold flex items-center gap-1.5 cursor-pointer shadow-xs"
                    >
                      <Eye className="w-3.5 h-3.5" />
                      <span>Details</span>
                    </button>
                  </div>

                </div>
              );
            })}
          </div>
        )}

      </main>

      {/* QUICK VIEW EDITORIAL MODAL */}
      {selectedProductForModal && (
        <div
          onClick={() => setSelectedProductForModal(null)}
          className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 sm:p-6 animate-fade-in"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="bg-white rounded-3xl max-w-3xl w-full max-h-[90vh] overflow-y-auto shadow-2xl border border-zinc-200/80 p-6 sm:p-8 relative"
          >
            {/* Close Button */}
            <button
              onClick={() => setSelectedProductForModal(null)}
              className="absolute top-5 right-5 w-8 h-8 rounded-full bg-zinc-100 hover:bg-zinc-200 text-zinc-700 flex items-center justify-center transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>

            {/* Modal Content Grid */}
            <div className="grid grid-cols-1 md:grid-cols-12 gap-6 sm:gap-8 items-start">
              
              {/* Left Column: Image Gallery Viewer (5 cols) */}
              <div className="md:col-span-5 space-y-3">
                <div className="aspect-[3/4] rounded-2xl overflow-hidden bg-zinc-100 border border-zinc-200/80 relative">
                  {getProductImageUrl(selectedProductForModal, activeModalImageIndex) ? (
                    <img
                      src={getProductImageUrl(selectedProductForModal, activeModalImageIndex)}
                      alt={selectedProductForModal.title}
                      className="w-full h-full object-cover object-center"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-zinc-300">
                      <ImageIcon className="w-12 h-12 stroke-1" />
                    </div>
                  )}
                  <span className="absolute top-3 left-3 bg-black text-white text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded">
                    AUTHENTIC SNITCH
                  </span>
                </div>

                {/* Thumbnails list if multiple */}
                {selectedProductForModal.images?.length > 1 && (
                  <div className="flex gap-2 overflow-x-auto pb-1">
                    {selectedProductForModal.images.map((img, idx) => {
                      const url = typeof img === 'string' ? img : img.url;
                      return (
                        <button
                          key={idx}
                          type="button"
                          onClick={() => setActiveModalImageIndex(idx)}
                          className={`w-14 h-18 rounded-lg overflow-hidden border-2 flex-shrink-0 transition-all ${
                            activeModalImageIndex === idx
                              ? 'border-zinc-900 ring-1 ring-zinc-900'
                              : 'border-transparent opacity-70 hover:opacity-100'
                          }`}
                        >
                          <img
                            src={url}
                            alt={`Thumb ${idx + 1}`}
                            className="w-full h-full object-cover"
                          />
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Right Column: Full Specifications & Actions (7 cols) */}
              <div className="md:col-span-7 space-y-5">
                
                <div>
                  <div className="flex items-center justify-between text-xs font-bold tracking-[0.25em] text-zinc-400 uppercase mb-1.5">
                    <span>S N I T C H • SELLER DROP</span>
                    <span>{formatDate(selectedProductForModal.createdAt)}</span>
                  </div>

                  <h2 className="font-heading font-extrabold text-2xl sm:text-3xl text-zinc-900">
                    {selectedProductForModal.title}
                  </h2>

                  <div className="mt-3 flex items-baseline gap-2">
                    <span className="text-xs font-semibold text-zinc-400 uppercase">Retail Price:</span>
                    <span className="font-heading font-black text-2xl text-zinc-900">
                      {formatPrice(selectedProductForModal.price)}
                    </span>
                  </div>
                </div>

                <div className="border-t border-zinc-100 pt-4">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-zinc-800 mb-2">
                    Fabric & Specifications
                  </h4>
                  <p className="text-xs sm:text-sm text-zinc-600 leading-relaxed whitespace-pre-line bg-zinc-50 p-4 rounded-xl border border-zinc-100">
                    {selectedProductForModal.description}
                  </p>
                </div>

                <div className="border-t border-zinc-100 pt-4 space-y-2.5">
                  <div className="flex items-center justify-between text-xs text-zinc-500">
                    <span className="font-medium">Product ID</span>
                    <span className="font-mono text-zinc-800">{selectedProductForModal._id}</span>
                  </div>
                  <div className="flex items-center justify-between text-xs text-zinc-500">
                    <span className="font-medium">Gallery Count</span>
                    <span className="font-semibold text-zinc-800">
                      {selectedProductForModal.images?.length || 0} Photos Uploaded
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-xs text-zinc-500">
                    <span className="font-medium">Marketplace Status</span>
                    <span className="inline-flex items-center gap-1 font-bold text-emerald-600">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                      Active & Visible
                    </span>
                  </div>
                </div>

                {/* Modal Footer Actions */}
                <div className="pt-4 border-t border-zinc-100 flex items-center gap-3">
                  <button
                    type="button"
                    onClick={(e) => handleShareProduct(selectedProductForModal, e)}
                    className="editorial-secondary-pill flex-1 py-2.5 text-xs font-bold flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <Share2 className="w-3.5 h-3.5" />
                    <span>Share Drop</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setSelectedProductForModal(null)}
                    className="editorial-black-pill flex-1 py-2.5 text-xs font-bold flex items-center justify-center cursor-pointer"
                  >
                    Done
                  </button>
                </div>

              </div>

            </div>

          </div>
        </div>
      )}

      {/* FOOTER */}
      <footer className="border-t border-zinc-100 py-8 text-center text-xs text-zinc-400 bg-white">
        <p className="font-heading font-bold tracking-widest uppercase text-zinc-600">
          S N I T C H • SELLER STUDIO
        </p>
        <p className="mt-1 text-[11px]">
          Official Merchant Portal • Luxury Apparel & Streetwear Marketplace
        </p>
      </footer>

    </div>
  );
}
