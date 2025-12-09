import { Context } from "hono";
import { CaseModel } from "../models/Case";
import { spawn } from "child_process";
import path from "path";
import fs from "fs";
import os from "os";
import { supabaseServer } from "../supabase/client";
import dotenv from "dotenv";
import * as gemini from "../utils/gemini_client";
import * as modal from "../utils/modal_client";

// Load environment variables
dotenv.config();

// Check if running on Vercel (Python not available in serverless)
const isVercel = process.env.VERCEL === '1' || process.env.VERCEL === 'true';

// Check if Modal is configured
const hasModal = !!process.env.MODAL_API_URL;

// Helper to check if we should use Modal (Vercel + Modal configured)
const useModal = () => isVercel && hasModal;

// Helper to return error for Python-dependent features when no fallback available
const pythonNotAvailable = (c: Context, feature: string) => {
  console.warn(`⚠️ ${feature} requires Python which is not available on Vercel`);
  return c.json({
    error: `${feature} is not available in the cloud deployment. Please set MODAL_API_URL or use the local development environment.`,
    isVercelLimitation: true
  }, 501);
};

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

export const getCaseById = async (c: Context) => {
  try {
    const id = c.req.param("id");
    const caseItem = await CaseModel.findOne({ id });

    if (!caseItem) {
      return c.json({ error: "Case not found" }, 404);
    }

    return c.json(caseItem);
  } catch (e: any) {
    return c.json({ error: e.message }, 500);
  }
};

