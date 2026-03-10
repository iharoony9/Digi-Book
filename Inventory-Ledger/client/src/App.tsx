import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/not-found";

// Pages
import Dashboard from "./pages/Dashboard";
import Customers from "./pages/Customers";
import Suppliers from "./pages/Suppliers";
import Stocks from "./pages/Stocks";
import Bills from "./pages/Bills";
import CreateBill from "./pages/CreateBill";
import ViewBill from "./pages/ViewBill";
import Transactions from "./pages/Transactions";

function Router() {
  return (
    <Switch>
      <Route path="/" component={Dashboard}/>
      <Route path="/customers" component={Customers}/>
      <Route path="/suppliers" component={Suppliers}/>
      <Route path="/stocks" component={Stocks}/>
      <Route path="/bills" component={Bills}/>
      <Route path="/bills/new" component={CreateBill}/>
      <Route path="/bills/:id" component={ViewBill}/>
      <Route path="/transactions" component={Transactions}/>
      
      {/* Fallback to 404 */}
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Router />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
