"use server";

import { redirect } from "next/navigation";
import { createCheckoutSession, createCustomerPortalSession } from "./stripe";
import { withAuth } from "@/lib/auth/middleware";

export const checkoutAction = withAuth(async (formData, { team }) => {
  const priceId = formData.get("priceId") as string;
  await createCheckoutSession({ team: team, priceId });
});

export const customerPortalAction = withAuth(async (_, { team }) => {
  const portalSession = await createCustomerPortalSession(team);
  redirect(portalSession.url);
});
