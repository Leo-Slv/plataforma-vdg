# Image uploads (course thumbnail, area cover, module cover, avatar)

## Why this file exists

Four different admin/profile fields used to accept a pasted image URL:
course thumbnail (`course-crud.md` pendency 4), the user's own avatar
(`Docs/specs/auth/profile.md`), and — newly added alongside this change,
since neither existed before — an area cover and a course-module cover.
The user asked (2026-09-14) for all four to become real file uploads
instead, matching how video/material uploads already work. This one file
covers all four together since the backend work was identical for each.

## What shipped (2026-09-14)

CourseCore gained the same presigned-S3-upload pattern
`VideosController`/`LessonMaterialsController` already used, applied to
images:

- `POST /api/courses/{courseId}/thumbnail-upload-url` (policy
  `ManageCourses`)
- `POST /api/courses/{courseId}/modules/{moduleId}/image-upload-url`
  (policy `ManageCourses`) — `CourseModule.ImageUrl` is a brand-new field,
  didn't exist before this change
- `POST /api/areas/{areaId}/image-upload-url` (policy `ManageAreas`) —
  `Area.ImageUrl` is likewise brand-new
- `POST /api/auth/me/avatar-upload-url` (`[Authorize]`, self-service only
  — no id in the request, always the caller's own account)

Because module/course-module creation happens before an admin has
anything to attach an image to, `CreateCourseModuleRequest` deliberately
has no `ImageUrl` (only `UpdateCourseModuleRequest` does) — same reasoning
applies on the frontend: the image upload field only renders once the
course/area/module already exists (edit mode), with a "save first" hint
in create mode. `CreateAreaRequest`/`CreateCourseRequest` do accept
`ImageUrl`/`ThumbnailUrl` at creation time on the backend, but the
frontend still only offers the upload control post-creation, for the same
reason — consistent behavior across all three beats exploiting a
backend capability the create-mode UI has no use for yet.

## Revised (2026-09-15): private bucket + presigned reads, not a public URL

The first version of this feature (2026-09-14) stored a **permanent,
unsigned, public S3 URL** in `thumbnailUrl`/`imageUrl`/`avatarUrl`
(`GetPublicUrl(storageKey)`), on the theory that the bucket would need a
public-read policy for these prefixes since the images render in
`<img src>` across public pages (including the anonymous landing page).

**The user rejected that**: the bucket stays 100% private, no public-read
bucket policy, no Block Public Access changes — full reversal of anything
already attempted in that direction. Instead, the four upload-url
endpoints now hand back the same shape video/material uploads already
return (`{ storageProvider, storageKey, uploadUrl, expiresAt }` — no
`publicUrl` field at all), and the entity's `thumbnailUrl`/`imageUrl`/
`avatarUrl` field stores the bare **storage key**, not a URL. Every read
path (course/area/module/testimonial list and detail responses, the
current-user response) resolves that stored key into a fresh,
short-expiry **presigned GET URL** at response time — the exact
mechanism `RequestVideoPlaybackUseCase`/`GetLessonMaterialDownloadUrlUseCase`
already use for video/material, just computed inline wherever these
fields are serialized instead of behind a dedicated per-resource
"request playback" endpoint (unnecessary here since presigning is a pure
local SigV4 computation, not a network call — resolving many images in a
list response costs nothing extra).

A stored value containing `://` is treated as a legacy externally-pasted
URL (how these fields worked before uploads existed) and passed through
unchanged, so old data keeps working. `Media:S3:ImageUrlExpirationMinutes`
(default 60) controls how long each resolved URL stays valid — longer
than the 10-minute material-download default, since these are
non-sensitive UI images that may sit in an open tab a while.

## Config pendency: the IAM credential needs `s3:PutObject` on the new prefixes

**Severity: Config.**

This is unrelated to the public/private-bucket question above — it's
about the **write** side, not the read side. Confirmed blocking
(2026-09-15) against a real environment: the "request upload URL" call to
CourseCore succeeds for all four endpoints (returns a valid presigned
`uploadUrl`), but the browser's direct `PUT` to that S3 URL came back
`403 Forbidden`, while video/material uploads — same
`IS3PresignedUrlProvider`, same `Media:S3:AccessKeyId`/`SecretAccessKey`
credential — work fine. Presigning doesn't check permissions at sign
time; AWS only evaluates the IAM policy attached to that credential when
the actual request hits S3, which points at a `Resource` list scoped to
the prefixes that existed before this change:

```
arn:aws:s3:::<bucket>/videos/*
arn:aws:s3:::<bucket>/materials/*
```

**What needs to change (AWS console/Terraform — outside this repo, not a
code fix):** add the four new prefixes to that same policy's
`s3:PutObject` `Resource` list:

```
arn:aws:s3:::<bucket>/course-thumbnails/*
arn:aws:s3:::<bucket>/module-covers/*
arn:aws:s3:::<bucket>/area-covers/*
arn:aws:s3:::<bucket>/avatars/*
```

The user confirmed (2026-09-15) this is being handled separately on the
AWS side — the presigned-read change above doesn't touch it either way,
since read and write are governed by independent IAM permissions.

## Bug (fixed 2026-09-17): saving a module/course with the new storage-key `ImageUrl`/`ThumbnailUrl` was rejected as invalid

**Severity: was Blocking** for the module-cover upload flow specifically.

`CourseInputValidator` (`Modules/Courses/Application/Validation/CourseInputValidator.cs`)
validated `ModuleImageUrl`/`ThumbnailUrl` with a private `IsValidHttpUrl`
helper that required `Uri.TryCreate(..., UriKind.Absolute, ...)` with an
`http`/`https` scheme — a leftover from before the revision above, when
these fields were still pasted URLs. Once the revision made them store a
bare S3 storage key instead (e.g.
`module-covers/9f600ce28869449eb2af4ef8154a7c5c/....jpg`), every
`PUT /api/courses/{courseId}/modules/{moduleId}` (and, by the same
codepath, `PUT /api/courses/{courseId}`) that included a freshly uploaded
cover/thumbnail failed with `400 { "message": "Course payload is
invalid." }` — the validator's generic fallback message, giving no hint
the actual failing field was the image. `Area`'s equivalent validator
(`UpdateAreaUseCase`) had already been fixed to a length-only check when
its own cover-upload field shipped; `CourseInputValidator` was missed.
Fixed by dropping `IsValidHttpUrl` and reusing the existing
length-only `IsValidOptional` check for both fields (matching `Area`'s
pattern) — a legacy full URL (containing `://`) still passes the length
check fine, `ImageUrlResolver` on the read side already treats that case
as pass-through per the revision above.

## Bug (fixed 2026-09-17): module cover saved correctly but never rendered on the course detail page

**Severity: was Feature gap** — the backend was correct; the frontend
simply never consumed the field.

`GET /api/courses/{id}` (`GetCourseDetailsUseCase` → `CoursePresenter`)
already resolves each module's `ImageUrl` through `ImageUrlResolver`
exactly like `ThumbnailUrl`/`AvatarUrl` — no backend bug here. The
frontend's `courseModuleSchema`/`CourseModule` (catalog feature,
`schemas/course-details.schema.ts` and `model/course-details.ts`) never
declared an `imageUrl` field at all, so Zod silently stripped it from
every parsed response, and `ModuleCard`/`PreviewModuleCard`
(`src/features/catalog/components/`) always rendered the same fixed
diagonal-stripe placeholder `<div>` — never an `<img>` — regardless of
what the API sent. Fixed by adding `imageUrl: string | null` to both the
schema and the model, and switching both card components to the existing
`CoverImage` component (`src/components/cover-image.tsx`, already used
for course thumbnails on `CourseCard`), which renders the real photo when
present and falls back to the same stripe placeholder otherwise. The
admin module list (`AdminModuleCard`) is a text-only row by design and
was left untouched — this only affected the two student-facing module
cards on `/courses/[slug]`.
