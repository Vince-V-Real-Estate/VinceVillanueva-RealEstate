"use client";

import Image from "next/image";
import { useActionState, useEffect, useMemo, useRef, useState } from "react";
import { Loader2, Pencil, Trash2 } from "lucide-react";

import { FileUpload } from "@/components/ui/file-upload";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  FeaturedListingsApiError,
  createFeaturedListing,
  deleteFeaturedListing,
  fetchFeaturedListings,
  updateFeaturedListing,
} from "@/lib/featured-listings/client";
import {
  MAX_FEATURED_LISTINGS,
  formatBathroomCount,
  formatFeaturedListingPrice,
  type FeaturedListing,
  type FeaturedListingMutationInput,
} from "@/lib/featured-listings/types";
import { createLogger } from "@/lib/logger";

const log = createLogger("dashboard-featured-listings");

interface FeaturedListingFormState {
  title: string;
  imageUrl: string;
  price: string;
  address: string;
  bedrooms: string;
  bathrooms: string;
  squareFeet: string;
}

interface FeaturedListingSubmitState {
  errorMessage: string | null;
  statusMessage: string | null;
}

interface WholeNumberOptions {
  min?: number;
  max?: number;
  minMessage?: string;
  maxMessage?: string;
}

const EMPTY_FORM: FeaturedListingFormState = {
  title: "",
  imageUrl: "",
  price: "",
  address: "",
  bedrooms: "",
  bathrooms: "",
  squareFeet: "",
};

const INITIAL_SUBMIT_STATE: FeaturedListingSubmitState = {
  errorMessage: null,
  statusMessage: null,
};

const MAX_BEDROOMS = 20;
const MAX_BATHROOMS = 20;
const MIN_SQUARE_FEET = 100;
const MAX_SQUARE_FEET = 50000;

function toFormState(listing: FeaturedListing): FeaturedListingFormState {
  return {
    title: listing.title,
    imageUrl: listing.imageUrl,
    price: `${listing.price}`,
    address: listing.address,
    bedrooms: `${listing.bedrooms}`,
    bathrooms: `${listing.bathrooms}`,
    squareFeet: `${listing.squareFeet}`,
  };
}

function normalizeNumericValue(value: string): string {
  return value.trim().replaceAll(",", "").replace(/\s+/g, "");
}

function parseWholeNumber(
  value: string,
  fieldName: string,
  options: WholeNumberOptions = {},
): number {
  const normalizedValue = normalizeNumericValue(value);

  if (!/^\d+$/.test(normalizedValue)) {
    throw new Error(`${fieldName} must be a valid whole number`);
  }

  const parsed = Number(normalizedValue);

  if (!Number.isSafeInteger(parsed)) {
    throw new Error(`${fieldName} must be a valid whole number`);
  }

  if (options.min !== undefined && parsed < options.min) {
    throw new Error(
      options.minMessage ?? `${fieldName} must be at least ${options.min}`,
    );
  }

  if (options.max !== undefined && parsed > options.max) {
    throw new Error(
      options.maxMessage ?? `${fieldName} cannot exceed ${options.max}`,
    );
  }

  return parsed;
}

function parsePriceValue(value: string): number {
  return parseWholeNumber(value, "Price", {
    min: 1,
    minMessage: "Price is required",
  });
}

function parseBathroomValue(value: string): number {
  const normalizedValue = normalizeNumericValue(value);

  if (!/^(\d+(\.\d*)?|\.\d+)$/.test(normalizedValue)) {
    throw new Error("Bathrooms must be a valid number");
  }

  const parsed = Number.parseFloat(normalizedValue);

  if (!Number.isFinite(parsed) || parsed < 0) {
    throw new Error("Bathrooms must be a valid number");
  }

  if (parsed > MAX_BATHROOMS) {
    throw new Error(`Bathrooms cannot exceed ${MAX_BATHROOMS}`);
  }

  const halfStep = parsed * 2;
  if (!Number.isInteger(halfStep)) {
    throw new Error("Bathrooms must be in 0.5 increments");
  }

  return parsed;
}

