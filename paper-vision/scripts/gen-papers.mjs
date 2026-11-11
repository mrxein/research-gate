import fs from "fs";
import path from "path";

const dir = path.join(process.cwd(), "data", "papers");
const files = fs.readdirSync(dir).filter((f) => f.endsWith(".json")).sort();

const imports = files
  .map((f, i) => `import p${i} from "./papers/${f}";`)
  .join("\n");
const list = files.map((_, i) => `p${i}`).join(", ");

fs.writeFileSync(
  path.join(process.cwd(), "data", "papers.generated.ts"),
  `${imports}\nexport default [${list}] as unknown[];\n`
);
console.log(`Generated index for ${files.length} papers`);