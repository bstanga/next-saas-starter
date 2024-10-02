import prisma from "@/lib/db/prisma";
import Navbar from "./navbar";
import { getSession } from "@/lib/auth/session";
import { redirect } from "next/navigation";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const sesion = await getSession();
  if (!sesion) {
    redirect("/login");
  }

  const userRoles = await prisma.teamMember.findMany({
    where: { userId: sesion.userId },
    include: {
      team: true,
    },
  });
  const teams = userRoles?.map((u) => ({
    id: u.teamId,
    name: u.team.name,
    // image: u.team.image,
  }));

  return (
    <div className="flex flex-col min-h-[calc(100dvh-68px)] max-w-7xl mx-auto w-full -mt-[1px]">
      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar */}
        <Navbar teams={teams} />

        {/* Main content */}
        <main className="flex-1 overflow-y-auto p-0 lg:p-4">{children}</main>
      </div>
    </div>
  );
}
