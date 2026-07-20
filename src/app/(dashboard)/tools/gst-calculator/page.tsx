"use client";

import { useState, useEffect } from "react";
import {
  Calculator, IndianRupee, Package, Globe, AlertTriangle, CheckCircle,
  Info, Download, Plus, Trash2, Printer, FileText, User, MapPin,
  Building2, Landmark, Check, HelpCircle, ArrowRight, Edit3, Settings, Columns, Sparkles
} from "lucide-react";

// ─── GST rate database (India) ───────────────────────────────────────────────
const GST_RATES: Record<string, { rate: number; hsn: string; category: string }> = {
  "Books & Printed Material":         { rate: 0,  hsn: "4901",  category: "Exempt" },
  "Fresh Vegetables":                 { rate: 0,  hsn: "0702",  category: "Exempt" },
  "Milk & Dairy":                     { rate: 0,  hsn: "0401",  category: "Exempt" },
  "Sugar & Jaggery":                  { rate: 5,  hsn: "1701",  category: "Food" },
  "Packaged Food & Snacks":           { rate: 5,  hsn: "2106",  category: "Food" },
  "Tea, Coffee & Spices":             { rate: 5,  hsn: "0902",  category: "Food" },
  "Footwear (under ₹1000)":           { rate: 5,  hsn: "6403",  category: "Apparel" },
  "Medicines & Pharma":               { rate: 5,  hsn: "3004",  category: "Health" },
  "Medical Devices (basic)":          { rate: 5,  hsn: "9018",  category: "Health" },
  "Clothing & Apparel (under ₹1000)": { rate: 5,  hsn: "6109",  category: "Apparel" },
  "Handloom & Khadi":                 { rate: 5,  hsn: "6301",  category: "Apparel" },
  "Solar Energy Equipment":           { rate: 5,  hsn: "8541",  category: "Electronics" },
  "Agri Tools & Equipment":           { rate: 5,  hsn: "8432",  category: "Tools" },
  "Ayurvedic Products":               { rate: 12, hsn: "3003",  category: "Health" },
  "Clothing & Apparel (over ₹1000)":  { rate: 12, hsn: "6109",  category: "Apparel" },
  "Footwear (over ₹1000)":            { rate: 12, hsn: "6403",  category: "Apparel" },
  "Mobile Phones":                    { rate: 12, hsn: "8517",  category: "Electronics" },
  "Computers & Laptops":              { rate: 12, hsn: "8471",  category: "Electronics" },
  "Processed Foods":                  { rate: 12, hsn: "2001",  category: "Food" },
  "Non-AC Hotels":                    { rate: 12, hsn: "9963",  category: "Services" },
  "Furniture":                        { rate: 18, hsn: "9403",  category: "Home" },
  "Kitchen Appliances":               { rate: 18, hsn: "8516",  category: "Home" },
  "Sports Equipment":                 { rate: 18, hsn: "9506",  category: "Sports" },
  "Stationery & Office":              { rate: 18, hsn: "4820",  category: "Office" },
  "Soaps & Detergents":               { rate: 18, hsn: "3401",  category: "Personal Care" },
  "Beauty & Personal Care":           { rate: 18, hsn: "3304",  category: "Personal Care" },
  "Electronics Accessories":          { rate: 18, hsn: "8544",  category: "Electronics" },
  "Toys & Games":                     { rate: 18, hsn: "9503",  category: "Toys" },
  "Cameras & Optical":                { rate: 18, hsn: "9006",  category: "Electronics" },
  "Power Tools":                      { rate: 18, hsn: "8467",  category: "Tools" },
  "Automobiles & Parts":              { rate: 28, hsn: "8703",  category: "Auto" },
  "Luxury Watches":                   { rate: 28, hsn: "9101",  category: "Luxury" },
  "Air Conditioners":                 { rate: 28, hsn: "8415",  category: "Electronics" },
  "Tobacco Products":                 { rate: 28, hsn: "2402",  category: "Tobacco" },
  "Aerated Drinks":                   { rate: 28, hsn: "2202",  category: "Food" },
  "Cement":                           { rate: 28, hsn: "2523",  category: "Construction" },
};

const BCD_RATES: Record<string, { china: number; usa: number; eu: number; asean: number }> = {
  "Electronics":     { china: 20, usa: 10, eu: 7.5, asean: 0 },
  "Clothing":        { china: 20, usa: 20, eu: 12,  asean: 5 },
  "Toys":            { china: 20, usa: 10, eu: 10,  asean: 0 },
  "Footwear":        { china: 25, usa: 20, eu: 10,  asean: 5 },
  "Furniture":       { china: 25, usa: 25, eu: 20,  asean: 0 },
  "Sporting Goods":  { china: 10, usa: 10, eu: 10,  asean: 0 },
  "Food Products":   { china: 30, usa: 30, eu: 25,  asean: 0 },
  "Auto Parts":      { china: 15, usa: 15, eu: 7.5, asean: 0 },
  "General":         { china: 10, usa: 7.5, eu: 7.5, asean: 0 },
};

const INDIAN_STATES = [
  { name: "Gujarat", code: "24" },
  { name: "Delhi", code: "07" },
  { name: "Maharashtra", code: "27" },
  { name: "Karnataka", code: "29" },
  { name: "Tamil Nadu", code: "33" },
  { name: "Uttar Pradesh", code: "09" },
  { name: "West Bengal", code: "19" },
  { name: "Telangana", code: "36" },
  { name: "Andhra Pradesh", code: "37" },
  { name: "Bihar", code: "10" },
  { name: "Haryana", code: "06" },
  { name: "Kerala", code: "32" },
  { name: "Madhya Pradesh", code: "23" },
  { name: "Rajasthan", code: "08" },
  { name: "Punjab", code: "03" },
  { name: "Goa", code: "30" },
  { name: "Jharkhand", code: "20" },
  { name: "Chhattisgarh", code: "22" },
  { name: "Uttarakhand", code: "05" },
  { name: "Assam", code: "18" },
  { name: "Odisha", code: "21" },
  { name: "Himachal Pradesh", code: "02" },
  { name: "Jammu & Kashmir", code: "01" },
];

interface CalcInputs {
  productCategory: string;
  sellingPrice: number;
  cogs: number;
  fobValue: number;
  freightCIF: number;
  originCountry: "china" | "usa" | "eu" | "asean" | "domestic";
  isDomestic: boolean;
  supplierGSTIN: boolean;
  referralFeeRate: number;
  adSpend: number;
  fbaFee: number;
}

interface CalcResult {
  gstRate: number;
  gstOutput: number;
  gstInput: number;
  netGSTPay: number;
  bcdRate: number;
  bcdAmount: number;
  igstOnImport: number;
  landedCost: number;
  referralFee: number;
  effectiveMargin: number;
  netProfit: number;
  unitEconomics: {
    revenue: number;
    gstCollected: number;
    cogs: number;
    landedCost: number;
    fbaFee: number;
    referralFee: number;
    adSpend: number;
    gstPayable: number;
    netProfit: number;
  };
}

