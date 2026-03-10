import { useState } from "react";
import { useLocation } from "wouter";
import { AppLayout } from "@/components/layout/AppLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useContacts } from "@/hooks/use-contacts";
import { useStocks } from "@/hooks/use-stocks";
import { useCreateBill } from "@/hooks/use-bills";
import { formatRupees } from "@/lib/format";
import { Trash2, Plus, Receipt } from "lucide-react";

export default function CreateBill() {
  const [, setLocation] = useLocation();
  const { data: contacts } = useContacts();
  const { data: stocks } = useStocks();
  const createBill = useCreateBill();

  const [contactId, setContactId] = useState("");
  const [discount, setDiscount] = useState("0");
  const [mazduri, setMazduri] = useState("0");
  const [items, setItems] = useState([{ stockId: "", quantity: "1", price: "0" }]);

  const handleStockSelect = (index: number, stockId: string) => {
    const stock = stocks?.find(s => s.id.toString() === stockId);
    const newItems = [...items];
    newItems[index].stockId = stockId;
    if (stock) {
      newItems[index].price = stock.price.toString();
    }
    setItems(newItems);
  };

  const addItem = () => {
    setItems([...items, { stockId: "", quantity: "1", price: "0" }]);
  };

  const removeItem = (index: number) => {
    setItems(items.filter((_, i) => i !== index));
  };

  // Calculations
  const subtotal = items.reduce((sum, item) => sum + (Number(item.quantity) * Number(item.price)), 0);
  const totalDiscount = Number(discount) || 0;
  const totalMazduri = Number(mazduri) || 0;
  const finalAmount = subtotal - totalDiscount + totalMazduri;

  const handleSubmit = async () => {
    if (!contactId || items.some(i => !i.stockId)) return;
    
    await createBill.mutateAsync({
      contactId: Number(contactId),
      discount: totalDiscount,
      mazduri: totalMazduri,
      items: items.map(i => ({
        stockId: Number(i.stockId),
        quantity: Number(i.quantity),
        price: Number(i.price)
      }))
    });
    
    setLocation("/bills");
  };

  return (
    <AppLayout>
      <div className="max-w-4xl mx-auto">
        <h1 className="text-2xl font-bold text-slate-900 mb-8 flex items-center gap-3">
          <Receipt className="h-6 w-6 text-primary" /> Create New Bill
        </h1>

        <div className="bg-white p-6 md:p-8 rounded-3xl shadow-sm border border-slate-200/60">
          <div className="grid gap-6 mb-8">
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">Select Customer/Contact</label>
              <select 
                className="h-12 w-full rounded-xl border border-slate-200 bg-slate-50 px-4 text-base font-medium focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                value={contactId}
                onChange={(e) => setContactId(e.target.value)}
              >
                <option value="">-- Choose Contact --</option>
                {contacts?.map(c => (
                  <option key={c.id} value={c.id}>{c.name} ({c.type})</option>
                ))}
              </select>
            </div>

            <div className="border border-slate-200 rounded-2xl overflow-hidden">
              <div className="bg-slate-50 px-4 py-3 border-b border-slate-200 grid grid-cols-12 gap-4">
                <div className="col-span-5 font-semibold text-sm text-slate-600">Product (Stock)</div>
                <div className="col-span-2 font-semibold text-sm text-slate-600">Qty</div>
                <div className="col-span-2 font-semibold text-sm text-slate-600">Unit Price</div>
                <div className="col-span-2 font-semibold text-sm text-slate-600">Total</div>
                <div className="col-span-1"></div>
              </div>
              
              <div className="p-4 space-y-4">
                {items.map((item, index) => (
                  <div key={index} className="grid grid-cols-12 gap-4 items-center">
                    <div className="col-span-5">
                      <select 
                        className="h-11 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm focus:border-primary focus:ring-2 focus:ring-primary/20"
                        value={item.stockId}
                        onChange={(e) => handleStockSelect(index, e.target.value)}
                      >
                        <option value="">Select Stock</option>
                        {stocks?.filter(s => s.quantity > 0 || s.id.toString() === item.stockId).map(s => (
                          <option key={s.id} value={s.id}>{s.name} ({s.quantity} left)</option>
                        ))}
                      </select>
                    </div>
                    <div className="col-span-2">
                      <Input 
                        type="number" min="1"
                        value={item.quantity}
                        onChange={(e) => {
                          const newItems = [...items];
                          newItems[index].quantity = e.target.value;
                          setItems(newItems);
                        }}
                        className="h-11 rounded-xl"
                      />
                    </div>
                    <div className="col-span-2">
                      <Input 
                        type="number" min="0"
                        value={item.price}
                        onChange={(e) => {
                          const newItems = [...items];
                          newItems[index].price = e.target.value;
                          setItems(newItems);
                        }}
                        className="h-11 rounded-xl"
                      />
                    </div>
                    <div className="col-span-2 font-bold text-slate-900">
                      {formatRupees(Number(item.quantity) * Number(item.price))}
                    </div>
                    <div className="col-span-1 text-right">
                      {items.length > 1 && (
                        <Button variant="ghost" size="icon" className="text-red-500 hover:text-red-600 hover:bg-red-50 rounded-xl" onClick={() => removeItem(index)}>
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
              
              <div className="px-4 py-3 bg-slate-50 border-t border-slate-200">
                <Button variant="outline" size="sm" onClick={addItem} className="rounded-lg border-dashed border-slate-300">
                  <Plus className="mr-2 h-3 w-3" /> Add Item
                </Button>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-4 border-t border-slate-100">
              <div className="md:col-start-2">
                <label className="block text-sm font-semibold text-slate-700 mb-2">Discount (Rupees)</label>
                <Input 
                  type="number" 
                  value={discount} 
                  onChange={(e) => setDiscount(e.target.value)}
                  className="h-11 rounded-xl text-red-600 font-semibold bg-red-50 border-red-100 focus-visible:ring-red-500"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">Mazduri / Labor (Rupees)</label>
                <Input 
                  type="number" 
                  value={mazduri} 
                  onChange={(e) => setMazduri(e.target.value)}
                  className="h-11 rounded-xl text-emerald-600 font-semibold bg-emerald-50 border-emerald-100 focus-visible:ring-emerald-500"
                />
              </div>
            </div>

            <div className="bg-slate-900 rounded-2xl p-6 text-white mt-4 flex flex-col md:flex-row justify-between items-center shadow-lg">
              <div>
                <p className="text-slate-400 font-medium mb-1">Subtotal: {formatRupees(subtotal)}</p>
                <p className="text-slate-400 font-medium">Discount/Mazduri adjusted</p>
              </div>
              <div className="text-right mt-4 md:mt-0">
                <p className="text-sm text-slate-400 font-medium uppercase tracking-widest mb-1">Final Total</p>
                <p className="text-4xl font-black text-primary">{formatRupees(finalAmount)}</p>
              </div>
            </div>

            <div className="flex justify-end pt-4">
              <Button 
                onClick={handleSubmit} 
                disabled={createBill.isPending || !contactId || items.some(i => !i.stockId)}
                className="h-14 px-10 bg-primary hover:bg-primary/90 text-lg rounded-2xl shadow-xl shadow-primary/25"
              >
                {createBill.isPending ? "Creating..." : "Save Bill & Deduct Stock"}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
