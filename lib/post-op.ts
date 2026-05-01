export type PostOp = {
  slug: string;
  name: string;
  short: string;
  intro: string;
  callIfYou: string[];
  whatToExpect: string[];
  avoid: string[];
  medication: string[];
  followUp: string;
};

export const postOps: PostOp[] = [
  {
    slug: "extractions",
    name: "After an Extraction",
    short: "What to do after a tooth has been removed.",
    intro:
      "A little bleeding, swelling, and soreness is normal after an extraction. Following these instructions helps you heal cleanly and prevents complications like dry socket.",
    callIfYou: [
      "Bleeding is heavy and doesn't slow with steady pressure on gauze for 30+ minutes",
      "Swelling gets worse after the second day, or you develop a fever",
      "Pain is increasing rather than getting better, especially 3–5 days out (sign of dry socket)",
      "You have trouble breathing or swallowing, or any allergic-type symptoms after a medication",
    ],
    whatToExpect: [
      "Some oozing and pink saliva for the rest of the day",
      "Swelling that peaks on day 2–3 then improves",
      "Soreness for 3–5 days that's manageable with the medication you're taking",
      "Stiffness opening your mouth for a few days",
    ],
    avoid: [
      "Don't spit, rinse forcefully, drink through a straw, or smoke for 24 hours — these can dislodge the clot",
      "No vigorous exercise for 24 hours",
      "No hot or hard foods on day one — soft, lukewarm foods are best",
      "Don't poke at the site with your tongue or fingers",
    ],
    medication: [
      "Take any medication exactly as prescribed",
      "Over-the-counter ibuprofen often works well — confirm with us if you take blood thinners or other prescriptions",
      "Use an ice pack on the cheek 20 minutes on, 20 minutes off for the first 24 hours to reduce swelling",
    ],
    followUp:
      "Most extractions don't need a follow-up unless we tell you otherwise. If you had stitches that aren't dissolvable, we'll schedule a quick visit to remove them.",
  },
  {
    slug: "fillings",
    name: "After a Filling",
    short: "What to expect after a tooth-colored filling.",
    intro:
      "Tooth-colored fillings are fully set when you leave the office, so you can eat normally as soon as the numbness wears off.",
    callIfYou: [
      "The bite feels high or off — it's a quick adjustment, but worth fixing soon",
      "Sensitivity to hot/cold lasts more than 2–3 weeks",
      "You develop sharp, lingering pain when biting",
    ],
    whatToExpect: [
      "Numbness for 2–4 hours after the visit",
      "Mild sensitivity to cold for a few days, sometimes longer",
      "A tooth that feels slightly different until your bite settles",
    ],
    avoid: [
      "Don't bite anything hard until the numbness is fully gone — easy to bite your cheek or tongue",
      "Avoid extremely hot or icy foods for the first day if the tooth is sensitive",
    ],
    medication: [
      "Over-the-counter ibuprofen handles soreness for most patients",
    ],
    followUp:
      "No follow-up is needed unless something feels off. If your bite feels uneven, call us — adjusting it takes only a couple of minutes.",
  },
  {
    slug: "crowns-bridges",
    name: "After a Crown or Bridge",
    short: "Caring for your new crown, bridge, or temporary.",
    intro:
      "A new crown or bridge usually feels great within a few days. If you have a temporary, special care helps keep it in place until your final restoration.",
    callIfYou: [
      "Your bite feels high or your jaw aches more than mildly",
      "Your temporary comes off — call us so we can re-cement it",
      "Pain is sharp and increasing, especially when biting down",
    ],
    whatToExpect: [
      "Mild gum tenderness around the tooth for a day or two",
      "Cold or pressure sensitivity that fades over a few weeks",
      "A bite that takes a day or two to feel normal",
    ],
    avoid: [
      "If you have a temporary: avoid sticky foods (gum, caramel, taffy) and hard foods on that side",
      "Floss carefully around a temporary — pull the floss out the side rather than up between the teeth",
    ],
    medication: [
      "Over-the-counter ibuprofen is usually enough",
    ],
    followUp:
      "We'll see you back to deliver the final crown or bridge if you have a temporary. After the final restoration, your normal cleaning visits are all that's needed.",
  },
  {
    slug: "dentures",
    name: "After a Denture Delivery or Adjustment",
    short: "Getting comfortable with a new or adjusted denture.",
    intro:
      "New dentures take a little time to get used to. A few sore spots and adjustment visits are completely normal — they're how we get the fit perfect.",
    callIfYou: [
      "A sore spot doesn't improve, hurts to wear over, or starts to bleed",
      "The denture is loose, slipping, or won't stay seated",
      "You have any cracking, chipping, or breakage",
    ],
    whatToExpect: [
      "More saliva than usual at first — this passes",
      "A different feel when speaking and eating; most patients adapt within 2–4 weeks",
      "One or two adjustment visits to refine the fit",
    ],
    avoid: [
      "Don't sleep in your denture unless we've told you to — your gums need time to recover",
      "Avoid hard or sticky foods early on; cut food into smaller pieces and chew on both sides",
      "Don't try to adjust the denture yourself — small changes are fast for us and risky to do at home",
    ],
    medication: [
      "Over-the-counter pain relievers can help with early soreness",
      "Use only the cleaners and adhesives we recommend",
    ],
    followUp:
      "We expect to see you back for adjustments. Wear the denture the day before your adjustment visit — sore spots show us exactly where to refine the fit.",
  },
  {
    slug: "implants",
    name: "After Implant Treatment",
    short: "Healing after an implant placement or restoration.",
    intro:
      "Implant healing usually goes smoothly. The first 24–48 hours are the most important — protect the site, keep it clean, and follow the instructions below.",
    callIfYou: [
      "Bleeding is heavy and steady pressure isn't slowing it",
      "Swelling worsens after day 3 or you develop a fever",
      "The implant feels loose or painful when biting",
      "You have any allergic-type reaction to a medication",
    ],
    whatToExpect: [
      "Some swelling and bruising peaking on day 2–3",
      "Mild to moderate soreness for several days",
      "A small amount of oozing in the first day",
    ],
    avoid: [
      "No smoking — it dramatically slows implant healing",
      "Don't probe the site with your tongue or fingers",
      "Avoid vigorous rinsing for 24 hours; gentle salt-water rinses after that",
      "No hard, crunchy, or seedy foods on the implant side until cleared",
    ],
    medication: [
      "Take any antibiotic exactly as prescribed and finish the full course",
      "Use any prescription rinse as directed",
      "Over-the-counter ibuprofen typically handles discomfort well",
    ],
    followUp:
      "We'll see you for a short check shortly after placement and again when it's time to design your final crown or bridge. Cleanings and exams continue as normal.",
  },
];

export function getPostOp(slug: string): PostOp | undefined {
  return postOps.find((p) => p.slug === slug);
}
