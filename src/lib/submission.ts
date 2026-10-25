import { CATEGORIES, type Agent, type CategoryId, type PricingModel } from "./types";

export interface SubmissionInput {
  name: string;
  tagline: string;
  description: string;
  category: string;
  maker: string;
  website: string;
  tags: string;
  pricingModel: string;
  priceUsd: string | number;
  unit: string;
}

const PRICING_MODELS: PricingModel[] = ["per_call", "per_task", "per_unit", "free"];
const COLORS = ["#6366f1", "#0ea5e9", "#f97316", "#22c55e", "#ec4899", "#a855f7", "#14b8a6", "#ef4444"];

export function slugify(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 48);
}

/** Validates a launch submission and builds a new Agent, or returns field errors. */
export function buildAgent(
  input: Partial<SubmissionInput>,
  existingSlugs: Set<string>,
  today = new Date().toISOString().slice(0, 10),
): { agent: Agent } | { errors: Record<string, string> } {
  const errors: Record<string, string> = {};
  const str = (k: keyof SubmissionInput) => String(input[k] ?? "").trim();

  const name = str("name");
  const slug = slugify(name);
  if (!name || name.length > 40) errors.name = "Name is required (max 40 characters).";
  else if (!slug) errors.name = "Name must contain letters or numbers.";
  else if (existingSlugs.has(slug)) errors.name = "An agent with this name already exists.";

  const tagline = str("tagline");
  if (!tagline || tagline.length > 80) errors.tagline = "Tagline is required (max 80 characters).";

  const description = str("description");
  if (description.length < 20 || description.length > 1000) errors.description = "Description must be 20–1000 characters.";

  const category = str("category");
  if (!CATEGORIES.some((c) => c.id === category)) errors.category = "Pick a category.";

  const maker = str("maker");
  if (!maker) errors.maker = "Maker is required.";

  const website = str("website");
  try {
    if (!["http:", "https:"].includes(new URL(website).protocol)) throw new Error();
  } catch {
    errors.website = "Enter a valid http(s) URL.";
  }

  const pricingModel = str("pricingModel") as PricingModel;
  if (!PRICING_MODELS.includes(pricingModel)) errors.pricingModel = "Pick a pricing model.";
  const priceUsd = pricingModel === "free" ? 0 : Number(input.priceUsd);
  if (!Number.isFinite(priceUsd) || priceUsd < 0) errors.priceUsd = "Enter a price of 0 or more.";
  const unit = str("unit") || "call";

  if (Object.keys(errors).length) return { errors };

  const tags = str("tags")
    .split(",")
    .map((t) => t.trim().toLowerCase())
    .filter(Boolean)
    .slice(0, 5);

  return {
    agent: {
      slug,
      name,
      tagline,
      description,
      category: category as CategoryId,
      maker,
      website,
      tags,
      pricing: { model: pricingModel, priceUsd, unit },
      endpoints: [{ id: "run", method: "POST", path: "/v1/run", description: "Run the agent", priceUsd }],
      launchedAt: today,
      stats: { calls7d: 0, callsPrev7d: 0, calls30d: 0, callsPrev30d: 0, p50Ms: 0, p95Ms: 0, uptime: 100 },
      upvotes: 0,
      color: COLORS[[...slug].reduce((h, c) => h + c.charCodeAt(0), 0) % COLORS.length],
    },
  };
}
