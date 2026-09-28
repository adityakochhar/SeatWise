import request from "supertest";
import { app, auth, signUp } from "./helpers";

describe("auth", () => {
  it("registers a new account and returns a token", async () => {
    const res = await request(app)
      .post("/api/auth/register")
      .send({ name: "Riya", email: "riya@example.com", password: "password123" });

    expect(res.status).toBe(201);
    expect(res.body.user).toMatchObject({ name: "Riya", email: "riya@example.com", role: "user" });
    expect(typeof res.body.token).toBe("string");
  });

  it("rejects a duplicate email with 409", async () => {
    await signUp("dup@example.com");
    const res = await request(app)
      .post("/api/auth/register")
      .send({ name: "Again", email: "dup@example.com", password: "password123" });

    expect(res.status).toBe(409);
  });

  it("returns field details on invalid input", async () => {
    const res = await request(app).post("/api/auth/register").send({ name: "A", email: "nope", password: "short" });

    expect(res.status).toBe(400);
    const fields = res.body.details.map((d: { field: string }) => d.field);
    expect(fields).toEqual(expect.arrayContaining(["name", "email", "password"]));
  });

  it("rejects a wrong password with 401", async () => {
    await signUp("login@example.com");
    const res = await request(app).post("/api/auth/login").send({ email: "login@example.com", password: "wrong" });

    expect(res.status).toBe(401);
  });

  it("returns the profile for a valid token and 401 without one", async () => {
    const token = await signUp("me@example.com");

    const ok = await request(app).get("/api/auth/me").set(auth(token));
    expect(ok.status).toBe(200);
    expect(ok.body.email).toBe("me@example.com");

    const missing = await request(app).get("/api/auth/me");
    expect(missing.status).toBe(401);
  });
});
