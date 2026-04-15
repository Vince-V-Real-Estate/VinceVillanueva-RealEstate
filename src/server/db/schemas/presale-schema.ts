import {doublePrecision, integer, jsonb, pgTable, text, timestamp, uuid} from "drizzle-orm/pg-core";

import {user} from "./user-schema";

export const presaleListing = pgTable("presale_listing", {
	id: uuid("id").primaryKey().defaultRandom(),
	title: text("title").notNull(),
	description: text("description").notNull(),
	price: integer("price").notNull(),
	address: text("address").notNull(),
	bedrooms: integer("bedrooms").notNull(),
	bathrooms: doublePrecision("bathrooms").notNull(),
	squareFeet: integer("square_feet").notNull(),
	imageUrls: jsonb("image_urls").notNull().$type<string[]>(),
	status: text("status"),
	completion: text("completion").notNull(),
	developer: text("developer").notNull(),
	amenities: jsonb("amenities").notNull().$type<string[]>(),
	realtorId: text("realtor_id")
		.notNull()
		.references(() => user.id, {onDelete: "cascade"}),
	createdAt: timestamp("created_at").defaultNow().notNull(),
	updatedAt: timestamp("updated_at").defaultNow().notNull(),
});
