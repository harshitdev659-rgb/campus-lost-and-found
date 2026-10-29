import { spawn } from "child_process";
import http from "http";

console.log("🚀 Testing Next.js server startup and API endpoints...");

const devProcess = spawn("cmd.exe", ["/c", "node_modules\\.bin\\next.cmd", "dev", "-p", "3002", "-H", "127.0.0.1"], {
  stdio: ["ignore", "pipe", "pipe"],
  shell: true,
});

let output = "";
devProcess.stdout.on("data", (d) => {
  output += d.toString();
  process.stdout.write(d);
});
devProcess.stderr.on("data", (d) => {
  output += d.toString();
  process.stderr.write(d);
});

async function checkUrl(url) {
  return new Promise((resolve) => {
    http.get(url, (res) => {
      let body = "";
      res.on("data", (c) => (body += c));
      res.on("end", () => {
        resolve({ status: res.statusCode, body });
      });
    }).on("error", (err) => {
      resolve({ status: 500, error: err.message });
    });
  });
}

async function run() {
  let ready = false;
  for (let i = 0; i < 25; i++) {
    await new Promise((r) => setTimeout(r, 1000));
    const test = await checkUrl("http://127.0.0.1:3002/api/reports");
    if (test.status === 200) {
      ready = true;
      console.log("\n🎉 Next.js Server is LIVE and HEALTHY on http://127.0.0.1:3002!");
      console.log(`API response status: ${test.status}`);
      try {
        const json = JSON.parse(test.body);
        console.log(`✅ Loaded ${json.reports?.length} active campus reports from database:`);
        json.reports.forEach((r, idx) => {
          console.log(`   ${idx + 1}. [${r.type}] ${r.title} (${r.category} at ${r.campusLocation})`);
        });
      } catch (e) {
        console.error("JSON parse error", e);
      }
      break;
    }
  }

  if (!ready) {
    console.error("\n❌ Server probe failed. Output:\n", output);
  }

  // Terminate cleanly
  spawn("taskkill", ["/pid", devProcess.pid.toString(), "/f", "/t"]);
  process.exit(ready ? 0 : 1);
}

run();
