'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { FiArrowLeft, FiPrinter } from 'react-icons/fi';
import LoadingSpinner from '@/components/ui/LoadingSpinner';

function formatMoney(n) {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 2,
  }).format(Number(n) || 0);
}

function formatDate(d) {
  if (!d) return '—';
  return new Date(d).toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  });
}

const STATUS_LABEL = {
  draft: 'Draft',
  unpaid: 'Unpaid',
  paid: 'Paid',
  cancelled: 'Cancelled',
};

export default function InvoicePrintPage() {
  const { id } = useParams();
  const [invoice, setInvoice] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;
    (async () => {
      try {
        const res = await fetch(`/api/admin/invoices/${id}`);
        const data = await res.json();
        if (!data.success) throw new Error(data.message || 'Not found');
        setInvoice(data.data);
      } catch (err) {
        setError(err.message || 'बिल लोड नहीं हुआ');
      }
      setLoading(false);
    })();
  }, [id]);

  useEffect(() => {
    document.body.classList.add('invoice-print-mode');
    return () => document.body.classList.remove('invoice-print-mode');
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center py-20">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (error || !invoice) {
    return (
      <div className="max-w-lg mx-auto py-16 text-center space-y-3">
        <p className="text-red-600">{error || 'बिल नहीं मिला'}</p>
        <Link href="/admin/billing" className="text-sm text-red-600 hover:underline">
          बिलिंग पर वापस
        </Link>
      </div>
    );
  }

  return (
    <div className="invoice-print-root">
      <div className="invoice-print-toolbar no-print flex flex-wrap items-center justify-between gap-3 mb-6">
        <Link
          href="/admin/billing"
          className="inline-flex items-center gap-1.5 text-sm text-gray-600 hover:text-red-600"
        >
          <FiArrowLeft className="w-4 h-4" />
          बिलिंग सूची
        </Link>
        <button
          type="button"
          onClick={() => window.print()}
          className="inline-flex items-center gap-2 px-4 py-2 bg-red-600 text-white text-sm font-medium rounded-lg hover:bg-red-700"
        >
          <FiPrinter className="w-4 h-4" />
          प्रिंट / PDF सेव
        </button>
      </div>

      <article className="invoice-sheet bg-white text-gray-900 mx-auto max-w-[800px] border border-gray-200 shadow-sm print:shadow-none print:border-0">
        <div className="invoice-sheet-header px-8 pt-8 pb-6 border-b-4 border-red-600 flex flex-wrap items-start justify-between gap-4">
          <div className="flex items-center gap-3">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/icon"
              alt="CGFILE"
              width={48}
              height={48}
              className="invoice-logo w-12 h-12 rounded-lg object-contain shrink-0"
            />
            <div>
              <h1 className="text-2xl font-black tracking-tight">
                CG<span className="text-red-600">FILE</span>
              </h1>
              <p className="text-xs text-gray-500 mt-0.5">छत्तीसगढ़ की ब्रेकिंग न्यूज़</p>
              <p className="text-[11px] text-gray-400">cgfile.in</p>
            </div>
          </div>
          <div className="text-right">
            <p className="text-xs uppercase tracking-widest text-gray-400 font-semibold">Tax Invoice / बिल</p>
            <p className="text-lg font-bold text-red-600 font-mono mt-1">{invoice.invoiceNumber}</p>
            <p className="text-xs text-gray-500 mt-2">Date: {formatDate(invoice.invoiceDate)}</p>
            {invoice.dueDate ? (
              <p className="text-xs text-gray-500">Due: {formatDate(invoice.dueDate)}</p>
            ) : null}
            <p className="text-xs mt-1">
              Status:{' '}
              <span className="font-semibold">{STATUS_LABEL[invoice.status] || invoice.status}</span>
            </p>
          </div>
        </div>

        <section className="px-8 py-6 grid grid-cols-1 sm:grid-cols-2 gap-6">
          <div>
            <p className="text-[10px] uppercase tracking-wider text-gray-400 font-semibold mb-1">From</p>
            <p className="font-bold">CGFILE Media</p>
            {/* <p className="text-sm text-gray-600 leading-relaxed">
              Online News Portal
              <br />
              https://cgfile.in
              <br />
              admin@cgfile.in
            </p> */}
          </div>
          <div>
            <p className="text-[10px] uppercase tracking-wider text-gray-400 font-semibold mb-1">Bill To</p>
            <p className="font-bold text-base">{invoice.clientName}</p>
            {invoice.clientAddress ? (
              <p className="text-sm text-gray-600 whitespace-pre-line mt-1">{invoice.clientAddress}</p>
            ) : null}
            <div className="text-sm text-gray-600 mt-1 space-y-0.5">
              {invoice.clientPhone ? <p>Phone: {invoice.clientPhone}</p> : null}
              {invoice.clientEmail ? <p>Email: {invoice.clientEmail}</p> : null}
              {invoice.clientGstin ? <p>GSTIN: {invoice.clientGstin}</p> : null}
            </div>
          </div>
        </section>

        <section className="px-8 pb-4">
          <table className="w-full text-sm border-collapse">
            <thead>
              <tr className="bg-gray-900 text-white">
                <th className="text-left py-2.5 px-3 font-medium">#</th>
                <th className="text-left py-2.5 px-3 font-medium">Description</th>
                <th className="text-right py-2.5 px-3 font-medium">Qty</th>
                <th className="text-right py-2.5 px-3 font-medium">Rate</th>
                <th className="text-right py-2.5 px-3 font-medium">Amount</th>
              </tr>
            </thead>
            <tbody>
              {(invoice.items || []).map((item, i) => (
                <tr key={i} className="border-b border-gray-200">
                  <td className="py-2.5 px-3 text-gray-500">{i + 1}</td>
                  <td className="py-2.5 px-3">{item.description}</td>
                  <td className="py-2.5 px-3 text-right">{item.quantity}</td>
                  <td className="py-2.5 px-3 text-right">{formatMoney(item.rate)}</td>
                  <td className="py-2.5 px-3 text-right font-medium">{formatMoney(item.amount)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>

        <section className="px-8 pb-6 flex justify-end">
          <div className="w-full max-w-xs text-sm space-y-1.5">
            <div className="flex justify-between text-gray-600">
              <span>Subtotal</span>
              <span>{formatMoney(invoice.subtotal)}</span>
            </div>
            <div className="flex justify-between text-gray-600">
              <span>GST ({invoice.taxPercent || 0}%)</span>
              <span>{formatMoney(invoice.taxAmount)}</span>
            </div>
            <div className="flex justify-between text-base font-bold border-t-2 border-red-600 pt-2 mt-2">
              <span>Total</span>
              <span className="text-red-600">{formatMoney(invoice.total)}</span>
            </div>
          </div>
        </section>

        {invoice.notes ? (
          <section className="px-8 pb-6">
            <p className="text-[10px] uppercase tracking-wider text-gray-400 font-semibold mb-1">Notes</p>
            <p className="text-sm text-gray-600 whitespace-pre-line">{invoice.notes}</p>
          </section>
        ) : null}

        <footer className="px-8 py-5 border-t border-gray-200 bg-gray-50 text-[11px] text-gray-500 flex flex-wrap justify-between gap-2">
          <p>Thank you for advertising with CGFILE.</p>
          <p>Generated on {formatDate(new Date())}</p>
        </footer>
      </article>
    </div>
  );
}
