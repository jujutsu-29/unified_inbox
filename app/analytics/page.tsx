"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Mail, BarChart3, TrendingUp, MessageSquare, Users, Clock } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts"
import { authClient } from "@/lib/auth-client"
import { useRouter } from "next/navigation"
import Loading from "@/components/loading"
import { Navbar } from "@/components/Navbar"

interface AnalyticsData {
  kpis: {
    totalMessages: number;
    totalContacts: number;
  };
  messageData: any[];
  channelData: any[];
  topContacts: any[];
}


export default function Analytics() {
  const [activeNav, setActiveNav] = useState("analytics")
  const [dateRange, setDateRange] = useState("week")

  const [isLoading, setIsLoading] = useState(true);
  const [data, setData] = useState<AnalyticsData | null>(null);

  const router = useRouter();
  const {
    data: session,
    isPending, //loading state
    error, //error object
    refetch //refetch the session
  } = authClient.useSession();

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        const res = await fetch("/api/analytics");
        if (!res.ok) throw new Error("Failed to fetch analytics");
        const analyticsData: AnalyticsData = await res.json();
        setData(analyticsData);
      } catch (err) {
        console.error(err);
      }
      setIsLoading(false);
    };

    if (session?.user) {
      fetchData();
    }
  }, [session, dateRange]);

  if (isPending) return <div><Loading/></div>;
  if (!session?.user) {
    router.push("/login");
    return null;
  }

  if (isLoading) {
    return <div><Loading/></div>;
  }
  
  // --- If no data, show empty state ---
  if (!data) {
    return <div>Could not load analytics data.</div>;
  }

  return (
    <div className="min-h-screen bg-background">
      {/* <nav className="border-b border-border bg-card sticky top-0">
        <div className="flex items-center justify-between px-6 py-4">
          <div className="flex items-center gap-4">
            <h1 className="text-2xl font-bold text-primary">Communications</h1>
          </div>
          <div className="flex items-center gap-2">
            <Link href="/inbox">
              <Button
                variant={activeNav === "inbox" ? "default" : "ghost"}
                onClick={() => setActiveNav("inbox")}
                className="gap-2"
              >
                <Mail className="h-4 w-4" />
                Inbox
              </Button>
            </Link>
            <Link href="/analytics">
              <Button
                variant={activeNav === "analytics" ? "default" : "ghost"}
                onClick={() => setActiveNav("analytics")}
                className="gap-2"
              >
                <BarChart3 className="h-4 w-4" />
                Analytics
              </Button>
            </Link>
          </div>
        </div>
      </nav> */}

      <Navbar/>

      <div className="p-6 space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-3xl font-bold text-foreground">Analytics</h2>
          <div className="flex gap-2">
            {["day", "week", "month"].map((range) => (
              <Button
                key={range}
                variant={dateRange === range ? "default" : "outline"}
                onClick={() => setDateRange(range)}
                size="sm"
              >
                {range.charAt(0).toUpperCase() + range.slice(1)}
              </Button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Card className="lg:col-span-2 p-6">
            <h3 className="text-lg font-semibold text-foreground mb-4">Messages Over Time</h3>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={data.messageData}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
                <XAxis dataKey="day" stroke="var(--color-muted-foreground)" />
                <YAxis stroke="var(--color-muted-foreground)" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "var(--color-card)",
                    border: "1px solid var(--color-border)",
                    borderRadius: "0.5rem",
                  }}
                  labelStyle={{ color: "var(--color-foreground)" }}
                />
                <Legend />
                <Line type="monotone" dataKey="sent" stroke="var(--color-primary)" strokeWidth={2} dot={false} />
                <Line type="monotone" dataKey="received" stroke="var(--color-accent)" strokeWidth={2} dot={false} />
                <Line type="monotone" dataKey="replied" stroke="var(--color-chart-3)" strokeWidth={2} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </Card>

          <Card className="p-6">
            <h3 className="text-lg font-semibold text-foreground mb-4">Channel Distribution</h3>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={data.channelData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, value }) => `${name} ${value}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {data.channelData.map((entry: any, index: number) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Card className="p-6">
            <h3 className="text-lg font-semibold text-foreground mb-4">Top Contacts</h3>
            <div className="space-y-4">
              {data.topContacts.map((contact) => (
                <div
                  key={contact.id}
                  className="flex items-center justify-between pb-3 border-b border-border last:border-0"
                >
                  <div>
                    <p className="text-sm font-medium text-foreground">{contact.name}</p>
                    <p className="text-xs text-muted-foreground">{contact.lastSeen}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-semibold text-primary">{contact.messages}</p>
                    <p className="text-xs text-muted-foreground">messages</p>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>
      </div>
    </div>
  )
}
