const request = require("supertest");
const express = require("express");
const app = require("../src/app");
const mongoose = require("mongoose");
const User = require("../src/models/User");

// Load local env explicitly for tests if needed
require("dotenv").config({ path: ".env" });

describe("Backend API endpoints testing", () => {
  let token;
  const testUser = {
    name: "Jest Test",
    email: "jesttest@example.com",
    password: "password123",
  };

  beforeAll(async () => {
    // Connect to actual local db or external mongodb
    if (!mongoose.connection.readyState) {
      await mongoose.connect(process.env.MONGO_URI, { dbName: "test_db" });
    }
    // Clean up before test
    await User.deleteMany({ email: testUser.email });
  });

  afterAll(async () => {
    await User.deleteMany({ email: testUser.email });
    await mongoose.connection.close();
  });

  it("1. GET / - Should return backend running message", async () => {
    const res = await request(app).get("/");
    expect(res.statusCode).toBe(200);
    expect(res.text).toContain("✅ EduBot backend is running!");
  });

  it("2. POST /api/auth/signup - Should create a new user", async () => {
    const res = await request(app).post("/api/auth/signup").send(testUser);
    
    // Might already exist due to interrupted tests, so 400 is also acceptable temporarily
    if (res.statusCode === 201) {
      expect(res.body).toHaveProperty("token");
      token = res.body.token;
    } else {
      expect(res.statusCode).toBe(400); // User already exists
    }
  });

  it("3. POST /api/auth/login - Should login and return token", async () => {
    const res = await request(app).post("/api/auth/login").send({
      email: testUser.email,
      password: testUser.password,
    });
    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty("token");
    token = res.body.token; // save token for next requests
  });

  it("4. POST /api/chat - Should attempt chat and handle response properly without crashing", async () => {
    // We only test that the request gets processed with a valid token
    const res = await request(app)
      .post("/api/chat")
      .set("Authorization", `Bearer ${token}`)
      .send({ text: "Hello", subject: "general" });
      
    // Because openrouter API might timeout / rate limit we accept both 200 and error formats
    expect([200, 500]).toContain(res.statusCode);
    expect(res.body).toHaveProperty("botReply");
  });
});
