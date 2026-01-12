import { describe, expect, it } from "bun:test";
import app from "../../src";

describe("/stats", async () => {
  it("should return 200 when no data is available", async () => {
    const res = await app.request("/stats");
    expect(res.status).toBe(200);
    expect(await res.json()).toEqual({ data: [], count: 0 });
  });
});
