import Image from "next/image";
import { redirect } from "next/navigation";
import { asc, eq } from "drizzle-orm";
import RsvpForm from "@/app/components/RsvpForm";
import { db } from "@/db";
import { clothingItems, partyMembers, rsvps } from "@/db/schema";

type HomeProps = {
  searchParams?: Promise<{ rsvp?: string }>;
};

const partyColorOrder = [
  "olive",
  "paprika",
  "butterscotch",
  "moss green",
  "cinnamon",
  "mai tai",
];

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
  } catch {
    redirect("/?rsvp=error#rsvp");
  }

  redirect("/?rsvp=thanks#rsvp");
}

function comparePartyMembersByColor<
  T extends { colorName: string; name: string },
>(left: T, right: T) {
  const leftColor = left.colorName.trim().toLowerCase();
  const rightColor = right.colorName.trim().toLowerCase();
  const leftIndex = partyColorOrder.indexOf(leftColor);
  const rightIndex = partyColorOrder.indexOf(rightColor);
  const normalizedLeftIndex =
    leftIndex === -1 ? partyColorOrder.length : leftIndex;
  const normalizedRightIndex =
    rightIndex === -1 ? partyColorOrder.length : rightIndex;

  if (normalizedLeftIndex !== normalizedRightIndex) {
    return normalizedLeftIndex - normalizedRightIndex;
  }

  return left.name.localeCompare(right.name);
}

