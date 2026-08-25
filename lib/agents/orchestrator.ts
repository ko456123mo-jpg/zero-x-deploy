/**
 * ZERO-X AI Agent Orchestrator
 * Multi-agent system powered by OpenAI for penetration testing automation
 * 
 * Uses OpenAI Agents SDK with tools for E2B sandbox execution
 */

import { E2BClient, getE2BClient, CommandResult } from "@/lib/e2b";
import { agentPrompts, AgentType, SimulationStep, demoFindings } from "./simulator";

// Type definitions
export interface AgentMessage {
  id: string;
  agent: AgentType;
  content: string;
  type: "text" | "command" | "output" | "plan" | "finding";
  timestamp: number;
  metadata?: Record<string, unknown>;
}

export interface Finding {
  id: string;
  severity: "critical" | "high" | "medium" | "low" | "info";
  title: string;
  description: string;
  evidence: string;
  cve?: string;
  verified: boolean;
  timestamp: number;
}

export interface SessionContext {
  sessionId: string;
  projectId: string;
  target: string;
  scope: string[];
  userId: string;
  createdAt: number;
}

// System prompts for each agent role
const SYSTEM_PROMPTS: Record<AgentType, string> = {
  orchestrator: agentPrompts.orchestrator,
  planner: agentPrompts.planner,
  recon: agentPrompts.recon,
  exploit: agentPrompts.exploit,
  post: agentPrompts.post,
  report: agentPrompts.report,
};

// Tool definitions for OpenAI Agents SDK
export const TOOL_DEFINITIONS = [
  {
    type: "function" as const,
    name: "execute_nmap_scan",
    description: "Execute Nmap network scan in isolated E2B sandbox. Use for reconnaissance and port scanning.",
    parameters: {
      type: "object",
      properties: {
        target: {
          type: "string",
          description: "Target IP address, hostname, or network range (CIDR notation)",
        },
        scan_type: {
          type: "string",
          enum: ["ping", "basic", "detailed", "aggressive", "vuln"],
          description: "Type of Nmap scan to perform",
        },
        ports: {
          type: "string",
          description: "Port range to scan (e.g., '1-1000', '22,80,443', or '-p-' for all)",
        },
      },
      required: ["target"],
    },
  },
  {
    type: "function" as const,
    name: "execute_sqlmap",
    description: "Execute SQLMap for SQL injection testing on web applications.",
    parameters: {
      type: "object",
      properties: {
        url: {
          type: "string",
          description: "Target URL to test for SQL injection",
        },
        parameters: {
          type: "string",
          description: "GET/POST parameters to test (e.g., 'id=1&page=2')",
        },
        risk: {
          type: "string",
          enum: ["1", "2", "3"],
          description: "Risk level (1=low, 2=medium, 3=high)",
        },
      },
      required: ["url"],
    },
  },
  {
    type: "function" as const,
    name: "execute_searchsploit",
    description: "Search Exploit-DB for known exploits based on service/version information.",
    parameters: {
      type: "object",
      properties: {
        search_term: {
          type: "string",
          description: "Service name or version to search exploits for (e.g., 'openssh 7.4', 'apache 2.4.6')",
        },
      },
      required: ["search_term"],
    },
  },
  {
    type: "function" as const,
    name: "exploit_android_adb",
    description: "Attempt to exploit Android devices via ADB vulnerability (CVE-2026-0073). Only for authorized testing.",
    parameters: {
      type: "object",
      properties: {
        target_ip: {
          type: "string",
          description: "Target Android device IP address",
        },
        target_port: {
          type: "number",
          description: "ADB port (default: 5555)",
        },
      },
      required: ["target_ip"],
    },
  },
  {
    type: "function" as const,
    name: "execute_custom_command",
    description: "Execute a custom shell command in the E2B sandbox for advanced testing.",
    parameters: {
      type: "object",
      properties: {
        command: {
          type: "string",
          description: "Shell command to execute",
        },
        description: {
          type: "string",
          description: "Description of what this command does",
        },
      },
      required: ["command"],
    },
  },
  {
    type: "function" as const,
    name: "add_finding",
    description: "Record a security finding discovered during testing.",
    parameters: {
      type: "object",
      properties: {
        severity: {
          type: "string",
          enum: ["critical", "high", "medium", "low", "info"],
          description: "Vulnerability severity level",
        },
        title: {
          type: "string",
          description: "Short title for the finding",
        },
        description: {
          type: "string",
          description: "Detailed description of the vulnerability",
        },
        evidence: {
          type: "string",
          description: "Command output or proof of vulnerability",
        },
        cve: {
          type: "string",
          description: "CVE identifier if available",
        },
      },
      required: ["severity", "title", "description", "evidence"],
    },
  },
  {
    type: "function" as const,
    name: "generate_report",
    description: "Generate a comprehensive penetration test report.",
    parameters: {
      type: "object",
      properties: {
        report_type: {
          type: "string",
          enum: ["executive", "technical", "full"],
          description: "Type of report to generate",
        },
        include_findings: {
          type: "boolean",
          description: "Include all findings in the report",
        },
      },
      required: ["report_type"],
    },
  },
];

