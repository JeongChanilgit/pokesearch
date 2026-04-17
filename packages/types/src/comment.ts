import { z } from 'zod';
import { UuidSchema } from './common';

export const Comment = z.object({
  id: UuidSchema,
  teamId: UuidSchema,
  nickname: z.string(),
  content: z.string(),
  createdAt: z.string().datetime(),
});
export type Comment = z.infer<typeof Comment>;

export const ListCommentsRequest = z.object({
  teamId: UuidSchema,
  limit: z.number().int().min(1).max(100).optional().default(50),
  cursor: z.string().optional(),
});
export type ListCommentsRequest = z.infer<typeof ListCommentsRequest>;
export type ListCommentsInput = z.input<typeof ListCommentsRequest>;

export const ListCommentsResponse = z.object({
  items: z.array(Comment),
  nextCursor: z.string().nullable(),
});
export type ListCommentsResponse = z.infer<typeof ListCommentsResponse>;

export const CreateCommentRequest = z.object({
  teamId: UuidSchema,
  nickname: z.string().min(1).max(20),
  password: z.string().min(4).max(64),
  content: z.string().min(1).max(500),
});
export type CreateCommentRequest = z.infer<typeof CreateCommentRequest>;

export const CreateCommentResponse = z.object({
  id: UuidSchema,
});
export type CreateCommentResponse = z.infer<typeof CreateCommentResponse>;

export const DeleteCommentRequest = z.object({
  commentId: UuidSchema,
  password: z.string().min(1).max(64),
});
export type DeleteCommentRequest = z.infer<typeof DeleteCommentRequest>;