export default async function Home({ searchParams }: HomeProps) {
  const resolvedSearchParams = searchParams ? await searchParams : undefined;
  const registryUrl =
    process.env.NEXT_PUBLIC_REGISTRY_URL ||
    "https://www.amazon.com/wedding/registry";
  const groomsmen = db
    ? await db
        .select()
        .from(partyMembers)
        .where(eq(partyMembers.partyRole, "groomsman"))
        .orderBy(asc(partyMembers.name))
    : [];

  const bridesmaids = db
    ? await db
        .select()
        .from(partyMembers)
        .where(eq(partyMembers.partyRole, "bridesmaid"))
        .orderBy(asc(partyMembers.name))
    : [];

  const groomsmanItems = db
    ? await db
        .select()
        .from(clothingItems)
        .where(eq(clothingItems.partyRole, "groomsman"))
        .orderBy(asc(clothingItems.name))
    : [];

  const bridesmaidItems = db
    ? await db
        .select()
        .from(clothingItems)
        .where(eq(clothingItems.partyRole, "bridesmaid"))
        .orderBy(asc(clothingItems.name))
    : [];
  const orderedGroomsmen = [...groomsmen].sort(comparePartyMembersByColor);
  const orderedBridesmaids = [...bridesmaids].sort(comparePartyMembersByColor);

  const notice = resolvedSearchParams?.rsvp
    ? rsvpNotice[resolvedSearchParams.rsvp]
    : null;
  const isDbReady = Boolean(db);

  return (
    <div className="sunburst min-h-screen">
      <div className="mx-auto flex min-h-screen max-w-6xl flex-col gap-10 px-6 py-10">
        <div className="paper rise p-6 sm:p-10">
          <header className="flex flex-col gap-8">
            <div className="flex flex-wrap justify-center gap-3">
              <a className="btn btn-primary min-w-32" href="#rsvp">
                RSVP
              </a>
              <a
                className="btn btn-secondary min-w-32"
                href={registryUrl}
                target="_blank"
                rel="noreferrer"
              >
                Registry
              </a>
              <a className="btn btn-secondary min-w-40" href="#party">
                Wedding Party
              </a>
            </div>

            <div className="flex flex-col items-center gap-4 text-center">
              <h1 className="font-display text-5xl text-[color:var(--paprika)] sm:text-6xl lg:text-7xl">
                Rebecca & Kase
              </h1>
              <p className="max-w-3xl text-lg leading-8 text-[color:var(--brown)] sm:text-xl">
                A retro 70s disco celebration. Join us as we disco down the
                aisle and groove into the night.
              </p>
            </div>
          </header>

          <div className="mt-10 grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="card rise delay-1 relative min-h-72 overflow-hidden p-0 sm:row-span-2 sm:min-h-full">
                <Image
                  src="/1.jpg"
                  alt="Rebecca and Kase photo 1"
                  fill
                  className="object-cover"
                  sizes="(max-width: 639px) 100vw, (max-width: 1023px) 50vw, 38vw"
                  priority
                />
              </div>
              <div className="card rise delay-2 relative h-52 overflow-hidden p-0 sm:h-56">
                <Image
                  src="/2.jpg"
                  alt="Rebecca and Kase photo 2"
                  fill
                  className="object-cover"
                  sizes="(max-width: 639px) 100vw, (max-width: 1023px) 50vw, 20vw"
                />
              </div>
              <div className="card rise delay-3 relative h-52 overflow-hidden p-0 sm:h-56">
                <Image
                  src="/3.jpg"
                  alt="Rebecca and Kase photo 3"
                  fill
                  className="object-cover"
                  sizes="(max-width: 639px) 100vw, (max-width: 1023px) 50vw, 20vw"
                />
              </div>
            </div>
            <div className="grid gap-4">
              <div className="card flex flex-col gap-3 p-6">
                <div className="text-sm uppercase tracking-[0.3em] text-[color:var(--paprika)]">
                  The Date
                </div>
                <div className="font-display text-3xl text-[color:var(--paprika)]">
                  June 6, 2026
                </div>
                <div className="text-base leading-7 text-[color:var(--brown)]">
                  Guests arrive at 3:00 PM, ceremony at golden hour, then dinner
                  and dancing into the night.
                </div>
              </div>
              <div className="card flex flex-col gap-3 p-6">
                <div className="text-sm uppercase tracking-[0.3em] text-[color:var(--paprika)]">
                  The Place
                </div>
                <div className="font-display text-3xl text-[color:var(--paprika)]">
                  Our Home
                </div>
                <div className="text-base leading-7 text-[color:var(--brown)]">
                  Natural Bridge, NY
                  <br />
                  41922 CR 41
                </div>
              </div>
              <div className="rounded-3xl border border-[color:rgba(79,54,36,0.12)] bg-white/55 px-5 py-4 text-sm uppercase tracking-[0.28em] text-[color:var(--brown)]">
                Cozy dinner. Comfort food. Disco after dark.
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
                Meet the wedding party and see the assigned colors and attire
                for each side of the celebration.
              </p>
            </div>

            {!isDbReady ? (
              <div className="rounded-2xl border border-dashed border-[color:var(--paprika)] p-6 text-center text-[color:var(--paprika)]">
                Connect the database to load wedding party details.
              </div>
            ) : (
              <div className="grid gap-6 lg:grid-cols-2">
                <div className="flex flex-col gap-4">
                  <div className="text-sm uppercase tracking-[0.3em] text-[color:var(--paprika)]">
                    Groomsmen
                  </div>
                  {orderedGroomsmen.length ? (
                    <div className="grid gap-3">
                      {orderedGroomsmen.map((member) => (
                        <div
                          key={member.id}
                          className="flex items-center justify-between rounded-2xl border border-[color:var(--blush)] bg-white/70 p-4"
                        >
                          <div className="text-base font-semibold text-[color:var(--deep-brown)]">
                            {member.name}
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
                      No groomsmen have been added yet.
                    </div>
                  )}

                  <div className="text-sm uppercase tracking-[0.3em] text-[color:var(--paprika)]">
                    Groomsmen Attire
                  </div>
                  {groomsmanItems.length ? (
                    <div className="grid gap-3">
                      {groomsmanItems.map((item) =>
                        item.link ? (
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
                        ) : (
                          <div
                            key={item.id}
                            className="rounded-2xl border border-[color:var(--blush)] bg-white/70 p-4"
                          >
                            <div className="text-base font-semibold text-[color:var(--deep-brown)]">
                              {item.name}
                            </div>
                            {item.note ? (
                              <div className="mt-1 text-sm text-[color:var(--brown)]">
                                {item.note}
                              </div>
                            ) : null}
                          </div>
                        ),
                      )}
                    </div>
                  ) : (
                    <div className="rounded-2xl border border-dashed border-[color:var(--paprika)] p-4 text-[color:var(--paprika)]">
                      No groomsmen clothing items have been added yet.
                    </div>
                  )}
                </div>

                <div className="flex flex-col gap-4">
                  <div className="text-sm uppercase tracking-[0.3em] text-[color:var(--paprika)]">
                    Bridesmaids
                  </div>
                  {orderedBridesmaids.length ? (
                    <div className="grid gap-3">
                      {orderedBridesmaids.map((member) => (
                        <div
                          key={member.id}
                          className="flex items-center justify-between rounded-2xl border border-[color:var(--blush)] bg-white/70 p-4"
                        >
                          <div className="text-base font-semibold text-[color:var(--deep-brown)]">
                            {member.name}
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
                      No bridesmaids have been added yet.
                    </div>
                  )}

                  <div className="text-sm uppercase tracking-[0.3em] text-[color:var(--paprika)]">
                    Bridesmaid Attire
                  </div>
                  {bridesmaidItems.length ? (
                    <div className="grid gap-3">
                      {bridesmaidItems.map((item) =>
                        item.link ? (
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
                        ) : (
                          <div
                            key={item.id}
                            className="rounded-2xl border border-[color:var(--blush)] bg-white/70 p-4"
                          >
                            <div className="text-base font-semibold text-[color:var(--deep-brown)]">
                              {item.name}
                            </div>
                            {item.note ? (
                              <div className="mt-1 text-sm text-[color:var(--brown)]">
                                {item.note}
                              </div>
                            ) : null}
                          </div>
                        ),
                      )}
                    </div>
                  ) : (
                    <div className="rounded-2xl border border-dashed border-[color:var(--paprika)] p-4 text-[color:var(--paprika)]">
                      No bridesmaid clothing items have been added yet.
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
