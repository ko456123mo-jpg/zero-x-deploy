import { v } from "convex/values";

export const create = {
  args: {
    projectId: v.id("projects"),
    disclaimerSigned: v.boolean(),
  },
  handler: async (ctx: any, args: any) => {
    const now = Date.now();
    const sessionId = await ctx.db.insert("sessions", {
      projectId: args.projectId,
      status: "planning",
      disclaimerSigned: args.disclaimerSigned,
      createdAt: now,
      updatedAt: now,
    });
    
    await ctx.db.insert("auditLog", {
      sessionId,
      projectId: args.projectId,
      action: "SESSION_CREATED",
      details: `New testing session started`,
      timestamp: now,
    });
    
    return sessionId;
  },
};

export const getMessages = {
  args: { sessionId: v.id("sessions") },
  handler: async (ctx: any, args: any) => {
    return ctx.db
      .query("messages")
      .withIndex("by_session", (q: any) => q.eq("sessionId", args.sessionId))
      .collect();
  },
};

export const addMessage = {
  args: {
    sessionId: v.id("sessions"),
    agent: v.union(
      v.literal("orchestrator"),
      v.literal("planner"),
      v.literal("recon"),
      v.literal("exploit"),
      v.literal("post"),
      v.literal("report")
    ),
    content: v.string(),
    type: v.union(
      v.literal("text"),
      v.literal("command"),
      v.literal("output"),
      v.literal("plan"),
      v.literal("finding")
    ),
  },
  handler: async (ctx: any, args: any) => {
    await ctx.db.insert("messages", {
      sessionId: args.sessionId,
      agent: args.agent,
      content: args.content,
      type: args.type,
      timestamp: Date.now(),
    });
  },
};

export const updateStatus = {
  args: {
    sessionId: v.id("sessions"),
    status: v.union(
      v.literal("planning"),
      v.literal("approved"),
      v.literal("executing"),
      v.literal("reporting"),
      v.literal("done")
    ),
  },
  handler: async (ctx: any, args: any) => {
    await ctx.db.patch(args.sessionId, {
      status: args.status,
      updatedAt: Date.now(),
    });
  },
};

export const getFindings = {
  args: { sessionId: v.id("sessions") },
  handler: async (ctx: any, args: any) => {
    return ctx.db
      .query("findings")
      .withIndex("by_session", (q: any) => q.eq("sessionId", args.sessionId))
      .collect();
  },
};

export const addFinding = {
  args: {
    sessionId: v.id("sessions"),
    severity: v.union(
      v.literal("critical"),
      v.literal("high"),
      v.literal("medium"),
      v.literal("low"),
      v.literal("info")
    ),
    title: v.string(),
    description: v.string(),
    evidence: v.string(),
    cve: v.optional(v.string()),
  },
  handler: async (ctx: any, args: any) => {
    await ctx.db.insert("findings", {
      sessionId: args.sessionId,
      severity: args.severity,
      title: args.title,
      description: args.description,
      evidence: args.evidence,
      cve: args.cve,
      verified: false,
      createdAt: Date.now(),
    });
  },
};
