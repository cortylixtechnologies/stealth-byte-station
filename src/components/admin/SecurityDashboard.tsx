import { useState, useEffect, useMemo } from "react";
import { motion } from "framer-motion";
import {
  Shield,
  AlertTriangle,
  Globe,
  Activity,
  Users,
  Clock,
  MapPin,
  TrendingUp,
  TrendingDown,
  Eye,
  RefreshCw,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  AreaChart,
  Area,
  CartesianGrid,
  Tooltip,
} from "recharts";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { format, subDays, startOfHour, eachHourOfInterval, subHours } from "date-fns";
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
}

interface ThreatLevel {
  level: "low" | "medium" | "high" | "critical";
  color: string;
  bgColor: string;
  description: string;
}

const COUNTRY_COLORS = [
  "hsl(var(--accent))",
  "hsl(142, 76%, 36%)",
  "hsl(48, 96%, 53%)",
  "hsl(24, 94%, 50%)",
  "hsl(280, 67%, 54%)",
  "hsl(199, 89%, 48%)",
];

const SecurityDashboard = () => {
  const [logs, setLogs] = useState<SecurityLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    fetchLogs();
    
    // Set up realtime subscription for live updates
    const channel = supabase
      .channel("security-logs-realtime")
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "security_logs",
        },
        (payload) => {
          setLogs((prev) => [payload.new as SecurityLog, ...prev].slice(0, 1000));
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const fetchLogs = async () => {
    try {
      setRefreshing(true);
      const { data, error } = await supabase
        .from("security_logs")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(1000);

      if (error) throw error;
      setLogs(data || []);
    } catch (error: any) {
      toast.error("Failed to fetch security data: " + error.message);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  // Calculate threat level based on recent activity
  const threatLevel = useMemo((): ThreatLevel => {
    const lastHour = subHours(new Date(), 1);
    const recentLogs = logs.filter(
      (log) => new Date(log.created_at) > lastHour
    );
    const failedAttempts = recentLogs.filter(
      (log) => log.event_type === "login_failed"
    ).length;
    const suspiciousActivity = recentLogs.filter(
      (log) => log.event_type === "suspicious_activity"
    ).length;

    if (suspiciousActivity > 5 || failedAttempts > 50) {
      return {
        level: "critical",
        color: "text-red-500",
        bgColor: "bg-red-500/20",
        description: "Critical threat level detected",
      };
    } else if (suspiciousActivity > 2 || failedAttempts > 20) {
      return {
        level: "high",
        color: "text-orange-500",
        bgColor: "bg-orange-500/20",
        description: "Elevated threat activity",
      };
    } else if (failedAttempts > 10) {
      return {
        level: "medium",
        color: "text-yellow-500",
        bgColor: "bg-yellow-500/20",
        description: "Moderate threat activity",
      };
    }
    return {
      level: "low",
      color: "text-green-500",
      bgColor: "bg-green-500/20",
      description: "Normal activity levels",
    };
  }, [logs]);

  // Generate hourly activity heatmap data (last 24 hours)
  const heatmapData = useMemo(() => {
    const now = new Date();
    const hours = eachHourOfInterval({
      start: subHours(now, 23),
      end: now,
    });

    return hours.map((hour) => {
      const hourStart = startOfHour(hour);
      const hourEnd = new Date(hourStart.getTime() + 60 * 60 * 1000);

      const hourLogs = logs.filter((log) => {
        const logTime = new Date(log.created_at);
        return logTime >= hourStart && logTime < hourEnd;
      });

      const successful = hourLogs.filter(
        (l) => l.event_type === "login_success"
      ).length;
      const failed = hourLogs.filter(
        (l) => l.event_type === "login_failed"
      ).length;

      return {
        hour: format(hour, "HH:00"),
        successful,
        failed,
        total: hourLogs.length,
      };
    });
  }, [logs]);

  // Geographic access patterns
  const geoData = useMemo(() => {
    const countryMap = new Map<string, number>();

    logs.forEach((log) => {
      const metadata = log.metadata as { country?: string } | null;
      const country = metadata?.country || "Unknown";
      countryMap.set(country, (countryMap.get(country) || 0) + 1);
    });

    return Array.from(countryMap.entries())
      .map(([country, count]) => ({
        country: country === "unknown" ? "Unknown" : country.toUpperCase(),
        count,
      }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 6);
  }, [logs]);

  // Event type distribution
  const eventDistribution = useMemo(() => {
    const eventMap = new Map<string, number>();

    logs.forEach((log) => {
      eventMap.set(log.event_type, (eventMap.get(log.event_type) || 0) + 1);
    });

    return Array.from(eventMap.entries()).map(([type, count]) => ({
      name: type.replace(/_/g, " ").replace(/\b\w/g, (l) => l.toUpperCase()),
      value: count,
      type,
    }));
  }, [logs]);

  // Recent threats (last 7 days trend)
  const trendData = useMemo(() => {
    const days = Array.from({ length: 7 }, (_, i) => {
      const date = subDays(new Date(), 6 - i);
      return {
        date,
        label: format(date, "EEE"),
        failed: 0,
        success: 0,
      };
    });

    logs.forEach((log) => {
      const logDate = new Date(log.created_at);
      const dayIndex = days.findIndex(
        (d) =>
          format(d.date, "yyyy-MM-dd") === format(logDate, "yyyy-MM-dd")
      );
      if (dayIndex !== -1) {
        if (log.event_type === "login_failed") {
          days[dayIndex].failed++;
        } else if (log.event_type === "login_success") {
          days[dayIndex].success++;
        }
      }
    });

    return days;
  }, [logs]);

  // Unique IPs and users
  const stats = useMemo(() => {
    const uniqueIPs = new Set(logs.map((l) => l.ip_address).filter(Boolean));
    const uniqueUsers = new Set(logs.map((l) => l.user_id).filter(Boolean));
    const failedToday = logs.filter(
      (l) =>
        l.event_type === "login_failed" &&
        new Date(l.created_at) > subHours(new Date(), 24)
    ).length;
    const successToday = logs.filter(
      (l) =>
        l.event_type === "login_success" &&
        new Date(l.created_at) > subHours(new Date(), 24)
    ).length;

    return {
      uniqueIPs: uniqueIPs.size,
      uniqueUsers: uniqueUsers.size,
      failedToday,
      successToday,
    };
  }, [logs]);

  const getEventColor = (type: string) => {
    switch (type) {
      case "login_success":
        return "hsl(142, 76%, 36%)";
      case "login_failed":
        return "hsl(0, 84%, 60%)";
      case "suspicious_activity":
        return "hsl(24, 94%, 50%)";
      case "logout":
        return "hsl(199, 89%, 48%)";
      default:
        return "hsl(var(--muted-foreground))";
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-primary animate-pulse font-mono">
          Loading security data...
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-mono font-bold text-foreground flex items-center gap-2">
            <Shield className="w-6 h-6 text-accent" />
            Security Dashboard
          </h1>
          <p className="text-sm text-muted-foreground font-mono mt-1">
            Real-time threat monitoring and analytics
          </p>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={fetchLogs}
          disabled={refreshing}
          className="font-mono"
        >
          <RefreshCw
            className={`w-4 h-4 mr-2 ${refreshing ? "animate-spin" : ""}`}
          />
          Refresh
        </Button>
      </div>

      {/* Threat Level Banner */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className={`${threatLevel.bgColor} border border-current rounded-lg p-4 ${threatLevel.color}`}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Activity className="w-6 h-6" />
            <div>
              <div className="font-mono font-bold uppercase text-sm">
                Threat Level: {threatLevel.level}
              </div>
              <div className="text-xs opacity-80">
                {threatLevel.description}
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Eye className="w-4 h-4" />
            <span className="text-sm font-mono">Live Monitoring</span>
          </div>
        </div>
      </motion.div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-card border border-border rounded-lg p-4"
        >
          <div className="flex items-center gap-2 text-muted-foreground">
            <Globe className="w-4 h-4" />
            <span className="font-mono text-xs">Unique IPs</span>
          </div>
          <p className="text-2xl font-bold font-mono mt-2 text-foreground">
            {stats.uniqueIPs}
          </p>
        </motion.div>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className="bg-card border border-border rounded-lg p-4"
        >
          <div className="flex items-center gap-2 text-muted-foreground">
            <Users className="w-4 h-4" />
            <span className="font-mono text-xs">Active Users</span>
          </div>
          <p className="text-2xl font-bold font-mono mt-2 text-foreground">
            {stats.uniqueUsers}
          </p>
        </motion.div>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-card border border-border rounded-lg p-4"
        >
          <div className="flex items-center gap-2 text-green-400">
            <TrendingUp className="w-4 h-4" />
            <span className="font-mono text-xs">Success (24h)</span>
          </div>
          <p className="text-2xl font-bold font-mono mt-2 text-green-400">
            {stats.successToday}
          </p>
        </motion.div>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25 }}
          className="bg-card border border-border rounded-lg p-4"
        >
          <div className="flex items-center gap-2 text-red-400">
            <TrendingDown className="w-4 h-4" />
            <span className="font-mono text-xs">Failed (24h)</span>
          </div>
          <p className="text-2xl font-bold font-mono mt-2 text-red-400">
            {stats.failedToday}
          </p>
        </motion.div>
      </div>

      {/* Charts Row */}
      <div className="grid md:grid-cols-2 gap-6">
        {/* Activity Heatmap (24h) */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-card border border-border rounded-lg p-4"
        >
          <h3 className="font-mono font-semibold text-foreground mb-4 flex items-center gap-2">
            <Clock className="w-4 h-4 text-accent" />
            Login Activity (24h Heatmap)
          </h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={heatmapData} barGap={2}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis
                  dataKey="hour"
                  tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 10 }}
                  tickLine={false}
                  interval={2}
                />
                <YAxis
                  tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 10 }}
                  tickLine={false}
                />
                <Tooltip
                  contentStyle={{
                    background: "hsl(var(--card))",
                    border: "1px solid hsl(var(--border))",
                    borderRadius: "8px",
                    fontFamily: "monospace",
                  }}
                />
                <Bar
                  dataKey="successful"
                  fill="hsl(142, 76%, 36%)"
                  radius={[2, 2, 0, 0]}
                  name="Successful"
                />
                <Bar
                  dataKey="failed"
                  fill="hsl(0, 84%, 60%)"
                  radius={[2, 2, 0, 0]}
                  name="Failed"
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        {/* Geographic Distribution */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.35 }}
          className="bg-card border border-border rounded-lg p-4"
        >
          <h3 className="font-mono font-semibold text-foreground mb-4 flex items-center gap-2">
            <MapPin className="w-4 h-4 text-accent" />
            Geographic Access Patterns
          </h3>
          <div className="h-64 flex items-center">
            {geoData.length > 0 ? (
              <div className="w-full flex items-center gap-4">
                <div className="w-1/2 h-48">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={geoData}
                        dataKey="count"
                        nameKey="country"
                        cx="50%"
                        cy="50%"
                        outerRadius={70}
                        innerRadius={40}
                      >
                        {geoData.map((_, index) => (
                          <Cell
                            key={`cell-${index}`}
                            fill={COUNTRY_COLORS[index % COUNTRY_COLORS.length]}
                          />
                        ))}
                      </Pie>
                      <Tooltip
                        contentStyle={{
                          background: "hsl(var(--card))",
                          border: "1px solid hsl(var(--border))",
                          borderRadius: "8px",
                          fontFamily: "monospace",
                        }}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                <div className="w-1/2 space-y-2">
                  {geoData.map((item, index) => (
                    <div
                      key={item.country}
                      className="flex items-center justify-between text-sm"
                    >
                      <div className="flex items-center gap-2">
                        <div
                          className="w-3 h-3 rounded-full"
                          style={{
                            backgroundColor:
                              COUNTRY_COLORS[index % COUNTRY_COLORS.length],
                          }}
                        />
                        <span className="font-mono text-foreground">
                          {item.country}
                        </span>
                      </div>
                      <span className="font-mono text-muted-foreground">
                        {item.count}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="w-full text-center text-muted-foreground font-mono">
                No geographic data available
              </div>
            )}
          </div>
        </motion.div>
      </div>

      {/* Trend Chart */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="bg-card border border-border rounded-lg p-4"
      >
        <h3 className="font-mono font-semibold text-foreground mb-4 flex items-center gap-2">
          <Activity className="w-4 h-4 text-accent" />
          7-Day Login Trend
        </h3>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={trendData}>
              <defs>
                <linearGradient id="successGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="hsl(142, 76%, 36%)" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="hsl(142, 76%, 36%)" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="failedGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="hsl(0, 84%, 60%)" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="hsl(0, 84%, 60%)" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis
                dataKey="label"
                tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 12 }}
                tickLine={false}
              />
              <YAxis
                tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 12 }}
                tickLine={false}
              />
              <Tooltip
                contentStyle={{
                  background: "hsl(var(--card))",
                  border: "1px solid hsl(var(--border))",
                  borderRadius: "8px",
                  fontFamily: "monospace",
                }}
              />
              <Area
                type="monotone"
                dataKey="success"
                stroke="hsl(142, 76%, 36%)"
                fill="url(#successGradient)"
                strokeWidth={2}
                name="Successful Logins"
              />
              <Area
                type="monotone"
                dataKey="failed"
                stroke="hsl(0, 84%, 60%)"
                fill="url(#failedGradient)"
                strokeWidth={2}
                name="Failed Attempts"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </motion.div>

      {/* Event Type Distribution */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.45 }}
        className="bg-card border border-border rounded-lg p-4"
      >
        <h3 className="font-mono font-semibold text-foreground mb-4 flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 text-accent" />
          Event Distribution
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {eventDistribution.map((event) => (
            <div
              key={event.type}
              className="p-3 rounded-lg border border-border"
              style={{ borderLeftColor: getEventColor(event.type), borderLeftWidth: 3 }}
            >
              <div className="text-xs font-mono text-muted-foreground">
                {event.name}
              </div>
              <div className="text-xl font-bold font-mono text-foreground mt-1">
                {event.value}
              </div>
            </div>
          ))}
        </div>
      </motion.div>
    </div>
  );
};

export default SecurityDashboard;
