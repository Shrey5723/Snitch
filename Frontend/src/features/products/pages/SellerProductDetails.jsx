import React, { useState, useEffect, useMemo } from 'react';
import { useParams, Link, useNavigate } from 'react-router';
import { useSelector } from 'react-redux';
import {
  ShoppingBag,
  Heart,
  Share2,
  ChevronRight,
  ChevronLeft,
  Star,
  ShieldCheck,
  Truck,
  RotateCcw,
  Sparkles,
  Check,
  CheckCircle2,
  ArrowRight,
  Minus,
  Plus,
  ChevronDown,
  ChevronUp,
  Loader2,
  X,
  Eye,
  Maximize2,
  Image as ImageIcon,
  Save,
  Package,
  Layers,
  DollarSign,
  TrendingUp,
  AlertTriangle,
  RefreshCw,Edit3,ExternalLink,History,SlidersHorizontal,ArrowUpDown
} from 'lucide-react';
import useProduct from '../Hooks/useProduct.js';

// Category Pill Options matching Screenshot 2
const CATEGORIES = [
  'VIEW ALL',
  'SHIRTS',
  'JACKETS',
  'PANTS',
  'SNEAKERS',
  'ACCESSORIES'
];

// Curated Luxury Color Palettes matching Screenshot 1
const COLORS = [
  { id: 'obsidian-black', name: 'OBSIDIAN BLACK', hex: '#18181b', ringClass: 'border-zinc-900' },
  { id: 'charcoal-grey', name: 'CHARCOAL GREY', hex: '#52525b', ringClass: 'border-zinc-500' },
  { id: 'concrete-stone', name: 'CONCRETE STONE', hex: '#a1a1aa', ringClass: 'border-zinc-300' }
];

const SIZES = ['S', 'M', 'L', 'XL', 'XXL'];

