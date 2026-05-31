import {
  Document, Page, Text, View, StyleSheet, Image,
} from '@react-pdf/renderer'
import type { Quote, Customer, Job } from '../../data'
import type { BusinessSettings } from '../../data'
import { presentTotals } from '../../domain/pricing'

const s = StyleSheet.create({
  page: { fontFamily: 'Helvetica', fontSize: 9, padding: 40, color: '#111' },
  header: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 24 },
  bizName: { fontSize: 16, fontFamily: 'Helvetica-Bold', color: '#1e3a5f' },
  bizSub: { fontSize: 8, color: '#666', marginTop: 2 },
  logo: { width: 60, height: 60, objectFit: 'contain' },
  section: { marginBottom: 14 },
  sectionTitle: { fontSize: 8, fontFamily: 'Helvetica-Bold', color: '#666', textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 4 },
  row: { flexDirection: 'row', paddingVertical: 4, borderBottomWidth: 0.5, borderBottomColor: '#e5e7eb' },
  rowAlt: { backgroundColor: '#f9fafb' },
  colDesc: { flex: 3 },
  colNum: { flex: 1, textAlign: 'right' },
  thead: { flexDirection: 'row', paddingVertical: 4, backgroundColor: '#1e3a5f' },
  theadText: { color: '#fff', fontFamily: 'Helvetica-Bold', fontSize: 8 },
  totalRow: { flexDirection: 'row', justifyContent: 'flex-end', paddingVertical: 3 },
  totalLabel: { width: 100, textAlign: 'right', color: '#555' },
  totalValue: { width: 80, textAlign: 'right' },
  grandTotal: { flexDirection: 'row', justifyContent: 'flex-end', paddingTop: 6, marginTop: 4, borderTopWidth: 1, borderTopColor: '#1e3a5f' },
  grandLabel: { width: 100, textAlign: 'right', fontFamily: 'Helvetica-Bold', fontSize: 11, color: '#1e3a5f' },
  grandValue: { width: 80, textAlign: 'right', fontFamily: 'Helvetica-Bold', fontSize: 11, color: '#1e3a5f' },
  terms: { marginTop: 24, paddingTop: 10, borderTopWidth: 0.5, borderTopColor: '#e5e7eb', fontSize: 8, color: '#777', lineHeight: 1.5 },
  statusBadge: { fontSize: 8, fontFamily: 'Helvetica-Bold', padding: '2 6', borderRadius: 4 },
})

function fmt(pence: number) {
  return `£${(pence / 100).toLocaleString('en-GB', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
}

function fmtDate(ts: number) {
  return new Date(ts).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })
}

interface Props {
  quote: Quote
  customer: Customer
  job: Job
  settings: BusinessSettings
}

export function QuoteDocument({ quote, customer, job, settings }: Props) {
  const display = presentTotals(quote.totals, quote.vatInclusiveDisplay)

  return (
    <Document title={`Quote — ${customer.name} — ${job.address}`}>
      <Page size="A4" style={s.page}>
        {/* Header */}
        <View style={s.header}>
          <View>
            <Text style={s.bizName}>{settings.name}</Text>
            {settings.name && <Text style={s.bizSub}>Quote</Text>}
          </View>
          {settings.logoDataUrl
            ? <Image src={settings.logoDataUrl} style={s.logo} />
            : <View />
          }
        </View>

        {/* Meta */}
        <View style={{ flexDirection: 'row', gap: 24, marginBottom: 20 }}>
          <View style={s.section}>
            <Text style={s.sectionTitle}>Customer</Text>
            <Text style={{ fontFamily: 'Helvetica-Bold' }}>{customer.name}</Text>
            {customer.phone && <Text style={s.bizSub}>{customer.phone}</Text>}
            {customer.email && <Text style={s.bizSub}>{customer.email}</Text>}
          </View>
          <View style={s.section}>
            <Text style={s.sectionTitle}>Property</Text>
            <Text>{job.address}</Text>
          </View>
          <View style={s.section}>
            <Text style={s.sectionTitle}>Date</Text>
            <Text>{fmtDate(quote.createdAt)}</Text>
            <Text style={{ ...s.bizSub, marginTop: 4, fontFamily: 'Helvetica-Bold', color: quote.status === 'accepted' ? '#16a34a' : '#92400e' }}>
              {quote.status.toUpperCase()}
            </Text>
          </View>
        </View>

        {/* Table */}
        <View style={s.section}>
          <View style={s.thead}>
            <Text style={{ ...s.theadText, ...s.colDesc, paddingLeft: 6 }}>Description</Text>
            <Text style={{ ...s.theadText, ...s.colNum, paddingRight: 4 }}>Qty</Text>
            <Text style={{ ...s.theadText, ...s.colNum, paddingRight: 4 }}>Unit</Text>
            <Text style={{ ...s.theadText, ...s.colNum, paddingRight: 4 }}>Unit Price</Text>
            <Text style={{ ...s.theadText, ...s.colNum, paddingRight: 6 }}>Total</Text>
          </View>
          {quote.lines.map((line, i) => (
            <View key={line.id} style={[s.row, i % 2 === 1 ? s.rowAlt : {}]}>
              <View style={{ ...s.colDesc, paddingLeft: 6 }}>
                <Text>{line.description}</Text>
                {line.notes && <Text style={{ color: '#888', fontSize: 7, marginTop: 1 }}>{line.notes}</Text>}
              </View>
              <Text style={{ ...s.colNum, paddingRight: 4 }}>{line.computedQuantity}</Text>
              <Text style={{ ...s.colNum, paddingRight: 4 }}>{line.unit}</Text>
              <Text style={{ ...s.colNum, paddingRight: 4 }}>{fmt(line.unitPricePence)}</Text>
              <Text style={{ ...s.colNum, paddingRight: 6, fontFamily: 'Helvetica-Bold' }}>{fmt(line.lineTotalPence)}</Text>
            </View>
          ))}
        </View>

        {/* Totals */}
        <View>
          {settings.vatRegistered && (
            <>
              <View style={s.totalRow}>
                <Text style={s.totalLabel}>Subtotal (ex VAT)</Text>
                <Text style={s.totalValue}>{fmt(display.displaySubtotal)}</Text>
              </View>
              <View style={s.totalRow}>
                <Text style={s.totalLabel}>VAT ({settings.vatRatePercent}%)</Text>
                <Text style={s.totalValue}>{fmt(display.displayVat)}</Text>
              </View>
            </>
          )}
          <View style={s.grandTotal}>
            <Text style={s.grandLabel}>Total {settings.vatRegistered ? (quote.vatInclusiveDisplay ? '(inc VAT)' : '(ex VAT)') : ''}</Text>
            <Text style={s.grandValue}>{fmt(display.displayTotal)}</Text>
          </View>
        </View>

        {/* Terms */}
        {settings.defaultTermsText && (
          <View style={s.terms}>
            <Text style={{ fontFamily: 'Helvetica-Bold', color: '#555', marginBottom: 3 }}>Terms & Conditions</Text>
            <Text>{settings.defaultTermsText}</Text>
          </View>
        )}
      </Page>
    </Document>
  )
}
