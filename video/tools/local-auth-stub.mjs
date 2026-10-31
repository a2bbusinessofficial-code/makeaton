// Minimal local stand-in for Supabase GoTrue (dev/screenshot use only).
import http from "node:http";
import fs from "node:fs";
import crypto from "node:crypto";

const DB = process.env.AUTH_STUB_DB || "/tmp/auth-stub-users.json";
const users = fs.existsSync(DB) ? JSON.parse(fs.readFileSync(DB, "utf8")) : {};
const save = () => fs.writeFileSync(DB, JSON.stringify(users, null, 2));
const b64 = (o) => Buffer.from(JSON.stringify(o)).toString("base64url");
const now = () => Math.floor(Date.now() / 1000);

function publicUser(u) {
  return {
    id: u.id, aud: "authenticated", role: "authenticated", email: u.email,
    email_confirmed_at: u.created_at, confirmed_at: u.created_at, last_sign_in_at: new Date().toISOString(),
    app_metadata: { provider: "email", providers: ["email"] }, user_metadata: u.user_metadata ?? {},
    identities: [], created_at: u.created_at, updated_at: u.created_at,
  };
}
function session(u) {
  const exp = now() + 3600 * 24;
  const access_token = `${b64({ alg: "HS256", typ: "JWT" })}.${b64({ sub: u.id, email: u.email, exp, iat: now(), aud: "authenticated", role: "authenticated", session_id: crypto.randomUUID() })}.sig`;
  return { access_token, token_type: "bearer", expires_in: 3600 * 24, expires_at: exp, refresh_token: `r_${u.id}`, user: publicUser(u) };
}
const byEmail = (e) => Object.values(users).find((u) => u.email === String(e).toLowerCase());
function fromBearer(req) {
  const t = (req.headers.authorization ?? "").replace(/^Bearer /, "");
  try { return users[JSON.parse(Buffer.from(t.split(".")[1], "base64url")).sub]; } catch { return undefined; }
}
function create({ email, password, user_metadata }) {
  const u = { id: crypto.randomUUID(), email: email.toLowerCase(), password, user_metadata, created_at: new Date().toISOString() };
  users[u.id] = u; save(); return u;
}

http.createServer(async (req, res) => {
  let body = ""; for await (const c of req) body += c;
  const data = body ? JSON.parse(body) : {};
  const url = new URL(req.url, "http://x");
  const send = (code, obj) => { res.writeHead(code, { "content-type": "application/json" }); res.end(obj === undefined ? "" : JSON.stringify(obj)); };
  const p = url.pathname.replace(/^\/auth\/v1/, "");
  const err = (code, msg) => send(code, { code, error_code: "invalid_credentials", msg, message: msg, error: msg, error_description: msg });

  if (p === "/admin/users" && req.method === "POST") {
    if (byEmail(data.email)) return err(422, "User already registered");
    return send(200, publicUser(create(data)));
  }
  if (p === "/admin/users" && req.method === "GET") return send(200, { users: Object.values(users).map(publicUser), aud: "authenticated" });
  if (p === "/signup") {
    if (byEmail(data.email)) return err(422, "User already registered");
    const u = create({ email: data.email, password: data.password, user_metadata: data.data });
    return send(200, session(u));
  }
  if (p === "/token") {
    const g = url.searchParams.get("grant_type");
    if (g === "password") { const u = byEmail(data.email); return u && u.password === data.password ? send(200, session(u)) : err(400, "Invalid login credentials"); }
    if (g === "refresh_token") { const u = users[String(data.refresh_token).slice(2)]; return u ? send(200, session(u)) : err(400, "Invalid Refresh Token"); }
  }
  if (p === "/user" && req.method === "GET") { const u = fromBearer(req); return u ? send(200, publicUser(u)) : err(401, "invalid JWT"); }
  if (p === "/user" && req.method === "PUT") {
    const u = fromBearer(req); if (!u) return err(401, "invalid JWT");
    if (data.password) u.password = data.password; if (data.data) u.user_metadata = { ...u.user_metadata, ...data.data }; save();
    return send(200, publicUser(u));
  }
  if (p === "/logout") return send(204);
  if (p === "/recover" || p === "/otp" || p === "/verify") return send(200, {});
  if (p === "/settings") return send(200, { external: { email: true }, disable_signup: false, mailer_autoconfirm: true });
  console.log("unhandled", req.method, req.url); send(404, { msg: "not found" });
}).listen(54321, () => console.log("fake auth on :54321"));
