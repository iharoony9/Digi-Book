import { AppLayout } from "@/components/layout/AppLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useContacts } from "@/hooks/use-contacts";
import { useStocks } from "@/hooks/use-stocks";
import { useBills } from "@/hooks/use-bills";
import { Users, Package, Receipt, ArrowUpRight, ArrowDownRight } from "lucide-react";
import { formatRupees } from "@/lib/format";

export default function Dashboard() {
  const { data: contacts } = useContacts();
  const { data: stocks } = useStocks();
  const { data: bills } = useBills();

  const totalOwedToUs = contacts?.reduce((sum, c) => sum + (c.balance > 0 ? c.balance : 0), 0) || 0;
  const totalWeOwe = contacts?.reduce((sum, c) => sum + (c.balance < 0 ? Math.abs(c.balance) : 0), 0) || 0;
  
  const totalStockValue = stocks?.reduce((sum, s) => sum + (s.quantity * s.price), 0) || 0;
  const recentBills = bills?.slice(0, 5) || [];

  return (
    <AppLayout>
      <div className="space-y-8">
        <div className="grid gap-6 grid-cols-1 md:grid-cols-2 lg:grid-cols-4">
          <Card className="bg-white shadow-sm border-slate-200/60 hover:shadow-md transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-slate-500">Total Owed To Us</CardTitle>
              <div className="h-10 w-10 bg-emerald-50 rounded-xl flex items-center justify-center">
                <ArrowDownRight className="h-5 w-5 text-emerald-600" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-emerald-600">{formatRupees(totalOwedToUs)}</div>
              <p className="text-xs text-slate-400 mt-1">From customers</p>
            </CardContent>
          </Card>
          
          <Card className="bg-white shadow-sm border-slate-200/60 hover:shadow-md transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-slate-500">Total We Owe</CardTitle>
              <div className="h-10 w-10 bg-red-50 rounded-xl flex items-center justify-center">
                <ArrowUpRight className="h-5 w-5 text-red-600" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600">{formatRupees(totalWeOwe)}</div>
              <p className="text-xs text-slate-400 mt-1">To suppliers</p>
            </CardContent>
          </Card>

          <Card className="bg-white shadow-sm border-slate-200/60 hover:shadow-md transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-slate-500">Total Stock Value</CardTitle>
              <div className="h-10 w-10 bg-indigo-50 rounded-xl flex items-center justify-center">
                <Package className="h-5 w-5 text-indigo-600" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-slate-900">{formatRupees(totalStockValue)}</div>
              <p className="text-xs text-slate-400 mt-1">Current inventory</p>
            </CardContent>
          </Card>

          <Card className="bg-white shadow-sm border-slate-200/60 hover:shadow-md transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-slate-500">Total Contacts</CardTitle>
              <div className="h-10 w-10 bg-blue-50 rounded-xl flex items-center justify-center">
                <Users className="h-5 w-5 text-blue-600" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-slate-900">{contacts?.length || 0}</div>
              <p className="text-xs text-slate-400 mt-1">Active accounts</p>
            </CardContent>
          </Card>
        </div>

        <div className="grid gap-6 grid-cols-1 lg:grid-cols-2">
          <Card className="shadow-sm border-slate-200/60">
            <CardHeader className="border-b border-slate-100">
              <CardTitle className="text-lg flex items-center gap-2">
                <Receipt className="h-5 w-5 text-primary" />
                Recent Bills
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              {recentBills.length > 0 ? (
                <div className="divide-y divide-slate-100">
                  {recentBills.map(bill => (
                    <div key={bill.id} className="p-4 flex items-center justify-between hover:bg-slate-50 transition-colors">
                      <div>
                        <p className="font-semibold text-sm text-slate-900">Bill #{bill.id}</p>
                        <p className="text-xs text-slate-500">{new Date(bill.createdAt).toLocaleDateString()}</p>
                      </div>
                      <div className="font-bold text-primary">{formatRupees(bill.finalAmount)}</div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-8 text-center text-slate-500">No bills created yet</div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </AppLayout>
  );
}
