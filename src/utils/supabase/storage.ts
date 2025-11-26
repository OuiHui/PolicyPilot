import { supabase } from "./client";

/**
 * Upload a file to Supabase Storage
 */
export const uploadFileToSupabase = async (file: File, bucket: string, path: string) => {
    if (!supabase) throw new Error("Supabase is not configured");

    const { data, error } = await supabase.storage
        .from(bucket)
        .upload(path, file, {
            cacheControl: "3600",
            upsert: false,
        });

    if (error) throw error;

    return data;
};

/**
 * Generate a signed URL for secure, temporary file access
 * @param bucket - The storage bucket name
 * @param path - The file path in the bucket
 * @param expiresIn - Expiration time in seconds (default: 1 hour)
 */
export const getSignedUrl = async (bucket: string, path: string, expiresIn: number = 3600) => {
    if (!supabase) throw new Error("Supabase is not configured");

    const { data, error } = await supabase.storage
        .from(bucket)
        .createSignedUrl(path, expiresIn);

    if (error) throw error;

    return data.signedUrl;
};
