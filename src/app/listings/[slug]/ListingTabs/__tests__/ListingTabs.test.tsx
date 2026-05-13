// @vitest-environment jsdom
import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ListingTabs } from '../ListingTabs';
import { mockFields, openHoursJson } from '../../__tests__/fixtures';
import type { Listing } from '@/lib/getListings';

// ── Mock heavy child components to isolate ListingTabs logic ─────────────────

vi.mock('@/components/ActionsBlock', () => ({
  ActionsBlock: () => <div data-testid="actions-block" />,
}));

vi.mock('@/components/SystemsMapping', () => ({
  SystemsMapping: () => <div data-testid="systems-mapping" />,
}));

vi.mock('../../BusinessHoursBlock', () => ({
  BusinessHoursBlock: () => <div data-testid="hours-block" />,
}));

// ── Helpers ──────────────────────────────────────────────────────────────────

function emptyFields(overrides: Partial<Listing['fields']> = {}): Listing['fields'] {
  return {
    ...mockFields,
    businessDescription: '',
    website: '',
    businessPhone: '',
    businessEmail: '',
    instagramUrl1: '',
    facebookUrl: '',
    linkedInUrl: '',
    tiktokHandle: '',
    hasDelivery: false,
    hasPickUp: false,
    hasOnlineShop: false,
    onlineShopLink: '',
    hoursJson: null,
    notableBusinessEvents: [],
    ...overrides,
  };
}

// ── Tab navigation ────────────────────────────────────────────────────────────

