import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useCreateWorker } from "@/hooks/use-workers";
import { Loader2, Plus } from "lucide-react";
import React, { useState } from "react";
import { toast } from "sonner";

const professionalSkills = [
  {
    label: "Housekeeping",
    value: "house_keeping",
  },
  {
    label: "Dry Cleaning",
    value: "dry_cleaning",
  },
  {
    label: "Electrician",
    value: "electrician",
  },
  {
    label: "Plumber",
    value: "plumber",
  },
  {
    label: "Carpenter",
    value: "carpenter",
  },
  {
    label: "Painter",
    value: "painter",
  },
  {
    label: "Mason",
    value: "mason",
  },
];
const AddWorker = () => {
  const createWorker = useCreateWorker();
  const [worker, setWorker] = useState({
    full_name: "",
    email: "",
    phone_number: "",
    password: "",
    skill: "",
  });

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (
      !worker.full_name ||
      !worker.email ||
      !worker.phone_number ||
      !worker.password ||
      !worker.skill
    )
      return toast.warning("Fill all fields");
    createWorker.mutate(worker, {
      onSuccess: () => {
        toast.success("Worker added successfully");
        setWorker({
          full_name: "",
          email: "",
          phone_number: "",
          password: "",
          skill: "",
        });
      },
      onError: (error: any) => {
        toast.error(error.response.data.error || "Failed to add worker");
      },
    });
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    setWorker({
      ...worker,
      [e.target.name]: e.target.value,
    });
  };
  return (
    <Dialog>
      <DialogTrigger className="bg-black font-medium rounded-lg p-2 text-white flex items-center gap-2 hover:bg-black/90 cursor-pointer text-sm">
        <Plus />
        Add Worker
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add Worker</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit}>
          <div className="flex flex-col gap-4">
            <div className="flex flex-col gap-2">
              <Label htmlFor="full_name">Full Name</Label>
              <Input
                type="text"
                id="full_name"
                name="full_name"
                onChange={handleChange}
              />
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="email">Email</Label>
              <Input
                type="text"
                id="email"
                name="email"
                onChange={handleChange}
              />
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="phone_number">Phone</Label>
              <Input
                type="text"
                id="phone_number"
                name="phone_number"
                onChange={handleChange}
              />
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="password">Password</Label>
              <Input
                type="password"
                id="password"
                name="password"
                onChange={handleChange}
              />
            </div>
            <div className="flex flex-col gap-2">
              <Select
                value={worker.skill}
                onValueChange={(value) =>
                  setWorker({ ...worker, skill: value })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select Skill" />
                </SelectTrigger>
                <SelectContent>
                  {professionalSkills.map((skill) => (
                    <SelectItem key={skill.value} value={skill.value}>
                      {skill.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="flex justify-end">
            <Button type="submit" disabled={createWorker.isPending}>
              {createWorker.isPending ? (
                <Loader2 className="animate-spin" />
              ) : (
                "Add Worker"
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default AddWorker;
