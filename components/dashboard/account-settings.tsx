"use client";
import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  updateProfileAction,
  changePasswordAction,
  changeEmailAction,
} from "@/lib/data/actions/account.actions";
import { fieldClass, PageHeading } from "./ui";
import type { ProfileInput } from "@/lib/data/validation/account.validate";

export function AccountSettings({
  profile,
  email,
  emailVerified,
}: {
  profile: ProfileInput;
  email: string;
  emailVerified: boolean;
}) {
  const router = useRouter();
  const [busy, setBusy] = useState<string | null>(null);
  const [message, setMessage] = useState<{
    success: boolean;
    message: string;
  } | null>(null);
  async function submit(
    event: FormEvent<HTMLFormElement>,
    mode: "profile" | "password" | "email",
  ) {
    event.preventDefault();
    if (busy) return;
    const form = event.currentTarget;
    const values = Object.fromEntries(new FormData(form).entries());
    setBusy(mode);
    setMessage(null);
    try {
      const result =
        mode === "profile"
          ? await updateProfileAction(values)
          : mode === "email"
            ? await changeEmailAction(values)
            : await changePasswordAction({
                ...values,
                revokeOtherSessions: values.revokeOtherSessions === "on",
              });
      setMessage(result);
      if (result.success) {
        if (mode !== "profile") form.reset();
        router.refresh();
      }
    } catch {
      setMessage({
        success: false,
        message: "Unable to update your account. Please try again.",
      });
    } finally {
      setBusy(null);
    }
  }
  return (
    <div className="space-y-8">
      <PageHeading
        title="Account settings"
        description="Manage your profile, email address, and password."
      />
      {message && (
        <p
          role={message.success ? "status" : "alert"}
          className={message.success ? "text-primary" : "text-destructive"}
        >
          {message.message}
        </p>
      )}
      <form
        onSubmit={(e) => submit(e, "profile")}
        className="space-y-5 rounded-xl border bg-card p-6"
      >
        <h2 className="text-lg font-semibold">Profile details</h2>
        {(
          [
            ["name", "Display name"],
            ["username", "Username"],
            ["website", "Website"],
            ["location", "Location"],
          ] as const
        ).map(([key, label]) => (
          <div key={key}>
            <label htmlFor={key}>{label}</label>
            <input
              id={key}
              name={key}
              defaultValue={profile[key]}
              type={key === "website" ? "url" : "text"}
              required={key === "name"}
              className={fieldClass}
            />
          </div>
        ))}
        <div>
          <label htmlFor="bio">Bio</label>
          <textarea
            id="bio"
            name="bio"
            defaultValue={profile.bio}
            maxLength={300}
            className={`${fieldClass} min-h-28`}
          />
        </div>
        <Button type="submit" disabled={Boolean(busy)}>
          {busy === "profile" ? "Saving..." : "Save profile"}
        </Button>
      </form>
      <form
        onSubmit={(e) => submit(e, "email")}
        className="space-y-5 rounded-xl border bg-card p-6"
      >
        <h2 className="text-lg font-semibold">Change email</h2>
        <p className="text-sm text-muted-foreground">
          Current address: {email}. {emailVerified
            ? "Approve the change at your current address, then verify the new one."
            : "Verify the new address to complete the change."}
        </p>
        <label htmlFor="new-email">New email address</label>
        <input
          id="new-email"
          name="email"
          type="email"
          required
          className={fieldClass}
        />
        <Button type="submit" disabled={Boolean(busy)}>
          Request email change
        </Button>
      </form>
      <form
        onSubmit={(e) => submit(e, "password")}
        className="space-y-5 rounded-xl border bg-card p-6"
      >
        <h2 className="text-lg font-semibold">Change password</h2>
        {(
          [
            ["currentPassword", "Current password"],
            ["newPassword", "New password"],
            ["confirmPassword", "Confirm new password"],
          ] as const
        ).map(([key, label]) => (
          <div key={key}>
            <label htmlFor={key}>{label}</label>
            <input
              id={key}
              name={key}
              type="password"
              autoComplete={
                key === "currentPassword" ? "current-password" : "new-password"
              }
              required
              className={fieldClass}
            />
          </div>
        ))}
        <p className="text-sm text-muted-foreground">
          Use 8–70 characters, uppercase and lowercase letters, a number, and a
          special character.
        </p>
        <label className="flex items-center gap-2">
          <input type="checkbox" name="revokeOtherSessions" defaultChecked />
          Sign out other devices
        </label>
        <Button type="submit" disabled={Boolean(busy)}>
          {busy === "password" ? "Updating..." : "Change password"}
        </Button>
      </form>
    </div>
  );
}
