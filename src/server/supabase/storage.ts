import { supabaseServer } from "./client";

/**
 * Generate a signed URL for secure, temporary file access (server-side)
 */
export const getSignedUrl = async (bucket: string, path: string, expiresIn: number = 3600) => {
    if (!supabaseServer) throw new Error("Supabase is not configured on server");

    const { data, error } = await supabaseServer.storage
        .from(bucket)
        .createSignedUrl(path, expiresIn);

    if (error) throw error;

    return data.signedUrl;
};
