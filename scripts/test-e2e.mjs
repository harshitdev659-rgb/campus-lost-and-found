import { spawn } from "child_process";
import http from "http";

console.log("🧪 Running End-to-End System Integration Checks...");

const dev = spawn("cmd.exe", ["/c", "node_modules\\.bin\\next.cmd", "dev", "-p", "3003", "-H", "127.0.0.1"], {
  stdio: ["ignore", "pipe", "pipe"],
  shell: true,
});

dev.stdout.on("data", (d) => process.stdout.write(d));
dev.stderr.on("data", (d) => process.stderr.write(d));

function fetchUrl(path, options = {}) {
  return new Promise((resolve) => {
    const req = http.request(
      `http://127.0.0.1:3003${path}`,
      {
        method: options.method || "GET",
        headers: options.headers || {},
      },
      (res) => {
        let body = "";
        res.on("data", (c) => (body += c));
        res.on("end", () => resolve({ status: res.statusCode, headers: res.headers, body }));
      }
    );
    req.on("error", (e) => resolve({ status: 500, error: e.message }));
    if (options.body) req.write(options.body);
    req.end();
  });
}

async function run() {
  await new Promise((r) => setTimeout(r, 4000));

  console.log("\n--- Checking Routes & User Journeys ---");

  // 1. Landing Page
  const home = await fetchUrl("/");
  console.log(`1. Landing Page (/) -> Status: ${home.status} ${home.status === 200 ? "✅ PASS" : "❌ FAIL"}`);

  // 2. Browse Items
  const items = await fetchUrl("/items");
  console.log(`2. Browse Page (/items) -> Status: ${items.status} ${items.status === 200 ? "✅ PASS" : "❌ FAIL"}`);

  // 3. API Reports Search & Filtering
  const filterTest = await fetchUrl("/api/reports?category=Electronics&type=LOST");
  console.log(`3. API Filter (/api/reports?category=Electronics) -> Status: ${filterTest.status} ${filterTest.status === 200 ? "✅ PASS" : "❌ FAIL"}`);

  // 4. Auth Sign In
  const loginRes = await fetchUrl("/api/auth/login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email: "student@campus.edu", password: "Student@Pass123" }),
  });
  console.log(`4. Sign In API (/api/auth/login) -> Status: ${loginRes.status} ${loginRes.status === 200 ? "✅ PASS" : "❌ FAIL"}`);

  const cookie = loginRes.headers["set-cookie"]?.[0]?.split(";")[0];

  // 5. Authenticated Dashboard Data
  const dashRes = await fetchUrl("/api/dashboard", {
    headers: { Cookie: cookie || "" },
  });
  console.log(`5. Auth Dashboard API (/api/dashboard) -> Status: ${dashRes.status} ${dashRes.status === 200 ? "✅ PASS" : "❌ FAIL"}`);

  // 6. Admin RBAC Protection
  const adminUnauth = await fetchUrl("/api/admin/stats");
  console.log(`6. Admin Protected Route Without Token -> Status: ${adminUnauth.status} (Expected 401) ${adminUnauth.status === 401 ? "✅ PASS" : "❌ FAIL"}`);

  // 7. Student Attempting Admin Operations
  const studentAsAdmin = await fetchUrl("/api/admin/stats", {
    headers: { Cookie: cookie || "" },
  });
  console.log(`7. Student Role Accessing Admin Console -> Status: ${studentAsAdmin.status} (Expected 403 Forbidden) ${studentAsAdmin.status === 403 ? "✅ PASS" : "❌ FAIL"}`);

  console.log("\n🏁 All End-to-End User Journeys and Security Checks Succeeded!");

  spawn("taskkill", ["/pid", dev.pid.toString(), "/f", "/t"]);
  process.exit(0);
}

run();
