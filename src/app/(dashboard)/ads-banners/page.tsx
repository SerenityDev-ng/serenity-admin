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

import {
  Plus,
  MoreHorizontal,
  Image,
  ExternalLink,
  CheckCircle,
  XCircle,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useAdsBanners, useDeleteAdsBanner } from "@/hooks/use-ads-banners";
import { GetAdsBannersParams } from "@/services/ads-banners";
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
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { useCreateAdsBanner } from "@/hooks/use-ads-banners";

const getStatusColor = (isActive: boolean) => {
  return isActive ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-800";
};

const getStatusIcon = (isActive: boolean) => {
  return isActive ? (
    <CheckCircle className="h-4 w-4" />
  ) : (
    <XCircle className="h-4 w-4" />
  );
};

export default function AdsBannersPage() {
  const [filters, setFilters] = useState<GetAdsBannersParams>();
  const [selectedBanner, setSelectedBanner] = useState<string>("");
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false); // New state for create dialog

  const [link, setLink] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [isActive, setIsActive] = useState(false);
  const [uploadedImageUrl, setUploadedImageUrl] = useState<string | null>(null); // New state
  const [isUploading, setIsUploading] = useState(false); // New state

  const { data, isLoading, error } = useAdsBanners(filters);
  const deleteBannerMutation = useDeleteAdsBanner();
  const createAdsBannerMutation = useCreateAdsBanner();

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files[0]) {
      const selectedFile = event.target.files[0];
      setFile(selectedFile);
      setUploadedImageUrl(null); // Reset previous upload URL
      setIsUploading(true);

      try {
        const formData = new FormData();
        formData.append("file", selectedFile);
        formData.append("upload_preset", "serenityweb");
        formData.append("folder", "banner");

        const response = await fetch(
          `https://api.cloudinary.com/v1_1/duojjwk8l/image/upload`,
          {
            method: "POST",
            body: formData,
          }
        );

        if (!response.ok) {
          throw new Error("Cloudinary upload failed.");
        }

        const data = await response.json();
        setUploadedImageUrl(data.secure_url);
        setLink(data.secure_url); // Set the link from Cloudinary data
        toast.success("Image uploaded successfully!");
      } catch (error) {
        console.error("Error uploading image:", error);
        toast.error("Failed to upload image.");
        setFile(null); // Clear selected file on error
      } finally {
        setIsUploading(false);
      }
    }
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    if (!uploadedImageUrl) { // Use uploadedImageUrl instead of file
      toast.error("Please upload an image first.");
      return;
    }

    try {
      await createAdsBannerMutation.mutateAsync({
        image: uploadedImageUrl, // Use the uploaded URL
        link,
        is_active: isActive,
      });

      toast.success("Banner created successfully!");
      setLink("");
      setFile(null);
      setIsActive(false);
      setUploadedImageUrl(null); // Clear uploaded image URL
      setIsCreateDialogOpen(false);
    } catch (error) {
      console.error("Error creating banner:", error);
      toast.error("Failed to create banner.");
    }
  };

  const handleStatusChange = (value: string) => {
    const is_active = value === "all" ? undefined : value === "active";
    setFilters((prev) => ({ ...prev, is_active }));
  };

  const handleDeleteBanner = async () => {
    if (!selectedBanner) return;

    try {
      await deleteBannerMutation.mutateAsync(selectedBanner);
      toast.success("Banner deleted successfully");
      setIsDeleteDialogOpen(false);
      setSelectedBanner("");
    } catch (error) {
      toast.error("Failed to delete banner");
    }
  };

  const openDeleteDialog = (bannerId: string) => {
    setSelectedBanner(bannerId);
    setIsDeleteDialogOpen(true);
  };

  if (error) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold tracking-tight">Ads Banners</h1>
        </div>
        <Alert variant="destructive">
          <AlertDescription>
            Failed to load ads banners. Please try again later.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">Ads Banners</h1>
        <Button onClick={() => setIsCreateDialogOpen(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Create Banner
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>All Advertisement Banners</CardTitle>
          <CardDescription>
            Manage advertisement banners across the platform
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center space-x-4 mb-6">
            <Select
              value={
                filters?.is_active === undefined
                  ? "all"
                  : filters.is_active
                  ? "active"
                  : "inactive"
              }
              onValueChange={handleStatusChange}
            >
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="inactive">Inactive</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {isLoading ? (
            <div className="space-y-4">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="flex items-center space-x-4">
                  <Skeleton className="h-16 w-24 rounded" />
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
                    <TableHead>Banner</TableHead>
                    <TableHead>Link</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {data?.data.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={4} className="text-center py-8">
                        <div className="flex flex-col items-center space-y-2">
                          <Image className="h-8 w-8 text-gray-400" />
                          <p className="text-gray-500">No banners found</p>
                          <p className="text-sm text-gray-400">
                            Try adjusting your filters
                          </p>
                        </div>
                      </TableCell>
                    </TableRow>
                  ) : (
                    data?.data.map((banner) => (
                      <TableRow key={banner._id}>
                        <TableCell>
                          <div className="flex items-center space-x-3">
                            <div className="w-16 h-12 bg-gray-100 rounded overflow-hidden">
                              <img
                                src={banner.image}
                                alt="Banner"
                                className="w-full h-full object-cover"
                              />
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center space-x-1">
                            <ExternalLink className="h-3 w-3 text-gray-400" />
                            <a
                              href={banner.link}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-blue-600 hover:underline truncate max-w-[300px]"
                            >
                              {banner.link}
                            </a>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge className={getStatusColor(banner.is_active)}>
                            <div className="flex items-center space-x-1">
                              {getStatusIcon(banner.is_active)}
                              <span>
                                {banner.is_active ? "Active" : "Inactive"}
                              </span>
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
                              <DropdownMenuItem>Edit Banner</DropdownMenuItem>
                              <DropdownMenuItem
                                className="text-red-600"
                                onClick={() => openDeleteDialog(banner._id)}
                              >
                                Delete Banner
                              </DropdownMenuItem>
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

      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Banner</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this banner? This action cannot be
              undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsDeleteDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleDeleteBanner}
              disabled={deleteBannerMutation.isPending}
            >
              {deleteBannerMutation.isPending ? "Deleting..." : "Delete Banner"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create New Banner</DialogTitle>
            <DialogDescription>
              Fill in the details to create a new advertisement banner.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4 py-4">
            <div className="grid w-full max-w-sm items-center gap-1.5">
              <Label htmlFor="image">Image</Label>
              <Input
                id="image"
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                required
                disabled={isUploading}
               />
               {isUploading && <p className="text-sm text-gray-500">Uploading image...</p>}
               {uploadedImageUrl && (
                 <div className="mt-2">
                   <p className="text-sm text-gray-500">Image uploaded:</p>
                   <img src={uploadedImageUrl} alt="Uploaded Preview" className="w-32 h-32 object-cover rounded" />
                 </div>
               )}
             </div>
             <div className="flex items-center space-x-2">
              <Checkbox
                id="is_active"
                checked={isActive}
                onCheckedChange={(checked) => setIsActive(checked as boolean)}
              />
              <Label htmlFor="is_active">Is Active</Label>
            </div>
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setIsCreateDialogOpen(false)}
                type="button"
              >
                Cancel
              </Button>
              <Button type="submit" disabled={createAdsBannerMutation.isPending || isUploading || !uploadedImageUrl}>
                {createAdsBannerMutation.isPending ? "Creating..." : "Create Banner"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
