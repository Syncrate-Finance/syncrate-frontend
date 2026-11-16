import { handleAccess } from "@/server/staking/access";
export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 30;
export const GET = handleAccess;
export const POST = handleAccess;
