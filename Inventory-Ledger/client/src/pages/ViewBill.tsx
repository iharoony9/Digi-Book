import { useRoute } from "wouter";
import { AppLayout } from "@/components/layout/AppLayout";
import { Button } from "@/components/ui/button";
import { useBill } from "@/hooks/use-bills";
import { formatRupees } from "@/lib/format";
import { Printer, Receipt, ChevronLeft } from "lucide-react";
import { format } from "date-fns";
import { Link } from "wouter";

export default function ViewBill() {
  const [, params] = useRoute("/bills/:id");
  const billId = Number(params?.id);
  const { data: bill, isLoading } = useBill(billId);

  if (isLoading) return <AppLayout><div className="p-10 text-center">Loading bill...</div></AppLayout>;
  if (!bill) return <AppLayout><div className="p-10 text-center text-red-500 font-bold">Bill not found</div></AppLayout>;

  return (
    <AppLayout>
      <div className="max-w-3xl mx-auto">
        <div className="flex justify-between items-center mb-8 no-print">
          <Link href="/bills" className="inline-flex items-center text-sm font-medium text-slate-500 hover:text-primary transition-colors">
            <ChevronLeft className="mr-1 h-4 w-4" /> Back to Bills
          </Link>
          <Button 
            onClick={() => window.print()}
            className="bg-slate-900 hover:bg-slate-800 text-white rounded-xl h-11 px-6 shadow-lg shadow-black/10"
          >
            <Printer className="mr-2 h-4 w-4" /> Print Receipt
          </Button>
        </div>

        {/* PRINTABLE AREA */}
        <div className="bg-white p-8 md:p-12 rounded-3xl shadow-sm border border-slate-200/60 print:border-none print:shadow-none print:p-0">
          <div className="flex justify-between items-start border-b border-slate-200 pb-8 mb-8">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <Receipt className="h-8 w-8 text-primary print:text-black" />
                <h1 className="text-3xl font-black text-slate-900 tracking-tight">DigiKhata</h1>
              </div>
              <p className="text-slate-500 text-sm font-medium">Official Receipt</p>
            </div>
            <div className="text-right">
              <h2 className="text-xl font-bold text-slate-900 mb-1">Bill #{bill.id}</h2>
              <p className="text-slate-500 text-sm">{format(new Date(bill.createdAt), 'PPP')}</p>
            </div>
          </div>

          <div className="mb-10 p-5 bg-slate-50 rounded-2xl print:bg-transparent print:border print:p-4">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Billed To</h3>
            <p className="text-xl font-bold text-slate-900">{bill.contact.name}</p>
            {bill.contact.phone && <p className="text-slate-500 text-sm mt-1">{bill.contact.phone}</p>}
          </div>

          <table className="w-full text-left mb-8 border-collapse">
            <thead>
              <tr className="border-b-2 border-slate-900 text-slate-900">
                <th className="py-3 font-bold">Description</th>
                <th className="py-3 font-bold text-center">Qty</th>
                <th className="py-3 font-bold text-right">Price</th>
                <th className="py-3 font-bold text-right">Amount</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {bill.items.map((item: any, i: number) => (
                <tr key={i}>
                  <td className="py-4 font-medium text-slate-800">{item.stock.name}</td>
                  <td className="py-4 text-center text-slate-600">{item.quantity}</td>
                  <td className="py-4 text-right text-slate-600">{formatRupees(item.price)}</td>
                  <td className="py-4 text-right font-bold text-slate-900">{formatRupees(item.subtotal)}</td>
                </tr>
              ))}
            </tbody>
          </table>

          <div className="flex justify-end pt-6 border-t border-slate-200">
            <div className="w-full max-w-sm space-y-3">
              <div className="flex justify-between text-slate-600">
                <span>Subtotal</span>
                <span className="font-semibold">{formatRupees(bill.totalAmount)}</span>
              </div>
              {bill.discount > 0 && (
                <div className="flex justify-between text-red-500">
                  <span>Discount</span>
                  <span className="font-semibold">- {formatRupees(bill.discount)}</span>
                </div>
              )}
              {bill.mazduri > 0 && (
                <div className="flex justify-between text-emerald-600">
                  <span>Mazduri (Labor)</span>
                  <span className="font-semibold">+ {formatRupees(bill.mazduri)}</span>
                </div>
              )}
              <div className="flex justify-between items-center border-t-2 border-slate-900 pt-3 mt-3">
                <span className="text-lg font-bold text-slate-900">Total</span>
                <span className="text-2xl font-black text-primary print:text-black">{formatRupees(bill.finalAmount)}</span>
              </div>
            </div>
          </div>

          <div className="mt-16 text-center text-sm font-medium text-slate-400 print:text-xs">
            Thank you for your business.
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
