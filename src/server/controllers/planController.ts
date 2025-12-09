import { Context } from "hono";
import { InsurancePlanModel } from "../models/InsurancePlan";
import fs from "fs";
import path from "path";
import os from "os";
import { spawn } from "child_process";
import { supabaseServer } from "../supabase/client";
import * as modal from "../utils/modal_client";

// Check if running on Vercel (Python not available in serverless)
const isVercel = process.env.VERCEL === '1' || process.env.VERCEL === 'true';

// Check if Modal is configured
const hasModal = !!process.env.MODAL_API_URL;

// Helper to check if we should use Modal (Vercel + Modal configured)
const useModal = () => isVercel && hasModal;

export const getPlans = async (c: Context) => {
  try {
    const userId = c.req.query("userId");
    const filter = userId ? { userId } : {};
    const plans = await InsurancePlanModel.find(filter);
    return c.json(plans);
  } catch (e: any) {
    return c.json({ error: e.message }, 500);
  }
};

export const createPlan = async (c: Context) => {
  try {
    const contentType = c.req.header("content-type") || "";
    let planData;

    if (contentType.includes("application/json")) {
      // New way: Supabase metadata (supports 100MB+ files)
      const body = await c.req.json();
      planData = body;
    } else {
      // Old way: Direct upload (limited to 4.5MB on Vercel)
      const body = await c.req.parseBody();
      const files = body["policyFiles[]"];

      // Handle files
      const policyFiles = [];
      const fileList = Array.isArray(files) ? files : files ? [files] : [];

      for (const file of fileList) {
        if (file instanceof File) {
          const buffer = await file.arrayBuffer();
          policyFiles.push({
            name: file.name,
            size: file.size,
            type: file.type,
            lastModified: file.lastModified,
            data: Buffer.from(buffer),
          });
        }
      }

      // Parse other fields (they come as strings in multipart)
      planData = {
        id: body.id as string,
        userId: body.userId as string,
        insuranceCompany: body.insuranceCompany as string,
        planName: body.planName as string,
        policyNumber: body.policyNumber as string,

        policyType: body.policyType as string,
        dateAdded: body.dateAdded as string,
        coveredIndividuals: body.coveredIndividuals ? JSON.parse(body.coveredIndividuals as string) : [],
        policyFiles,
      };
    }

    const plan = new InsurancePlanModel(planData);
    await plan.save();
    console.log('✅ Insurance plan created with', plan.policyFiles?.length || 0, 'policy files');
    return c.json(plan, 201);
  } catch (e: any) {
    console.error('❌ Error creating plan:', e);
    return c.json({ error: e.message }, 400);
  }
};

export const deletePlan = async (c: Context) => {
  try {
    const id = c.req.param("id");

    // Find plan first to get files
    const planToDelete = await InsurancePlanModel.findOne({ id });

    if (!planToDelete) {
      return c.json({ error: "Plan not found" }, 404);
    }

    // Delete files from Supabase if they exist
    if (planToDelete.policyFiles && planToDelete.policyFiles.length > 0 && supabaseServer) {
      console.log(`🗑️ Deleting ${planToDelete.policyFiles.length} files for plan ${id}`);

      for (const file of planToDelete.policyFiles) {
        if (file.path) {
          try {
            const bucket = file.bucket || "policies";
            const { error } = await supabaseServer.storage
              .from(bucket)
              .remove([file.path]);

            if (error) {
              console.error(`❌ Error deleting file ${file.path} from Supabase:`, error);
            } else {
              console.log(`✅ Deleted file from Supabase: ${file.path}`);
            }
          } catch (err) {
            console.error(`❌ Exception deleting file ${file.path}:`, err);
          }
        }
      }
    }

    const plan = await InsurancePlanModel.findOneAndDelete({ id });
    return c.json({ message: "Plan deleted successfully" });
  } catch (e: any) {
    return c.json({ error: e.message }, 500);
  }
};

