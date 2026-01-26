import { useState, useEffect } from "react";
import { Search, Shield, User, Crown, Trash2, AlertTriangle } from "lucide-react";
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
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { format } from "date-fns";

interface UserWithRole {
  id: string;
  user_id: string;
  username: string | null;
  full_name: string | null;
  avatar_url: string | null;
  created_at: string;
  role: "admin" | "moderator" | "user";
}

const AdminUsers = () => {
  const [users, setUsers] = useState<UserWithRole[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [deletingUserId, setDeletingUserId] = useState<string | null>(null);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      // Fetch profiles with their roles
      const { data: profiles, error: profilesError } = await supabase
        .from("profiles")
        .select("*")
        .order("created_at", { ascending: false });

      if (profilesError) throw profilesError;

      // Fetch roles
      const { data: roles, error: rolesError } = await supabase
        .from("user_roles")
        .select("*");

      if (rolesError) throw rolesError;

      // Combine profiles with roles
      const usersWithRoles = profiles?.map((profile) => {
        const userRole = roles?.find((r) => r.user_id === profile.user_id);
        return {
          ...profile,
          role: (userRole?.role || "user") as "admin" | "moderator" | "user",
        };
      }) || [];

      setUsers(usersWithRoles);
    } catch (error: any) {
      toast.error("Failed to fetch users: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  const updateUserRole = async (userId: string, newRole: "admin" | "moderator" | "user") => {
    try {
      // Check if role exists
      const { data: existingRole } = await supabase
        .from("user_roles")
        .select("*")
        .eq("user_id", userId)
        .maybeSingle();

      if (existingRole) {
        // Update existing role
        const { error } = await supabase
          .from("user_roles")
          .update({ role: newRole })
          .eq("user_id", userId);

        if (error) throw error;
      } else {
        // Insert new role
        const { error } = await supabase
          .from("user_roles")
          .insert([{ user_id: userId, role: newRole }]);

        if (error) throw error;
      }

      toast.success("User role updated successfully");
      fetchUsers();
    } catch (error: any) {
      toast.error("Error updating role: " + error.message);
    }
  };

  const deleteUser = async (userId: string) => {
    try {
      setDeletingUserId(userId);

      // Delete user role first
      await supabase
        .from("user_roles")
        .delete()
        .eq("user_id", userId);

      // Delete user profile
      const { error: profileError } = await supabase
        .from("profiles")
        .delete()
        .eq("user_id", userId);

      if (profileError) throw profileError;

      // Delete related data (enrollments, progress, certificates)
      await Promise.all([
        supabase.from("course_enrollments").delete().eq("user_id", userId),
        supabase.from("lesson_progress").delete().eq("user_id", userId),
        supabase.from("certificates").delete().eq("user_id", userId),
      ]);

      toast.success("User deleted successfully");
      fetchUsers();
    } catch (error: any) {
      toast.error("Error deleting user: " + error.message);
    } finally {
      setDeletingUserId(null);
    }
  };

  const filteredUsers = users.filter((user) =>
    (user.username?.toLowerCase() || "").includes(searchTerm.toLowerCase()) ||
    (user.full_name?.toLowerCase() || "").includes(searchTerm.toLowerCase())
  );

  const getRoleIcon = (role: string) => {
    switch (role) {
      case "admin":
        return <Crown className="w-4 h-4 text-yellow-500" />;
      case "moderator":
        return <Shield className="w-4 h-4 text-accent" />;
      default:
        return <User className="w-4 h-4 text-muted-foreground" />;
    }
  };

  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case "admin":
        return "bg-yellow-500/20 text-yellow-400";
      case "moderator":
        return "bg-accent/20 text-accent";
      default:
        return "bg-muted text-muted-foreground";
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-mono font-bold text-foreground">
          Manage Users
        </h1>
        <span className="text-sm font-mono text-muted-foreground">
          {users.length} users
        </span>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input
          placeholder="Search users..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-10 font-mono bg-input border-border"
        />
      </div>

      {loading ? (
        <div className="text-center py-8 text-muted-foreground font-mono">Loading...</div>
      ) : (
        <div className="grid gap-4">
          {filteredUsers.map((user) => (
            <div
              key={user.id}
              className="flex items-center gap-4 p-4 bg-card border border-border rounded-lg"
            >
              <div className="w-12 h-12 bg-muted rounded-full flex items-center justify-center overflow-hidden">
                {user.avatar_url ? (
                  <img
                    src={user.avatar_url}
                    alt={user.username || "User"}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <User className="w-6 h-6 text-muted-foreground" />
                )}
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  {getRoleIcon(user.role)}
                  <h3 className="font-mono font-semibold text-foreground">
                    {user.username || user.full_name || "Unknown User"}
                  </h3>
                  <span className={`px-2 py-0.5 text-xs font-mono rounded ${getRoleBadgeColor(user.role)}`}>
                    {user.role}
                  </span>
                </div>
                <p className="text-xs text-muted-foreground font-mono mt-1">
                  Joined {format(new Date(user.created_at), "MMM d, yyyy")}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <Select
                  value={user.role}
                  onValueChange={(value: "admin" | "moderator" | "user") =>
                    updateUserRole(user.user_id, value)
                  }
                >
                  <SelectTrigger className="w-32 font-mono bg-input border-border">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="user">User</SelectItem>
                    <SelectItem value="moderator">Moderator</SelectItem>
                    <SelectItem value="admin">Admin</SelectItem>
                  </SelectContent>
                </Select>
                
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="text-destructive hover:text-destructive hover:bg-destructive/10"
                      disabled={user.role === "admin" || deletingUserId === user.user_id}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent className="bg-card border-border">
                    <AlertDialogHeader>
                      <AlertDialogTitle className="flex items-center gap-2 font-mono">
                        <AlertTriangle className="w-5 h-5 text-destructive" />
                        Delete User
                      </AlertDialogTitle>
                      <AlertDialogDescription className="font-mono text-muted-foreground">
                        Are you sure you want to delete{" "}
                        <span className="text-foreground font-semibold">
                          {user.username || user.full_name || "this user"}
                        </span>
                        ? This action cannot be undone. All their data including enrollments, 
                        progress, and certificates will be permanently removed.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel className="font-mono">Cancel</AlertDialogCancel>
                      <AlertDialogAction
                        onClick={() => deleteUser(user.user_id)}
                        className="bg-destructive text-destructive-foreground hover:bg-destructive/90 font-mono"
                      >
                        Delete User
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </div>
            </div>
          ))}
          {filteredUsers.length === 0 && (
            <div className="text-center py-8 text-muted-foreground font-mono">
              No users found
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default AdminUsers;
