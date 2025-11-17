// tests/health.int.test.ts
import { describe, it, expect } from "vitest";
import request from "supertest";
import app from "../src/app.js";

describe("Health & Ready Endpoints", () => {
  describe("GET /api/v1/health", () => {
    it("deve retornar status 200 com informações básicas", async () => {
      const res = await request(app).get("/api/v1/health");

      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty("status", "ok");
      expect(res.body).toHaveProperty("timestamp");
    });
  });

  describe("GET /api/v1/ready", () => {
    it("deve retornar status 200 quando o banco está conectado", async () => {
      const res = await request(app).get("/api/v1/ready");

      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty("status", "ready");
      expect(res.body).toHaveProperty("database", "connected");
      expect(res.body).toHaveProperty("timestamp");
    });
  });
});
