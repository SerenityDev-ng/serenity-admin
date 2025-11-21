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
import { useWorkers } from "@/hooks/use-workers";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Plus,
  MoreHorizontal,
  Calendar,
  Clock,
  DollarSign,
  User,
  CheckCircle,
  XCircle,
  Pause,
  Play,
  Loader2,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  useCleaningSubscriptions,
  useUpdateSubscriptionStatus,
  useAssignWorkerToSubscription,
  useCleaningSubscriptionStats,
  useSubscriptionDetails,
} from "@/hooks/use-cleaning-subscriptions";
import {
  CleaningSubscription,
  GetCleaningSubscriptionsParams,
} from "@/services/cleaning-subscriptions";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";

const getStatusColor = (status: string) => {
  switch (status) {
    case "active":
      return "bg-green-100 text-green-800";
    case "paused":
      return "bg-yellow-100 text-yellow-800";
    case "cancelled":
      return "bg-red-100 text-red-800";
    case "completed":
      return "bg-blue-100 text-blue-800";
    default:
      return "bg-gray-100 text-gray-800";
  }
};

const getStatusIcon = (status: string) => {
  switch (status) {
    case "active":
      return <CheckCircle className="h-4 w-4" />;
    case "paused":
      return <Pause className="h-4 w-4" />;
    case "cancelled":
      return <XCircle className="h-4 w-4" />;
    case "completed":
      return <CheckCircle className="h-4 w-4" />;
    default:
      return null;
  }
};

