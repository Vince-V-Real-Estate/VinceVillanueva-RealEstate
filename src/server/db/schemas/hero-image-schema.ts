import {sql} from "drizzle-orm";
import {check, pgTable, text, timestamp} from "drizzle-orm/pg-core";

import {user} from "./user-schema";

/**
 * Singleton table that stores the currently active hero section image.
 *
 * The table is constrained to a single row via a fixed primary key
 * (`id = 'singleton'`). The application always reads/writes that one row
 * using an upsert. When `imageUrl` is null, the UI falls back to the
 * bundled default image in `public/`. The same image is used for both
 * desktop and mobile rendering.
 */
export const heroImage = pgTable(
	"hero_image",
	{
		id: text("id").primaryKey().default("singleton"),
		imageUrl: text("image_url"),
		updatedById: text("updated_by_id").references(() => user.id, {onDelete: "set null"}),
		updatedAt: timestamp("updated_at").defaultNow().notNull(),
	},
	(table) => ({
		singletonCheck: check("hero_image_singleton_id", sql`${table.id} = 'singleton'`),
	}),
);

/** Fixed primary key used for the single hero image row. */
export const HERO_IMAGE_SINGLETON_ID = "singleton";
