import React from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  Shield,
  ArrowLeft,
  Lock,
  FileText,
  Eye,
  Bell,
  Database,
  UserCheck,
  Building2,
  Mail,
  ExternalLink,
  CheckCircle2,
  MapPin,
  Smartphone
} from "lucide-react";
import { Button } from "@/shared/components/ui/button";

const PrivacyPolicyPage: React.FC = () => {
  const navigate = useNavigate();

  const sections = [
    {
      id: "info-collect",
      icon: Database,
      title: "1. Information We Collect",
      content: (
        <div className="space-y-4 text-sm text-muted-foreground leading-relaxed">
          <p>
            Depending on how the App is used by your school or organization, we may collect the following information:
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 my-3">
            <div className="bg-card border border-border/80 rounded-xl p-4 shadow-sm hover:border-primary/40 transition-colors">
              <div className="flex items-center gap-2 mb-2">
                <div className="p-1.5 rounded-lg bg-primary/10 text-primary">
                  <UserCheck className="w-4 h-4" />
                </div>
                <h4 className="font-bold text-foreground text-sm">Account & User Information</h4>
              </div>
              <ul className="list-disc list-inside space-y-1 text-xs">
                <li>Name & Username</li>
                <li>Email address & User ID</li>
                <li>Student or employee identification info</li>
                <li>School, campus, class, section, or organizational details</li>
              </ul>
            </div>

            <div className="bg-card border border-border/80 rounded-xl p-4 shadow-sm hover:border-primary/40 transition-colors">
              <div className="flex items-center gap-2 mb-2">
                <div className="p-1.5 rounded-lg bg-primary/10 text-primary">
                  <Building2 className="w-4 h-4" />
                </div>
                <h4 className="font-bold text-foreground text-sm">Academic & School Information</h4>
              </div>
              <ul className="list-disc list-inside space-y-1 text-xs">
                <li>Student enrollment records</li>
                <li>Class and section assignments</li>
                <li>Attendance and leave records</li>
                <li>Academic marks and performance metrics</li>
                <li>Official school-related administrative data</li>
              </ul>
            </div>

            <div className="bg-card border border-border/80 rounded-xl p-4 shadow-sm hover:border-primary/40 transition-colors">
              <div className="flex items-center gap-2 mb-2">
                <div className="p-1.5 rounded-lg bg-primary/10 text-primary">
                  <MapPin className="w-4 h-4" />
                </div>
                <h4 className="font-bold text-foreground text-sm">Attendance & Location Data</h4>
              </div>
              <p className="text-xs mb-2">
                If attendance or geofencing features are enabled by the school, the App may collect location information to verify whether the user is within an authorized attendance zone.
              </p>
              <div className="bg-primary/5 text-primary text-[11px] font-semibold px-2.5 py-1.5 rounded-md inline-block">
                ✓ Location is never sold to third parties
              </div>
            </div>

            <div className="bg-card border border-border/80 rounded-xl p-4 shadow-sm hover:border-primary/40 transition-colors">
              <div className="flex items-center gap-2 mb-2">
                <div className="p-1.5 rounded-lg bg-primary/10 text-primary">
                  <Smartphone className="w-4 h-4" />
                </div>
                <h4 className="font-bold text-foreground text-sm">Device & Technical Info</h4>
              </div>
              <ul className="list-disc list-inside space-y-1 text-xs">
                <li>Device model & Operating system</li>
                <li>Application version & Device identifiers</li>
                <li>IP address & Diagnostics</li>
                <li>Firebase Cloud Messaging (FCM) push tokens</li>
              </ul>
            </div>
          </div>
        </div>
      )
    },
    {
      id: "how-we-use",
      icon: Eye,
      title: "2. How We Use Information",
      content: (
        <div className="space-y-3 text-sm text-muted-foreground leading-relaxed">
          <p>We use collected information strictly to provide and enhance our educational services:</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
            {[
              "Provide and operate SAFT School services",
              "Authenticate users and maintain secure accounts",
              "Display student and school performance data",
              "Manage and record accurate daily attendance",
              "Verify presence through geofencing where enabled",
              "Send important school-related notifications & alerts",
              "Maintain platform security and prevent unauthorized access",
              "Diagnose technical errors & improve reliability",
              "Comply with institutional and legal requirements"
            ].map((item, idx) => (
              <div key={idx} className="flex items-start gap-2 bg-card/60 border border-border/50 p-2.5 rounded-lg">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <span>{item}</span>
              </div>
            ))}
          </div>
          <div className="p-3 bg-amber-500/10 border border-amber-500/20 rounded-lg text-amber-700 dark:text-amber-300 text-xs font-semibold">
            We strictly do not sell, rent, or monetize users' personal or educational data.
          </div>
        </div>
      )
    },
    {
      id: "notifications",
      icon: Bell,
      title: "3. Notifications",
      content: (
        <div className="space-y-2 text-sm text-muted-foreground leading-relaxed">
          <p>
            SAFT School may use <strong>Firebase Cloud Messaging (FCM)</strong> to send real-time notifications, including:
          </p>
          <ul className="list-disc list-inside space-y-1 text-xs ml-2">
            <li>Important school announcements and circulars</li>
            <li>Attendance alerts and check-in / check-out updates</li>
            <li>Academic marks, test results, and fee notices</li>
            <li>Critical account or system security notifications</li>
          </ul>
          <p className="text-xs pt-1">
            You can modify or disable notification preferences anytime through your device settings.
          </p>
        </div>
      )
    },
    {
      id: "third-party",
      icon: ExternalLink,
      title: "4. Third-Party Services",
      content: (
        <div className="space-y-2 text-sm text-muted-foreground leading-relaxed">
          <p>
            SAFT School uses select trusted infrastructure providers to deliver high availability and security:
          </p>
          <div className="bg-card border border-border p-3.5 rounded-lg text-xs space-y-1">
            <span className="font-bold text-foreground">Firebase / Google Cloud Services:</span>
            <p>
              Utilized for push notification delivery, application diagnostics, crash analytics, and secure cloud authentication.
              These services process data according to their respective privacy standards and strict data processing agreements.
            </p>
          </div>
        </div>
      )
    },
    {
      id: "security",
      icon: Lock,
      title: "5. Data Security",
      content: (
        <div className="space-y-3 text-sm text-muted-foreground leading-relaxed">
          <p>
            We implement industry-standard administrative, physical, and technical safeguards to secure your information:
          </p>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-center">
            {[
              { title: "Encrypted Transit", desc: "TLS / HTTPS encryption" },
              { title: "Access Controls", desc: "Role-based authorization" },
              { title: "Protected Servers", desc: "Firewalled infrastructure" },
              { title: "Routine Audits", desc: "Continuous monitoring" }
            ].map((s, idx) => (
              <div key={idx} className="bg-card border border-border p-3 rounded-lg">
                <div className="font-bold text-foreground text-xs">{s.title}</div>
                <div className="text-[11px] text-muted-foreground mt-0.5">{s.desc}</div>
              </div>
            ))}
          </div>
          <p className="text-xs text-muted-foreground italic">
            While we implement robust security protocols, please note that no method of transmission or digital storage is completely 100% impenetrable.
          </p>
        </div>
      )
    },
    {
      id: "retention-sharing",
      icon: FileText,
      title: "6. Data Retention & Sharing",
      content: (
        <div className="space-y-3 text-sm text-muted-foreground leading-relaxed">
          <p>
            <strong>Retention:</strong> We retain information only for as long as necessary to provide school services, fulfill legitimate administrative operations, comply with regulatory requirements, or maintain official school archival records as dictated by school policy.
          </p>
          <p>
            <strong>Sharing:</strong> Information is never traded or shared with commercial marketers. It is shared strictly with authorized school personnel, necessary technical service providers, or when compelled by legitimate law enforcement processes.
          </p>
        </div>
      )
    },
    {
      id: "children-privacy",
      icon: Shield,
      title: "7. Children's Privacy",
      content: (
        <div className="space-y-2 text-sm text-muted-foreground leading-relaxed">
          <p>
            SAFT School is an educational tool used by students, including minors under 18, under the strict supervision, governance, and administration of their educational institution.
          </p>
          <p className="text-xs">
            We do not knowingly collect personal data for commercial advertising or build behavioral advertising profiles on minors. Schools and institutional administrators are responsible for obtaining appropriate parental or guardian consents in compliance with local education privacy regulations.
          </p>
        </div>
      )
    },
    {
      id: "user-rights",
      icon: UserCheck,
      title: "8. User Rights & Data Deletion",
      content: (
        <div className="space-y-3 text-sm text-muted-foreground leading-relaxed">
          <p>
            Users and guardians possess rights regarding their personal data, including the right to request access, rectify inaccurate records, or seek account deletion.
          </p>
          <div className="bg-card border border-border p-4 rounded-xl space-y-2">
            <h4 className="font-bold text-foreground text-xs">Requesting Account or Data Deletion:</h4>
            <p className="text-xs">
              To request deletion of your account or personal data, please contact our support team or your school's administration. Note that official academic records (grades, attendance, fee ledgers) may be retained as required by educational regulatory boards.
            </p>
          </div>
        </div>
      )
    },
    {
      id: "contact",
      icon: Mail,
      title: "9. Contact Information",
      content: (
        <div className="bg-card border border-border p-5 rounded-xl text-sm space-y-3">
          <p className="text-muted-foreground text-xs">
            If you have questions, feedback, or requests regarding this Privacy Policy or the SAFT School application, please reach out to us:
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2 text-xs">
            <div>
              <div className="font-semibold text-foreground">Company</div>
              <div className="text-muted-foreground">Synctecho Soft</div>
            </div>
            <div>
              <div className="font-semibold text-foreground">Application</div>
              <div className="text-muted-foreground">SAFT School</div>
            </div>
            <div>
              <div className="font-semibold text-foreground">Inquiries</div>
              <div className="text-primary font-medium">support@synctecho.com</div>
            </div>
          </div>
        </div>
      )
    }
  ];

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Top Navigation Header */}
      <header className="sticky top-0 z-20 flex items-center justify-between bg-card/95 backdrop-blur border-b border-border px-6 py-3.5 shadow-sm">
        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate(-1)}
            className="flex items-center gap-1.5 text-xs font-semibold text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="w-4 h-4" />
            Back
          </Button>
          <div className="h-4 w-px bg-border mx-1" />
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-primary/10 text-primary">
              <Shield className="w-4 h-4" />
            </div>
            <h1 className="text-sm font-bold text-foreground tracking-tight">CoolPoint International Privacy Policy</h1>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <span className="text-[11px] text-muted-foreground hidden sm:inline-block">
            Effective Date: <strong className="text-foreground">August 24, 2026</strong>
          </span>
          <Button
            variant="outline"
            size="sm"
            className="text-xs h-8"
            onClick={() => navigate("/modules")}
          >
            Modules
          </Button>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 max-w-4xl w-full mx-auto p-6 md:p-10">
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35 }}
          className="space-y-8"
        >
          {/* Hero Banner */}
          <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-primary/15 via-primary/5 to-transparent border border-primary/20 p-6 md:p-8">
            <div className="max-w-2xl">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-semibold mb-3 border border-primary/20">
                <Lock className="w-3.5 h-3.5" />
                Your Privacy & Data Protection
              </div>
              <h2 className="text-2xl md:text-3xl font-extrabold text-foreground tracking-tight mb-2">
                SAFT School Privacy Policy
              </h2>
              <p className="text-muted-foreground text-xs md:text-sm leading-relaxed">
                Synctecho Soft ("we", "our", or "us") operates the <strong>SAFT School</strong> mobile application and web portal (collectively, the "Services" or "App").
                This Privacy Policy explains how we collect, use, store, and protect information across both our mobile apps and web application platforms.
              </p>
            </div>
          </div>

          {/* Policy Sections */}
          <div className="space-y-6">
            {sections.map((section, idx) => (
              <motion.section
                key={section.id}
                id={section.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: idx * 0.05 }}
                className="bg-card border border-border rounded-xl p-5 md:p-6 shadow-sm hover:shadow-md transition-shadow"
              >
                <div className="flex items-center gap-3 mb-4 border-b border-border/60 pb-3">
                  <div className="p-2 rounded-lg bg-primary/10 text-primary shrink-0">
                    <section.icon className="w-5 h-5" />
                  </div>
                  <h3 className="text-base md:text-lg font-bold text-foreground tracking-tight">
                    {section.title}
                  </h3>
                </div>
                <div>{section.content}</div>
              </motion.section>
            ))}
          </div>

          {/* Bottom Last Updated Callout */}
          <div className="text-center py-4 border-t border-border text-xs text-muted-foreground">
            <p>Last Updated: <strong>August 24, 2026</strong> • Synctecho Soft</p>
          </div>
        </motion.div>
      </main>

      {/* Footer */}
      <footer className="mt-auto border-t border-border bg-card/60 py-6 text-center text-xs text-muted-foreground">
        <div className="max-w-4xl mx-auto px-6 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p>© 2026 Synctecho Soft. All rights reserved.</p>
          <div className="flex items-center gap-4 text-xs font-medium">
            <button onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })} className="hover:text-primary transition-colors">
              Back to Top
            </button>
            <span>•</span>
            <button onClick={() => navigate("/modules")} className="hover:text-primary transition-colors">
              Modules
            </button>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default PrivacyPolicyPage;
