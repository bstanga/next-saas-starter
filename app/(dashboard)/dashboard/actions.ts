"use server";

import { redirect } from "next/navigation";

export const connectGithubAction = async () => {
  redirect("https://github.com");
};
