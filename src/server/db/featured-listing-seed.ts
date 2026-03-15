import { eq } from "drizzle-orm";
import { db } from "./index";
import { featuredListing, user } from "./schema";

/**
 * Seed data for featured listings (development use only).
 *
 * Run with: bun src/server/db/featured-listing-seed.ts
 */

/**
 * Dummy listing data for development and testing purposes.
 * Uses Unsplash placeholder images instead of UploadThing URLs.
 */
const DUMMY_LISTINGS = [
  {
    title: "Modern Downtown Condo with City Views",
    imageUrl: "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=800",
    price: 549000,
    address: "123 Main Street, Unit 1501, Vancouver, BC V6B 2W9",
    bedrooms: 2,
    bathrooms: 2,
    squareFeet: 1150,
  },
  {
    title: "Charming Family Home in Quiet Neighborhood",
    imageUrl:
      "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=800",
    price: 899000,
    address: "456 Oak Avenue, Burnaby, BC V5H 3N4",
    bedrooms: 4,
    bathrooms: 2.5,
    squareFeet: 2400,
  },
];

/**
 * Main seeding function that creates dummy featured listings in the database.
 * Finds the admin user and associates listings with them.
 * Exits with code 0 on success or 1 on failure.
 */
async function seed() {
  console.log("Starting featured listing seed...");

  // Find the admin user to associate listings with
  const adminUser = await db.query.user.findFirst({
    where: eq(user.role, "admin"),
  });

  if (!adminUser) {
    console.error("No admin user found. Please create an admin user first.");
    process.exit(1);
  }

  console.log(`Found admin user: ${adminUser.email}`);

  // Insert the dummy listings
  for (const listing of DUMMY_LISTINGS) {
    const [inserted] = await db
      .insert(featuredListing)
      .values({
        ...listing,
        realtorId: adminUser.id,
      })
      .returning();

    if (inserted) {
      console.log(`Created listing: ${inserted.title} (ID: ${inserted.id})`);
    }
  }

  console.log("Seed completed successfully!");
  process.exit(0);
}

seed().catch((err) => {
  console.error("Seed failed:", err);
  process.exit(1);
});
