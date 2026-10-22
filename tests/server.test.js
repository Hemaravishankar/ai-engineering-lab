import { describe, it, expect, beforeEach } from "vitest";
const request = require("supertest");
const app = require("../src/server");

describe("Book API", () => {
  beforeEach(() => {
    // We'll add test-data isolation in a later iteration.
  });

  it("returns a healthy status", async () => {
    const response = await request(app).get("/health");

    expect(response.status).toBe(200);
    expect(response.body.status).toBe("ok");
  });

  it("creates a book", async () => {
    const response = await request(app)
      .post("/books")
      .send({ title: "Clean Code", author: "Robert Martin" });

    expect(response.status).toBe(201);
    expect(response.body.title).toBe("Clean Code");
    expect(response.body.author).toBe("Robert Martin");
  });

  it("rejects missing book fields", async () => {
    const response = await request(app)
      .post("/books")
      .send({ title: "" });

    expect(response.status).toBe(400);
  });

  it("preserves existing response format and behavior when pagination parameters are omitted", async () => {
    const response = await request(app).get("/books");

    expect(response.status).toBe(200);
    expect(Array.isArray(response.body)).toBe(true);
    expect(response.body.length).toBeGreaterThanOrEqual(1);
    expect(response.body[0]).toMatchObject({
      title: "Clean Code",
      author: "Robert Martin",
    });
  });

  describe("Pagination", () => {
    it("seeds additional books for pagination tests", async () => {
      // "creates a book" already created 1 book. We add 14 more to reach 15 books.
      for (let i = 2; i <= 15; i++) {
        const res = await request(app)
          .post("/books")
          .send({ title: `Book ${i}`, author: `Author ${i}` });
        expect(res.status).toBe(201);
      }
    });

    it("applies default pagination (page=1, limit=10) when parameters are omitted", async () => {
      const response = await request(app).get("/books");

      expect(response.status).toBe(200);
      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body).toHaveLength(10);
      expect(response.body[0].title).toBe("Clean Code");
      expect(response.body[9].title).toBe("Book 10");
    });

    it("defaults limit to 10 when only page is provided", async () => {
      const response = await request(app).get("/books?page=2");

      expect(response.status).toBe(200);
      expect(Array.isArray(response.body)).toBe(true);
      // Total 15 books; page 2 with limit 10 contains the remaining 5 books (indices 10 to 14)
      expect(response.body).toHaveLength(5);
      expect(response.body[0].title).toBe("Book 11");
      expect(response.body[4].title).toBe("Book 15");
    });

    it("defaults page to 1 when only limit is provided", async () => {
      const response = await request(app).get("/books?limit=4");

      expect(response.status).toBe(200);
      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body).toHaveLength(4);
      expect(response.body[0].title).toBe("Clean Code");
      expect(response.body[3].title).toBe("Book 4");
    });

    it("supports custom page and limit parameters", async () => {
      const page1 = await request(app).get("/books?page=1&limit=5");
      expect(page1.status).toBe(200);
      expect(page1.body).toHaveLength(5);
      expect(page1.body[0].title).toBe("Clean Code");

      const page2 = await request(app).get("/books?page=2&limit=5");
      expect(page2.status).toBe(200);
      expect(page2.body).toHaveLength(5);
      expect(page2.body[0].title).toBe("Book 6");

      const page3 = await request(app).get("/books?page=3&limit=5");
      expect(page3.status).toBe(200);
      expect(page3.body).toHaveLength(5);
      expect(page3.body[0].title).toBe("Book 11");
    });

    it("returns an empty array when requested page is out of range", async () => {
      const response = await request(app).get("/books?page=100&limit=10");

      expect(response.status).toBe(200);
      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body).toEqual([]);
    });

    it("rejects zero values with HTTP 400", async () => {
      const resPageZero = await request(app).get("/books?page=0");
      expect(resPageZero.status).toBe(400);
      expect(resPageZero.body).toHaveProperty("error");

      const resLimitZero = await request(app).get("/books?limit=0");
      expect(resLimitZero.status).toBe(400);
      expect(resLimitZero.body).toHaveProperty("error");
    });

    it("rejects negative values with HTTP 400", async () => {
      const resPageNeg = await request(app).get("/books?page=-1");
      expect(resPageNeg.status).toBe(400);
      expect(resPageNeg.body).toHaveProperty("error");

      const resLimitNeg = await request(app).get("/books?limit=-5");
      expect(resLimitNeg.status).toBe(400);
      expect(resLimitNeg.body).toHaveProperty("error");
    });

    it("rejects non-numeric values with HTTP 400", async () => {
      const resPageNonNum = await request(app).get("/books?page=abc");
      expect(resPageNonNum.status).toBe(400);
      expect(resPageNonNum.body).toHaveProperty("error");

      const resLimitNonNum = await request(app).get("/books?limit=xyz");
      expect(resLimitNonNum.status).toBe(400);
      expect(resLimitNonNum.body).toHaveProperty("error");
    });

    it("rejects decimal values with HTTP 400", async () => {
      const resPageDecimal = await request(app).get("/books?page=1.5");
      expect(resPageDecimal.status).toBe(400);
      expect(resPageDecimal.body).toHaveProperty("error");

      const resLimitDecimal = await request(app).get("/books?limit=2.5");
      expect(resLimitDecimal.status).toBe(400);
      expect(resLimitDecimal.body).toHaveProperty("error");
    });

    it("rejects empty string values with HTTP 400", async () => {
      const resPageEmpty = await request(app).get("/books?page=");
      expect(resPageEmpty.status).toBe(400);
      expect(resPageEmpty.body).toHaveProperty("error");

      const resLimitEmpty = await request(app).get("/books?limit=");
      expect(resLimitEmpty.status).toBe(400);
      expect(resLimitEmpty.body).toHaveProperty("error");
    });
  });
});
