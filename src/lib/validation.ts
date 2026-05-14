export function validateCompetitorInput(input: unknown) {
  if (!input || typeof input !== "object") {
    throw new Error("Invalid input");
  }

  const data = input as {
    name?: unknown;
    website?: unknown;
  };

  if (!data.name || typeof data.name !== "string") {
    throw new Error("Competitor name is required");
  }

  if (data.website && typeof data.website !== "string") {
    throw new Error("Website must be a string");
  }

  return {
    name: data.name.trim(),
    website:
      typeof data.website === "string" && data.website.trim()
        ? data.website.trim()
        : null,
  };
}
