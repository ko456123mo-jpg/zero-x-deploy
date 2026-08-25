/**
 * ZERO-X Agent Simulator
 * Simulates AI agent responses for demo mode
 */

export type AgentType = "orchestrator" | "planner" | "recon" | "exploit" | "post" | "report";

export interface AgentMessage {
  id: string;
  agent: AgentType;
  content: string;
  type: "text" | "command" | "output" | "plan" | "finding";
  timestamp: number;
}

export interface SimulationStep {
  agent: AgentType;
  content: string;
  type: "text" | "command" | "output" | "plan";
  delay: number;
}

// Target analysis responses
const targetResponses = [
  { pattern: /scan|recon|nmap/i, response: "Initiating network reconnaissance..." },
  { pattern: /vuln|cve|exploit/i, response: "Analyzing potential vulnerabilities..." },
  { pattern: /shell|pwn|hack/i, response: "Attempting controlled exploitation in sandbox..." },
];

// Simulated command outputs
export const simulatedOutputs = {
  nmap: {
    basic: `Starting Nmap 7.94 ( https://nmap.org )
Nmap scan report for target.local (192.168.1.1)
Host is up (0.0010s latency).
Not shown: 995 filtered ports
PORT     STATE  SERVICE
22/tcp   open   ssh
80/tcp   open   http
443/tcp  open   https
3306/tcp open   mysql
8080/tcp open   http-proxy

Nmap done: 1 IP address (1 host up) scanned`,
    detailed: `Starting Nmap 7.94
PORT     STATE SERVICE VERSION
22/tcp   open  ssh      OpenSSH 7.4 (protocol 2.0)
80/tcp   open  http     Apache httpd 2.4.6 ((CentOS))
443/tcp  open  ssl      OpenSSL 1.0.1e-fips
3306/tcp open  mysql    MySQL 5.7.32
8080/tcp open  http     Jetty 9.4.31

Service Info: OS: Linux; CPE: cpe:/o:linux:linux_kernel`,
  },
  vuln: {
    ssh: `[+] CVE-2024-1234: OpenSSH < 7.7 Remote Code Execution
    - Vulnerability: Username enumeration allows memory leak
    - Impact: Remote code execution as root
    - CVSS: 9.8 Critical`,
    web: `[+] CVE-2023-5672: SQL Injection in /api/users endpoint
    - Payload: ' OR 1=1 --
    - Data extracted: 15 user records
    - CVSS: 7.5 High`,
  },
};

// Generate a unique message ID
export function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

// Create a new message object
export function createMessage(
  agent: AgentType,
  content: string,
  type: AgentMessage["type"] = "text"
): AgentMessage {
  return {
    id: generateId(),
    agent,
    content,
    type,
    timestamp: Date.now(),
  };
}

// Simulate typing delay
export function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

// Agent prompts (system prompts for AI integration)
export const agentPrompts = {
  orchestrator: `You are ZERO-X, an advanced penetration testing platform powered by multiple AI agents. You have 15+ years of experience in network security, web application testing, and cloud infrastructure, with deep specialization in Zero-click vulnerability exploitation. Your role is to lead a team of specialized agents (Planning, Reconnaissance, Exploitation, Post-Exploitation, Reporting) to automate the complete Kill Chain against authorized targets.

**Core Operating Rules (Non-Negotiable):**
1. **Authorization Gate**: Never start any test without written confirmation that the user owns the target or has explicit permission.
2. **Scope Boundaries**: Strictly adhere to the defined scope specified by the user.
3. **Safety First**: Absolutely prohibit execution of DoS attacks, data deletion, or malware installation.
4. **Structured Reasoning**: Document each step in your thought process.
5. **Hypothesis Tracking**: Track failed hypotheses to avoid repeating unsuccessful attempts.`,

  planner: `You are the Strategic Planning Expert. Your role is to analyze the target provided by the user and divide the testing process into clear phases and methodology (Recon → Enumeration → Exploitation → Privilege Escalation → Reporting). Use your expertise to identify appropriate tools and techniques for each phase, and distribute tasks to other expert agents. Your plan must be comprehensive but executable within the defined testing environment.`,

  recon: `You are the Reconnaissance and Information Gathering Expert. Your task is to use tools like Nmap, arp-scan, and whatweb to gather as much information about the target as possible (open ports, services, versions, technologies used). Analyze results to provide a clear picture of the attack surface for the Planner agent.`,

  exploit: `You are the Exploitation and Penetration Expert. You specialize in exploiting discovered vulnerabilities, with special focus on Zero-click vulnerabilities. Upon receiving a potential vulnerability report, immediately attempt to exploit it safely in the isolated environment. If exploitation succeeds, document the Proof of Concept and its steps in detail. Focus on critical vulnerabilities (SQLi, XSS, CSRF, Command Injection, and Zero-click exploits for Android and iOS systems).`,

  post: `You are the Post-Exploitation Expert. After successful exploitation by the Exploitation agent, your role is to safely explore the compromised system. Search for sensitive data, permissions, or information that can be used to deepen the penetration (within allowed scope). Document everything you find accurately for inclusion in the final report.`,

  report: `You are the Reporting and Analysis Expert. Your task is to collect all results from other agents, analyze them, and generate comprehensive professional reports. Reports must have two parts: an executive summary for managers (summary, risks, business impact, strategic recommendations) and a detailed technical report for the development team (vulnerability details, proof of evidence, remediation steps). Use clear and precise language.`,
};

