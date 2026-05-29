import { site } from "@/lib/site";

type Props = {
  className?: string;
  children?: React.ReactNode;
};

export function PhoneLink({ className, children }: Props) {
  return (
    <a href={`tel:${site.phone.tel}`} className={className} aria-label={`Call ${site.practiceName}`}>
      {children ?? site.phone.display}
    </a>
  );
}