export default function CleaningSubscriptionsPage() {
  const [filters, setFilters] = useState<GetCleaningSubscriptionsParams>({
    page: 1,
    limit: 10,
    status: undefined,
  });
  const [selectedSubscription, setSelectedSubscription] =
    useState<CleaningSubscription | null>(null);
  const [workerId, setWorkerId] = useState<string>("");
  const [isOrderDialogOpen, setIsOrderDialogOpen] = useState(false);
  const [isAssignDialogOpen, setIsAssignDialogOpen] = useState(false);

  const { data: workersData } = useWorkers();
  const workers = workersData?.data.workers;

  const { data, isLoading, error } = useCleaningSubscriptions(filters);
  const { data: statsData, isLoading: statsLoading } =
    useCleaningSubscriptionStats();
  const updateStatusMutation = useUpdateSubscriptionStatus();
  const assignWorkerMutation = useAssignWorkerToSubscription();

  const {
    data: subscriptionDetailsData,
    isPending: subscriptionDetailsLoading,
  } = useSubscriptionDetails(selectedSubscription?._id || "");

  const subscriptionDetails = subscriptionDetailsData?.data.subscription;
  const cleaningAddress = subscriptionDetailsData?.data.cleaning_address;
  const userDetails = subscriptionDetailsData?.data.user;

  const handleStatusChange = (value: string) => {
    const status =
      value === "all"
        ? undefined
        : (value as GetCleaningSubscriptionsParams["status"]);
    setFilters((prev) => ({ ...prev, status, page: 1 }));
  };

  const handlePageChange = (page: number) => {
    setFilters((prev) => ({ ...prev, page }));
  };

  const handleUpdateStatus = async (
    subscriptionId: string,
    newStatus: "active" | "paused" | "cancelled" | "completed"
  ) => {
    try {
      await updateStatusMutation.mutateAsync({
        subscriptionId,
        data: { status: newStatus },
      });
      toast.success(`Subscription status updated to ${newStatus}`);
    } catch (error: any) {
      toast.error(
        "Failed to update subscription status" + " " + error.response.data.error
      );
    }
  };

  const handleAssignWorker = async () => {
    if (!selectedSubscription || !workerId) {
      toast.error("Please fill in all required fields");
      return;
    }

    try {
      await assignWorkerMutation.mutateAsync({
        subscriptionId: selectedSubscription._id,
        data: {
          worker_id: workerId,
          order_ids: [selectedSubscription._id],
        },
      });
      toast.success("Worker assigned successfully");
      setIsAssignDialogOpen(false);
      setSelectedSubscription(null);
      setWorkerId("");
    } catch (error: any) {
      toast.error("Failed to assign worker" + " " + error.response.data.error);
    }
  };

  if (error) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold tracking-tight">
            Cleaning Subscriptions
          </h1>
        </div>
        <Alert variant="destructive">
          <AlertDescription>
            Failed to load cleaning subscriptions. Please try again later.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">
          Cleaning Subscriptions
        </h1>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          Add Subscription
        </Button>
      </div>

      {/* Statistics Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total Subscriptions
            </CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {statsLoading ? (
                <Skeleton className="h-8 w-16" />
              ) : (
                statsData?.data?.total_subscriptions || 0
              )}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Active Subscriptions
            </CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {statsLoading ? (
                <Skeleton className="h-8 w-16" />
              ) : (
                statsData?.data?.active_subscriptions || 0
              )}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {statsLoading ? (
                <Skeleton className="h-8 w-20" />
              ) : (
                `$${(statsData?.data?.total_revenue || 0).toLocaleString()}`
              )}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Monthly Growth
            </CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {statsLoading ? (
                <Skeleton className="h-8 w-16" />
              ) : (
                `${(statsData?.data?.monthly_growth || 0)?.toFixed(1)}%`
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>All Cleaning Subscriptions</CardTitle>
          <CardDescription>
            Manage recurring cleaning service subscriptions
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center space-x-4 mb-6">
            <Select
              value={filters.status || "all"}
              onValueChange={handleStatusChange}
            >
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="paused">Paused</SelectItem>
                <SelectItem value="cancelled">Cancelled</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
              </SelectContent>
            </Select>
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
                    <TableHead>Subscription ID</TableHead>
                    <TableHead>Customer</TableHead>
                    <TableHead>Type & Frequency</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Next Service</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Progress</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {data?.data.subscriptions.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={8} className="text-center py-8">
                        <div className="flex flex-col items-center space-y-2">
                          <Calendar className="h-8 w-8 text-gray-400" />
                          <p className="text-gray-500">
                            No subscriptions found
                          </p>
                          <p className="text-sm text-gray-400">
                            Try adjusting your filters
                          </p>
                        </div>
                      </TableCell>
                    </TableRow>
                  ) : (
                    data?.data.subscriptions?.map((subscription) => (
                      <TableRow key={subscription._id}>
                        <TableCell className="font-medium">
                          #{subscription._id?.slice(-8)}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center space-x-2">
                            <User className="h-4 w-4 text-gray-400" />
                            <span>{subscription.user.email}</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div>
                            <p className="font-medium">
                              {subscription.cleaningHouse}
                            </p>
                            <p className="text-sm text-gray-500">
                              {subscription.frequency}
                            </p>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge
                            className={getStatusColor(
                              subscription.subscription_status
                            )}
                          >
                            <div className="flex items-center space-x-1">
                              {getStatusIcon(subscription.subscription_status)}
                              <span>{subscription.subscription_status}</span>
                            </div>
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center space-x-2">
                            <Calendar className="h-4 w-4 text-gray-400" />
                            <span>
                              {new Date(
                                subscription.subscription.start_date
                              ).toLocaleDateString()}
                            </span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div>
                            <div className="flex items-center space-x-1">
                              <DollarSign className="h-3 w-3 text-gray-400" />
                              <span className="font-medium">
                                ₦{subscription.totalPrice?.toLocaleString()}
                              </span>
                            </div>
                            <p className="text-xs text-gray-500">
                              Base: ₦{subscription.basePrice?.toLocaleString()}
                            </p>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="w-full bg-gray-200 rounded-full h-2">
                            <div
                              className="bg-green-600 h-2 rounded-full"
                              style={{
                                width: `${
                                  (subscription.orders_completed /
                                    subscription.total_orders_generated) *
                                  100
                                }%`,
                              }}
                            ></div>
                          </div>
                          <p className="text-xs text-gray-500 mt-1">
                            {Math.round(subscription.totalPrice)}% complete
                          </p>
                        </TableCell>
                        <TableCell>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" className="h-8 w-8 p-0">
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem
                                onClick={() => {
                                  setSelectedSubscription(subscription);
                                  setIsOrderDialogOpen(true);
                                }}
                              >
                                View Order
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                onClick={() => {
                                  setSelectedSubscription(subscription);
                                  setIsAssignDialogOpen(true);
                                }}
                              >
                                Assign Worker
                              </DropdownMenuItem>
                              {subscription.subscription_status ===
                                "active" && (
                                <DropdownMenuItem
                                  onClick={() =>
                                    handleUpdateStatus(
                                      subscription._id,
                                      "paused"
                                    )
                                  }
                                >
                                  Pause Subscription
                                </DropdownMenuItem>
                              )}
                              {subscription.subscription_status ===
                                "paused" && (
                                <DropdownMenuItem
                                  onClick={() =>
                                    handleUpdateStatus(
                                      subscription._id,
                                      "active"
                                    )
                                  }
                                >
                                  Resume Subscription
                                </DropdownMenuItem>
                              )}
                              <DropdownMenuItem
                                className="text-red-600"
                                onClick={() =>
                                  handleUpdateStatus(
                                    subscription._id,
                                    "cancelled"
                                  )
                                }
                              >
                                Cancel Subscription
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>

              {data?.data.pagination && (
                <div className="flex items-center justify-between mt-6">
                  <p className="text-sm text-gray-500">
                    Page {data.data.pagination.currentPage} of{" "}
                    {data.data.pagination.totalPages}
                  </p>
                  <div className="flex items-center space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handlePageChange(filters.page! - 1)}
                      disabled={!data.data.pagination.hasPrevPage}
                    >
                      Previous
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handlePageChange(filters.page! + 1)}
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

      <Dialog open={isAssignDialogOpen} onOpenChange={setIsAssignDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              Assign Worker to Subscription: {selectedSubscription?._id}
            </DialogTitle>
            <DialogDescription>
              Assign a worker to handle orders for this subscription (Customer:
              {selectedSubscription?.user.email})
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="worker-id" className="text-right">
                Worker ID
              </Label>
              <Select
                onValueChange={(value) => setWorkerId(value)}
                value={workerId}
              >
                <SelectTrigger className="col-span-3">
                  <SelectValue placeholder="Select a worker" />
                </SelectTrigger>
                <SelectContent>
                  {workers?.map((worker) => (
                    <SelectItem key={worker.id} value={worker.id}>
                      {worker.full_name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button
              onClick={handleAssignWorker}
              disabled={assignWorkerMutation.isPending || !selectedSubscription}
            >
              {assignWorkerMutation.isPending ? (
                <Loader2 className="animate-spin" />
              ) : (
                "Assign Worker"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={isOrderDialogOpen} onOpenChange={setIsOrderDialogOpen}>
        <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-[800px]">
          <DialogHeader>
            <DialogTitle>Subscription Details</DialogTitle>
            <DialogDescription>
              View the details of the selected cleaning subscription.
            </DialogDescription>
          </DialogHeader>
          {subscriptionDetailsLoading && <Skeleton className="h-9 w-full" />}
          {selectedSubscription && subscriptionDetails && (
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <p className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                  Subscription ID:
                </p>
                <p className="col-span-3 text-sm">{selectedSubscription._id}</p>
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <p className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                  User Email:
                </p>
                <p className="col-span-3 text-sm">{userDetails?.email}</p>
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <p className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                  Start Date:
                </p>
                <p className="col-span-3 text-sm">
                  {new Date(subscriptionDetails.start_date).toDateString()}
                </p>
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <p className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                  End Date:
                </p>
                <p className="col-span-3 text-sm">
                  {new Date(subscriptionDetails.end_date).toDateString()}
                </p>
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <p className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                  Frequency:
                </p>
                <p className="col-span-3 text-sm">
                  {selectedSubscription.frequency}
                </p>
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <p className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                  Total Price:
                </p>
                <p className="col-span-3 text-sm">
                  {selectedSubscription.totalPrice}
                </p>
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <p className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                  Address:
                </p>
                <p className="col-span-3 text-sm">
                  {cleaningAddress?.address}, {cleaningAddress?.state}
                </p>
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <p className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                  Weekly Schedule:
                </p>
                <div className="col-span-3 text-sm">
                  {subscriptionDetails.weekly_schedule.map((schedule) => (
                    <div key={schedule._id}>
                      <p>{schedule.day}:</p>
                      <ul>
                        {schedule.time_slots.map((slot) => (
                          <li key={slot._id}>
                            {slot.start_time} - {slot.end_time}
                          </li>
                        ))}
                      </ul>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
