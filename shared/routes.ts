import { z } from 'zod';
import { insertNoteSchema, insertFolderSchema, notes, folders } from './schema';

export const errorSchemas = {
  validation: z.object({
    message: z.string(),
    field: z.string().optional(),
  }),
  unauthorized: z.object({
    message: z.string(),
  }),
  internal: z.object({
    message: z.string(),
  }),
};

export const api = {
  auth: {
    login: {
      method: 'POST' as const,
      path: '/api/login',
      input: z.object({
        username: z.string(),
        password: z.string(),
      }),
      responses: {
        200: z.object({ success: z.boolean() }),
        401: errorSchemas.unauthorized,
      },
    },
  },
  folders: {
    list: {
      method: 'GET' as const,
      path: '/api/folders',
      responses: {
        200: z.array(z.custom<typeof folders.$inferSelect>()),
      },
    },
    create: {
      method: 'POST' as const,
      path: '/api/folders',
      input: insertFolderSchema,
      responses: {
        201: z.custom<typeof folders.$inferSelect>(),
        400: errorSchemas.validation,
      },
    },
    delete: {
      method: 'DELETE' as const,
      path: '/api/folders/:id',
      responses: {
        204: z.void(),
      },
    },
  },
  notes: {
    list: {
      method: 'GET' as const,
      path: '/api/notes',
      input: z.object({
        folderId: z.coerce.number().optional(),
      }).optional(),
      responses: {
        200: z.array(z.custom<typeof notes.$inferSelect>()),
      },
    },
    create: {
      method: 'POST' as const,
      path: '/api/notes',
      input: insertNoteSchema,
      responses: {
        201: z.custom<typeof notes.$inferSelect>(),
        400: errorSchemas.validation,
      },
    },
    delete: {
      method: 'DELETE' as const,
      path: '/api/notes/:id',
      responses: {
        204: z.void(),
      },
    },
  },
};

export function buildUrl(path: string, params?: Record<string, string | number>): string {
  let url = path;
  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      if (url.includes(`:${key}`)) {
        url = url.replace(`:${key}`, String(value));
      }
    });
  }
  return url;
}
