import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import NotFound from "@/pages/not-found";
import Header from "@/components/ui/header";
import Home from "@/pages/home";
import MyBookings from "@/pages/my-bookings";
import Admin from "@/pages/admin";
import { AuthProvider } from "@/context/AuthContext";
import { useEffect } from "react";
import 'leaflet/dist/leaflet.css';

function Router() {
  return (
    <div className="flex flex-col h-screen">
      <Header />
      <main className="flex-1 flex flex-col md:flex-row overflow-hidden">
        <Switch>
          <Route path="/" component={Home} />
          <Route path="/bookings" component={MyBookings} />
          <Route path="/admin" component={Admin} />
          <Route component={NotFound} />
        </Switch>
      </main>
    </div>
  );
}

function App() {
  // Fix for Leaflet icon issues
  useEffect(() => {
    // Import Leaflet directly to fix icon issues
    import('leaflet').then(L => {
      delete (L.Icon.Default.prototype as any)._getIconUrl;
      L.Icon.Default.mergeOptions({
        iconRetinaUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon-2x.png',
        iconUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png',
        shadowUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png',
      });
    });
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <Router />
        <Toaster />
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
