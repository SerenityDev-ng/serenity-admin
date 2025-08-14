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
  Home,
  DollarSign,
  CheckCircle,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useHouseTypes, useCreateHouseType } from "@/hooks/use-house-types";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription } from "@/components/ui/alert";

export default function HouseTypesPage() {
  const [searchTerm, setSearchTerm] = useState("");

  const { data, isLoading, error } = useHouseTypes();
  const createHouseTypeMutation = useCreateHouseType();

  if (error) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold tracking-tight">House Types</h1>
        </div>
        <Alert variant="destructive">
          <AlertDescription>
            Failed to load house types. Please try again later.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">House Types</h1>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          Add House Type
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>All House Types</CardTitle>
          <CardDescription>
            Manage different house types and their pricing structures
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center space-x-4 mb-6">
            <Input
              placeholder="Search house types..."
              value={searchTerm}
              onChange={(e) => {}}
              className="max-w-sm"
            />
          </div>

          {isLoading ? (
            <div className="space-y-4">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="flex items-center space-x-4">
                  <Skeleton className="h-16 w-16 rounded" />
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
                    <TableHead>House Type</TableHead>
                    <TableHead>Pricing</TableHead>
                    <TableHead>Details</TableHead>
                    <TableHead>ID</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {data?.data.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center py-8">
                        <div className="flex flex-col items-center space-y-2">
                          <Home className="h-8 w-8 text-gray-400" />
                          <p className="text-gray-500">No house types found</p>
                          <p className="text-sm text-gray-400">
                            Try adjusting your filters
                          </p>
                        </div>
                      </TableCell>
                    </TableRow>
                  ) : (
                    data?.data.map((houseType) => (
                      <TableRow key={houseType._id}>
                        <TableCell>
                          <div className="flex items-center space-x-3">
                            <div className="w-12 h-12 bg-gray-100 rounded overflow-hidden">
                              <div className="w-full h-full flex items-center justify-center">
                                <Home className="h-6 w-6 text-gray-400" />
                              </div>
                            </div>
                            <div>
                              <p className="font-medium">
                                {houseType.house_type}
                              </p>
                              <p className="text-sm text-gray-500 truncate max-w-[200px]">
                                {houseType.house_title}
                              </p>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="text-sm">
                            <div className="flex items-center space-x-1">
                              <span className="font-medium">
                                &#8358;{houseType.monthly_price}
                              </span>
                              <span className="text-gray-500">monthly</span>
                            </div>
                            <p className="text-xs text-gray-500">
                              &#8358;{houseType.onetime_price} one-time
                            </p>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="text-sm">
                            <p>{houseType.rooms} rooms</p>
                            <p className="text-xs text-gray-500">
                              {houseType.toilets} toilets,{" "}
                              {houseType.living_rooms} living rooms
                            </p>
                            {houseType.isDuplex && (
                              <p className="text-xs text-blue-600">Duplex</p>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="text-sm">
                            <p className="text-gray-600">
                              ID: {houseType._id.slice(-6)}
                            </p>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge className="bg-green-100 text-green-800">
                            <div className="flex items-center space-x-1">
                              <CheckCircle className="h-4 w-4" />
                              <span>Active</span>
                            </div>
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
                              <DropdownMenuItem>
                                Edit House Type
                              </DropdownMenuItem>
                              <DropdownMenuItem>View Details</DropdownMenuItem>
                              <DropdownMenuItem>Duplicate</DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
