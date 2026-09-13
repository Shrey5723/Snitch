import React, { useState, useEffect, useMemo } from 'react';
import { useParams, Link, useNavigate } from 'react-router';
import { useSelector, useDispatch } from 'react-redux';
import { addToCart } from '../state/cart.slice.js';
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
  Check,
  CheckCircle2,
  Minus,
  Plus,
  Loader2,
  X,
  Maximize2,
  Image as ImageIcon
} from 'lucide-react';
import useProduct from '../Hooks/useProduct.js';

const SIZES = ['S', 'M', 'L', 'XL', 'XXL'];

const COLORS = [
  { name: 'Obsidian Black', hex: '#18181b' },
  { name: 'Charcoal Grey', hex: '#3f3f46' },
  { name: 'Concrete Stone', hex: '#a1a1aa' }
];

export default function ProductDetail() {
  const { productId } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { currentProduct, loading, handleGetProductById, products, handleGetProducts } = useProduct();
  const { user, isAuthenticated } = useSelector((state) => state.auth || {});
  const cartItems = useSelector((state) => state.cart?.items || []);
  const cartCount = cartItems.length;

  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [selectedSize, setSelectedSize] = useState('M');
  const [selectedColor, setSelectedColor] = useState(COLORS[0]);
  const [quantity, setQuantity] = useState(1);
  const [isWishlisted, setIsWishlisted] = useState(false);

  const [toastMessage, setToastMessage] = useState(null);
  const [showSizeGuide, setShowSizeGuide] = useState(false);
  const [showLightbox, setShowLightbox] = useState(false);

  // Fetch product on load
  useEffect(() => {
    setActiveImageIndex(0);
    if (productId) {
      handleGetProductById(productId);
    }
    handleGetProducts();
  }, [productId]);

  // Resolve product data
  const product = useMemo(() => {
    if (currentProduct && currentProduct._id === productId) {
      return currentProduct;
    }
    return currentProduct || null;
  }, [productId, currentProduct]);



  const formatPrice = (price) => {
    if (!price) return '₹0';
    const amount = typeof price === 'object' ? price.amount : price;
    const currency = (typeof price === 'object' ? price.currency : 'INR') || 'INR';
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: currency,
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount || 0);
  };

  // Up to 7 photos support
  const imagesList = useMemo(() => {
    if (product?.images && product.images.length > 0) {
      return product.images.slice(0, 7).map((img) => (typeof img === 'string' ? img : img.url));
    }
    return [
      'https://lh3.googleusercontent.com/aida-public/AB6AXuCBx6WMWY_7ZVpiDmf6kJYkIgvC6nN6nsqi72feb6NglDYi0sDBipqXsM3G-g_8ERRGGu8Qv0Jhm05_UWY2jXySZF4x5_-jIlv1lh--G9avzDDECEbadt_FmzkzRWlvQiQiKPFg6j50NuAJcIaXszHtgwU_hsUrHIqS_eOwBEGexTlNKHJRZw0sqcpA1DMoUX5tHgSrvKLfrA1L_vJ-DqEthmJLiZqYQIjlJF9vJoTSwlFGnsWRT8I28UannZ4jsF_4jP5sgj-iadM'
    ];
  }, [product]);

  const handleAddToCart = () => {
    dispatch(addToCart({ product, quantity, size: selectedSize, color: selectedColor.name }));
    setToastMessage(`Added ${quantity} × ${product.title} (Size ${selectedSize}) to bag`);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const handleShare = () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(window.location.href);
      setToastMessage('Product link copied to clipboard');
      setTimeout(() => setToastMessage(null), 2500);
    }
  };

  const nextImage = () => {
    setActiveImageIndex((prev) => (prev + 1) % imagesList.length);
  };

  const prevImage = () => {
    setActiveImageIndex((prev) => (prev - 1 + imagesList.length) % imagesList.length);
  };



  return (
    <div className="h-dvh bg-white text-zinc-900 font-body select-none flex flex-col overflow-hidden">

      {/* ═══════════════════════ TOAST NOTIFICATION ═══════════════════════ */}
      {toastMessage && (
        <div className="fixed top-16 right-4 z-50 animate-fade-in bg-zinc-900 text-white px-4 py-2.5 rounded-2xl shadow-2xl flex items-center gap-2.5 border border-zinc-800">
          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0" />
          <span className="text-[11px] font-semibold">{toastMessage}</span>
        </div>
      )}

      {/* ═══════════════════════ COMPACT HEADER ═══════════════════════ */}
      <header className="bg-white/95 backdrop-blur-md border-b border-zinc-100 z-40 w-full flex-shrink-0">
        <div className="flex justify-between items-center px-3 sm:px-6 lg:px-8 h-12 sm:h-14 lg:h-16 w-full max-w-[1440px] mx-auto relative">
          
          {/* Back to Shop */}
          <Link
            to="/"
            className="p-1.5 rounded-full hover:bg-zinc-100 text-zinc-700 transition-colors flex items-center gap-1 text-[11px] font-semibold uppercase tracking-wider"
          >
            <ChevronLeft className="w-4 h-4" />
            <span className="hidden sm:inline">Back to Shop</span>
          </Link>

          {/* Centered Brand Logo */}
          <div className="flex flex-col items-center justify-center absolute left-1/2 transform -translate-x-1/2">
            <Link to="/" className="inline-block group text-center">
              <h1 className="font-heading font-black text-[18px] sm:text-[22px] lg:text-[26px] tracking-[0.35em] text-zinc-900 uppercase leading-none">
                S N I T C H
              </h1>
              <p className="text-[7px] sm:text-[8px] font-semibold tracking-[0.25em] text-zinc-400 uppercase mt-0.5 hidden sm:block">
                CLOTHING &amp; APPAREL
              </p>
            </Link>
          </div>

          {/* Right Action Icons */}
          <div className="flex items-center gap-1.5 sm:gap-3">
            <button
              onClick={handleShare}
              title="Share link"
              className="p-1.5 rounded-full hover:bg-zinc-100 text-zinc-800 transition-colors cursor-pointer"
            >
              <Share2 className="w-4 h-4" />
            </button>

            <button
              onClick={() => setIsWishlisted(!isWishlisted)}
              title={isWishlisted ? 'Saved in wishlist' : 'Save to wishlist'}
              className="p-1.5 rounded-full hover:bg-zinc-100 text-zinc-800 transition-colors cursor-pointer"
            >
              <Heart className={`w-4 h-4 ${isWishlisted ? 'fill-rose-500 text-rose-500' : ''}`} />
            </button>

            <Link
              to="/cart"
              aria-label="Shopping Bag"
              className="p-1.5 rounded-full hover:bg-zinc-100 text-zinc-800 transition-colors relative"
            >
              <ShoppingBag className="w-4 h-4" />
              {cartCount > 0 && (
                <span className="absolute -top-0.5 -right-0.5 bg-zinc-900 text-white text-[9px] font-bold rounded-full w-3.5 h-3.5 flex items-center justify-center animate-fade-in">
                  {cartCount}
                </span>
              )}
            </Link>
          </div>

        </div>
      </header>

      {/* ═══════════════════════ MAIN PRODUCT CONTENT (fills remaining viewport) ═══════════════════════ */}
      <main className="flex-1 max-w-[1440px] mx-auto px-3 sm:px-5 lg:px-8 py-2 sm:py-3 w-full flex flex-col overflow-hidden min-h-0">
        
        {/* BREADCRUMBS — desktop only */}
        <div className="hidden sm:flex items-center text-[10px] font-semibold text-zinc-400 mb-2 gap-1.5 uppercase tracking-widest flex-shrink-0">
          <Link to="/" className="hover:text-zinc-900 transition-colors">Home</Link>
          <ChevronRight className="w-3 h-3 text-zinc-300" />
          <span className="hover:text-zinc-900 transition-colors">{product?.category || 'Apparel'}</span>
          <ChevronRight className="w-3 h-3 text-zinc-300" />
          <span className="text-zinc-900 font-bold truncate max-w-[200px]">{product?.title}</span>
        </div>

        {/* LOADING STATE */}
        {loading && (
          <div className="flex-1 flex items-center justify-center">
            <Loader2 className="w-8 h-8 animate-spin text-zinc-400" />
            <span className="ml-3 text-zinc-500 font-medium text-sm">Loading...</span>
          </div>
        )}

        {/* PRODUCT NOT FOUND STATE */}
        {!loading && !product && (
          <div className="flex-1 flex flex-col items-center justify-center text-center">
            <ShoppingBag className="w-16 h-16 text-zinc-300 stroke-1 mb-4" />
            <h2 className="font-heading text-xl font-bold text-zinc-900 mb-2">Product Not Found</h2>
            <p className="text-zinc-500 text-sm max-w-sm mb-6">
              The garment you are looking for does not exist or has been removed from the catalog.
            </p>
            <Link to="/" className="editorial-black-pill px-6 py-2.5 text-xs font-bold uppercase tracking-wider">
              Return to Collections
            </Link>
          </div>
        )}

        {/* ═══════════ VIEWPORT-FIT PRODUCT SHOWCASE ═══════════ */}
        {!loading && product && (
          <section className="flex-1 grid grid-cols-1 lg:grid-cols-12 gap-3 sm:gap-4 lg:gap-6 xl:gap-8 min-h-0 overflow-hidden">
            
            {/* ────── LEFT COLUMN: IMAGE GALLERY ────── */}
            <div className="lg:col-span-7 flex flex-col sm:flex-row gap-2 sm:gap-3 min-h-0 overflow-hidden">
              
              {/* Thumbnail Strip — hidden on small mobile, vertical on sm+ */}
              {imagesList.length > 1 && (
                <div className="hidden sm:flex sm:flex-col gap-1.5 overflow-y-auto max-h-full w-14 lg:w-16 scrollbar-none flex-shrink-0">
                  {imagesList.map((imgUrl, index) => (
                    <button
                      key={index}
                      type="button"
                      onClick={() => setActiveImageIndex(index)}
                      className={`relative aspect-[3/4] w-full rounded-lg overflow-hidden border-2 flex-shrink-0 transition-all cursor-pointer bg-zinc-100 ${
                        activeImageIndex === index
                          ? 'border-zinc-900 shadow-sm ring-1 ring-zinc-900'
                          : 'border-zinc-200/80 opacity-60 hover:opacity-100 hover:border-zinc-400'
                      }`}
                    >
                      <img
                        src={imgUrl}
                        alt={`Photo ${index + 1}`}
                        className="w-full h-full object-cover object-center"
                      />
                      <span className="absolute bottom-0.5 right-0.5 text-[7px] font-bold text-white bg-black/50 px-0.5 rounded">
                        {index + 1}
                      </span>
                    </button>
                  ))}
                </div>
              )}

              {/* Main Hero Image */}
              <div className="flex-1 w-full relative rounded-xl sm:rounded-2xl overflow-hidden bg-zinc-100 border border-zinc-100 group min-h-0">
                
                <div className="w-full h-full flex items-center justify-center overflow-hidden relative">
                  <img
                    src={imagesList[activeImageIndex] || imagesList[0]}
                    alt={product?.title}
                    className="w-full h-full object-cover object-center transition-transform duration-500 group-hover:scale-105"
                  />

                  {/* Badges Overlay */}
                  <div className="absolute top-2 left-2 flex items-center gap-1 pointer-events-none">
                    <span className="bg-zinc-900 text-white text-[8px] font-black uppercase tracking-widest px-2 py-0.5 rounded-md">
                      FW '24 DROP
                    </span>
                    <span className="bg-white/90 backdrop-blur-md text-zinc-900 text-[8px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md border border-zinc-200/80">
                      100% Authentic
                    </span>
                  </div>

                  {/* Carousel Arrows */}
                  {imagesList.length > 1 && (
                    <>
                      <button
                        type="button"
                        onClick={(e) => { e.stopPropagation(); prevImage(); }}
                        title="Previous photo"
                        className="absolute left-2 top-1/2 -translate-y-1/2 w-7 h-7 rounded-full bg-white/90 hover:bg-white text-zinc-800 flex items-center justify-center shadow-md opacity-0 group-hover:opacity-100 transition-all cursor-pointer"
                      >
                        <ChevronLeft className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={(e) => { e.stopPropagation(); nextImage(); }}
                        title="Next photo"
                        className="absolute right-2 top-1/2 -translate-y-1/2 w-7 h-7 rounded-full bg-white/90 hover:bg-white text-zinc-800 flex items-center justify-center shadow-md opacity-0 group-hover:opacity-100 transition-all cursor-pointer"
                      >
                        <ChevronRight className="w-3.5 h-3.5" />
                      </button>
                    </>
                  )}

                  {/* Image Counter & Fullscreen */}
                  <div className="absolute bottom-2 right-2 flex items-center gap-1.5">
                    {imagesList.length > 1 && (
                      <span className="bg-black/60 backdrop-blur-md text-white text-[9px] font-bold px-1.5 py-0.5 rounded-full flex items-center gap-1">
                        <ImageIcon className="w-2.5 h-2.5" />
                        <span>{activeImageIndex + 1}/{imagesList.length}</span>
                      </span>
                    )}
                    <button
                      type="button"
                      onClick={() => setShowLightbox(true)}
                      title="Fullscreen zoom"
                      className="bg-white/90 hover:bg-white text-zinc-800 p-1 rounded-full shadow-sm transition-transform hover:scale-110 cursor-pointer"
                    >
                      <Maximize2 className="w-3 h-3" />
                    </button>
                  </div>

                  {/* Mobile dot indicators */}
                  {imagesList.length > 1 && (
                    <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1 sm:hidden">
                      {imagesList.map((_, i) => (
                        <button
                          key={i}
                          onClick={() => setActiveImageIndex(i)}
                          className={`w-1.5 h-1.5 rounded-full transition-all cursor-pointer ${
                            i === activeImageIndex ? 'bg-zinc-900 w-3' : 'bg-zinc-400/60'
                          }`}
                        />
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* ────── RIGHT COLUMN: COMPACT BUY BOX ────── */}
            <div className="lg:col-span-5 flex flex-col justify-start gap-1.5 sm:gap-2 lg:gap-2.5 min-h-0 overflow-y-auto scrollbar-none">
              
              {/* Brand + Seller */}
              <div className="flex items-center justify-between text-[9px] sm:text-[10px] font-bold tracking-[0.15em] text-zinc-400 uppercase">
                <span>S N I T C H • {product?.category || 'COLLECTION'}</span>
                {product?.seller?.fullName && (
                  <span className="text-zinc-600 font-medium">By {product.seller.fullName}</span>
                )}
              </div>

              {/* Title */}
              <h1 className="font-heading font-black text-lg sm:text-xl lg:text-2xl text-zinc-900 leading-tight">
                {product?.title}
              </h1>

              {/* Price & Rating */}
              <div className="flex items-center justify-between gap-2 pb-1.5 border-b border-zinc-100">
                <div className="flex items-baseline gap-1.5">
                  <span className="font-heading font-black text-xl sm:text-2xl text-zinc-900">
                    {formatPrice(product?.price)}
                  </span>
                  <span className="text-[9px] text-zinc-400 font-medium uppercase tracking-wider">
                    Tax Included
                  </span>
                </div>
                <div className="flex items-center gap-1 bg-zinc-50 border border-zinc-200/80 px-2 py-0.5 rounded-full">
                  <div className="flex text-amber-400">
                    {[1, 2, 3, 4, 5].map((s) => (
                      <Star key={s} className="w-2.5 h-2.5 fill-amber-400 text-amber-400" />
                    ))}
                  </div>
                  <span className="text-[10px] font-bold text-zinc-800">4.9</span>
                  <span className="text-[9px] text-zinc-400 font-medium">(128)</span>
                </div>
              </div>

              {/* Short Description */}
              <p className="text-[11px] sm:text-xs text-zinc-600 leading-relaxed line-clamp-2">
                {product?.description ||
                  'Precision-crafted tailored streetwear designed with high-density fabric composition and structural seam architecture.'}
              </p>

              {/* Color Selection */}
              <div>
                <div className="flex justify-between items-center mb-1 text-[10px] sm:text-[11px] font-bold tracking-wider uppercase text-zinc-800">
                  <span>Color: <span className="text-zinc-500 font-medium">{selectedColor.name}</span></span>
                </div>
                <div className="flex gap-2">
                  {COLORS.map((col) => (
                    <button
                      key={col.name}
                      type="button"
                      onClick={() => setSelectedColor(col)}
                      className={`w-7 h-7 rounded-full transition-all flex items-center justify-center cursor-pointer ${
                        selectedColor.name === col.name
                          ? 'ring-2 ring-zinc-900 ring-offset-1 scale-105'
                          : 'opacity-80 hover:opacity-100 hover:scale-105'
                      }`}
                      style={{ backgroundColor: col.hex }}
                      title={col.name}
                    >
                      {selectedColor.name === col.name && (
                        <Check className="w-3 h-3 text-white drop-shadow" />
                      )}
                    </button>
                  ))}
                </div>
              </div>

              {/* Size Selector */}
              <div>
                <div className="flex justify-between items-center mb-1">
                  <span className="text-[10px] sm:text-[11px] font-bold tracking-wider uppercase text-zinc-800">
                    Select Size: <span className="text-zinc-500 font-medium">{selectedSize}</span>
                  </span>
                  <button
                    type="button"
                    onClick={() => setShowSizeGuide(true)}
                    className="text-[10px] font-semibold text-zinc-500 hover:text-zinc-900 underline transition-colors cursor-pointer"
                  >
                    Size Guide
                  </button>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {SIZES.map((size) => (
                    <button
                      key={size}
                      type="button"
                      onClick={() => setSelectedSize(size)}
                      className={`px-3 sm:px-4 py-1.5 rounded-full text-[10px] sm:text-[11px] font-bold uppercase tracking-wider transition-all cursor-pointer ${
                        selectedSize === size
                          ? 'bg-zinc-900 text-white shadow-xs'
                          : 'bg-white border border-zinc-200 text-zinc-700 hover:border-zinc-900 hover:text-zinc-900'
                      }`}
                    >
                      {size}
                    </button>
                  ))}
                </div>
              </div>

              {/* Quantity + Add to Bag */}
              <div className="space-y-1.5 pt-0.5">
                <div className="flex gap-2">
                  {/* Quantity */}
                  <div className="flex items-center border border-zinc-200/90 rounded-full px-2.5 py-1.5 w-24 sm:w-28 justify-between bg-zinc-50/60 flex-shrink-0">
                    <button
                      type="button"
                      onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                      className="p-0.5 rounded-full hover:bg-zinc-200 text-zinc-700 transition-colors cursor-pointer"
                    >
                      <Minus className="w-3 h-3" />
                    </button>
                    <span className="font-bold text-xs text-zinc-900">{quantity}</span>
                    <button
                      type="button"
                      onClick={() => setQuantity((q) => q + 1)}
                      className="p-0.5 rounded-full hover:bg-zinc-200 text-zinc-700 transition-colors cursor-pointer"
                    >
                      <Plus className="w-3 h-3" />
                    </button>
                  </div>

                  {/* Add to Bag */}
                  <button
                    type="button"
                    onClick={handleAddToCart}
                    className="editorial-black-pill flex-1 py-2.5 px-3 text-[11px] uppercase tracking-wider flex items-center justify-center gap-1.5 cursor-pointer shadow-md hover:shadow-lg transition-all"
                  >
                    <ShoppingBag className="w-3.5 h-3.5" />
                    <span>Add To Bag</span>
                  </button>
                </div>

                {/* Instant Checkout */}
                <button
                  type="button"
                  onClick={() => {
                    handleAddToCart();
                    setToastMessage('Redirecting to express checkout...');
                  }}
                  className="editorial-secondary-pill w-full py-2 text-[11px] font-bold uppercase tracking-wider cursor-pointer shadow-xs hover:border-zinc-900"
                >
                  Instant Checkout • Buy Now
                </button>
              </div>

              {/* Trust Badges */}
              <div className="grid grid-cols-3 gap-1 py-1.5 px-2 bg-zinc-50/70 border border-zinc-200/60 rounded-lg text-center text-[9px] sm:text-[10px] font-medium text-zinc-600">
                <div className="flex flex-col items-center gap-0.5">
                  <Truck className="w-3 h-3 text-zinc-800" />
                  <span>Free Express Delivery</span>
                </div>
                <div className="flex flex-col items-center gap-0.5 border-x border-zinc-200/80 px-1">
                  <RotateCcw className="w-3 h-3 text-zinc-800" />
                  <span>14-Day Easy Returns</span>
                </div>
                <div className="flex flex-col items-center gap-0.5">
                  <ShieldCheck className="w-3 h-3 text-zinc-800" />
                  <span>Certified Authentic</span>
                </div>
              </div>

            </div>

          </section>
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
                  onClick={prevImage}
                  className="absolute left-2 w-10 h-10 rounded-full bg-white/80 hover:bg-white text-zinc-900 flex items-center justify-center shadow-lg transition-transform hover:scale-110 cursor-pointer"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>
                <button
                  type="button"
                  onClick={nextImage}
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
              Size &amp; Measurement Guide
            </h3>
            <p className="text-[11px] text-zinc-500 mb-4">
              All garment measurements are listed in inches for standard relaxed fit.
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
                    <td className="py-2.5 px-2.5">44-46"</td>
                    <td className="py-2.5 px-2.5">21.5"</td>
                    <td className="py-2.5 px-2.5">31"</td>
                  </tr>
                  <tr>
                    <td className="py-2.5 px-2.5 font-bold">XXL</td>
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
              Close
            </button>
          </div>
        </div>
      )}

    </div>
  );
}

