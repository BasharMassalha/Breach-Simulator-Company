const { z } = require("zod");

const uuidSchema = z.string().uuid();

const listAuditLogsQuerySchema = z.object({
  actor_user_id: uuidSchema.optional(),
  action: z.string().trim().min(1).max(200).optional(),
  entity_type: z.string().trim().min(1).max(200).optional(),
  entity_id: uuidSchema.optional(),
  limit: z.coerce.number().int().min(1).max(100).optional().default(50),
  offset: z.coerce.number().int().min(0).optional().default(0),
});

module.exports = { listAuditLogsQuerySchema };

