const {
  listDocumentsForAdmin,
  listDocumentsForUser,
  findDocumentByIdForAdmin,
  findDocumentByIdForUser,
} = require("../models/documentsModel");

function isAdmin(user) {
  return user?.role === "admin";
}

async function listDocuments(req, filters) {
  if (isAdmin(req.user)) return listDocumentsForAdmin(filters);
  return listDocumentsForUser(req.user.id, filters);
}

async function getDocument(req, documentId) {
  const doc = isAdmin(req.user)
    ? await findDocumentByIdForAdmin(documentId)
    : await findDocumentByIdForUser(req.user.id, documentId);

  if (!doc) {
    const err = new Error("Document not found");
    err.statusCode = 404;
    throw err;
  }

  return doc;
}

module.exports = { listDocuments, getDocument };