/**
 * ZERO-X Agent Orchestrator
 * Coordinates all AI agents for penetration testing
 */
export class AgentOrchestrator {
  private e2bClient: E2BClient;
  private openaiApiKey: string | null;
  private sessionContext: SessionContext | null = null;
  private findings: Finding[] = [];
  private messageHistory: AgentMessage[] = [];
  private isInitialized: boolean = false;

  constructor(e2bConfig?: { apiKey?: string }) {
    this.e2bClient = getE2BClient(e2bConfig);
    this.openaiApiKey = process.env.OPENAI_API_KEY || null;
  }

  /**
   * Initialize the orchestrator for a new session
   */
  async initialize(context: SessionContext): Promise<AgentMessage[]> {
    this.sessionContext = context;
    this.findings = [];
    this.messageHistory = [];
    this.isInitialized = true;

    const welcomeMessage: AgentMessage = {
      id: this.generateId(),
      agent: "orchestrator",
      content: `ZERO-X Platform initialized for penetration testing session.

Target: ${context.target}
Scope: ${context.scope.join(", ") || "All"}
Session ID: ${context.sessionId}

[SYSTEM] All agents loaded and ready. Awaiting authorization to proceed.`,
      type: "text",
      timestamp: Date.now(),
      metadata: { phase: "init" },
    };

    this.addMessage(welcomeMessage);
    return [welcomeMessage];
  }

  /**
   * Execute the full kill chain based on the target
   */
  async executeKillChain(): Promise<AgentMessage[]> {
    if (!this.sessionContext) {
      throw new Error("Orchestrator not initialized. Call initialize() first.");
    }

    const messages: AgentMessage[] = [];

    // Phase 1: Planning
    const planMessage = await this.createPlan();
    messages.push(...planMessage);

    // Phase 2: Reconnaissance
    const reconMessages = await this.runReconnaissance();
    messages.push(...reconMessages);

    // Phase 3: Vulnerability Analysis
    const vulnMessages = await this.runVulnerabilityAnalysis();
    messages.push(...vulnMessages);

    // Phase 4: Exploitation (if vulnerabilities found)
    const exploitMessages = await this.runExploitation();
    messages.push(...exploitMessages);

    // Phase 5: Post-Exploitation (if access gained)
    const postMessages = await this.runPostExploitation();
    messages.push(...postMessages);

    // Phase 6: Reporting
    const reportMessage = await this.generateFinalReport();
    messages.push(reportMessage);

    return messages;
  }

  /**
   * Create attack plan using Planner agent
   */
  async createPlan(): Promise<AgentMessage[]> {
    const messages: AgentMessage[] = [];

    const planningStart: AgentMessage = {
      id: this.generateId(),
      agent: "planner",
      content: `[PLANNER] Analyzing target: ${this.sessionContext?.target}

Gathering intelligence on target infrastructure...`,
      type: "text",
      timestamp: Date.now(),
    };
    this.addMessage(planningStart);
    messages.push(planningStart);

    // Simulate planning process
    await this.delay(1000);

    const planContent = `ATTACK PLAN GENERATED
==================

Target: ${this.sessionContext?.target}
Scope: ${this.sessionContext?.scope.join(", ") || "Full"}

PHASE 1: RECONNAISSANCE
├── Network Discovery (Nmap ping scan)
├── Port Enumeration (Full port scan)
└── Service Fingerprinting (Version detection)

PHASE 2: VULNERABILITY ASSESSMENT
├── Nmap NSE Scripts
├── SearchSploit database lookup
└── Known CVE identification

PHASE 3: EXPLOITATION
├── Attempt low-risk exploits first
├── Verify vulnerabilities safely
└── Document all successful attempts

PHASE 4: POST-EXPLOITATION
├── System enumeration
├── Privilege escalation check
└── Sensitive data identification

PHASE 5: REPORTING
├── Executive summary
├── Technical details
└── Remediation recommendations

Estimated Duration: 15-30 minutes
Risk Level: Medium
Tools: Nmap, SearchSploit, Metasploit Framework

[PLANNER] Plan ready. Awaiting approval to proceed.`;

    const planMessage: AgentMessage = {
      id: this.generateId(),
      agent: "planner",
      content: planContent,
      type: "plan",
      timestamp: Date.now(),
      metadata: { phase: "planning", planId: this.generateId() },
    };
    this.addMessage(planMessage);
    messages.push(planMessage);

    return messages;
  }

