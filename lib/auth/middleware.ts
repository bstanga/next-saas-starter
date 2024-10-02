import { z } from "zod";
import { Team, User, UserRole } from "@prisma/client";
import prisma from "@/lib/db/prisma";
import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth/session";

export type ActionState = {
  error?: string;
  success?: string;
  [key: string]: any; // This allows for additional properties
};

type ValidatedActionFunction<S extends z.ZodType<any, any>, T> = (
  data: z.infer<S>,
  formData: FormData
) => Promise<T>;

export function validatedAction<S extends z.ZodType<any, any>, T>(
  schema: S,
  action: ValidatedActionFunction<S, T>
) {
  return async (prevState: ActionState, formData: FormData): Promise<T> => {
    const result = schema.safeParse(Object.fromEntries(formData));
    if (!result.success) {
      return { error: result.error.errors[0].message } as T;
    }

    return action(result.data, formData);
  };
}

type ValidatedActionWithUserFunction<S extends z.ZodType<any, any>, T> = (
  data: z.infer<S>,
  formData: FormData,
  user: User
) => Promise<T>;

export function validatedActionWithUser<S extends z.ZodType<any, any>, T>(
  schema: S,
  action: ValidatedActionWithUserFunction<S, T>
) {
  return async (prevState: ActionState, formData: FormData): Promise<T> => {
    const session = await getSession();
    if (!session) {
      throw new Error("User is not authenticated");
    }

    const user = await prisma.user.findFirst({
      where: {
        id: session.userId,
      },
    });
    if (!user) {
      throw new Error("User not found");
    }

    const result = schema.safeParse(Object.fromEntries(formData));
    if (!result.success) {
      return { error: result.error.errors[0].message } as T;
    }

    return action(result.data, formData, user);
  };
}

type ActionWithAuthFunction<T> = (
  formData: FormData,
  authData: {
    user: User;
    userRole: UserRole;
    team: Team;
  }
) => Promise<T>;

export function withAuth<T>(action: ActionWithAuthFunction<T>) {
  return async (formData: FormData): Promise<T> => {
    const session = await getSession();
    if (!session) {
      return redirect("/sign-in");
    }

    const [user, team] = await Promise.all([
      prisma.user.findFirst({
        where: {
          id: session.userId,
        },
      }),
      prisma.team.findFirst({
        where: {
          id: session.teamId,
        },
      }),
    ]);
    if (!user || !team) {
      return redirect("/sign-in");
    }

    return action(formData, { user, team, userRole: session.userRole });
  };
}
