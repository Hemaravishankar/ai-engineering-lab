import { describe, it, expect, beforeEach, beforeAll } from "vitest";
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

  describe("GET /books pagination", () => {
    beforeAll(async () => {
      // Seed 11 books so that combined with "Clean Code", total is 12 books
      for (let i = 1; i <= 11; i++) {
        await request(app)
          .post("/books")
          .send({ title: `Book ${i}`, author: `Author ${i}` });
      }
    });

    it("returns default pagination (page=1, limit=10) when parameters are omitted", async () => {
      const response = await request(app).get("/books");

      expect(response.status).toBe(200);
      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body).toHaveLength(10);
      expect(response.body[0].title).toBe("Clean Code");
      expect(response.body[1].title).toBe("Book 1");
      expect(response.body[9].title).toBe("Book 9");
    });

    it("returns correct page with custom page and limit (page=2, limit=5)", async () => {
      const response = await request(app).get("/books?page=2&limit=5");

      expect(response.status).toBe(200);
      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body).toHaveLength(5);
      expect(response.body[0].title).toBe("Book 5");
      expect(response.body[4].title).toBe("Book 9");
    });

    it("respects partial pagination parameter (custom page with default limit)", async () => {
      const response = await request(app).get("/books?page=2");

      expect(response.status).toBe(200);
      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body).toHaveLength(2);
      expect(response.body[0].title).toBe("Book 10");
      expect(response.body[1].title).toBe("Book 11");
    });

    it("respects partial pagination parameter (custom limit with default page)", async () => {
      const response = await request(app).get("/books?limit=3");

      expect(response.status).toBe(200);
      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body).toHaveLength(3);
      expect(response.body[0].title).toBe("Clean Code");
      expect(response.body[1].title).toBe("Book 1");
      expect(response.body[2].title).toBe("Book 2");
    });

    it("returns an empty array when requested page is beyond total items", async () => {
      const response = await request(app).get("/books?page=10&limit=10");

      expect(response.status).toBe(200);
      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body).toHaveLength(0);
    });

    it("rejects invalid page values (zero, negative, non-numeric)", async () => {
      const invalidPages = ["0", "-1", "-10", "abc", "1.5", ""];

      for (const val of invalidPages) {
        const response = await request(app).get(`/books?page=${val}`);
        expect(response.status).toBe(400);
        expect(response.body).toHaveProperty("error");
      }
    });

    it("rejects invalid limit values (zero, negative, non-numeric)", async () => {
      const invalidLimits = ["0", "-1", "-5", "xyz", "2.5", ""];

      for (const val of invalidLimits) {
        const response = await request(app).get(`/books?limit=${val}`);
        expect(response.status).toBe(400);
        expect(response.body).toHaveProperty("error");
      }
    });
  });
});
