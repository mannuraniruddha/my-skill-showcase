import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Search, Eye, UserCheck, UserX, Shield, ShieldOff } from "lucide-react";

interface UserProfile {
  id: string;
  user_id: string;
  display_name: string | null;
  avatar_url: string | null;
  is_deactivated: boolean;
  deactivated_at: string | null;
  created_at: string;
  updated_at: string;
}

interface UserRole {
  role: "admin" | "user";
}

interface UserPreference {
  python_level: string;
  theme_preference: string;
}

const UsersManager = () => {
  const [search, setSearch] = useState("");
  const [selectedUser, setSelectedUser] = useState<UserProfile | null>(null);
  const queryClient = useQueryClient();

  // Fetch all profiles
  const { data: users, isLoading } = useQuery({
    queryKey: ["admin-users"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data as UserProfile[];
    },
  });

  // Fetch roles for selected user
  const { data: userRoles } = useQuery({
    queryKey: ["admin-user-roles", selectedUser?.user_id],
    queryFn: async () => {
      if (!selectedUser) return [];
      const { data, error } = await supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", selectedUser.user_id);
      if (error) throw error;
      return data as UserRole[];
    },
    enabled: !!selectedUser,
  });

  // Fetch preferences for selected user
  const { data: userPrefs } = useQuery({
    queryKey: ["admin-user-prefs", selectedUser?.user_id],
    queryFn: async () => {
      if (!selectedUser) return null;
      const { data, error } = await supabase
        .from("user_preferences")
        .select("python_level, theme_preference")
        .eq("user_id", selectedUser.user_id)
        .maybeSingle();
      if (error) throw error;
      return data as UserPreference | null;
    },
    enabled: !!selectedUser,
  });

  // Toggle deactivation
  const toggleDeactivation = useMutation({
    mutationFn: async ({ userId, deactivate }: { userId: string; deactivate: boolean }) => {
      const { error } = await supabase
        .from("profiles")
        .update({
          is_deactivated: deactivate,
          deactivated_at: deactivate ? new Date().toISOString() : null,
        })
        .eq("user_id", userId);
      if (error) throw error;
    },
    onSuccess: (_, { deactivate }) => {
      toast.success(deactivate ? "User deactivated" : "User reactivated");
      queryClient.invalidateQueries({ queryKey: ["admin-users"] });
      if (selectedUser) {
        setSelectedUser((prev) =>
          prev
            ? { ...prev, is_deactivated: deactivate, deactivated_at: deactivate ? new Date().toISOString() : null }
            : null
        );
      }
    },
    onError: () => toast.error("Failed to update user status"),
  });

  // Toggle admin role
  const toggleAdminRole = useMutation({
    mutationFn: async ({ userId, grant }: { userId: string; grant: boolean }) => {
      if (grant) {
        const { error } = await supabase
          .from("user_roles")
          .insert({ user_id: userId, role: "admin" });
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from("user_roles")
          .delete()
          .eq("user_id", userId)
          .eq("role", "admin");
        if (error) throw error;
      }
    },
    onSuccess: (_, { grant }) => {
      toast.success(grant ? "Admin role granted" : "Admin role revoked");
      queryClient.invalidateQueries({ queryKey: ["admin-user-roles", selectedUser?.user_id] });
    },
    onError: () => toast.error("Failed to update role"),
  });

  const filteredUsers = users?.filter((u) => {
    const term = search.toLowerCase();
    return (
      !term ||
      u.display_name?.toLowerCase().includes(term) ||
      u.user_id.toLowerCase().includes(term)
    );
  });

  const isUserAdmin = userRoles?.some((r) => r.role === "admin") ?? false;

  return (
    <Card className="border-border bg-card">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>Users ({users?.length ?? 0})</span>
          <div className="relative w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by name or ID..."
              className="pl-9"
            />
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <p className="text-muted-foreground text-center py-8">Loading users...</p>
        ) : (
          <div className="rounded-md border border-border overflow-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Display Name</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Joined</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredUsers?.map((user) => (
                  <TableRow key={user.id}>
                    <TableCell className="font-medium">
                      {user.display_name || "—"}
                    </TableCell>
                    <TableCell>
                      {user.is_deactivated ? (
                        <Badge variant="destructive">Deactivated</Badge>
                      ) : (
                        <Badge variant="secondary" className="bg-emerald-500/10 text-emerald-500 border-emerald-500/20">
                          Active
                        </Badge>
                      )}
                    </TableCell>
                    <TableCell className="text-muted-foreground text-sm">
                      {new Date(user.created_at).toLocaleDateString()}
                    </TableCell>
                    <TableCell className="text-right space-x-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setSelectedUser(user)}
                      >
                        <Eye className="w-4 h-4 mr-1" />
                        View
                      </Button>
                      {user.is_deactivated ? (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() =>
                            toggleDeactivation.mutate({ userId: user.user_id, deactivate: false })
                          }
                        >
                          <UserCheck className="w-4 h-4 mr-1" />
                          Reactivate
                        </Button>
                      ) : (
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button variant="outline" size="sm">
                              <UserX className="w-4 h-4 mr-1" />
                              Deactivate
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Deactivate user?</AlertDialogTitle>
                              <AlertDialogDescription>
                                This will disable {user.display_name || "this user"}'s access. Their data will be retained.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancel</AlertDialogCancel>
                              <AlertDialogAction
                                onClick={() =>
                                  toggleDeactivation.mutate({ userId: user.user_id, deactivate: true })
                                }
                                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                              >
                                Deactivate
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
                {filteredUsers?.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={4} className="text-center text-muted-foreground py-8">
                      No users found
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        )}

        {/* User Detail Dialog */}
        <Dialog open={!!selectedUser} onOpenChange={(open) => !open && setSelectedUser(null)}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>User Details</DialogTitle>
              <DialogDescription>
                View and manage this user's account
              </DialogDescription>
            </DialogHeader>
            {selectedUser && (
              <div className="space-y-4">
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Display Name</span>
                    <span className="font-medium">{selectedUser.display_name || "—"}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Status</span>
                    {selectedUser.is_deactivated ? (
                      <Badge variant="destructive">Deactivated</Badge>
                    ) : (
                      <Badge variant="secondary" className="bg-emerald-500/10 text-emerald-500 border-emerald-500/20">Active</Badge>
                    )}
                  </div>
                  {selectedUser.deactivated_at && (
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Deactivated At</span>
                      <span>{new Date(selectedUser.deactivated_at).toLocaleString()}</span>
                    </div>
                  )}
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Joined</span>
                    <span>{new Date(selectedUser.created_at).toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Python Level</span>
                    <span className="capitalize">{userPrefs?.python_level || "beginner"}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Theme</span>
                    <span className="capitalize">{userPrefs?.theme_preference || "system"}</span>
                  </div>
                  <div className="flex justify-between text-sm items-center">
                    <span className="text-muted-foreground">Admin Role</span>
                    {isUserAdmin ? (
                      <Badge className="bg-primary/10 text-primary border-primary/20">Admin</Badge>
                    ) : (
                      <Badge variant="outline">User</Badge>
                    )}
                  </div>
                </div>

                <div className="flex gap-2 pt-2 border-t border-border">
                  {isUserAdmin ? (
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button variant="outline" size="sm" className="flex-1">
                          <ShieldOff className="w-4 h-4 mr-1" />
                          Revoke Admin
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Revoke admin role?</AlertDialogTitle>
                          <AlertDialogDescription>
                            {selectedUser.display_name || "This user"} will lose admin privileges.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <AlertDialogAction
                            onClick={() => toggleAdminRole.mutate({ userId: selectedUser.user_id, grant: false })}
                          >
                            Revoke
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  ) : (
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button variant="outline" size="sm" className="flex-1">
                          <Shield className="w-4 h-4 mr-1" />
                          Grant Admin
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Grant admin role?</AlertDialogTitle>
                          <AlertDialogDescription>
                            {selectedUser.display_name || "This user"} will gain full admin access.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <AlertDialogAction
                            onClick={() => toggleAdminRole.mutate({ userId: selectedUser.user_id, grant: true })}
                          >
                            Grant Admin
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  )}

                  {selectedUser.is_deactivated ? (
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex-1"
                      onClick={() =>
                        toggleDeactivation.mutate({ userId: selectedUser.user_id, deactivate: false })
                      }
                    >
                      <UserCheck className="w-4 h-4 mr-1" />
                      Reactivate
                    </Button>
                  ) : (
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button variant="destructive" size="sm" className="flex-1">
                          <UserX className="w-4 h-4 mr-1" />
                          Deactivate
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Deactivate user?</AlertDialogTitle>
                          <AlertDialogDescription>
                            This will disable access for {selectedUser.display_name || "this user"}.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <AlertDialogAction
                            onClick={() =>
                              toggleDeactivation.mutate({ userId: selectedUser.user_id, deactivate: true })
                            }
                            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                          >
                            Deactivate
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  )}
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </CardContent>
    </Card>
  );
};

export default UsersManager;
