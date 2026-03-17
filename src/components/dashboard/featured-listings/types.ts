export interface FeaturedListingFormState {
	title: string;
	description: string;
	imageUrl: string;
	price: string;
	address: string;
	bedrooms: string;
	bathrooms: string;
	squareFeet: string;
}

export interface FeaturedListingSubmitState {
	errorMessage: string | null;
	statusMessage: string | null;
}
