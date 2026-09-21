import React, { useState, useEffect, useMemo } from "react";
import { useSelector, useDispatch } from 'react-redux';
import { addToCartThunk, toggleLikeThunk } from '../state/cart.slice.js';
import { useProduct } from '../Hooks/useProduct';
import { Link, useNavigate } from 'react-router';
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
    Plus,
    Heart
} from 'lucide-react';

const CATEGORIES = ['View All', 'Shirts', 'Jackets', 'Pants', 'Sneakers', 'Accessories'];

const Home = () => {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const { products, loading, handleGetProducts } = useProduct();
    const { user, isAuthenticated } = useSelector(state => state.auth || {});
    const cartItems = useSelector(state => state.cart?.items || []);
    const wishlist = useSelector(state => state.cart?.wishlist || []);
    const cartCount = cartItems.length;
    const [activeCategory, setActiveCategory] = useState('View All');
    const [searchQuery, setSearchQuery] = useState('');
    const [showSearch, setShowSearch] = useState(false);
    const [selectedProduct, setSelectedProduct] = useState(null);
    const [toastMessage, setToastMessage] = useState(null);

    // If logged in as seller, automatically redirect to seller dashboard
    useEffect(() => {
        if (user?.role === 'seller') {
            navigate('/seller/dashboard', { replace: true });
        }
    }, [user, navigate]);

    useEffect(() => {
        handleGetProducts();
    }, []);

    // Filter to only in-stock products from MongoDB
    const displayProducts = useMemo(() => {
        const list = products || [];
        
        return list.filter((product) => {
            // Must have stock > 0
            const stock = typeof product.stock === 'number' ? product.stock : 0;
            if (stock <= 0 || product.status === 'Out of Stock') return false;

            const matchesSearch =
                (product.title || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
                (product.description || '').toLowerCase().includes(searchQuery.toLowerCase());

            if (!matchesSearch) return false;

            if (activeCategory === 'View All') return true;

            const categoryMatch =
                (product.category || '').toLowerCase() === activeCategory.toLowerCase();

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
        if (!isAuthenticated || !user) {
            navigate('/login');
            return;
        }
        dispatch(addToCartThunk({ productId: product._id, quantity: 1, size: 'M', color: 'Black' }));
        setToastMessage(`Added "${product.title}" to bag`);
        setTimeout(() => setToastMessage(null), 2500);
    };

    const handleToggleLike = (product, e) => {
        if (e) e.stopPropagation();
        if (!isAuthenticated || !user) {
            navigate('/login');
            return;
        }
        dispatch(toggleLikeThunk(product._id));
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
                <div className="flex justify-between items-center px-4 sm:px-6 h-14 sm:h-16 w-full max-w-[1440px] mx-auto relative">
                    {/* Left Nav Links */}
                    <nav className="hidden md:flex items-center gap-6">
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

                        {/* Account / Profile Avatar */}
                        <Link
                            to="/profile"
                            className="p-1 rounded-full hover:bg-zinc-100 text-zinc-800 hover:text-zinc-900 transition-colors flex items-center justify-center"
                            title={isAuthenticated ? (user?.fullName || "My Profile") : "Sign In / Account"}
                        >
                            {isAuthenticated && user?.avatar ? (
                                <img
                                    src={user.avatar}
                                    alt={user.fullName || "User avatar"}
                                    className="w-7 h-7 rounded-full object-cover border border-zinc-300"
                                />
                            ) : isAuthenticated && user?.fullName ? (
                                <div className="w-7 h-7 rounded-full bg-zinc-900 text-white font-bold text-xs flex items-center justify-center tracking-wider shadow-sm">
                                    {user.fullName.charAt(0).toUpperCase()}
                                </div>
                            ) : (
                                <div className="p-1">
                                    <User className="w-5 h-5" />
                                </div>
                            )}
                        </Link>

                        {/* Cart */}
                        <Link
                            to="/cart"
                            aria-label="Shopping Bag"
                            className="p-2 rounded-full hover:bg-zinc-100 text-zinc-800 hover:text-zinc-900 transition-colors relative"
                        >
                            <ShoppingBag className="w-5 h-5" />
                            {cartCount > 0 && (
                                <span className="absolute -top-0.5 -right-0.5 bg-zinc-900 text-white text-[10px] font-bold rounded-full w-4 h-4 flex items-center justify-center animate-fade-in">
                                    {cartCount}
                                </span>
                            )}
                        </Link>
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




                {/* ────────── CATEGORY NAVIGATION ────────── */}
                <section className="w-full max-w-[1440px] mx-auto px-4 sm:px-6 py-3 sm:py-4 mt-1">
                    <div className="flex flex-wrap items-center justify-center gap-2 sm:gap-2.5">
                        {CATEGORIES.map((cat) => (
                            <button
                                key={cat}
                                onClick={() => setActiveCategory(cat)}
                                className={`px-4 sm:px-5 py-2 rounded-full border font-semibold text-[11px] uppercase tracking-wider transition-all duration-200 cursor-pointer ${
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
                <section className="w-full max-w-[1440px] mx-auto px-4 sm:px-6 py-2 sm:py-4 mb-8 sm:mb-12" id="shop">
                    {/* Section Header */}



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
                        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4 lg:gap-5">
                            {displayProducts.map((product, index) => {
                                const imgUrl = getProductImage(product);
                                const tag = product.tag || (index === 0 ? 'New' : index === 2 ? 'Bestseller' : null);

                                return (
                                    <Link
                                        key={product._id || index}
                                        to={`/product/${product._id}`}
                                        className="group bg-white rounded-2xl overflow-hidden shadow-xs hover:shadow-lg transition-all duration-300 border border-zinc-200/60 flex flex-col h-full cursor-pointer animate-fade-in block"
                                        style={{ animationDelay: `${index * 60}ms` }}
                                    >
                                        {/* Image Container */}
                                        <div className="relative aspect-[3/4] overflow-hidden bg-zinc-100 rounded-t-[15px]">
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

                                            {/* Like / Heart Button */}
                                            <button
                                                type="button"
                                                onClick={(e) => {
                                                    e.preventDefault();
                                                    e.stopPropagation();
                                                    handleToggleLike(product, e);
                                                }}
                                                title={wishlist.includes(product._id) ? "Remove from wishlist" : "Save to wishlist"}
                                                className="absolute top-3 right-3 sm:top-4 sm:right-4 w-8 h-8 rounded-full bg-white/90 backdrop-blur-sm shadow flex items-center justify-center transition-transform hover:scale-110 cursor-pointer z-10"
                                            >
                                                <Heart
                                                    className={`w-4 h-4 transition-colors ${
                                                        wishlist.includes(product._id)
                                                            ? 'fill-rose-500 text-rose-500'
                                                            : 'text-zinc-600 hover:text-rose-500'
                                                    }`}
                                                />
                                            </button>

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
                                        <div className="p-3 sm:p-4 flex flex-col flex-grow justify-between">
                                            <div>
                                                <div className="flex items-center justify-between text-[10px] font-bold uppercase tracking-widest text-zinc-400 mb-1">
                                                    <span>S N I T C H</span>
                                                    <span>{product.category || 'Apparel'}</span>
                                                </div>
                                                <h3 className="font-heading text-[13px] sm:text-[15px] font-bold text-zinc-900 mb-0.5 sm:mb-1 leading-snug line-clamp-1 group-hover:text-zinc-700 transition-colors">
                                                    {product.title}
                                                </h3>
                                                {product.description && (
                                                    <p className="text-[10px] sm:text-[11px] text-zinc-500 line-clamp-1 leading-relaxed mb-1.5">
                                                        {product.description}
                                                    </p>
                                                )}
                                            </div>

                                            <div className="pt-1.5 sm:pt-2 border-t border-zinc-100 flex items-center justify-between">
                                                <p className="font-heading text-[13px] sm:text-[15px] font-bold text-zinc-900">
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