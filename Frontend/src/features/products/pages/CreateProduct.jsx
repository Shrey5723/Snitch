import React, { useState, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router';
import {
  UploadCloud,
  X,
  Plus,
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
  Heart
} from 'lucide-react';
import useProduct from '../Hooks/useProduct.js';

const CURRENCY_OPTIONS = [
  { code: 'INR', symbol: '₹', label: 'INR (₹) - Indian Rupee' },
  { code: 'USD', symbol: '$', label: 'USD ($) - US Dollar' },
  { code: 'EUR', symbol: '€', label: 'EUR (€) - Euro' },
  { code: 'GBP', symbol: '£', label: 'GBP (£) - British Pound' },
];

const PRESET_TAGS = [
  'Oversized',
  'Luxury Streetwear',
  'Heavyweight',
  'Outerwear',
  'Tops & Shirts',
  'Bottoms',
  'Drop 01',
  'Limited Edition',
  'Minimalist',
  'Autumn / Winter',
];

export default function CreateProduct() {
  const navigate = useNavigate();
  const { handleCreateProduct, loading, error, successMessage, clearMessages } = useProduct();
  const fileInputRef = useRef(null);

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    priceAmount: '',
    priceCurrency: 'INR',
    categoryTag: 'Luxury Streetwear',
  });

  const [selectedTags, setSelectedTags] = useState(['Luxury Streetwear', 'Oversized']);
  const [images, setImages] = useState([]);
  const [imagePreviews, setImagePreviews] = useState([]);
  const [activePreviewIndex, setActivePreviewIndex] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [formErrors, setFormErrors] = useState({});
  const [localSuccess, setLocalSuccess] = useState(null);
  const [draftSavedToast, setDraftSavedToast] = useState(false);

  // Load draft from localStorage on mount if available
  useEffect(() => {
    try {
      const savedDraft = localStorage.getItem('snitch_create_product_draft');
      if (savedDraft) {
        const parsed = JSON.parse(savedDraft);
        if (parsed.formData) setFormData(parsed.formData);
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
        newErrors.images = 'Only image files (JPG, PNG, WEBP) are accepted.';
        continue;
      }
      if (file.size > 7 * 1024 * 1024) {
        newErrors.images = 'Each image must be under 7MB.';
        continue;
      }
      validImageFiles.push(file);
    }

    if (validImageFiles.length > 0) {
      const updatedFiles = [...images, ...validImageFiles];
      const newUrls = validImageFiles.map((file) => URL.createObjectURL(file));
      const updatedPreviews = [...imagePreviews, ...newUrls];

      setImages(updatedFiles);
      setImagePreviews(updatedPreviews);
      setFormErrors(newErrors);
    } else if (newErrors.images) {
      setFormErrors(newErrors);
    }
  };

  const handleFileDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleAddFiles(e.dataTransfer.files);
    }
  };

  const handleFileInputChange = (e) => {
    if (e.target.files && e.target.files.length > 0) {
      handleAddFiles(e.target.files);
    }
    // Reset file input value to allow re-uploading same file name if needed
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
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

    images.forEach((file) => {
      payload.append('images', file);
    });

    const result = await handleCreateProduct(payload);

    if (result.success) {
      setLocalSuccess('Product published successfully to the Snitch collection!');
      localStorage.removeItem('snitch_create_product_draft');

      // Scroll to top to view success banner
      window.scrollTo({ top: 0, behavior: 'smooth' });

      // Automatically reset or redirect after delay
      setTimeout(() => {
        navigate('/');
      }, 2000);
    }
  };

  const handleSaveDraft = () => {
    try {
      localStorage.setItem(
        'snitch_create_product_draft',
        JSON.stringify({
          formData,
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
      categoryTag: 'Luxury Streetwear',
    });
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
      categoryTag: 'Luxury Streetwear',
    });
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
    <div className="min-h-screen bg-white text-zinc-900 selection:bg-zinc-900 selection:text-white">

      {/* TOP BRAND NAVIGATION BAR */}
      <header className="sticky top-0 z-40 bg-white/90 backdrop-blur-md border-b border-zinc-100 transition-all">
        <div className="max-w-7xl mx-auto px-4 sm:px-8 h-20 flex items-center justify-between">
          
          {/* Back Action & Brand Title */}
          <div className="flex items-center gap-6">
            <Link
              to="/"
              className="group flex items-center gap-2 text-xs font-semibold tracking-wider uppercase text-zinc-500 hover:text-zinc-900 transition-colors py-2"
            >
              <ArrowLeft className="w-4 h-4 transition-transform group-hover:-translate-x-1" />
              <span className="hidden sm:inline">Back to Store</span>
            </Link>

            <div className="h-4 w-px bg-zinc-200 hidden sm:block"></div>

            <div className="flex flex-col">
              <Link to="/" className="inline-block group">
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

            <div className="flex items-center gap-1.5 px-3 py-1.5 bg-zinc-100 rounded-full text-[11px] font-bold tracking-widest text-zinc-700 uppercase">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              <span>Seller Studio</span>
            </div>
          </div>

        </div>
      </header>

      {/* MAIN STUDIO CONTAINER */}
      <main className="max-w-7xl mx-auto px-4 sm:px-8 py-8 sm:py-12">

        {/* HERO TITLE SECTION WITH AMPLE BREATHING SPACE */}
        <div className="mb-10 sm:mb-12 max-w-3xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-zinc-100 text-zinc-600 text-[11px] font-bold tracking-widest uppercase mb-3">
            <Layers className="w-3 h-3 text-zinc-500" />
            <span>Product Catalog Studio</span>
          </div>
          <h1 className="font-heading font-extrabold text-3xl sm:text-4xl lg:text-5xl text-zinc-900 tracking-tight leading-tight">
            Create New Product
          </h1>
          <p className="mt-2.5 text-sm sm:text-base text-zinc-500 leading-relaxed">
            Publish high-fashion garments to the Snitch marketplace. Ensure high-resolution studio imagery and detailed fabric specifications for luxury curation.
          </p>
        </div>

        {/* GLOBAL STATUS & NOTIFICATION BANNERS */}
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
            {localSuccess && (
              <Link
                to="/"
                className="self-center px-4 py-1.5 bg-emerald-600 text-white rounded-full text-xs font-bold hover:bg-emerald-700 transition-colors"
              >
                View in Store
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

                  {/* DROPZONE AREA */}
                  <div
                    onDragOver={(e) => {
                      e.preventDefault();
                      setIsDragging(true);
                    }}
                    onDragLeave={() => setIsDragging(false)}
                    onDrop={handleFileDrop}
                    onClick={() => fileInputRef.current?.click()}
                    className={`editorial-dropzone p-8 sm:p-10 flex flex-col items-center justify-center text-center cursor-pointer transition-all ${
                      isDragging ? 'editorial-dropzone-active border-zinc-900 bg-zinc-100' : ''
                    } ${formErrors.images ? 'border-rose-300 bg-rose-50/40' : ''}`}
                  >
                    <input
                      ref={fileInputRef}
                      type="file"
                      multiple
                      accept="image/jpeg,image/png,image/webp"
                      onChange={handleFileInputChange}
                      className="hidden"
                    />

                    <div className="w-14 h-14 rounded-2xl bg-zinc-100 border border-zinc-200/80 flex items-center justify-center text-zinc-800 mb-3.5 shadow-sm group-hover:scale-105 transition-transform">
                      <UploadCloud className="w-7 h-7 text-zinc-700" />
                    </div>

                    <p className="text-sm font-bold text-zinc-900">
                      Drag and drop product images here
                    </p>
                    <p className="text-xs text-zinc-400 mt-1">
                      or <span className="font-semibold text-zinc-800 underline underline-offset-2">browse files</span> from your computer
                    </p>
                    <div className="mt-3 flex items-center gap-2 text-[11px] text-zinc-400 font-medium">
                      <span>JPG, PNG, or WEBP</span>
                      <span>•</span>
                      <span>High-resolution portrait recommended</span>
                    </div>
                  </div>

                  {/* INLINE ERROR FOR IMAGES */}
                  {formErrors.images && (
                    <p className="text-xs text-rose-500 font-medium flex items-center gap-1.5 mt-1.5">
                      <AlertCircle className="w-3.5 h-3.5" />
                      <span>{formErrors.images}</span>
                    </p>
                  )}

                  {/* UPLOADED THUMBNAILS GALLERY */}
                  {imagePreviews.length > 0 && (
                    <div className="pt-2">
                      <p className="text-[11px] font-bold uppercase tracking-wider text-zinc-400 mb-2.5">
                        Uploaded Photos (Click to Preview • Drag or select Cover)
                      </p>
                      <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-3">
                        {imagePreviews.map((url, idx) => (
                          <div
                            key={idx}
                            onClick={() => setActivePreviewIndex(idx)}
                            className={`group relative aspect-[3/4] rounded-xl overflow-hidden border cursor-pointer transition-all bg-zinc-50 ${
                              activePreviewIndex === idx
                                ? 'ring-2 ring-zinc-900 border-transparent shadow-md'
                                : 'border-zinc-200 hover:border-zinc-400'
                            }`}
                          >
                            <img
                              src={url}
                              alt={`Upload ${idx + 1}`}
                              className="w-full h-full object-cover object-center"
                            />

                            {/* Cover Photo Badge */}
                            {idx === 0 ? (
                              <span className="absolute top-1.5 left-1.5 bg-zinc-900 text-white text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded shadow-sm">
                                Cover
                              </span>
                            ) : (
                              <button
                                type="button"
                                onClick={(e) => handleSetCoverImage(idx, e)}
                                title="Set as primary cover photo"
                                className="absolute top-1.5 left-1.5 opacity-0 group-hover:opacity-100 bg-white/90 hover:bg-white text-zinc-800 text-[9px] font-bold px-1.5 py-0.5 rounded shadow transition-opacity"
                              >
                                Make Cover
                              </button>
                            )}

                            {/* Delete Thumbnail Button */}
                            <button
                              type="button"
                              onClick={(e) => handleRemoveImage(idx, e)}
                              className="absolute top-1.5 right-1.5 w-6 h-6 rounded-full bg-black/70 hover:bg-rose-600 text-white flex items-center justify-center transition-colors opacity-90 group-hover:opacity-100 shadow"
                            >
                              <X className="w-3.5 h-3.5" />
                            </button>

                            {/* Image Number Indicator */}
                            <span className="absolute bottom-1.5 right-1.5 text-[9px] font-bold text-white/90 bg-black/50 px-1 rounded">
                              #{idx + 1}
                            </span>
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

                {/* 2. PRODUCT DETAILS SECTION */}
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
                      <div className="relative flex items-center">
                        <span className="absolute left-1 text-sm font-bold text-zinc-500">
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
                          className={`editorial-underline-input pl-6 text-base ${
                            formErrors.priceAmount ? 'editorial-underline-input-error' : ''
                          }`}
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

                  {/* Description & Specifications Textarea */}
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <label className="block text-xs font-bold uppercase tracking-wider text-zinc-800">
                        Description & Material Specs <span className="text-rose-500">*</span>
                      </label>
                      <span className="text-[11px] text-zinc-400 font-medium">
                        {formData.description.length} characters
                      </span>
                    </div>
                    <textarea
                      name="description"
                      rows={4}
                      value={formData.description}
                      onChange={handleInputChange}
                      placeholder="Describe the fabric weight (GSM), weave, silhouette, fit, detailing, hardware, and garment care instructions..."
                      className={`editorial-box-input text-sm leading-relaxed resize-y min-h-[110px] ${
                        formErrors.description ? 'editorial-box-input-error' : ''
                      }`}
                    />
                    {formErrors.description ? (
                      <p className="mt-1.5 text-[11px] text-rose-500 font-medium">
                        {formErrors.description}
                      </p>
                    ) : (
                      <p className="mt-1.5 text-[11px] text-zinc-400">
                        Tip: Specify GSM, cotton blend %, and silhouette (e.g. relaxed boxy fit).
                      </p>
                    )}
                  </div>

                  {/* Category & Tags Selector */}
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-zinc-800 mb-2.5">
                      Collection Tags & Attributes
                    </label>
                    <div className="flex flex-wrap gap-2">
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
                      Reset
                    </button>
                  </div>

                  {/* Primary Publish Action */}
                  <button
                    type="submit"
                    disabled={loading}
                    className="editorial-black-pill px-8 py-3 w-full sm:w-auto flex items-center justify-center gap-2 cursor-pointer disabled:opacity-70"
                  >
                    {loading ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin text-white" />
                        <span>PUBLISHING DROP...</span>
                      </>
                    ) : (
                      <>
                        <Sparkles className="w-4 h-4 text-amber-300" />
                        <span>Publish Collection Item</span>
                      </>
                    )}
                  </button>

                </div>

              </form>

            </div>

            {/* Brand Authenticity Assurance */}
            <div className="mt-6 flex items-center justify-center gap-2 text-xs text-zinc-400">
              <ShieldCheck className="w-4 h-4 text-zinc-400" />
              <span>Snitch Seller Guarantee • Verified High-Fashion Apparel Standards</span>
            </div>

          </div>

          {/* RIGHT SIDEBAR: LIVE STORE CATALOG PREVIEW & STUDIO CHECKLIST (5 COLS) */}
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
                  <div className="p-4 sm:p-5">
                    <p className="text-[10px] font-bold tracking-[0.2em] text-zinc-400 uppercase mb-1">
                      S N I T C H
                    </p>

                    <h3 className="font-heading font-bold text-sm sm:text-base text-zinc-900 line-clamp-1">
                      {formData.title || 'Product Title Appears Here'}
                    </h3>

                    {/* Selected Tag Badges */}
                    <div className="flex flex-wrap gap-1.5 my-2.5">
                      {selectedTags.slice(0, 3).map((tag) => (
                        <span
                          key={tag}
                          className="text-[10px] font-semibold px-2 py-0.5 rounded bg-zinc-100 text-zinc-600"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>

                    {/* Price and Simulated Add Button */}
                    <div className="mt-3 pt-3 border-t border-zinc-100 flex items-center justify-between">
                      <div className="flex flex-col">
                        <span className="text-[10px] text-zinc-400 font-semibold uppercase">Price</span>
                        <span className="font-heading font-extrabold text-base sm:text-lg text-zinc-900">
                          {currentCurrencySymbol}
                          {formData.priceAmount ? Number(formData.priceAmount).toLocaleString() : '0.00'}
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
                    Snitch Curation Standards
                  </p>
                  <ul className="space-y-1.5 list-disc pl-4 text-zinc-500 text-[11px] leading-relaxed">
                    <li>Use studio lighting on plain neutral backgrounds</li>
                    <li>Detail GSM specifications and fabric composition</li>
                    <li>Accurately specify fit (Oversized, Slim, Relaxed)</li>
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