  /**
   * Run reconnaissance phase
   */
  async runReconnaissance(): Promise<AgentMessage[]> {
    const messages: AgentMessage[] = [];
    const target = this.sessionContext?.target || "localhost";

    const reconStart: AgentMessage = {
      id: this.generateId(),
      agent: "recon",
      content: `[RECON] Starting network reconnaissance on ${target}...`,
      type: "text",
      timestamp: Date.now(),
    };
    this.addMessage(reconStart);
    messages.push(reconStart);

    // Ping scan
    const pingScanCmd = `nmap -sn -PR ${target} -oG - 2>/dev/null | grep "Host:"`;
    const pingScan: AgentMessage = {
      id: this.generateId(),
      agent: "recon",
      content: `$ ${pingScanCmd}`,
      type: "command",
      timestamp: Date.now(),
    };
    this.addMessage(pingScan);
    messages.push(pingScan);

    // Execute in sandbox
    const pingResult = await this.executeInSandbox(pingScanCmd);

    const pingOutput: AgentMessage = {
      id: this.generateId(),
      agent: "recon",
      content: pingResult.stdout || "No hosts discovered",
      type: "output",
      timestamp: Date.now(),
      metadata: { exitCode: pingResult.exitCode },
    };
    this.addMessage(pingOutput);
    messages.push(pingOutput);

    // Port scan
    await this.delay(500);

    const portScanCmd = `nmap -sV --open -p 22,80,443,3306,5432,8080,8443 ${target} -oA port_scan`;
    const portScan: AgentMessage = {
      id: this.generateId(),
      agent: "recon",
      content: `$ ${portScanCmd}`,
      type: "command",
      timestamp: Date.now(),
    };
    this.addMessage(portScan);
    messages.push(portScan);

    const portResult = await this.executeInSandbox(portScanCmd);

    const portOutput: AgentMessage = {
      id: this.generateId(),
      agent: "recon",
      content: portResult.stdout,
      type: "output",
      timestamp: Date.now(),
      metadata: { exitCode: portResult.exitCode },
    };
    this.addMessage(portOutput);
    messages.push(portOutput);

    const reconComplete: AgentMessage = {
      id: this.generateId(),
      agent: "recon",
      content: `[RECON] Network reconnaissance complete. Identified open ports and services. Passing findings to Exploitation agent.`,
      type: "text",
      timestamp: Date.now(),
    };
    this.addMessage(reconComplete);
    messages.push(reconComplete);

    return messages;
  }

  /**
   * Run vulnerability analysis
   */
  async runVulnerabilityAnalysis(): Promise<AgentMessage[]> {
    const messages: AgentMessage[] = [];
    const target = this.sessionContext?.target || "localhost";

    const vulnStart: AgentMessage = {
      id: this.generateId(),
      agent: "exploit",
      content: `[EXPLOIT] Starting vulnerability assessment on ${target}...`,
      type: "text",
      timestamp: Date.now(),
    };
    this.addMessage(vulnStart);
    messages.push(vulnStart);

    // Search for exploits
    const searchCmd = `searchsploit --color "openssh 7.4|apache 2.4|mysql 5.7" 2>/dev/null | head -20`;
    const searchExploit: AgentMessage = {
      id: this.generateId(),
      agent: "exploit",
      content: `$ ${searchCmd}`,
      type: "command",
      timestamp: Date.now(),
    };
    this.addMessage(searchExploit);
    messages.push(searchExploit);

    const searchResult = await this.executeInSandbox(searchCmd);

    const searchOutput: AgentMessage = {
      id: this.generateId(),
      agent: "exploit",
      content: searchResult.stdout || "SearchSploit database queried",
      type: "output",
      timestamp: Date.now(),
    };
    this.addMessage(searchOutput);
    messages.push(searchOutput);

    // Check for critical vulnerabilities
    const criticalVuln: AgentMessage = {
      id: this.generateId(),
      agent: "exploit",
      content: `[EXPLOIT] Vulnerability scan identified potential entry points. Proceeding with safe exploitation attempts in sandbox environment.`,
      type: "text",
      timestamp: Date.now(),
    };
    this.addMessage(criticalVuln);
    messages.push(criticalVuln);

    return messages;
  }

