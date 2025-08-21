"use client";

import { useMemo, useState, useEffect } from "react";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Search,
  Plus,
  MoreHorizontal,
  Calendar,
  Clock,
  MapPin,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useBookings } from "@/hooks/use-bookings";
import type { GetBookingsParams, Booking } from "@/services/bookings";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { useWorkers } from "@/hooks/use-workers";
import { useAssignWorkerToCleaningBooking, useAssignWorkerToLaundryBooking, useAssignWorkerToRepairBooking } from "@/hooks/use-bookings";

const getStatusColor = (status: string) => {
  switch (status) {
    case "PENDING":
      return "bg-yellow-100 text-yellow-800";
    case "PAID":
      return "bg-blue-100 text-blue-800";
    case "ASSIGNED":
      return "bg-purple-100 text-purple-800";
    case "ONGOING":
      return "bg-orange-100 text-orange-800";
    case "DONE":
      return "bg-green-100 text-green-800";
    case "CANCELLED":
      return "bg-red-100 text-red-800";
    default:
      return "bg-gray-100 text-gray-800";
  }
};

const getFrequencyColor = (frequency: string) => {
  switch (frequency) {
    case "once":
      return "bg-blue-100 text-blue-800";
    case "weekly":
      return "bg-green-100 text-green-800";
    case "twice_a_week":
      return "bg-purple-100 text-purple-800";
    case "monthly":
      return "bg-orange-100 text-orange-800";
    default:
      return "bg-gray-100 text-gray-800";
  }
};

