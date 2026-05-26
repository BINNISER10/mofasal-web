import { config } from '../../config';
import { v4 as uuidv4 } from 'uuid';

export class InvoiceXmlGenerator {
  static generate(invoice: any, order: any): string {
    const uuid = invoice.uuid || uuidv4().toUpperCase();
    const issueDate = new Date(invoice.createdAt || new Date()).toISOString().split('T')[0];
    const issueTime = new Date(invoice.createdAt || new Date()).toTimeString().split(' ')[0];
    const sellerName = config.zatca.sellerName;
    const vatNumber = config.zatca.vatNumber;
    const totalAmount = invoice.totalAmount.toFixed(2);
    const vatAmount = invoice.vatAmount.toFixed(2);
    const grandTotal = invoice.grandTotal.toFixed(2);

    const itemsXml = (order.items || []).map((item: any, index: number) => `
      <cac:InvoiceLine>
        <cbc:ID>${index + 1}</cbc:ID>
        <cbc:InvoicedQuantity unitCode="EA">${item.quantity}</cbc:InvoicedQuantity>
        <cbc:LineExtensionAmount currencyID="SAR">${(item.unitPrice * item.quantity).toFixed(2)}</cbc:LineExtensionAmount>
        <cac:TaxTotal>
          <cbc:TaxAmount currencyID="SAR">${((item.unitPrice * item.quantity) * 0.15).toFixed(2)}</cbc:TaxAmount>
          <cac:TaxSubtotal>
            <cbc:TaxableAmount currencyID="SAR">${(item.unitPrice * item.quantity).toFixed(2)}</cbc:TaxableAmount>
            <cbc:TaxAmount currencyID="SAR">${((item.unitPrice * item.quantity) * 0.15).toFixed(2)}</cbc:TaxAmount>
            <cac:TaxCategory>
              <cbc:ID>S</cbc:ID>
              <cbc:Percent>15.00</cbc:Percent>
              <cac:TaxScheme>
                <cbc:ID>VAT</cbc:ID>
              </cac:TaxScheme>
            </cac:TaxCategory>
          </cac:TaxSubtotal>
        </cac:TaxTotal>
        <cac:Item>
          <cbc:Name>${this.escapeXml(item.name)}</cbc:Name>
        </cac:Item>
        <cac:Price>
          <cbc:PriceAmount currencyID="SAR">${item.unitPrice.toFixed(2)}</cbc:PriceAmount>
        </cac:Price>
      </cac:InvoiceLine>`).join('\n') || '';

    return `<?xml version="1.0" encoding="UTF-8"?>
<Invoice xmlns="urn:oasis:names:specification:ubl:schema:xsd:Invoice-2"
         xmlns:cac="urn:oasis:names:specification:ubl:schema:xsd:CommonAggregateComponents-2"
         xmlns:cbc="urn:oasis:names:specification:ubl:schema:xsd:CommonBasicComponents-2">
  <cbc:UBLVersionID>2.1</cbc:UBLVersionID>
  <cbc:CustomizationID>OTHR</cbc:CustomizationID>
  <cbc:ID>${invoice.invoiceNumber}</cbc:ID>
  <cbc:UUID>${uuid}</cbc:UUID>
  <cbc:IssueDate>${issueDate}</cbc:IssueDate>
  <cbc:IssueTime>${issueTime}</cbc:IssueTime>
  <cbc:InvoiceTypeCode name="0200000">388</cbc:InvoiceTypeCode>
  <cbc:DocumentCurrencyCode>SAR</cbc:DocumentCurrencyCode>
  <cac:AccountingSupplierParty>
    <cac:Party>
      <cac:PartyIdentification>
        <cbc:ID schemeID="CRN">1234567890</cbc:ID>
      </cac:PartyIdentification>
      <cac:PartyTaxScheme>
        <cbc:CompanyID>${vatNumber}</cbc:CompanyID>
        <cac:TaxScheme>
          <cbc:ID>VAT</cbc:ID>
        </cac:TaxScheme>
      </cac:PartyTaxScheme>
      <cac:PartyLegalEntity>
        <cbc:RegistrationName>${this.escapeXml(sellerName)}</cbc:RegistrationName>
      </cac:PartyLegalEntity>
    </cac:Party>
  </cac:AccountingSupplierParty>
  <cac:AccountingCustomerParty>
    <cac:Party>
      <cac:PartyTaxScheme>
        <cbc:CompanyID>${order.customer?.vatNumber || '0000000000'}</cbc:CompanyID>
        <cac:TaxScheme>
          <cbc:ID>VAT</cbc:ID>
        </cac:TaxScheme>
      </cac:PartyTaxScheme>
      <cac:PartyLegalEntity>
        <cbc:RegistrationName>${this.escapeXml(order.customer?.name || 'Customer')}</cbc:RegistrationName>
      </cac:PartyLegalEntity>
    </cac:Party>
  </cac:AccountingCustomerParty>
  <cac:TaxTotal>
    <cbc:TaxAmount currencyID="SAR">${vatAmount}</cbc:TaxAmount>
    <cac:TaxSubtotal>
      <cbc:TaxableAmount currencyID="SAR">${totalAmount}</cbc:TaxableAmount>
      <cbc:TaxAmount currencyID="SAR">${vatAmount}</cbc:TaxAmount>
      <cac:TaxCategory>
        <cbc:ID>S</cbc:ID>
        <cbc:Percent>15.00</cbc:Percent>
        <cac:TaxScheme>
          <cbc:ID>VAT</cbc:ID>
        </cac:TaxScheme>
      </cac:TaxCategory>
    </cac:TaxSubtotal>
  </cac:TaxTotal>
  <cac:LegalMonetaryTotal>
    <cbc:LineExtensionAmount currencyID="SAR">${totalAmount}</cbc:LineExtensionAmount>
    <cbc:TaxExclusiveAmount currencyID="SAR">${totalAmount}</cbc:TaxExclusiveAmount>
    <cbc:TaxInclusiveAmount currencyID="SAR">${grandTotal}</cbc:TaxInclusiveAmount>
    <cbc:AllowanceTotalAmount currencyID="SAR">0.00</cbc:AllowanceTotalAmount>
    <cbc:PrepaidAmount currencyID="SAR">0.00</cbc:PrepaidAmount>
    <cbc:PayableAmount currencyID="SAR">${grandTotal}</cbc:PayableAmount>
  </cac:LegalMonetaryTotal>
  ${itemsXml}
</Invoice>`;
  }

