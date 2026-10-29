import fs from "fs";
import path from "path";

const swcIndexPath = path.join(process.cwd(), "node_modules", "next", "dist", "build", "swc", "index.js");

if (fs.existsSync(swcIndexPath)) {
  let content = fs.readFileSync(swcIndexPath, "utf8");

  content = content.replace(
    /const shouldLoadWasmFallbackFirst = [^;]+;/,
    "const shouldLoadWasmFallbackFirst = true;"
  );

  fs.writeFileSync(swcIndexPath, content, "utf8");
  console.log("✅ Set shouldLoadWasmFallbackFirst = true in Next.js SWC loader!");
}
