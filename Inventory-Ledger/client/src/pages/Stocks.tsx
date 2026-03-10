import { useState } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useStocks, useCreateStock, useUpdateStock, useDeleteStock } from "@/hooks/use-stocks";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { formatRupees } from "@/lib/format";
import { Plus, Search, Edit2, Trash2 } from "lucide-react";

export default function Stocks() {
  const { data: stocks, isLoading } = useStocks();
  const createStock = useCreateStock();
  const updateStock = useUpdateStock();
  const deleteStock = useDeleteStock();
  
  const [search, setSearch] = useState("");
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [editingStock, setEditingStock] = useState<any>(null);
  
  const [formData, setFormData] = useState({ name: "", quantity: "", price: "" });

  const filteredStocks = stocks?.filter(s => s.name.toLowerCase().includes(search.toLowerCase()));

  const handleSubmit = async () => {
    const payload = {
      name: formData.name,
      quantity: Number(formData.quantity),
      price: Number(formData.price)
    };
    if (editingStock) {
      await updateStock.mutateAsync({ id: editingStock.id, ...payload });
    } else {
      await createStock.mutateAsync(payload);
    }
    setIsAddOpen(false);
    setEditingStock(null);
    setFormData({ name: "", quantity: "", price: "" });
  };

  const openEdit = (stock: any) => {
    setEditingStock(stock);
    setFormData({ name: stock.name, quantity: stock.quantity.toString(), price: stock.price.toString() });
    setIsAddOpen(true);
  };

  const handleDelete = async (id: number) => {
    if (confirm("Are you sure you want to delete this stock item?")) {
      await deleteStock.mutateAsync(id);
    }
  };

  return (
    <AppLayout>
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
        <div className="relative w-full max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <Input 
            placeholder="Search stocks..." 
            className="pl-10 bg-white border-slate-200/60 shadow-sm rounded-xl h-11"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <Button 
          onClick={() => {
            setEditingStock(null);
            setFormData({ name: "", quantity: "", price: "" });
            setIsAddOpen(true);
          }}
          className="bg-primary hover:bg-primary/90 text-white rounded-xl shadow-lg shadow-primary/25 h-11 px-6"
        >
          <Plus className="mr-2 h-4 w-4" /> Add Stock
        </Button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {isLoading ? (
          <div className="col-span-full p-8 text-center text-slate-500">Loading stocks...</div>
        ) : filteredStocks?.length === 0 ? (
          <div className="col-span-full p-8 text-center text-slate-500 bg-white rounded-2xl border border-dashed border-slate-300">No stocks found.</div>
        ) : (
          filteredStocks?.map((stock) => (
            <div key={stock.id} className="bg-white rounded-2xl p-5 shadow-sm border border-slate-200/60 hover:shadow-md transition-all group relative">
              <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity flex gap-2">
                <Button variant="ghost" size="icon" className="h-8 w-8 bg-slate-100 hover:bg-primary/10 text-slate-600 hover:text-primary rounded-lg" onClick={() => openEdit(stock)}>
                  <Edit2 className="h-4 w-4" />
                </Button>
                <Button variant="ghost" size="icon" className="h-8 w-8 bg-slate-100 hover:bg-red-50 text-slate-600 hover:text-red-600 rounded-lg" onClick={() => handleDelete(stock.id)}>
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
              <h3 className="font-bold text-lg text-slate-900 mb-4 pr-20">{stock.name}</h3>
              <div className="flex justify-between items-end">
                <div>
                  <p className="text-xs font-medium text-slate-500 uppercase tracking-wider mb-1">Quantity left</p>
                  <p className="text-2xl font-black text-slate-900">{stock.quantity}</p>
                </div>
                <div className="text-right">
                  <p className="text-xs font-medium text-slate-500 uppercase tracking-wider mb-1">Unit Price</p>
                  <p className="text-lg font-bold text-primary">{formatRupees(stock.price)}</p>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
        <DialogContent className="sm:max-w-md p-6 rounded-2xl">
          <DialogHeader>
            <DialogTitle className="text-xl">{editingStock ? "Edit Stock" : "Add New Stock"}</DialogTitle>
          </DialogHeader>
          <div className="grid gap-5 py-4">
            <div className="grid gap-2">
              <label className="text-sm font-medium text-slate-700">Stock Name</label>
              <Input 
                value={formData.name} 
                onChange={(e) => setFormData({...formData, name: e.target.value})} 
                placeholder="Product 123"
                className="h-11 rounded-xl bg-slate-50"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <label className="text-sm font-medium text-slate-700">Quantity</label>
                <Input 
                  type="number"
                  value={formData.quantity} 
                  onChange={(e) => setFormData({...formData, quantity: e.target.value})} 
                  placeholder="0"
                  className="h-11 rounded-xl bg-slate-50"
                />
              </div>
              <div className="grid gap-2">
                <label className="text-sm font-medium text-slate-700">Price (Rupees)</label>
                <Input 
                  type="number"
                  value={formData.price} 
                  onChange={(e) => setFormData({...formData, price: e.target.value})} 
                  placeholder="0"
                  className="h-11 rounded-xl bg-slate-50"
                />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAddOpen(false)} className="rounded-xl h-11">Cancel</Button>
            <Button onClick={handleSubmit} disabled={!formData.name || !formData.quantity || !formData.price} className="bg-primary hover:bg-primary/90 rounded-xl h-11">
              {editingStock ? "Save Changes" : "Create Stock"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AppLayout>
  );
}
