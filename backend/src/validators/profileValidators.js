const { z } = require("zod");

const patchProfileSchema = z
  .object({
    full_name: z.string().trim().min(1).max(200).optional(),
    title: z.string().trim().max(200).optional().nullable(),
    department: z.string().trim().max(200).optional().nullable(),
    phone: z.string().trim().max(50).optional().nullable(),
    location: z.string().trim().max(200).optional().nullable(),
  })
  .refine(
    (data) =>
      data.full_name !== undefined ||
      data.title !== undefined ||
      data.department !== undefined ||
      data.phone !== undefined ||
      data.location !== undefined,
    { message: "At least one profile field is required" }
  );

const uuidParamSchema = z.string().uuid();

module.exports = { patchProfileSchema, uuidParamSchema };
