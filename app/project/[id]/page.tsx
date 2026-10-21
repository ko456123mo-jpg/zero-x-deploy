"use client";

import { useState, useEffect, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";

type AgentType = "orchestrator" | "planner" | "recon" | "exploit" | "post" | "report";
type MessageType = "text" | "command" | "output" | "plan" | "finding";
type SessionStatus = "planning" | "approved" | "executing" | "reporting" | "done";
type Severity = "critical" | "high" | "medium" | "low" | "info";

interface Message {
  id: string;
  agent: AgentType;
  content: string;
  type: MessageType;
  timestamp: number;
}

interface Finding {
  id: string;
  severity: Severity;
  title: string;
  description: string;
  evidence: string;
  cve?: string;
}

const agentConfig: Record<AgentType, { icon: string; color: string; name: string }> = {
  orchestrator: { icon: "🎛️", color: "text-zero-purple", name: "Orchestrator" },
  planner: { icon: "📋", color: "text-zero-cyan", name: "Planner" },
  recon: { icon: "🔍", color: "text-zero-emerald", name: "Recon" },
  exploit: { icon: "💥", color: "text-zero-red", name: "Exploitation" },
  post: { icon: "🎯", color: "text-zero-amber", name: "Post-Exploit" },
  report: { icon: "📊", color: "text-blue-400", name: "Reporting" },
};

const mockMessages: Message[] = [
  { id: "1", agent: "orchestrator", content: "ZERO-X Platform initialized. Awaiting target authorization.", type: "text", timestamp: Date.now() - 30000 },
  { id: "2", agent: "planner", content: "Target received: 192.168.1.0/24\n\nGenerating attack strategy based on network reconnaissance...\n\nProposed Kill Chain:\n1. Network Discovery (Nmap)\n2. Port & Service Enumeration\n3. Vulnerability Assessment\n4. Exploitation\n5. Post-Exploitation\n6. Report Generation", type: "plan", timestamp: Date.now() - 25000 },
  { id: "3", agent: "orchestrator", content: "Plan received. Awaiting user approval to proceed.", type: "text", timestamp: Date.now() - 24000 },
];

const mockFindings: Finding[] = [
  { id: "1", severity: "critical", title: "Open SSH on Port 22", description: "SSH service accessible without rate limiting", evidence: "nmap -sV 192.168.1.1 -p 22\nPORT   STATE SERVICE VERSION\n22/tcp open  ssh     OpenSSH 7.4", cve: "CVE-2024-1234" },
  { id: "2", severity: "high", title: "Outdated Apache Version", description: "Apache 2.4.6 with known vulnerabilities", evidence: "Server: Apache/2.4.6 (CentOS)", cve: "CVE-2023-1234" },
  { id: "3", severity: "medium", title: "Missing SPF Record", description: "Email spoofing possible", evidence: "dig TXT target.com +short\n(No SPF record found)", },
  { id: "4", severity: "info", title: "Open DNS Resolver", description: "DNS recursion enabled", evidence: "dnsdict6 -d target.com\nDNS Resolver: RECURSION ENABLED" },
];

const simulatedMessages: Record<string, { agent: AgentType; content: string; type: MessageType; delay: number }[]> = {
  planning: [],
  approved: [
    { agent: "orchestrator", content: "Authorization received. Initiating Kill Chain.", type: "text", delay: 500 },
    { agent: "recon", content: "Starting network discovery on 192.168.1.0/24...", type: "text", delay: 1000 },
    { agent: "recon", content: "nmap -sn -PR 192.168.1.0/24 -oG - | grep Host", type: "command", delay: 1500 },
    { agent: "recon", content: "Host: 192.168.1.1 (router.local) Status: Up\nHost: 192.168.1.10 (server.local) Status: Up\nHost: 192.168.1.20 (workstation.local) Status: Up\n...\n[15 hosts discovered]", type: "output", delay: 3000 },
    { agent: "planner", content: "Network scan complete. 15 hosts discovered. Proceeding with detailed port scan.", type: "text", delay: 3500 },
    { agent: "recon", content: "nmap -sV -sC -p- 192.168.1.10 -oA full_scan", type: "command", delay: 4000 },
    { agent: "recon", content: "PORT     STATE SERVICE  VERSION\n22/tcp   open  ssh      OpenSSH 7.4\n80/tcp   open  http     Apache 2.4.6\n443/tcp  open  https    Apache 2.4.6\n3306/tcp open  mysql    MySQL 5.7.32", type: "output", delay: 6000 },
    { agent: "exploit", content: "Vulnerability assessment initiated on discovered services...", type: "text", delay: 6500 },
    { agent: "exploit", content: "searchsploit OpenSSH 7.4", type: "command", delay: 7000 },
    { agent: "exploit", content: "OpenSSH 7.4 - Username Enumeration (CVE-2024-1234)\nOpenSSH < 7.7 - Remote Code Execution", type: "output", delay: 8500 },
    { agent: "exploit", content: "Attempting exploitation of CVE-2024-1234...", type: "text", delay: 9000 },
    { agent: "exploit", content: "[!] Payload sent successfully\n[!] Received shell connection\n[!] Root access obtained", type: "output", delay: 11000 },
  ],
};

export default function WarRoomPage() {
  const params = useParams();
  const router = useRouter();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  const [status, setStatus] = useState<SessionStatus>("planning");
  const [messages, setMessages] = useState<Message[]>(mockMessages);
  const [findings, setFindings] = useState<Finding[]>([]);
  const [showDisclaimer, setShowDisclaimer] = useState(true);
  const [disclaimerSigned, setDisclaimerSigned] = useState(false);
  // مدة الجلسة تُحسب بعد التركيب فقط — تجنّباً لاستدعاء دالة غير نقية أثناء الرندر
  const [elapsedSeconds, setElapsedSeconds] = useState(0);

  useEffect(() => {
    const started = Date.now();
    const id = setInterval(() => {
      setElapsedSeconds(Math.floor((Date.now() - started) / 1000));
    }, 1000);
    return () => clearInterval(id);
  }, []);
  const [showPlan, setShowPlan] = useState(true);
  const [typingMessage, setTypingMessage] = useState<string | null>(null);
  const [isSimulating, setIsSimulating] = useState(false);

  const projectId = params.id;

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const addMessage = (agent: AgentType, content: string, type: MessageType) => {
    const newMsg: Message = {
      id: Date.now().toString(),
      agent,
      content,
      type,
      timestamp: Date.now(),
    };
    setMessages(prev => [...prev, newMsg]);
  };

  const addFinding = (finding: Omit<Finding, "id">) => {
    const newFinding: Finding = {
      ...finding,
      id: Date.now().toString(),
    };
    setFindings(prev => [...prev, newFinding]);
  };

  const handleApprovePlan = () => {
    setStatus("approved");
    setShowPlan(false);
    startSimulation();
  };

  const startSimulation = async () => {
    setIsSimulating(true);
    const steps = simulatedMessages.approved;
    
    for (const step of steps) {
      await new Promise(resolve => setTimeout(resolve, step.delay));
      addMessage(step.agent, step.content, step.type);
      
      if (step.type === "output" && step.agent === "exploit" && step.content.includes("Root access")) {
        setTimeout(() => {
          addFinding({
            severity: "critical",
            title: "Remote Code Execution via SSH",
            description: "Successfully exploited CVE-2024-1234 to gain root access",
            evidence: step.content,
            cve: "CVE-2024-1234",
          });
          addMessage("post", "Access gained. Initiating post-exploitation data collection...", "text", );
          setTimeout(() => {
            addMessage("post", "ls -la /etc/shadow\nroot:$6$xyz...:18921:0:99999:7:::\n\ncat /etc/passwd | grep sudo\nroot:x:0:0:root:/root:/bin/bash\nadmin:x:1000:1000:Admin:/home/admin:/bin/bash", "output");
            addFinding({
              severity: "high",
              title: "Sudo Configuration Weakness",
              description: "User 'admin' can run all commands without password",
              evidence: "admin ALL=(ALL) NOPASSWD: ALL",
            });
          }, 3000);
          setTimeout(() => {
            addMessage("report", "Generating comprehensive security assessment report...", "text");
            setStatus("reporting");
          }, 6000);
          setTimeout(() => {
            setStatus("done");
            setIsSimulating(false);
            addMessage("orchestrator", "Kill Chain completed successfully. All findings documented.", "text");
          }, 10000);
        }, 500);
      }
    }
  };

  const getAgentIcon = (agent: AgentType) => agentConfig[agent].icon;
  const getAgentColor = (agent: AgentType) => agentConfig[agent].color;
  const getAgentName = (agent: AgentType) => agentConfig[agent].name;

  const getSeverityStyle = (severity: Severity) => {
    const styles: Record<Severity, string> = {
      critical: "severity-critical",
      high: "severity-high",
      medium: "severity-medium",
      low: "severity-low",
      info: "severity-info",
    };
    return styles[severity];
  };

  return (
    <div className="min-h-screen bg-zero-bg-primary flex flex-col">
      {/* Disclaimer Modal */}
      {showDisclaimer && (
        <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-6">
          <div className="glass max-w-2xl w-full max-h-[80vh] overflow-auto rounded-xl p-8">
            <div className="flex items-center gap-3 mb-6">
              <span className="text-4xl">⚠️</span>
              <div>
                <h2 className="text-2xl font-display font-bold">Legal Authorization Required</h2>
                <p className="text-zero-text-secondary">Before proceeding with any testing</p>
              </div>
            </div>
            
            <div className="space-y-4 mb-6 text-zero-text-secondary">
              <p>By proceeding with this penetration test, you acknowledge and agree that:</p>
              <ul className="list-disc list-inside space-y-2">
                <li>You have explicit written authorization to test the target: <strong className="text-zero-text-primary">192.168.1.0/24</strong></li>
                <li>You own or have legal permission to access all systems within scope</li>
                <li>All testing activities will be limited to the defined scope</li>
                <li>You understand and accept responsibility for any unintended impacts</li>
                <li>All operations will be logged for audit purposes</li>
              </ul>
              <div className="p-4 bg-zero-red/10 border border-zero-red rounded-lg mt-4">
                <p className="text-zero-red font-medium">
                  ⚠️ WARNING: Unauthorized access to computer systems is illegal and punishable by law. 
                  ZERO-X platform logs all activities and should only be used ethically.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3 mb-6">
              <input
                type="checkbox"
                id="disclaimer"
                checked={disclaimerSigned}
                onChange={(e) => setDisclaimerSigned(e.target.checked)}
                className="accent-zero-cyan w-5 h-5"
              />
              <label htmlFor="disclaimer" className="text-sm">
                I have read, understood, and agree to the terms above. I confirm I have legal authorization to test this target.
              </label>
            </div>

            <div className="flex gap-4">
              <button
                onClick={() => {
                  if (disclaimerSigned) {
                    setShowDisclaimer(false);
                    addMessage("orchestrator", "Authorization verified. Planning phase initiated.", "text");
                  }
                }}
                disabled={!disclaimerSigned}
                className="btn-primary flex-1"
              >
                Accept & Continue
              </button>
              <Link href="/dashboard" className="btn-secondary">
                Cancel
              </Link>
            </div>
          </div>
        </div>
      )}

      {/* Header */}
      <header className="bg-zero-bg-secondary border-b border-zero-border px-6 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/dashboard" className="text-zero-text-secondary hover:text-zero-text-primary">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </Link>
            <div>
              <h1 className="font-display font-bold text-lg flex items-center gap-2">
                <span className="text-zero-cyan">WAR ROOM</span>
                <span className="text-zero-text-secondary">|</span>
                <span>Project #{projectId}</span>
              </h1>
              <p className="text-zero-text-secondary text-sm font-mono">192.168.1.0/24</p>
            </div>
          </div>
          
          <div className="flex items-center gap-4">
            <span className={`px-3 py-1 rounded-full text-xs font-medium ${
              status === "planning" ? "bg-zero-amber/20 text-zero-amber" :
              status === "approved" || status === "executing" ? "bg-zero-cyan/20 text-zero-cyan" :
              status === "reporting" ? "bg-zero-purple/20 text-zero-purple" :
              "bg-zero-emerald/20 text-zero-emerald"
            }`}>
              {status.toUpperCase()}
            </span>
            <button className="btn-secondary text-sm">
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
              </svg>
              Export
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Agent Chat Panel */}
        <div className="flex-1 flex flex-col border-r border-zero-border">
          {/* Plan Approval Banner */}
          {showPlan && status === "planning" && (
            <div className="bg-zero-cyan/10 border-b border-zero-cyan p-4">
              <div className="flex items-center justify-between max-w-4xl mx-auto">
                <div>
                  <h3 className="font-semibold flex items-center gap-2">
                    <span>📋</span> Attack Plan Ready for Review
                  </h3>
                  <p className="text-zero-text-secondary text-sm mt-1">
                    Planner has generated a comprehensive test strategy. Review and approve to proceed.
                  </p>
                </div>
                <button onClick={handleApprovePlan} className="btn-primary">
                  Approve Plan
                </button>
              </div>
            </div>
          )}

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-6 space-y-4">
            {messages.map((msg) => (
              <div key={msg.id} className="flex gap-3">
                <span className="text-2xl shrink-0">{getAgentIcon(msg.agent)}</span>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className={`font-semibold ${getAgentColor(msg.agent)}`}>
                      {getAgentName(msg.agent)}
                    </span>
                    <span className="text-zero-text-secondary text-xs">
                      {new Date(msg.timestamp).toLocaleTimeString()}
                    </span>
                  </div>
                  {msg.type === "command" && (
                    <div className="bg-zero-bg-tertiary rounded-lg p-4 font-mono text-sm">
                      <span className="text-zero-cyan">$ </span>
                      <span className="text-zero-emerald">{msg.content}</span>
                    </div>
                  )}
                  {msg.type === "output" && (
                    <div className="bg-zero-bg-tertiary rounded-lg p-4 font-mono text-sm whitespace-pre-wrap border-l-2 border-zero-emerald">
                      {msg.content}
                    </div>
                  )}
                  {msg.type === "plan" && (
                    <div className="bg-zero-bg-tertiary rounded-lg p-4 border border-zero-cyan/30">
                      <pre className="font-mono text-sm whitespace-pre-wrap">{msg.content}</pre>
                    </div>
                  )}
                  {msg.type === "text" && (
                    <p className="text-zero-text-primary">{msg.content}</p>
                  )}
                </div>
              </div>
            ))}
            
            {isSimulating && (
              <div className="flex gap-3">
                <span className="text-2xl animate-pulse">🤖</span>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-zero-purple">Orchestrator</span>
                    <span className="text-xs text-zero-text-secondary animate-pulse">Processing...</span>
                  </div>
                  <div className="flex items-center gap-1 mt-1">
                    <span className="w-2 h-2 bg-zero-cyan rounded-full animate-bounce" style={{animationDelay: "0ms"}}></span>
                    <span className="w-2 h-2 bg-zero-cyan rounded-full animate-bounce" style={{animationDelay: "150ms"}}></span>
                    <span className="w-2 h-2 bg-zero-cyan rounded-full animate-bounce" style={{animationDelay: "300ms"}}></span>
                  </div>
                </div>
              </div>
            )}
            
            <div ref={messagesEndRef} />
          </div>
        </div>

        {/* Findings Panel */}
        <div className="w-96 bg-zero-bg-secondary overflow-y-auto">
          <div className="p-4 border-b border-zero-border sticky top-0 bg-zero-bg-secondary">
            <h2 className="font-semibold flex items-center gap-2">
              <span>🎯</span> Findings ({findings.length})
            </h2>
          </div>
          
          <div className="p-4 space-y-4">
            {findings.length === 0 ? (
              <div className="text-center py-8 text-zero-text-secondary">
                <span className="text-4xl mb-4 block">🔍</span>
                <p>No findings yet</p>
                <p className="text-sm">Findings will appear here as the attack progresses</p>
              </div>
            ) : (
              findings.map((finding) => (
                <div 
                  key={finding.id} 
                  className={`card border ${getSeverityStyle(finding.severity)}`}
                >
                  <div className="flex items-start justify-between mb-2">
                    <span className={`px-2 py-0.5 rounded text-xs font-medium uppercase border ${getSeverityStyle(finding.severity)}`}>
                      {finding.severity}
                    </span>
                    {finding.cve && (
                      <span className="text-xs font-mono text-zero-cyan">{finding.cve}</span>
                    )}
                  </div>
                  <h3 className="font-semibold mb-2">{finding.title}</h3>
                  <p className="text-sm text-zero-text-secondary mb-3">{finding.description}</p>
                  <details className="text-xs">
                    <summary className="cursor-pointer text-zero-cyan hover:underline">View Evidence</summary>
                    <pre className="mt-2 p-2 bg-zero-bg-primary rounded font-mono whitespace-pre-wrap">
                      {finding.evidence}
                    </pre>
                  </details>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-zero-bg-secondary border-t border-zero-border px-6 py-2">
        <div className="flex items-center justify-between text-sm text-zero-text-secondary">
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-zero-emerald animate-pulse"></span>
              E2B Sandbox: Active
            </span>
            <span>Session Duration: {elapsedSeconds}s</span>
          </div>
          <div>
            <span className="text-zero-cyan">ZERO-X Platform v1.0</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
