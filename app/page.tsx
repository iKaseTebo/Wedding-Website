import { redirect } from "next/navigation";
import { currentUser } from "@clerk/nextjs/server";
import { asc, eq } from "drizzle-orm";
import AuthControls from "@/app/components/AuthControls";
import RsvpForm from "@/app/components/RsvpForm";
import { db } from "@/db";
import { clothingItems, partyMembers, rsvps } from "@/db/schema";

type HomeProps = {
  searchParams?: Promise<{ rsvp?: string }>;
};

const rsvpNotice: Record<string, string> = {
  thanks: "Thanks for celebrating with us. We saved your RSVP.",
  error: "Something went sideways. Please try the RSVP again.",
  missing: "Please add your name and email so we can save your RSVP.",
  details:
    "Please add one attendee name per line so it matches your RSVP count.",
  unavailable: "RSVPs are offline for a moment. Try again shortly.",
};

async function submitRsvp(formData: FormData) {
  "use server";

  const name = String(formData.get("name") || "").trim();
  const email = String(formData.get("email") || "")
    .trim()
    .toLowerCase();
  const phone = String(formData.get("phone") || "").trim();
  const attending = String(formData.get("attending") || "yes") === "yes";
  const guests = Number(formData.get("guests") || 1);
  const guestNames = formData
    .getAll("guestNames")
    .map((entry) => String(entry || "").trim())
    .filter(Boolean);
  const dietaryRestrictions = String(
    formData.get("dietaryRestrictions") || "",
  ).trim();
  const message = String(formData.get("message") || "").trim();
  const normalizedGuests = Number.isNaN(guests)
    ? 1
    : Math.max(0, Math.floor(guests));
  const attendingCount = attending ? Math.max(1, normalizedGuests) : 0;

  if (!name || !email) {
    redirect("/?rsvp=missing#rsvp");
  }

  if (attending && guestNames.length !== attendingCount) {
    redirect("/?rsvp=details#rsvp");
  }

  if (!db) {
    redirect("/?rsvp=unavailable#rsvp");
  }

  try {
    await db.insert(rsvps).values({
      name,
      email,
      phone: phone.length ? phone : null,
      attending,
      guests: attendingCount,
      guestNames,
      dietaryRestrictions: dietaryRestrictions.length
        ? dietaryRestrictions
        : null,
      message: message.length ? message : null,
    });
    redirect("/?rsvp=thanks#rsvp");
  } catch {
    redirect("/?rsvp=error#rsvp");
  }
}

