import "server-only";
import { promises as fs } from "node:fs";
import path from "node:path";
import { SEED_AGENTS } from "./seed";
import type { Agent } from "./types";

// Minimal persistence for the MVP: seed agents live in code, while upvotes and
// submitted agents are kept in a JSON file. Swap this module for a real
// database (Postgres, Supabase, etc.) before deploying to a serverless host,
// where the filesystem is read-only or ephemeral.

interface StoreFile {
  votes: Record<string, number>;
  submitted: Agent[];
}

const STORE_PATH = path.join(process.cwd(), ".data", "store.json");

let cache: StoreFile | null = null;

async function load(): Promise<StoreFile> {
  if (cache) return cache;
  try {
    cache = JSON.parse(await fs.readFile(STORE_PATH, "utf8")) as StoreFile;
  } catch {
    cache = { votes: {}, submitted: [] };
  }
  return cache;
}

async function save(store: StoreFile) {
  cache = store;
  try {
    await fs.mkdir(path.dirname(STORE_PATH), { recursive: true });
    await fs.writeFile(STORE_PATH, JSON.stringify(store, null, 2));
  } catch (err) {
    // Read-only filesystem: keep the in-memory copy so the request still works.
    console.warn("store: could not persist", err);
  }
}

export async function listAgents(): Promise<Agent[]> {
  const store = await load();
  return [...SEED_AGENTS, ...store.submitted].map((a) => ({
    ...a,
    upvotes: a.upvotes + (store.votes[a.slug] ?? 0),
  }));
}

export async function getAgent(slug: string): Promise<Agent | undefined> {
  return (await listAgents()).find((a) => a.slug === slug);
}

export async function upvote(slug: string): Promise<number | undefined> {
  const agent = await getAgent(slug);
  if (!agent) return undefined;
  const store = await load();
  store.votes[slug] = (store.votes[slug] ?? 0) + 1;
  await save(store);
  return agent.upvotes + 1;
}

export async function addAgent(agent: Agent): Promise<void> {
  const store = await load();
  store.submitted.push(agent);
  await save(store);
}
