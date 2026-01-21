import { useState, useEffect } from "react";
import { Search, Award, CheckCircle, XCircle, Loader2, Eye } from "lucide-react";
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
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { format } from "date-fns";
import { useAuth } from "@/hooks/useAuth";

interface CertificateWithDetails {
  id: string;
  certificate_number: string;
  issued_at: string;
  is_approved: boolean;
  approved_at: string | null;
  course_id: string;
  user_id: string;
  course_title: string;
  user_name: string;
  user_email: string;
}

const AdminCertificates = () => {
  const [certificates, setCertificates] = useState<CertificateWithDetails[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState<"all" | "pending" | "approved">("all");
  const [selectedCertificate, setSelectedCertificate] = useState<CertificateWithDetails | null>(null);
  const { user } = useAuth();

  useEffect(() => {
    fetchCertificates();
  }, []);

  const fetchCertificates = async () => {
    try {
      // Fetch certificates
      const { data: certsData, error: certsError } = await supabase
        .from("certificates")
        .select("*")
        .order("issued_at", { ascending: false });

      if (certsError) throw certsError;

      // Fetch courses
      const { data: coursesData, error: coursesError } = await supabase
        .from("courses")
        .select("id, title");

      if (coursesError) throw coursesError;

      // Fetch profiles
      const { data: profilesData, error: profilesError } = await supabase
        .from("profiles")
        .select("user_id, username, full_name");

      if (profilesError) throw profilesError;

      // Combine data
      const combinedCerts: CertificateWithDetails[] = (certsData || []).map((cert) => {
        const course = coursesData?.find((c) => c.id === cert.course_id);
        const profile = profilesData?.find((p) => p.user_id === cert.user_id);
        
        return {
          id: cert.id,
          certificate_number: cert.certificate_number,
          issued_at: cert.issued_at,
          is_approved: cert.is_approved,
          approved_at: cert.approved_at,
          course_id: cert.course_id,
          user_id: cert.user_id,
          course_title: course?.title || "Unknown Course",
          user_name: profile?.full_name || profile?.username || "Unknown User",
          user_email: cert.user_id,
        };
      });

      setCertificates(combinedCerts);
    } catch (error: any) {
      toast.error("Failed to fetch certificates: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  const approveCertificate = async (certId: string) => {
    try {
      const { error } = await supabase
        .from("certificates")
        .update({
          is_approved: true,
          approved_at: new Date().toISOString(),
          approved_by: user?.id,
        })
        .eq("id", certId);

      if (error) throw error;

      toast.success("Certificate approved successfully!");
      fetchCertificates();
      setSelectedCertificate(null);
    } catch (error: any) {
      toast.error("Failed to approve certificate: " + error.message);
    }
  };

  const revokeCertificate = async (certId: string) => {
    try {
      const { error } = await supabase
        .from("certificates")
        .update({
          is_approved: false,
          approved_at: null,
          approved_by: null,
        })
        .eq("id", certId);

      if (error) throw error;

      toast.success("Certificate revoked");
      fetchCertificates();
      setSelectedCertificate(null);
    } catch (error: any) {
      toast.error("Failed to revoke certificate: " + error.message);
    }
  };

  const filteredCertificates = certificates.filter((cert) => {
    const matchesSearch =
      cert.user_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      cert.course_title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      cert.certificate_number.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesFilter =
      filterStatus === "all" ||
      (filterStatus === "pending" && !cert.is_approved) ||
      (filterStatus === "approved" && cert.is_approved);

    return matchesSearch && matchesFilter;
  });

  const pendingCount = certificates.filter((c) => !c.is_approved).length;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-mono font-bold text-foreground">
            Manage Certificates
          </h1>
          {pendingCount > 0 && (
            <p className="text-sm text-accent font-mono mt-1">
              {pendingCount} certificate{pendingCount > 1 ? "s" : ""} pending approval
            </p>
          )}
        </div>
      </div>

      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search by student, course, or certificate number..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 font-mono bg-input border-border"
          />
        </div>
        <Select value={filterStatus} onValueChange={(v) => setFilterStatus(v as any)}>
          <SelectTrigger className="w-[180px] font-mono">
            <SelectValue placeholder="Filter status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Certificates</SelectItem>
            <SelectItem value="pending">Pending</SelectItem>
            <SelectItem value="approved">Approved</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {loading ? (
        <div className="flex justify-center py-12">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      ) : filteredCertificates.length === 0 ? (
        <div className="text-center py-12">
          <Award className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
          <p className="text-muted-foreground font-mono">No certificates found</p>
        </div>
      ) : (
        <div className="grid gap-4">
          {filteredCertificates.map((cert) => (
            <div
              key={cert.id}
              className={`cyber-card border p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 ${
                cert.is_approved ? "border-secondary/50" : "border-accent/50"
              }`}
            >
              <div className="flex items-start gap-4">
                <div
                  className={`p-3 rounded-lg ${
                    cert.is_approved ? "bg-secondary/20" : "bg-accent/20"
                  }`}
                >
                  <Award
                    className={`w-6 h-6 ${
                      cert.is_approved ? "text-secondary" : "text-accent"
                    }`}
                  />
                </div>
                <div>
                  <h3 className="font-mono font-bold text-foreground">
                    {cert.user_name}
                  </h3>
                  <p className="text-sm text-muted-foreground font-mono">
                    {cert.course_title}
                  </p>
                  <p className="text-xs text-muted-foreground font-mono mt-1">
                    #{cert.certificate_number} • Completed{" "}
                    {format(new Date(cert.issued_at), "MMM dd, yyyy")}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2 w-full sm:w-auto">
                <span
                  className={`px-3 py-1 rounded-full text-xs font-mono ${
                    cert.is_approved
                      ? "bg-secondary/20 text-secondary"
                      : "bg-accent/20 text-accent"
                  }`}
                >
                  {cert.is_approved ? "Approved" : "Pending"}
                </span>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setSelectedCertificate(cert)}
                  className="font-mono"
                >
                  <Eye className="w-4 h-4 mr-1" />
                  View
                </Button>
                {!cert.is_approved ? (
                  <Button
                    size="sm"
                    onClick={() => approveCertificate(cert.id)}
                    className="bg-secondary text-secondary-foreground hover:bg-secondary/80 font-mono"
                  >
                    <CheckCircle className="w-4 h-4 mr-1" />
                    Approve
                  </Button>
                ) : (
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => revokeCertificate(cert.id)}
                    className="font-mono"
                  >
                    <XCircle className="w-4 h-4 mr-1" />
                    Revoke
                  </Button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Certificate Detail Dialog */}
      <Dialog open={!!selectedCertificate} onOpenChange={() => setSelectedCertificate(null)}>
        <DialogContent className="bg-card border-border">
          <DialogHeader>
            <DialogTitle className="font-mono text-xl">
              Certificate Details
            </DialogTitle>
          </DialogHeader>
          {selectedCertificate && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground font-mono">Student</p>
                  <p className="font-mono text-foreground">{selectedCertificate.user_name}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground font-mono">Course</p>
                  <p className="font-mono text-foreground">{selectedCertificate.course_title}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground font-mono">Certificate #</p>
                  <p className="font-mono text-foreground">{selectedCertificate.certificate_number}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground font-mono">Completed</p>
                  <p className="font-mono text-foreground">
                    {format(new Date(selectedCertificate.issued_at), "PPP")}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground font-mono">Status</p>
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-mono inline-block ${
                      selectedCertificate.is_approved
                        ? "bg-secondary/20 text-secondary"
                        : "bg-accent/20 text-accent"
                    }`}
                  >
                    {selectedCertificate.is_approved ? "Approved" : "Pending Approval"}
                  </span>
                </div>
                {selectedCertificate.approved_at && (
                  <div>
                    <p className="text-sm text-muted-foreground font-mono">Approved On</p>
                    <p className="font-mono text-foreground">
                      {format(new Date(selectedCertificate.approved_at), "PPP")}
                    </p>
                  </div>
                )}
              </div>
              <div className="flex gap-2 pt-4">
                {!selectedCertificate.is_approved ? (
                  <Button
                    onClick={() => approveCertificate(selectedCertificate.id)}
                    className="w-full bg-secondary text-secondary-foreground hover:bg-secondary/80 font-mono"
                  >
                    <CheckCircle className="w-4 h-4 mr-2" />
                    Approve Certificate
                  </Button>
                ) : (
                  <Button
                    variant="destructive"
                    onClick={() => revokeCertificate(selectedCertificate.id)}
                    className="w-full font-mono"
                  >
                    <XCircle className="w-4 h-4 mr-2" />
                    Revoke Certificate
                  </Button>
                )}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminCertificates;
