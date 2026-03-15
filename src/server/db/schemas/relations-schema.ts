import { relations } from "drizzle-orm";

import { account } from "./account-schema";
import { featuredListing } from "./featured-listing-schema";
import { session } from "./session-schema";
import { user } from "./user-schema";

export const userRelations = relations(user, ({ many }) => ({
  account: many(account),
  featuredListings: many(featuredListing),
  session: many(session),
}));

export const accountRelations = relations(account, ({ one }) => ({
  user: one(user, { fields: [account.userId], references: [user.id] }),
}));

export const sessionRelations = relations(session, ({ one }) => ({
  user: one(user, { fields: [session.userId], references: [user.id] }),
}));

export const featuredListingRelations = relations(
  featuredListing,
  ({ one }) => ({
    realtor: one(user, {
      fields: [featuredListing.realtorId],
      references: [user.id],
    }),
  }),
);
