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
import {
  Plus,
  MoreHorizontal,
  DollarSign,
  User,
  Calendar,
  CheckCircle,
  XCircle,
  Clock,
  AlertCircle,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  useWithdrawalRequests,
  useProcessWithdrawalRequest,
} from "@/hooks/use-withdrawal-requests";
import { GetWithdrawalRequestsParams } from "@/services/withdrawal-requests";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";

const getStatusColor = (status: string) => {
  switch (status) {
    case "pending":
      return "bg-yellow-100 text-yellow-800";
    case "approved":
      return "bg-blue-100 text-blue-800";
    case "processed":
      return "bg-green-100 text-green-800";
    case "rejected":
      return "bg-red-100 text-red-800";
    default:
      return "bg-gray-100 text-gray-800";
  }
};

const getStatusIcon = (status: string) => {
  switch (status) {
    case "pending":
      return <Clock className="h-4 w-4" />;
    case "approved":
      return <CheckCircle className="h-4 w-4" />;
    case "processed":
      return <CheckCircle className="h-4 w-4" />;
    case "rejected":
      return <XCircle className="h-4 w-4" />;
    default:
      return <AlertCircle className="h-4 w-4" />;
  }
};

export default function WithdrawalRequestsPage() {
  const [filters, setFilters] = useState<GetWithdrawalRequestsParams>({
    page: 1,
    limit: 10,
    status: undefined,
    sort_by: "request_date",
    sort_order: "desc",
  });
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedRequest, setSelectedRequest] = useState<string>("");
  const [processAction, setProcessAction] = useState<
    "approve" | "reject" | "process"
  >("approve");
  const [notes, setNotes] = useState("");
  const [rejectionReason, setRejectionReason] = useState("");
  const [isProcessDialogOpen, setIsProcessDialogOpen] = useState(false);

  const { data, isLoading, error } = useWithdrawalRequests(filters);
  const processRequestMutation = useProcessWithdrawalRequest();

  const handleStatusChange = (value: string) => {
    const status =
      value === "all"
        ? undefined
        : (value as GetWithdrawalRequestsParams["status"]);
    setFilters((prev) => ({ ...prev, status, page: 1 }));
  };

  const handleSearch = (value: string) => {
    setSearchTerm(value);
    setFilters((prev) => ({ ...prev, worker_id: value || undefined, page: 1 }));
  };

  const handlePageChange = (page: number) => {
    setFilters((prev) => ({ ...prev, page }));
  };

  const handleProcessRequest = async () => {
    if (!selectedRequest) return;

    try {
      const data: any = { status: processAction };
      if (notes) data.notes = notes;
      if (processAction === "reject" && rejectionReason) {
        data.rejection_reason = rejectionReason;
      }

      await processRequestMutation.mutateAsync({
        requestId: selectedRequest,
        data,
      });

      toast.success(`Request ${processAction}d successfully`);
      setIsProcessDialogOpen(false);
      setSelectedRequest("");
      setNotes("");
      setRejectionReason("");
    } catch (error) {
      toast.error(`Failed to ${processAction} request`);
    }
  };

  const openProcessDialog = (
    requestId: string,
    action: "approve" | "reject" | "process"
  ) => {
    setSelectedRequest(requestId);
    setProcessAction(action);
    setIsProcessDialogOpen(true);
  };

  if (error) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold tracking-tight">
            Withdrawal Requests
          </h1>
        </div>
        <Alert variant="destructive">
          <AlertDescription>
            Failed to load withdrawal requests. Please try again later.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">
          Withdrawal Requests
        </h1>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          New Request
        </Button>
      </div>

      {/* Statistics Cards */}
      {data?.data.summary && (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Total Requests
              </CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {data.data.summary.total_requests}
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Pending Amount
              </CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                ₦{data.data.summary.total_amount_pending.toLocaleString()}
              </div>
              <p className="text-xs text-muted-foreground">
                {data.data.summary.pending_requests} pending requests
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Approved Amount
              </CardTitle>
              <CheckCircle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                ₦{data.data.summary.total_amount_approved.toLocaleString()}
              </div>
              <p className="text-xs text-muted-foreground">
                {data.data.summary.approved_requests} approved requests
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Rejected Requests
              </CardTitle>
              <XCircle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {data.data.summary.rejected_requests}
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      <Card>
        <CardHeader>
          <CardTitle>All Withdrawal Requests</CardTitle>
          <CardDescription>
            Manage worker withdrawal requests and payments
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center space-x-4 mb-6">
            <Input
              placeholder="Search by worker ID..."
              value={searchTerm}
              onChange={(e) => handleSearch(e.target.value)}
              className="max-w-sm"
            />
            <Select
              value={filters.status || "all"}
              onValueChange={handleStatusChange}
            >
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="approved">Approved</SelectItem>
                <SelectItem value="processed">Processed</SelectItem>
                <SelectItem value="rejected">Rejected</SelectItem>
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
                    <TableHead>Request ID</TableHead>
                    <TableHead>Worker</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Request Date</TableHead>
                    <TableHead>Bank Details</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {data?.data.withdrawal_requests.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center py-8">
                        <div className="flex flex-col items-center space-y-2">
                          <DollarSign className="h-8 w-8 text-gray-400" />
                          <p className="text-gray-500">
                            No withdrawal requests found
                          </p>
                          <p className="text-sm text-gray-400">
                            Try adjusting your filters
                          </p>
                        </div>
                      </TableCell>
                    </TableRow>
                  ) : (
                    data?.data.withdrawal_requests.map((request) => (
                      <TableRow key={request.id}>
                        <TableCell className="font-medium">
                          #{request.id.slice(-8)}
                        </TableCell>
                        <TableCell>
                          <div>
                            <div className="flex items-center space-x-2">
                              <User className="h-4 w-4 text-gray-400" />
                              <span className="font-medium">
                                {request.worker_name || request.worker_id}
                              </span>
                            </div>
                            {request.worker_email && (
                              <p className="text-sm text-gray-500">
                                {request.worker_email}
                              </p>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center space-x-1">
                            <DollarSign className="h-4 w-4 text-gray-400" />
                            <span className="font-medium">
                              ${request.amount.toFixed(2)}
                            </span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge className={getStatusColor(request.status)}>
                            <div className="flex items-center space-x-1">
                              {getStatusIcon(request.status)}
                              <span>{request.status}</span>
                            </div>
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center space-x-2">
                            <Calendar className="h-4 w-4 text-gray-400" />
                            <span>
                              {new Date(
                                request.request_date
                              ).toLocaleDateString()}
                            </span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="text-sm">
                            <p className="font-medium">
                              {request.bank_details.bank_name}
                            </p>
                            <p className="text-gray-500">
                              ****
                              {request.bank_details.account_number.slice(-4)}
                            </p>
                            <p className="text-gray-500">
                              {request.bank_details.account_holder_name}
                            </p>
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
                              {request.status === "pending" && (
                                <>
                                  <DropdownMenuItem
                                    onClick={() =>
                                      openProcessDialog(request.id, "approve")
                                    }
                                  >
                                    Approve Request
                                  </DropdownMenuItem>
                                  <DropdownMenuItem
                                    className="text-red-600"
                                    onClick={() =>
                                      openProcessDialog(request.id, "reject")
                                    }
                                  >
                                    Reject Request
                                  </DropdownMenuItem>
                                </>
                              )}
                              {request.status === "approved" && (
                                <DropdownMenuItem
                                  onClick={() =>
                                    openProcessDialog(request.id, "process")
                                  }
                                >
                                  Mark as Processed
                                </DropdownMenuItem>
                              )}
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

      <Dialog open={isProcessDialogOpen} onOpenChange={setIsProcessDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {processAction === "approve" && "Approve Withdrawal Request"}
              {processAction === "reject" && "Reject Withdrawal Request"}
              {processAction === "process" && "Mark as Processed"}
            </DialogTitle>
            <DialogDescription>
              {processAction === "approve" &&
                "This will approve the withdrawal request for processing."}
              {processAction === "reject" &&
                "This will reject the withdrawal request. Please provide a reason."}
              {processAction === "process" &&
                "This will mark the withdrawal as completed and paid."}
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            {processAction === "reject" && (
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="rejection-reason" className="text-right">
                  Reason
                </Label>
                <Textarea
                  id="rejection-reason"
                  value={rejectionReason}
                  onChange={(e) => setRejectionReason(e.target.value)}
                  className="col-span-3"
                  placeholder="Enter rejection reason..."
                  required
                />
              </div>
            )}
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="notes" className="text-right">
                Notes
              </Label>
              <Textarea
                id="notes"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="col-span-3"
                placeholder="Add any additional notes..."
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              onClick={handleProcessRequest}
              disabled={
                processRequestMutation.isPending ||
                (processAction === "reject" && !rejectionReason)
              }
              variant={processAction === "reject" ? "destructive" : "default"}
            >
              {processRequestMutation.isPending
                ? "Processing..."
                : processAction === "approve"
                ? "Approve"
                : processAction === "reject"
                ? "Reject"
                : "Mark as Processed"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
