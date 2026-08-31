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
  Image as ImageIcon
} from 'lucide-react';
import useProduct from '../Hooks/useProduct.js';

// Curated high-fashion items with rich multi-photo sets (up to 7 photos each)
const FALLBACK_PRODUCTS = {
  'sample-1': {
    _id: 'sample-1',
    title: 'Obsidian Tech-Trench',
    description:
      'A masterpiece of modern tailoring. Crafted from a high-performance technical matte shell with water-resistant membrane and taped seams. Features modular storm flaps, Fidlock magnetic cuff cinch straps, and a clean hidden-placket closure for an avant-garde utilitarian silhouette.',
    price: { amount: 3499, currency: 'INR' },
    category: 'Jackets',
    seller: { fullName: 'Snitch Atelier' },
    images: [
      {
        url: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCBx6WMWY_7ZVpiDmf6kJYkIgvC6nN6nsqi72feb6NglDYi0sDBipqXsM3G-g_8ERRGGu8Qv0Jhm05_UWY2jXySZF4x5_-jIlv1lh--G9avzDDECEbadt_FmzkzRWlvQiQiKPFg6j50NuAJcIaXszHtgwU_hsUrHIqS_eOwBEGexTlNKHJRZw0sqcpA1DMoUX5tHgSrvKLfrA1L_vJ-DqEthmJLiZqYQIjlJF9vJoTSwlFGnsWRT8I28UannZ4jsF_4jP5sgj-iadM',
        alt: 'Front Studio Look'
      },
      {
        url: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBAkuQsM13GqlGkarAzWd68LoyVQd6bpoRRgOo8s7BRRAw1BMjJr2SZThjESc-_fLjWF6qUP3xnI6h3tLJhgNuafqJTu02rsiUv4176U4D1vv57T3q5f4sZybbogoXHuLmKukvGPCimMJ8gGhWCLTY5M7kj2O-xClJ8t-LSm10_yNiGzp5YPKyA3inxz5LOSRIaMEwZVyhWpwjLdXfUHKUoPleNIkRwlHKKmixrXvhxijYP8K_FwYdmJNPs6MTIfVmFK39s14XKNdU',
        alt: 'Collar & Seam Precision'
      },
      {
        url: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCPtTLOVgHqQ3ztyA2uK1GI_B9Tfe57SsHDF94Qc0JnTwKnTgWaUWoGNfzOf39h3sYj0aUMg75X0_NtWJG_EgoMn7I98W9aifFrdhJNY8ggyBDhcTywh8mMZ3YKk-9ofiAxTd7bMKUFIqyh-LgXfDRiK-1pc6nZ56VXHecG_hyGlubD4D936qklVQaTg5xwhM4FLcAOjwUO7iY94dGJskW7uAMK-HtE8_lNN1s5xjCWiPq3KNyCZ-qItafT1dKSYHxu1gHHDC2mk5c',
        alt: 'Side Silhouette Drape'
      },
      {
        url: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDrhjxBg8gTzu3_XwLska9tVQohBQoGxqa5KotPhLOPrCENo-zZeVSY4R2U4dnkbwG7mnEaqsUbKV4B3UOAq-vM6papwz2VklSdlwufaliChrD7in1pvc7AdorOozNxrYWdg-4fXHRMmx3PKpu9HIQCYgf3WmFd9l-d7sbjowZlo336saN76JVBbpGTbuSnwMwZXGaDgLinElU4sqeJQC_2ctD9sMjobjKzzy8XSLSW2qRQjJF01M7SD0exVo2Rz6D0CWxZOcqT02I',
        alt: 'Back Vent & Shoulder Structure'
      },
      {
        url: 'https://lh3.googleusercontent.com/aida-public/AB6AXuB-n0v-nDUkvWoVtp_QAHFuult8XUE5u11n-i1bDfJ7yt-lPa4y4wPYZTobKAq8Q85tintkOppo5UTT1T_LptYrAowKvERzTdCAm5eekcyVaHvPPFcuR4O0dQDPAkeIvPy3obon5R-HYTmal8-Pw6ckBOXIAiSC7W3xGHfwrKuXyUqlXeeAFOUaw988fF9pHWlrJKdFy0_QkiJazGN0sd2s6_REnMa_O_Mg-jylKFqWSUlibqaAQ3NR36LVU57OeXhkfC-W4KtvuhM',
        alt: 'Hardware & Magnetic Snaps'
      },
      {
        url: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCHfnjrVLabxNrqSNa-Ir_gBSvvND2tqyM77FU4ly1d8EZ8HR27lz7OjiYzoOOssKfr4XlZ2xnJb7IEig5HHWbnY7ZYdxQ6f_dPElqJ2xN1qzsocr66QhNkr81Wcg3joo6dU7Xi0_-fZr-6tKMY2O7HzSoMTRYfSaoLD8voFrYRKeem0uK1vMFIWLgZqs4yMiuVxFCAjg8lg0yb3a1Z7515-mG18BdI8PZVPxIvCA7OfD0FP0YBX0Kb8B83pOJJuRYDjmEDLQhmPSM',
        alt: 'Editorial Movement'
      },
      {
        url: 'https://lh3.googleusercontent.com/aida-public/AB6AXuB4DOVe2CyjdIG7PE5w1CbsKnCc5GgtDFkMDTOvanmPk6lNeWOSqz5MFHOzTPJWBUiSXo-crRiXy8g45_aLYWu2bswuO7ww7iavHyVQdWpMIjRMxVs85zAPGxzglDlAyFIrij-Xqwfi9rM_dVX8kKkvFuROibGLqJw-iLC2nn5VVKbpmlo6v2Wx7Urmyf23FmF8L2rNl2CZKI2BTK1YIHe9f0rqteP8G6m09xknDIVWqn56sP9S3kXIvF6DPwKyJknvceMym2BfYsQ',
        alt: 'Full Runway Ensemble'
      }
    ]
  },
  'sample-2': {
    _id: 'sample-2',
    title: 'K-7 Tactical Cargos',
    description:
      'Engineered with relaxed ergonomics and articulated knee darting. Built with 280 GSM ripstop cotton, asymmetric bellowed cargo compartments, matte zinc carabiner hooks, and an internal bungee hem adjustment for versatile styling.',
    price: { amount: 2899, currency: 'INR' },
    category: 'Pants',
    seller: { fullName: 'Snitch Street Division' },
    images: [
      {
        url: 'https://lh3.googleusercontent.com/aida-public/AB6AXuD5NOCw31t9aMh2_BrktGvvv_dKZWRz1F0LeNQfEAymgSz3Ys20e5O-vSIWrdB0yNt_Ij6EcZCpjMPYHjEZE6qREVm2BPQlOTqj6NrtjSM6n0gjSw3iu9kyaA1pqJ_K-MXh9tTFGCfe1BWd6MDpN-LMh6G-w-sbYkZ9ZCY4N2nonCTRNBVxBbh8rKdpvB9mXMopJkydwBNYI6dN-H-GfzfN-5TYIWX366fc2u8aA7YIqd0NvoBItNygvIhPZSabHX_RtH-0RrnHIpY',
        alt: 'Front View'
      },
      {
        url: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAEibsdvG3CEwN-d_sBs_MUikoEQcf2ixQ6Ecx80gzHF86VxYN7v2MS6xPL_ZXH4RKZVeWWnYbY8mh3gOrRcZzHgTgCRLU1EvkiJLLM7Bk0RHmJbFznmuh7PQq73LgZsxYI4VvHL3_C1ZozlaQkxs8PHZC6UYTAlf2Ie4lYvRCLObRKknnCMGhFuvSgrX5VcYPR7XpmrddZk7UOEXIjnvzKOTnK61HY97HIZzhxoAB-WVqVW_Q1N_A7Pc3mMOLf_XPwM41_sPvClo8',
        alt: 'Tailored Ankle Fit'
      },
      {
        url: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDrhjxBg8gTzu3_XwLska9tVQohBQoGxqa5KotPhLOPrCENo-zZeVSY4R2U4dnkbwG7mnEaqsUbKV4B3UOAq-vM6papwz2VklSdlwufaliChrD7in1pvc7AdorOozNxrYWdg-4fXHRMmx3PKpu9HIQCYgf3WmFd9l-d7sbjowZlo336saN76JVBbpGTbuSnwMwZXGaDgLinElU4sqeJQC_2ctD9sMjobjKzzy8XSLSW2qRQjJF01M7SD0exVo2Rz6D0CWxZOcqT02I',
        alt: 'Pocket Details'
      }
    ]
  },
  'sample-3': {
    _id: 'sample-3',
    title: 'Aero Structural Hoodie',
    description:
      'A sculptural heavyweight hoodie constructed with 480 GSM custom loopback french terry. Designed with structured drop-shoulders, cross-over high collar hood, double-stitched kangaroo pocket, and ribbed side panels for maximum mobility.',
    price: { amount: 2499, currency: 'INR' },
    category: 'Shirts',
    seller: { fullName: 'Snitch Core' },
    images: [
      {
        url: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDqk48LGvYAe08YSncloaCRvM2BSDKrIb7p6G31gQJ0T0Y_OwJWnhtAHvkemK4e839JWkvlJbfWqXETGEBbgy5TuODzDjUau8iJObTa4693nLngDU8ThcPKJsVL15ixbqjJ-9ltVJW421cl7BG7e8ydIVmLEdBrUKo-IMwAlefjYUiQDJLB0wfpfP69akna7UuJxc3LTYPplHiK7444REdwW4_lNEJ_9TeIeWcwvqQIMiWJ1Ye6YFLPScby5a1Ebr3OnQeadV-NoTo',
        alt: 'High-Collar Front'
      },
      {
        url: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBAkuQsM13GqlGkarAzWd68LoyVQd6bpoRRgOo8s7BRRAw1BMjJr2SZThjESc-_fLjWF6qUP3xnI6h3tLJhgNuafqJTu02rsiUv4176U4D1vv57T3q5f4sZybbogoXHuLmKukvGPCimMJ8gGhWCLTY5M7kj2O-xClJ8t-LSm10_yNiGzp5YPKyA3inxz5LOSRIaMEwZVyhWpwjLdXfUHKUoPleNIkRwlHKKmixrXvhxijYP8K_FwYdmJNPs6MTIfVmFK39s14XKNdU',
        alt: 'French Terry Texture'
      },
      {
        url: 'https://lh3.googleusercontent.com/aida-public/AB6AXuB4DOVe2CyjdIG7PE5w1CbsKnCc5GgtDFkMDTOvanmPk6lNeWOSqz5MFHOzTPJWBUiSXo-crRiXy8g45_aLYWu2bswuO7ww7iavHyVQdWpMIjRMxVs85zAPGxzglDlAyFIrij-Xqwfi9rM_dVX8kKkvFuROibGLqJw-iLC2nn5VVKbpmlo6v2Wx7Urmyf23FmF8L2rNl2CZKI2BTK1YIHe9f0rqteP8G6m09xknDIVWqn56sP9S3kXIvF6DPwKyJknvceMym2BfYsQ',
        alt: 'On-Body Editorial'
      }
    ]
  },
  'sample-4': {
    _id: 'sample-4',
    title: 'Void Knit Sneakers',
    description:
      'Seamless 3D engineered knit sock silhouette sitting atop a lightweight sculpted dual-density EVA midsole. Features TPU heel stability clip, ergonomic arch lock, and high-traction rubber lug pods.',
    price: { amount: 4299, currency: 'INR' },
    category: 'Sneakers',
    seller: { fullName: 'Snitch Footwear Lab' },
    images: [
      {
        url: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAGnffq_FCaXv9XSJr3-fSdFU_kHLyJ3SGShlHFUCmo_fzdBx7KGkdgvzwoCs4EzgdMrEMA_rjB0a8qqm9WHWlGCLngpbJ18vaXqnv_7jRhrD2-jbN38wGqkWqR-joMcKFC5CjYvIn6Pkp2VRKrTJ13Pz4QhVDn-sCw95kPP5de8M5NKfQI5KpYa-EJOo-fCOZSLHYjsagjXzH3Uun-mXMYp8cwooNwk9bkQ6JBPgYDb7RrGJUvKSI6cej6Rh6TYrgVf8setO1iXOQ',
        alt: 'Profile Float View'
      },
      {
        url: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCR8EnMTK5iMDOo-MsnD14yUoSxBpihBBzt3iKBwQ_WhA2qwULpeoEaIK1G0nEdV3xz7titkd5F9ujcUaX5j57j069g5PBO5RubqxsLRnJb5P3pj86XNnRHiBUqvMyB8Q-FMP9ngW1nJK9DGisMB4BoysGD2R8eNsXxVrqkQh7a3Jdl89HkHnQ4wge4DsQCpU1K2oTETbdO79hRBzMUh_Zar0bHOwvVuNYjg-t9Ez-DZuja7D7J1gIUmsjXw4HIsWGAmlUMDFasqKg',
        alt: 'Sole Architecture'
      }
    ]
  }
};

