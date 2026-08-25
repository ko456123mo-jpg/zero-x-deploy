/**
 * ZERO-X Authentication Configuration
 * Custom authentication helpers for Convex
 * 
 * This module provides authentication utilities for the ZERO-X platform.
 * In production, consider using Convex Auth (@convex-dev/auth).
 */

export interface User {
  email: string;
  name: string;
  image?: string;
  createdAt: number;
}

/**
 * Create a new user account
 */
export async function createUser(
  email: string,
  password: string,
  name: string
): Promise<{ success: boolean; error?: string }> {
  // Validate email
  if (!email || !email.includes("@")) {
    return { success: false, error: "Invalid email address" };
  }
  
  // Validate password
  if (!password || password.length < 8) {
    return { success: false, error: "Password must be at least 8 characters" };
  }
  
  // Validate name
  if (!name || name.trim().length < 2) {
    return { success: false, error: "Name must be at least 2 characters" };
  }
  
  // In production, this would:
  // 1. Hash the password using bcrypt
  // 2. Store in database
  // 3. Send verification email
  
  return { success: true };
}

/**
 * Verify user credentials
 */
export async function verifyCredentials(
  email: string,
  password: string
): Promise<{ success: boolean; user?: User; error?: string }> {
  // In production, this would:
  // 1. Look up user by email
  // 2. Verify password hash
  
  // For demo purposes, accept any valid format
  if (!email || !password) {
    return { success: false, error: "Email and password required" };
  }
  
  // Demo user
  const user: User = {
    email,
    name: email.split("@")[0],
    createdAt: Date.now(),
  };
  
  return { success: true, user };
}

/**
 * Generate a session token
 */
export function generateSessionToken(): string {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  let token = "";
  for (let i = 0; i < 64; i++) {
    token += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return token;
}

/**
 * Hash a password (for production use)
 */
export async function hashPassword(password: string): Promise<string> {
  // In production, use bcrypt or argon2
  const encoder = new TextEncoder();
  const data = encoder.encode(password + "zero-x-salt");
  const hashBuffer = await crypto.subtle.digest("SHA-256", data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, "0")).join("");
}

/**
 * Verify a password hash (for production use)
 */
export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  const passwordHash = await hashPassword(password);
  return passwordHash === hash;
}
