"use client";

import { SignedIn, SignedOut, SignInButton, UserButton } from "@clerk/nextjs";

export default function AuthControls() {
  return (
    <div className="flex items-center gap-3">
      <SignedOut>
        <SignInButton mode="modal">
          <button className="btn btn-secondary" type="button">
            Wedding Party Login
          </button>
        </SignInButton>
      </SignedOut>
      <SignedIn>
        <div className="flex items-center gap-3 text-sm uppercase tracking-[0.3em]">
          <span>Signed in</span>
          <UserButton
            appearance={{ elements: { userButtonAvatarBox: "h-9 w-9" } }}
          />
        </div>
      </SignedIn>
    </div>
  );
}
