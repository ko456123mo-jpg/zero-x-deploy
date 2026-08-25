"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";

interface Report {
  id: string;
  projectName: string;
  target: string;
  date: string;
  status: "draft" | "final";
  summary: {
    critical: number;
    high: number;
    medium: number;
    low: number;
    info: number;
  };
  findings: Finding[];
  executiveSummary: string;
}

interface Finding {
  id: string;
  severity: "critical" | "high" | "medium" | "low" | "info";
  title: string;
  description: string;
  evidence: string;
  cve?: string;
  remediation: string;
}

// Mock data for demonstration
const mockReports: Report[] = [
  {
    id: "1",
    projectName: "Corporate Network Audit",
    target: "192.168.1.0/24",
    date: "2026-08-20",
    status: "final",
    summary: { critical: 2, high: 5, medium: 8, low: 3, info: 12 },
    findings: [
      {
        id: "f1",
        severity: "critical",
        title: "Remote Code Execution via SSH",
        description: "OpenSSH version vulnerable to username enumeration leading to RCE",
        evidence: "CVE-2024-1234 successfully exploited in sandbox environment",
        cve: "CVE-2024-1234",
        remediation: "Upgrade OpenSSH to version 8.0 or later",
      },
      {
        id: "f2",
        severity: "high",
        title: "Outdated Apache HTTP Server",
        description: "Apache 2.4.6 contains multiple known vulnerabilities",
        evidence: "Server version identified: Apache/2.4.6 (CentOS)",
        cve: "CVE-2023-5672",
        remediation: "Upgrade Apache to latest stable version",
      },
    ],
    executiveSummary: "This penetration test revealed critical vulnerabilities in the corporate network infrastructure. Immediate action is required to address the identified RCE vulnerability.",
  },
  {
    id: "2",
    projectName: "Web Application Security Test",
    target: "https://app.target.com",
    date: "2026-08-15",
    status: "final",
    summary: { critical: 1, high: 3, medium: 6, low: 4, info: 8 },
    findings: [
      {
        id: "f3",
        severity: "critical",
        title: "SQL Injection in Login Form",
        description: "Authentication bypass via SQL injection",
        evidence: "Parameter: username=' OR 1=1 --",
        cve: "CVE-2024-5678",
        remediation: "Use parameterized queries, implement WAF",
      },
    ],
    executiveSummary: "Critical SQL injection vulnerability allows authentication bypass. Immediate patching required.",
  },
  {
    id: "3",
    projectName: "Mobile Application Assessment",
    target: "com.target.app",
    date: "2026-08-10",
    status: "draft",
    summary: { critical: 0, high: 2, medium: 4, low: 6, info: 5 },
    findings: [
      {
        id: "f4",
        severity: "high",
        title: "Insecure Data Storage",
        description: "Sensitive data stored in plaintext",
        evidence: "/data/data/com.target.app/shared_prefs/",
        remediation: "Encrypt sensitive data using Android Keystore",
      },
    ],
    executiveSummary: "Assessment in progress. Preliminary findings show data storage issues.",
  },
];

