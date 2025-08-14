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
import { GetBookingsParams } from "@/services/bookings";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription } from "@/components/ui/alert";

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
                          {booking.cleaning_time.map((time, index) => (
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
                              <DropdownMenuItem>Assign Worker</DropdownMenuItem>
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
    </div>
  );
}