function calculate(inp: CalcInputs): CalcResult {
  const gstInfo = GST_RATES[inp.productCategory];
  const gstRate = gstInfo?.rate || 18;
  const gstOutput = inp.sellingPrice * (gstRate / (100 + gstRate));
  const gstInput = inp.supplierGSTIN ? inp.cogs * (gstRate / 100) * 0.9 : 0;
  const netGSTPay = Math.max(0, gstOutput - gstInput);

  let bcdRate = 0, bcdAmount = 0, igstOnImport = 0, landedCost = inp.cogs;
  if (!inp.isDomestic && inp.fobValue > 0) {
    const cifValue = inp.fobValue + inp.freightCIF;
    const categoryForBCD = Object.keys(BCD_RATES).find(k => inp.productCategory.toLowerCase().includes(k.toLowerCase())) || "General";
    const bcdRates = BCD_RATES[categoryForBCD] || BCD_RATES["General"];
    bcdRate = bcdRates[inp.originCountry as keyof typeof bcdRates] || 10;
    bcdAmount = cifValue * (bcdRate / 100);
    const socialWelfareCharge = bcdAmount * 0.10;
    const igstBase = cifValue + bcdAmount + socialWelfareCharge;
    igstOnImport = igstBase * (gstRate / 100);
    landedCost = cifValue + bcdAmount + socialWelfareCharge + igstOnImport;
  }

  const referralFee = inp.sellingPrice * (inp.referralFeeRate / 100);
  const totalCost = landedCost + inp.fbaFee + referralFee + inp.adSpend + netGSTPay;
  const netProfit = inp.sellingPrice - totalCost;
  const effectiveMargin = (netProfit / inp.sellingPrice) * 100;

  return {
    gstRate, gstOutput, gstInput, netGSTPay, bcdRate, bcdAmount,
    igstOnImport, landedCost, referralFee, effectiveMargin, netProfit,
    unitEconomics: {
      revenue: inp.sellingPrice,
      gstCollected: gstOutput,
      cogs: inp.cogs,
      landedCost,
      fbaFee: inp.fbaFee,
      referralFee,
      adSpend: inp.adSpend,
      gstPayable: netGSTPay,
      netProfit,
    },
  };
}

