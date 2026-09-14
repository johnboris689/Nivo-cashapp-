import os
import json

banks = [
  '9PSB', 'Access Bank Limited', 'Access Holdings Plc', 'Aella App', 'Airtel Money',
  'Alternative Bank Limited', 'Carbon', 'Chipper Cash', 'Citibank Nigeria Limited',
  'Coronation Merchant Bank Limited', 'Cowrywise', 'Ecobank Nigeria Limited', 'Eyowo',
  'FairMoney', 'FBN Holdings Plc', 'FBN Merchant Bank Limited', 'FCMB Group Plc',
  'Fidelity Bank Plc', 'First Bank of Nigeria Limited', 'First City Monument Bank Limited (FCMB)',
 'FSDH Holding Company Limited', 'FSDH Merchant Bank Limited',
  'Globus Bank Limited', 'Greenwich Merchant Bank Limited', 'Guaranty Trust Bank Limited (GTBank)',
  'Guaranty Trust Holding Company Plc', 'Heritage Bank Plc', 'Hope PSB', 'Jaiz Bank Plc',
  'Keystone Bank Limited', 'Kuda Bank', 'Lotus Bank Limited', 'Moniepoint', 'MoneyMaster PSB',
  'MTN MoMo PSB', 'Nova Merchant Bank Limited', 'OPay', 'Optimus Bank Limited', 'PalmPay',
  'Parallex Bank Limited', 'PiggyVest', 'Polaris Bank Limited', 'Premium Trust Bank Limited',
  'Providus Bank Limited', 'Rand Merchant Bank Limited', 'Rubies', 'Signature Bank Limited',
  'SmartCash PSB', 'Spar', 'Stanbic IBTC Bank Limited', 'Stanbic IBTC Holdings Plc',
  'Standard Chartered Bank Limited', 'Sterling Bank Limited', 'Sterling Financial Holdings Limited',
  'SunTrust Bank Nigeria Limited', 'Taj Bank Limited', 'Titan Trust Bank Limited',
  'UBA (United Bank for Africa Plc)', 'Union Bank of Nigeria Plc', 'Unity Bank Plc',
  'V Bank', 'Wema Bank Plc', 'Zenith Bank Plc'
]

bank_code_map = {
  '9PSB': ['120001'],
  'Access Bank Limited': ['044', '063'],
  'Access Holdings Plc': ['044', '063'],
  'Aella App': ['50315'],
  'Airtel Money': ['120004', '090412'],
  'Alternative Bank Limited': ['000032', '100032'],
  'Carbon': ['565', '090130'],
  'Chipper Cash': ['50315', '090315'],
  'Citibank Nigeria Limited': ['023'],
  'Coronation Merchant Bank Limited': ['060001'],
  'Cowrywise': ['50315'],
  'Ecobank Nigeria Limited': ['050'],
  'Eyowo': ['090328', '50126'],
  'FairMoney': ['51318', '090551'],
  'FBN Holdings Plc': ['011'],
  'FBN Merchant Bank Limited': ['060002'],
  'FCMB Group Plc': ['214'],
  'Fidelity Bank Plc': ['070'],
  'First Bank of Nigeria Limited': ['011'],
  'First City Monument Bank Limited (FCMB)': ['214'],
  'FSDH Holding Company Limited': ['060003'],
  'FSDH Merchant Bank Limited': ['060003'],
  'Globus Bank Limited': ['000027', '103'],
  'Greenwich Merchant Bank Limited': ['060004'],
  'Guaranty Trust Bank Limited (GTBank)': ['058'],
  'Guaranty Trust Holding Company Plc': ['058'],
  'Heritage Bank Plc': ['030'],
  'Hope PSB': ['120002'],
  'Jaiz Bank Plc': ['035'],
  'Keystone Bank Limited': ['082'],
  'Kuda Bank': ['50211', '090267'],
  'Lotus Bank Limited': ['000029'],
  'Moniepoint': ['50515', '090129', '000028'],
  'MoneyMaster PSB': ['120005'],
  'MTN MoMo PSB': ['120003'],
  'Nova Merchant Bank Limited': ['060005', '000033'],
  'OPay': ['100004', '090110', '304', '000010'],
  'Optimus Bank Limited': ['000036'],
  'PalmPay': ['100033', '090405'],
  'Parallex Bank Limited': ['526', '000030'],
  'PiggyVest': ['51229'],
  'Polaris Bank Limited': ['076'],
  'Premium Trust Bank Limited': ['000031'],
  'Providus Bank Limited': ['101'],
  'Rand Merchant Bank Limited': ['060006'],
  'Rubies': ['125', '090175'],
  'Signature Bank Limited': ['000034'],
  'SmartCash PSB': ['120004', '090412'],
  'Spar': ['51310'],
  'Stanbic IBTC Bank Limited': ['221'],
  'Stanbic IBTC Holdings Plc': ['221'],
  'Standard Chartered Bank Limited': ['068'],
  'Sterling Bank Limited': ['232'],
  'Sterling Financial Holdings Limited': ['232'],
  'SunTrust Bank Nigeria Limited': ['100'],
  'Taj Bank Limited': ['000026'],
  'Titan Trust Bank Limited': ['000025'],
  'UBA (United Bank for Africa Plc)': ['033'],
  'Union Bank of Nigeria Plc': ['032'],
  'Unity Bank Plc': ['215'],
  'V Bank': ['566', '090110'],
  'Wema Bank Plc': ['035'],
  'Zenith Bank Plc': ['057']
}

