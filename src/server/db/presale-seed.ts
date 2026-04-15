import {eq} from "drizzle-orm";
import {db} from "./index";
import {presaleListing, user} from "./schema";

/**
 * Seed data for presale listings (development use only).
 *
 * Run with: bun seed:presale
 */

/**
 * Dummy presale listing data for development and testing purposes.
 * Uses Unsplash placeholder images instead of UploadThing URLs.
 */
const DUMMY_PRESALES = [
	{
		title: "Oasis Tower",
		description: "Experience luxury living at Oasis Tower in the heart of Downtown Vancouver. This presale opportunity offers unparalleled views and world-class amenities.",
		price: 850000,
		address: "Downtown Vancouver, BC",
		bedrooms: 2,
		bathrooms: 2,
		squareFeet: 950,
		imageUrls: [
			"https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?q=80&w=2940&auto=format&fit=crop",
			"https://images.unsplash.com/photo-1512917774080-9991f1c4c750?q=80&w=2940&auto=format&fit=crop",
			"https://images.unsplash.com/photo-1600607686527-6fb886090705?q=80&w=2950&auto=format&fit=crop",
		],
		status: "new",
		completion: "Fall 2026",
		developer: "Luxury Homes Group",
		amenities: ["Fitness Center", "Pool", "Concierge", "Rooftop Garden"],
	},
	{
		title: "Lumina Residences",
		description: "Lumina Residences redefines modern living in Burnaby Heights. Spacious floor plans, premium finishes, and breathtaking panoramic views await.",
		price: 1250000,
		address: "Burnaby Heights, BC",
		bedrooms: 3,
		bathrooms: 2,
		squareFeet: 1200,
		imageUrls: [
			"https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?q=80&w=2953&auto=format&fit=crop",
			"https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?q=80&w=2950&auto=format&fit=crop",
			"https://images.unsplash.com/photo-1512918728675-ed5a9ecdebfd?q=80&w=2940&auto=format&fit=crop",
		],
		status: "featured",
		completion: "Spring 2025",
		developer: "Cressey Development",
		amenities: ["Spa", "Yoga Studio", "Private Dining", "EV Charging"],
	},
	{
		title: "Apex Lofts",
		description: "Discover urban convenience at Apex Lofts in Surrey Central. These stylish lofts offer open-concept layouts with high ceilings and industrial-chic finishes.",
		price: 620000,
		address: "Surrey Central, BC",
		bedrooms: 1,
		bathrooms: 1,
		squareFeet: 650,
		imageUrls: [
			"https://images.unsplash.com/photo-1600585154340-be6161a56a0c?q=80&w=2940&auto=format&fit=crop",
			"https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?q=80&w=2940&auto=format&fit=crop",
			"https://images.unsplash.com/photo-1600607686527-6fb886090705?q=80&w=2950&auto=format&fit=crop",
		],
		status: null,
		completion: "Winter 2025",
		developer: "Urban Edge Builders",
		amenities: ["Co-working Space", "Gym", "Bike Storage", "Dog Wash"],
	},
	{
		title: "The Horizon",
		description: "The Horizon is an exclusive collection of luxury estate homes in West Vancouver. Featuring expansive terraced living and ocean views.",
		price: 2100000,
		address: "West Vancouver, BC",
		bedrooms: 4,
		bathrooms: 3,
		squareFeet: 2200,
		imageUrls: [
			"https://images.unsplash.com/photo-1600573472591-ee6b68d14c68?q=80&w=2940&auto=format&fit=crop",
			"https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?q=80&w=2953&auto=format&fit=crop",
			"https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?q=80&w=2950&auto=format&fit=crop",
		],
		status: "new",
		completion: "Summer 2027",
		developer: "Signature Estates",
		amenities: ["Infinity Pool", "Wine Cellar", "Private Garage", "Chef's Kitchen"],
	},
];

/**
 * Main seeding function that creates dummy presale listings in the database.
 * Finds the admin user and associates listings with them.
 * Exits with code 0 on success or 1 on failure.
 * @async
 */
async function seed() {
	console.log("Starting presale listing seed...");

	// Find the admin user to associate listings with
	const adminUser = await db.query.user.findFirst({
		where: eq(user.role, "admin"),
	});

	if (!adminUser) {
		console.error("No admin user found. Please create an admin user first.");
		process.exit(1);
	}

	console.log(`Found admin user: ${adminUser.email}`);

	// Insert the dummy presale listings
	for (const listing of DUMMY_PRESALES) {
		const [inserted] = await db
			.insert(presaleListing)
			.values({
				...listing,
				realtorId: adminUser.id,
			})
			.returning();

		if (inserted) {
			console.log(`Created presale: ${inserted.title} (ID: ${inserted.id})`);
		}
	}

	console.log("Presale seed completed successfully!");
	process.exit(0);
}

seed().catch((err) => {
	console.error("Presale seed failed:", err);
	process.exit(1);
});
