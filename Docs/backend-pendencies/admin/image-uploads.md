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

All four return `{ storageProvider, storageKey, uploadUrl, publicUrl,
expiresAt }`. The frontend PUTs the file straight to `uploadUrl` (same
`uploadFileToStorage` XHR helper the video/material flows already use),
then saves `publicUrl` into the entity's `thumbnailUrl`/`imageUrl`/
`avatarUrl` field via the existing update endpoint — no new field type,
these are still plain strings.

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

## Config pendency 1: the IAM credential needs `s3:PutObject` on the new prefixes

**Severity: Config. Confirmed blocking (2026-09-15)** — verified against
a real environment: the "request upload URL" call to CourseCore succeeds
for all four endpoints (returns a valid presigned `uploadUrl`), but the
browser's direct `PUT` to that S3 URL comes back `403 Forbidden`. Video
and material uploads, hitting the same `IS3PresignedUrlProvider` with the
same `Media:S3:AccessKeyId`/`SecretAccessKey` credential, work fine.

Presigning doesn't check permissions at sign time — AWS only evaluates
the IAM policy attached to that credential when the actual request hits
S3. This points at an IAM policy whose `Resource` list is scoped to the
key prefixes that existed before this change:

```
arn:aws:s3:::<bucket>/videos/*
arn:aws:s3:::<bucket>/materials/*
```

**What needs to change (AWS console/Terraform — outside this repo, not a
code fix):** add the four new prefixes this change introduced to that
same policy's `s3:PutObject` (and ideally `s3:PutObjectAcl` if the bucket
uses ACLs) `Resource` list:

```
arn:aws:s3:::<bucket>/course-thumbnails/*
arn:aws:s3:::<bucket>/module-covers/*
arn:aws:s3:::<bucket>/area-covers/*
arn:aws:s3:::<bucket>/avatars/*
```

## Config pendency 2: the S3 bucket needs a public-read policy for these prefixes

**Severity: Config.**

Video and material uploads stay private — playback/download always goes
through a freshly-presigned GET requested at render time
(`RequestVideoPlaybackUseCase`, `GetLessonMaterialDownloadUrlUseCase`).
Images can't work that way: they're embedded directly as `<img src>`
across the frontend, including the **public, unauthenticated landing
page** (featured course thumbnails) — a presigned-GET-per-render model
doesn't work for anonymous visitors.

So for images, `publicUrl` is a permanent, unsigned, virtual-hosted-style
S3 URL (`https://{bucket}.s3.{region}.amazonaws.com/{key}`), and the code
assumes the bucket (or at minimum the `course-thumbnails/`,
`module-covers/`, `area-covers/`, and `avatars/` key prefixes) is
configured for public-read access at the infrastructure level. This is
the same category of manual operator prerequisite as the existing
`Media:Playback:AllowedStorageProviders` gate (see
`Docs/specs/catalog/lesson-player.md`'s backend-pendencies file) — code
is done, an operator still needs to flip this on the actual bucket before
uploaded images resolve for real users.

Pendency 1 (write access) is the one actually observed blocking uploads
today; pendency 2 (public read) hasn't been hit yet since no upload has
gotten past pendency 1, but will surface next once writes are unblocked.
