import { describe, expect, it } from "vitest";
import { loginSchema, registerSchema } from "./validation.js";

describe("auth validation", () => {
  it("requires a full name for signup", () => {
    expect(() =>
      registerSchema.parse({
        email: "learner@example.com",
        password: "Password123",
      }),
    ).toThrow();
  });

  it("accepts valid signup data and normalizes the email", () => {
    const parsed = registerSchema.parse({
      name: "  Alex Morgan  ",
      email: "ALEX@EXAMPLE.COM",
      password: "Password123",
    });

    expect(parsed.name).toBe("Alex Morgan");
    expect(parsed.email).toBe("alex@example.com");
    expect(parsed.password).toBe("Password123");
  });

  it("accepts valid login data and normalizes the email", () => {
    const parsed = loginSchema.parse({
      email: "LEARNER@EXAMPLE.COM",
      password: "Password123",
    });

    expect(parsed.email).toBe("learner@example.com");
    expect(parsed.password).toBe("Password123");
  });
});
