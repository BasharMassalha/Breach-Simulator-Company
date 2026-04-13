const { z } = require("zod");

const loginSchema = z.object({
  email: z.string().trim().min(3).max(255).email(),
  password: z.string().min(8).max(72),
});

module.exports = { loginSchema };