  static generateSimplified(invoice: any, order: any): string {
    const uuid = invoice.uuid || uuidv4().toUpperCase();
    const issueDate = new Date(invoice.createdAt || new Date()).toISOString().split('T')[0];
    const issueTime = new Date(invoice.createdAt || new Date()).toTimeString().split(' ')[0];
    const grandTotal = invoice.grandTotal.toFixed(2);
    const vatAmount = invoice.vatAmount.toFixed(2);

    return `<?xml version="1.0" encoding="UTF-8"?>
<Invoice xmlns="urn:oasis:names:specification:ubl:schema:xsd:Invoice-2"
         xmlns:cac="urn:oasis:names:specification:ubl:schema:xsd:CommonAggregateComponents-2"
         xmlns:cbc="urn:oasis:names:specification:ubl:schema:xsd:CommonBasicComponents-2">
  <cbc:UBLVersionID>2.1</cbc:UBLVersionID>
  <cbc:CustomizationID>OTHR</cbc:CustomizationID>
  <cbc:ID>${invoice.invoiceNumber}</cbc:ID>
  <cbc:UUID>${uuid}</cbc:UUID>
  <cbc:IssueDate>${issueDate}</cbc:IssueDate>
  <cbc:IssueTime>${issueTime}</cbc:IssueTime>
  <cbc:InvoiceTypeCode name="0100000">388</cbc:InvoiceTypeCode>
  <cbc:DocumentCurrencyCode>SAR</cbc:DocumentCurrencyCode>
  <cac:AccountingSupplierParty>
    <cac:Party>
      <cac:PartyIdentification>
        <cbc:ID schemeID="CRN">1234567890</cbc:ID>
      </cac:PartyIdentification>
      <cac:PartyTaxScheme>
        <cbc:CompanyID>${config.zatca.vatNumber}</cbc:CompanyID>
        <cac:TaxScheme><cbc:ID>VAT</cbc:ID></cac:TaxScheme>
      </cac:PartyTaxScheme>
      <cac:PartyLegalEntity>
        <cbc:RegistrationName>${this.escapeXml(config.zatca.sellerName)}</cbc:RegistrationName>
      </cac:PartyLegalEntity>
    </cac:Party>
  </cac:AccountingSupplierParty>
  <cac:TaxTotal>
    <cbc:TaxAmount currencyID="SAR">${vatAmount}</cbc:TaxAmount>
  </cac:TaxTotal>
  <cac:LegalMonetaryTotal>
    <cbc:PayableAmount currencyID="SAR">${grandTotal}</cbc:PayableAmount>
  </cac:LegalMonetaryTotal>
</Invoice>`;
  }

  static generateQrCodeData(invoice: any): string {
    const sellerName = config.zatca.sellerName;
    const vatNumber = config.zatca.vatNumber;
    const timestamp = (invoice.createdAt || new Date()).toISOString();
    const grandTotal = invoice.grandTotal.toFixed(2);
    const vatAmount = invoice.vatAmount.toFixed(2);

    const tags = [
      [1, sellerName],
      [2, vatNumber],
      [3, timestamp],
      [4, grandTotal],
      [5, vatAmount],
    ];

    return tags.map(([tag, value]) => {
      const tagBytes = String.fromCharCode(tag as number);
      const valueBytes = value as string;
      const lengthBytes = String.fromCharCode(valueBytes.length);
      return tagBytes + lengthBytes + valueBytes;
    }).join('');
  }

  private static escapeXml(str: string): string {
    return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&apos;');
  }
}