export default async function Home({ searchParams }: HomeProps) {
  const resolvedSearchParams = searchParams ? await searchParams : undefined;
  const registryUrl =
    process.env.NEXT_PUBLIC_REGISTRY_URL ||
    "https://www.amazon.com/wedding/registry";
  const user = await currentUser();
  const email = user?.primaryEmailAddress?.emailAddress?.toLowerCase() ?? null;
  const displayName =
    user?.fullName ||
    [user?.firstName, user?.lastName].filter(Boolean).join(" ") ||
    "Wedding Party Member";

  if (user && email && db) {
    try {
      await db
        .insert(partyMembers)
        .values({
          name: displayName,
          email,
          clerkUserId: user.id,
          partyRole: "other",
          colorName: "Unassigned",
          colorHex: "#edc6a4",
        })
        .onConflictDoUpdate({
          target: partyMembers.email,
          set: {
            name: displayName,
            clerkUserId: user.id,
          },
        });
    } catch {
      // If the insert/update fails, we still let the page render.
    }
  }

  const partyMember =
    email && db
      ? (
          await db
            .select()
            .from(partyMembers)
            .where(eq(partyMembers.email, email))
            .limit(1)
        )[0]
      : null;

  const items =
    partyMember && db
      ? await db
          .select()
          .from(clothingItems)
          .where(eq(clothingItems.partyRole, partyMember.partyRole))
          .orderBy(asc(clothingItems.name))
      : [];

  const roster =
    user && db
      ? await db
          .select()
          .from(partyMembers)
          .orderBy(asc(partyMembers.partyRole), asc(partyMembers.name))
      : [];

  const notice = resolvedSearchParams?.rsvp
    ? rsvpNotice[resolvedSearchParams.rsvp]
    : null;
  const isDbReady = Boolean(db);

  return (
    <div className="sunburst min-h-screen">
      <div className="mx-auto flex min-h-screen max-w-6xl flex-col gap-10 px-6 py-10">
        <div className="paper rise p-6 sm:p-10">
          <header className="flex flex-col gap-8 lg:flex-row lg:items-start lg:justify-between">
            <div className="flex flex-1 flex-col gap-4">
              <div className="badge">06 · 06 · 2026</div>
              <h1 className="font-display text-4xl uppercase tracking-[0.24em] text-[color:var(--deep-brown)] sm:text-5xl">
                Rebecca & Kase
              </h1>
              <p className="max-w-xl text-lg leading-8 text-[color:var(--brown)]">
                A retro 70s disco celebration with velvet nights, sunburst
                skies, and all the good grooves. Join us in Natural Bridge, NY.
              </p>
              <div className="flex flex-wrap gap-3">
                <a className="btn btn-primary" href="#rsvp">
                  RSVP
                </a>
                <a
                  className="btn btn-secondary"
                  href={registryUrl}
                  target="_blank"
                  rel="noreferrer"
                >
                  Registry
                </a>
                <a className="btn btn-secondary" href="#party">
                  Wedding Party
                </a>
              </div>
            </div>
            <div className="flex flex-col items-end gap-6">
              <AuthControls />
              <div className="relative self-end">
                <div className="disco">
                  <span className="sparkle one" />
                  <span className="sparkle two" />
                </div>
              </div>
            </div>
          </header>

          <div className="mt-10 grid gap-6 lg:grid-cols-[1.4fr_1fr]">
            <div className="grid gap-4 sm:grid-cols-3">
              <div className="card rise delay-1 flex h-40 items-center justify-center text-center text-sm uppercase tracking-[0.3em]">
                Photo
              </div>
              <div className="card rise delay-2 flex h-40 items-center justify-center text-center text-sm uppercase tracking-[0.3em]">
                Photo
              </div>
              <div className="card rise delay-3 flex h-40 items-center justify-center text-center text-sm uppercase tracking-[0.3em]">
                Photo
              </div>
            </div>
            <div className="card flex flex-col justify-center gap-4 p-6">
              <div className="text-sm uppercase tracking-[0.3em] text-[color:var(--paprika)]">
                The place
              </div>
              <div className="text-2xl font-semibold text-[color:var(--deep-brown)]">
                Our Home · Natural Bridge, NY
              </div>
              <div className="text-base leading-7 text-[color:var(--brown)]">
                Ceremony at golden hour, disco under the stars, and all the
                comfort foods you love.
              </div>
            </div>
          </div>
        </div>

        <section id="rsvp" className="card rise p-6 sm:p-10">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
            <div className="flex flex-col gap-3">
              <h2 className="font-display text-3xl uppercase tracking-[0.2em] text-[color:var(--deep-brown)]">
                RSVP
              </h2>
              <p className="max-w-lg text-base leading-7 text-[color:var(--brown)]">
                Let us know if you can make it, your guest count, and any notes.
                We cannot wait to celebrate together.
              </p>
              {notice ? (
                <div className="badge bg-white text-[color:var(--paprika)]">
                  {notice}
                </div>
              ) : null}
            </div>
            <RsvpForm action={submitRsvp} />
          </div>
        </section>

        <section id="party" className="card rise p-6 sm:p-10">
          <div className="flex flex-col gap-8">
            <div className="flex flex-col gap-3">
              <h2 className="font-display text-3xl uppercase tracking-[0.2em] text-[color:var(--deep-brown)]">
                Wedding Party
              </h2>
              <p className="max-w-3xl text-base leading-7 text-[color:var(--brown)]">
                Wedding party details, outfits, and color assignments show here
                once you sign in.
              </p>
            </div>

            {!user ? (
              <div className="rounded-2xl border border-dashed border-[color:var(--paprika)] p-6 text-center text-[color:var(--paprika)]">
                Please sign in to see wedding party assignments and shopping
                links.
              </div>
            ) : !isDbReady ? (
              <div className="rounded-2xl border border-dashed border-[color:var(--paprika)] p-6 text-center text-[color:var(--paprika)]">
                Connect the database to load wedding party assignments.
              </div>
            ) : (
              <div className="grid gap-6 lg:grid-cols-[1.1fr_1fr]">
                <div className="flex flex-col gap-4">
                  <div className="text-sm uppercase tracking-[0.3em] text-[color:var(--paprika)]">
                    Your assignment
                  </div>
                  {partyMember ? (
                    <div className="flex flex-col gap-3 rounded-2xl border border-[color:var(--blush)] bg-white/70 p-5">
                      <div className="text-xl font-semibold text-[color:var(--deep-brown)]">
                        {partyMember.name}
                      </div>
                      <div className="text-sm uppercase tracking-[0.3em] text-[color:var(--brown)]">
                        {partyMember.partyRole}
                      </div>
                      <div className="flex items-center gap-3">
                        <span
                          className="h-6 w-6 rounded-full border border-[color:var(--brown)]"
                          style={{ backgroundColor: partyMember.colorHex }}
                        />
                        <span className="text-base text-[color:var(--brown)]">
                          {partyMember.colorName}
                        </span>
                      </div>
                    </div>
                  ) : (
                    <div className="rounded-2xl border border-dashed border-[color:var(--paprika)] p-4 text-[color:var(--paprika)]">
                      You are signed in, but not on the wedding party list yet.
                      Add your email to the party members table to activate.
                    </div>
                  )}

                  <div className="text-sm uppercase tracking-[0.3em] text-[color:var(--paprika)]">
                    What to wear
                  </div>
                  {items.length ? (
                    <div className="grid gap-3">
                      {items.map((item) => (
                        <a
                          key={item.id}
                          className="flex items-center justify-between rounded-2xl border border-[color:var(--blush)] bg-white/70 p-4 transition hover:-translate-y-0.5"
                          href={item.link}
                          target="_blank"
                          rel="noreferrer"
                        >
                          <div>
                            <div className="text-base font-semibold text-[color:var(--deep-brown)]">
                              {item.name}
                            </div>
                            {item.note ? (
                              <div className="text-sm text-[color:var(--brown)]">
                                {item.note}
                              </div>
                            ) : null}
                          </div>
                          <span className="text-sm uppercase tracking-[0.3em] text-[color:var(--paprika)]">
                            Shop
                          </span>
                        </a>
                      ))}
                    </div>
                  ) : (
                    <div className="rounded-2xl border border-dashed border-[color:var(--paprika)] p-4 text-[color:var(--paprika)]">
                      No clothing items have been added for your party yet.
                    </div>
                  )}
                </div>

                <div className="flex flex-col gap-4">
                  <div className="text-sm uppercase tracking-[0.3em] text-[color:var(--paprika)]">
                    Wedding party roster
                  </div>
                  {roster.length ? (
                    <div className="grid gap-3">
                      {roster.map((member) => (
                        <div
                          key={member.id}
                          className="flex items-center justify-between rounded-2xl border border-[color:var(--blush)] bg-white/70 p-4"
                        >
                          <div>
                            <div className="text-base font-semibold text-[color:var(--deep-brown)]">
                              {member.name}
                            </div>
                            <div className="text-xs uppercase tracking-[0.3em] text-[color:var(--brown)]">
                              {member.partyRole}
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <span
                              className="h-5 w-5 rounded-full border border-[color:var(--brown)]"
                              style={{ backgroundColor: member.colorHex }}
                            />
                            <span className="text-xs uppercase tracking-[0.3em] text-[color:var(--brown)]">
                              {member.colorName}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="rounded-2xl border border-dashed border-[color:var(--paprika)] p-4 text-[color:var(--paprika)]">
                      No wedding party members yet. Add them in the database.
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </section>

        <footer className="flex flex-col items-center gap-4 pb-8 text-center text-sm uppercase tracking-[0.4em] text-[color:var(--deep-brown)]">
          <div className="font-display text-2xl tracking-[0.2em]">
            The Tebos
          </div>
          <div className="flex flex-wrap justify-center gap-3">
            {[
              "var(--paprika)",
              "var(--sage)",
              "var(--mustard)",
              "var(--cinnamon)",
              "var(--olive)",
              "var(--blush)",
            ].map((swatch) => (
              <span
                key={swatch}
                className="h-10 w-10 rounded-full border border-[color:var(--brown)]"
                style={{ backgroundColor: `var(${swatch})` }}
              />
            ))}
          </div>
        </footer>
      </div>
    </div>
  );
}
