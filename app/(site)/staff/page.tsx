import type { Metadata } from "next";
import { StaffSignIn } from "@/components/cms/staff-sign-in";
export const metadata: Metadata = {
  title: "Staff sign-in | Syncrate",
  robots: { index: false, follow: false },
  referrer: "no-referrer",
};
export default function StaffPage() {
  return <StaffSignIn />;
}
