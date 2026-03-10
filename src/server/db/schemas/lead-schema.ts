import { pgEnum, pgTable, text, timestamp, uuid } from "drizzle-orm/pg-core";
import { user } from "./user-schema";

export const leadSourceEnum = pgEnum("lead_source", [
  "listings",
  "valuation",
  "call",
  "newsletter",
]);

export const lead = pgTable("lead", {
  id: uuid("id").primaryKey().defaultRandom(),
  fullName: text("full_name").notNull(),
  email: text("email").notNull(),
  phone: text("phone"),
  message: text("message"),
  address: text("address"),
  source: leadSourceEnum("source").notNull(),
  realtorId: text("realtor_id")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
  createdAt: timestamp("created_at")
    .$defaultFn(() => new Date())
    .notNull(),
});