export default function BookingsPage() {
  const [filters, setFilters] = useState<GetBookingsParams>({
    booking_type: "cleaning",
    page: 1,
    limit: 10,
    search: "",
    booking_status: undefined,
    frequency: undefined,
    subscription_order: undefined,
  });

  const { data, isLoading, error } = useBookings(filters);

  const [assignOpen, setAssignOpen] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
  const [workerSearch, setWorkerSearch] = useState("");
  const [selectedWorkerId, setSelectedWorkerId] = useState<string>("");
  const [assignmentDate, setAssignmentDate] = useState<string>("");
  const [startTime, setStartTime] = useState<string>("");
  const [endTime, setEndTime] = useState<string>("");

  const { data: workersData, isLoading: isLoadingWorkers } = useWorkers({
    page: 1,
    limit: 50,
    search: workerSearch,
    // align worker skill with current booking type for relevance
    skill: filters.booking_type,
    isAvailable: true,
    isActive: true,
  });

  const workers = workersData?.data?.workers || [];

  const assignCleaning = useAssignWorkerToCleaningBooking();
  const assignLaundry = useAssignWorkerToLaundryBooking();
  const assignRepair = useAssignWorkerToRepairBooking();

  const isAssigning = assignCleaning.isPending || assignLaundry.isPending || assignRepair.isPending;

  const handleSearch = (value: string) => {
    setFilters((prev) => ({ ...prev, search: value, page: 1 }));
  };

  const handleFrequencyChange = (value: string) => {
    const frequency = value === "all" ? undefined : value;
    setFilters((prev) => ({ ...prev, frequency, page: 1 }));
  };

  const handleSubscriptionChange = (value: string) => {
    const subscription_order = value === "all" ? undefined : value === "true";
    setFilters((prev) => ({ ...prev, subscription_order, page: 1 }));
  };

  const handleStatusChange = (value: string) => {
    const status =
      value === "all"
        ? undefined
        : (value as GetBookingsParams["booking_status"]);
    setFilters((prev) => ({ ...prev, booking_status: status, page: 1 }));
  };

  const handlePageChange = (page: number) => {
    setFilters((prev) => ({ ...prev, page }));
  };

  const openAssignDialog = (booking: Booking) => {
    setSelectedBooking(booking);
    // Prefill from first scheduled time when possible
    const first = booking.cleaning_time?.[0];
    if (first) {
      const openDate = new Date(first.opening_time);
      const closeDate = new Date(first.closing_time);
      const toDateInput = (d: Date) => d.toISOString().slice(0, 10);
      const toTimeInput = (d: Date) =>
        `${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`;
      setAssignmentDate(toDateInput(openDate));
      setStartTime(toTimeInput(openDate));
      setEndTime(toTimeInput(closeDate));
    } else {
      // Fallback to today
      const now = new Date();
      const toDateInput = (d: Date) => d.toISOString().slice(0, 10);
      const toTimeInput = (d: Date) =>
        `${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`;
      setAssignmentDate(toDateInput(now));
      setStartTime(toTimeInput(now));
      setEndTime(toTimeInput(new Date(now.getTime() + 60 * 60 * 1000))); // +1h
    }
    setSelectedWorkerId("");
    setWorkerSearch("");
    setAssignOpen(true);
  };

  const resetAssignState = () => {
    setAssignOpen(false);
    setSelectedBooking(null);
    setSelectedWorkerId("");
    setWorkerSearch("");
    setAssignmentDate("");
    setStartTime("");
    setEndTime("");
  };

  const handleAssign = async () => {
    if (!selectedBooking) return;
    if (!selectedWorkerId || !assignmentDate || !startTime || !endTime) {
      toast.error("Please fill all assignment fields");
      return;
    }
    // Basic time validation
    const [sh, sm] = startTime.split(":").map(Number);
    const [eh, em] = endTime.split(":").map(Number);
    if (eh * 60 + em <= sh * 60 + sm) {
      toast.error("End time must be after start time");
      return;
    }

    const payload = {
      worker_id: selectedWorkerId,
      assignment_date: assignmentDate,
      assignment_time: {
        start_time: startTime,
        end_time: endTime,
      },
    };

    try {
      const type = filters.booking_type;
      if (type === "cleaning") {
        await assignCleaning.mutateAsync({ bookingId: selectedBooking._id, data: payload });
      } else if (type === "laundry") {
        await assignLaundry.mutateAsync({ bookingId: selectedBooking._id, data: payload });
      } else {
        await assignRepair.mutateAsync({ bookingId: selectedBooking._id, data: payload });
      }
      toast.success("Worker assigned successfully");
      resetAssignState();
    } catch (err: any) {
      const msg = err?.response?.data?.message || err?.message || "Failed to assign worker";
      toast.error(msg);
    }
  };

  if (error) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold tracking-tight">Bookings</h1>
        </div>
        <Alert variant="destructive">
          <AlertDescription>
            Failed to load bookings. Please try again later.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">Bookings</h1>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          Add Booking
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>All Bookings</CardTitle>
          <CardDescription>
            Manage and track all service bookings
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center space-x-4 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="Search by customer name, email, or phone..."
                value={filters.search}
                onChange={(e) => handleSearch(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select
              value={filters.frequency || "all"}
              onValueChange={handleFrequencyChange}
            >
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Frequency" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Frequencies</SelectItem>
                <SelectItem value="once">Once</SelectItem>
                <SelectItem value="weekly">Weekly</SelectItem>
                <SelectItem value="twice_a_week">Twice a Week</SelectItem>
                <SelectItem value="monthly">Monthly</SelectItem>
              </SelectContent>
            </Select>
            <Select
              value={filters.subscription_order === undefined ? "all" : filters.subscription_order.toString()}
              onValueChange={handleSubscriptionChange}
            >
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="true">Subscription</SelectItem>
                <SelectItem value="false">One-time</SelectItem>
              </SelectContent>
            </Select>
            <Select
              value={filters.booking_status || "all"}
              onValueChange={handleStatusChange}
            >
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="PENDING">Pending</SelectItem>
                <SelectItem value="PAID">Paid</SelectItem>
                <SelectItem value="ASSIGNED">Assigned</SelectItem>
                <SelectItem value="ONGOING">Ongoing</SelectItem>
                <SelectItem value="DONE">Done</SelectItem>
                <SelectItem value="CANCELLED">Cancelled</SelectItem>
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
                    <TableHead>Booking ID</TableHead>
                    <TableHead>Customer</TableHead>
                    <TableHead>Frequency</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Service Time</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Location</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {data?.data.bookings.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={8} className="text-center py-8">
                        <div className="flex flex-col items-center space-y-2">
                          <Calendar className="h-8 w-8 text-gray-400" />
                          <p className="text-gray-500">No bookings found</p>
                          <p className="text-sm text-gray-400">
                            Try adjusting your search or filters
                          </p>
                        </div>
                      </TableCell>
                    </TableRow>
                  ) : (
                    data?.data.bookings.map((booking) => (
                      <TableRow key={booking._id}>
                        <TableCell className="font-medium">
                          #{booking._id?.slice(-8)}
                        </TableCell>
                        <TableCell>
                          <div>
                            <p className="font-medium">
                              {booking.user.first_name} {booking.user.last_name}
                            </p>
                            <p className="text-sm text-gray-500">{booking.user.email}</p>
                            <p className="text-sm text-gray-500">{booking.user.phone_number}</p>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge className={getFrequencyColor(booking.frequency)}>
                            {booking.frequency.replace('_', ' ')}
                          </Badge>
                          {booking.subscription_order && (
                            <Badge variant="outline" className="ml-1 text-xs">
                              Subscription
                            </Badge>
                          )}
                        </TableCell>
                        <TableCell>
                          <Badge
                            className={getStatusColor(booking.booking_status)}
                          >
                            {booking.booking_status}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          {booking.cleaning_time.map((time) => (
                            <div key={time._id} className="mb-1">
                              <div className="flex items-center space-x-2">
                                <Calendar className="h-4 w-4 text-gray-400" />
                                <span className="text-sm">
                                  {new Date(time.opening_time).toLocaleDateString()}
                                </span>
                              </div>
                              <div className="flex items-center space-x-2 text-sm text-gray-500">
                                <Clock className="h-3 w-3" />
                                <span>
                                  {new Date(time.opening_time).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})} - 
                                  {new Date(time.closing_time).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                                </span>
                              </div>
                            </div>
                          ))}
                        </TableCell>
                        <TableCell>
                          <span className="font-medium">
                            ₦{parseInt(booking.total_amount).toLocaleString()}
                          </span>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center space-x-1">
                            <MapPin className="h-4 w-4 text-gray-400" />
                            <div className="text-sm">
                              <p>{booking.cleaning_address.address}</p>
                              <p className="text-gray-500">{booking.cleaning_address.state}</p>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" className="h-8 w-8 p-0">
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem>View Details</DropdownMenuItem>
                              <DropdownMenuItem>Edit Booking</DropdownMenuItem>
                              <DropdownMenuItem onClick={() => openAssignDialog(booking)}>Assign Worker</DropdownMenuItem>
                              <DropdownMenuItem className="text-red-600">
                                Cancel Booking
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

      <Dialog open={assignOpen} onOpenChange={(o) => { if (!o) resetAssignState(); }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Assign Worker</DialogTitle>
            <DialogDescription>
              Assign a worker to this {filters.booking_type} booking. Ensure the worker is available and skilled for the task.
            </DialogDescription>
          </DialogHeader>

          {selectedBooking && (
            <div className="space-y-4">
              <div className="rounded-md border p-3 text-sm">
                <div className="font-medium">Booking #{selectedBooking._id.slice(-8)}</div>
                <div className="text-muted-foreground">
                  {selectedBooking.user.first_name} {selectedBooking.user.last_name} • {selectedBooking.user.email}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="md:col-span-2">
                  <Label htmlFor="worker-search">Search worker</Label>
                  <div className="mt-1">
                    <Input
                      id="worker-search"
                      placeholder="Search by name, email, or phone"
                      value={workerSearch}
                      onChange={(e) => setWorkerSearch(e.target.value)}
                    />
                  </div>
                </div>

                <div className="md:col-span-2">
                  <Label>Select worker</Label>
                  <Select value={selectedWorkerId} onValueChange={setSelectedWorkerId}>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder={isLoadingWorkers ? "Loading workers..." : "Choose a worker"} />
                    </SelectTrigger>
                    <SelectContent>
                      {workers.length === 0 ? (
                        <SelectItem disabled value="">{isLoadingWorkers ? "Loading..." : "No workers found"}</SelectItem>
                      ) : (
                        workers.map((w) => (
                          <SelectItem key={w.id} value={w.id}>
                            {w.full_name} • {w.skill} {w.isAvailable ? "(Available)" : ""}
                          </SelectItem>
                        ))
                      )}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="assignment-date">Assignment date</Label>
                  <Input
                    id="assignment-date"
                    type="date"
                    value={assignmentDate}
                    onChange={(e) => setAssignmentDate(e.target.value)}
                  />
                </div>
                <div>
                  <Label htmlFor="start-time">Start time</Label>
                  <Input
                    id="start-time"
                    type="time"
                    value={startTime}
                    onChange={(e) => setStartTime(e.target.value)}
                  />
                </div>
                <div>
                  <Label htmlFor="end-time">End time</Label>
                  <Input
                    id="end-time"
                    type="time"
                    value={endTime}
                    onChange={(e) => setEndTime(e.target.value)}
                  />
                </div>
              </div>

              <DialogFooter>
                <Button variant="outline" onClick={resetAssignState} disabled={isAssigning}>
                  Cancel
                </Button>
                <Button onClick={handleAssign} disabled={isAssigning || !selectedWorkerId}>
                  {isAssigning ? "Assigning..." : "Assign Worker"}
                </Button>
              </DialogFooter>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
