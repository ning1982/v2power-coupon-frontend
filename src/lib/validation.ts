import { z } from "zod";

export const redeemSchema = z.object({
  email: z.string().trim().toLowerCase().email("Please enter a valid email address").max(254),
  token: z.string().trim().transform((v) => v.trim().toUpperCase().replace(/[^A-Z0-9-]/g, "")).pipe(z.string().min(8, "Please enter your Token").max(64)),
  captcha_token: z.string().optional(),
  consent: z.boolean().refine((v) => v === true, { message: "Please agree to the Privacy Policy" }),
});

export type RedeemForm = z.infer<typeof redeemSchema>;
