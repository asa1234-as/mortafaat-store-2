import React from 'react';
import { Order } from '../types';
import { Download, X, CheckCircle2 } from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';
import { t, pn } from '../i18n';

interface InvoiceModalProps {
  order: Order | null;
  onClose: () => void;
}

export const InvoiceModal: React.FC<InvoiceModalProps> = ({ order, onClose }) => {
  if (!order) return null;

  const handleDownloadPdf = () => {
    const originalTitle = document.title;
    const invoiceNumber = order.orderNumber || order.id;
    document.title = `فاتورة_مرتفعات_ستور_${invoiceNumber}`;
    window.print();
    setTimeout(() => {
      document.title = originalTitle;
    }, 1000);
  };

  const qrData = t("مرتفعات ستور | طلب: #{0} | العميل: {1} | الهاتف: {2} | المبلغ: {3} ج.م | التاريخ: {4}", order.id, order.customerName, order.phone, order.total, order.createdAt);

  return (
    <div className="fixed inset-0 z-[60] overflow-y-auto bg-black/85 backdrop-blur-sm flex items-start justify-center p-3 sm:p-6 pt-4 sm:pt-8 invoice-modal-backdrop">
      
      {/* Invoice Paper Container */}
      <div className="relative bg-white text-black rounded-3xl max-w-2xl w-full p-5 sm:p-8 shadow-2xl border border-gray-300 my-auto invoice-paper-wrapper">
        
        {/* Top Action Controls (Hidden in Print/PDF output) */}
        <div className="flex items-center justify-between pb-3 mb-4 border-b border-gray-200 print-hide">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-xs font-bold text-gray-600 uppercase tracking-wide">
              {t("معاينة الفاتورة الرسمية (نسخة أبيض وأسود معتمدة)")}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleDownloadPdf}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-black text-brand-gold hover:bg-zinc-800 text-xs font-black transition-all shadow-md active:scale-95 border border-brand-gold/40"
              title={t("تحميل الفاتورة PDF")}
            >
              <Download className="w-4 h-4 text-brand-gold" />
              <span>{t("تحميل الفاتورة PDF")}</span>
            </button>

            <button
              type="button"
              onClick={onClose}
              className="w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center text-gray-600 hover:text-black transition-colors"
              title={t("إغلاق")}
              aria-label={t("إغلاق")}
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* PRINTABLE INVOICE CONTENT */}
        <div id="printable-invoice" className="space-y-5 text-black bg-white">
          
          {/* Invoice Header */}
          <div className="flex items-start justify-between border-b-2 border-black pb-4">
            <div className="flex items-center gap-3">
              <div className="w-14 h-14 border-2 border-black rounded-xl p-1 flex items-center justify-center bg-white">
                <img 
                  src="/logo.png" 
                  alt={t("مرتفعات ستور")} 
                  className="w-full h-full object-contain" 
                  style={{ filter: 'grayscale(1) contrast(2)' }} 
                />
              </div>
              <div>
                <h1 className="text-xl font-black tracking-tight text-black">{t("مرتفعات ستور")}</h1>
                <p className="text-xs font-mono font-bold tracking-wider">MORTAFAAT STORE</p>
                <p className="text-[10px] text-gray-700">{t("هاتف خدمة العملاء: 01067906474")}</p>
              </div>
            </div>

            <div className="text-end">
              <span className="text-xs font-black uppercase tracking-widest border border-black px-2 py-0.5 rounded block text-center mb-1 bg-gray-100">
                {t("فاتورة شراء إلكترونية")}
              </span>
              <p className="font-mono text-sm font-black">#{order.orderNumber || order.id}</p>
              <p className="text-[10px] text-gray-700">{order.createdAt}</p>
            </div>
          </div>

          {/* Customer Details Box */}
          <div className="grid grid-cols-2 gap-4 border border-black p-3.5 rounded-xl text-xs bg-gray-50/50">
            <div>
              <span className="text-[10px] font-bold text-gray-600 uppercase block">{t("بيانات العميل:")}</span>
              <p className="font-black text-sm text-black mt-0.5">{order.customerName}</p>
              <p className="font-mono font-bold text-gray-800">{order.phone}</p>
            </div>
            <div>
              <span className="text-[10px] font-bold text-gray-600 uppercase block">{t("عنوان الاستلام:")}</span>
              <p className="font-bold text-black mt-0.5">{order.governorate} - {order.address}</p>
              <p className="text-[10px] text-gray-700">
                {t("طريقة الدفع:")} {order.paymentMethod === 'cod' ? t("نقداً عند الاستلام (مع المعاينة)") : t("دفع إلكتروني")}
              </p>
            </div>
          </div>

          {/* Items Table */}
          <div className="overflow-hidden border border-black rounded-xl">
            <table className="w-full text-start text-xs">
              <thead className="bg-gray-100 border-b border-black text-black font-black">
                <tr>
                  <th className="py-2 px-3 text-start">#</th>
                  <th className="py-2 px-3 text-start">{t("بيان المنتج")}</th>
                  <th className="py-2 px-3 text-center">{t("الكمية")}</th>
                  <th className="py-2 px-3 text-end">{t("سعر الوحدة")}</th>
                  <th className="py-2 px-3 text-end">{t("الإجمالي")}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {order.items.map((item, idx) => (
                  <tr key={idx} className="hover:bg-gray-50">
                    <td className="py-2 px-3 font-mono font-bold text-start">{idx + 1}</td>
                    <td className="py-2 px-3 text-start">
                      <p className="font-bold text-black">{pn(item.product)}</p>
                      {(item.selectedSize || item.selectedColor) && (
                        <span className="text-[10px] text-gray-600">
                          {item.selectedSize ? t("المقاس: {0} ", item.selectedSize) : ''}
                          {item.selectedColor ? t("اللون: {0}", item.selectedColor) : ''}
                        </span>
                      )}
                    </td>
                    <td className="py-2 px-3 text-center font-mono font-bold">{item.quantity}</td>
                    <td className="py-2 px-3 text-end font-mono">{item.product.price} {t("ج.م")}</td>
                    <td className="py-2 px-3 text-end font-mono font-black">{item.product.price * item.quantity} {t("ج.م")}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Financial Totals + Preserved QR Code */}
          <div className="flex justify-between items-start gap-4 pt-1">
            
            {/* Preserved QR Code (Exact SVG implementation and parameters) */}
            <div className="space-y-1.5 max-w-[190px]">
              <div className="border border-black p-2 rounded-lg text-center bg-white shadow-xs">
                <QRCodeSVG 
                  value={qrData}
                  size={120}
                  level="M"
                  includeMargin={false}
                  bgColor="#ffffff"
                  fgColor="#000000"
                />
                <span className="text-[8px] font-mono font-bold tracking-wider block mt-1">{t("امسح للتحقق من الطلب")}</span>
              </div>
              <p className="text-[9px] text-gray-700 leading-tight">
                {t("* يحق للعميل فحص ومعاينة المنتج قبل الدفع للمندوب، والاسترجاع خلال 14 يوماً وفقاً للشروط.")}
              </p>
            </div>

            {/* Calculations Breakdown */}
            <div className="w-60 space-y-1.5 text-xs text-start">
              <div className="flex justify-between text-gray-800">
                <span>{t("قيمة المشتريات:")}</span>
                <span className="font-mono font-bold">{order.subtotal} {t("ج.م")}</span>
              </div>
              {order.discountAmount ? (
                <div className="flex justify-between text-emerald-800 font-medium">
                  <span>{t("الخصم (")}{order.couponCode || t("كوبون")}):</span>
                  <span className="font-mono font-bold">- {order.discountAmount} {t("ج.م")}</span>
                </div>
              ) : null}
              <div className="flex justify-between text-gray-800">
                <span>{t("مصاريف الشحن:")}</span>
                <span className="font-mono font-bold">
                  {order.shippingFee === 0 ? t("مجاني") : t("{0} ج.م", order.shippingFee)}
                </span>
              </div>
              <div className="border-t-2 border-black pt-1.5 flex justify-between font-black text-sm">
                <span>{t("المبلغ المستحق:")}</span>
                <span className="font-mono text-base border-b-2 border-black pb-0.5">{order.total} {t("ج.م")}</span>
              </div>
            </div>
          </div>

          {/* Footer Official Stamp */}
          <div className="border-t border-gray-300 pt-2.5 flex items-center justify-between text-[10px] text-gray-600">
            <span className="font-medium">{t("مرتفعات ستور - تجربة تسوق موثوقة ومضمونة 100%")}</span>
            <span className="font-bold">{t("فاتورة شراء معتمدة")}</span>
          </div>

        </div>

        {/* Bottom CTA (Hidden in Print/PDF output) */}
        <div className="mt-5 pt-3 border-t border-gray-200 flex gap-2 print-hide">
          <button
            type="button"
            onClick={handleDownloadPdf}
            className="flex-1 py-2.5 rounded-2xl bg-black text-brand-gold font-black text-xs hover:bg-zinc-800 transition-colors flex items-center justify-center gap-2 shadow-lg border border-brand-gold/40"
          >
            <Download className="w-4 h-4 text-brand-gold" />
            <span>{t("تحميل الفاتورة PDF")}</span>
          </button>
          <button
            type="button"
            onClick={onClose}
            className="px-6 py-2.5 rounded-2xl bg-gray-100 text-gray-700 font-bold text-xs hover:bg-gray-200"
          >
            {t("إغلاق")}
          </button>
        </div>

      </div>
    </div>
  );
};
