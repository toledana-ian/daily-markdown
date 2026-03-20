import { act, renderHook, waitFor } from '@testing-library/react';
import { afterEach, describe, expect, it } from 'vitest';
import { useTailwindScreen } from '@/hooks/useTailwindScreen';

const setViewportWidth = (width: number) => {
  window.innerWidth = width;
  window.dispatchEvent(new Event('resize'));
};

describe('useTailwindScreen', () => {
  afterEach(() => {
    setViewportWidth(1024);
  });

  it('returns the current Tailwind breakpoint from the viewport width', async () => {
    window.innerWidth = 500;

    const { result } = renderHook(() => useTailwindScreen());

    await waitFor(() => {
      expect(result.current).toBe('base');
    });

    act(() => {
      setViewportWidth(640);
    });

    await waitFor(() => {
      expect(result.current).toBe('sm');
    });

    act(() => {
      setViewportWidth(900);
    });

    await waitFor(() => {
      expect(result.current).toBe('md');
    });

    act(() => {
      setViewportWidth(1280);
    });

    await waitFor(() => {
      expect(result.current).toBe('xl');
    });

    act(() => {
      setViewportWidth(1600);
    });

    await waitFor(() => {
      expect(result.current).toBe('2xl');
    });
  });
});
