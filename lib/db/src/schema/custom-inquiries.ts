import { createInsertSchema } from "drizzle-zod";
import { pgTable, text, timestamp, uuid } from "drizzle-orm/pg-core";
import { z } from "zod/v4";

export const customInquiriesTable = pgTable("custom_inquiries", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: text("name").notNull(),
  email: text("email").notNull(),
  country: text("country").notNull(),
  message: text("message").notNull(),
  productSlug: text("product_slug"),
  leatherType: text("leather_type"),
  color: text("color"),
  size: text("size"),
  measurements: text("measurements"),
  status: text("status").notNull().default("received"),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});

export const insertCustomInquirySchema = createInsertSchema(
  customInquiriesTable,
).omit({
  id: true,
  status: true,
  createdAt: true,
});
export type InsertCustomInquiry = z.infer<typeof insertCustomInquirySchema>;
export type CustomInquiryRecord = typeof customInquiriesTable.$inferSelect;
