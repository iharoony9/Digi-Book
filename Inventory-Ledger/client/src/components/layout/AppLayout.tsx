import { ReactNode, useState } from "react";
import { Link, useLocation } from "wouter";
import { 
  LayoutDashboard, 
  Users, 
  UserRound,
  Package, 
  Receipt, 
  ArrowRightLeft,
  Menu,
  Wallet,
  Edit2,
  Check
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAccountBalance, useUpdateAccountBalance } from "@/hooks/use-settings";
import { formatRupees } from "@/lib/format";
import { SidebarProvider, Sidebar, SidebarContent, SidebarGroup, SidebarMenu, SidebarMenuItem, SidebarMenuButton, SidebarTrigger } from "@/components/ui/sidebar";

export function AppLayout({ children }: { children: ReactNode }) {
  const [location] = useLocation();
  const { data: balanceData } = useAccountBalance();
  const updateBalance = useUpdateAccountBalance();
  
  const [isEditingBalance, setIsEditingBalance] = useState(false);
  const [balanceInput, setBalanceInput] = useState("");

  const navigation = [
    { name: "Dashboard", href: "/", icon: LayoutDashboard },
    { name: "Customers", href: "/customers", icon: Users },
    { name: "Suppliers", href: "/suppliers", icon: UserRound },
    { name: "Stocks", href: "/stocks", icon: Package },
    { name: "Bills", href: "/bills", icon: Receipt },
    { name: "Transactions", href: "/transactions", icon: ArrowRightLeft },
  ];

  const handleEditBalanceClick = () => {
    setBalanceInput(balanceData?.value || "0");
    setIsEditingBalance(true);
  };

  const handleSaveBalance = async () => {
    await updateBalance.mutateAsync(balanceInput);
    setIsEditingBalance(false);
  };

  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full bg-slate-50/50">
        <Sidebar className="border-r border-slate-200 bg-white no-print">
          <SidebarContent>
            <div className="p-6">
              <h1 className="text-2xl font-bold text-primary tracking-tight">DigiKhata</h1>
              <p className="text-sm text-slate-500 mt-1">Business Ledger</p>
            </div>
            <SidebarGroup>
              <SidebarMenu>
                {navigation.map((item) => (
                  <SidebarMenuItem key={item.name}>
                    <SidebarMenuButton asChild data-active={location === item.href} className="data-[active=true]:bg-primary/10 data-[active=true]:text-primary data-[active=true]:font-medium transition-all duration-200 py-6 px-4">
                      <Link href={item.href} className="flex items-center gap-3 w-full">
                        <item.icon className="h-5 w-5" />
                        <span className="text-base">{item.name}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroup>
          </SidebarContent>
        </Sidebar>

        <div className="flex flex-col flex-1 w-full min-w-0">
          <header className="sticky top-0 z-30 flex h-20 items-center justify-between border-b border-slate-200 bg-white/80 backdrop-blur-md px-6 shadow-sm no-print">
            <div className="flex items-center gap-4">
              <SidebarTrigger />
              <h2 className="text-xl font-semibold capitalize">
                {location === '/' ? 'Dashboard' : location.split('/')[1]}
              </h2>
            </div>
            
            <div className="flex items-center gap-4 bg-slate-100/80 px-5 py-2.5 rounded-2xl border border-slate-200/60 shadow-sm transition-all hover:bg-slate-100">
              <Wallet className="h-5 w-5 text-primary" />
              <div className="flex flex-col">
                <span className="text-xs text-slate-500 font-medium uppercase tracking-wider">Account Balance</span>
                {isEditingBalance ? (
                  <div className="flex items-center gap-2 mt-1">
                    <Input 
                      value={balanceInput}
                      onChange={(e) => setBalanceInput(e.target.value)}
                      className="h-7 w-32 text-sm bg-white border-slate-300"
                      type="number"
                      autoFocus
                      onKeyDown={(e) => e.key === 'Enter' && handleSaveBalance()}
                    />
                    <Button size="icon" variant="ghost" className="h-7 w-7 text-primary hover:bg-primary/10" onClick={handleSaveBalance}>
                      <Check className="h-4 w-4" />
                    </Button>
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <span className="text-lg font-bold text-slate-900 leading-none">
                      {formatRupees(Number(balanceData?.value || 0))}
                    </span>
                    <Button size="icon" variant="ghost" className="h-6 w-6 text-slate-400 hover:text-primary hover:bg-primary/10" onClick={handleEditBalanceClick}>
                      <Edit2 className="h-3 w-3" />
                    </Button>
                  </div>
                )}
              </div>
            </div>
          </header>
          
          <main className="flex-1 p-6 md:p-8 overflow-y-auto w-full max-w-7xl mx-auto">
            {children}
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}
