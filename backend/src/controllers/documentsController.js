const { uuidParamSchema, listDocumentsQuerySchema } = require("../validators/documentsValidators");
const { listDocuments, getDocument } = require("../services/documentsService");

function validationError(issues) {
  return {
    error: "ValidationError",
    message: "Invalid request",
    issues: issues.map((i) => ({ path: i.path, message: i.message })),
  };
}

async function list(req, res, next) {
  try {
    const parsed = listDocumentsQuerySchema.safeParse(req.query);
    if (!parsed.success) {
      return res.status(400).json(validationError(parsed.error.issues));
    }

    const documents = await listDocuments(req, parsed.data);
    return res.status(200).json({ documents });
  } catch (err) {
    return next(err);
  }
}

async function getById(req, res, next) {
  try {
    const idParsed = uuidParamSchema.safeParse(req.params.id);
    if (!idParsed.success) {
      return res.status(400).json({ error: "ValidationError", message: "Invalid document id" });
    }

    const document = await getDocument(req, idParsed.data);
    return res.status(200).json({ document });
  } catch (err) {
    return next(err);
  }
}

module.exports = { list, getById };

