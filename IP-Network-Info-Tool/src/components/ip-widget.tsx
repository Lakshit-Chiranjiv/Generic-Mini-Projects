"use client";

import { useEffect, useState } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Globe, MapPin, Clock, Server, Copy, Check, ShieldAlert } from "lucide-react";

interface IpData {
  ip: string;
  country: string;
  city: string;
  org: string;
  timezone: string;
}

export default function IpWidget() {
  const [data, setData] = useState<IpData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    async function fetchIp() {
      try {
        const res = await fetch("https://ipinfo.io/json");
        if (!res.ok) throw new Error(`HTTP Error: ${res.status}`);
        const json = await res.json();
        setData(json);
      } catch (err: any) {
        setError(err.message || "Failed to load IP data");
      } finally {
        setLoading(false);
      }
    }
    fetchIp();
  }, []);

  const copyToClipboard = () => {
    if (data?.ip) {
      navigator.clipboard.writeText(data.ip);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  if (loading) {
    return (
      <Card className="animate-pulse">
        <CardHeader>
          <div className="h-6 w-1/2 bg-muted rounded"></div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="h-4 w-full bg-muted rounded"></div>
          <div className="h-4 w-3/4 bg-muted rounded"></div>
          <div className="h-4 w-5/6 bg-muted rounded"></div>
        </CardContent>
      </Card>
    );
  }

  if (error || !data) {
    return (
      <Card className="border-destructive/50 bg-destructive/10">
        <CardHeader>
          <CardTitle className="flex items-center text-destructive">
            <ShieldAlert className="w-5 h-5 mr-2" />
            Error Loading IP
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-destructive-foreground">{error}</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="pb-3 border-b border-border/50">
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center text-primary">
            <Globe className="w-5 h-5 mr-2" />
            Your Network Identity
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-4 space-y-4">
        {/* Main IP Display */}
        <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg border border-border">
          <div>
            <p className="text-xs text-muted-foreground uppercase tracking-wider font-semibold">Public IP Address</p>
            <p className="text-2xl font-mono font-bold text-foreground tracking-tight">{data.ip}</p>
          </div>
          <button 
            onClick={copyToClipboard}
            className="p-2 hover:bg-muted rounded-md transition-colors text-muted-foreground hover:text-foreground"
            title="Copy IP"
          >
            {copied ? <Check className="w-5 h-5 text-green-500" /> : <Copy className="w-5 h-5" />}
          </button>
        </div>

        {/* Details List */}
        <div className="space-y-3">
          <DetailRow icon={<Server className="w-4 h-4" />} label="ISP / ASN" value={data.org} />
          <DetailRow icon={<MapPin className="w-4 h-4" />} label="Location" value={`${data.city}, ${data.country}`} />
          <DetailRow icon={<Clock className="w-4 h-4" />} label="Timezone" value={data.timezone} />
        </div>
      </CardContent>
    </Card>
  );
}

function DetailRow({ icon, label, value }: { icon: React.ReactNode, label: string, value: string }) {
  return (
    <div className="flex items-center justify-between text-sm">
      <div className="flex items-center text-muted-foreground">
        <span className="mr-2">{icon}</span>
        {label}
      </div>
      <span className="font-medium text-foreground text-right truncate max-w-[60%]">{value}</span>
    </div>
  );
}
