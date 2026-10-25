import { db } from "../src/lib/db";
import { SEED_AGENTS } from "../src/lib/seed";
async function main() {
  for (const agent of SEED_AGENTS)
    await db.query(
      "INSERT INTO agents(slug,data,demo) VALUES($1,$2,true) ON CONFLICT DO NOTHING",
      [agent.slug, agent],
    );
  console.log(
    "Fictional demo listings seeded. They cannot receive live calls.",
  );
}
main()
  .catch((e) => {
    console.error(e.message);
    process.exitCode = 1;
  })
  .finally(() => db.end());
