// @vitest-environment jsdom
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { BusinessHoursBlock } from '../BusinessHoursBlock';
import { openHoursJson } from '../../__tests__/fixtures';
import type { BusinessHoursJson } from '@/lib/getListings';

// America/Chicago Wed 2026-01-07 10:00 AM = UTC 16:00
const WEDNESDAY_10AM_UTC = new Date('2026-01-07T16:00:00.000Z');
// America/Chicago Wed 2026-01-07 8:00 PM = UTC 02:00 next day (after 17:00 close)
const WEDNESDAY_8PM_UTC = new Date('2026-01-08T02:00:00.000Z');

beforeEach(() => {
  vi.useFakeTimers();
});

afterEach(() => {
  vi.useRealTimers();
});

// ── Unknown state ─────────────────────────────────────────────────────────────

describe('BusinessHoursBlock — unknown state', () => {
  it('shows the "view website" message when hoursJson is null', () => {
    render(<BusinessHoursBlock hoursJson={null} />);
    expect(screen.getByText(/view website or social media/i)).toBeInTheDocument();
  });

  it('does not render a <details> element when state is unknown', () => {
    const { container } = render(<BusinessHoursBlock hoursJson={null} />);
    expect(container.querySelector('details')).not.toBeInTheDocument();
  });

  it('shows the "view website" message when hoursJson has empty hours', () => {
    const emptyHours: BusinessHoursJson = { hours: {}, display: [] };
    render(<BusinessHoursBlock hoursJson={emptyHours} />);
    expect(screen.getByText(/view website or social media/i)).toBeInTheDocument();
  });
});

// ── Open state ────────────────────────────────────────────────────────────────

describe('BusinessHoursBlock — open state', () => {
  beforeEach(() => {
    vi.setSystemTime(WEDNESDAY_10AM_UTC);
  });

  it('renders "Currently Open"', () => {
    render(<BusinessHoursBlock hoursJson={openHoursJson} />);
    expect(screen.getByText('Currently Open')).toBeInTheDocument();
  });

  it('renders the closing-time label', () => {
    render(<BusinessHoursBlock hoursJson={openHoursJson} />);
    expect(screen.getByText('Until 5pm')).toBeInTheDocument();
  });

  it('renders a <details> element (collapsible)', () => {
    const { container } = render(<BusinessHoursBlock hoursJson={openHoursJson} />);
    expect(container.querySelector('details')).toBeInTheDocument();
  });

  it('renders day-by-day hours rows from display array', () => {
    render(<BusinessHoursBlock hoursJson={openHoursJson} />);
    expect(screen.getByText('Mon – Fri')).toBeInTheDocument();
    expect(screen.getByText('9am – 5pm')).toBeInTheDocument();
    expect(screen.getByText('Sat – Sun')).toBeInTheDocument();
    expect(screen.getByText('Closed')).toBeInTheDocument();
  });

  it('renders the note when hoursJson.note is set', () => {
    render(<BusinessHoursBlock hoursJson={openHoursJson} />);
    expect(screen.getByText('Closed on public holidays.')).toBeInTheDocument();
  });

  it('does not render a note when hoursJson.note is absent', () => {
    const noNote: BusinessHoursJson = { ...openHoursJson, note: undefined };
    render(<BusinessHoursBlock hoursJson={noNote} />);
    expect(screen.queryByText('Closed on public holidays.')).not.toBeInTheDocument();
  });
});

// ── Closed state ──────────────────────────────────────────────────────────────

describe('BusinessHoursBlock — closed state', () => {
  beforeEach(() => {
    vi.setSystemTime(WEDNESDAY_8PM_UTC);
  });

  it('renders "Currently Closed"', () => {
    render(<BusinessHoursBlock hoursJson={openHoursJson} />);
    expect(screen.getByText('Currently Closed')).toBeInTheDocument();
  });

  it('renders the next-open label', () => {
    render(<BusinessHoursBlock hoursJson={openHoursJson} />);
    expect(screen.getByText('Opens Thu at 9am')).toBeInTheDocument();
  });

  it('renders a <details> element (collapsible)', () => {
    const { container } = render(<BusinessHoursBlock hoursJson={openHoursJson} />);
    expect(container.querySelector('details')).toBeInTheDocument();
  });
});
