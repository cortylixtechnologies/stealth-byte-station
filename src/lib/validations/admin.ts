import { z } from "zod";

// Helper for optional URL that can be empty string
const optionalUrl = z.string().url("Invalid URL").max(2000, "URL too long").optional().nullable().or(z.literal(""));

// Course validation schema
export const courseSchema = z.object({
  title: z.string().trim().min(1, "Title is required").max(200, "Title must be less than 200 characters"),
  description: z.string().max(5000, "Description must be less than 5000 characters").nullable().optional(),
  category: z.enum(["cyber-security", "programming", "graphic-design"]),
  level: z.enum(["beginner", "intermediate", "advanced"]),
  duration: z.string().max(50, "Duration must be less than 50 characters").nullable().optional(),
  lessons_count: z.number().int().min(0, "Lessons count must be positive").max(1000, "Lessons count must be less than 1000").nullable().optional(),
  image_url: optionalUrl.transform(v => v || null),
  price: z.number().min(0, "Price must be positive").max(10000, "Price must be less than $10,000").nullable().optional(),
  is_free: z.boolean(),
  is_active: z.boolean(),
});

export type CourseFormData = z.infer<typeof courseSchema>;

// News validation schema
export const newsSchema = z.object({
  title: z.string().trim().min(1, "Title is required").max(300, "Title must be less than 300 characters"),
  summary: z.string().max(1000, "Summary must be less than 1000 characters").nullable().optional(),
  content: z.string().max(50000, "Content must be less than 50000 characters").nullable().optional(),
  image_url: optionalUrl.transform(v => v || null),
  author: z.string().max(100, "Author name must be less than 100 characters").nullable().optional(),
  is_featured: z.boolean(),
  is_active: z.boolean(),
});

export type NewsFormData = z.infer<typeof newsSchema>;

// Tool validation schema
export const toolSchema = z.object({
  name: z.string().trim().min(1, "Name is required").max(100, "Name must be less than 100 characters"),
  description: z.string().max(2000, "Description must be less than 2000 characters").nullable().optional(),
  category: z.enum(["free", "paid"]),
  icon: optionalUrl.transform(v => v || null),
  url: optionalUrl.transform(v => v || null),
  price: z.number().min(0, "Price must be positive").max(10000, "Price must be less than $10,000").nullable().optional(),
  is_active: z.boolean(),
});

export type ToolFormData = z.infer<typeof toolSchema>;

// Helper to validate and return errors with proper typing
export function validateForm<T extends z.ZodSchema>(
  schema: T, 
  data: unknown
): { success: true; data: z.infer<T> } | { success: false; errors: string[] } {
  const result = schema.safeParse(data);
  if (result.success) {
    return { success: true, data: result.data };
  }
  const errors = result.error.errors.map(e => `${e.path.length > 0 ? e.path.join('.') + ': ' : ''}${e.message}`);
  return { success: false, errors };
}
