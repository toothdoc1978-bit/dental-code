# Image Drop-In Guide

Drop the following photo files into these folders for the site to display correctly.

## /public/gallery/  (Smile Gallery before/afters)

| Filename | Photo to use |
|---|---|
| `case-01-full-mouth.jpg` | Full-mouth restoration: severely stained/worn teeth → restored uppers and lowers (3-panel collage) |
| `case-02-veneers.jpg` | Cosmetic veneers: single smile gap-closure / shape refinement (2-panel collage) |
| `case-03-full-arch.jpg` | Full-arch implant restoration: worn dentition → bright full-arch (2-panel collage) |
| `case-04-smile-makeover.jpg` | Premium smile makeover: bright porcelain veneers (2-panel collage) |

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
