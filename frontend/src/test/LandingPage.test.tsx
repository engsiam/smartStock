import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router';
import { LandingPage } from '../pages/LandingPage';

describe('LandingPage Component', () => {
  it('renders landing hero and features without crashing', () => {
    render(
      <MemoryRouter>
        <LandingPage />
      </MemoryRouter>,
    );

    // Verify Heading
    expect(
      screen.getByRole('heading', { name: /Next-Generation Inventory Intelligence/i }),
    ).toBeInTheDocument();

    // Verify Bangladesh SME focus
    expect(
      screen.getByText(/Tailored for Small & Medium Businesses in Bangladesh/i),
    ).toBeInTheDocument();

    // Verify BDT Poysha precision card
    expect(screen.getByText(/BDT Poysha Precision/i)).toBeInTheDocument();

    // Verify Launch CTA
    expect(screen.getByRole('link', { name: /Launch Dashboard Shell/i })).toBeInTheDocument();
  });
});
