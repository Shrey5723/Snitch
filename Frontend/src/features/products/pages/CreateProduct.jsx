import React, { useState, useRef, useEffect, useMemo } from 'react';
import { Link, useNavigate } from 'react-router';
import { useSelector } from 'react-redux';
import {
  UploadCloud,
  X,
  Plus,
  Minus,
  Image as ImageIcon,
  Loader2,
  CheckCircle2,
  AlertCircle,
  ShieldCheck,
  ArrowLeft,
  Sparkles,
  Layers,
  Tag,
  DollarSign,
  FileText,
  Eye,
  Info,
  Trash2,
  Star,
  RefreshCw,
  ShoppingBag,
  Heart,
  Package,
  Palette,
  Sliders,
  Check
} from 'lucide-react';
import useProduct from '../Hooks/useProduct.js';

const CURRENCY_OPTIONS = [
  { code: 'INR', symbol: '₹', label: 'INR (₹) - Indian Rupee' },
  { code: 'USD', symbol: '$', label: 'USD ($) - US Dollar' },
  { code: 'EUR', symbol: '€', label: 'EUR (€) - Euro' },
  { code: 'GBP', symbol: '£', label: 'GBP (£) - British Pound' },
];

const CATEGORY_OPTIONS = [
  'Shirts',
  'Jackets',
  'Pants',
  'Sneakers',
  'Accessories'
];

const POPULAR_TYPES = [
  'Oversized Boxy Tee',
  'Heavyweight Hoodie',
  'Varsity Bomber',
  'Pleated Cargo Pants',
  'Cuban Collar Shirt',
  'Acid Washed Denim',
  'Puffer Jacket',
  'Tailored Trousers'
];

const COLOR_PRESETS = [
  { name: 'Obsidian Black', hex: '#18181b', border: 'border-zinc-800' },
  { name: 'Charcoal Grey', hex: '#52525b', border: 'border-zinc-500' },
  { name: 'Concrete Stone', hex: '#a1a1aa', border: 'border-zinc-400' },
  { name: 'Vintage Off-White', hex: '#f4f4f5', border: 'border-zinc-300' },
  { name: 'Sage Green', hex: '#4d5b4e', border: 'border-emerald-800' },
  { name: 'Midnight Navy', hex: '#1e293b', border: 'border-slate-800' },
  { name: 'Mocha Brown', hex: '#4a3728', border: 'border-amber-900' },
];

const PRESET_TAGS = [
  'Oversized',
  'Luxury Streetwear',
  'Heavyweight',
  'Outerwear',
  'Drop 01',
  'Limited Edition',
  'Minimalist',
  'Autumn / Winter',
];