function buildMutationInput(
  form: FeaturedListingFormState,
): FeaturedListingMutationInput {
  if (!form.imageUrl.trim()) {
    throw new Error("Please upload an image before saving");
  }

  const title = form.title.trim();
  const address = form.address.trim();

  if (title.length < 2) {
    throw new Error("Title must be at least 2 characters");
  }

  if (address.length < 5) {
    throw new Error("Address must be at least 5 characters");
  }

  return {
    title,
    imageUrl: form.imageUrl,
    price: parsePriceValue(form.price),
    address,
    bedrooms: parseWholeNumber(form.bedrooms, "Bedrooms", {
      min: 0,
      max: MAX_BEDROOMS,
      minMessage: "Bedrooms cannot be negative",
      maxMessage: `Bedrooms cannot exceed ${MAX_BEDROOMS}`,
    }),
    bathrooms: parseBathroomValue(form.bathrooms),
    squareFeet: parseWholeNumber(form.squareFeet, "Square feet", {
      min: MIN_SQUARE_FEET,
      max: MAX_SQUARE_FEET,
      minMessage: `Square feet must be at least ${MIN_SQUARE_FEET}`,
      maxMessage: `Square feet cannot exceed ${MAX_SQUARE_FEET.toLocaleString()}`,
    }),
  };
}

function getErrorMessage(error: unknown): string {
  if (error instanceof FeaturedListingsApiError) {
    return error.message;
  }

  if (error instanceof Error) {
    return error.message;
  }

  return "An unexpected error occurred";
}

function isAbortError(error: unknown): boolean {
  return error instanceof DOMException && error.name === "AbortError";
}

