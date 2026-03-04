import { sql } from "drizzle-orm";
import {
  pgEnum,
  pgTable,
  serial,
  text,
  integer,
  boolean,
  timestamp,
  varchar,
  jsonb,
} from "drizzle-orm/pg-core";

export const partyRoleEnum = pgEnum("party_role", [
  "bridesmaid",
  "groomsman",
  "other",
]);

export const rsvps = pgTable("rsvps", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  email: varchar("email", { length: 256 }).notNull(),
  phone: varchar("phone", { length: 32 }),
  attending: boolean("attending").notNull().default(true),
  guests: integer("guests").notNull().default(1),
  guestNames: jsonb("guest_names")
    .$type<string[]>()
    .notNull()
    .default(sql`'[]'::jsonb`),
  dietaryRestrictions: text("dietary_restrictions"),
  message: text("message"),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});

export const partyMembers = pgTable("party_members", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  email: varchar("email", { length: 256 }),
  clerkUserId: varchar("clerk_user_id", { length: 256 }),
  partyRole: partyRoleEnum("party_role").notNull().default("other"),
  colorName: varchar("color_name", { length: 64 }).notNull(),
  colorHex: varchar("color_hex", { length: 16 }).notNull(),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});

export const clothingItems = pgTable("clothing_items", {
  id: serial("id").primaryKey(),
  partyRole: partyRoleEnum("party_role").notNull(),
  name: text("name").notNull(),
  link: text("link").notNull(),
  note: text("note"),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});
