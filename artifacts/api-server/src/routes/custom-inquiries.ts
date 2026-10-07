import { Router, type IRouter } from "express";
import { db, customInquiriesTable } from "@workspace/db";
import {
  CreateCustomInquiryBody,
  CreateCustomInquiryResponse,
} from "@workspace/api-zod";

const router: IRouter = Router();

router.post("/custom-inquiries", async (req, res): Promise<void> => {
  const parsed = CreateCustomInquiryBody.safeParse(req.body);
  if (!parsed.success) {
    req.log.warn({ errors: parsed.error.issues }, "Invalid custom inquiry");
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const [inquiry] = await db
    .insert(customInquiriesTable)
    .values({
      ...parsed.data,
      productSlug: parsed.data.productSlug ?? null,
      leatherType: parsed.data.leatherType ?? null,
      color: parsed.data.color ?? null,
      size: parsed.data.size ?? null,
      measurements: parsed.data.measurements ?? null,
    })
    .returning({
      id: customInquiriesTable.id,
      status: customInquiriesTable.status,
      createdAt: customInquiriesTable.createdAt,
    });

  res.status(201).json(
    CreateCustomInquiryResponse.parse({
      ...inquiry,
      createdAt: inquiry.createdAt.toISOString(),
    }),
  );
});

export default router;
