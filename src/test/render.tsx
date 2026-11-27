import type { ReactElement, ReactNode } from 'react';
import { render, type RenderOptions, type RenderResult } from '@testing-library/react';
import { Provider } from 'react-redux';
import { MemoryRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

import { store } from '../store';
import { ThemeProvider } from '../theme/ThemeProvider';

export function createQueryClient() {
  return new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  });
}

export function renderWithProviders(
  ui: ReactElement,
  options: RenderOptions & { route?: string; queryClient?: QueryClient } = {},
): RenderResult {
  const { route = '/', queryClient = createQueryClient(), ...rest } = options;

  const wrapper = ({ children }: { children: ReactNode }) => (
    <Provider store={store}>
      <ThemeProvider>
        <QueryClientProvider client={queryClient}>
          <MemoryRouter initialEntries={[route]}>{children}</MemoryRouter>
        </QueryClientProvider>
      </ThemeProvider>
    </Provider>
  );

  return render(ui, { wrapper, ...rest });
}