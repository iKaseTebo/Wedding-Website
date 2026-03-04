"use client";

import { useState } from "react";

type RsvpFormProps = {
  action: (formData: FormData) => void | Promise<void>;
};

const guestHelpText =
  "Include yourself in the guest count and add one name per person attending.";

function TooltipIcon() {
  return (
    <span className="tooltip-wrap">
      <span aria-hidden="true" className="tooltip-trigger">
        ?
      </span>
      <span className="tooltip-bubble" role="tooltip">
        {guestHelpText}
      </span>
    </span>
  );
}

export default function RsvpForm({ action }: RsvpFormProps) {
  const [attending, setAttending] = useState("yes");
  const [guestCount, setGuestCount] = useState(1);

  const normalizedGuestCount =
    attending === "yes" ? Math.max(1, guestCount) : 0;

  return (
    <form action={action} className="grid w-full gap-5 lg:max-w-2xl">
      <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
        <label className="text-sm uppercase tracking-[0.25em]">
          Name
          <input className="input mt-2" name="name" required />
        </label>
        <label className="text-sm uppercase tracking-[0.25em]">
          Email
          <input className="input mt-2" name="email" type="email" required />
        </label>
        <label className="text-sm uppercase tracking-[0.25em]">
          Phone Number
          <input
            className="input mt-2"
            name="phone"
            type="tel"
            placeholder="(555) 555-5555"
          />
        </label>
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        <label className="text-sm uppercase tracking-[0.25em]">
          Attending
          <select
            className="input mt-2"
            name="attending"
            value={attending}
            onChange={(event) => setAttending(event.target.value)}
          >
            <option value="yes">Yes, see you there</option>
            <option value="no">Sadly, cannot make it</option>
          </select>
        </label>
        <label className="text-sm uppercase tracking-[0.25em]">
          <span className="flex items-center gap-2">
            <span className="min-w-0">Number of Guests Attending</span>
            <TooltipIcon />
          </span>
          <input
            className="input mt-2"
            name="guests"
            type="number"
            min={attending === "yes" ? 1 : 0}
            value={normalizedGuestCount}
            onChange={(event) => {
              const nextValue = Number(event.target.value);
              setGuestCount(
                Number.isNaN(nextValue) ? 1 : Math.max(0, nextValue),
              );
            }}
          />
        </label>
      </div>

      <div className="grid gap-3">
        <div className="text-sm uppercase tracking-[0.25em]">
          <div className="mb-2 flex items-center gap-2">
            <span className="min-w-0">Names of Guests Attending</span>
            <TooltipIcon />
          </div>
          {normalizedGuestCount > 0 ? (
            <div className="grid gap-3">
              {Array.from({ length: normalizedGuestCount }, (_, index) => (
                <label
                  key={index}
                  className="text-xs uppercase tracking-[0.22em] text-[color:var(--brown)]"
                >
                  Guest {index + 1}
                  <input
                    className="input mt-2"
                    name="guestNames"
                    required={attending === "yes"}
                    placeholder={
                      index === 0
                        ? "Your full name"
                        : `Guest ${index + 1} full name`
                    }
                  />
                </label>
              ))}
            </div>
          ) : (
            <div className="rounded-2xl border border-dashed border-[color:var(--paprika)] p-4 text-xs uppercase tracking-[0.22em] text-[color:var(--paprika)]">
              No guest names needed if you are unable to attend.
            </div>
          )}
        </div>
      </div>

      <label className="text-sm uppercase tracking-[0.25em]">
        Any Dietary Restrictions
        <textarea
          className="input mt-2 min-h-[120px]"
          name="dietaryRestrictions"
          placeholder="Allergies, sensitivities, or meal needs."
        />
      </label>

      <label className="text-sm uppercase tracking-[0.25em]">
        Message
        <textarea
          className="input mt-2 min-h-[140px]"
          name="message"
          placeholder="Song requests, food notes, or a sweet message."
        />
      </label>

      <button className="btn btn-primary w-full" type="submit">
        Send RSVP
      </button>
    </form>
  );
}
