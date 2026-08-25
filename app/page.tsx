"use client";

import { useRouter } from "next/navigation";
import Link from "next/link";

const ASCII_LOGO = `
 ██████╗██╗  ██╗ █████╗ ██████╗  ██████╗ ██╗    ██╗██╗   ██╗███╗   ██╗
██╔════╝██║  ██║██╔══██╗██╔══██╗██╔═══██╗██║    ██║██║   ██║████╗  ██║
██║     ███████║███████║██║  ██║██║   ██║██║ █╗ ██║██║   ██║██╔██╗ ██║
██║     ██╔══██║██╔══██║██║  ██║██║   ██║██║███╗██║██║   ██║██║╚██╗██║
╚██████╗██║  ██║██║  ██║██████╔╝╚██████╔╝╚███╔███╔╝╚██████╔╝██║ ╚████║
 ╚═════╝╚═╝  ╚═╝╚═╝  ╚═╝╚═════╝  ╚═════╝  ╚══╝╚══╝  ╚═════╝ ╚═╝  ╚═══╝
`;

const agents = [
  { name: "Orchestrator", icon: "🎛️", desc: "Strategic command and coordination", color: "purple" },
  { name: "Planner", icon: "📋", desc: "Attack planning and methodology", color: "cyan" },
  { name: "Recon", icon: "🔍", desc: "Information gathering and scanning", color: "emerald" },
  { name: "Exploitation", icon: "💥", desc: "Vulnerability exploitation", color: "red" },
  { name: "Post-Exploitation", icon: "🎯", desc: "System exploration and data", color: "amber" },
  { name: "Reporting", icon: "📊", desc: "Comprehensive report generation", color: "blue" },
];

const features = [
  { title: "Zero-Click Exploits", desc: "Advanced exploitation of vulnerabilities requiring no user interaction", icon: "⚡" },
  { title: "E2B Sandbox", desc: "Isolated execution environment with hardware-level security", icon: "🔒" },
  { title: "AI Orchestration", desc: "Multi-agent system coordinating the entire kill chain", icon: "🤖" },
  { title: "Real-time Analysis", desc: "Live command execution and result streaming", icon: "📡" },
  { title: "Professional Reports", desc: "Executive and technical reports with evidence", icon: "📝" },
  { title: "Audit Trail", desc: "Complete logging of all operations for compliance", icon: "📋" },
];

export default function Home() {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-zero-bg-primary grid-bg">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 glass border-b border-zero-border">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="text-3xl">🎯</span>
            <span className="font-display font-bold text-xl tracking-wider text-zero-cyan">
              ZERO-X
            </span>
          </div>
          <nav className="flex items-center gap-6">
            <Link 
              href="/login" 
              className="text-zero-text-secondary hover:text-zero-cyan transition-colors"
            >
              Sign In
            </Link>
            <Link href="/register" className="btn-primary text-sm">
              Get Started
            </Link>
          </nav>
        </div>
      </header>

      {/* Hero Section */}
      <section className="pt-32 pb-20 px-6">
        <div className="max-w-5xl mx-auto text-center">
          <div className="mb-8 scan-line rounded-lg p-6 bg-zero-bg-secondary border border-zero-border">
            <pre className="font-mono text-zero-cyan text-xs md:text-sm overflow-x-auto">
              {ASCII_LOGO}
            </pre>
          </div>
          
          <h1 className="text-4xl md:text-5xl font-display font-bold mb-6 leading-tight">
            <span className="text-zero-text-primary">Intelligent </span>
            <span className="text-zero-cyan">Penetration Testing</span>
            <br />
            <span className="text-zero-text-secondary">Powered by AI Agents</span>
          </h1>
          
          <p className="text-xl text-zero-text-secondary max-w-3xl mx-auto mb-10 leading-relaxed">
            Automate your penetration testing workflow with a team of specialized AI agents. 
            From reconnaissance to reporting, ZERO-X orchestrates the complete kill chain 
            with precision and efficiency.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button 
              onClick={() => router.push("/register")}
              className="btn-primary text-lg"
            >
              Launch Platform
            </button>
            <button 
              onClick={() => router.push("/dashboard")}
              className="btn-secondary text-lg"
            >
              View Demo
            </button>
          </div>

          <div className="mt-12 flex items-center justify-center gap-2 text-zero-text-secondary text-sm">
            <span className="w-2 h-2 rounded-full bg-zero-emerald animate-pulse"></span>
            <span>System Online • Demo Mode Active</span>
          </div>
        </div>
      </section>

      {/* Agent Team */}
      <section className="py-20 px-6 bg-zero-bg-secondary">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-display font-bold mb-4">
              Your <span className="text-zero-purple">AI Agent Team</span>
            </h2>
            <p className="text-zero-text-secondary max-w-2xl mx-auto">
              Six specialized agents working in harmony to execute comprehensive security assessments
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {agents.map((agent) => (
              <div 
                key={agent.name}
                className="card group hover:glow-cyan"
              >
                <div className="flex items-start gap-4">
                  <span className="text-4xl">{agent.icon}</span>
                  <div>
                    <h3 className={`font-semibold text-lg mb-1 text-zero-${agent.color}`}>
                      {agent.name}
                    </h3>
                    <p className="text-zero-text-secondary text-sm">
                      {agent.desc}
                    </p>
                  </div>
                </div>
                <div className={`mt-4 pt-4 border-t border-zero-border agent-indicator agent-active`} />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-20 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-display font-bold mb-4">
              Platform <span className="text-zero-cyan">Capabilities</span>
            </h2>
            <p className="text-zero-text-secondary max-w-2xl mx-auto">
              Enterprise-grade security testing infrastructure
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature) => (
              <div key={feature.title} className="flex gap-4">
                <span className="text-3xl shrink-0">{feature.icon}</span>
                <div>
                  <h3 className="font-semibold mb-2">{feature.title}</h3>
                  <p className="text-zero-text-secondary text-sm">{feature.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 px-6 bg-gradient-to-b from-zero-bg-secondary to-zero-bg-primary">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-3xl font-display font-bold mb-6">
            Ready to Launch Your <span className="text-zero-emerald">Security Assessment</span>?
          </h2>
          <p className="text-zero-text-secondary mb-8">
            Start your penetration testing session in minutes. Remember: always test with proper authorization.
          </p>
          <button 
            onClick={() => router.push("/register")}
            className="btn-primary text-lg"
          >
            Begin Testing
          </button>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 px-6 border-t border-zero-border">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="text-xl">🎯</span>
            <span className="font-display font-bold text-zero-cyan">ZERO-X</span>
          </div>
          <p className="text-zero-text-secondary text-sm">
            For authorized security testing only. Use responsibly.
          </p>
          <p className="text-zero-text-secondary text-sm">
            © 2026 ZERO-X Platform
          </p>
        </div>
      </footer>
    </div>
  );
}
