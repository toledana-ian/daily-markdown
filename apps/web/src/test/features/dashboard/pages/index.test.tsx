import { render, screen } from '@testing-library/react';
import type { ComponentType } from 'react';
import { beforeAll, describe, expect, it } from 'vitest';

let AppHomePage: ComponentType;

beforeAll(async () => {
  const module = await import('@/routes/_app/index.tsx');
  AppHomePage = module.Route.options.component as ComponentType;
});

describe('Dashboard page content', () => {
  it('renders the authenticated note entry point', () => {
    render(<AppHomePage />);

    expect(screen.getByRole('button', { name: /take a note/i })).toBeInTheDocument();
  });
});
