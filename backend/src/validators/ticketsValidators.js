const { z } = require("zod");

const uuidParamSchema = z.string().uuid();

const createTicketSchema = z.object({
  subject: z.string().trim().min(3).max(200),
  description: z.string().trim().min(3).max(5000),
  priority: z.enum(["low", "medium", "high"]).optional(),
});

const patchTicketEmployeeSchema = z
  .object({
    subject: z.string().trim().min(3).max(200).optional(),
    description: z.string().trim().min(3).max(5000).optional(),
  })
  .refine((d) => d.subject !== undefined || d.description !== undefined, {
    message: "At least one field is required",
  });

const patchTicketAdminSchema = z
  .object({
    subject: z.string().trim().min(3).max(200).optional(),
    description: z.string().trim().min(3).max(5000).optional(),
    status: z.enum(["open", "in_progress", "closed"]).optional(),
    priority: z.enum(["low", "medium", "high"]).optional(),
    assigned_to: z.string().uuid().nullable().optional(),
  })
  .refine(
    (d) =>
      d.subject !== undefined ||
      d.description !== undefined ||
      d.status !== undefined ||
      d.priority !== undefined ||
      d.assigned_to !== undefined,
    { message: "At least one field is required" }
  );

module.exports = {
  uuidParamSchema,
  createTicketSchema,
  patchTicketEmployeeSchema,
  patchTicketAdminSchema,
};