const COMPLETE_THE_LOOK_ITEMS = [
  {
    _id: 'sample-2',
    title: 'K-7 Tactical Cargos',
    category: 'Bottoms',
    price: { amount: 2899, currency: 'INR' },
    image:
      'https://lh3.googleusercontent.com/aida-public/AB6AXuD5NOCw31t9aMh2_BrktGvvv_dKZWRz1F0LeNQfEAymgSz3Ys20e5O-vSIWrdB0yNt_Ij6EcZCpjMPYHjEZE6qREVm2BPQlOTqj6NrtjSM6n0gjSw3iu9kyaA1pqJ_K-MXh9tTFGCfe1BWd6MDpN-LMh6G-w-sbYkZ9ZCY4N2nonCTRNBVxBbh8rKdpvB9mXMopJkydwBNYI6dN-H-GfzfN-5TYIWX366fc2u8aA7YIqd0NvoBItNygvIhPZSabHX_RtH-0RrnHIpY'
  },
  {
    _id: 'sample-3',
    title: 'Aero Structural Hoodie',
    category: 'Tops',
    price: { amount: 2499, currency: 'INR' },
    image:
      'https://lh3.googleusercontent.com/aida-public/AB6AXuDqk48LGvYAe08YSncloaCRvM2BSDKrIb7p6G31gQJ0T0Y_OwJWnhtAHvkemK4e839JWkvlJbfWqXETGEBbgy5TuODzDjUau8iJObTa4693nLngDU8ThcPKJsVL15ixbqjJ-9ltVJW421cl7BG7e8ydIVmLEdBrUKo-IMwAlefjYUiQDJLB0wfpfP69akna7UuJxc3LTYPplHiK7444REdwW4_lNEJ_9TeIeWcwvqQIMiWJ1Ye6YFLPScby5a1Ebr3OnQeadV-NoTo'
  },
  {
    _id: 'sample-4',
    title: 'Void Knit Sneakers',
    category: 'Footwear',
    price: { amount: 4299, currency: 'INR' },
    image:
      'https://lh3.googleusercontent.com/aida-public/AB6AXuAGnffq_FCaXv9XSJr3-fSdFU_kHLyJ3SGShlHFUCmo_fzdBx7KGkdgvzwoCs4EzgdMrEMA_rjB0a8qqm9WHWlGCLngpbJ18vaXqnv_7jRhrD2-jbN38wGqkWqR-joMcKFC5CjYvIn6Pkp2VRKrTJ13Pz4QhVDn-sCw95kPP5de8M5NKfQI5KpYa-EJOo-fCOZSLHYjsagjXzH3Uun-mXMYp8cwooNwk9bkQ6JBPgYDb7RrGJUvKSI6cej6Rh6TYrgVf8setO1iXOQ'
  },
  {
    _id: 'sample-1',
    title: 'Obsidian Tech-Trench',
    category: 'Outerwear',
    price: { amount: 3499, currency: 'INR' },
    image:
      'https://lh3.googleusercontent.com/aida-public/AB6AXuCBx6WMWY_7ZVpiDmf6kJYkIgvC6nN6nsqi72feb6NglDYi0sDBipqXsM3G-g_8ERRGGu8Qv0Jhm05_UWY2jXySZF4x5_-jIlv1lh--G9avzDDECEbadt_FmzkzRWlvQiQiKPFg6j50NuAJcIaXszHtgwU_hsUrHIqS_eOwBEGexTlNKHJRZw0sqcpA1DMoUX5tHgSrvKLfrA1L_vJ-DqEthmJLiZqYQIjlJF9vJoTSwlFGnsWRT8I28UannZ4jsF_4jP5sgj-iadM'
  }
];

