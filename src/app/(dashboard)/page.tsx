"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Users,
  UserCheck,
  Calendar,
  TrendingUp,
  DollarSign,
  Activity,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/store/auth";

export default function DashboardPage() {
  const router = useRouter();
  const { isAuthenticated } = useAuthStore();
  const stats = [
    {
      title: "Total Users",
      value: "2,847",
      change: "+12.5%",
      icon: Users,
      trend: "up",
    },
    {
      title: "Active Workers",
      value: "156",
      change: "+8.2%",
      icon: UserCheck,
      trend: "up",
    },
    {
      title: "Total Bookings",
      value: "1,234",
      change: "+23.1%",
      icon: Calendar,
      trend: "up",
    },
    {
      title: "Revenue",
      value: "$45,231",
      change: "+15.3%",
      icon: DollarSign,
      trend: "up",
    },
    {
      title: "Active Subscriptions",
      value: "892",
      change: "+5.7%",
      icon: Activity,
      trend: "up",
    },
    {
      title: "Growth Rate",
      value: "18.2%",
      change: "+2.1%",
      icon: TrendingUp,
      trend: "up",
    },
  ];

  // Redirect if already authenticated
  if (isAuthenticated) {
    router.push("/");
    return null;
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground">
          Welcome to the Serenity Admin Dashboard. Here&apos;s an overview of
          your platform.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <Card key={stat.title}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  {stat.title}
                </CardTitle>
                <Icon className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stat.value}</div>
                <div className="flex items-center space-x-2 text-xs text-muted-foreground">
                  <Badge
                    variant={stat.trend === "up" ? "default" : "secondary"}
                  >
                    {stat.change}
                  </Badge>
                  <span>from last month</span>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
            <CardDescription>
              Latest actions and updates from your platform
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center space-x-4">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <div className="flex-1">
                  <p className="text-sm font-medium">New user registration</p>
                  <p className="text-xs text-muted-foreground">2 minutes ago</p>
                </div>
              </div>
              <div className="flex items-center space-x-4">
                <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                <div className="flex-1">
                  <p className="text-sm font-medium">Booking completed</p>
                  <p className="text-xs text-muted-foreground">5 minutes ago</p>
                </div>
              </div>
              <div className="flex items-center space-x-4">
                <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                <div className="flex-1">
                  <p className="text-sm font-medium">Worker assigned to job</p>
                  <p className="text-xs text-muted-foreground">
                    10 minutes ago
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
            <CardDescription>Common administrative tasks</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <button className="w-full text-left p-3 rounded-lg border hover:bg-accent transition-colors">
                <div className="font-medium">Create New User</div>
                <div className="text-sm text-muted-foreground">
                  Add a new customer account
                </div>
              </button>
              <button className="w-full text-left p-3 rounded-lg border hover:bg-accent transition-colors">
                <div className="font-medium">Assign Worker</div>
                <div className="text-sm text-muted-foreground">
                  Assign worker to pending jobs
                </div>
              </button>
              <button className="w-full text-left p-3 rounded-lg border hover:bg-accent transition-colors">
                <div className="font-medium">View Reports</div>
                <div className="text-sm text-muted-foreground">
                  Generate analytics reports
                </div>
              </button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
