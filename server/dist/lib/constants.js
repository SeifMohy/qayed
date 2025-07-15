// Egyptian banks mapping for bank name normalization
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
};
// Function to find Egyptian bank display name from input text
export function findEgyptianBankDisplayName(inputText) {
    if (!inputText || typeof inputText !== 'string') {
        return null;
    }
    const normalizedInput = inputText.toLowerCase().trim();
    // Direct match with values (Arabic names)
    for (const [key, value] of Object.entries(EGYPTIAN_BANKS)) {
        if (value.toLowerCase().includes(normalizedInput) ||
            normalizedInput.includes(value.toLowerCase())) {
            return value;
        }
    }
    // Match with keys (English identifiers)
    for (const [key, value] of Object.entries(EGYPTIAN_BANKS)) {
        if (key.toLowerCase().includes(normalizedInput) ||
            normalizedInput.includes(key.toLowerCase())) {
            return value;
        }
    }
    return null;
}
// PDF Configuration
export const PDF_CONFIG = {
    MAX_PAGES_PER_CHUNK: 5,
    PROCESSING_DELAY: 1000, // 1 second delay between chunks
    MAX_RETRIES: 3,
    RETRY_BASE_DELAY: 2000, // 2 seconds base delay for retries
};
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
//# sourceMappingURL=constants.js.map