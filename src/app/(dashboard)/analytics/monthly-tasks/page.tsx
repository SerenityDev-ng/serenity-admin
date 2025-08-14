"use client";

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Download, Calendar, TrendingUp, DollarSign, BarChart3, ArrowUpIcon, ArrowDownIcon } from "lucide-react";
import { useMonthlyTasksAnalytics, useExportMonthlyTasksData } from "@/hooks/use-analytics";
import { GetMonthlyTasksParams } from "@/services/analytics";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { toast } from "sonner";

export default function MonthlyTasksAnalyticsPage() {
  const [filters, setFilters] = useState<GetMonthlyTasksParams>({
    year: new Date().getFullYear(),
    months: 12,
  });

  const { data, isLoading, error } = useMonthlyTasksAnalytics(filters);
  const exportMutation = useExportMonthlyTasksData();

  const handleYearChange = (year: string) => {
    setFilters(prev => ({ ...prev, year: parseInt(year) }));
  };

  const handleMonthsChange = (months: string) => {
    setFilters(prev => ({ ...prev, months: parseInt(months) }));
  };

  const handleExport = async () => {
    try {
      const blob = await exportMutation.mutateAsync(filters);
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.style.display = 'none';
      a.href = url;
      a.download = `monthly-tasks-analytics-${filters.year}.csv`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      toast.success("Analytics data exported successfully");
    } catch (error) {
      toast.error("Failed to export analytics data");
    }
  };

  const getGrowthIcon = (rate: number) => {
    if (rate > 0) return <ArrowUpIcon className="h-4 w-4 text-green-600" />;
    if (rate < 0) return <ArrowDownIcon className="h-4 w-4 text-red-600" />;
    return null;
  };

  const getGrowthColor = (rate: number) => {
    if (rate > 0) return "text-green-600";
    if (rate < 0) return "text-red-600";
    return "text-gray-600";
  };

  if (error) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold tracking-tight">Monthly Tasks Analytics</h1>
        </div>
        <Alert variant="destructive">
          <AlertDescription>
            Failed to load monthly tasks analytics. Please try again later.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">Monthly Tasks Analytics</h1>
        <Button onClick={handleExport} disabled={exportMutation.isPending}>
          <Download className="mr-2 h-4 w-4" />
          {exportMutation.isPending ? "Exporting..." : "Export Data"}
        </Button>
      </div>

      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {isLoading ? (
                <Skeleton className="h-8 w-20" />
              ) : (
                `$${(data?.data?.summary?.total_revenue || 0).toLocaleString()}`
              )}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Tasks</CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {isLoading ? (
                <Skeleton className="h-8 w-16" />
              ) : (
                data?.data?.summary?.total_tasks || 0
              )}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Average Growth</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold flex items-center">
              {isLoading ? (
                <Skeleton className="h-8 w-16" />
              ) : (
                <>
                  <span className={getGrowthColor(data?.data?.summary?.average_growth || 0)}>
                    {(data?.data?.summary?.average_growth || 0).toFixed(1)}%
                  </span>
                  {getGrowthIcon(data?.data?.summary?.average_growth || 0)}
                </>
              )}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg Task Value</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {isLoading ? (
                <Skeleton className="h-8 w-16" />
              ) : (
                `$${((data?.data?.summary?.total_revenue || 0) / (data?.data?.summary?.total_tasks || 1)).toFixed(2)}`
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Monthly Performance Trends</CardTitle>
          <CardDescription>
            Track monthly task completion and revenue trends
          </CardDescription>
        </CardHeader>
        <CardContent>
          {/* Filters */}
          <div className="grid gap-4 md:grid-cols-2 mb-6">
            <div className="space-y-2">
              <Label htmlFor="year-select">Year</Label>
              <Select value={filters.year?.toString()} onValueChange={handleYearChange}>
                <SelectTrigger>
                  <SelectValue placeholder="Select year" />
                </SelectTrigger>
                <SelectContent>
                  {Array.from({ length: 5 }, (_, i) => {
                    const year = new Date().getFullYear() - i;
                    return (
                      <SelectItem key={year} value={year.toString()}>
                        {year}
                      </SelectItem>
                    );
                  })}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="months-select">Number of Months</Label>
              <Select value={filters.months?.toString()} onValueChange={handleMonthsChange}>
                <SelectTrigger>
                  <SelectValue placeholder="Select months" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="3">Last 3 months</SelectItem>
                  <SelectItem value="6">Last 6 months</SelectItem>
                  <SelectItem value="12">Last 12 months</SelectItem>
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
                  <TableHead>Month</TableHead>
                  <TableHead>Total Tasks</TableHead>
                  <TableHead>Completed Tasks</TableHead>
                  <TableHead>Total Revenue</TableHead>
                  <TableHead>Avg Task Value</TableHead>
                  <TableHead>Growth Rate</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {data?.data?.stats?.map((monthData) => (
                  <TableRow key={`${monthData.year}-${monthData.month}`}>
                    <TableCell>
                      <div className="font-medium">
                        {monthData.month} {monthData.year}
                      </div>
                    </TableCell>
                    <TableCell>{monthData.total_tasks}</TableCell>
                    <TableCell>{monthData.completed_tasks}</TableCell>
                    <TableCell>${monthData.total_revenue.toLocaleString()}</TableCell>
                    <TableCell>${monthData.average_task_value.toFixed(2)}</TableCell>
                    <TableCell>
                      <div className={`flex items-center ${getGrowthColor(monthData.growth_rate)}`}>
                        {getGrowthIcon(monthData.growth_rate)}
                        <span className="ml-1">{monthData.growth_rate.toFixed(1)}%</span>
                      </div>
                    </TableCell>
                  </TableRow>
                )) || (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8">
                      No monthly analytics data available
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