import { authHeaders } from "./auth";

const API_BASE = "http://localhost:4000/api";

export async function login(username: string, password: string) {
  const response = await fetch(`${API_BASE}/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ username, password })
  });
  
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || "Login failed");
  }
  
  return response.json();
}

export async function getMessages() {
  const response = await fetch(`${API_BASE}/messages`, {
    headers: authHeaders()
  });
  
  if (!response.ok) {
    throw new Error("Failed to fetch messages");
  }
  
  return response.json();
}

export async function getMessage(id: string) {
  const response = await fetch(`${API_BASE}/messages/${id}`, {
    headers: authHeaders()
  });
  
  if (!response.ok) {
    throw new Error("Failed to fetch message");
  }
  
  return response.json();
}

export async function respondToMessage(messageId: string, action: "acknowledged" | "declined") {
  const response = await fetch(`${API_BASE}/messages/${messageId}/respond`, {
    method: "POST",
    headers: { 
      ...authHeaders(),
      "Content-Type": "application/json" 
    },
    body: JSON.stringify({ action })
  });
  
  if (!response.ok) {
    throw new Error("Failed to respond to message");
  }
  
  return response.json();
}

export async function createMessage(message: any) {
  const response = await fetch(`${API_BASE}/admin/messages`, {
    method: "POST",
    headers: { 
      ...authHeaders(),
      "Content-Type": "application/json" 
    },
    body: JSON.stringify(message)
  });
  
  if (!response.ok) {
    throw new Error("Failed to create message");
  }
  
  return response.json();
}

export async function getAdminMessages() {
  const response = await fetch(`${API_BASE}/admin/messages`, {
    headers: authHeaders()
  });
  
  if (!response.ok) {
    throw new Error("Failed to fetch admin messages");
  }
  
  return response.json();
}

