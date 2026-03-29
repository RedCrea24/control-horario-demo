import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/not-found";

import { Layout } from "@/components/Layout";
import Dashboard from "@/pages/Dashboard";
import Employees from "@/pages/Employees";
import TimeEntries from "@/pages/TimeEntries";
import Vacations from "@/pages/Vacations";
import Settings from "@/pages/Settings";
import Reports from "@/pages/Reports";

function Router() {
  return (
    <Layout>
      <Switch>
        <Route path="/" component={Dashboard}/>
        <Route path="/empleados" component={Employees}/>
        <Route path="/fichajes" component={TimeEntries}/>
        <Route path="/vacaciones" component={Vacations}/>
        <Route path="/configuracion" component={Settings}/>
        <Route path="/informes" component={Reports}/>
        <Route component={NotFound} />
      </Switch>
    </Layout>
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
