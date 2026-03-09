import Image from "next/image";
import Link from "next/link";
import { Bed, Bath, Square, MapPin } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button-variants";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from "@/components/ui/card";
import { cn } from "@/lib/utils";

export interface ListingCardProps {
  id: string;
  title: string;
  price: number;
  address: string;
  beds: number;
  baths: number;
  sqft: number;
  imageUrl: string;
  status?: "new" | "featured" | "sold";
  type?: "sale" | "rent";
}

export function ListingCard({
  id,
  title,
  price,
  address,
  beds,
  baths,
  sqft,
  imageUrl,
  status,
  type = "sale",
}: ListingCardProps) {
  return (
    <Card className="group overflow-hidden transition-shadow hover:shadow-lg">
      <div className="relative aspect-video overflow-hidden">
        <Image
          src={imageUrl}
          alt={title}
          fill
          className="object-cover transition-transform group-hover:scale-105"
        />
        {status && (
          <Badge
            className="absolute top-2 left-2 z-10 uppercase"
            variant={status === "sold" ? "secondary" : "default"}
          >
            {status}
          </Badge>
        )}
        <Badge
          className="bg-background/80 text-foreground absolute top-2 right-2 z-10 backdrop-blur-sm"
          variant="outline"
        >
          {type === "rent" ? "For Rent" : "For Sale"}
        </Badge>
      </div>
      <CardHeader className="p-4 pb-2">
        <h3 className="line-clamp-1 text-lg font-semibold">{title}</h3>
        <div className="text-muted-foreground flex items-center text-sm">
          <MapPin className="mr-1 h-3 w-3" />
          <span className="line-clamp-1">{address}</span>
        </div>
      </CardHeader>
      <CardContent className="p-4 pt-0">
        <div className="text-muted-foreground flex items-center justify-between text-sm">
          <div className="flex items-center">
            <Bed className="mr-1 h-4 w-4" />
            <span>{beds} bd</span>
          </div>
          <div className="flex items-center">
            <Bath className="mr-1 h-4 w-4" />
            <span>{baths} ba</span>
          </div>
          <div className="flex items-center">
            <Square className="mr-1 h-4 w-4" />
            <span>{sqft.toLocaleString()} sqft</span>
          </div>
        </div>
        <div className="mt-4 text-xl font-bold">
          ${price.toLocaleString()}
          {type === "rent" && (
            <span className="text-muted-foreground text-sm font-normal">
              /mo
            </span>
          )}
        </div>
      </CardContent>
      <CardFooter className="p-4 pt-0 pb-4">
        <Link
          href={`/listings/${id}`}
          className={cn(buttonVariants({ variant: "default" }), "w-full")}
        >
          View Details
        </Link>
      </CardFooter>
    </Card>
  );
}
