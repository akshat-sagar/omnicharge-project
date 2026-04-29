import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest';

import {
  buildRazorpayMethodConfig,
  buildRazorpayDisplayConfig,
  cleanupRazorpayArtifacts,
} from './razorpay';

beforeEach(() => {
  vi.resetModules();
  document.body.innerHTML = '';
  document.body.style.overflow = 'auto';
  (window as Window & { Razorpay?: unknown }).Razorpay = undefined as any;
});

afterEach(() => {
  vi.restoreAllMocks();
});

describe('buildRazorpayMethodConfig', () => {
  test('enables only UPI for UPI payments', () => {
    expect(buildRazorpayMethodConfig('UPI')).toMatchObject({
      upi: true,
      card: false,
      netbanking: false,
    });

    expect(buildRazorpayMethodConfig('CARD')).toMatchObject({
      upi: false,
      card: true,
      netbanking: false,
    });
  });

  test('enables netbanking only for NETBANKING payments', () => {
    expect(buildRazorpayMethodConfig('NETBANKING')).toMatchObject({
      upi: false,
      card: false,
      netbanking: true,
    });
  });
});

describe('buildRazorpayDisplayConfig', () => {
  test('shows only the selected method in checkout sequence', () => {
    expect(buildRazorpayDisplayConfig('UPI')).toMatchObject({
      display: {
        preferences: false,
        sequence: ['upi'],
      },
    });

    expect(buildRazorpayDisplayConfig('CARD')).toMatchObject({
      display: {
        preferences: false,
        sequence: ['card'],
      },
    });

    expect(buildRazorpayDisplayConfig('NETBANKING')).toMatchObject({
      display: {
        preferences: false,
        sequence: ['netbanking'],
      },
    });
  });
});

describe('cleanupRazorpayArtifacts', () => {
  test('removes injected checkout containers and restores scrolling', () => {
    const container = document.createElement('div');
    container.className = 'razorpay-container';
    document.body.appendChild(container);
    document.body.style.overflow = 'hidden';

    cleanupRazorpayArtifacts();

    expect(document.querySelector('.razorpay-container')).toBeNull();
    expect(document.body.style.overflow).toBe('');
  });
});

describe('loadRazorpayScript', () => {
  test('returns true immediately when Razorpay is already present', async () => {
    const { loadRazorpayScript } = await import('./razorpay');
    (window as Window & { Razorpay?: unknown }).Razorpay = vi.fn();

    await expect(loadRazorpayScript()).resolves.toBe(true);
  });

  test('injects the checkout script and resolves after load', async () => {
    const { loadRazorpayScript, RAZORPAY_CHECKOUT_URL } = await import('./razorpay');

    const promise = loadRazorpayScript();
    const script = document.querySelector<HTMLScriptElement>(
      'script[data-razorpay-checkout="true"]'
    );

    expect(script).not.toBeNull();
    expect(script?.src).toBe(RAZORPAY_CHECKOUT_URL);

    script?.dispatchEvent(new Event('load'));
    await expect(promise).resolves.toBe(true);
  });

  test('recovers after a failed load attempt', async () => {
    const { loadRazorpayScript } = await import('./razorpay');

    const firstAttempt = loadRazorpayScript();
    const firstScript = document.querySelector<HTMLScriptElement>(
      'script[data-razorpay-checkout="true"]'
    );
    firstScript?.dispatchEvent(new Event('error'));
    await expect(firstAttempt).resolves.toBe(false);

    const secondAttempt = loadRazorpayScript();
    const secondScript = document.querySelectorAll<HTMLScriptElement>(
      'script[data-razorpay-checkout="true"]'
    );

    expect(secondScript).toHaveLength(1);
    secondScript[0]?.dispatchEvent(new Event('load'));
    await expect(secondAttempt).resolves.toBe(true);
  });
});
