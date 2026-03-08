"use client";

import { Search } from "lucide-react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { searchSchema, type SearchFormData } from "@/lib/zod/search-validation";
import { createLogger } from "@/lib/logger";

const log = createLogger("search");

export function Hero() {
  const {
    register,
    handleSubmit,
    control,
    formState: { errors, isSubmitting },
  } = useForm<SearchFormData>({
    resolver: zodResolver(searchSchema),
    defaultValues: {
      listingType: "Buy",
      location: "",
    },
  });

  const onSubmit = async (data: SearchFormData) => {
    // TODO: Implement search logic
    log.info("Search data", data);
  };

  return (
    <section
      id="hero-cta"
      className="relative w-full py-12 md:py-24 lg:py-32 xl:mx-auto xl:w-[90%] xl:py-80"
    >
      <div className="container mx-auto px-4 md:px-6">
        <div className="flex flex-col items-center space-y-4 text-center">
          <div className="space-y-2 xl:my-5">
            <h1 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl lg:text-6xl/none">
              Vince Villanueva{" "}
              <span className="block text-white">Real Estate</span>
            </h1>
            <p className="mx-auto max-w-175 rounded-xl bg-white/70 p-3 text-black md:text-xl">
              Search over 500,000 listings in the Greater Vancouver and Fraser
              Valley area.
            </p>
          </div>
          <div className="w-full max-w-3xl space-y-2 xl:my-5">
            <form
              onSubmit={handleSubmit(onSubmit)}
              className="flex flex-col gap-2 sm:flex-row sm:space-y-0 sm:space-x-2 lg:gap-0"
            >
              <Controller
                name="listingType"
                control={control}
                render={({ field }) => (
                  <Select value={field.value} onValueChange={field.onChange}>
                    <SelectTrigger className="w-25 bg-white lg:p-6">
                      <SelectValue placeholder="Type" />
                    </SelectTrigger>
                    <SelectContent className={"xl:absolute xl:right-0"}>
                      <SelectItem value="Buy">Buy</SelectItem>
                      <SelectItem value="Rent">Rent</SelectItem>
                      <SelectItem value="Sold">Sold</SelectItem>
                    </SelectContent>
                  </Select>
                )}
              />
              <Input
                className="w-auto flex-1 bg-white lg:p-6"
                placeholder="City, Neighborhood, ZIP"
                type="text"
                {...register("location")}
              />
              <Button
                type="submit"
                className={"lg:p-6"}
                disabled={isSubmitting}
              >
                <Search className="h-4 w-4" />
                {isSubmitting ? "Searching..." : "Search"}
              </Button>
            </form>
            {(errors.listingType ?? errors.location) && (
              <div className="rounded-md bg-white/90 p-2">
                {errors.listingType && (
                  <p className="text-sm text-red-500">
                    {errors.listingType.message}
                  </p>
                )}
                {errors.location && (
                  <p className="text-sm text-red-500">
                    {errors.location.message}
                  </p>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
