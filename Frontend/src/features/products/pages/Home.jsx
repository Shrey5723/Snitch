import React, { useState, useEffect, useMemo } from "react";
import { useSelector } from 'react-redux';
import { useProduct } from '../Hooks/useProduct';
import { Link } from 'react-router';
import {
    Search,
    User,
    ShoppingBag,
    Loader2,
    ArrowRight,
    ChevronRight,
    ShieldCheck,
    X,
    Eye,
    CheckCircle2,
    Sparkles,
    Star,
    Plus
} from 'lucide-react';

const CATEGORIES = ['View All', 'Shirts', 'Jackets', 'Pants', 'Sneakers', 'Accessories'];

// Curated high-fashion items for fallback display if database is empty
const CURATED_FEATURED_PRODUCTS = [
    {
        _id: 'sample-1',
        title: 'Obsidian Tech-Trench',
        description: 'Water-resistant matte structural trench coat engineered with modular storm flap and magnetic closures.',
        price: { amount: 3499, currency: 'INR' },
        category: 'Jackets',
        tag: 'New',
        images: [{
            url: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCBx6WMWY_7ZVpiDmf6kJYkIgvC6nN6nsqi72feb6NglDYi0sDBipqXsM3G-g_8ERRGGu8Qv0Jhm05_UWY2jXySZF4x5_-jIlv1lh--G9avzDDECEbadt_FmzkzRWlvQiQiKPFg6j50NuAJcIaXszHtgwU_hsUrHIqS_eOwBEGexTlNKHJRZw0sqcpA1DMoUX5tHgSrvKLfrA1L_vJ-DqEthmJLiZqYQIjlJF9vJoTSwlFGnsWRT8I28UannZ4jsF_4jP5sgj-iadM',
            alt: 'Obsidian Tech-Trench'
        }]
    },
    {
        _id: 'sample-2',
        title: 'K-7 Tactical Cargos',
        description: 'Relaxed-fit dark charcoal cargo trousers crafted with reinforced knee gussets and heavy matte alloy D-rings.',
        price: { amount: 2899, currency: 'INR' },
        category: 'Pants',
        tag: 'Popular',
        images: [{
            url: 'https://lh3.googleusercontent.com/aida-public/AB6AXuD5NOCw31t9aMh2_BrktGvvv_dKZWRz1F0LeNQfEAymgSz3Ys20e5O-vSIWrdB0yNt_Ij6EcZCpjMPYHjEZE6qREVm2BPQlOTqj6NrtjSM6n0gjSw3iu9kyaA1pqJ_K-MXh9tTFGCfe1BWd6MDpN-LMh6G-w-sbYkZ9ZCY4N2nonCTRNBVxBbh8rKdpvB9mXMopJkydwBNYI6dN-H-GfzfN-5TYIWX366fc2u8aA7YIqd0NvoBItNygvIhPZSabHX_RtH-0RrnHIpY',
            alt: 'K-7 Tactical Cargos'
        }]
    },
    {
        _id: 'sample-3',
        title: 'Aero Structural Hoodie',
        description: 'Architectural heavyweight 480 GSM organic cotton french terry hoodie with geometric darting and hidden kangaroo pocket.',
        price: { amount: 2499, currency: 'INR' },
        category: 'Shirts',
        tag: 'Bestseller',
        images: [{
            url: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDqk48LGvYAe08YSncloaCRvM2BSDKrIb7p6G31gQJ0T0Y_OwJWnhtAHvkemK4e839JWkvlJbfWqXETGEBbgy5TuODzDjUau8iJObTa4693nLngDU8ThcPKJsVL15ixbqjJ-9ltVJW421cl7BG7e8ydIVmLEdBrUKo-IMwAlefjYUiQDJLB0wfpfP69akna7UuJxc3LTYPplHiK7444REdwW4_lNEJ_9TeIeWcwvqQIMiWJ1Ye6YFLPScby5a1Ebr3OnQeadV-NoTo',
            alt: 'Aero Structural Hoodie'
        }]
    },
    {
        _id: 'sample-4',
        title: 'Void Knit Sneakers',
        description: 'Sculptural sock-runner silhouettes with high-density EVA midsole, zero-lace dynamic elastic weave.',
        price: { amount: 4299, currency: 'INR' },
        category: 'Sneakers',
        tag: 'Exclusive',
        images: [{
            url: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAGnffq_FCaXv9XSJr3-fSdFU_kHLyJ3SGShlHFUCmo_fzdBx7KGkdgvzwoCs4EzgdMrEMA_rjB0a8qqm9WHWlGCLngpbJ18vaXqnv_7jRhrD2-jbN38wGqkWqR-joMcKFC5CjYvIn6Pkp2VRKrTJ13Pz4QhVDn-sCw95kPP5de8M5NKfQI5KpYa-EJOo-fCOZSLHYjsagjXzH3Uun-mXMYp8cwooNwk9bkQ6JBPgYDb7RrGJUvKSI6cej6Rh6TYrgVf8setO1iXOQ',
            alt: 'Void Knit Sneakers'
        }]
    }
];

