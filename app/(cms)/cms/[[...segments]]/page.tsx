import { redirect } from "next/navigation";
import { readServerEnvironment } from "@/server/environment";
import config from "@payload-config";
import { RootPage, generatePageMetadata } from "@payloadcms/next/views";
import { importMap } from "../importMap";

type Arguments = {
  params: Promise<{ segments: string[] }>;
  searchParams: Promise<Record<string, string | string[]>>;
};
export const generateMetadata = (args: Arguments) =>
  generatePageMetadata({ ...args, config });
export default async function CMSPage(args: Arguments) {
  const params = await args.params;
  if (
    readServerEnvironment().CMS_AUTH_PROVIDER === "supabase" &&
    ["login", "logout", "create-first-user", "forgot", "reset"].includes(
      params.segments?.[0],
    )
  )
    redirect("/staff");
  return RootPage({ ...args, config, importMap });
}
