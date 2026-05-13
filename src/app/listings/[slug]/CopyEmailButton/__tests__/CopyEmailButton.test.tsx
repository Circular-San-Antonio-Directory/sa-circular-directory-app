// @vitest-environment jsdom
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, act } from '@testing-library/react';
import { CopyEmailButton } from '../CopyEmailButton';

const EMAIL = 'hello@greencycle.com.au';

beforeEach(() => {
  vi.useFakeTimers();
  Object.defineProperty(navigator, 'clipboard', {
    value: { writeText: vi.fn().mockResolvedValue(undefined) },
    configurable: true,
    writable: true,
  });
});

afterEach(() => {
  vi.useRealTimers();
  vi.restoreAllMocks();
});

describe('CopyEmailButton', () => {
  it('renders the email address text', () => {
    render(<CopyEmailButton email={EMAIL} />);
    expect(screen.getByText(EMAIL)).toBeInTheDocument();
  });

  it('shows the copy icon before clicking', () => {
    render(<CopyEmailButton email={EMAIL} />);
    const icon = screen.getByRole('button').querySelector('i');
    expect(icon?.className).toContain('fa-regular');
    expect(icon?.className).toContain('fa-copy');
  });

  it('copies the email to clipboard when clicked', async () => {
    render(<CopyEmailButton email={EMAIL} />);
    await act(async () => { fireEvent.click(screen.getByRole('button')); });
    expect(navigator.clipboard.writeText).toHaveBeenCalledWith(EMAIL);
  });

  it('shows "Copied!" text immediately after clicking', async () => {
    render(<CopyEmailButton email={EMAIL} />);
    await act(async () => { fireEvent.click(screen.getByRole('button')); });
    expect(screen.getByText('Copied!')).toBeInTheDocument();
  });

  it('shows the check icon immediately after clicking', async () => {
    render(<CopyEmailButton email={EMAIL} />);
    await act(async () => { fireEvent.click(screen.getByRole('button')); });
    const icon = screen.getByRole('button').querySelector('i');
    expect(icon?.className).toContain('fa-solid');
    expect(icon?.className).toContain('fa-check');
  });

  it('reverts to the email text after 2 seconds', async () => {
    render(<CopyEmailButton email={EMAIL} />);
    await act(async () => { fireEvent.click(screen.getByRole('button')); });
    expect(screen.getByText('Copied!')).toBeInTheDocument();
    await act(async () => { vi.advanceTimersByTime(2000); });
    expect(screen.getByText(EMAIL)).toBeInTheDocument();
    expect(screen.queryByText('Copied!')).not.toBeInTheDocument();
  });
});
