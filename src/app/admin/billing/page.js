'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import {
  FiPlus, FiPrinter, FiTrash2, FiSave, FiRefreshCw, FiFileText, FiX,
} from 'react-icons/fi';
import toast from 'react-hot-toast';
import LoadingSpinner from '@/components/ui/LoadingSpinner';

const EMPTY_ITEM = { description: '', quantity: 1, rate: 0 };

function formatMoney(n) {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 2,
  }).format(Number(n) || 0);
}

function formatDateInput(d) {
  if (!d) return '';
  const date = new Date(d);
  if (Number.isNaN(date.getTime())) return '';
  return date.toISOString().slice(0, 10);
}

function formatDisplayDate(d) {
  if (!d) return '—';
  return new Date(d).toLocaleDateString('hi-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
}

const STATUS_LABEL = {
  draft: 'ड्राफ्ट',
  unpaid: 'बकाया',
  paid: 'भुगतान',
  cancelled: 'रद्द',
};

export default function AdminBillingPage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [invoices, setInvoices] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({
    clientName: '',
    clientAddress: '',
    clientPhone: '',
    clientEmail: '',
    clientGstin: '',
    taxPercent: 18,
    notes: 'विज्ञापन सेवाओं हेतु बिल। भुगतान के बाद रसीद जारी की जाएगी।',
    invoiceDate: formatDateInput(new Date()),
    dueDate: '',
    status: 'unpaid',
    items: [{ ...EMPTY_ITEM, description: 'वेबसाइट विज्ञापन बैनर' }],
  });

  const totals = useMemo(() => {
    const items = form.items.map((item) => {
      const quantity = Math.max(0, Number(item.quantity) || 0);
      const rate = Math.max(0, Number(item.rate) || 0);
      return { ...item, amount: quantity * rate };
    });
    const subtotal = items.reduce((s, i) => s + i.amount, 0);
    const taxPercent = Math.max(0, Number(form.taxPercent) || 0);
    const taxAmount = (subtotal * taxPercent) / 100;
    return {
      items,
      subtotal,
      taxPercent,
      taxAmount,
      total: subtotal + taxAmount,
    };
  }, [form.items, form.taxPercent]);

  const load = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/invoices');
      const data = await res.json();
      if (data.success) setInvoices(data.data || []);
      else toast.error(data.message || 'लोड विफल');
    } catch {
      toast.error('बिल लोड नहीं हुए');
    }
    setLoading(false);
  };

  useEffect(() => {
    load();
  }, []);

  const updateItem = (index, patch) => {
    setForm((prev) => ({
      ...prev,
      items: prev.items.map((item, i) => (i === index ? { ...item, ...patch } : item)),
    }));
  };

  const addItem = () => {
    setForm((prev) => ({ ...prev, items: [...prev.items, { ...EMPTY_ITEM }] }));
  };

  const removeItem = (index) => {
    setForm((prev) => ({
      ...prev,
      items: prev.items.length <= 1 ? prev.items : prev.items.filter((_, i) => i !== index),
    }));
  };

  const handleSave = async () => {
    if (!form.clientName.trim()) {
      toast.error('क्लाइंट नाम भरें');
      return;
    }
    setSaving(true);
    try {
      const res = await fetch('/api/admin/invoices', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...form,
          items: form.items,
          taxPercent: Number(form.taxPercent) || 0,
        }),
      });
      const data = await res.json();
      if (!data.success) throw new Error(data.message || 'सहेजना विफल');
      toast.success('बिल बन गया');
      setShowForm(false);
      setForm({
        clientName: '',
        clientAddress: '',
        clientPhone: '',
        clientEmail: '',
        clientGstin: '',
        taxPercent: 18,
        notes: 'विज्ञापन सेवाओं हेतु बिल। भुगतान के बाद रसीद जारी की जाएगी।',
        invoiceDate: formatDateInput(new Date()),
        dueDate: '',
        status: 'unpaid',
        items: [{ ...EMPTY_ITEM, description: 'वेबसाइट विज्ञापन बैनर' }],
      });
      await load();
      if (data.data?._id) {
        window.open(`/admin/billing/${data.data._id}/print`, '_blank');
      }
    } catch (err) {
      toast.error(err.message || 'सहेजना विफल');
    }
    setSaving(false);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('यह बिल हटाना है?')) return;
    try {
      const res = await fetch(`/api/admin/invoices/${id}`, { method: 'DELETE' });
      const data = await res.json();
      if (!data.success) throw new Error(data.message || 'हटाना विफल');
      toast.success('बिल हटाया गया');
      load();
    } catch (err) {
      toast.error(err.message || 'हटाना विफल');
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center py-20">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className="max-w-5xl space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
            <FiFileText className="w-5 h-5 text-red-600" />
            बिलिंग / प्रिंट
          </h1>
          <p className="text-xs text-gray-500 mt-1">
            विज्ञापन क्लाइंट के लिए बिल बनाएँ और प्रिंट करें
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={load}
            className="inline-flex items-center gap-1.5 px-3 py-2 text-sm rounded-lg border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800"
          >
            <FiRefreshCw className="w-4 h-4" />
            रीफ़्रेश
          </button>
          <button
            type="button"
            onClick={() => setShowForm(true)}
            className="inline-flex items-center gap-1.5 px-3 py-2 text-sm rounded-lg bg-red-600 text-white hover:bg-red-700"
          >
            <FiPlus className="w-4 h-4" />
            नया बिल
          </button>
        </div>
      </div>

      {showForm && (
        <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-5 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="font-semibold text-gray-900 dark:text-white text-sm">नया बिल</h2>
            <button type="button" onClick={() => setShowForm(false)} className="text-gray-400 hover:text-gray-700">
              <FiX className="w-5 h-5" />
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="sm:col-span-2">
              <label className="text-xs text-gray-500 mb-1 block">क्लाइंट नाम *</label>
              <input
                value={form.clientName}
                onChange={(e) => setForm((p) => ({ ...p, clientName: e.target.value }))}
                className="w-full px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-sm"
                placeholder="व्यक्ति / संस्था का नाम"
              />
            </div>
            <div className="sm:col-span-2">
              <label className="text-xs text-gray-500 mb-1 block">पता</label>
              <textarea
                value={form.clientAddress}
                onChange={(e) => setForm((p) => ({ ...p, clientAddress: e.target.value }))}
                rows={2}
                className="w-full px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-sm"
              />
            </div>
            <div>
              <label className="text-xs text-gray-500 mb-1 block">फ़ोन</label>
              <input
                value={form.clientPhone}
                onChange={(e) => setForm((p) => ({ ...p, clientPhone: e.target.value }))}
                className="w-full px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-sm"
              />
            </div>
            <div>
              <label className="text-xs text-gray-500 mb-1 block">ईमेल</label>
              <input
                value={form.clientEmail}
                onChange={(e) => setForm((p) => ({ ...p, clientEmail: e.target.value }))}
                className="w-full px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-sm"
              />
            </div>
            <div>
              <label className="text-xs text-gray-500 mb-1 block">GSTIN</label>
              <input
                value={form.clientGstin}
                onChange={(e) => setForm((p) => ({ ...p, clientGstin: e.target.value }))}
                className="w-full px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-sm"
              />
            </div>
            <div>
              <label className="text-xs text-gray-500 mb-1 block">स्थिति</label>
              <select
                value={form.status}
                onChange={(e) => setForm((p) => ({ ...p, status: e.target.value }))}
                className="w-full px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-sm"
              >
                {Object.entries(STATUS_LABEL).map(([k, v]) => (
                  <option key={k} value={k}>{v}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-xs text-gray-500 mb-1 block">बिल तिथि</label>
              <input
                type="date"
                value={form.invoiceDate}
                onChange={(e) => setForm((p) => ({ ...p, invoiceDate: e.target.value }))}
                className="w-full px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-sm"
              />
            </div>
            <div>
              <label className="text-xs text-gray-500 mb-1 block">देय तिथि</label>
              <input
                type="date"
                value={form.dueDate}
                onChange={(e) => setForm((p) => ({ ...p, dueDate: e.target.value }))}
                className="w-full px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-sm"
              />
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-semibold text-gray-800 dark:text-gray-200">आइटम</h3>
              <button type="button" onClick={addItem} className="text-xs text-red-600 hover:underline">
                + आइटम जोड़ें
              </button>
            </div>
            {form.items.map((item, i) => (
              <div key={i} className="grid grid-cols-12 gap-2 items-end">
                <div className="col-span-12 sm:col-span-5">
                  <label className="text-[11px] text-gray-500 mb-1 block">विवरण</label>
                  <input
                    value={item.description}
                    onChange={(e) => updateItem(i, { description: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-sm"
                    placeholder="जैसे Top strip बैनर — 7 दिन"
                  />
                </div>
                <div className="col-span-4 sm:col-span-2">
                  <label className="text-[11px] text-gray-500 mb-1 block">मात्रा</label>
                  <input
                    type="number"
                    min="0"
                    value={item.quantity}
                    onChange={(e) => updateItem(i, { quantity: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-sm"
                  />
                </div>
                <div className="col-span-4 sm:col-span-2">
                  <label className="text-[11px] text-gray-500 mb-1 block">दर (₹)</label>
                  <input
                    type="number"
                    min="0"
                    value={item.rate}
                    onChange={(e) => updateItem(i, { rate: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-sm"
                  />
                </div>
                <div className="col-span-3 sm:col-span-2">
                  <label className="text-[11px] text-gray-500 mb-1 block">राशि</label>
                  <div className="px-3 py-2 text-sm font-medium text-gray-800 dark:text-gray-200">
                    {formatMoney((Number(item.quantity) || 0) * (Number(item.rate) || 0))}
                  </div>
                </div>
                <div className="col-span-1 flex justify-end pb-2">
                  <button type="button" onClick={() => removeItem(i)} className="text-red-500 hover:text-red-700">
                    <FiTrash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="text-xs text-gray-500 mb-1 block">GST %</label>
              <input
                type="number"
                min="0"
                value={form.taxPercent}
                onChange={(e) => setForm((p) => ({ ...p, taxPercent: e.target.value }))}
                className="w-full px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-sm"
              />
            </div>
            <div className="rounded-lg bg-gray-50 dark:bg-gray-800/60 p-3 text-sm space-y-1">
              <div className="flex justify-between"><span className="text-gray-500">उप-योग</span><span>{formatMoney(totals.subtotal)}</span></div>
              <div className="flex justify-between"><span className="text-gray-500">GST ({totals.taxPercent}%)</span><span>{formatMoney(totals.taxAmount)}</span></div>
              <div className="flex justify-between font-bold text-gray-900 dark:text-white border-t border-gray-200 dark:border-gray-700 pt-1">
                <span>कुल</span><span>{formatMoney(totals.total)}</span>
              </div>
            </div>
          </div>

          <div>
            <label className="text-xs text-gray-500 mb-1 block">नोट्स</label>
            <textarea
              value={form.notes}
              onChange={(e) => setForm((p) => ({ ...p, notes: e.target.value }))}
              rows={2}
              className="w-full px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-sm"
            />
          </div>

          <button
            type="button"
            disabled={saving}
            onClick={handleSave}
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-red-600 text-white text-sm font-medium rounded-lg hover:bg-red-700 disabled:opacity-50"
          >
            <FiSave className="w-4 h-4" />
            {saving ? 'सहेजा जा रहा है...' : 'बिल सहेजें और प्रिंट खोलें'}
          </button>
        </div>
      )}

      <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-xs text-gray-500 border-b border-gray-100 dark:border-gray-800 bg-gray-50 dark:bg-gray-800/40">
                <th className="px-4 py-3 font-medium">बिल नं.</th>
                <th className="px-4 py-3 font-medium">क्लाइंट</th>
                <th className="px-4 py-3 font-medium">तिथि</th>
                <th className="px-4 py-3 font-medium">कुल</th>
                <th className="px-4 py-3 font-medium">स्थिति</th>
                <th className="px-4 py-3 font-medium text-right">क्रिया</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
              {invoices.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-4 py-10 text-center text-gray-400 text-sm">
                    अभी कोई बिल नहीं — “नया बिल” से बनाएँ
                  </td>
                </tr>
              ) : (
                invoices.map((inv) => (
                  <tr key={inv._id} className="hover:bg-gray-50/80 dark:hover:bg-gray-800/30">
                    <td className="px-4 py-3 font-mono text-xs text-red-600">{inv.invoiceNumber}</td>
                    <td className="px-4 py-3 text-gray-900 dark:text-white">{inv.clientName}</td>
                    <td className="px-4 py-3 text-gray-500">{formatDisplayDate(inv.invoiceDate)}</td>
                    <td className="px-4 py-3 font-medium">{formatMoney(inv.total)}</td>
                    <td className="px-4 py-3">
                      <span className="text-xs px-2 py-0.5 rounded-full bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300">
                        {STATUS_LABEL[inv.status] || inv.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="inline-flex items-center gap-2">
                        <Link
                          href={`/admin/billing/${inv._id}/print`}
                          target="_blank"
                          className="inline-flex items-center gap-1 text-xs text-red-600 hover:underline"
                        >
                          <FiPrinter className="w-3.5 h-3.5" />
                          प्रिंट
                        </Link>
                        <button
                          type="button"
                          onClick={() => handleDelete(inv._id)}
                          className="text-xs text-gray-400 hover:text-red-600"
                          title="हटाएँ"
                        >
                          <FiTrash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