export default function ReportsPage() {
  const [reports, setReports] = useState<Report[]>(mockReports);
  const [selectedReport, setSelectedReport] = useState<Report | null>(null);
  const [filter, setFilter] = useState<"all" | "draft" | "final">("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [generatingPdf, setGeneratingPdf] = useState(false);
  const [sortBy, setSortBy] = useState<"date" | "severity">("date");

  const filteredReports = reports
    .filter((r) => filter === "all" || r.status === filter)
    .filter((r) =>
      r.projectName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.target.toLowerCase().includes(searchQuery.toLowerCase())
    )
    .sort((a, b) => {
      if (sortBy === "date") {
        return new Date(b.date).getTime() - new Date(a.date).getTime();
      }
      return b.summary.critical - a.summary.critical;
    });

  const getTotal = (report: Report) =>
    Object.values(report.summary).reduce((a, b) => a + b, 0);

  const generatePDF = async (report: Report) => {
    setGeneratingPdf(true);

    try {
      const doc = new jsPDF();
      const pageWidth = doc.internal.pageSize.getWidth();
      let yPos = 20;

      // Header
      doc.setFontSize(24);
      doc.setTextColor(6, 182, 212);
      doc.text("ZERO-X", pageWidth / 2, yPos, { align: "center" });
      
      yPos += 10;
      doc.setFontSize(12);
      doc.setTextColor(100);
      doc.text("Security Assessment Report", pageWidth / 2, yPos, { align: "center" });

      yPos += 20;

      // Report Info
      doc.setFontSize(16);
      doc.setTextColor(0);
      doc.text(report.projectName, 14, yPos);
      
      yPos += 8;
      doc.setFontSize(10);
      doc.setTextColor(100);
      doc.text(`Target: ${report.target}`, 14, yPos);
      doc.text(`Date: ${report.date}`, 14, yPos + 5);
      doc.text(`Status: ${report.status.toUpperCase()}`, 14, yPos + 10);

      yPos += 25;

      // Executive Summary
      doc.setFontSize(14);
      doc.setTextColor(0);
      doc.text("Executive Summary", 14, yPos);
      
      yPos += 8;
      doc.setFontSize(10);
      doc.setTextColor(60);
      const splitSummary = doc.splitTextToSize(report.executiveSummary, pageWidth - 28);
      doc.text(splitSummary, 14, yPos);
      yPos += splitSummary.length * 5 + 10;

      // Severity Summary
      doc.setFontSize(14);
      doc.setTextColor(0);
      doc.text("Vulnerability Summary", 14, yPos);
      
      yPos += 10;
      
      autoTable(doc, {
        startY: yPos,
        head: [["Severity", "Count"]],
        body: [
          ["Critical", report.summary.critical.toString()],
          ["High", report.summary.high.toString()],
          ["Medium", report.summary.medium.toString()],
          ["Low", report.summary.low.toString()],
          ["Info", report.summary.info.toString()],
        ],
        theme: "grid",
        headStyles: { fillColor: [6, 182, 212] },
        styles: { fontSize: 10 },
        columnStyles: {
          0: { fontStyle: "bold" },
        },
      });

      // @ts-ignore
      yPos = doc.lastAutoTable.finalY + 15;

      // Findings
      if (report.findings.length > 0) {
        doc.setFontSize(14);
        doc.setTextColor(0);
        doc.text("Detailed Findings", 14, yPos);
        
        yPos += 10;

        report.findings.forEach((finding, index) => {
          if (yPos > 250) {
            doc.addPage();
            yPos = 20;
          }

          // Finding header
          const severityColors: Record<string, [number, number, number]> = {
            critical: [239, 68, 68],
            high: [249, 115, 22],
            medium: [245, 158, 11],
            low: [59, 130, 246],
            info: [156, 163, 175],
          };

          const color = severityColors[finding.severity] || [100, 100, 100];
          doc.setFillColor(color[0], color[1], color[2]);
          doc.rect(14, yPos - 4, 4, 4, "F");
          
          doc.setFontSize(12);
          doc.setTextColor(0);
          doc.text(`${index + 1}. ${finding.title}`, 22, yPos);
          
          yPos += 6;
          doc.setFontSize(10);
          doc.setTextColor(100);
          doc.text(`Severity: ${finding.severity.toUpperCase()}`, 22, yPos);
          if (finding.cve) {
            doc.text(`CVE: ${finding.cve}`, 80, yPos);
          }
          
          yPos += 8;
          doc.setTextColor(60);
          const splitDesc = doc.splitTextToSize(finding.description, pageWidth - 36);
          doc.text(splitDesc, 22, yPos);
          yPos += splitDesc.length * 4 + 5;

          // Evidence
          doc.setFontSize(10);
          doc.setTextColor(100);
          doc.text("Evidence:", 22, yPos);
          yPos += 5;
          doc.setFontSize(9);
          doc.setFont("courier");
          doc.setTextColor(80);
          const splitEvidence = doc.splitTextToSize(finding.evidence, pageWidth - 44);
          doc.text(splitEvidence, 22, yPos);
          yPos += splitEvidence.length * 4 + 5;
          doc.setFont("helvetica");
          
          // Remediation
          yPos += 3;
          doc.setFontSize(10);
          doc.setTextColor(100);
          doc.text("Remediation:", 22, yPos);
          yPos += 5;
          doc.setTextColor(60);
          const splitRemediation = doc.splitTextToSize(finding.remediation, pageWidth - 44);
          doc.text(splitRemediation, 22, yPos);
          yPos += splitRemediation.length * 4 + 15;
        });
      }

      // Footer
      const pageCount = doc.getNumberOfPages();
      for (let i = 1; i <= pageCount; i++) {
        doc.setPage(i);
        doc.setFontSize(8);
        doc.setTextColor(150);
        doc.text(
          `Page ${i} of ${pageCount} | Generated by ZERO-X Platform | ${new Date().toLocaleDateString()}`,
          pageWidth / 2,
          doc.internal.pageSize.getHeight() - 10,
          { align: "center" }
        );
      }

      // Save the PDF
      doc.save(`ZERO-X-Report-${report.projectName.replace(/\s+/g, "-")}-${report.date}.pdf`);

    } catch (error) {
      console.error("PDF generation failed:", error);
      alert("Failed to generate PDF. Please try again.");
    } finally {
      setGeneratingPdf(false);
    }
  };

  const exportHTML = (report: Report) => {
    const html = `<!DOCTYPE html>
<html>
<head>
  <title>${report.projectName} - Security Report</title>
  <style>
    body { font-family: Arial, sans-serif; max-width: 800px; margin: 0 auto; padding: 20px; }
    h1 { color: #06b6d4; }
    .finding { border: 1px solid #ddd; padding: 15px; margin: 10px 0; border-radius: 8px; }
    .critical { border-left: 4px solid #ef4444; }
    .high { border-left: 4px solid #f97316; }
    .medium { border-left: 4px solid #f59e0b; }
    .low { border-left: 4px solid #3b82f6; }
    .severity { display: inline-block; padding: 4px 8px; border-radius: 4px; font-weight: bold; }
    .severity.critical { background: #fef2f2; color: #ef4444; }
    .severity.high { background: #fff7ed; color: #f97316; }
    .severity.medium { background: #fffbeb; color: #f59e0b; }
    .evidence { background: #f3f4f6; padding: 10px; font-family: monospace; border-radius: 4px; }
    .summary { display: flex; gap: 10px; }
    .summary-item { padding: 10px 20px; border-radius: 8px; text-align: center; }
    .summary-item.critical { background: #fef2f2; color: #ef4444; }
    .summary-item.high { background: #fff7ed; color: #f97316; }
    .summary-item.medium { background: #fffbeb; color: #f59e0b; }
  </style>
</head>
<body>
  <h1>🎯 ZERO-X Security Report</h1>
  <h2>${report.projectName}</h2>
  <p><strong>Target:</strong> ${report.target}</p>
  <p><strong>Date:</strong> ${report.date}</p>
  <p><strong>Status:</strong> ${report.status.toUpperCase()}</p>
  
  <h3>Executive Summary</h3>
  <p>${report.executiveSummary}</p>
  
  <h3>Vulnerability Summary</h3>
  <div class="summary">
    <div class="summary-item critical"><strong>${report.summary.critical}</strong><br>Critical</div>
    <div class="summary-item high"><strong>${report.summary.high}</strong><br>High</div>
    <div class="summary-item medium"><strong>${report.summary.medium}</strong><br>Medium</div>
    <div class="summary-item"><strong>${report.summary.low}</strong><br>Low</div>
  </div>
  
  <h3>Detailed Findings</h3>
  ${report.findings.map(f => `
    <div class="finding ${f.severity}">
      <h4>${f.title} <span class="severity ${f.severity}">${f.severity.toUpperCase()}</span></h4>
      <p>${f.description}</p>
      ${f.cve ? `<p><strong>CVE:</strong> ${f.cve}</p>` : ''}
      <p><strong>Evidence:</strong></p>
      <div class="evidence">${f.evidence}</div>
      <p><strong>Remediation:</strong> ${f.remediation}</p>
    </div>
  `).join('')}
  
  <footer style="margin-top: 40px; padding-top: 20px; border-top: 1px solid #ddd; color: #666;">
    <p>Generated by ZERO-X Platform | ${new Date().toLocaleString()}</p>
  </footer>
</body>
</html>`;

    const blob = new Blob([html], { type: "text/html" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `ZERO-X-Report-${report.projectName.replace(/\s+/g, "-")}-${report.date}.html`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="min-h-screen bg-zero-bg-primary">
      {/* Header */}
      <header className="bg-zero-bg-secondary border-b border-zero-border px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <Link href="/dashboard" className="flex items-center gap-3">
            <span className="text-3xl">🎯</span>
            <span className="font-display font-bold text-xl text-zero-cyan">ZERO-X</span>
          </Link>
          <nav className="flex items-center gap-6">
            <Link href="/dashboard" className="text-zero-text-secondary hover:text-zero-text-primary">Dashboard</Link>
            <Link href="/reports" className="text-zero-cyan font-medium">Reports</Link>
          </nav>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Page Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-display font-bold mb-2">Security Reports</h1>
            <p className="text-zero-text-secondary">View and export penetration testing reports</p>
          </div>
          <button 
            onClick={() => exportHTML(reports[0])}
            className="btn-secondary text-sm flex items-center gap-2"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
            </svg>
            Export All
          </button>
        </div>

        {/* Filters and Search */}
        <div className="flex flex-col md:flex-row gap-4 mb-6">
          {/* Filter Tabs */}
          <div className="flex gap-2">
            {(["all", "draft", "final"] as const).map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  filter === f 
                    ? "bg-zero-cyan text-zero-bg-primary" 
                    : "bg-zero-bg-secondary text-zero-text-secondary hover:text-zero-text-primary"
                }`}
              >
                {f.charAt(0).toUpperCase() + f.slice(1)}
                <span className="ml-2 opacity-60">
                  ({f === "all" ? reports.length : reports.filter(r => r.status === f).length})
                </span>
              </button>
            ))}
          </div>

          {/* Search */}
          <div className="relative flex-1 max-w-md">
            <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-zero-text-secondary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
              type="text"
              placeholder="Search reports..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="input-field pl-10"
            />
          </div>

          {/* Sort */}
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as "date" | "severity")}
            className="input-field w-auto"
          >
            <option value="date">Sort by Date</option>
            <option value="severity">Sort by Severity</option>
          </select>
        </div>

        {/* Reports Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredReports.map((report) => (
            <div 
              key={report.id}
              onClick={() => setSelectedReport(report)}
              className="card hover:glow-cyan cursor-pointer"
            >
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h3 className="font-semibold mb-1">{report.projectName}</h3>
                  <p className="text-zero-text-secondary font-mono text-sm">{report.target}</p>
                </div>
                <span className={`px-2 py-1 rounded text-xs font-medium ${
                  report.status === "final" 
                    ? "bg-zero-emerald/20 text-zero-emerald" 
                    : "bg-zero-amber/20 text-zero-amber"
                }`}>
                  {report.status.toUpperCase()}
                </span>
              </div>

              <div className="flex items-center gap-4 mb-4 text-sm text-zero-text-secondary">
                <span>{report.date}</span>
                <span>•</span>
                <span>{getTotal(report)} findings</span>
              </div>

              {/* Severity Bar */}
              <div className="flex h-2 rounded-full overflow-hidden bg-zero-bg-tertiary mb-4">
                {report.summary.critical > 0 && (
                  <div 
                    className="bg-zero-red" 
                    style={{ width: `${(report.summary.critical / getTotal(report)) * 100}%` }} 
                  />
                )}
                {report.summary.high > 0 && (
                  <div 
                    className="bg-orange-500" 
                    style={{ width: `${(report.summary.high / getTotal(report)) * 100}%` }} 
                  />
                )}
                {report.summary.medium > 0 && (
                  <div 
                    className="bg-zero-amber" 
                    style={{ width: `${(report.summary.medium / getTotal(report)) * 100}%` }} 
                  />
                )}
                {report.summary.low > 0 && (
                  <div 
                    className="bg-blue-400" 
                    style={{ width: `${(report.summary.low / getTotal(report)) * 100}%` }} 
                  />
                )}
                {report.summary.info > 0 && (
                  <div 
                    className="bg-zero-text-secondary" 
                    style={{ width: `${(report.summary.info / getTotal(report)) * 100}%` }} 
                  />
                )}
              </div>

              <div className="flex items-center justify-between pt-4 border-t border-zero-border">
                <div className="flex gap-2">
                  {report.summary.critical > 0 && (
                    <span className="px-2 py-0.5 rounded bg-zero-red/20 text-zero-red text-xs font-medium">
                      {report.summary.critical}C
                    </span>
                  )}
                  {report.summary.high > 0 && (
                    <span className="px-2 py-0.5 rounded bg-orange-500/20 text-orange-500 text-xs font-medium">
                      {report.summary.high}H
                    </span>
                  )}
                  {report.summary.medium > 0 && (
                    <span className="px-2 py-0.5 rounded bg-zero-amber/20 text-zero-amber text-xs font-medium">
                      {report.summary.medium}M
                    </span>
                  )}
                </div>
                <div className="flex gap-2">
                  <button 
                    onClick={(e) => {
                      e.stopPropagation();
                      generatePDF(report);
                    }}
                    className="p-2 rounded-lg bg-zero-bg-tertiary hover:bg-zero-bg-primary text-zero-text-secondary hover:text-zero-cyan transition-colors"
                    title="Download PDF"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                  </button>
                  <span className="text-zero-cyan text-sm flex items-center gap-1">
                    View
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>

        {filteredReports.length === 0 && (
          <div className="text-center py-16">
            <span className="text-6xl mb-4 block">📋</span>
            <h3 className="text-xl font-semibold mb-2">No reports found</h3>
            <p className="text-zero-text-secondary">
              {searchQuery ? "Try adjusting your search or filters" : "Complete a penetration test to generate reports"}
            </p>
          </div>
        )}
      </div>

      {/* Report Preview Modal */}
      {selectedReport && (
        <div 
          className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-6"
          onClick={() => setSelectedReport(null)}
        >
          <div 
            className="glass max-w-4xl w-full max-h-[85vh] overflow-auto rounded-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="sticky top-0 bg-zero-bg-secondary border-b border-zero-border p-6 flex items-center justify-between z-10">
              <div>
                <h2 className="text-2xl font-display font-bold">{selectedReport.projectName}</h2>
                <p className="text-zero-text-secondary">{selectedReport.target} • {selectedReport.date}</p>
              </div>
              <div className="flex items-center gap-3">
                <button 
                  onClick={() => generatePDF(selectedReport)}
                  disabled={generatingPdf}
                  className="btn-secondary flex items-center gap-2"
                >
                  {generatingPdf ? (
                    <>
                      <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                      </svg>
                      Generating...
                    </>
                  ) : (
                    <>
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                      PDF
                    </>
                  )}
                </button>
                <button 
                  onClick={() => exportHTML(selectedReport)}
                  className="btn-secondary flex items-center gap-2"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
                  </svg>
                  HTML
                </button>
                <button 
                  onClick={() => setSelectedReport(null)}
                  className="p-2 rounded-lg hover:bg-zero-bg-tertiary text-zero-text-secondary"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>

            <div className="p-8 space-y-8">
              {/* Executive Summary */}
              <section>
                <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                  <span>📊</span> Executive Summary
                </h3>
                <div className="bg-zero-bg-tertiary rounded-lg p-6">
                  <p className="text-zero-text-secondary mb-4">
                    {selectedReport.executiveSummary}
                  </p>
                  <div className="flex items-center gap-6 text-sm">
                    <div className="flex items-center gap-2">
                      <span className="w-3 h-3 rounded-full bg-zero-red"></span>
                      <span className="text-zero-red font-medium">{selectedReport.summary.critical} Critical</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="w-3 h-3 rounded-full bg-orange-500"></span>
                      <span className="text-orange-500 font-medium">{selectedReport.summary.high} High</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="w-3 h-3 rounded-full bg-zero-amber"></span>
                      <span className="text-zero-amber font-medium">{selectedReport.summary.medium} Medium</span>
                    </div>
                  </div>
                </div>
              </section>

              {/* Findings */}
              <section>
                <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                  <span>🔍</span> Detailed Findings ({selectedReport.findings.length})
                </h3>
                <div className="space-y-4">
                  {selectedReport.findings.map((finding, index) => (
                    <div 
                      key={finding.id}
                      className={`bg-zero-bg-tertiary rounded-lg p-4 border-l-4 ${
                        finding.severity === "critical" ? "border-zero-red" :
                        finding.severity === "high" ? "border-orange-500" :
                        finding.severity === "medium" ? "border-zero-amber" :
                        "border-blue-400"
                      }`}
                    >
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <span className="font-semibold">{index + 1}. {finding.title}</span>
                          <span className={`px-2 py-0.5 rounded text-xs font-medium uppercase ${
                            finding.severity === "critical" ? "bg-zero-red/20 text-zero-red" :
                            finding.severity === "high" ? "bg-orange-500/20 text-orange-500" :
                            finding.severity === "medium" ? "bg-zero-amber/20 text-zero-amber" :
                            "bg-blue-400/20 text-blue-400"
                          }`}>
                            {finding.severity}
                          </span>
                        </div>
                        {finding.cve && (
                          <span className="text-zero-cyan font-mono text-sm">{finding.cve}</span>
                        )}
                      </div>
                      <p className="text-zero-text-secondary text-sm mb-3">{finding.description}</p>
                      <details className="text-xs">
                        <summary className="cursor-pointer text-zero-cyan hover:underline mb-2">View Evidence</summary>
                        <pre className="p-3 bg-zero-bg-primary rounded font-mono whitespace-pre-wrap">
                          {finding.evidence}
                        </pre>
                      </details>
                      <div className="mt-3 pt-3 border-t border-zero-border">
                        <p className="text-xs text-zero-text-secondary">
                          <strong>Remediation:</strong> {finding.remediation}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