export default function CreateProduct() {
  const navigate = useNavigate();
  const currentUser = useSelector((state) => state.auth?.user);
  const { handleCreateProduct, loading, error, successMessage, clearMessages } = useProduct();
  const fileInputRef = useRef(null);

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    priceAmount: '',
    priceCurrency: 'INR',
    category: 'Shirts',
    type: 'Oversized Boxy Tee',
    buildSummary: '',
  });

  // Size stock breakdown
  const [sizeStock, setSizeStock] = useState({
    S: 10,
    M: 15,
    L: 12,
    XL: 8,
    XXL: 5,
  });

  // Colors
  const [selectedColors, setSelectedColors] = useState(['Obsidian Black', 'Charcoal Grey']);
  const [customColors, setCustomColors] = useState([]);
  const [customColorInput, setCustomColorInput] = useState('');

  const [selectedTags, setSelectedTags] = useState(['Luxury Streetwear', 'Oversized']);
  const [images, setImages] = useState([]);
  const [imagePreviews, setImagePreviews] = useState([]);
  const [activePreviewIndex, setActivePreviewIndex] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [formErrors, setFormErrors] = useState({});
  const [localSuccess, setLocalSuccess] = useState(null);
  const [draftSavedToast, setDraftSavedToast] = useState(false);

  // Total stock units
  const totalStock = useMemo(() => {
    return Object.values(sizeStock).reduce((acc, val) => acc + (Number(val) || 0), 0);
  }, [sizeStock]);

  // Load draft from localStorage on mount if available
  useEffect(() => {
    try {
      const savedDraft = localStorage.getItem('snitch_create_product_draft');
      if (savedDraft) {
        const parsed = JSON.parse(savedDraft);
        if (parsed.formData) setFormData((prev) => ({ ...prev, ...parsed.formData }));
        if (parsed.sizeStock) setSizeStock(parsed.sizeStock);
        if (parsed.selectedColors) {
          setSelectedColors(parsed.selectedColors);
          const presetNames = COLOR_PRESETS.map((p) => p.name.toLowerCase());
          const deducedCustom = parsed.selectedColors.filter(
            (c) => !presetNames.includes(c.toLowerCase())
          );
          setCustomColors(deducedCustom);
        }
        if (parsed.customColors) setCustomColors(parsed.customColors);
        if (parsed.selectedTags) setSelectedTags(parsed.selectedTags);
      }
    } catch (e) {
      console.warn('Could not load product draft:', e);
    }
  }, []);

  // Cleanup object URLs on unmount or images update
  useEffect(() => {
    return () => {
      imagePreviews.forEach((url) => URL.revokeObjectURL(url));
    };
  }, [imagePreviews]);

  // Handle image files addition
  const handleAddFiles = (newFiles) => {
    const validImageFiles = [];
    const newErrors = { ...formErrors };
    delete newErrors.images;

    const currentCount = images.length;
    const remainingSlots = 7 - currentCount;

    if (remainingSlots <= 0) {
      setFormErrors((prev) => ({
        ...prev,
        images: 'Maximum 7 images allowed per product drop.',
      }));
      return;
    }

    const filesToProcess = Array.from(newFiles).slice(0, remainingSlots);

    for (const file of filesToProcess) {
      if (!file.type.startsWith('image/')) {
        newErrors.images = 'Only image files (JPG, PNG, WEBP) are supported.';
        continue;
      }
      if (file.size > 7 * 1024 * 1024) {
        newErrors.images = 'Individual images must not exceed 7MB.';
        continue;
      }
      validImageFiles.push(file);
    }

    if (validImageFiles.length > 0) {
      const newPreviews = validImageFiles.map((file) => URL.createObjectURL(file));
      setImages((prev) => [...prev, ...validImageFiles]);
      setImagePreviews((prev) => [...prev, ...newPreviews]);
    }

    setFormErrors(newErrors);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleAddFiles(e.dataTransfer.files);
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleFileInputChange = (e) => {
    if (e.target.files && e.target.files.length > 0) {
      handleAddFiles(e.target.files);
    }
  };

  const handleRemoveImage = (indexToRemove, e) => {
    e.stopPropagation();
    URL.revokeObjectURL(imagePreviews[indexToRemove]);

    const updatedFiles = images.filter((_, idx) => idx !== indexToRemove);
    const updatedPreviews = imagePreviews.filter((_, idx) => idx !== indexToRemove);

    setImages(updatedFiles);
    setImagePreviews(updatedPreviews);

    if (activePreviewIndex >= updatedPreviews.length) {
      setActivePreviewIndex(Math.max(0, updatedPreviews.length - 1));
    }
  };

  const handleSetCoverImage = (index, e) => {
    e.stopPropagation();
    if (index === 0) return;

    const fileToMove = images[index];
    const previewToMove = imagePreviews[index];

    const updatedFiles = [
      fileToMove,
      ...images.slice(0, index),
      ...images.slice(index + 1),
    ];
    const updatedPreviews = [
      previewToMove,
      ...imagePreviews.slice(0, index),
      ...imagePreviews.slice(index + 1),
    ];

    setImages(updatedFiles);
    setImagePreviews(updatedPreviews);
    setActivePreviewIndex(0);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    if (formErrors[name]) {
      setFormErrors((prev) => ({ ...prev, [name]: null }));
    }
    if (error || successMessage) {
      clearMessages();
    }
  };

  const handleSizeStockChange = (size, delta) => {
    setSizeStock((prev) => {
      const current = Number(prev[size]) || 0;
      const updated = Math.max(0, current + delta);
      return { ...prev, [size]: updated };
    });
    if (formErrors.stock) {
      setFormErrors((prev) => ({ ...prev, stock: null }));
    }
  };

  const handleSizeStockDirectInput = (size, val) => {
    const parsed = parseInt(val, 10);
    const num = isNaN(parsed) ? 0 : Math.max(0, parsed);
    setSizeStock((prev) => ({
      ...prev,
      [size]: num,
    }));
    if (formErrors.stock) {
      setFormErrors((prev) => ({ ...prev, stock: null }));
    }
  };

  const handleToggleColor = (colorName) => {
    setSelectedColors((prev) =>
      prev.includes(colorName) ? prev.filter((c) => c !== colorName) : [...prev, colorName]
    );
  };

  const handleRemoveColor = (colorName) => {
    setSelectedColors((prev) => prev.filter((c) => c !== colorName));
  };

  const handleDeleteCustomColor = (colorName, e) => {
    if (e) e.stopPropagation();
    setSelectedColors((prev) => prev.filter((c) => c !== colorName));
    setCustomColors((prev) => prev.filter((c) => c !== colorName));
  };

  const handleAddCustomColor = (e) => {
    if (e) e.preventDefault();
    const trimmed = customColorInput.trim();
    if (!trimmed) return;

    const presetMatch = COLOR_PRESETS.find(
      (p) => p.name.toLowerCase() === trimmed.toLowerCase()
    );
    const colorName = presetMatch ? presetMatch.name : trimmed;

    if (!presetMatch) {
      setCustomColors((prev) => {
        const exists = prev.some((c) => c.toLowerCase() === trimmed.toLowerCase());
        return exists ? prev : [...prev, trimmed];
      });
    }

    setSelectedColors((prev) => {
      const exists = prev.some((c) => c.toLowerCase() === colorName.toLowerCase());
      return exists ? prev : [...prev, colorName];
    });

    setCustomColorInput('');
  };

  const handleToggleTag = (tag) => {
    setSelectedTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
    );
  };

  const validate = () => {
    const errs = {};

    if (!formData.title.trim()) {
      errs.title = 'Product title is required';
    } else if (formData.title.trim().length < 3) {
      errs.title = 'Product title must be at least 3 characters';
    }

    if (!formData.description.trim()) {
      errs.description = 'Product description & specifications are required';
    } else if (formData.description.trim().length < 3) {
      errs.description = 'Description must be at least 3 characters';
    }

    if (!formData.priceAmount || formData.priceAmount.toString().trim() === '') {
      errs.priceAmount = 'Price amount is required';
    } else if (isNaN(Number(formData.priceAmount)) || Number(formData.priceAmount) <= 0) {
      errs.priceAmount = 'Please enter a valid positive price number';
    }

    if (!formData.priceCurrency || formData.priceCurrency.trim().length < 3) {
      errs.priceCurrency = 'Valid currency code is required';
    }

    if (totalStock <= 0) {
      errs.stock = 'Please assign stock to at least one size (total stock must be > 0)';
    }

    if (images.length === 0) {
      errs.images = 'Please upload at least 1 product image';
    }

    setFormErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) {
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }

    const payload = new FormData();
    payload.append('title', formData.title.trim());
    payload.append('description', formData.description.trim());
    payload.append('priceAmount', formData.priceAmount);
    payload.append('priceCurrency', formData.priceCurrency.trim());
    payload.append('category', formData.category);
    payload.append('type', formData.type.trim());
    payload.append('buildSummary', formData.buildSummary.trim());
    payload.append('stock', totalStock);
    payload.append('sizeStock', JSON.stringify(sizeStock));
    payload.append('colors', JSON.stringify(selectedColors));

    images.forEach((file) => {
      payload.append('images', file);
    });

    const result = await handleCreateProduct(payload);

    if (result.success) {
      setLocalSuccess('Product published successfully! Redirecting to Seller Dashboard...');
      localStorage.removeItem('snitch_create_product_draft');

      window.scrollTo({ top: 0, behavior: 'smooth' });

      setTimeout(() => {
        navigate('/seller/dashboard');
      }, 1500);
    } else {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleSaveDraft = () => {
    try {
      localStorage.setItem(
        'snitch_create_product_draft',
        JSON.stringify({
          formData,
          sizeStock,
          selectedColors,
          customColors,
          selectedTags,
          updatedAt: new Date().toISOString(),
        })
      );
      setDraftSavedToast(true);
      setTimeout(() => setDraftSavedToast(false), 2500);
    } catch (e) {
      console.error('Failed to save draft:', e);
    }
  };

  const handleLoadSampleData = () => {
    setFormData({
      title: 'Obsidian Washed Heavyweight Boxy Hoodie',
      description:
        'Crafted from custom 480 GSM French Terry Cotton. Features a double-layered structured hood, dropped shoulders, vintage acid enzyme wash, concealed kangaroo pocket, and minimal tonal Snitch silicon logo at the wrist.',
      priceAmount: '3499',
      priceCurrency: 'INR',
      category: 'Jackets',
      type: 'Heavyweight Hoodie',
      buildSummary:
        '480 GSM 100% French Terry Cotton | Vintage Acid Wash | Concealed YKK Hardware | Reinforced Chain Stitching',
    });
    setSizeStock({ S: 12, M: 24, L: 18, XL: 10, XXL: 6 });
    setSelectedColors(['Obsidian Black', 'Charcoal Grey', 'Concrete Stone']);
    setCustomColors([]);
    setSelectedTags(['Oversized', 'Luxury Streetwear', 'Heavyweight', 'Drop 01']);
    setFormErrors({});
    if (error || successMessage) clearMessages();
  };

  const handleClearForm = () => {
    setFormData({
      title: '',
      description: '',
      priceAmount: '',
      priceCurrency: 'INR',
      category: 'Shirts',
      type: 'Oversized Boxy Tee',
      buildSummary: '',
    });
    setSizeStock({ S: 10, M: 15, L: 12, XL: 8, XXL: 5 });
    setSelectedColors(['Obsidian Black', 'Charcoal Grey']);
    setCustomColors([]);
    setImages([]);
    setImagePreviews([]);
    setSelectedTags(['Luxury Streetwear', 'Oversized']);
    setFormErrors({});
    if (error || successMessage) clearMessages();
    localStorage.removeItem('snitch_create_product_draft');
  };

  const currentCurrencySymbol =
    CURRENCY_OPTIONS.find((c) => c.code === formData.priceCurrency)?.symbol || '₹';

  return (
    <div className="min-h-screen bg-white text-zinc-900 selection:bg-zinc-900 selection:text-white font-body">

      {/* TOP BRAND NAVIGATION BAR */}
      <header className="sticky top-0 z-40 bg-white/90 backdrop-blur-md border-b border-zinc-100 transition-all">
        <div className="max-w-7xl mx-auto px-4 sm:px-8 h-20 flex items-center justify-between">
          
          {/* Back Action & Brand Title */}
          <div className="flex items-center gap-6">
            <Link
              to="/seller/dashboard"
              className="group flex items-center gap-2 text-xs font-semibold tracking-wider uppercase text-zinc-500 hover:text-zinc-900 transition-colors py-2"
            >
              <ArrowLeft className="w-4 h-4 transition-transform group-hover:-translate-x-1" />
              <span>Back to Dashboard</span>
            </Link>

            <div className="h-4 w-px bg-zinc-200 hidden sm:block"></div>

            <div className="flex flex-col">
              <Link to="/seller/dashboard" className="inline-block group">
                <span className="font-heading font-black text-xl sm:text-2xl tracking-[0.35em] text-zinc-900 uppercase">
                  S N I T C H
                </span>
              </Link>
            </div>
          </div>

          {/* Header Action Badges & Draft Status */}
          <div className="flex items-center gap-3">
            {draftSavedToast && (
              <span className="animate-fade-in inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-50 text-emerald-800 text-xs font-medium rounded-full border border-emerald-200">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                Draft Saved
              </span>
            )}

            <button
              type="button"
              onClick={handleLoadSampleData}
              className="editorial-secondary-pill hidden sm:flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-medium text-zinc-600 hover:text-zinc-900 cursor-pointer"
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-500" />
              <span>Fill Sample</span>
            </button>

            <Link
              to="/profile"
              className="flex items-center gap-2 px-3.5 py-1.5 bg-zinc-100 rounded-full text-[11px] font-bold tracking-widest text-zinc-700 uppercase hover:bg-zinc-200 transition-colors cursor-pointer"
              title={`Logged in as ${currentUser?.email || 'Seller'}`}
            >
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              <span className="max-w-[150px] truncate">{currentUser?.email || 'Seller Studio'}</span>
            </Link>
          </div>

        </div>
      </header>

      {/* MAIN STUDIO CONTAINER */}
      <main className="max-w-7xl mx-auto px-4 sm:px-8 py-8 sm:py-12">

        {/* HERO TITLE SECTION */}
        <div className="mb-10 sm:mb-12 max-w-3xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-zinc-100 text-zinc-600 text-[11px] font-bold tracking-widest uppercase mb-3">
            <Layers className="w-3 h-3 text-zinc-500" />
            <span>Product Creation Studio</span>
          </div>
          <h1 className="font-heading font-extrabold text-3xl sm:text-4xl lg:text-5xl text-zinc-900 tracking-tight leading-tight">
            Create New Product
          </h1>
          <p className="mt-2.5 text-sm sm:text-base text-zinc-500 leading-relaxed">
            Configure apparel drops with complete specifications: per-size inventory stocks, luxury colorways, silhouette types, and precision build summaries.
          </p>
        </div>

        {/* STATUS & NOTIFICATION BANNERS */}
        {(error || localSuccess || successMessage) && (
          <div
            className={`mb-8 p-4 sm:p-5 rounded-2xl flex items-start gap-3.5 text-sm font-medium border animate-fade-in transition-all ${
              localSuccess || successMessage
                ? 'bg-emerald-50 text-emerald-900 border-emerald-200'
                : 'bg-rose-50 text-rose-900 border-rose-200'
            }`}
          >
            {localSuccess || successMessage ? (
              <CheckCircle2 className="w-5 h-5 text-emerald-600 flex-shrink-0 mt-0.5" />
            ) : (
              <AlertCircle className="w-5 h-5 text-rose-600 flex-shrink-0 mt-0.5" />
            )}
            <div className="flex-1">
              <p className="font-semibold">
                {localSuccess || successMessage ? 'Success!' : 'Unable to Publish Product'}
              </p>
              <p className="mt-0.5 text-xs sm:text-sm opacity-90">
                {localSuccess || successMessage || error}
              </p>
            </div>
            {error && (error.toLowerCase().includes('seller') || error.toLowerCase().includes('access denied')) && (
              <Link
                to="/login"
                className="self-center px-4 py-1.5 bg-zinc-900 text-white rounded-full text-xs font-bold hover:bg-zinc-800 transition-colors shrink-0"
              >
                Sign In as Seller
              </Link>
            )}
            {localSuccess && (
              <Link
                to="/seller/dashboard"
                className="self-center px-4 py-1.5 bg-emerald-600 text-white rounded-full text-xs font-bold hover:bg-emerald-700 transition-colors shrink-0"
              >
                Go to Dashboard
              </Link>
            )}
          </div>
        )}

        {/* 2-COLUMN STUDIO WORKSPACE */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start">

          {/* LEFT FORM COLUMN (7 COLS) */}
          <div className="lg:col-span-7">
            <div className="editorial-card p-6 sm:p-10 transition-shadow duration-300">
              
              <form onSubmit={handleSubmit} className="space-y-8">

                {/* 1. VISUAL MEDIA UPLOAD SECTION */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <label className="block text-xs font-bold uppercase tracking-wider text-zinc-800">
                      Product Imagery <span className="text-zinc-400 font-normal">({images.length}/7 photos)</span>
                    </label>
                    <span className="text-[11px] text-zinc-400 font-medium">Max 7MB per photo</span>
                  </div>

                  {/* Hidden File Input */}
                  <input
                    ref={fileInputRef}
                    type="file"
                    multiple
                    accept="image/*"
                    onChange={handleFileInputChange}
                    className="hidden"
                  />

                  {/* Drag and Drop Zone */}
                  <div
                    onDrop={handleDrop}
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                    onClick={() => fileInputRef.current?.click()}
                    className={`border-2 border-dashed rounded-2xl p-6 sm:p-8 flex flex-col items-center justify-center text-center cursor-pointer transition-all duration-200 ${
                      isDragging
                        ? 'border-zinc-900 bg-zinc-50 scale-[0.99]'
                        : formErrors.images
                        ? 'border-rose-300 bg-rose-50/20'
                        : 'border-zinc-200 hover:border-zinc-400 hover:bg-zinc-50/50'
                    }`}
                  >
                    <div className="w-12 h-12 rounded-full bg-zinc-100 flex items-center justify-center text-zinc-700 mb-3">
                      <UploadCloud className="w-6 h-6 stroke-[1.5]" />
                    </div>
                    <p className="text-sm font-semibold text-zinc-900 mb-1">
                      Drag &amp; drop images or <span className="underline font-bold">browse</span>
                    </p>
                    <p className="text-xs text-zinc-400">
                      High-resolution JPG, PNG, WEBP on neutral editorial studio backgrounds
                    </p>
                  </div>

                  {formErrors.images && (
                    <p className="text-xs text-rose-500 font-medium flex items-center gap-1 mt-1">
                      <AlertCircle className="w-3.5 h-3.5" />
                      {formErrors.images}
                    </p>
                  )}

                  {/* Image Thumbnails Carousel / Grid */}
                  {imagePreviews.length > 0 && (
                    <div className="mt-4">
                      <div className="grid grid-cols-4 sm:grid-cols-7 gap-2.5">
                        {imagePreviews.map((previewUrl, idx) => (
                          <div
                            key={idx}
                            onClick={() => setActivePreviewIndex(idx)}
                            className={`relative aspect-[3/4] rounded-xl overflow-hidden cursor-pointer border-2 transition-all ${
                              activePreviewIndex === idx
                                ? 'border-zinc-900 shadow-md ring-2 ring-zinc-900/10'
                                : 'border-zinc-200 hover:border-zinc-400 opacity-80 hover:opacity-100'
                            }`}
                          >
                            <img
                              src={previewUrl}
                              alt={`Preview ${idx + 1}`}
                              className="w-full h-full object-cover"
                            />

                            {/* Cover Badge */}
                            {idx === 0 && (
                              <span className="absolute bottom-1 left-1 bg-black/80 text-white text-[9px] font-bold px-1.5 py-0.5 rounded uppercase tracking-wider">
                                Cover
                              </span>
                            )}

                            {/* Set As Cover Button */}
                            {idx !== 0 && (
                              <button
                                type="button"
                                onClick={(e) => handleSetCoverImage(idx, e)}
                                title="Set as primary cover"
                                className="absolute top-1 left-1 bg-white/90 hover:bg-white text-zinc-700 p-1 rounded-full opacity-0 hover:opacity-100 transition-opacity"
                              >
                                <Star className="w-3 h-3" />
                              </button>
                            )}

                            {/* Remove Image Button */}
                            <button
                              type="button"
                              onClick={(e) => handleRemoveImage(idx, e)}
                              className="absolute top-1 right-1 bg-black/70 hover:bg-rose-600 text-white p-1 rounded-full transition-colors"
                            >
                              <X className="w-3 h-3" />
                            </button>
                          </div>
                        ))}

                        {/* Add More Slot */}
                        {images.length < 7 && (
                          <button
                            type="button"
                            onClick={() => fileInputRef.current?.click()}
                            className="aspect-[3/4] rounded-xl border-2 border-dashed border-zinc-200 hover:border-zinc-400 bg-zinc-50/50 hover:bg-zinc-100 flex flex-col items-center justify-center text-zinc-400 hover:text-zinc-800 transition-all cursor-pointer"
                          >
                            <Plus className="w-5 h-5 mb-1" />
                            <span className="text-[10px] font-bold uppercase tracking-wider">Add</span>
                          </button>
                        )}
                      </div>
                    </div>
                  )}
                </div>

                <div className="border-t border-zinc-100"></div>

                {/* 2. BASIC PRODUCT DETAILS */}
                <div className="space-y-6">
                  
                  {/* Product Title */}
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-zinc-800 mb-2">
                      Product Title <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="text"
                      name="title"
                      value={formData.title}
                      onChange={handleInputChange}
                      placeholder="e.g. Obsidian Heavyweight Acid-Washed Boxy Tee"
                      className={`editorial-underline-input text-base ${
                        formErrors.title ? 'editorial-underline-input-error' : ''
                      }`}
                    />
                    {formErrors.title ? (
                      <p className="mt-1.5 text-[11px] text-rose-500 font-medium">
                        {formErrors.title}
                      </p>
                    ) : (
                      <p className="mt-1.5 text-[11px] text-zinc-400">
                        Include fit, colorway, and silhouette for optimal discoverability.
                      </p>
                    )}
                  </div>

                  {/* Price and Currency Grid */}
                  <div className="grid grid-cols-1 sm:grid-cols-12 gap-4">
                    
                    {/* Price Amount */}
                    <div className="sm:col-span-7">
                      <label className="block text-xs font-bold uppercase tracking-wider text-zinc-800 mb-2">
                        Retail Price <span className="text-rose-500">*</span>
                      </label>
                      <div
                        className={`flex items-center border-b-1.5 transition-colors py-2 px-0.5 ${
                          formErrors.priceAmount
                            ? 'border-rose-500'
                            : 'border-zinc-200 focus-within:border-zinc-900'
                        }`}
                      >
                        <span className="text-base font-bold text-zinc-500 mr-2.5 select-none shrink-0">
                          {currentCurrencySymbol}
                        </span>
                        <input
                          type="number"
                          name="priceAmount"
                          value={formData.priceAmount}
                          onChange={handleInputChange}
                          placeholder="2499"
                          min="1"
                          step="any"
                          className="w-full bg-transparent border-none outline-none text-base font-semibold text-zinc-900 placeholder:text-zinc-400 p-0"
                        />
                      </div>
                      {formErrors.priceAmount && (
                        <p className="mt-1.5 text-[11px] text-rose-500 font-medium">
                          {formErrors.priceAmount}
                        </p>
                      )}
                    </div>

                    {/* Currency Selector */}
                    <div className="sm:col-span-5">
                      <label className="block text-xs font-bold uppercase tracking-wider text-zinc-800 mb-2">
                        Currency <span className="text-rose-500">*</span>
                      </label>
                      <select
                        name="priceCurrency"
                        value={formData.priceCurrency}
                        onChange={handleInputChange}
                        className="w-full bg-transparent border-b-1.5 border-zinc-200 py-2.5 px-1 text-sm font-medium text-zinc-900 outline-none focus:border-zinc-900 transition-colors cursor-pointer"
                      >
                        {CURRENCY_OPTIONS.map((cur) => (
                          <option key={cur.code} value={cur.code}>
                            {cur.code} ({cur.symbol})
                          </option>
                        ))}
                      </select>
                    </div>

                  </div>

                  {/* Category & Product Type Grid */}
                  <div className="grid grid-cols-1 sm:grid-cols-12 gap-4 pt-2">
                    
                    {/* Category Dropdown */}
                    <div className="sm:col-span-6">
                      <label className="block text-xs font-bold uppercase tracking-wider text-zinc-800 mb-2">
                        Category <span className="text-rose-500">*</span>
                      </label>
                      <select
                        name="category"
                        value={formData.category}
                        onChange={handleInputChange}
                        className="w-full bg-zinc-50 border border-zinc-200 rounded-xl px-3.5 py-2.5 text-sm font-semibold text-zinc-900 outline-none focus:border-zinc-900 transition-colors cursor-pointer"
                      >
                        {CATEGORY_OPTIONS.map((cat) => (
                          <option key={cat} value={cat}>
                            {cat}
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* Silhouette / Type Input */}
                    <div className="sm:col-span-6">
                      <label className="block text-xs font-bold uppercase tracking-wider text-zinc-800 mb-2">
                        Product Type / Silhouette
                      </label>
                      <input
                        type="text"
                        name="type"
                        value={formData.type}
                        onChange={handleInputChange}
                        placeholder="e.g. Heavyweight Hoodie"
                        className="w-full bg-zinc-50 border border-zinc-200 rounded-xl px-3.5 py-2.5 text-sm font-medium text-zinc-900 outline-none focus:border-zinc-900 transition-colors"
                      />
                    </div>

                  </div>

                  {/* Quick Type Suggestions */}
                  <div className="flex flex-wrap items-center gap-1.5">
                    <span className="text-[10px] uppercase font-bold text-zinc-400 mr-1">Suggestions:</span>
                    {POPULAR_TYPES.map((t) => (
                      <button
                        key={t}
                        type="button"
                        onClick={() => setFormData((prev) => ({ ...prev, type: t }))}
                        className={`text-[11px] px-2.5 py-1 rounded-lg border transition-colors cursor-pointer ${
                          formData.type === t
                            ? 'bg-zinc-900 text-white border-zinc-900'
                            : 'bg-zinc-50 text-zinc-600 border-zinc-200 hover:bg-zinc-100'
                        }`}
                      >
                        {t}
                      </button>
                    ))}
                  </div>

                  {/* Description & Specifications Textarea */}
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <label className="block text-xs font-bold uppercase tracking-wider text-zinc-800">
                        Description & Story <span className="text-rose-500">*</span>
                      </label>
                      <span className="text-[11px] text-zinc-400 font-medium">
                        {formData.description.length} characters
                      </span>
                    </div>
                    <textarea
                      name="description"
                      rows={3}
                      value={formData.description}
                      onChange={handleInputChange}
                      placeholder="Describe the silhouette, fit, tailoring story, and drop narrative..."
                      className={`editorial-box-input text-sm leading-relaxed resize-y min-h-[90px] ${
                        formErrors.description ? 'editorial-box-input-error' : ''
                      }`}
                    />
                    {formErrors.description && (
                      <p className="mt-1.5 text-[11px] text-rose-500 font-medium">
                        {formErrors.description}
                      </p>
                    )}
                  </div>

                </div>

                <div className="border-t border-zinc-100"></div>

                {/* 3. STOCK & SIZE INVENTORY SECTION */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-zinc-800">
                        Size Inventory & Stock Allocation <span className="text-rose-500">*</span>
                      </label>
                      <p className="text-[11px] text-zinc-400 mt-0.5">
                        Assign units for each garment size.
                      </p>
                    </div>
                    <div className="flex items-center gap-1.5 bg-zinc-900 text-white px-3 py-1 rounded-full text-xs font-bold shadow-sm">
                      <Package className="w-3.5 h-3.5" />
                      <span>{totalStock} Units Total</span>
                    </div>
                  </div>

                  {formErrors.stock && (
                    <p className="text-xs text-rose-500 font-medium flex items-center gap-1">
                      <AlertCircle className="w-3.5 h-3.5" />
                      {formErrors.stock}
                    </p>
                  )}

                  {/* Interactive Size Stock Cards */}
                  <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
                    {['S', 'M', 'L', 'XL', 'XXL'].map((sz) => {
                      const count = sizeStock[sz] || 0;
                      return (
                        <div
                          key={sz}
                          className="bg-zinc-50 border border-zinc-200 rounded-xl p-3 flex flex-col items-center justify-between gap-2 text-center"
                        >
                          <span className="font-heading font-black text-sm text-zinc-900">
                            SIZE {sz}
                          </span>

                          <div className="flex items-center gap-1.5 w-full justify-center">
                            <button
                              type="button"
                              onClick={() => handleSizeStockChange(sz, -1)}
                              className="w-7 h-7 rounded-lg bg-white border border-zinc-200 flex items-center justify-center text-zinc-700 hover:bg-zinc-100 font-bold active:scale-95 transition-all"
                            >
                              <Minus className="w-3 h-3" />
                            </button>

                            <input
                              type="number"
                              min="0"
                              value={count}
                              onChange={(e) => handleSizeStockDirectInput(sz, e.target.value)}
                              className="w-12 text-center font-bold text-sm bg-white border border-zinc-200 rounded-lg py-1 text-zinc-900 outline-none focus:border-zinc-900"
                            />

                            <button
                              type="button"
                              onClick={() => handleSizeStockChange(sz, 1)}
                              className="w-7 h-7 rounded-lg bg-white border border-zinc-200 flex items-center justify-center text-zinc-700 hover:bg-zinc-100 font-bold active:scale-95 transition-all"
                            >
                              <Plus className="w-3 h-3" />
                            </button>
                          </div>

                          <span className="text-[10px] text-zinc-400 font-semibold uppercase">
                            {count === 0 ? 'Out of stock' : `${count} pcs`}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>

                <div className="border-t border-zinc-100"></div>

                {/* 4. LUXURY COLORS SELECTION */}
                <div className="space-y-3.5">
                  <div className="flex items-center justify-between">
                    <label className="block text-xs font-bold uppercase tracking-wider text-zinc-800">
                      Garment Colorways ({selectedColors.length} selected)
                    </label>
                    <span className="text-[11px] text-zinc-400">Click color to toggle &bull; &times; to remove</span>
                  </div>

                  {/* Active Selected Colorways Pills (with instant 1-click remove) */}
                  {selectedColors.length > 0 ? (
                    <div className="flex flex-wrap items-center gap-1.5 p-3 bg-zinc-50 rounded-2xl border border-zinc-200/70">
                      <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider mr-1">
                        Active Drop Colors:
                      </span>
                      {selectedColors.map((colorName) => (
                        <span
                          key={colorName}
                          className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-zinc-900 text-white text-xs font-semibold shadow-xs"
                        >
                          <span>{colorName}</span>
                          <button
                            type="button"
                            onClick={() => handleRemoveColor(colorName)}
                            title={`Remove ${colorName}`}
                            className="w-4 h-4 rounded-full hover:bg-zinc-700 flex items-center justify-center text-zinc-400 hover:text-white transition-colors cursor-pointer"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </span>
                      ))}
                    </div>
                  ) : (
                    <p className="text-xs text-amber-600 bg-amber-50 px-3 py-2 rounded-xl border border-amber-200/60 font-medium">
                      No colors selected yet. Click a preset below or add custom colorways.
                    </p>
                  )}

                  {/* Curated Presets */}
                  <div>
                    <span className="block text-[11px] font-bold text-zinc-400 uppercase tracking-wider mb-2">
                      Curated Presets
                    </span>
                    <div className="flex flex-wrap gap-2">
                      {COLOR_PRESETS.map((color) => {
                        const isSelected = selectedColors.includes(color.name);
                        return (
                          <button
                            key={color.name}
                            type="button"
                            onClick={() => handleToggleColor(color.name)}
                            className={`flex items-center gap-2 px-3 py-1.5 rounded-xl border text-xs font-semibold transition-all cursor-pointer ${
                              isSelected
                                ? 'bg-zinc-900 text-white border-zinc-900 shadow-sm'
                                : 'bg-white text-zinc-700 border-zinc-200 hover:border-zinc-400'
                            }`}
                          >
                            <span
                              className={`w-3.5 h-3.5 rounded-full border ${color.border}`}
                              style={{ backgroundColor: color.hex }}
                            ></span>
                            <span>{color.name}</span>
                            {isSelected && <Check className="w-3.5 h-3.5 ml-0.5" />}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Custom Added Colorways (with toggle and delete button) */}
                  {customColors.length > 0 && (
                    <div>
                      <span className="block text-[11px] font-bold text-zinc-400 uppercase tracking-wider mb-2">
                        Custom Colorways
                      </span>
                      <div className="flex flex-wrap gap-2">
                        {customColors.map((customName) => {
                          const isSelected = selectedColors.includes(customName);
                          return (
                            <div
                              key={customName}
                              className={`inline-flex items-center gap-1.5 pl-3 pr-1.5 py-1.5 rounded-xl border text-xs font-semibold transition-all ${
                                isSelected
                                  ? 'bg-zinc-900 text-white border-zinc-900 shadow-sm'
                                  : 'bg-white text-zinc-700 border-zinc-200 hover:border-zinc-400'
                              }`}
                            >
                              <button
                                type="button"
                                onClick={() => handleToggleColor(customName)}
                                className="flex items-center gap-2 cursor-pointer outline-none"
                              >
                                <span className="w-3.5 h-3.5 rounded-full bg-gradient-to-tr from-zinc-700 to-zinc-400 border border-zinc-600 shrink-0"></span>
                                <span>{customName}</span>
                                {isSelected && <Check className="w-3.5 h-3.5 ml-0.5" />}
                              </button>
                              <button
                                type="button"
                                onClick={(e) => handleDeleteCustomColor(customName, e)}
                                title={`Delete custom colorway "${customName}"`}
                                className={`ml-1 w-5 h-5 rounded-full flex items-center justify-center transition-colors cursor-pointer ${
                                  isSelected
                                    ? 'hover:bg-zinc-800 text-zinc-400 hover:text-white'
                                    : 'hover:bg-zinc-100 text-zinc-400 hover:text-rose-600'
                                }`}
                              >
                                <X className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {/* Add Custom Color Input */}
                  <div className="flex items-center gap-2 pt-1">
                    <input
                      type="text"
                      value={customColorInput}
                      onChange={(e) => setCustomColorInput(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          handleAddCustomColor(e);
                        }
                      }}
                      placeholder="Add custom colorway (e.g. Acid Lime, Rust Orange)..."
                      className="flex-1 bg-zinc-50 border border-zinc-200 rounded-xl px-3.5 py-2 text-xs font-medium outline-none focus:border-zinc-900"
                    />
                    <button
                      type="button"
                      onClick={handleAddCustomColor}
                      className="px-4 py-2 bg-zinc-900 hover:bg-zinc-800 text-white text-xs font-bold rounded-xl transition-colors cursor-pointer shrink-0"
                    >
                      Add Color
                    </button>
                  </div>
                </div>

                <div className="border-t border-zinc-100"></div>

                {/* 5. PRODUCT BUILD SUMMARY */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="block text-xs font-bold uppercase tracking-wider text-zinc-800">
                      Product Build Summary & Material Specs
                    </label>
                    <span className="text-[11px] text-zinc-400">Construction &amp; Fabric</span>
                  </div>
                  <textarea
                    name="buildSummary"
                    rows={3}
                    value={formData.buildSummary}
                    onChange={handleInputChange}
                    placeholder="e.g. 480 GSM 100% French Terry Cotton | Custom vintage enzyme stone wash | Concealed YKK zippers | Reinforced double-needle chain stitching..."
                    className="editorial-box-input text-xs sm:text-sm leading-relaxed resize-y min-h-[80px]"
                  />
                  <p className="text-[11px] text-zinc-400">
                    Buyers value technical build details: GSM weight, fabric origin, hardware grade, and wash treatment.
                  </p>
                </div>

                {/* Collection Tags */}
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-zinc-800 mb-2">
                    Collection Badges
                  </label>
                  <div className="flex flex-wrap gap-1.5">
                    {PRESET_TAGS.map((tag) => {
                      const isSelected = selectedTags.includes(tag);
                      return (
                        <button
                          key={tag}
                          type="button"
                          onClick={() => handleToggleTag(tag)}
                          className={`text-xs px-3 py-1.5 rounded-full font-medium transition-all cursor-pointer ${
                            isSelected
                              ? 'bg-zinc-900 text-white shadow-sm'
                              : 'bg-zinc-100 text-zinc-600 hover:bg-zinc-200'
                          }`}
                        >
                          {isSelected && '✓ '}
                          {tag}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* FORM ACTIONS & BUTTONS */}
                <div className="pt-6 border-t border-zinc-100 flex flex-col sm:flex-row items-center justify-between gap-4">
                  
                  {/* Secondary actions */}
                  <div className="flex items-center gap-3 w-full sm:w-auto">
                    <button
                      type="button"
                      onClick={handleSaveDraft}
                      className="editorial-secondary-pill px-5 py-2.5 text-xs font-bold w-full sm:w-auto cursor-pointer"
                    >
                      Save Draft
                    </button>
                    <button
                      type="button"
                      onClick={handleClearForm}
                      className="text-xs text-zinc-400 hover:text-rose-600 transition-colors px-2 py-1 font-medium"
                    >
                      Reset Form
                    </button>
                  </div>

                  {/* Primary Publish Action */}
                  <button
                    type="submit"
                    disabled={loading}
                    className="editorial-black-pill px-8 py-3.5 w-full sm:w-auto flex items-center justify-center gap-2 cursor-pointer disabled:opacity-70 shadow-md hover:shadow-lg transition-all"
                  >
                    {loading ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin text-white" />
                        <span>PUBLISHING DROP...</span>
                      </>
                    ) : (
                      <>
                        <Sparkles className="w-4 h-4 text-amber-300" />
                        <span>Publish Product Drop</span>
                      </>
                    )}
                  </button>

                </div>

              </form>

            </div>

            {/* Brand Authenticity Assurance */}
            <div className="mt-6 flex items-center justify-center gap-2 text-xs text-zinc-400">
              <ShieldCheck className="w-4 h-4 text-zinc-400" />
              <span>Snitch Seller Guarantee • High-Fashion Apparel Quality Standards</span>
            </div>

          </div>

          {/* RIGHT SIDEBAR: LIVE STORE CATALOG PREVIEW & STUDIO SPECS (5 COLS) */}
          <div className="lg:col-span-5 space-y-6">

            {/* LIVE STORE PREVIEW CARD */}
            <div className="sticky top-28 space-y-6">
              
              <div className="bg-zinc-50 border border-zinc-200/80 rounded-3xl p-6 shadow-sm">
                
                {/* Preview Header */}
                <div className="flex items-center justify-between pb-4 mb-4 border-b border-zinc-200/60">
                  <div className="flex items-center gap-2">
                    <Eye className="w-4 h-4 text-zinc-600" />
                    <span className="text-xs font-bold uppercase tracking-wider text-zinc-800">
                      Live Store Card Preview
                    </span>
                  </div>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-zinc-200 text-zinc-700 uppercase tracking-widest">
                    Real-time
                  </span>
                </div>

                {/* Simulated Snitch Product Card */}
                <div className="bg-white rounded-2xl overflow-hidden border border-zinc-100 shadow-md group">
                  
                  {/* Card Image Area */}
                  <div className="relative aspect-[3/4] bg-zinc-100 overflow-hidden">
                    {imagePreviews.length > 0 ? (
                      <img
                        src={imagePreviews[activePreviewIndex] || imagePreviews[0]}
                        alt={formData.title || 'Product Preview'}
                        className="w-full h-full object-cover object-center transition-transform duration-500 group-hover:scale-105"
                      />
                    ) : (
                      <div className="w-full h-full flex flex-col items-center justify-center p-6 text-center text-zinc-300">
                        <ImageIcon className="w-12 h-12 mb-2 stroke-1" />
                        <span className="text-xs font-medium text-zinc-400">
                          Upload photos to preview card appearance
                        </span>
                      </div>
                    )}

                    {/* Badge Overlay */}
                    <div className="absolute top-3 left-3 flex flex-col gap-1">
                      <span className="bg-black text-white text-[10px] font-black uppercase tracking-widest px-2 py-1 rounded shadow">
                        NEW DROP
                      </span>
                      {formData.type && (
                        <span className="bg-white/95 backdrop-blur-sm text-zinc-900 text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded shadow-sm">
                          {formData.type}
                        </span>
                      )}
                    </div>

                    {/* Wishlist Icon Simulation */}
                    <div className="absolute top-3 right-3 w-8 h-8 rounded-full bg-white/90 backdrop-blur-sm shadow flex items-center justify-center text-zinc-700">
                      <Heart className="w-4 h-4" />
                    </div>

                    {/* Image Counter Pill */}
                    {imagePreviews.length > 1 && (
                      <div className="absolute bottom-3 right-3 bg-black/60 backdrop-blur-sm text-white text-[10px] font-bold px-2 py-0.5 rounded-full">
                        {activePreviewIndex + 1} / {imagePreviews.length}
                      </div>
                    )}
                  </div>

                  {/* Card Info Details */}
                  <div className="p-4 sm:p-5 space-y-3">
                    <div>
                      <div className="flex items-center justify-between">
                        <p className="text-[10px] font-bold tracking-[0.2em] text-zinc-400 uppercase">
                          S N I T C H &bull; {formData.category.toUpperCase()}
                        </p>
                        <span className="text-[10px] font-extrabold text-emerald-600 uppercase">
                          {totalStock} In Stock
                        </span>
                      </div>

                      <h3 className="font-heading font-bold text-sm sm:text-base text-zinc-900 line-clamp-1 mt-1">
                        {formData.title || 'Product Title Appears Here'}
                      </h3>
                    </div>

                    {/* Size breakdown pill row */}
                    <div className="flex items-center gap-1">
                      {['S', 'M', 'L', 'XL', 'XXL'].map((sz) => (
                        <span
                          key={sz}
                          className="px-1.5 py-0.5 rounded bg-zinc-100 text-[10px] font-mono text-zinc-600 border border-zinc-200"
                        >
                          {sz}:{sizeStock[sz] || 0}
                        </span>
                      ))}
                    </div>

                    {/* Color dots preview */}
                    {selectedColors.length > 0 && (
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span className="text-[10px] uppercase font-bold text-zinc-400">Colors:</span>
                        {selectedColors.map((col, idx) => (
                          <span
                            key={idx}
                            className="px-2 py-0.5 bg-zinc-100 rounded text-[10px] font-medium text-zinc-700"
                          >
                            {col}
                          </span>
                        ))}
                      </div>
                    )}

                    {/* Build Summary Preview */}
                    {formData.buildSummary && (
                      <div className="p-2.5 bg-zinc-50 rounded-xl border border-zinc-100 text-[11px] text-zinc-600 leading-relaxed italic">
                        &ldquo;{formData.buildSummary}&rdquo;
                      </div>
                    )}

                    {/* Price and Simulated Add Button */}
                    <div className="pt-3 border-t border-zinc-100 flex items-center justify-between">
                      <div className="flex flex-col">
                        <span className="text-[10px] text-zinc-400 font-semibold uppercase">Price</span>
                        <span className="font-heading font-extrabold text-base sm:text-lg text-zinc-900">
                          {currentCurrencySymbol}
                          {formData.priceAmount ? Number(formData.priceAmount).toLocaleString() : '0'}
                        </span>
                      </div>

                      <div className="px-3.5 py-1.5 rounded-full bg-zinc-900 text-white text-xs font-bold flex items-center gap-1.5 shadow-sm">
                        <ShoppingBag className="w-3.5 h-3.5" />
                        <span>Add</span>
                      </div>
                    </div>

                  </div>

                </div>

                {/* Studio Quality Guidelines */}
                <div className="mt-6 pt-5 border-t border-zinc-200/60 space-y-3 text-xs text-zinc-500">
                  <p className="font-bold text-zinc-800 uppercase tracking-wider text-[11px] flex items-center gap-1.5">
                    <Info className="w-3.5 h-3.5 text-zinc-600" />
                    Snitch Seller Curation Standards
                  </p>
                  <ul className="space-y-1.5 list-disc pl-4 text-zinc-500 text-[11px] leading-relaxed">
                    <li>Maintain high-resolution imagery showcasing garment drape</li>
                    <li>Specify exact GSM weight, yarn count, and fabric blend</li>
                    <li>Accurately distribute initial stock inventory across all sizes</li>
                  </ul>
                </div>

              </div>

            </div>

          </div>

        </div>

      </main>

    </div>
  );
}
