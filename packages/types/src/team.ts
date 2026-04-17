import { z } from 'zod';
import { UuidSchema, TypeName, Level } from './common';
import { PokemonSummary } from './pokemon';
import { Move } from './move';
import { Ability } from './ability';
import { Item } from './item';
import { Nature } from './nature';

export const TeamPokemonMoveInput = z.object({
  moveId: z.number().int(),
  slotOrder: z.number().int().min(1).max(4),
});
export type TeamPokemonMoveInput = z.infer<typeof TeamPokemonMoveInput>;

const EVsWithTotalRefine = z
  .object({
    h: z.number().int().min(0).max(252),
    a: z.number().int().min(0).max(252),
    b: z.number().int().min(0).max(252),
    c: z.number().int().min(0).max(252),
    d: z.number().int().min(0).max(252),
    s: z.number().int().min(0).max(252),
  })
  .refine((e) => e.h + e.a + e.b + e.c + e.d + e.s <= 510, {
    message: 'EV total exceeds 510',
  });

const IVsSchema = z.object({
  h: z.number().int().min(0).max(31),
  a: z.number().int().min(0).max(31),
  b: z.number().int().min(0).max(31),
  c: z.number().int().min(0).max(31),
  d: z.number().int().min(0).max(31),
  s: z.number().int().min(0).max(31),
});

export const TeamPokemonInput = z.object({
  slotOrder: z.number().int().min(1).max(6),
  pokemonId: z.number().int(),
  abilityId: z.number().int(),
  itemId: z.number().int().nullable(),
  natureId: z.number().int().min(1).max(25),
  evs: EVsWithTotalRefine,
  ivs: IVsSchema.default({ h: 31, a: 31, b: 31, c: 31, d: 31, s: 31 }),
  teraType: TypeName.nullable().default(null),
  moves: z.array(TeamPokemonMoveInput).max(4),
});
export type TeamPokemonInput = z.infer<typeof TeamPokemonInput>;
export type TeamPokemonInputRaw = z.input<typeof TeamPokemonInput>;

export const CreateTeamRequest = z.object({
  name: z.string().min(1).max(60),
  description: z.string().max(500).optional(),
  level: Level,
  password: z.string().min(4).max(64),
  pokemons: z.array(TeamPokemonInput).min(1).max(6),
});
export type CreateTeamRequest = z.infer<typeof CreateTeamRequest>;
export type CreateTeamInput = z.input<typeof CreateTeamRequest>;

export const CreateTeamResponse = z.object({
  id: UuidSchema,
});
export type CreateTeamResponse = z.infer<typeof CreateTeamResponse>;

export const TeamListSort = z.enum(['likes', 'views', 'newest', 'comments']);
export type TeamListSort = z.infer<typeof TeamListSort>;

export const ListTeamsRequest = z.object({
  sort: TeamListSort.optional().default('likes'),
  pokemonId: z.number().int().positive().optional(),
  cursor: z.string().optional(),
  limit: z.number().int().min(1).max(50).optional().default(20),
});
export type ListTeamsRequest = z.infer<typeof ListTeamsRequest>;
export type ListTeamsInput = z.input<typeof ListTeamsRequest>;

export const TeamListItemPokemon = z.object({
  slotOrder: z.number().int().min(1).max(6),
  pokemonId: z.number().int(),
  spriteUrl: z.string().url(),
});
export type TeamListItemPokemon = z.infer<typeof TeamListItemPokemon>;

export const TeamListItem = z.object({
  id: UuidSchema,
  name: z.string(),
  level: Level,
  pokemons: z.array(TeamListItemPokemon),
  views: z.number().int().nonnegative(),
  likesCount: z.number().int().nonnegative(),
  commentsCount: z.number().int().nonnegative(),
  createdAt: z.string().datetime(),
});
export type TeamListItem = z.infer<typeof TeamListItem>;

export const ListTeamsResponse = z.object({
  items: z.array(TeamListItem),
  nextCursor: z.string().nullable(),
});
export type ListTeamsResponse = z.infer<typeof ListTeamsResponse>;

export const TeamPokemonMoveDetail = z.object({
  slotOrder: z.number().int().min(1).max(4),
  move: Move,
});
export type TeamPokemonMoveDetail = z.infer<typeof TeamPokemonMoveDetail>;

export const TeamPokemonDetail = z.object({
  id: UuidSchema,
  slotOrder: z.number().int().min(1).max(6),
  pokemon: PokemonSummary.extend({
    baseH: z.number().int(),
    baseA: z.number().int(),
    baseB: z.number().int(),
    baseC: z.number().int(),
    baseD: z.number().int(),
    baseS: z.number().int(),
  }),
  ability: Ability,
  item: Item.nullable(),
  nature: Nature,
  evs: z.object({
    h: z.number().int(),
    a: z.number().int(),
    b: z.number().int(),
    c: z.number().int(),
    d: z.number().int(),
    s: z.number().int(),
  }),
  ivs: z.object({
    h: z.number().int(),
    a: z.number().int(),
    b: z.number().int(),
    c: z.number().int(),
    d: z.number().int(),
    s: z.number().int(),
  }),
  teraType: TypeName.nullable(),
  moves: z.array(TeamPokemonMoveDetail),
});
export type TeamPokemonDetail = z.infer<typeof TeamPokemonDetail>;

export const TeamDetail = z.object({
  id: UuidSchema,
  name: z.string(),
  description: z.string().nullable(),
  level: Level,
  views: z.number().int().nonnegative(),
  likesCount: z.number().int().nonnegative(),
  commentsCount: z.number().int().nonnegative(),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
  pokemons: z.array(TeamPokemonDetail),
});
export type TeamDetail = z.infer<typeof TeamDetail>;

export const UpdateTeamRequest = z.object({
  name: z.string().min(1).max(60),
  description: z.string().max(500).optional(),
  level: Level,
  pokemons: z.array(TeamPokemonInput).min(1).max(6),
});
export type UpdateTeamRequest = z.infer<typeof UpdateTeamRequest>;
export type UpdateTeamInput = z.input<typeof UpdateTeamRequest>;

export const VerifyTeamPasswordRequest = z.object({
  password: z.string().min(1).max(64),
});
export type VerifyTeamPasswordRequest = z.infer<typeof VerifyTeamPasswordRequest>;

export const VerifyTeamPasswordResponse = z.object({
  token: z.string(),
  expiresAt: z.string().datetime(),
});
export type VerifyTeamPasswordResponse = z.infer<typeof VerifyTeamPasswordResponse>;

export const LikeStatusResponse = z.object({
  liked: z.boolean(),
  likesCount: z.number().int().nonnegative(),
});
export type LikeStatusResponse = z.infer<typeof LikeStatusResponse>;

export const LikeMutationResponse = z.object({
  likesCount: z.number().int().nonnegative(),
});
export type LikeMutationResponse = z.infer<typeof LikeMutationResponse>;
