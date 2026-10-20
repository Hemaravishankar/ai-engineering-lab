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
});