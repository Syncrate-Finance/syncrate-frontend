import { handleInquiry } from "@/server/contact/inquiry";
import { deliverInquiry } from "@/server/contact/mail";
export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 30;
export async function POST(request: Request) {
  return handleInquiry(request, deliverInquiry);
}
