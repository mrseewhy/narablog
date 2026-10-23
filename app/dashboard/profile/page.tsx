"use client";

import { useState, type FormEvent } from "react";
import { LockKeyhole, UserRound } from "lucide-react";

import { Button } from "@/components/ui/button";

const initialProfile = {
  name: "Olusegun",
  username: "",
  email: "",
  bio: "",
  website: "",
  location: "",
};

const inputClass =
  "h-11 w-full rounded-lg border bg-background px-3 text-sm outline-none placeholder:text-muted-foreground focus-visible:ring-2 focus-visible:ring-ring";

export default function ProfilePage() {
  const [profile, setProfile] = useState(initialProfile);

  const handlePasswordSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const form = event.currentTarget;
    const fields = new FormData(form);
    const confirmation = form.elements.namedItem("confirmPassword") as HTMLInputElement;

    if (fields.get("newPassword") !== fields.get("confirmPassword")) {
      confirmation.setCustomValidity("The new passwords do not match.");
      confirmation.reportValidity();
      return;
    }

  };

  const updateField = (field: keyof typeof initialProfile, value: string) => {
    setProfile((current) => ({ ...current, [field]: value }));
  };


  return (
    <div className="w-full space-y-8">
      <header>
        <h1 className="text-2xl font-bold tracking-tight">My Profile</h1>
        <p className="mt-1 text-muted-foreground">
          Manage your personal details and introduce yourself to your readers.
        </p>
      </header>

      <section className="overflow-hidden rounded-xl border bg-card shadow-sm" aria-labelledby="profile-heading">
        <div className="flex items-center gap-4 border-b p-6">
          <span className="grid size-14 shrink-0 place-items-center rounded-full bg-primary/10 text-primary">
            <UserRound className="size-7" aria-hidden="true" />
          </span>
          <div>
            <h2 id="profile-heading" className="font-semibold">Profile details</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Your name and bio help readers get to know the person behind the stories.
            </p>
          </div>
        </div>

        <form onSubmit={(event) => event.preventDefault()} className="space-y-6 p-6">
          <div className="grid gap-6 sm:grid-cols-2">
            <div className="space-y-2">
              <label htmlFor="name" className="text-sm font-medium">Display name <span className="text-muted-foreground">(required)</span></label>
              <input id="name" name="name" autoComplete="name" required maxLength={80} pattern=".*\S.*" value={profile.name} onChange={(event) => updateField("name", event.target.value)} className={inputClass} />
            </div>
            <div className="space-y-2">
              <label htmlFor="username" className="text-sm font-medium">Username</label>
              <input id="username" name="username" autoComplete="username" placeholder="Your username" maxLength={30} pattern="[a-zA-Z0-9_]+" aria-describedby="username-help" value={profile.username} onChange={(event) => updateField("username", event.target.value)} className={inputClass} />
              <p id="username-help" className="text-xs text-muted-foreground">Letters, numbers, and underscores only.</p>
            </div>
          </div>

          <div className="space-y-2">
            <label htmlFor="email" className="text-sm font-medium">Email address <span className="text-muted-foreground">(required)</span></label>
            <input id="email" name="email" type="email" autoComplete="email" placeholder="you@example.com" required maxLength={254} value={profile.email} onChange={(event) => updateField("email", event.target.value)} className={inputClass} />
          </div>

          <div className="space-y-2">
            <label htmlFor="bio" className="text-sm font-medium">Bio</label>
            <textarea id="bio" name="bio" rows={4} maxLength={300} placeholder="Tell readers a little about yourself and what you write about." aria-describedby="bio-help" value={profile.bio} onChange={(event) => updateField("bio", event.target.value)} className={`${inputClass} h-auto min-h-28 resize-y py-3`} />
            <p id="bio-help" className="text-xs text-muted-foreground">{profile.bio.length}/300 characters</p>
          </div>

          <div className="grid gap-6 sm:grid-cols-2">
            <div className="space-y-2">
              <label htmlFor="website" className="text-sm font-medium">Website</label>
              <input id="website" name="website" type="url" autoComplete="url" placeholder="https://example.com" maxLength={2048} value={profile.website} onChange={(event) => updateField("website", event.target.value)} className={inputClass} />
            </div>
            <div className="space-y-2">
              <label htmlFor="location" className="text-sm font-medium">Location</label>
              <input id="location" name="location" autoComplete="address-level2" placeholder="City, country" maxLength={100} value={profile.location} onChange={(event) => updateField("location", event.target.value)} className={inputClass} />
            </div>
          </div>

          <div className="space-y-4 border-t pt-6">
            <div className="flex flex-wrap justify-end gap-3">
              <Button type="button" variant="outline" onClick={() => setProfile(initialProfile)}>Cancel</Button>
              <Button type="submit">Save changes</Button>
            </div>
          </div>
        </form>
      </section>

      <section className="overflow-hidden rounded-xl border bg-card shadow-sm" aria-labelledby="password-heading">
        <div className="flex items-center gap-4 border-b p-6">
          <span className="grid size-14 shrink-0 place-items-center rounded-full bg-primary/10 text-primary">
            <LockKeyhole className="size-7" aria-hidden="true" />
          </span>
          <div>
            <h2 id="password-heading" className="font-semibold">Change password</h2>
            <p className="mt-1 text-sm text-muted-foreground">Choose a new password for your account.</p>
          </div>
        </div>

        <form
          onSubmit={handlePasswordSubmit}
          onInput={(event) => {
            const confirmation = event.currentTarget.elements.namedItem("confirmPassword") as HTMLInputElement;
            confirmation.setCustomValidity("");
          }}
          onReset={(event) => {
            const confirmation = event.currentTarget.elements.namedItem("confirmPassword") as HTMLInputElement;
            confirmation.setCustomValidity("");
          }}
          className="space-y-6 p-6"
        >
          <div className="space-y-2">
            <label htmlFor="current-password" className="text-sm font-medium">Current password</label>
            <input id="current-password" name="currentPassword" type="password" autoComplete="current-password" required placeholder="Enter your current password" className={inputClass} />
          </div>
          <div className="grid gap-6 sm:grid-cols-2">
            <div className="space-y-2">
              <label htmlFor="new-password" className="text-sm font-medium">New password</label>
              <input id="new-password" name="newPassword" type="password" autoComplete="new-password" required minLength={8} aria-describedby="password-help" placeholder="Enter a new password" className={inputClass} />
              <p id="password-help" className="text-xs text-muted-foreground">Use at least 8 characters.</p>
            </div>
            <div className="space-y-2">
              <label htmlFor="confirm-password" className="text-sm font-medium">Confirm new password</label>
              <input id="confirm-password" name="confirmPassword" type="password" autoComplete="new-password" required minLength={8} placeholder="Repeat your new password" className={inputClass} />
            </div>
          </div>
          <div className="space-y-4 border-t pt-6">
            <div className="flex flex-wrap justify-end gap-3">
              <Button type="reset" variant="outline">Cancel</Button>
              <Button type="submit">Update password</Button>
            </div>
          </div>
        </form>
      </section>
    </div>
  );
}