def sanitize_filename(name):
    return name.lower().replace(' ', '_').replace('(', '').replace(')', '').replace('/', '_') + '.svg'

lines = []
lines.append('export interface BankLogoInfo {')
lines.append('  name: string;')
lines.append('  logoUrl: string;')
lines.append('  code?: string;')
lines.append('  initials: string;')
lines.append('  gradient: string;')
lines.append('}')
lines.append('')
lines.append('// Mapping from Bank Name or Bank Code -> Official Local SVG Asset')
lines.append('export const BANK_LOGO_MAP: Record<string, { logoUrl: string; code: string; initials: string; gradient: string }> = {')

for b in banks:
    fname = sanitize_filename(b)
    logo_path = f'/bank-logos/{fname}'
    codes = bank_code_map.get(b, [])
    primary_code = codes[0] if codes else ''
    
    clean_words = b.replace('(', '').replace(')', '').split()
    if len(clean_words) >= 2:
        initials = (clean_words[0][0] + clean_words[1][0]).upper()
    else:
        initials = clean_words[0][:2].upper()
        
    lines.append(f'  {json.dumps(b)}: {{')
    lines.append(f'    logoUrl: {json.dumps(logo_path)},')
    lines.append(f'    code: {json.dumps(primary_code)},')
    lines.append(f'    initials: {json.dumps(initials)},')
    lines.append(f'    gradient: "from-slate-800 to-slate-900"')
    lines.append('  },')

lines.append('};')
lines.append('')

# Deduplicate BANK_CODE_TO_NAME keys
code_to_name_unique = {}
for b, codes in bank_code_map.items():
    for c in codes:
        if c not in code_to_name_unique:
            code_to_name_unique[c] = b

lines.append('// Secondary lookup table by Bank Code')
lines.append('export const BANK_CODE_TO_NAME: Record<string, string> = {')
for c, b in code_to_name_unique.items():
    lines.append(f'  {json.dumps(c)}: {json.dumps(b)},')

lines.append('};')
lines.append('')
lines.append('export function getBankLogoInfo(identifier: string): BankLogoInfo {')
lines.append('  if (!identifier) {')
lines.append('    return {')
lines.append('      name: "Bank",')
lines.append('      logoUrl: "",')
lines.append('      initials: "BK",')
lines.append('      gradient: "from-slate-800 to-slate-900"')
lines.append('    };')
lines.append('  }')
lines.append('')
lines.append('  // 1. Direct match by exact bank name')
lines.append('  if (BANK_LOGO_MAP[identifier]) {')
lines.append('    return {')
lines.append('      name: identifier,')
lines.append('      ...BANK_LOGO_MAP[identifier]')
lines.append('    };')
lines.append('  }')
lines.append('')
lines.append('  // 2. Match by Bank Code')
lines.append('  const nameFromCode = BANK_CODE_TO_NAME[identifier];')
lines.append('  if (nameFromCode && BANK_LOGO_MAP[nameFromCode]) {')
lines.append('    return {')
lines.append('      name: nameFromCode,')
lines.append('      ...BANK_LOGO_MAP[nameFromCode]')
lines.append('    };')
lines.append('  }')
lines.append('')
lines.append('  // 3. Normalized case-insensitive name match')
lines.append('  const lowerId = identifier.toLowerCase().trim();')
lines.append('  for (const [bankName, info] of Object.entries(BANK_LOGO_MAP)) {')
lines.append('    if (bankName.toLowerCase() === lowerId) {')
lines.append('      return {')
lines.append('        name: bankName,')
lines.append('        ...info')
lines.append('      };')
lines.append('    }')
lines.append('  }')
lines.append('')
lines.append('  // 4. Partial substring match')
lines.append('  for (const [bankName, info] of Object.entries(BANK_LOGO_MAP)) {')
lines.append('    const cleanBank = bankName.toLowerCase().replace(/[^a-z0-9]/g, "");')
lines.append('    const cleanQuery = lowerId.replace(/[^a-z0-9]/g, "");')
lines.append('    if (cleanBank.length > 3 && cleanQuery.length > 3 && (cleanBank.includes(cleanQuery) || cleanQuery.includes(cleanBank))) {')
lines.append('      return {')
lines.append('        name: bankName,')
lines.append('        ...info')
lines.append('      };')
lines.append('    }')
lines.append('  }')
lines.append('')
lines.append('  // Neutral fallback if institution is not in official list')
lines.append('  const words = identifier.replace(/[^a-zA-Z0-9 ]/g, "").trim().split(/\\s+/);')
lines.append('  let initials = "BK";')
lines.append('  if (words.length >= 2) {')
lines.append('    initials = (words[0][0] + words[1][0]).toUpperCase();')
lines.append('  } else if (words.length === 1 && words[0].length >= 2) {')
lines.append('    initials = words[0].substring(0, 2).toUpperCase();')
lines.append('  }')
lines.append('')
lines.append('  return {')
lines.append('    name: identifier,')
lines.append('    logoUrl: "",')
lines.append('    initials,')
lines.append('    gradient: "from-slate-800 to-slate-900"')
lines.append('  };')
lines.append('}')

with open('src/data/bankLogos.ts', 'w') as f:
    f.write('\n'.join(lines))

print('Updated src/data/bankLogos.ts with unique keys.')