const fmt = (n: number) => `₹${n.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

function numberToIndianWords(num: number): string {
  if (num === 0) return "Zero Rupees Only";
  const single = ["", "One", "Two", "Three", "Four", "Five", "Six", "Seven", "Eight", "Nine", "Ten", "Eleven", "Twelve", "Thirteen", "Fourteen", "Fifteen", "Sixteen", "Seventeen", "Eighteen", "Nineteen"];
  const double = ["", "", "Twenty", "Thirty", "Forty", "Fifty", "Sixty", "Seventy", "Eighty", "Ninety"];
  
  function convertLessThanThousand(n: number): string {
    let str = "";
    if (n >= 100) {
      str += single[Math.floor(n / 100)] + " Hundred ";
      n %= 100;
    }
    if (n >= 20) {
      str += double[Math.floor(n / 10)] + " ";
      n %= 10;
    }
    if (n > 0) {
      str += single[n] + " ";
    }
    return str.trim();
  }
  
  let rupees = Math.floor(num);
  let paise = Math.round((num - rupees) * 100);
  let word = "";
  
  if (rupees >= 10000000) {
    word += convertLessThanThousand(Math.floor(rupees / 10000000)) + " Crore ";
    rupees %= 10000000;
  }
  if (rupees >= 100000) {
    word += convertLessThanThousand(Math.floor(rupees / 100000)) + " Lakh ";
    rupees %= 100000;
  }
  if (rupees >= 1000) {
    word += convertLessThanThousand(Math.floor(rupees / 1000)) + " Thousand ";
    rupees %= 1000;
  }
  if (rupees > 0) {
    word += convertLessThanThousand(rupees) + " ";
  }
  
  word = word.trim() + " Rupees";
  if (paise > 0) {
    word += " and " + convertLessThanThousand(paise) + " Paise";
  }
  return word + " Only";
}

interface InvoiceItem {
  id: string;
  description: string;
  hsn: string;
  qty: number;
  rateExcludingTax: number;
  discountPercent: number;
  gstPercent: number;
}

interface InvoiceData {
  id: string;
  createdAt: string;
  sellerName: string;
  sellerGSTIN: string;
  sellerAddress: string;
  sellerState: string;
  buyerName: string;
  buyerGSTIN: string;
  buyerAddress: string;
  buyerState: string;
  placeOfSupply: string;
  invoiceNo: string;
  invoiceDate: string;
  dueDate: string;
  items: InvoiceItem[];
  bankName: string;
  bankHolder: string;
  bankAccNo: string;
  bankIFSC: string;
  upiId: string;
  terms: string[];
  notes: string;
  themeColor: string;
  showHsn: boolean;
  showDiscount: boolean;
  showGst: boolean;
}

export default function GSTCalculatorPage() {
  const [activeTab, setActiveTab] = useState<"invoice" | "calculator" | "history">("invoice");
  const [history, setHistory] = useState<InvoiceData[]>([]);

  // ─── Calculator State ──────────────────────────────────────────────────────
  const [inputs, setInputs] = useState<CalcInputs>({
    productCategory: "Beauty & Personal Care",
    sellingPrice: 999,
    cogs: 280,
    fobValue: 0,
    freightCIF: 0,
    originCountry: "domestic",
    isDomestic: true,
    supplierGSTIN: true,
    referralFeeRate: 10,
    adSpend: 80,
    fbaFee: 85,
  });

  // ─── Invoice Builder State (Refrens Styled) ──────────────────────────────────
  const [currentInvoiceId, setCurrentInvoiceId] = useState<string>("");
  const [sellerName, setSellerName] = useState("Tapasya International");
  const [sellerGSTIN, setSellerGSTIN] = useState("24AJHPC5439P1ZX");
  const [sellerAddress, setSellerAddress] = useState("Plot No 92-94, Arihant Industrial Estate, Surat, Gujarat - 394110");
  const [sellerState, setSellerState] = useState("Gujarat");
  
  const [buyerName, setBuyerName] = useState("Cherish Dental Solution");
  const [buyerGSTIN, setBuyerGSTIN] = useState("24AJHPC5439P1ZX");
  const [buyerAddress, setBuyerAddress] = useState("B-301, Rajyash Reeva, Near Vasna Pumping Station, Ahmedabad, Gujarat");
  const [buyerState, setBuyerState] = useState("Gujarat");
  const [placeOfSupply, setPlaceOfSupply] = useState("Gujarat");

  const [invoiceNo, setInvoiceNo] = useState("TI/DS/005/22-23");
  const [invoiceDate, setInvoiceDate] = useState("2026-07-20");
  const [dueDate, setDueDate] = useState("2026-08-04");
  
  const [bankName, setBankName] = useState("HDFC Bank Ltd");
  const [bankHolder, setBankHolder] = useState("Tapasya International");
  const [bankAccNo, setBankAccNo] = useState("50200088734291");
  const [bankIFSC, setBankIFSC] = useState("HDFC0001815");
  const [upiId, setUpiId] = useState("tapasya@okhdfcbank");

  const [notes, setNotes] = useState("Thank you for your business!");
  const [terms, setTerms] = useState<string[]>([
    "Please pay within 15 days of invoice date.",
    "Goods once sold will not be taken back."
  ]);

  const [items, setItems] = useState<InvoiceItem[]>([
    {
      id: "1",
      description: "Runyes Sea 23L Autoclave Sterilizer Class B",
      hsn: "90184900",
      qty: 1,
      rateExcludingTax: 85000,
      discountPercent: 5,
      gstPercent: 18
    }
  ]);

  // Refrens customization toggles
  const [themeColor, setThemeColor] = useState("#1A56DB");
  const [showHsn, setShowHsn] = useState(true);
  const [showDiscount, setShowDiscount] = useState(true);
  const [showGst, setShowGst] = useState(true);

  // Load history from localStorage
  useEffect(() => {
    try {
      const stored = localStorage.getItem("retailstacker_invoice_history");
      if (stored) {
        setHistory(JSON.parse(stored));
      }
    } catch (e) {
      console.error("Failed loading invoice history", e);
    }
  }, []);

  const saveToHistory = (customId?: string) => {
    const idToUse = customId || currentInvoiceId || `INV-${Date.now()}`;
    const newInvoice: InvoiceData = {
      id: idToUse,
      createdAt: new Date().toLocaleDateString("en-IN"),
      sellerName,
      sellerGSTIN,
      sellerAddress,
      sellerState,
      buyerName,
      buyerGSTIN,
      buyerAddress,
      buyerState,
      placeOfSupply,
      invoiceNo,
      invoiceDate,
      dueDate,
      items,
      bankName,
      bankHolder,
      bankAccNo,
      bankIFSC,
      upiId,
      terms,
      notes,
      themeColor,
      showHsn,
      showDiscount,
      showGst
    };

    let updatedHistory = [...history];
    const existingIndex = history.findIndex(item => item.id === idToUse);
    
    if (existingIndex > -1) {
      updatedHistory[existingIndex] = newInvoice;
    } else {
      updatedHistory = [newInvoice, ...updatedHistory];
    }

    setHistory(updatedHistory);
    localStorage.setItem("retailstacker_invoice_history", JSON.stringify(updatedHistory));
    if (!currentInvoiceId) setCurrentInvoiceId(idToUse);
  };

  const loadFromHistory = (inv: InvoiceData) => {
    setCurrentInvoiceId(inv.id);
    setSellerName(inv.sellerName);
    setSellerGSTIN(inv.sellerGSTIN);
    setSellerAddress(inv.sellerAddress);
    setSellerState(inv.sellerState);
    setBuyerName(inv.buyerName);
    setBuyerGSTIN(inv.buyerGSTIN);
    setBuyerAddress(inv.buyerAddress);
    setBuyerState(inv.buyerState);
    setPlaceOfSupply(inv.placeOfSupply);
    setInvoiceNo(inv.invoiceNo);
    setInvoiceDate(inv.invoiceDate);
    setDueDate(inv.dueDate);
    setItems(inv.items);
    setBankName(inv.bankName);
    setBankHolder(inv.bankHolder);
    setBankAccNo(inv.bankAccNo);
    setBankIFSC(inv.bankIFSC);
    setUpiId(inv.upiId);
    setTerms(inv.terms);
    setNotes(inv.notes);
    setThemeColor(inv.themeColor || "#1A56DB");
    setShowHsn(inv.showHsn !== undefined ? inv.showHsn : true);
    setShowDiscount(inv.showDiscount !== undefined ? inv.showDiscount : true);
    setShowGst(inv.showGst !== undefined ? inv.showGst : true);
    setActiveTab("invoice");
  };

  const deleteFromHistory = (id: string) => {
    const updated = history.filter(item => item.id !== id);
    setHistory(updated);
    localStorage.setItem("retailstacker_invoice_history", JSON.stringify(updated));
    if (currentInvoiceId === id) {
      setCurrentInvoiceId("");
    }
  };

  const startNewInvoice = () => {
    setCurrentInvoiceId("");
    setInvoiceNo(`INV-${Math.floor(1000 + Math.random() * 9000)}`);
    setItems([{
      id: Date.now().toString(),
      description: "Sample Product Item",
      hsn: "9018",
      qty: 1,
      rateExcludingTax: 1000,
      discountPercent: 0,
      gstPercent: 18
    }]);
  };

  const handlePrint = () => {
    saveToHistory();
    window.print();
  };

  // Calculations
  const isInterState = sellerState !== placeOfSupply;
  let totalTaxableValue = 0;
  let totalTaxAmount = 0;
  let grandTotal = 0;

  const processedItems = items.map(item => {
    const rawVal = item.rateExcludingTax * item.qty;
    const discount = rawVal * (item.discountPercent / 100);
    const taxable = rawVal - discount;
    const tax = taxable * (item.gstPercent / 100);
    const total = taxable + tax;

    totalTaxableValue += taxable;
    totalTaxAmount += tax;
    grandTotal += total;

    return {
      ...item,
      taxable,
      tax,
      total
    };
  });

  return (
    <div style={{ maxWidth: 1280, margin: "0 auto", padding: "12px 24px 60px" }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 28, flexWrap: "wrap", gap: 16 }}>
        <div>
          <h1 style={{ fontSize: 28, fontWeight: 900, color: "white", margin: 0, display: "flex", alignItems: "center", gap: 10 }}>
            <FileText size={28} color="var(--accent)" /> Professional GST Invoice Maker
          </h1>
          <p style={{ fontSize: 14, color: "var(--text-secondary)", margin: "4px 0 0 0" }}>
            Rebuilt custom GST generator configured to replicate Refrens flow with dynamic columns and local history storage
          </p>
        </div>

        <div style={{ display: "flex", gap: 12 }}>
          <button 
            onClick={() => setActiveTab("invoice")}
            style={{
              padding: "10px 18px", borderRadius: 12, border: "none", fontWeight: 700, fontSize: 13.5, cursor: "pointer",
              background: activeTab === "invoice" ? "var(--accent)" : "rgba(255,255,255,0.06)",
              color: "white", transition: "all 0.2s"
            }}
          >
            Create Invoice
          </button>
          <button 
            onClick={() => setActiveTab("history")}
            style={{
              padding: "10px 18px", borderRadius: 12, border: "none", fontWeight: 700, fontSize: 13.5, cursor: "pointer",
              background: activeTab === "history" ? "var(--accent)" : "rgba(255,255,255,0.06)",
              color: "white", transition: "all 0.2s"
            }}
          >
            Invoice History ({history.length})
          </button>
          <button 
            onClick={() => setActiveTab("calculator")}
            style={{
              padding: "10px 18px", borderRadius: 12, border: "none", fontWeight: 700, fontSize: 13.5, cursor: "pointer",
              background: activeTab === "calculator" ? "var(--accent)" : "rgba(255,255,255,0.06)",
              color: "white", transition: "all 0.2s"
            }}
          >
            GST Calculator
          </button>
        </div>
      </div>

      {/* ─── TAB 1: INVOICE BUILDER ─── */}
      {activeTab === "invoice" && (
        <div style={{ display: "grid", gridTemplateColumns: "1fr 480px", gap: 28, alignItems: "start" }} className="builder-layout">
          {/* Form Side */}
          <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
            {/* Step 1: Business Profile */}
            <div className="glass-card" style={{ padding: 24, borderRadius: 16, border: "1px solid var(--border)", background: "var(--bg-card)" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
                <h3 style={{ fontSize: 16, fontWeight: 800, color: "white", margin: 0, display: "flex", alignItems: "center", gap: 8 }}>
                  <Building2 size={18} color="var(--accent)" /> 1. Business & Sender Profile
                </h3>
                <button 
                  onClick={startNewInvoice} 
                  style={{ background: "none", border: "none", color: "var(--accent)", fontSize: 12.5, fontWeight: 700, cursor: "pointer" }}
                >
                  Clear & Create New
                </button>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
                <div>
                  <label className="input-label" style={{ fontSize: 12, color: "var(--text-secondary)", display: "block", marginBottom: 6 }}>Business Name</label>
                  <input type="text" value={sellerName} onChange={e => setSellerName(e.target.value)} className="input-field" style={{ width: "100%", padding: 10, borderRadius: 8, background: "rgba(255,255,255,0.03)", border: "1px solid var(--border)", color: "white" }} />
                </div>
                <div>
                  <label className="input-label" style={{ fontSize: 12, color: "var(--text-secondary)", display: "block", marginBottom: 6 }}>GSTIN Number</label>
                  <input type="text" value={sellerGSTIN} onChange={e => setSellerGSTIN(e.target.value)} className="input-field" style={{ width: "100%", padding: 10, borderRadius: 8, background: "rgba(255,255,255,0.03)", border: "1px solid var(--border)", color: "white" }} />
                </div>
                <div style={{ gridColumn: "span 2" }}>
                  <label className="input-label" style={{ fontSize: 12, color: "var(--text-secondary)", display: "block", marginBottom: 6 }}>Billing Address</label>
                  <textarea value={sellerAddress} onChange={e => setSellerAddress(e.target.value)} className="input-field" rows={2} style={{ width: "100%", padding: 10, borderRadius: 8, background: "rgba(255,255,255,0.03)", border: "1px solid var(--border)", color: "white", fontFamily: "inherit" }} />
                </div>
                <div>
                  <label className="input-label" style={{ fontSize: 12, color: "var(--text-secondary)", display: "block", marginBottom: 6 }}>State of Supply</label>
                  <select value={sellerState} onChange={e => setSellerState(e.target.value)} className="input-field" style={{ width: "100%", padding: 10, borderRadius: 8, background: "rgba(10,15,30,0.8)", border: "1px solid var(--border)", color: "white" }}>
                    {INDIAN_STATES.map(s => <option key={s.name} value={s.name}>{s.name}</option>)}
                  </select>
                </div>
              </div>
            </div>

            {/* Step 2: Client Profile */}
            <div className="glass-card" style={{ padding: 24, borderRadius: 16, border: "1px solid var(--border)", background: "var(--bg-card)" }}>
              <h3 style={{ fontSize: 16, fontWeight: 800, color: "white", margin: "0 0 16px 0", display: "flex", alignItems: "center", gap: 8 }}>
                <User size={18} color="var(--accent)" /> 2. Client Details (Bill To)
              </h3>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
                <div>
                  <label className="input-label" style={{ fontSize: 12, color: "var(--text-secondary)", display: "block", marginBottom: 6 }}>Client Company Name</label>
                  <input type="text" value={buyerName} onChange={e => setBuyerName(e.target.value)} className="input-field" style={{ width: "100%", padding: 10, borderRadius: 8, background: "rgba(255,255,255,0.03)", border: "1px solid var(--border)", color: "white" }} />
                </div>
                <div>
                  <label className="input-label" style={{ fontSize: 12, color: "var(--text-secondary)", display: "block", marginBottom: 6 }}>Client GSTIN</label>
                  <input type="text" value={buyerGSTIN} onChange={e => setBuyerGSTIN(e.target.value)} className="input-field" style={{ width: "100%", padding: 10, borderRadius: 8, background: "rgba(255,255,255,0.03)", border: "1px solid var(--border)", color: "white" }} />
                </div>
                <div style={{ gridColumn: "span 2" }}>
                  <label className="input-label" style={{ fontSize: 12, color: "var(--text-secondary)", display: "block", marginBottom: 6 }}>Client Shipping/Billing Address</label>
                  <textarea value={buyerAddress} onChange={e => setBuyerAddress(e.target.value)} className="input-field" rows={2} style={{ width: "100%", padding: 10, borderRadius: 8, background: "rgba(255,255,255,0.03)", border: "1px solid var(--border)", color: "white", fontFamily: "inherit" }} />
                </div>
                <div>
                  <label className="input-label" style={{ fontSize: 12, color: "var(--text-secondary)", display: "block", marginBottom: 6 }}>Place of Supply</label>
                  <select value={placeOfSupply} onChange={e => setPlaceOfSupply(e.target.value)} className="input-field" style={{ width: "100%", padding: 10, borderRadius: 8, background: "rgba(10,15,30,0.8)", border: "1px solid var(--border)", color: "white" }}>
                    {INDIAN_STATES.map(s => <option key={s.name} value={s.name}>{s.name}</option>)}
                  </select>
                </div>
              </div>
            </div>

            {/* Step 3: Metadata */}
            <div className="glass-card" style={{ padding: 24, borderRadius: 16, border: "1px solid var(--border)", background: "var(--bg-card)" }}>
              <h3 style={{ fontSize: 16, fontWeight: 800, color: "white", margin: "0 0 16px 0", display: "flex", alignItems: "center", gap: 8 }}>
                <Settings size={18} color="var(--accent)" /> 3. Invoice Info & Customization
              </h3>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 16, marginBottom: 20 }}>
                <div>
                  <label className="input-label" style={{ fontSize: 12, color: "var(--text-secondary)", display: "block", marginBottom: 6 }}>Invoice No</label>
                  <input type="text" value={invoiceNo} onChange={e => setInvoiceNo(e.target.value)} className="input-field" style={{ width: "100%", padding: 10, borderRadius: 8, background: "rgba(255,255,255,0.03)", border: "1px solid var(--border)", color: "white" }} />
                </div>
                <div>
                  <label className="input-label" style={{ fontSize: 12, color: "var(--text-secondary)", display: "block", marginBottom: 6 }}>Invoice Date</label>
                  <input type="date" value={invoiceDate} onChange={e => setInvoiceDate(e.target.value)} className="input-field" style={{ width: "100%", padding: 10, borderRadius: 8, background: "rgba(255,255,255,0.03)", border: "1px solid var(--border)", color: "white" }} />
                </div>
                <div>
                  <label className="input-label" style={{ fontSize: 12, color: "var(--text-secondary)", display: "block", marginBottom: 6 }}>Due Date</label>
                  <input type="date" value={dueDate} onChange={e => setDueDate(e.target.value)} className="input-field" style={{ width: "100%", padding: 10, borderRadius: 8, background: "rgba(255,255,255,0.03)", border: "1px solid var(--border)", color: "white" }} />
                </div>
              </div>

              <div style={{ borderTop: "1px solid var(--border)", paddingTop: 16 }}>
                <span style={{ fontSize: 13, color: "var(--text-secondary)", display: "block", marginBottom: 12, fontWeight: 700 }}>Custom Columns (Refrens Customizations)</span>
                <div style={{ display: "flex", gap: 20, flexWrap: "wrap" }}>
                  <label style={{ display: "flex", alignItems: "center", gap: 8, color: "white", fontSize: 13.5, cursor: "pointer" }}>
                    <input type="checkbox" checked={showHsn} onChange={e => setShowHsn(e.target.checked)} /> Show HSN Code Column
                  </label>
                  <label style={{ display: "flex", alignItems: "center", gap: 8, color: "white", fontSize: 13.5, cursor: "pointer" }}>
                    <input type="checkbox" checked={showDiscount} onChange={e => setShowDiscount(e.target.checked)} /> Show Discount Column
                  </label>
                  <label style={{ display: "flex", alignItems: "center", gap: 8, color: "white", fontSize: 13.5, cursor: "pointer" }}>
                    <input type="checkbox" checked={showGst} onChange={e => setShowGst(e.target.checked)} /> Show GST% Column
                  </label>
                </div>
              </div>
            </div>

            {/* Step 4: Line Items */}
            <div className="glass-card" style={{ padding: 24, borderRadius: 16, border: "1px solid var(--border)", background: "var(--bg-card)" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
                <h3 style={{ fontSize: 16, fontWeight: 800, color: "white", margin: 0, display: "flex", alignItems: "center", gap: 8 }}>
                  <Package size={18} color="var(--accent)" /> 4. Line Items
                </h3>
                <button 
                  onClick={() => setItems([...items, { id: Date.now().toString(), description: "New Item", hsn: "9018", qty: 1, rateExcludingTax: 1000, discountPercent: 0, gstPercent: 18 }])}
                  style={{
                    padding: "6px 12px", borderRadius: 8, border: "none", cursor: "pointer", fontWeight: 700, fontSize: 12,
                    background: "rgba(255,255,255,0.08)", color: "white", display: "inline-flex", alignItems: "center", gap: 6
                  }}
                >
                  <Plus size={14} /> Add Item
                </button>
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                {items.map((item, idx) => (
                  <div key={item.id} style={{ display: "grid", gridTemplateColumns: `3fr ${showHsn ? '1fr' : ''} 1fr 1fr ${showDiscount ? '1fr' : ''} ${showGst ? '1.2fr' : ''} auto`, gap: 10, alignItems: "center", borderBottom: idx !== items.length - 1 ? "1px solid rgba(255,255,255,0.04)" : "none", paddingBottom: 14 }}>
                    <div>
                      <label style={{ fontSize: 11, color: "var(--text-secondary)", display: "block", marginBottom: 4 }}>Description</label>
                      <input type="text" value={item.description} onChange={e => {
                        const newItems = [...items];
                        newItems[idx].description = e.target.value;
                        setItems(newItems);
                      }} className="input-field" style={{ width: "100%", padding: "8px 10px", borderRadius: 8, background: "rgba(255,255,255,0.02)", border: "1px solid var(--border)", color: "white" }} />
                    </div>

                    {showHsn && (
                      <div>
                        <label style={{ fontSize: 11, color: "var(--text-secondary)", display: "block", marginBottom: 4 }}>HSN</label>
                        <input type="text" value={item.hsn} onChange={e => {
                          const newItems = [...items];
                          newItems[idx].hsn = e.target.value;
                          setItems(newItems);
                        }} className="input-field" style={{ width: "100%", padding: "8px 10px", borderRadius: 8, background: "rgba(255,255,255,0.02)", border: "1px solid var(--border)", color: "white" }} />
                      </div>
                    )}

                    <div>
                      <label style={{ fontSize: 11, color: "var(--text-secondary)", display: "block", marginBottom: 4 }}>Qty</label>
                      <input type="number" value={item.qty} onChange={e => {
                        const newItems = [...items];
                        newItems[idx].qty = Number(e.target.value);
                        setItems(newItems);
                      }} className="input-field" style={{ width: "100%", padding: "8px 10px", borderRadius: 8, background: "rgba(255,255,255,0.02)", border: "1px solid var(--border)", color: "white" }} />
                    </div>

                    <div>
                      <label style={{ fontSize: 11, color: "var(--text-secondary)", display: "block", marginBottom: 4 }}>Rate</label>
                      <input type="number" value={item.rateExcludingTax} onChange={e => {
                        const newItems = [...items];
                        newItems[idx].rateExcludingTax = Number(e.target.value);
                        setItems(newItems);
                      }} className="input-field" style={{ width: "100%", padding: "8px 10px", borderRadius: 8, background: "rgba(255,255,255,0.02)", border: "1px solid var(--border)", color: "white" }} />
                    </div>

                    {showDiscount && (
                      <div>
                        <label style={{ fontSize: 11, color: "var(--text-secondary)", display: "block", marginBottom: 4 }}>Disc%</label>
                        <input type="number" value={item.discountPercent} onChange={e => {
                          const newItems = [...items];
                          newItems[idx].discountPercent = Number(e.target.value);
                          setItems(newItems);
                        }} className="input-field" style={{ width: "100%", padding: "8px 10px", borderRadius: 8, background: "rgba(255,255,255,0.02)", border: "1px solid var(--border)", color: "white" }} />
                      </div>
                    )}

                    {showGst && (
                      <div>
                        <label style={{ fontSize: 11, color: "var(--text-secondary)", display: "block", marginBottom: 4 }}>GST%</label>
                        <select value={item.gstPercent} onChange={e => {
                          const newItems = [...items];
                          newItems[idx].gstPercent = Number(e.target.value);
                          setItems(newItems);
                        }} className="input-field" style={{ width: "100%", padding: "8px 10px", borderRadius: 8, background: "rgba(10,15,30,0.8)", border: "1px solid var(--border)", color: "white" }}>
                          <option value="0">0%</option>
                          <option value="5">5%</option>
                          <option value="12">12%</option>
                          <option value="18">18%</option>
                          <option value="28">28%</option>
                        </select>
                      </div>
                    )}

                    <div style={{ paddingTop: 18 }}>
                      <button 
                        onClick={() => {
                          if (items.length > 1) {
                            setItems(items.filter(i => i.id !== item.id));
                          }
                        }}
                        style={{ background: "none", border: "none", cursor: "pointer", color: "var(--danger)", padding: 4 }}
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Step 5: Bank details */}
            <div className="glass-card" style={{ padding: 24, borderRadius: 16, border: "1px solid var(--border)", background: "var(--bg-card)" }}>
              <h3 style={{ fontSize: 16, fontWeight: 800, color: "white", margin: "0 0 16px 0", display: "flex", alignItems: "center", gap: 8 }}>
                <Landmark size={18} color="var(--accent)" /> 5. Bank / Payment Details
              </h3>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
                <div>
                  <label className="input-label" style={{ fontSize: 12, color: "var(--text-secondary)", display: "block", marginBottom: 6 }}>Bank Name</label>
                  <input type="text" value={bankName} onChange={e => setBankName(e.target.value)} className="input-field" style={{ width: "100%", padding: 10, borderRadius: 8, background: "rgba(255,255,255,0.03)", border: "1px solid var(--border)", color: "white" }} />
                </div>
                <div>
                  <label className="input-label" style={{ fontSize: 12, color: "var(--text-secondary)", display: "block", marginBottom: 6 }}>Account Holder Name</label>
                  <input type="text" value={bankHolder} onChange={e => setBankHolder(e.target.value)} className="input-field" style={{ width: "100%", padding: 10, borderRadius: 8, background: "rgba(255,255,255,0.03)", border: "1px solid var(--border)", color: "white" }} />
                </div>
                <div>
                  <label className="input-label" style={{ fontSize: 12, color: "var(--text-secondary)", display: "block", marginBottom: 6 }}>Account Number</label>
                  <input type="text" value={bankAccNo} onChange={e => setBankAccNo(e.target.value)} className="input-field" style={{ width: "100%", padding: 10, borderRadius: 8, background: "rgba(255,255,255,0.03)", border: "1px solid var(--border)", color: "white" }} />
                </div>
                <div>
                  <label className="input-label" style={{ fontSize: 12, color: "var(--text-secondary)", display: "block", marginBottom: 6 }}>IFSC Code</label>
                  <input type="text" value={bankIFSC} onChange={e => setBankIFSC(e.target.value)} className="input-field" style={{ width: "100%", padding: 10, borderRadius: 8, background: "rgba(255,255,255,0.03)", border: "1px solid var(--border)", color: "white" }} />
                </div>
                <div style={{ gridColumn: "span 2" }}>
                  <label className="input-label" style={{ fontSize: 12, color: "var(--text-secondary)", display: "block", marginBottom: 6 }}>UPI ID (Generates Dynamic Payment QR)</label>
                  <input type="text" value={upiId} onChange={e => setUpiId(e.target.value)} className="input-field" style={{ width: "100%", padding: 10, borderRadius: 8, background: "rgba(255,255,255,0.03)", border: "1px solid var(--border)", color: "white" }} />
                </div>
              </div>
            </div>
          </div>

          {/* Sticky Preview & Controls Side */}
          <div style={{ position: "sticky", top: 100, display: "flex", flexDirection: "column", gap: 20 }}>
            {/* Design Customizations */}
            <div className="glass-card" style={{ padding: 20, borderRadius: 16, border: "1px solid var(--border)", background: "var(--bg-card)" }}>
              <span style={{ fontSize: 14, fontWeight: 800, color: "white", display: "block", marginBottom: 12 }}>Template Customization</span>
              <div>
                <label className="input-label" style={{ fontSize: 12, color: "var(--text-secondary)", display: "block", marginBottom: 6 }}>Branding Theme Color</label>
                <div style={{ display: "flex", gap: 10 }}>
                  {["#1A56DB", "#058b8c", "#8B5CF6", "#EC4899", "#10B981"].map(color => (
                    <button 
                      key={color} 
                      onClick={() => setThemeColor(color)}
                      style={{
                        width: 32, height: 32, borderRadius: "50%", border: themeColor === color ? "3px solid white" : "none",
                        background: color, cursor: "pointer", transition: "all 0.2s"
                      }}
                    />
                  ))}
                </div>
              </div>
            </div>

            {/* Total summary card */}
            <div className="glass-card" style={{ padding: 24, borderRadius: 16, border: "1px solid var(--border)", background: "var(--bg-card)" }}>
              <span style={{ fontSize: 14, color: "var(--text-secondary)", display: "block", marginBottom: 6, fontWeight: 700 }}>LIVE SUMMARY</span>
              <div style={{ display: "flex", flexDirection: "column", gap: 12, margin: "16px 0", borderBottom: "1px solid var(--border)", paddingBottom: 16 }}>
                <div style={{ display: "flex", justifyContent: "space-between", color: "var(--text-secondary)" }}>
                  <span>Taxable Subtotal:</span>
                  <span style={{ fontWeight: 600, color: "white" }}>{fmt(totalTaxableValue)}</span>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", color: "var(--text-secondary)" }}>
                  <span>GST Total Amount:</span>
                  <span style={{ fontWeight: 600, color: "white" }}>{fmt(totalTaxAmount)}</span>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", color: "white", fontSize: 18, fontWeight: 800, paddingTop: 6 }}>
                  <span>Grand Total:</span>
                  <span style={{ color: "var(--accent)" }}>{fmt(grandTotal)}</span>
                </div>
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                <button 
                  onClick={handlePrint}
                  style={{
                    width: "100%", padding: 12, borderRadius: 10, border: "none", cursor: "pointer", fontWeight: 700,
                    background: "var(--accent)", color: "white", display: "flex", alignItems: "center", justifyContent: "center", gap: 8
                  }}
                >
                  <Printer size={16} /> Print / Save PDF Invoice
                </button>
                <button 
                  onClick={() => {
                    saveToHistory();
                    alert("Invoice Saved to Local History successfully!");
                  }}
                  style={{
                    width: "100%", padding: 12, borderRadius: 10, border: "1px solid var(--border)", cursor: "pointer", fontWeight: 700,
                    background: "rgba(255,255,255,0.04)", color: "white", display: "flex", alignItems: "center", justifyContent: "center", gap: 8
                  }}
                >
                  <CheckCircle size={16} color="#34d399" /> Save To Local History
                </button>
              </div>
            </div>

            {/* A4 Mini-Sheet Preview */}
            <div id="invoice-sheet-container" style={{
              background: "white", color: "#333333", borderRadius: 8, padding: 24, boxShadow: "0 10px 30px rgba(0,0,0,0.5)",
              fontSize: 10, fontFamily: "sans-serif", borderTop: `6px solid ${themeColor}`
            }}>
              {/* Header */}
              <div style={{ display: "flex", justifyContent: "space-between", borderBottom: "1px solid #eeeeee", paddingBottom: 12, marginBottom: 12 }}>
                <div>
                  <h4 style={{ fontSize: 14, fontWeight: 800, margin: 0, color: "#111" }}>{sellerName}</h4>
                  <p style={{ margin: "2px 0", color: "#666" }}>GSTIN: {sellerGSTIN}</p>
                  <p style={{ margin: "2px 0", color: "#666", maxWidth: 220 }}>{sellerAddress}</p>
                </div>
                <div style={{ textAlign: "right" }}>
                  <h2 style={{ fontSize: 16, fontWeight: 900, color: themeColor, margin: "0 0 4px 0" }}>TAX INVOICE</h2>
                  <p style={{ margin: "2px 0" }}><b>Invoice #:</b> {invoiceNo}</p>
                  <p style={{ margin: "2px 0" }}><b>Date:</b> {invoiceDate}</p>
                  <p style={{ margin: "2px 0" }}><b>Due:</b> {dueDate}</p>
                </div>
              </div>

              {/* Bill To */}
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 16 }}>
                <div>
                  <span style={{ fontSize: 9, fontWeight: 700, color: "#999", textTransform: "uppercase" }}>Bill To</span>
                  <h5 style={{ fontSize: 11, fontWeight: 800, margin: "4px 0 2px 0", color: "#111" }}>{buyerName}</h5>
                  <p style={{ margin: "2px 0", color: "#666" }}>GSTIN: {buyerGSTIN}</p>
                  <p style={{ margin: "2px 0", color: "#666" }}>{buyerAddress}</p>
                </div>
                <div style={{ textAlign: "right" }}>
                  <span style={{ fontSize: 9, fontWeight: 700, color: "#999", textTransform: "uppercase" }}>Details</span>
                  <p style={{ margin: "4px 0 2px 0" }}><b>Place of Supply:</b> {placeOfSupply}</p>
                </div>
              </div>

              {/* Items Table */}
              <table style={{ width: "100%", borderCollapse: "collapse", marginBottom: 16 }}>
                <thead>
                  <tr style={{ background: "#f8f9fa", borderBottom: "1px solid #dddddd", textAlign: "left" }}>
                    <th style={{ padding: "6px 4px", color: "#555" }}>Item</th>
                    {showHsn && <th style={{ padding: "6px 4px", color: "#555" }}>HSN</th>}
                    <th style={{ padding: "6px 4px", color: "#555" }}>Qty</th>
                    <th style={{ padding: "6px 4px", color: "#555" }}>Rate</th>
                    {showDiscount && <th style={{ padding: "6px 4px", color: "#555" }}>Disc%</th>}
                    {showGst && <th style={{ padding: "6px 4px", color: "#555" }}>GST%</th>}
                    <th style={{ padding: "6px 4px", color: "#555", textAlign: "right" }}>Amount</th>
                  </tr>
                </thead>
                <tbody>
                  {processedItems.map(item => (
                    <tr key={item.id} style={{ borderBottom: "1px solid #eeeeee" }}>
                      <td style={{ padding: "8px 4px", fontWeight: 700, color: "#222" }}>{item.description}</td>
                      {showHsn && <td style={{ padding: "8px 4px", color: "#666" }}>{item.hsn}</td>}
                      <td style={{ padding: "8px 4px" }}>{item.qty}</td>
                      <td style={{ padding: "8px 4px" }}>₹{item.rateExcludingTax.toFixed(2)}</td>
                      {showDiscount && <td style={{ padding: "8px 4px" }}>{item.discountPercent}%</td>}
                      {showGst && <td style={{ padding: "8px 4px" }}>{item.gstPercent}%</td>}
                      <td style={{ padding: "8px 4px", textAlign: "right", fontWeight: 700 }}>₹{item.total.toFixed(2)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {/* Totals & Bank details */}
              <div style={{ display: "grid", gridTemplateColumns: "1.2fr 1fr", gap: 16, alignItems: "start" }}>
                <div>
                  <span style={{ fontSize: 9, fontWeight: 700, color: "#999", textTransform: "uppercase" }}>Payment Options</span>
                  <div style={{ border: "1px solid #eeeeee", borderRadius: 6, padding: 8, marginTop: 4, display: "flex", gap: 10, alignItems: "center" }}>
                    <img 
                      src={`https://api.qrserver.com/v1/create-qr-code/?size=70x70&margin=0&data=${encodeURIComponent(`upi://pay?pa=${upiId}&pn=${encodeURIComponent(bankHolder)}&am=${grandTotal.toFixed(2)}&cu=INR`)}`} 
                      alt="Payment QR" 
                      style={{ width: 54, height: 54 }} 
                    />
                    <div>
                      <p style={{ margin: "0 0 2px 0" }}><b>{bankName}</b></p>
                      <p style={{ margin: "2px 0", color: "#666" }}>A/c: {bankAccNo}</p>
                      <p style={{ margin: "2px 0", color: "#666" }}>IFSC: {bankIFSC}</p>
                      <p style={{ margin: "2px 0", color: "#666" }}>UPI: {upiId}</p>
                    </div>
                  </div>
                </div>

                <div style={{ display: "flex", flexDirection: "column", gap: 6, fontSize: 10, textAlign: "right" }}>
                  <div style={{ display: "flex", justifyContent: "space-between" }}>
                    <span style={{ color: "#666" }}>Subtotal:</span>
                    <span>₹{totalTaxableValue.toFixed(2)}</span>
                  </div>
                  <div style={{ display: "flex", justifyContent: "space-between" }}>
                    <span style={{ color: "#666" }}>GST total:</span>
                    <span>₹{totalTaxAmount.toFixed(2)}</span>
                  </div>
                  <div style={{ display: "flex", justifyContent: "space-between", borderTop: "1px solid #eeeeee", paddingTop: 6, fontSize: 12, fontWeight: 800, color: themeColor }}>
                    <span>Total Due:</span>
                    <span>₹{grandTotal.toFixed(2)}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ─── TAB 2: INVOICE HISTORY ─── */}
      {activeTab === "history" && (
        <div className="glass-card" style={{ padding: 24, borderRadius: 16, border: "1px solid var(--border)", background: "var(--bg-card)" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
            <h3 style={{ fontSize: 18, fontWeight: 800, color: "white", margin: 0 }}>Invoice History</h3>
            <span style={{ fontSize: 13, color: "var(--text-secondary)" }}>Total Saved Invoices: {history.length}</span>
          </div>

          {history.length === 0 ? (
            <div style={{ padding: "48px 24px", textAlign: "center", color: "var(--text-secondary)" }}>
              <FileText size={48} style={{ opacity: 0.3, marginBottom: 12 }} />
              <p style={{ margin: 0 }}>No saved invoices in history. Invoices are auto-saved when printed or explicitly saved.</p>
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              {history.map(item => (
                <div key={item.id} style={{
                  display: "flex", justifyContent: "space-between", alignItems: "center", padding: 16, borderRadius: 12,
                  background: "rgba(255,255,255,0.02)", border: "1px solid var(--border)"
                }}>
                  <div>
                    <h4 style={{ fontSize: 15, fontWeight: 800, color: "white", margin: "0 0 4px 0" }}>{item.invoiceNo}</h4>
                    <div style={{ display: "flex", gap: 16, fontSize: 12.5, color: "var(--text-secondary)" }}>
                      <span>Date: {item.invoiceDate}</span>
                      <span>Client: <b>{item.buyerName}</b></span>
                      <span>Amount: <b style={{ color: "var(--accent)" }}>{fmt(item.items.reduce((acc, curr) => acc + (curr.rateExcludingTax * curr.qty * (1 + curr.gstPercent/100)), 0))}</b></span>
                    </div>
                  </div>

                  <div style={{ display: "flex", gap: 10 }}>
                    <button 
                      onClick={() => loadFromHistory(item)}
                      style={{
                        padding: "8px 14px", borderRadius: 8, border: "none", cursor: "pointer", fontWeight: 700, fontSize: 12,
                        background: "var(--accent)", color: "white", display: "inline-flex", alignItems: "center", gap: 6
                      }}
                    >
                      <Edit3 size={13} /> Edit / Open
                    </button>
                    <button 
                      onClick={() => deleteFromHistory(item.id)}
                      style={{
                        padding: "8px 14px", borderRadius: 8, border: "1px solid var(--border)", cursor: "pointer", fontWeight: 700, fontSize: 12,
                        background: "rgba(255,50,50,0.08)", color: "var(--danger)", display: "inline-flex", alignItems: "center", gap: 6
                      }}
                    >
                      <Trash2 size={13} /> Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ─── TAB 3: GST CALCULATOR ─── */}
      {activeTab === "calculator" && (
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 28 }} className="builder-layout">
          {/* Calculator Inputs Card */}
          <div className="glass-card" style={{ padding: 24, borderRadius: 16, border: "1px solid var(--border)", background: "var(--bg-card)" }}>
            <h3 style={{ fontSize: 18, fontWeight: 800, color: "white", margin: "0 0 20px 0", display: "flex", alignItems: "center", gap: 8 }}>
              <Calculator size={20} color="var(--accent)" /> GST Calculator Inputs
            </h3>

            <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              <div>
                <label className="input-label" style={{ fontSize: 12, color: "var(--text-secondary)", display: "block", marginBottom: 6 }}>Product Category</label>
                <select 
                  value={inputs.productCategory} 
                  onChange={e => setInputs(prev => ({ ...prev, productCategory: e.target.value }))}
                  className="input-field" 
                  style={{ width: "100%", padding: 12, borderRadius: 8, background: "rgba(10,15,30,0.8)", border: "1px solid var(--border)", color: "white" }}
                >
                  {Object.keys(GST_RATES).map(cat => <option key={cat} value={cat}>{cat}</option>)}
                </select>
              </div>

              <div>
                <label className="input-label" style={{ fontSize: 12, color: "var(--text-secondary)", display: "block", marginBottom: 6 }}>Selling Price (mrp)</label>
                <input 
                  type="number" 
                  value={inputs.sellingPrice} 
                  onChange={e => setInputs(prev => ({ ...prev, sellingPrice: Number(e.target.value) }))}
                  className="input-field" 
                  style={{ width: "100%", padding: 12, borderRadius: 8, background: "rgba(255,255,255,0.03)", border: "1px solid var(--border)", color: "white" }} 
                />
              </div>

              <div>
                <label className="input-label" style={{ fontSize: 12, color: "var(--text-secondary)", display: "block", marginBottom: 6 }}>Cost of Goods (COGS)</label>
                <input 
                  type="number" 
                  value={inputs.cogs} 
                  onChange={e => setInputs(prev => ({ ...prev, cogs: Number(e.target.value) }))}
                  className="input-field" 
                  style={{ width: "100%", padding: 12, borderRadius: 8, background: "rgba(255,255,255,0.03)", border: "1px solid var(--border)", color: "white" }} 
                />
              </div>
            </div>
          </div>

          {/* Calculator Output Breakdown Card */}
          <div className="glass-card" style={{ padding: 24, borderRadius: 16, border: "1px solid var(--border)", background: "var(--bg-card)" }}>
            <h3 style={{ fontSize: 18, fontWeight: 800, color: "white", margin: "0 0 20px 0" }}>Unit Economics Summary</h3>
            
            {(() => {
              const res = calculate(inputs);
              const econ = [
                { label: "MRP Selling Price", val: res.unitEconomics.revenue, color: "white" },
                { label: `GST Collected (${res.gstRate}%)`, val: -res.unitEconomics.gstCollected, color: "var(--warning)" },
                { label: "COGS / Landed Cost", val: -res.unitEconomics.cogs, color: "var(--danger)" },
                { label: "Net Economic Profit", val: res.netProfit, color: res.netProfit > 0 ? "var(--success)" : "var(--danger)", bold: true }
              ];
              return (
                <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                  {econ.map((item, idx) => (
                    <div key={idx} style={{ display: "flex", justifyContent: "space-between", borderBottom: "1px solid rgba(255,255,255,0.04)", paddingBottom: 8, fontSize: item.bold ? 16 : 14, fontWeight: item.bold ? 800 : 500 }}>
                      <span style={{ color: "var(--text-secondary)" }}>{item.label}</span>
                      <span style={{ color: item.color }}>{fmt(item.val)}</span>
                    </div>
                  ))}
                </div>
              );
            })()}
          </div>
        </div>
      )}

      {/* Global CSS overlays for printing */}
      <style>{`
        @media print {
          body * {
            visibility: hidden !important;
          }
          #invoice-sheet-container, #invoice-sheet-container * {
            visibility: visible !important;
          }
          #invoice-sheet-container {
            position: absolute !important;
            left: 0 !important;
            top: 0 !important;
            width: 100% !important;
            box-shadow: none !important;
            padding: 0 !important;
            border-top: none !important;
          }
        }
        @media (max-width: 1024px) {
          .builder-layout {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>
    </div>
  );
}
