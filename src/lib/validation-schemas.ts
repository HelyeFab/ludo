import { z } from "zod";

/**
 * Validation schemas for all user inputs
 * Using Zod for type-safe runtime validation
 */

// Password validation schema
export const passwordSchema = z.string().min(1, "Password is required");

// Album creation/update schema
export const albumSchema = z.object({
  title: z
    .string()
    .min(1, "Title is required")
    .max(100, "Title must be less than 100 characters")
    .trim(),
  subtitle: z
    .string()
    .max(200, "Subtitle must be less than 200 characters")
    .trim()
    .optional()
    .or(z.literal("")),
  date: z.string().optional().or(z.literal("")),
  quote: z
    .string()
    .max(500, "Quote must be less than 500 characters")
    .trim()
    .optional()
    .or(z.literal("")),
});

// Photo upload schema
export const photoUploadSchema = z.object({
  photos: z
    .array(z.instanceof(File))
    .min(1, "At least one photo is required")
    .refine(
      (files) => files.every((file) => file.size <= 10 * 1024 * 1024), // 10MB max
      "Each photo must be less than 10MB"
    )
    .refine(
      (files) =>
        files.every((file) =>
          ["image/jpeg", "image/jpg", "image/png", "image/webp", "image/heic"].includes(
            file.type
          )
        ),
      "Only JPEG, PNG, WebP, and HEIC images are allowed"
    ),
});

// Photo deletion schema
export const photoDeleteSchema = z.object({
  photoId: z.string().min(1, "Photo ID is required"),
});

// Album ID parameter schema
export const albumIdSchema = z.object({
  albumId: z.string().min(1, "Album ID is required"),
});

// Export types
export type AlbumInput = z.infer<typeof albumSchema>;
export type PhotoUploadInput = z.infer<typeof photoUploadSchema>;
export type PhotoDeleteInput = z.infer<typeof photoDeleteSchema>;
export type AlbumIdParam = z.infer<typeof albumIdSchema>;
