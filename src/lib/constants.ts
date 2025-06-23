// Shared constants for customer identification
export const CURRENT_CUSTOMER_NAMES = [
  'شركهكانلصناعهوتعبئهالعلب', 
  'شركةكان', 
  'شركةكانلصناعةوتعبئةالعلب', 
  'كانلصناعةوتعبئةالعلب', 
  'شركهكانلصناعهوتعبيئهالعلب',
  'Can For Manufacturing and Filling Cans',
  'Can Company For Manufacturing And Filling Cans'
];

export const CURRENT_CUSTOMER_ETAID = "204942527"; 

export const EGYPTIAN_BANKS = {
  BANQUE_MISR: 'Banque Misr (BM)',
  NATIONAL_BANK_OF_EGYPT: 'National Bank of Egypt (NBE)',
  EGYPTIAN_ARAB_LAND_BANK: 'Egyptian Arab Land Bank (EALB)',
  AGRICULTURAL_BANK_OF_EGYPT: 'Agricultural Bank of Egypt (ABE)',
  INDUSTRIAL_DEVELOPMENT_BANK_OF_EGYPT: 'Industrial Development Bank of Egypt (IDB)',
  BANQUE_DU_CAIRE: 'Banque du Caire (BC)',
  AHLI_UNITED_BANK: 'Ahli United Bank (AUB)',
  BANK_OF_ALEXANDRIA: 'Bank of Alexandria (AlexBank)',
  MIDBANK: 'MIDBank (MIDBank)',
  COMMERCIAL_INTERNATIONAL_BANK: 'Commercial International Bank (CIB)',
  ATTIJARIWAFA_BANK_EGYPT: 'Attijariwafa Bank Egypt (AWB Egypt)',
  SOCIETE_ARABE_INTERNATIONALE_DE_BANQUE: 'Société Arabe Internationale de Banque (SAIB)',
  CREDIT_AGRICOLE_EGYPT: 'Crédit Agricole Egypt (CAE)',
  EMIRATES_NATIONAL_BANK_OF_DUBAI_EGYPT: 'Emirates National Bank of Dubai - Egypt (Emirates NBD)',
  SUEZ_CANAL_BANK: 'Suez Canal Bank (SCB)',
  QNB_AL_AHLI: 'QNB Al Ahli (QNB)',
  BANK_NXT: 'Bank NXT (Bank NXT)',
  AL_AHLI_BANK_OF_KUWAIT: 'Al Ahli Bank of Kuwait (ABK)',
  FIRST_ABU_DHABI_BANK: 'First Abu Dhabi Bank (FAB)',
  KUWAIT_FINANCE_HOUSE: 'Kuwait Finance House (KFH)',
  FAISAL_ISLAMIC_BANK_OF_EGYPT: 'Faisal Islamic Bank of Egypt (FIBE)',
  HOUSING_AND_DEVELOPMENT_BANK: 'Housing and Development Bank (HDB)',
  AL_BARAKA_BANK_EGYPT: 'Al Baraka Bank Egypt (Al Baraka)',
  NATIONAL_BANK_OF_KUWAIT: 'National Bank of Kuwait (NBK)',
  ABU_DHABI_ISLAMIC_BANK: 'Abu Dhabi Islamic Bank (ADIB)',
  ABU_DHABI_COMMERCIAL_BANK: 'Abu Dhabi Commercial Bank (ADCB)',
  EGYPTIAN_GULF_BANK: 'Egyptian Gulf Bank (EG Bank)',
  ARAB_AFRICAN_INTERNATIONAL_BANK: 'Arab African International Bank (AAIB)',
  HSBC_BANK_EGYPT: 'HSBC Bank Egypt (HSBC)',
  ARAB_BANKING_CORPORATION_EGYPT: 'Arab Banking Corporation - Egypt (Bank ABC)',
  EXPORT_DEVELOPMENT_BANK_OF_EGYPT: 'Export Development Bank of Egypt (E-Bank)',
  ARAB_INTERNATIONAL_BANK: 'Arab International Bank (AIB)',
} as const;

export type EgyptianBankKey = keyof typeof EGYPTIAN_BANKS;

