import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { loadConfig } from "../config.js";

describe("loadConfig", () => {
  const originalEnv = process.env;

  beforeEach(() => {
    process.env = { ...originalEnv };
  });

  afterEach(() => {
    process.env = originalEnv;
  });

  it("retorna defaults quando nenhuma env var está definida", () => {
    delete process.env.FFV_API_BASE_URL;
    delete process.env.FFV_ADMIN_TOKEN;
    delete process.env.FFV_HTTP_TIMEOUT_MS;

    const cfg = loadConfig();

    expect(cfg.baseUrl).toBe("http://localhost:8080");
    expect(cfg.adminToken).toBeNull();
    expect(cfg.httpTimeoutMs).toBe(15_000);
  });

  it("usa FFV_API_BASE_URL quando definida", () => {
    process.env.FFV_API_BASE_URL = "https://api.example.com";
    const cfg = loadConfig();
    expect(cfg.baseUrl).toBe("https://api.example.com");
  });

  it("remove trailing slash da baseUrl", () => {
    process.env.FFV_API_BASE_URL = "https://api.example.com/";
    const cfg = loadConfig();
    expect(cfg.baseUrl).toBe("https://api.example.com");
  });

  it("remove múltiplos trailing slashes da baseUrl", () => {
    process.env.FFV_API_BASE_URL = "https://api.example.com///";
    const cfg = loadConfig();
    expect(cfg.baseUrl).toBe("https://api.example.com");
  });

  it("usa FFV_ADMIN_TOKEN quando definida", () => {
    process.env.FFV_ADMIN_TOKEN = "eyJhbGci.token.exemplo";
    const cfg = loadConfig();
    expect(cfg.adminToken).toBe("eyJhbGci.token.exemplo");
  });

  it("trata FFV_ADMIN_TOKEN só com espaços como null", () => {
    process.env.FFV_ADMIN_TOKEN = "   ";
    const cfg = loadConfig();
    expect(cfg.adminToken).toBeNull();
  });

  it("usa FFV_HTTP_TIMEOUT_MS quando definida", () => {
    process.env.FFV_HTTP_TIMEOUT_MS = "5000";
    const cfg = loadConfig();
    expect(cfg.httpTimeoutMs).toBe(5_000);
  });

  it("lança erro quando FFV_HTTP_TIMEOUT_MS não é número", () => {
    process.env.FFV_HTTP_TIMEOUT_MS = "nao-e-numero";
    expect(() => loadConfig()).toThrow("FFV_HTTP_TIMEOUT_MS inválido");
  });

  it("lança erro quando FFV_HTTP_TIMEOUT_MS é zero", () => {
    process.env.FFV_HTTP_TIMEOUT_MS = "0";
    expect(() => loadConfig()).toThrow("FFV_HTTP_TIMEOUT_MS inválido");
  });

  it("lança erro quando FFV_HTTP_TIMEOUT_MS é negativo", () => {
    process.env.FFV_HTTP_TIMEOUT_MS = "-1000";
    expect(() => loadConfig()).toThrow("FFV_HTTP_TIMEOUT_MS inválido");
  });
});
