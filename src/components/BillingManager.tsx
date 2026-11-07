import React, { useState } from 'react';
import { Patient, ClinicSettings, BillItem, Invoice } from '../types';
import { Storage } from '../utils/storage';
import { TEST_PRICE_CATALOG } from '../data/seedData';
import { Receipt, Printer, Plus, Trash2, CheckCircle2, DollarSign, X, Edit3, User, Sparkles } from 'lucide-react';
import { ReceiptPrintView } from './ReceiptPrintView';

interface BillingManagerProps {
  patients: Patient[];
  settings: ClinicSettings;
  onPrintInvoice?: (invoice: Invoice) => void;
}

export const BillingManager: React.FC<BillingManagerProps> = ({ patients, settings, onPrintInvoice }) => {
  const [invoices, setInvoices] = useState<Invoice[]>(() => Storage.getInvoices());

  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedInvoiceForPrint, setSelectedInvoiceForPrint] = useState<Invoice | null>(null);

  const handleDeleteInvoice = (inv: Invoice) => {
    const confirmMsg = `Are you sure you want to delete receipt #${inv.invoiceNumber} for ${inv.patientName}?\nThis action cannot be undone.`;
    if (window.confirm(confirmMsg)) {
      Storage.deleteInvoice(inv.id);
      setInvoices(Storage.getInvoices());
    }
  };

  // --- New Invoice Form State ---
  const [selectedPatientId, setSelectedPatientId] = useState(patients[0]?.id || 'walkin');
  const [walkinPatientName, setWalkinPatientName] = useState('');

  // Diagnostic items in the chalan
  const [invoiceItems, setInvoiceItems] = useState<BillItem[]>([
    { id: 'item_init_1', testName: 'Scrotal & Varicocele Ultrasound', price: 3500, quantity: 1 },
  ]);

  // Adder form fields for custom/selected service
  const [customTestName, setCustomTestName] = useState('Scrotal & Varicocele Ultrasound');
  const [customPrice, setCustomPrice] = useState<number | string>(3500);
  const [customQty, setCustomQty] = useState<number>(1);

  const [discount, setDiscount] = useState<number>(0);
  const [amountPaid, setAmountPaid] = useState<number>(3500);

  // Calculations
  const subtotal = invoiceItems.reduce(
    (sum, item) => sum + (Number(item.price) || 0) * (Number(item.quantity) || 1),
    0
  );
  const total = Math.max(0, subtotal - (Number(discount) || 0));

  // Open modal with fresh state
  const handleOpenCreateModal = () => {
    setSelectedPatientId(patients[0]?.id || 'walkin');
    setWalkinPatientName('');
    const initialItem: BillItem = {
      id: `item_${Date.now()}_1`,
      testName: 'Scrotal & Varicocele Ultrasound',
      price: 3500,
      quantity: 1,
    };
    setInvoiceItems([initialItem]);
    setCustomTestName('Scrotal & Varicocele Ultrasound');
    setCustomPrice(3500);
    setCustomQty(1);
    setDiscount(0);
    setAmountPaid(3500);
    setShowCreateModal(true);
  };

  // Select test preset to fill the adder fields
  const handleSelectPreset = (cat: BillItem) => {
    setCustomTestName(cat.testName);
    setCustomPrice(cat.price);
    setCustomQty(1);
  };

  // Quick 1-click add from catalog badge (user can still edit price directly in the row)
  const handleQuickAddBadge = (cat: BillItem) => {
    const newItem: BillItem = {
      id: `item_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      testName: cat.testName,
      price: cat.price,
      quantity: 1,
    };
    const updated = [...invoiceItems, newItem];
    setInvoiceItems(updated);
    // Auto-update amount paid if it matched previous total
    const newSubtotal = updated.reduce((sum, i) => sum + (Number(i.price) || 0) * (Number(i.quantity) || 1), 0);
    setAmountPaid(Math.max(0, newSubtotal - discount));
  };

  // Add the item from adder input fields (with custom entered price!)
  const handleAddCustomItem = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const name = customTestName.trim() || 'Diagnostic Ultrasound';
    const priceVal = Math.max(0, parseFloat(String(customPrice)) || 0);
    const qtyVal = Math.max(1, customQty || 1);

    const newItem: BillItem = {
      id: `item_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      testName: name,
      price: priceVal,
      quantity: qtyVal,
    };

    const updated = [...invoiceItems, newItem];
    setInvoiceItems(updated);

    const newSubtotal = updated.reduce((sum, i) => sum + (Number(i.price) || 0) * (Number(i.quantity) || 1), 0);
    setAmountPaid(Math.max(0, newSubtotal - discount));
  };

  // Directly update price of an existing row
  const handleUpdateItemPrice = (id: string, newPrice: number) => {
    const validPrice = Math.max(0, newPrice);
    const updated = invoiceItems.map((item) => (item.id === id ? { ...item, price: validPrice } : item));
    setInvoiceItems(updated);
    const newSubtotal = updated.reduce((sum, i) => sum + (Number(i.price) || 0) * (Number(i.quantity) || 1), 0);
    setAmountPaid(Math.max(0, newSubtotal - discount));
  };

  // Directly update quantity of an existing row
  const handleUpdateItemQty = (id: string, newQty: number) => {
    const validQty = Math.max(1, newQty);
    const updated = invoiceItems.map((item) => (item.id === id ? { ...item, quantity: validQty } : item));
    setInvoiceItems(updated);
    const newSubtotal = updated.reduce((sum, i) => sum + (Number(i.price) || 0) * (Number(i.quantity) || 1), 0);
    setAmountPaid(Math.max(0, newSubtotal - discount));
  };

  // Directly update test name of an existing row
  const handleUpdateItemName = (id: string, newName: string) => {
    setInvoiceItems((prev) =>
      prev.map((item) => (item.id === id ? { ...item, testName: newName } : item))
    );
  };

  // Remove item from bill
  const handleRemoveItem = (id: string) => {
    const updated = invoiceItems.filter((i) => i.id !== id);
    setInvoiceItems(updated);
    const newSubtotal = updated.reduce((sum, i) => sum + (Number(i.price) || 0) * (Number(i.quantity) || 1), 0);
    setAmountPaid(Math.max(0, newSubtotal - discount));
  };

  // Create invoice handler
  const handleCreateInvoice = (e: React.FormEvent) => {
    e.preventDefault();
    if (invoiceItems.length === 0) {
      alert('Please add at least one test or service to generate the chalan.');
      return;
    }

    let pId = selectedPatientId;
    let pName = '';

    if (selectedPatientId === 'walkin' || !selectedPatientId) {
      pId = `walkin_${Date.now()}`;
      pName = walkinPatientName.trim() || 'Walk-in / Cash Patient';
    } else {
      const pat = patients.find((p) => p.id === selectedPatientId);
      if (pat) {
        pId = pat.id;
        pName = pat.name;
      } else {
        pName = walkinPatientName.trim() || 'Patient';
      }
    }

    const newInv: Invoice = {
      id: `inv_${Date.now()}`,
      invoiceNumber: `INV-2026-${String(invoices.length + 44).padStart(3, '0')}`,
      patientId: pId,
      patientName: pName,
      date: new Date().toLocaleDateString('en-GB').replace(/\//g, '-'),
      items: invoiceItems,
      discount: discount,
      total: total,
      amountPaid: amountPaid,
      status: amountPaid >= total ? 'Paid' : amountPaid > 0 ? 'Partial' : 'Due',
    };

    Storage.saveInvoice(newInv);
    setInvoices(Storage.getInvoices());
    setShowCreateModal(false);
    triggerPrint(newInv);
  };

  const triggerPrint = (inv: Invoice) => {
    setSelectedInvoiceForPrint(inv);
    if (onPrintInvoice) {
      onPrintInvoice(inv);
    } else {
      setTimeout(() => window.print(), 100);
    }
  };

  const totalRevenue = invoices.reduce((sum, inv) => sum + inv.amountPaid, 0);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
      {/* Overview Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs">
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider block mb-1">
            Total Revenue (PKR)
          </span>
          <span className="text-2xl font-black text-emerald-600">
            Rs. {totalRevenue.toLocaleString()}
          </span>
          <span className="text-[11px] text-slate-400 mt-1 block">Diagnostic services collected</span>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs">
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider block mb-1">
            Chalans / Invoices Issued
          </span>
          <span className="text-2xl font-black text-slate-900">{invoices.length}</span>
          <span className="text-[11px] text-slate-400 mt-1 block">All registered receipts</span>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider block mb-1">
              Reception &amp; Billing
            </span>
            <span className="text-xs font-bold text-slate-700">Custom Chalan Generator</span>
          </div>
          <button
            type="button"
            onClick={handleOpenCreateModal}
            className="px-3.5 py-2 bg-sky-600 hover:bg-sky-700 text-white rounded-lg text-xs font-bold transition-colors cursor-pointer flex items-center gap-1.5 shadow-xs"
          >
            <Plus className="w-3.5 h-3.5" />
            + Create Bill / Chalan
          </button>
        </div>
      </div>

      {/* Invoices List */}
      <div className="bg-white border border-slate-200 rounded-xl shadow-xs overflow-hidden">
        <div className="p-4 border-b border-slate-200 flex items-center justify-between">
          <h3 className="text-sm font-extrabold text-slate-900 flex items-center gap-2">
            <Receipt className="w-4 h-4 text-sky-600" />
            Diagnostic Cash Register &amp; Receipts
          </h3>
          <span className="text-xs text-slate-500">
            Click <strong>Print</strong> for official chalan receipt or <strong>Trash</strong> to delete.
          </span>
        </div>

        <table className="min-w-full divide-y divide-slate-200 text-left text-xs">
          <thead className="bg-slate-50 text-slate-600 font-bold uppercase tracking-wider text-[11px]">
            <tr>
              <th className="px-5 py-3">Chalan #</th>
              <th className="px-5 py-3">Patient</th>
              <th className="px-5 py-3">Date</th>
              <th className="px-5 py-3">Services</th>
              <th className="px-5 py-3">Total (Rs.)</th>
              <th className="px-5 py-3">Paid (Rs.)</th>
              <th className="px-5 py-3">Status</th>
              <th className="px-5 py-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200 text-slate-700">
            {invoices.length === 0 ? (
              <tr>
                <td colSpan={8} className="px-5 py-10 text-center text-slate-400">
                  <Receipt className="w-8 h-8 mx-auto text-slate-300 mb-2" />
                  <p className="font-semibold text-slate-600">No chalans or receipts issued yet.</p>
                  <p className="text-[11px] mt-1">Click "+ Create Bill / Chalan" above to issue a new receipt.</p>
                </td>
              </tr>
            ) : (
              invoices.map((inv) => (
                <tr key={inv.id} className="hover:bg-slate-50 transition-colors">
                  <td className="px-5 py-3.5 font-mono font-bold text-sky-700">{inv.invoiceNumber}</td>
                  <td className="px-5 py-3.5 font-bold text-slate-900">{inv.patientName}</td>
                  <td className="px-5 py-3.5">{inv.date}</td>
                  <td className="px-5 py-3.5 max-w-xs truncate">
                    {inv.items.map((i) => i.testName).join(', ')}
                  </td>
                  <td className="px-5 py-3.5 font-bold font-mono">Rs. {inv.total.toLocaleString()}</td>
                  <td className="px-5 py-3.5 font-mono text-emerald-600 font-bold">
                    Rs. {inv.amountPaid.toLocaleString()}
                  </td>
                  <td className="px-5 py-3.5">
                    <span
                      className={`px-2 py-0.5 rounded-full font-bold text-[10px] uppercase ${
                        inv.status === 'Paid'
                          ? 'bg-emerald-100 text-emerald-800'
                          : inv.status === 'Partial'
                          ? 'bg-amber-100 text-amber-800'
                          : 'bg-red-100 text-red-800'
                      }`}
                    >
                      {inv.status}
                    </span>
                  </td>
                  <td className="px-5 py-3.5 text-right flex items-center justify-end gap-2">
                    <button
                      type="button"
                      onClick={() => setSelectedInvoiceForPrint(inv)}
                      className="inline-flex items-center gap-1 px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded font-semibold cursor-pointer"
                    >
                      <Printer className="w-3.5 h-3.5" /> Print
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDeleteInvoice(inv)}
                      className="p-1 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors cursor-pointer"
                      title="Delete this chalan / receipt"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Create Invoice / Chalan Modal */}
      {showCreateModal && (
        <div
          className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs overflow-y-auto"
          onClick={(e) => { if (e.target === e.currentTarget) setShowCreateModal(false); }}
        >
          <div className="flex min-h-full items-start justify-center p-4 py-8">
            <div className="bg-white rounded-2xl shadow-xl w-full max-w-3xl border border-slate-200">
              {/* Sticky Header */}
              <div className="sticky top-0 z-10 flex items-center justify-between px-6 py-4 border-b border-slate-200 bg-slate-50 rounded-t-2xl">
                <div>
                  <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                    <Receipt className="w-4 h-4 text-sky-600" />
                    Generate Diagnostic Bill / Chalan
                  </h3>
                  <p className="text-[11px] text-slate-500 mt-0.5">
                    Select standard investigations or enter custom services and custom prices freely.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="text-slate-400 hover:text-slate-700 p-1 rounded-lg flex-shrink-0"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleCreateInvoice} className="p-6 space-y-5 text-xs">
              {/* Patient Selection & Walk-in Option */}
              <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200 space-y-2.5">
                <div className="flex items-center justify-between">
                  <label className="font-bold text-slate-800 flex items-center gap-1.5">
                    <User className="w-3.5 h-3.5 text-sky-600" /> Patient Assignment
                  </label>
                  <span className="text-[11px] text-slate-500">Select registered patient or walk-in</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                      Choose Patient / Walk-in:
                    </label>
                    <select
                      value={selectedPatientId}
                      onChange={(e) => setSelectedPatientId(e.target.value)}
                      className="w-full bg-white border border-slate-300 rounded-lg p-2 font-medium focus:ring-1 focus:ring-sky-500 focus:outline-hidden"
                    >
                      <option value="walkin">-- Walk-in / Cash Patient --</option>
                      {patients.map((p) => (
                        <option key={p.id} value={p.id}>
                          {p.name} ({p.age}y, MRN: {p.mrn})
                        </option>
                      ))}
                    </select>
                  </div>

                  {(selectedPatientId === 'walkin' || !selectedPatientId) && (
                    <div>
                      <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                        Walk-in Patient Name:
                      </label>
                      <input
                        type="text"
                        placeholder="e.g. Muhammad Ali or Walk-in Cash"
                        value={walkinPatientName}
                        onChange={(e) => setWalkinPatientName(e.target.value)}
                        className="w-full bg-white border border-slate-300 rounded-lg p-2 font-medium focus:ring-1 focus:ring-sky-500 focus:outline-hidden"
                      />
                    </div>
                  )}
                </div>
              </div>

              {/* Service & Price Entry Toolbar */}
              <div className="bg-sky-50/60 border border-sky-200 rounded-xl p-3.5 space-y-3">
                <div className="flex items-center justify-between">
                  <label className="font-bold text-sky-950 flex items-center gap-1.5">
                    <Plus className="w-3.5 h-3.5 text-sky-600" /> Add Diagnostic Service &amp; Set Price
                  </label>
                  <span className="text-[11px] text-sky-700 font-medium">Prices are fully editable</span>
                </div>

                {/* Dropdown Preset Selector */}
                <div className="flex items-center gap-2">
                  <span className="text-[11px] font-semibold text-slate-600 shrink-0">Quick Preset:</span>
                  <select
                    onChange={(e) => {
                      const found = TEST_PRICE_CATALOG.find((c) => c.id === e.target.value);
                      if (found) handleSelectPreset(found);
                    }}
                    defaultValue=""
                    className="w-full bg-white border border-slate-300 rounded-lg px-2.5 py-1.5 text-xs font-medium text-slate-800 focus:ring-1 focus:ring-sky-500"
                  >
                    <option value="" disabled>-- Select standard test to load default rate --</option>
                    {TEST_PRICE_CATALOG.map((cat) => (
                      <option key={cat.id} value={cat.id}>
                        {cat.testName} (Default: Rs. {cat.price})
                      </option>
                    ))}
                  </select>
                </div>

                {/* Custom input bar: Name, Price, Quantity */}
                <div className="grid grid-cols-12 gap-2 items-end pt-1">
                  <div className="col-span-12 sm:col-span-6">
                    <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                      Test / Investigation Name:
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Scrotal Ultrasound or Custom Test"
                      value={customTestName}
                      onChange={(e) => setCustomTestName(e.target.value)}
                      className="w-full bg-white border border-slate-300 rounded-lg px-2.5 py-1.5 text-xs font-semibold text-slate-900 focus:ring-1 focus:ring-sky-500"
                    />
                  </div>

                  <div className="col-span-6 sm:col-span-3">
                    <label className="block text-[11px] font-bold text-slate-700 mb-1">
                      Price / Rate (PKR):
                    </label>
                    <div className="relative">
                      <span className="absolute left-2.5 top-2 text-slate-400 font-bold text-[11px]">Rs.</span>
                      <input
                        type="number"
                        min="0"
                        step="50"
                        placeholder="0"
                        value={customPrice}
                        onChange={(e) => setCustomPrice(e.target.value)}
                        className="w-full bg-white border border-slate-300 rounded-lg pl-8 pr-2 py-1.5 text-xs font-mono font-bold text-sky-800 focus:ring-1 focus:ring-sky-500"
                      />
                    </div>
                  </div>

                  <div className="col-span-3 sm:col-span-1">
                    <label className="block text-[11px] font-semibold text-slate-700 mb-1 text-center">
                      Qty:
                    </label>
                    <input
                      type="number"
                      min="1"
                      value={customQty}
                      onChange={(e) => setCustomQty(parseInt(e.target.value) || 1)}
                      className="w-full bg-white border border-slate-300 rounded-lg py-1.5 text-xs font-mono text-center font-bold text-slate-800"
                    />
                  </div>

                  <div className="col-span-3 sm:col-span-2">
                    <button
                      type="button"
                      onClick={() => handleAddCustomItem()}
                      className="w-full py-1.5 bg-sky-600 hover:bg-sky-700 text-white rounded-lg text-xs font-bold transition-colors shadow-xs cursor-pointer flex items-center justify-center gap-1"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      Add to Bill
                    </button>
                  </div>
                </div>

                {/* Quick Add Badges */}
                <div className="pt-2 border-t border-sky-100">
                  <span className="text-[10px] uppercase font-bold text-slate-500 block mb-1.5">
                    1-Click Add Standard Tests (or click to populate):
                  </span>
                  <div className="flex flex-wrap gap-1.5 max-h-24 overflow-y-auto p-1 bg-white/70 border border-slate-200 rounded-lg">
                    {TEST_PRICE_CATALOG.map((cat) => (
                      <button
                        key={cat.id}
                        type="button"
                        onClick={() => handleQuickAddBadge(cat)}
                        className="px-2 py-1 bg-white hover:bg-sky-100/70 border border-slate-200 hover:border-sky-300 rounded text-[11px] font-medium text-slate-700 transition-colors flex items-center gap-1.5 cursor-pointer shadow-2xs"
                        title="Click to add to chalan with standard price"
                      >
                        <span>{cat.testName}</span>
                        <span className="text-sky-700 font-mono font-bold">Rs.{cat.price}</span>
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Items List in Current Chalan (Editable Prices Table) */}
              <div className="space-y-2 border border-slate-200 rounded-xl p-3.5 bg-white shadow-2xs">
                <div className="flex items-center justify-between border-b border-slate-200 pb-2">
                  <span className="font-extrabold text-slate-900 text-xs">
                    Chalan Line Items ({invoiceItems.length})
                  </span>
                  <span className="text-[11px] text-slate-500">
                    You can directly edit the <strong>Rate (Rs.)</strong> or <strong>Quantity</strong> below.
                  </span>
                </div>

                {invoiceItems.length === 0 ? (
                  <div className="py-6 text-center text-slate-400">
                    <p className="font-semibold text-slate-600">No services added to this bill yet.</p>
                    <p className="text-[11px] mt-0.5">Use the adder bar or standard buttons above to add services.</p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {invoiceItems.map((item, idx) => (
                      <div
                        key={item.id}
                        className="flex flex-col sm:flex-row sm:items-center justify-between bg-slate-50 hover:bg-slate-100/60 p-2.5 rounded-lg border border-slate-200 gap-2 transition-colors"
                      >
                        <div className="flex items-center gap-2 flex-1">
                          <span className="w-5 text-center font-mono font-bold text-slate-400 text-[11px]">
                            {idx + 1}.
                          </span>
                          <input
                            type="text"
                            value={item.testName}
                            onChange={(e) => handleUpdateItemName(item.id, e.target.value)}
                            className="flex-1 bg-white border border-slate-300 rounded px-2 py-1 font-semibold text-slate-800 text-xs focus:ring-1 focus:ring-sky-500"
                            title="Edit test name"
                          />
                        </div>

                        <div className="flex items-center gap-3 justify-end">
                          {/* Price Input */}
                          <div className="flex items-center gap-1">
                            <span className="text-slate-500 font-semibold text-[11px]">Rate: Rs.</span>
                            <input
                              type="number"
                              min="0"
                              step="50"
                              value={item.price}
                              onChange={(e) => handleUpdateItemPrice(item.id, parseFloat(e.target.value) || 0)}
                              className="w-24 bg-white border border-slate-300 rounded px-2 py-1 font-mono font-bold text-sky-800 text-xs text-right focus:ring-1 focus:ring-sky-500"
                              title="Enter custom price for this service"
                            />
                          </div>

                          {/* Quantity Input */}
                          <div className="flex items-center gap-1">
                            <span className="text-slate-500 font-semibold text-[11px]">Qty:</span>
                            <input
                              type="number"
                              min="1"
                              value={item.quantity}
                              onChange={(e) => handleUpdateItemQty(item.id, parseInt(e.target.value) || 1)}
                              className="w-12 bg-white border border-slate-300 rounded px-1.5 py-1 font-mono text-center font-bold text-slate-800 text-xs"
                            />
                          </div>

                          {/* Line Total */}
                          <div className="w-24 text-right">
                            <span className="font-mono font-extrabold text-slate-900 text-xs">
                              Rs. {((item.price || 0) * (item.quantity || 1)).toLocaleString()}
                            </span>
                          </div>

                          {/* Remove button */}
                          <button
                            type="button"
                            onClick={() => handleRemoveItem(item.id)}
                            className="p-1 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors cursor-pointer"
                            title="Remove this item from chalan"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Calculations & Discounts */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 bg-slate-50 p-3.5 rounded-xl border border-slate-200">
                <div>
                  <span className="text-slate-500 font-semibold block text-[11px]">Gross Subtotal</span>
                  <span className="text-base font-black font-mono text-slate-900">
                    Rs. {subtotal.toLocaleString()}
                  </span>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-slate-500 font-semibold text-[11px]">Discount (Rs.):</span>
                    {discount > 0 && (
                      <button
                        type="button"
                        onClick={() => {
                          setDiscount(0);
                          setAmountPaid(subtotal);
                        }}
                        className="text-[10px] text-red-600 font-semibold underline cursor-pointer"
                      >
                        Reset
                      </button>
                    )}
                  </div>
                  <input
                    type="number"
                    min="0"
                    step="50"
                    value={discount}
                    onChange={(e) => {
                      const d = Math.max(0, parseFloat(e.target.value) || 0);
                      setDiscount(d);
                      setAmountPaid(Math.max(0, subtotal - d));
                    }}
                    className="w-full bg-white border border-slate-300 rounded-lg px-2.5 py-1 font-mono font-bold text-xs focus:ring-1 focus:ring-sky-500"
                  />
                  <div className="flex gap-1 mt-1">
                    <button
                      type="button"
                      onClick={() => {
                        const d = 500;
                        setDiscount(d);
                        setAmountPaid(Math.max(0, subtotal - d));
                      }}
                      className="px-1.5 py-0.5 bg-slate-200 hover:bg-slate-300 rounded text-[10px] font-semibold text-slate-700"
                    >
                      -500
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        const d = Math.round(subtotal * 0.1);
                        setDiscount(d);
                        setAmountPaid(Math.max(0, subtotal - d));
                      }}
                      className="px-1.5 py-0.5 bg-slate-200 hover:bg-slate-300 rounded text-[10px] font-semibold text-slate-700"
                    >
                      10% Off
                    </button>
                  </div>
                </div>

                <div>
                  <span className="text-slate-500 font-semibold block text-[11px]">Net Payable</span>
                  <span className="text-base font-black font-mono text-emerald-600">
                    Rs. {total.toLocaleString()}
                  </span>
                </div>
              </div>

              {/* Amount Paid & Status */}
              <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200 space-y-2">
                <div className="flex items-center justify-between">
                  <label className="font-bold text-slate-700 block text-xs">
                    Amount Received / Paid (PKR):
                  </label>
                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      onClick={() => setAmountPaid(total)}
                      className="px-2 py-0.5 bg-emerald-100 hover:bg-emerald-200 text-emerald-800 rounded text-[10px] font-bold cursor-pointer transition-colors"
                    >
                      Paid in Full (Rs. {total})
                    </button>
                    <button
                      type="button"
                      onClick={() => setAmountPaid(Math.round(total / 2))}
                      className="px-2 py-0.5 bg-amber-100 hover:bg-amber-200 text-amber-800 rounded text-[10px] font-bold cursor-pointer transition-colors"
                    >
                      50% Advance
                    </button>
                    <button
                      type="button"
                      onClick={() => setAmountPaid(0)}
                      className="px-2 py-0.5 bg-red-100 hover:bg-red-200 text-red-800 rounded text-[10px] font-bold cursor-pointer transition-colors"
                    >
                      Due (Rs. 0)
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3 items-center">
                  <input
                    type="number"
                    min="0"
                    step="50"
                    value={amountPaid}
                    onChange={(e) => setAmountPaid(parseFloat(e.target.value) || 0)}
                    className="w-full bg-white border border-slate-300 rounded-lg p-2 font-mono font-bold text-slate-900 text-sm focus:ring-1 focus:ring-sky-500"
                  />

                  <div className="flex items-center gap-2 justify-end">
                    <span className="text-[11px] font-semibold text-slate-500">Chalan Status:</span>
                    <span
                      className={`px-2.5 py-1 rounded-md font-extrabold text-xs uppercase ${
                        amountPaid >= total
                          ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                          : amountPaid > 0
                          ? 'bg-amber-100 text-amber-800 border border-amber-300'
                          : 'bg-red-100 text-red-800 border border-red-300'
                      }`}
                    >
                      {amountPaid >= total ? 'Paid' : amountPaid > 0 ? 'Partial' : 'Due'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="pt-3 border-t border-slate-200 flex justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg font-semibold cursor-pointer transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-sky-600 hover:bg-sky-700 text-white rounded-lg font-bold shadow-xs cursor-pointer flex items-center gap-2 transition-colors"
                >
                  <Printer className="w-4 h-4" />
                  Generate &amp; Print Chalan Receipt
                </button>
              </div>
            </form>
            </div>
          </div>
        </div>
      )}

      {/* Printable Receipt Modal */}
      {selectedInvoiceForPrint && (
        <div className="fixed inset-0 z-50 bg-slate-900/70 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto no-print">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl border border-slate-200 p-6 space-y-4 my-8">
            <div className="flex items-center justify-between border-b border-slate-200 pb-3">
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <Receipt className="w-4 h-4 text-sky-600" />
                Diagnostic Cash Receipt Preview
              </h3>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => triggerPrint(selectedInvoiceForPrint)}
                  className="px-3.5 py-1.5 bg-sky-600 hover:bg-sky-700 text-white rounded-lg text-xs font-bold flex items-center gap-1.5 cursor-pointer shadow-xs transition-colors"
                >
                  <Printer className="w-3.5 h-3.5" /> Print Receipt
                </button>
                <button
                  type="button"
                  onClick={() => setSelectedInvoiceForPrint(null)}
                  className="text-slate-400 hover:text-slate-700 p-1 rounded-lg"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Receipt Body in Official Clinic Layout */}
            <div className="border border-slate-200 rounded-xl overflow-hidden shadow-xs">
              <ReceiptPrintView
                invoice={selectedInvoiceForPrint}
                settings={settings}
                patient={patients.find((p) => p.id === selectedInvoiceForPrint.patientId)}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
