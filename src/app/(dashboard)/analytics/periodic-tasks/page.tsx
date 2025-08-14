"use client";

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Download, Clock, Repeat, Star, Award, TrendingUp } from "lucide-react";
import { usePeriodicTasksAnalytics, useExportPeriodicTasksData } from "@/hooks/use-analytics";
import { GetPeriodicTasksParams } from "@/services/analytics";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { toast } from "sonner";

export default function PeriodicTasksAnalyticsPage() {
  const [filters, setFilters] = useState<GetPeriodicTasksParams>({
    period: 'monthly',
  });

  const { data, isLoading, error } = usePeriodicTasksAnalytics(filters);
  const exportMutation = useExportPeriodicTasksData();

  const handlePeriodChange = (period: string) => {
    setFilters(prev => ({ ...prev, period: period as GetPeriodicTasksParams['period'] }));
  };

  const handleTaskTypeChange = (taskType: string) => {
    const type = taskType === "all" ? undefined : taskType;
    setFilters(prev => ({ ...prev, task_type: type }));
  };

  const handleExport = async () => {
    try {
      const blob = await exportMutation.mutateAsync(filters);
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.style.display = 'none';
      a.href = url;
      a.download = `periodic-tasks-analytics-${filters.period}.csv`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      toast.success("Analytics data exported successfully");
    } catch (error) {
      toast.error("Failed to export analytics data");
    }
  };

  const getCompletionRateColor = (rate: number) => {
    if (rate >= 90) return "bg-green-100 text-green-800";
    if (rate >= 70) return "bg-yellow-100 text-yellow-800";
    return "bg-red-100 text-red-800";
  };

  const getSatisfactionColor = (score: number) => {
    if (score >= 4.5) return "bg-green-100 text-green-800";
    if (score >= 3.5) return "bg-yellow-100 text-yellow-800";
    return "bg-red-100 text-red-800";
  };

  const getPeriodIcon = (period: string) => {
    switch (period) {
      case 'daily':
        return <Clock className="h-4 w-4" />;
      case 'weekly':
        return <Repeat className="h-4 w-4" />;
      case 'monthly':
        return <TrendingUp className="h-4 w-4" />;
      default:
        return <Clock className="h-4 w-4" />;
    }
  };

  if (error) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold tracking-tight">Periodic Tasks Analytics</h1>
        </div>
        <Alert variant="destructive">
          <AlertDescription>
            Failed to load periodic tasks analytics. Please try again later.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">Periodic Tasks Analytics</h1>
        <Button onClick={handleExport} disabled={exportMutation.isPending}>
          <Download className="mr-2 h-4 w-4" />
          {exportMutation.isPending ? "Exporting..." : "Export Data"}
        </Button>
      </div>

      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Most Popular Service</CardTitle>
            <Award className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {isLoading ? (
                <Skeleton className="h-8 w-32" />
              ) : (
                data?.data?.summary?.most_popular_service || "N/A"
              )}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Highest Satisfaction</CardTitle>
            <Star className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {isLoading ? (
                <Skeleton className="h-8 w-32" />
              ) : (
                data?.data?.summary?.highest_satisfaction || "N/A"
              )}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Best Completion Rate</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {isLoading ? (
                <Skeleton className="h-8 w-32" />
              ) : (
                data?.data?.summary?.best_completion_rate || "N/A"
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Periodic Task Performance</CardTitle>
          <CardDescription>
            Analyze recurring task patterns and performance metrics
          </CardDescription>
        </CardHeader>
        <CardContent>
          {/* Filters */}
          <div className="grid gap-4 md:grid-cols-2 mb-6">
            <div className="space-y-2">
              <label className="text-sm font-medium">Period</label>
              <Select value={filters.period} onValueChange={handlePeriodChange}>
                <SelectTrigger>
                  <SelectValue placeholder="Select period" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="daily">Daily</SelectItem>
                  <SelectItem value="weekly">Weekly</SelectItem>
                  <SelectItem value="monthly">Monthly</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Task Type</label>
              <Select value={filters.task_type || "all"} onValueChange={handleTaskTypeChange}>
                <SelectTrigger>
                  <SelectValue placeholder="Select task type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="cleaning">Cleaning</SelectItem>
                  <SelectItem value="maintenance">Maintenance</SelectItem>
                  <SelectItem value="inspection">Inspection</SelectItem>
                  <SelectItem value="repair">Repair</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {isLoading ? (
            <div className="space-y-4">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="flex items-center space-x-4">
                  <Skeleton className="h-12 w-12 rounded-full" />
                  <div className="space-y-2">
                    <Skeleton className="h-4 w-[250px]" />
                    <Skeleton className="h-4 w-[200px]" />
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Period</TableHead>
                  <TableHead>Task Type</TableHead>
                  <TableHead>Frequency</TableHead>
                  <TableHead>Total Bookings</TableHead>
                  <TableHead>Completion Rate</TableHead>
                  <TableHead>Customer Satisfaction</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {data?.data?.stats?.map((taskData, index) => (
                  <TableRow key={index}>
                    <TableCell>
                      <div className="flex items-center">
                        {getPeriodIcon(taskData.period)}
                        <span className="ml-2 capitalize">{taskData.period}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className="capitalize">
                        {taskData.task_type}
                      </Badge>
                    </TableCell>
                    <TableCell>{taskData.frequency}</TableCell>
                    <TableCell>{taskData.total_bookings}</TableCell>
                    <TableCell>
                      <Badge className={getCompletionRateColor(taskData.completion_rate)}>
                        {taskData.completion_rate.toFixed(1)}%
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center">
                        <Badge className={getSatisfactionColor(taskData.customer_satisfaction)}>
                          <Star className="h-3 w-3 mr-1" />
                          {taskData.customer_satisfaction.toFixed(1)}
                        </Badge>
                      </div>
                    </TableCell>
                  </TableRow>
                )) || (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8">
                      No periodic tasks analytics data available
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}