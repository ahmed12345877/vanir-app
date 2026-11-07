import React, { PropsWithChildren, useMemo } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { createTRPCReact } from '@trpc/react-query';
import { httpBatchLink } from '@trpc/client';
import superjson from 'superjson';
import { appConfig } from '../config/appConfig';

export const trpc: any = createTRPCReact<any>();

const queryClient = new QueryClient();

export function AppProviders({ children }: PropsWithChildren) {
  const trpcClient = useMemo(
    () =>
      trpc.createClient({
        links: [
          httpBatchLink({
            transformer: superjson,
            url: `${appConfig.apiBaseUrl.replace(/\/$/, '')}/api/trpc`,
            fetch(url, options) {
              return fetch(String(url), {
                ...(options ?? {}),
                credentials: 'include',
              });
            },
          }),
        ],
      }),
    [],
  );

  return (
    <trpc.Provider client={trpcClient} queryClient={queryClient}>
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    </trpc.Provider>
  );
}
