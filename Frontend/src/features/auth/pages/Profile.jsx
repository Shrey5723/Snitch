import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { Link, useNavigate } from 'react-router';
import {
  ChevronLeft,
  User,
  MapPin,
  Package,
  Save,
  LogOut,
  Plus,
  Trash2,
  CheckCircle2,
  AlertCircle,
  Edit3,
  X,
  ShoppingBag,
} from 'lucide-react';
import useAuth from '../../auth/Hooks/useAuth.js';

const TABS = [
  { id: 'personal', label: 'Personal Info', icon: User },
  { id: 'addresses', label: 'Addresses', icon: MapPin },
  { id: 'orders', label: 'Order History', icon: Package },
];

export default function Profile() {
  const navigate = useNavigate();
  const { user, isAuthenticated, loading, error, successMessage, handleLogout, handleUpdateProfile, handleGetMe, clearMessages } = useAuth();
  const orders = useSelector((state) => state.cart?.orders || []);

  const [activeTab, setActiveTab] = useState('personal');
  const [formData, setFormData] = useState({ fullName: '', contactNumber: '' });
  const [addresses, setAddresses] = useState([]);
  const [showAddressForm, setShowAddressForm] = useState(false);
  const [editingIndex, setEditingIndex] = useState(null);
  const [addressForm, setAddressForm] = useState({ label: 'Home', street: '', city: '', state: '', zipCode: '' });
  const [toastMessage, setToastMessage] = useState(null);
  const [toastType, setToastType] = useState('success');

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
    } else {
      handleGetMe();
    }
  }, []);

  useEffect(() => {
    if (user) {
      setFormData({ fullName: user.fullName || '', contactNumber: user.contactNumber || '' });
      setAddresses(user.addresses || []);
    }
  }, [user]);

  useEffect(() => {
    if (successMessage) {
      showToast(successMessage, 'success');
      clearMessages();
    }
    if (error) {
      showToast(error, 'error');
      clearMessages();
    }
  }, [successMessage, error]);

  const showToast = (msg, type = 'success') => {
    setToastMessage(msg);
    setToastType(type);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const getInitials = (name) => {
    if (!name) return '?';
    return name.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2);
  };

  const formatPrice = (amount) => {
    return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', minimumFractionDigits: 0, maximumFractionDigits: 0 }).format(amount || 0);
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return '';
    return new Date(dateStr).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
  };

  const handleSaveProfile = async () => {
    const result = await handleUpdateProfile({ fullName: formData.fullName, contactNumber: formData.contactNumber, addresses });
    if (result.success) {
      showToast('Profile updated successfully', 'success');
    }
  };

  const handleSaveAddress = async () => {
    if (!addressForm.street || !addressForm.city || !addressForm.state || !addressForm.zipCode) {
      showToast('Please fill all address fields', 'error');
      return;
    }
    const updated = [...addresses];
    if (editingIndex !== null) {
      updated[editingIndex] = { ...addressForm };
    } else {
      if (updated.length === 0) addressForm.isDefault = true;
      updated.push({ ...addressForm });
    }
    setAddresses(updated);
    const result = await handleUpdateProfile({ fullName: formData.fullName, contactNumber: formData.contactNumber, addresses: updated });
    if (result.success) {
      setShowAddressForm(false);
      setEditingIndex(null);
      setAddressForm({ label: 'Home', street: '', city: '', state: '', zipCode: '' });
    }
  };

  const handleDeleteAddress = async (index) => {
    const updated = addresses.filter((_, i) => i !== index);
    setAddresses(updated);
    await handleUpdateProfile({ fullName: formData.fullName, contactNumber: formData.contactNumber, addresses: updated });
  };

  const handleSetDefault = async (index) => {
    const updated = addresses.map((a, i) => ({ ...a, isDefault: i === index }));
    setAddresses(updated);
    await handleUpdateProfile({ fullName: formData.fullName, contactNumber: formData.contactNumber, addresses: updated });
  };

  const handleEditAddress = (index) => {
    setAddressForm({ ...addresses[index] });
    setEditingIndex(index);
    setShowAddressForm(true);
  };

  const onLogout = async () => {
    await handleLogout();
    navigate('/');
  };

  if (!isAuthenticated || !user) return null;

  return (
    <div className="h-dvh bg-white text-zinc-900 font-body select-none flex flex-col overflow-hidden">

      {/* ═══════ TOAST ═══════ */}
      {toastMessage && (
        <div className={`fixed top-16 right-4 z-50 animate-fade-in px-4 py-2.5 rounded-2xl shadow-2xl flex items-center gap-2.5 border text-xs font-semibold ${
          toastType === 'success' ? 'bg-zinc-900 text-white border-zinc-800' : 'bg-rose-50 text-rose-700 border-rose-200'
        }`}>
          {toastType === 'success' ? <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" /> : <AlertCircle className="w-3.5 h-3.5 text-rose-500" />}
          <span>{toastMessage}</span>
        </div>
      )}

      {/* ═══════ HEADER ═══════ */}
      <header className="bg-white/95 backdrop-blur-md border-b border-zinc-100 z-40 w-full flex-shrink-0">
        <div className="flex justify-between items-center px-3 sm:px-6 lg:px-8 h-12 sm:h-14 lg:h-16 w-full max-w-[1440px] mx-auto relative">
          <Link to="/" className="p-1.5 rounded-full hover:bg-zinc-100 text-zinc-700 transition-colors flex items-center gap-1 text-[11px] font-semibold uppercase tracking-wider">
            <ChevronLeft className="w-4 h-4" />
            <span className="hidden sm:inline">Back</span>
          </Link>
          <div className="absolute left-1/2 transform -translate-x-1/2">
            <Link to="/" className="inline-block text-center">
              <h1 className="font-heading font-black text-[18px] sm:text-[22px] lg:text-[26px] tracking-[0.35em] text-zinc-900 uppercase leading-none">S N I T C H</h1>
            </Link>
          </div>
          <Link to="/cart" className="p-1.5 rounded-full hover:bg-zinc-100 text-zinc-700 transition-colors relative">
            <ShoppingBag className="w-4 h-4" />
          </Link>
        </div>
      </header>

      {/* ═══════ MAIN CONTENT ═══════ */}
      <main className="flex-1 max-w-[1440px] mx-auto w-full flex flex-col lg:flex-row overflow-hidden min-h-0">

        {/* ── LEFT SIDEBAR ── */}
        <aside className="lg:w-[280px] xl:w-[300px] border-b lg:border-b-0 lg:border-r border-zinc-100 flex-shrink-0 flex lg:flex-col items-center lg:items-stretch gap-3 lg:gap-0 px-4 py-3 lg:py-6 lg:px-5 overflow-y-auto scrollbar-none">
          {/* User card */}
          <div className="flex lg:flex-col items-center gap-3 lg:gap-2 lg:mb-6 lg:text-center flex-shrink-0">
            <div className="w-12 h-12 lg:w-16 lg:h-16 rounded-full bg-zinc-900 text-white flex items-center justify-center font-heading font-black text-sm lg:text-lg tracking-wider lg:mx-auto">
              {getInitials(user.fullName)}
            </div>
            <div className="min-w-0">
              <h2 className="font-heading font-bold text-sm lg:text-base text-zinc-900 truncate">{user.fullName}</h2>
              <p className="text-[10px] lg:text-[11px] text-zinc-500 truncate">{user.email}</p>
              <span className="inline-block mt-0.5 lg:mt-1 text-[9px] font-bold uppercase tracking-widest text-zinc-500 border border-zinc-200 rounded-full px-2 py-0.5">
                {user.role || 'buyer'}
              </span>
            </div>
          </div>

          {/* Tabs */}
          <nav className="flex lg:flex-col gap-1 flex-1 lg:flex-none">
            {TABS.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2 px-3 py-2 lg:py-2.5 rounded-lg text-[11px] lg:text-xs font-semibold uppercase tracking-wider transition-all cursor-pointer whitespace-nowrap ${
                    activeTab === tab.id
                      ? 'bg-zinc-900 text-white shadow-sm'
                      : 'text-zinc-500 hover:bg-zinc-50 hover:text-zinc-800'
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </nav>

          {/* Logout at bottom (desktop only) */}
          <div className="hidden lg:block mt-auto pt-4 border-t border-zinc-100">
            <button onClick={onLogout} className="editorial-secondary-pill w-full py-2 text-[10px] font-bold uppercase tracking-wider flex items-center justify-center gap-1.5 cursor-pointer">
              <LogOut className="w-3 h-3" />
              <span>Sign Out</span>
            </button>
          </div>
        </aside>

        {/* ── RIGHT CONTENT ── */}
        <section className="flex-1 overflow-y-auto scrollbar-none px-4 sm:px-6 lg:px-8 py-4 lg:py-6">

          {/* ─── PERSONAL INFO TAB ─── */}
          {activeTab === 'personal' && (
            <div className="max-w-lg animate-fade-in">
              <h3 className="font-heading font-bold text-base lg:text-lg text-zinc-900 uppercase tracking-tight mb-4">Personal Information</h3>

              <div className="space-y-3">
                <div>
                  <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest block mb-1">Full Name</label>
                  <input
                    type="text"
                    value={formData.fullName}
                    onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                    className="editorial-underline-input w-full text-sm py-2"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest block mb-1">Email</label>
                  <input
                    type="email"
                    value={user.email || ''}
                    disabled
                    className="editorial-underline-input w-full text-sm py-2 opacity-50 cursor-not-allowed"
                  />
                  <p className="text-[9px] text-zinc-400 mt-0.5">Email cannot be changed</p>
                </div>
                <div>
                  <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest block mb-1">Contact Number</label>
                  <input
                    type="tel"
                    value={formData.contactNumber}
                    onChange={(e) => setFormData({ ...formData, contactNumber: e.target.value })}
                    className="editorial-underline-input w-full text-sm py-2"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest block mb-1">Role</label>
                  <div className="text-sm font-semibold text-zinc-700 capitalize py-2">{user.role || 'buyer'}</div>
                </div>
                {user.createdAt && (
                  <div>
                    <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest block mb-1">Member Since</label>
                    <div className="text-sm text-zinc-600 py-2">{formatDate(user.createdAt)}</div>
                  </div>
                )}
              </div>

              <div className="flex gap-2 mt-5">
                <button onClick={handleSaveProfile} disabled={loading} className="editorial-black-pill px-6 py-2.5 text-[11px] uppercase tracking-wider flex items-center gap-2 cursor-pointer disabled:opacity-50">
                  <Save className="w-3.5 h-3.5" />
                  <span>{loading ? 'Saving...' : 'Save Changes'}</span>
                </button>
                <button onClick={onLogout} className="editorial-secondary-pill px-5 py-2.5 text-[11px] font-bold uppercase tracking-wider flex items-center gap-1.5 cursor-pointer lg:hidden">
                  <LogOut className="w-3 h-3" />
                  <span>Sign Out</span>
                </button>
              </div>
            </div>
          )}

          {/* ─── ADDRESSES TAB ─── */}
          {activeTab === 'addresses' && (
            <div className="max-w-lg animate-fade-in">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-heading font-bold text-base lg:text-lg text-zinc-900 uppercase tracking-tight">Delivery Addresses</h3>
                {!showAddressForm && (
                  <button
                    onClick={() => { setShowAddressForm(true); setEditingIndex(null); setAddressForm({ label: 'Home', street: '', city: '', state: '', zipCode: '' }); }}
                    className="editorial-black-pill px-4 py-2 text-[10px] uppercase tracking-wider flex items-center gap-1.5 cursor-pointer"
                  >
                    <Plus className="w-3 h-3" />
                    <span>Add New</span>
                  </button>
                )}
              </div>

              {/* Add/Edit Address Form */}
              {showAddressForm && (
                <div className="p-4 bg-zinc-50/60 rounded-xl border border-zinc-100 mb-4 animate-fade-in">
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="text-xs font-bold text-zinc-900 uppercase tracking-wider">
                      {editingIndex !== null ? 'Edit Address' : 'New Address'}
                    </h4>
                    <button onClick={() => { setShowAddressForm(false); setEditingIndex(null); }} className="p-1 rounded-full hover:bg-zinc-200 cursor-pointer">
                      <X className="w-3.5 h-3.5 text-zinc-500" />
                    </button>
                  </div>
                  <div className="space-y-2.5">
                    <div>
                      <label className="text-[9px] font-bold text-zinc-400 uppercase tracking-widest block mb-0.5">Label</label>
                      <select value={addressForm.label} onChange={(e) => setAddressForm({ ...addressForm, label: e.target.value })} className="w-full border border-zinc-200 rounded-lg px-3 py-1.5 text-xs bg-white focus:border-zinc-900 outline-none">
                        <option value="Home">Home</option>
                        <option value="Work">Work</option>
                        <option value="Other">Other</option>
                      </select>
                    </div>
                    <div>
                      <label className="text-[9px] font-bold text-zinc-400 uppercase tracking-widest block mb-0.5">Street Address</label>
                      <input type="text" value={addressForm.street} onChange={(e) => setAddressForm({ ...addressForm, street: e.target.value })} placeholder="123 Main St, Apt 4B" className="w-full border border-zinc-200 rounded-lg px-3 py-1.5 text-xs bg-white focus:border-zinc-900 outline-none" />
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="text-[9px] font-bold text-zinc-400 uppercase tracking-widest block mb-0.5">City</label>
                        <input type="text" value={addressForm.city} onChange={(e) => setAddressForm({ ...addressForm, city: e.target.value })} className="w-full border border-zinc-200 rounded-lg px-3 py-1.5 text-xs bg-white focus:border-zinc-900 outline-none" />
                      </div>
                      <div>
                        <label className="text-[9px] font-bold text-zinc-400 uppercase tracking-widest block mb-0.5">State</label>
                        <input type="text" value={addressForm.state} onChange={(e) => setAddressForm({ ...addressForm, state: e.target.value })} className="w-full border border-zinc-200 rounded-lg px-3 py-1.5 text-xs bg-white focus:border-zinc-900 outline-none" />
                      </div>
                    </div>
                    <div>
                      <label className="text-[9px] font-bold text-zinc-400 uppercase tracking-widest block mb-0.5">ZIP Code</label>
                      <input type="text" value={addressForm.zipCode} onChange={(e) => setAddressForm({ ...addressForm, zipCode: e.target.value })} className="w-32 border border-zinc-200 rounded-lg px-3 py-1.5 text-xs bg-white focus:border-zinc-900 outline-none" />
                    </div>
                  </div>
                  <div className="flex gap-2 mt-3">
                    <button onClick={handleSaveAddress} disabled={loading} className="editorial-black-pill px-5 py-2 text-[10px] uppercase tracking-wider cursor-pointer disabled:opacity-50">
                      {loading ? 'Saving...' : (editingIndex !== null ? 'Update' : 'Save Address')}
                    </button>
                    <button onClick={() => { setShowAddressForm(false); setEditingIndex(null); }} className="editorial-secondary-pill px-4 py-2 text-[10px] font-bold uppercase tracking-wider cursor-pointer">
                      Cancel
                    </button>
                  </div>
                </div>
              )}

              {/* Address List */}
              {addresses.length === 0 && !showAddressForm && (
                <div className="text-center py-10">
                  <MapPin className="w-10 h-10 text-zinc-200 mx-auto mb-3" />
                  <p className="text-sm text-zinc-500">No delivery addresses yet</p>
                  <p className="text-[11px] text-zinc-400 mt-1">Add your first address to speed up checkout</p>
                </div>
              )}

              <div className="space-y-2">
                {addresses.map((addr, index) => (
                  <div key={index} className={`p-3 rounded-xl border transition-all ${addr.isDefault ? 'border-zinc-900 bg-zinc-50/40' : 'border-zinc-100 bg-white'}`}>
                    <div className="flex items-start justify-between">
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] font-bold text-zinc-900 uppercase tracking-wider">{addr.label}</span>
                          {addr.isDefault && (
                            <span className="text-[8px] font-bold text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded-full uppercase tracking-wider">Default</span>
                          )}
                        </div>
                        <p className="text-xs text-zinc-600 mt-0.5">{addr.street}</p>
                        <p className="text-[11px] text-zinc-500">{addr.city}, {addr.state} - {addr.zipCode}</p>
                      </div>
                      <div className="flex items-center gap-1 flex-shrink-0">
                        {!addr.isDefault && (
                          <button onClick={() => handleSetDefault(index)} className="text-[9px] font-semibold text-zinc-500 hover:text-zinc-900 px-1.5 py-0.5 rounded cursor-pointer transition-colors">
                            Set Default
                          </button>
                        )}
                        <button onClick={() => handleEditAddress(index)} className="p-1 rounded-full hover:bg-zinc-100 text-zinc-400 hover:text-zinc-700 cursor-pointer transition-colors">
                          <Edit3 className="w-3 h-3" />
                        </button>
                        <button onClick={() => handleDeleteAddress(index)} className="p-1 rounded-full hover:bg-rose-50 text-zinc-400 hover:text-rose-500 cursor-pointer transition-colors">
                          <Trash2 className="w-3 h-3" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ─── ORDER HISTORY TAB ─── */}
          {activeTab === 'orders' && (
            <div className="max-w-2xl animate-fade-in">
              <h3 className="font-heading font-bold text-base lg:text-lg text-zinc-900 uppercase tracking-tight mb-4">Order History</h3>

              {orders.length === 0 && (
                <div className="text-center py-10">
                  <Package className="w-10 h-10 text-zinc-200 mx-auto mb-3" />
                  <p className="text-sm text-zinc-500">No orders yet</p>
                  <p className="text-[11px] text-zinc-400 mt-1">Your placed orders will appear here</p>
                  <Link to="/" className="editorial-black-pill inline-flex px-5 py-2 text-[10px] uppercase tracking-wider mt-4">
                    Start Shopping
                  </Link>
                </div>
              )}

              <div className="space-y-3">
                {orders.map((order) => (
                  <div key={order.id} className="p-3 sm:p-4 rounded-xl border border-zinc-100 bg-zinc-50/40">
                    {/* Order header */}
                    <div className="flex items-center justify-between mb-2.5 pb-2 border-b border-zinc-100">
                      <div>
                        <span className="text-[10px] font-bold text-zinc-900 uppercase tracking-wider">{order.id}</span>
                        <p className="text-[10px] text-zinc-500 mt-0.5">{formatDate(order.date)}</p>
                      </div>
                      <div className="text-right">
                        <span className={`text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${
                          order.status === 'Confirmed' ? 'bg-emerald-50 text-emerald-600' :
                          order.status === 'Delivered' ? 'bg-zinc-100 text-zinc-600' :
                          'bg-amber-50 text-amber-600'
                        }`}>{order.status}</span>
                        <p className="font-heading font-bold text-sm text-zinc-900 mt-0.5">{formatPrice(order.total)}</p>
                      </div>
                    </div>
                    {/* Order items */}
                    <div className="space-y-1.5">
                      {order.items.map((item, idx) => {
                        const imgUrl = item.product?.images?.[0]?.url || (typeof item.product?.images?.[0] === 'string' ? item.product.images[0] : null);
                        return (
                          <div key={idx} className="flex items-center gap-2.5">
                            <div className="w-10 h-10 rounded-lg overflow-hidden bg-zinc-100 flex-shrink-0">
                              {imgUrl ? (
                                <img src={imgUrl} alt={item.product?.title} className="w-full h-full object-cover" />
                              ) : (
                                <div className="w-full h-full flex items-center justify-center text-zinc-300">
                                  <ShoppingBag className="w-4 h-4 stroke-1" />
                                </div>
                              )}
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-xs font-semibold text-zinc-900 truncate">{item.product?.title}</p>
                              <p className="text-[10px] text-zinc-500">Size: {item.size} • {item.color} • Qty: {item.quantity}</p>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

        </section>
      </main>
    </div>
  );
}
