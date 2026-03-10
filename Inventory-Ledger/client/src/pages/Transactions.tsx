import { useState } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useTransactions, useCreateTransaction, useUpdateTransaction, useDeleteTransaction } from "@/hooks/use-transactions";
import { useContacts } from "@/hooks/use-contacts";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { formatRupees } from "@/lib/format";
import { ArrowDownRight, ArrowUpRight, Plus, Edit2, Trash2 } from "lucide-react";
import { format } from "date-fns";

export default function Transactions() {
  const { data: transactions, isLoading } = useTransactions();
  const { data: contacts } = useContacts();
  const createTransaction = useCreateTransaction();
  const updateTransaction = useUpdateTransaction();
  const deleteTransaction = useDeleteTransaction();
  
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState<any>(null);
  const [formData, setFormData] = useState({ contactId: "", amount: "", type: "take", description: "" });

  const handleSubmit = async () => {
    const payload = {
      contactId: Number(formData.contactId),
      amount: Number(formData.amount),
      type: formData.type,
      description: formData.description || null,
      billId: editingTransaction?.billId || null
    };

    if (editingTransaction) {
      await updateTransaction.mutateAsync({ id: editingTransaction.id, ...payload });
    } else {
      await createTransaction.mutateAsync(payload);
    }
    
    setIsAddOpen(false);
    setEditingTransaction(null);
    setFormData({ contactId: "", amount: "", type: "take", description: "" });
  };

  const openEdit = (t: any) => {
    setEditingTransaction(t);
    setFormData({
      contactId: t.contactId.toString(),
      amount: t.amount.toString(),
      type: t.type,
      description: t.description || ""
    });
    setIsAddOpen(true);
  };

  const handleDelete = async (id: number) => {
    if (confirm("Are you sure you want to delete this transaction? Balance changes will be reverted.")) {
      await deleteTransaction.mutateAsync(id);
    }
  };

  return (
    <AppLayout>
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-2xl font-bold text-slate-900">Transactions Ledger</h1>
        <Button 
          onClick={() => {
            setEditingTransaction(null);
            setFormData({ contactId: "", amount: "", type: "take", description: "" });
            setIsAddOpen(true);
          }}
          className="bg-primary hover:bg-primary/90 text-white rounded-xl shadow-lg shadow-primary/25 h-11 px-6"
        >
          <Plus className="mr-2 h-4 w-4" /> New Transaction
        </Button>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-slate-200/60 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-slate-50/80 text-slate-500 uppercase font-semibold text-xs border-b border-slate-100">
              <tr>
                <th className="px-6 py-4">Date</th>
                <th className="px-6 py-4">Type</th>
                <th className="px-6 py-4">Contact</th>
                <th className="px-6 py-4">Description</th>
                <th className="px-6 py-4 text-right">Amount</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {isLoading ? (
                <tr><td colSpan={6} className="px-6 py-8 text-center text-slate-500">Loading...</td></tr>
              ) : transactions?.length === 0 ? (
                <tr><td colSpan={6} className="px-6 py-8 text-center text-slate-500">No transactions recorded.</td></tr>
              ) : (
                transactions?.map((t) => {
                  const contact = contacts?.find(c => c.id === t.contactId);
                  const isTake = t.type === 'take';
                  return (
                    <tr key={t.id} className="hover:bg-slate-50/50 transition-colors">
                      <td className="px-6 py-4 text-slate-600">{format(new Date(t.createdAt), 'PP')}</td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${isTake ? 'bg-emerald-50 text-emerald-700' : 'bg-red-50 text-red-700'}`}>
                          {isTake ? <ArrowDownRight className="h-3 w-3"/> : <ArrowUpRight className="h-3 w-3"/>}
                          {isTake ? 'We Got' : 'We Gave'}
                        </span>
                      </td>
                      <td className="px-6 py-4 font-bold text-slate-900">{contact?.name || `ID: ${t.contactId}`}</td>
                      <td className="px-6 py-4 text-slate-500">{t.description || '-'}</td>
                      <td className="px-6 py-4 text-right font-black text-base">
                        <span className={isTake ? 'text-emerald-600' : 'text-red-600'}>
                          {isTake ? '+' : '-'} {formatRupees(t.amount)}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        {!t.billId && (
                          <div className="flex justify-end gap-2">
                            <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-400 hover:text-primary hover:bg-primary/10" onClick={() => openEdit(t)}>
                              <Edit2 className="h-4 w-4" />
                            </Button>
                            <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-400 hover:text-red-600 hover:bg-red-50" onClick={() => handleDelete(t.id)}>
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        )}
                      </td>
                    </tr>
                  )
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
        <DialogContent className="sm:max-w-md p-6 rounded-2xl">
          <DialogHeader>
            <DialogTitle className="text-xl">{editingTransaction ? "Edit Transaction" : "Record Transaction"}</DialogTitle>
          </DialogHeader>
          <div className="grid gap-5 py-4">
            <div className="grid grid-cols-2 gap-4">
              <Button 
                variant="outline" 
                className={`h-14 rounded-xl border-2 ${formData.type === 'take' ? 'border-emerald-500 bg-emerald-50 text-emerald-700' : 'border-slate-200'}`}
                onClick={() => setFormData({...formData, type: 'take'})}
              >
                <ArrowDownRight className="mr-2 h-5 w-5" /> Got Money (Take)
              </Button>
              <Button 
                variant="outline" 
                className={`h-14 rounded-xl border-2 ${formData.type === 'give' ? 'border-red-500 bg-red-50 text-red-700' : 'border-slate-200'}`}
                onClick={() => setFormData({...formData, type: 'give'})}
              >
                <ArrowUpRight className="mr-2 h-5 w-5" /> Gave Money (Give)
              </Button>
            </div>
            
            <div className="grid gap-2">
              <label className="text-sm font-medium text-slate-700">Contact</label>
              <select 
                className="h-11 w-full rounded-xl border border-input bg-slate-50 px-3 text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary"
                value={formData.contactId}
                onChange={(e) => setFormData({...formData, contactId: e.target.value})}
              >
                <option value="">Select Contact</option>
                {contacts?.map(c => (
                  <option key={c.id} value={c.id}>{c.name} (Balance: {c.balance})</option>
                ))}
              </select>
            </div>
            
            <div className="grid gap-2">
              <label className="text-sm font-medium text-slate-700">Amount (Rupees)</label>
              <Input 
                type="number"
                value={formData.amount} 
                onChange={(e) => setFormData({...formData, amount: e.target.value})} 
                placeholder="0"
                className="h-11 rounded-xl bg-slate-50 text-lg font-bold"
              />
            </div>

            <div className="grid gap-2">
              <label className="text-sm font-medium text-slate-700">Description (Optional)</label>
              <Input 
                value={formData.description} 
                onChange={(e) => setFormData({...formData, description: e.target.value})} 
                placeholder="Payment for..."
                className="h-11 rounded-xl bg-slate-50"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAddOpen(false)} className="rounded-xl h-11">Cancel</Button>
            <Button onClick={handleSubmit} disabled={!formData.contactId || !formData.amount} className="bg-primary hover:bg-primary/90 rounded-xl h-11">
              Save Transaction
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AppLayout>
  );
}
