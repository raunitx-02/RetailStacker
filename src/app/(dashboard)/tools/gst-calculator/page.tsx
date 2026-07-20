"use client";

import { useState, useEffect } from "react";
import {
  Calculator, IndianRupee, Package, Globe, AlertTriangle, CheckCircle,
  Info, Download, Plus, Trash2, Printer, FileText, User, MapPin,
  Building2, Landmark, Check, HelpCircle, ArrowRight, Edit3, Settings, Columns, Sparkles,
  Eye, EyeOff, Image as ImageIcon, X, SlidersHorizontal, Bold, Italic, List, ListOrdered, GripVertical, RotateCcw,
  Layout, FileCheck
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

const fmt = (n: number, symbol = "₹") => `${symbol}${n.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

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

interface ColumnSetting {
  id: string;
  name: string;
  type: string;
  formula: string;
  visible: boolean;
}

const DEFAULT_COLUMNS: ColumnSetting[] = [
  { id: "quantity", name: "Quantity", type: "NUMBER", formula: "Input", visible: true },
  { id: "rate", name: "Rate", type: "CURRENCY", formula: "Input", visible: true },
  { id: "amount", name: "Amount", type: "CURRENCY", formula: "(Quantity * Rate)", visible: true },
  { id: "cgst", name: "CGST", type: "CURRENCY", formula: "(Amount * (GST/2) / 100)", visible: true },
  { id: "sgst", name: "SGST", type: "CURRENCY", formula: "(Amount * (GST/2) / 100)", visible: true },
  { id: "total", name: "Total", type: "CURRENCY", formula: "(Amount + Tax)", visible: true },
  { id: "hsn", name: "HSN/SAC", type: "TEXT", formula: "Input", visible: true },
  { id: "gstRate", name: "GST Rate %", type: "PERCENT", formula: "Input", visible: true },
];

interface InvoiceItem {
  id: string;
  description: string;
  extraDesc?: string;
  showDesc?: boolean;
  imageUrl?: string;
  showImage?: boolean;
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
  currency: string;
  extraDiscount: number;
  columns: ColumnSetting[];
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

  // ─── Refrens Invoice Builder State ──────────────────────────────────────────
  const [currentInvoiceId, setCurrentInvoiceId] = useState<string>("");
  const [currency, setCurrency] = useState("Indian Rupee (INR, ₹)");
  
  const [sellerName, setSellerName] = useState("Refrens Tech Pvt Ltd");
  const [sellerGSTIN, setSellerGSTIN] = useState("27AABCR1234F1Z5");
  const [sellerAddress, setSellerAddress] = useState("Unit 401, Business Park, Andheri East, Mumbai, Maharashtra - 400069");
  const [sellerState, setSellerState] = useState("Maharashtra");
  
  const [buyerName, setBuyerName] = useState("Acme Enterprises");
  const [buyerGSTIN, setBuyerGSTIN] = useState("27AAACA9876E1ZB");
  const [buyerAddress, setBuyerAddress] = useState("102, Commercial Towers, Nariman Point, Mumbai, Maharashtra");
  const [buyerState, setBuyerState] = useState("Maharashtra");
  const [placeOfSupply, setPlaceOfSupply] = useState("Maharashtra");

  const [invoiceNo, setInvoiceNo] = useState("REF-2026-001");
  const [invoiceDate, setInvoiceDate] = useState("2026-07-20");
  const [dueDate, setDueDate] = useState("2026-08-04");
  
  const [bankName, setBankName] = useState("HDFC Bank");
  const [bankHolder, setBankHolder] = useState("Refrens Tech Pvt Ltd");
  const [bankAccNo, setBankAccNo] = useState("50200012345678");
  const [bankIFSC, setBankIFSC] = useState("HDFC0000240");
  const [upiId, setUpiId] = useState("refrens@hdfcbank");

  const [notes, setNotes] = useState("Thank you for your business!");
  const [terms, setTerms] = useState<string>([
    "Payment is due within 15 days from invoice date.",
    "Interest @ 18% p.a. will be charged on overdue payments."
  ].join("\n"));

  const [extraDiscount, setExtraDiscount] = useState(0);
  const [showExtraDiscount, setShowExtraDiscount] = useState(false);

  const [items, setItems] = useState<InvoiceItem[]>([
    {
      id: "1",
      description: "Web Development & GST Integration Services",
      extraDesc: "Complete setup of automated GST tax invoice generator engine.",
      showDesc: true,
      hsn: "998314",
      qty: 1,
      rateExcludingTax: 25000,
      discountPercent: 0,
      gstPercent: 18
    }
  ]);

  // Refrens customization toggles & modal
  const [themeColor, setThemeColor] = useState("#7c3aed"); // Refrens Signature Purple
  const [showColumnModal, setShowColumnModal] = useState(false);
  const [columns, setColumns] = useState<ColumnSetting[]>(DEFAULT_COLUMNS);

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
      terms: terms.split("\n").filter(Boolean),
      notes,
      themeColor,
      currency,
      extraDiscount,
      columns,
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
    setTerms(Array.isArray(inv.terms) ? inv.terms.join("\n") : inv.terms || "");
    setNotes(inv.notes || "");
    setThemeColor(inv.themeColor || "#7c3aed");
    setCurrency(inv.currency || "Indian Rupee (INR, ₹)");
    setExtraDiscount(inv.extraDiscount || 0);
    if (inv.columns && Array.isArray(inv.columns)) setColumns(inv.columns);
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
    setInvoiceNo(`REF-${new Date().getFullYear()}-${Math.floor(100 + Math.random() * 900)}`);
    setItems([{
      id: Date.now().toString(),
      description: "Sample Product / Service",
      hsn: "9983",
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

  // Helper getters for column settings
  const isColVisible = (id: string) => columns.find(c => c.id === id)?.visible ?? true;
  const getColName = (id: string, defaultName: string) => columns.find(c => c.id === id)?.name || defaultName;

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

  const finalGrandTotal = Math.max(0, grandTotal - extraDiscount);
  const currencySymbol = currency.includes("₹") ? "₹" : currency.includes("$") ? "$" : currency.includes("€") ? "€" : "£";

  return (
    <div style={{ maxWidth: 1250, margin: "0 auto", padding: "16px 20px 100px" }}>
      
      {/* ─── Refrens Header Nav ─── */}
      <div style={{
        display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 24, flexWrap: "wrap", gap: 16,
        padding: "16px 24px", background: "var(--bg-card)", borderRadius: 16, border: "1px solid var(--border)",
        boxShadow: "0 4px 12px rgba(0,0,0,0.03)"
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
          <div style={{
            width: 42, height: 42, borderRadius: 12, background: "linear-gradient(135deg, #7c3aed 0%, #ec4899 100%)",
            display: "flex", alignItems: "center", justifyContent: "center", color: "white", fontWeight: 900, fontSize: 20
          }}>
            R
          </div>
          <div>
            <h1 style={{ fontSize: 22, fontWeight: 900, color: "var(--text-primary)", margin: 0 }}>
              Refrens GST Invoice Generator
            </h1>
            <p style={{ fontSize: 13, color: "var(--text-secondary)", margin: "2px 0 0 0" }}>
              Create, customize, print and edit professional GST invoices instantly
            </p>
          </div>
        </div>

        <div style={{ display: "flex", gap: 8, background: "var(--bg-primary)", borderRadius: 12, padding: 5, border: "1px solid var(--border)" }}>
          {[
            { key: "invoice", label: "Create Invoice" },
            { key: "history", label: `Saved Invoices (${history.length})` },
            { key: "calculator", label: "GST Unit Calculator" },
          ].map(tab => (
            <button
              key={tab.key}
              type="button"
              onClick={() => setActiveTab(tab.key as "invoice" | "history" | "calculator")}
              style={{
                padding: "8px 18px", borderRadius: 9, border: "none", fontWeight: 800, fontSize: 13, cursor: "pointer",
                background: activeTab === tab.key ? themeColor : "transparent",
                color: activeTab === tab.key ? "white" : "var(--text-secondary)", transition: "all 0.18s"
              }}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* ─── TAB 1: REFRENS INVOICE BUILDER ─── */}
      {activeTab === "invoice" && (
        <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>

          {/* Refrens Action Toolbar */}
          <div style={{
            display: "flex", justifyContent: "space-between", alignItems: "center", gap: 14, flexWrap: "wrap",
            padding: "16px 22px", borderRadius: 16, background: "var(--bg-card)", border: "1px solid var(--border)",
            boxShadow: "0 4px 12px rgba(0,0,0,0.03)"
          }}>
            <div style={{ display: "flex", gap: 12, alignItems: "center", flexWrap: "wrap" }}>
              
              {/* Customize Columns Button */}
              <button
                type="button"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  setShowColumnModal(true);
                }}
                style={{
                  padding: "9px 16px", borderRadius: 9, border: "1px solid var(--border)", background: "var(--bg-primary)",
                  color: "var(--text-primary)", fontSize: 13, fontWeight: 800, cursor: "pointer", display: "flex", alignItems: "center", gap: 8
                }}
              >
                <SlidersHorizontal size={15} color={themeColor} /> Customize Columns & Formulas 💡
              </button>

              {/* Currency Switcher */}
              <select
                value={currency}
                onChange={e => setCurrency(e.target.value)}
                style={{
                  padding: "9px 14px", borderRadius: 9, border: "1px solid var(--border)", background: "var(--bg-primary)",
                  color: "var(--text-primary)", fontSize: 13, fontWeight: 800, cursor: "pointer"
                }}
              >
                <option value="Indian Rupee (INR, ₹)">Indian Rupee (INR, ₹)</option>
                <option value="US Dollar (USD, $)">US Dollar (USD, $)</option>
                <option value="Euro (EUR, €)">Euro (EUR, €)</option>
                <option value="Pound (GBP, £)">Pound (GBP, £)</option>
              </select>

              {/* Theme Color Dots */}
              <div style={{ display: "flex", gap: 8, alignItems: "center", marginLeft: 6 }}>
                {["#7c3aed", "#1A56DB", "#0D9488", "#DC2626", "#D97706", "#ec4899"].map(color => (
                  <button key={color} type="button" onClick={() => setThemeColor(color)} style={{
                    width: 22, height: 22, borderRadius: "50%", background: color, cursor: "pointer", border: "none",
                    outline: themeColor === color ? `2.5px solid var(--text-primary)` : "2.5px solid transparent",
                    outlineOffset: 2
                  }} />
                ))}
              </div>
            </div>

            {/* Action Buttons */}
            <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
              <button
                type="button"
                onClick={startNewInvoice}
                style={{ padding: "9px 16px", borderRadius: 9, border: `1.5px solid ${themeColor}`, background: "transparent", color: themeColor, fontSize: 13, fontWeight: 800, cursor: "pointer" }}
              >
                + New Invoice
              </button>

              <button
                type="button"
                onClick={() => { saveToHistory(); alert("Invoice saved to history!"); }}
                style={{ padding: "9px 16px", borderRadius: 9, border: "1px solid var(--border)", background: "var(--bg-primary)", color: "var(--text-primary)", fontSize: 13, fontWeight: 800, cursor: "pointer", display: "flex", alignItems: "center", gap: 6 }}
              >
                <CheckCircle size={15} color="var(--success)" /> Save
              </button>

              <button
                type="button"
                onClick={handlePrint}
                style={{ padding: "9px 20px", borderRadius: 9, border: "none", background: themeColor, color: "white", fontSize: 13.5, fontWeight: 900, cursor: "pointer", display: "flex", alignItems: "center", gap: 8 }}
              >
                <Printer size={16} /> Print / Save PDF
              </button>
            </div>
          </div>

          {/* Seller & Client Cards Grid */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>

            {/* Seller Details */}
            <div style={{ padding: 22, borderRadius: 16, border: "1px solid var(--border)", background: "var(--bg-card)" }}>
              <h3 style={{ fontSize: 13, fontWeight: 800, color: "var(--text-muted)", margin: "0 0 16px 0", textTransform: "uppercase", letterSpacing: "0.06em", display: "flex", alignItems: "center", gap: 6 }}>
                <Building2 size={16} color={themeColor} /> Business / Seller Details
              </h3>
              <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                <div>
                  <label style={{ fontSize: 12, fontWeight: 700, color: "var(--text-secondary)", display: "block", marginBottom: 4 }}>Company / Business Name</label>
                  <input type="text" value={sellerName} onChange={e => setSellerName(e.target.value)} className="input-field" style={{ width: "100%" }} />
                </div>
                <div>
                  <label style={{ fontSize: 12, fontWeight: 700, color: "var(--text-secondary)", display: "block", marginBottom: 4 }}>GSTIN Number</label>
                  <input type="text" value={sellerGSTIN} onChange={e => setSellerGSTIN(e.target.value)} className="input-field" style={{ width: "100%" }} />
                </div>
                <div>
                  <label style={{ fontSize: 12, fontWeight: 700, color: "var(--text-secondary)", display: "block", marginBottom: 4 }}>Street Address</label>
                  <textarea value={sellerAddress} onChange={e => setSellerAddress(e.target.value)} className="input-field" rows={2} style={{ width: "100%", resize: "vertical" }} />
                </div>
                <div>
                  <label style={{ fontSize: 12, fontWeight: 700, color: "var(--text-secondary)", display: "block", marginBottom: 4 }}>State</label>
                  <select value={sellerState} onChange={e => setSellerState(e.target.value)} className="input-field" style={{ width: "100%" }}>
                    {INDIAN_STATES.map(s => <option key={s.name} value={s.name}>{s.name}</option>)}
                  </select>
                </div>
              </div>
            </div>

            {/* Client Details */}
            <div style={{ padding: 22, borderRadius: 16, border: "1px solid var(--border)", background: "var(--bg-card)" }}>
              <h3 style={{ fontSize: 13, fontWeight: 800, color: "var(--text-muted)", margin: "0 0 16px 0", textTransform: "uppercase", letterSpacing: "0.06em", display: "flex", alignItems: "center", gap: 6 }}>
                <User size={16} color={themeColor} /> Client (Bill To) Details
              </h3>
              <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                <div>
                  <label style={{ fontSize: 12, fontWeight: 700, color: "var(--text-secondary)", display: "block", marginBottom: 4 }}>Client / Customer Name</label>
                  <input type="text" value={buyerName} onChange={e => setBuyerName(e.target.value)} className="input-field" style={{ width: "100%" }} />
                </div>
                <div>
                  <label style={{ fontSize: 12, fontWeight: 700, color: "var(--text-secondary)", display: "block", marginBottom: 4 }}>Client GSTIN</label>
                  <input type="text" value={buyerGSTIN} onChange={e => setBuyerGSTIN(e.target.value)} className="input-field" style={{ width: "100%" }} />
                </div>
                <div>
                  <label style={{ fontSize: 12, fontWeight: 700, color: "var(--text-secondary)", display: "block", marginBottom: 4 }}>Billing Address</label>
                  <textarea value={buyerAddress} onChange={e => setBuyerAddress(e.target.value)} className="input-field" rows={2} style={{ width: "100%", resize: "vertical" }} />
                </div>
                <div>
                  <label style={{ fontSize: 12, fontWeight: 700, color: "var(--text-secondary)", display: "block", marginBottom: 4 }}>Place of Supply State</label>
                  <select value={placeOfSupply} onChange={e => setPlaceOfSupply(e.target.value)} className="input-field" style={{ width: "100%" }}>
                    {INDIAN_STATES.map(s => <option key={s.name} value={s.name}>{s.name}</option>)}
                  </select>
                </div>
              </div>
            </div>
          </div>

          {/* Invoice Meta Dates */}
          <div style={{ padding: 20, borderRadius: 16, border: "1px solid var(--border)", background: "var(--bg-card)", display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 18 }}>
            <div>
              <label style={{ fontSize: 11.5, fontWeight: 800, color: "var(--text-muted)", display: "block", marginBottom: 6, textTransform: "uppercase" }}>Invoice Number</label>
              <input type="text" value={invoiceNo} onChange={e => setInvoiceNo(e.target.value)} className="input-field" style={{ width: "100%", fontWeight: 800 }} />
            </div>
            <div>
              <label style={{ fontSize: 11.5, fontWeight: 800, color: "var(--text-muted)", display: "block", marginBottom: 6, textTransform: "uppercase" }}>Invoice Date</label>
              <input type="date" value={invoiceDate} onChange={e => setInvoiceDate(e.target.value)} className="input-field" style={{ width: "100%" }} />
            </div>
            <div>
              <label style={{ fontSize: 11.5, fontWeight: 800, color: "var(--text-muted)", display: "block", marginBottom: 6, textTransform: "uppercase" }}>Due Date</label>
              <input type="date" value={dueDate} onChange={e => setDueDate(e.target.value)} className="input-field" style={{ width: "100%" }} />
            </div>
          </div>

          {/* ─── REFRENS PURPLE HTML LINE ITEMS TABLE (PERFECT CELL ALIGNMENT) ─── */}
          <div style={{ borderRadius: 16, border: "1px solid var(--border)", background: "var(--bg-card)", overflow: "hidden", boxShadow: "0 4px 14px rgba(0,0,0,0.03)" }}>
            
            <div style={{ overflowX: "auto" }}>
              <table style={{ width: "100%", borderCollapse: "collapse", minWidth: 900 }}>
                <thead>
                  <tr style={{ background: themeColor, color: "white" }}>
                    <th style={{ padding: "14px 18px", textAlign: "left", fontSize: 13, fontWeight: 800, width: "35%" }}>Item Description</th>
                    {isColVisible("hsn") && <th style={{ padding: "14px 12px", textAlign: "left", fontSize: 13, fontWeight: 800, width: "10%" }}>{getColName("hsn", "HSN/SAC")}</th>}
                    {isColVisible("gstRate") && <th style={{ padding: "14px 12px", textAlign: "left", fontSize: 13, fontWeight: 800, width: "9%" }}>{getColName("gstRate", "GST Rate")}</th>}
                    {isColVisible("quantity") && <th style={{ padding: "14px 12px", textAlign: "left", fontSize: 13, fontWeight: 800, width: "8%" }}>{getColName("quantity", "Qty")}</th>}
                    {isColVisible("rate") && <th style={{ padding: "14px 12px", textAlign: "left", fontSize: 13, fontWeight: 800, width: "12%" }}>{getColName("rate", "Rate")} ({currencySymbol})</th>}
                    {isColVisible("amount") && <th style={{ padding: "14px 12px", textAlign: "left", fontSize: 13, fontWeight: 800, width: "12%" }}>{getColName("amount", "Amount")}</th>}
                    {isColVisible("cgst") && <th style={{ padding: "14px 12px", textAlign: "left", fontSize: 13, fontWeight: 800, width: "9%" }}>{getColName("cgst", "CGST")}</th>}
                    {isColVisible("sgst") && <th style={{ padding: "14px 12px", textAlign: "left", fontSize: 13, fontWeight: 800, width: "9%" }}>{getColName("sgst", "SGST")}</th>}
                    {isColVisible("total") && <th style={{ padding: "14px 18px", textAlign: "right", fontSize: 13, fontWeight: 800, width: "12%" }}>{getColName("total", "Total")}</th>}
                    <th style={{ padding: "14px 12px", width: "40px" }}></th>
                  </tr>
                </thead>
                <tbody>
                  {items.map((item, idx) => {
                    const rawVal = item.rateExcludingTax * item.qty;
                    const discountAmt = rawVal * (item.discountPercent / 100);
                    const taxable = rawVal - discountAmt;
                    const gstTax = taxable * (item.gstPercent / 100);
                    const cgstVal = gstTax / 2;
                    const sgstVal = gstTax / 2;
                    const lineTotal = taxable + gstTax;

                    return (
                      <tr key={item.id} style={{ borderBottom: "1px solid var(--border)", background: idx % 2 === 0 ? "var(--bg-card)" : "var(--bg-primary)" }}>
                        <td style={{ padding: "14px 18px", verticalAlign: "top" }}>
                          <input
                            type="text" value={item.description} placeholder="Item or Service Name..."
                            onChange={e => { const n = [...items]; n[idx] = { ...n[idx], description: e.target.value }; setItems(n); }}
                            className="input-field" style={{ width: "100%", fontWeight: 700, fontSize: 13.5, marginBottom: 6 }}
                          />
                          <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
                            <button
                              type="button"
                              onClick={() => { const n = [...items]; n[idx] = { ...n[idx], showDesc: !n[idx].showDesc }; setItems(n); }}
                              style={{ border: "none", background: "transparent", color: themeColor, fontSize: 12, fontWeight: 800, cursor: "pointer", display: "inline-flex", alignItems: "center", gap: 4 }}
                            >
                              + {item.showDesc ? "Hide Description" : "Add Description"}
                            </button>
                            <button
                              type="button"
                              onClick={() => { const n = [...items]; n[idx] = { ...n[idx], showImage: !n[idx].showImage }; setItems(n); }}
                              style={{ border: "none", background: "transparent", color: themeColor, fontSize: 12, fontWeight: 800, cursor: "pointer", display: "inline-flex", alignItems: "center", gap: 4 }}
                            >
                              <ImageIcon size={13} /> + {item.showImage ? "Remove Image" : "Add Image"}
                            </button>
                          </div>
                          {item.showDesc && (
                            <textarea
                              placeholder="Detailed item description, specifications or notes..."
                              value={item.extraDesc || ""}
                              onChange={e => { const n = [...items]; n[idx] = { ...n[idx], extraDesc: e.target.value }; setItems(n); }}
                              className="input-field" rows={2} style={{ width: "100%", fontSize: 12.5, marginTop: 8, resize: "vertical" }}
                            />
                          )}
                        </td>
                        {isColVisible("hsn") && (
                          <td style={{ padding: "14px 12px", verticalAlign: "top" }}>
                            <input
                              type="text" value={item.hsn} placeholder="HSN"
                              onChange={e => { const n = [...items]; n[idx] = { ...n[idx], hsn: e.target.value }; setItems(n); }}
                              className="input-field" style={{ width: "100%", fontSize: 12.5 }}
                            />
                          </td>
                        )}
                        {isColVisible("gstRate") && (
                          <td style={{ padding: "14px 12px", verticalAlign: "top" }}>
                            <select
                              value={item.gstPercent}
                              onChange={e => { const n = [...items]; n[idx] = { ...n[idx], gstPercent: Number(e.target.value) }; setItems(n); }}
                              className="input-field" style={{ width: "100%", fontSize: 12.5, padding: "8px 4px" }}
                            >
                              <option value="0">0%</option>
                              <option value="5">5%</option>
                              <option value="12">12%</option>
                              <option value="18">18%</option>
                              <option value="28">28%</option>
                            </select>
                          </td>
                        )}
                        {isColVisible("quantity") && (
                          <td style={{ padding: "14px 12px", verticalAlign: "top" }}>
                            <input
                              type="number" value={item.qty} min="1"
                              onChange={e => { const n = [...items]; n[idx] = { ...n[idx], qty: Number(e.target.value) }; setItems(n); }}
                              className="input-field" style={{ width: "100%", fontSize: 13 }}
                            />
                          </td>
                        )}
                        {isColVisible("rate") && (
                          <td style={{ padding: "14px 12px", verticalAlign: "top" }}>
                            <input
                              type="number" value={item.rateExcludingTax} min="0"
                              onChange={e => { const n = [...items]; n[idx] = { ...n[idx], rateExcludingTax: Number(e.target.value) }; setItems(n); }}
                              className="input-field" style={{ width: "100%", fontSize: 13 }}
                            />
                          </td>
                        )}
                        {isColVisible("amount") && (
                          <td style={{ padding: "14px 12px", verticalAlign: "top", fontSize: 13, fontWeight: 700, color: "var(--text-secondary)", paddingTop: 22 }}>
                            {currencySymbol}{taxable.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                          </td>
                        )}
                        {isColVisible("cgst") && (
                          <td style={{ padding: "14px 12px", verticalAlign: "top", fontSize: 12.5, color: "var(--text-muted)", paddingTop: 22 }}>
                            {currencySymbol}{cgstVal.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                          </td>
                        )}
                        {isColVisible("sgst") && (
                          <td style={{ padding: "14px 12px", verticalAlign: "top", fontSize: 12.5, color: "var(--text-muted)", paddingTop: 22 }}>
                            {currencySymbol}{sgstVal.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                          </td>
                        )}
                        {isColVisible("total") && (
                          <td style={{ padding: "14px 18px", textAlign: "right", verticalAlign: "top", fontSize: 14, fontWeight: 900, color: "var(--text-primary)", paddingTop: 22 }}>
                            {currencySymbol}{lineTotal.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                          </td>
                        )}
                        <td style={{ padding: "14px 12px", verticalAlign: "top", paddingTop: 18 }}>
                          <button
                            type="button"
                            onClick={() => { if (items.length > 1) setItems(items.filter(i => i.id !== item.id)); }}
                            style={{ background: "var(--danger-muted)", border: "none", color: "var(--danger)", width: 32, height: 32, borderRadius: 8, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}
                          >
                            <Trash2 size={14} />
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Refrens Style Dashed Add New Line Button */}
            <div style={{ padding: 14, background: "var(--bg-card)", borderTop: "1px solid var(--border)" }}>
              <button
                type="button"
                onClick={() => setItems([...items, { id: Date.now().toString(), description: "", hsn: "9983", qty: 1, rateExcludingTax: 0, discountPercent: 0, gstPercent: 18 }])}
                style={{
                  width: "100%", padding: "14px", borderRadius: 12, border: `2px dashed ${themeColor}`, background: "var(--bg-primary)",
                  color: themeColor, fontWeight: 800, fontSize: 13.5, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
                  transition: "all 0.2s"
                }}
              >
                <Plus size={18} /> Add New Line Item
              </button>
            </div>

            {/* ─── Show Total in PDF Box (Refrens Bottom Right Card) ─── */}
            <div style={{ padding: 22, borderTop: "1px solid var(--border)", background: "var(--bg-card)", display: "flex", justifyContent: "flex-end" }}>
              <div style={{ width: 380, padding: 20, borderRadius: 16, border: "1px solid var(--border)", background: "var(--bg-primary)", display: "flex", flexDirection: "column", gap: 12 }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: "1px solid var(--border)", paddingBottom: 10 }}>
                  <span style={{ fontSize: 13, fontWeight: 800, color: "var(--text-primary)", display: "flex", alignItems: "center", gap: 6 }}>
                    <Eye size={15} color={themeColor} /> Show Total in PDF
                  </span>
                </div>

                <div style={{ display: "flex", justifyContent: "space-between", fontSize: 13.5, color: "var(--text-secondary)" }}>
                  <span>Amount Subtotal</span>
                  <span style={{ fontWeight: 800, color: "var(--text-primary)" }}>{currencySymbol}{totalTaxableValue.toLocaleString("en-IN", { minimumFractionDigits: 2 })}</span>
                </div>

                {isInterState ? (
                  <div style={{ display: "flex", justifyContent: "space-between", fontSize: 13.5, color: "var(--text-secondary)" }}>
                    <span>IGST Total</span>
                    <span style={{ fontWeight: 800, color: "var(--text-primary)" }}>{currencySymbol}{totalTaxAmount.toLocaleString("en-IN", { minimumFractionDigits: 2 })}</span>
                  </div>
                ) : (
                  <>
                    <div style={{ display: "flex", justifyContent: "space-between", fontSize: 13.5, color: "var(--text-secondary)" }}>
                      <span>SGST Total</span>
                      <span>{currencySymbol}{(totalTaxAmount / 2).toLocaleString("en-IN", { minimumFractionDigits: 2 })}</span>
                    </div>
                    <div style={{ display: "flex", justifyContent: "space-between", fontSize: 13.5, color: "var(--text-secondary)" }}>
                      <span>CGST Total</span>
                      <span>{currencySymbol}{(totalTaxAmount / 2).toLocaleString("en-IN", { minimumFractionDigits: 2 })}</span>
                    </div>
                  </>
                )}

                {!showExtraDiscount ? (
                  <button type="button" onClick={() => setShowExtraDiscount(true)} style={{ border: "none", background: "transparent", color: themeColor, fontSize: 13, fontWeight: 800, cursor: "pointer", textAlign: "left" }}>
                    + Add Discounts ∨
                  </button>
                ) : (
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 8 }}>
                    <span style={{ fontSize: 13, color: "var(--text-secondary)" }}>Additional Discount</span>
                    <input
                      type="number" value={extraDiscount} onChange={e => setExtraDiscount(Number(e.target.value))}
                      className="input-field" style={{ width: 120, padding: "6px 10px", fontSize: 13 }}
                    />
                  </div>
                )}

                <div style={{ borderTop: "2px solid var(--border)", paddingTop: 12, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <span style={{ fontSize: 16, fontWeight: 900, color: "var(--text-primary)" }}>Total ({currencySymbol})</span>
                  <span style={{ fontSize: 22, fontWeight: 900, color: themeColor }}>{currencySymbol}{finalGrandTotal.toLocaleString("en-IN", { minimumFractionDigits: 2 })}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Bottom Grid (Terms & Bank Account) */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>

            {/* Terms & Conditions */}
            <div style={{ padding: 22, borderRadius: 16, border: "1px solid var(--border)", background: "var(--bg-card)", display: "flex", flexDirection: "column", gap: 14 }}>
              <h3 style={{ fontSize: 13, fontWeight: 800, color: "var(--text-muted)", margin: 0, textTransform: "uppercase", letterSpacing: "0.06em" }}>
                Terms & Notes
              </h3>
              <div>
                <label style={{ fontSize: 12, fontWeight: 700, color: "var(--text-secondary)", display: "block", marginBottom: 6 }}>Terms & Conditions</label>
                <textarea value={terms} onChange={e => setTerms(e.target.value)} className="input-field" rows={3} style={{ width: "100%", resize: "vertical" }} />
              </div>
              <div>
                <label style={{ fontSize: 12, fontWeight: 700, color: "var(--text-secondary)", display: "block", marginBottom: 6 }}>Additional Notes</label>
                <textarea value={notes} onChange={e => setNotes(e.target.value)} className="input-field" rows={2} style={{ width: "100%", resize: "vertical" }} />
              </div>
            </div>

            {/* Bank Account & Payment QR */}
            <div style={{ padding: 22, borderRadius: 16, border: "1px solid var(--border)", background: "var(--bg-card)" }}>
              <h3 style={{ fontSize: 13, fontWeight: 800, color: "var(--text-muted)", margin: "0 0 16px 0", textTransform: "uppercase", letterSpacing: "0.06em", display: "flex", alignItems: "center", gap: 6 }}>
                <Landmark size={16} color={themeColor} /> Bank Account & UPI
              </h3>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                <div>
                  <label style={{ fontSize: 12, fontWeight: 700, color: "var(--text-secondary)", display: "block", marginBottom: 4 }}>Bank Name</label>
                  <input type="text" value={bankName} onChange={e => setBankName(e.target.value)} className="input-field" style={{ width: "100%" }} />
                </div>
                <div>
                  <label style={{ fontSize: 12, fontWeight: 700, color: "var(--text-secondary)", display: "block", marginBottom: 4 }}>Account Holder</label>
                  <input type="text" value={bankHolder} onChange={e => setBankHolder(e.target.value)} className="input-field" style={{ width: "100%" }} />
                </div>
                <div>
                  <label style={{ fontSize: 12, fontWeight: 700, color: "var(--text-secondary)", display: "block", marginBottom: 4 }}>Account Number</label>
                  <input type="text" value={bankAccNo} onChange={e => setBankAccNo(e.target.value)} className="input-field" style={{ width: "100%" }} />
                </div>
                <div>
                  <label style={{ fontSize: 12, fontWeight: 700, color: "var(--text-secondary)", display: "block", marginBottom: 4 }}>IFSC Code</label>
                  <input type="text" value={bankIFSC} onChange={e => setBankIFSC(e.target.value)} className="input-field" style={{ width: "100%" }} />
                </div>
                <div style={{ gridColumn: "1 / -1" }}>
                  <label style={{ fontSize: 12, fontWeight: 700, color: "var(--text-secondary)", display: "block", marginBottom: 4 }}>UPI ID (Generates Dynamic Payment QR code)</label>
                  <input type="text" value={upiId} onChange={e => setUpiId(e.target.value)} className="input-field" style={{ width: "100%" }} />
                </div>
              </div>
            </div>
          </div>

          {/* ─── LIVE A4 INVOICE SHEET PREVIEW (ALWAYS RENDERS BELOW FOR REALTIME VIEWING) ─── */}
          <div style={{ marginTop: 30, display: "flex", flexDirection: "column", alignItems: "center", gap: 16 }}>
            <div style={{ width: "100%", maxWidth: 850, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <h3 style={{ fontSize: 18, fontWeight: 900, color: "var(--text-primary)", margin: 0, display: "flex", alignItems: "center", gap: 8 }}>
                <Eye size={20} color={themeColor} /> Live Tax Invoice PDF Preview
              </h3>
              <button
                type="button"
                onClick={handlePrint}
                style={{ padding: "8px 18px", borderRadius: 9, border: "none", background: themeColor, color: "white", fontSize: 13, fontWeight: 800, cursor: "pointer", display: "flex", alignItems: "center", gap: 6 }}
              >
                <Printer size={15} /> Print / Save PDF
              </button>
            </div>

            <div id="invoice-sheet-container" style={{
              width: "100%", maxWidth: 850, background: "#ffffff", color: "#111827", borderRadius: 16, overflow: "hidden",
              boxShadow: "0 10px 40px rgba(0,0,0,0.14)", fontFamily: "'Arial', sans-serif",
              fontSize: 11, lineHeight: "1.5", borderTop: `8px solid ${themeColor}`
            }}>
              {/* Header */}
              <div style={{ padding: "28px 32px 18px", borderBottom: "2px solid #f1f5f9" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                  <div style={{ flex: 1, paddingRight: 20 }}>
                    <div style={{ fontSize: 18, fontWeight: 900, color: "#111827", marginBottom: 4 }}>{sellerName || "Your Business"}</div>
                    <div style={{ fontSize: 11, color: "#6b7280" }}>GSTIN: {sellerGSTIN}</div>
                    <div style={{ fontSize: 11, color: "#6b7280", marginTop: 3, lineHeight: 1.4 }}>{sellerAddress}</div>
                  </div>
                  <div style={{ textAlign: "right", flexShrink: 0 }}>
                    <div style={{ fontSize: 22, fontWeight: 900, color: themeColor, marginBottom: 6 }}>TAX INVOICE</div>
                    <div style={{ fontSize: 11 }}>
                      <div style={{ display: "flex", gap: 10, justifyContent: "flex-end" }}>
                        <span style={{ color: "#9ca3af" }}>Invoice #:</span>
                        <span style={{ fontWeight: 800, color: "#111827" }}>{invoiceNo}</span>
                      </div>
                      <div style={{ display: "flex", gap: 10, justifyContent: "flex-end" }}>
                        <span style={{ color: "#9ca3af" }}>Date:</span>
                        <span style={{ color: "#374151" }}>{invoiceDate}</span>
                      </div>
                      <div style={{ display: "flex", gap: 10, justifyContent: "flex-end" }}>
                        <span style={{ color: "#9ca3af" }}>Due Date:</span>
                        <span style={{ color: "#374151" }}>{dueDate}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Bill To & Supply Details */}
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", borderBottom: "2px solid #f1f5f9" }}>
                <div style={{ padding: "16px 32px", borderRight: "1px solid #f1f5f9" }}>
                  <div style={{ fontSize: 9, fontWeight: 800, color: "#9ca3af", textTransform: "uppercase", letterSpacing: "0.07em", marginBottom: 5 }}>Bill To</div>
                  <div style={{ fontWeight: 800, fontSize: 13.5, color: "#111827" }}>{buyerName || "Client Name"}</div>
                  {buyerGSTIN && <div style={{ fontSize: 11, color: "#6b7280" }}>GSTIN: {buyerGSTIN}</div>}
                  {buyerAddress && <div style={{ fontSize: 11, color: "#6b7280", marginTop: 3 }}>{buyerAddress}</div>}
                </div>
                <div style={{ padding: "16px 32px" }}>
                  <div style={{ fontSize: 9, fontWeight: 800, color: "#9ca3af", textTransform: "uppercase", letterSpacing: "0.07em", marginBottom: 5 }}>Supply Details</div>
                  <div style={{ fontSize: 11, color: "#374151", marginBottom: 3 }}>Place of Supply: <b>{placeOfSupply}</b></div>
                  <div style={{ fontSize: 11, color: "#374151" }}>Tax Type: <b style={{ color: isInterState ? "#7c3aed" : "#0891b2" }}>{isInterState ? "IGST (Inter-state)" : "CGST + SGST (Intra-state)"}</b></div>
                </div>
              </div>

              {/* Items Table */}
              <table style={{ width: "100%", borderCollapse: "collapse" }}>
                <thead>
                  <tr style={{ background: "#f8fafc" }}>
                    <th style={{ padding: "10px 32px", textAlign: "left", fontSize: 9.5, fontWeight: 800, color: "#6b7280", textTransform: "uppercase" }}>Item</th>
                    {isColVisible("hsn") && <th style={{ padding: "10px 8px", textAlign: "left", fontSize: 9.5, fontWeight: 800, color: "#6b7280" }}>{getColName("hsn", "HSN")}</th>}
                    {isColVisible("quantity") && <th style={{ padding: "10px 8px", textAlign: "right", fontSize: 9.5, fontWeight: 800, color: "#6b7280" }}>{getColName("quantity", "Qty")}</th>}
                    {isColVisible("rate") && <th style={{ padding: "10px 8px", textAlign: "right", fontSize: 9.5, fontWeight: 800, color: "#6b7280" }}>{getColName("rate", "Rate")}</th>}
                    {isColVisible("gstRate") && <th style={{ padding: "10px 8px", textAlign: "right", fontSize: 9.5, fontWeight: 800, color: "#6b7280" }}>{getColName("gstRate", "GST")}</th>}
                    {isColVisible("total") && <th style={{ padding: "10px 32px 10px 8px", textAlign: "right", fontSize: 9.5, fontWeight: 800, color: "#6b7280" }}>{getColName("total", "Total")}</th>}
                  </tr>
                </thead>
                <tbody>
                  {processedItems.map((item, idx) => (
                    <tr key={item.id} style={{ background: idx % 2 === 0 ? "#fff" : "#f9fafb" }}>
                      <td style={{ padding: "10px 32px", fontWeight: 700, color: "#111827", fontSize: 11, borderBottom: "1px solid #f3f4f6" }}>
                        {item.description}
                        {item.extraDesc && <div style={{ fontSize: 9.5, color: "#6b7280", fontWeight: 400, marginTop: 2 }}>{item.extraDesc}</div>}
                      </td>
                      {isColVisible("hsn") && <td style={{ padding: "10px 8px", color: "#6b7280", fontSize: 10, borderBottom: "1px solid #f3f4f6" }}>{item.hsn}</td>}
                      {isColVisible("quantity") && <td style={{ padding: "10px 8px", textAlign: "right", color: "#374151", fontSize: 10.5, borderBottom: "1px solid #f3f4f6" }}>{item.qty}</td>}
                      {isColVisible("rate") && <td style={{ padding: "10px 8px", textAlign: "right", color: "#374151", fontSize: 10.5, borderBottom: "1px solid #f3f4f6" }}>{currencySymbol}{item.rateExcludingTax.toLocaleString("en-IN")}</td>}
                      {isColVisible("gstRate") && <td style={{ padding: "10px 8px", textAlign: "right", color: "#374151", fontSize: 10.5, borderBottom: "1px solid #f3f4f6" }}>{item.gstPercent}%</td>}
                      {isColVisible("total") && <td style={{ padding: "10px 32px 10px 8px", textAlign: "right", fontWeight: 800, color: "#111827", fontSize: 11.5, borderBottom: "1px solid #f3f4f6" }}>{currencySymbol}{item.total.toLocaleString("en-IN", { minimumFractionDigits: 2 })}</td>}
                    </tr>
                  ))}
                </tbody>
              </table>

              {/* Totals & Payment Details */}
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", borderTop: "2px solid #e5e7eb" }}>
                <div style={{ padding: "18px 32px", borderRight: "1px solid #e5e7eb" }}>
                  <div style={{ fontSize: 9, fontWeight: 800, color: "#9ca3af", textTransform: "uppercase", marginBottom: 8 }}>Bank Details & UPI</div>
                  <div style={{ display: "flex", gap: 12, alignItems: "flex-start" }}>
                    {upiId && (
                      <img
                        src={`https://api.qrserver.com/v1/create-qr-code/?size=64x64&margin=0&data=${encodeURIComponent(`upi://pay?pa=${upiId}&pn=${encodeURIComponent(bankHolder)}&am=${finalGrandTotal.toFixed(2)}&cu=INR`)}`}
                        alt="UPI QR" style={{ width: 56, height: 56, borderRadius: 6, border: "1px solid #e5e7eb" }}
                      />
                    )}
                    <div style={{ fontSize: 10, color: "#4b5563" }}>
                      <div style={{ fontWeight: 800, color: "#111827" }}>{bankName}</div>
                      <div>A/c: {bankAccNo}</div>
                      <div>IFSC: {bankIFSC}</div>
                      {upiId && <div>UPI: {upiId}</div>}
                    </div>
                  </div>
                </div>

                <div style={{ padding: "18px 32px", display: "flex", flexDirection: "column", gap: 5 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", fontSize: 10.5, color: "#6b7280" }}>
                    <span>Taxable Subtotal</span>
                    <span>{currencySymbol}{totalTaxableValue.toLocaleString("en-IN", { minimumFractionDigits: 2 })}</span>
                  </div>
                  {isInterState ? (
                    <div style={{ display: "flex", justifyContent: "space-between", fontSize: 10.5, color: "#6b7280" }}>
                      <span>IGST</span>
                      <span>{currencySymbol}{totalTaxAmount.toLocaleString("en-IN", { minimumFractionDigits: 2 })}</span>
                    </div>
                  ) : (
                    <>
                      <div style={{ display: "flex", justifyContent: "space-between", fontSize: 10.5, color: "#6b7280" }}>
                        <span>CGST</span>
                        <span>{currencySymbol}{(totalTaxAmount / 2).toLocaleString("en-IN", { minimumFractionDigits: 2 })}</span>
                      </div>
                      <div style={{ display: "flex", justifyContent: "space-between", fontSize: 10.5, color: "#6b7280" }}>
                        <span>SGST</span>
                        <span>{currencySymbol}{(totalTaxAmount / 2).toLocaleString("en-IN", { minimumFractionDigits: 2 })}</span>
                      </div>
                    </>
                  )}
                  {extraDiscount > 0 && (
                    <div style={{ display: "flex", justifyContent: "space-between", fontSize: 10.5, color: "#dc2626" }}>
                      <span>Discount</span>
                      <span>-{currencySymbol}{extraDiscount.toLocaleString("en-IN", { minimumFractionDigits: 2 })}</span>
                    </div>
                  )}
                  <div style={{ borderTop: "2px solid #111827", marginTop: 6, paddingTop: 6, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <span style={{ fontSize: 11, fontWeight: 900, color: "#111827" }}>Grand Total</span>
                    <span style={{ fontSize: 16, fontWeight: 900, color: themeColor }}>{currencySymbol}{finalGrandTotal.toLocaleString("en-IN", { minimumFractionDigits: 2 })}</span>
                  </div>
                  <div style={{ fontSize: 9, color: "#9ca3af", fontStyle: "italic" }}>{numberToIndianWords(finalGrandTotal)}</div>
                </div>
              </div>

              {/* Terms & Footer */}
              {terms && (
                <div style={{ padding: "14px 32px", background: "#f8fafc", borderTop: "1px solid #e5e7eb" }}>
                  <div style={{ fontSize: 9, fontWeight: 800, color: "#9ca3af", textTransform: "uppercase", marginBottom: 3 }}>Terms & Conditions</div>
                  <div style={{ fontSize: 9.5, color: "#6b7280", whiteSpace: "pre-line" }}>{terms}</div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ─── TAB 2: INVOICE HISTORY ─── */}
      {activeTab === "history" && (
        <div style={{ padding: 26, borderRadius: 16, border: "1px solid var(--border)", background: "var(--bg-card)" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
            <h3 style={{ fontSize: 18, fontWeight: 800, color: "var(--text-primary)", margin: 0 }}>Saved Invoice History</h3>
            <span style={{ fontSize: 12, color: "var(--text-secondary)", background: "var(--bg-primary)", padding: "4px 12px", borderRadius: 20, fontWeight: 600, border: "1px solid var(--border)" }}>{history.length} saved</span>
          </div>

          {history.length === 0 ? (
            <div style={{ padding: "60px 24px", textAlign: "center", color: "var(--text-secondary)" }}>
              <FileText size={40} style={{ opacity: 0.2, display: "block", margin: "0 auto 14px" }} />
              <p style={{ margin: 0, fontSize: 14 }}>No saved invoices yet. Create and save an invoice to see it here.</p>
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              {history.map(item => {
                const total = item.items.reduce((acc, curr) => {
                  const raw = curr.rateExcludingTax * curr.qty;
                  const disc = raw * (curr.discountPercent / 100);
                  return acc + (raw - disc) * (1 + curr.gstPercent / 100);
                }, 0) - (item.extraDiscount || 0);

                return (
                  <div key={item.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "16px 20px", borderRadius: 12, border: "1px solid var(--border)", background: "var(--bg-primary)" }}>
                    <div style={{ display: "flex", gap: 16, alignItems: "center", minWidth: 0 }}>
                      <div style={{ width: 42, height: 42, borderRadius: 10, background: "var(--accent-muted)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                        <FileText size={18} color={themeColor} />
                      </div>
                      <div style={{ minWidth: 0 }}>
                        <div style={{ fontSize: 14.5, fontWeight: 800, color: "var(--text-primary)", marginBottom: 3 }}>{item.invoiceNo}</div>
                        <div style={{ display: "flex", gap: 12, fontSize: 12.5, color: "var(--text-secondary)", flexWrap: "wrap" }}>
                          <span>{item.invoiceDate}</span>
                          <span>•</span>
                          <span style={{ fontWeight: 600 }}>{item.buyerName}</span>
                          <span>•</span>
                          <span style={{ fontWeight: 800, color: "var(--success)" }}>₹{total.toLocaleString("en-IN", { minimumFractionDigits: 2 })}</span>
                        </div>
                      </div>
                    </div>
                    <div style={{ display: "flex", gap: 8, flexShrink: 0, marginLeft: 12 }}>
                      <button type="button" onClick={() => loadFromHistory(item)} style={{ padding: "8px 16px", borderRadius: 8, border: "none", cursor: "pointer", fontWeight: 700, fontSize: 12.5, background: themeColor, color: "white", display: "inline-flex", alignItems: "center", gap: 5 }}>
                        <Edit3 size={13} /> Open & Edit
                      </button>
                      <button type="button" onClick={() => { if (confirm("Delete this invoice from history?")) deleteFromHistory(item.id); }} style={{ padding: "8px 12px", borderRadius: 8, border: "1px solid var(--danger-muted)", cursor: "pointer", fontWeight: 700, fontSize: 12.5, background: "var(--danger-muted)", color: "var(--danger)" }}>
                        <Trash2 size={13} />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* ─── TAB 3: GST CALCULATOR ─── */}
      {activeTab === "calculator" && (
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 24 }}>
          <div style={{ padding: 24, borderRadius: 14, border: "1px solid var(--border)", background: "var(--bg-card)" }}>
            <h3 style={{ fontSize: 16, fontWeight: 800, color: "var(--text-primary)", margin: "0 0 20px 0", display: "flex", alignItems: "center", gap: 8 }}>
              <Calculator size={17} color={themeColor} /> Quick GST Calculator
            </h3>
            <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              <div>
                <label style={{ fontSize: 11, fontWeight: 700, color: "var(--text-muted)", display: "block", marginBottom: 5, textTransform: "uppercase" }}>Product Category</label>
                <select value={inputs.productCategory} onChange={e => setInputs(prev => ({ ...prev, productCategory: e.target.value }))} className="input-field" style={{ width: "100%" }}>
                  {Object.keys(GST_RATES).map(cat => <option key={cat} value={cat}>{cat}</option>)}
                </select>
              </div>
              <div>
                <label style={{ fontSize: 11, fontWeight: 700, color: "var(--text-muted)", display: "block", marginBottom: 5, textTransform: "uppercase" }}>Selling Price (MRP incl. GST)</label>
                <input type="number" value={inputs.sellingPrice} onChange={e => setInputs(prev => ({ ...prev, sellingPrice: Number(e.target.value) }))} className="input-field" style={{ width: "100%" }} />
              </div>
              <div>
                <label style={{ fontSize: 11, fontWeight: 700, color: "var(--text-muted)", display: "block", marginBottom: 5, textTransform: "uppercase" }}>Cost of Goods (COGS)</label>
                <input type="number" value={inputs.cogs} onChange={e => setInputs(prev => ({ ...prev, cogs: Number(e.target.value) }))} className="input-field" style={{ width: "100%" }} />
              </div>
            </div>
          </div>

          <div style={{ padding: 24, borderRadius: 14, border: "1px solid var(--border)", background: "var(--bg-card)" }}>
            <h3 style={{ fontSize: 16, fontWeight: 800, color: "var(--text-primary)", margin: "0 0 20px 0" }}>GST Unit Economics Breakdown</h3>
            {(() => {
              const res = calculate(inputs);
              const rows = [
                { label: "Selling Price (MRP)", val: res.unitEconomics.revenue, color: "var(--text-primary)", sign: "" },
                { label: `GST Output (${res.gstRate}%)`, val: res.unitEconomics.gstCollected, color: "var(--warning)", sign: "−" },
                { label: "Cost of Goods (COGS)", val: res.unitEconomics.cogs, color: "var(--danger)", sign: "−" },
                { label: "Net Profit / Loss", val: res.netProfit, color: res.netProfit >= 0 ? "var(--success)" : "var(--danger)", sign: "", bold: true }
              ];
              return (
                <div style={{ display: "flex", flexDirection: "column", gap: 0 }}>
                  {rows.map((row, i) => (
                    <div key={i} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "12px 0", borderBottom: i < rows.length - 1 ? "1px solid var(--border)" : "none" }}>
                      <span style={{ fontSize: 13.5, color: "var(--text-secondary)", fontWeight: row.bold ? 800 : 500 }}>{row.label}</span>
                      <span style={{ fontSize: row.bold ? 18 : 14, fontWeight: row.bold ? 900 : 600, color: row.color }}>
                        {row.sign}{fmt(Math.abs(row.val))}
                      </span>
                    </div>
                  ))}
                  <div style={{ marginTop: 16, padding: "12px 16px", borderRadius: 10, background: "var(--accent-muted)", textAlign: "center" }}>
                    <div style={{ fontSize: 11, fontWeight: 700, color: "var(--text-secondary)", marginBottom: 2, textTransform: "uppercase" }}>GST Rate Applied</div>
                    <div style={{ fontSize: 24, fontWeight: 900, color: themeColor }}>{res.gstRate}%</div>
                  </div>
                </div>
              );
            })()}
          </div>
        </div>
      )}

      {/* ─── REFRENS "CUSTOMIZE COLUMNS & FORMULAS 💡" MODAL ─── */}
      {showColumnModal && (
        <div
          onClick={(e) => {
            if (e.target === e.currentTarget) setShowColumnModal(false);
          }}
          style={{
            position: "fixed", top: 0, left: 0, right: 0, bottom: 0, background: "rgba(0,0,0,0.65)", backdropFilter: "blur(6px)",
            display: "flex", alignItems: "center", justifyContent: "center", zIndex: 999999, padding: 20
          }}
        >
          <div style={{
            background: "var(--bg-card)", borderRadius: 18, border: "1px solid var(--border)",
            width: "100%", maxWidth: 620, padding: 26, boxShadow: "0 25px 50px -12px rgba(0,0,0,0.4)",
            display: "flex", flexDirection: "column", gap: 20
          }}>
            {/* Modal Header */}
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <h3 style={{ fontSize: 19, fontWeight: 900, color: "var(--text-primary)", margin: 0, display: "flex", alignItems: "center", gap: 8 }}>
                Customize Columns & Formulas 💡
              </h3>
              <button
                type="button"
                onClick={() => setShowColumnModal(false)}
                style={{ border: "none", background: "transparent", color: "var(--text-muted)", cursor: "pointer", padding: 4 }}
              >
                <X size={22} />
              </button>
            </div>

            {/* Column List */}
            <div style={{ display: "flex", flexDirection: "column", gap: 10, maxHeight: 380, overflowY: "auto", paddingRight: 4 }}>
              {columns.map((col, idx) => (
                <div key={col.id} style={{
                  display: "flex", alignItems: "center", gap: 12, padding: "10px 14px", borderRadius: 12,
                  border: "1px solid var(--border)", background: "var(--bg-primary)"
                }}>
                  <GripVertical size={16} color="var(--text-muted)" style={{ cursor: "grab" }} />
                  
                  {/* Name Input */}
                  <input
                    type="text"
                    value={col.name}
                    onChange={e => {
                      const updated = [...columns];
                      updated[idx].name = e.target.value;
                      setColumns(updated);
                    }}
                    className="input-field"
                    style={{ flex: 1, fontSize: 13, fontWeight: 700, padding: "6px 10px" }}
                  />

                  {/* Formula / Format badge */}
                  <div style={{ fontSize: 11, fontWeight: 600, color: "var(--text-muted)", width: 140, textAlign: "right" }}>
                    {col.formula}
                  </div>

                  {/* Eye Visibility Toggle */}
                  <button
                    type="button"
                    onClick={() => {
                      const updated = [...columns];
                      updated[idx].visible = !updated[idx].visible;
                      setColumns(updated);
                    }}
                    style={{ border: "none", background: "transparent", cursor: "pointer", color: col.visible ? themeColor : "var(--text-muted)", padding: 4 }}
                  >
                    {col.visible ? <Eye size={18} /> : <EyeOff size={18} />}
                  </button>
                </div>
              ))}
            </div>

            {/* Live Column Header Preview */}
            <div style={{
              background: themeColor, color: "white", padding: "10px 14px", borderRadius: 10, fontSize: 11, fontWeight: 800,
              display: "flex", gap: 12, overflowX: "auto", whiteSpace: "nowrap"
            }}>
              <span>Item</span>
              {columns.filter(c => c.visible).map(c => (
                <span key={c.id}>• {c.name}</span>
              ))}
            </div>

            {/* Modal Action Buttons */}
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", paddingTop: 6, borderTop: "1px solid var(--border)" }}>
              <button
                type="button"
                onClick={() => setColumns(DEFAULT_COLUMNS)}
                style={{ padding: "9px 14px", borderRadius: 9, border: "1px solid var(--border)", background: "transparent", color: "var(--text-secondary)", fontWeight: 700, fontSize: 12, cursor: "pointer", display: "flex", alignItems: "center", gap: 6 }}
              >
                <RotateCcw size={13} /> Reset to Default
              </button>

              <div style={{ display: "flex", gap: 10 }}>
                <button
                  type="button"
                  onClick={() => setShowColumnModal(false)}
                  style={{ padding: "9px 18px", borderRadius: 9, border: "1px solid var(--border)", background: "transparent", color: "var(--text-secondary)", fontWeight: 700, fontSize: 12.5, cursor: "pointer" }}
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={() => setShowColumnModal(false)}
                  style={{ padding: "9px 22px", borderRadius: 9, border: "none", background: themeColor, color: "white", fontWeight: 900, fontSize: 12.5, cursor: "pointer" }}
                >
                  Save Changes
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Print Styles */}
      <style>{`
        @media print {
          body > * { display: none !important; }
          #invoice-sheet-container {
            display: block !important;
            position: fixed !important;
            inset: 0 !important;
            box-shadow: none !important;
            border-radius: 0 !important;
          }
          #invoice-sheet-container * { visibility: visible !important; }
        }
        .input-field:focus {
          outline: none;
          border-color: ${themeColor} !important;
          box-shadow: 0 0 0 2.5px rgba(124, 58, 237, 0.15);
        }
      `}</style>
    </div>
  );
}
