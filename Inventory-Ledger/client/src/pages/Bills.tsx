import { AppLayout } from "@/components/layout/AppLayout";
import { Button } from "@/components/ui/button";
import { useBills, useDeleteBill } from "@/hooks/use-bills";
import { Link } from "wouter";
import { formatRupees } from "@/lib/format";
import { Plus, Eye, Trash2 } from "lucide-react";
import { format } from "date-fns";

export default function Bills() {
  const { data: bills, isLoading } = useBills();
  const deleteBill = useDeleteBill();

  const handleDelete = async (id: number) => {
    if (confirm("Are you sure you want to delete this bill? This will restore stock levels and revert contact balances.")) {
      await deleteBill.mutateAsync(id);
    }
  };

  return (
    <AppLayout>
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-2xl font-bold text-slate-900">All Bills</h1>
        <Link href="/bills/new" className="inline-flex items-center justify-center rounded-xl text-sm font-medium transition-colors bg-primary text-white hover:bg-primary/90 h-11 px-6 shadow-lg shadow-primary/25">
          <Plus className="mr-2 h-4 w-4" /> Create Bill
        </Link>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-slate-200/60 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-slate-50/80 text-slate-500 uppercase font-semibold text-xs border-b border-slate-100">
              <tr>
                <th className="px-6 py-4">Bill No.</th>
                <th className="px-6 py-4">Date</th>
                <th className="px-6 py-4">Customer</th>
                <th className="px-6 py-4 text-right">Discount</th>
                <th className="px-6 py-4 text-right">Mazduri</th>
                <th className="px-6 py-4 text-right">Final Amount</th>
                <th className="px-6 py-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {isLoading ? (
                <tr><td colSpan={7} className="px-6 py-8 text-center text-slate-500">Loading...</td></tr>
              ) : bills?.length === 0 ? (
                <tr><td colSpan={7} className="px-6 py-8 text-center text-slate-500">No bills created yet.</td></tr>
              ) : (
                bills?.map((bill) => (
                  <tr key={bill.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="px-6 py-4 font-bold text-slate-900">#{bill.id}</td>
                    <td className="px-6 py-4 text-slate-600">{format(new Date(bill.createdAt), 'PPP')}</td>
                    <td className="px-6 py-4 font-medium text-slate-900">{bill.contact.name}</td>
                    <td className="px-6 py-4 text-right text-red-500">- {formatRupees(bill.discount)}</td>
                    <td className="px-6 py-4 text-right text-emerald-600">+ {formatRupees(bill.mazduri)}</td>
                    <td className="px-6 py-4 text-right font-black text-primary text-base">{formatRupees(bill.finalAmount)}</td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex justify-end gap-2">
                        <Link href={`/bills/${bill.id}`} className="inline-flex items-center justify-center rounded-lg text-sm font-medium transition-colors bg-slate-100 text-slate-700 hover:bg-slate-200 h-8 w-8">
                          <Eye className="h-4 w-4" />
                        </Link>
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-400 hover:text-red-600 hover:bg-red-50" onClick={() => handleDelete(bill.id)}>
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </AppLayout>
  );
}