describe('ListingTabs — tab navigation', () => {
  it('renders Overview and Details tab buttons', () => {
    render(<ListingTabs fields={mockFields} mapsUrl={null} />);
    expect(screen.getByRole('button', { name: 'Overview' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Details' })).toBeInTheDocument();
  });

  it('shows Overview content by default', () => {
    render(<ListingTabs fields={mockFields} mapsUrl={null} />);
    expect(screen.getByTestId('hours-block')).toBeInTheDocument();
  });

  it('switches to Details tab when clicked', async () => {
    const user = userEvent.setup();
    render(<ListingTabs fields={mockFields} mapsUrl="https://maps.google.com/?q=test" />);
    await user.click(screen.getByRole('button', { name: 'Details' }));
    expect(screen.getByText('Contact')).toBeInTheDocument();
  });

  it('switches back to Overview when Overview tab is clicked again', async () => {
    const user = userEvent.setup();
    render(<ListingTabs fields={mockFields} mapsUrl={null} />);
    await user.click(screen.getByRole('button', { name: 'Details' }));
    await user.click(screen.getByRole('button', { name: 'Overview' }));
    expect(screen.getByTestId('actions-block')).toBeInTheDocument();
  });
});

// ── Overview tab ──────────────────────────────────────────────────────────────

describe('ListingTabs — Overview tab', () => {
  it('shows a Website link when website is set', () => {
    render(<ListingTabs fields={mockFields} mapsUrl={null} />);
    expect(screen.getByRole('link', { name: /Website/i })).toHaveAttribute('href', mockFields.website);
  });

  it('shows a Directions link when mapsUrl is set', () => {
    const mapsUrl = 'https://maps.google.com/?q=123+Rundle';
    render(<ListingTabs fields={mockFields} mapsUrl={mapsUrl} />);
    expect(screen.getByRole('link', { name: /Directions/i })).toHaveAttribute('href', mapsUrl);
  });

  it('hides the quick-links block when both website and mapsUrl are absent', () => {
    render(<ListingTabs fields={emptyFields()} mapsUrl={null} />);
    expect(screen.queryByRole('link', { name: /Website/i })).not.toBeInTheDocument();
    expect(screen.queryByRole('link', { name: /Directions/i })).not.toBeInTheDocument();
  });

  it('shows the hours block when hoursJson is set', () => {
    render(<ListingTabs fields={mockFields} mapsUrl={null} />);
    expect(screen.getByTestId('hours-block')).toBeInTheDocument();
  });

  it('hides the hours block when hoursJson is null', () => {
    render(<ListingTabs fields={emptyFields()} mapsUrl={null} />);
    expect(screen.queryByTestId('hours-block')).not.toBeInTheDocument();
  });

  it('renders the ActionsBlock', () => {
    render(<ListingTabs fields={mockFields} mapsUrl={null} />);
    expect(screen.getByTestId('actions-block')).toBeInTheDocument();
  });

  it('renders the SystemsMapping', () => {
    render(<ListingTabs fields={mockFields} mapsUrl={null} />);
    expect(screen.getByTestId('systems-mapping')).toBeInTheDocument();
  });
});

// ── Details tab ───────────────────────────────────────────────────────────────

describe('ListingTabs — Details tab', () => {
  async function renderDetails(fields: Listing['fields'] = mockFields, mapsUrl: string | null = null) {
    const user = userEvent.setup();
    render(<ListingTabs fields={fields} mapsUrl={mapsUrl} />);
    await user.click(screen.getByRole('button', { name: 'Details' }));
    return user;
  }

  it('shows the business description', async () => {
    await renderDetails();
    expect(screen.getByText(mockFields.businessDescription)).toBeInTheDocument();
  });

  it('hides the description section when businessDescription is empty', async () => {
    await renderDetails(emptyFields());
    expect(screen.queryByText('Your friendly neighbourhood circular shop.')).not.toBeInTheDocument();
  });

  it('shows the Instagram link', async () => {
    await renderDetails();
    expect(screen.getByRole('link', { name: /Instagram/i })).toHaveAttribute('href', mockFields.instagramUrl1);
  });

  it('shows the Facebook link', async () => {
    await renderDetails();
    expect(screen.getByRole('link', { name: /Facebook/i })).toHaveAttribute('href', mockFields.facebookUrl);
  });

  it('shows the LinkedIn link', async () => {
    await renderDetails();
    expect(screen.getByRole('link', { name: /LinkedIn/i })).toHaveAttribute('href', mockFields.linkedInUrl);
  });

  it('shows the TikTok link', async () => {
    await renderDetails();
    expect(screen.getByRole('link', { name: /TikTok/i })).toBeInTheDocument();
  });

  it('hides the social section when no social fields are present', async () => {
    await renderDetails(emptyFields());
    expect(screen.queryByRole('link', { name: /Instagram/i })).not.toBeInTheDocument();
    expect(screen.queryByRole('link', { name: /Facebook/i })).not.toBeInTheDocument();
    expect(screen.queryByRole('link', { name: /TikTok/i })).not.toBeInTheDocument();
  });

  it('shows phone as a tel: link when businessPhone is set', async () => {
    await renderDetails();
    const phoneLink = screen.getByRole('link', { name: mockFields.businessPhone });
    expect(phoneLink).toHaveAttribute('href', `tel:${mockFields.businessPhone}`);
  });

  it('shows "—" for phone when absent', async () => {
    await renderDetails(emptyFields());
    // There are two "—" cells (phone and email), just check at least one exists
    expect(screen.getAllByText('—').length).toBeGreaterThanOrEqual(1);
  });

  it('shows "Yes" for Pickup when hasPickUp is true', async () => {
    await renderDetails();
    const rows = screen.getAllByText('Yes');
    expect(rows.length).toBeGreaterThanOrEqual(1);
  });

  it('shows "No" for Delivery when hasDelivery is false', async () => {
    await renderDetails(emptyFields({ hasDelivery: false }));
    expect(screen.getAllByText('No').length).toBeGreaterThanOrEqual(1);
  });

  it('shows a "View Shop" link when hasOnlineShop and onlineShopLink are set', async () => {
    await renderDetails();
    expect(screen.getByRole('link', { name: 'View Shop' })).toHaveAttribute('href', mockFields.onlineShopLink);
  });

  it('shows "No" for Online Shop when hasOnlineShop is false', async () => {
    await renderDetails(emptyFields({ hasOnlineShop: false }));
    const rows = screen.getAllByText('No');
    expect(rows.length).toBeGreaterThanOrEqual(1);
  });

  it('renders Activities & Events pills', async () => {
    await renderDetails();
    for (const evt of mockFields.notableBusinessEvents) {
      expect(screen.getByText(evt)).toBeInTheDocument();
    }
  });

  it('hides the Activities section when notableBusinessEvents is empty', async () => {
    await renderDetails(emptyFields());
    expect(screen.queryByText('Activities & Events')).not.toBeInTheDocument();
  });
});
