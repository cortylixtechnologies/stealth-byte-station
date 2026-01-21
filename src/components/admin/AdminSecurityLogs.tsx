import { useState, useEffect } from "react";
import { Shield, AlertTriangle, Info, User, Clock, Monitor, Search, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { format } from "date-fns";
import type { Json } from "@/integrations/supabase/types";

interface SecurityLog {
  id: string;
  user_id: string | null;
  event_type: string;
  event_description: string | null;
  ip_address: string | null;
  user_agent: string | null;
  metadata: Json;
  created_at: string;
  username?: string;
}

const eventTypeColors: Record<string, string> = {
  login_success: "bg-green-500/20 text-green-400",
  login_failed: "bg-red-500/20 text-red-400",
  logout: "bg-blue-500/20 text-blue-400",
  password_change: "bg-yellow-500/20 text-yellow-400",
  role_change: "bg-purple-500/20 text-purple-400",
  account_locked: "bg-red-500/20 text-red-400",
  suspicious_activity: "bg-orange-500/20 text-orange-400",
  default: "bg-muted text-muted-foreground",
};

const eventTypeIcons: Record<string, typeof Shield> = {
  login_success: Shield,
  login_failed: AlertTriangle,
  logout: User,
  password_change: Shield,
  role_change: Shield,
  account_locked: AlertTriangle,
  suspicious_activity: AlertTriangle,
  default: Info,
};

const AdminSecurityLogs = () => {
  const [logs, setLogs] = useState<SecurityLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [eventFilter, setEventFilter] = useState<string>("all");
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    fetchLogs();
  }, []);

  const fetchLogs = async () => {
    try {
      setRefreshing(true);
      
      // Fetch security logs
      const { data: logsData, error: logsError } = await supabase
        .from("security_logs")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(500);

      if (logsError) throw logsError;

      // Fetch profiles to map user names
      const { data: profiles } = await supabase
        .from("profiles")
        .select("user_id, username, full_name");

      // Map usernames to logs
      const logsWithUsernames = (logsData || []).map((log) => {
        const profile = profiles?.find((p) => p.user_id === log.user_id);
        return {
          ...log,
          username: profile?.username || profile?.full_name || "Unknown",
        };
      });

      setLogs(logsWithUsernames);
    } catch (error: any) {
      toast.error("Failed to fetch security logs: " + error.message);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const getEventColor = (eventType: string) => {
    return eventTypeColors[eventType] || eventTypeColors.default;
  };

  const getEventIcon = (eventType: string) => {
    return eventTypeIcons[eventType] || eventTypeIcons.default;
  };

  const filteredLogs = logs.filter((log) => {
    const matchesSearch =
      (log.event_description?.toLowerCase() || "").includes(searchTerm.toLowerCase()) ||
      (log.username?.toLowerCase() || "").includes(searchTerm.toLowerCase()) ||
      (log.ip_address?.toLowerCase() || "").includes(searchTerm.toLowerCase());

    const matchesFilter = eventFilter === "all" || log.event_type === eventFilter;

    return matchesSearch && matchesFilter;
  });

  const uniqueEventTypes = [...new Set(logs.map((log) => log.event_type))];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-mono font-bold text-foreground">
            Security Logs
          </h1>
          <p className="text-sm text-muted-foreground font-mono mt-1">
            Monitor authentication and security events
          </p>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={fetchLogs}
          disabled={refreshing}
          className="font-mono"
        >
          <RefreshCw className={`w-4 h-4 mr-2 ${refreshing ? "animate-spin" : ""}`} />
          Refresh
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-card border border-border rounded-lg p-4">
          <div className="flex items-center gap-2 text-green-400">
            <Shield className="w-5 h-5" />
            <span className="font-mono text-sm">Successful Logins</span>
          </div>
          <p className="text-2xl font-bold font-mono mt-2">
            {logs.filter((l) => l.event_type === "login_success").length}
          </p>
        </div>
        <div className="bg-card border border-border rounded-lg p-4">
          <div className="flex items-center gap-2 text-red-400">
            <AlertTriangle className="w-5 h-5" />
            <span className="font-mono text-sm">Failed Logins</span>
          </div>
          <p className="text-2xl font-bold font-mono mt-2">
            {logs.filter((l) => l.event_type === "login_failed").length}
          </p>
        </div>
        <div className="bg-card border border-border rounded-lg p-4">
          <div className="flex items-center gap-2 text-orange-400">
            <AlertTriangle className="w-5 h-5" />
            <span className="font-mono text-sm">Suspicious Activity</span>
          </div>
          <p className="text-2xl font-bold font-mono mt-2">
            {logs.filter((l) => l.event_type === "suspicious_activity").length}
          </p>
        </div>
        <div className="bg-card border border-border rounded-lg p-4">
          <div className="flex items-center gap-2 text-muted-foreground">
            <Info className="w-5 h-5" />
            <span className="font-mono text-sm">Total Events</span>
          </div>
          <p className="text-2xl font-bold font-mono mt-2">{logs.length}</p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search logs..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 font-mono bg-input border-border"
          />
        </div>
        <Select value={eventFilter} onValueChange={setEventFilter}>
          <SelectTrigger className="w-full sm:w-48 font-mono bg-input border-border">
            <SelectValue placeholder="Filter by event" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Events</SelectItem>
            {uniqueEventTypes.map((type) => (
              <SelectItem key={type} value={type}>
                {type.replace(/_/g, " ").replace(/\b\w/g, (l) => l.toUpperCase())}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Logs List */}
      {loading ? (
        <div className="text-center py-8 text-muted-foreground font-mono">
          Loading security logs...
        </div>
      ) : filteredLogs.length === 0 ? (
        <div className="text-center py-12 border border-dashed border-border rounded-lg">
          <Shield className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
          <p className="text-muted-foreground font-mono">No security logs found</p>
          <p className="text-sm text-muted-foreground font-mono mt-1">
            Security events will appear here as they occur
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredLogs.map((log) => {
            const Icon = getEventIcon(log.event_type);
            return (
              <div
                key={log.id}
                className="bg-card border border-border rounded-lg p-4 hover:border-accent/50 transition-colors"
              >
                <div className="flex items-start gap-4">
                  <div
                    className={`p-2 rounded-lg ${getEventColor(log.event_type)}`}
                  >
                    <Icon className="w-5 h-5" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span
                        className={`px-2 py-0.5 text-xs font-mono rounded ${getEventColor(
                          log.event_type
                        )}`}
                      >
                        {log.event_type.replace(/_/g, " ").toUpperCase()}
                      </span>
                      {log.user_id && (
                        <span className="text-sm text-muted-foreground font-mono flex items-center gap-1">
                          <User className="w-3 h-3" />
                          {log.username}
                        </span>
                      )}
                    </div>
                    <p className="text-foreground font-mono text-sm mt-2">
                      {log.event_description || "No description"}
                    </p>
                    <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground font-mono flex-wrap">
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {format(new Date(log.created_at), "MMM d, yyyy HH:mm:ss")}
                      </span>
                      {log.ip_address && (
                        <span className="flex items-center gap-1">
                          <Monitor className="w-3 h-3" />
                          {log.ip_address}
                        </span>
                      )}
                    </div>
                    {log.user_agent && (
                      <p className="text-xs text-muted-foreground font-mono mt-1 truncate">
                        {log.user_agent}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default AdminSecurityLogs;