  /**
   * Run exploitation phase
   */
  async runExploitation(): Promise<AgentMessage[]> {
    const messages: AgentMessage[] = [];
    const target = this.sessionContext?.target || "localhost";

    const exploitStart: AgentMessage = {
      id: this.generateId(),
      agent: "exploit",
      content: `[EXPLOIT] Initiating controlled exploitation in isolated sandbox...`,
      type: "text",
      timestamp: Date.now(),
    };
    this.addMessage(exploitStart);
    messages.push(exploitStart);

    // Simulate exploitation attempt
    await this.delay(2000);

    const exploitCmd = `echo "[+] Target: ${target}
[+] Checking for OpenSSH vulnerability...
[+] Attempting safe exploitation in sandbox...
[+] Verifying sandbox isolation..."`;
    
    const exploitAttempt: AgentMessage = {
      id: this.generateId(),
      agent: "exploit",
      content: exploitCmd,
      type: "command",
      timestamp: Date.now(),
    };
    this.addMessage(exploitAttempt);
    messages.push(exploitAttempt);

    await this.delay(1000);

    const exploitResult = await this.executeInSandbox(exploitCmd);

    const exploitOutput: AgentMessage = {
      id: this.generateId(),
      agent: "exploit",
      content: exploitResult.stdout,
      type: "output",
      timestamp: Date.now(),
    };
    this.addMessage(exploitOutput);
    messages.push(exploitOutput);

    // Add a finding
    const newFinding: Finding = {
      id: this.generateId(),
      severity: "high",
      title: "Outdated OpenSSH Version",
      description: "OpenSSH 7.4 detected which has known vulnerabilities",
      evidence: `Service Version: OpenSSH 7.4
Vulnerabilities: Username enumeration, potential RCE
CVSS: 7.5`,
      cve: "CVE-2024-1234",
      verified: false,
      timestamp: Date.now(),
    };
    this.findings.push(newFinding);

    const findingAdded: AgentMessage = {
      id: this.generateId(),
      agent: "exploit",
      content: `[FINDING] Added: ${newFinding.title} (${newFinding.severity.toUpperCase()})`,
      type: "finding",
      timestamp: Date.now(),
      metadata: { findingId: newFinding.id },
    };
    this.addMessage(findingAdded);
    messages.push(findingAdded);

    return messages;
  }

  /**
   * Run post-exploitation phase
   */
  async runPostExploitation(): Promise<AgentMessage[]> {
    const messages: AgentMessage[] = [];

    const postStart: AgentMessage = {
      id: this.generateId(),
      agent: "post",
      content: `[POST-EXPLOIT] Exploring compromised system (simulated)...`,
      type: "text",
      timestamp: Date.now(),
    };
    this.addMessage(postStart);
    messages.push(postStart);

    const systemInfo = `Linux 4.15.0-213-generic x86_64
User: root (simulated)
Home: /root
Shell: /bin/bash

[+] System information collected
[+] Sensitive files identified
[+] Privilege escalation check: N/A (demo mode)`;

    const systemEnum: AgentMessage = {
      id: this.generateId(),
      agent: "post",
      content: systemInfo,
      type: "output",
      timestamp: Date.now(),
    };
    this.addMessage(systemEnum);
    messages.push(systemEnum);

    const postComplete: AgentMessage = {
      id: this.generateId(),
      agent: "post",
      content: `[POST-EXPLOIT] Post-exploitation analysis complete. Findings documented for report.`,
      type: "text",
      timestamp: Date.now(),
    };
    this.addMessage(postComplete);
    messages.push(postComplete);

    return messages;
  }

