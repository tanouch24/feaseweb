import Image from "next/image";
import type { DemoImage } from "@/lib/demo-site-images";

export function PhoneMockup({
  businessName,
  tagline,
  image,
}: {
  businessName: string;
  tagline: string;
  image: DemoImage;
}) {
  return (
    <div className="mx-auto w-40 rounded-lg border border-line bg-white p-2 shadow-sm">
      <div className="mx-auto mb-2 h-1 w-8 rounded-full bg-line" />
      <div className="overflow-hidden rounded-md bg-bg-alt">
        <div className="relative h-16 w-full">
          <Image
            src={image.src}
            alt={image.alt}
            fill
            sizes="160px"
            className="object-cover"
          />
        </div>
        <div className="px-3 py-3">
          <p className="font-serif text-sm text-ink">{businessName}</p>
          <p className="mt-1 text-[10px] leading-tight text-ink-soft">{tagline}</p>
        </div>
      </div>
    </div>
  );
}