// Default kill chain simulation
export const defaultKillChain: SimulationStep[] = [
  { agent: "orchestrator", content: "ZERO-X Platform initialized. Target authorization required.", type: "text", delay: 500 },
  { agent: "orchestrator", content: "Authorization received. Initializing agent team...", type: "text", delay: 1000 },
  { agent: "planner", content: "Analyzing target and generating attack strategy...", type: "text", delay: 1500 },
  { agent: "planner", content: `RECONNAISSANCE → ENUMERATION → EXPLOITATION → POST-EXPLOITATION → REPORTING

Phase 1: Network Discovery
- Tool: Nmap (ping scan)
- Objective: Identify active hosts

Phase 2: Port & Service Enumeration  
- Tool: Nmap (service version detection)
- Objective: Map attack surface

Phase 3: Vulnerability Assessment
- Tools: Nmap NSE, searchsploit
- Objective: Identify exploitable vulnerabilities

Phase 4: Controlled Exploitation
- Tools: Metasploit, custom scripts
- Objective: Prove vulnerability impact

Phase 5: Post-Exploitation
- Objective: Assess privilege escalation potential

Phase 6: Documentation
- Generate comprehensive security report`, type: "plan", delay: 3000 },
  { agent: "orchestrator", content: "Attack plan ready. Awaiting user approval.", type: "text", delay: 1000 },
  { agent: "recon", content: "Starting network discovery on target range...", type: "text", delay: 500 },
  { agent: "recon", content: "nmap -sn -PR 192.168.1.0/24", type: "command", delay: 1000 },
  { agent: "recon", content: simulatedOutputs.nmap.basic, type: "output", delay: 2000 },
  { agent: "recon", content: "Discovery complete. 15 hosts identified. Proceeding with detailed scan...", type: "text", delay: 500 },
  { agent: "recon", content: "nmap -sV -sC -p- 192.168.1.100 -oA full_scan", type: "command", delay: 1000 },
  { agent: "recon", content: simulatedOutputs.nmap.detailed, type: "output", delay: 3000 },
  { agent: "exploit", content: "Vulnerability assessment initiated on discovered services...", type: "text", delay: 500 },
  { agent: "exploit", content: "searchsploit OpenSSH 7.4", type: "command", delay: 1000 },
  { agent: "exploit", content: simulatedOutputs.vuln.ssh, type: "output", delay: 1500 },
  { agent: "exploit", content: "[!] Initiating controlled exploitation in E2B sandbox...", type: "text", delay: 500 },
  { agent: "exploit", content: "python3 cve-2024-1234.py -t 192.168.1.100", type: "command", delay: 2000 },
  { agent: "exploit", content: `[+] Payload delivered successfully
[+] Connection established
[+] Shell acquired
[+] Escalating privileges...
[+] Root access obtained!`, type: "output", delay: 3000 },
  { agent: "post", content: "Access gained. Initiating post-exploitation reconnaissance...", type: "text", delay: 500 },
  { agent: "post", content: "cat /etc/shadow | head -5", type: "command", delay: 1000 },
  { agent: "post", content: `root:$6$xyz123:18921:0:99999:7:::
daemon:*:18353:0:99999:7:::
bin:*:18353:0:99999:7:::
sys:*:18353:0:99999:7:::
[+] Sensitive data identified - documenting for report`, type: "output", delay: 2000 },
  { agent: "post", content: "netstat -tulpn | grep LISTEN", type: "command", delay: 1000 },
  { agent: "post", content: `tcp  0  0  0.0.0.0:22   0.0.0.0:*  LISTEN  1234/sshd
tcp  0  0  0.0.0.0:80   0.0.0.0:*  LISTEN  2345/apache2
tcp  0  0  0.0.0.0:443  0.0.0.0:*  LISTEN  2345/apache2
tcp  0  0  0.0.0.0:3306 0.0.0.0:*  LISTEN  3456/mysqld
[+] Internal services documented`, type: "output", delay: 2000 },
  { agent: "orchestrator", content: "Post-exploitation complete. Compiling findings...", type: "text", delay: 500 },
  { agent: "report", content: "Generating comprehensive security assessment report...", type: "text", delay: 1000 },
  { agent: "orchestrator", content: "Kill Chain completed successfully. All findings documented.", type: "text", delay: 500 },
];

// Pre-built findings for demo
export const demoFindings = [
  {
    severity: "critical" as const,
    title: "Remote Code Execution via SSH",
    description: "OpenSSH version vulnerable to username enumeration leading to RCE",
    evidence: "CVE-2024-1234 successfully exploited in sandbox environment",
    cve: "CVE-2024-1234",
  },
  {
    severity: "high" as const,
    title: "Outdated Apache HTTP Server",
    description: "Apache 2.4.6 contains multiple known vulnerabilities",
    evidence: "Server version identified: Apache/2.4.6 (CentOS)",
    cve: "CVE-2023-5672",
  },
  {
    severity: "medium" as const,
    title: "MySQL Direct Access",
    description: "MySQL service exposed without proper network restrictions",
    evidence: "Port 3306 accessible from network",
    cve: undefined,
  },
  {
    severity: "low" as const,
    title: "SSH Banner Information Leakage",
    description: "SSH service reveals version information",
    evidence: "SSH-2.0-OpenSSH_7.4 banner captured",
    cve: undefined,
  },
];
