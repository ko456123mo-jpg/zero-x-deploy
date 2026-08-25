"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

interface Project {
  _id: string;
  name: string;
  target: string;
  status: string;
  createdAt: number;
}

const mockProjects: Project[] = [
  { _id: "1", name: "Corporate Network Audit", target: "192.168.1.0/24", status: "active", createdAt: Date.now() - 86400000 },
  { _id: "2", name: "Web Application Test", target: "https://app.example.com", status: "completed", createdAt: Date.now() - 172800000 },
  { _id: "3", name: "Mobile App Security", target: "com.target.app", status: "active", createdAt: Date.now() - 3600000 },
];

const recentActivity = [
  { agent: "Orchestrator", action: "Plan approved for Corporate Network Audit", time: "2 min ago" },
  { agent: "Recon", action: "Nmap scan completed: 15 hosts discovered", time: "5 min ago" },
  { agent: "Exploitation", action: "CVE-2024-1234 exploited successfully", time: "8 min ago" },
  { agent: "Report", action: "Report generated for Web Application Test", time: "1 hour ago" },
];

const agentStatus = [
  { name: "Orchestrator", status: "active", message: "Coordinating attack plan" },
  { name: "Planner", status: "idle", message: "Waiting for instructions" },
  { name: "Recon", status: "active", message: "Scanning target network" },
  { name: "Exploitation", status: "idle", message: "Standing by" },
  { name: "Post-Exploit", status: "idle", message: "Standing by" },
  { name: "Reporting", status: "idle", message: "Standing by" },
];

