"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogClose,
} from "@/components/ui/dialog";
import {
  updateProfileSchema,
  type UpdateProfileFormData,
} from "@/lib/zod/update-profile-validation";
import { authClient } from "@/server/better-auth/client";

export default function AccountPage() {
  const router = useRouter();
  const { data: session, isPending } = authClient.useSession();
  const [updateError, setUpdateError] = useState<string | null>(null);
  const [updateSuccess, setUpdateSuccess] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting, isDirty },
  } = useForm<UpdateProfileFormData>({
    resolver: zodResolver(updateProfileSchema),
    values: {
      name: session?.user?.name ?? "",
    },
  });

  if (isPending) {
    return (
      <div className="container mx-auto flex min-h-[calc(100vh-4rem)] items-center justify-center">
        <p className="text-muted-foreground">Loading...</p>
      </div>
    );
  }

  if (!session?.user) {
    router.push("/auth/sign-in");
    return null;
  }

  const user = session.user;

  const onUpdateProfile = async (data: UpdateProfileFormData) => {
    setUpdateError(null);
    setUpdateSuccess(false);

    const { error } = await authClient.updateUser({
      name: data.name,
    });

    if (error) {
      setUpdateError(error.message ?? "Failed to update profile.");
      return;
    }

    setUpdateSuccess(true);
  };

  const onDeleteAccount = async () => {
    setDeleteError(null);
    setIsDeleting(true);

    try {
      const { error } = await authClient.deleteUser();

      if (error) {
        setDeleteError(error.message ?? "Failed to delete account.");
        return;
      }

      router.push("/");
    } finally {
      setIsDeleting(false);
    }
  };

  const onSignOut = async () => {
    await authClient.signOut();
    router.push("/");
  };

  const formatDate = (date: string | Date) => {
    return new Date(date).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  return (
    <div className="container mx-auto max-w-2xl px-4 py-10">
      <h1 className="mb-6 text-3xl font-bold">My Account</h1>

      {/* Account Info */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Account Information</CardTitle>
          <CardDescription>
            Your personal details and account status
          </CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-muted-foreground text-sm font-medium">
                First Name
              </p>
              <p className="text-base">{user.firstName ?? "—"}</p>
            </div>
            <div>
              <p className="text-muted-foreground text-sm font-medium">
                Last Name
              </p>
              <p className="text-base">{user.lastName ?? "—"}</p>
            </div>
          </div>
          <div>
            <p className="text-muted-foreground text-sm font-medium">Email</p>
            <p className="text-base">{user.email}</p>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-muted-foreground text-sm font-medium">Role</p>
              <Badge variant="outline" className="mt-1 capitalize">
                {user.role ?? "client"}
              </Badge>
            </div>
            <div>
              <p className="text-muted-foreground text-sm font-medium">
                Member Since
              </p>
              <p className="text-base">{formatDate(user.createdAt)}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Update Profile */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Update Profile</CardTitle>
          <CardDescription>Change your display name</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onUpdateProfile)} className="grid gap-4">
            {updateError && (
              <p className="text-sm text-red-500">{updateError}</p>
            )}
            {updateSuccess && (
              <p className="text-sm text-green-600">
                Profile updated successfully.
              </p>
            )}
            <div className="grid gap-2">
              <Label htmlFor="name">Full Name</Label>
              <Input id="name" placeholder="John Doe" {...register("name")} />
              {errors.name && (
                <p className="text-sm text-red-500">{errors.name.message}</p>
              )}
            </div>
            <Button
              type="submit"
              className="w-full sm:w-auto"
              disabled={isSubmitting || !isDirty}
            >
              {isSubmitting ? "Saving..." : "Save Changes"}
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Sign Out */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Session</CardTitle>
          <CardDescription>Manage your current session</CardDescription>
        </CardHeader>
        <CardContent>
          <Button variant="outline" onClick={onSignOut}>
            Sign Out
          </Button>
        </CardContent>
      </Card>

      <Separator className="my-6" />

      {/* Danger Zone */}
      <Card className="border-red-200">
        <CardHeader>
          <CardTitle className="text-red-600">Danger Zone</CardTitle>
          <CardDescription>
            Permanently delete your account and all associated data. This action
            cannot be undone.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {deleteError && (
            <p className="mb-4 text-sm text-red-500">{deleteError}</p>
          )}
          <Dialog>
            <DialogTrigger render={<Button variant="destructive" />}>
              Delete Account
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Are you absolutely sure?</DialogTitle>
                <DialogDescription>
                  This action cannot be undone. This will permanently delete
                  your account and remove all of your data from our servers.
                </DialogDescription>
              </DialogHeader>
              <DialogFooter>
                <DialogClose render={<Button variant="outline" />}>
                  Cancel
                </DialogClose>
                <Button
                  variant="destructive"
                  onClick={onDeleteAccount}
                  disabled={isDeleting}
                >
                  {isDeleting ? "Deleting..." : "Delete Account"}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </CardContent>
      </Card>
    </div>
  );
}
