import React from 'react';
import { Order } from '../types';
import { Printer, X, Download, ShieldCheck, CheckCircle2 } from 'lucide-react';

interface InvoiceModalProps {
  order: Order | null;
  onClose: () => void;
}

export const InvoiceModal: React.FC<InvoiceModalProps> = ({ order, onClose }) => {
  if (!order) return null;

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/85 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 print:p-0 print:bg-white print:fixed print:inset-0">
      
      {/* Container */}
      <div className="relative bg-white text-black rounded-3xl max-w-2xl w-full p-6 sm:p-8 shadow-2xl border border-gray-300 my-6 print:m-0 print:border-none print:shadow-none print:w-full print:max-w-full">
        
        {/* Top Controls (Hidden in Print) */}
        <div className="flex items-center justify-between pb-4 mb-4 border-b border-gray-200 print:hidden">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-gray-500 uppercase">معاينة الفاتورة الرسمية (نسخة أبيض وأسود)</span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-black text-white hover:bg-gray-800 text-xs font-bold transition-all shadow-md"
            >
              <Printer className="w-4 h-4" />
              <span>تحميل أو طباعة PDF</span>
            </button>
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center text-gray-600"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* PRINTABLE INVOICE CONTENT (Pure Black & White Inspired by Sahl App) */}
        <div id="printable-invoice" className="space-y-6 text-black bg-white">
          
          {/* Invoice Header */}
          <div className="flex items-start justify-between border-b-2 border-black pb-4">
            <div className="flex items-center gap-3">
              <div className="w-14 h-14 border-2 border-black rounded-xl p-1 flex items-center justify-center bg-white">
                <img src="/logo.png" alt="مرتفعات ستور" className="w-full h-full object-contain filter grayscale contrast-200" />
              </div>
              <div>
                <h1 className="text-xl font-black tracking-tight text-black">مرتفعات ستور</h1>
                <p className="text-xs font-mono font-bold tracking-wider">MORTAFAAT STORE</p>
                <p className="text-[10px] text-gray-600">هاتف خدمة العملاء: 01067906474</p>
              </div>
            </div>

            <div className="text-left">
              <span className="text-xs font-black uppercase tracking-widest border border-black px-2 py-0.5 rounded block text-center mb-1">
                فاتورة شراء إلكترونية
              </span>
              <p className="font-mono text-sm font-black">#{order.id}</p>
              <p className="text-[10px] text-gray-600">{order.createdAt}</p>
            </div>
          </div>

          {/* Customer Details Box */}
          <div className="grid grid-cols-2 gap-4 border border-black p-3.5 rounded-xl text-xs">
            <div>
              <span className="text-[10px] font-bold text-gray-500 uppercase block">بيانات العميل:</span>
              <p className="font-black text-sm text-black mt-0.5">{order.customerName}</p>
              <p className="font-mono font-bold text-gray-700">{order.phone}</p>
            </div>
            <div>
              <span className="text-[10px] font-bold text-gray-500 uppercase block">عنوان الاستلام:</span>
              <p className="font-bold text-black mt-0.5">{order.governorate} - {order.address}</p>
              <p className="text-[10px] text-gray-600">
                طريقة الدفع: {order.paymentMethod === 'cod' ? 'نقداً عند الاستلام' : 'دفع إلكتروني'}
              </p>
            </div>
          </div>

          {/* Items Table */}
          <div className="overflow-hidden border border-black rounded-xl">
            <table className="w-full text-right text-xs">
              <thead className="bg-gray-100 border-b border-black text-black font-black">
                <tr>
                  <th className="py-2.5 px-3">#</th>
                  <th className="py-2.5 px-3">بيان المنتج</th>
                  <th className="py-2.5 px-3 text-center">الكمية</th>
                  <th className="py-2.5 px-3 text-left">سعر الوحدة</th>
                  <th className="py-2.5 px-3 text-left">الإجمالي</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {order.items.map((item, idx) => (
                  <tr key={idx} className="hover:bg-gray-50">
                    <td className="py-2.5 px-3 font-mono font-bold">{idx + 1}</td>
                    <td className="py-2.5 px-3">
                      <p className="font-bold text-black">{item.product.name}</p>
                      {(item.selectedSize || item.selectedColor) && (
                        <span className="text-[10px] text-gray-500">
                          {item.selectedSize ? `المقاس: ${item.selectedSize} ` : ''}
                          {item.selectedColor ? `اللون: ${item.selectedColor}` : ''}
                        </span>
                      )}
                    </td>
                    <td className="py-2.5 px-3 text-center font-mono font-bold">{item.quantity}</td>
                    <td className="py-2.5 px-3 text-left font-mono">{item.product.price} ج.م</td>
                    <td className="py-2.5 px-3 text-left font-mono font-black">{item.product.price * item.quantity} ج.م</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Financial Totals */}
          <div className="flex justify-between items-start gap-4">
            
            {/* Barcode & Notice */}
            <div className="space-y-2 max-w-[280px]">
              {/* Simulated Barcode */}
              <div className="border border-black p-2 rounded-lg text-center bg-gray-50">
                <div className="h-8 flex items-center justify-center gap-1">
                  {[4,2,6,1,3,5,2,4,1,7,3,2,6,2,4,1,5,3,2,6,1,4].map((w, i) => (
                    <div key={i} className="h-full bg-black" style={{ width: `${w * 1.5}px` }} />
                  ))}
                </div>
                <span className="text-[9px] font-mono tracking-widest block mt-1">*{order.id}*</span>
              </div>
              <p className="text-[9px] text-gray-600 leading-tight">
                * يحق للعميل فحص ومعاينة المنتج قبل الدفع للمندوب، والاسترجاع خلال 14 يوماً وفقاً للشروط.
              </p>
            </div>

            {/* Calculations Breakdown */}
            <div className="w-56 space-y-1.5 text-xs text-right">
              <div className="flex justify-between text-gray-700">
                <span>قيمة المشتريات:</span>
                <span className="font-mono font-bold">{order.subtotal} ج.م</span>
              </div>
              {order.discountAmount ? (
                <div className="flex justify-between text-gray-700">
                  <span>الخصم ({order.couponCode || 'كوبون'}):</span>
                  <span className="font-mono font-bold">- {order.discountAmount} ج.م</span>
                </div>
              ) : null}
              <div className="flex justify-between text-gray-700">
                <span>مصاريف الشحن:</span>
                <span className="font-mono font-bold">
                  {order.shippingFee === 0 ? 'مجاني' : `${order.shippingFee} ج.م`}
                </span>
              </div>
              <div className="border-t-2 border-black pt-1.5 flex justify-between font-black text-sm">
                <span>المبلغ المستحق:</span>
                <span className="font-mono text-base border-b-2 border-black pb-0.5">{order.total} ج.م</span>
              </div>
            </div>
          </div>

          {/* Footer Stamp */}
          <div className="border-t border-gray-300 pt-3 flex items-center justify-between text-[10px] text-gray-500">
            <span>مرتفعات ستور - تجربة تسوق موثوقة ومضمونة</span>
            <span>فاتورة ضريبية مبسطة صادرة إلكترونياً</span>
          </div>

        </div>

        {/* Bottom CTA (Hidden in Print) */}
        <div className="mt-6 pt-4 border-t border-gray-200 flex gap-2 print:hidden">
          <button
            onClick={handlePrint}
            className="flex-1 py-3 rounded-2xl bg-black text-white font-extrabold text-xs hover:bg-gray-800 transition-colors flex items-center justify-center gap-2 shadow-lg"
          >
            <Printer className="w-4 h-4" />
            <span>طباعة / حفظ الفاتورة كـ PDF</span>
          </button>
          <button
            onClick={onClose}
            className="px-6 py-3 rounded-2xl bg-gray-100 text-gray-700 font-bold text-xs hover:bg-gray-200"
          >
            إغلاق
          </button>
        </div>

      </div>
    </div>
  );
};
