import connectDB from '@/lib/db';
import { getServerUser } from '@/lib/auth';
import Invoice from '@/models/Invoice';
import { errorResponse, successResponse } from '@/utils/apiResponse';

function calcTotals(items = [], taxPercent = 18) {
  const normalized = (items || []).map((item) => {
    const quantity = Math.max(0, Number(item.quantity) || 0);
    const rate = Math.max(0, Number(item.rate) || 0);
    return {
      description: String(item.description || '').trim(),
      quantity,
      rate,
      amount: Math.round(quantity * rate * 100) / 100,
    };
  }).filter((i) => i.description);

  const subtotal = Math.round(normalized.reduce((s, i) => s + i.amount, 0) * 100) / 100;
  const tax = Math.max(0, Number(taxPercent) || 0);
  const taxAmount = Math.round(subtotal * (tax / 100) * 100) / 100;
  const total = Math.round((subtotal + taxAmount) * 100) / 100;
  return { items: normalized, subtotal, taxPercent: tax, taxAmount, total };
}

async function nextInvoiceNumber() {
  const year = new Date().getFullYear();
  const prefix = `CGF-${year}-`;
  const latest = await Invoice.findOne({ invoiceNumber: new RegExp(`^${prefix}`) })
    .sort({ invoiceNumber: -1 })
    .select('invoiceNumber')
    .lean();
  let seq = 1;
  if (latest?.invoiceNumber) {
    const part = latest.invoiceNumber.split('-').pop();
    const n = parseInt(part, 10);
    if (Number.isFinite(n)) seq = n + 1;
  }
  return `${prefix}${String(seq).padStart(4, '0')}`;
}

export async function GET() {
  try {
    const user = await getServerUser();
    if (!user || !['admin', 'editor'].includes(user.role)) {
      return errorResponse('Forbidden', 403);
    }
    await connectDB();
    const invoices = await Invoice.find().sort({ createdAt: -1 }).limit(200).lean();
    return successResponse(invoices);
  } catch (error) {
    console.error('Invoices GET error:', error);
    return errorResponse('बिल लोड करने में विफल', 500);
  }
}

export async function POST(request) {
  try {
    const user = await getServerUser();
    if (!user || !['admin', 'editor'].includes(user.role)) {
      return errorResponse('Forbidden', 403);
    }
    await connectDB();
    const body = await request.json();
    const totals = calcTotals(body.items, body.taxPercent);

    if (!body.clientName?.trim()) {
      return errorResponse('क्लाइंट नाम आवश्यक है', 400);
    }
    if (!totals.items.length) {
      return errorResponse('कम से कम एक आइटम जोड़ें', 400);
    }

    const invoiceNumber = body.invoiceNumber?.trim() || (await nextInvoiceNumber());
    const exists = await Invoice.findOne({ invoiceNumber }).lean();
    if (exists) {
      return errorResponse('यह बिल नंबर पहले से मौजूद है', 400);
    }

    const invoice = await Invoice.create({
      invoiceNumber,
      clientName: body.clientName.trim(),
      clientAddress: (body.clientAddress || '').trim(),
      clientPhone: (body.clientPhone || '').trim(),
      clientEmail: (body.clientEmail || '').trim(),
      clientGstin: (body.clientGstin || '').trim(),
      ...totals,
      notes: (body.notes || '').trim(),
      invoiceDate: body.invoiceDate ? new Date(body.invoiceDate) : new Date(),
      dueDate: body.dueDate ? new Date(body.dueDate) : null,
      status: ['draft', 'unpaid', 'paid', 'cancelled'].includes(body.status) ? body.status : 'unpaid',
      createdBy: user.id || user._id || null,
    });

    return successResponse(invoice.toObject(), 'बिल बन गया', 201);
  } catch (error) {
    console.error('Invoices POST error:', error);
    return errorResponse(error.message || 'बिल सहेजने में विफल', 500);
  }
}
