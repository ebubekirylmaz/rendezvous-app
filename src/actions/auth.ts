"use server";

import { AuthError } from "next-auth";
import { redirect } from "next/navigation";
import { signIn, signOut } from "@/lib/auth";

export async function login(formData: FormData) {
  try {
    await signIn("credentials", {
      email: formData.get("email"),
      password: formData.get("password"),
      redirectTo: "/admin/calendar",
    });
  } catch (error) {
    if (error instanceof AuthError) {
      redirect("/admin/login?error=1");
    }
    throw error;
  }
}

export async function logout() {
  await signOut({ redirectTo: "/admin/login" });
}
