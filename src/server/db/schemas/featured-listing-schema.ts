import {doublePrecision, integer, pgTable, text, timestamp, uuid} from "drizzle-orm/pg-core";

import {user} from "./user-schema";

export const featuredListing = pgTable("featured_listing", {
	id: uuid("id").primaryKey().defaultRandom(),
	title: text("title").notNull(),
	description: text("description").notNull(),
	imageUrl: text("image_url").notNull(),
	price: integer("price").notNull(),
	address: text("address").notNull(),
	bedrooms: integer("bedrooms").notNull(),
	bathrooms: doublePrecision("bathrooms").notNull(),
	squareFeet: integer("square_feet").notNull(),
	realtorId: text("realtor_id")
		.notNull()
		.references(() => user.id, {onDelete: "cascade"}),
	createdAt: timestamp("created_at").defaultNow().notNull(),
	updatedAt: timestamp("updated_at").defaultNow().notNull(),
});
