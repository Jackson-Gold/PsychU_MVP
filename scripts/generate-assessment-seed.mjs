import { readFileSync, writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import ts from "typescript";

const seedPath = fileURLToPath(new URL("../supabase/seed.sql", import.meta.url));
const catalogPath = fileURLToPath(new URL("../src/lib/assessment-catalog.ts", import.meta.url));
const startMarker = "-- BEGIN GENERATED ASSESSMENT CATALOG";
const endMarker = "-- END GENERATED ASSESSMENT CATALOG";

const catalogSource = readFileSync(catalogPath, "utf8");
const catalogJavaScript = ts.transpileModule(catalogSource, {
  compilerOptions: {
    module: ts.ModuleKind.ESNext,
    target: ts.ScriptTarget.ES2022
  }
}).outputText;
const catalogModule = await import(
  `data:text/javascript;base64,${Buffer.from(catalogJavaScript).toString("base64")}`
);
const { assessmentCatalog } = catalogModule;

function sqlString(value) {
  return `'${String(value).replaceAll("'", "''")}'`;
}

function jsonb(value) {
  return `${sqlString(JSON.stringify(value))}::jsonb`;
}

function textArray(values) {
  return `array[${values.map(sqlString).join(", ")}]`;
}

const rows = assessmentCatalog
  .map(
    (module) => `  (
    ${sqlString(module.id)},
    ${sqlString(module.slug)},
    ${sqlString(module.title)},
    ${sqlString(module.version)},
    ${sqlString(module.status)},
    ${sqlString(module.licenseStatus)},
    ${textArray(module.domains)},
    ${sqlString(module.description ?? "")},
    ${sqlString(module.attribution ?? "")},
    ${module.estimatedMinutes ?? "null"},
    ${sqlString(module.scoringStrategy)},
    ${jsonb(module.scoringConfig ?? {})},
    ${jsonb(module.questions)}
  )`
  )
  .join(",\n");

const generatedBlock = `${startMarker}
insert into public.assessment_modules (
  id,
  slug,
  title,
  version,
  status,
  license_status,
  domains,
  description,
  attribution,
  estimated_minutes,
  scoring_strategy,
  scoring_config,
  questions
)
values
${rows}
on conflict (slug, version) do update set
  title = excluded.title,
  status = excluded.status,
  license_status = excluded.license_status,
  domains = excluded.domains,
  description = excluded.description,
  attribution = excluded.attribution,
  estimated_minutes = excluded.estimated_minutes,
  scoring_strategy = excluded.scoring_strategy,
  scoring_config = excluded.scoring_config,
  questions = excluded.questions;
${endMarker}`;

const seed = readFileSync(seedPath, "utf8");
const pattern = new RegExp(`${startMarker}[\\s\\S]*?${endMarker}`);

if (!pattern.test(seed)) {
  throw new Error("Assessment catalog markers were not found in supabase/seed.sql.");
}

writeFileSync(seedPath, seed.replace(pattern, generatedBlock));
console.log(`Updated ${seedPath} with ${assessmentCatalog.length} assessment modules.`);
