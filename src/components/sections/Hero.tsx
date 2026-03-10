"use client";

import * as React from "react";
import { Search } from "lucide-react";
import { searchSchema } from "@/lib/zod/search-validation";
import { createLogger } from "@/lib/logger";
import { cn } from "@/lib/utils";
import { buttonVariants } from "@/components/ui/button-variants";

const log = createLogger("search");

export function Hero() {
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [errors, setErrors] = React.useState<{
    location?: string;
  }>({});

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setErrors({});

    const formData = new FormData(e.currentTarget);
    const data = {
      location: formData.get("location") as string,
    };

    const result = searchSchema.safeParse(data);

    if (!result.success) {
      const fieldErrors: typeof errors = {};
      for (const issue of result.error.issues) {
        const field = issue.path[0] as keyof typeof errors;
        fieldErrors[field] = issue.message;
      }
      setErrors(fieldErrors);
      return;
    }

    setIsSubmitting(true);
    try {
      // TODO: Implement search logic
      log.info("Search data", result.data);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section
      id="hero-cta"
      className="relative w-full py-12 md:py-24 lg:py-32 xl:mx-auto xl:w-[90%] xl:py-65"
    >
      <div className="container mx-auto px-4 md:px-6">
        <div className="flex flex-col items-center space-y-4 text-center">
          <div className="space-y-2">
            <h1 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl lg:text-6xl/none">
              Vince Villanueva <span className="block text-white">Realtor</span>
            </h1>
            <p className="mx-auto max-w-175 rounded-xl bg-white/70 p-3 text-black md:text-lg xl:mt-6">
              Search and book listings in the Greater Vancouver and Fraser
              Valley area.
            </p>
          </div>
          <div className="w-full max-w-3xl space-y-2 xl:my-5">
            <form
              onSubmit={handleSubmit}
              className="flex w-full flex-col gap-2 sm:flex-row sm:items-center"
            >
              <input
                name="location"
                type="text"
                placeholder="City, Neighborhood, ZIP"
                className="border-input placeholder:text-muted-foreground focus:ring-primary w-full flex-1 rounded-md border bg-white px-4 py-2 text-sm focus:ring-2 focus:outline-none disabled:cursor-not-allowed disabled:opacity-50 md:h-14 md:px-6 md:text-base"
              />
              <button
                type="submit"
                disabled={isSubmitting}
                className={cn(
                  buttonVariants({ size: "lg" }),
                  "h-10 px-6 text-sm md:h-14 md:px-8 md:text-base",
                  isSubmitting && "opacity-50",
                )}
              >
                <Search className="mr-2 h-4 w-4" />
                {isSubmitting ? "Searching..." : "Search"}
              </button>
            </form>
            {errors.location && (
              <div className="rounded-md bg-white/90 p-2">
                <p className="text-sm text-red-500">{errors.location}</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
