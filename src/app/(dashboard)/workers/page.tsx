"use client";

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
import { Input } from "@/components/ui/input";
import { Search, Plus, MoreHorizontal, Star } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  useWorkers,
  useAssignedJobs,
  useCurrentJob,
  useJobHistory,
} from "@/hooks/use-workers";
import { Skeleton } from "@/components/ui/skeleton";
import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function WorkersPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [filters, setFilters] = useState({
    page: 1,
    limit: 10,
    search: "",
  });

  const { data: workersData, isLoading, error } = useWorkers(filters);
  const { data: assignedJobsData, isLoading: isLoadingJobs } = useAssignedJobs({
    page: 1,
    limit: 5,
  });
  const { data: currentJobData } = useCurrentJob();
  const { data: jobHistoryData } = useJobHistory({ page: 1, limit: 5 });

  const workers = workersData?.data?.workers || [];
  const assignedJobs = assignedJobsData?.data?.assigned_jobs || [];
  const totalAssignedJobs = assignedJobsData?.data?.summary?.total_jobs || 0;
  const currentJob = currentJobData?.data?.current_job;
  const jobHistory = jobHistoryData?.data?.job_history || [];
  const totalCompletedJobs = jobHistoryData?.data?.summary?.total_jobs || 0;

  const getStatusColor = (
    isAvailable: boolean,
    isAssigned: boolean,
    isActive: boolean
  ) => {
    if (!isActive) return "secondary";
    if (isAssigned) return "destructive";
    if (isAvailable) return "default";
    return "secondary";
  };

  const getStatusText = (
    isAvailable: boolean,
    isAssigned: boolean,
    isActive: boolean
  ) => {
    if (!isActive) return "Offline";
    if (isAssigned) return "Busy";
    if (isAvailable) return "Available";
    return "Unavailable";
  };

  const handleSearch = (value: string) => {
    setSearchTerm(value);
    setFilters((prev) => ({ ...prev, search: value, page: 1 }));
  };

  const availableWorkers = workers.filter((w) => w.isAvailable && w.isActive);
  const busyWorkers = workers.filter((w) => w.isAssigned && w.isActive);
  const avgRating =
    workers.length > 0
      ? workers.reduce((acc, w) => acc + w.rating, 0) / workers.length
      : 0;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Workers</h1>
          <p className="text-muted-foreground">
            Manage all cleaning service workers and their assignments.
          </p>
        </div>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          Add Worker
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Workers</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {isLoading ? <Skeleton className="h-8 w-16" /> : workers.length}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Registered workers
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Available</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {isLoading ? (
                <Skeleton className="h-8 w-16" />
              ) : (
                availableWorkers.length
              )}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Ready for assignments
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Active Jobs</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">
              {isLoadingJobs ? (
                <Skeleton className="h-8 w-16" />
              ) : (
                totalAssignedJobs
              )}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Currently assigned
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">
              Completed Jobs
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-600">
              {isLoadingJobs ? (
                <Skeleton className="h-8 w-16" />
              ) : (
                totalCompletedJobs
              )}
            </div>
            <p className="text-xs text-muted-foreground mt-1">Total finished</p>
          </CardContent>
        </Card>
      </div>

      {/* Current Job Alert */}
      {currentJob && (
        <Card className="border-blue-200 bg-blue-50">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-blue-800">
              Current Active Job
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-blue-900">
                  {currentJob.job_type}
                </p>
                <p className="text-sm text-blue-700">
                  {currentJob.customer_details?.name || "Customer"} •{" "}
                  {currentJob.job_address?.address || "Location"}
                </p>
                <p className="text-xs text-blue-600 mt-1">
                  Scheduled:{" "}
                  {new Date(currentJob.scheduled_date).toLocaleString()}
                </p>
              </div>
              <Badge className="bg-blue-100 text-blue-800 border-blue-200">
                {currentJob.booking_status}
              </Badge>
            </div>
          </CardContent>
        </Card>
      )}

      <Tabs defaultValue="workers" className="space-y-4">
        <TabsList>
          <TabsTrigger value="workers">All Workers</TabsTrigger>
          <TabsTrigger value="assigned-jobs">Assigned Jobs</TabsTrigger>
          <TabsTrigger value="job-history">Job History</TabsTrigger>
        </TabsList>

        <TabsContent value="workers">
          <Card>
            <CardHeader>
              <CardTitle>All Workers</CardTitle>
              <CardDescription>
                A list of all registered cleaning service workers.
              </CardDescription>
              <div className="flex items-center space-x-2">
                <div className="relative flex-1 max-w-sm">
                  <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search workers..."
                    className="pl-8"
                    value={searchTerm}
                    onChange={(e) => handleSearch(e.target.value)}
                  />
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Contact</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Rating</TableHead>
                    <TableHead>Completed Jobs</TableHead>
                    <TableHead>Skill</TableHead>
                    <TableHead className="w-[50px]"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {isLoading ? (
                    [...Array(5)].map((_, i) => (
                      <TableRow key={i}>
                        <TableCell>
                          <div className="space-y-2">
                            <Skeleton className="h-4 w-[200px]" />
                            <Skeleton className="h-3 w-[150px]" />
                          </div>
                        </TableCell>
                        <TableCell>
                          <Skeleton className="h-4 w-[120px]" />
                        </TableCell>
                        <TableCell>
                          <Skeleton className="h-6 w-[80px]" />
                        </TableCell>
                        <TableCell>
                          <Skeleton className="h-4 w-[60px]" />
                        </TableCell>
                        <TableCell>
                          <Skeleton className="h-4 w-[40px]" />
                        </TableCell>
                        <TableCell>
                          <Skeleton className="h-6 w-[100px]" />
                        </TableCell>
                        <TableCell>
                          <Skeleton className="h-8 w-8" />
                        </TableCell>
                      </TableRow>
                    ))
                  ) : workers.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center py-8">
                        <div className="text-muted-foreground">
                          {error ? "Error loading workers" : "No workers found"}
                        </div>
                      </TableCell>
                    </TableRow>
                  ) : (
                    workers.map((worker) => (
                      <TableRow key={worker.id}>
                        <TableCell>
                          <div>
                            <div className="font-medium">
                              {worker.full_name}
                            </div>
                            <div className="text-sm text-muted-foreground">
                              {worker.email}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>{worker.phone_number}</TableCell>
                        <TableCell>
                          <Badge
                            variant={getStatusColor(
                              worker.isAvailable,
                              worker.isAssigned,
                              worker.isActive
                            )}
                          >
                            {getStatusText(
                              worker.isAvailable,
                              worker.isAssigned,
                              worker.isActive
                            )}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center space-x-1">
                            <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                            <span>{worker.rating.toFixed(1)}</span>
                          </div>
                        </TableCell>
                        <TableCell>{worker.completedJobs}</TableCell>
                        <TableCell>
                          <Badge variant="outline" className="text-xs">
                            {worker.skill}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" className="h-8 w-8 p-0">
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem>View Profile</DropdownMenuItem>
                              <DropdownMenuItem>Edit Worker</DropdownMenuItem>
                              <DropdownMenuItem>View Jobs</DropdownMenuItem>
                              <DropdownMenuItem>Assign Job</DropdownMenuItem>
                              <DropdownMenuItem className="text-red-600">
                                {worker.isActive
                                  ? "Deactivate Worker"
                                  : "Activate Worker"}
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="assigned-jobs">
          <Card>
            <CardHeader>
              <CardTitle>Assigned Jobs</CardTitle>
              <CardDescription>
                Currently active job assignments for workers.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Job Title</TableHead>
                    <TableHead>Client</TableHead>
                    <TableHead>Worker</TableHead>
                    <TableHead>Location</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Start Time</TableHead>
                    <TableHead>Type</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {isLoadingJobs ? (
                    [...Array(3)].map((_, i) => (
                      <TableRow key={i}>
                        <TableCell>
                          <Skeleton className="h-4 w-[150px]" />
                        </TableCell>
                        <TableCell>
                          <Skeleton className="h-4 w-[120px]" />
                        </TableCell>
                        <TableCell>
                          <Skeleton className="h-4 w-[100px]" />
                        </TableCell>
                        <TableCell>
                          <Skeleton className="h-4 w-[140px]" />
                        </TableCell>
                        <TableCell>
                          <Skeleton className="h-6 w-[80px]" />
                        </TableCell>
                        <TableCell>
                          <Skeleton className="h-4 w-[100px]" />
                        </TableCell>
                        <TableCell>
                          <Skeleton className="h-6 w-[90px]" />
                        </TableCell>
                      </TableRow>
                    ))
                  ) : assignedJobs.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center py-8">
                        <div className="text-muted-foreground">
                          No assigned jobs found
                        </div>
                      </TableCell>
                    </TableRow>
                  ) : (
                    assignedJobs.map((job) => (
                      <TableRow key={job._id}>
                        <TableCell className="font-medium">
                          {job.job_type}
                        </TableCell>
                        <TableCell>
                          {job.customer_details?.name || "N/A"}
                        </TableCell>
                        <TableCell>Worker</TableCell>
                        <TableCell>
                          {job.job_address?.address || "N/A"}
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant={
                              job.booking_status === "in_progress"
                                ? "default"
                                : "secondary"
                            }
                          >
                            {job.booking_status.replace("_", " ")}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          {new Date(job.scheduled_date).toLocaleString()}
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline">{job.job_type}</Badge>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="job-history">
          <Card>
            <CardHeader>
              <CardTitle>Job History</CardTitle>
              <CardDescription>
                Completed job history and performance records.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Job Title</TableHead>
                    <TableHead>Client</TableHead>
                    <TableHead>Worker</TableHead>
                    <TableHead>Completed Date</TableHead>
                    <TableHead>Duration</TableHead>
                    <TableHead>Rating</TableHead>
                    <TableHead>Type</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {isLoadingJobs ? (
                    [...Array(3)].map((_, i) => (
                      <TableRow key={i}>
                        <TableCell>
                          <Skeleton className="h-4 w-[150px]" />
                        </TableCell>
                        <TableCell>
                          <Skeleton className="h-4 w-[120px]" />
                        </TableCell>
                        <TableCell>
                          <Skeleton className="h-4 w-[100px]" />
                        </TableCell>
                        <TableCell>
                          <Skeleton className="h-4 w-[100px]" />
                        </TableCell>
                        <TableCell>
                          <Skeleton className="h-4 w-[80px]" />
                        </TableCell>
                        <TableCell>
                          <Skeleton className="h-4 w-[60px]" />
                        </TableCell>
                        <TableCell>
                          <Skeleton className="h-6 w-[90px]" />
                        </TableCell>
                      </TableRow>
                    ))
                  ) : jobHistory.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center py-8">
                        <div className="text-muted-foreground">
                          No job history found
                        </div>
                      </TableCell>
                    </TableRow>
                  ) : (
                    jobHistory.map((job) => (
                      <TableRow key={job._id}>
                        <TableCell className="font-medium">
                          {job.job_type}
                        </TableCell>
                        <TableCell>
                          {job.customer_details?.name || "N/A"}
                        </TableCell>
                        <TableCell>Worker</TableCell>
                        <TableCell>
                          {new Date(job.scheduled_date).toLocaleDateString()}
                        </TableCell>
                        <TableCell>N/A</TableCell>
                        <TableCell>N/A</TableCell>
                        <TableCell>
                          <Badge variant="outline">{job.job_type}</Badge>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
