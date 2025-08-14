"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Loader2,
  Search,
  Users,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { useUsers } from "@/hooks/use-users";
import { User } from "@/services/users";

export default function UsersPage() {
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [search, setSearch] = useState("");
  const [isVerified, setIsVerified] = useState<boolean | undefined>(undefined);
  const [searchInput, setSearchInput] = useState("");

  const { data, isLoading, error, refetch } = useUsers({
    page,
    limit,
    search,
    isVerified,
  });

  const handleSearch = () => {
    setSearch(searchInput);
    setPage(1); // Reset to first page when searching
  };

  const handleVerificationFilter = (value: string) => {
    if (value === "all") {
      setIsVerified(undefined);
    } else {
      setIsVerified(value === "verified");
    }
    setPage(1); // Reset to first page when filtering
  };

  const handlePageChange = (newPage: number) => {
    setPage(newPage);
  };

  const handleLimitChange = (newLimit: string) => {
    setLimit(parseInt(newLimit));
    setPage(1); // Reset to first page when changing limit
  };

  if (error) {
    return (
      <div className="container mx-auto py-6">
        <Card>
          <CardContent className="pt-6">
            <div className="text-center text-red-600">
              <Button onClick={() => refetch()} className="mt-4">
                Try Again
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Users className="h-6 w-6" />
          <h1 className="text-2xl font-bold">Users Management</h1>
        </div>
        <div className="text-sm text-muted-foreground">
          {data &&
            `${data.users.length} of ${
              data.pagination.totalPages * data.pagination.limit
            } users`}
        </div>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle>Filters</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row gap-4">
            {/* Search */}
            <div className="flex-1">
              <div className="flex space-x-2">
                <Input
                  placeholder="Search by name, email, or phone..."
                  value={searchInput}
                  onChange={(e) => setSearchInput(e.target.value)}
                  onKeyPress={(e) => e.key === "Enter" && handleSearch()}
                />
                <Button onClick={handleSearch} size="icon">
                  <Search className="h-4 w-4" />
                </Button>
              </div>
            </div>

            {/* Verification Filter */}
            <Select onValueChange={handleVerificationFilter} defaultValue="all">
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Verification Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Users</SelectItem>
                <SelectItem value="verified">Verified</SelectItem>
                <SelectItem value="unverified">Unverified</SelectItem>
              </SelectContent>
            </Select>

            {/* Items per page */}
            <Select onValueChange={handleLimitChange} defaultValue="10">
              <SelectTrigger className="w-[120px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="5">5 per page</SelectItem>
                <SelectItem value="10">10 per page</SelectItem>
                <SelectItem value="20">20 per page</SelectItem>
                <SelectItem value="50">50 per page</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Users Table */}
      <Card>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin" />
              <span className="ml-2">Loading users...</span>
            </div>
          ) : (
            <>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Phone</TableHead>
                    <TableHead>Gender</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Role</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {data?.users.map((user: User) => (
                    <TableRow key={user._id}>
                      <TableCell className="font-medium">
                        {user.first_name} {user.last_name}
                      </TableCell>
                      <TableCell>{user.email}</TableCell>
                      <TableCell>{user.phone_number}</TableCell>
                      <TableCell className="capitalize">{user.sex}</TableCell>
                      <TableCell>
                        <Badge
                          variant={user.isVerified ? "default" : "secondary"}
                        >
                          {user.isVerified ? "Verified" : "Unverified"}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className="capitalize">
                          {user.role}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>

              {/* Pagination */}
              {data && data.pagination && (
                <div className="flex items-center justify-between px-6 py-4 border-t">
                  <div className="text-sm text-muted-foreground">
                    Page {data.pagination.currentPage} of{" "}
                    {data.pagination.totalPages}
                  </div>
                  <div className="flex items-center space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handlePageChange(page - 1)}
                      disabled={!data.pagination.hasPrevPage}
                    >
                      <ChevronLeft className="h-4 w-4" />
                      Previous
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handlePageChange(page + 1)}
                      disabled={!data.pagination.hasNextPage}
                    >
                      Next
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>

      {/* Empty State */}
      {!isLoading && data?.users.length === 0 && (
        <Card>
          <CardContent className="pt-6">
            <div className="text-center py-12">
              <Users className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">No users found</h3>
              <p className="text-muted-foreground mb-4">
                {search
                  ? "Try adjusting your search criteria"
                  : "No users have been registered yet"}
              </p>
              {search && (
                <Button
                  variant="outline"
                  onClick={() => {
                    setSearch("");
                    setSearchInput("");
                    setIsVerified(undefined);
                  }}
                >
                  Clear Filters
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
