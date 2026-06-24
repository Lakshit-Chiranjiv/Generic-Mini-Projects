"use client";

import { useState } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Search, Network, Loader2, AlertCircle } from "lucide-react";

interface DnsRecord {
  name: string;
  type: number;
  TTL: number;
  data: string;
}

interface DnsResult {
  type: string;
  records: DnsRecord[];
}

const RECORD_TYPES = ["A", "AAAA", "MX", "TXT", "CNAME"];

export default function DnsLookup() {
  const [domain, setDomain] = useState("");
  const [results, setResults] = useState<DnsResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchDns = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!domain) return;
    
    // Basic domain cleanup
    const cleanDomain = domain.replace(/^https?:\/\//, '').split('/')[0];
    
    setLoading(true);
    setError(null);
    setResults([]);

    try {
      // Fetch all record types concurrently
      const promises = RECORD_TYPES.map(async (type) => {
        const res = await fetch(`https://dns.google/resolve?name=${cleanDomain}&type=${type}`);
        if (!res.ok) throw new Error("DNS request failed");
        const json = await res.json();
        return {
          type,
          records: json.Answer || [], // Answer array might be undefined if no records found
        };
      });

      const data = await Promise.all(promises);
      setResults(data);
    } catch (err: any) {
      setError(err.message || "Failed to lookup DNS records");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="h-full flex flex-col">
      <CardHeader className="pb-4 border-b border-border/50">
        <CardTitle className="flex items-center text-primary">
          <Network className="w-5 h-5 mr-2" />
          DNS Inspector
        </CardTitle>
        <p className="text-sm text-muted-foreground mt-1">
          Query Google&apos;s resolvers for DNS records.
        </p>
      </CardHeader>
      
      <CardContent className="pt-6 flex-1 flex flex-col">
        <form onSubmit={fetchDns} className="flex space-x-2 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input 
              type="text" 
              placeholder="example.com"
              className="w-full bg-muted/50 border border-border rounded-lg py-2 pl-10 pr-4 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
              value={domain}
              onChange={(e) => setDomain(e.target.value)}
            />
          </div>
          <button 
            type="submit"
            disabled={loading || !domain}
            className="bg-primary text-primary-foreground px-4 py-2 rounded-lg text-sm font-medium hover:bg-primary/90 disabled:opacity-50 transition-colors flex items-center"
          >
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Lookup"}
          </button>
        </form>

        {error && (
          <div className="bg-destructive/10 text-destructive p-3 rounded-lg text-sm flex items-center mb-4">
            <AlertCircle className="w-4 h-4 mr-2" />
            {error}
          </div>
        )}

        <div className="flex-1 overflow-y-auto pr-2 space-y-6">
          {results.length > 0 ? (
            results.map((res) => (
              <div key={res.type}>
                <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
                  {res.type} Records
                </h4>
                {res.records.length > 0 ? (
                  <div className="space-y-2">
                    {res.records.map((record, i) => (
                      <div key={i} className="bg-muted/30 border border-border rounded-md p-2 text-sm flex items-start justify-between break-all">
                        <span className="font-mono text-foreground mr-4">{record.data}</span>
                        <span className="text-xs text-muted-foreground shrink-0 mt-0.5">TTL: {record.TTL}s</span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-sm text-muted-foreground italic">No {res.type} records found.</div>
                )}
              </div>
            ))
          ) : (
            !loading && !error && (
              <div className="h-full flex flex-col items-center justify-center text-muted-foreground opacity-50 py-12">
                <Search className="w-12 h-12 mb-3" />
                <p>Enter a domain to view its DNS records.</p>
              </div>
            )
          )}
        </div>
      </CardContent>
    </Card>
  );
}
