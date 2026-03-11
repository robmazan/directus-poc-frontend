import {
  createDirectus as createDirectusClient,
  authentication,
  rest,
  readItems,
  type AuthenticationData,
} from '@directus/sdk';
import type { Request } from 'express';
import type { Page, PageWithRows } from '../types/content.js';

const DIRECTUS_URL = process.env.DIRECTUS_URL ?? 'http://localhost:8055';

/**
 * Creates a fresh Directus client with no stored credentials.
 * Use this for login (unauthenticated requests).
 */
export function createDirectus() {
  return createDirectusClient(DIRECTUS_URL)
    .with(authentication('json'))
    .with(rest());
}

/**
 * Creates a Directus client pre-loaded with the credentials from the
 * current user's session. Returns null if the session has no auth data.
 */
export function getAuthedClient(req: Request) {
  const authData = req.session.directusAuth;
  if (!authData) return null;

  const client = createDirectusClient(DIRECTUS_URL)
    .with(
      authentication('json', {
        credentials: 'include',
        autoRefresh: true,
        msRefreshBeforeExpires: 30_000,
        storage: {
          get: () => authData as AuthenticationData,
          set: (data: AuthenticationData | null) => {
            if (data) {
              req.session.directusAuth = {
                access_token: data.access_token ?? '',
                refresh_token: data.refresh_token ?? '',
                expires: data.expires ?? undefined,
              };
            } else {
              delete req.session.directusAuth;
            }
          },
        },
      }),
    )
    .with(rest());

  return client;
}

/** Fetch published pages (id, title, slug) for the index listing. */
export async function getPages(client: ReturnType<typeof getAuthedClient>): Promise<Page[]> {
  if (!client) return [];
  return client.request<Page[]>(
    readItems('pages', {
      filter: { status: { _eq: 'published' } },
      fields: ['id', 'title', 'slug'],
      sort: ['sort', 'title'],
    }),
  );
}

/**
 * Fetch a single published page by slug, with fully nested
 * rows → stacks → bricks (brick_texts / brick_images) data.
 */
export async function getPage(
  client: ReturnType<typeof getAuthedClient>,
  slug: string,
): Promise<PageWithRows | null> {
  if (!client) return null;
  const results = await client.request<PageWithRows[]>(
    readItems('pages', {
      filter: {
        _and: [
          { slug: { _eq: slug } },
          { status: { _eq: 'published' } },
        ],
      },
      fields: [
        'id',
        'title',
        'slug',
        'rows.id',
        'rows.name',
        'rows.sort',
        'rows.stacks.id',
        'rows.stacks.name',
        'rows.stacks.sort',
        'rows.stacks.bricks.id',
        'rows.stacks.bricks.sort',
        'rows.stacks.bricks.collection',
        'rows.stacks.bricks.item:brick_texts.id',
        'rows.stacks.bricks.item:brick_texts.content',
        'rows.stacks.bricks.item:brick_images.id',
        'rows.stacks.bricks.item:brick_images.image',
      ],
      deep: {
        rows: { _sort: ['sort'] },
        'rows.stacks': { _sort: ['sort'] },
        'rows.stacks.bricks': { _sort: ['sort'] },
      },
      limit: 1,
    }),
  );
  return results[0] ?? null;
}
