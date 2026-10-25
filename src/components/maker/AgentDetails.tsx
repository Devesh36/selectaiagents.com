"use client";
import { CATEGORIES } from "@/lib/types";
export type Details = {
  name: string;
  tagline: string;
  description: string;
  category: string;
  maker: string;
  website: string;
  tags: string;
};
export const emptyDetails: Details = {
  name: "",
  tagline: "",
  description: "",
  category: "research",
  maker: "",
  website: "",
  tags: "",
};
export function AgentDetails({
  value,
  onChange,
  published = false,
}: {
  value: Details;
  onChange: (value: Details) => void;
  published?: boolean;
}) {
  function field(
    key: keyof Details,
    label: string,
    hint: string,
    maxLength: number,
    type = "text",
  ) {
    return (
      <label className="maker-field">
        <span>{label}</span>
        <input
          name={key}
          type={type}
          value={value[key]}
          maxLength={maxLength}
          required={key !== "tags"}
          disabled={published && (key === "name" || key === "maker")}
          onChange={(e) => onChange({ ...value, [key]: e.target.value })}
        />
        <small>{hint}</small>
      </label>
    );
  }
  return (
    <div className="maker-fields">
      <div className="maker-field-pair">
        {field(
          "name",
          "Agent name",
          published
            ? "Your published name is also part of your API identity."
            : "A clear name people will remember.",
          40,
        )}
        {field(
          "maker",
          "Maker name",
          published
            ? "Your API identity stays the same."
            : "Your name or your team’s name.",
          60,
        )}
      </div>
      {field(
        "tagline",
        "What does it do?",
        "One useful outcome, in 80 characters or less.",
        80,
      )}
      <label className="maker-field">
        <span>Description</span>
        <textarea
          name="description"
          value={value.description}
          required
          minLength={20}
          maxLength={1000}
          rows={5}
          onChange={(e) => onChange({ ...value, description: e.target.value })}
        />
        <small>
          Explain what it can do, who it helps, and any limitations. 20–1,000
          characters.
        </small>
      </label>
      <div className="maker-field-pair">
        <label className="maker-field">
          <span>Category</span>
          <select
            value={value.category}
            onChange={(e) => onChange({ ...value, category: e.target.value })}
          >
            {CATEGORIES.map((c) => (
              <option key={c.id} value={c.id}>
                {c.label}
              </option>
            ))}
          </select>
        </label>
        {field(
          "website",
          "Website",
          "Where people can learn more about your agent.",
          2000,
          "url",
        )}
      </div>
      {field(
        "tags",
        "Tags",
        "Up to five, separated by commas. For example: research, citations, reports.",
        300,
      )}
    </div>
  );
}
