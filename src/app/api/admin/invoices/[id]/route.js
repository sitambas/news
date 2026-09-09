import connectDB from '@/lib/db';
import { getServerUser } from '@/lib/auth';
import Invoice from '@/models/Invoice';
import { errorResponse, successResponse } from '@/utils/apiResponse';
import mongoose from 'mongoose';

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

export async function GET(_request, { params }) {
  try {
    const user = await getServerUser();
    if (!user || !['admin', 'editor'].includes(user.role)) {
      return errorResponse('Forbidden', 403);
    }
    const { id } = await params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return errorResponse('अमान्य बिल', 400);
    }
    await connectDB();
    const invoice = await Invoice.findById(id).lean();
    if (!invoice) return errorResponse('बिल नहीं मिला', 404);
    return successResponse(invoice);
  } catch (error) {
    console.error('Invoice GET error:', error);
    return errorResponse('बिल लोड करने में विफल', 500);
  }
}

export async function PUT(request, { params }) {
  try {
    const user = await getServerUser();
    if (!user || !['admin', 'editor'].includes(user.role)) {
      return errorResponse('Forbidden', 403);
    }
    const { id } = await params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return errorResponse('अमान्य बिल', 400);
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

    const patch = {
      clientName: body.clientName.trim(),
      clientAddress: (body.clientAddress || '').trim(),
      clientPhone: (body.clientPhone || '').trim(),
      clientEmail: (body.clientEmail || '').trim(),
      clientGstin: (body.clientGstin || '').trim(),
      ...totals,
      notes: (body.notes || '').trim(),
      invoiceDate: body.invoiceDate ? new Date(body.invoiceDate) : undefined,
      dueDate: body.dueDate ? new Date(body.dueDate) : null,
      status: ['draft', 'unpaid', 'paid', 'cancelled'].includes(body.status) ? body.status : 'unpaid',
    };

    const invoice = await Invoice.findByIdAndUpdate(id, { $set: patch }, { new: true }).lean();
    if (!invoice) return errorResponse('बिल नहीं मिला', 404);
    return successResponse(invoice, 'बिल अपडेट हुआ');
  } catch (error) {
    console.error('Invoice PUT error:', error);
    return errorResponse('बिल अपडेट में विफल', 500);
  }
}

export async function DELETE(_request, { params }) {
  try {
    const user = await getServerUser();
    if (!user || user.role !== 'admin') {
      return errorResponse('Forbidden', 403);
    }
    const { id } = await params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return errorResponse('अमान्य बिल', 400);
    }
    await connectDB();
    const deleted = await Invoice.findByIdAndDelete(id).lean();
    if (!deleted) return errorResponse('बिल नहीं मिला', 404);
    return successResponse(null, 'बिल हटाया गया');
  } catch (error) {
    console.error('Invoice DELETE error:', error);
    return errorResponse('बिल हटाने में विफल', 500);
  }
}
