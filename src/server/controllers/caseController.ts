import { Context } from "hono";
import { CaseModel } from "../models/Case";

export const getCases = async (c: Context) => {
  try {
    const userId = c.req.query("userId");
    const filter = userId ? { userId } : {};
    const cases = await CaseModel.find(filter);
    console.log(`📋 Retrieved ${cases.length} cases for user ${userId}`);
    if (cases.length > 0) {
      console.log('First case files count:', cases[0].denialFiles?.length || 0);
    }
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
    const contentType = c.req.header("content-type") || "";

    let denialFiles = [];

    if (contentType.includes("application/json")) {
      // New way: Supabase metadata (supports 100MB+ files)
      const body = await c.req.json();
      denialFiles = body.denialFiles || [];
      console.log('📦 Supabase upload - Received metadata:', denialFiles);
    } else {
      // Old way: Direct upload (limited to 4.5MB on Vercel)
      const body = await c.req.parseBody();
      const files = body["denialFiles[]"];
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
      console.log('💾 Direct upload - Processed files:', denialFiles.length);
    }

    const updatedCase = await CaseModel.findOneAndUpdate(
      { id },
      { $push: { denialFiles: { $each: denialFiles } }, status: "analyzing" },
      { new: true }
    );

    if (!updatedCase) {
      return c.json({ error: "Case not found" }, 404);
    }

    console.log('✅ Case updated with files. Total files:', updatedCase.denialFiles?.length);
    return c.json(updatedCase);
  } catch (e: any) {
    console.error('❌ Error uploading files:', e);
    return c.json({ error: e.message }, 500);
  }
};

export const updateCase = async (c: Context) => {
  try {
    const id = c.req.param("id");
    const body = await c.req.json();

    const updatedCase = await CaseModel.findOneAndUpdate(
      { id },
      body,
      { new: true }
    );

    if (!updatedCase) {
      return c.json({ error: "Case not found" }, 404);
    }

    console.log('📝 Case updated:', id);
    return c.json(updatedCase);
  } catch (e: any) {
    console.error('❌ Error updating case:', e);
    return c.json({ error: e.message }, 500);
  }
};

export const deleteCase = async (c: Context) => {
  try {
    const id = c.req.param("id");
    const deletedCase = await CaseModel.findOneAndDelete({ id });
    if (!deletedCase) {
      return c.json({ error: "Case not found" }, 404);
    }
    return c.json({ message: "Case deleted successfully" });
  } catch (e: any) {
    return c.json({ error: e.message }, 500);
  }
};
