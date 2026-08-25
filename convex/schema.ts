import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  users: defineTable({
    email: v.string(),
    name: v.string(),
    image: v.optional(v.string()),
  }).index("by_email", ["email"]),

  projects: defineTable({
    userId: v.id("users"),
    name: v.string(),
    target: v.string(),
    scope: v.array(v.string()),
    status: v.union(
      v.literal("active"),
      v.literal("completed"),
      v.literal("aborted")
    ),
    createdAt: v.number(),
    updatedAt: v.number(),
  }).index("by_user", ["userId"]),

  sessions: defineTable({
    projectId: v.id("projects"),
    status: v.union(
      v.literal("planning"),
      v.literal("approved"),
      v.literal("executing"),
      v.literal("reporting"),
      v.literal("done")
    ),
    e2bSandboxId: v.optional(v.string()),
    disclaimerSigned: v.boolean(),
    createdAt: v.number(),
    updatedAt: v.number(),
  }).index("by_project", ["projectId"]),

  messages: defineTable({
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
    timestamp: v.number(),
  }).index("by_session", ["sessionId"]),

  findings: defineTable({
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
    verified: v.boolean(),
    createdAt: v.number(),
  }).index("by_session", ["sessionId"]),

  auditLog: defineTable({
    sessionId: v.optional(v.id("sessions")),
    projectId: v.optional(v.id("projects")),
    action: v.string(),
    details: v.string(),
    timestamp: v.number(),
  }),
});
