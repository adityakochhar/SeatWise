process.env.NODE_ENV = "test";
process.env.JWT_SECRET = "test-secret";
process.env.HOLD_MINUTES = "5";
// Never send real emails from tests, even if server/.env has a Brevo key.
process.env.BREVO_API_KEY = "";