export default function SellerProductDetails() {
  const { productId } = useParams();
  const navigate = useNavigate();
  const { user, isAuthenticated } = useSelector((state) => state.auth || {});
  const { currentProduct, loading, handleGetProductById, handleUpdateProduct } = useProduct();

  // Active product details state
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [selectedColor, setSelectedColor] = useState(COLORS[0]);
  const [selectedSize, setSelectedSize] = useState('M');
  const [previewQuantity, setPreviewQuantity] = useState(1);
  const [activeAccordion, setActiveAccordion] = useState('specs');
  const [showSizeGuide, setShowSizeGuide] = useState(false);
  const [showLightbox, setShowLightbox] = useState(false);
  const [toastMessage, setToastMessage] = useState(null);

  // Editable product & stock management state
  const [editTitle, setEditTitle] = useState('');
  const [editDescription, setEditDescription] = useState('');
  const [editPriceAmount, setEditPriceAmount] = useState(2999);
  const [editPriceCurrency, setEditPriceCurrency] = useState('INR');
  const [editCategory, setEditCategory] = useState('JACKETS');
  const [editStatus, setEditStatus] = useState('In Stock');

  // Per-size inventory stock numbers
  const [sizeStock, setSizeStock] = useState({
    S: 12,
    M: 24,
    L: 18,
    XL: 8,
    XXL: 5,
  });

  // Stock activity change history log
  const [activityLogs, setActivityLogs] = useState([
    { id: 1, text: 'Initial stock allocated from Fall/Winter batch', time: 'Today, 10:30 AM' }
  ]);

  const [isSaving, setIsSaving] = useState(false);
  const [activeTab, setActiveTab] = useState('stock'); // 'stock' | 'preview' | 'specs'

  // Fetch product on load
  useEffect(() => {
    window.scrollTo(0, 0);
    if (productId) {
      handleGetProductById(productId);
    }
  }, [productId]);

  // Synchronize component state with fetched product
  useEffect(() => {
    if (currentProduct && currentProduct._id === productId) {
      setEditTitle(currentProduct.title || '');
      setEditDescription(currentProduct.description || '');
      setEditPriceAmount(currentProduct.price?.amount || 2999);
      setEditPriceCurrency(currentProduct.price?.currency || 'INR');
      setEditCategory(currentProduct.category ? currentProduct.category.toUpperCase() : 'JACKETS');
      setEditStatus(currentProduct.status || 'In Stock');

      if (currentProduct.sizeStock) {
        setSizeStock({
          S: Number(currentProduct.sizeStock.S ?? 12),
          M: Number(currentProduct.sizeStock.M ?? 24),
          L: Number(currentProduct.sizeStock.L ?? 18),
          XL: Number(currentProduct.sizeStock.XL ?? 8),
          XXL: Number(currentProduct.sizeStock.XXL ?? 5),
        });
      }
    }
  }, [currentProduct, productId]);

  // Total stock calculation
  const totalStockCount = useMemo(() => {
    return Object.values(sizeStock).reduce((sum, qty) => sum + (Number(qty) || 0), 0);
  }, [sizeStock]);

  // Total inventory valuation
  const inventoryValuation = useMemo(() => {
    return totalStockCount * (Number(editPriceAmount) || 0);
  }, [totalStockCount, editPriceAmount]);

  // Safe images list supporting up to 7 photos
  const imagesList = useMemo(() => {
    if (currentProduct?.images && currentProduct.images.length > 0) {
      return currentProduct.images.slice(0, 7).map((img) => (typeof img === 'string' ? img : img.url));
    }
    return [
      'https://lh3.googleusercontent.com/aida-public/AB6AXuCBx6WMWY_7ZVpiDmf6kJYkIgvC6nN6nsqi72feb6NglDYi0sDBipqXsM3G-g_8ERRGGu8Qv0Jhm05_UWY2jXySZF4x5_-jIlv1lh--G9avzDDECEbadt_FmzkzRWlvQiQiKPFg6j50NuAJcIaXszHtgwU_hsUrHIqS_eOwBEGexTlNKHJRZw0sqcpA1DMoUX5tHgSrvKLfrA1L_vJ-DqEthmJLiZqYQIjlJF9vJoTSwlFGnsWRT8I28UannZ4jsF_4jP5sgj-iadM'
    ];
  }, [currentProduct]);

  // Price formatter
  const formatPrice = (amount, currency = editPriceCurrency) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: currency || 'INR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount || 0);
  };

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  // Stock adjustment handlers
  const handleStockChange = (size, newQty) => {
    const qty = Math.max(0, parseInt(newQty) || 0);
    const prev = sizeStock[size];
    if (prev !== qty) {
      setSizeStock((prevStock) => ({
        ...prevStock,
        [size]: qty,
      }));
      setActivityLogs((prevLogs) => [
        {
          id: Date.now(),
          text: `Size ${size} stock updated from ${prev} → ${qty} units`,
          time: 'Just now',
        },
        ...prevLogs.slice(0, 7),
      ]);
    }
  };

  const handleBulkRestock = (amountToAdd) => {
    setSizeStock((prevStock) => {
      const updated = {};
      SIZES.forEach((sz) => {
        updated[sz] = (prevStock[sz] || 0) + amountToAdd;
      });
      return updated;
    });
    setActivityLogs((prevLogs) => [
      {
        id: Date.now(),
        text: `Batch restock of +${amountToAdd} units added to all sizes`,
        time: 'Just now',
      },
      ...prevLogs.slice(0, 7),
    ]);
    showToast(`Added +${amountToAdd} units across all sizes`);
  };

  const handleResetStock = () => {
    setSizeStock({ S: 0, M: 0, L: 0, XL: 0, XXL: 0 });
    setActivityLogs((prevLogs) => [
      {
        id: Date.now(),
        text: 'All size inventory counts reset to zero',
        time: 'Just now',
      },
      ...prevLogs.slice(0, 7),
    ]);
    showToast('Inventory cleared for all sizes');
  };

  // Save changes to backend
  const handleSaveAll = async () => {
    if (!productId) return;
    setIsSaving(true);
    try {
      const payload = {
        title: editTitle,
        description: editDescription,
        priceAmount: Number(editPriceAmount),
        priceCurrency: editPriceCurrency,
        category: editCategory,
        status: totalStockCount === 0 ? 'Out of Stock' : totalStockCount <= 10 ? 'Low Stock' : 'In Stock',
        sizeStock: sizeStock,
        stock: totalStockCount,
      };

      const res = await handleUpdateProduct(productId, payload);
      if (res.success) {
        showToast('Garment specifications & stock saved successfully!');
      } else {
        showToast(res.error || 'Failed to save changes');
      }
    } catch (err) {
      showToast('Error saving product changes');
    } finally {
      setIsSaving(false);
    }
  };

  const handleShare = () => {
    if (navigator.clipboard) {
      const buyerUrl = `${window.location.origin}/product/${productId}`;
      navigator.clipboard.writeText(buyerUrl);
      showToast('Public buyer link copied to clipboard!');
    }
  };

  // Access control check: Only sellers can access
  if (isAuthenticated && user && user.role !== 'seller') {
    return (
      <div className="min-h-screen bg-zinc-50 flex items-center justify-center p-6 font-body">
        <div className="bg-white max-w-md w-full p-8 rounded-3xl shadow-xl border border-zinc-200 text-center">
          <div className="w-16 h-16 bg-rose-50 text-rose-600 rounded-full flex items-center justify-center mx-auto mb-4">
            <AlertTriangle className="w-8 h-8" />
          </div>
          <h2 className="font-heading font-black text-2xl text-zinc-900 mb-2 uppercase tracking-tight">
            Seller Access Required
          </h2>
          <p className="text-zinc-500 text-sm mb-6 leading-relaxed">
            This dashboard is reserved for verified Snitch merchant partners to manage product drops and inventory.
          </p>
          <div className="space-y-2">
            <Link
              to="/login"
              className="editorial-black-pill w-full py-3 text-xs font-bold uppercase tracking-wider block text-center"
            >
              Sign In with Seller Account
            </Link>
            <Link
              to="/"
              className="editorial-secondary-pill w-full py-2.5 text-xs font-bold uppercase tracking-wider block text-center"
            >
              Return to Catalog
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-zinc-50/60 text-zinc-900 font-body flex flex-col select-none">
      
      {/* ═══════════════════════ TOAST NOTIFICATION ═══════════════════════ */}
      {toastMessage && (
        <div className="fixed top-20 right-6 z-50 animate-fade-in bg-zinc-900 text-white px-5 py-3 rounded-2xl shadow-2xl flex items-center gap-3 border border-zinc-800">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
          <span className="text-xs font-semibold">{toastMessage}</span>
        </div>
      )}

      {/* ═══════════════════════ SELLER STUDIO TOP NAVIGATION ═══════════════════════ */}
      <header className="bg-white border-b border-zinc-200/80 sticky top-0 z-40 w-full shadow-xs">
        <div className="flex justify-between items-center px-4 sm:px-8 h-16 sm:h-20 w-full max-w-[1440px] mx-auto">
          
          {/* Left: Back to Seller Dashboard */}
          <div className="flex items-center gap-3">
            <Link
              to="/seller/products"
              className="p-2 rounded-full hover:bg-zinc-100 text-zinc-700 transition-colors flex items-center gap-1 text-xs font-bold uppercase tracking-wider cursor-pointer"
            >
              <ChevronLeft className="w-4 h-4" />
              <span className="hidden sm:inline">Seller Studio</span>
            </Link>
            <span className="text-zinc-300 hidden sm:inline">•</span>
            <span className="text-[11px] font-extrabold uppercase tracking-widest text-zinc-400 hidden md:inline">
              Inventory Manager
            </span>
          </div>

          {/* Center Brand Logo */}
          <div className="flex flex-col items-center justify-center">
            <Link to="/" className="inline-block group text-center">
              <h1 className="font-heading font-black text-xl sm:text-2xl tracking-[0.35em] text-zinc-900 uppercase leading-none">
                S N I T C H
              </h1>
              <p className="text-[8px] sm:text-[9px] font-bold tracking-[0.25em] text-zinc-400 uppercase mt-0.5">
                MERCHANT CONTROL
              </p>
            </Link>
          </div>

          {/* Right Action Bar */}
          <div className="flex items-center gap-2 sm:gap-3">
            
            {/* View Live Buyer Page */}
            <Link
              to={`/product/${productId}`}
              title="View Public Garment Page"
              className="editorial-secondary-pill p-2 sm:px-3 sm:py-2 text-xs font-bold flex items-center gap-1.5 cursor-pointer shadow-xs"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Live Storefront</span>
            </Link>

            {/* Share Link */}
            <button
              type="button"
              onClick={handleShare}
              title="Share Link"
              className="p-2 rounded-full hover:bg-zinc-100 text-zinc-700 transition-colors cursor-pointer border border-zinc-200"
            >
              <Share2 className="w-4 h-4" />
            </button>

            {/* Primary Save Button */}
            <button
              type="button"
              onClick={handleSaveAll}
              disabled={isSaving}
              className="editorial-black-pill px-4 sm:px-6 py-2 sm:py-2.5 text-xs font-bold uppercase tracking-wider flex items-center gap-2 cursor-pointer shadow-md hover:shadow-lg disabled:opacity-50"
            >
              {isSaving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
              <span>{isSaving ? 'Saving...' : 'Save Stock'}</span>
            </button>

          </div>

        </div>
      </header>

      {/* ═══════════════════════ MAIN SELLER DASHBOARD CONTAINER ═══════════════════════ */}
      <main className="flex-1 max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 py-6 w-full flex flex-col justify-start">
        
        {/* BREADCRUMB & METRIC RIBBON */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
          
          <div className="flex items-center text-[10px] sm:text-xs font-semibold text-zinc-400 gap-1.5 uppercase tracking-widest overflow-x-auto whitespace-nowrap scrollbar-none">
            <Link to="/" className="hover:text-zinc-900 transition-colors">Catalog</Link>
            <ChevronRight className="w-3 h-3 text-zinc-300" />
            <Link to="/seller/products" className="hover:text-zinc-900 transition-colors">Seller Drops</Link>
            <ChevronRight className="w-3 h-3 text-zinc-300" />
            <span className="text-zinc-900 font-bold truncate max-w-[180px] sm:max-w-none">{editTitle || 'Drop Specifications'}</span>
          </div>

          {/* Quick status badge */}
          <div className="flex items-center gap-2">
            <span className={`text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-full border flex items-center gap-1.5 ${
              totalStockCount === 0
                ? 'bg-rose-50 text-rose-700 border-rose-200'
                : totalStockCount <= 10
                ? 'bg-amber-50 text-amber-700 border-amber-200'
                : 'bg-emerald-50 text-emerald-700 border-emerald-200'
            }`}>
              <span className={`w-1.5 h-1.5 rounded-full ${
                totalStockCount === 0 ? 'bg-rose-500' : totalStockCount <= 10 ? 'bg-amber-500' : 'bg-emerald-500'
              }`}></span>
              <span>{totalStockCount === 0 ? 'Out of Stock' : totalStockCount <= 10 ? 'Low Inventory Warning' : 'Active & In Stock'}</span>
            </span>

            <span className="text-xs font-semibold text-zinc-500 bg-white px-2.5 py-1 rounded-full border border-zinc-200">
              Merchant: <strong className="text-zinc-900">{user?.fullName || 'Seller'}</strong>
            </span>
          </div>

        </div>

        {/* LOADING STATE */}
        {loading && (
          <div className="flex items-center justify-center py-24">
            <Loader2 className="w-8 h-8 animate-spin text-zinc-400" />
            <span className="ml-3 text-zinc-500 font-medium text-sm">Loading seller garment metrics...</span>
          </div>
        )}

        {!loading && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start mb-16">
            
            {/* ══════════════════════════════════════════════════════════════════════
                LEFT COLUMN: 7-PHOTO GALLERY & LIVE BUYER EXPERIENCE SIMULATOR
                (Includes exact elements from Screenshot 1 and Screenshot 2)
            ══════════════════════════════════════════════════════════════════════ */}
            <div className="lg:col-span-6 xl:col-span-6 flex flex-col space-y-6">
              
              {/* Category Filter Ribbon matching Screenshot 2 */}
              <div className="bg-white p-3.5 rounded-2xl border border-zinc-200 shadow-xs">
                <span className="text-[9px] font-extrabold uppercase tracking-widest text-zinc-400 block mb-2 px-1">
                  Collection Department (Category)
                </span>
                <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
                  {CATEGORIES.map((cat) => {
                    const isSelected = editCategory.toUpperCase() === cat.toUpperCase() || (editCategory === '' && cat === 'VIEW ALL');
                    return (
                      <button
                        key={cat}
                        type="button"
                        onClick={() => {
                          setEditCategory(cat === 'VIEW ALL' ? 'SHIRTS' : cat);
                          showToast(`Category updated to ${cat}`);
                        }}
                        className={`px-4 sm:px-5 py-2 rounded-full text-[11px] font-bold uppercase tracking-wider transition-all cursor-pointer whitespace-nowrap flex-shrink-0 ${
                          isSelected
                            ? 'bg-zinc-900 text-white shadow-xs'
                            : 'bg-white text-zinc-700 border border-zinc-200 hover:border-zinc-900 hover:text-zinc-900'
                        }`}
                      >
                        {cat}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Multi-Photo High-Fashion Gallery */}
              <div className="bg-white p-4 sm:p-5 rounded-3xl border border-zinc-200 shadow-xs flex flex-col-reverse md:flex-row gap-4 items-start">
                
                {/* Scrollable Thumbnails (Supports up to 7 photos) */}
                {imagesList.length > 1 && (
                  <div className="flex md:flex-col gap-2 overflow-x-auto md:overflow-y-auto max-h-[460px] w-full md:w-16 scrollbar-none flex-shrink-0 py-1">
                    {imagesList.map((imgUrl, index) => (
                      <button
                        key={index}
                        type="button"
                        onClick={() => setActiveImageIndex(index)}
                        className={`relative aspect-[3/4] w-14 md:w-full rounded-xl overflow-hidden border-2 flex-shrink-0 transition-all cursor-pointer bg-zinc-100 ${
                          activeImageIndex === index
                            ? 'border-zinc-900 shadow-sm ring-1 ring-zinc-900 scale-100'
                            : 'border-zinc-200 opacity-60 hover:opacity-100'
                        }`}
                      >
                        <img
                          src={imgUrl}
                          alt={`Garment Photo ${index + 1}`}
                          className="w-full h-full object-cover object-center"
                        />
                        <span className="absolute bottom-0.5 right-1 text-[8px] font-bold text-white bg-black/60 px-1 rounded">
                          {index + 1}
                        </span>
                      </button>
                    ))}
                  </div>
                )}

                {/* Hero Showcase Display */}
                <div className="flex-1 w-full relative rounded-2xl overflow-hidden bg-zinc-100 border border-zinc-100 group shadow-xs">
                  <div className="w-full aspect-[4/5] sm:aspect-[3/4] max-h-[460px] flex items-center justify-center overflow-hidden relative">
                    <img
                      src={imagesList[activeImageIndex] || imagesList[0]}
                      alt={editTitle}
                      className="w-full h-full object-cover object-center transition-transform duration-500 group-hover:scale-105"
                    />

                    {/* Badge Overlay */}
                    <div className="absolute top-3 left-3 flex items-center gap-1.5 pointer-events-none">
                      <span className="bg-zinc-900 text-white text-[9px] font-black uppercase tracking-widest px-2.5 py-1 rounded-md shadow-xs">
                        SELLER SPEC
                      </span>
                      <span className="bg-white/90 backdrop-blur-md text-zinc-900 text-[9px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-md border border-zinc-200 shadow-xs">
                        {imagesList.length} Photos Live
                      </span>
                    </div>

                    {/* Image Counter & Fullscreen Zoom Button */}
                    <div className="absolute bottom-3 right-3 flex items-center gap-2">
                      <span className="bg-black/60 backdrop-blur-md text-white text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1">
                        <ImageIcon className="w-3 h-3" />
                        <span>{activeImageIndex + 1} / {imagesList.length}</span>
                      </span>
                      <button
                        type="button"
                        onClick={() => setShowLightbox(true)}
                        title="Fullscreen preview"
                        className="bg-white/90 hover:bg-white text-zinc-800 p-1.5 rounded-full shadow-sm transition-transform hover:scale-110 cursor-pointer"
                      >
                        <Maximize2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>

              </div>

              {/* ─────────────────────────────────────────────────────────────
                  EXACT UI FROM SCREENSHOT 1:
                  COLOR PICKER, SIZE SELECTOR, QUANTITY & PILL ACTION BUTTONS
              ───────────────────────────────────────────────────────────── */}
              <div className="bg-white p-6 sm:p-7 rounded-3xl border border-zinc-200 shadow-xs space-y-6">
                
                <div className="flex items-center justify-between border-b border-zinc-100 pb-3">
                  <span className="text-[10px] font-bold tracking-[0.2em] text-zinc-400 uppercase">
                    Buyer Experience Simulator
                  </span>
                  <span className="text-[10px] font-semibold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                    Live UI Preview
                  </span>
                </div>

                {/* 1. COLOR SECTION MATCHING SCREENSHOT 1 */}
                <div>
                  <div className="flex items-center gap-1.5 text-xs font-extrabold tracking-wider uppercase text-zinc-900 mb-2.5">
                    <span>COLOR:</span>
                    <span className="text-zinc-500 font-semibold">{selectedColor.name}</span>
                  </div>

                  <div className="flex items-center gap-3">
                    {COLORS.map((col) => {
                      const isSelected = selectedColor.id === col.id;
                      return (
                        <button
                          key={col.id}
                          type="button"
                          onClick={() => setSelectedColor(col)}
                          className={`w-9 h-9 rounded-full transition-all flex items-center justify-center cursor-pointer relative ${
                            isSelected
                              ? 'ring-2 ring-zinc-900 ring-offset-2 scale-105'
                              : 'opacity-80 hover:opacity-100 hover:scale-105'
                          }`}
                          style={{ backgroundColor: col.hex }}
                          title={col.name}
                        >
                          {isSelected && (
                            <Check className="w-4 h-4 text-white drop-shadow stroke-[2.5]" />
                          )}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* 2. SELECT SIZE & SIZE GUIDE MATCHING SCREENSHOT 1 */}
                <div>
                  <div className="flex justify-between items-center mb-2.5">
                    <div className="flex items-center gap-1.5 text-xs font-extrabold tracking-wider uppercase text-zinc-900">
                      <span>SELECT SIZE:</span>
                      <span className="text-zinc-500 font-semibold">{selectedSize}</span>
                    </div>

                    <button
                      type="button"
                      onClick={() => setShowSizeGuide(true)}
                      className="text-xs font-semibold text-zinc-500 hover:text-zinc-900 underline transition-colors cursor-pointer"
                    >
                      Size Guide
                    </button>
                  </div>

                  {/* Size Pill Buttons */}
                  <div className="flex flex-wrap gap-2.5">
                    {SIZES.map((sz) => {
                      const isSelected = selectedSize === sz;
                      const stockForSize = sizeStock[sz] || 0;
                      return (
                        <button
                          key={sz}
                          type="button"
                          onClick={() => setSelectedSize(sz)}
                          className={`px-5 py-2.5 rounded-full text-xs font-bold uppercase tracking-wider transition-all cursor-pointer relative ${
                            isSelected
                              ? 'bg-zinc-900 text-white shadow-xs'
                              : 'bg-white border border-zinc-200 text-zinc-700 hover:border-zinc-900 hover:text-zinc-900'
                          }`}
                        >
                          <span>{sz}</span>
                          {stockForSize === 0 && (
                            <span className="absolute -top-1 -right-1 bg-rose-500 text-white text-[7px] font-black px-1 rounded-full">
                              0
                            </span>
                          )}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* 3. QUANTITY COUNTER & ADD TO BAG PILL MATCHING SCREENSHOT 1 */}
                <div className="space-y-3 pt-1">
                  
                  <div className="flex gap-3">
                    
                    {/* [-  1  +] Quantity Counter Pill */}
                    <div className="flex items-center border border-zinc-200 rounded-full px-4 py-2.5 w-32 justify-between bg-white flex-shrink-0 shadow-xs">
                      <button
                        type="button"
                        onClick={() => setPreviewQuantity((q) => Math.max(1, q - 1))}
                        className="p-1 rounded-full hover:bg-zinc-100 text-zinc-700 transition-colors cursor-pointer"
                      >
                        <Minus className="w-3.5 h-3.5" />
                      </button>

                      <span className="font-bold text-sm text-zinc-900">{previewQuantity}</span>

                      <button
                        type="button"
                        onClick={() => setPreviewQuantity((q) => q + 1)}
                        className="p-1 rounded-full hover:bg-zinc-100 text-zinc-700 transition-colors cursor-pointer"
                      >
                        <Plus className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    {/* ADD TO BAG Primary Black Pill */}
                    <button
                      type="button"
                      onClick={() => showToast(`Simulated: Added ${previewQuantity} × ${editTitle} (Size ${selectedSize}) to bag`)}
                      className="editorial-black-pill flex-1 py-3 px-5 text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2 cursor-pointer shadow-md hover:shadow-lg transition-all"
                    >
                      <ShoppingBag className="w-4 h-4" />
                      <span>ADD TO BAG</span>
                    </button>

                  </div>

                  {/* 4. INSTANT CHECKOUT • BUY NOW Pill Matching Screenshot 1 */}
                  <button
                    type="button"
                    onClick={() => showToast('Simulated: Instant checkout flow triggered for buyer')}
                    className="editorial-secondary-pill w-full py-3 text-xs font-bold uppercase tracking-wider cursor-pointer shadow-xs hover:border-zinc-900 bg-white"
                  >
                    INSTANT CHECKOUT • BUY NOW
                  </button>

                </div>

              </div>

            </div>

            {/* ══════════════════════════════════════════════════════════════════════
                RIGHT COLUMN: INVENTORY & STOCK MANAGEMENT CONTROL CENTER
            ══════════════════════════════════════════════════════════════════════ */}
            <div className="lg:col-span-6 xl:col-span-6 flex flex-col space-y-6">
              
              {/* ── 1. INVENTORY SUMMARY METRIC TILES ── */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3.5">
                
                {/* Total Stock in Inventory */}
                <div className="bg-white p-4 rounded-2xl border border-zinc-200 shadow-xs flex flex-col justify-between">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-400 flex items-center gap-1">
                    <Package className="w-3.5 h-3.5 text-zinc-600" />
                    Total Inventory
                  </span>
                  <div className="mt-2 flex items-baseline gap-1.5">
                    <span className="font-heading font-black text-2xl sm:text-3xl text-zinc-900">
                      {totalStockCount}
                    </span>
                    <span className="text-[11px] font-bold text-zinc-500">Units</span>
                  </div>
                </div>

                {/* Stock Valuation */}
                <div className="bg-white p-4 rounded-2xl border border-zinc-200 shadow-xs flex flex-col justify-between">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-400 flex items-center gap-1">
                    <DollarSign className="w-3.5 h-3.5 text-zinc-600" />
                    Stock Value
                  </span>
                  <div className="mt-2">
                    <span className="font-heading font-black text-xl sm:text-2xl text-zinc-900">
                      {formatPrice(inventoryValuation)}
                    </span>
                  </div>
                </div>

                {/* Active Retail Price */}
                <div className="bg-white p-4 rounded-2xl border border-zinc-200 shadow-xs flex flex-col justify-between col-span-2 sm:col-span-1">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-400 flex items-center gap-1">
                    <TrendingUp className="w-3.5 h-3.5 text-zinc-600" />
                    Retail Unit Price
                  </span>
                  <div className="mt-2 flex items-baseline gap-1">
                    <span className="font-heading font-black text-xl sm:text-2xl text-zinc-900">
                      {formatPrice(editPriceAmount)}
                    </span>
                  </div>
                </div>

              </div>

              {/* ── 2. PER-SIZE STOCK ALLOCATION & MANAGEMENT PANEL ── */}
              <div className="bg-white p-6 sm:p-7 rounded-3xl border border-zinc-200 shadow-xs space-y-5">
                
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-zinc-100 pb-4">
                  <div>
                    <h3 className="font-heading font-black text-lg text-zinc-900 uppercase tracking-tight">
                      Size Stock Allocations
                    </h3>
                    <p className="text-xs text-zinc-500">
                      Set live inventory quantities available for each customer size.
                    </p>
                  </div>

                  {/* Bulk Actions Dropdown / Buttons */}
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => handleBulkRestock(10)}
                      className="px-3 py-1.5 rounded-full text-[11px] font-bold bg-zinc-100 hover:bg-zinc-200 text-zinc-800 transition-colors cursor-pointer"
                    >
                      +10 All
                    </button>
                    <button
                      type="button"
                      onClick={() => handleBulkRestock(25)}
                      className="px-3 py-1.5 rounded-full text-[11px] font-bold bg-zinc-100 hover:bg-zinc-200 text-zinc-800 transition-colors cursor-pointer"
                    >
                      +25 All
                    </button>
                    <button
                      type="button"
                      onClick={handleResetStock}
                      className="px-3 py-1.5 rounded-full text-[11px] font-bold bg-rose-50 hover:bg-rose-100 text-rose-700 transition-colors cursor-pointer"
                    >
                      Clear
                    </button>
                  </div>
                </div>

                {/* Per-Size Stepper Rows */}
                <div className="space-y-3">
                  {SIZES.map((sz) => {
                    const currentQty = sizeStock[sz] ?? 0;
                    return (
                      <div
                        key={sz}
                        className={`p-3.5 rounded-2xl border transition-all flex items-center justify-between gap-4 ${
                          currentQty === 0
                            ? 'bg-rose-50/40 border-rose-200/80'
                            : currentQty <= 5
                            ? 'bg-amber-50/40 border-amber-200/80'
                            : 'bg-zinc-50/70 border-zinc-200/80'
                        }`}
                      >
                        {/* Size Label & Status */}
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-xl bg-zinc-900 text-white font-heading font-black text-sm flex items-center justify-center shadow-xs">
                            {sz}
                          </div>

                          <div>
                            <div className="flex items-center gap-2">
                              <span className="text-xs font-bold text-zinc-900">
                                Size {sz} Garment Stock
                              </span>
                              <span className={`text-[9px] font-black uppercase px-2 py-0.5 rounded-full ${
                                currentQty === 0
                                  ? 'bg-rose-100 text-rose-800'
                                  : currentQty <= 5
                                  ? 'bg-amber-100 text-amber-800'
                                  : 'bg-emerald-100 text-emerald-800'
                              }`}>
                                {currentQty === 0 ? 'Out of Stock' : currentQty <= 5 ? 'Low Stock' : 'In Stock'}
                              </span>
                            </div>
                            <span className="text-[10px] text-zinc-400">
                              Estimated Value: {formatPrice(currentQty * editPriceAmount)}
                            </span>
                          </div>
                        </div>

                        {/* Quantity Stepper & Manual Input */}
                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => handleStockChange(sz, currentQty - 1)}
                            className="w-8 h-8 rounded-full bg-white border border-zinc-200 hover:bg-zinc-100 text-zinc-700 flex items-center justify-center transition-colors cursor-pointer shadow-xs"
                          >
                            <Minus className="w-3 h-3" />
                          </button>

                          <input
                            type="number"
                            min="0"
                            value={currentQty}
                            onChange={(e) => handleStockChange(sz, e.target.value)}
                            className="w-14 text-center font-heading font-bold text-sm bg-white border border-zinc-200 rounded-xl py-1.5 outline-none focus:border-zinc-900 shadow-xs"
                          />

                          <button
                            type="button"
                            onClick={() => handleStockChange(sz, currentQty + 1)}
                            className="w-8 h-8 rounded-full bg-white border border-zinc-200 hover:bg-zinc-100 text-zinc-700 flex items-center justify-center transition-colors cursor-pointer shadow-xs"
                          >
                            <Plus className="w-3 h-3" />
                          </button>
                        </div>

                      </div>
                    );
                  })}
                </div>

              </div>

              {/* ── 3. PRODUCT TITLE, PRICING & SPECIFICATIONS ── */}
              <div className="bg-white p-6 sm:p-7 rounded-3xl border border-zinc-200 shadow-xs space-y-5">
                
                <h3 className="font-heading font-black text-lg text-zinc-900 uppercase tracking-tight border-b border-zinc-100 pb-3">
                  Garment Details &amp; Pricing
                </h3>

                {/* Title Input */}
                <div>
                  <label className="text-[10px] font-extrabold uppercase tracking-wider text-zinc-400 block mb-1.5">
                    Product Title
                  </label>
                  <input
                    type="text"
                    value={editTitle}
                    onChange={(e) => setEditTitle(e.target.value)}
                    placeholder="e.g. Obsidian Tech-Trench"
                    className="w-full bg-zinc-50 border border-zinc-200 rounded-xl px-4 py-2.5 text-sm font-bold text-zinc-900 outline-none focus:border-zinc-900 transition-colors"
                  />
                </div>

                {/* Price & Currency Controls */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-[10px] font-extrabold uppercase tracking-wider text-zinc-400 block mb-1.5">
                      Retail Price (Amount)
                    </label>
                    <div className="relative">
                      <input
                        type="number"
                        min="0"
                        value={editPriceAmount}
                        onChange={(e) => setEditPriceAmount(Number(e.target.value))}
                        className="w-full bg-zinc-50 border border-zinc-200 rounded-xl pl-8 pr-4 py-2.5 text-sm font-bold text-zinc-900 outline-none focus:border-zinc-900 transition-colors"
                      />
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 font-bold text-xs text-zinc-400">
                        ₹
                      </span>
                    </div>
                  </div>

                  <div>
                    <label className="text-[10px] font-extrabold uppercase tracking-wider text-zinc-400 block mb-1.5">
                      Currency
                    </label>
                    <select
                      value={editPriceCurrency}
                      onChange={(e) => setEditPriceCurrency(e.target.value)}
                      className="w-full bg-zinc-50 border border-zinc-200 rounded-xl px-4 py-2.5 text-sm font-bold text-zinc-900 outline-none focus:border-zinc-900 transition-colors cursor-pointer"
                    >
                      <option value="INR">INR (₹) - Indian Rupee</option>
                      <option value="USD">USD ($) - US Dollar</option>
                      <option value="EUR">EUR (€) - Euro</option>
                      <option value="GBP">GBP (£) - British Pound</option>
                    </select>
                  </div>
                </div>

                {/* Description & Fabric Specs */}
                <div>
                  <label className="text-[10px] font-extrabold uppercase tracking-wider text-zinc-400 block mb-1.5">
                    Garment Description &amp; Technical Specifications
                  </label>
                  <textarea
                    rows={4}
                    value={editDescription}
                    onChange={(e) => setEditDescription(e.target.value)}
                    placeholder="Enter fabric composition, GSM, cuts, tailoring..."
                    className="w-full bg-zinc-50 border border-zinc-200 rounded-xl p-4 text-xs sm:text-sm text-zinc-700 outline-none focus:border-zinc-900 transition-colors leading-relaxed"
                  />
                </div>

              </div>

              {/* ── 4. RECENT INVENTORY ACTIVITY LOG ── */}
              <div className="bg-white p-6 rounded-3xl border border-zinc-200 shadow-xs space-y-4">
                <div className="flex items-center justify-between border-b border-zinc-100 pb-3">
                  <div className="flex items-center gap-2">
                    <History className="w-4 h-4 text-zinc-600" />
                    <h4 className="text-xs font-bold uppercase tracking-wider text-zinc-900">
                      Recent Stock &amp; Audit Activity
                    </h4>
                  </div>
                  <span className="text-[10px] text-zinc-400 font-semibold">Live Event Log</span>
                </div>

                <div className="space-y-2.5">
                  {activityLogs.map((log) => (
                    <div
                      key={log.id}
                      className="flex items-start justify-between text-xs py-1.5 border-b border-zinc-100 last:border-0"
                    >
                      <div className="flex items-center gap-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-zinc-900 mt-0.5 flex-shrink-0"></span>
                        <span className="text-zinc-700 font-medium">{log.text}</span>
                      </div>
                      <span className="text-[10px] text-zinc-400 whitespace-nowrap ml-2">{log.time}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* ── 5. SAVE CHANGES STICKY CALL-TO-ACTION ── */}
              <div className="bg-white p-5 rounded-3xl border border-zinc-200 shadow-lg flex flex-col sm:flex-row items-center justify-between gap-4 sticky bottom-6 z-30">
                <div className="flex items-center gap-3 w-full sm:w-auto">
                  <div className="w-10 h-10 rounded-full bg-zinc-900 text-white flex items-center justify-center flex-shrink-0 shadow-xs">
                    <Save className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold uppercase tracking-wider text-zinc-900">
                      Ready to Publish Updates?
                    </h4>
                    <p className="text-[11px] text-zinc-500">
                      Changes will reflect immediately across customer storefronts.
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3 w-full sm:w-auto">
                  <button
                    type="button"
                    onClick={() => navigate('/seller/products')}
                    className="editorial-secondary-pill flex-1 sm:flex-none px-5 py-3 text-xs font-bold uppercase tracking-wider cursor-pointer"
                  >
                    Cancel
                  </button>

                  <button
                    type="button"
                    onClick={handleSaveAll}
                    disabled={isSaving}
                    className="editorial-black-pill flex-1 sm:flex-none px-7 py-3 text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2 cursor-pointer shadow-md hover:shadow-xl disabled:opacity-50"
                  >
                    {isSaving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Check className="w-3.5 h-3.5" />}
                    <span>{isSaving ? 'Publishing...' : 'Save & Publish'}</span>
                  </button>
                </div>
              </div>

            </div>

          </div>
        )}

      </main>

      {/* ═══════════════════════ LIGHTBOX FULLSCREEN ZOOM MODAL ═══════════════════════ */}
      {showLightbox && (
        <div
          onClick={() => setShowLightbox(false)}
          className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex items-center justify-center p-4 animate-fade-in"
        >
          <button
            onClick={() => setShowLightbox(false)}
            className="absolute top-5 right-5 w-10 h-10 rounded-full bg-white/20 hover:bg-white text-white hover:text-black flex items-center justify-center transition-colors cursor-pointer z-50"
          >
            <X className="w-5 h-5" />
          </button>

          <div
            onClick={(e) => e.stopPropagation()}
            className="relative max-w-4xl max-h-[85vh] w-full flex items-center justify-center"
          >
            <img
              src={imagesList[activeImageIndex]}
              alt="High-Res Zoom View"
              className="max-h-[80vh] w-auto object-contain rounded-2xl shadow-2xl"
            />

            {imagesList.length > 1 && (
              <>
                <button
                  type="button"
                  onClick={() => setActiveImageIndex((prev) => (prev - 1 + imagesList.length) % imagesList.length)}
                  className="absolute left-2 w-10 h-10 rounded-full bg-white/80 hover:bg-white text-zinc-900 flex items-center justify-center shadow-lg transition-transform hover:scale-110 cursor-pointer"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>
                <button
                  type="button"
                  onClick={() => setActiveImageIndex((prev) => (prev + 1) % imagesList.length)}
                  className="absolute right-2 w-10 h-10 rounded-full bg-white/80 hover:bg-white text-zinc-900 flex items-center justify-center shadow-lg transition-transform hover:scale-110 cursor-pointer"
                >
                  <ChevronRight className="w-5 h-5" />
                </button>
              </>
            )}
          </div>
        </div>
      )}

      {/* ═══════════════════════ SIZE GUIDE MODAL ═══════════════════════ */}
      {showSizeGuide && (
        <div
          onClick={() => setShowSizeGuide(false)}
          className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 animate-fade-in"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="bg-white rounded-3xl max-w-md w-full p-6 sm:p-7 shadow-2xl border border-zinc-100 relative"
          >
            <button
              type="button"
              onClick={() => setShowSizeGuide(false)}
              className="absolute top-4 right-4 w-7 h-7 rounded-full bg-zinc-100 hover:bg-zinc-200 text-zinc-700 flex items-center justify-center transition-colors cursor-pointer"
            >
              <X className="w-3.5 h-3.5" />
            </button>

            <h3 className="font-heading font-black text-lg text-zinc-900 uppercase tracking-tight mb-1">
              Garment Measurement Matrix
            </h3>
            <p className="text-[11px] text-zinc-500 mb-4">
              Standardized tailoring inches for relaxed boxy couture fit.
            </p>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-zinc-200 text-zinc-400 uppercase tracking-wider font-bold text-[10px]">
                    <th className="py-2 px-2.5">Size</th>
                    <th className="py-2 px-2.5">Chest</th>
                    <th className="py-2 px-2.5">Shoulder</th>
                    <th className="py-2 px-2.5">Length</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-100 text-zinc-800 font-medium">
                  <tr>
                    <td className="py-2 px-2.5 font-bold">S</td>
                    <td className="py-2 px-2.5">38-40"</td>
                    <td className="py-2 px-2.5">18.5"</td>
                    <td className="py-2 px-2.5">28"</td>
                  </tr>
                  <tr className="bg-zinc-50">
                    <td className="py-2 px-2.5 font-bold">M</td>
                    <td className="py-2 px-2.5">40-42"</td>
                    <td className="py-2.5 px-2.5">19.5"</td>
                    <td className="py-2.5 px-2.5">29"</td>
                  </tr>
                  <tr>
                    <td className="py-2 px-2.5 font-bold">L</td>
                    <td className="py-2 px-2.5">42-44"</td>
                    <td className="py-2.5 px-2.5">20.5"</td>
                    <td className="py-2.5 px-2.5">30"</td>
                  </tr>
                  <tr className="bg-zinc-50">
                    <td className="py-2 px-2.5 font-bold">XL</td>
                    <td className="py-2 px-2.5">44-46"</td>
                    <td className="py-2.5 px-2.5">21.5"</td>
                    <td className="py-2.5 px-2.5">31"</td>
                  </tr>
                  <tr>
                    <td className="py-2 px-2.5 font-bold">XXL</td>
                    <td className="py-2.5 px-2.5">46-48"</td>
                    <td className="py-2.5 px-2.5">22.5"</td>
                    <td className="py-2.5 px-2.5">32"</td>
                  </tr>
                </tbody>
              </table>
            </div>

            <button
              type="button"
              onClick={() => setShowSizeGuide(false)}
              className="editorial-black-pill w-full mt-5 py-2.5 text-xs uppercase tracking-wider cursor-pointer"
            >
              Dismiss
            </button>
          </div>
        </div>
      )}

      {/* ═══════════════════════ FOOTER ═══════════════════════ */}
      <footer className="bg-white border-t border-zinc-200/80 w-full mt-auto">
        <div className="flex flex-col items-center gap-4 py-8 px-6 sm:px-8 w-full max-w-[1440px] mx-auto">
          <div>
            <span className="font-heading text-lg font-bold tracking-[0.2em] text-zinc-900 uppercase">
              S N I T C H
            </span>
          </div>

          <div className="flex items-center gap-1 text-[10px] text-zinc-400 font-semibold tracking-wider uppercase">
            <ShieldCheck className="w-3.5 h-3.5 text-zinc-600" />
            <span>Snitch Merchant Protocol • Encrypted Inventory Gateway</span>
          </div>
        </div>
      </footer>

    </div>
  );
}
