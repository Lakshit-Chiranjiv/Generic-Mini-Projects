"use client";

import { useState } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Activity, Loader2, CheckCircle, XCircle, AlertTriangle } from "lucide-react";

const COMMON_PORTS = [
  { port: 80, name: "HTTP" },
  { port: 443, name: "HTTPS" },
  { port: 22, name: "SSH" },
  { port: 3306, name: "MySQL" },
];

export default function PortChecker() {
  const [host, setHost] = useState("");
  const [selectedPort, setSelectedPort] = useState(443);
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<"OPEN" | "CLOSED" | "TIMEOUT" | null>(null);
  const [error, setError] = useState<string | null>(null);

  const checkPort = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!host) return;

    // Clean up host
    const cleanHost = host.replace(/^https?:\/\//, '').split('/')[0];

    setLoading(true);
    setStatus(null);
    setError(null);

    try {
      const res = await fetch(`https://networkcalc.com/api/port/${cleanHost}/${selectedPort}`);
      if (!res.ok) throw new Error("API request failed");
      
      const json = await res.json();
      if (json.status !== "OK") throw new Error("Failed to check port");
      
      setStatus(json.port.status);
    } catch (err: any) {
      setError(err.message || "Failed to connect to API");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader className="pb-4 border-b border-border/50">
        <CardTitle className="flex items-center text-primary">
          <Activity className="w-5 h-5 mr-2" />
          Port Scanner
        </CardTitle>
        <p className="text-xs text-muted-foreground mt-1">
          Check if a specific TCP port is open.
        </p>
      </CardHeader>
      
      <CardContent className="pt-6">
        <form onSubmit={checkPort} className="space-y-4">
          <div className="flex gap-2">
            <input 
              type="text"
              placeholder="example.com or IP"
              className="flex-1 min-w-0 bg-muted/50 border border-border rounded-lg py-2 px-3 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
              value={host}
              onChange={(e) => setHost(e.target.value)}
            />
            <select 
              className="w-32 shrink-0 bg-muted/50 border border-border rounded-lg py-2 px-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
              value={selectedPort}
              onChange={(e) => setSelectedPort(Number(e.target.value))}
            >
              {COMMON_PORTS.map((p) => (
                <option key={p.port} value={p.port}>
                  {p.port} ({p.name})
                </option>
              ))}
            </select>
          </div>

          <button 
            type="submit"
            disabled={loading || !host}
            className="w-full bg-primary text-primary-foreground py-2 rounded-lg text-sm font-medium hover:bg-primary/90 disabled:opacity-50 transition-colors flex items-center justify-center"
          >
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Check Port"}
          </button>
        </form>

        <div className="mt-6">
          {loading && (
             <div className="text-sm text-muted-foreground animate-pulse text-center">
               Scanning port {selectedPort}...
             </div>
          )}

          {status && !loading && (
            <div className={`p-4 rounded-lg flex items-center justify-center space-x-2 border ${
              status === "OPEN" ? "bg-green-500/10 border-green-500/20 text-green-500" :
              status === "CLOSED" ? "bg-red-500/10 border-red-500/20 text-red-500" :
              "bg-yellow-500/10 border-yellow-500/20 text-yellow-500"
            }`}>
              {status === "OPEN" ? <CheckCircle className="w-5 h-5" /> : 
               status === "CLOSED" ? <XCircle className="w-5 h-5" /> :
               <AlertTriangle className="w-5 h-5" />}
              <span className="font-semibold">{status}</span>
            </div>
          )}

          {error && !loading && (
            <div className="text-sm text-destructive bg-destructive/10 p-3 rounded-lg flex items-start">
              <AlertTriangle className="w-4 h-4 mr-2 mt-0.5 shrink-0" />
              <div>
                <p className="font-semibold mb-1">Browser Limitation Detected</p>
                <p className="text-xs opacity-90">
                  Browsers block raw network sockets for security. This API request failed, likely due to CORS restrictions on the proxy server.
                </p>
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
