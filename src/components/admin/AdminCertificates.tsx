import { useState, useEffect } from "react";
import { Search, Award, CheckCircle, XCircle, Loader2, Eye, Plus, User, GraduationCap, Users, BookOpen } from "lucide-react";
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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
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

interface EnrollmentWithDetails {
  id: string;
  user_id: string;
  course_id: string;
  enrolled_at: string;
  completed_at: string | null;
  is_completed: boolean;
  course_title: string;
  user_name: string;
  has_certificate: boolean;
  certificate_approved: boolean;
}

const AdminCertificates = () => {
  const [certificates, setCertificates] = useState<CertificateWithDetails[]>([]);
  const [allEnrollments, setAllEnrollments] = useState<EnrollmentWithDetails[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState<"all" | "pending" | "approved">("all");
  const [enrollmentFilter, setEnrollmentFilter] = useState<"all" | "completed" | "in_progress">("all");
  const [selectedCertificate, setSelectedCertificate] = useState<CertificateWithDetails | null>(null);
  const [creatingCert, setCreatingCert] = useState<string | null>(null);
  const { user } = useAuth();

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    await Promise.all([fetchCertificates(), fetchAllEnrollments()]);
    setLoading(false);
  };

  const fetchCertificates = async () => {
    try {
      const { data: certsData, error: certsError } = await supabase
        .from("certificates")
        .select("*")
        .order("issued_at", { ascending: false });

      if (certsError) throw certsError;

      const { data: coursesData, error: coursesError } = await supabase
        .from("courses")
        .select("id, title");

      if (coursesError) throw coursesError;

      const { data: profilesData, error: profilesError } = await supabase
        .from("profiles")
        .select("user_id, username, full_name");

      if (profilesError) throw profilesError;

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
    }
  };

  const fetchAllEnrollments = async () => {
    try {
      const { data: enrollmentsData, error: enrollmentsError } = await supabase
        .from("course_enrollments")
        .select("*")
        .order("enrolled_at", { ascending: false });

      if (enrollmentsError) throw enrollmentsError;

      const { data: coursesData, error: coursesError } = await supabase
        .from("courses")
        .select("id, title");

      if (coursesError) throw coursesError;

      const { data: profilesData, error: profilesError } = await supabase
        .from("profiles")
        .select("user_id, username, full_name");

      if (profilesError) throw profilesError;

      const { data: certsData, error: certsError } = await supabase
        .from("certificates")
        .select("user_id, course_id, is_approved");

      if (certsError) throw certsError;

      const enrollmentsWithDetails: EnrollmentWithDetails[] = (enrollmentsData || []).map((enrollment) => {
        const course = coursesData?.find((c) => c.id === enrollment.course_id);
        const profile = profilesData?.find((p) => p.user_id === enrollment.user_id);
        const cert = certsData?.find(
          (c) => c.user_id === enrollment.user_id && c.course_id === enrollment.course_id
        );

        return {
          id: enrollment.id,
          user_id: enrollment.user_id,
          course_id: enrollment.course_id,
          enrolled_at: enrollment.enrolled_at,
          completed_at: enrollment.completed_at,
          is_completed: enrollment.is_completed,
          course_title: course?.title || "Unknown Course",
          user_name: profile?.full_name || profile?.username || "Unknown User",
          has_certificate: !!cert,
          certificate_approved: cert?.is_approved || false,
        };
      });

      setAllEnrollments(enrollmentsWithDetails);
    } catch (error: any) {
      toast.error("Failed to fetch enrollments: " + error.message);
    }
  };

  const generateCertificateNumber = () => {
    const date = new Date();
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const random = Math.random().toString(36).substring(2, 8).toUpperCase();
    return `CERT-${year}${month}-${random}`;
  };

  const allocateCertificate = async (enrollment: EnrollmentWithDetails) => {
    setCreatingCert(enrollment.id);
    try {
      const certificateNumber = generateCertificateNumber();
      
      const { error } = await supabase.from("certificates").insert({
        user_id: enrollment.user_id,
        course_id: enrollment.course_id,
        certificate_number: certificateNumber,
        is_approved: true,
        approved_at: new Date().toISOString(),
        approved_by: user?.id,
      });

      if (error) throw error;

      toast.success(`Certificate allocated to ${enrollment.user_name}!`);
      fetchData();
    } catch (error: any) {
      toast.error("Failed to allocate certificate: " + error.message);
    } finally {
      setCreatingCert(null);
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
      fetchData();
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
      fetchData();
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

  const filteredEnrollments = allEnrollments.filter((enrollment) => {
    const matchesSearch =
      enrollment.user_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      enrollment.course_title.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesFilter =
      enrollmentFilter === "all" ||
      (enrollmentFilter === "completed" && enrollment.is_completed) ||
      (enrollmentFilter === "in_progress" && !enrollment.is_completed);

    return matchesSearch && matchesFilter;
  });

  const completedEnrollments = allEnrollments.filter((e) => e.is_completed);
  const pendingCount = certificates.filter((c) => !c.is_approved).length;
  const noCertCount = completedEnrollments.filter((e) => !e.has_certificate).length;
  const totalEnrolled = allEnrollments.length;
  const totalCompleted = completedEnrollments.length;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-mono font-bold text-foreground">
            Manage Students & Certificates
          </h1>
          <div className="flex flex-wrap gap-4 mt-2">
            <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10">
              <Users className="w-4 h-4 text-primary" />
              <span className="text-sm font-mono text-primary">{totalEnrolled} enrolled</span>
            </div>
            <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-secondary/10">
              <GraduationCap className="w-4 h-4 text-secondary" />
              <span className="text-sm font-mono text-secondary">{totalCompleted} completed</span>
            </div>
            {pendingCount > 0 && (
              <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-accent/10">
                <Award className="w-4 h-4 text-accent" />
                <span className="text-sm font-mono text-accent">{pendingCount} pending approval</span>
              </div>
            )}
            {noCertCount > 0 && (
              <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-destructive/10">
                <Award className="w-4 h-4 text-destructive" />
                <span className="text-sm font-mono text-destructive">{noCertCount} need certificate</span>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search by student or course..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 font-mono bg-input border-border"
          />
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-12">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      ) : (
        <Tabs defaultValue="enrollments" className="w-full">
          <TabsList className="grid w-full grid-cols-3 mb-4">
            <TabsTrigger value="enrollments" className="font-mono">
              <Users className="w-4 h-4 mr-2" />
              All Students ({allEnrollments.length})
            </TabsTrigger>
            <TabsTrigger value="completions" className="font-mono">
              <GraduationCap className="w-4 h-4 mr-2" />
              Completed ({completedEnrollments.length})
            </TabsTrigger>
            <TabsTrigger value="certificates" className="font-mono">
              <Award className="w-4 h-4 mr-2" />
              Certificates ({certificates.length})
            </TabsTrigger>
          </TabsList>

          {/* All Enrolled Students Tab */}
          <TabsContent value="enrollments">
            <div className="mb-4">
              <Select value={enrollmentFilter} onValueChange={(v) => setEnrollmentFilter(v as any)}>
                <SelectTrigger className="w-[200px] font-mono">
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Students</SelectItem>
                  <SelectItem value="completed">Completed Only</SelectItem>
                  <SelectItem value="in_progress">In Progress Only</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {filteredEnrollments.length === 0 ? (
              <div className="text-center py-12">
                <Users className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground font-mono">No enrolled students found</p>
              </div>
            ) : (
              <div className="border border-border rounded-lg overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-muted/50">
                      <TableHead className="font-mono">Student</TableHead>
                      <TableHead className="font-mono">Course</TableHead>
                      <TableHead className="font-mono">Enrolled</TableHead>
                      <TableHead className="font-mono">Progress</TableHead>
                      <TableHead className="font-mono">Certificate</TableHead>
                      <TableHead className="font-mono text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredEnrollments.map((enrollment) => (
                      <TableRow key={enrollment.id}>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <div className="p-2 rounded-full bg-primary/10">
                              <User className="w-4 h-4 text-primary" />
                            </div>
                            <span className="font-mono font-medium">{enrollment.user_name}</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <BookOpen className="w-4 h-4 text-muted-foreground" />
                            <span className="font-mono text-muted-foreground">{enrollment.course_title}</span>
                          </div>
                        </TableCell>
                        <TableCell className="font-mono text-sm text-muted-foreground">
                          {format(new Date(enrollment.enrolled_at), "MMM dd, yyyy")}
                        </TableCell>
                        <TableCell>
                          <span
                            className={`px-3 py-1 rounded-full text-xs font-mono ${
                              enrollment.is_completed
                                ? "bg-secondary/20 text-secondary"
                                : "bg-accent/20 text-accent"
                            }`}
                          >
                            {enrollment.is_completed ? "Completed" : "In Progress"}
                          </span>
                        </TableCell>
                        <TableCell>
                          {enrollment.has_certificate ? (
                            <span
                              className={`px-3 py-1 rounded-full text-xs font-mono ${
                                enrollment.certificate_approved
                                  ? "bg-secondary/20 text-secondary"
                                  : "bg-accent/20 text-accent"
                              }`}
                            >
                              {enrollment.certificate_approved ? "Approved" : "Pending"}
                            </span>
                          ) : enrollment.is_completed ? (
                            <span className="px-3 py-1 rounded-full text-xs font-mono bg-destructive/20 text-destructive">
                              Not Issued
                            </span>
                          ) : (
                            <span className="text-xs font-mono text-muted-foreground">—</span>
                          )}
                        </TableCell>
                        <TableCell className="text-right">
                          {enrollment.is_completed && !enrollment.has_certificate && (
                            <Button
                              size="sm"
                              onClick={() => allocateCertificate(enrollment)}
                              disabled={creatingCert === enrollment.id}
                              className="bg-primary text-primary-foreground hover:bg-primary/80 font-mono"
                            >
                              {creatingCert === enrollment.id ? (
                                <Loader2 className="w-4 h-4 animate-spin mr-1" />
                              ) : (
                                <Plus className="w-4 h-4 mr-1" />
                              )}
                              Issue Certificate
                            </Button>
                          )}
                          {enrollment.has_certificate && (
                            <span className="text-sm text-muted-foreground font-mono">
                              <CheckCircle className="w-4 h-4 inline mr-1 text-secondary" />
                              Issued
                            </span>
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </TabsContent>

          {/* Completed Students Tab */}
          <TabsContent value="completions">
            {completedEnrollments.length === 0 ? (
              <div className="text-center py-12">
                <GraduationCap className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground font-mono">No completed courses yet</p>
              </div>
            ) : (
              <div className="border border-border rounded-lg overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-muted/50">
                      <TableHead className="font-mono">Student</TableHead>
                      <TableHead className="font-mono">Course</TableHead>
                      <TableHead className="font-mono">Completed On</TableHead>
                      <TableHead className="font-mono">Certificate Status</TableHead>
                      <TableHead className="font-mono text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {completedEnrollments
                      .filter((e) =>
                        e.user_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                        e.course_title.toLowerCase().includes(searchTerm.toLowerCase())
                      )
                      .map((enrollment) => (
                        <TableRow key={enrollment.id}>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <div className="p-2 rounded-full bg-secondary/10">
                                <User className="w-4 h-4 text-secondary" />
                              </div>
                              <span className="font-mono font-medium">{enrollment.user_name}</span>
                            </div>
                          </TableCell>
                          <TableCell className="font-mono text-muted-foreground">
                            {enrollment.course_title}
                          </TableCell>
                          <TableCell className="font-mono text-sm text-muted-foreground">
                            {enrollment.completed_at
                              ? format(new Date(enrollment.completed_at), "MMM dd, yyyy")
                              : "—"}
                          </TableCell>
                          <TableCell>
                            {enrollment.has_certificate ? (
                              <span
                                className={`px-3 py-1 rounded-full text-xs font-mono ${
                                  enrollment.certificate_approved
                                    ? "bg-secondary/20 text-secondary"
                                    : "bg-accent/20 text-accent"
                                }`}
                              >
                                {enrollment.certificate_approved ? "Approved" : "Pending Approval"}
                              </span>
                            ) : (
                              <span className="px-3 py-1 rounded-full text-xs font-mono bg-destructive/20 text-destructive">
                                Not Issued
                              </span>
                            )}
                          </TableCell>
                          <TableCell className="text-right">
                            {!enrollment.has_certificate && (
                              <Button
                                size="sm"
                                onClick={() => allocateCertificate(enrollment)}
                                disabled={creatingCert === enrollment.id}
                                className="bg-primary text-primary-foreground hover:bg-primary/80 font-mono"
                              >
                                {creatingCert === enrollment.id ? (
                                  <Loader2 className="w-4 h-4 animate-spin mr-1" />
                                ) : (
                                  <Plus className="w-4 h-4 mr-1" />
                                )}
                                Issue Certificate
                              </Button>
                            )}
                            {enrollment.has_certificate && (
                              <span className="text-sm text-muted-foreground font-mono">
                                <CheckCircle className="w-4 h-4 inline mr-1 text-secondary" />
                                Certificate Issued
                              </span>
                            )}
                          </TableCell>
                        </TableRow>
                      ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </TabsContent>

          {/* Certificates Tab */}
          <TabsContent value="certificates">
            <div className="mb-4">
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

            {filteredCertificates.length === 0 ? (
              <div className="text-center py-12">
                <Award className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground font-mono">No certificates found</p>
              </div>
            ) : (
              <div className="border border-border rounded-lg overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-muted/50">
                      <TableHead className="font-mono">Student</TableHead>
                      <TableHead className="font-mono">Course</TableHead>
                      <TableHead className="font-mono">Certificate #</TableHead>
                      <TableHead className="font-mono">Issued</TableHead>
                      <TableHead className="font-mono">Status</TableHead>
                      <TableHead className="font-mono text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredCertificates.map((cert) => (
                      <TableRow key={cert.id}>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <div className="p-2 rounded-full bg-primary/10">
                              <User className="w-4 h-4 text-primary" />
                            </div>
                            <span className="font-mono font-medium">{cert.user_name}</span>
                          </div>
                        </TableCell>
                        <TableCell className="font-mono text-muted-foreground">
                          {cert.course_title}
                        </TableCell>
                        <TableCell className="font-mono text-xs">
                          #{cert.certificate_number}
                        </TableCell>
                        <TableCell className="font-mono text-sm text-muted-foreground">
                          {format(new Date(cert.issued_at), "MMM dd, yyyy")}
                        </TableCell>
                        <TableCell>
                          <span
                            className={`px-3 py-1 rounded-full text-xs font-mono ${
                              cert.is_approved
                                ? "bg-secondary/20 text-secondary"
                                : "bg-accent/20 text-accent"
                            }`}
                          >
                            {cert.is_approved ? "Approved" : "Pending"}
                          </span>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex items-center justify-end gap-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => setSelectedCertificate(cert)}
                              className="font-mono"
                            >
                              <Eye className="w-4 h-4" />
                            </Button>
                            {!cert.is_approved ? (
                              <Button
                                size="sm"
                                onClick={() => approveCertificate(cert.id)}
                                className="bg-secondary text-secondary-foreground hover:bg-secondary/80 font-mono"
                              >
                                <CheckCircle className="w-4 h-4" />
                              </Button>
                            ) : (
                              <Button
                                variant="destructive"
                                size="sm"
                                onClick={() => revokeCertificate(cert.id)}
                                className="font-mono"
                              >
                                <XCircle className="w-4 h-4" />
                              </Button>
                            )}
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </TabsContent>
        </Tabs>
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
                  <p className="text-sm text-muted-foreground font-mono">Issued On</p>
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
