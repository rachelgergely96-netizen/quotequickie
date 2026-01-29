import React, { useState, useEffect } from 'react';
import { supabase } from './supabase';

// Company Logo Component
const CompanyLogo = ({ size = 120 }) => (
  <svg width={size} height={size} viewBox="0 0 120 120" xmlns="http://www.w3.org/2000/svg">
    <circle cx="60" cy="60" r="56" fill="none" stroke="#1a365d" strokeWidth="3"/>
    <circle cx="60" cy="60" r="48" fill="none" stroke="#1a365d" strokeWidth="1.5"/>
    <ellipse cx="60" cy="60" rx="35" ry="12" fill="none" stroke="#2c5282" strokeWidth="1.5"/>
    <ellipse cx="60" cy="60" rx="35" ry="25" fill="none" stroke="#2c5282" strokeWidth="1"/>
    <ellipse cx="60" cy="60" rx="12" ry="35" fill="none" stroke="#2c5282" strokeWidth="1.5"/>
    <ellipse cx="60" cy="60" rx="25" ry="35" fill="none" stroke="#2c5282" strokeWidth="1"/>
    <circle cx="60" cy="60" r="22" fill="#1a365d"/>
    <text x="60" y="67" textAnchor="middle" fill="white" fontSize="18" fontWeight="bold" fontFamily="Georgia, serif">PGD</text>
    <path id="topArc" d="M 15 60 A 45 45 0 0 1 105 60" fill="none"/>
    <text fontSize="8" fontWeight="600" fill="#1a365d" fontFamily="Arial, sans-serif">
      <textPath href="#topArc" startOffset="50%" textAnchor="middle">PRESTIGE GLOBAL</textPath>
    </text>
    <path id="bottomArc" d="M 105 60 A 45 45 0 0 1 15 60" fill="none"/>
    <text fontSize="8" fontWeight="600" fill="#1a365d" fontFamily="Arial, sans-serif">
      <textPath href="#bottomArc" startOffset="50%" textAnchor="middle">DISTRIBUTORS</textPath>
    </text>
  </svg>
);

// Generate logo as base64 for PDF
const getLogoBase64 = () => {
  const svgString = `<svg width="120" height="120" viewBox="0 0 120 120" xmlns="http://www.w3.org/2000/svg">
    <circle cx="60" cy="60" r="56" fill="none" stroke="#1a365d" stroke-width="3"/>
    <circle cx="60" cy="60" r="48" fill="none" stroke="#1a365d" stroke-width="1.5"/>
    <ellipse cx="60" cy="60" rx="35" ry="12" fill="none" stroke="#2c5282" stroke-width="1.5"/>
    <ellipse cx="60" cy="60" rx="35" ry="25" fill="none" stroke="#2c5282" stroke-width="1"/>
    <ellipse cx="60" cy="60" rx="12" ry="35" fill="none" stroke="#2c5282" stroke-width="1.5"/>
    <ellipse cx="60" cy="60" rx="25" ry="35" fill="none" stroke="#2c5282" stroke-width="1"/>
    <circle cx="60" cy="60" r="22" fill="#1a365d"/>
    <text x="60" y="67" text-anchor="middle" fill="white" font-size="18" font-weight="bold" font-family="Georgia, serif">PGD</text>
    <path id="topArc" d="M 15 60 A 45 45 0 0 1 105 60" fill="none"/>
    <text font-size="8" font-weight="600" fill="#1a365d" font-family="Arial, sans-serif">
      <textPath href="#topArc" startOffset="50%" text-anchor="middle">PRESTIGE GLOBAL</textPath>
    </text>
    <path id="bottomArc" d="M 105 60 A 45 45 0 0 1 15 60" fill="none"/>
    <text font-size="8" font-weight="600" fill="#1a365d" font-family="Arial, sans-serif">
      <textPath href="#bottomArc" startOffset="50%" text-anchor="middle">DISTRIBUTORS</textPath>
    </text>
  </svg>`;
  return 'data:image/svg+xml;base64,' + btoa(svgString);
};

