import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { CURRENT_CUSTOMER_NAMES, CURRENT_CUSTOMER_ETAID } from '@/lib/constants';
import { normalizeNames } from '@/lib/services/nameNormalizationService';
import type { NameToNormalize } from '@/lib/services/nameNormalizationService';
import { v4 as uuidv4 } from 'uuid';
import { xml2js } from 'xml-js';

// Initialize Prisma client directly in this file to ensure we use the correct client
// with all the models properly generated

export async function POST(request: NextRequest) {
  let processedCount = 0;
  let skippedCount = 0;
  let errorCount = 0;
  const errors: { invoiceNumber?: string; error: string }[] = [];
  const createdInvoices: any[] = [];
  let invoicesToProcess: any[] = [];

  try {
    const requestBody = await request.json();
    invoicesToProcess = Array.isArray(requestBody) ? requestBody : [requestBody];

    console.log(`🔵 Starting bulk invoice processing for ${invoicesToProcess.length} invoices...`);

    // Step 1: Extract all unique names that need normalization
    const namesToNormalize: NameToNormalize[] = [];
    const nameMapping = new Map<string, string>(); // original name -> unique ID

    for (const rawInvoice of invoicesToProcess) {
      const issuerName = rawInvoice.issuerName;
      const receiverName = rawInvoice.receiverName;

      // Create unique IDs for issuer and receiver names
      if (issuerName && !nameMapping.has(issuerName)) {
        const id = uuidv4();
        nameMapping.set(issuerName, id);
        namesToNormalize.push({
          id,
          name: issuerName,
          type: 'issuer'
        });
      }

      if (receiverName && !nameMapping.has(receiverName)) {
        const id = uuidv4();
        nameMapping.set(receiverName, id);
        namesToNormalize.push({
          id,
          name: receiverName,
          type: 'receiver'
        });
      }
    }

    console.log(`📝 Extracted ${namesToNormalize.length} unique names for normalization`);

    // Step 2: Send names to LLM for normalization
    let normalizedNamesMap = new Map<string, string>(); // original name -> normalized name
    
    if (namesToNormalize.length > 0) {
      try {
        console.log(`🤖 Sending ${namesToNormalize.length} names to LLM for normalization...`);
        const normalizationResult = await normalizeNames(namesToNormalize);
        
        // Create mapping from original names to normalized names
        for (const result of normalizationResult.normalizedNames) {
          const originalName = namesToNormalize.find(n => n.id === result.id)?.name;
          if (originalName) {
            normalizedNamesMap.set(originalName, result.normalizedName);
            console.log(`✨ Normalized: "${originalName}" → "${result.normalizedName}" (confidence: ${result.confidence})`);
          }
        }

        // Log any normalization errors
        if (normalizationResult.errors.length > 0) {
          console.warn(`⚠️ Name normalization errors:`, normalizationResult.errors);
        }

        console.log(`✅ Successfully normalized ${normalizedNamesMap.size} names`);
      } catch (error) {
        console.warn(`⚠️ Name normalization failed, using original names:`, error);
        // Fallback: use original names if normalization fails
        for (const nameItem of namesToNormalize) {
          normalizedNamesMap.set(nameItem.name, nameItem.name);
        }
      }
    }

    // Step 3: Process invoices with normalized names
    for (const rawInvoice of invoicesToProcess) {
      const internalId = rawInvoice.internalId || 'N/A'; // Use a default if internalId is missing
      try {
        // Enhanced document parsing to handle both JSON and XML formats
        let document: any;
        
        if (typeof rawInvoice.document === 'string') {
          // Always try JSON parsing first, regardless of format
          try {
            document = JSON.parse(rawInvoice.document);
            console.log(`✅ Successfully parsed document as JSON for invoice ${internalId}`);
          } catch (jsonError) {
            console.log(`📄 JSON parsing failed for invoice ${internalId}, attempting XML parsing...`);
            
            // If JSON fails, try XML parsing
            try {
              console.log(`🔄 Parsing XML document for invoice ${internalId}...`);
              
              // Add some basic XML validation and cleanup before parsing
              let xmlContent = rawInvoice.document.trim();
              
              // Check if it looks like XML
              if (!xmlContent.startsWith('<')) {
                throw new Error('Document does not appear to be valid XML (does not start with <)');
              }
              
              // Parse XML with error recovery options
              const xmlResult = xml2js(xmlContent, { 
                compact: true, 
                ignoreDeclaration: true, 
                ignoreInstruction: true, 
                ignoreComment: true, 
                ignoreDoctype: true,
                ignoreText: false,
                alwaysChildren: false,
                sanitize: false
              }) as any;
              
              // Transform XML structure to match expected JSON structure
              if (xmlResult.document) {
                const xmlDoc = xmlResult.document;
                document = {
                  issuer: {
                    id: xmlDoc.issuer?.id?._text || '',
                    name: xmlDoc.issuer?.name?._text || '',
                    address: {
                      country: xmlDoc.issuer?.address?.country?._text || '',
                      governate: xmlDoc.issuer?.address?.governate?._text || '',
                      regionCity: xmlDoc.issuer?.address?.regionCity?._text || '',
                      street: xmlDoc.issuer?.address?.street?._text || '',
                      buildingNumber: xmlDoc.issuer?.address?.buildingNumber?._text || '',
                      floor: xmlDoc.issuer?.address?.floor?._text || '',
                      room: xmlDoc.issuer?.address?.room?._text || '',
                      postalCode: xmlDoc.issuer?.address?.postalCode?._text || '',
                      landmark: xmlDoc.issuer?.address?.landmark?._text || '',
                      additionalInformation: xmlDoc.issuer?.address?.additionalInformation?._text || '',
                      branchID: xmlDoc.issuer?.address?.branchID?._text || ''
                    }
                  },
                  receiver: {
                    id: xmlDoc.receiver?.id?._text || '',
                    name: xmlDoc.receiver?.name?._text || '',
                    address: {
                      country: xmlDoc.receiver?.address?.country?._text || '',
                      governate: xmlDoc.receiver?.address?.governate?._text || '',
                      regionCity: xmlDoc.receiver?.address?.regionCity?._text || '',
                      street: xmlDoc.receiver?.address?.street?._text || '',
                      buildingNumber: xmlDoc.receiver?.address?.buildingNumber?._text || '',
                      floor: xmlDoc.receiver?.address?.floor?._text || '',
                      room: xmlDoc.receiver?.address?.room?._text || '',
                      postalCode: xmlDoc.receiver?.address?.postalCode?._text || '',
                      landmark: xmlDoc.receiver?.address?.landmark?._text || '',
                      additionalInformation: xmlDoc.receiver?.address?.additionalInformation?._text || ''
                    }
                  },
                  invoiceLines: [],
                  taxTotals: [],
                  totalAmount: 0,
                  totalDiscountAmount: 0
                };
                
                // Parse invoice lines
                if (xmlDoc.invoiceLines?.invoiceLine) {
                  const lines = Array.isArray(xmlDoc.invoiceLines.invoiceLine) 
                    ? xmlDoc.invoiceLines.invoiceLine 
                    : [xmlDoc.invoiceLines.invoiceLine];
                  
                  document.invoiceLines = lines.map((line: any) => ({
                    description: line.description?._text || '',
                    itemType: line.itemType?._text || '',
                    itemCode: line.itemCode?._text || '',
                    unitType: line.unitType?._text || '',
                    quantity: parseFloat(line.quantity?._text || '0'),
                    unitValue: {
                      currencySold: line.unitValue?.currencySold?._text || 'EGP',
                      amountSold: parseFloat(line.unitValue?.amountSold?._text || '0'),
                      amountEGP: parseFloat(line.unitValue?.amountEGP?._text || '0'),
                      currencyExchangeRate: parseFloat(line.unitValue?.currencyExchangeRate?._text || '1')
                    },
                    salesTotal: parseFloat(line.salesTotal?._text || '0'),
                    discount: {
                      rate: parseFloat(line.discount?.rate?._text || '0'),
                      amount: parseFloat(line.discount?.amount?._text || '0')
                    },
                    taxableItems: line.taxableItems?.taxableItem ? 
                      (Array.isArray(line.taxableItems.taxableItem) 
                        ? line.taxableItems.taxableItem 
                        : [line.taxableItems.taxableItem]).map((tax: any) => ({
                          taxType: tax.taxType?._text || '',
                          amount: parseFloat(tax.amount?._text || '0'),
                          subType: tax.subType?._text || '',
                          rate: parseFloat(tax.rate?._text || '0')
                        })) : [],
                    netTotal: parseFloat(line.netTotal?._text || '0'),
                    total: parseFloat(line.total?._text || '0')
                  }));
                }
                
                // Parse tax totals
                if (xmlDoc.taxTotals?.taxTotal) {
                  const taxes = Array.isArray(xmlDoc.taxTotals.taxTotal) 
                    ? xmlDoc.taxTotals.taxTotal 
                    : [xmlDoc.taxTotals.taxTotal];
                  
                  document.taxTotals = taxes.map((tax: any) => ({
                    taxType: tax.taxType?._text || '',
                    amount: parseFloat(tax.amount?._text || '0')
                  }));
                }
                
                // Set totals
                document.totalAmount = parseFloat(xmlDoc.totalAmount?._text || '0');
                document.totalDiscountAmount = parseFloat(xmlDoc.totalDiscountAmount?._text || '0');
                
                console.log(`✅ Successfully parsed XML document for invoice ${internalId}`);
              } else {
                throw new Error('Invalid XML structure: missing document root element');
              }
            } catch (xmlError: any) {
              console.error(`❌ Failed to parse XML document for invoice ${internalId}:`, xmlError.message);
              
              // For malformed XML, let's try to extract basic information from the raw invoice data
              console.log(`🔧 XML parsing failed, using fallback approach with basic document structure for invoice ${internalId}`);
              
              // Create a minimal document structure using available raw invoice data
              document = {
                issuer: {
                  id: '',
                  name: rawInvoice.issuerName || '',
                  address: {
                    country: 'EG', // Default fallback
                    governate: '',
                    regionCity: '',
                    street: '',
                    buildingNumber: '',
                    floor: '',
                    room: '',
                    postalCode: '',
                    landmark: '',
                    additionalInformation: '',
                    branchID: ''
                  }
                },
                receiver: {
                  id: '',
                  name: rawInvoice.receiverName || '',
                  address: {
                    country: 'EG', // Default fallback
                    governate: '',
                    regionCity: '',
                    street: '',
                    buildingNumber: '',
                    floor: '',
                    room: '',
                    postalCode: '',
                    landmark: '',
                    additionalInformation: ''
                  }
                },
                invoiceLines: [{
                  description: 'Document parsing failed - using fallback data',
                  itemType: 'SERVICE',
                  itemCode: '00000000',
                  unitType: 'EA',
                  quantity: 1,
                  unitValue: {
                    currencySold: 'EGP',
                    amountSold: rawInvoice.totalSales || 0,
                    amountEGP: rawInvoice.totalSales || 0,
                    currencyExchangeRate: 1
                  },
                  salesTotal: rawInvoice.totalSales || 0,
                  discount: {
                    rate: 0,
                    amount: rawInvoice.totalDiscount || 0
                  },
                  taxableItems: [],
                  netTotal: rawInvoice.netAmount || 0,
                  total: rawInvoice.total || 0
                }],
                taxTotals: [],
                totalAmount: rawInvoice.total || 0,
                totalDiscountAmount: rawInvoice.totalDiscount || 0
              };
              
              console.log(`🛠️ Created fallback document structure for invoice ${internalId}`);
            }
          }
        } else {
          // Document is already an object
          document = rawInvoice.document;
        }

        const taxAmount = Array.isArray(document.taxTotals)
          ? document.taxTotals.reduce((sum: number, t: any) => sum + Number(t.amount || 0), 0)
          : 0;

        // Improved currency extraction with better debugging
        const firstLine = Array.isArray(document.invoiceLines) && document.invoiceLines.length > 0
          ? document.invoiceLines[0]
          : null;
        
        // Enhanced currency extraction with fallback logic
        let currency = 'EGP'; // Default fallback
        let exchangeRate = 1; // Default fallback
        
        if (firstLine?.unitValue) {
          // Primary: Extract from currencySold
          if (firstLine.unitValue.currencySold) {
            currency = firstLine.unitValue.currencySold;
          }
          // Extract exchange rate
          if (firstLine.unitValue.currencyExchangeRate) {
            exchangeRate = firstLine.unitValue.currencyExchangeRate;
          }
        }
        
        // Debug logging for currency extraction
        console.log(`💱 Currency extraction for invoice ${internalId}:`, {
          hasInvoiceLines: Array.isArray(document.invoiceLines),
          invoiceLinesLength: document.invoiceLines?.length || 0,
          hasFirstLine: !!firstLine,
          hasUnitValue: !!firstLine?.unitValue,
          currencySold: firstLine?.unitValue?.currencySold,
          extractedCurrency: currency,
          exchangeRate: exchangeRate,
          fullUnitValue: firstLine?.unitValue
        });

        const issuerCountry = document.issuer?.address?.country || '';
        const receiverCountry = document.receiver?.address?.country || '';
        const issuerEtaId = document.issuer?.id || '';
        const receiverEtaId = document.receiver?.id || '';

        const totalDiscount = rawInvoice.totalDiscount ?? document.totalDiscountAmount ?? 0;
        const total = rawInvoice.total ?? document.totalAmount ?? 0;

        // Use normalized names if available, otherwise fall back to original names
        const normalizedIssuerName = normalizedNamesMap.get(rawInvoice.issuerName) || rawInvoice.issuerName;
        const normalizedReceiverName = normalizedNamesMap.get(rawInvoice.receiverName) || rawInvoice.receiverName;

        const invoiceData = {
          invoiceDate: new Date(rawInvoice.dateTimeIssued),
          invoiceNumber: rawInvoice.internalId,
          issuerName: normalizedIssuerName,
          receiverName: normalizedReceiverName,
          totalSales: rawInvoice.totalSales,
          totalDiscount,
          netAmount: rawInvoice.netAmount,
          total,
          invoiceStatus: rawInvoice.status,
          currency,
          exchangeRate,
          taxAmount,
          issuerCountry,
          receiverCountry,
          issuerEtaId: (issuerEtaId && issuerEtaId !== "0") ? issuerEtaId : '',
          receiverEtaId: (receiverEtaId && receiverEtaId !== "0") ? receiverEtaId : '',
          createdAt: new Date(),
          updatedAt: new Date(),
        };

        // Check for existing invoice
        const existingInvoice = await prisma.invoice.findFirst({
          where: {
            invoiceNumber: invoiceData.invoiceNumber,
            total: invoiceData.total, // Using total amount for duplication check
          },
        });

        if (existingInvoice) {
          console.log(`⏭️ Invoice ${invoiceData.invoiceNumber} already exists. Skipping.`);
          skippedCount++;
          continue;
        }

        console.log('📝 Prepared invoice data for:', invoiceData.invoiceNumber);
        console.log('🔍 Checking invoice type for:', invoiceData.invoiceNumber, {
          receiverName: normalizedReceiverName,
          issuerName: normalizedIssuerName,
          originalReceiverName: rawInvoice.receiverName,
          originalIssuerName: rawInvoice.issuerName,
          issuerEtaId: invoiceData.issuerEtaId, // Use sanitized Id
          receiverEtaId: invoiceData.receiverEtaId, // Use sanitized Id
          isCustomerByEtaId: invoiceData.issuerEtaId === CURRENT_CUSTOMER_ETAID,
          isSupplierByEtaId: invoiceData.receiverEtaId === CURRENT_CUSTOMER_ETAID,
          isCustomerByName: CURRENT_CUSTOMER_NAMES.includes(normalizedIssuerName),
          isSupplierByName: CURRENT_CUSTOMER_NAMES.includes(normalizedReceiverName),
        });

        let customerId: number | null = null;
        let supplierId: number | null = null;

        // Enhanced logic to accept all invoices and determine customer vs supplier based on available criteria
        // Priority 1: Check if this matches current customer by ETA ID or name (for customer invoices)
        const isCurrentCustomerAsIssuer = (invoiceData.issuerEtaId && invoiceData.issuerEtaId === CURRENT_CUSTOMER_ETAID) || CURRENT_CUSTOMER_NAMES.includes(normalizedIssuerName);
        const isCurrentCustomerAsReceiver = (invoiceData.receiverEtaId && invoiceData.receiverEtaId === CURRENT_CUSTOMER_ETAID) || CURRENT_CUSTOMER_NAMES.includes(normalizedReceiverName);

        if (isCurrentCustomerAsIssuer) {
          // This is a customer invoice (current customer is issuing to someone else)
          console.log(`👥 Processing as customer invoice for: ${invoiceData.invoiceNumber} (current customer as issuer)`);
          
          let customer = null;
          // Find customer by ETA ID first if available and not "0", then by name
          if (invoiceData.receiverEtaId) {
            customer = await prisma.customer.findFirst({ 
              where: { etaId: invoiceData.receiverEtaId } 
            });
          }
          
          if (!customer) {
            customer = await prisma.customer.findFirst({ 
              where: { name: normalizedReceiverName } 
            });
          }
          
          if (!customer) {
            console.log(`➕ Creating new customer: ${normalizedReceiverName}`);
            customer = await prisma.customer.create({
              data: {
                name: normalizedReceiverName,
                country: receiverCountry,
                etaId: invoiceData.receiverEtaId || null,
                createdAt: new Date(), 
                updatedAt: new Date(),
              },
            });
          }
          customerId = customer.id;
        } else if (isCurrentCustomerAsReceiver) {
          // This is a supplier invoice (someone else is issuing to current customer)
          console.log(`🏢 Processing as supplier invoice for: ${invoiceData.invoiceNumber} (current customer as receiver)`);
          
          let supplier = null;
          // Find supplier by ETA ID first if available and not "0", then by name
          if (invoiceData.issuerEtaId) {
            supplier = await prisma.supplier.findFirst({ 
              where: { etaId: invoiceData.issuerEtaId } 
            });
          }
          
          if (!supplier) {
            supplier = await prisma.supplier.findFirst({ 
              where: { name: normalizedIssuerName } 
            });
          }
          
          if (!supplier) {
            console.log(`➕ Creating new supplier: ${normalizedIssuerName}`);
            supplier = await prisma.supplier.create({
              data: {
                name: normalizedIssuerName,
                country: issuerCountry,
                etaId: invoiceData.issuerEtaId || null,
                createdAt: new Date(), 
                updatedAt: new Date(),
              },
            });
          }
          supplierId = supplier.id;
        } else {
          // Neither issuer nor receiver matches current customer - treat as external invoice
          // Default: treat as supplier invoice (external entity providing service/goods)
          console.log(`🔄 Processing as external supplier invoice for: ${invoiceData.invoiceNumber} (no current customer match)`);
          
          let supplier = null;
          // Find supplier by ETA ID first if available and not "0", then by name
          if (invoiceData.issuerEtaId) {
            supplier = await prisma.supplier.findFirst({ 
              where: { etaId: invoiceData.issuerEtaId } 
            });
          }
          
          if (!supplier) {
            supplier = await prisma.supplier.findFirst({ 
              where: { name: normalizedIssuerName } 
            });
          }
          
          if (!supplier) {
            console.log(`➕ Creating new external supplier: ${normalizedIssuerName}`);
            supplier = await prisma.supplier.create({
              data: {
                name: normalizedIssuerName,
                country: issuerCountry,
                etaId: invoiceData.issuerEtaId || null,
                createdAt: new Date(), 
                updatedAt: new Date(),
              },
            });
          }
          supplierId = supplier.id;
          
          // Also create a customer record for the receiver if it doesn't exist
          let customer = null;
          if (invoiceData.receiverEtaId) {
            customer = await prisma.customer.findFirst({ 
              where: { etaId: invoiceData.receiverEtaId } 
            });
          }
          
          if (!customer) {
            customer = await prisma.customer.findFirst({ 
              where: { name: normalizedReceiverName } 
            });
          }
          
          if (!customer) {
            console.log(`➕ Creating new external customer: ${normalizedReceiverName}`);
            customer = await prisma.customer.create({
              data: {
                name: normalizedReceiverName,
                country: receiverCountry,
                etaId: invoiceData.receiverEtaId || null,
                createdAt: new Date(), 
                updatedAt: new Date(),
              },
            });
          }
          // Note: for external invoices, we still primarily treat as supplier invoice
          // but we create the customer record for completeness
        }

        const newInvoice = await prisma.invoice.create({
          data: { ...invoiceData, customerId, supplierId },
        });
        createdInvoices.push(newInvoice);
        processedCount++;
        console.log(`✅ Invoice ${newInvoice.invoiceNumber} saved successfully with normalized names.`);

      } catch (error: any) {
        console.error(`❌ Error processing invoice ${internalId}:`, error.message);
        errors.push({ invoiceNumber: internalId, error: error.message });
        errorCount++;
      }
    }

    console.log('🏁 Bulk processing finished.');
    return NextResponse.json({
      message: 'Bulk invoice processing complete with LLM name normalization.',
      processed: processedCount,
      skipped: skippedCount,
      errors: errorCount,
      errorDetails: errors,
      createdInvoices: createdInvoices.map(inv => inv.id), // Return IDs of created invoices
      normalizationStats: {
        totalUniqueNames: namesToNormalize.length,
        normalizedNames: normalizedNamesMap.size
      }
    }, { status: 201 });

  } catch (error: any) {
    console.error('❌ Major error during bulk processing:', error.message);
    return NextResponse.json({
      message: 'Failed to process bulk invoices.',
      error: error.message,
      processed: processedCount,
      skipped: skippedCount,
      errors: errorCount + (invoicesToProcess.length > 0 ? invoicesToProcess.length - processedCount - skippedCount - errorCount : 0),
      errorDetails: errors.length > 0 ? errors : [{ invoiceNumber: 'N/A', error: error.message }],
    }, { status: 400 });
  }
} 