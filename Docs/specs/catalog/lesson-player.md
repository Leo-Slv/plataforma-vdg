# Lesson Player Page

## Why

`course-detail.md` deferred deciding module cards' click target: "no
destination page exists yet... no agreed URL shape for one." This spec
is that destination — where a module card (owned view) leads once
clicked, and where "Próxima aula" inside it goes next.

## Source

Design reference: artboard `1h` ("Player de aula + progresso") in
[`Docs/design/mockups/Plataforma VDG.html`](../../design/mockups/Plataforma%20VDG.html).
Same dark system as the rest of the authenticated app. As with
`course-detail.md`, read the next section before the rest of this
document — it's not a field-by-field gap this time.

## The video player itself has no viable data path — confirmed against every route in the backend

`GET /api/videos/{videoId}/playback` is real and works (`VideoPlaybackOutput`
with a signed `PlaybackUrl`, `DurationSeconds`, `ExpiresAt`) — but it
needs a `videoId` the caller already has. Nothing gives the frontend
one:

- `LessonResponse` (what `GET /api/courses/{id}` nests) has no video
  reference at all — `Id`, `ModuleId`, `Title`, `Description`,
  `DisplayOrder`, `FreePreview`, `Published`. No `videoId`.
- There is no Lessons controller, and no route on any of this
  backend's 7 controllers (`Areas`, `AreaManagement`, `Auth`, `Courses`,
  `Videos`, `Progress`, `Users` — all of them, checked) resolves
  "video for lesson X." The only place that lookup happens
  (`IVideoRepository.FindByLessonIdAsync`) is internal to
  `RegisterLessonProgressUseCase`, never returned to a caller.
- The `Videos` controller's own routes are create (admin), mark-ready
  (admin), and playback-by-id — no list, no by-lesson query.

So this isn't "the mockup shows a duration we can't fetch" (already
priced into `course-detail.md`) — it's that the screen's whole reason to
exist, playing a video, has nothing to call. Per your call on this: the
page gets built around what *is* real, with the video area as an
honest, inert placeholder rather than a play button wired to nothing.

## What else in the mockup has no backend behind it

| Mockup shows | Backend has it? |
|---|---|
| Per-lesson duration in the sidebar ("14:20") | Only on `VideoResponse.DurationSeconds` — same unreachable-without-a-videoId problem as above. |
| Attached materials ("Apostila — Módulo 01", PDF sizes) | No attachment/material concept anywhere in the domain. |
| "Anotações" / "Perguntas" tabs | No notes or Q&A concept anywhere. |
| Captions (CC), playback speed, scrubber | Player chrome for a video that doesn't play here — moot. |

## What's real and drives this page instead

- `GET /api/progress/courses/{courseId}` (`CourseProgressResponse`) —
  real, works today, and gracefully returns an empty/zero state
  (`CourseProgressOutput.Empty`) when nothing's been watched yet rather
  than erroring. Gives the course-level percent and, per lesson,
  `Completed`/`WatchedSeconds`/`LastWatchedAt`.
- `POST /api/progress/lessons` (`{ lessonId, watchedSeconds }`) — real.
  The server (not the client) decides completion:
  `watchedSeconds >= videoDurationSeconds × 90%`
  (`ProgressOptions.LessonCompletionThresholdPercent`, defaults to
  **90 — the exact number the mockup's footnote already uses**, not a
  coincidence worth losing). **For lessons with no attached video (true
  of everything seeded in this environment so far), the server always
  returns `Completed: false` regardless of `watchedSeconds` sent** — not
  a bug in this plan, a direct read of `RegisterLessonProgressUseCase`
  (`if (video is null ...) return false`). The button that calls this
  is real functionality exercised honestly; whether it *visibly* flips
  a lesson to done depends on data (a real attached video) outside this
  screen.
- The module/lesson list itself, from `GET /api/courses/{id}` — already
  fetched by the course detail page; this page reuses the same query.

## Goals

- A lesson's title, description, and module context (from the course
  details already fetched for `/courses/[slug]`).
- A real, working "Marcar aula como assistida" action: sends actual
  elapsed time on the page as `watchedSeconds`, via the real endpoint —
  see "What's real" for what that can and can't flip.
- A sidebar with every module and lesson, each a real link to its own
  lesson page, marked against real progress data (done / current /
  not started) — no invented durations.
- Course-level progress percent, from the same real endpoint, in the
  top bar.
- "Próxima aula" — pure client-side navigation through the flattened
  lesson sequence already available from the course details query, no
  extra request.
- Connects course-detail's module cards (currently inert — see
  `course-detail.md`'s non-goals) to this page: clicking a module now
  opens its first lesson.

## Non-goals

- Everything in both gap tables above: real video playback, per-lesson
  duration, materials, notes, questions, captions, speed, scrubbing.
- Auto-tracking watch time as a background heartbeat while the page is
  open. The elapsed-time counter only gets sent when the visitor clicks
  "Marcar aula como assistida" — a real player would report continuously;
  simulating that cadence for a page with no real video to justify it
  would look more like real tracking than it is.
- Any attempt to force a lesson to `Completed: true` client-side when
  the server says otherwise (e.g. inflating `watchedSeconds`). The
  server's answer is the answer, even when it's "no" for a reason this
  page can't fix.

## Behavior

- Same auth gate as every authenticated page. Additionally: if the
  resolved course's `hasAccess` is `false`, redirect to
  `/courses/[slug]` (the course detail page) — its own locked view
  already handles that account correctly; this page has nothing to add
  for someone who can't open the course.
- Unknown `lessonId` for the course (not in any of its modules) →
  not-found state, same treatment as course-detail's unknown slug.
- "Marcar aula como assistida": disabled while the request is in
  flight; on success, refetches course progress so the sidebar's
  checkmark (or lack of one) reflects the server's real answer
  immediately — including staying unchecked, which is correct, not a
  stale-UI bug, when there's no video attached.
- "Próxima aula" is absent (not disabled — the mockup's still-modules-
  ahead state doesn't apply to a last lesson) when the current lesson is
  the last one in the course.

## Acceptance criteria

- `/courses/[slug]/lessons/[lessonId]` with no access to the course
  redirects to `/courses/[slug]`.
- An unknown `lessonId` shows a not-found state.
- The sidebar lists every real module and lesson, each linking to its
  own URL, with no duration shown anywhere.
- Course-level percent and per-lesson completion in the sidebar both
  come from `GET /api/progress/courses/{courseId}` — never computed or
  guessed client-side.
- Clicking "Marcar aula como assistida" calls
  `POST /api/progress/lessons` with real elapsed seconds and refetches
  progress — the UI reflects whatever the server actually returns, done
  or not.
- The video area renders as a clearly inert placeholder — no button that
  looks like it plays something it can't.
- A module card on `/courses/[slug]` now links to that module's first
  lesson.