const SIZES = ['S', 'M', 'L', 'XL', 'XXL'];

const COLORS = [
  { name: 'Obsidian Black', hex: '#18181b' },
  { name: 'Charcoal Grey', hex: '#3f3f46' },
  { name: 'Concrete Stone', hex: '#a1a1aa' }
];

export default function ProductDetail() {
  const { productId } = useParams();
  const navigate = useNavigate();
  const { currentProduct, loading, handleGetProductById } = useProduct();
  const { user, isAuthenticated } = useSelector((state) => state.auth || {});

  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [selectedSize, setSelectedSize] = useState('M');
  const [selectedColor, setSelectedColor] = useState(COLORS[0]);
  const [quantity, setQuantity] = useState(1);
  const [isWishlisted, setIsWishlisted] = useState(false);
  const [activeAccordion, setActiveAccordion] = useState('specs');
  const [toastMessage, setToastMessage] = useState(null);
  const [cartCount, setCartCount] = useState(0);
  const [showSizeGuide, setShowSizeGuide] = useState(false);
  const [showLightbox, setShowLightbox] = useState(false);

  // Fetch product on load
  useEffect(() => {
    window.scrollTo(0, 0);
    setActiveImageIndex(0);
    if (productId && !productId.startsWith('sample-')) {
      handleGetProductById(productId);
    }
  }, [productId]);

  // Resolve product data
  const product = useMemo(() => {
    if (productId && FALLBACK_PRODUCTS[productId]) {
      return FALLBACK_PRODUCTS[productId];
    }
    if (currentProduct && currentProduct._id === productId) {
      return currentProduct;
    }
    return currentProduct || FALLBACK_PRODUCTS['sample-1'];
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
    setCartCount((prev) => prev + quantity);
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

  const toggleAccordion = (name) => {
    setActiveAccordion((prev) => (prev === name ? null : name));
  };

  return (
    <div className="min-h-screen bg-white text-zinc-900 font-body select-none flex flex-col">

      {/* ═══════════════════════ TOAST NOTIFICATION ═══════════════════════ */}
      {toastMessage && (
        <div className="fixed top-20 right-6 z-50 animate-fade-in bg-zinc-900 text-white px-5 py-3 rounded-2xl shadow-2xl flex items-center gap-3 border border-zinc-800">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
          <span className="text-xs font-semibold">{toastMessage}</span>
        </div>
      )}

      {/* ═══════════════════════ COMPACT HIGH-FASHION HEADER ═══════════════════════ */}
      <header className="bg-white/95 backdrop-blur-md border-b border-zinc-100 sticky top-0 z-40 w-full transition-all duration-300">
        <div className="flex justify-between items-center px-4 sm:px-8 h-16 sm:h-20 w-full max-w-[1440px] mx-auto relative">
          
          {/* Back to Shop */}
          <Link
            to="/"
            className="p-1.5 sm:p-2 rounded-full hover:bg-zinc-100 text-zinc-700 transition-colors flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider"
          >
            <ChevronLeft className="w-4 h-4" />
            <span className="hidden sm:inline">Back to Shop</span>
          </Link>

          {/* Centered Brand Logo */}
          <div className="flex flex-col items-center justify-center absolute left-1/2 transform -translate-x-1/2">
            <Link to="/" className="inline-block group text-center">
              <h1 className="font-heading font-black text-[22px] sm:text-[28px] md:text-[30px] tracking-[0.35em] text-zinc-900 uppercase leading-none">
                S N I T C H
              </h1>
              <p className="text-[8px] sm:text-[9px] font-semibold tracking-[0.25em] text-zinc-400 uppercase mt-0.5">
                CLOTHING &amp; APPAREL
              </p>
            </Link>
          </div>

          {/* Right Action Icons */}
          <div className="flex items-center gap-2 sm:gap-4">
            <button
              onClick={handleShare}
              title="Share link"
              className="p-2 rounded-full hover:bg-zinc-100 text-zinc-800 transition-colors cursor-pointer"
            >
              <Share2 className="w-4 h-4" />
            </button>

            <button
              onClick={() => setIsWishlisted(!isWishlisted)}
              title={isWishlisted ? 'Saved in wishlist' : 'Save to wishlist'}
              className="p-2 rounded-full hover:bg-zinc-100 text-zinc-800 transition-colors cursor-pointer"
            >
              <Heart className={`w-4 h-4 ${isWishlisted ? 'fill-rose-500 text-rose-500' : ''}`} />
            </button>

            <button
              aria-label="Shopping Bag"
              onClick={() => {
                setToastMessage(`Your shopping bag has ${cartCount} items.`);
                setTimeout(() => setToastMessage(null), 2000);
              }}
              className="p-2 rounded-full hover:bg-zinc-100 text-zinc-800 transition-colors relative cursor-pointer"
            >
              <ShoppingBag className="w-4 h-4" />
              {cartCount > 0 && (
                <span className="absolute -top-0.5 -right-0.5 bg-zinc-900 text-white text-[10px] font-bold rounded-full w-4 h-4 flex items-center justify-center animate-fade-in">
                  {cartCount}
                </span>
              )}
            </button>
          </div>

        </div>
      </header>

      {/* ═══════════════════════ MAIN PRODUCT CONTAINER ═══════════════════════ */}
      <main className="flex-1 max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6 w-full flex flex-col justify-start">
        
        {/* BREADCRUMBS (Compact) */}
        <div className="flex items-center text-[10px] sm:text-xs font-semibold text-zinc-400 mb-3 sm:mb-5 gap-1.5 uppercase tracking-widest overflow-x-auto whitespace-nowrap scrollbar-none">
          <Link to="/" className="hover:text-zinc-900 transition-colors">Home</Link>
          <ChevronRight className="w-3 h-3 text-zinc-300" />
          <Link to="/#shop" className="hover:text-zinc-900 transition-colors">Collections</Link>
          <ChevronRight className="w-3 h-3 text-zinc-300" />
          <span className="hover:text-zinc-900 transition-colors">{product?.category || 'Apparel'}</span>
          <ChevronRight className="w-3 h-3 text-zinc-300" />
          <span className="text-zinc-900 font-bold truncate max-w-[160px] sm:max-w-none">{product?.title}</span>
        </div>

        {/* LOADING STATE */}
        {loading && (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-8 h-8 animate-spin text-zinc-400" />
            <span className="ml-3 text-zinc-500 font-medium text-sm">Loading garment specifications...</span>
          </div>
        )}

        {/* 2-COLUMN VIEWPORT-FITTED PRODUCT SHOWCASE */}
        {!loading && (
          <section className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-10 xl:gap-12 items-start mb-14">
            
            {/* ────────── LEFT COLUMN: DYNAMIC 7-PHOTO GALLERY (7 COLS) ────────── */}
            <div className="lg:col-span-7 flex flex-col-reverse md:flex-row gap-3 sm:gap-4 items-start w-full">
              
              {/* Thumbnail Strip (Scrollable, Supports up to 7 photos) */}
              {imagesList.length > 1 && (
                <div className="flex md:flex-col gap-2 overflow-x-auto md:overflow-y-auto max-h-[460px] lg:max-h-[520px] xl:max-h-[580px] w-full md:w-20 lg:w-22 scrollbar-none flex-shrink-0 py-1">
                  {imagesList.map((imgUrl, index) => (
                    <button
                      key={index}
                      type="button"
                      onClick={() => setActiveImageIndex(index)}
                      className={`relative aspect-[3/4] w-14 sm:w-16 md:w-full rounded-xl overflow-hidden border-2 flex-shrink-0 transition-all cursor-pointer bg-zinc-100 ${
                        activeImageIndex === index
                          ? 'border-zinc-900 shadow-sm ring-1 ring-zinc-900 scale-100'
                          : 'border-zinc-200/80 opacity-60 hover:opacity-100 hover:border-zinc-400'
                      }`}
                    >
                      <img
                        src={imgUrl}
                        alt={`Photo ${index + 1}`}
                        className="w-full h-full object-cover object-center"
                      />
                      <span className="absolute bottom-0.5 right-1 text-[8px] font-bold text-white bg-black/50 px-1 rounded">
                        {index + 1}
                      </span>
                    </button>
                  ))}
                </div>
              )}

              {/* Main High-Resolution Hero Display (Viewport Responsive) */}
              <div className="flex-1 w-full relative rounded-2xl sm:rounded-3xl overflow-hidden bg-zinc-100 border border-zinc-100 group shadow-xs">
                
                {/* Image Container with max-height constraint for perfect laptop screen fitting */}
                <div className="w-full aspect-[4/5] sm:aspect-[3/4] max-h-[440px] sm:max-h-[480px] lg:max-h-[520px] xl:max-h-[580px] flex items-center justify-center overflow-hidden relative">
                  <img
                    src={imagesList[activeImageIndex] || imagesList[0]}
                    alt={product?.title}
                    className="w-full h-full object-cover object-center transition-transform duration-500 group-hover:scale-105"
                  />

                  {/* Badges Overlay */}
                  <div className="absolute top-3 left-3 flex items-center gap-1.5 pointer-events-none">
                    <span className="bg-zinc-900 text-white text-[9px] font-black uppercase tracking-widest px-2.5 py-1 rounded-md shadow-xs">
                      FW '24 DROP
                    </span>
                    <span className="bg-white/90 backdrop-blur-md text-zinc-900 text-[9px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-md border border-zinc-200/80 shadow-xs">
                      100% Authentic
                    </span>
                  </div>

                  {/* Multi-Photo Carousel Arrows (If multiple images) */}
                  {imagesList.length > 1 && (
                    <>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          prevImage();
                        }}
                        title="Previous photo"
                        className="absolute left-2.5 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-white/90 hover:bg-white text-zinc-800 flex items-center justify-center shadow-md opacity-0 group-hover:opacity-100 transition-all cursor-pointer hover:scale-110"
                      >
                        <ChevronLeft className="w-4 h-4" />
                      </button>

                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          nextImage();
                        }}
                        title="Next photo"
                        className="absolute right-2.5 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-white/90 hover:bg-white text-zinc-800 flex items-center justify-center shadow-md opacity-0 group-hover:opacity-100 transition-all cursor-pointer hover:scale-110"
                      >
                        <ChevronRight className="w-4 h-4" />
                      </button>
                    </>
                  )}

                  {/* Image Counter & Fullscreen Zoom Button */}
                  <div className="absolute bottom-3 right-3 flex items-center gap-2">
                    {imagesList.length > 1 && (
                      <span className="bg-black/60 backdrop-blur-md text-white text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1 shadow-xs">
                        <ImageIcon className="w-3 h-3" />
                        <span>{activeImageIndex + 1} / {imagesList.length}</span>
                      </span>
                    )}

                    <button
                      type="button"
                      onClick={() => setShowLightbox(true)}
                      title="Fullscreen zoom"
                      className="bg-white/90 hover:bg-white text-zinc-800 p-1.5 rounded-full shadow-sm transition-transform hover:scale-110 cursor-pointer"
                    >
                      <Maximize2 className="w-3.5 h-3.5" />
                    </button>
                  </div>

                </div>

              </div>

            </div>

            {/* ────────── RIGHT COLUMN: BALANCED EDITORIAL BUY BOX (5 COLS) ────────── */}
            <div className="lg:col-span-5 flex flex-col justify-between space-y-3.5 sm:space-y-4">
              
              {/* Brand Header */}
              <div>
                <div className="flex items-center justify-between text-[10px] font-bold tracking-[0.2em] text-zinc-400 uppercase mb-1">
                  <span>S N I T C H • {product?.category || 'COLLECTION'}</span>
                  {product?.seller?.fullName && (
                    <span className="text-zinc-600 font-medium">By {product.seller.fullName}</span>
                  )}
                </div>

                {/* Title */}
                <h1 className="font-heading font-black text-2xl sm:text-3xl lg:text-[32px] text-zinc-900 leading-tight">
                  {product?.title}
                </h1>
              </div>

              {/* Price & Rating Bar */}
              <div className="flex items-center justify-between gap-3 pb-3 border-b border-zinc-100">
                <div className="flex items-baseline gap-2">
                  <span className="font-heading font-black text-2xl sm:text-3xl text-zinc-900">
                    {formatPrice(product?.price)}
                  </span>
                  <span className="text-[10px] text-zinc-400 font-medium uppercase tracking-wider">
                    Tax Included
                  </span>
                </div>

                {/* Review Badge */}
                <div className="flex items-center gap-1 bg-zinc-50 border border-zinc-200/80 px-2.5 py-1 rounded-full">
                  <div className="flex text-amber-400">
                    {[1, 2, 3, 4, 5].map((s) => (
                      <Star key={s} className="w-3 h-3 fill-amber-400 text-amber-400" />
                    ))}
                  </div>
                  <span className="text-xs font-bold text-zinc-800 ml-0.5">4.9</span>
                  <span className="text-[10px] text-zinc-400 font-medium">(128)</span>
                </div>
              </div>

              {/* Description (Concise & Elegant) */}
              <p className="text-xs sm:text-sm text-zinc-600 leading-relaxed font-normal line-clamp-3">
                {product?.description ||
                  'Precision-crafted tailored streetwear designed with high-density fabric composition and structural seam architecture for timeless elegance.'}
              </p>

              {/* Color Selection Chips */}
              <div>
                <div className="flex justify-between items-center mb-2 text-xs font-bold tracking-wider uppercase text-zinc-800">
                  <span>Color: <span className="text-zinc-500 font-medium">{selectedColor.name}</span></span>
                </div>
                <div className="flex gap-2.5">
                  {COLORS.map((col) => (
                    <button
                      key={col.name}
                      type="button"
                      onClick={() => setSelectedColor(col)}
                      className={`w-8 h-8 rounded-full transition-all flex items-center justify-center cursor-pointer ${
                        selectedColor.name === col.name
                          ? 'ring-2 ring-zinc-900 ring-offset-2 scale-105'
                          : 'opacity-80 hover:opacity-100 hover:scale-105'
                      }`}
                      style={{ backgroundColor: col.hex }}
                      title={col.name}
                    >
                      {selectedColor.name === col.name && (
                        <Check className="w-3.5 h-3.5 text-white drop-shadow" />
                      )}
                    </button>
                  ))}
                </div>
              </div>

              {/* Size Selector & Guide */}
              <div>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-xs font-bold tracking-wider uppercase text-zinc-800">
                    Select Size: <span className="text-zinc-500 font-medium">{selectedSize}</span>
                  </span>
                  <button
                    type="button"
                    onClick={() => setShowSizeGuide(true)}
                    className="text-xs font-semibold text-zinc-500 hover:text-zinc-900 underline transition-colors cursor-pointer"
                  >
                    Size Guide
                  </button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {SIZES.map((size) => (
                    <button
                      key={size}
                      type="button"
                      onClick={() => setSelectedSize(size)}
                      className={`px-4 sm:px-5 py-2 rounded-full text-xs font-bold uppercase tracking-wider transition-all cursor-pointer ${
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

              {/* Quantity Counter & Primary CTA */}
              <div className="space-y-2.5 pt-1">
                <div className="flex gap-2.5 sm:gap-3">
                  
                  {/* Quantity */}
                  <div className="flex items-center border border-zinc-200/90 rounded-full px-3 py-2 w-28 sm:w-32 justify-between bg-zinc-50/60 flex-shrink-0">
                    <button
                      type="button"
                      onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                      className="p-1 rounded-full hover:bg-zinc-200 text-zinc-700 transition-colors cursor-pointer"
                    >
                      <Minus className="w-3 h-3" />
                    </button>
                    <span className="font-bold text-xs sm:text-sm text-zinc-900">{quantity}</span>
                    <button
                      type="button"
                      onClick={() => setQuantity((q) => q + 1)}
                      className="p-1 rounded-full hover:bg-zinc-200 text-zinc-700 transition-colors cursor-pointer"
                    >
                      <Plus className="w-3 h-3" />
                    </button>
                  </div>

                  {/* Primary Black Pill: Add to Bag */}
                  <button
                    type="button"
                    onClick={handleAddToCart}
                    className="editorial-black-pill flex-1 py-3 sm:py-3.5 px-4 text-xs uppercase tracking-wider flex items-center justify-center gap-2 cursor-pointer shadow-md hover:shadow-lg transition-all"
                  >
                    <ShoppingBag className="w-3.5 h-3.5" />
                    <span>Add To Bag</span>
                  </button>

                </div>

                {/* Secondary Instant Checkout Pill */}
                <button
                  type="button"
                  onClick={() => {
                    handleAddToCart();
                    setToastMessage('Redirecting to express checkout...');
                  }}
                  className="editorial-secondary-pill w-full py-2.5 sm:py-3 text-xs font-bold uppercase tracking-wider cursor-pointer shadow-xs hover:border-zinc-900"
                >
                  Instant Checkout • Buy Now
                </button>
              </div>

              {/* Compact Trust Badges Ribbon */}
              <div className="grid grid-cols-3 gap-1.5 py-2.5 px-3 bg-zinc-50/70 border border-zinc-200/60 rounded-xl text-center text-[10px] sm:text-[11px] font-medium text-zinc-600">
                <div className="flex flex-col items-center gap-0.5">
                  <Truck className="w-3.5 h-3.5 text-zinc-800" />
                  <span>Free Express Delivery</span>
                </div>
                <div className="flex flex-col items-center gap-0.5 border-x border-zinc-200/80 px-1">
                  <RotateCcw className="w-3.5 h-3.5 text-zinc-800" />
                  <span>14-Day Easy Returns</span>
                </div>
                <div className="flex flex-col items-center gap-0.5">
                  <ShieldCheck className="w-3.5 h-3.5 text-zinc-800" />
                  <span>Certified Authentic</span>
                </div>
              </div>

              {/* Compact Specifications Accordions */}
              <div className="border-t border-zinc-200 pt-1 space-y-0">
                
                {/* Material & Care */}
                <div className="border-b border-zinc-100">
                  <button
                    type="button"
                    onClick={() => toggleAccordion('material')}
                    className="w-full py-2.5 flex items-center justify-between text-left text-xs font-bold uppercase tracking-wider text-zinc-900 cursor-pointer"
                  >
                    <span>Material &amp; Fabric Specs</span>
                    {activeAccordion === 'material' ? <ChevronUp className="w-3.5 h-3.5 text-zinc-500" /> : <ChevronDown className="w-3.5 h-3.5 text-zinc-500" />}
                  </button>
                  {activeAccordion === 'material' && (
                    <div className="pb-3 text-xs text-zinc-600 space-y-1 leading-relaxed animate-fade-in">
                      <p>• 100% Organic Heavyweight Cotton with compact yarn finish</p>
                      <p>• Pre-shrunk French Terry weave (420–480 GSM)</p>
                      <p>• Machine wash cold at 30°C on delicate cycle. Lay flat to dry.</p>
                    </div>
                  )}
                </div>

                {/* Size & Fit */}
                <div className="border-b border-zinc-100">
                  <button
                    type="button"
                    onClick={() => toggleAccordion('fit')}
                    className="w-full py-2.5 flex items-center justify-between text-left text-xs font-bold uppercase tracking-wider text-zinc-900 cursor-pointer"
                  >
                    <span>Size &amp; Tailored Fit</span>
                    {activeAccordion === 'fit' ? <ChevronUp className="w-3.5 h-3.5 text-zinc-500" /> : <ChevronDown className="w-3.5 h-3.5 text-zinc-500" />}
                  </button>
                  {activeAccordion === 'fit' && (
                    <div className="pb-3 text-xs text-zinc-600 space-y-1 leading-relaxed animate-fade-in">
                      <p>• Fit: Relaxed high-fashion boxy silhouette</p>
                      <p>• Drop shoulders with structured chest taper</p>
                      <p>• Model is 6'1" (185 cm) wearing size L</p>
                    </div>
                  )}
                </div>

                {/* Shipping */}
                <div className="border-b border-zinc-100">
                  <button
                    type="button"
                    onClick={() => toggleAccordion('shipping')}
                    className="w-full py-2.5 flex items-center justify-between text-left text-xs font-bold uppercase tracking-wider text-zinc-900 cursor-pointer"
                  >
                    <span>Shipping &amp; Free Doorstep Pickup</span>
                    {activeAccordion === 'shipping' ? <ChevronUp className="w-3.5 h-3.5 text-zinc-500" /> : <ChevronDown className="w-3.5 h-3.5 text-zinc-500" />}
                  </button>
                  {activeAccordion === 'shipping' && (
                    <div className="pb-3 text-xs text-zinc-600 space-y-1 leading-relaxed animate-fade-in">
                      <p>• Dispatched within 24-48 hours with live tracking</p>
                      <p>• Hassle-free 14-day exchange and refund policy</p>
                    </div>
                  )}
                </div>

              </div>

            </div>

          </section>
        )}

        {/* ═══════════════════════ COMPLETE THE LOOK SECTION ═══════════════════════ */}
        <section className="mb-16 sm:mb-24 border-t border-zinc-100 pt-12 sm:pt-16">
          <div className="text-center max-w-xl mx-auto mb-8 sm:mb-12">
            <span className="text-[10px] sm:text-[11px] font-bold uppercase tracking-widest text-zinc-400 block mb-1">
              Curated Ensemble
            </span>
            <h2 className="font-heading font-black text-2xl sm:text-3xl text-zinc-900 uppercase tracking-tight">
              Complete The Look
            </h2>
            <p className="text-xs sm:text-sm text-zinc-500 mt-1.5">
              Complementary wardrobe pieces hand-selected by the Snitch styling atelier.
            </p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 lg:gap-8">
            {COMPLETE_THE_LOOK_ITEMS.map((item) => (
              <div
                key={item._id}
                onClick={() => navigate(`/product/${item._id}`)}
                className="group editorial-card overflow-hidden hover:shadow-xl transition-all duration-300 flex flex-col justify-between cursor-pointer"
              >
                <div className="aspect-[3/4] overflow-hidden bg-zinc-100 relative rounded-t-[24px]">
                  <img
                    src={item.image}
                    alt={item.title}
                    className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-700"
                  />
                  <div className="absolute top-3 left-3 bg-zinc-900/90 text-white text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded">
                    {item.category}
                  </div>
                </div>

                <div className="p-4 sm:p-5 flex flex-col flex-grow justify-between">
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-widest text-zinc-400 block mb-0.5">
                      S N I T C H
                    </span>
                    <h3 className="font-heading font-bold text-xs sm:text-sm text-zinc-900 line-clamp-1 group-hover:text-zinc-700 transition-colors">
                      {item.title}
                    </h3>
                  </div>
                  <div className="pt-2 mt-2 border-t border-zinc-100 flex items-center justify-between">
                    <span className="font-heading font-bold text-xs sm:text-sm text-zinc-900">
                      {formatPrice(item.price)}
                    </span>
                    <span className="text-[10px] sm:text-[11px] font-semibold text-zinc-400 group-hover:text-zinc-900 flex items-center gap-0.5">
                      View <ChevronRight className="w-3 h-3" />
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

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

            {/* Lightbox Prev / Next */}
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

      {/* ═══════════════════════ FOOTER ═══════════════════════ */}
      <footer className="bg-white border-t border-zinc-100 w-full mt-auto">
        <div className="flex flex-col items-center gap-4 py-8 px-6 sm:px-8 w-full max-w-[1440px] mx-auto">
          <div>
            <span className="font-heading text-lg font-bold tracking-[0.2em] text-zinc-900 uppercase">
              S N I T C H
            </span>
          </div>

          <nav className="flex flex-wrap justify-center gap-6 text-[11px] font-semibold text-zinc-400 uppercase tracking-wider">
            <Link to="/" className="hover:text-zinc-900 transition-colors">
              Collections
            </Link>
            <a className="hover:text-zinc-900 transition-colors" href="#">
              Privacy Policy
            </a>
            <a className="hover:text-zinc-900 transition-colors" href="#">
              Terms of Service
            </a>
            <a className="hover:text-zinc-900 transition-colors" href="#">
              Shipping &amp; Returns
            </a>
          </nav>

          <div className="flex items-center gap-1 text-[10px] text-zinc-400">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>© 2024 SNITCH APPAREL. All Rights Reserved.</span>
          </div>
        </div>
      </footer>

    </div>
  );
}
