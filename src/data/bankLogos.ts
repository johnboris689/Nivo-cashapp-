export interface BankLogoInfo {
  name: string;
  logoUrl: string;
  code?: string;
  initials: string;
  gradient: string;
}

// Mapping from Bank Name or Bank Code -> Official Local SVG Asset
export const BANK_LOGO_MAP: Record<string, { logoUrl: string; code: string; initials: string; gradient: string }> = {
  "9PSB": {
    logoUrl: "/bank-logos/9psb.svg",
    code: "120001",
    initials: "9P",
    gradient: "from-slate-800 to-slate-900"
  },
  "Access Bank Limited": {
    logoUrl: "/bank-logos/access_bank_limited.svg",
    code: "044",
    initials: "AB",
    gradient: "from-slate-800 to-slate-900"
  },
  "Access Holdings Plc": {
    logoUrl: "/bank-logos/access_holdings_plc.svg",
    code: "044",
    initials: "AH",
    gradient: "from-slate-800 to-slate-900"
  },
  "Aella App": {
    logoUrl: "/bank-logos/aella_app.svg",
    code: "50315",
    initials: "AA",
    gradient: "from-slate-800 to-slate-900"
  },
  "Airtel Money": {
    logoUrl: "/bank-logos/airtel_money.svg",
    code: "120004",
    initials: "AM",
    gradient: "from-slate-800 to-slate-900"
  },
  "Alternative Bank Limited": {
    logoUrl: "/bank-logos/alternative_bank_limited.svg",
    code: "000032",
    initials: "AB",
    gradient: "from-slate-800 to-slate-900"
  },
  "Carbon": {
    logoUrl: "/bank-logos/carbon.svg",
    code: "565",
    initials: "CA",
    gradient: "from-slate-800 to-slate-900"
  },
  "Chipper Cash": {
    logoUrl: "/bank-logos/chipper_cash.svg",
    code: "50315",
    initials: "CC",
    gradient: "from-slate-800 to-slate-900"
  },
  "Citibank Nigeria Limited": {
    logoUrl: "/bank-logos/citibank_nigeria_limited.svg",
    code: "023",
    initials: "CN",
    gradient: "from-slate-800 to-slate-900"
  },
  "Coronation Merchant Bank Limited": {
    logoUrl: "/bank-logos/coronation_merchant_bank_limited.svg",
    code: "060001",
    initials: "CM",
    gradient: "from-slate-800 to-slate-900"
  },
  "Cowrywise": {
    logoUrl: "/bank-logos/cowrywise.svg",
    code: "50315",
    initials: "CO",
    gradient: "from-slate-800 to-slate-900"
  },
  "Ecobank Nigeria Limited": {
    logoUrl: "/bank-logos/ecobank_nigeria_limited.svg",
    code: "050",
    initials: "EN",
    gradient: "from-slate-800 to-slate-900"
  },
  "Eyowo": {
    logoUrl: "/bank-logos/eyowo.svg",
    code: "090328",
    initials: "EY",
    gradient: "from-slate-800 to-slate-900"
  },
  "FairMoney": {
    logoUrl: "/bank-logos/fairmoney.svg",
    code: "51318",
    initials: "FA",
    gradient: "from-slate-800 to-slate-900"
  },
  "FBN Holdings Plc": {
    logoUrl: "/bank-logos/fbn_holdings_plc.svg",
    code: "011",
    initials: "FH",
    gradient: "from-slate-800 to-slate-900"
  },
  "FBN Merchant Bank Limited": {
    logoUrl: "/bank-logos/fbn_merchant_bank_limited.svg",
    code: "060002",
    initials: "FM",
    gradient: "from-slate-800 to-slate-900"
  },
  "FCMB Group Plc": {
    logoUrl: "/bank-logos/fcmb_group_plc.svg",
    code: "214",
    initials: "FG",
    gradient: "from-slate-800 to-slate-900"
  },
  "Fidelity Bank Plc": {
    logoUrl: "/bank-logos/fidelity_bank_plc.svg",
    code: "070",
    initials: "FB",
    gradient: "from-slate-800 to-slate-900"
  },
  "First Bank of Nigeria Limited": {
    logoUrl: "/bank-logos/first_bank_of_nigeria_limited.svg",
    code: "011",
    initials: "FB",
    gradient: "from-slate-800 to-slate-900"
  },
  "First City Monument Bank Limited (FCMB)": {
    logoUrl: "/bank-logos/first_city_monument_bank_limited_fcmb.svg",
    code: "214",
    initials: "FC",
    gradient: "from-slate-800 to-slate-900"
  },
  "FSDH Holding Company Limited": {
    logoUrl: "/bank-logos/fsdh_holding_company_limited.svg",
    code: "060003",
    initials: "FH",
    gradient: "from-slate-800 to-slate-900"
  },
  "FSDH Merchant Bank Limited": {
    logoUrl: "/bank-logos/fsdh_merchant_bank_limited.svg",
    code: "060003",
    initials: "FM",
    gradient: "from-slate-800 to-slate-900"
  },
  "Globus Bank Limited": {
    logoUrl: "/bank-logos/globus_bank_limited.svg",
    code: "000027",
    initials: "GB",
    gradient: "from-slate-800 to-slate-900"
  },
  "Greenwich Merchant Bank Limited": {
    logoUrl: "/bank-logos/greenwich_merchant_bank_limited.svg",
    code: "060004",
    initials: "GM",
    gradient: "from-slate-800 to-slate-900"
  },
  "Guaranty Trust Bank Limited (GTBank)": {
    logoUrl: "/bank-logos/guaranty_trust_bank_limited_gtbank.svg",
    code: "058",
    initials: "GT",
    gradient: "from-slate-800 to-slate-900"
  },
  "Guaranty Trust Holding Company Plc": {
    logoUrl: "/bank-logos/guaranty_trust_holding_company_plc.svg",
    code: "058",
    initials: "GT",
    gradient: "from-slate-800 to-slate-900"
  },
  "Heritage Bank Plc": {
    logoUrl: "/bank-logos/heritage_bank_plc.svg",
    code: "030",
    initials: "HB",
    gradient: "from-slate-800 to-slate-900"
  },
  "Hope PSB": {
    logoUrl: "/bank-logos/hope_psb.svg",
    code: "120002",
    initials: "HP",
    gradient: "from-slate-800 to-slate-900"
  },
  "Jaiz Bank Plc": {
    logoUrl: "/bank-logos/jaiz_bank_plc.svg",
    code: "035",
    initials: "JB",
    gradient: "from-slate-800 to-slate-900"
  },
  "Keystone Bank Limited": {
    logoUrl: "/bank-logos/keystone_bank_limited.svg",
    code: "082",
    initials: "KB",
    gradient: "from-slate-800 to-slate-900"
  },
  "Kuda Bank": {
    logoUrl: "/bank-logos/kuda_bank.svg",
    code: "50211",
    initials: "KB",
    gradient: "from-slate-800 to-slate-900"
  },
  "Lotus Bank Limited": {
    logoUrl: "/bank-logos/lotus_bank_limited.svg",
    code: "000029",
    initials: "LB",
    gradient: "from-slate-800 to-slate-900"
  },
  "Moniepoint": {
    logoUrl: "/bank-logos/moniepoint.svg",
    code: "50515",
    initials: "MO",
    gradient: "from-slate-800 to-slate-900"
  },
  "MoneyMaster PSB": {
    logoUrl: "/bank-logos/moneymaster_psb.svg",
    code: "120005",
    initials: "MP",
    gradient: "from-slate-800 to-slate-900"
  },
  "MTN MoMo PSB": {
    logoUrl: "/bank-logos/mtn_momo_psb.svg",
    code: "120003",
    initials: "MM",
    gradient: "from-slate-800 to-slate-900"
  },
  "Nova Merchant Bank Limited": {
    logoUrl: "/bank-logos/nova_merchant_bank_limited.svg",
    code: "060005",
    initials: "NM",
    gradient: "from-slate-800 to-slate-900"
  },
  "OPay": {
    logoUrl: "/bank-logos/opay.svg",
    code: "100004",
    initials: "OP",
    gradient: "from-slate-800 to-slate-900"
  },
  "Optimus Bank Limited": {
    logoUrl: "/bank-logos/optimus_bank_limited.svg",
    code: "000036",
    initials: "OB",
    gradient: "from-slate-800 to-slate-900"
  },
  "PalmPay": {
    logoUrl: "/bank-logos/palmpay.svg",
    code: "100033",
    initials: "PA",
    gradient: "from-slate-800 to-slate-900"
  },
  "Parallex Bank Limited": {
    logoUrl: "/bank-logos/parallex_bank_limited.svg",
    code: "526",
    initials: "PB",
    gradient: "from-slate-800 to-slate-900"
  },
  "PiggyVest": {
    logoUrl: "/bank-logos/piggyvest.svg",
    code: "51229",
    initials: "PI",
    gradient: "from-slate-800 to-slate-900"
  },
  "Polaris Bank Limited": {
    logoUrl: "/bank-logos/polaris_bank_limited.svg",
    code: "076",
    initials: "PB",
    gradient: "from-slate-800 to-slate-900"
  },
  "Premium Trust Bank Limited": {
    logoUrl: "/bank-logos/premium_trust_bank_limited.svg",
    code: "000031",
    initials: "PT",
    gradient: "from-slate-800 to-slate-900"
  },
  "Providus Bank Limited": {
    logoUrl: "/bank-logos/providus_bank_limited.svg",
    code: "101",
    initials: "PB",
    gradient: "from-slate-800 to-slate-900"
  },
  "Rand Merchant Bank Limited": {
    logoUrl: "/bank-logos/rand_merchant_bank_limited.svg",
    code: "060006",
    initials: "RM",
    gradient: "from-slate-800 to-slate-900"
  },
  "Rubies": {
    logoUrl: "/bank-logos/rubies.svg",
    code: "125",
    initials: "RU",
    gradient: "from-slate-800 to-slate-900"
  },
  "Signature Bank Limited": {
    logoUrl: "/bank-logos/signature_bank_limited.svg",
    code: "000034",
    initials: "SB",
    gradient: "from-slate-800 to-slate-900"
  },
  "SmartCash PSB": {
    logoUrl: "/bank-logos/smartcash_psb.svg",
    code: "120004",
    initials: "SP",
    gradient: "from-slate-800 to-slate-900"
  },
  "Spar": {
    logoUrl: "/bank-logos/spar.svg",
    code: "51310",
    initials: "SP",
    gradient: "from-slate-800 to-slate-900"
  },
  "Stanbic IBTC Bank Limited": {
    logoUrl: "/bank-logos/stanbic_ibtc_bank_limited.svg",
    code: "221",
    initials: "SI",
    gradient: "from-slate-800 to-slate-900"
  },
  "Stanbic IBTC Holdings Plc": {
    logoUrl: "/bank-logos/stanbic_ibtc_holdings_plc.svg",
    code: "221",
    initials: "SI",
    gradient: "from-slate-800 to-slate-900"
  },
  "Standard Chartered Bank Limited": {
    logoUrl: "/bank-logos/standard_chartered_bank_limited.svg",
    code: "068",
    initials: "SC",
    gradient: "from-slate-800 to-slate-900"
  },
  "Sterling Bank Limited": {
    logoUrl: "/bank-logos/sterling_bank_limited.svg",
    code: "232",
    initials: "SB",
    gradient: "from-slate-800 to-slate-900"
  },
  "Sterling Financial Holdings Limited": {
    logoUrl: "/bank-logos/sterling_financial_holdings_limited.svg",
    code: "232",
    initials: "SF",
    gradient: "from-slate-800 to-slate-900"
  },
  "SunTrust Bank Nigeria Limited": {
    logoUrl: "/bank-logos/suntrust_bank_nigeria_limited.svg",
    code: "100",
    initials: "SB",
    gradient: "from-slate-800 to-slate-900"
  },
  "Taj Bank Limited": {
    logoUrl: "/bank-logos/taj_bank_limited.svg",
    code: "000026",
    initials: "TB",
    gradient: "from-slate-800 to-slate-900"
  },
  "Titan Trust Bank Limited": {
    logoUrl: "/bank-logos/titan_trust_bank_limited.svg",
    code: "000025",
    initials: "TT",
    gradient: "from-slate-800 to-slate-900"
  },
  "UBA (United Bank for Africa Plc)": {
    logoUrl: "/bank-logos/uba_united_bank_for_africa_plc.svg",
    code: "033",
    initials: "UU",
    gradient: "from-slate-800 to-slate-900"
  },
  "Union Bank of Nigeria Plc": {
    logoUrl: "/bank-logos/union_bank_of_nigeria_plc.svg",
    code: "032",
    initials: "UB",
    gradient: "from-slate-800 to-slate-900"
  },
  "Unity Bank Plc": {
    logoUrl: "/bank-logos/unity_bank_plc.svg",
    code: "215",
    initials: "UB",
    gradient: "from-slate-800 to-slate-900"
  },
  "V Bank": {
    logoUrl: "/bank-logos/v_bank.svg",
    code: "566",
    initials: "VB",
    gradient: "from-slate-800 to-slate-900"
  },
  "Wema Bank Plc": {
    logoUrl: "/bank-logos/wema_bank_plc.svg",
    code: "035",
    initials: "WB",
    gradient: "from-slate-800 to-slate-900"
  },
  "Zenith Bank Plc": {
    logoUrl: "/bank-logos/zenith_bank_plc.svg",
    code: "057",
    initials: "ZB",
    gradient: "from-slate-800 to-slate-900"
  },
};

