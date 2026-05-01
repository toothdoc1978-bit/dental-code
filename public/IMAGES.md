# Image Drop-In Guide

Drop the following photo files into these folders for the site to display correctly.

## /public/gallery/  (Smile Gallery before/afters)

| Filename | Photo to use |
|---|---|
| `case-01-full-mouth.jpg` | Full-mouth restoration: severely stained/worn teeth → restored uppers and lowers (3-panel collage) |
| `case-02-veneers.jpg` | Cosmetic veneers: single smile gap-closure / shape refinement (2-panel collage) |
| `case-03-full-arch.jpg` | Full-arch implant restoration: worn dentition → bright full-arch (2-panel collage) |
| `case-04-smile-makeover.jpg` | Premium smile makeover: bright porcelain veneers (2-panel collage) |
| `case-05-anterior-bonding.jpg` | Anterior cosmetic bonding: worn/chipped/discolored upper anteriors restored uniformly (2-panel close-up) |
| `case-06-veneer-transformation.jpg` | Porcelain veneer transformation: top close-up of a single veneer + bottom full-smile after shot |
| `case-07-pediatric-bonding.jpg` | Composite bonding on a young patient: peg-shaped/discolored teeth → uniform smile (2-panel collage) |
| `case-08-zirconia-restoration.jpg` | Indirect zirconia restoration: severely decayed upper anteriors rebuilt with zirconia (2-panel collage) |

## /public/team/  (Dentist photos)

| Filename | Photo to use |
|---|---|
| `chad-and-carey.jpg` | Photo of Chad and Carey (the selfie or restaurant portrait works well) |

## /public/office/  (Office tour)

| Filename | Photo to use |
|---|---|
| `waiting-room.jpg` | Waiting room with brown leather chairs and the wooden clock (first wide shot) |
| `operatory.jpg` | Yellow-walled operatory with the dental chair and window |
| `waiting-room-2.jpg` | Second waiting-room angle showing the artwork |

## /public/og/

| Filename | Photo to use |
|---|---|
| `default.png` | 1200×630 social-share image. A bright "after" smile with the practice name overlay works well. |

> If a file is missing, the page will still render but the image slot will show a broken image. All filename references live in `lib/site.ts`, `lib/gallery.ts`, and the `app/about/page.tsx` `officeShots` array.

## Patient consent reminder

Before publishing any before/after image, confirm you have written marketing consent on file for that patient. The HIPAA-compliant practice is to use a dental-marketing release form that explicitly authorizes use of intraoral or facial photos on a public website and in advertising.
