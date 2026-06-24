import { Network, Activity, Globe } from "lucide-react";
import IpWidget from "@/components/ip-widget";
import DnsLookup from "@/components/dns-lookup";
import PortChecker from "@/components/port-checker";

export default function Dashboard() {
  return (
    <div className="max-w-6xl mx-auto p-6 space-y-8">
      {/* Header */}
      <header className="flex items-center space-x-4 border-b border-border pb-6">
        <div className="bg-primary/10 p-3 rounded-lg">
          <Activity className="w-8 h-8 text-primary" />
        </div>
        <div>
          <h1 className="text-3xl font-bold text-foreground">NetOps Dashboard</h1>
          <p className="text-muted-foreground">IP, DNS, and Network Diagnostics</p>
        </div>
      </header>

      {/* Main Grid */}
      <main className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        
        {/* Left Column: Network Identity & Port Checker */}
        <div className="space-y-6 lg:col-span-1">
          <IpWidget />
          
          <PortChecker />
        </div>

        {/* Right Column: DNS Inspector (takes up 2 columns on large screens) */}
        <div className="lg:col-span-2 space-y-6">
          <DnsLookup />
        </div>
        
      </main>
    </div>
  );
}
