# ZERO-X: Intelligent Penetration Testing Platform

## 1. Concept & Vision

ZERO-X is an AI-driven penetration testing platform that orchestrates multiple specialized agents to automate the complete Kill Chain - from reconnaissance to reporting. The platform embodies a **tactical operations center aesthetic**: dark, precise, professional, with glowing accent elements that evoke military command systems.

**Phase 2 Status**: Production-ready with E2B sandbox integration, OpenAI agent orchestration, Zero-click exploit modules, and PDF report generation.

## 2. Technical Stack

### Frontend
- **Framework**: Next.js 14+ (App Router) with React 18 and TypeScript
- **Styling**: Custom CSS with Tailwind-compatible utility classes
- **PDF Generation**: jsPDF with jspdf-autotable

### Backend
- **Database**: Convex (local deployment: http://127.0.0.1:3210)
- **Auth**: Custom implementation (ready for Convex Auth integration)
- **Real-time**: Convex subscriptions for live updates

### AI & Security Tools
- **AI Agents**: Custom orchestrator (`lib/agents/orchestrator.ts`)
- **Sandbox**: E2B integration (`lib/e2b/index.ts`)
- **Exploits**: adbHijacker with CVE-2026-0073 (`lib/exploits/adbHijacker/`)

## 3. Environment Variables

```env
# Convex (auto-configured)
NEXT_PUBLIC_CONVEX_URL=http://127.0.0.1:3210

# E2B Sandbox (for real execution)
E2B_API_KEY=your_e2b_api_key

# OpenAI (for AI agents)
OPENAI_API_KEY=sk-your_openai_api_key
```

## 4. File Structure

```
zero-x/
├── app/
│   ├── (auth)/login/page.tsx      # Login with OAuth support
│   ├── (auth)/register/page.tsx   # Registration with validation
│   ├── dashboard/page.tsx         # Project management
│   ├── project/[id]/page.tsx     # War Room
│   └── reports/page.tsx           # Reports with PDF export
├── convex/
│   ├── auth.ts                    # Auth utilities
│   ├── schema.ts                  # Database schema
│   └── functions/                 # Serverless functions
│       ├── projects.ts
│       ├── sessions.ts
│       └── exploits.ts             # Exploit execution functions
├── lib/
│   ├── agents/
│   │   ├── orchestrator.ts        # AI agent orchestrator
│   │   └── simulator.ts           # Agent simulation & prompts
│   ├── e2b/
│   │   └── index.ts               # E2B sandbox integration
│   └── exploits/
│       └── adbHijacker/           # CVE-2026-0073 exploit
│           ├── adb_tls_auth_bypass.py
│           └── scanner.py
├── .env.local                     # Environment configuration
└── SPEC.md                        # This file
```

## 5. Features Implemented

### Authentication ✅
- Email/password login and registration
- Password strength indicator
- OAuth buttons (Google, GitHub) - ready for configuration
- Session management

### War Room ✅
- Real-time agent conversation display
- Command execution with typing effects
- Live findings panel with severity badges
- Legal disclaimer modal with scope definition

### AI Agent System ✅
- Orchestrator agent with 6 sub-agents:
  - Orchestrator (coordination)
  - Planner (attack strategy)
  - Recon (network scanning)
  - Exploitation (vulnerability testing)
  - Post-Exploitation (system exploration)
  - Reporting (documentation)
- Tool definitions for E2B integration

### E2B Sandbox ✅
- Real sandbox creation and management
- Command execution in isolated environment
- Demo mode for testing without API key
- Support for security tools (Nmap, SQLMap, etc.)

### Zero-Click Exploits ✅
- adbHijacker framework for Android ADB
- CVE-2026-0073 implementation
- Network scanner for finding vulnerable devices
- Python-based exploitation scripts

### Reporting ✅
- PDF export with jsPDF
- HTML export for web viewing
- Executive summary section
- Detailed findings with evidence
- Severity breakdown and remediation

## 6. API Integration Points

### E2B Sandbox (`lib/e2b/index.ts`)
```typescript
const e2b = new E2BClient({ apiKey: process.env.E2B_API_KEY });
await e2b.createSandbox();
const result = await e2b.executeCommand("nmap -sn 192.168.1.0/24");
await e2b.destroySandbox();
```

### AI Orchestrator (`lib/agents/orchestrator.ts`)
```typescript
const orchestrator = new AgentOrchestrator();
await orchestrator.initialize({ sessionId, target, scope });
const messages = await orchestrator.executeKillChain();
```

### Exploits (`lib/exploits/adbHijacker/adb_tls_auth_bypass.py`)
```bash
python3 adb_tls_auth_bypass.py --target 192.168.1.100 --port 5555
```

## 7. Security Considerations

- All exploit execution happens in isolated E2B sandbox
- Legal disclaimer required before testing
- Scope validation prevents out-of-bounds testing
- Complete audit trail in Convex database
- Demo mode works without API keys

## 8. Next Steps for Production

1. **Configure E2B API Key**
   - Sign up at https://e2b.dev/
   - Add key to `.env.local`

2. **Configure OpenAI API Key**
   - Get key from https://platform.openai.com/
   - Add key to `.env.local`

3. **Set up OAuth (Optional)**
   - Configure Google/GitHub OAuth apps
   - Add credentials to `.env.local`

4. **Deploy to Production**
   - Push to GitHub
   - Connect to Vercel
   - Set environment variables in Vercel dashboard
   - Run `npx convex deploy` for backend

## 9. Testing Checklist

- [ ] Login with any credentials (demo mode)
- [ ] Register new account
- [ ] Create a new project
- [ ] Enter War Room
- [ ] Accept legal disclaimer
- [ ] View simulated kill chain execution
- [ ] Generate PDF report
- [ ] Export HTML report
- [ ] Navigate between pages

## 10. Color Palette

```css
--bg-primary: #0a0e17       /* Deep space black */
--bg-secondary: #111827     /* Dark slate */
--bg-tertiary: #1f2937      /* Elevated surface */
--border: #374151           /* Subtle borders */
--text-primary: #f9fafb     /* Pure white text */
--text-secondary: #9ca3af   /* Muted text */
--accent-cyan: #06b6d4      /* Primary accent */
--accent-emerald: #10b981   /* Success states */
--accent-amber: #f59e0b     /* Warnings */
--accent-red: #ef4444       /* Critical findings */
--accent-purple: #8b5cf6    /* AI agent activity */
```

## 11. Agent System Prompts

### Orchestrator
"You are ZERO-X, an advanced penetration testing platform powered by multiple AI agents. You have 15+ years of experience in network security, web application testing, and cloud infrastructure..."

### Planner
"You are the Strategic Planning Expert. Your role is to analyze the target provided by the user and divide the testing process into clear phases..."

### Recon
"You are the Reconnaissance and Information Gathering Expert. Your task is to use tools like Nmap, arp-scan, and whatweb..."

### Exploit
"You are the Exploitation and Penetration Expert. You specialize in exploiting discovered vulnerabilities, with special focus on Zero-click vulnerabilities..."

### Post-Exploitation
"You are the Post-Exploitation Expert. After successful exploitation by the Exploitation agent, your role is to safely explore the compromised system..."

### Reporting
"You are the Reporting and Analysis Expert. Your task is to collect all results from other agents, analyze them, and generate comprehensive professional reports..."

---

Last Updated: August 26, 2026
Version: 2.0.0 (Production Ready)
