export function setToken(t: string) { 
  localStorage.setItem("token", t); 
}

export function getToken() { 
  return localStorage.getItem("token"); 
}

export function authHeaders() { 
  const t = getToken(); 
  return t ? { Authorization: `Bearer ${t}` } : {}; 
}

export function clearToken() {
  localStorage.removeItem("token");
}

