import { Context } from "hono";
import { CaseModel } from "../models/Case";

export const getCases = async (c: Context) => {
  try {
    const userId = c.req.query("userId");
    const filter = userId ? { userId } : {};
    const cases = await CaseModel.find(filter);
    return c.json(cases);
  } catch (e: any) {
    return c.json({ error: e.message }, 500);
  }
};

export const createCase = async (c: Context) => {
  try {
    const body = await c.req.json();
    const newCase = new CaseModel(body);
    await newCase.save();
    return c.json(newCase, 201);
  } catch (e: any) {
    return c.json({ error: e.message }, 400);
  }
};

export const uploadDenialFiles = async (c: Context) => {
  try {
    const id = c.req.param("id");
    const body = await c.req.parseBody();
    const files = body["denialFiles[]"];

    const denialFiles = [];
    const fileList = Array.isArray(files) ? files : files ? [files] : [];

    for (const file of fileList) {
      if (file instanceof File) {
        const buffer = await file.arrayBuffer();
        denialFiles.push({
          name: file.name,
          size: file.size,
          type: file.type,
          lastModified: file.lastModified,
          data: Buffer.from(buffer),
        });
      }
    }

    const updatedCase = await CaseModel.findOneAndUpdate(
      { id },
      { $push: { denialFiles: { $each: denialFiles } }, status: "analyzing" },
      { new: true }
    );

    if (!updatedCase) {
      return c.json({ error: "Case not found" }, 404);
    }

    return c.json(updatedCase);
  } catch (e: any) {
    console.error(e);
    return c.json({ error: e.message }, 500);
  }
};
