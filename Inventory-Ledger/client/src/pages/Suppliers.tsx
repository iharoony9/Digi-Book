import { useState } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useContacts, useCreateContact, useUpdateContact, useDeleteContact } from "@/hooks/use-contacts";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { formatRupees } from "@/lib/format";
import { Plus, Search, Edit2, Trash2 } from "lucide-react";

export default function Suppliers() {
  const { data: contacts, isLoading } = useContacts();
  const createContact = useCreateContact();
  const updateContact = useUpdateContact();
  const deleteContact = useDeleteContact();
  
  const [search, setSearch] = useState("");
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [editingContact, setEditingContact] = useState<any>(null);
  
  const [formData, setFormData] = useState({ name: "", type: "supplier", phone: "" });

  const suppliers = contacts?.filter(c => c.type === 'supplier');
  const filteredSuppliers = suppliers?.filter(c => 
    c.name.toLowerCase().includes(search.toLowerCase()) || 
    (c.phone && c.phone.includes(search))
  );

  const handleSubmit = async () => {
    if (editingContact) {
      await updateContact.mutateAsync({ id: editingContact.id, ...formData, type: "supplier" });
    } else {
      await createContact.mutateAsync({ ...formData, type: "supplier", balance: 0 });
    }
    setIsAddOpen(false);
    setEditingContact(null);
    setFormData({ name: "", type: "supplier", phone: "" });
  };

  const openEdit = (contact: any) => {
    setEditingContact(contact);
    setFormData({ name: contact.name, type: contact.type, phone: contact.phone || "" });
    setIsAddOpen(true);
  };

  const handleDelete = async (id: number) => {
    if (confirm("Are you sure you want to delete this supplier?")) {
      await deleteContact.mutateAsync(id);
    }
  };

  return (
    <AppLayout>
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
        <div className="relative w-full max-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <Input 
            placeholder="Search suppliers..." 
            className="pl-10 bg-white border-slate-200/60 shadow-sm rounded-xl h-11"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <Button 
          onClick={() => {
            setEditingContact(null);
            setFormData({ name: "", type: "supplier", phone: "" });
            setIsAddOpen(true);
          }}
          className="bg-primary hover:bg-primary/90 text-white rounded-xl shadow-lg shadow-primary/25 h-11 px-6"
        >
          <Plus className="mr-2 h-4 w-4" /> Add Supplier
        </Button>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-slate-200/60 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-slate-50/80 text-slate-500 uppercase font-semibold text-xs border-b border-slate-100">
              <tr>
                <th className="px-6 py-4">Name</th>
                <th className="px-6 py-4">Phone</th>
                <th className="px-6 py-4 text-right">Balance</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {isLoading ? (
                <tr><td colSpan={4} className="px-6 py-8 text-center text-slate-500">Loading...</td></tr>
              ) : filteredSuppliers?.length === 0 ? (
                <tr><td colSpan={4} className="px-6 py-8 text-center text-slate-500">No suppliers found.</td></tr>
              ) : (
                filteredSuppliers?.map((contact) => (
                  <tr key={contact.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="px-6 py-4 font-medium text-slate-900">{contact.name}</td>
                    <td className="px-6 py-4 text-slate-500">{contact.phone || '-'}</td>
                    <td className="px-6 py-4 text-right">
                      <span className={`font-bold ${contact.balance > 0 ? 'text-emerald-600' : contact.balance < 0 ? 'text-red-600' : 'text-slate-900'}`}>
                        {contact.balance > 0 ? '+' : ''}{formatRupees(contact.balance)}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex justify-end gap-2">
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-400 hover:text-primary hover:bg-primary/10" onClick={() => openEdit(contact)}>
                          <Edit2 className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-400 hover:text-red-600 hover:bg-red-50" onClick={() => handleDelete(contact.id)}>
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

      <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
        <DialogContent className="sm:max-w-md p-6 rounded-2xl">
          <DialogHeader>
            <DialogTitle className="text-xl">{editingContact ? "Edit Supplier" : "Add New Supplier"}</DialogTitle>
          </DialogHeader>
          <div className="grid gap-5 py-4">
            <div className="grid gap-2">
              <label className="text-sm font-medium text-slate-700">Name</label>
              <Input 
                value={formData.name} 
                onChange={(e) => setFormData({...formData, name: e.target.value})} 
                placeholder="Vendor Name"
                className="h-11 rounded-xl bg-slate-50"
              />
            </div>
            <div className="grid gap-2">
              <label className="text-sm font-medium text-slate-700">Phone</label>
              <Input 
                value={formData.phone} 
                onChange={(e) => setFormData({...formData, phone: e.target.value})} 
                placeholder="0300..."
                className="h-11 rounded-xl bg-slate-50"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAddOpen(false)} className="rounded-xl h-11">Cancel</Button>
            <Button onClick={handleSubmit} disabled={!formData.name} className="bg-primary hover:bg-primary/90 rounded-xl h-11">
              {editingContact ? "Save Changes" : "Create Supplier"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AppLayout>
  );
}
