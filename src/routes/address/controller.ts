import { FastifyReply } from 'fastify';
import { AuthenticatedRequest } from '../../middleware/auth';
import { AddressService } from '../../services';
import { sendSuccess, sendError } from '../../utils/response';
import { AuthError } from '../../services/errors';

/**
 * Get all addresses for the authenticated user
 */
export const getAll = async (
  request: AuthenticatedRequest,
  reply: FastifyReply
): Promise<void> => {
  try {
    if (!request.user) {
      sendError(reply, 'Unauthorized', 'UNAUTHORIZED', 401);
      return;
    }

    const addresses = await AddressService.getUserAddresses(request.user.userId);
    sendSuccess(reply, addresses, 200);
  } catch (error: any) {
    if (error instanceof AuthError) {
      sendError(reply, error.message, error.code, error.statusCode);
    } else {
      sendError(reply, 'Failed to get addresses', 'GET_ADDRESSES_ERROR', 500);
    }
  }
};

/**
 * Get a single address by ID
 */
export const getById = async (
  request: AuthenticatedRequest,
  reply: FastifyReply
): Promise<void> => {
  try {
    if (!request.user) {
      sendError(reply, 'Unauthorized', 'UNAUTHORIZED', 401);
      return;
    }

    const { id } = request.params as { id: string };
    const address = await AddressService.getAddressById(id, request.user.userId);
    sendSuccess(reply, address, 200);
  } catch (error: any) {
    if (error instanceof AuthError) {
      sendError(reply, error.message, error.code, error.statusCode);
    } else {
      sendError(reply, 'Failed to get address', 'GET_ADDRESS_ERROR', 500);
    }
  }
};

/**
 * Create a new address
 */
export const create = async (
  request: AuthenticatedRequest,
  reply: FastifyReply
): Promise<void> => {
  try {
    if (!request.user) {
      sendError(reply, 'Unauthorized', 'UNAUTHORIZED', 401);
      return;
    }

    const { fullName, addressLine1, addressLine2, city, state, postalCode, country, isDefault } = request.body as {
      fullName: string;
      addressLine1: string;
      addressLine2?: string;
      city: string;
      state: string;
      postalCode: string;
      country: string;
      isDefault?: boolean;
    };

    const address = await AddressService.createAddress({
      userId: request.user.userId,
      fullName,
      addressLine1,
      addressLine2,
      city,
      state,
      postalCode,
      country,
      isDefault,
    });

    sendSuccess(reply, address, 201);
  } catch (error: any) {
    if (error instanceof AuthError) {
      sendError(reply, error.message, error.code, error.statusCode);
    } else {
      sendError(reply, 'Failed to create address', 'CREATE_ADDRESS_ERROR', 500);
    }
  }
};

/**
 * Update an address
 */
export const update = async (
  request: AuthenticatedRequest,
  reply: FastifyReply
): Promise<void> => {
  try {
    if (!request.user) {
      sendError(reply, 'Unauthorized', 'UNAUTHORIZED', 401);
      return;
    }

    const { id } = request.params as { id: string };
    const { fullName, addressLine1, addressLine2, city, state, postalCode, country, isDefault } = request.body as {
      fullName?: string;
      addressLine1?: string;
      addressLine2?: string;
      city?: string;
      state?: string;
      postalCode?: string;
      country?: string;
      isDefault?: boolean;
    };

    const address = await AddressService.updateAddress(id, request.user.userId, {
      fullName,
      addressLine1,
      addressLine2,
      city,
      state,
      postalCode,
      country,
      isDefault,
    });

    sendSuccess(reply, address, 200);
  } catch (error: any) {
    if (error instanceof AuthError) {
      sendError(reply, error.message, error.code, error.statusCode);
    } else {
      sendError(reply, 'Failed to update address', 'UPDATE_ADDRESS_ERROR', 500);
    }
  }
};

/**
 * Delete an address
 */
export const deleteAddress = async (
  request: AuthenticatedRequest,
  reply: FastifyReply
): Promise<void> => {
  try {
    if (!request.user) {
      sendError(reply, 'Unauthorized', 'UNAUTHORIZED', 401);
      return;
    }

    const { id } = request.params as { id: string };
    const result = await AddressService.deleteAddress(id, request.user.userId);
    sendSuccess(reply, result, 200);
  } catch (error: any) {
    if (error instanceof AuthError) {
      sendError(reply, error.message, error.code, error.statusCode);
    } else {
      sendError(reply, 'Failed to delete address', 'DELETE_ADDRESS_ERROR', 500);
    }
  }
};

