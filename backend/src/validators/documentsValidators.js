const { z } = require("zod");

const uuidParamSchema = z.string().uuid();

const sensitivityEnum = z.enum(["public", "internal", "confidential"]);

const listDocumentsQuerySchema = z.object({
  category: z.string().trim().min(1).max(200).optional(),
  sensitivity: sensitivityEnum.optional(),
  owner_user_id: z.string().uuid().optional(),
  name: z.string().trim().min(1).max(200).optional(),
});

module.exports = {
  uuidParamSchema,
  listDocumentsQuerySchema,
  sensitivityEnum,
};

