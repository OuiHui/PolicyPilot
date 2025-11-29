import { Context } from "hono";
import { CaseModel } from "../models/Case";
import { spawn } from "child_process";
import path from "path";
import fs from "fs";
import os from "os";

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

export const analyzeCase = async (c: Context) => {
  try {
    const id = c.req.param("id");
    const userId = c.req.query("userId");

    if (!userId) {
      return c.json({ error: "User ID is required" }, 400);
    }

    const scriptPath = path.join(process.cwd(), "src", "rag", "pipeline.py");
    const venvPythonPath = path.join(process.cwd(), "venv", "bin", "python");

    console.log(`🚀 Starting RAG analysis for case ${id}...`);

    return new Promise((resolve, reject) => {
      const pythonProcess = spawn(venvPythonPath, [
        scriptPath,
        "--caseId", id,
        "--userId", userId
      ]);

      let dataString = "";
      let errorString = "";

      pythonProcess.stdout.on("data", (data) => {
        dataString += data.toString();
      });

      pythonProcess.stderr.on("data", (data) => {
        errorString += data.toString();
        console.error(`[Python Stderr]: ${data}`);
      });

      pythonProcess.on("close", (code) => {
        if (code !== 0) {
          console.error(`Python script exited with code ${code}`);
          resolve(c.json({ error: "Analysis failed", details: errorString }, 500));
          return;
        }

        try {
          const result = JSON.parse(dataString);
          if (result.error) {
            resolve(c.json({ error: result.error }, 400));
          } else {
            resolve(c.json(result));
          }
        } catch (e) {
          console.error("Failed to parse Python output:", dataString);
          resolve(c.json({ error: "Invalid response from analysis engine" }, 500));
        }
      });
    }) as Promise<Response>;

  } catch (e: any) {
    console.error('❌ Error analyzing case:', e);
    return c.json({ error: e.message }, 500);
  }
};

export const extractDenial = async (c: Context) => {
  try {
    const id = c.req.param("id");
    
    // Get case to find denial files
    const caseData = await CaseModel.findOne({ id });
    if (!caseData) {
      return c.json({ error: "Case not found" }, 404);
    }

    if (!caseData.denialFiles || caseData.denialFiles.length === 0) {
      return c.json({ error: "No denial files found for this case" }, 400);
    }

    // Create temp directory for files
    const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), "denial-extract-"));
    const filePaths: string[] = [];

    // Process denial files - either from Supabase or MongoDB
    for (const fileData of caseData.denialFiles) {
      const fileName = fileData.name || `denial_${Date.now()}.pdf`;
      const filePath = path.join(tempDir, fileName);

      if (fileData.data) {
        // MongoDB binary data
        fs.writeFileSync(filePath, Buffer.from(fileData.data));
        filePaths.push(filePath);
      } else if (fileData.path) {
        // Supabase - would need to download, but for now skip
        console.log("Supabase files not yet supported for denial extraction");
      }
    }

    if (filePaths.length === 0) {
      return c.json({ error: "No processable denial files found" }, 400);
    }

    const scriptPath = path.join(process.cwd(), "src", "rag", "pipeline.py");
    const venvPythonPath = path.join(process.cwd(), "venv", "bin", "python");

    console.log(`🚀 Starting Denial Extraction for case ${id} with ${filePaths.length} files...`);

    return new Promise((resolve, reject) => {
      const pythonProcess = spawn(venvPythonPath, [
        scriptPath,
        "--mode", "denial_extract",
        "--files", ...filePaths
      ]);

      let dataString = "";
      let errorString = "";

      pythonProcess.stdout.on("data", (data) => {
        dataString += data.toString();
      });

      pythonProcess.stderr.on("data", (data) => {
        errorString += data.toString();
        console.error(`[Python Stderr]: ${data}`);
      });

      pythonProcess.on("close", (code) => {
        // Cleanup temp files
        try {
          fs.rmSync(tempDir, { recursive: true, force: true });
        } catch (cleanupErr) {
          console.error("Failed to cleanup temp dir:", cleanupErr);
        }

        if (code !== 0) {
          console.error(`Python script exited with code ${code}`);
          resolve(c.json({ error: "Denial extraction failed", details: errorString }, 500));
          return;
        }

        try {
          const result = JSON.parse(dataString);
          if (result.error) {
            resolve(c.json({ error: result.error }, 400));
          } else {
            resolve(c.json(result));
          }
        } catch (e) {
          console.error("Failed to parse Python output:", dataString);
          resolve(c.json({ error: "Invalid response from extraction engine" }, 500));
        }
      });
    }) as Promise<Response>;

  } catch (e: any) {
    console.error('❌ Error extracting denial:', e);
    return c.json({ error: e.message }, 500);
  }
};