// Secondary lookup table by Bank Code
export const BANK_CODE_TO_NAME: Record<string, string> = {
  "120001": "9PSB",
  "044": "Access Bank Limited",
  "063": "Access Bank Limited",
  "50315": "Aella App",
  "120004": "Airtel Money",
  "090412": "Airtel Money",
  "000032": "Alternative Bank Limited",
  "100032": "Alternative Bank Limited",
  "565": "Carbon",
  "090130": "Carbon",
  "090315": "Chipper Cash",
  "023": "Citibank Nigeria Limited",
  "060001": "Coronation Merchant Bank Limited",
  "050": "Ecobank Nigeria Limited",
  "090328": "Eyowo",
  "50126": "Eyowo",
  "51318": "FairMoney",
  "090551": "FairMoney",
  "011": "FBN Holdings Plc",
  "060002": "FBN Merchant Bank Limited",
  "214": "FCMB Group Plc",
  "070": "Fidelity Bank Plc",
  "060003": "FSDH Holding Company Limited",
  "000027": "Globus Bank Limited",
  "103": "Globus Bank Limited",
  "060004": "Greenwich Merchant Bank Limited",
  "058": "Guaranty Trust Bank Limited (GTBank)",
  "030": "Heritage Bank Plc",
  "120002": "Hope PSB",
  "035": "Jaiz Bank Plc",
  "082": "Keystone Bank Limited",
  "50211": "Kuda Bank",
  "090267": "Kuda Bank",
  "000029": "Lotus Bank Limited",
  "50515": "Moniepoint",
  "090129": "Moniepoint",
  "000028": "Moniepoint",
  "120005": "MoneyMaster PSB",
  "120003": "MTN MoMo PSB",
  "060005": "Nova Merchant Bank Limited",
  "000033": "Nova Merchant Bank Limited",
  "100004": "OPay",
  "090110": "OPay",
  "304": "OPay",
  "000010": "OPay",
  "000036": "Optimus Bank Limited",
  "100033": "PalmPay",
  "090405": "PalmPay",
  "526": "Parallex Bank Limited",
  "000030": "Parallex Bank Limited",
  "51229": "PiggyVest",
  "076": "Polaris Bank Limited",
  "000031": "Premium Trust Bank Limited",
  "101": "Providus Bank Limited",
  "060006": "Rand Merchant Bank Limited",
  "125": "Rubies",
  "090175": "Rubies",
  "000034": "Signature Bank Limited",
  "51310": "Spar",
  "221": "Stanbic IBTC Bank Limited",
  "068": "Standard Chartered Bank Limited",
  "232": "Sterling Bank Limited",
  "100": "SunTrust Bank Nigeria Limited",
  "000026": "Taj Bank Limited",
  "000025": "Titan Trust Bank Limited",
  "033": "UBA (United Bank for Africa Plc)",
  "032": "Union Bank of Nigeria Plc",
  "215": "Unity Bank Plc",
  "566": "V Bank",
  "057": "Zenith Bank Plc",
};

