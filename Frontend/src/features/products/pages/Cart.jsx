import React, { useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Link } from 'react-router';
import {
  ShoppingBag,
  Trash2,
  Minus,
  Plus,
  ChevronLeft,
  ShieldCheck,
  CheckCircle2,
  Truck,
  RotateCcw,
  Package,
  X,
} from 'lucide-react';
import { removeFromCart, updateQuantity, clearCart, placeOrder, clearOrderMessage } from '../state/cart.slice.js';

export default function Cart() {
  const dispatch = useDispatch();
  const { items, orderPlaced, orderMessage } = useSelector((state) => state.cart);
  const { user, isAuthenticated } = useSelector((state) => state.auth || {});
  const [showConfirm, setShowConfirm] = useState(false);

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

  const getPrice = (price) => {
    if (!price) return 0;
    return typeof price === 'object' ? price.amount : price;
  };

  const getProductImage = (product) => {
    if (product?.images && product.images.length > 0) {
      const img = product.images[0];
      return typeof img === 'string' ? img : img?.url;
    }
    return null;
  };

  const subtotal = items.reduce((sum, item) => sum + getPrice(item.product?.price) * item.quantity, 0);
  const shipping = subtotal > 1999 ? 0 : 149;
  const total = subtotal + shipping;

  const handlePlaceOrder = () => {
    if (!isAuthenticated) {
      setShowConfirm(false);
      return;
    }
    dispatch(placeOrder());
    setShowConfirm(false);
  };

  return (
    <div className="h-dvh bg-white text-zinc-900 font-body select-none flex flex-col overflow-hidden">

      {/* ═══════════ HEADER ═══════════ */}
      <header className="bg-white/95 backdrop-blur-md border-b border-zinc-100 z-40 w-full flex-shrink-0">
        <div className="flex justify-between items-center px-3 sm:px-6 lg:px-8 h-12 sm:h-14 lg:h-16 w-full max-w-[1440px] mx-auto relative">
          <Link
            to="/"
            className="p-1.5 rounded-full hover:bg-zinc-100 text-zinc-700 transition-colors flex items-center gap-1 text-[11px] font-semibold uppercase tracking-wider"
          >
            <ChevronLeft className="w-4 h-4" />
            <span className="hidden sm:inline">Continue Shopping</span>
          </Link>

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

          <div className="flex items-center gap-1.5">
            <ShoppingBag className="w-4 h-4 text-zinc-600" />
            <span className="text-[11px] font-bold text-zinc-600">{items.length} Items</span>
          </div>
        </div>
      </header>

      {/* ═══════════ MAIN CONTENT ═══════════ */}
      <main className="flex-1 max-w-[1440px] mx-auto w-full flex flex-col lg:flex-row overflow-hidden min-h-0">

        {/* ── ORDER SUCCESS STATE ── */}
        {orderPlaced && orderMessage && (
          <div className="flex-1 flex flex-col items-center justify-center text-center p-6 animate-fade-in">
            <div className="w-16 h-16 rounded-full bg-emerald-50 flex items-center justify-center mb-4">
              <CheckCircle2 className="w-8 h-8 text-emerald-500" />
            </div>
            <h2 className="font-heading font-black text-xl sm:text-2xl text-zinc-900 mb-2 uppercase tracking-tight">
              Order Confirmed!
            </h2>
            <p className="text-sm text-zinc-500 max-w-md mb-6">{orderMessage}</p>
            <div className="flex gap-3">
              <Link
                to="/"
                className="editorial-black-pill px-6 py-2.5 text-xs uppercase tracking-wider"
                onClick={() => dispatch(clearOrderMessage())}
              >
                Continue Shopping
              </Link>
            </div>
          </div>
        )}

        {/* ── EMPTY CART ── */}
        {!orderPlaced && items.length === 0 && (
          <div className="flex-1 flex flex-col items-center justify-center text-center p-6">
            <ShoppingBag className="w-16 h-16 text-zinc-200 stroke-1 mb-4" />
            <h2 className="font-heading font-bold text-xl text-zinc-900 mb-2">Your Bag is Empty</h2>
            <p className="text-sm text-zinc-500 max-w-sm mb-6">
              Looks like you haven't added anything to your bag yet. Explore our collection and find something you love.
            </p>
            <Link to="/" className="editorial-black-pill px-6 py-2.5 text-xs uppercase tracking-wider">
              Browse Collection
            </Link>
          </div>
        )}

        {/* ── CART WITH ITEMS ── */}
        {!orderPlaced && items.length > 0 && (
          <>
            {/* LEFT: Cart Items */}
            <div className="flex-1 lg:w-[60%] overflow-y-auto scrollbar-none px-3 sm:px-6 py-3 sm:py-4 border-r border-zinc-100">
              <div className="flex items-center justify-between mb-3">
                <h2 className="font-heading font-bold text-base sm:text-lg text-zinc-900 uppercase tracking-tight">
                  Shopping Bag ({items.length})
                </h2>
                <button
                  onClick={() => dispatch(clearCart())}
                  className="text-[10px] font-semibold text-zinc-400 hover:text-rose-500 uppercase tracking-wider transition-colors cursor-pointer"
                >
                  Clear All
                </button>
              </div>

              <div className="space-y-2.5">
                {items.map((item, index) => {
                  const imgUrl = getProductImage(item.product);
                  return (
                    <div
                      key={`${item.product._id}-${item.size}-${item.color}-${index}`}
                      className="flex gap-3 sm:gap-4 p-2.5 sm:p-3 bg-zinc-50/60 rounded-xl border border-zinc-100 animate-fade-in"
                    >
                      {/* Image */}
                      <Link
                        to={`/product/${item.product._id}`}
                        className="w-20 h-24 sm:w-24 sm:h-28 rounded-lg overflow-hidden bg-zinc-100 flex-shrink-0"
                      >
                        {imgUrl ? (
                          <img src={imgUrl} alt={item.product.title} className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-zinc-300">
                            <ShoppingBag className="w-6 h-6 stroke-1" />
                          </div>
                        )}
                      </Link>

                      {/* Info */}
                      <div className="flex-1 flex flex-col justify-between min-w-0">
                        <div>
                          <div className="flex items-start justify-between gap-2">
                            <div className="min-w-0">
                              <p className="text-[9px] font-bold text-zinc-400 uppercase tracking-wider">
                                S N I T C H • {item.product.category || 'Apparel'}
                              </p>
                              <Link to={`/product/${item.product._id}`}>
                                <h3 className="font-heading font-bold text-sm text-zinc-900 truncate hover:text-zinc-600 transition-colors">
                                  {item.product.title}
                                </h3>
                              </Link>
                            </div>
                            <button
                              onClick={() =>
                                dispatch(removeFromCart({
                                  productId: item.product._id,
                                  size: item.size,
                                  color: item.color,
                                }))
                              }
                              className="p-1 rounded-full hover:bg-rose-50 text-zinc-400 hover:text-rose-500 transition-colors cursor-pointer flex-shrink-0"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                          <div className="flex items-center gap-2 mt-0.5">
                            <span className="text-[10px] text-zinc-500 font-medium">Size: {item.size}</span>
                            <span className="text-zinc-300">•</span>
                            <span className="text-[10px] text-zinc-500 font-medium">{item.color}</span>
                          </div>
                        </div>

                        <div className="flex items-center justify-between mt-1.5">
                          {/* Quantity */}
                          <div className="flex items-center border border-zinc-200 rounded-full px-2 py-1 gap-2.5 bg-white">
                            <button
                              onClick={() =>
                                dispatch(updateQuantity({
                                  productId: item.product._id,
                                  size: item.size,
                                  color: item.color,
                                  quantity: item.quantity - 1,
                                }))
                              }
                              className="p-0.5 hover:bg-zinc-100 rounded-full cursor-pointer"
                            >
                              <Minus className="w-3 h-3 text-zinc-600" />
                            </button>
                            <span className="text-xs font-bold text-zinc-900 w-4 text-center">{item.quantity}</span>
                            <button
                              onClick={() =>
                                dispatch(updateQuantity({
                                  productId: item.product._id,
                                  size: item.size,
                                  color: item.color,
                                  quantity: item.quantity + 1,
                                }))
                              }
                              className="p-0.5 hover:bg-zinc-100 rounded-full cursor-pointer"
                            >
                              <Plus className="w-3 h-3 text-zinc-600" />
                            </button>
                          </div>

                          {/* Price */}
                          <span className="font-heading font-bold text-sm text-zinc-900">
                            {formatPrice({ amount: getPrice(item.product?.price) * item.quantity, currency: 'INR' })}
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* RIGHT: Order Summary */}
            <div className="lg:w-[40%] flex flex-col px-3 sm:px-6 py-3 sm:py-4 bg-zinc-50/40 overflow-y-auto scrollbar-none">
              <h3 className="font-heading font-bold text-base text-zinc-900 uppercase tracking-tight mb-3">
                Order Summary
              </h3>

              <div className="space-y-2 text-sm">
                <div className="flex justify-between text-zinc-600">
                  <span>Subtotal ({items.reduce((s, i) => s + i.quantity, 0)} items)</span>
                  <span className="font-semibold text-zinc-900">{formatPrice({ amount: subtotal, currency: 'INR' })}</span>
                </div>
                <div className="flex justify-between text-zinc-600">
                  <span>Shipping</span>
                  <span className={`font-semibold ${shipping === 0 ? 'text-emerald-600' : 'text-zinc-900'}`}>
                    {shipping === 0 ? 'FREE' : formatPrice({ amount: shipping, currency: 'INR' })}
                  </span>
                </div>
                {shipping > 0 && (
                  <p className="text-[10px] text-zinc-400">Free shipping on orders above ₹1,999</p>
                )}
                <div className="border-t border-zinc-200 pt-2 flex justify-between">
                  <span className="font-heading font-bold text-zinc-900">Total</span>
                  <span className="font-heading font-black text-lg text-zinc-900">
                    {formatPrice({ amount: total, currency: 'INR' })}
                  </span>
                </div>
              </div>

              {/* Actions */}
              <div className="mt-4 space-y-2">
                {!isAuthenticated ? (
                  <Link
                    to="/login"
                    className="editorial-black-pill w-full py-3 text-[11px] uppercase tracking-wider flex items-center justify-center gap-2 cursor-pointer shadow-md"
                  >
                    <span>Sign In to Place Order</span>
                  </Link>
                ) : (
                  <button
                    onClick={() => setShowConfirm(true)}
                    className="editorial-black-pill w-full py-3 text-[11px] uppercase tracking-wider flex items-center justify-center gap-2 cursor-pointer shadow-md hover:shadow-lg transition-all"
                  >
                    <Package className="w-3.5 h-3.5" />
                    <span>Place Order</span>
                  </button>
                )}
                <Link
                  to="/"
                  className="editorial-secondary-pill w-full py-2.5 text-[11px] font-bold uppercase tracking-wider cursor-pointer flex items-center justify-center"
                >
                  Continue Shopping
                </Link>
              </div>

              {/* Trust Badges */}
              <div className="mt-4 grid grid-cols-3 gap-1 py-2 px-2 bg-white border border-zinc-200/60 rounded-lg text-center text-[9px] sm:text-[10px] font-medium text-zinc-600">
                <div className="flex flex-col items-center gap-0.5">
                  <Truck className="w-3 h-3 text-zinc-800" />
                  <span>Free Delivery</span>
                </div>
                <div className="flex flex-col items-center gap-0.5 border-x border-zinc-200/80 px-1">
                  <RotateCcw className="w-3 h-3 text-zinc-800" />
                  <span>14-Day Returns</span>
                </div>
                <div className="flex flex-col items-center gap-0.5">
                  <ShieldCheck className="w-3 h-3 text-zinc-800" />
                  <span>Authentic</span>
                </div>
              </div>

              {/* Delivery info */}
              {isAuthenticated && user && (
                <div className="mt-3 p-2.5 bg-white rounded-lg border border-zinc-200/60">
                  <p className="text-[10px] font-bold text-zinc-800 uppercase tracking-wider mb-1">Delivering To</p>
                  <p className="text-xs text-zinc-600">{user.fullName || user.email}</p>
                  <p className="text-[10px] text-zinc-400 mt-0.5">Express delivery • 5-7 business days</p>
                </div>
              )}
            </div>
          </>
        )}
      </main>

      {/* ═══════════ ORDER CONFIRM MODAL ═══════════ */}
      {showConfirm && (
        <div
          onClick={() => setShowConfirm(false)}
          className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 animate-fade-in"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="bg-white rounded-3xl max-w-sm w-full p-6 shadow-2xl border border-zinc-100 relative text-center"
          >
            <button
              onClick={() => setShowConfirm(false)}
              className="absolute top-3 right-3 w-7 h-7 rounded-full bg-zinc-100 hover:bg-zinc-200 text-zinc-700 flex items-center justify-center transition-colors cursor-pointer"
            >
              <X className="w-3.5 h-3.5" />
            </button>

            <Package className="w-10 h-10 text-zinc-900 mx-auto mb-3" />
            <h3 className="font-heading font-black text-lg text-zinc-900 uppercase tracking-tight mb-1">
              Confirm Order
            </h3>
            <p className="text-xs text-zinc-500 mb-4">
              You're about to place an order for {items.length} item(s) totaling{' '}
              <span className="font-bold text-zinc-900">{formatPrice({ amount: total, currency: 'INR' })}</span>.
            </p>

            <div className="flex gap-2">
              <button
                onClick={() => setShowConfirm(false)}
                className="editorial-secondary-pill flex-1 py-2.5 text-xs font-bold uppercase tracking-wider cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handlePlaceOrder}
                className="editorial-black-pill flex-1 py-2.5 text-xs uppercase tracking-wider cursor-pointer"
              >
                Confirm & Pay
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
