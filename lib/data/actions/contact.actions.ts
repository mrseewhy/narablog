"use server";

import { createContactDAL } from "../dal/contact.dal";
import { rateLimiter } from "../security/ratelimit";

import {
  contactSchema,
  type CreateContactInput,
} from "../validation/contact.validate";

export const createContactAction = async (data: CreateContactInput) => {
  //rate limit
  const limit = await rateLimiter("contact");

  if (!limit.allowed) {
    return {
      success: false,
      message: limit.message,
    };
  }

  //validate data
  const result = contactSchema.safeParse(data);
  //check if it is wrong and return
  if (!result.success) {
    return {
      success: false,
      message: "Please change invalid field(s)",
      error: result.error.flatten().fieldErrors,
    };
  }

  if (result.data.contact_extra_reference !== "") {
    return {
      success: true,
      message: "Message received.",
    };
  }

  //save validated data
  try {
    const { contact_extra_reference: _honeypot, ...contactData } = result.data;

    const newContact = await createContactDAL(contactData);

    return {
      success: true,
      message: "Your message has been submitted successfully!",
      data: newContact,
    };
  } catch {
    return {
      success: false,
      message: "Something went wrong! try again",
    };
  }
};
