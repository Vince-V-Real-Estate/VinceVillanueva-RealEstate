"use client";

import Link from "next/link";
import { ArrowRight } from "lucide-react";

import { buttonVariants } from "@/components/ui/button";
import Carousel from "@/components/ui/carousel";
import { cn } from "@/lib/utils";

const SOLD_HOMES = [
  {
    title: "Luxury Villa in Beverly Hills",
    button: "View Details",
    src: "https://images.unsplash.com/photo-1613490493576-7fde63acd811?q=80&w=2940&auto=format&fit=crop",
  },
  {
    title: "Modern Loft in Soho",
    button: "View Details",
    src: "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?q=80&w=2953&auto=format&fit=crop",
  },
  {
    title: "Beachfront Condo in Miami",
    button: "View Details",
    src: "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?q=80&w=2940&auto=format&fit=crop",
  },
  {
    title: "Mountain Retreat in Aspen",
    button: "View Details",
    src: "https://images.unsplash.com/photo-1600596542815-22b5dbf1529e?q=80&w=2938&auto=format&fit=crop",
  },
  {
    title: "Historic Townhouse in Boston",
    button: "View Details",
    src: "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?q=80&w=2940&auto=format&fit=crop",
  },
];

export function Gallery() {
  return (
    <section className="bg-muted/50 overflow-hidden py-12 md:py-24 lg:py-32">
      <div className="container mx-auto px-4 md:px-6">
        <div className="mb-12 flex flex-col items-center justify-between gap-4 md:flex-row md:items-center">
          <div className="space-y-2">
            <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">
              Sold Homes Gallery
            </h2>
            <p className="text-muted-foreground max-w-150 md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
              Explore our portfolio of successfully closed properties.
            </p>
          </div>
          <Link
            href="/listings?type=sold"
            className={cn(buttonVariants({ variant: "outline" }), "group")}
          >
            View All Sold Homes
            <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
          </Link>
        </div>

        <Carousel slides={SOLD_HOMES} />
      </div>
    </section>
  );
}
