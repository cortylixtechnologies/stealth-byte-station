import { useState } from "react";
import { motion } from "framer-motion";
import { Navigate } from "react-router-dom";
import {
  Shield,
  Wrench,
  Video,
  Newspaper,
  GraduationCap,
  Users,
  Settings,
  LogOut,
  Menu,
  X,
  BookOpen,
  Award,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";
import GlitchText from "@/components/GlitchText";
import AdminTools from "@/components/admin/AdminTools";
import AdminVideos from "@/components/admin/AdminVideos";
import AdminNews from "@/components/admin/AdminNews";
import AdminCourses from "@/components/admin/AdminCourses";
import AdminCourseModules from "@/components/admin/AdminCourseModules";
import AdminUsers from "@/components/admin/AdminUsers";
import AdminCertificates from "@/components/admin/AdminCertificates";

const menuItems = [
  { id: "tools", label: "Tools", icon: Wrench },
  { id: "videos", label: "Videos", icon: Video },
  { id: "news", label: "News", icon: Newspaper },
  { id: "courses", label: "Courses", icon: GraduationCap },
  { id: "modules", label: "Course Content", icon: BookOpen },
  { id: "certificates", label: "Certificates", icon: Award },
  { id: "users", label: "Users", icon: Users },
];

const Admin = () => {
  const { user, isAdmin, loading, signOut } = useAuth();
  const [activeSection, setActiveSection] = useState("tools");
  const [sidebarOpen, setSidebarOpen] = useState(false);

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-primary animate-pulse font-mono">Loading...</div>
      </div>
    );
  }

  if (!user || !isAdmin) {
    return <Navigate to="/auth" replace />;
  }

  const renderContent = () => {
    switch (activeSection) {
      case "tools":
        return <AdminTools />;
      case "videos":
        return <AdminVideos />;
      case "news":
        return <AdminNews />;
      case "courses":
        return <AdminCourses />;
      case "modules":
        return <AdminCourseModules />;
      case "certificates":
        return <AdminCertificates />;
      case "users":
        return <AdminUsers />;
      default:
        return <AdminTools />;
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Mobile Header */}
      <div className="lg:hidden fixed top-0 left-0 right-0 z-50 bg-background/95 backdrop-blur-xl border-b border-border">
        <div className="flex items-center justify-between p-4">
          <div className="flex items-center gap-2">
            <Shield className="w-6 h-6 text-accent" />
            <span className="font-mono font-bold text-lg">
              <GlitchText text="ADMIN" className="text-accent" />
            </span>
          </div>
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="p-2 text-primary"
          >
            {sidebarOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Sidebar */}
      <aside
        className={`fixed top-0 left-0 z-40 h-full w-64 bg-card border-r border-border transform transition-transform duration-300 lg:translate-x-0 ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="p-6 border-b border-border hidden lg:block">
            <div className="flex items-center gap-2">
              <Shield className="w-8 h-8 text-accent" />
              <span className="font-mono font-bold text-xl">
                <GlitchText text="ADMIN" className="text-accent" />
                <span className="text-foreground"> PANEL</span>
              </span>
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex-1 p-4 space-y-2 mt-16 lg:mt-0">
            {menuItems.map((item) => {
              const Icon = item.icon;
              return (
                <button
                  key={item.id}
                  onClick={() => {
                    setActiveSection(item.id);
                    setSidebarOpen(false);
                  }}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg font-mono text-sm transition-all ${
                    activeSection === item.id
                      ? "bg-accent/20 text-accent border border-accent/50"
                      : "text-muted-foreground hover:bg-muted hover:text-foreground"
                  }`}
                >
                  <Icon className="w-5 h-5" />
                  {item.label}
                </button>
              );
            })}
          </nav>

          {/* Footer */}
          <div className="p-4 border-t border-border space-y-2">
            <div className="px-4 py-2 text-sm font-mono text-muted-foreground truncate">
              {user.email}
            </div>
            <Button
              variant="ghost"
              onClick={signOut}
              className="w-full justify-start gap-3 font-mono text-destructive hover:text-destructive hover:bg-destructive/10"
            >
              <LogOut className="w-5 h-5" />
              Logout
            </Button>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="lg:ml-64 min-h-screen pt-16 lg:pt-0">
        <div className="p-6">
          <motion.div
            key={activeSection}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            {renderContent()}
          </motion.div>
        </div>
      </main>

      {/* Overlay for mobile */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-30 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}
    </div>
  );
};

export default Admin;
