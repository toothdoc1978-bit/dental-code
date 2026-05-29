import Image from "next/image";
import { IMAGES_READY } from "@/lib/media";
import { Placeholder } from "./Placeholder";

type MediaProps = {
  src: string;
  alt: string;
  sizes?: string;
  /** Class applied to the <Image> (placeholder always fills its parent). */
  className?: string;
  priority?: boolean;
  /** Optional caption for the placeholder (defaults to alt). */
  label?: string;
};

/**
 * Drop-in replacement for a fill-mode next/image inside a relative/aspect
 * container. Renders the real photo when IMAGES_READY is true, otherwise a
 * branded gradient placeholder — so layouts never show broken image slots.
 */
export function Media({ src, alt, sizes, className, priority, label }: MediaProps) {
  if (IMAGES_READY) {
    return (
      <Image
        src={src}
        alt={alt}
        fill
        sizes={sizes}
        priority={priority}
        className={className ?? "object-cover"}
      />
    );
  }
  return <Placeholder label={label ?? alt} className="absolute inset-0 h-full w-full" />;
}