export const createCase = async (c: Context) => {
  try {
    const body = await c.req.json();
    const newCase = new CaseModel(body);
    await newCase.save();
    console.log(`✅ Case created and saved to MongoDB: ${newCase.id}`);
    // Verify it was saved
    const verifyCase = await CaseModel.findOne({ id: newCase.id });
    if (verifyCase) {
      console.log(`✅ Verified case exists in MongoDB: ${verifyCase.id}`);
    } else {
      console.error(`❌ Case not found after save: ${newCase.id}`);
    }
    return c.json(newCase, 201);
  } catch (e: any) {
    console.error('❌ Error creating case:', e);
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
      {
        $push: { denialFiles: { $each: denialFiles } },
        status: "analyzing",
        // Clear cached AI results when new files are uploaded
        $unset: {
          parsedData: "",
          denialReasonTitle: "",
          analysis: "",
          emailDraft: ""
        }
      },
      { new: true }
    );

    if (!updatedCase) {
      return c.json({ error: "Case not found" }, 404);
    }

    console.log('✅ Case updated with files. Total files:', updatedCase.denialFiles?.length);

    // TRIGGER INGESTION IN BACKGROUND
    // We don't await this because we want to return the response quickly.
    // The user will see "Analyzing" status which is fine.
    // Actually, we should probably update status to 'analyzing' (already done above)
    // and then the analysis step will be fast.

    // Determine Python executable path (reused logic)
    let pythonPath = "python";
    if (process.platform === "win32") {
      const venvPath = path.join(process.cwd(), "venv", "Scripts", "python.exe");
      if (fs.existsSync(venvPath)) pythonPath = venvPath;
    } else {
      const venvPath = path.join(process.cwd(), "venv", "bin", "python");
      if (fs.existsSync(venvPath)) pythonPath = venvPath;
    }

    const scriptPath = path.join(process.cwd(), "src", "rag", "pipeline.py");
    const pythonEnv = {
      ...process.env,
      MONGODB_URI: process.env.MONGODB_URI || "mongodb://localhost:27017/policypilot",
      GEMINI_API_KEY: process.env.GEMINI_API_KEY,
      VITE_SUPABASE_URL: process.env.VITE_SUPABASE_URL,
      VITE_SUPABASE_ANON_KEY: process.env.VITE_SUPABASE_ANON_KEY,
    };

    console.log(`🚀 Triggering background ingestion for case ${id}...`);
    const ingestProcess = spawn(pythonPath, [
      scriptPath,
      "--mode", "ingest",
      "--caseId", id,
      "--userId", updatedCase.userId // We need userId. It's in updatedCase.
    ], {
      env: pythonEnv,
      cwd: process.cwd(),
      detached: true, // Let it run even if parent exits (though here parent is server)
      stdio: 'ignore' // Ignore output for background process
    });
    ingestProcess.unref(); // Don't wait for it

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

    // If denialFiles are being updated, clear cached AI results
    const updateQuery = { ...body };
    if (body.denialFiles) {
      updateQuery.$unset = {
        parsedData: "",
        denialReasonTitle: "",
        analysis: "",
        emailDraft: ""
      };
    }

    const updatedCase = await CaseModel.findOneAndUpdate(
      { id },
      updateQuery,
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

    // Find case first to get files
    const caseToDelete = await CaseModel.findOne({ id });

    if (!caseToDelete) {
      return c.json({ error: "Case not found" }, 404);
    }

    // Delete files from Supabase if they exist
    if (caseToDelete.denialFiles && caseToDelete.denialFiles.length > 0 && supabaseServer) {
      console.log(`🗑️ Deleting ${caseToDelete.denialFiles.length} files for case ${id}`);

      for (const file of caseToDelete.denialFiles) {
        if (file.path) {
          try {
            const bucket = file.bucket || "denials";
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

    const deletedCase = await CaseModel.findOneAndDelete({ id });
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

    // Check cache first
    const existingCase = await CaseModel.findOne({ id });
    if (existingCase?.analysis?.analysis) {
      console.log(`🧠 Returning cached analysis for case ${id}`);
      return c.json(existingCase.analysis);
    }

    // On Vercel: try Modal API if configured
    if (isVercel) {
      if (useModal()) {
        console.log(`🚀 Calling Modal for case analysis: case ${id}`);
        const result = await modal.analyzeCaseViaModal(id, userId);
        if (result.error) {
          return c.json({ error: result.error }, 500);
        }
        // Cache the result
        if (result.data) {
          await CaseModel.findOneAndUpdate(
            { id },
            { analysis: result.data }
          );
        }
        return c.json(result.data);
      }
      return pythonNotAvailable(c, "Case analysis");
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

    console.log(`🚀 Starting RAG analysis for case ${id} using ${pythonPath}...`);

    // Prepare environment variables for Python process
    const pythonEnv = {
      ...process.env,
      MONGODB_URI: process.env.MONGODB_URI || "mongodb://localhost:27017/policypilot",
      GEMINI_API_KEY: process.env.GEMINI_API_KEY,
      VITE_SUPABASE_URL: process.env.VITE_SUPABASE_URL,
      VITE_SUPABASE_ANON_KEY: process.env.VITE_SUPABASE_ANON_KEY,
    };

    console.log("DEBUG: Python Env Vars:");
    console.log("MONGODB_URI:", pythonEnv.MONGODB_URI ? pythonEnv.MONGODB_URI.replace(/:([^:@]+)@/, ":****@") : "undefined");
    console.log("GEMINI_API_KEY:", pythonEnv.GEMINI_API_KEY ? "Set" : "Not Set");

    return new Promise((resolve, reject) => {
      const pythonProcess = spawn(pythonPath, [
        scriptPath,
        "--caseId", id,
        "--userId", userId
      ], {
        env: pythonEnv,
        cwd: process.cwd() // Ensure working directory is project root
      });

      // CRITICAL: Handle spawn errors (like ENOENT) to prevent server crash
      pythonProcess.on('error', (err) => {
        console.error('❌ Failed to start Python process:', err);
        resolve(c.json({ error: "Failed to start analysis engine. Please check Python installation.", details: err.message }, 500));
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
            // Save result to DB
            CaseModel.findOneAndUpdate(
              { id },
              { analysis: result },
              { new: true }
            ).then(() => console.log(`💾 Saved analysis to DB for case ${id}`))
              .catch(err => console.error(`❌ Failed to save analysis to DB: ${err}`));

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

export const generateEmail = async (c: Context) => {
  try {
    const id = c.req.param("id");
    const userId = c.req.query("userId");

    if (!userId) {
      return c.json({ error: "User ID is required" }, 400);
    }

    // Check cache first
    const existingCase = await CaseModel.findOne({ id });
    if (existingCase?.emailDraft?.body) {
      console.log(`🧠 Returning cached email draft for case ${id}`);
      return c.json({ emailDraft: existingCase.emailDraft });
    }

    // On Vercel: try Modal API if configured
    if (isVercel) {
      if (useModal()) {
        console.log(`🚀 Calling Modal for email generation: case ${id}`);
        const result = await modal.generateEmailViaModal(id, userId);
        if (result.error) {
          return c.json({ error: result.error }, 500);
        }
        // Cache the result
        if (result.data?.emailDraft) {
          await CaseModel.findOneAndUpdate(
            { id },
            { emailDraft: result.data.emailDraft }
          );
        }
        return c.json(result.data);
      }
      return pythonNotAvailable(c, "Email generation");
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

    console.log(`🚀 Starting Email Generation for case ${id} using ${pythonPath}...`);

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
        "--mode", "email_draft",
        "--caseId", id,
        "--userId", userId
      ], {
        env: pythonEnv,
        cwd: process.cwd()
      });

      let dataString = "";
      let errorString = "";

      // CRITICAL: Handle spawn errors (like ENOENT) to prevent server crash
      pythonProcess.on('error', (err) => {
        console.error('❌ Failed to start Python process:', err);
        resolve(c.json({ error: "Failed to start analysis engine. Please check Python installation.", details: err.message }, 500));
      });

      pythonProcess.stdout.on("data", (data) => {
        dataString += data.toString();
      });

      pythonProcess.stderr.on("data", (data) => {
        errorString += data.toString();
        console.error(`[Python Stderr]: ${data}`);
      });

      pythonProcess.on("close", async (code) => {
        if (code !== 0) {
          console.error(`Python script exited with code ${code}`);
          resolve(c.json({ error: "Email generation failed", details: errorString }, 500));
          return;
        }

        try {
          const result = JSON.parse(dataString);
          if (result.error) {
            resolve(c.json({ error: result.error }, 400));
          } else {
            // --- TEMPLATING LOGIC START ---
            // Fetch additional data for the template
            const caseData = await CaseModel.findOne({ id });
            const { InsurancePlanModel } = require("../models/InsurancePlan");
            const { UserModel } = require("../models/User");

            const plan = await InsurancePlanModel.findOne({ id: caseData?.planId });
            const user = await UserModel.findById(userId);

            let patientName = "[PATIENT NAME]";
            let dob = "[DOB]";
            let policyNumber = caseData?.parsedData?.policyNumber || plan?.policyNumber || "[Policy Number]";
            let insurerName = plan?.insuranceCompany || "Insurance Company";
            let userFullName = user ? `${user.firstName} ${user.lastName}`.trim() : "PolicyPilot User";

            // Data from Python extraction
            let denialDate = result.emailDraft?.denial_date || "[Date of Denial Letter]";
            let procedureName = result.emailDraft?.procedure_name || "[Name of Procedure/Treatment]";

            if (plan && caseData?.coveredPersonId) {
              const person = plan.coveredIndividuals.find((p: any) => p.id === caseData.coveredPersonId);
              if (person) {
                patientName = person.name;
                dob = person.dateOfBirth;
              }
            }

            // Construct the template
            const generatedBody = result.emailDraft?.body || "";

            const finalBody = `Patient Name: ${patientName}
Date of Birth: ${dob}

To the ${insurerName} Appeals Department:

Please be advised that this firm represents the above-referenced
insured person.

${generatedBody}

Respectfully submitted,

PolicyPilot
Patient Advocate`;

            const finalSubject = `${userFullName} - Policy #${policyNumber}`;

            const finalEmailDraft = {
              subject: finalSubject,
              body: finalBody
            };

            // Save result to DB
            CaseModel.findOneAndUpdate(
              { id },
              { emailDraft: finalEmailDraft },
              { new: true }
            ).then(() => console.log(`💾 Saved email draft to DB for case ${id}`))
              .catch(err => console.error(`❌ Failed to save email draft to DB: ${err}`));

            resolve(c.json({ emailDraft: finalEmailDraft }));
            // --- TEMPLATING LOGIC END ---
          }
        } catch (e) {
          console.error("Failed to parse Python output or apply template:", e);
          resolve(c.json({ error: "Invalid response from email generation engine" }, 500));
        }
      });
    }) as Promise<Response>;

  } catch (e: any) {
    console.error('❌ Error generating email:', e);
    return c.json({ error: e.message }, 500);
  }
};

export const generateFollowup = async (c: Context) => {
  try {
    const id = c.req.param("id");

    // On Vercel: try Modal API if configured
    if (isVercel) {
      if (useModal()) {
        console.log(`🚀 Calling Modal for follow-up generation: case ${id}`);
        // Get the case to access email thread
        const caseData = await CaseModel.findOne({ id });
        const emailThread = caseData?.emailThread || [];
        const result = await modal.generateFollowupViaModal(id, emailThread);
        if (result.error) {
          return c.json({ error: result.error }, 500);
        }
        return c.json(result.data);
      }
      return pythonNotAvailable(c, "Follow-up generation");
    }

    const { orchestrator } = require('../agent/orchestrator');

    // Call orchestrator to generate follow-up
    const result = await orchestrator.generateFollowup(id);

    return c.json({ emailDraft: result });
  } catch (e: any) {
    console.error('❌ Error generating follow-up:', e);
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

    // Check cache first
    if (caseData.denialReasonTitle) {
      console.log(`🧠 Returning cached denial extraction for case ${id}`);
      return c.json({ briefDescription: caseData.denialReasonTitle });
    }

    // On Vercel: try Modal API if configured
    if (isVercel) {
      if (useModal()) {
        console.log(`🚀 Calling Modal for denial extraction: case ${id}`);
        const result = await modal.extractDenialViaModal(id);
        if (result.error) {
          return c.json({ error: result.error }, 500);
        }
        // Cache the result
        if (result.data?.briefDescription) {
          await CaseModel.findOneAndUpdate(
            { id },
            { denialReasonTitle: result.data.briefDescription }
          );
        }
        return c.json(result.data);
      }
      return pythonNotAvailable(c, "Denial extraction");
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
        // Supabase - download from storage
        if (!supabaseServer) {
          console.error("Supabase not configured - cannot download file");
          continue;
        }

        try {
          const bucket = fileData.bucket || "denials";
          console.log(`📥 Downloading file from Supabase: ${bucket}/${fileData.path}`);

          const { data, error } = await supabaseServer.storage
            .from(bucket)
            .download(fileData.path);

          if (error) {
            console.error(`❌ Error downloading file from Supabase: ${error.message}`);
            continue;
          }

          if (data) {
            // Convert Blob to Buffer and write to file
            const arrayBuffer = await data.arrayBuffer();
            fs.writeFileSync(filePath, Buffer.from(arrayBuffer));
            filePaths.push(filePath);
            console.log(`✅ Downloaded and saved: ${fileName}`);
          }
        } catch (downloadError: any) {
          console.error(`❌ Error processing Supabase file ${fileData.path}:`, downloadError);
          // Continue with other files even if one fails
        }
      }
    }

    if (filePaths.length === 0) {
      return c.json({ error: "No processable denial files found" }, 400);
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

    console.log(`🚀 Starting Denial Extraction for case ${id} with ${filePaths.length} files using ${pythonPath}...`);

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
        "--mode", "denial_extract",
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
