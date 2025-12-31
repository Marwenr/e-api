import { Contact } from '../models';
import { ValidationError } from './errors';

export interface CreateContactInput {
  name: string;
  email: string;
  message: string;
}

export class ContactService {
  /**
   * Create a new contact submission
   */
  static async createContact(input: CreateContactInput) {
    // Validate required fields
    if (!input.name || !input.email || !input.message) {
      throw new ValidationError('Name, email, and message are required');
    }

    // Validate email format
    const emailRegex = /^\S+@\S+\.\S+$/;
    if (!emailRegex.test(input.email.trim())) {
      throw new ValidationError('Please enter a valid email address');
    }

    const contact = new Contact({
      name: input.name.trim(),
      email: input.email.trim().toLowerCase(),
      message: input.message.trim(),
    });

    await contact.save();
    return contact.toJSON();
  }
}

