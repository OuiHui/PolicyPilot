import { Context } from "hono";
import { getSignedUrl } from "../supabase/storage";

/**
 * Generate a signed URL for secure file access
 */
export const getFileSignedUrl = async (c: Context) => {
    try {
        const { bucket, path } = await c.req.json();

        if (!bucket || !path) {
            return c.json({ error: "Bucket and path are required" }, 400);
        }

        // Generate a signed URL valid for 1 hour
        const signedUrl = await getSignedUrl(bucket, path, 3600);

        return c.json({ signedUrl });
    } catch (error: any) {
        console.error("Error generating signed URL:", error);
        return c.json({ error: error?.message || "Failed to generate signed URL" }, 500);
    }
};
