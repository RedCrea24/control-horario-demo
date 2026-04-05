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
import ControlPro from "@/pages/ControlPro";
import MoreInfo from "@/pages/MoreInfo";
import Pricing from "@/pages/Pricing";
import HowToBuy from "@/pages/HowToBuy";
import DemoLanding from "@/pages/DemoLanding";
import ActivateAccount from "@/pages/ActivateAccount";
import Login from "@/pages/Login";
import { DemoOverlay } from "@/components/DemoOverlay";

function MainRouter() {
  return (
    <Layout>
      <Switch>
        <Route path="/" component={MoreInfo}/>
        <Route path="/dashboard" component={Dashboard}/>
        <Route path="/empleados" component={Employees}/>
        <Route path="/fichajes" component={TimeEntries}/>
        <Route path="/vacaciones" component={Vacations}/>
        <Route path="/informes" component={Reports}/>
        <Route path="/configuracion" component={Settings}/>
        <Route path="/control-pro" component={ControlPro}/>
        <Route path="/mas-info" component={MoreInfo}/>
        <Route path="/precios" component={Pricing}/>
        <Route path="/pasos" component={HowToBuy}/>
        <Route component={NotFound} />
      </Switch>
    </Layout>
  );
}

function DemoRouter() {
  return (
    <>
      <DemoOverlay forceDemo />
      <Layout basePath="/demo-app">
        <Switch>
          <Route path="/demo-app" component={Dashboard}/>
          <Route path="/demo-app/empleados" component={Employees}/>
          <Route path="/demo-app/fichajes" component={TimeEntries}/>
          <Route path="/demo-app/vacaciones" component={Vacations}/>
          <Route path="/demo-app/informes" component={Reports}/>
          <Route path="/demo-app/configuracion" component={Settings}/>
          <Route path="/demo-app/control-pro" component={ControlPro}/>
          <Route path="/demo-app/mas-info" component={MoreInfo}/>
          <Route path="/demo-app/precios" component={Pricing}/>
          <Route path="/demo-app/pasos" component={HowToBuy}/>
          <Route component={NotFound} />
        </Switch>
      </Layout>
    </>
  );
}

function Router() {
  return (
    <Switch>
      <Route path="/" component={DemoLanding}/>
      <Route path="/activar" component={ActivateAccount}/>
      <Route path="/acceso" component={Login}/>
      <Route path="/demo" component={DemoLanding}/>
      <Route path="/demo-app" component={DemoRouter}/>
      <Route path="/demo-app/:rest*" component={DemoRouter}/>
      <Route component={MainRouter}/>
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