export const updatePlan = async (c: Context) => {
  try {
    const id = c.req.param("id");
    const updates = await c.req.json();

    const plan = await InsurancePlanModel.findOneAndUpdate(
      { id },
      { $set: updates },
      { new: true }
    );

    if (!plan) {
      return c.json({ error: "Plan not found" }, 404);
    }

    return c.json(plan);
  } catch (e: any) {
    return c.json({ error: e.message }, 500);
  }
};

export const extractPlanDetails = async (c: Context) => {
  try {
    const body = await c.req.parseBody();
    const files = body["files[]"];
    const fileList = Array.isArray(files) ? files : files ? [files] : [];

    if (fileList.length === 0) {
      return c.json({ error: "No files uploaded" }, 400);
    }

    // On Vercel: use Modal if configured
    if (isVercel) {
      if (useModal()) {
        console.log(`🚀 Calling Modal for plan extraction with ${fileList.length} files`);

        // Convert files to base64
        const filesData: modal.FileData[] = [];
        for (const file of fileList) {
          if (file instanceof File) {
            const buffer = await file.arrayBuffer();
            const base64 = Buffer.from(buffer).toString('base64');
            filesData.push({
              name: file.name,
              data: base64
            });
          }
        }

        const result = await modal.extractPlanViaModal(filesData);
        if (result.error) {
          return c.json({ error: result.error }, 500);
        }
        return c.json(result.data);
      }

      return c.json({
        error: "Plan extraction requires MODAL_API_URL to be configured. Please set it in Vercel environment variables.",
        isVercelLimitation: true
      }, 501);
    }

    // Local: use Python
    // Create temp directory
    const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), "plan-extract-"));
    const filePaths: string[] = [];

    // Save files to temp dir
    for (const file of fileList) {
      if (file instanceof File) {
        const filePath = path.join(tempDir, file.name);
        const buffer = await file.arrayBuffer();
        fs.writeFileSync(filePath, Buffer.from(buffer));
        filePaths.push(filePath);
      }
    }

    if (filePaths.length === 0) {
      return c.json({ error: "No valid files processed" }, 400);
    }

    const scriptPath = path.join(process.cwd(), "src", "rag", "pipeline.py");
    // Determine Python executable path
    let pythonPath = "python"; // Default to system python
    if (process.platform === "win32") {
      const venvPath = path.join(process.cwd(), "venv", "Scripts", "python.exe");
      if (fs.existsSync(venvPath)) {
        pythonPath = venvPath;
      }
    } else {
      const venvPath = path.join(process.cwd(), "venv", "bin", "python");
      if (fs.existsSync(venvPath)) {
        pythonPath = venvPath;
      }
    }

    console.log(`🚀 Starting Plan Extraction for ${filePaths.length} files using ${pythonPath}...`);

    // Prepare environment variables for Python process
    const pythonEnv = {
      ...process.env,
      MONGODB_URI: process.env.MONGODB_URI || "mongodb://localhost:27017/policypilot",
      GEMINI_API_KEY: process.env.GEMINI_API_KEY,
      VITE_SUPABASE_URL: process.env.VITE_SUPABASE_URL,
      VITE_SUPABASE_ANON_KEY: process.env.VITE_SUPABASE_ANON_KEY,
    };

    return new Promise((resolve, reject) => {
      const pythonProcess = spawn(pythonPath, [
        scriptPath,
        "--mode", "extraction",
        "--files", ...filePaths
      ], {
        env: pythonEnv,
        cwd: process.cwd() // Ensure working directory is project root
      });

      // CRITICAL: Handle spawn errors (like ENOENT) to prevent server crash
      pythonProcess.on('error', (err) => {
        console.error('❌ Failed to start Python process:', err);
        // Cleanup temp files on error
        try {
          fs.rmSync(tempDir, { recursive: true, force: true });
        } catch (cleanupErr) {
          console.error("Failed to cleanup temp dir:", cleanupErr);
        }
        resolve(c.json({ error: "Failed to start extraction engine. Please check Python installation.", details: err.message }, 500));
      });

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
          resolve(c.json({ error: "Extraction failed", details: errorString }, 500));
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
    console.error('❌ Error extracting plan details:', e);
    return c.json({ error: e.message }, 500);
  }
};