export default function App() {
  const companyInfo = {
    name: 'Prestige Global Distributors, Inc.',
    address1: '88 Dyke Road East',
    address2: 'Setauket, NY 11733',
    phone: '631-223-6615',
    signerName: 'John Gergely',
    signerTitle: 'President'
  };

  // Generate quote number and dates
  const generateQuoteNumber = () => {
    const year = new Date().getFullYear();
    const random = Math.floor(1000 + Math.random() * 9000);
    return `PGD-${year}-${random}`;
  };

  const getDefaultExpiration = () => {
    const date = new Date();
    date.setDate(date.getDate() + 30); // Default 30 days from now
    return date.toISOString().split('T')[0];
  };

  const [quoteNumber] = useState(generateQuoteNumber);
  const [quoteDate] = useState(() => new Date().toISOString().split('T')[0]);

  const [productInfo, setProductInfo] = useState({
    title: "Campbell's Chunky Soup – Product Availability",
    price: '29.90',
    totalAvailable: '2,700',
    unit: 'cases',
    palletConfig: '150 cases per pallet',
    availability: 'While supplies last',
    validUntil: getDefaultExpiration(),
    minimumOrder: '',
    leadTime: '',
    notes: ''
  });

  // Customer & Terms
  const [customerInfo, setCustomerInfo] = useState({
    preparedFor: '',
    paymentTerms: 'Net 30',
    fob: 'Setauket, NY'
  });

  // Price Calculator State
  const [calculator, setCalculator] = useState({
    costPerCase: '',
    quantity: '',
    freightTotal: '',
    targetMargin: '15'
  });

  const [products, setProducts] = useState([
    { upc: '51000-00550', description: 'Beef with Country Vegetables', size: '18.8 oz', casePack: '12 / case' },
    { upc: '51000-12804', description: 'Baked Potato w/ Cheddar & Bacon Bits', size: '18.8 oz', casePack: '12 / case' },
    { upc: '51000-12842', description: 'Baked Potato w/ Steak & Cheese', size: '18.8 oz', casePack: '12 / case' },
    { upc: '51000-15007', description: 'Grilled Chicken & Sausage Gumbo', size: '18.8 oz', casePack: '12 / case' },
    { upc: '51000-00524', description: 'New England Clam Chowder', size: '18.8 oz', casePack: '12 / case' }
  ]);

  const [activeTab, setActiveTab] = useState('edit');
  const [isGenerating, setIsGenerating] = useState(false);
  const [shareStatus, setShareStatus] = useState('');
  const [calculatedPricing, setCalculatedPricing] = useState(null);

  // Quote history state
  const [savedQuotes, setSavedQuotes] = useState([]);
  const [isLoadingQuotes, setIsLoadingQuotes] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [saveStatus, setSaveStatus] = useState('');

  // Product Library state
  const [productLibrary, setProductLibrary] = useState([]);
  const [showLibrary, setShowLibrary] = useState(false);
  const [librarySearch, setLibrarySearch] = useState('');

  // Contact Directory state
  const [contacts, setContacts] = useState([]);
  const [showContactForm, setShowContactForm] = useState(false);
  const [contactSearch, setContactSearch] = useState('');
  const [contactFilter, setContactFilter] = useState('all'); // all, source, customer
  const [editingContact, setEditingContact] = useState(null);
  const [contactForm, setContactForm] = useState({
    company: '',
    contactName: '',
    phone: '',
    email: '',
    type: 'source', // source or customer
    category: '', // diverter, manufacturer, salvage, distributor, grocery, etc.
    notes: ''
  });

  // Contact category options
  const sourceCategories = [
    { value: 'diverter', label: 'Diverter/Liquidator' },
    { value: 'manufacturer', label: 'Manufacturer' },
    { value: 'broker', label: 'Broker' },
    { value: 'auction', label: 'Auction Platform' },
    { value: 'other_source', label: 'Other Source' }
  ];
  const customerCategories = [
    { value: 'salvage', label: 'Salvage Store' },
    { value: 'distributor', label: 'C-Store Distributor' },
    { value: 'grocery', label: 'Grocery Chain' },
    { value: 'cstore', label: 'C-Store Chain' },
    { value: 'other_customer', label: 'Other Customer' }
  ];

  // PIN Authentication for internal access
  const PGD_PIN = '8601'; // Prestige Global Distributors PIN
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [showPinModal, setShowPinModal] = useState(false);
  const [pinInput, setPinInput] = useState('');
  const [pinError, setPinError] = useState('');

  // Check localStorage for existing auth on mount
  useEffect(() => {
    const auth = localStorage.getItem('pgd-authenticated');
    if (auth === 'true') {
      setIsAuthenticated(true);
    }
  }, []);

  const handlePinSubmit = () => {
    if (pinInput === PGD_PIN) {
      setIsAuthenticated(true);
      localStorage.setItem('pgd-authenticated', 'true');
      setShowPinModal(false);
      setPinInput('');
      setPinError('');
    } else {
      setPinError('Incorrect PIN');
      setPinInput('');
    }
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    localStorage.removeItem('pgd-authenticated');
    setAppMode('sourceForm'); // Send back to public source form
  };

  const requireAuth = (callback) => {
    if (isAuthenticated) {
      callback();
    } else {
      setShowPinModal(true);
    }
  };

  // Source Offer System state
  const [appMode, setAppMode] = useState('normal'); // normal, sourceForm, offerQuote, linkGenerated
  const [sourceOffer, setSourceOffer] = useState({
    // Vendor/Source Contact Info
    companyName: '',
    contactName: '',
    contactEmail: '',
    contactPhone: '',
    // Product Info
    productTitle: '',
    sourceCost: '',
    totalAvailable: '',
    unit: 'cases',
    palletConfig: '',
    // Product Condition & Dates
    condition: 'New',
    bestByDate: '',
    pickupDate: '',
    offerValidUntil: '',
    // Shipping
    warehouseLocation: '',
    fobPoint: '',
    freightIncluded: 'no',
    freightEstimate: '',
    // Additional
    availability: 'Immediate',
    notes: ''
  });
  const [sourceProducts, setSourceProducts] = useState([
    { upc: '', description: '', size: '', casePack: '' }
  ]);
  const [generatedOfferUrl, setGeneratedOfferUrl] = useState('');

  // Encode/decode functions for source offer URL
  const encodeOfferData = (data) => btoa(encodeURIComponent(JSON.stringify(data)));
  const decodeOfferData = (str) => {
    try {
      return JSON.parse(decodeURIComponent(atob(str)));
    } catch (e) {
      return null;
    }
  };

  // Check URL for source offer mode on mount
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const mode = params.get('mode');
    const data = params.get('offer');

    if (mode === 'offer' && data) {
      const decoded = decodeOfferData(data);
      if (decoded) {
        // Pre-fill the quote builder with source offer data
        setSourceOffer(decoded.offer);
        setProducts(decoded.products.filter(p => p.description));
        setProductInfo(prev => ({
          ...prev,
          title: decoded.offer.productTitle,
          totalAvailable: decoded.offer.totalAvailable,
          unit: decoded.offer.unit,
          palletConfig: decoded.offer.palletConfig,
          availability: decoded.offer.availability,
          price: '' // They'll set their sell price
        }));
        setAppMode('offerQuote');
      }
    }
  }, []);

  // Source Offer form functions
  const addSourceProduct = () => {
    setSourceProducts([...sourceProducts, { upc: '', description: '', size: '', casePack: '' }]);
  };

  const removeSourceProduct = (index) => {
    if (sourceProducts.length > 1) {
      setSourceProducts(sourceProducts.filter((_, i) => i !== index));
    }
  };

  const updateSourceProduct = (index, field, value) => {
    const updated = [...sourceProducts];
    updated[index][field] = value;
    setSourceProducts(updated);
  };

  const generateOfferLink = () => {
    const data = {
      offer: sourceOffer,
      products: sourceProducts,
      submittedAt: new Date().toISOString()
    };
    const encoded = encodeOfferData(data);
    const url = `${window.location.origin}${window.location.pathname}?mode=offer&offer=${encoded}`;
    setGeneratedOfferUrl(url);
    setAppMode('linkGenerated');
  };

  const resetSourceForm = () => {
    setSourceOffer({
      companyName: '',
      contactName: '',
      contactEmail: '',
      contactPhone: '',
      productTitle: '',
      sourceCost: '',
      totalAvailable: '',
      unit: 'cases',
      palletConfig: '',
      condition: 'New',
      bestByDate: '',
      pickupDate: '',
      offerValidUntil: '',
      warehouseLocation: '',
      fobPoint: '',
      freightIncluded: 'no',
      freightEstimate: '',
      availability: 'Immediate',
      notes: ''
    });
    setSourceProducts([{ upc: '', description: '', size: '', casePack: '' }]);
    setGeneratedOfferUrl('');
    setAppMode('normal');
    window.history.replaceState({}, '', window.location.pathname);
  };

  const exitOfferMode = () => {
    setAppMode('normal');
    window.history.replaceState({}, '', window.location.pathname);
  };

  const isSourceOfferValid = sourceOffer.productTitle && sourceOffer.sourceCost &&
                              sourceOffer.totalAvailable && sourceOffer.companyName &&
                              sourceOffer.contactName && sourceProducts.some(p => p.description);

  // Calculate margin for offer mode
  const sourceCostNum = parseFloat(sourceOffer.sourceCost) || 0;
  const sellPriceNum = parseFloat(productInfo.price) || 0;
  const offerMargin = sellPriceNum > 0 && sourceCostNum > 0
    ? ((sellPriceNum - sourceCostNum) / sellPriceNum * 100).toFixed(1)
    : null;
  const offerProfit = sellPriceNum > 0 && sourceCostNum > 0
    ? (sellPriceNum - sourceCostNum).toFixed(2)
    : null;

  // Load product library from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem('pgd-product-library');
    if (saved) {
      try {
        setProductLibrary(JSON.parse(saved));
      } catch (e) {
        console.error('Failed to load product library:', e);
      }
    }
  }, []);

  // Save product library to localStorage when it changes
  useEffect(() => {
    if (productLibrary.length > 0) {
      localStorage.setItem('pgd-product-library', JSON.stringify(productLibrary));
    }
  }, [productLibrary]);

  // Load contacts from Supabase on mount
  const loadContacts = async () => {
    try {
      const { data, error } = await supabase
        .from('contacts')
        .select('*')
        .order('company', { ascending: true });
      if (error) throw error;
      setContacts(data || []);
    } catch (err) {
      console.error('Failed to load contacts:', err);
      // Fall back to localStorage
      const saved = localStorage.getItem('pgd-contacts');
      if (saved) setContacts(JSON.parse(saved));
    }
  };

  useEffect(() => {
    if (isAuthenticated) {
      loadContacts();
    }
  }, [isAuthenticated]);

  // Save contact to Supabase
  const saveContact = async (contact) => {
    try {
      if (editingContact) {
        const { error } = await supabase
          .from('contacts')
          .update(contact)
          .eq('id', editingContact.id);
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('contacts')
          .insert([{ ...contact, created_at: new Date().toISOString() }]);
        if (error) throw error;
      }
      await loadContacts();
      setShowContactForm(false);
      setEditingContact(null);
      resetContactForm();
    } catch (err) {
      console.error('Failed to save contact:', err);
      // Fall back to localStorage
      const newContacts = editingContact
        ? contacts.map(c => c.id === editingContact.id ? { ...contact, id: editingContact.id } : c)
        : [...contacts, { ...contact, id: Date.now() }];
      setContacts(newContacts);
      localStorage.setItem('pgd-contacts', JSON.stringify(newContacts));
      setShowContactForm(false);
      setEditingContact(null);
      resetContactForm();
    }
  };

  // Delete contact
  const deleteContact = async (id) => {
    if (!confirm('Delete this contact?')) return;
    try {
      const { error } = await supabase.from('contacts').delete().eq('id', id);
      if (error) throw error;
      await loadContacts();
    } catch (err) {
      console.error('Failed to delete contact:', err);
      const newContacts = contacts.filter(c => c.id !== id);
      setContacts(newContacts);
      localStorage.setItem('pgd-contacts', JSON.stringify(newContacts));
    }
  };

  const resetContactForm = () => {
    setContactForm({
      company: '',
      contactName: '',
      phone: '',
      email: '',
      type: 'source',
      category: '',
      notes: ''
    });
  };

  const startEditContact = (contact) => {
    setEditingContact(contact);
    setContactForm({
      company: contact.company || '',
      contactName: contact.contact_name || '',
      phone: contact.phone || '',
      email: contact.email || '',
      type: contact.type || 'source',
      category: contact.category || '',
      notes: contact.notes || ''
    });
    setShowContactForm(true);
  };

  // Filter contacts based on search and type
  const filteredContacts = contacts.filter(c => {
    const matchesSearch = !contactSearch ||
      (c.company?.toLowerCase().includes(contactSearch.toLowerCase()) ||
       c.contact_name?.toLowerCase().includes(contactSearch.toLowerCase()));
    const matchesFilter = contactFilter === 'all' || c.type === contactFilter;
    return matchesSearch && matchesFilter;
  });

  // Product Library functions
  const saveProductToLibrary = (product) => {
    const exists = productLibrary.some(p => p.upc === product.upc);
    if (exists) {
      alert('Product with this UPC already exists in your library.');
      return;
    }
    if (!product.upc || !product.description) {
      alert('Product must have a UPC and description to save to library.');
      return;
    }
    setProductLibrary([...productLibrary, { ...product, id: Date.now() }]);
  };

  const removeFromLibrary = (id) => {
    setProductLibrary(productLibrary.filter(p => p.id !== id));
    if (productLibrary.length === 1) {
      localStorage.removeItem('pgd-product-library');
    }
  };

  const addFromLibrary = (libraryProduct) => {
    const { id, ...product } = libraryProduct;
    setProducts([...products, product]);
  };

  const addAllFromLibrary = () => {
    const filteredProducts = getFilteredLibrary();
    const newProducts = filteredProducts.map(({ id, ...product }) => product);
    setProducts([...products, ...newProducts]);
    setShowLibrary(false);
    setLibrarySearch('');
  };

  const getFilteredLibrary = () => {
    if (!librarySearch) return productLibrary;
    const search = librarySearch.toLowerCase();
    return productLibrary.filter(p =>
      p.upc.toLowerCase().includes(search) ||
      p.description.toLowerCase().includes(search)
    );
  };

  // Load quote from URL on mount
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const sharedData = params.get('quote');
    if (sharedData) {
      try {
        const decoded = JSON.parse(atob(sharedData));
        if (decoded.productInfo) setProductInfo(decoded.productInfo);
        if (decoded.products) setProducts(decoded.products);
        setActiveTab('preview');
      } catch (e) {
        console.error('Failed to load shared quote:', e);
      }
    }
  }, []);

  // Load quotes when History tab is opened
  useEffect(() => {
    if (activeTab === 'history' && supabase) {
      loadQuotes();
    }
  }, [activeTab]);

  // Supabase functions
  const loadQuotes = async () => {
    if (!supabase) return;
    setIsLoadingQuotes(true);
    try {
      const { data, error } = await supabase
        .from('quotes')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(50);

      if (error) throw error;
      setSavedQuotes(data || []);
    } catch (error) {
      console.error('Failed to load quotes:', error);
    } finally {
      setIsLoadingQuotes(false);
    }
  };

  const saveQuote = async () => {
    if (!supabase) {
      alert('Supabase not configured. Add VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY to your environment.');
      return;
    }
    setIsSaving(true);
    try {
      const { error } = await supabase
        .from('quotes')
        .insert([{
          title: productInfo.title,
          product_info: productInfo,
          products: products
        }]);

      if (error) throw error;
      setSaveStatus('saved');
      setTimeout(() => setSaveStatus(''), 2000);
      if (activeTab === 'history') loadQuotes();
    } catch (error) {
      console.error('Failed to save quote:', error);
      alert('Failed to save quote. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  const loadSavedQuote = (quote) => {
    setProductInfo(quote.product_info);
    setProducts(quote.products);
    setActiveTab('edit');
  };

  const deleteQuote = async (id) => {
    if (!supabase) return;
    if (!confirm('Delete this quote?')) return;
    try {
      const { error } = await supabase
        .from('quotes')
        .delete()
        .eq('id', id);

      if (error) throw error;
      setSavedQuotes(savedQuotes.filter(q => q.id !== id));
    } catch (error) {
      console.error('Failed to delete quote:', error);
      alert('Failed to delete quote.');
    }
  };

  const formatDate = (dateStr) => {
    return new Date(dateStr).toLocaleDateString('en-US', {
      month: 'short', day: 'numeric', year: 'numeric', hour: 'numeric', minute: '2-digit'
    });
  };

  // Calculator functions
  const parseNumber = (val) => {
    const num = parseFloat(val.replace(/,/g, ''));
    return isNaN(num) ? 0 : num;
  };

  const formatCurrency = (num) => {
    return num.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  };

  const calculatePricing = () => {
    const cost = parseNumber(calculator.costPerCase);
    const qty = parseNumber(calculator.quantity);
    const freight = parseNumber(calculator.freightTotal);
    const margin = parseNumber(calculator.targetMargin) / 100;

    if (cost <= 0 || qty <= 0) {
      alert('Please enter a valid cost per case and quantity.');
      return;
    }

    const totalProductCost = cost * qty;
    const freightPerCase = qty > 0 ? freight / qty : 0;
    const landedCostPerCase = cost + freightPerCase;
    const totalLandedCost = totalProductCost + freight;

    const salePriceAtMargin = landedCostPerCase / (1 - margin);
    const totalRevenueAtMargin = salePriceAtMargin * qty;
    const profitAtMargin = totalRevenueAtMargin - totalLandedCost;

    const margins = [10, 15, 20, 25, 30].map(m => ({
      margin: m,
      pricePerCase: landedCostPerCase / (1 - m/100),
      totalRevenue: (landedCostPerCase / (1 - m/100)) * qty,
      profit: ((landedCostPerCase / (1 - m/100)) * qty) - totalLandedCost
    }));

    setCalculatedPricing({
      totalProductCost,
      freightPerCase,
      landedCostPerCase,
      totalLandedCost,
      salePriceAtMargin,
      totalRevenueAtMargin,
      profitAtMargin,
      margins,
      targetMargin: calculator.targetMargin
    });
  };

  const clearCalculation = () => {
    setCalculatedPricing(null);
    setCalculator({ costPerCase: '', quantity: '', freightTotal: '', targetMargin: '15' });
  };

  const applyPriceToQuote = (price) => {
    setProductInfo({ ...productInfo, price: price.toFixed(2) });
    setActiveTab('edit');
  };

  // Share functions
  const generateShareLink = () => {
    const data = { productInfo, products };
    const encoded = btoa(JSON.stringify(data));
    return `${window.location.origin}${window.location.pathname}?quote=${encoded}`;
  };

  const copyShareLink = async () => {
    try {
      await navigator.clipboard.writeText(generateShareLink());
      setShareStatus('link');
      setTimeout(() => setShareStatus(''), 2000);
    } catch (e) {
      const textArea = document.createElement('textarea');
      textArea.value = generateShareLink();
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
      setShareStatus('link');
      setTimeout(() => setShareStatus(''), 2000);
    }
  };

  const formatDisplayDate = (dateStr) => {
    return new Date(dateStr).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  const copyQuoteText = async () => {
    const preparedForLine = customerInfo.preparedFor ? `\nPrepared For: ${customerInfo.preparedFor}\n` : '';
    const minimumOrderLine = productInfo.minimumOrder ? `Minimum Order: ${productInfo.minimumOrder}\n` : '';
    const leadTimeLine = productInfo.leadTime ? `Lead Time: ${productInfo.leadTime}\n` : '';
    const notesSection = productInfo.notes ? `\nNotes:\n${productInfo.notes}\n` : '';
    const text = `${companyInfo.name}
${companyInfo.address1}
${companyInfo.address2}
Phone: ${companyInfo.phone}

Quote: ${quoteNumber}
Date: ${formatDisplayDate(quoteDate)}
Valid Until: ${formatDisplayDate(productInfo.validUntil)}
${preparedForLine}
${productInfo.title}

Price: $${productInfo.price} per ${productInfo.unit.replace(/s$/, '')}
Total Available: ${productInfo.totalAvailable} ${productInfo.unit}
${minimumOrderLine}Pallet Configuration: ${productInfo.palletConfig}
${leadTimeLine}Availability: ${productInfo.availability}
Payment Terms: ${customerInfo.paymentTerms}
FOB: ${customerInfo.fob}
${notesSection}
Products:
${products.map(p => `- ${p.upc} - ${p.description} (${p.size}, ${p.casePack})`).join('\n')}

Sincerely,
${companyInfo.signerName}
${companyInfo.signerTitle}`;

    try {
      await navigator.clipboard.writeText(text);
      setShareStatus('text');
      setTimeout(() => setShareStatus(''), 2000);
    } catch (e) {
      const textArea = document.createElement('textarea');
      textArea.value = text;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
      setShareStatus('text');
      setTimeout(() => setShareStatus(''), 2000);
    }
  };

  const shareViaEmail = () => {
    const preparedForLine = customerInfo.preparedFor ? `\nPrepared For: ${customerInfo.preparedFor}\n` : '';
    const minimumOrderLine = productInfo.minimumOrder ? `Minimum Order: ${productInfo.minimumOrder}\n` : '';
    const leadTimeLine = productInfo.leadTime ? `Lead Time: ${productInfo.leadTime}\n` : '';
    const notesSection = productInfo.notes ? `\nNotes:\n${productInfo.notes}\n` : '';
    const subject = encodeURIComponent(`${quoteNumber} - ${productInfo.title}`);
    const body = encodeURIComponent(`${companyInfo.name}
${companyInfo.address1}, ${companyInfo.address2}
Phone: ${companyInfo.phone}

Quote: ${quoteNumber}
Date: ${formatDisplayDate(quoteDate)}
Valid Until: ${formatDisplayDate(productInfo.validUntil)}
${preparedForLine}
${productInfo.title}

Price: $${productInfo.price} per ${productInfo.unit.replace(/s$/, '')}
Total Available: ${productInfo.totalAvailable} ${productInfo.unit}
${minimumOrderLine}Pallet Configuration: ${productInfo.palletConfig}
${leadTimeLine}Availability: ${productInfo.availability}
Payment Terms: ${customerInfo.paymentTerms}
FOB: ${customerInfo.fob}
${notesSection}
Products Available:
${products.map(p => `- ${p.upc} - ${p.description} (${p.size}, ${p.casePack})`).join('\n')}

View the full quote online: ${generateShareLink()}

Sincerely,
${companyInfo.signerName}
${companyInfo.signerTitle}`);

    window.open(`mailto:?subject=${subject}&body=${body}`, '_blank');
  };

  const shareViaWhatsApp = () => {
    const text = encodeURIComponent(`*${quoteNumber}*
*${productInfo.title}*

Price: $${productInfo.price} per ${productInfo.unit.replace(/s$/, '')}
Total Available: ${productInfo.totalAvailable} ${productInfo.unit}
Valid Until: ${formatDisplayDate(productInfo.validUntil)}

View quote: ${generateShareLink()}

- ${companyInfo.name}`);

    window.open(`https://wa.me/?text=${text}`, '_blank');
  };

  const addProduct = () => {
    setProducts([...products, { upc: '', description: '', size: '18.8 oz', casePack: '12 / case' }]);
  };

  const removeProduct = (index) => {
    setProducts(products.filter((_, i) => i !== index));
  };

  const updateProduct = (index, field, value) => {
    const updated = [...products];
    updated[index][field] = value;
    setProducts(updated);
  };

  // Script loader helper
  const loadScript = (src) => {
    return new Promise((resolve, reject) => {
      const existingScript = document.querySelector(`script[src="${src}"]`);
      if (existingScript) {
        resolve();
        return;
      }
      const script = document.createElement('script');
      script.src = src;
      script.onload = resolve;
      script.onerror = reject;
      document.head.appendChild(script);
    });
  };

  // Generate PDF using jsPDF
  const generatePDF = async () => {
    setIsGenerating(true);

    try {
      await loadScript('https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js');
      await loadScript('https://cdnjs.cloudflare.com/ajax/libs/jspdf-autotable/3.5.31/jspdf.plugin.autotable.min.js');

      if (!window.jspdf) {
        throw new Error('jsPDF failed to load');
      }

      const { jsPDF } = window.jspdf;
      const doc = new jsPDF();
      const pageWidth = doc.internal.pageSize.getWidth();
      let yPos = 15;

      try {
        const canvas = document.createElement('canvas');
        canvas.width = 120;
        canvas.height = 120;
        const ctx = canvas.getContext('2d');
        const img = new Image();
        img.src = getLogoBase64();
        await new Promise((resolve) => {
          img.onload = resolve;
          setTimeout(resolve, 500);
        });
        ctx.drawImage(img, 0, 0, 120, 120);
        const logoData = canvas.toDataURL('image/png');
        doc.addImage(logoData, 'PNG', (pageWidth - 30) / 2, yPos, 30, 30);
      } catch (e) {}
      yPos += 35;

      doc.setFontSize(16);
      doc.setFont('helvetica', 'bold');
      doc.text('PRESTIGE GLOBAL', pageWidth / 2, yPos, { align: 'center' });
      yPos += 6;
      doc.text('DISTRIBUTORS', pageWidth / 2, yPos, { align: 'center' });
      yPos += 12;

      doc.setFontSize(10);
      doc.setFont('helvetica', 'bold');
      doc.text(companyInfo.name, 14, yPos);

      // Quote number and dates on the right side
      doc.setFont('helvetica', 'bold');
      doc.text(quoteNumber, pageWidth - 14, yPos, { align: 'right' });
      yPos += 5;

      doc.setFont('helvetica', 'normal');
      doc.text(companyInfo.address1, 14, yPos);
      doc.text(`Date: ${new Date(quoteDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}`, pageWidth - 14, yPos, { align: 'right' });
      yPos += 5;
      doc.text(companyInfo.address2, 14, yPos);
      doc.text(`Valid Until: ${new Date(productInfo.validUntil).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}`, pageWidth - 14, yPos, { align: 'right' });
      yPos += 5;
      doc.text(`Phone: ${companyInfo.phone}`, 14, yPos);
      yPos += 12;

      // Prepared For section
      if (customerInfo.preparedFor) {
        doc.setFontSize(9);
        doc.setFont('helvetica', 'normal');
        doc.text('PREPARED FOR:', 14, yPos);
        yPos += 4;
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(11);
        doc.text(customerInfo.preparedFor, 14, yPos);
        yPos += 10;
      }

      doc.setFontSize(16);
      doc.setFont('helvetica', 'bold');
      doc.text(productInfo.title, pageWidth / 2, yPos, { align: 'center' });
      yPos += 12;

      doc.setFontSize(10);

      // Use fixed label width to avoid measurement issues with font changes
      const labelWidth = 45;

      doc.setFont('helvetica', 'bold');
      doc.text('Price:', 14, yPos);
      doc.setFont('helvetica', 'normal');
      doc.text(`$${productInfo.price} per ${productInfo.unit.replace(/s$/, '')}`, 14 + labelWidth, yPos);
      yPos += 5;

      doc.setFont('helvetica', 'bold');
      doc.text('Total Available:', 14, yPos);
      doc.setFont('helvetica', 'normal');
      doc.text(`${productInfo.totalAvailable} ${productInfo.unit}`, 14 + labelWidth, yPos);
      yPos += 5;

      doc.setFont('helvetica', 'bold');
      doc.text('Pallet Config:', 14, yPos);
      doc.setFont('helvetica', 'normal');
      doc.text(productInfo.palletConfig, 14 + labelWidth, yPos);
      yPos += 5;

      doc.setFont('helvetica', 'bold');
      doc.text('Availability:', 14, yPos);
      doc.setFont('helvetica', 'normal');
      doc.text(productInfo.availability, 14 + labelWidth, yPos);
      yPos += 5;

      doc.setFont('helvetica', 'bold');
      doc.text('Payment Terms:', 14, yPos);
      doc.setFont('helvetica', 'normal');
      doc.text(customerInfo.paymentTerms, 14 + labelWidth, yPos);
      yPos += 5;

      doc.setFont('helvetica', 'bold');
      doc.text('FOB:', 14, yPos);
      doc.setFont('helvetica', 'normal');
      doc.text(customerInfo.fob, 14 + labelWidth, yPos);
      yPos += 5;

      if (productInfo.minimumOrder) {
        doc.setFont('helvetica', 'bold');
        doc.text('Minimum Order:', 14, yPos);
        doc.setFont('helvetica', 'normal');
        doc.text(productInfo.minimumOrder, 14 + labelWidth, yPos);
        yPos += 5;
      }

      if (productInfo.leadTime) {
        doc.setFont('helvetica', 'bold');
        doc.text('Lead Time:', 14, yPos);
        doc.setFont('helvetica', 'normal');
        doc.text(productInfo.leadTime, 14 + labelWidth, yPos);
        yPos += 5;
      }

      yPos += 5;

      if (products.length > 0) {
        doc.autoTable({
          startY: yPos,
          head: [['UPC', 'Description', 'Can Size', 'Case Pack']],
          body: products.map(p => [p.upc, p.description, p.size, p.casePack]),
          theme: 'plain',
          headStyles: { fontStyle: 'bold', fillColor: [255, 255, 255], textColor: [0, 0, 0], lineWidth: 0.5, lineColor: [0, 0, 0] },
          styles: { fontSize: 9, cellPadding: 3 },
          columnStyles: { 0: { cellWidth: 35 }, 1: { cellWidth: 80 }, 2: { cellWidth: 25 }, 3: { cellWidth: 30 } }
        });
        yPos = doc.lastAutoTable.finalY + 10;
      }

      // Notes section
      if (productInfo.notes) {
        doc.setFontSize(10);
        doc.setFont('helvetica', 'bold');
        doc.text('Notes:', 14, yPos);
        yPos += 5;
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(9);
        const splitNotes = doc.splitTextToSize(productInfo.notes, pageWidth - 28);
        doc.text(splitNotes, 14, yPos);
        yPos += splitNotes.length * 4 + 10;
      } else {
        yPos += 5;
      }

      doc.setFontSize(10);
      doc.text('Sincerely,', 14, yPos);
      yPos += 10;
      doc.setFont('helvetica', 'bold');
      doc.text(companyInfo.signerName, 14, yPos);
      yPos += 5;
      doc.setFont('helvetica', 'normal');
      doc.text(companyInfo.signerTitle, 14, yPos);

      doc.save(`${quoteNumber}.pdf`);
    } catch (error) {
      console.error('PDF generation failed:', error);
      alert('Failed to generate PDF. Please try again.');
    } finally {
      setIsGenerating(false);
    }
  };

  const exportCSV = () => {
    const headers = ['UPC', 'Description', 'Can Size', 'Case Pack'];
    const preparedForRow = customerInfo.preparedFor ? [`"Prepared For: ${customerInfo.preparedFor}"`] : [];
    const minimumOrderRow = productInfo.minimumOrder ? [`"Minimum Order: ${productInfo.minimumOrder}"`] : [];
    const leadTimeRow = productInfo.leadTime ? [`"Lead Time: ${productInfo.leadTime}"`] : [];
    const notesRow = productInfo.notes ? [`"Notes: ${productInfo.notes.replace(/"/g, '""')}"`] : [];
    const csvContent = [
      [`"${quoteNumber}"`],
      [`"Date: ${formatDisplayDate(quoteDate)}"`],
      [`"Valid Until: ${formatDisplayDate(productInfo.validUntil)}"`],
      ...preparedForRow,
      [''],
      [`"Quote: ${productInfo.title}"`],
      [`"Price: $${productInfo.price} per ${productInfo.unit}"`],
      [`"Total Available: ${productInfo.totalAvailable} ${productInfo.unit}"`],
      ...minimumOrderRow,
      [`"Pallet Configuration: ${productInfo.palletConfig}"`],
      ...leadTimeRow,
      [`"Payment Terms: ${customerInfo.paymentTerms}"`],
      [`"FOB: ${customerInfo.fob}"`],
      ...notesRow,
      [''],
      headers.map(h => `"${h}"`).join(','),
      ...products.map(p => [p.upc, p.description, p.size, p.casePack].map(v => `"${v}"`).join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `${quoteNumber}.csv`;
    link.click();
  };

  const exportExcel = async () => {
    setIsGenerating(true);

    try {
      await loadScript('https://cdnjs.cloudflare.com/ajax/libs/xlsx/0.18.5/xlsx.full.min.js');

      const XLSX = window.XLSX;
      const wb = XLSX.utils.book_new();
      const wsData = [
        ['Prestige Global Distributors, Inc.', '', '', quoteNumber],
        ['88 Dyke Road East, Setauket, NY 11733', '', '', `Date: ${formatDisplayDate(quoteDate)}`],
        ['Phone: 631-223-6615', '', '', `Valid Until: ${formatDisplayDate(productInfo.validUntil)}`],
        [''],
        ...(customerInfo.preparedFor ? [['Prepared For:', customerInfo.preparedFor], ['']] : []),
        [productInfo.title],
        [''],
        ['Price:', `$${productInfo.price} per ${productInfo.unit.replace(/s$/, '')}`],
        ['Total Available:', `${productInfo.totalAvailable} ${productInfo.unit}`],
        ...(productInfo.minimumOrder ? [['Minimum Order:', productInfo.minimumOrder]] : []),
        ['Pallet Configuration:', productInfo.palletConfig],
        ...(productInfo.leadTime ? [['Lead Time:', productInfo.leadTime]] : []),
        ['Availability:', productInfo.availability],
        ['Payment Terms:', customerInfo.paymentTerms],
        ['FOB:', customerInfo.fob],
        ...(productInfo.notes ? [[''], ['Notes:', productInfo.notes]] : []),
        [''],
        ['UPC', 'Description', 'Can Size', 'Case Pack'],
        ...products.map(p => [p.upc, p.description, p.size, p.casePack])
      ];

      const ws = XLSX.utils.aoa_to_sheet(wsData);
      ws['!cols'] = [{ wch: 15 }, { wch: 45 }, { wch: 12 }, { wch: 20 }];
      XLSX.utils.book_append_sheet(wb, ws, 'Quote');

      XLSX.writeFile(wb, `${quoteNumber}.xlsx`);
    } catch (error) {
      console.error('Excel export failed:', error);
      alert('Failed to export Excel. Please try again.');
    } finally {
      setIsGenerating(false);
    }
  };

  // ============ SOURCE OFFER FORM ============
  if (appMode === 'sourceForm') {
    return (
      <div className="min-h-screen bg-gradient-to-b from-blue-50 to-slate-100">
        <div className="max-w-4xl mx-auto p-4 sm:p-6">
          {/* Header */}
          <div className="text-center mb-6 sm:mb-8">
            <div className="flex justify-center mb-3"><CompanyLogo size={70} /></div>
            <h1 className="text-2xl sm:text-3xl font-bold text-slate-800 mb-2">Submit Product Offer</h1>
            <p className="text-slate-600 text-sm sm:text-base">to Prestige Global Distributors</p>
            <p className="text-slate-500 text-xs mt-2">Complete this form to submit your product availability. We'll review and respond promptly.</p>
            {isAuthenticated ? (
              <button onClick={() => setAppMode('normal')} className="mt-3 text-sm text-slate-500 hover:text-slate-700 underline">
                ← Back to Main App
              </button>
            ) : (
              <button onClick={() => setShowPinModal(true)} className="mt-3 text-sm text-amber-600 hover:text-amber-700 underline">
                PGD Staff Login
              </button>
            )}
          </div>

          {/* Vendor Contact Information */}
          <div className="bg-white rounded-xl shadow-sm border p-4 sm:p-6 mb-4 sm:mb-6">
            <h2 className="text-lg font-semibold mb-4 text-slate-800 flex items-center gap-2">
              <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
              Your Contact Information
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
              <div>
                <label className="block text-xs sm:text-sm font-medium text-slate-600 mb-1">Company Name *</label>
                <input type="text" value={sourceOffer.companyName} onChange={(e) => setSourceOffer({...sourceOffer, companyName: e.target.value})} className="w-full border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500" placeholder="Your company name" />
              </div>
              <div>
                <label className="block text-xs sm:text-sm font-medium text-slate-600 mb-1">Contact Name *</label>
                <input type="text" value={sourceOffer.contactName} onChange={(e) => setSourceOffer({...sourceOffer, contactName: e.target.value})} className="w-full border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500" placeholder="Your name" />
              </div>
              <div>
                <label className="block text-xs sm:text-sm font-medium text-slate-600 mb-1">Email</label>
                <input type="email" value={sourceOffer.contactEmail} onChange={(e) => setSourceOffer({...sourceOffer, contactEmail: e.target.value})} className="w-full border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500" placeholder="email@company.com" />
              </div>
              <div>
                <label className="block text-xs sm:text-sm font-medium text-slate-600 mb-1">Phone</label>
                <input type="tel" value={sourceOffer.contactPhone} onChange={(e) => setSourceOffer({...sourceOffer, contactPhone: e.target.value})} className="w-full border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500" placeholder="(555) 123-4567" />
              </div>
            </div>
          </div>

          {/* Product & Pricing */}
          <div className="bg-white rounded-xl shadow-sm border p-4 sm:p-6 mb-4 sm:mb-6">
            <h2 className="text-lg font-semibold mb-4 text-slate-800 flex items-center gap-2">
              <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" /></svg>
              Product & Pricing
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
              <div className="sm:col-span-2">
                <label className="block text-xs sm:text-sm font-medium text-slate-600 mb-1">Product / Product Line *</label>
                <input type="text" value={sourceOffer.productTitle} onChange={(e) => setSourceOffer({...sourceOffer, productTitle: e.target.value})} className="w-full border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500" placeholder="e.g., Campbell's Chunky Soup Assortment" />
              </div>
              <div>
                <label className="block text-xs sm:text-sm font-medium text-slate-600 mb-1">Your Asking Price (per unit) *</label>
                <div className="flex">
                  <span className="inline-flex items-center px-3 border border-r-0 rounded-l-lg bg-slate-50 text-slate-500">$</span>
                  <input type="text" value={sourceOffer.sourceCost} onChange={(e) => setSourceOffer({...sourceOffer, sourceCost: e.target.value})} className="w-full border rounded-r-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500" placeholder="25.00" />
                </div>
              </div>
              <div>
                <label className="block text-xs sm:text-sm font-medium text-slate-600 mb-1">Unit Type</label>
                <select value={sourceOffer.unit} onChange={(e) => setSourceOffer({...sourceOffer, unit: e.target.value})} className="w-full border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500">
                  <option value="cases">per case</option>
                  <option value="pallets">per pallet</option>
                  <option value="units">per unit</option>
                  <option value="cartons">per carton</option>
                </select>
              </div>
              <div>
                <label className="block text-xs sm:text-sm font-medium text-slate-600 mb-1">Total Quantity Available *</label>
                <input type="text" value={sourceOffer.totalAvailable} onChange={(e) => setSourceOffer({...sourceOffer, totalAvailable: e.target.value})} className="w-full border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500" placeholder="2,700" />
              </div>
              <div>
                <label className="block text-xs sm:text-sm font-medium text-slate-600 mb-1">Pallet Configuration</label>
                <input type="text" value={sourceOffer.palletConfig} onChange={(e) => setSourceOffer({...sourceOffer, palletConfig: e.target.value})} className="w-full border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500" placeholder="150 cases per pallet" />
              </div>
            </div>
          </div>

          {/* Product Condition & Dates */}
          <div className="bg-white rounded-xl shadow-sm border p-4 sm:p-6 mb-4 sm:mb-6">
            <h2 className="text-lg font-semibold mb-4 text-slate-800 flex items-center gap-2">
              <svg className="w-5 h-5 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
              Product Condition & Timing
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
              <div>
                <label className="block text-xs sm:text-sm font-medium text-slate-600 mb-1">Condition</label>
                <select value={sourceOffer.condition} onChange={(e) => setSourceOffer({...sourceOffer, condition: e.target.value})} className="w-full border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500">
                  <option value="New">New / First Quality</option>
                  <option value="Overstock">Overstock</option>
                  <option value="Closeout">Closeout</option>
                  <option value="Short-dated">Short-dated</option>
                  <option value="Damaged packaging">Damaged Packaging</option>
                  <option value="Salvage">Salvage</option>
                </select>
              </div>
              <div>
                <label className="block text-xs sm:text-sm font-medium text-slate-600 mb-1">Best By / Expiration Date</label>
                <input type="date" value={sourceOffer.bestByDate} onChange={(e) => setSourceOffer({...sourceOffer, bestByDate: e.target.value})} className="w-full border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500" />
              </div>
              <div>
                <label className="block text-xs sm:text-sm font-medium text-slate-600 mb-1">Available for Pickup</label>
                <select value={sourceOffer.availability} onChange={(e) => setSourceOffer({...sourceOffer, availability: e.target.value})} className="w-full border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500">
                  <option value="Immediate">Immediate</option>
                  <option value="Within 1 week">Within 1 week</option>
                  <option value="Within 2 weeks">Within 2 weeks</option>
                  <option value="Within 30 days">Within 30 days</option>
                  <option value="Call for availability">Call for availability</option>
                </select>
              </div>
              <div>
                <label className="block text-xs sm:text-sm font-medium text-slate-600 mb-1">Offer Valid Until</label>
                <input type="date" value={sourceOffer.offerValidUntil} onChange={(e) => setSourceOffer({...sourceOffer, offerValidUntil: e.target.value})} className="w-full border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500" />
              </div>
            </div>
          </div>

          {/* Shipping & Location */}
          <div className="bg-white rounded-xl shadow-sm border p-4 sm:p-6 mb-4 sm:mb-6">
            <h2 className="text-lg font-semibold mb-4 text-slate-800 flex items-center gap-2">
              <svg className="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
              Shipping & Location
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
              <div>
                <label className="block text-xs sm:text-sm font-medium text-slate-600 mb-1">Warehouse Location</label>
                <input type="text" value={sourceOffer.warehouseLocation} onChange={(e) => setSourceOffer({...sourceOffer, warehouseLocation: e.target.value})} className="w-full border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500" placeholder="City, State" />
              </div>
              <div>
                <label className="block text-xs sm:text-sm font-medium text-slate-600 mb-1">FOB Point</label>
                <input type="text" value={sourceOffer.fobPoint} onChange={(e) => setSourceOffer({...sourceOffer, fobPoint: e.target.value})} className="w-full border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500" placeholder="e.g., Chicago, IL" />
              </div>
              <div>
                <label className="block text-xs sm:text-sm font-medium text-slate-600 mb-1">Freight Included?</label>
                <select value={sourceOffer.freightIncluded} onChange={(e) => setSourceOffer({...sourceOffer, freightIncluded: e.target.value})} className="w-full border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500">
                  <option value="no">No - Buyer arranges freight</option>
                  <option value="yes">Yes - Delivered price</option>
                  <option value="negotiable">Negotiable</option>
                </select>
              </div>
              <div>
                <label className="block text-xs sm:text-sm font-medium text-slate-600 mb-1">Freight Estimate (if delivered)</label>
                <div className="flex">
                  <span className="inline-flex items-center px-3 border border-r-0 rounded-l-lg bg-slate-50 text-slate-500">$</span>
                  <input type="text" value={sourceOffer.freightEstimate} onChange={(e) => setSourceOffer({...sourceOffer, freightEstimate: e.target.value})} className="w-full border rounded-r-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500" placeholder="per pallet/load" />
                </div>
              </div>
            </div>
          </div>

          {/* Product Items */}
          <div className="bg-white rounded-xl shadow-sm border p-4 sm:p-6 mb-4 sm:mb-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-semibold text-slate-800 flex items-center gap-2">
                <svg className="w-5 h-5 text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" /></svg>
                Product SKUs / Items
              </h2>
              <button onClick={addSourceProduct} className="bg-blue-600 text-white px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg hover:bg-blue-700 transition-colors text-sm">
                + Add Item
              </button>
            </div>
            <p className="text-xs text-slate-500 mb-3">List individual products/SKUs included in this offer</p>
            <div className="space-y-3">
              {sourceProducts.map((product, index) => (
                <div key={index} className="p-3 sm:p-4 bg-slate-50 rounded-lg">
                  <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 sm:gap-3">
                    <input type="text" placeholder="UPC" value={product.upc} onChange={(e) => updateSourceProduct(index, 'upc', e.target.value)} className="border rounded-lg px-2 sm:px-3 py-2 text-sm" />
                    <input type="text" placeholder="Description *" value={product.description} onChange={(e) => updateSourceProduct(index, 'description', e.target.value)} className="border rounded-lg px-2 sm:px-3 py-2 text-sm sm:col-span-2" />
                    <input type="text" placeholder="Size" value={product.size} onChange={(e) => updateSourceProduct(index, 'size', e.target.value)} className="border rounded-lg px-2 sm:px-3 py-2 text-sm" />
                    <div className="flex gap-2">
                      <input type="text" placeholder="Case Pack" value={product.casePack} onChange={(e) => updateSourceProduct(index, 'casePack', e.target.value)} className="border rounded-lg px-2 sm:px-3 py-2 text-sm flex-1" />
                      {sourceProducts.length > 1 && (
                        <button onClick={() => removeSourceProduct(index)} className="text-red-500 hover:text-red-700 px-2">✕</button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Additional Notes */}
          <div className="bg-white rounded-xl shadow-sm border p-4 sm:p-6 mb-4 sm:mb-6">
            <h2 className="text-lg font-semibold mb-3 text-slate-800">Additional Notes</h2>
            <textarea value={sourceOffer.notes} onChange={(e) => setSourceOffer({...sourceOffer, notes: e.target.value})} rows={3} className="w-full border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500" placeholder="Any additional details about this offer, special terms, or questions..." />
          </div>

          {/* Submit */}
          <div className="text-center">
            <button onClick={generateOfferLink} disabled={!isSourceOfferValid} className={`px-6 sm:px-8 py-3 rounded-lg font-semibold text-base sm:text-lg transition-all ${isSourceOfferValid ? 'bg-green-600 text-white hover:bg-green-700 shadow-lg hover:shadow-xl' : 'bg-slate-300 text-slate-500 cursor-not-allowed'}`}>
              Generate Quote Link →
            </button>
            {!isSourceOfferValid && (
              <p className="text-sm text-slate-500 mt-2">Fill in required fields (*) to continue</p>
            )}
          </div>
        </div>
      </div>
    );
  }

  // ============ LINK GENERATED SUCCESS ============
  if (appMode === 'linkGenerated') {
    return (
      <div className="min-h-screen bg-gradient-to-b from-green-50 to-slate-50 flex items-center justify-center p-4 sm:p-6">
        <div className="bg-white rounded-xl shadow-lg p-6 sm:p-8 max-w-2xl w-full text-center">
          <div className="w-14 h-14 sm:w-16 sm:h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-7 h-7 sm:w-8 sm:h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h2 className="text-xl sm:text-2xl font-bold text-slate-800 mb-2">Quote Link Ready!</h2>
          <p className="text-slate-600 mb-6 text-sm sm:text-base">Open this link to review, set your price, and generate the PDF</p>

          <div className="bg-slate-50 rounded-lg p-4 mb-6">
            <p className="text-xs text-slate-500 mb-3 font-mono break-all text-left">{generatedOfferUrl.substring(0, 80)}...</p>
            <button onClick={async () => { await navigator.clipboard.writeText(generatedOfferUrl); setShareStatus('offerLink'); setTimeout(() => setShareStatus(''), 2000); }} className={`w-full py-3 rounded-lg font-semibold transition-colors ${shareStatus === 'offerLink' ? 'bg-green-600 text-white' : 'bg-blue-600 text-white hover:bg-blue-700'}`}>
              {shareStatus === 'offerLink' ? '✓ Copied to Clipboard!' : 'Copy Link'}
            </button>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <a href={generatedOfferUrl} className="px-6 py-2.5 bg-slate-800 text-white rounded-lg hover:bg-slate-900 transition-colors font-medium">
              Open Quote Builder →
            </a>
            <button onClick={resetSourceForm} className="px-6 py-2.5 border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors font-medium">
              New Offer
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ============ OFFER QUOTE MODE (Internal Quote Builder) ============
  // Requires authentication - shows sensitive pricing info
  if (appMode === 'offerQuote') {
    // If not authenticated, show login prompt
    if (!isAuthenticated) {
      return (
        <div className="min-h-screen bg-gradient-to-b from-blue-50 to-slate-100">
          <div className="max-w-md mx-auto p-6 text-center pt-20">
            <div className="flex justify-center mb-4"><CompanyLogo size={80} /></div>
            <h1 className="text-2xl font-bold text-slate-800 mb-2">Internal Access Required</h1>
            <p className="text-slate-600 mb-6">This quote builder contains confidential pricing information and requires PGD staff authentication.</p>

            <button
              onClick={() => setShowPinModal(true)}
              className="w-full bg-amber-600 text-white px-6 py-4 rounded-xl hover:bg-amber-700 transition-colors font-semibold text-lg shadow-lg mb-4"
            >
              Staff Login
            </button>

            <button
              onClick={exitOfferMode}
              className="w-full border border-slate-300 text-slate-600 px-6 py-3 rounded-xl hover:bg-white transition-colors"
            >
              ← Back to Home
            </button>
          </div>

          {/* PIN Modal */}
          {showPinModal && (
            <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
              <div className="bg-white rounded-xl shadow-xl max-w-sm w-full p-6">
                <div className="text-center mb-6">
                  <div className="flex justify-center mb-3"><CompanyLogo size={50} /></div>
                  <h3 className="text-lg font-bold text-slate-800">PGD Staff Access</h3>
                  <p className="text-sm text-slate-500 mt-1">Enter PIN to access internal tools</p>
                </div>
                <div className="space-y-4">
                  <div>
                    <input
                      type="password"
                      value={pinInput}
                      onChange={(e) => { setPinInput(e.target.value); setPinError(''); }}
                      onKeyDown={(e) => e.key === 'Enter' && handlePinSubmit()}
                      className="w-full border rounded-lg px-4 py-3 text-center text-2xl tracking-widest focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
                      placeholder="••••"
                      maxLength={4}
                      autoFocus
                    />
                    {pinError && <p className="text-red-500 text-sm text-center mt-2">{pinError}</p>}
                  </div>
                  <div className="flex gap-3">
                    <button onClick={() => { setShowPinModal(false); setPinInput(''); setPinError(''); }} className="flex-1 px-4 py-2.5 border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors font-medium">Cancel</button>
                    <button onClick={handlePinSubmit} className="flex-1 px-4 py-2.5 bg-amber-600 text-white rounded-lg hover:bg-amber-700 transition-colors font-medium">Enter</button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      );
    }

    return (
      <div className="min-h-screen bg-slate-100">
        {/* Header Bar */}
        <div className="bg-slate-800 text-white py-3 sm:py-4 px-4 sm:px-6 sticky top-0 z-10">
          <div className="max-w-6xl mx-auto flex items-center justify-between">
            <div className="flex items-center gap-2 sm:gap-3">
              <CompanyLogo size={36} />
              <div>
                <h1 className="font-bold text-sm sm:text-base">PGD Quote Builder</h1>
                <p className="text-slate-400 text-xs">Internal Use Only</p>
              </div>
            </div>
            <button onClick={exitOfferMode} className="text-slate-400 hover:text-white text-sm">
              ✕ Exit
            </button>
          </div>
        </div>

        <div className="max-w-6xl mx-auto p-4 sm:p-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
            {/* Left Column - Source Info & Pricing */}
            <div className="space-y-4 sm:space-y-6">
              {/* Source Info (Internal - Hidden from Quote) */}
              <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 sm:p-5">
                <h3 className="font-semibold text-amber-800 mb-3 flex items-center gap-2 text-sm sm:text-base">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>
                  Source Info (Hidden from Quote)
                </h3>
                <div className="space-y-2 text-sm">
                  {sourceOffer.companyName && (
                    <div className="pb-2 border-b border-amber-200">
                      <p className="font-semibold text-amber-900">{sourceOffer.companyName}</p>
                      {sourceOffer.contactName && <p className="text-amber-700">{sourceOffer.contactName}</p>}
                      {sourceOffer.contactEmail && <p className="text-amber-600 text-xs">{sourceOffer.contactEmail}</p>}
                      {sourceOffer.contactPhone && <p className="text-amber-600 text-xs">{sourceOffer.contactPhone}</p>}
                    </div>
                  )}
                  <div className="pt-1">
                    <span className="font-medium">Their Price:</span>{' '}
                    <span className="text-lg sm:text-xl font-bold text-amber-900">${sourceOffer.sourceCost}</span>
                    <span className="text-amber-700"> per {sourceOffer.unit?.replace(/s$/, '')}</span>
                  </div>
                  {sourceOffer.condition && sourceOffer.condition !== 'New' && (
                    <p><span className="font-medium">Condition:</span> <span className="text-amber-800">{sourceOffer.condition}</span></p>
                  )}
                  {sourceOffer.bestByDate && (
                    <p><span className="font-medium">Best By:</span> <span className="text-amber-800">{new Date(sourceOffer.bestByDate).toLocaleDateString()}</span></p>
                  )}
                  {sourceOffer.warehouseLocation && (
                    <p><span className="font-medium">Location:</span> <span className="text-amber-800">{sourceOffer.warehouseLocation}</span></p>
                  )}
                  {sourceOffer.fobPoint && (
                    <p><span className="font-medium">FOB:</span> <span className="text-amber-800">{sourceOffer.fobPoint}</span></p>
                  )}
                  {sourceOffer.freightIncluded === 'yes' && (
                    <p className="text-green-700 font-medium">✓ Freight included</p>
                  )}
                  {sourceOffer.freightEstimate && (
                    <p><span className="font-medium">Freight Est:</span> <span className="text-amber-800">${sourceOffer.freightEstimate}</span></p>
                  )}
                  {sourceOffer.offerValidUntil && (
                    <p><span className="font-medium">Offer Valid:</span> <span className="text-amber-800">until {new Date(sourceOffer.offerValidUntil).toLocaleDateString()}</span></p>
                  )}
                  {sourceOffer.notes && (
                    <div className="pt-2 mt-2 border-t border-amber-200">
                      <p className="text-amber-700 italic text-xs">{sourceOffer.notes}</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Set Your Price */}
              <div className="bg-white rounded-xl shadow-sm border p-4 sm:p-5">
                <h3 className="font-semibold text-slate-800 mb-4 text-sm sm:text-base">Set Your Sell Price</h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-xs sm:text-sm font-medium text-slate-600 mb-1">
                      Sell Price (per {sourceOffer.unit?.replace(/s$/, '')})
                    </label>
                    <div className="flex">
                      <span className="inline-flex items-center px-3 border border-r-0 rounded-l-lg bg-slate-50 text-slate-500 text-lg">$</span>
                      <input type="text" value={productInfo.price} onChange={(e) => setProductInfo({...productInfo, price: e.target.value})} className="w-full border rounded-r-lg px-3 py-3 text-lg sm:text-xl font-semibold focus:ring-2 focus:ring-blue-500" placeholder="29.90" />
                    </div>
                  </div>

                  {/* Quick margin buttons */}
                  <div className="flex flex-wrap gap-2">
                    {[10, 15, 20, 25, 30].map(margin => {
                      const price = (sourceCostNum / (1 - margin/100)).toFixed(2);
                      return (
                        <button key={margin} onClick={() => setProductInfo({...productInfo, price})} className="px-3 py-1.5 text-xs bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors">
                          {margin}% → ${price}
                        </button>
                      );
                    })}
                  </div>

                  {offerMargin && (
                    <div className="bg-green-50 rounded-lg p-3 sm:p-4">
                      <div className="flex justify-between items-center">
                        <span className="text-green-700 text-sm">Profit per {sourceOffer.unit?.replace(/s$/, '')}:</span>
                        <span className="text-lg sm:text-xl font-bold text-green-700">${offerProfit}</span>
                      </div>
                      <div className="flex justify-between items-center mt-1">
                        <span className="text-green-700 text-sm">Margin:</span>
                        <span className="text-base sm:text-lg font-semibold text-green-700">{offerMargin}%</span>
                      </div>
                      {sourceOffer.totalAvailable && (
                        <div className="flex justify-between items-center mt-2 pt-2 border-t border-green-200">
                          <span className="text-green-800 font-medium text-sm">Total Potential:</span>
                          <span className="text-lg sm:text-xl font-bold text-green-800">
                            ${(parseFloat(offerProfit) * parseFloat(sourceOffer.totalAvailable.replace(/,/g, ''))).toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}
                          </span>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Use full calculator link */}
                  <button onClick={() => { setCalculator({...calculator, costPerCase: sourceOffer.sourceCost, quantity: sourceOffer.totalAvailable.replace(/,/g, '')}); setAppMode('normal'); setActiveTab('calculator'); }} className="w-full text-sm text-blue-600 hover:text-blue-700 hover:underline">
                    Open full price calculator with freight →
                  </button>
                </div>
              </div>

              {/* Generate PDF Button */}
              <button onClick={generatePDF} disabled={!productInfo.price || isGenerating} className={`w-full py-3 sm:py-4 rounded-xl font-semibold text-base sm:text-lg transition-all ${productInfo.price ? 'bg-blue-600 text-white hover:bg-blue-700 shadow-lg' : 'bg-slate-200 text-slate-400 cursor-not-allowed'}`}>
                {isGenerating ? 'Generating...' : '📄 Generate PDF Quote'}
              </button>
            </div>

            {/* Right Column - Quote Details */}
            <div className="lg:col-span-2 space-y-4 sm:space-y-6">
              {/* Offer Details */}
              <div className="bg-white rounded-xl shadow-sm border p-4 sm:p-5">
                <h3 className="font-semibold text-slate-800 mb-4 text-sm sm:text-base">Quote Details</h3>
                <div className="grid grid-cols-2 gap-3 sm:gap-4 text-sm">
                  <div className="col-span-2">
                    <span className="text-slate-500">Product:</span>
                    <p className="font-semibold text-base sm:text-lg">{productInfo.title}</p>
                  </div>
                  <div>
                    <span className="text-slate-500">Available:</span>
                    <p className="font-semibold">{productInfo.totalAvailable} {productInfo.unit}</p>
                  </div>
                  <div>
                    <span className="text-slate-500">Pallet Config:</span>
                    <p className="font-semibold">{productInfo.palletConfig || '-'}</p>
                  </div>
                  <div className="col-span-2">
                    <span className="text-slate-500">Availability:</span>
                    <p className="font-semibold">{productInfo.availability}</p>
                  </div>
                </div>
              </div>

              {/* Products */}
              <div className="bg-white rounded-xl shadow-sm border p-4 sm:p-5">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="font-semibold text-slate-800 text-sm sm:text-base">Products ({products.length})</h3>
                  <button onClick={addProduct} className="text-blue-600 hover:text-blue-700 text-sm font-medium">+ Add</button>
                </div>
                <div className="space-y-2">
                  {products.map((product, index) => (
                    <div key={index} className="flex gap-2 items-center p-2 sm:p-3 bg-slate-50 rounded-lg">
                      <div className="flex-1 grid grid-cols-2 sm:grid-cols-4 gap-2">
                        <input type="text" placeholder="UPC" value={product.upc} onChange={(e) => updateProduct(index, 'upc', e.target.value)} className="border rounded px-2 py-1.5 text-xs sm:text-sm" />
                        <input type="text" placeholder="Description" value={product.description} onChange={(e) => updateProduct(index, 'description', e.target.value)} className="border rounded px-2 py-1.5 text-xs sm:text-sm sm:col-span-2" />
                        <input type="text" placeholder="Size" value={product.size} onChange={(e) => updateProduct(index, 'size', e.target.value)} className="border rounded px-2 py-1.5 text-xs sm:text-sm" />
                      </div>
                      <input type="text" placeholder="Pack" value={product.casePack} onChange={(e) => updateProduct(index, 'casePack', e.target.value)} className="border rounded px-2 py-1.5 text-xs sm:text-sm w-20" />
                      <button onClick={() => removeProduct(index)} className="text-red-400 hover:text-red-600 p-1">✕</button>
                    </div>
                  ))}
                </div>
              </div>

              {/* Customer Info (optional) */}
              <div className="bg-white rounded-xl shadow-sm border p-4 sm:p-5">
                <h3 className="font-semibold text-slate-800 mb-4 text-sm sm:text-base">Customer (Optional)</h3>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div className="sm:col-span-2">
                    <label className="block text-xs font-medium text-slate-600 mb-1">Prepared For</label>
                    <input type="text" value={customerInfo.preparedFor} onChange={(e) => setCustomerInfo({...customerInfo, preparedFor: e.target.value})} className="w-full border rounded-lg px-3 py-2 text-sm" placeholder="Customer name" />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-slate-600 mb-1">Payment Terms</label>
                    <select value={customerInfo.paymentTerms} onChange={(e) => setCustomerInfo({...customerInfo, paymentTerms: e.target.value})} className="w-full border rounded-lg px-3 py-2 text-sm">
                      <option value="Net 30">Net 30</option>
                      <option value="Net 15">Net 15</option>
                      <option value="COD">COD</option>
                      <option value="Prepaid">Prepaid</option>
                    </select>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ============ NORMAL MODE ============
  // If not authenticated, show source form by default
  if (!isAuthenticated && appMode === 'normal') {
    return (
      <div className="min-h-screen bg-gradient-to-b from-blue-50 to-slate-100">
        <div className="max-w-2xl mx-auto p-6 text-center">
          <div className="flex justify-center mb-4"><CompanyLogo size={80} /></div>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-800 mb-2">Prestige Global Distributors</h1>
          <p className="text-slate-600 mb-8">Product Offer Submission Portal</p>

          <div className="space-y-4">
            <button
              onClick={() => setAppMode('sourceForm')}
              className="w-full bg-emerald-600 text-white px-6 py-4 rounded-xl hover:bg-emerald-700 transition-colors font-semibold text-lg shadow-lg"
            >
              Submit a Product Offer →
            </button>

            <div className="relative">
              <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-slate-300"></div></div>
              <div className="relative flex justify-center text-sm"><span className="px-4 bg-gradient-to-b from-blue-50 to-slate-100 text-slate-500">PGD Staff</span></div>
            </div>

            <button
              onClick={() => setShowPinModal(true)}
              className="w-full border-2 border-slate-300 text-slate-700 px-6 py-3 rounded-xl hover:bg-white hover:border-slate-400 transition-colors font-medium"
            >
              Staff Login
            </button>
          </div>

          <p className="text-xs text-slate-400 mt-8">
            Vendors and sources: Click "Submit a Product Offer" to send us your inventory availability.
          </p>
        </div>

        {/* PIN Modal */}
        {showPinModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl shadow-xl max-w-sm w-full p-6">
              <div className="text-center mb-6">
                <div className="flex justify-center mb-3"><CompanyLogo size={50} /></div>
                <h3 className="text-lg font-bold text-slate-800">PGD Staff Access</h3>
                <p className="text-sm text-slate-500 mt-1">Enter PIN to access internal tools</p>
              </div>
              <div className="space-y-4">
                <div>
                  <input
                    type="password"
                    value={pinInput}
                    onChange={(e) => { setPinInput(e.target.value); setPinError(''); }}
                    onKeyDown={(e) => e.key === 'Enter' && handlePinSubmit()}
                    className="w-full border rounded-lg px-4 py-3 text-center text-2xl tracking-widest focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
                    placeholder="••••"
                    maxLength={4}
                    autoFocus
                  />
                  {pinError && <p className="text-red-500 text-sm text-center mt-2">{pinError}</p>}
                </div>
                <div className="flex gap-3">
                  <button onClick={() => { setShowPinModal(false); setPinInput(''); setPinError(''); }} className="flex-1 px-4 py-2.5 border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors font-medium">Cancel</button>
                  <button onClick={handlePinSubmit} className="flex-1 px-4 py-2.5 bg-amber-600 text-white rounded-lg hover:bg-amber-700 transition-colors font-medium">Enter</button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-amber-50/50">
      {/* Tab Navigation */}
      <div className="bg-stone-50 border-b border-amber-200 sticky top-0 z-10">
        <div className="max-w-6xl mx-auto px-2 sm:px-4">
          <div className="flex items-center justify-between">
            <div className="flex gap-0.5 sm:gap-4 overflow-x-auto">
              <button
                onClick={() => setAppMode('sourceForm')}
                className="py-2 sm:py-3 px-1.5 sm:px-4 font-medium border-b-2 border-transparent text-emerald-600 hover:text-emerald-700 transition-colors text-xs sm:text-base whitespace-nowrap"
              >
                <span className="hidden sm:inline">+ Source Offer</span>
                <span className="sm:hidden">+ Offer</span>
              </button>
              <span className="border-r border-amber-200 mx-1"></span>
              <button
                onClick={() => setActiveTab('calculator')}
                className={`py-2 sm:py-3 px-1.5 sm:px-4 font-medium border-b-2 transition-colors text-xs sm:text-base whitespace-nowrap ${activeTab === 'calculator' ? 'border-amber-600 text-amber-700' : 'border-transparent text-stone-500 hover:text-stone-700'}`}
              >
                <span className="hidden sm:inline">Price Calculator</span>
                <span className="sm:hidden">Calc</span>
              </button>
              <button
                onClick={() => setActiveTab('edit')}
                className={`py-2 sm:py-3 px-1.5 sm:px-4 font-medium border-b-2 transition-colors text-xs sm:text-base whitespace-nowrap ${activeTab === 'edit' ? 'border-amber-600 text-amber-700' : 'border-transparent text-stone-500 hover:text-stone-700'}`}
              >
                <span className="hidden sm:inline">Edit Quote</span>
                <span className="sm:hidden">Edit</span>
              </button>
              <button
                onClick={() => setActiveTab('preview')}
                className={`py-2 sm:py-3 px-1.5 sm:px-4 font-medium border-b-2 transition-colors text-xs sm:text-base whitespace-nowrap ${activeTab === 'preview' ? 'border-amber-600 text-amber-700' : 'border-transparent text-stone-500 hover:text-stone-700'}`}
              >
                <span className="hidden sm:inline">Preview & Export</span>
                <span className="sm:hidden">Preview</span>
              </button>
              <button
                onClick={() => setActiveTab('history')}
                className={`py-2 sm:py-3 px-1.5 sm:px-4 font-medium border-b-2 transition-colors text-xs sm:text-base whitespace-nowrap ${activeTab === 'history' ? 'border-amber-600 text-amber-700' : 'border-transparent text-stone-500 hover:text-stone-700'}`}
              >
                <span className="hidden sm:inline">History</span>
                <span className="sm:hidden">Saved</span>
              </button>
              <button
                onClick={() => setActiveTab('contacts')}
                className={`py-2 sm:py-3 px-1.5 sm:px-4 font-medium border-b-2 transition-colors text-xs sm:text-base whitespace-nowrap ${activeTab === 'contacts' ? 'border-amber-600 text-amber-700' : 'border-transparent text-stone-500 hover:text-stone-700'}`}
              >
                <span className="hidden sm:inline">Contacts</span>
                <span className="sm:hidden">CRM</span>
              </button>
              <span className="border-r border-amber-200 mx-1"></span>
              <button
                onClick={handleLogout}
                className="py-2 sm:py-3 px-1.5 sm:px-4 font-medium text-rose-500 hover:text-rose-700 transition-colors text-xs sm:text-base whitespace-nowrap"
              >
                <span className="hidden sm:inline">Logout</span>
                <span className="sm:hidden">Exit</span>
              </button>
            </div>
            <div className="flex items-center gap-1 sm:gap-2 py-2 flex-shrink-0">
              <CompanyLogo size={28} />
              <span className="font-semibold text-stone-700 hidden lg:inline text-sm">Prestige Global Distributors</span>
            </div>
          </div>
        </div>
      </div>

      {/* Price Calculator Tab */}
      {activeTab === 'calculator' && (
        <div className="max-w-4xl mx-auto p-3 sm:p-6 space-y-4 sm:space-y-6">
          <div className="bg-white/80 rounded-lg shadow-sm border border-amber-100 p-4 sm:p-6">
            <h2 className="text-lg sm:text-xl font-bold mb-1 sm:mb-2 text-stone-800">Sale Price Calculator</h2>
            <p className="text-stone-500 text-xs sm:text-sm mb-4 sm:mb-6">Calculate your sale price based on product cost, quantity, and freight</p>

            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-4 sm:mb-6">
              <div>
                <label className="block text-xs sm:text-sm font-medium text-stone-700 mb-1">Cost Per Case</label>
                <div className="relative">
                  <span className="absolute left-2 sm:left-3 top-1/2 -translate-y-1/2 text-stone-500 text-sm">$</span>
                  <input
                    type="text"
                    inputMode="decimal"
                    value={calculator.costPerCase}
                    onChange={(e) => setCalculator({ ...calculator, costPerCase: e.target.value })}
                    className="w-full border border-amber-200 rounded-lg pl-5 sm:pl-7 pr-2 sm:pr-3 py-2 sm:py-2.5 text-sm focus:ring-2 focus:ring-amber-400 focus:border-amber-400 bg-stone-50/50"
                    placeholder="0.00"
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs sm:text-sm font-medium text-stone-700 mb-1">Quantity (Cases)</label>
                <input
                  type="text"
                  inputMode="numeric"
                  value={calculator.quantity}
                  onChange={(e) => setCalculator({ ...calculator, quantity: e.target.value })}
                  className="w-full border border-amber-200 rounded-lg px-2 sm:px-3 py-2 sm:py-2.5 text-sm focus:ring-2 focus:ring-amber-400 focus:border-amber-400 bg-stone-50/50"
                  placeholder="0"
                />
              </div>
              <div>
                <label className="block text-xs sm:text-sm font-medium text-stone-700 mb-1">Total Freight</label>
                <div className="relative">
                  <span className="absolute left-2 sm:left-3 top-1/2 -translate-y-1/2 text-stone-500 text-sm">$</span>
                  <input
                    type="text"
                    inputMode="decimal"
                    value={calculator.freightTotal}
                    onChange={(e) => setCalculator({ ...calculator, freightTotal: e.target.value })}
                    className="w-full border border-amber-200 rounded-lg pl-5 sm:pl-7 pr-2 sm:pr-3 py-2 sm:py-2.5 text-sm focus:ring-2 focus:ring-amber-400 focus:border-amber-400 bg-stone-50/50"
                    placeholder="0.00"
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs sm:text-sm font-medium text-stone-700 mb-1">Target Margin</label>
                <div className="relative">
                  <input
                    type="text"
                    inputMode="numeric"
                    value={calculator.targetMargin}
                    onChange={(e) => setCalculator({ ...calculator, targetMargin: e.target.value })}
                    className="w-full border border-amber-200 rounded-lg px-2 sm:px-3 pr-7 sm:pr-8 py-2 sm:py-2.5 text-sm focus:ring-2 focus:ring-amber-400 focus:border-amber-400 bg-stone-50/50"
                    placeholder="15"
                  />
                  <span className="absolute right-2 sm:right-3 top-1/2 -translate-y-1/2 text-stone-500 text-sm">%</span>
                </div>
              </div>
            </div>

            <div className="flex gap-2 sm:gap-3 mb-4 sm:mb-6">
              <button
                onClick={calculatePricing}
                className="bg-amber-600 text-white px-4 sm:px-6 py-2.5 sm:py-3 rounded-lg hover:bg-amber-700 transition-colors font-semibold flex items-center gap-2 shadow-sm text-sm sm:text-base"
              >
                <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                </svg>
                <span className="hidden sm:inline">Calculate Pricing</span>
                <span className="sm:hidden">Calculate</span>
              </button>
              {calculatedPricing && (
                <button onClick={clearCalculation} className="bg-stone-200 text-stone-700 px-3 sm:px-4 py-2.5 sm:py-3 rounded-lg hover:bg-stone-300 transition-colors font-medium text-sm sm:text-base">
                  Clear
                </button>
              )}
            </div>

            {calculatedPricing && (
              <div className="space-y-4 sm:space-y-6">
                <div className="bg-stone-100/70 rounded-lg p-3 sm:p-4">
                  <h3 className="font-semibold text-stone-700 mb-2 sm:mb-3 text-sm sm:text-base">Cost Breakdown</h3>
                  <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
                    <div>
                      <p className="text-[10px] sm:text-xs text-stone-500 uppercase">Total Product Cost</p>
                      <p className="text-base sm:text-lg font-semibold text-stone-800">${formatCurrency(calculatedPricing.totalProductCost)}</p>
                    </div>
                    <div>
                      <p className="text-[10px] sm:text-xs text-stone-500 uppercase">Freight Per Case</p>
                      <p className="text-base sm:text-lg font-semibold text-stone-800">${formatCurrency(calculatedPricing.freightPerCase)}</p>
                    </div>
                    <div>
                      <p className="text-[10px] sm:text-xs text-stone-500 uppercase">Landed Cost/Case</p>
                      <p className="text-base sm:text-lg font-semibold text-amber-700">${formatCurrency(calculatedPricing.landedCostPerCase)}</p>
                    </div>
                    <div>
                      <p className="text-[10px] sm:text-xs text-stone-500 uppercase">Total Landed Cost</p>
                      <p className="text-base sm:text-lg font-semibold text-stone-800">${formatCurrency(calculatedPricing.totalLandedCost)}</p>
                    </div>
                  </div>
                </div>

                <div className="bg-amber-100/60 border border-amber-300 rounded-lg p-3 sm:p-4">
                  <h3 className="font-semibold text-amber-900 mb-2 sm:mb-3 text-sm sm:text-base">At {calculatedPricing.targetMargin}% Margin</h3>
                  <div className="grid grid-cols-3 gap-2 sm:gap-4">
                    <div>
                      <p className="text-[10px] sm:text-xs text-amber-700 uppercase">Price/Case</p>
                      <p className="text-lg sm:text-2xl font-bold text-amber-800">${formatCurrency(calculatedPricing.salePriceAtMargin)}</p>
                    </div>
                    <div>
                      <p className="text-[10px] sm:text-xs text-amber-700 uppercase">Revenue</p>
                      <p className="text-lg sm:text-2xl font-bold text-amber-800">${formatCurrency(calculatedPricing.totalRevenueAtMargin)}</p>
                    </div>
                    <div>
                      <p className="text-[10px] sm:text-xs text-amber-700 uppercase">Profit</p>
                      <p className="text-lg sm:text-2xl font-bold text-amber-800">${formatCurrency(calculatedPricing.profitAtMargin)}</p>
                    </div>
                  </div>
                  <button
                    onClick={() => applyPriceToQuote(calculatedPricing.salePriceAtMargin)}
                    className="mt-3 sm:mt-4 w-full sm:w-auto bg-amber-600 text-white px-4 py-2 rounded-lg hover:bg-amber-700 transition-colors text-xs sm:text-sm font-medium"
                  >
                    Apply ${formatCurrency(calculatedPricing.salePriceAtMargin)} to Quote
                  </button>
                </div>

                <div className="bg-white/80 border border-amber-200 rounded-lg overflow-hidden">
                  <h3 className="font-semibold text-stone-700 p-3 sm:p-4 bg-stone-100/70 border-b border-amber-200 text-sm sm:text-base">Margin Comparison</h3>
                  {/* Mobile: Card layout */}
                  <div className="sm:hidden p-2 space-y-2">
                    {calculatedPricing.margins.map((m) => (
                      <div key={m.margin} className={`p-3 rounded-lg ${m.margin === parseFloat(calculatedPricing.targetMargin) ? 'bg-amber-100/60 border border-amber-300' : 'bg-stone-100/50'}`}>
                        <div className="flex justify-between items-center mb-2">
                          <span className="font-bold text-lg text-stone-800">{m.margin}%</span>
                          <button onClick={() => applyPriceToQuote(m.pricePerCase)} className="bg-amber-600 text-white px-3 py-1 rounded text-xs font-medium hover:bg-amber-700">
                            Use
                          </button>
                        </div>
                        <div className="grid grid-cols-3 gap-2 text-xs">
                          <div>
                            <p className="text-stone-500">Price</p>
                            <p className="font-semibold text-stone-800">${formatCurrency(m.pricePerCase)}</p>
                          </div>
                          <div>
                            <p className="text-stone-500">Revenue</p>
                            <p className="font-semibold text-stone-800">${formatCurrency(m.totalRevenue)}</p>
                          </div>
                          <div>
                            <p className="text-stone-500">Profit</p>
                            <p className="font-semibold text-amber-700">${formatCurrency(m.profit)}</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                  {/* Desktop: Table layout */}
                  <div className="hidden sm:block overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead className="bg-stone-100/70">
                        <tr>
                          <th className="text-left py-3 px-4 font-medium text-stone-600">Margin</th>
                          <th className="text-right py-3 px-4 font-medium text-stone-600">Price/Case</th>
                          <th className="text-right py-3 px-4 font-medium text-stone-600">Total Revenue</th>
                          <th className="text-right py-3 px-4 font-medium text-stone-600">Gross Profit</th>
                          <th className="text-center py-3 px-4 font-medium text-stone-600">Action</th>
                        </tr>
                      </thead>
                      <tbody>
                        {calculatedPricing.margins.map((m) => (
                          <tr key={m.margin} className={`border-t border-amber-100 ${m.margin === parseFloat(calculatedPricing.targetMargin) ? 'bg-amber-100/50' : ''}`}>
                            <td className="py-3 px-4 font-medium text-stone-800">{m.margin}%</td>
                            <td className="py-3 px-4 text-right text-stone-800">${formatCurrency(m.pricePerCase)}</td>
                            <td className="py-3 px-4 text-right text-stone-800">${formatCurrency(m.totalRevenue)}</td>
                            <td className="py-3 px-4 text-right text-amber-700 font-medium">${formatCurrency(m.profit)}</td>
                            <td className="py-3 px-4 text-center">
                              <button onClick={() => applyPriceToQuote(m.pricePerCase)} className="text-amber-700 hover:text-amber-900 hover:underline text-xs font-medium">
                                Use Price
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

                <div className="bg-stone-100 border border-stone-300 rounded-lg p-3 sm:p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <p className="text-xs sm:text-sm text-stone-600">Current Quote Price</p>
                    <p className="text-lg sm:text-xl font-bold text-stone-800">${productInfo.price} per case</p>
                  </div>
                  <button onClick={() => setActiveTab('edit')} className="bg-stone-600 text-white px-4 py-2 rounded-lg hover:bg-stone-700 transition-colors text-sm w-full sm:w-auto">
                    Edit Quote
                  </button>
                </div>
              </div>
            )}

            {!calculatedPricing && (
              <div className="text-center py-6 sm:py-8 text-stone-500 bg-stone-100/50 rounded-lg border border-amber-100">
                <svg className="w-10 h-10 sm:w-12 sm:h-12 mx-auto mb-2 sm:mb-3 text-amber-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                </svg>
                <p className="font-medium text-stone-600 text-sm sm:text-base">Enter your values above</p>
                <p className="text-xs sm:text-sm">Then tap <span className="font-semibold text-amber-600">"Calculate"</span> to see results</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Edit Panel */}
      {activeTab === 'edit' && (
        <div className="max-w-4xl mx-auto p-3 sm:p-6 space-y-4 sm:space-y-6">
          {/* Customer & Terms */}
          <div className="bg-white/80 rounded-lg shadow-sm border border-amber-100 p-4 sm:p-6">
            <h2 className="text-base sm:text-lg font-semibold mb-3 sm:mb-4 text-stone-800">Customer & Terms</h2>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
              <div className="sm:col-span-3">
                <label className="block text-xs sm:text-sm font-medium text-stone-600 mb-1">Prepared For (Customer)</label>
                <input type="text" value={customerInfo.preparedFor} onChange={(e) => setCustomerInfo({ ...customerInfo, preparedFor: e.target.value })} className="w-full border border-amber-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-amber-400 focus:border-amber-400 bg-stone-50/50" placeholder="e.g., ABC Grocery, Attn: John Smith" />
              </div>
              <div>
                <label className="block text-xs sm:text-sm font-medium text-stone-600 mb-1">Payment Terms</label>
                <select value={customerInfo.paymentTerms} onChange={(e) => setCustomerInfo({ ...customerInfo, paymentTerms: e.target.value })} className="w-full border border-amber-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-amber-400 focus:border-amber-400 bg-stone-50/50">
                  <option value="Net 30">Net 30</option>
                  <option value="Net 15">Net 15</option>
                  <option value="Net 60">Net 60</option>
                  <option value="COD">COD</option>
                  <option value="Due on Receipt">Due on Receipt</option>
                  <option value="Prepaid">Prepaid</option>
                  <option value="50% Deposit">50% Deposit</option>
                </select>
              </div>
              <div className="sm:col-span-2">
                <label className="block text-xs sm:text-sm font-medium text-stone-600 mb-1">FOB Point</label>
                <input type="text" value={customerInfo.fob} onChange={(e) => setCustomerInfo({ ...customerInfo, fob: e.target.value })} className="w-full border border-amber-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-amber-400 focus:border-amber-400 bg-stone-50/50" placeholder="e.g., Setauket, NY" />
              </div>
            </div>
          </div>

          <div className="bg-white/80 rounded-lg shadow-sm border border-amber-100 p-4 sm:p-6">
            <h2 className="text-base sm:text-lg font-semibold mb-3 sm:mb-4 text-stone-800">Quote Details</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
              <div className="sm:col-span-2">
                <label className="block text-xs sm:text-sm font-medium text-stone-600 mb-1">Quote Title / Product Line</label>
                <input type="text" value={productInfo.title} onChange={(e) => setProductInfo({ ...productInfo, title: e.target.value })} className="w-full border border-amber-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-amber-400 focus:border-amber-400 bg-stone-50/50" placeholder="e.g., Campbell's Chunky Soup" />
              </div>
              <div>
                <label className="block text-xs sm:text-sm font-medium text-stone-600 mb-1">Price (per unit)</label>
                <div className="flex">
                  <span className="inline-flex items-center px-2 sm:px-3 border border-r-0 border-amber-200 rounded-l-lg bg-stone-100 text-stone-500 text-sm">$</span>
                  <input type="text" inputMode="decimal" value={productInfo.price} onChange={(e) => setProductInfo({ ...productInfo, price: e.target.value })} className="w-full border border-amber-200 rounded-r-lg px-3 py-2 text-sm focus:ring-2 focus:ring-amber-400 focus:border-amber-400 bg-stone-50/50" />
                </div>
                <button onClick={() => setActiveTab('calculator')} className="text-xs text-amber-600 hover:underline mt-1">Use price calculator</button>
              </div>
              <div>
                <label className="block text-xs sm:text-sm font-medium text-stone-600 mb-1">Unit Type</label>
                <select value={productInfo.unit} onChange={(e) => setProductInfo({ ...productInfo, unit: e.target.value })} className="w-full border border-amber-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-amber-400 focus:border-amber-400 bg-stone-50/50">
                  <option value="cases">cases</option>
                  <option value="pallets">pallets</option>
                  <option value="units">units</option>
                  <option value="cartons">cartons</option>
                </select>
              </div>
              <div>
                <label className="block text-xs sm:text-sm font-medium text-stone-600 mb-1">Total Available</label>
                <input type="text" inputMode="numeric" value={productInfo.totalAvailable} onChange={(e) => setProductInfo({ ...productInfo, totalAvailable: e.target.value })} className="w-full border border-amber-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-amber-400 focus:border-amber-400 bg-stone-50/50" placeholder="e.g., 2,700" />
              </div>
              <div>
                <label className="block text-xs sm:text-sm font-medium text-stone-600 mb-1">Pallet Configuration</label>
                <input type="text" value={productInfo.palletConfig} onChange={(e) => setProductInfo({ ...productInfo, palletConfig: e.target.value })} className="w-full border border-amber-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-amber-400 focus:border-amber-400 bg-stone-50/50" placeholder="e.g., 150 cases per pallet" />
              </div>
              <div>
                <label className="block text-xs sm:text-sm font-medium text-stone-600 mb-1">Availability Note</label>
                <input type="text" value={productInfo.availability} onChange={(e) => setProductInfo({ ...productInfo, availability: e.target.value })} className="w-full border border-amber-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-amber-400 focus:border-amber-400 bg-stone-50/50" placeholder="e.g., While supplies last" />
              </div>
              <div>
                <label className="block text-xs sm:text-sm font-medium text-stone-600 mb-1">Valid Until</label>
                <input type="date" value={productInfo.validUntil} onChange={(e) => setProductInfo({ ...productInfo, validUntil: e.target.value })} className="w-full border border-amber-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-amber-400 focus:border-amber-400 bg-stone-50/50" />
              </div>
              <div>
                <label className="block text-xs sm:text-sm font-medium text-stone-600 mb-1">Minimum Order</label>
                <input type="text" value={productInfo.minimumOrder} onChange={(e) => setProductInfo({ ...productInfo, minimumOrder: e.target.value })} className="w-full border border-amber-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-amber-400 focus:border-amber-400 bg-stone-50/50" placeholder="e.g., 50 cases" />
              </div>
              <div>
                <label className="block text-xs sm:text-sm font-medium text-stone-600 mb-1">Lead Time</label>
                <input type="text" value={productInfo.leadTime} onChange={(e) => setProductInfo({ ...productInfo, leadTime: e.target.value })} className="w-full border border-amber-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-amber-400 focus:border-amber-400 bg-stone-50/50" placeholder="e.g., Ships within 3-5 business days" />
              </div>
              <div className="sm:col-span-2">
                <label className="block text-xs sm:text-sm font-medium text-stone-600 mb-1">Notes / Special Terms</label>
                <textarea value={productInfo.notes} onChange={(e) => setProductInfo({ ...productInfo, notes: e.target.value })} rows={2} className="w-full border border-amber-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-amber-400 focus:border-amber-400 bg-stone-50/50" placeholder="e.g., Delivery instructions, special terms, conditions..." />
              </div>
            </div>

            {/* Quote Info Badge */}
            <div className="mt-4 pt-4 border-t border-amber-100 flex flex-wrap gap-3 text-xs text-stone-500">
              <span className="bg-stone-100 px-2 py-1 rounded font-mono">{quoteNumber}</span>
              <span>Created: {new Date(quoteDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
            </div>
          </div>

          <div className="bg-white/80 rounded-lg shadow-sm border border-amber-100 p-4 sm:p-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 sm:gap-0 mb-3 sm:mb-4">
              <h2 className="text-base sm:text-lg font-semibold text-stone-800">Products ({products.length})</h2>
              <div className="flex gap-2">
                <button onClick={() => setShowLibrary(true)} className="bg-stone-600 text-white px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg hover:bg-stone-700 transition-colors flex items-center gap-1 sm:gap-2 text-sm">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                  </svg>
                  <span className="hidden sm:inline">From Library</span><span className="sm:hidden">Library</span>
                  {productLibrary.length > 0 && <span className="bg-stone-500 text-white text-xs px-1.5 rounded-full">{productLibrary.length}</span>}
                </button>
                <button onClick={addProduct} className="bg-amber-600 text-white px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg hover:bg-amber-700 transition-colors flex items-center gap-1 sm:gap-2 text-sm">
                  <span className="text-lg">+</span> <span className="hidden sm:inline">Add Product</span><span className="sm:hidden">Add</span>
                </button>
              </div>
            </div>

            <div className="hidden md:grid grid-cols-12 gap-2 mb-2 px-3 text-sm font-medium text-stone-500">
              <div className="col-span-3">UPC</div>
              <div className="col-span-5">Description</div>
              <div className="col-span-2">Size</div>
              <div className="col-span-2">Case Pack</div>
            </div>

            <div className="space-y-2">
              {products.map((product, index) => (
                <div key={index} className="flex gap-2 items-start sm:items-center p-2 sm:p-3 bg-stone-100/60 rounded-lg hover:bg-stone-100 transition-colors">
                  <div className="flex-1 grid grid-cols-2 md:grid-cols-12 gap-2">
                    <input type="text" placeholder="UPC" value={product.upc} onChange={(e) => updateProduct(index, 'upc', e.target.value)} className="border border-amber-200 rounded px-2 py-1.5 text-xs sm:text-sm col-span-1 md:col-span-3 bg-white/80 focus:ring-2 focus:ring-amber-400" />
                    <input type="text" placeholder="Description" value={product.description} onChange={(e) => updateProduct(index, 'description', e.target.value)} className="border border-amber-200 rounded px-2 py-1.5 text-xs sm:text-sm col-span-1 md:col-span-5 bg-white/80 focus:ring-2 focus:ring-amber-400" />
                    <input type="text" placeholder="Size" value={product.size} onChange={(e) => updateProduct(index, 'size', e.target.value)} className="border border-amber-200 rounded px-2 py-1.5 text-xs sm:text-sm col-span-1 md:col-span-2 bg-white/80 focus:ring-2 focus:ring-amber-400" />
                    <input type="text" placeholder="Pack" value={product.casePack} onChange={(e) => updateProduct(index, 'casePack', e.target.value)} className="border border-amber-200 rounded px-2 py-1.5 text-xs sm:text-sm col-span-1 md:col-span-2 bg-white/80 focus:ring-2 focus:ring-amber-400" />
                  </div>
                  <button onClick={() => saveProductToLibrary(product)} className="text-amber-500 hover:text-amber-700 p-1.5 sm:p-2 hover:bg-amber-50 rounded-full transition-colors flex-shrink-0" title="Save to library">
                    <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
                    </svg>
                  </button>
                  <button onClick={() => removeProduct(index)} className="text-rose-400 hover:text-rose-600 p-1.5 sm:p-2 hover:bg-rose-50 rounded-full transition-colors flex-shrink-0" title="Remove product">
                    <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                </div>
              ))}
            </div>

            {products.length === 0 && (
              <div className="text-center py-8 sm:py-12 text-stone-500">
                <p className="mb-2 text-sm">No products added yet.</p>
                <button onClick={addProduct} className="text-amber-600 hover:underline text-sm">+ Add your first product</button>
              </div>
            )}
          </div>

          <div className="flex flex-col sm:flex-row justify-center gap-3">
            <button
              onClick={saveQuote}
              disabled={isSaving || !supabase}
              className="w-full sm:w-auto bg-stone-600 text-white px-6 sm:px-8 py-2.5 sm:py-3 rounded-lg hover:bg-stone-700 transition-colors font-medium shadow-sm text-sm sm:text-base disabled:opacity-50 flex items-center justify-center gap-2"
            >
              <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4" />
              </svg>
              {isSaving ? 'Saving...' : saveStatus === 'saved' ? 'Saved!' : 'Save Quote'}
            </button>
            <button onClick={() => setActiveTab('preview')} className="w-full sm:w-auto bg-amber-600 text-white px-6 sm:px-8 py-2.5 sm:py-3 rounded-lg hover:bg-amber-700 transition-colors font-medium shadow-sm text-sm sm:text-base">
              Preview & Export
            </button>
          </div>
        </div>
      )}

      {/* Preview Panel */}
      {activeTab === 'preview' && (
        <div className="p-3 sm:p-6">
          <div className="max-w-4xl mx-auto mb-4 sm:mb-6">
            <div className="bg-white/80 rounded-lg shadow-sm border border-amber-100 p-3 sm:p-4">
              <h3 className="font-semibold text-stone-700 mb-2 sm:mb-3 text-sm sm:text-base">Export Options</h3>
              <div className="grid grid-cols-3 gap-2 sm:flex sm:flex-wrap sm:gap-3">
                <button onClick={generatePDF} disabled={isGenerating} className="bg-rose-500 text-white px-2 sm:px-5 py-2 sm:py-2.5 rounded-lg hover:bg-rose-600 transition-colors flex items-center justify-center gap-1 sm:gap-2 disabled:opacity-50 text-xs sm:text-base">
                  <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M6 2a2 2 0 00-2 2v12a2 2 0 002 2h8a2 2 0 002-2V7.414A2 2 0 0015.414 6L12 2.586A2 2 0 0010.586 2H6zm5 6a1 1 0 10-2 0v3.586l-1.293-1.293a1 1 0 10-1.414 1.414l3 3a1 1 0 001.414 0l3-3a1 1 0 00-1.414-1.414L11 11.586V8z" clipRule="evenodd" /></svg>
                  <span className="hidden sm:inline">{isGenerating ? 'Generating...' : 'Download PDF'}</span>
                  <span className="sm:hidden">PDF</span>
                </button>
                <button onClick={exportExcel} disabled={isGenerating} className="bg-emerald-600 text-white px-2 sm:px-5 py-2 sm:py-2.5 rounded-lg hover:bg-emerald-700 transition-colors flex items-center justify-center gap-1 sm:gap-2 disabled:opacity-50 text-xs sm:text-base">
                  <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M6 2a2 2 0 00-2 2v12a2 2 0 002 2h8a2 2 0 002-2V7.414A2 2 0 0015.414 6L12 2.586A2 2 0 0010.586 2H6zm5 6a1 1 0 10-2 0v3.586l-1.293-1.293a1 1 0 10-1.414 1.414l3 3a1 1 0 001.414 0l3-3a1 1 0 00-1.414-1.414L11 11.586V8z" clipRule="evenodd" /></svg>
                  <span className="hidden sm:inline">{isGenerating ? 'Generating...' : 'Download Excel'}</span>
                  <span className="sm:hidden">Excel</span>
                </button>
                <button onClick={exportCSV} className="bg-stone-500 text-white px-2 sm:px-5 py-2 sm:py-2.5 rounded-lg hover:bg-stone-600 transition-colors flex items-center justify-center gap-1 sm:gap-2 text-xs sm:text-base">
                  <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M6 2a2 2 0 00-2 2v12a2 2 0 002 2h8a2 2 0 002-2V7.414A2 2 0 0015.414 6L12 2.586A2 2 0 0010.586 2H6zm5 6a1 1 0 10-2 0v3.586l-1.293-1.293a1 1 0 10-1.414 1.414l3 3a1 1 0 001.414 0l3-3a1 1 0 00-1.414-1.414L11 11.586V8z" clipRule="evenodd" /></svg>
                  <span className="hidden sm:inline">Download CSV</span>
                  <span className="sm:hidden">CSV</span>
                </button>
              </div>
            </div>
          </div>

          <div className="max-w-4xl mx-auto mb-4 sm:mb-6">
            <div className="bg-white/80 rounded-lg shadow-sm border border-amber-100 p-3 sm:p-4">
              <h3 className="font-semibold text-stone-700 mb-2 sm:mb-3 text-sm sm:text-base">Share Quote</h3>
              <div className="grid grid-cols-2 gap-2 sm:flex sm:flex-wrap sm:gap-3">
                <button onClick={copyShareLink} className="bg-amber-600 text-white px-2 sm:px-5 py-2 sm:py-2.5 rounded-lg hover:bg-amber-700 transition-colors flex items-center justify-center gap-1 sm:gap-2 text-xs sm:text-base">
                  <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" /></svg>
                  {shareStatus === 'link' ? 'Copied!' : 'Copy Link'}
                </button>
                <button onClick={shareViaEmail} className="bg-stone-600 text-white px-2 sm:px-5 py-2 sm:py-2.5 rounded-lg hover:bg-stone-700 transition-colors flex items-center justify-center gap-1 sm:gap-2 text-xs sm:text-base">
                  <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
                  Email
                </button>
                <button onClick={shareViaWhatsApp} className="bg-emerald-500 text-white px-2 sm:px-5 py-2 sm:py-2.5 rounded-lg hover:bg-emerald-600 transition-colors flex items-center justify-center gap-1 sm:gap-2 text-xs sm:text-base">
                  <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
                  WhatsApp
                </button>
                <button onClick={copyQuoteText} className="bg-stone-400 text-white px-2 sm:px-5 py-2 sm:py-2.5 rounded-lg hover:bg-stone-500 transition-colors flex items-center justify-center gap-1 sm:gap-2 text-xs sm:text-base">
                  <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3" /></svg>
                  {shareStatus === 'text' ? 'Copied!' : 'Copy'}
                </button>
              </div>
              <p className="text-xs sm:text-sm text-stone-500 mt-2 sm:mt-3">Share this quote with customers via link, email, or messaging apps</p>
            </div>
          </div>

          {/* Mobile-friendly Quote Preview */}
          <div className="max-w-4xl mx-auto bg-white shadow-sm rounded-lg overflow-hidden border border-amber-200">
            <div className="p-4 sm:p-8">
              <div className="text-center mb-4 sm:mb-6">
                <div className="flex justify-center mb-2 sm:mb-3"><CompanyLogo size={80} /></div>
                <h1 className="text-lg sm:text-2xl font-bold tracking-wide text-stone-800">PRESTIGE GLOBAL</h1>
                <h1 className="text-lg sm:text-2xl font-bold tracking-wide text-stone-800">DISTRIBUTORS</h1>
              </div>

              <div className="flex flex-col sm:flex-row justify-between mb-4 sm:mb-6 gap-3">
                <div className="text-xs sm:text-sm text-stone-700">
                  <p className="font-semibold">{companyInfo.name}</p>
                  <p>{companyInfo.address1}</p>
                  <p>{companyInfo.address2}</p>
                  <p>Phone: {companyInfo.phone}</p>
                </div>
                <div className="text-xs sm:text-sm text-right bg-amber-50/70 p-2 sm:p-3 rounded-lg border border-amber-200">
                  <p className="font-bold text-amber-800 text-sm sm:text-base">{quoteNumber}</p>
                  <p className="text-stone-600">Date: {new Date(quoteDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</p>
                  <p className="text-stone-600">Valid Until: <span className="font-medium text-amber-700">{new Date(productInfo.validUntil).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span></p>
                </div>
              </div>

              {/* Prepared For */}
              {customerInfo.preparedFor && (
                <div className="mb-4 sm:mb-6 p-3 sm:p-4 bg-stone-100/70 rounded-lg border border-stone-200">
                  <p className="text-xs text-stone-500 uppercase tracking-wide mb-1">Prepared For</p>
                  <p className="text-sm sm:text-base font-semibold text-stone-800">{customerInfo.preparedFor}</p>
                </div>
              )}

              <h2 className="text-lg sm:text-2xl font-bold text-center mb-4 sm:mb-6 text-stone-900">{productInfo.title}</h2>

              <div className="mb-4 sm:mb-6 text-xs sm:text-sm bg-amber-50/70 p-3 sm:p-4 rounded-lg space-y-1 border border-amber-200">
                <p><span className="font-semibold text-stone-700">Price:</span> <span className="text-stone-800">${productInfo.price} per {productInfo.unit.replace(/s$/, '')}</span></p>
                <p><span className="font-semibold text-stone-700">Total Available:</span> <span className="text-stone-800">{productInfo.totalAvailable} {productInfo.unit}</span></p>
                {productInfo.minimumOrder && <p><span className="font-semibold text-stone-700">Minimum Order:</span> <span className="text-stone-800">{productInfo.minimumOrder}</span></p>}
                <p><span className="font-semibold text-stone-700">Pallet Config:</span> <span className="text-stone-800">{productInfo.palletConfig}</span></p>
                {productInfo.leadTime && <p><span className="font-semibold text-stone-700">Lead Time:</span> <span className="text-stone-800">{productInfo.leadTime}</span></p>}
                <p><span className="font-semibold text-stone-700">Payment Terms:</span> <span className="text-stone-800">{customerInfo.paymentTerms}</span></p>
                <p><span className="font-semibold text-stone-700">FOB:</span> <span className="text-stone-800">{customerInfo.fob}</span></p>
                <p><span className="font-semibold text-stone-700">Availability:</span> <span className="text-stone-800">{productInfo.availability}</span></p>
              </div>

              {/* Notes Section */}
              {productInfo.notes && (
                <div className="mb-4 sm:mb-6 text-xs sm:text-sm bg-stone-100/70 p-3 sm:p-4 rounded-lg border border-stone-200">
                  <p className="font-semibold text-stone-700 mb-1">Notes:</p>
                  <p className="text-stone-600 whitespace-pre-wrap">{productInfo.notes}</p>
                </div>
              )}

              {products.length > 0 && (
                <>
                  {/* Mobile: Card layout */}
                  <div className="sm:hidden space-y-3 mb-6">
                    {products.map((product, index) => (
                      <div key={index} className="bg-stone-100/60 rounded-lg p-3 text-xs border border-amber-100">
                        <p className="font-mono text-stone-500 mb-1">{product.upc}</p>
                        <p className="font-semibold text-stone-900">{product.description}</p>
                        <p className="text-stone-600 mt-1">{product.size} • {product.casePack}</p>
                      </div>
                    ))}
                  </div>
                  {/* Desktop: Table layout */}
                  <div className="hidden sm:block overflow-x-auto">
                    <table className="w-full text-sm mb-8">
                      <thead>
                        <tr className="border-b-2 border-amber-300 bg-amber-50/50">
                          <th className="text-left py-3 px-2 font-semibold text-stone-700">UPC</th>
                          <th className="text-left py-3 px-2 font-semibold text-stone-700">Description</th>
                          <th className="text-left py-3 px-2 font-semibold text-stone-700">Can Size</th>
                          <th className="text-left py-3 px-2 font-semibold text-stone-700">Case Pack</th>
                        </tr>
                      </thead>
                      <tbody>
                        {products.map((product, index) => (
                          <tr key={index} className="border-b border-amber-100 hover:bg-amber-50/30">
                            <td className="py-2.5 px-2 font-mono text-xs text-stone-600">{product.upc}</td>
                            <td className="py-2.5 px-2 text-stone-800">{product.description}</td>
                            <td className="py-2.5 px-2 text-stone-700">{product.size}</td>
                            <td className="py-2.5 px-2 text-stone-700">{product.casePack}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </>
              )}

              <div className="mt-6 sm:mt-10 pt-4 sm:pt-6 border-t border-amber-200">
                <p className="text-stone-600 text-sm">Sincerely,</p>
                <p className="mt-4 sm:mt-6 font-semibold text-base sm:text-lg text-stone-800">{companyInfo.signerName}</p>
                <p className="text-stone-600 text-sm">{companyInfo.signerTitle}</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* History Panel */}
      {activeTab === 'history' && (
        <div className="max-w-4xl mx-auto p-3 sm:p-6 space-y-4 sm:space-y-6">
          <div className="bg-white/80 rounded-lg shadow-sm border border-amber-100 p-4 sm:p-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4 sm:mb-6">
              <div>
                <h2 className="text-lg sm:text-xl font-bold text-stone-800">Saved Quotes</h2>
                <p className="text-stone-500 text-xs sm:text-sm">Your quote history from Supabase</p>
              </div>
              <button
                onClick={saveQuote}
                disabled={isSaving || !supabase}
                className="bg-amber-600 text-white px-4 sm:px-5 py-2 sm:py-2.5 rounded-lg hover:bg-amber-700 transition-colors flex items-center justify-center gap-2 disabled:opacity-50 text-sm sm:text-base"
              >
                <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                {isSaving ? 'Saving...' : 'Save Current Quote'}
              </button>
            </div>

            {!supabase && (
              <div className="bg-amber-50 border border-amber-300 rounded-lg p-4 sm:p-6 text-center">
                <svg className="w-10 h-10 sm:w-12 sm:h-12 mx-auto mb-3 text-amber-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
                <h3 className="font-semibold text-amber-800 mb-2">Supabase Not Configured</h3>
                <p className="text-amber-700 text-sm mb-3">To enable quote history, add your Supabase credentials:</p>
                <div className="bg-white/80 rounded p-3 text-left text-xs font-mono text-stone-600 mb-3">
                  <p>VITE_SUPABASE_URL=https://your-project.supabase.co</p>
                  <p>VITE_SUPABASE_ANON_KEY=your-anon-key</p>
                </div>
                <p className="text-amber-600 text-xs">Add these to your .env.local file or Netlify environment variables.</p>
              </div>
            )}

            {supabase && isLoadingQuotes && (
              <div className="text-center py-8 sm:py-12">
                <div className="animate-spin w-8 h-8 border-3 border-amber-600 border-t-transparent rounded-full mx-auto mb-3"></div>
                <p className="text-stone-500">Loading quotes...</p>
              </div>
            )}

            {supabase && !isLoadingQuotes && savedQuotes.length === 0 && (
              <div className="text-center py-8 sm:py-12 text-stone-500">
                <svg className="w-12 h-12 mx-auto mb-3 text-amber-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                <p className="font-medium text-stone-600">No saved quotes yet</p>
                <p className="text-sm">Create a quote and click "Save Current Quote" to get started.</p>
              </div>
            )}

            {supabase && !isLoadingQuotes && savedQuotes.length > 0 && (
              <div className="space-y-3">
                {savedQuotes.map((quote) => (
                  <div key={quote.id} className="bg-stone-100/60 rounded-lg p-3 sm:p-4 hover:bg-stone-100 transition-colors border border-amber-100">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-stone-800 truncate">{quote.title}</h3>
                        <p className="text-xs sm:text-sm text-stone-500">
                          {formatDate(quote.created_at)} • {quote.products?.length || 0} products
                        </p>
                        <p className="text-xs text-amber-700 mt-1">
                          ${quote.product_info?.price} per {quote.product_info?.unit?.replace(/s$/, '') || 'unit'}
                        </p>
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={() => loadSavedQuote(quote)}
                          className="flex-1 sm:flex-none bg-amber-600 text-white px-3 sm:px-4 py-2 rounded-lg hover:bg-amber-700 transition-colors text-xs sm:text-sm font-medium"
                        >
                          Load
                        </button>
                        <button
                          onClick={() => deleteQuote(quote.id)}
                          className="flex-1 sm:flex-none bg-rose-100 text-rose-600 px-3 sm:px-4 py-2 rounded-lg hover:bg-rose-200 transition-colors text-xs sm:text-sm font-medium"
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {supabase && !isLoadingQuotes && savedQuotes.length > 0 && (
              <div className="mt-4 pt-4 border-t border-amber-200 text-center">
                <button
                  onClick={loadQuotes}
                  className="text-amber-600 hover:text-amber-700 text-sm font-medium"
                >
                  Refresh List
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Contacts Directory */}
      {activeTab === 'contacts' && (
        <div className="max-w-4xl mx-auto p-3 sm:p-6 space-y-4 sm:space-y-6">
          <div className="bg-white/80 rounded-lg shadow-sm border border-amber-100 p-4 sm:p-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4 sm:mb-6">
              <div>
                <h2 className="text-lg sm:text-xl font-bold text-stone-800">Contact Directory</h2>
                <p className="text-stone-500 text-xs sm:text-sm">Sources & customers for quick access</p>
              </div>
              <button
                onClick={() => { resetContactForm(); setEditingContact(null); setShowContactForm(true); }}
                className="bg-amber-600 text-white px-4 sm:px-5 py-2 sm:py-2.5 rounded-lg hover:bg-amber-700 transition-colors flex items-center justify-center gap-2 text-sm sm:text-base"
              >
                <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                Add Contact
              </button>
            </div>

            {/* Search and Filter */}
            <div className="flex flex-col sm:flex-row gap-3 mb-4">
              <div className="flex-1">
                <input
                  type="text"
                  placeholder="Search contacts..."
                  value={contactSearch}
                  onChange={(e) => setContactSearch(e.target.value)}
                  className="w-full border border-amber-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-amber-400 focus:border-amber-400 bg-stone-50/50"
                />
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => setContactFilter('all')}
                  className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${contactFilter === 'all' ? 'bg-amber-600 text-white' : 'bg-stone-100 text-stone-600 hover:bg-stone-200'}`}
                >
                  All
                </button>
                <button
                  onClick={() => setContactFilter('source')}
                  className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${contactFilter === 'source' ? 'bg-emerald-600 text-white' : 'bg-stone-100 text-stone-600 hover:bg-stone-200'}`}
                >
                  Sources
                </button>
                <button
                  onClick={() => setContactFilter('customer')}
                  className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${contactFilter === 'customer' ? 'bg-blue-600 text-white' : 'bg-stone-100 text-stone-600 hover:bg-stone-200'}`}
                >
                  Customers
                </button>
              </div>
            </div>

            {/* Contacts List */}
            {filteredContacts.length === 0 ? (
              <div className="text-center py-8 sm:py-12 text-stone-500">
                <svg className="w-12 h-12 mx-auto mb-3 text-amber-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
                <p className="font-medium text-stone-600">No contacts yet</p>
                <p className="text-sm">Add sources (suppliers) and customers to build your directory.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {filteredContacts.map((contact) => (
                  <div key={contact.id} className={`rounded-lg p-3 sm:p-4 transition-colors border ${contact.type === 'source' ? 'bg-emerald-50/60 border-emerald-200 hover:bg-emerald-50' : 'bg-blue-50/60 border-blue-200 hover:bg-blue-50'}`}>
                    <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="font-semibold text-stone-800 truncate">{contact.company}</h3>
                          <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${contact.type === 'source' ? 'bg-emerald-200 text-emerald-800' : 'bg-blue-200 text-blue-800'}`}>
                            {contact.type === 'source' ? 'Source' : 'Customer'}
                          </span>
                        </div>
                        {contact.contact_name && <p className="text-sm text-stone-600">{contact.contact_name}</p>}
                        <p className="text-xs text-stone-500 capitalize mt-1">
                          {contact.category?.replace(/_/g, ' ').replace('other source', 'Other').replace('other customer', 'Other')}
                        </p>
                        {contact.notes && <p className="text-xs text-stone-400 mt-1 italic">{contact.notes}</p>}
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {contact.phone && (
                          <a
                            href={`tel:${contact.phone}`}
                            className="flex items-center gap-1.5 px-3 py-1.5 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-xs sm:text-sm font-medium"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                            </svg>
                            Call
                          </a>
                        )}
                        {contact.email && (
                          <a
                            href={`mailto:${contact.email}`}
                            className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-xs sm:text-sm font-medium"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                            </svg>
                            Email
                          </a>
                        )}
                        <button
                          onClick={() => startEditContact(contact)}
                          className="flex items-center gap-1.5 px-3 py-1.5 bg-amber-100 text-amber-700 rounded-lg hover:bg-amber-200 transition-colors text-xs sm:text-sm font-medium"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => deleteContact(contact.id)}
                          className="flex items-center gap-1.5 px-3 py-1.5 bg-rose-100 text-rose-600 rounded-lg hover:bg-rose-200 transition-colors text-xs sm:text-sm font-medium"
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {contacts.length > 0 && (
              <div className="mt-4 pt-4 border-t border-amber-200 flex justify-between items-center text-sm text-stone-500">
                <span>{contacts.filter(c => c.type === 'source').length} sources • {contacts.filter(c => c.type === 'customer').length} customers</span>
                <button onClick={loadContacts} className="text-amber-600 hover:text-amber-700 font-medium">Refresh</button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Contact Form Modal */}
      {showContactForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-lg w-full max-h-[90vh] overflow-y-auto">
            <div className="p-4 border-b border-amber-200 flex justify-between items-center sticky top-0 bg-white">
              <h3 className="text-lg font-bold text-stone-800">{editingContact ? 'Edit Contact' : 'Add New Contact'}</h3>
              <button onClick={() => { setShowContactForm(false); setEditingContact(null); resetContactForm(); }} className="text-stone-400 hover:text-stone-600 p-2">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="p-4 space-y-4">
              {/* Type Selection */}
              <div>
                <label className="block text-sm font-medium text-stone-700 mb-2">Contact Type *</label>
                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={() => setContactForm({ ...contactForm, type: 'source', category: '' })}
                    className={`flex-1 py-3 rounded-lg font-medium transition-colors ${contactForm.type === 'source' ? 'bg-emerald-600 text-white' : 'bg-stone-100 text-stone-600 hover:bg-stone-200'}`}
                  >
                    Source (Supplier)
                  </button>
                  <button
                    type="button"
                    onClick={() => setContactForm({ ...contactForm, type: 'customer', category: '' })}
                    className={`flex-1 py-3 rounded-lg font-medium transition-colors ${contactForm.type === 'customer' ? 'bg-blue-600 text-white' : 'bg-stone-100 text-stone-600 hover:bg-stone-200'}`}
                  >
                    Customer (Buyer)
                  </button>
                </div>
              </div>

              {/* Category */}
              <div>
                <label className="block text-sm font-medium text-stone-700 mb-1">Category *</label>
                <select
                  value={contactForm.category}
                  onChange={(e) => setContactForm({ ...contactForm, category: e.target.value })}
                  className="w-full border border-amber-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-amber-400 focus:border-amber-400"
                >
                  <option value="">Select category...</option>
                  {(contactForm.type === 'source' ? sourceCategories : customerCategories).map(cat => (
                    <option key={cat.value} value={cat.value}>{cat.label}</option>
                  ))}
                </select>
              </div>

              {/* Company */}
              <div>
                <label className="block text-sm font-medium text-stone-700 mb-1">Company Name *</label>
                <input
                  type="text"
                  value={contactForm.company}
                  onChange={(e) => setContactForm({ ...contactForm, company: e.target.value })}
                  className="w-full border border-amber-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-amber-400 focus:border-amber-400"
                  placeholder="e.g. Lewisco Holdings"
                />
              </div>

              {/* Contact Name */}
              <div>
                <label className="block text-sm font-medium text-stone-700 mb-1">Contact Name</label>
                <input
                  type="text"
                  value={contactForm.contactName}
                  onChange={(e) => setContactForm({ ...contactForm, contactName: e.target.value })}
                  className="w-full border border-amber-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-amber-400 focus:border-amber-400"
                  placeholder="e.g. John Smith"
                />
              </div>

              {/* Phone */}
              <div>
                <label className="block text-sm font-medium text-stone-700 mb-1">Phone</label>
                <input
                  type="tel"
                  value={contactForm.phone}
                  onChange={(e) => setContactForm({ ...contactForm, phone: e.target.value })}
                  className="w-full border border-amber-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-amber-400 focus:border-amber-400"
                  placeholder="e.g. (917) 210-9395"
                />
              </div>

              {/* Email */}
              <div>
                <label className="block text-sm font-medium text-stone-700 mb-1">Email</label>
                <input
                  type="email"
                  value={contactForm.email}
                  onChange={(e) => setContactForm({ ...contactForm, email: e.target.value })}
                  className="w-full border border-amber-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-amber-400 focus:border-amber-400"
                  placeholder="e.g. contact@company.com"
                />
              </div>

              {/* Notes */}
              <div>
                <label className="block text-sm font-medium text-stone-700 mb-1">Notes</label>
                <textarea
                  value={contactForm.notes}
                  onChange={(e) => setContactForm({ ...contactForm, notes: e.target.value })}
                  rows={2}
                  className="w-full border border-amber-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-amber-400 focus:border-amber-400"
                  placeholder="e.g. Best for canned goods, Florida-based"
                />
              </div>

              {/* Actions */}
              <div className="flex gap-3 pt-2">
                <button
                  onClick={() => { setShowContactForm(false); setEditingContact(null); resetContactForm(); }}
                  className="flex-1 px-4 py-2.5 border border-stone-300 rounded-lg hover:bg-stone-50 transition-colors font-medium text-stone-600"
                >
                  Cancel
                </button>
                <button
                  onClick={() => saveContact({
                    company: contactForm.company,
                    contact_name: contactForm.contactName,
                    phone: contactForm.phone,
                    email: contactForm.email,
                    type: contactForm.type,
                    category: contactForm.category,
                    notes: contactForm.notes
                  })}
                  disabled={!contactForm.company || !contactForm.category}
                  className="flex-1 px-4 py-2.5 bg-amber-600 text-white rounded-lg hover:bg-amber-700 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {editingContact ? 'Save Changes' : 'Add Contact'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Product Library Modal */}
      {showLibrary && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full max-h-[80vh] flex flex-col">
            <div className="p-4 border-b border-amber-200 flex justify-between items-center">
              <div>
                <h3 className="text-lg font-bold text-stone-800">Product Library</h3>
                <p className="text-xs text-stone-500">{productLibrary.length} saved products</p>
              </div>
              <button onClick={() => { setShowLibrary(false); setLibrarySearch(''); }} className="text-stone-400 hover:text-stone-600 p-2">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="p-4 border-b border-amber-100">
              <input
                type="text"
                placeholder="Search by UPC or description..."
                value={librarySearch}
                onChange={(e) => setLibrarySearch(e.target.value)}
                className="w-full border border-amber-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-amber-400 focus:border-amber-400"
              />
            </div>

            <div className="flex-1 overflow-y-auto p-4">
              {productLibrary.length === 0 ? (
                <div className="text-center py-12 text-stone-500">
                  <svg className="w-12 h-12 mx-auto mb-3 text-amber-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                  </svg>
                  <p className="font-medium text-stone-600">Your library is empty</p>
                  <p className="text-sm">Click the bookmark icon next to any product to save it here.</p>
                </div>
              ) : getFilteredLibrary().length === 0 ? (
                <div className="text-center py-8 text-stone-500">
                  <p className="font-medium">No products match your search</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {getFilteredLibrary().map((product) => (
                    <div key={product.id} className="flex items-center gap-3 p-3 bg-stone-100/60 rounded-lg hover:bg-stone-100 transition-colors">
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-stone-800 truncate">{product.description}</p>
                        <p className="text-xs text-stone-500">{product.upc} • {product.size} • {product.casePack}</p>
                      </div>
                      <button
                        onClick={() => addFromLibrary(product)}
                        className="bg-amber-600 text-white px-3 py-1.5 rounded-lg hover:bg-amber-700 transition-colors text-sm font-medium flex-shrink-0"
                      >
                        Add
                      </button>
                      <button
                        onClick={() => removeFromLibrary(product.id)}
                        className="text-rose-400 hover:text-rose-600 p-1.5 hover:bg-rose-50 rounded-full transition-colors flex-shrink-0"
                        title="Remove from library"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {productLibrary.length > 0 && (
              <div className="p-4 border-t border-amber-200 flex flex-col sm:flex-row gap-2 justify-end">
                <button
                  onClick={addAllFromLibrary}
                  disabled={getFilteredLibrary().length === 0}
                  className="bg-stone-600 text-white px-4 py-2 rounded-lg hover:bg-stone-700 transition-colors text-sm font-medium disabled:opacity-50"
                >
                  Add All {librarySearch ? 'Filtered' : ''} ({getFilteredLibrary().length})
                </button>
                <button
                  onClick={() => { setShowLibrary(false); setLibrarySearch(''); }}
                  className="bg-amber-600 text-white px-4 py-2 rounded-lg hover:bg-amber-700 transition-colors text-sm font-medium"
                >
                  Done
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* PIN Authentication Modal */}
      {showPinModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-sm w-full p-6">
            <div className="text-center mb-6">
              <div className="flex justify-center mb-3"><CompanyLogo size={50} /></div>
              <h3 className="text-lg font-bold text-slate-800">PGD Staff Access</h3>
              <p className="text-sm text-slate-500 mt-1">Enter PIN to access internal tools</p>
            </div>

            <div className="space-y-4">
              <div>
                <input
                  type="password"
                  value={pinInput}
                  onChange={(e) => { setPinInput(e.target.value); setPinError(''); }}
                  onKeyDown={(e) => e.key === 'Enter' && handlePinSubmit()}
                  className="w-full border rounded-lg px-4 py-3 text-center text-2xl tracking-widest focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
                  placeholder="••••"
                  maxLength={4}
                  autoFocus
                />
                {pinError && <p className="text-red-500 text-sm text-center mt-2">{pinError}</p>}
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => { setShowPinModal(false); setPinInput(''); setPinError(''); }}
                  className="flex-1 px-4 py-2.5 border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors font-medium"
                >
                  Cancel
                </button>
                <button
                  onClick={handlePinSubmit}
                  className="flex-1 px-4 py-2.5 bg-amber-600 text-white rounded-lg hover:bg-amber-700 transition-colors font-medium"
                >
                  Enter
                </button>
              </div>
            </div>

            <p className="text-xs text-slate-400 text-center mt-4">
              Vendors: Use the Source Offer form to submit products
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
