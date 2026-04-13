const {
  uuidParamSchema,
  createTicketSchema,
  patchTicketEmployeeSchema,
  patchTicketAdminSchema,
} = require("../validators/ticketsValidators");
const { createTicket, listTickets, getTicket, patchTicket } = require("../services/ticketsService");

function validationError(issues) {
  return {
    error: "ValidationError",
    message: "Invalid request",
    issues: issues.map((i) => ({ path: i.path, message: i.message })),
  };
}

async function create(req, res, next) {
  try {
    const parsed = createTicketSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json(validationError(parsed.error.issues));
    }
    const ticket = await createTicket(req, parsed.data);
    return res.status(201).json({ ticket });
  } catch (err) {
    return next(err);
  }
}

async function list(req, res, next) {
  try {
    const tickets = await listTickets(req);
    return res.status(200).json({ tickets });
  } catch (err) {
    return next(err);
  }
}

async function getById(req, res, next) {
  try {
    const idParsed = uuidParamSchema.safeParse(req.params.id);
    if (!idParsed.success) {
      return res.status(400).json({ error: "ValidationError", message: "Invalid ticket id" });
    }
    const ticket = await getTicket(req, idParsed.data);
    return res.status(200).json({ ticket });
  } catch (err) {
    return next(err);
  }
}

async function patchById(req, res, next) {
  try {
    const idParsed = uuidParamSchema.safeParse(req.params.id);
    if (!idParsed.success) {
      return res.status(400).json({ error: "ValidationError", message: "Invalid ticket id" });
    }

    const schema = req.user.role === "admin" ? patchTicketAdminSchema : patchTicketEmployeeSchema;
    const parsed = schema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json(validationError(parsed.error.issues));
    }

    const ticket = await patchTicket(req, idParsed.data, parsed.data);
    return res.status(200).json({ ticket });
  } catch (err) {
    return next(err);
  }
}

module.exports = { create, list, getById, patchById };