const Home = () => {
    const { products, loading, handleGetProducts } = useProduct();
    const { user, isAuthenticated } = useSelector(state => state.auth || {});
    const [activeCategory, setActiveCategory] = useState('View All');
    const [searchQuery, setSearchQuery] = useState('');
    const [showSearch, setShowSearch] = useState(false);
    const [selectedProduct, setSelectedProduct] = useState(null);
    const [cartCount, setCartCount] = useState(0);
    const [toastMessage, setToastMessage] = useState(null);

    useEffect(() => {
        handleGetProducts();
    }, []);

    // Combine database products with fallback featured products if empty
    const displayProducts = useMemo(() => {
        const list = (products && products.length > 0) ? products : CURATED_FEATURED_PRODUCTS;
        
        return list.filter((product) => {
            const matchesSearch =
                (product.title || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
                (product.description || '').toLowerCase().includes(searchQuery.toLowerCase());

            if (!matchesSearch) return false;

            if (activeCategory === 'View All') return true;

            const categoryMatch =
                (product.category || '').toLowerCase() === activeCategory.toLowerCase() ||
                (product.title || '').toLowerCase().includes(activeCategory.toLowerCase()) ||
                (product.description || '').toLowerCase().includes(activeCategory.toLowerCase());

            return categoryMatch;
        });
    }, [products, searchQuery, activeCategory]);

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

    const getProductImage = (product) => {
        if (product.images && product.images.length > 0) {
            const img = product.images[0];
            return typeof img === 'string' ? img : img?.url;
        }
        return null;
    };

    const handleAddToCart = (product, e) => {
        if (e) e.stopPropagation();
        setCartCount(prev => prev + 1);
        setToastMessage(`Added "${product.title}" to bag`);
        setTimeout(() => setToastMessage(null), 2500);
    };

    return (
        <div className="min-h-screen bg-white flex flex-col font-body select-none">

            {/* ═══════════════════════ TOAST NOTIFICATION ═══════════════════════ */}
            {toastMessage && (
                <div className="fixed top-24 right-6 z-50 animate-fade-in bg-zinc-900 text-white px-5 py-3 rounded-2xl shadow-xl flex items-center gap-3 border border-zinc-800">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                    <span className="text-xs font-semibold">{toastMessage}</span>
                </div>
            )}

            {/* ═══════════════════════ NAVIGATION ═══════════════════════ */}
            <header className="bg-white/95 backdrop-blur-md border-b border-zinc-100 sticky top-0 z-40 w-full transition-all duration-300">
                <div className="flex justify-between items-center px-6 sm:px-8 h-20 w-full max-w-[1440px] mx-auto relative">
                    {/* Left Nav Links */}
                    <nav className="hidden md:flex items-center gap-8">
                        <a href="#shop" className="text-zinc-500 font-medium hover:text-zinc-900 transition-colors duration-200 uppercase text-[12px] font-semibold tracking-[0.04em]">
                            New Arrivals
                        </a>
                        <a href="#shop" className="text-zinc-900 font-bold border-b-2 border-zinc-900 pb-1 uppercase text-[12px] tracking-[0.04em]">
                            Shop
                        </a>
                        <a href="#shop" className="text-zinc-500 font-medium hover:text-zinc-900 transition-colors duration-200 uppercase text-[12px] font-semibold tracking-[0.04em]">
                            Collections
                        </a>
                        {user?.role === 'seller' && (
                            <Link to="/seller/products" className="text-zinc-900 font-semibold hover:text-black transition-colors duration-200 uppercase text-[12px] tracking-[0.04em] flex items-center gap-1">
                                <Sparkles className="w-3.5 h-3.5 text-zinc-800" />
                                <span>Seller Studio</span>
                            </Link>
                        )}
                    </nav>

                    {/* Brand Center */}
                    <div className="flex flex-col items-center justify-center absolute left-1/2 transform -translate-x-1/2">
                        <Link to="/" className="inline-block group text-center">
                            <h1 className="font-heading font-black text-[24px] sm:text-[30px] md:text-[32px] tracking-[0.35em] text-zinc-900 uppercase leading-none">
                                S N I T C H
                            </h1>
                            <p className="text-[9px] sm:text-[10px] font-semibold tracking-[0.25em] text-zinc-400 uppercase mt-1">
                                CLOTHING &amp; APPAREL
                            </p>
                        </Link>
                    </div>

                    {/* Right Actions */}
                    <div className="flex items-center gap-4 sm:gap-6">
                        {/* Search toggle */}
                        <button
                            aria-label="Search"
                            onClick={() => setShowSearch(!showSearch)}
                            className="p-2 rounded-full hover:bg-zinc-100 text-zinc-800 hover:text-zinc-900 transition-colors cursor-pointer"
                        >
                            <Search className="w-5 h-5" />
                        </button>

                        {/* Account */}
                        {isAuthenticated ? (
                            <Link
                                to={user?.role === 'seller' ? '/seller/products' : '/login'}
                                className="p-2 rounded-full hover:bg-zinc-100 text-zinc-800 hover:text-zinc-900 transition-colors"
                                title={user?.fullName || "Account"}
                            >
                                <User className="w-5 h-5" />
                            </Link>
                        ) : (
                            <Link to="/login" className="p-2 rounded-full hover:bg-zinc-100 text-zinc-800 hover:text-zinc-900 transition-colors">
                                <User className="w-5 h-5" />
                            </Link>
                        )}

                        {/* Cart */}
                        <button
                            aria-label="Shopping Bag"
                            onClick={() => {
                                setToastMessage(`Your shopping bag has ${cartCount} items.`);
                                setTimeout(() => setToastMessage(null), 2000);
                            }}
                            className="p-2 rounded-full hover:bg-zinc-100 text-zinc-800 hover:text-zinc-900 transition-colors relative cursor-pointer"
                        >
                            <ShoppingBag className="w-5 h-5" />
                            {cartCount > 0 && (
                                <span className="absolute -top-0.5 -right-0.5 bg-zinc-900 text-white text-[10px] font-bold rounded-full w-4 h-4 flex items-center justify-center animate-fade-in">
                                    {cartCount}
                                </span>
                            )}
                        </button>
                    </div>
                </div>

                {/* Expandable Search Input */}
                {showSearch && (
                    <div className="border-t border-zinc-100 bg-white px-6 sm:px-8 py-4 animate-fade-in">
                        <div className="max-w-[1440px] mx-auto flex items-center gap-3">
                            <Search className="w-4 h-4 text-zinc-400" />
                            <input
                                type="text"
                                placeholder="Search apparel drops, hoodies, trench coats, cargos..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="editorial-underline-input text-sm flex-1"
                                autoFocus
                            />
                            {searchQuery && (
                                <button
                                    onClick={() => setSearchQuery('')}
                                    className="text-xs font-semibold text-zinc-400 hover:text-zinc-800"
                                >
                                    Clear
                                </button>
                            )}
                        </div>
                    </div>
                )}
            </header>

            {/* ═══════════════════════ MAIN CONTENT ═══════════════════════ */}
            <main className="flex-grow flex flex-col w-full">

                {/* ────────── HERO SECTION ────────── */}
                <section className="w-full relative min-h-[500px] sm:min-h-[600px] lg:min-h-[720px] flex items-center justify-center overflow-hidden bg-zinc-100">
                    <div className="absolute inset-0 z-0">
                        <img
                            alt="Snitch Autumn/Winter Collection"
                            className="w-full h-full object-cover object-center"
                            src="https://lh3.googleusercontent.com/aida-public/AB6AXuB4DOVe2CyjdIG7PE5w1CbsKnCc5GgtDFkMDTOvanmPk6lNeWOSqz5MFHOzTPJWBUiSXo-crRiXy8g45_aLYWu2bswuO7ww7iavHyVQdWpMIjRMxVs85zAPGxzglDlAyFIrij-Xqwfi9rM_dVX8kKkvFuROibGLqJw-iLC2nn5VVKbpmlo6v2Wx7Urmyf23FmF8L2rNl2CZKI2BTK1YIHe9f0rqteP8G6m09xknDIVWqn56sP9S3kXIvF6DPwKyJknvceMym2BfYsQ"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-black/20" />
                    </div>

                    <div className="relative z-10 flex flex-col items-center text-center px-6 max-w-4xl mx-auto text-white">
                        <span className="text-[11px] sm:text-[12px] font-semibold uppercase tracking-[0.25em] text-white mb-6 bg-white/20 backdrop-blur-md px-4 py-1.5 rounded-full border border-white/30">
                            FW '24 COLLECTION
                        </span>
                        <h2 className="font-heading font-black text-[38px] sm:text-[56px] lg:text-[72px] leading-[1.05] text-white uppercase tracking-tight mb-6">
                            Autumn / Winter<br />Collection
                        </h2>
                        <p className="text-[15px] sm:text-[18px] text-zinc-200 font-normal max-w-xl mx-auto mb-10 leading-relaxed">
                            Define your narrative with precision-crafted streetwear designed for the modern landscape.
                        </p>
                        <a
                            href="#shop"
                            className="editorial-black-pill px-8 sm:px-10 py-3.5 sm:py-4 text-[13px] sm:text-[14px] uppercase tracking-wider inline-flex items-center gap-2 bg-white text-zinc-900 hover:bg-zinc-100 shadow-2xl transition-all transform hover:scale-105"
                            style={{ backgroundColor: '#ffffff', color: '#18181b' }}
                        >
                            <span>Shop The Drop</span>
                            <ArrowRight className="w-4 h-4" />
                        </a>
                    </div>

                    {/* Season Floating Badge */}
                    <div className="absolute bottom-6 right-6 sm:bottom-10 sm:right-10 bg-white/90 backdrop-blur-md px-4 py-2 rounded-2xl shadow-lg border border-zinc-100 hidden sm:flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-zinc-900 animate-ping" />
                        <span className="text-[11px] font-bold tracking-widest uppercase text-zinc-900">
                            Autumn / Winter Collection
                        </span>
                    </div>
                </section>

                {/* ────────── CATEGORY NAVIGATION ────────── */}
                <section className="w-full max-w-[1440px] mx-auto px-6 sm:px-8 py-8 sm:py-12 mt-2 sm:mt-6">
                    <div className="flex flex-wrap items-center justify-center gap-2.5 sm:gap-4">
                        {CATEGORIES.map((cat) => (
                            <button
                                key={cat}
                                onClick={() => setActiveCategory(cat)}
                                className={`px-5 sm:px-6 py-2.5 rounded-full border font-semibold text-[12px] uppercase tracking-wider transition-all duration-200 cursor-pointer ${
                                    activeCategory === cat
                                        ? 'border-zinc-900 bg-zinc-900 text-white shadow-sm'
                                        : 'border-zinc-200 bg-white text-zinc-700 hover:border-zinc-900 hover:text-zinc-900'
                                }`}
                            >
                                {cat}
                            </button>
                        ))}
                    </div>
                </section>

                {/* ────────── PRODUCT GRID ────────── */}
                <section className="w-full max-w-[1440px] mx-auto px-6 sm:px-8 py-4 sm:py-12 mb-16 sm:mb-24" id="shop">
                    {/* Section Header */}
                    <div className="flex items-end justify-between mb-8 sm:mb-12 border-b border-zinc-100 pb-4">
                        <div>
                            <span className="text-[11px] font-bold uppercase tracking-widest text-zinc-400 block mb-1">
                                S N I T C H • CURATED
                            </span>
                            <h2 className="font-heading text-[24px] sm:text-[32px] font-bold text-zinc-900 uppercase tracking-tight">
                                {activeCategory === 'View All' ? 'Trending Now' : activeCategory}
                            </h2>
                        </div>
                        <span className="text-[12px] font-semibold text-zinc-400 uppercase tracking-wider">
                            {displayProducts.length} {displayProducts.length === 1 ? 'Item' : 'Items'}
                        </span>
                    </div>

                    {/* Loading State */}
                    {loading && (
                        <div className="flex items-center justify-center py-24">
                            <Loader2 className="w-8 h-8 animate-spin text-zinc-400" />
                            <span className="ml-3 text-zinc-500 font-medium">Loading collection...</span>
                        </div>
                    )}

                    {/* Empty Search Result */}
                    {!loading && displayProducts.length === 0 && (
                        <div className="flex flex-col items-center justify-center py-20 text-center">
                            <ShoppingBag className="w-16 h-16 text-zinc-300 stroke-1 mb-4" />
                            <h3 className="font-heading text-[20px] font-bold text-zinc-800 mb-2">No matching products</h3>
                            <p className="text-zinc-400 text-sm max-w-sm mb-6">
                                We couldn't find items matching "{searchQuery}". Try selecting another category or clearing your search.
                            </p>
                            <button
                                onClick={() => {
                                    setSearchQuery('');
                                    setActiveCategory('View All');
                                }}
                                className="editorial-secondary-pill px-6 py-2.5 text-xs font-bold"
                            >
                                Reset Filters
                            </button>
                        </div>
                    )}

                    {/* Product Cards Grid (4 columns desktop, 2 columns mobile) */}
                    {!loading && displayProducts.length > 0 && (
                        <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 lg:gap-8">
                            {displayProducts.map((product, index) => {
                                const imgUrl = getProductImage(product);
                                const tag = product.tag || (index === 0 ? 'New' : index === 2 ? 'Bestseller' : null);

                                return (
                                    <Link
                                        key={product._id || index}
                                        to={`/product/${product._id}`}
                                        className="group bg-white rounded-[28px] overflow-hidden shadow-xs hover:shadow-xl transition-all duration-300 border border-zinc-200/60 flex flex-col h-full cursor-pointer animate-fade-in block"
                                        style={{ animationDelay: `${index * 60}ms` }}
                                    >
                                        {/* Image Container */}
                                        <div className="relative aspect-[3/4] overflow-hidden bg-zinc-100 rounded-t-[27px]">
                                            {imgUrl ? (
                                                <img
                                                    alt={product.title}
                                                    className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-700"
                                                    src={imgUrl}
                                                />
                                            ) : (
                                                <div className="w-full h-full flex items-center justify-center text-zinc-300">
                                                    <ShoppingBag className="w-12 h-12 stroke-1" />
                                                </div>
                                            )}

                                            {/* Tag Badge */}
                                            {tag && (
                                                <div className="absolute top-3 left-3 sm:top-4 sm:left-4">
                                                    <span className={`text-[10px] font-bold uppercase tracking-wider px-3 py-1.5 rounded-full shadow-xs ${
                                                        tag === 'New'
                                                            ? 'bg-zinc-900 text-white'
                                                            : 'bg-white text-zinc-900 border border-zinc-200'
                                                    }`}>
                                                        {tag}
                                                    </span>
                                                </div>
                                            )}

                                            {/* Quick Add Button */}
                                            <button
                                                type="button"
                                                onClick={(e) => {
                                                    e.preventDefault();
                                                    e.stopPropagation();
                                                    handleAddToCart(product, e);
                                                }}
                                                title="Add to Bag"
                                                className="absolute bottom-3 right-3 sm:bottom-4 sm:right-4 bg-white text-zinc-900 w-9 h-9 sm:w-10 sm:h-10 rounded-full flex items-center justify-center shadow-lg hover:bg-zinc-900 hover:text-white transition-all opacity-0 group-hover:opacity-100 translate-y-2 group-hover:translate-y-0 duration-300 cursor-pointer"
                                            >
                                                <ShoppingBag className="w-4 h-4 sm:w-5 sm:h-5" />
                                            </button>
                                        </div>

                                        {/* Product Info */}
                                        <div className="p-4 sm:p-6 flex flex-col flex-grow justify-between">
                                            <div>
                                                <div className="flex items-center justify-between text-[10px] font-bold uppercase tracking-widest text-zinc-400 mb-1">
                                                    <span>S N I T C H</span>
                                                    <span>{product.category || 'Apparel'}</span>
                                                </div>
                                                <h3 className="font-heading text-[14px] sm:text-[17px] font-bold text-zinc-900 mb-1 sm:mb-1.5 leading-snug line-clamp-1 group-hover:text-zinc-700 transition-colors">
                                                    {product.title}
                                                </h3>
                                                {product.description && (
                                                    <p className="text-[11px] sm:text-[12px] text-zinc-500 line-clamp-2 leading-relaxed mb-3">
                                                        {product.description}
                                                    </p>
                                                )}
                                            </div>

                                            <div className="pt-2 sm:pt-3 border-t border-zinc-100 flex items-center justify-between">
                                                <p className="font-heading text-[15px] sm:text-[17px] font-bold text-zinc-900">
                                                    {formatPrice(product.price)}
                                                </p>
                                                <span className="text-[11px] font-semibold text-zinc-400 group-hover:text-zinc-900 flex items-center gap-0.5 transition-colors">
                                                    Details <ChevronRight className="w-3 h-3" />
                                                </span>
                                            </div>
                                        </div>
                                    </Link>
                                );
                            })}
                        </div>
                    )}
                </section>
            </main>


            {/* ═══════════════════════ QUICK VIEW MODAL ═══════════════════════ */}
            {selectedProduct && (
                <div
                    onClick={() => setSelectedProduct(null)}
                    className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 sm:p-6 animate-fade-in"
                >
                    <div
                        onClick={(e) => e.stopPropagation()}
                        className="bg-white rounded-3xl max-w-2xl w-full overflow-hidden shadow-2xl border border-zinc-100 relative max-h-[90vh] flex flex-col md:flex-row"
                    >
                        {/* Close button */}
                        <button
                            onClick={() => setSelectedProduct(null)}
                            className="absolute top-4 right-4 z-10 w-8 h-8 rounded-full bg-white/90 hover:bg-white text-zinc-800 flex items-center justify-center shadow-md transition-colors cursor-pointer"
                        >
                            <X className="w-4 h-4" />
                        </button>

                        {/* Modal Image */}
                        <div className="w-full md:w-1/2 aspect-[3/4] bg-zinc-100 overflow-hidden">
                            {getProductImage(selectedProduct) ? (
                                <img
                                    src={getProductImage(selectedProduct)}
                                    alt={selectedProduct.title}
                                    className="w-full h-full object-cover object-center"
                                />
                            ) : (
                                <div className="w-full h-full flex items-center justify-center text-zinc-300">
                                    <ShoppingBag className="w-16 h-16 stroke-1" />
                                </div>
                            )}
                        </div>

                        {/* Modal Details */}
                        <div className="w-full md:w-1/2 p-6 sm:p-8 flex flex-col justify-between overflow-y-auto">
                            <div>
                                <span className="text-[10px] font-bold tracking-[0.2em] text-zinc-400 uppercase block mb-1">
                                    S N I T C H • AUTUMN / WINTER
                                </span>
                                <h3 className="font-heading font-extrabold text-2xl text-zinc-900 mb-2">
                                    {selectedProduct.title}
                                </h3>
                                <div className="font-heading font-bold text-xl text-zinc-900 mb-4">
                                    {formatPrice(selectedProduct.price)}
                                </div>
                                <p className="text-xs sm:text-sm text-zinc-600 leading-relaxed mb-6">
                                    {selectedProduct.description || 'Premium craftsmanship tailored with precision. Engineered for maximum comfort and an elevated streetwear aesthetic.'}
                                </p>
                            </div>

                            <div className="space-y-2.5 pt-4 border-t border-zinc-100">
                                <button
                                    onClick={() => {
                                        handleAddToCart(selectedProduct);
                                        setSelectedProduct(null);
                                    }}
                                    className="editorial-black-pill w-full py-3 text-xs uppercase tracking-wider flex items-center justify-center gap-2 cursor-pointer shadow-lg"
                                >
                                    <ShoppingBag className="w-4 h-4" />
                                    <span>Add To Bag</span>
                                </button>
                                <Link
                                    to={`/product/${selectedProduct._id}`}
                                    onClick={() => setSelectedProduct(null)}
                                    className="editorial-secondary-pill w-full py-2.5 text-xs font-semibold cursor-pointer flex items-center justify-center gap-1.5"
                                >
                                    <span>View Full Garment Details</span>
                                    <ChevronRight className="w-3.5 h-3.5" />
                                </Link>
                            </div>

                        </div>
                    </div>
                </div>
            )}

            {/* ═══════════════════════ FOOTER ═══════════════════════ */}
            <footer className="bg-white border-t border-zinc-100 w-full mt-auto">
                <div className="flex flex-col items-center gap-6 py-12 px-6 sm:px-8 w-full max-w-[1440px] mx-auto">
                    {/* Footer Brand */}
                    <div className="mb-2">
                        <span className="font-heading text-[20px] font-bold tracking-[0.2em] text-zinc-900 uppercase">
                            S N I T C H
                        </span>
                    </div>

                    {/* Footer Links */}
                    <nav className="flex flex-wrap justify-center gap-6 sm:gap-8 mb-2">
                        <a className="text-[12px] font-semibold text-zinc-400 uppercase tracking-wider hover:text-zinc-900 transition-colors duration-200" href="#">
                            Privacy Policy
                        </a>
                        <a className="text-[12px] font-semibold text-zinc-400 uppercase tracking-wider hover:text-zinc-900 transition-colors duration-200" href="#">
                            Terms of Service
                        </a>
                        <a className="text-[12px] font-semibold text-zinc-400 uppercase tracking-wider hover:text-zinc-900 transition-colors duration-200" href="#">
                            Shipping &amp; Returns
                        </a>
                        <a className="text-[12px] font-semibold text-zinc-400 uppercase tracking-wider hover:text-zinc-900 transition-colors duration-200" href="#">
                            Contact Us
                        </a>
                    </nav>

                    {/* Footer Seal */}
                    <div className="flex items-center gap-1.5 text-[11px] text-zinc-400">
                        <ShieldCheck className="w-3.5 h-3.5" />
                        <span>© 2024 SNITCH APPAREL. All Rights Reserved.</span>
                    </div>
                </div>
            </footer>
        </div>
    );
};

export default Home;