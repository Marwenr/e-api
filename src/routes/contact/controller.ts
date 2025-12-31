import { FastifyReply, FastifyRequest } from "fastify";
import { ContactService } from "../../services";
import { sendSuccess, sendError } from "../../utils/response";
import { ValidationError } from "../../services/errors";

/**
 * Create a new contact submission
 */
export const create = async (
  request: FastifyRequest,
  reply: FastifyReply
): Promise<void> => {
  try {
    const { name, email, message } = request.body as {
      name: string;
      email: string;
      message: string;
    };

    const contact = await ContactService.createContact({
      name,
      email,
      message,
    });

    sendSuccess(reply, contact, 201);
  } catch (error: any) {
    if (error instanceof ValidationError) {
      sendError(reply, error.message, error.code, error.statusCode);
    } else {
      sendError(
        reply,
        "Failed to submit contact form",
        "CREATE_CONTACT_ERROR",
        500
      );
    }
  }
};
