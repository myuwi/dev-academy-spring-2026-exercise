import { describe, expect, it } from "bun:test";
import app from "../../src";
import { seedElectricityData } from "../seeds/electricityData";
import { asc, desc, mockUrl } from "../utils";

describe("GET /stats", async () => {
  it("should return 200 when no data is available", async () => {
    const url = mockUrl("/stats");
    const res = await app.request(url);

    expect(res.status).toBe(200);
    expect(await res.json()).toEqual({ data: [], total: 0 });
  });

  it("should ignore unknown query parameters", async () => {
    const url = mockUrl("/stats", { extra: "foo" });
    const res = await app.request(url);

    expect(res.status).toBe(200);
  });

  it("should reject invalid query parameters", async () => {
    const url = mockUrl("/stats", { limit: "foo" });
    const res = await app.request(url);

    expect(res.status).toBe(400);
  });

  it("should return correct total count of records", async () => {
    await seedElectricityData();
    const url = mockUrl("/stats");
    const res = await app.request(url);

    expect(res.status).toBe(200);

    const json = (await res.json()) as any;
    expect(json.data).toBeArrayOfSize(7);
    expect(json.total).toBe(7);
  });

  it("should calculate longestNegativePriceHours correctly", async () => {
    await seedElectricityData();
    const url = mockUrl("/stats");
    const res = await app.request(url);

    expect(res.status).toBe(200);

    const json = (await res.json()) as any;
    expect(json.data[0].longestNegativePriceHours).toBe(0);
    expect(json.data[1].longestNegativePriceHours).toBe(5);
    expect(json.data[2].longestNegativePriceHours).toBe(1);
  });

  it("should return data ordered by date asc when no query parameters are set", async () => {
    await seedElectricityData();
    const url = mockUrl("/stats");
    const res = await app.request(url);

    expect(res.status).toBe(200);

    const json = (await res.json()) as any;
    const sorted = [...json.data].sort(asc("date"));

    expect(json.data).toEqual(sorted);
  });

  it("should return data ordered by date desc when ?sortDirection=desc", async () => {
    await seedElectricityData();
    const url = mockUrl("/stats", { sortDirection: "desc" });
    const res = await app.request(url);

    expect(res.status).toBe(200);

    const json = (await res.json()) as any;
    const sorted = [...json.data].sort(desc("date"));

    expect(json.data).toEqual(sorted);
  });

  it("should return data ordered by averagePrice desc when ?sortBy=averagePrice&sortDirection=desc", async () => {
    await seedElectricityData();
    const url = mockUrl("/stats", { sortBy: "averagePrice", sortDirection: "desc" });
    const res = await app.request(url);

    expect(res.status).toBe(200);

    const json = (await res.json()) as any;
    const sorted = [...json.data].sort(desc("averagePrice"));

    expect(json.data).toEqual(sorted);
  });

  it("should return data ordered by averagePrice asc when ?sortBy=averagePrice&sortDirection=asc", async () => {
    await seedElectricityData();
    const url = mockUrl("/stats", { sortBy: "averagePrice", sortDirection: "asc" });
    const res = await app.request(url);

    expect(res.status).toBe(200);

    const json = (await res.json()) as any;
    const sorted = [...json.data].sort(asc("averagePrice"));

    expect(json.data).toEqual(sorted);
  });

  it("should return nulls first when ?sortDirection=asc", async () => {
    await seedElectricityData();
    const url = mockUrl("/stats", { sortBy: "totalConsumption", sortDirection: "asc" });
    const res = await app.request(url);

    expect(res.status).toBe(200);

    const json = (await res.json()) as any;
    expect(json.data[0].totalConsumption).toBeNull();
    expect(json.data[json.data.length - 1].totalConsumption).not.toBeNull();
  });

  it("should return nulls last when ?sortDirection=desc", async () => {
    await seedElectricityData();
    const url = mockUrl("/stats", { sortBy: "totalConsumption", sortDirection: "desc" });
    const res = await app.request(url);

    expect(res.status).toBe(200);

    const json = (await res.json()) as any;
    expect(json.data[0].totalConsumption).not.toBeNull();
    expect(json.data[json.data.length - 1].totalConsumption).toBeNull();
  });

  it("should support pagination", async () => {
    await seedElectricityData();
    const url = mockUrl("/stats", { limit: 2, offset: 4 });
    const res = await app.request(url);

    expect(res.status).toBe(200);

    const json = (await res.json()) as any;
    expect(json.data).toBeArrayOfSize(2);
    expect(json.total).toBe(7);

    expect(json.data[0].date).toBe("2026-01-02");
    expect(json.data[1].date).toBe("2026-01-03");
  });

  it("should return data matching search query", async () => {
    await seedElectricityData();
    const url = mockUrl("/stats", { search: "2026-01" });
    const res = await app.request(url);

    expect(res.status).toBe(200);

    const json = (await res.json()) as any;
    expect(json.data).toBeArrayOfSize(4);
    expect(json.total).toBe(4);

    expect(json.data[0].date).toBe("2026-01-01");
    expect(json.data[1].date).toBe("2026-01-02");
    expect(json.data[2].date).toBe("2026-01-03");
    expect(json.data[3].date).toBe("2026-01-04");
  });

  it("should return no data when search query doesn't match any records", async () => {
    await seedElectricityData();
    const url = mockUrl("/stats", { search: "foo" });
    const res = await app.request(url);

    expect(res.status).toBe(200);

    const json = (await res.json()) as any;
    expect(json.data).toBeArrayOfSize(0);
    expect(json.total).toBe(0);
  });
});

describe("GET /stats/:date", async () => {
  it("should return 404 when no data is available", async () => {
    const url = mockUrl("/stats/2026-01-01");
    const res = await app.request(url);

    expect(res.status).toBe(404);
  });

  it("should return 400 on invalid iso date", async () => {
    const url = mockUrl("/stats/foo");
    const res = await app.request(url);

    expect(res.status).toBe(400);
  });

  it("should return 400 on invalid iso date", async () => {
    await seedElectricityData();
    const url = mockUrl("/stats/2026-01-01");
    const res = await app.request(url);

    expect(res.status).toBe(200);

    const json = (await res.json()) as any;
    expect(json.date).toBe("2026-01-01");
    expect(json.data).toBeArrayOfSize(24);
  });
});
