import { v } from "convex/values";

export const list = {
  args: {},
  handler: async (ctx: any) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return [];
    
    const projects = await ctx.db
      .query("projects")
      .withIndex("by_user", (q: any) => q.eq("userId", identity.subject))
      .collect();
    
    return projects.sort((a: any, b: any) => b.createdAt - a.createdAt);
  },
};

export const get = {
  args: { id: v.id("projects") },
  handler: async (ctx: any, args: any) => {
    const project = await ctx.db.get(args.id);
    if (!project) return null;
    
    const sessions = await ctx.db
      .query("sessions")
      .withIndex("by_project", (q: any) => q.eq("projectId", args.id))
      .collect();
    
    return { project, sessions };
  },
};

export const create = {
  args: {
    name: v.string(),
    target: v.string(),
    scope: v.array(v.string()),
  },
  handler: async (ctx: any, args: any) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Unauthorized");
    
    const now = Date.now();
    const projectId = await ctx.db.insert("projects", {
      userId: identity.subject,
      name: args.name,
      target: args.target,
      scope: args.scope,
      status: "active",
      createdAt: now,
      updatedAt: now,
    });
    
    await ctx.db.insert("auditLog", {
      projectId,
      action: "PROJECT_CREATED",
      details: `Project "${args.name}" created for target: ${args.target}`,
      timestamp: now,
    });
    
    return projectId;
  },
};

export const remove = {
  args: { id: v.id("projects") },
  handler: async (ctx: any, args: any) => {
    const project = await ctx.db.get(args.id);
    if (!project) throw new Error("Project not found");
    
    await ctx.db.delete(args.id);
    
    await ctx.db.insert("auditLog", {
      projectId: args.id,
      action: "PROJECT_DELETED",
      details: `Project deleted`,
      timestamp: Date.now(),
    });
  },
};
