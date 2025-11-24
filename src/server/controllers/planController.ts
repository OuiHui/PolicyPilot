import { Context } from "hono";
import { InsurancePlanModel } from "../models/InsurancePlan";

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
    const body = await c.req.parseBody();
    const files = body["policyFiles[]"]; // Hono handles multiple files with [] suffix or just key depending on client

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
    const planData = {
      id: body.id as string,
      userId: body.userId as string,
      insuranceCompany: body.insuranceCompany as string,
      planName: body.planName as string,
      policyNumber: body.policyNumber as string,
      groupNumber: body.groupNumber as string,
      policyType: body.policyType as string,
      dateAdded: body.dateAdded as string,
      coveredIndividuals: body.coveredIndividuals ? JSON.parse(body.coveredIndividuals as string) : [],
      policyFiles,
    };

    const plan = new InsurancePlanModel(planData);
    await plan.save();
    return c.json(plan, 201);
  } catch (e: any) {
    console.error(e);
    return c.json({ error: e.message }, 400);
  }
};
