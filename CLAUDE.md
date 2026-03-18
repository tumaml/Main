# Mezan — TikTok + TikTok Shop Clone

## Stack
Next.js 14 App Router, TypeScript, Tailwind CSS, Supabase (DB + Realtime),
Clerk (Auth), Cloudflare Stream (HLS video), Cloudflare R2 (storage),
Stripe + Stripe Connect (payments), 100ms.live (WebRTC live streaming),
Upstash Redis (cache + rate limiting), Algolia (search), Resend (email),
Zustand (client state), Vercel + Railway (hosting)

## Non-negotiable Rules
- Never use `any` in TypeScript — use proper types or `unknown`
- All DB calls go through /lib/supabase.ts server client helpers
- All API routes validate Clerk auth before any DB operation
- Never store video files locally — always Cloudflare R2/Stream
- Follow Section 21 folder structure exactly — no deviations
- Optimistic UI on all like/follow/bookmark actions
- Every new table needs RLS policies in the same migration file
- No inline styles — Tailwind classes only
- Mobile-first: design for 375px, scale up

## Current Phase
Phase 1 — Core Video App

## Completed
- Commit 1: Folder restructure + route groups (Section 21 compliant)

## Branch
claude/plan-social-commerce-platform-40OGO
