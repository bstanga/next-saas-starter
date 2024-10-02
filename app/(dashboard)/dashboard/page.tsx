import { redirect } from "next/navigation";
import { Settings } from "./team/settings";
import { getSession } from "@/lib/auth/session";
import prisma from "@/lib/db/prisma";
import { Overview } from "./overview";

export default async function OverviewPage() {
  const session = await getSession();
  if (!session) {
    redirect("/sign-in");
  }

  return <Overview />;
}
