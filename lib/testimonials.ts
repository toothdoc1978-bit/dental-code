export type Testimonial = {
  quote: string;
  author: string;
  context?: string;
};

export const testimonials: Testimonial[] = [
  {
    quote:
      "Dr. Gardner and his team made me feel comfortable from the moment I walked in. Best dental experience I've ever had.",
    author: "Amanda P.",
    context: "Bastrop, LA",
  },
  {
    quote:
      "I had put off the dentist for years. They were patient, kind, and never made me feel judged. I actually look forward to my visits now.",
    author: "Michael R.",
    context: "Mer Rouge, LA",
  },
  {
    quote:
      "My new smile changed my life. Dr. Gardner walked me through every step and the result is better than I imagined.",
    author: "Lauren H.",
    context: "Cosmetic patient",
  },
  {
    quote:
      "The whole staff is wonderful. They explain everything, work with my insurance, and I'm in and out without any stress.",
    author: "Tony G.",
    context: "Long-time patient",
  },
  {
    quote:
      "After years of struggling with worn teeth, my full-mouth restoration gave me my bite and my confidence back.",
    author: "Karen S.",
    context: "Restorative patient",
  },
];
