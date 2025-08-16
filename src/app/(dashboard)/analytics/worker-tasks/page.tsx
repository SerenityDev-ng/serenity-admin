"use client";

import { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Download,
  Search,
  Calendar,
  TrendingUp,
  Users,
  CheckCircle,
  Star,
} from "lucide-react";
import {
  useWorkerTasksAnalytics,
  useExportWorkerTasksData,
} from "@/hooks/use-analytics";
import { GetWorkerTasksParams } from "@/services/analytics";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { toast } from "sonner";

export default function WorkerTasksAnalyticsPage() {
  const [filters, setFilters] = useState<GetWorkerTasksParams>({
    page: 1,
    limit: 10,
  });
  const [searchWorkerId, setSearchWorkerId] = useState("");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");

  const { data, isLoading, error } = useWorkerTasksAnalytics(filters);
  const exportMutation = useExportWorkerTasksData();

  const handleSearch = () => {
    setFilters((prev) => ({
      ...prev,
      worker_id: searchWorkerId || undefined,
      date_from: dateFrom || undefined,
      date_to: dateTo || undefined,
      page: 1,
    }));
  };

  const handlePageChange = (page: number) => {
    setFilters((prev) => ({ ...prev, page }));
  };

  const handleExport = async () => {
    try {
      const blob = await exportMutation.mutateAsync(filters);
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.style.display = "none";
      a.href = url;
      a.download = `worker-tasks-analytics-${
        new Date().toISOString().split("T")[0]
      }.csv`;
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

  if (error) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold tracking-tight">
            Worker Tasks Analytics
          </h1>
        </div>
        <Alert variant="destructive">
          <AlertDescription>
            Failed to load worker tasks analytics. Please try again later.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">
          Worker Tasks Analytics
        </h1>
        <Button onClick={handleExport} disabled={exportMutation.isPending}>
          <Download className="mr-2 h-4 w-4" />
          {exportMutation.isPending ? "Exporting..." : "Export Data"}
        </Button>
      </div>

      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Workers</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {isLoading ? (
                <Skeleton className="h-8 w-16" />
              ) : (
                data?.data?.summary?.totalWorkers || 0
              )}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Tasks</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {isLoading ? (
                <Skeleton className="h-8 w-16" />
              ) : (
                data?.data?.summary?.totalTasksCompleted || 0
              )}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total Earnings
            </CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {isLoading ? (
                <Skeleton className="h-8 w-20" />
              ) : (
                `$${(
                  data?.data?.workers?.reduce(
                    (sum, worker) => sum + worker.lifetimeEarnings,
                    0
                  ) || 0
                ).toLocaleString()}`
              )}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg Rating</CardTitle>
            <Star className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {isLoading ? (
                <Skeleton className="h-8 w-16" />
              ) : (
                (data?.data?.workers && data.data.workers.length > 0
                  ? data.data.workers.reduce(
                      (sum, worker) => sum + worker.averageRating,
                      0
                    ) / data.data.workers.length
                  : 0
                ).toFixed(1)
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Worker Performance Analytics</CardTitle>
          <CardDescription>
            Detailed analytics for worker task performance and earnings
          </CardDescription>
        </CardHeader>
        <CardContent>
          {/* Filters */}
          <div className="grid gap-4 md:grid-cols-4 mb-6">
            <div className="space-y-2">
              <Label htmlFor="worker-search">Worker ID</Label>
              <Input
                id="worker-search"
                placeholder="Search by worker ID"
                value={searchWorkerId}
                onChange={(e) => setSearchWorkerId(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="date-from">Date From</Label>
              <Input
                id="date-from"
                type="date"
                value={dateFrom}
                onChange={(e) => setDateFrom(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="date-to">Date To</Label>
              <Input
                id="date-to"
                type="date"
                value={dateTo}
                onChange={(e) => setDateTo(e.target.value)}
              />
            </div>
            <div className="flex items-end">
              <Button onClick={handleSearch} className="w-full">
                <Search className="mr-2 h-4 w-4" />
                Search
              </Button>
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
            <>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Worker</TableHead>
                    <TableHead>Total Tasks</TableHead>
                    <TableHead>Completed</TableHead>
                    <TableHead>Pending</TableHead>
                    <TableHead>Completion Rate</TableHead>
                    <TableHead>Total Earnings</TableHead>
                    <TableHead>Avg Rating</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {data?.data?.workers?.map((worker) => (
                    <TableRow key={worker._id}>
                      <TableCell>
                        <div>
                          <div className="font-medium">
                            {worker.full_name}
                          </div>
                          <div className="text-sm text-muted-foreground">
                            ID: {worker._id}
                          </div>
                          <div className="text-sm text-muted-foreground">
                            Skill: {worker.skill}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>{worker.totalJobs}</TableCell>
                      <TableCell>{worker.completedJobs}</TableCell>
                      <TableCell>{worker.totalJobs - worker.completedJobs}</TableCell>
                      <TableCell>
                        <Badge
                          className={getCompletionRateColor(
                            worker.completionRate
                          )}
                        >
                          {worker.completionRate.toFixed(1)}%
                        </Badge>
                      </TableCell>
                      <TableCell>
                        ${worker.lifetimeEarnings.toLocaleString()}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center">
                          <Star className="h-4 w-4 text-yellow-400 mr-1" />
                          {worker.averageRating.toFixed(1)}
                        </div>
                      </TableCell>
                    </TableRow>
                  )) || (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center py-8">
                        No worker analytics data available
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>

              {/* Pagination */}
              {data?.data?.pagination && (
                <div className="flex items-center justify-between mt-4">
                  <div className="text-sm text-muted-foreground">
                    Showing{" "}
                    {(data.data.pagination.currentPage - 1) *
                      data.data.pagination.limit +
                      1}{" "}
                    to{" "}
                    {Math.min(
                      data.data.pagination.currentPage *
                        data.data.pagination.limit,
                      data.data.pagination.totalWorkers
                    )}{" "}
                    of {data.data.pagination.totalWorkers} results
                  </div>
                  <div className="flex items-center space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() =>
                        handlePageChange(data.data.pagination.currentPage - 1)
                      }
                      disabled={!data.data.pagination.hasPrevPage}
                    >
                      Previous
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() =>
                        handlePageChange(data.data.pagination.currentPage + 1)
                      }
                      disabled={!data.data.pagination.hasNextPage}
                    >
                      Next
                    </Button>
                  </div>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
