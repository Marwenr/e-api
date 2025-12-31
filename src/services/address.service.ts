import { Address } from '../models';
import { NotFoundError, ValidationError, UnauthorizedError } from './errors';

export interface CreateAddressInput {
  userId: string;
  fullName: string;
  addressLine1: string;
  addressLine2?: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
  isDefault?: boolean;
}

export interface UpdateAddressInput {
  fullName?: string;
  addressLine1?: string;
  addressLine2?: string;
  city?: string;
  state?: string;
  postalCode?: string;
  country?: string;
  isDefault?: boolean;
}

export class AddressService {
  /**
   * Create a new address
   */
  static async createAddress(input: CreateAddressInput) {
    // Validate required fields
    if (!input.fullName || !input.addressLine1 || !input.city || !input.state || !input.postalCode || !input.country) {
      throw new ValidationError('All required fields must be provided');
    }

    // If this is set as default, unset other default addresses for this user
    if (input.isDefault) {
      await Address.updateMany(
        { userId: input.userId },
        { $set: { isDefault: false } }
      );
    }

    const address = new Address({
      userId: input.userId,
      fullName: input.fullName.trim(),
      addressLine1: input.addressLine1.trim(),
      addressLine2: input.addressLine2?.trim(),
      city: input.city.trim(),
      state: input.state.trim(),
      postalCode: input.postalCode.trim(),
      country: input.country.trim(),
      isDefault: input.isDefault || false,
    });

    await address.save();
    return address.toJSON();
  }

  /**
   * Get all addresses for a user
   */
  static async getUserAddresses(userId: string) {
    const addresses = await Address.find({ userId }).sort({ isDefault: -1, createdAt: -1 }).lean();
    return addresses.map(addr => ({
      id: addr._id.toString(),
      userId: addr.userId,
      fullName: addr.fullName,
      addressLine1: addr.addressLine1,
      addressLine2: addr.addressLine2,
      city: addr.city,
      state: addr.state,
      postalCode: addr.postalCode,
      country: addr.country,
      isDefault: addr.isDefault,
      createdAt: addr.createdAt,
      updatedAt: addr.updatedAt,
    }));
  }

  /**
   * Get a single address by ID
   */
  static async getAddressById(addressId: string, userId: string) {
    const address = await Address.findOne({ _id: addressId, userId }).lean();
    if (!address) {
      throw new NotFoundError('Address not found');
    }

    return {
      id: address._id.toString(),
      userId: address.userId,
      fullName: address.fullName,
      addressLine1: address.addressLine1,
      addressLine2: address.addressLine2,
      city: address.city,
      state: address.state,
      postalCode: address.postalCode,
      country: address.country,
      isDefault: address.isDefault,
      createdAt: address.createdAt,
      updatedAt: address.updatedAt,
    };
  }

  /**
   * Update an address
   */
  static async updateAddress(addressId: string, userId: string, input: UpdateAddressInput) {
    const address = await Address.findOne({ _id: addressId, userId });
    if (!address) {
      throw new NotFoundError('Address not found');
    }

    // If setting as default, unset other default addresses
    if (input.isDefault && !address.isDefault) {
      await Address.updateMany(
        { userId, _id: { $ne: addressId } },
        { $set: { isDefault: false } }
      );
    }

    // Update fields
    if (input.fullName !== undefined) address.fullName = input.fullName.trim();
    if (input.addressLine1 !== undefined) address.addressLine1 = input.addressLine1.trim();
    if (input.addressLine2 !== undefined) address.addressLine2 = input.addressLine2?.trim();
    if (input.city !== undefined) address.city = input.city.trim();
    if (input.state !== undefined) address.state = input.state.trim();
    if (input.postalCode !== undefined) address.postalCode = input.postalCode.trim();
    if (input.country !== undefined) address.country = input.country.trim();
    if (input.isDefault !== undefined) address.isDefault = input.isDefault;

    await address.save();
    return address.toJSON();
  }

  /**
   * Delete an address
   */
  static async deleteAddress(addressId: string, userId: string) {
    const address = await Address.findOneAndDelete({ _id: addressId, userId });
    if (!address) {
      throw new NotFoundError('Address not found');
    }
    return { message: 'Address deleted successfully' };
  }
}

