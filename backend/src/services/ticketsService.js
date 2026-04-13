const { findUserById } = require("../models/usersModel");
const {
  insertTicket,
  listTicketsForAdmin,
  listTicketsForUser,
  findTicketById,
  updateTicketById,
} = require("../models/ticketsModel");
const { logAudit } = require("./auditService");

function isAdmin(user) {
  return user?.role === "admin";
}

function ensureOwnerOrAdmin(ticket, user) {
  if (isAdmin(user)) return;
  if (!ticket || ticket.created_by !== user.id) {
    const err = new Error("Not found");
    err.statusCode = 404;
    throw err;
  }
}

async function createTicket(req, input) {
  // Any authenticated user can create; in this system roles are admin/employee.
  const ticket = await insertTicket({
    created_by: req.user.id,
    subject: input.subject,
    description: input.description,
    priority: input.priority,
  });

  await logAudit(req, {
    actor_user_id: req.user.id,
    action: "ticket.create",
    entity_type: "ticket",
    entity_id: ticket.id,
    metadata: { priority: ticket.priority },
  });

  return ticket;
}

async function listTickets(req) {
  if (isAdmin(req.user)) return listTicketsForAdmin();
  return listTicketsForUser(req.user.id);
}

async function getTicket(req, ticketId) {
  const ticket = await findTicketById(ticketId);
  if (!ticket) {
    const err = new Error("Ticket not found");
    err.statusCode = 404;
    throw err;
  }
  //ensureOwnerOrAdmin(ticket, req.user);
  return ticket;
}

async function patchTicket(req, ticketId, input) {
  const existing = await findTicketById(ticketId);
  if (!existing) {
    const err = new Error("Ticket not found");
    err.statusCode = 404;
    throw err;
  }

  // Enforce ownership rules for non-admin.
  ensureOwnerOrAdmin(existing, req.user);

  let updateFields = {};

  if (isAdmin(req.user)) {
    updateFields = {
      subject: input.subject,
      description: input.description,
      status: input.status,
      priority: input.priority,
      assigned_to: input.assigned_to,
    };

    if (input.assigned_to !== undefined && input.assigned_to !== null) {
      const assignee = await findUserById(input.assigned_to);
      if (!assignee) {
        const err = new Error("assigned_to user not found");
        err.statusCode = 400;
        throw err;
      }
      if (!assignee.is_active) {
        const err = new Error("assigned_to user is inactive");
        err.statusCode = 400;
        throw err;
      }
    }
  } else {
    updateFields = {
      subject: input.subject,
      description: input.description,
    };
  }

  const updated = await updateTicketById(ticketId, updateFields);

  await logAudit(req, {
    actor_user_id: req.user.id,
    action: "ticket.update",
    entity_type: "ticket",
    entity_id: ticketId,
    metadata: {
      before: {
        status: existing.status,
        priority: existing.priority,
        assigned_to: existing.assigned_to,
        subject: existing.subject,
      },
      after: {
        status: updated.status,
        priority: updated.priority,
        assigned_to: updated.assigned_to,
        subject: updated.subject,
      },
    },
  });

  return updated;
}

module.exports = {
  createTicket,
  listTickets,
  getTicket,
  patchTicket,
};

