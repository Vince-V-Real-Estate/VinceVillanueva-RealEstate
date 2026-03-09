import Link from "next/link";
import Image from "next/image";

import { Card } from "@/components/ui/card";

const NEIGHBORHOODS = [
  {
    name: "Vancouver",
    count: 1240,
    image:
      "https://images.unsplash.com/photo-1501594907352-04cda38ebc29?q=80&w=2832&auto=format&fit=crop",
  },
  {
    name: "Surrey",
    count: 840,
    image:
      "https://images.unsplash.com/photo-1535498730771-e735b998cd64?q=80&w=2832&auto=format&fit=crop",
  },
  {
    name: "Richmond",
    count: 3520,
    image:
      "https://images.unsplash.com/photo-1496442226666-8d4a0e62e6e9?q=80&w=2940&auto=format&fit=crop",
  },
  {
    name: "Langley",
    count: 620,
    image:
      "https://images.unsplash.com/photo-1502175353174-a7a70e73b362?q=80&w=2819&auto=format&fit=crop",
  },
];

export function Neighborhoods() {
  return (
    <section className="py-12 md:py-24 lg:py-32">
      <div className="container mx-auto px-4 md:px-6">
        <div className="flex flex-col items-center justify-center space-y-4 text-center">
          <div className="space-y-2">
            <h2 className="text-3xl font-bold tracking-tighter sm:text-5xl">
              Explore Neighborhoods
            </h2>
            <p className="text-muted-foreground max-w-225 md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
              Find the perfect community to call home. From bustling city
              centers to quiet suburban streets.
            </p>
          </div>
        </div>
        <div className="mx-auto mt-8 grid max-w-5xl gap-6 sm:grid-cols-2 md:grid-cols-4">
          {NEIGHBORHOODS.map((city) => (
            <Link key={city.name} href={`/listings?city=${city.name}`}>
              <Card className="group relative overflow-hidden transition-all hover:scale-105">
                <div className="relative aspect-square">
                  <Image
                    src={city.image}
                    alt={city.name}
                    fill
                    className="object-cover transition-transform group-hover:scale-110"
                  />
                  <div className="absolute inset-0 bg-black/40 transition-colors group-hover:bg-black/50" />
                  <div className="absolute inset-0 flex flex-col items-center justify-center text-white">
                    <h3 className="text-xl font-bold">{city.name}</h3>
                    <p className="text-sm">{city.count} listings</p>
                  </div>
                </div>
              </Card>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