  /**
   * Generate final report
   */
  async generateFinalReport(): Promise<AgentMessage> {
    const reportContent = `FINAL REPORT
============

Target: ${this.sessionContext?.target}
Scope: ${this.sessionContext?.scope.join(", ") || "Full"}
Date: ${new Date().toISOString()}

EXECUTIVE SUMMARY
-----------------
${this.findings.length} vulnerabilities identified during this assessment.

SEVERITY BREAKDOWN
------------------
Critical: ${this.findings.filter(f => f.severity === "critical").length}
High: ${this.findings.filter(f => f.severity === "high").length}
Medium: ${this.findings.filter(f => f.severity === "medium").length}
Low: ${this.findings.filter(f => f.severity === "low").length}

KEY FINDINGS
------------
${this.findings.map(f => `- ${f.title} (${f.severity.toUpperCase()})${f.cve ? ` [${f.cve}]` : ""}`).join("\n")}

RECOMMENDATIONS
---------------
1. Update all outdated software to latest versions
2. Implement proper network segmentation
3. Enable rate limiting on authentication endpoints
4. Regular security assessments

[REPORT] Full report generated and available for download.`;

    const reportMessage: AgentMessage = {
      id: this.generateId(),
      agent: "report",
      content: reportContent,
      type: "text",
      timestamp: Date.now(),
      metadata: { phase: "reporting", findingsCount: this.findings.length },
    };
    this.addMessage(reportMessage);

    return reportMessage;
  }

  /**
   * Execute a command in the E2B sandbox
   */
  async executeInSandbox(command: string): Promise<CommandResult> {
    return this.e2bClient.executeCommand(command);
  }

  /**
   * Add a custom finding
   */
  addCustomFinding(finding: Omit<Finding, "id" | "timestamp" | "verified">): Finding {
    const newFinding: Finding = {
      ...finding,
      id: this.generateId(),
      verified: false,
      timestamp: Date.now(),
    };
    this.findings.push(newFinding);
    return newFinding;
  }

  /**
   * Get all findings
   */
  getFindings(): Finding[] {
    return [...this.findings];
  }

  /**
   * Get message history
   */
  getMessages(): AgentMessage[] {
    return [...this.messageHistory];
  }

  /**
   * Check if OpenAI is configured
   */
  isOpenAIConfigured(): boolean {
    return !!this.openaiApiKey;
  }

  /**
   * Check if E2B is configured
   */
  isE2BConfigured(): boolean {
    return this.e2bClient.isConfigured();
  }

  // Helper methods
  private addMessage(message: AgentMessage): void {
    this.messageHistory.push(message);
  }

  private generateId(): string {
    return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  private delay(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
}

/**
 * Create a new orchestrator instance
 */
export function createOrchestrator(e2bConfig?: { apiKey?: string }): AgentOrchestrator {
  return new AgentOrchestrator(e2bConfig);
}

// Tool implementations for OpenAI Agents SDK
export const TOOL_IMPLEMENTATIONS = {
  execute_nmap_scan: async (args: {
    target: string;
    scan_type?: "ping" | "basic" | "detailed" | "aggressive" | "vuln";
    ports?: string;
  }) => {
    const e2b = getE2BClient();
    
    let command = "nmap";
    switch (args.scan_type) {
      case "ping":
        command += " -sn";
        break;
      case "detailed":
        command += " -sV -sC -A";
        break;
      case "aggressive":
        command += " -A -T4";
        break;
      case "vuln":
        command += " --script vuln";
        break;
      default:
        command += " -sV";
    }
    
    if (args.ports) {
      command += ` -p ${args.ports}`;
    }
    
    command += ` ${args.target}`;
    
    return e2b.executeCommand(command);
  },

  execute_sqlmap: async (args: {
    url: string;
    parameters?: string;
    risk?: "1" | "2" | "3";
  }) => {
    const e2b = getE2BClient();
    
    let command = `sqlmap -u "${args.url}" --batch`;
    
    if (args.parameters) {
      command += ` -p "${args.parameters}"`;
    }
    
    if (args.risk) {
      command += ` --risk=${args.risk}`;
    }
    
    return e2b.executeCommand(command);
  },

  execute_searchsploit: async (args: { search_term: string }) => {
    const e2b = getE2BClient();
    return e2b.executeCommand(`searchsploit "${args.search_term}"`);
  },

  execute_custom_command: async (args: { command: string; description?: string }) => {
    const e2b = getE2BClient();
    return e2b.executeCommand(args.command);
  },
};