export default function DashboardPage() {
  const router = useRouter();
  const [projects, setProjects] = useState<Project[]>(mockProjects);
  const [showNewProject, setShowNewProject] = useState(false);
  const [newProject, setNewProject] = useState({ name: "", target: "", scope: "" });

  const handleCreateProject = () => {
    if (!newProject.name || !newProject.target) return;
    
    const project: Project = {
      _id: Date.now().toString(),
      name: newProject.name,
      target: newProject.target,
      status: "active",
      createdAt: Date.now(),
    };
    
    setProjects([project, ...projects]);
    setShowNewProject(false);
    setNewProject({ name: "", target: "", scope: "" });
    router.push(`/project/${project._id}`);
  };

  const formatDate = (timestamp: number) => {
    const date = new Date(timestamp);
    return date.toLocaleDateString("en-US", { 
      month: "short", 
      day: "numeric", 
      year: "numeric" 
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active": return "bg-zero-emerald";
      case "completed": return "bg-zero-cyan";
      case "aborted": return "bg-zero-red";
      default: return "bg-zero-text-secondary";
    }
  };

  return (
    <div className="min-h-screen bg-zero-bg-primary">
      {/* Header */}
      <header className="bg-zero-bg-secondary border-b border-zero-border px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3">
            <span className="text-3xl">🎯</span>
            <span className="font-display font-bold text-xl text-zero-cyan">ZERO-X</span>
          </Link>
          <nav className="flex items-center gap-6">
            <Link href="/dashboard" className="text-zero-cyan font-medium">Dashboard</Link>
            <Link href="/reports" className="text-zero-text-secondary hover:text-zero-text-primary">Reports</Link>
            <button 
              onClick={() => router.push("/")}
              className="text-zero-text-secondary hover:text-zero-text-primary"
            >
              Sign Out
            </button>
          </nav>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Welcome */}
        <div className="mb-8">
          <h1 className="text-3xl font-display font-bold mb-2">
            Welcome back, <span className="text-zero-cyan">Operator</span>
          </h1>
          <p className="text-zero-text-secondary">
            Manage your penetration testing projects and monitor agent activity
          </p>
        </div>

        {/* Stats */}
        <div className="grid md:grid-cols-4 gap-6 mb-8">
          <div className="card">
            <div className="text-zero-text-secondary text-sm mb-1">Active Projects</div>
            <div className="text-3xl font-display font-bold text-zero-emerald">2</div>
          </div>
          <div className="card">
            <div className="text-zero-text-secondary text-sm mb-1">Completed Tests</div>
            <div className="text-3xl font-display font-bold text-zero-cyan">12</div>
          </div>
          <div className="card">
            <div className="text-zero-text-secondary text-sm mb-1">Vulnerabilities Found</div>
            <div className="text-3xl font-display font-bold text-zero-amber">47</div>
          </div>
          <div className="card">
            <div className="text-zero-text-secondary text-sm mb-1">Critical Findings</div>
            <div className="text-3xl font-display font-bold text-zero-red">8</div>
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Projects List */}
          <div className="lg:col-span-2">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold">Projects</h2>
              <button 
                onClick={() => setShowNewProject(true)}
                className="btn-primary text-sm flex items-center gap-2"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                New Project
              </button>
            </div>

            {/* New Project Modal */}
            {showNewProject && (
              <div className="card mb-6 border-zero-cyan">
                <h3 className="font-semibold mb-4">Create New Project</h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm text-zero-text-secondary mb-1">Project Name</label>
                    <input
                      type="text"
                      value={newProject.name}
                      onChange={(e) => setNewProject({...newProject, name: e.target.value})}
                      className="input-field"
                      placeholder="My Security Assessment"
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-zero-text-secondary mb-1">Target</label>
                    <input
                      type="text"
                      value={newProject.target}
                      onChange={(e) => setNewProject({...newProject, target: e.target.value})}
                      className="input-field"
                      placeholder="192.168.1.1 or example.com"
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-zero-text-secondary mb-1">Scope (comma separated)</label>
                    <input
                      type="text"
                      value={newProject.scope}
                      onChange={(e) => setNewProject({...newProject, scope: e.target.value})}
                      className="input-field"
                      placeholder="*.target.com, api.target.com"
                    />
                  </div>
                  <div className="flex gap-3">
                    <button 
                      onClick={handleCreateProject}
                      className="btn-primary"
                    >
                      Create & Start
                    </button>
                    <button 
                      onClick={() => setShowNewProject(false)}
                      className="btn-secondary"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Projects */}
            <div className="space-y-4">
              {projects.map((project) => (
                <Link 
                  key={project._id} 
                  href={`/project/${project._id}`}
                  className="block card hover:glow-cyan transition-all"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <h3 className="font-semibold text-lg">{project.name}</h3>
                      <p className="text-zero-text-secondary font-mono text-sm">{project.target}</p>
                    </div>
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(project.status)} text-zero-bg-primary`}>
                      {project.status.toUpperCase()}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-sm text-zero-text-secondary">
                    <span>Created {formatDate(project.createdAt)}</span>
                    <span className="text-zero-cyan">Open War Room →</span>
                  </div>
                </Link>
              ))}
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Agent Status */}
            <div className="card">
              <h3 className="font-semibold mb-4 flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-zero-emerald animate-pulse"></span>
                Agent Status
              </h3>
              <div className="space-y-3">
                {agentStatus.map((agent) => (
                  <div key={agent.name} className="flex items-center justify-between">
                    <div>
                      <span className="text-sm font-medium">{agent.name}</span>
                      <p className="text-xs text-zero-text-secondary">{agent.message}</p>
                    </div>
                    <span className={`w-2 h-2 rounded-full ${agent.status === "active" ? "bg-zero-emerald animate-pulse" : "bg-zero-text-secondary"}`} />
                  </div>
                ))}
              </div>
            </div>

            {/* Recent Activity */}
            <div className="card">
              <h3 className="font-semibold mb-4">Recent Activity</h3>
              <div className="space-y-4">
                {recentActivity.map((activity, i) => (
                  <div key={i} className="text-sm">
                    <div className="flex items-center gap-2 mb-1">
                      <span className={`px-2 py-0.5 rounded text-xs font-medium
                        ${activity.agent === "Orchestrator" ? "bg-zero-purple/20 text-zero-purple" :
                          activity.agent === "Recon" ? "bg-zero-emerald/20 text-zero-emerald" :
                          activity.agent === "Exploitation" ? "bg-zero-red/20 text-zero-red" :
                          "bg-zero-cyan/20 text-zero-cyan"}`}>
                        {activity.agent}
                      </span>
                      <span className="text-zero-text-secondary text-xs">{activity.time}</span>
                    </div>
                    <p className="text-zero-text-secondary">{activity.action}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