export function FeaturedListingsManager() {
  const [listings, setListings] = useState<FeaturedListing[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const [originalEditImageUrl, setOriginalEditImageUrl] = useState<
    string | null
  >(null);
  const [formState, setFormState] =
    useState<FeaturedListingFormState>(EMPTY_FORM);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const formStateRef = useRef<FeaturedListingFormState>(EMPTY_FORM);
  const editingIdRef = useRef<string | null>(null);

  const canCreateMore = useMemo(
    () => listings.length < MAX_FEATURED_LISTINGS,
    [listings.length],
  );

  const loadListings = async (signal?: AbortSignal) => {
    try {
      const result = await fetchFeaturedListings({
        limit: MAX_FEATURED_LISTINGS,
        signal,
      });
      setListings(result);
      setErrorMessage(null);
    } catch (error) {
      if (isAbortError(error)) {
        return;
      }

      const message = getErrorMessage(error);
      log.error("Failed to load featured listings", error);
      setErrorMessage(message);
    } finally {
      setIsLoading(false);
    }
  };

  const [actionState, formAction, isPending] = useActionState(
    async (
      _previousState: FeaturedListingSubmitState,
      _formData: FormData,
    ): Promise<FeaturedListingSubmitState> => {
      try {
        const payload = buildMutationInput(formStateRef.current);
        const activeEditingId = editingIdRef.current;
        const isEditing = Boolean(activeEditingId);

        if (isEditing && activeEditingId) {
          await updateFeaturedListing(activeEditingId, payload);
        } else {
          await createFeaturedListing(payload);
        }

        resetForm();
        await loadListings();

        return {
          errorMessage: null,
          statusMessage: isEditing
            ? "Featured listing updated"
            : "Featured listing created",
        };
      } catch (error) {
        const message = getErrorMessage(error);
        log.error("Failed to save featured listing", error);
        return {
          errorMessage: message,
          statusMessage: null,
        };
      }
    },
    INITIAL_SUBMIT_STATE,
  );

  const isMutating = isSubmitting || isPending;
  const currentImageUrl = formState.imageUrl.trim();
  const hasSelectedImage = currentImageUrl.length > 0;
  const isEditing = Boolean(editingId);
  const isEditingWithCurrentSavedImage = Boolean(
    isEditing &&
    originalEditImageUrl &&
    currentImageUrl === originalEditImageUrl,
  );
  const hasUnsavedReplacementImage = Boolean(
    isEditing &&
    originalEditImageUrl &&
    hasSelectedImage &&
    currentImageUrl !== originalEditImageUrl,
  );
  const canUploadImage =
    !isMutating &&
    !isUploadingImage &&
    (!hasSelectedImage || isEditingWithCurrentSavedImage);

  useEffect(() => {
    const controller = new AbortController();
    void loadListings(controller.signal);

    return () => {
      controller.abort();
    };
  }, []);

  useEffect(() => {
    setErrorMessage(actionState.errorMessage);
    setStatusMessage(actionState.statusMessage);
  }, [actionState]);

  const resetForm = () => {
    setFormState(EMPTY_FORM);
    setEditingId(null);
    setOriginalEditImageUrl(null);
    formStateRef.current = EMPTY_FORM;
    editingIdRef.current = null;
    setIsUploadingImage(false);
  };

  const onFieldChange = (
    field: keyof FeaturedListingFormState,
    value: string,
  ) => {
    setFormState((current) => {
      const nextState = {
        ...current,
        [field]: value,
      };
      formStateRef.current = nextState;
      return nextState;
    });
  };

  const handleEdit = (listing: FeaturedListing) => {
    setEditingId(listing.id);
    const nextFormState = toFormState(listing);
    setFormState(nextFormState);
    formStateRef.current = nextFormState;
    editingIdRef.current = listing.id;
    setOriginalEditImageUrl(listing.imageUrl);
    setIsUploadingImage(false);
    setErrorMessage(null);
    setStatusMessage(null);
  };

  const handleDelete = async (listing: FeaturedListing) => {
    const shouldDelete = window.confirm(
      `Delete featured listing at ${listing.address}?`,
    );
    if (!shouldDelete) {
      return;
    }

    try {
      setIsSubmitting(true);
      await deleteFeaturedListing(listing.id);
      await loadListings();

      if (editingId === listing.id) {
        resetForm();
      }

      setStatusMessage("Featured listing removed");
    } catch (error) {
      const message = getErrorMessage(error);
      log.error("Failed to delete featured listing", error);
      setErrorMessage(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const formTitle = editingId
    ? "Edit Featured Listing"
    : "Add Featured Listing";

  return (
    <section className="w-full max-w-full space-y-6 overflow-x-hidden">
      <div className="flex flex-wrap items-start justify-between gap-4 rounded-xl border border-gray-200 bg-white p-4 shadow-sm sm:p-6">
        <div>
          <h2 className="text-xl font-semibold text-gray-900">
            Featured Listings Carousel
          </h2>
          <p className="mt-1 text-sm text-gray-500">
            Manage up to {MAX_FEATURED_LISTINGS} listings shown on the homepage
            carousel.
          </p>
        </div>
        <span className="rounded-full bg-gray-100 px-3 py-1 text-sm font-medium text-gray-700">
          {listings.length}/{MAX_FEATURED_LISTINGS} used
        </span>
      </div>

      <div className="grid w-full max-w-full gap-6 lg:grid-cols-2 xl:gap-8">
        <div className="space-y-4 overflow-hidden rounded-xl border border-gray-200 bg-white p-4 shadow-sm sm:p-6">
          <div className="flex items-center">
            <h3 className="text-lg font-semibold text-gray-900">
              Current Featured Listings
            </h3>
          </div>

          {isLoading ? (
            <div className="flex items-center gap-2 rounded-lg border border-gray-200 px-4 py-6 text-gray-500">
              <Loader2 className="h-4 w-4 animate-spin" />
              Loading featured listings...
            </div>
          ) : listings.length === 0 ? (
            <div className="rounded-lg border border-dashed border-gray-300 px-4 py-10 text-center text-gray-500">
              No featured listings yet.
            </div>
          ) : (
            <div className="space-y-3">
              {listings.map((listing) => (
                <div
                  key={listing.id}
                  className="flex flex-col gap-3 rounded-lg border border-gray-200 p-3 shadow-sm transition-all hover:shadow-md sm:flex-row sm:items-center sm:justify-between"
                >
                  <div className="flex min-w-0 items-center gap-3">
                    <div className="relative h-16 w-20 shrink-0 overflow-hidden rounded-md bg-gray-100">
                      <Image
                        src={listing.imageUrl}
                        alt={listing.title}
                        fill
                        className="object-cover"
                      />
                    </div>
                    <div className="min-w-0">
                      <p className="truncate text-sm font-semibold text-gray-900">
                        {listing.title}
                      </p>
                      <p className="truncate text-sm text-gray-500">
                        {listing.address}
                      </p>
                      <p className="truncate text-xs text-gray-600">
                        {formatFeaturedListingPrice(listing.price)} •{" "}
                        {listing.bedrooms} bd •{" "}
                        {formatBathroomCount(listing.bathrooms)} ba •{" "}
                        {listing.squareFeet.toLocaleString()} sqft
                      </p>
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleEdit(listing)}
                      disabled={isMutating}
                    >
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => void handleDelete(listing)}
                      disabled={isMutating}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="overflow-hidden rounded-xl border border-gray-200 bg-white p-4 shadow-sm sm:p-6">
          <h3 className="mb-4 text-lg font-semibold text-gray-900">
            {formTitle}
          </h3>
          <form action={formAction} className="max-w-full space-y-4">
            <div className="space-y-2">
              <Label htmlFor="featured-title">Title</Label>
              <Input
                id="featured-title"
                name="title"
                value={formState.title}
                onChange={(event) => onFieldChange("title", event.target.value)}
                placeholder="Oceanview Family Home"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="featured-address">Address</Label>
              <Input
                id="featured-address"
                name="address"
                value={formState.address}
                onChange={(event) =>
                  onFieldChange("address", event.target.value)
                }
                placeholder="1234 Ocean Dr, Vancouver, BC"
                required
              />
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="featured-price">Price (CAD)</Label>
                <Input
                  id="featured-price"
                  name="price"
                  inputMode="numeric"
                  value={formState.price}
                  onChange={(event) =>
                    onFieldChange("price", event.target.value)
                  }
                  placeholder="1250000"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="featured-sqft">Square Feet</Label>
                <Input
                  id="featured-sqft"
                  name="squareFeet"
                  inputMode="numeric"
                  value={formState.squareFeet}
                  onChange={(event) =>
                    onFieldChange("squareFeet", event.target.value)
                  }
                  placeholder="2800"
                  required
                />
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="featured-bedrooms">Bedrooms</Label>
                <Input
                  id="featured-bedrooms"
                  name="bedrooms"
                  inputMode="numeric"
                  value={formState.bedrooms}
                  onChange={(event) =>
                    onFieldChange("bedrooms", event.target.value)
                  }
                  placeholder="4"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="featured-bathrooms">Bathrooms</Label>
                <Input
                  id="featured-bathrooms"
                  name="bathrooms"
                  inputMode="decimal"
                  value={formState.bathrooms}
                  onChange={(event) =>
                    onFieldChange("bathrooms", event.target.value)
                  }
                  placeholder="2.5"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Listing Image (UploadThing)</Label>
              <input type="hidden" name="imageUrl" value={formState.imageUrl} />
              <FileUpload
                endpoint="featuredListingImage"
                disabled={!canUploadImage}
                onUploadBegin={() => {
                  setIsUploadingImage(true);
                  setErrorMessage(null);
                  setStatusMessage("Uploading image...");
                }}
                onUploadComplete={(files) => {
                  const firstFile = files[0];
                  setIsUploadingImage(false);

                  if (!firstFile) {
                    setErrorMessage(
                      "No uploaded image was returned. Please retry.",
                    );
                    return;
                  }

                  const uploadedImageUrl =
                    firstFile.serverData?.url ??
                    firstFile.ufsUrl ??
                    firstFile.url;

                  if (!uploadedImageUrl) {
                    setErrorMessage(
                      "Uploaded image URL was not returned. Please retry.",
                    );
                    return;
                  }

                  onFieldChange("imageUrl", uploadedImageUrl);
                  setStatusMessage(
                    isEditing
                      ? "Replacement image uploaded. Save listing to apply the change."
                      : "Image uploaded. Each listing supports one image only.",
                  );
                  setErrorMessage(null);
                }}
                onUploadError={(error) => {
                  setIsUploadingImage(false);
                  log.error("Featured image upload failed", error);
                  setErrorMessage(error.message);
                }}
                uploadLabel="Upload one image for this listing"
                uploadHelpText={
                  isEditing
                    ? hasUnsavedReplacementImage
                      ? "Replacement selected. Save listing to replace the old image in the database and UploadThing."
                      : "This listing has one image. Upload one replacement, then save."
                    : "Each listing allows one image total. To change it later, edit the listing, upload a replacement image, and save."
                }
                mobileButtonText={
                  isUploadingImage
                    ? "Uploading..."
                    : isEditing
                      ? "Upload replacement image"
                      : "Upload one image"
                }
              />
              {formState.imageUrl && (
                <div className="relative mt-2 h-36 w-full overflow-hidden rounded-md border border-gray-200 bg-gray-100">
                  <Image
                    src={formState.imageUrl}
                    alt="Uploaded featured listing"
                    fill
                    className="object-cover"
                  />
                </div>
              )}
              {!isEditing && hasSelectedImage && (
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    onFieldChange("imageUrl", "");
                    setErrorMessage(null);
                    setStatusMessage(
                      "Current image cleared. Upload one replacement image.",
                    );
                    setIsUploadingImage(false);
                  }}
                  disabled={isMutating}
                >
                  Replace Uploaded Image
                </Button>
              )}
              {isEditing &&
                hasUnsavedReplacementImage &&
                originalEditImageUrl && (
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      onFieldChange("imageUrl", originalEditImageUrl);
                      setErrorMessage(null);
                      setStatusMessage("Reverted to the current saved image.");
                      setIsUploadingImage(false);
                    }}
                    disabled={isMutating}
                  >
                    Undo Replacement
                  </Button>
                )}
              {isEditing && isEditingWithCurrentSavedImage && (
                <p className="text-xs text-gray-500">
                  Upload one replacement image, then click Update Listing.
                </p>
              )}
              {isEditing && hasUnsavedReplacementImage && (
                <p className="text-xs text-gray-500">
                  Replacing and saving removes the previous image from
                  UploadThing.
                </p>
              )}
            </div>

            <div className="flex flex-wrap gap-2">
              <Button
                type="submit"
                disabled={
                  isMutating ||
                  isUploadingImage ||
                  (!editingId && !canCreateMore && listings.length > 0)
                }
              >
                {isPending ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Saving...
                  </>
                ) : editingId ? (
                  "Update Listing"
                ) : (
                  "Create Listing"
                )}
              </Button>

              {editingId && (
                <Button
                  type="button"
                  variant="outline"
                  onClick={resetForm}
                  disabled={isMutating}
                >
                  Cancel Edit
                </Button>
              )}
            </div>

            {!canCreateMore && !editingId && (
              <p className="text-sm text-amber-600">
                Max featured listings reached. Delete one to create another.
              </p>
            )}

            {errorMessage && (
              <p className="text-sm text-red-600">{errorMessage}</p>
            )}
            {statusMessage && (
              <p className="text-sm text-emerald-600">{statusMessage}</p>
            )}
          </form>
        </div>
      </div>
    </section>
  );
}
