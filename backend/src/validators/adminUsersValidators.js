const { z } = require("zod");

const createAdminUserSchema = z.object({
  email: z.string().trim().min(3).max(255).email(),
  password: z.string().min(8).max(72),
  role: z.enum(["admin", "employee"]),
  // Coerce for clients that send "true"/"false" strings (HTML forms, some tools).
  is_active: z.coerce.boolean().optional().default(true),
  full_name: z.string().trim().min(1).max(200),
  title: z.string().trim().max(200).optional().nullable(),
  department: z.string().trim().max(200).optional().nullable(),
  phone: z.string().trim().max(50).optional().nullable(),
  location: z.string().trim().max(200).optional().nullable(),
});

const patchAdminUserSchema = z
  .object({
    role: z.enum(["admin", "employee"]).optional(),
    is_active: z.coerce.boolean().optional(),
  })
  .refine((data) => data.role !== undefined || data.is_active !== undefined, {
    message: "At least one of role, is_active is required",
  });

const uuidParamSchema = z.string().uuid();

module.exports = {
  createAdminUserSchema,
  patchAdminUserSchema,
  uuidParamSchema,
};
