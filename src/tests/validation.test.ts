import { describe, expect, it } from "vitest";

import { validateCompetitorInput } from "@/lib/validation";

describe("validateCompetitorInput", () => {
  it("throws when name is missing", () => {
    expect(() => validateCompetitorInput({})).toThrow();
  });

  it("returns cleaned competitor input", () => {
    const result = validateCompetitorInput({
      name: " HubSpot ",
      website: " https://hubspot.com ",
    });

    expect(result.name).toBe("HubSpot");
    expect(result.website).toBe("https://hubspot.com");
  });
});
