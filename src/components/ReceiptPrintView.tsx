import React from 'react';
import { Invoice, ClinicSettings, Patient } from '../types';
import { fixAssetPath } from '../utils/assetPath';

interface ReceiptPrintViewProps {
  invoice: Invoice;
  settings: ClinicSettings;
  patient?: Patient;
}

export const ReceiptPrintView: React.FC<ReceiptPrintViewProps> = ({
  invoice,
  settings,
  patient,
}) => {
  const subtotal = invoice.items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const balance = Math.max(0, invoice.total - invoice.amountPaid);

  return (
    <div
      className="receipt-print-container bg-white text-black p-6 mx-auto"
      style={{
        maxWidth: '8.5in',
        fontFamily: '"Bookman Old Style", Georgia, "Times New Roman", serif',
      }}
    >
      {/* Clinic Header */}
      <div className="flex items-center justify-between border-b-2 border-slate-900 pb-3 mb-4">
        <div className="flex items-center gap-3">
          <img
            src={fixAssetPath(settings.letterheadImages.clinicLogo)}
            alt="Clinic Logo"
            className="h-16 w-auto object-contain"
          />
          <img
            src={fixAssetPath(settings.letterheadImages.mmcLogo)}
            alt="MMC Logo"
            className="h-12 w-auto object-contain"
          />
        </div>

        <div className="text-right">
          <h1 className="text-lg font-bold tracking-tight text-slate-950 font-serif">
            {settings.clinicName}
          </h1>
          <p className="text-xs font-semibold text-slate-700">
            {settings.tagline || 'Ultrasound & Diagnostic Reporting'}
          </p>
          <p className="text-[11px] font-bold text-red-700">
            By DR. NAVEED AHMAD KHAN
          </p>
          <p className="text-[10px] text-slate-600 mt-0.5">
            {settings.address} • Ph: {settings.phone}
          </p>
        </div>
      </div>

      {/* Receipt Title Banner */}
      <div className="flex items-center justify-between bg-slate-100 border border-slate-300 px-3 py-1.5 mb-4 text-xs">
        <span className="font-extrabold tracking-wider uppercase text-slate-900">
          OFFICIAL DIAGNOSTIC RECEIPT / INVOICE
        </span>
        <span className="font-bold text-slate-800">
          Original (Patient Copy)
        </span>
      </div>

      {/* Patient & Invoice Meta Grid */}
      <div className="grid grid-cols-2 gap-4 border border-slate-300 p-3 mb-4 text-xs bg-slate-50/50">
        <div className="space-y-1">
          <div className="flex">
            <span className="w-28 font-bold text-slate-700">Patient Name:</span>
            <span className="font-extrabold text-slate-950 underline underline-offset-2">
              {invoice.patientName}
            </span>
          </div>
          {patient && (
            <>
              <div className="flex">
                <span className="w-28 font-bold text-slate-700">Patient MRN:</span>
                <span className="font-mono font-bold text-slate-900">{patient.mrn}</span>
              </div>
              <div className="flex">
                <span className="w-28 font-bold text-slate-700">Age / Sex:</span>
                <span>{patient.age} years / {patient.sex}</span>
              </div>
            </>
          )}
          <div className="flex">
            <span className="w-28 font-bold text-slate-700">Referring Dr:</span>
            <span className="font-medium">
              {patient?.referringDoctor || 'Dr. Naveed Ahmad Khan'}
            </span>
          </div>
        </div>

        <div className="space-y-1">
          <div className="flex">
            <span className="w-28 font-bold text-slate-700">Receipt No:</span>
            <span className="font-mono font-extrabold text-sky-900">{invoice.invoiceNumber}</span>
          </div>
          <div className="flex">
            <span className="w-28 font-bold text-slate-700">Date &amp; Time:</span>
            <span className="font-medium">{invoice.date}</span>
          </div>
          <div className="flex">
            <span className="w-28 font-bold text-slate-700">Payment Status:</span>
            <span
              className={`font-bold uppercase px-1.5 py-0.2 rounded text-[11px] ${
                invoice.status === 'Paid'
                  ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                  : 'bg-amber-100 text-amber-800 border border-amber-300'
              }`}
            >
              {invoice.status === 'Paid' ? 'PAID IN FULL' : invoice.status}
            </span>
          </div>
          <div className="flex">
            <span className="w-28 font-bold text-slate-700">Payment Mode:</span>
            <span>Cash Counter (Reception)</span>
          </div>
        </div>
      </div>

      {/* Services Table */}
      <table className="w-full text-xs text-left border border-slate-300 mb-4">
        <thead className="bg-slate-100 text-slate-900 border-b border-slate-300 font-bold uppercase text-[11px]">
          <tr>
            <th className="p-2 border-r border-slate-300 w-12 text-center">#</th>
            <th className="p-2 border-r border-slate-300">Diagnostic Service / Ultrasound Investigation</th>
            <th className="p-2 border-r border-slate-300 w-16 text-center">Qty</th>
            <th className="p-2 border-r border-slate-300 w-28 text-right">Rate (PKR)</th>
            <th className="p-2 w-28 text-right">Amount (PKR)</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-200">
          {invoice.items.map((item, idx) => (
            <tr key={item.id || idx}>
              <td className="p-2 border-r border-slate-300 text-center font-mono">{idx + 1}</td>
              <td className="p-2 border-r border-slate-300 font-bold text-slate-900">{item.testName}</td>
              <td className="p-2 border-r border-slate-300 text-center font-mono">{item.quantity}</td>
              <td className="p-2 border-r border-slate-300 text-right font-mono">
                Rs. {item.price.toLocaleString()}
              </td>
              <td className="p-2 text-right font-mono font-bold">
                Rs. {(item.price * item.quantity).toLocaleString()}
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Totals & Signature Block */}
      <div className="grid grid-cols-2 gap-6 items-start text-xs">
        {/* Left: Notes & Verification */}
        <div className="border border-slate-200 p-3 bg-slate-50 space-y-1.5 text-[11px] text-slate-600">
          <p className="font-bold text-slate-800">Terms &amp; Instructions:</p>
          <ul className="list-disc pl-4 space-y-0.5">
            <li>Reports can be collected from reception or printed online with this receipt.</li>
            <li>Consult your physician / Dr. Naveed Ahmad Khan with completed findings.</li>
            <li>Computer-generated official receipt. No manual signature required.</li>
          </ul>
          <div className="pt-2 text-[10px] text-slate-400 border-t border-slate-200">
            Auth Token: {invoice.id} • Cashier: Reception Desk
          </div>
        </div>

        {/* Right: Calculations */}
        <div className="border border-slate-300 p-3 space-y-1.5 font-mono">
          <div className="flex justify-between text-xs text-slate-700">
            <span>Gross Subtotal:</span>
            <span>Rs. {subtotal.toLocaleString()}</span>
          </div>

          {invoice.discount > 0 && (
            <div className="flex justify-between text-xs text-red-700 font-semibold">
              <span>Discount Allowed:</span>
              <span>- Rs. {invoice.discount.toLocaleString()}</span>
            </div>
          )}

          <div className="flex justify-between text-sm font-extrabold text-slate-950 border-t border-slate-300 pt-1.5">
            <span>Net Payable:</span>
            <span>Rs. {invoice.total.toLocaleString()}</span>
          </div>

          <div className="flex justify-between text-xs font-bold text-emerald-800">
            <span>Amount Received:</span>
            <span>Rs. {invoice.amountPaid.toLocaleString()}</span>
          </div>

          {balance > 0 ? (
            <div className="flex justify-between text-xs font-bold text-red-600 border-t border-slate-200 pt-1">
              <span>Balance Due:</span>
              <span>Rs. {balance.toLocaleString()}</span>
            </div>
          ) : (
            <div className="flex justify-between text-xs font-bold text-emerald-700 border-t border-slate-200 pt-1">
              <span>Balance:</span>
              <span>Rs. 0 (Nil)</span>
            </div>
          )}
        </div>
      </div>

      {/* Signature Row */}
      <div className="mt-8 pt-4 border-t border-slate-300 flex justify-between items-end text-xs">
        <div className="space-y-1">
          <div className="w-44 border-b border-slate-400 mb-1" />
          <span className="font-bold text-slate-700">Patient / Attendant Signature</span>
        </div>

        <div className="space-y-1 text-right">
          <div className="w-44 border-b border-slate-400 mb-1 ml-auto" />
          <span className="font-bold text-slate-700">Authorized Receptionist / Cashier</span>
        </div>
      </div>
    </div>
  );
};
