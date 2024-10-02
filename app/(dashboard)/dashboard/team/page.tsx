import { redirect } from "next/navigation";
import { Settings } from "./settings";
import { getSession } from "@/lib/auth/session";
import prisma from "@/lib/db/prisma";

export default async function SettingsPage() {
  const session = await getSession();
  if (!session) {
    redirect("/sign-in");
  }

  const team = await prisma.team.findFirst({
    where: {
      id: session.teamId,
    },
    include: {
      members: {
        include: {
          user: true,
        },
      },
    },
  });
  if (!team) {
    throw new Error("Team not found");
  }

  return <Settings team={team} />;
}
