import {z} from "zod";

interface EmailSchemaOptions {
	requiredMessage?: string;
	invalidMessage?: string;
}

const DEFAULT_REQUIRED_MESSAGE = "Email is required";
const DEFAULT_INVALID_MESSAGE = "Please enter a valid email address";

export const createEmailSchema = (options?: EmailSchemaOptions) => {
	const {requiredMessage = DEFAULT_REQUIRED_MESSAGE, invalidMessage = DEFAULT_INVALID_MESSAGE} = options ?? {};

	return z.string().trim().min(1, requiredMessage).email(invalidMessage);
};

export const emailSchema = createEmailSchema();
