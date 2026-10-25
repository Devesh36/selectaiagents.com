export const CATEGORIES = [
  { id: "coding", label: "Coding" },
  { id: "research", label: "Research" },
  { id: "browser", label: "Browser & Web" },
  { id: "sales", label: "Sales & Lead gen" },
  { id: "support", label: "Customer support" },
  { id: "data", label: "Data & Analytics" },
  { id: "creative", label: "Creative & Media" },
  { id: "ops", label: "Ops & Automation" },
] as const;

export type CategoryId = (typeof CATEGORIES)[number]["id"];

export type PricingModel = "per_call" | "per_task" | "per_unit" | "free";

export interface Pricing {
  model: PricingModel;
  /** Price in USD per `unit`. 0 for free. */
  priceUsd: number;
  unit: string;
}

export interface Endpoint {
  /** Short id; the full id is `<agentSlug>#<id>`. */
  id: string;
  method: "GET" | "POST";
  path: string;
  description: string;
  priceUsd: number;
}

export interface UsageStats {
  calls7d: number;
  callsPrev7d: number;
  calls30d: number;
  callsPrev30d: number;
  p50Ms: number;
  p95Ms: number;
  /** 0-100 */
  uptime: number;
}

export interface Agent {
  slug: string;
  name: string;
  tagline: string;
  description: string;
  category: CategoryId;
  maker: string;
  website: string;
  tags: string[];
  pricing: Pricing;
  endpoints: Endpoint[];
  /** ISO date (YYYY-MM-DD) the agent was launched on the site. */
  launchedAt: string;
  stats: UsageStats;
  upvotes: number;
  /** Hex color used for the generated logo tile. */
  color: string;
}
