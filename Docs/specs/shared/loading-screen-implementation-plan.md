# Shared — Loading screen: implementation plan

Spec: `Docs/specs/shared/loading-screen.md`.

## Component

`src/components/loading-screen.tsx`:

```tsx
import Image from 'next/image';

function LoadingScreen() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-[#0a0a0b]">
      <div className="relative flex size-[200px] items-center justify-center">
        <div className="absolute inset-0 rounded-full border-2 border-white/8" />
        <div className="absolute inset-0 animate-spin rounded-full border-2 border-transparent border-t-[oklch(0.72_0.12_248)] border-r-[oklch(0.72_0.12_248_/_0.35)]" />
        <Image
          src="/brand/viver-da-graca-mark.png"
          alt="Viver da Graça"
          width={150}
          height={150}
          className="size-[150px] rounded-full object-cover shadow-[0_0_24px_oklch(0.55_0.12_248_/_0.5)]"
        />
      </div>
    </div>
  );
}

export { LoadingScreen };
```

`animate-spin` is Tailwind's built-in utility (no new dependency); the
mockup's two-tone ring (full circle top, partial-opacity right side) comes
from setting `border-top-color` and `border-right-color` independently
while leaving `border-left`/`border-bottom` transparent, then spinning the
whole element.

## Call-site swap

For each of the 12 files listed in the spec: add
`import { LoadingScreen } from '@/components/loading-screen';` and replace

```tsx
if (!ready) {
  return <div className="min-h-screen bg-[#0a0a0b]" />;
}
```

with

```tsx
if (!ready) {
  return <LoadingScreen />;
}
```

Purely mechanical — same condition, same early return, only the rendered
JSX changes. No other line in any of these files needs to change.

## Tests

`src/components/loading-screen.spec.ts` — `renderToStaticMarkup`, same
style as `admin-lesson-row.spec.ts`: asserts the brand image renders with
the right `src`/`alt`, and that an `animate-spin` class is present
somewhere in the markup (the spinning ring). No interaction to test — it's
static markup with no props.

## Sequencing

1. `loading-screen.tsx` + its spec.
2. Swap all 12 call sites (one edit each, independent — any order).
3. `npm run test`, `npm run typecheck`, `npm run lint`.
4. Update `README.md` if it documents this loading state anywhere
   (it doesn't currently, so likely no change needed there).
