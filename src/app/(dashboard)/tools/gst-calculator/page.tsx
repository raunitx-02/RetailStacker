"use client";

import { useState, useRef, useEffect } from "react";
import {
  Calculator, IndianRupee, Package, Globe, AlertTriangle, CheckCircle,
  Info, Download, Plus, Trash2, Printer, FileText, User, MapPin,
  Building2, Landmark, Check, HelpCircle, ArrowRight
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

// Import BCD rates by origin
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
  const taxableValue = inp.sellingPrice - gstOutput;

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

// Indian Rupee word converter helper
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
  rateExcludingTax: number; // Unit rate excluding tax
  discountPercent: number; // Discount %
  gstPercent: number; // GST %
}

export default function GSTCalculatorPage() {
  const [activeTab, setActiveTab] = useState<"calculator" | "invoice">("invoice");

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

  const setInp = (key: keyof CalcInputs, val: any) => setInputs(p => ({ ...p, [key]: val }));
  const result = calculate(inputs);
  const gstInfo = GST_RATES[inputs.productCategory];

  const breakdown = [
    { label: "Selling Price (MRP)", value: inputs.sellingPrice, color: "var(--accent)", positive: true },
    { label: `GST Collected (${result.gstRate}%)`, value: -result.gstOutput, color: "var(--warning)", positive: false },
    { label: "Net Revenue", value: inputs.sellingPrice - result.gstOutput, color: "var(--text-primary)", positive: true },
    { label: inputs.isDomestic ? "COGS" : "Landed Cost (after BCD+IGST)", value: -(inputs.isDomestic ? inputs.cogs : result.landedCost), color: "var(--danger)", positive: false },
    { label: "FBA Fee", value: -inputs.fbaFee, color: "var(--danger)", positive: false },
    { label: `Amazon Referral (${inputs.referralFeeRate}%)`, value: -result.referralFee, color: "var(--danger)", positive: false },
    { label: "Ad Spend / Unit", value: -inputs.adSpend, color: "var(--warning)", positive: false },
    { label: "Net GST Payable", value: -result.netGSTPay, color: "var(--warning)", positive: false },
    { label: "Net Profit / Unit", value: result.netProfit, color: result.netProfit > 0 ? "var(--success)" : "var(--danger)", positive: result.netProfit > 0, bold: true },
  ];

  // ─── Invoice State (Populated with user image sample data) ──────────────────
  const [sellerName, setSellerName] = useState("NEON 10");
  const [sellerGSTIN, setSellerGSTIN] = useState("24AJHPC5439P1ZX");
  const [sellerPAN, setSellerPAN] = useState("AJHPC5439P");
  const [sellerCIN, setSellerCIN] = useState("GJ-AD2-216477");
  const [sellerMobile, setSellerMobile] = useState("+91 98765 43210");
  const [sellerEmail, setSellerEmail] = useState("cherishdental@gmail.com");
  const [sellerInsur, setSellerInsur] = useState("300514883600003");
  const [sellerAddress, setSellerAddress] = useState("PLOT NO 92-94, ARIHANT INDUSTRIAL ESTATE BLOCK NO 55, NEW BLOCK NO. 143, MOTA BORASARA, MAGROL, DIST-SURAT, SURAT 394110");
  const [sellerState, setSellerState] = useState("Gujarat");
  const [logoType, setLogoType] = useState<"badge" | "image">("badge");
  const [logoBadgeTextTop, setLogoBadgeTextTop] = useState("NEON");
  const [logoBadgeTextBottom, setLogoBadgeTextBottom] = useState("10");
  const [logoBadgeColor, setLogoBadgeColor] = useState("#058b8c");
  const [logoBadgeBorderColor, setLogoBadgeBorderColor] = useState("#005a5b");
  const [logoImageSrc, setLogoImageSrc] = useState("");

  const [buyerName, setBuyerName] = useState("CHERISH DENTAL SOLUTION");
  const [buyerGSTIN, setBuyerGSTIN] = useState("24AJHPC5439P1ZX");
  const [buyerDL, setBuyerDL] = useState("GJ-AD2-216476");
  const [buyerCustCode, setBuyerCustCode] = useState("GJ-AD2-216477");
  const [buyerAddress, setBuyerAddress] = useState("B-301, RAJYASH REEVA, NEAR VASNA PUMPING STATION B/H G.B.SHAH COLLAGE, AHMEDABAD-GUJARAT");
  const [buyerState, setBuyerState] = useState("Gujarat");
  const [placeOfSupply, setPlaceOfSupply] = useState("Gujarat");

  const [shippedToName, setShippedToName] = useState("Boyle, Connelly and Mertz");
  const [shippedToAddress, setShippedToAddress] = useState("A 504, PUSPRAJ RESIDENCY, NR. GOTA BRIDGE, CHANDLODIYA, AHMEDABAD - 382481");
  const [shippedToPhone, setShippedToPhone] = useState("9904381155");
  const [shippedToEmail, setShippedToEmail] = useState("DENTASCAN14@GMAIL.COM");

  const [shippedFromName, setShippedFromName] = useState("Boyle, Connelly and Mertz");
  const [shippedFromAddress, setShippedFromAddress] = useState("A 504, PUSPRAJ RESIDENCY, NR. GOTA BRIDGE, CHANDLODIYA, AHMEDABAD - 382481");
  const [shippedFromPhone, setShippedFromPhone] = useState("9904381155");
  const [shippedFromEmail, setShippedFromEmail] = useState("DENTASCAN14@GMAIL.COM");

  const [invoiceNo, setInvoiceNo] = useState("TI/DS/005/22-23");
  const [invoiceDate, setInvoiceDate] = useState("2025-08-29");
  const [dueDate, setDueDate] = useState("2025-08-29");
  const [deliveryNote, setDeliveryNote] = useState("DN/DS/005/22-25");
  const [destination, setDestination] = useState("AHMEDABAD-GUJARAT");
  const [termsOfDelivery, setTermsOfDelivery] = useState("1. FRIEGHT - PAID");
  const [buyerOrderNo, setBuyerOrderNo] = useState("AD290325079652Q");

  const [transMode, setTransMode] = useState("24AJHPC5439P1ZX");
  const [transporter, setTransporter] = useState("01AABCD3611Q1ZW");
  const [transId, setTransId] = useState("GJ-AD2-216476");
  const [challanDate, setChallanDate] = useState("2025-04-12");
  const [challanNo, setChallanNo] = useState("DLCH-78842942424");
  const [vehicleType, setVehicleType] = useState("REGULAR");
  const [vehicleNo, setVehicleNo] = useState("GJ05SB8723");

  const [showEInvoice, setShowEInvoice] = useState(true);
  const [irnHash, setIrnHash] = useState("e08a12726f554ef03118f2b84ffc15960ca59a261773ebfae625a9877c9e9052");
  const [ackNo, setAckNo] = useState("e08a12726f554ef03118f2b84ffc15960ca59a261773ebfa");
  const [ackDate, setAckDate] = useState("2025-08-29");
  const [ewbNo, setEwbNo] = useState("85929042003204020424");
  const [ewbDate, setEwbDate] = useState("2025-08-29");
  const [ewbValidTill, setEwbValidTill] = useState("2025-08-29");
  const [cancelledDate, setCancelledDate] = useState("2025-08-29");
  const [ewbCancelledDate, setEwbCancelledDate] = useState("2025-08-29");

  const [bankName, setBankName] = useState("HDFC Bank");
  const [bankHolder, setBankHolder] = useState("Foobar Labs");
  const [bankAccNo, setBankAccNo] = useState("45366287987");
  const [bankIFSC, setBankIFSC] = useState("HDFC0018159");
  const [bankType, setBankType] = useState("Savings");
  const [upiId, setUpiId] = useState("rockdecorddesginstudio@okhdfcbank");

  const [termsList, setTermsList] = useState([
    "Please pay within 15 days from the date of invoice, overdue interest @ 14% will be charged on delayed payments.",
    "Please quote invoice number when remitting funds."
  ]);
  const [declaration, setDeclaration] = useState(
    "In respect of the above equipments covered therein, no credit of the additional duty of customs levied under sub-section(5) of section 3 of the Customs Tariff Act, 1975 shall be admissible. We declare that this invoice shows the actual price of goods described and that all particulars are true and correct."
  );
  const [additionalNotes, setAdditionalNotes] = useState(
    "In respect of the above equipments covered therein, no credit of the additional duty of customs levied under sub-section(5) of section 3 of the Customs Tariff Act, 1975 shall be admissible. We declare that this invoice shows the actual price of goods described and that all particulars are true and correct."
  );

  const [companyDL1, setCompanyDL1] = useState("GJ-AD2-215522");
  const [companyDL2, setCompanyDL2] = useState("GJ-AD2-215522");
  const [companyGST, setCompanyGST] = useState("24AYNPJ6886E1Z0");

  const [items, setItems] = useState<InvoiceItem[]>([
    {
      id: "1",
      description: "RN/AC/MC/RUNYES SEA 23/ STERILIZER MOD. FENG-23 B 01 NO. 99500.00WITH WATER DISTILLER(Batch : 0223-DR00D2212116) Batch : 0323-00019060STD.WARRANTY-12 MONTHS",
      hsn: "90184900",
      qty: 10,
      rateExcludingTax: 33898.31,
      discountPercent: 5,
      gstPercent: 18
    },
    {
      id: "2",
      description: "RN/AC/MC/RUNYES SEA 23",
      hsn: "90184900",
      qty: 10,
      rateExcludingTax: 33898.31,
      discountPercent: 5,
      gstPercent: 18
    },
    {
      id: "3",
      description: "RN/AC/MC/RUNYES SEA 23/ STERILIZER MOD. FENG-23 B 01",
      hsn: "84192090",
      qty: 10,
      rateExcludingTax: 9950.00,
      discountPercent: 5,
      gstPercent: 18
    }
  ]);

  const addItem = () => {
    setItems([
      ...items,
      {
        id: Date.now().toString(),
        description: "New Dental Supply Item",
        hsn: "90184900",
        qty: 1,
        rateExcludingTax: 5000,
        discountPercent: 0,
        gstPercent: 18
      }
    ]);
  };

  const deleteItem = (id: string) => {
    if (items.length <= 1) return;
    setItems(items.filter(i => i.id !== id));
  };

  const updateItem = (id: string, key: keyof InvoiceItem, val: any) => {
    setItems(items.map(item => {
      if (item.id === id) {
        return { ...item, [key]: val };
      }
      return item;
    }));
  };

  // Live E-Invoice Calculations
  const isInterState = sellerState !== placeOfSupply;

  let totalTaxableValue = 0;
  let totalDiscountVal = 0;
  let totalCGST = 0;
  let totalSGST = 0;
  let totalIGST = 0;
  let totalGrandTotal = 0;
  let totalItemsQty = 0;

  // Track Tax Rate & HSN Summaries
  const hsnMap: Record<string, { taxable: number; cgst: number; sgst: number; igst: number; rate: number }> = {};
  const taxRateMap: Record<number, { taxable: number; cgst: number; sgst: number; igst: number }> = {};

  const calculatedItems = items.map(item => {
    const rawSubtotal = item.rateExcludingTax * item.qty;
    const discountAmount = rawSubtotal * (item.discountPercent / 100);
    const taxableValue = rawSubtotal - discountAmount;
    const taxAmount = taxableValue * (item.gstPercent / 100);
    const itemTotal = taxableValue + taxAmount;

    totalTaxableValue += taxableValue;
    totalDiscountVal += discountAmount;
    totalGrandTotal += itemTotal;
    totalItemsQty += item.qty;

    let cgst = 0, sgst = 0, igst = 0;
    if (isInterState) {
      igst = taxAmount;
      totalIGST += taxAmount;
    } else {
      cgst = taxAmount / 2;
      sgst = taxAmount / 2;
      totalCGST += cgst;
      totalSGST += sgst;
    }

    // Add to HSN summary
    if (!hsnMap[item.hsn]) {
      hsnMap[item.hsn] = { taxable: 0, cgst: 0, sgst: 0, igst: 0, rate: item.gstPercent };
    }
    hsnMap[item.hsn].taxable += taxableValue;
    hsnMap[item.hsn].cgst += cgst;
    hsnMap[item.hsn].sgst += sgst;
    hsnMap[item.hsn].igst += igst;

    // Add to Tax rate summary
    if (!taxRateMap[item.gstPercent]) {
      taxRateMap[item.gstPercent] = { taxable: 0, cgst: 0, sgst: 0, igst: 0 };
    }
    taxRateMap[item.gstPercent].taxable += taxableValue;
    taxRateMap[item.gstPercent].cgst += cgst;
    taxRateMap[item.gstPercent].sgst += sgst;
    taxRateMap[item.gstPercent].igst += igst;

    return {
      ...item,
      taxableValue,
      discountAmount,
      taxAmount,
      cgst,
      sgst,
      igst,
      itemTotal
    };
  });

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setLogoImageSrc(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  // Safe QR Intent generation
  const upiQrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=160x160&margin=5&data=${encodeURIComponent(
    `upi://pay?pa=${upiId}&pn=${encodeURIComponent(bankHolder)}&am=${totalGrandTotal.toFixed(2)}&cu=INR`
  )}`;

  return (
    <div>
      {/* Precision Print Grid Overlay Stylesheet */}
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
            background: white !important;
            color: black !important;
            padding: 0 !important;
            margin: 0 !important;
            box-shadow: none !important;
            border: none !important;
          }
          aside, header, nav, button, .no-print, .tabs-wrapper {
            display: none !important;
          }
        }

        /* Input fields layout styling */
        .collapsible-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 14px 18px;
          background: var(--bg-secondary);
          border-radius: 12px;
          border: 1px solid var(--border);
          cursor: pointer;
          font-weight: 700;
          font-size: 14px;
          transition: all 0.2s;
          margin-bottom: 8px;
        }
        .collapsible-header:hover {
          background: var(--border-muted);
        }
        .collapsible-content {
          padding: 18px;
          border-radius: 12px;
          border: 1px solid var(--border);
          background: var(--bg-card);
          margin-bottom: 16px;
          display: flex;
          flex-direction: column;
          gap: 12px;
        }
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: var(--border);
          border-radius: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: var(--text-muted);
        }
      `}</style>

      {/* Header */}
      <div className="page-header no-print">
        <div>
          <h1 className="page-title">GSTR-Compliant B2B E-Invoice Builder</h1>
          <p className="page-subtitle">Fully density-matched tax invoice generator matching official Indian B2B standards with live QR generation</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="no-print tabs-wrapper" style={{
        display: "flex",
        gap: 8,
        padding: 4,
        background: "var(--bg-secondary)",
        borderRadius: 12,
        marginBottom: 24,
        border: "1px solid var(--border)",
        maxWidth: 500
      }}>
        <button
          onClick={() => setActiveTab("invoice")}
          style={{
            flex: 1,
            padding: "10px 16px",
            borderRadius: 8,
            border: "none",
            background: activeTab === "invoice" ? "var(--accent)" : "transparent",
            color: activeTab === "invoice" ? "white" : "var(--text-secondary)",
            fontWeight: 700,
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: 8,
            transition: "all 0.2s"
          }}
        >
          <FileText size={16} /> GSTR B2B Tax Invoice
        </button>
        <button
          onClick={() => setActiveTab("calculator")}
          style={{
            flex: 1,
            padding: "10px 16px",
            borderRadius: 8,
            border: "none",
            background: activeTab === "calculator" ? "var(--accent)" : "transparent",
            color: activeTab === "calculator" ? "white" : "var(--text-secondary)",
            fontWeight: 700,
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: 8,
            transition: "all 0.2s"
          }}
        >
          <Calculator size={16} /> Standard Duty Calculator
        </button>
      </div>

      {/* ─── TAB 1: GSTR B2B E-INVOICE GENERATOR ─── */}
      {activeTab === "invoice" && (
        <div style={{ display: "grid", gridTemplateColumns: "1.1fr 1.3fr", gap: 24, alignItems: "start" }}>
          
          {/* Inputs Column */}
          <div className="no-print" style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            
            {/* Action buttons */}
            <div style={{ display: "flex", gap: 12, marginBottom: 10 }}>
              <button onClick={handlePrint} className="btn-accent" style={{ flex: 1, padding: "12px 20px", display: "flex", alignItems: "center", justifyContent: "center", gap: 8, boxShadow: "0 4px 14px var(--accent-glow)" }}>
                <Printer size={16} /> Print / Save E-Invoice PDF
              </button>
            </div>

            {/* Collapsible section 1: Header Company & QR Info */}
            <div>
              <div className="collapsible-header">
                <span style={{ display: "flex", alignItems: "center", gap: 8 }}><Building2 size={16} color="var(--accent)" /> 1. Company Profile & E-Invoice Info</span>
              </div>
              <div className="collapsible-content">
                <div>
                  <InputLabel>Company Name (Bilingual/Hindi/English)</InputLabel>
                  <input type="text" className="input-field" value={sellerName} onChange={e => setSellerName(e.target.value)} />
                </div>

                {/* Brand Logo Customizer Dashboard */}
                <div style={{ background: "var(--bg-secondary)", borderRadius: 10, padding: 14, border: "1px dashed var(--border)", margin: "10px 0" }}>
                  <div style={{ fontSize: 12, fontWeight: 700, marginBottom: 10, color: "var(--accent)", display: "flex", alignItems: "center", gap: 6 }}>
                    <Globe size={14} /> Brand Logo Settings
                  </div>
                  
                  <div style={{ display: "flex", gap: 10, marginBottom: 12 }}>
                    <button
                      type="button"
                      onClick={() => setLogoType("badge")}
                      style={{
                        flex: 1, padding: "6px 12px", borderRadius: 6, fontSize: 11, fontWeight: 700, border: "1px solid var(--border)",
                        background: logoType === "badge" ? "var(--accent)" : "transparent",
                        color: logoType === "badge" ? "white" : "var(--text-secondary)", cursor: "pointer"
                      }}
                    >
                      Bilingual Circle Badge
                    </button>
                    <button
                      type="button"
                      onClick={() => setLogoType("image")}
                      style={{
                        flex: 1, padding: "6px 12px", borderRadius: 6, fontSize: 11, fontWeight: 700, border: "1px solid var(--border)",
                        background: logoType === "image" ? "var(--accent)" : "transparent",
                        color: logoType === "image" ? "white" : "var(--text-secondary)", cursor: "pointer"
                      }}
                    >
                      Custom Uploaded Image
                    </button>
                  </div>

                  {logoType === "badge" ? (
                    <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
                        <div>
                          <InputLabel>Badge Top Text</InputLabel>
                          <input type="text" className="input-field" style={{ fontSize: 12, padding: "6px 10px" }} value={logoBadgeTextTop} onChange={e => setLogoBadgeTextTop(e.target.value)} />
                        </div>
                        <div>
                          <InputLabel>Badge Bottom Text</InputLabel>
                          <input type="text" className="input-field" style={{ fontSize: 12, padding: "6px 10px" }} value={logoBadgeTextBottom} onChange={e => setLogoBadgeTextBottom(e.target.value)} />
                        </div>
                      </div>
                      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
                        <div>
                          <InputLabel>Background Color</InputLabel>
                          <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
                            <input type="color" style={{ width: 28, height: 28, padding: 0, border: "none", borderRadius: 4, cursor: "pointer" }} value={logoBadgeColor} onChange={e => setLogoBadgeColor(e.target.value)} />
                            <input type="text" className="input-field" style={{ fontSize: 11, padding: "4px 8px", fontFamily: "monospace" }} value={logoBadgeColor} onChange={e => setLogoBadgeColor(e.target.value)} />
                          </div>
                        </div>
                        <div>
                          <InputLabel>Border Color</InputLabel>
                          <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
                            <input type="color" style={{ width: 28, height: 28, padding: 0, border: "none", borderRadius: 4, cursor: "pointer" }} value={logoBadgeBorderColor} onChange={e => setLogoBadgeBorderColor(e.target.value)} />
                            <input type="text" className="input-field" style={{ fontSize: 11, padding: "4px 8px", fontFamily: "monospace" }} value={logoBadgeBorderColor} onChange={e => setLogoBadgeBorderColor(e.target.value)} />
                          </div>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                      <InputLabel>Upload Logo Image (PNG / JPEG)</InputLabel>
                      <input type="file" accept="image/*" className="input-field" style={{ fontSize: 11, padding: "6px 10px" }} onChange={handleLogoUpload} />
                      {logoImageSrc && (
                        <div style={{ display: "flex", alignItems: "center", gap: 10, marginTop: 4 }}>
                          <img src={logoImageSrc} alt="Preview" style={{ width: 40, height: 40, borderRadius: 4, objectFit: "contain", border: "1px solid var(--border)" }} />
                          <span style={{ fontSize: 11, color: "var(--success)", fontWeight: 600 }}>✓ Uploaded successfully</span>
                        </div>
                      )}
                    </div>
                  )}
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
                  <div>
                    <InputLabel>Company GSTIN</InputLabel>
                    <input type="text" className="input-field" value={sellerGSTIN} onChange={e => setSellerGSTIN(e.target.value)} />
                  </div>
                  <div>
                    <InputLabel>Company PAN No</InputLabel>
                    <input type="text" className="input-field" value={sellerPAN} onChange={e => setSellerPAN(e.target.value)} />
                  </div>
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
                  <div>
                    <InputLabel>Company CIN</InputLabel>
                    <input type="text" className="input-field" value={sellerCIN} onChange={e => setSellerCIN(e.target.value)} />
                  </div>
                  <div>
                    <InputLabel>Insurance Policy No</InputLabel>
                    <input type="text" className="input-field" value={sellerInsur} onChange={e => setSellerInsur(e.target.value)} />
                  </div>
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
                  <div>
                    <InputLabel>Contact Mobile (Mo)</InputLabel>
                    <input type="text" className="input-field" value={sellerMobile} onChange={e => setSellerMobile(e.target.value)} />
                  </div>
                  <div>
                    <InputLabel>Company Email</InputLabel>
                    <input type="text" className="input-field" value={sellerEmail} onChange={e => setSellerEmail(e.target.value)} />
                  </div>
                </div>
                <div>
                  <InputLabel>Full Address</InputLabel>
                  <textarea className="input-field" rows={2} style={{ resize: "none" }} value={sellerAddress} onChange={e => setSellerAddress(e.target.value)} />
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
                  <div>
                    <InputLabel>Seller State</InputLabel>
                    <select className="input-field" value={sellerState} onChange={e => setSellerState(e.target.value)}>
                      {INDIAN_STATES.map(s => (
                        <option key={s.name} value={s.name}>{s.name}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <InputLabel>Place of Supply State</InputLabel>
                    <select className="input-field" value={placeOfSupply} onChange={e => setPlaceOfSupply(e.target.value)}>
                      {INDIAN_STATES.map(s => (
                        <option key={s.name} value={s.name}>{s.name}</option>
                      ))}
                    </select>
                  </div>
                </div>
                
                <div style={{ borderTop: "1px solid var(--border)", paddingTop: 12 }}>
                  <label style={{ display: "flex", alignItems: "center", gap: 8, cursor: "pointer", fontWeight: 600, fontSize: 13, marginBottom: 10 }}>
                    <input type="checkbox" checked={showEInvoice} onChange={e => setShowEInvoice(e.target.checked)} />
                    Enable Government E-Invoice IRN details bar
                  </label>
                  {showEInvoice && (
                    <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                      <div>
                        <InputLabel>IRN 64-char Hash</InputLabel>
                        <input type="text" className="input-field" style={{ fontFamily: "monospace", fontSize: 11 }} value={irnHash} onChange={e => setIrnHash(e.target.value)} />
                      </div>
                      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
                        <div>
                          <InputLabel>Ack No</InputLabel>
                          <input type="text" className="input-field" style={{ fontFamily: "monospace" }} value={ackNo} onChange={e => setAckNo(e.target.value)} />
                        </div>
                        <div>
                          <InputLabel>Ack Date</InputLabel>
                          <input type="date" className="input-field" value={ackDate} onChange={e => setAckDate(e.target.value)} />
                        </div>
                      </div>
                      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
                        <div>
                          <InputLabel>EWB Number</InputLabel>
                          <input type="text" className="input-field" value={ewbNo} onChange={e => setEwbNo(e.target.value)} />
                        </div>
                        <div>
                          <InputLabel>EWB Valid Date</InputLabel>
                          <input type="date" className="input-field" value={ewbDate} onChange={e => setEwbDate(e.target.value)} />
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Collapsible section 2: Billing & Shipping Address Panels */}
            <div>
              <div className="collapsible-header">
                <span style={{ display: "flex", alignItems: "center", gap: 8 }}><User size={16} color="var(--accent)" /> 2. Billing & Shipped Profiles</span>
              </div>
              <div className="collapsible-content">
                <h4 style={{ fontWeight: 800, fontSize: 13, borderBottom: "1px solid var(--border)", paddingBottom: 6 }}>Billed To (Receiver)</h4>
                <div>
                  <InputLabel>Receiver Name</InputLabel>
                  <input type="text" className="input-field" value={buyerName} onChange={e => setBuyerName(e.target.value)} />
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "1.2fr 1fr 1fr", gap: 10 }}>
                  <div>
                    <InputLabel>GSTIN</InputLabel>
                    <input type="text" className="input-field" value={buyerGSTIN} onChange={e => setBuyerGSTIN(e.target.value)} />
                  </div>
                  <div>
                    <InputLabel>DL NO</InputLabel>
                    <input type="text" className="input-field" value={buyerDL} onChange={e => setBuyerDL(e.target.value)} />
                  </div>
                  <div>
                    <InputLabel>Customer Code</InputLabel>
                    <input type="text" className="input-field" value={buyerCustCode} onChange={e => setBuyerCustCode(e.target.value)} />
                  </div>
                </div>
                <div>
                  <InputLabel>Billing Address</InputLabel>
                  <textarea className="input-field" rows={2} style={{ resize: "none" }} value={buyerAddress} onChange={e => setBuyerAddress(e.target.value)} />
                </div>
                <div>
                  <InputLabel>Buyer State</InputLabel>
                  <select className="input-field" value={buyerState} onChange={e => setBuyerState(e.target.value)}>
                    {INDIAN_STATES.map(s => (
                      <option key={s.name} value={s.name}>{s.name}</option>
                    ))}
                  </select>
                </div>

                <h4 style={{ fontWeight: 800, fontSize: 13, borderBottom: "1px solid var(--border)", paddingBottom: 6, marginTop: 10 }}>Shipped To</h4>
                <div>
                  <InputLabel>Name</InputLabel>
                  <input type="text" className="input-field" value={shippedToName} onChange={e => setShippedToName(e.target.value)} />
                </div>
                <div>
                  <InputLabel>Shipping Address</InputLabel>
                  <textarea className="input-field" rows={2} style={{ resize: "none" }} value={shippedToAddress} onChange={e => setShippedToAddress(e.target.value)} />
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
                  <div>
                    <InputLabel>Phone</InputLabel>
                    <input type="text" className="input-field" value={shippedToPhone} onChange={e => setShippedToPhone(e.target.value)} />
                  </div>
                  <div>
                    <InputLabel>Email</InputLabel>
                    <input type="text" className="input-field" value={shippedToEmail} onChange={e => setShippedToEmail(e.target.value)} />
                  </div>
                </div>

                <h4 style={{ fontWeight: 800, fontSize: 13, borderBottom: "1px solid var(--border)", paddingBottom: 6, marginTop: 10 }}>Shipped From</h4>
                <div>
                  <InputLabel>Name</InputLabel>
                  <input type="text" className="input-field" value={shippedFromName} onChange={e => setShippedFromName(e.target.value)} />
                </div>
                <div>
                  <InputLabel>Shipped From Address</InputLabel>
                  <textarea className="input-field" rows={2} style={{ resize: "none" }} value={shippedFromAddress} onChange={e => setShippedFromAddress(e.target.value)} />
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
                  <div>
                    <InputLabel>Phone</InputLabel>
                    <input type="text" className="input-field" value={shippedFromPhone} onChange={e => setShippedFromPhone(e.target.value)} />
                  </div>
                  <div>
                    <InputLabel>Email</InputLabel>
                    <input type="text" className="input-field" value={shippedFromEmail} onChange={e => setShippedFromEmail(e.target.value)} />
                  </div>
                </div>
              </div>
            </div>

            {/* Collapsible section 3: Invoice Metadata & Delivery Details */}
            <div>
              <div className="collapsible-header">
                <span style={{ display: "flex", alignItems: "center", gap: 8 }}><FileText size={16} color="var(--accent)" /> 3. Invoice & Delivery Metadata</span>
              </div>
              <div className="collapsible-content">
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
                  <div>
                    <InputLabel>Invoice Number</InputLabel>
                    <input type="text" className="input-field" value={invoiceNo} onChange={e => setInvoiceNo(e.target.value)} />
                  </div>
                  <div>
                    <InputLabel>Buyer Order Number</InputLabel>
                    <input type="text" className="input-field" value={buyerOrderNo} onChange={e => setBuyerOrderNo(e.target.value)} />
                  </div>
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
                  <div>
                    <InputLabel>Invoice Date</InputLabel>
                    <input type="date" className="input-field" value={invoiceDate} onChange={e => setInvoiceDate(e.target.value)} />
                  </div>
                  <div>
                    <InputLabel>Due Date</InputLabel>
                    <input type="date" className="input-field" value={dueDate} onChange={e => setDueDate(e.target.value)} />
                  </div>
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
                  <div>
                    <InputLabel>Delivery Note</InputLabel>
                    <input type="text" className="input-field" value={deliveryNote} onChange={e => setDeliveryNote(e.target.value)} />
                  </div>
                  <div>
                    <InputLabel>Destination</InputLabel>
                    <input type="text" className="input-field" value={destination} onChange={e => setDestination(e.target.value)} />
                  </div>
                </div>
                <div>
                  <InputLabel>Terms of Delivery</InputLabel>
                  <input type="text" className="input-field" value={termsOfDelivery} onChange={e => setTermsOfDelivery(e.target.value)} />
                </div>
              </div>
            </div>

            {/* Collapsible section 4: Transport Details */}
            <div>
              <div className="collapsible-header">
                <span style={{ display: "flex", alignItems: "center", gap: 8 }}><MapPin size={16} color="var(--accent)" /> 4. Shipping & Transport details</span>
              </div>
              <div className="collapsible-content">
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
                  <div>
                    <InputLabel>Transport Mode</InputLabel>
                    <input type="text" className="input-field" value={transMode} onChange={e => setTransMode(e.target.value)} />
                  </div>
                  <div>
                    <InputLabel>Transporter Name</InputLabel>
                    <input type="text" className="input-field" value={transporter} onChange={e => setTransporter(e.target.value)} />
                  </div>
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
                  <div>
                    <InputLabel>Transporter ID</InputLabel>
                    <input type="text" className="input-field" value={transId} onChange={e => setTransId(e.target.value)} />
                  </div>
                  <div>
                    <InputLabel>Challan Number</InputLabel>
                    <input type="text" className="input-field" value={challanNo} onChange={e => setChallanNo(e.target.value)} />
                  </div>
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
                  <div>
                    <InputLabel>Challan Date</InputLabel>
                    <input type="date" className="input-field" value={challanDate} onChange={e => setChallanDate(e.target.value)} />
                  </div>
                  <div>
                    <InputLabel>Vehicle Type</InputLabel>
                    <input type="text" className="input-field" value={vehicleType} onChange={e => setVehicleType(e.target.value)} />
                  </div>
                </div>
                <div>
                  <InputLabel>Vehicle Number</InputLabel>
                  <input type="text" className="input-field" style={{ textTransform: "uppercase" }} value={vehicleNo} onChange={e => setVehicleNo(e.target.value.toUpperCase())} />
                </div>
              </div>
            </div>

            {/* Collapsible section 5: Invoice Line Items */}
            <div>
              <div className="collapsible-header">
                <span style={{ display: "flex", alignItems: "center", gap: 8 }}><Package size={16} color="var(--accent)" /> 5. Invoice Line Items & Products</span>
              </div>
              <div className="collapsible-content">
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
                  <span style={{ fontSize: 13, fontWeight: 700 }}>Line Items Builder</span>
                  <button onClick={addItem} className="btn-accent" style={{ padding: "6px 12px", fontSize: 12, display: "flex", alignItems: "center", gap: 6 }}>
                    <Plus size={14} /> Add Item
                  </button>
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                  {items.map((item, idx) => (
                    <div key={item.id} style={{
                      background: "var(--bg-secondary)", border: "1px solid var(--border)", borderRadius: 12, padding: 14,
                      display: "flex", flexDirection: "column", gap: 10, position: "relative"
                    }}>
                      <div style={{ position: "absolute", top: 12, right: 12 }}>
                        <button
                          onClick={() => deleteItem(item.id)}
                          disabled={items.length <= 1}
                          style={{
                            background: "none", border: "none", color: items.length <= 1 ? "var(--text-muted)" : "var(--danger)",
                            cursor: items.length <= 1 ? "not-allowed" : "pointer", opacity: items.length <= 1 ? 0.4 : 1, padding: 4
                          }}
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>

                      <div style={{ display: "grid", gridTemplateColumns: "2.5fr 1fr", gap: 10, marginRight: 24 }}>
                        <div>
                          <InputLabel>Item Name & Batch/Warranty Details</InputLabel>
                          <textarea className="input-field" rows={2} style={{ fontSize: 12, resize: "none" }} value={item.description} onChange={e => updateItem(item.id, "description", e.target.value)} />
                        </div>
                        <div>
                          <InputLabel>HSN Code</InputLabel>
                          <input type="text" className="input-field" value={item.hsn} style={{ fontFamily: "monospace" }} onChange={e => updateItem(item.id, "hsn", e.target.value)} />
                        </div>
                      </div>

                      <div style={{ display: "grid", gridTemplateColumns: "1fr 1.2fr 1fr 1fr", gap: 10 }}>
                        <div>
                          <InputLabel>Quantity</InputLabel>
                          <input type="number" min={1} className="input-field" value={item.qty} onChange={e => updateItem(item.id, "qty", Math.max(1, Number(e.target.value)))} />
                        </div>
                        <div>
                          <InputLabel>Rate (Excl. Tax)</InputLabel>
                          <input type="number" min={0} className="input-field" value={item.rateExcludingTax} onChange={e => updateItem(item.id, "rateExcludingTax", Math.max(0, Number(e.target.value)))} />
                        </div>
                        <div>
                          <InputLabel>Discount %</InputLabel>
                          <input type="number" min={0} max={100} className="input-field" value={item.discountPercent} onChange={e => updateItem(item.id, "discountPercent", Math.max(0, Number(e.target.value)))} />
                        </div>
                        <div>
                          <InputLabel>GST %</InputLabel>
                          <select className="input-field" value={item.gstPercent} onChange={e => updateItem(item.id, "gstPercent", Number(e.target.value))}>
                            <option value="0">0%</option>
                            <option value="5">5%</option>
                            <option value="12">12%</option>
                            <option value="18">18%</option>
                            <option value="28">28%</option>
                          </select>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Collapsible section 6: Payments, Declarations & Legal DLs */}
            <div>
              <div className="collapsible-header">
                <span style={{ display: "flex", alignItems: "center", gap: 8 }}><Landmark size={16} color="var(--accent)" /> 6. Payments, Signatory & Footer Notes</span>
              </div>
              <div className="collapsible-content">
                <h4 style={{ fontWeight: 800, fontSize: 13, borderBottom: "1px solid var(--border)", paddingBottom: 6 }}>Bank Details</h4>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
                  <div>
                    <InputLabel>Bank Name</InputLabel>
                    <input type="text" className="input-field" value={bankName} onChange={e => setBankName(e.target.value)} />
                  </div>
                  <div>
                    <InputLabel>Account Name</InputLabel>
                    <input type="text" className="input-field" value={bankHolder} onChange={e => setBankHolder(e.target.value)} />
                  </div>
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1.2fr 1fr", gap: 10 }}>
                  <div>
                    <InputLabel>Account Number</InputLabel>
                    <input type="text" className="input-field" style={{ fontFamily: "monospace" }} value={bankAccNo} onChange={e => setBankAccNo(e.target.value)} />
                  </div>
                  <div>
                    <InputLabel>IFSC Code</InputLabel>
                    <input type="text" className="input-field" style={{ fontFamily: "monospace", textTransform: "uppercase" }} value={bankIFSC} onChange={e => setBankIFSC(e.target.value.toUpperCase())} />
                  </div>
                  <div>
                    <InputLabel>Account Type</InputLabel>
                    <input type="text" className="input-field" value={bankType} onChange={e => setBankType(e.target.value)} />
                  </div>
                </div>
                <div>
                  <InputLabel>UPI ID for QR Code Scan-To-Pay</InputLabel>
                  <input type="text" className="input-field" value={upiId} onChange={e => setUpiId(e.target.value)} />
                  <span style={{ fontSize: 11, color: "var(--text-muted)", marginTop: 4, display: "block" }}>
                    Renders an active dynamic UPI pay QR code in the invoice!
                  </span>
                </div>

                <h4 style={{ fontWeight: 800, fontSize: 13, borderBottom: "1px solid var(--border)", paddingBottom: 6, marginTop: 10 }}>Company Legal Licenses</h4>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
                  <div>
                    <InputLabel>Company DL No. 1</InputLabel>
                    <input type="text" className="input-field" value={companyDL1} onChange={e => setCompanyDL1(e.target.value)} />
                  </div>
                  <div>
                    <InputLabel>Company DL No. 2</InputLabel>
                    <input type="text" className="input-field" value={companyDL2} onChange={e => setCompanyDL2(e.target.value)} />
                  </div>
                </div>
                <div>
                  <InputLabel>Company Additional GST IN</InputLabel>
                  <input type="text" className="input-field" value={companyGST} onChange={e => setCompanyGST(e.target.value)} />
                </div>

                <h4 style={{ fontWeight: 800, fontSize: 13, borderBottom: "1px solid var(--border)", paddingBottom: 6, marginTop: 10 }}>Legal Texts</h4>
                <div>
                  <InputLabel>Declaration Box</InputLabel>
                  <textarea className="input-field" rows={3} style={{ fontSize: 12 }} value={declaration} onChange={e => setDeclaration(e.target.value)} />
                </div>
                <div>
                  <InputLabel>Additional Notes Box</InputLabel>
                  <textarea className="input-field" rows={3} style={{ fontSize: 12 }} value={additionalNotes} onChange={e => setAdditionalNotes(e.target.value)} />
                </div>
              </div>
            </div>

          </div>

          {/* Precision A4 GSTR Preview (Density-Matched, Exact replication of sample image) */}
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            <div className="no-print" style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <span style={{ fontSize: 14, fontWeight: 700, color: "var(--text-secondary)" }}>📋 A4 GSTR E-Invoice Visual Layout (Exact match)</span>
            </div>

            {/* A4 Tax Sheet Container */}
            <div id="invoice-sheet-container" style={{
              background: "white",
              color: "#111111",
              padding: "24px 30px",
              boxShadow: "0 10px 30px rgba(0,0,0,0.15)",
              border: "1px solid #777777",
              fontFamily: "'Arial', 'Helvetica', sans-serif",
              lineHeight: 1.25,
              fontSize: "10.5px",
              width: "100%",
              maxWidth: "800px",
              margin: "0 auto",
              boxSizing: "border-box"
            }}>
              
              {/* Top bilingual logo and header block */}
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 8 }}>
                <div style={{ display: "flex", gap: 14, alignItems: "center" }}>
                  {logoType === "image" && logoImageSrc ? (
                    <img
                      src={logoImageSrc}
                      alt="Brand Logo"
                      style={{ width: 76, height: 76, objectFit: "contain", border: "1px solid #dddddd", padding: 2, borderRadius: 4, flexShrink: 0 }}
                    />
                  ) : (
                    <div style={{
                      width: 76, height: 76, borderRadius: "50%", background: logoBadgeColor, display: "flex",
                      flexDirection: "column", alignItems: "center", justifyContent: "center", color: "white", fontSize: 8, fontWeight: "bold",
                      textAlign: "center", border: `2px solid ${logoBadgeBorderColor}`, flexShrink: 0, padding: 4, boxSizing: "border-box",
                      lineHeight: 1.1
                    }}>
                      <span>{logoBadgeTextTop}</span>
                      <span style={{ height: "1px", background: "rgba(255,255,255,0.3)", width: "80%", margin: "3px 0" }}></span>
                      <span style={{ fontSize: 6.5 }}>{logoBadgeTextBottom}</span>
                    </div>
                  )}
                  <div>
                    <h1 style={{ fontSize: 18, fontWeight: 900, color: "#00477e", margin: "0 0 4px 0", fontFamily: "sans-serif" }}>
                      {sellerName}
                    </h1>
                    <div style={{ fontSize: 8.5, color: "#333", fontWeight: 700, lineHeight: 1.3, maxWidth: 500 }}>
                      {sellerAddress}
                    </div>
                  </div>
                </div>
                {/* Government signed E-Invoice QR Code placeholder */}
                <div style={{ textAlign: "right" }}>
                  <img
                    src={`https://api.qrserver.com/v1/create-qr-code/?size=72&margin=0&data=${encodeURIComponent(irnHash)}`}
                    alt="E-Invoice QR"
                    style={{ width: 72, height: 72, border: "1px solid #ddd", padding: 2 }}
                  />
                </div>
              </div>

              {/* Business identifiers details strip */}
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "8px 24px", padding: "6px 8px", background: "#fcfcfc", border: "1px solid #dddddd", borderRadius: 4, marginBottom: 8, fontSize: 9 }}>
                <div>GSTIN: <b style={{ fontSize: 10 }}>{sellerGSTIN}</b></div>
                <div>PAN No: <b>{sellerPAN}</b></div>
                <div>CIN: <b>{sellerCIN}</b></div>
                <div>(Mo): <b>{sellerMobile}</b></div>
                <div>Email: <b style={{ textTransform: "lowercase" }}>{sellerEmail}</b></div>
                <div>Insur. Policy No: <b>{sellerInsur}</b></div>
              </div>

              {/* Tax Invoice centered grey title bar */}
              <div style={{
                background: "#eeeeee", padding: "4px 0", textAlign: "center", fontSize: 13, fontWeight: "bold",
                border: "1px solid #cccccc", borderBottom: "none", color: "#111", letterSpacing: "0.5px"
              }}>
                Tax Invoice
              </div>

              {/* 3-column Primary Customer & Metadata address grid */}
              <div style={{ display: "grid", gridTemplateColumns: "1.1fr 1.1fr 1fr", border: "1px solid #cccccc", fontSize: 9.5, marginBottom: 0 }}>
                {/* Billed to */}
                <div style={{ borderRight: "1px solid #cccccc", padding: "8px" }}>
                  <div style={{ borderBottom: "1px solid #eee", paddingBottom: 3, marginBottom: 4, fontWeight: "bold", color: "#444" }}>Billed To</div>
                  <div style={{ fontSize: 11, fontWeight: "bold", color: "#000", marginBottom: 2 }}>{buyerName}</div>
                  <div style={{ color: "#333", lineHeight: 1.4 }}>
                    {buyerAddress}<br />
                    <b>GSTIN:</b> {buyerGSTIN || "N/A"}<br />
                    <b>DL NO:</b> {buyerDL || "N/A"}<br />
                    <b>Customer Code:</b> {buyerCustCode || "N/A"}
                  </div>
                </div>

                {/* Shipped to */}
                <div style={{ borderRight: "1px solid #cccccc", padding: "8px" }}>
                  <div style={{ borderBottom: "1px solid #eee", paddingBottom: 3, marginBottom: 4, fontWeight: "bold", color: "#444" }}>Shipped To</div>
                  <div style={{ fontSize: 11, fontWeight: "bold", color: "#000", marginBottom: 2 }}>{shippedToName}</div>
                  <div style={{ color: "#333", lineHeight: 1.4 }}>
                    {shippedToAddress}<br />
                    <b>Phone:</b> {shippedToPhone || "N/A"}<br />
                    <b>Email:</b> {shippedToEmail || "N/A"}
                  </div>
                </div>

                {/* Metadata */}
                <div style={{ padding: "8px", display: "flex", flexDirection: "column", gap: 3.5 }}>
                  <div style={{ display: "flex", justifyContent: "space-between" }}>
                    <span style={{ color: "#666" }}>Invoice #</span>
                    <span style={{ fontWeight: "bold", color: "#000" }}>{invoiceNo}</span>
                  </div>
                  <div style={{ display: "flex", justifyContent: "space-between" }}>
                    <span style={{ color: "#666" }}>Invoice Date</span>
                    <span style={{ fontWeight: "bold" }}>{new Date(invoiceDate).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}</span>
                  </div>
                  <div style={{ display: "flex", justifyContent: "space-between" }}>
                    <span style={{ color: "#666" }}>Due Date</span>
                    <span style={{ fontWeight: "bold" }}>{new Date(dueDate).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}</span>
                  </div>
                  <div style={{ display: "flex", justifyContent: "space-between" }}>
                    <span style={{ color: "#666" }}>Delivery Note</span>
                    <span style={{ fontWeight: "bold" }}>{deliveryNote}</span>
                  </div>
                  <div style={{ display: "flex", justifyContent: "space-between" }}>
                    <span style={{ color: "#666" }}>Destination</span>
                    <span style={{ fontWeight: "bold" }}>{destination}</span>
                  </div>
                  <div style={{ display: "flex", justifyContent: "space-between" }}>
                    <span style={{ color: "#666" }}>Terms of Delivery:-</span>
                    <span style={{ fontWeight: "bold", fontSize: 8 }}>{termsOfDelivery}</span>
                  </div>
                  <div style={{ display: "flex", justifyContent: "space-between" }}>
                    <span style={{ color: "#666" }}>Buyer's Order No.</span>
                    <span style={{ fontWeight: "bold" }}>{buyerOrderNo}</span>
                  </div>
                </div>
              </div>

              {/* Shipped from & Transport details row */}
              <div style={{ display: "grid", gridTemplateColumns: "1.1fr 1.9fr", border: "1px solid #cccccc", borderTop: "none", fontSize: 9.5 }}>
                {/* Shipped from */}
                <div style={{ borderRight: "1px solid #cccccc", padding: "8px" }}>
                  <div style={{ borderBottom: "1px solid #eee", paddingBottom: 3, marginBottom: 4, fontWeight: "bold", color: "#444" }}>Shipped From</div>
                  <div style={{ fontSize: 11, fontWeight: "bold", color: "#000", marginBottom: 2 }}>{shippedFromName}</div>
                  <div style={{ color: "#333", lineHeight: 1.4 }}>
                    {shippedFromAddress}<br />
                    <b>Phone:</b> {shippedFromPhone || "N/A"}<br />
                    <b>Email:</b> {shippedFromEmail || "N/A"}
                  </div>
                </div>

                {/* Transport details */}
                <div style={{ padding: "8px", display: "grid", gridTemplateColumns: "1fr 1fr", gap: "4px 20px" }}>
                  <div style={{ gridColumn: "1 / -1", fontWeight: "bold", color: "#444", borderBottom: "1px solid #eee", paddingBottom: 3, marginBottom: 4 }}>Transport Details</div>
                  <div>Transport Mode: <b style={{ float: "right" }}>{transMode}</b></div>
                  <div>Challan Date: <b style={{ float: "right" }}>{new Date(challanDate).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}</b></div>
                  <div>Transporter: <b style={{ float: "right" }}>{transporter}</b></div>
                  <div>Challan Number: <b style={{ float: "right" }}>{challanNo}</b></div>
                  <div>Transporter ID: <b style={{ float: "right" }}>{transId}</b></div>
                  <div>Vehicle Type: <b style={{ float: "right" }}>{vehicleType}</b></div>
                  <div style={{ gridColumn: "1 / -1" }}>Vehicle Number: <b style={{ float: "right", color: "#00477e", fontSize: 10 }}>{vehicleNo}</b></div>
                </div>
              </div>

              {/* E-Invoice IRN Details Bar (Exact replica of GSTR bar) */}
              {showEInvoice && (
                <div style={{ border: "1px solid #cccccc", borderTop: "none", background: "#fcfcfc", padding: "6px 10px", fontSize: 8, display: "grid", gridTemplateColumns: "1fr 1fr", gap: "4px 24px" }}>
                  <div>IRN: <b style={{ fontFamily: "monospace", fontSize: 8.5 }}>{irnHash}</b></div>
                  <div>EWB No. <b>{ewbNo}</b></div>
                  <div>Acknowledgement Number: <b>{ackNo}</b></div>
                  <div>EWB Valid Date: <b>{new Date(ewbDate).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}</b></div>
                  <div>Acknowledgement Date: <b>{new Date(ackDate).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}</b></div>
                  <div>EWB Valid Till Date: <b>{new Date(ewbValidTill).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}</b></div>
                  <div>IRN Cancelled Date: <b>{new Date(cancelledDate).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}</b></div>
                  <div>EWB Bill Cancelled Date: <b>{new Date(ewbCancelledDate).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}</b></div>
                </div>
              )}

              {/* Main Billing Table */}
              <table style={{ width: "100%", borderCollapse: "collapse", margin: "0", border: "1px solid #cccccc", borderTop: "none", fontSize: 9 }}>
                <thead>
                  <tr style={{ background: "#eeeeee", borderBottom: "1px solid #cccccc" }}>
                    <th style={{ borderRight: "1px solid #cccccc", padding: "6px 4px", width: 25, textAlign: "center" }}>#</th>
                    <th style={{ borderRight: "1px solid #cccccc", padding: "6px 8px", textAlign: "left" }}>ITEM</th>
                    <th style={{ borderRight: "1px solid #cccccc", padding: "6px 6px", width: 80, textAlign: "right" }}>Rate</th>
                    <th style={{ borderRight: "1px solid #cccccc", padding: "6px 4px", width: 35, textAlign: "center" }}>Qty</th>
                    <th style={{ borderRight: "1px solid #cccccc", padding: "6px 8px", width: 90, textAlign: "right" }}>Amount</th>
                    <th style={{ borderRight: "1px solid #cccccc", padding: "6px 4px", width: 55, textAlign: "center" }}>Discount</th>
                    <th style={{ borderRight: "1px solid #cccccc", padding: "6px 4px", width: 45, textAlign: "center" }}>GST %</th>
                    <th style={{ borderRight: "1px solid #cccccc", padding: "6px 8px", width: 85, textAlign: "right" }}>{isInterState ? "IGST" : "CGST+SGST"}</th>
                    <th style={{ padding: "6px 8px", width: 95, textAlign: "right" }}>Total</th>
                  </tr>
                </thead>
                <tbody>
                  {calculatedItems.map((item, idx) => {
                    const splitTax = item.taxAmount / 2;
                    return (
                      <tr key={item.id} style={{ borderBottom: "1px solid #dddddd" }}>
                        <td style={{ borderRight: "1px solid #cccccc", padding: "6px 4px", textAlign: "center", color: "#666" }}>{String(idx + 1).padStart(2, "0")}</td>
                        <td style={{ borderRight: "1px solid #cccccc", padding: "6px 8px", lineHeight: 1.4 }}>
                          <b>{item.description.split(" Batch :")[0]}</b>
                          {item.description.includes(" Batch :") && (
                            <div style={{ fontSize: 7.5, color: "#555", marginTop: 2 }}>
                              Batch : {item.description.split(" Batch :")[1]}
                            </div>
                          )}
                        </td>
                        <td style={{ borderRight: "1px solid #cccccc", padding: "6px 6px", textAlign: "right" }}>{fmt(item.rateExcludingTax)}</td>
                        <td style={{ borderRight: "1px solid #cccccc", padding: "6px 4px", textAlign: "center", fontWeight: "bold" }}>{item.qty}</td>
                        <td style={{ borderRight: "1px solid #cccccc", padding: "6px 8px", textAlign: "right" }}>{fmt(item.rateExcludingTax * item.qty)}</td>
                        <td style={{ borderRight: "1px solid #cccccc", padding: "6px 4px", textAlign: "center", color: item.discountPercent > 0 ? "var(--success)" : "#555" }}>
                          {item.discountPercent}%
                        </td>
                        <td style={{ borderRight: "1px solid #cccccc", padding: "6px 4px", textAlign: "center" }}>{item.gstPercent}%</td>
                        <td style={{ borderRight: "1px solid #cccccc", padding: "6px 8px", textAlign: "right", color: "#666" }}>
                          {isInterState ? (
                            fmt(item.igst)
                          ) : (
                            <div style={{ fontSize: 7.5, lineHeight: 1.2 }}>
                              C: {fmt(splitTax)}<br />
                              S: {fmt(splitTax)}
                            </div>
                          )}
                        </td>
                        <td style={{ padding: "6px 8px", textAlign: "right", fontWeight: "bold" }}>{fmt(item.itemTotal)}</td>
                      </tr>
                    );
                  })}
                  
                  {/* Totals row */}
                  <tr style={{ background: "#fcfcfc", borderTop: "2px solid #bbbbbb", fontWeight: "bold" }}>
                    <td style={{ borderRight: "1px solid #cccccc", padding: "6px 4px" }}></td>
                    <td style={{ borderRight: "1px solid #cccccc", padding: "6px 8px" }}>Total</td>
                    <td style={{ borderRight: "1px solid #cccccc", padding: "6px 6px" }}></td>
                    <td style={{ borderRight: "1px solid #cccccc", padding: "6px 4px", textAlign: "center", fontSize: 10 }}>{totalItemsQty}</td>
                    <td style={{ borderRight: "1px solid #cccccc", padding: "6px 8px", textAlign: "right" }}>{fmt(totalTaxableValue + totalDiscountVal)}</td>
                    <td style={{ borderRight: "1px solid #cccccc", padding: "6px 4px" }}></td>
                    <td style={{ borderRight: "1px solid #cccccc", padding: "6px 4px" }}></td>
                    <td style={{ borderRight: "1px solid #cccccc", padding: "6px 8px", textAlign: "right" }}>{isInterState ? fmt(totalIGST) : fmt(totalCGST + totalSGST)}</td>
                    <td style={{ padding: "6px 8px", textAlign: "right", color: "#00477e" }}>{fmt(totalGrandTotal)}</td>
                  </tr>
                </tbody>
              </table>

              {/* Main Subtotal Calculations grid */}
              <div style={{ display: "grid", gridTemplateColumns: "1fr 200px", border: "1px solid #cccccc", borderTop: "none" }}>
                <div></div>
                <div style={{ fontSize: 9.5, borderLeft: "1px solid #cccccc" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", padding: "5px 8px", borderBottom: "1px solid #eee" }}>
                    <span>Discount ({items[0]?.discountPercent || 0}%)</span>
                    <span>{fmt(totalDiscountVal)}</span>
                  </div>
                  {!isInterState ? (
                    <>
                      <div style={{ display: "flex", justifyContent: "space-between", padding: "5px 8px", borderBottom: "1px solid #eee" }}>
                        <span>SGST</span>
                        <span>{fmt(totalSGST)}</span>
                      </div>
                      <div style={{ display: "flex", justifyContent: "space-between", padding: "5px 8px", borderBottom: "1px solid #eee" }}>
                        <span>CGST</span>
                        <span>{fmt(totalCGST)}</span>
                      </div>
                    </>
                  ) : (
                    <div style={{ display: "flex", justifyContent: "space-between", padding: "5px 8px", borderBottom: "1px solid #eee" }}>
                      <span>IGST</span>
                      <span>{fmt(totalIGST)}</span>
                    </div>
                  )}
                  <div style={{ display: "flex", justifyContent: "space-between", padding: "6px 8px", background: "#f5f5f5", fontWeight: "bold", fontSize: 11, color: "#000" }}>
                    <span>Total (INR)</span>
                    <span>{fmt(totalGrandTotal)}</span>
                  </div>
                </div>
              </div>

              {/* Words total */}
              <div style={{ border: "1px solid #cccccc", borderTop: "none", padding: "8px 10px", fontSize: 9.5 }}>
                Invoice Total (in words): <b style={{ fontStyle: "italic", color: "#00477e" }}>{numberToIndianWords(totalGrandTotal)}</b>
              </div>

              {/* Legal terms, Bank, UPI & Dynamic UPI QR grid (replica of center graphic) */}
              <div style={{ display: "grid", gridTemplateColumns: "1.2fr 1fr 1fr", border: "1px solid #cccccc", borderTop: "none", fontSize: 9, minHeight: 120 }}>
                {/* Terms and conditions */}
                <div style={{ borderRight: "1px solid #cccccc", padding: "8px" }}>
                  <div style={{ fontWeight: "bold", color: "#444", borderBottom: "1px solid #eee", paddingBottom: 3, marginBottom: 6 }}>Terms and Conditions</div>
                  <ol style={{ margin: 0, paddingLeft: 12, lineHeight: 1.4, color: "#555" }}>
                    {termsList.map((term, i) => <li key={i} style={{ marginBottom: 4 }}>{term}</li>)}
                  </ol>
                  <div style={{ fontWeight: "bold", color: "#444", borderBottom: "1px solid #eee", paddingBottom: 3, margin: "10px 0 6px 0" }}>Declaration</div>
                  <div style={{ color: "#666", lineHeight: 1.3, fontSize: 8.5 }}>
                    {declaration}
                  </div>
                </div>

                {/* Bank details & UPI */}
                <div style={{ borderRight: "1px solid #cccccc", padding: "8px", display: "flex", flexDirection: "column", gap: 6 }}>
                  <div style={{ fontWeight: "bold", color: "#444", borderBottom: "1px solid #eee", paddingBottom: 3 }}>Bank and UPI details</div>
                  <div style={{ display: "grid", gridTemplateColumns: "75px 1fr", gap: "3px 8px", fontSize: 8.5, color: "#333" }}>
                    <span>Bank Name</span> <b>{bankName}</b>
                    <span>Account Name</span> <b>{bankHolder}</b>
                    <span>Account Number</span> <b style={{ fontFamily: "monospace" }}>{bankAccNo}</b>
                    <span>IFSC</span> <b style={{ fontFamily: "monospace" }}>{bankIFSC}</b>
                    <span>Account Type</span> <b>{bankType}</b>
                  </div>
                  <div style={{ borderTop: "1px dashed #ddd", paddingTop: 5, marginTop: 5 }}>
                    <span style={{ color: "#666", fontSize: 8, display: "block", marginBottom: 2 }}>UPI ID</span>
                    <b style={{ color: "#005a5b", fontSize: 9.5 }}>{upiId}</b>
                  </div>
                </div>

                {/* Dynamic UPI Scan To Pay QR Code */}
                <div style={{ padding: "8px", textAlign: "center", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 6 }}>
                  <div style={{ fontSize: 9, fontWeight: "bold", color: "#111" }}>Scan To Pay</div>
                  <img
                    src={upiQrUrl}
                    alt="UPI Pay QR"
                    style={{ width: 84, height: 84, border: "1px solid #aaa", padding: 2, background: "white" }}
                  />
                  <div style={{ fontSize: 7, color: "#777", lineHeight: 1.1, maxWidth: 140 }}>
                    Maximum of 1 lakh can be transferred via UPI in a single day
                  </div>
                </div>
              </div>

              {/* Additional notes box */}
              <div style={{ border: "1px solid #cccccc", borderTop: "none", padding: "8px 10px", fontSize: 8.5, color: "#555", lineHeight: 1.3 }}>
                <b>Additional Notes:</b><br />
                {additionalNotes}
              </div>

              {/* Dual tables grid: Tax Rate splits and HSN Summary side-by-side */}
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1.1fr", gap: 10, margin: "10px 0" }}>
                
                {/* Tax Rate Split table */}
                <table style={{ width: "100%", borderCollapse: "collapse", border: "1px solid #cccccc", fontSize: 8 }}>
                  <thead>
                    <tr style={{ background: "#eeeeee", borderBottom: "1px solid #cccccc" }}>
                      <th rowSpan={2} style={{ borderRight: "1px solid #cccccc", padding: "4px" }}>Tax Rate</th>
                      <th colSpan={2} style={{ borderRight: "1px solid #cccccc", borderBottom: "1px solid #cccccc", padding: "2px", textAlign: "center" }}>CGST</th>
                      <th colSpan={2} style={{ borderRight: "1px solid #cccccc", borderBottom: "1px solid #cccccc", padding: "2px", textAlign: "center" }}>SGST</th>
                      <th rowSpan={2} style={{ padding: "4px", textAlign: "right" }}>Total</th>
                    </tr>
                    <tr style={{ background: "#fcfcfc", borderBottom: "1px solid #cccccc" }}>
                      <th style={{ borderRight: "1px solid #cccccc", padding: "2px", textAlign: "right" }}>Rate</th>
                      <th style={{ borderRight: "1px solid #cccccc", padding: "2px", textAlign: "right" }}>Amount</th>
                      <th style={{ borderRight: "1px solid #cccccc", padding: "2px", textAlign: "right" }}>Rate</th>
                      <th style={{ borderRight: "1px solid #cccccc", padding: "2px", textAlign: "right" }}>Amount</th>
                    </tr>
                  </thead>
                  <tbody>
                    {Object.entries(taxRateMap).map(([rateStr, vals]) => {
                      const rate = Number(rateStr);
                      const displayRate = rate / 2;
                      return (
                        <tr key={rateStr} style={{ borderBottom: "1px solid #eee" }}>
                          <td style={{ borderRight: "1px solid #cccccc", padding: "4px", textAlign: "center", fontWeight: "bold" }}>{rate}%</td>
                          <td style={{ borderRight: "1px solid #cccccc", padding: "4px", textAlign: "right" }}>{isInterState ? "0%" : `${displayRate}%`}</td>
                          <td style={{ borderRight: "1px solid #cccccc", padding: "4px", textAlign: "right" }}>{fmt(vals.cgst)}</td>
                          <td style={{ borderRight: "1px solid #cccccc", padding: "4px", textAlign: "right" }}>{isInterState ? "0%" : `${displayRate}%`}</td>
                          <td style={{ borderRight: "1px solid #cccccc", padding: "4px", textAlign: "right" }}>{fmt(vals.sgst)}</td>
                          <td style={{ padding: "4px", textAlign: "right", fontWeight: "bold" }}>{fmt(vals.cgst + vals.sgst + vals.igst)}</td>
                        </tr>
                      );
                    })}
                    <tr style={{ background: "#fafafa", borderTop: "1px solid #cccccc", fontWeight: "bold" }}>
                      <td style={{ borderRight: "1px solid #cccccc", padding: "4px", textAlign: "center" }}>Total</td>
                      <td style={{ borderRight: "1px solid #cccccc", padding: "4px" }}></td>
                      <td style={{ borderRight: "1px solid #cccccc", padding: "4px", textAlign: "right" }}>{fmt(totalCGST)}</td>
                      <td style={{ borderRight: "1px solid #cccccc", padding: "4px" }}></td>
                      <td style={{ borderRight: "1px solid #cccccc", padding: "4px", textAlign: "right" }}>{fmt(totalSGST)}</td>
                      <td style={{ padding: "4px", textAlign: "right", color: "#00477e" }}>{fmt(totalCGST + totalSGST + totalIGST)}</td>
                    </tr>
                  </tbody>
                </table>

                {/* HSN Summary table */}
                <table style={{ width: "100%", borderCollapse: "collapse", border: "1px solid #cccccc", fontSize: 8 }}>
                  <thead>
                    <tr style={{ background: "#eeeeee", borderBottom: "1px solid #cccccc" }}>
                      <th style={{ borderRight: "1px solid #cccccc", padding: "4px", textAlign: "left" }}>HSN</th>
                      <th style={{ borderRight: "1px solid #cccccc", padding: "4px", textAlign: "right" }}>Taxable Value</th>
                      <th style={{ borderRight: "1px solid #cccccc", padding: "4px", textAlign: "center" }}>Central Tax (CGST)</th>
                      <th style={{ borderRight: "1px solid #cccccc", padding: "4px", textAlign: "center" }}>State Tax (SGST)</th>
                      <th style={{ padding: "4px", textAlign: "right" }}>Total</th>
                    </tr>
                  </thead>
                  <tbody>
                    {Object.entries(hsnMap).map(([hsn, val]) => (
                      <tr key={hsn} style={{ borderBottom: "1px solid #eee" }}>
                        <td style={{ borderRight: "1px solid #cccccc", padding: "4px", fontFamily: "monospace" }}>{hsn}</td>
                        <td style={{ borderRight: "1px solid #cccccc", padding: "4px", textAlign: "right" }}>{fmt(val.taxable)}</td>
                        <td style={{ borderRight: "1px solid #cccccc", padding: "4px", textAlign: "right" }}>
                          <span style={{ color: "#777", float: "left" }}>{val.rate / 2}%</span> {fmt(val.cgst)}
                        </td>
                        <td style={{ borderRight: "1px solid #cccccc", padding: "4px", textAlign: "right" }}>
                          <span style={{ color: "#777", float: "left" }}>{val.rate / 2}%</span> {fmt(val.sgst)}
                        </td>
                        <td style={{ padding: "4px", textAlign: "right", fontWeight: "bold" }}>{fmt(val.taxable + val.cgst + val.sgst + val.igst)}</td>
                      </tr>
                    ))}
                    <tr style={{ background: "#fafafa", borderTop: "1px solid #cccccc", fontWeight: "bold" }}>
                      <td style={{ borderRight: "1px solid #cccccc", padding: "4px" }}>Total</td>
                      <td style={{ borderRight: "1px solid #cccccc", padding: "4px", textAlign: "right" }}>{fmt(totalTaxableValue)}</td>
                      <td style={{ borderRight: "1px solid #cccccc", padding: "4px", textAlign: "right" }}>{fmt(totalCGST)}</td>
                      <td style={{ borderRight: "1px solid #cccccc", padding: "4px", textAlign: "right" }}>{fmt(totalSGST)}</td>
                      <td style={{ padding: "4px", textAlign: "right", color: "#00477e" }}>{fmt(totalTaxableValue + totalCGST + totalSGST + totalIGST)}</td>
                    </tr>
                  </tbody>
                </table>

              </div>

              {/* Bottom Additional legal info / signature box */}
              <div style={{ display: "grid", gridTemplateColumns: "1.4fr 1fr", gap: 30, border: "1px solid #cccccc", padding: "10px", fontSize: 8.5 }}>
                <div style={{ display: "flex", flexDirection: "column", gap: 3.5, color: "#333" }}>
                  <div>Company's DL NO. &nbsp;<b>{companyDL1}</b></div>
                  <div>Company's DL NO. &nbsp;<b>{companyDL2}</b></div>
                  <div>Company's GST NO. <b>{companyGST}</b></div>
                  <div>Company's GST NO. <b>{companyGST}</b></div>
                  <div>Company's GST NO. <b>{companyGST}</b></div>
                  <div>Company's GST NO. <b>{companyGST}</b></div>
                </div>
                <div style={{ textAlign: "right", display: "flex", flexDirection: "column", justifyContent: "space-between", height: "100%", minHeight: 70 }}>
                  <div style={{ fontWeight: "bold", fontSize: 9 }}>Authorised Signatory</div>
                  
                  {/* Handwritten realistic modern digital signature simulation graphics */}
                  <div style={{ display: "flex", justifyContent: "flex-end", margin: "4px 0" }}>
                    <svg width="120" height="34" viewBox="0 0 120 34" fill="none" style={{ opacity: 0.85 }}>
                      <path d="M10 24C18 23.5 28 8.5 35 12C41.5 15.2 38.5 28.5 48 24C57.5 19.5 64 3.5 72 8C79 12 76 27 88 19C98 12.5 102.5 4 110 11.5" stroke="#00477e" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
                      <path d="M22 21.5C36.5 21.5 62 18.5 98 17" stroke="#00477e" strokeWidth="1.5" strokeLinecap="round" />
                    </svg>
                  </div>
                  
                  <div style={{ borderTop: "1px solid #888", display: "inline-block", alignSelf: "flex-end", width: 140, paddingTop: 3, color: "#666", fontSize: 7.5 }}>
                    Authorised Signatory
                  </div>
                </div>
              </div>

              {/* Electronically generated disclaimer footer */}
              <div style={{ textAlign: "center", fontSize: 8, color: "#777777", marginTop: 8, fontStyle: "italic" }}>
                This is an electronically generated document, no signature is required.
              </div>

            </div>
          </div>

        </div>
      )}

      {/* ─── TAB 2: DYNAMIC TAX & DUTY CALCULATOR ─── */}
      {activeTab === "calculator" && (
        <div style={{ display: "grid", gridTemplateColumns: "1fr 380px", gap: 24, alignItems: "start" }}>
          
          {/* Inputs */}
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            
            {/* Product & Pricing */}
            <div className="glass-card" style={{ padding: 24 }}>
              <h3 style={{ fontWeight: 700, fontSize: 15, marginBottom: 20, display: "flex", alignItems: "center", gap: 8 }}>
                <Package size={16} color="var(--accent)" /> Product & Pricing
              </h3>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
                <div style={{ gridColumn: "1 / -1" }}>
                  <InputLabel>Product Category</InputLabel>
                  <select className="input-field" value={inputs.productCategory} onChange={e => setInp("productCategory", e.target.value)}>
                    {Object.keys(GST_RATES).map(cat => (
                      <option key={cat} value={cat}>{cat} — {GST_RATES[cat].rate}% GST (HSN {GST_RATES[cat].hsn})</option>
                    ))}
                  </select>
                  {gstInfo && (
                    <div style={{ marginTop: 8, display: "flex", alignItems: "center", gap: 8 }}>
                      <span style={{ background: gstInfo.rate === 0 ? "var(--success-muted)" : gstInfo.rate <= 12 ? "var(--blue-muted)" : gstInfo.rate === 18 ? "var(--warning-muted)" : "var(--danger-muted)", color: gstInfo.rate === 0 ? "var(--success)" : gstInfo.rate <= 12 ? "var(--blue)" : gstInfo.rate === 18 ? "var(--warning)" : "var(--danger)", borderRadius: 50, padding: "3px 12px", fontSize: 12, fontWeight: 700 }}>
                        GST: {gstInfo.rate}%
                      </span>
                      <span style={{ fontSize: 12, color: "var(--text-muted)" }}>HSN: {gstInfo.hsn} · {gstInfo.category}</span>
                    </div>
                  )}
                </div>
                <NumInput label="Selling Price (₹ MRP)" value={inputs.sellingPrice} onChange={v => setInp("sellingPrice", v)} />
                <NumInput label="COGS / Unit (₹)" value={inputs.cogs} onChange={v => setInp("cogs", v)} />
                <NumInput label="FBA Fee (₹)" value={inputs.fbaFee} onChange={v => setInp("fbaFee", v)} />
                <NumInput label="Amazon Referral Fee %" value={inputs.referralFeeRate} onChange={v => setInp("referralFeeRate", v)} step={0.5} />
                <NumInput label="Ad Spend per Unit (₹)" value={inputs.adSpend} onChange={v => setInp("adSpend", v)} />
                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <label className="toggle">
                    <input type="checkbox" checked={inputs.supplierGSTIN} onChange={e => setInp("supplierGSTIN", e.target.checked)} />
                    <span className="toggle-slider" />
                  </label>
                  <div>
                    <div style={{ fontSize: 13, fontWeight: 600 }}>Supplier has GSTIN</div>
                    <div style={{ fontSize: 11, color: "var(--text-muted)" }}>Enables GST Input Tax Credit</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Import Duties */}
            <div className="glass-card" style={{ padding: 24 }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 20 }}>
                <h3 style={{ fontWeight: 700, fontSize: 15, display: "flex", alignItems: "center", gap: 8 }}>
                  <Globe size={16} color="var(--purple)" /> Import Duties (China/US/EU)
                </h3>
                <label style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <label className="toggle">
                    <input type="checkbox" checked={!inputs.isDomestic} onChange={e => setInp("isDomestic", !e.target.checked)} />
                    <span className="toggle-slider" />
                  </label>
                  <span style={{ fontSize: 13, fontWeight: 600 }}>Imported Product</span>
                </label>
              </div>

              {!inputs.isDomestic && (
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
                  <div>
                    <InputLabel>Origin Country</InputLabel>
                    <select className="input-field" value={inputs.originCountry} onChange={e => setInp("originCountry", e.target.value)}>
                      <option value="china">China 🇨🇳</option>
                      <option value="usa">USA 🇺🇸</option>
                      <option value="eu">EU 🇪🇺</option>
                      <option value="asean">ASEAN (Free Trade) 🌏</option>
                    </select>
                  </div>
                  <NumInput label="FOB Value (₹ / unit)" value={inputs.fobValue} onChange={v => setInp("fobValue", v)} />
                  <NumInput label="Freight + Insurance + CIF (₹)" value={inputs.freightCIF} onChange={v => setInp("freightCIF", v)} />
                  <div style={{ display: "flex", flexDirection: "column", justifyContent: "flex-end" }}>
                    <div style={{ background: "var(--warning-muted)", border: "1px solid var(--warning)", borderRadius: 10, padding: "10px 14px" }}>
                      <div style={{ fontSize: 12, color: "var(--warning)", fontWeight: 600 }}>BCD Rate: {result.bcdRate}%</div>
                      <div style={{ fontSize: 11, color: "var(--text-muted)", marginTop: 2 }}>+ 10% Social Welfare Charge on BCD</div>
                    </div>
                  </div>
                </div>
              )}

              {inputs.isDomestic && (
                <div style={{ padding: "20px", background: "var(--success-muted)", borderRadius: 10, display: "flex", alignItems: "center", gap: 10 }}>
                  <CheckCircle size={16} color="var(--success)" />
                  <span style={{ fontSize: 13, color: "var(--success)", fontWeight: 600 }}>Domestic product — no import duties applicable</span>
                </div>
              )}
            </div>
          </div>

          {/* Results Sidebar */}
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            
            {/* Margin gauge */}
            <div className="glass-card" style={{ padding: 24, textAlign: "center" }}>
              <h3 style={{ fontWeight: 700, fontSize: 14, marginBottom: 16 }}>Effective Net Margin</h3>
              <div style={{ position: "relative", display: "inline-block", marginBottom: 12 }}>
                <svg width="130" height="130" viewBox="0 0 130 130">
                  <circle cx="65" cy="65" r="54" fill="none" stroke="var(--border)" strokeWidth="10" />
                  <circle cx="65" cy="65" r="54" fill="none"
                    stroke={result.effectiveMargin > 20 ? "var(--success)" : result.effectiveMargin > 10 ? "var(--warning)" : "var(--danger)"}
                    strokeWidth="10"
                    strokeDasharray={`${Math.max(0, (result.effectiveMargin / 100) * 339)} 339`}
                    strokeLinecap="round" transform="rotate(-90 65 65)"
                    style={{ transition: "all 0.5s ease" }} />
                </svg>
                <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
                  <span style={{ fontSize: 26, fontWeight: 900, color: result.effectiveMargin > 20 ? "var(--success)" : result.effectiveMargin > 10 ? "var(--warning)" : "var(--danger)" }}>
                    {result.effectiveMargin.toFixed(1)}%
                  </span>
                  <span style={{ fontSize: 11, color: "var(--text-muted)" }}>net margin</span>
                </div>
              </div>
              <div style={{ fontSize: 14, fontWeight: 700, color: result.netProfit > 0 ? "var(--success)" : "var(--danger)" }}>
                {result.netProfit > 0 ? `Profit: ${fmt(result.netProfit)}` : `Loss: ${fmt(result.netProfit)}`} / unit
              </div>
              {result.effectiveMargin < 15 && (
                <div style={{ marginTop: 12, background: "var(--warning-muted)", border: "1px solid var(--warning)", borderRadius: 8, padding: "8px 12px", fontSize: 12, color: "var(--warning)" }}>
                  ⚠️ Margin below 15% — consider reducing ad spend or COGS
                </div>
              )}
            </div>

            {/* P&L Breakdown */}
            <div className="glass-card" style={{ padding: 20 }}>
              <h3 style={{ fontWeight: 700, fontSize: 14, marginBottom: 16, display: "flex", alignItems: "center", gap: 8 }}>
                <Calculator size={15} color="var(--accent)" /> Unit P&amp;L Breakdown
              </h3>
              <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                {breakdown.map(row => (
                  <div key={row.label} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: row.bold ? "10px 12px" : "7px 12px", borderRadius: 8, background: row.bold ? (result.netProfit > 0 ? "var(--success-muted)" : "var(--danger-muted)") : "transparent", border: row.bold ? `1px solid ${result.netProfit > 0 ? "rgba(52,199,89,0.3)" : "rgba(255,69,58,0.3)"}` : "none" }}>
                    <span style={{ fontSize: 13, color: "var(--text-secondary)", fontWeight: row.bold ? 700 : 400 }}>{row.label}</span>
                    <span style={{ fontSize: 13, fontWeight: row.bold ? 800 : 600, color: row.color }}>
                      {row.value >= 0 ? "+" : "−"}{fmt(Math.abs(row.value))}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* GST Summary */}
            {!inputs.isDomestic && (
              <div className="glass-card" style={{ padding: 16 }}>
                <h3 style={{ fontWeight: 700, fontSize: 13, marginBottom: 12, color: "var(--purple)" }}>Import Duty Breakdown</h3>
                <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                  {[
                    { label: "BCD Rate", value: `${result.bcdRate}%` },
                    { label: "BCD Amount", value: fmt(result.bcdAmount) },
                    { label: "Social Welfare Charge (10% of BCD)", value: fmt(result.bcdAmount * 0.10) },
                    { label: "IGST on Import", value: fmt(result.igstOnImport) },
                    { label: "Total Landed Cost", value: fmt(result.landedCost), bold: true },
                  ].map(r => (
                    <div key={r.label} style={{ display: "flex", justifyContent: "space-between", fontSize: 12, padding: "5px 0", borderBottom: "1px solid var(--border)" }}>
                      <span style={{ color: "var(--text-muted)" }}>{r.label}</span>
                      <span style={{ fontWeight: r.bold ? 700 : 600, color: r.bold ? "var(--danger)" : "var(--text-primary)" }}>{r.value}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

          </div>

        </div>
      )}

    </div>
  );
}

// Helper components
function InputLabel({ children }: { children: React.ReactNode }) {
  return <label style={{ display: "block", fontSize: 11, color: "var(--text-muted)", fontWeight: 600, marginBottom: 6, textTransform: "uppercase", letterSpacing: "0.06em" }}>{children}</label>;
}

function NumInput({ label, value, onChange, step = 1 }: { label: string; value: number; onChange: (v: number) => void; step?: number }) {
  return (
    <div>
      <InputLabel>{label}</InputLabel>
      <input className="input-field" type="number" step={step} value={value} onChange={e => onChange(Number(e.target.value))} />
    </div>
  );
}