// Helper function to get display name from enum key
export function getEgyptianBankDisplayName(bankKey: EgyptianBankKey): string {
  return EGYPTIAN_BANKS[bankKey];
}

// Helper function to find bank display name from partial match or return the closest match
export function findEgyptianBankDisplayName(bankName: string): string | null {
  if (!bankName) return null;
  
  const normalizedInput = bankName.toLowerCase().trim();
  
  // First, try exact match with display names
  for (const displayName of Object.values(EGYPTIAN_BANKS)) {
    if (displayName.toLowerCase() === normalizedInput) {
      return displayName;
    }
  }
  
  // Then try matching with abbreviations and partial names
  const bankMappings: Record<string, string> = {
    'banque misr': EGYPTIAN_BANKS.BANQUE_MISR,
    'bm': EGYPTIAN_BANKS.BANQUE_MISR,
    'national bank of egypt': EGYPTIAN_BANKS.NATIONAL_BANK_OF_EGYPT,
    'nbe': EGYPTIAN_BANKS.NATIONAL_BANK_OF_EGYPT,
    'egyptian arab land bank': EGYPTIAN_BANKS.EGYPTIAN_ARAB_LAND_BANK,
    'ealb': EGYPTIAN_BANKS.EGYPTIAN_ARAB_LAND_BANK,
    'agricultural bank': EGYPTIAN_BANKS.AGRICULTURAL_BANK_OF_EGYPT,
    'abe': EGYPTIAN_BANKS.AGRICULTURAL_BANK_OF_EGYPT,
    'industrial development bank': EGYPTIAN_BANKS.INDUSTRIAL_DEVELOPMENT_BANK_OF_EGYPT,
    'idb': EGYPTIAN_BANKS.INDUSTRIAL_DEVELOPMENT_BANK_OF_EGYPT,
    'banque du caire': EGYPTIAN_BANKS.BANQUE_DU_CAIRE,
    'bc': EGYPTIAN_BANKS.BANQUE_DU_CAIRE,
    'united bank': EGYPTIAN_BANKS.AHLI_UNITED_BANK,
    'ahli united bank': EGYPTIAN_BANKS.AHLI_UNITED_BANK,
    'ub': EGYPTIAN_BANKS.AHLI_UNITED_BANK,
    'aub': EGYPTIAN_BANKS.AHLI_UNITED_BANK,
    'bank of alexandria': EGYPTIAN_BANKS.BANK_OF_ALEXANDRIA,
    'alexbank': EGYPTIAN_BANKS.BANK_OF_ALEXANDRIA,
    'midbank': EGYPTIAN_BANKS.MIDBANK,
    'commercial international bank': EGYPTIAN_BANKS.COMMERCIAL_INTERNATIONAL_BANK,
    'cib': EGYPTIAN_BANKS.COMMERCIAL_INTERNATIONAL_BANK,
    'attijariwafa': EGYPTIAN_BANKS.ATTIJARIWAFA_BANK_EGYPT,
    'awb egypt': EGYPTIAN_BANKS.ATTIJARIWAFA_BANK_EGYPT,
    'saib': EGYPTIAN_BANKS.SOCIETE_ARABE_INTERNATIONALE_DE_BANQUE,
    'société arabe internationale': EGYPTIAN_BANKS.SOCIETE_ARABE_INTERNATIONALE_DE_BANQUE,
    'crédit agricole': EGYPTIAN_BANKS.CREDIT_AGRICOLE_EGYPT,
    'cae': EGYPTIAN_BANKS.CREDIT_AGRICOLE_EGYPT,
    'emirates nbd': EGYPTIAN_BANKS.EMIRATES_NATIONAL_BANK_OF_DUBAI_EGYPT,
    'emirates national bank': EGYPTIAN_BANKS.EMIRATES_NATIONAL_BANK_OF_DUBAI_EGYPT,
    'suez canal bank': EGYPTIAN_BANKS.SUEZ_CANAL_BANK,
    'scb': EGYPTIAN_BANKS.SUEZ_CANAL_BANK,
    'qnb': EGYPTIAN_BANKS.QNB_AL_AHLI,
    'qnb al ahli': EGYPTIAN_BANKS.QNB_AL_AHLI,
    'bank nxt': EGYPTIAN_BANKS.BANK_NXT,
    'al ahli bank of kuwait': EGYPTIAN_BANKS.AL_AHLI_BANK_OF_KUWAIT,
    'abk': EGYPTIAN_BANKS.AL_AHLI_BANK_OF_KUWAIT,
    'first abu dhabi bank': EGYPTIAN_BANKS.FIRST_ABU_DHABI_BANK,
    'fab': EGYPTIAN_BANKS.FIRST_ABU_DHABI_BANK,
    'kuwait finance house': EGYPTIAN_BANKS.KUWAIT_FINANCE_HOUSE,
    'kfh': EGYPTIAN_BANKS.KUWAIT_FINANCE_HOUSE,
    'faisal islamic bank': EGYPTIAN_BANKS.FAISAL_ISLAMIC_BANK_OF_EGYPT,
    'fibe': EGYPTIAN_BANKS.FAISAL_ISLAMIC_BANK_OF_EGYPT,
    'housing and development bank': EGYPTIAN_BANKS.HOUSING_AND_DEVELOPMENT_BANK,
    'hdb': EGYPTIAN_BANKS.HOUSING_AND_DEVELOPMENT_BANK,
    'al baraka': EGYPTIAN_BANKS.AL_BARAKA_BANK_EGYPT,
    'baraka': EGYPTIAN_BANKS.AL_BARAKA_BANK_EGYPT,
    'national bank of kuwait': EGYPTIAN_BANKS.NATIONAL_BANK_OF_KUWAIT,
    'nbk': EGYPTIAN_BANKS.NATIONAL_BANK_OF_KUWAIT,
    'abu dhabi islamic bank': EGYPTIAN_BANKS.ABU_DHABI_ISLAMIC_BANK,
    'adib': EGYPTIAN_BANKS.ABU_DHABI_ISLAMIC_BANK,
    'abu dhabi commercial bank': EGYPTIAN_BANKS.ABU_DHABI_COMMERCIAL_BANK,
    'adcb': EGYPTIAN_BANKS.ABU_DHABI_COMMERCIAL_BANK,
    'egyptian gulf bank': EGYPTIAN_BANKS.EGYPTIAN_GULF_BANK,
    'eg bank': EGYPTIAN_BANKS.EGYPTIAN_GULF_BANK,
    'arab african international bank': EGYPTIAN_BANKS.ARAB_AFRICAN_INTERNATIONAL_BANK,
    'aaib': EGYPTIAN_BANKS.ARAB_AFRICAN_INTERNATIONAL_BANK,
    'hsbc': EGYPTIAN_BANKS.HSBC_BANK_EGYPT,
    'hsbc bank egypt': EGYPTIAN_BANKS.HSBC_BANK_EGYPT,
    'arab banking corporation': EGYPTIAN_BANKS.ARAB_BANKING_CORPORATION_EGYPT,
    'bank abc': EGYPTIAN_BANKS.ARAB_BANKING_CORPORATION_EGYPT,
    'export development bank': EGYPTIAN_BANKS.EXPORT_DEVELOPMENT_BANK_OF_EGYPT,
    'e-bank': EGYPTIAN_BANKS.EXPORT_DEVELOPMENT_BANK_OF_EGYPT,
    'arab international bank': EGYPTIAN_BANKS.ARAB_INTERNATIONAL_BANK,
    'aib': EGYPTIAN_BANKS.ARAB_INTERNATIONAL_BANK,
  };
  
  // Try exact match with mappings
  if (bankMappings[normalizedInput]) {
    return bankMappings[normalizedInput];
  }
  
  // Try partial matches
  for (const [searchTerm, displayName] of Object.entries(bankMappings)) {
    if (normalizedInput.includes(searchTerm) || searchTerm.includes(normalizedInput)) {
      return displayName;
    }
  }
  
  return null;
}

// Helper function to check if a bank name is in the Egyptian banks list
export function isEgyptianBank(bankName: string): boolean {
  return findEgyptianBankDisplayName(bankName) !== null;
} 