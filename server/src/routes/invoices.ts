import express from 'express';
import { prisma } from '../lib/prisma.js';
import { CURRENT_CUSTOMER_NAMES, CURRENT_CUSTOMER_ETAID } from '../lib/constants.js';
import { normalizeNames } from '../lib/services/nameNormalizationService.js';
import { getUserCompanyId } from '../lib/services/companyAccessService.js';
import { v4 as uuidv4 } from 'uuid';
import { xml2js } from 'xml-js';

const router = express.Router();

router.post('/', async (req, res) => {
  let processedCount = 0;
  let skippedCount = 0;
  let errorCount = 0;
  const errors: { invoiceNumber?: string; error: string }[] = [];
  const createdInvoices: any[] = [];
  let invoicesToProcess: any[] = [];

  try {
    const requestBody = req.body;
    const { supabaseUserId, invoices: invoicesData } = requestBody;
    if (!supabaseUserId) {
      return res.status(401).json({
        message: 'Authentication required. Please provide supabaseUserId.',
        error: 'Missing supabaseUserId',
      });
    }

    const companyId = await getUserCompanyId(supabaseUserId);
    if (!companyId) {
      return res.status(403).json({
        message: 'User does not have a company associated.',
        error: 'No company found for user',
      });
    }

    invoicesToProcess = invoicesData || (Array.isArray(requestBody) ? requestBody : [requestBody]);

    // Step 1: Extract all unique names that need normalization
    const namesToNormalize: any[] = [];
    const nameMapping = new Map<string, string>(); // original name -> unique ID

    for (const rawInvoice of invoicesToProcess) {
      const issuerName = rawInvoice.issuerName;
      const receiverName = rawInvoice.receiverName;

      if (issuerName && !nameMapping.has(issuerName)) {
        const id = uuidv4();
        nameMapping.set(issuerName, id);
        namesToNormalize.push({
          id,
          name: issuerName,
          type: 'issuer',
        });
      }
      if (receiverName && !nameMapping.has(receiverName)) {
        const id = uuidv4();
        nameMapping.set(receiverName, id);
        namesToNormalize.push({
          id,
          name: receiverName,
          type: 'receiver',
        });
      }
    }

    // Step 2: Send names to LLM for normalization
    let normalizedNamesMap = new Map<string, string>(); // original name -> normalized name
    if (namesToNormalize.length > 0) {
      try {
        const normalizationResult = await normalizeNames(namesToNormalize);
        for (const result of normalizationResult.normalizedNames) {
          const originalName = namesToNormalize.find(n => n.id === result.id)?.name;
          if (originalName) {
            normalizedNamesMap.set(originalName, result.normalizedName);
          }
        }
      } catch (error) {
        // Fallback: use original names if normalization fails
        for (const nameItem of namesToNormalize) {
          normalizedNamesMap.set(nameItem.name, nameItem.name);
        }
      }
    }

    // Step 3: Process invoices with normalized names
    for (const rawInvoice of invoicesToProcess) {
      const internalId = rawInvoice.internalId || 'N/A';
      try {
        // Enhanced document parsing to handle both JSON and XML formats
        let document: any;
        if (typeof rawInvoice.document === 'string') {
          try {
            document = JSON.parse(rawInvoice.document);
          } catch (jsonError) {
            try {
              let xmlContent = rawInvoice.document.trim();
              if (!xmlContent.startsWith('<')) {
                throw new Error('Document does not appear to be valid XML (does not start with <)');
              }
              const xmlResult = xml2js(xmlContent, {
                compact: true,
                ignoreDeclaration: true,
                ignoreInstruction: true,
                ignoreComment: true,
                ignoreDoctype: true,
                ignoreText: false,
                alwaysChildren: false,
                sanitize: false,
              }) as any;
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
                      branchID: xmlDoc.issuer?.address?.branchID?._text || '',
                    },
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
                      additionalInformation: xmlDoc.receiver?.address?.additionalInformation?._text || '',
                    },
                  },
                  invoiceLines: [],
                  taxTotals: [],
                  totalAmount: 0,
                  totalDiscountAmount: 0,
                };
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
                      currencyExchangeRate: parseFloat(line.unitValue?.currencyExchangeRate?._text || '1'),
                    },
                    salesTotal: parseFloat(line.salesTotal?._text || '0'),
                    discount: {
                      rate: parseFloat(line.discount?.rate?._text || '0'),
                      amount: parseFloat(line.discount?.amount?._text || '0'),
                    },
                    taxableItems: line.taxableItems?.taxableItem
                      ? (Array.isArray(line.taxableItems.taxableItem)
                          ? line.taxableItems.taxableItem
                          : [line.taxableItems.taxableItem]
                        ).map((tax: any) => ({
                          taxType: tax.taxType?._text || '',
                          amount: parseFloat(tax.amount?._text || '0'),
                          subType: tax.subType?._text || '',
                          rate: parseFloat(tax.rate?._text || '0'),
                        }))
                      : [],
                    netTotal: parseFloat(line.netTotal?._text || '0'),
                    total: parseFloat(line.total?._text || '0'),
                  }));
                }
                if (xmlDoc.taxTotals?.taxTotal) {
                  const taxes = Array.isArray(xmlDoc.taxTotals.taxTotal)
                    ? xmlDoc.taxTotals.taxTotal
                    : [xmlDoc.taxTotals.taxTotal];
                  document.taxTotals = taxes.map((tax: any) => ({
                    taxType: tax.taxType?._text || '',
                    amount: parseFloat(tax.amount?._text || '0'),
                  }));
                }
                document.totalAmount = parseFloat(xmlDoc.totalAmount?._text || '0');
                document.totalDiscountAmount = parseFloat(xmlDoc.totalDiscountAmount?._text || '0');
              } else {
                throw new Error('Invalid XML structure: missing document root element');
              }
            } catch (xmlError: any) {
              document = {
                issuer: {
                  id: '',
                  name: rawInvoice.issuerName || '',
                  address: {
                    country: 'EG',
                    governate: '',
                    regionCity: '',
                    street: '',
                    buildingNumber: '',
                    floor: '',
                    room: '',
                    postalCode: '',
                    landmark: '',
                    additionalInformation: '',
                    branchID: '',
                  },
                },
                receiver: {
                  id: '',
                  name: rawInvoice.receiverName || '',
                  address: {
                    country: 'EG',
                    governate: '',
                    regionCity: '',
                    street: '',
                    buildingNumber: '',
                    floor: '',
                    room: '',
                    postalCode: '',
                    landmark: '',
                    additionalInformation: '',
                  },
                },
                invoiceLines: [
                  {
                    description: 'Document parsing failed - using fallback data',
                    itemType: 'SERVICE',
                    itemCode: '00000000',
                    unitType: 'EA',
                    quantity: 1,
                    unitValue: {
                      currencySold: 'EGP',
                      amountSold: rawInvoice.totalSales || 0,
                      amountEGP: rawInvoice.totalSales || 0,
                      currencyExchangeRate: 1,
                    },
                    salesTotal: rawInvoice.totalSales || 0,
                    discount: {
                      rate: 0,
                      amount: rawInvoice.totalDiscount || 0,
                    },
                    taxableItems: [],
                    netTotal: rawInvoice.netAmount || 0,
                    total: rawInvoice.total || 0,
                  },
                ],
                taxTotals: [],
                totalAmount: rawInvoice.total || 0,
                totalDiscountAmount: rawInvoice.totalDiscount || 0,
              };
            }
          }
        } else {
          document = rawInvoice.document;
        }

        const taxAmount = Array.isArray(document.taxTotals)
          ? document.taxTotals.reduce((sum: number, t: any) => sum + Number(t.amount || 0), 0)
          : 0;

        const firstLine = Array.isArray(document.invoiceLines) && document.invoiceLines.length > 0
          ? document.invoiceLines[0]
          : null;
        let currency = 'EGP';
        let exchangeRate = 1;
        if (firstLine?.unitValue) {
          if (firstLine.unitValue.currencySold) {
            currency = firstLine.unitValue.currencySold;
          }
          if (firstLine.unitValue.currencyExchangeRate) {
            exchangeRate = firstLine.unitValue.currencyExchangeRate;
          }
        }

        const issuerCountry = document.issuer?.address?.country || '';
        const receiverCountry = document.receiver?.address?.country || '';
        const issuerEtaId = document.issuer?.id || '';
        const receiverEtaId = document.receiver?.id || '';
        const totalDiscount = rawInvoice.totalDiscount ?? document.totalDiscountAmount ?? 0;
        const total = rawInvoice.total ?? document.totalAmount ?? 0;
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
          issuerEtaId: (issuerEtaId && issuerEtaId !== '0') ? issuerEtaId : '',
          receiverEtaId: (receiverEtaId && receiverEtaId !== '0') ? receiverEtaId : '',
          createdAt: new Date(),
          updatedAt: new Date(),
        };

        // Check for existing invoice
        const existingInvoice = await prisma.invoice.findFirst({
          where: {
            invoiceNumber: invoiceData.invoiceNumber,
            total: invoiceData.total,
            companyId: companyId,
          },
        });
        if (existingInvoice) {
          skippedCount++;
          continue;
        }

        let customerId: number | null = null;
        let supplierId: number | null = null;
        const isCurrentCustomerAsIssuer = (invoiceData.issuerEtaId && invoiceData.issuerEtaId === CURRENT_CUSTOMER_ETAID) || CURRENT_CUSTOMER_NAMES.includes(normalizedIssuerName);
        const isCurrentCustomerAsReceiver = (invoiceData.receiverEtaId && invoiceData.receiverEtaId === CURRENT_CUSTOMER_ETAID) || CURRENT_CUSTOMER_NAMES.includes(normalizedReceiverName);

        if (isCurrentCustomerAsIssuer) {
          let customer = null;
          if (invoiceData.receiverEtaId) {
            customer = await prisma.customer.findFirst({
              where: {
                etaId: invoiceData.receiverEtaId,
                companyId: companyId,
              },
            });
          }
          if (!customer) {
            customer = await prisma.customer.findFirst({
              where: {
                name: normalizedReceiverName,
                companyId: companyId,
              },
            });
          }
          if (!customer) {
            customer = await prisma.customer.create({
              data: {
                name: normalizedReceiverName,
                country: receiverCountry,
                etaId: invoiceData.receiverEtaId || null,
                companyId: companyId,
                createdAt: new Date(),
                updatedAt: new Date(),
              },
            });
          }
          customerId = customer.id;
        } else if (isCurrentCustomerAsReceiver) {
          let supplier = null;
          if (invoiceData.issuerEtaId) {
            supplier = await prisma.supplier.findFirst({
              where: {
                etaId: invoiceData.issuerEtaId,
                companyId: companyId,
              },
            });
          }
          if (!supplier) {
            supplier = await prisma.supplier.findFirst({
              where: {
                name: normalizedIssuerName,
                companyId: companyId,
              },
            });
          }
          if (!supplier) {
            supplier = await prisma.supplier.create({
              data: {
                name: normalizedIssuerName,
                country: issuerCountry,
                etaId: invoiceData.issuerEtaId || null,
                companyId: companyId,
                createdAt: new Date(),
                updatedAt: new Date(),
              },
            });
          }
          supplierId = supplier.id;
        } else {
          let supplier = null;
          if (invoiceData.issuerEtaId) {
            supplier = await prisma.supplier.findFirst({
              where: {
                etaId: invoiceData.issuerEtaId,
                companyId: companyId,
              },
            });
          }
          if (!supplier) {
            supplier = await prisma.supplier.findFirst({
              where: {
                name: normalizedIssuerName,
                companyId: companyId,
              },
            });
          }
          if (!supplier) {
            supplier = await prisma.supplier.create({
              data: {
                name: normalizedIssuerName,
                country: issuerCountry,
                etaId: invoiceData.issuerEtaId || null,
                companyId: companyId,
                createdAt: new Date(),
                updatedAt: new Date(),
              },
            });
          }
          supplierId = supplier.id;
          let customer = null;
          if (invoiceData.receiverEtaId) {
            customer = await prisma.customer.findFirst({
              where: {
                etaId: invoiceData.receiverEtaId,
                companyId: companyId,
              },
            });
          }
          if (!customer) {
            customer = await prisma.customer.findFirst({
              where: {
                name: normalizedReceiverName,
                companyId: companyId,
              },
            });
          }
          if (!customer) {
            customer = await prisma.customer.create({
              data: {
                name: normalizedReceiverName,
                country: receiverCountry,
                etaId: invoiceData.receiverEtaId || null,
                companyId: companyId,
                createdAt: new Date(),
                updatedAt: new Date(),
              },
            });
          }
        }

        const newInvoice = await prisma.invoice.create({
          data: { ...invoiceData, customerId, supplierId, companyId },
        });
        createdInvoices.push(newInvoice);
        processedCount++;
      } catch (error: any) {
        errors.push({ invoiceNumber: internalId, error: error.message });
        errorCount++;
      }
    }

    return res.status(201).json({
      message: 'Bulk invoice processing complete with LLM name normalization.',
      processed: processedCount,
      skipped: skippedCount,
      errors: errorCount,
      errorDetails: errors,
      createdInvoices: createdInvoices.map(inv => inv.id),
      normalizationStats: {
        totalUniqueNames: namesToNormalize.length,
        normalizedNames: normalizedNamesMap.size,
      },
    });
  } catch (error: any) {
    return res.status(400).json({
      message: 'Failed to process bulk invoices.',
      error: error.message,
      processed: processedCount,
      skipped: skippedCount,
      errors: errorCount + (invoicesToProcess.length > 0 ? invoicesToProcess.length - processedCount - skippedCount - errorCount : 0),
      errorDetails: errors.length > 0 ? errors : [{ invoiceNumber: 'N/A', error: error.message }],
    });
  }
});

export default router; 