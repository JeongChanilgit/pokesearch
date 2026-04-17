import { NextResponse, type NextRequest } from 'next/server';
import { prisma, hashPassword } from '@pokesearch/db';
import {
  UuidSchema,
  CreateCommentRequest,
  ListCommentsResponse,
  type Comment as CommentType,
} from '@pokesearch/types';
import { getClientIp, containsForbiddenWord } from '../../../../../lib/request-ip';
import { checkCommentRateLimit } from '../../../../../lib/rate-limit';

export const dynamic = 'force-dynamic';

const PAGE_SIZE = 20;

function jsonError(code: string, message: string, status: number) {
  return NextResponse.json(
    { error: { code, message } },
    { status },
  );
}

export async function GET(
  req: NextRequest,
  ctx: { params: Promise<{ id: string }> },
) {
  const { id } = await ctx.params;
  if (!UuidSchema.safeParse(id).success) {
    return jsonError('BAD_REQUEST', 'invalid team id', 400);
  }
  const pageRaw = new URL(req.url).searchParams.get('page') ?? '1';
  const page = Math.max(1, Number.parseInt(pageRaw, 10) || 1);
  const skip = (page - 1) * PAGE_SIZE;

  const rows = await prisma.comment.findMany({
    where: { teamId: id },
    orderBy: { createdAt: 'desc' },
    skip,
    take: PAGE_SIZE + 1,
    select: {
      id: true,
      teamId: true,
      nickname: true,
      content: true,
      createdAt: true,
    },
  });

  const hasMore = rows.length > PAGE_SIZE;
  const page_ = rows.slice(0, PAGE_SIZE);
  const comments: CommentType[] = page_.map((c) => ({
    id: c.id,
    teamId: c.teamId,
    nickname: c.nickname,
    content: c.content,
    createdAt: c.createdAt.toISOString(),
  }));
  const body: ListCommentsResponse = { comments, hasMore };
  return NextResponse.json(body);
}

export async function POST(
  req: NextRequest,
  ctx: { params: Promise<{ id: string }> },
) {
  const { id } = await ctx.params;
  if (!UuidSchema.safeParse(id).success) {
    return jsonError('BAD_REQUEST', 'invalid team id', 400);
  }

  let raw: unknown;
  try {
    raw = await req.json();
  } catch {
    return jsonError('BAD_REQUEST', 'invalid json', 400);
  }
  const parsed = CreateCommentRequest.safeParse({ ...(raw as object), teamId: id });
  if (!parsed.success) {
    return NextResponse.json(
      {
        error: {
          code: 'VALIDATION_ERROR',
          message: 'invalid body',
          details: parsed.error.flatten(),
        },
      },
      { status: 400 },
    );
  }

  if (containsForbiddenWord(parsed.data.content)) {
    return jsonError('FORBIDDEN', 'comment contains forbidden word', 403);
  }

  const ip = getClientIp(req);
  if (!checkCommentRateLimit(ip)) {
    return jsonError('RATE_LIMITED', 'wait 60 seconds between comments', 429);
  }

  const team = await prisma.team.findUnique({ where: { id }, select: { id: true } });
  if (!team) {
    return jsonError('NOT_FOUND', 'team not found', 404);
  }

  const passwordHash = await hashPassword(parsed.data.password);
  const created = await prisma.comment.create({
    data: {
      teamId: id,
      nickname: parsed.data.nickname,
      passwordHash,
      content: parsed.data.content,
    },
    select: {
      id: true,
      teamId: true,
      nickname: true,
      content: true,
      createdAt: true,
    },
  });

  const body: CommentType = {
    id: created.id,
    teamId: created.teamId,
    nickname: created.nickname,
    content: created.content,
    createdAt: created.createdAt.toISOString(),
  };
  return NextResponse.json(body, { status: 201 });
}
