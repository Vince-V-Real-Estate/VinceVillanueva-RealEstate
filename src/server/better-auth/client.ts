import {createAuthClient} from "better-auth/react";
import {inferAdditionalFields} from "better-auth/client/plugins";
import {dashClient} from "@better-auth/infra/client";

export const authClient = createAuthClient({
	plugins: [
		dashClient(),
		inferAdditionalFields({
			user: {
				firstName: {
					type: "string",
					required: false,
					input: false,
					fieldName: "firstName",
				},
				lastName: {
					type: "string",
					required: false,
					input: false,
					fieldName: "lastName",
				},
				role: {
					type: "string",
					required: false,
					defaultValue: "client",
					input: false,
				},
			},
		}),
	],
});

export type Session = typeof authClient.$Infer.Session;