export function getBankLogoInfo(identifier: string): BankLogoInfo {
  if (!identifier) {
    return {
      name: "Bank",
      logoUrl: "",
      initials: "BK",
      gradient: "from-slate-800 to-slate-900"
    };
  }

  // 1. Direct match by exact bank name
  if (BANK_LOGO_MAP[identifier]) {
    return {
      name: identifier,
      ...BANK_LOGO_MAP[identifier]
    };
  }

  // 2. Match by Bank Code
  const nameFromCode = BANK_CODE_TO_NAME[identifier];
  if (nameFromCode && BANK_LOGO_MAP[nameFromCode]) {
    return {
      name: nameFromCode,
      ...BANK_LOGO_MAP[nameFromCode]
    };
  }

  // 3. Normalized case-insensitive name match
  const lowerId = identifier.toLowerCase().trim();
  for (const [bankName, info] of Object.entries(BANK_LOGO_MAP)) {
    if (bankName.toLowerCase() === lowerId) {
      return {
        name: bankName,
        ...info
      };
    }
  }

  // 4. Partial substring match
  for (const [bankName, info] of Object.entries(BANK_LOGO_MAP)) {
    const cleanBank = bankName.toLowerCase().replace(/[^a-z0-9]/g, "");
    const cleanQuery = lowerId.replace(/[^a-z0-9]/g, "");
    if (cleanBank.length > 3 && cleanQuery.length > 3 && (cleanBank.includes(cleanQuery) || cleanQuery.includes(cleanBank))) {
      return {
        name: bankName,
        ...info
      };
    }
  }

  // Neutral fallback if institution is not in official list
  const words = identifier.replace(/[^a-zA-Z0-9 ]/g, "").trim().split(/\s+/);
  let initials = "BK";
  if (words.length >= 2) {
    initials = (words[0][0] + words[1][0]).toUpperCase();
  } else if (words.length === 1 && words[0].length >= 2) {
    initials = words[0].substring(0, 2).toUpperCase();
  }

  return {
    name: identifier,
    logoUrl: "",
    initials,
    gradient: "from-slate-800 to-slate-900"
  };
}