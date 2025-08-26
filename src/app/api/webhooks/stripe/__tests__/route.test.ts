import { POST } from '../route';
import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { createClient } from '@/lib/supabaseClient';

// Mock next/server to provide NextRequest and NextResponse
jest.mock('next/server', () => {
  class MockNextRequest {
    url: string;
    method: string;
    headers: Headers;
    body: any;
    json: jest.Mock;

    constructor(input: RequestInfo, init?: RequestInit) {
      this.url = typeof input === 'string' ? input : input.url;
      this.method = init?.method || 'GET';
      this.headers = new Headers(init?.headers);
      this.body = init?.body;
      this.json = jest.fn(() => Promise.resolve(JSON.parse(init?.body?.toString() || '{}')));
    }
  }

  class MockNextResponse {
    body: any;
    status: number;
    headers: Headers;
    json: jest.Mock;

    constructor(body?: BodyInit | null, init?: ResponseInit) {
      this.body = body;
      this.status = init?.status || 200;
      this.headers = new Headers(init?.headers);
      this.json = jest.fn(() => Promise.resolve(JSON.parse(body?.toString() || '{}')));
    }
  }

  return {
    NextRequest: MockNextRequest,
    NextResponse: MockNextResponse,
  };
});

// Mock Stripe
jest.mock('stripe', () => {
  const StripeMock = jest.fn(() => ({
    webhooks: {
      constructEvent: jest.fn(),
    },
    checkout: {
      sessions: {
        retrieve: jest.fn(),
      },
    },
  }));
  StripeMock.Checkout = {
    SessionCreateParams: { LineItem: {} },
  };
  return StripeMock;
});

// Mock Supabase client
jest.mock('@/lib/supabaseClient', () => ({
  createClient: jest.fn(() => ({
    from: jest.fn(() => ({
      insert: jest.fn(() => ({
        select: jest.fn(() => ({
          single: jest.fn(),
        })),
        then: jest.fn(),
      })),
      select: jest.fn(() => ({
        eq: jest.fn(() => ({
          single: jest.fn(),
        })),
      })),
    })),
    rpc: jest.fn(),
  })),
}));

// Mock Resend
jest.mock('resend', () => ({
  Resend: jest.fn(() => ({
    emails: {
      send: jest.fn(),
    },
  })),
}));

const mockStripe = new Stripe('sk_test_mock');
const mockSupabase = createClient();
const mockResend = new (require('resend').Resend)();

describe('POST /api/webhooks/stripe', () => {
  const MOCK_EVENT_ID = 'evt_test_123';
  const MOCK_SESSION_ID = 'cs_test_123';
  const MOCK_PRODUCT_ID = 'prod_test_123';
  const MOCK_USER_ID = 'user_test_123';
  const MOCK_CUSTOMER_EMAIL = 'test@example.com';

  const createMockRequest = (eventId: string, sessionStatus: string = 'completed', clientReferenceId: string | null = MOCK_USER_ID) => {
    const eventData = {
      id: eventId,
      type: `checkout.session.${sessionStatus}`,
      data: {
        object: {
          id: MOCK_SESSION_ID,
          customer_details: { email: MOCK_CUSTOMER_EMAIL },
          client_reference_id: clientReferenceId,
          amount_total: 1000,
          currency: 'jpy',
        },
      },
    };
    const req = new NextRequest('http://localhost/api/webhooks/stripe', {
      method: 'POST',
      headers: { 'stripe-signature': 'mock_signature' },
      body: JSON.stringify(eventData),
    });
    (req.text as jest.Mock) = jest.fn(() => Promise.resolve(JSON.stringify(eventData)));
    return req;
  };

  beforeEach(() => {
    jest.clearAllMocks();
    (Stripe as jest.Mock).mockReturnValue(mockStripe);
    (createClient as jest.Mock).mockReturnValue(mockSupabase);
    (mockSupabase.from as jest.Mock).mockReturnValue({
      insert: jest.fn(() => ({
        select: jest.fn(() => ({
          single: jest.fn(),
        })),
        then: jest.fn(),
      })),
      select: jest.fn(() => ({
        eq: jest.fn(() => ({
          single: jest.fn(),
        })),
      })),
    });
    (mockSupabase.rpc as jest.Mock).mockResolvedValue({ error: null });
    (mockResend.emails.send as jest.Mock).mockResolvedValue({ data: { id: 'email_sent' }, error: null });

    // Default mock for constructEvent to succeed
    (mockStripe.webhooks.constructEvent as jest.Mock).mockReturnValue({
      id: MOCK_EVENT_ID,
      type: 'checkout.session.completed',
      data: {
        object: {
          id: MOCK_SESSION_ID,
          customer_details: { email: MOCK_CUSTOMER_EMAIL },
          client_reference_id: MOCK_USER_ID,
          amount_total: 1000,
          currency: 'jpy',
        },
      },
    });

    // Default mock for retrieve session
    (mockStripe.checkout.sessions.retrieve as jest.Mock).mockResolvedValue({
      line_items: {
        data: [
          {
            price: { product: { id: MOCK_PRODUCT_ID } },
            quantity: 1,
            price: { unit_amount: 1000 },
          },
        ],
      },
    });

    // Default mock for product lookup
    (mockSupabase.from().select().eq().single as jest.Mock).mockResolvedValue({
      data: { id: 'supabase_prod_id', stripe_product_id: MOCK_PRODUCT_ID },
      error: null,
    });

    // Default mock for order insert
    (mockSupabase.from('orders').insert().select().single as jest.Mock).mockResolvedValue({
      data: { id: 'order_id_123' },
      error: null,
    });

    // Default mock for order details insert
    (mockSupabase.from('order_details').insert as jest.Mock).mockResolvedValue({ error: null });
  });

  it('should return 200 and process the event if it's not a duplicate', async () => {
    // First call: processed_stripe_events.insert succeeds
    (mockSupabase.from('processed_stripe_events').insert as jest.Mock).mockResolvedValueOnce({ error: null });

    const req = createMockRequest(MOCK_EVENT_ID);
    const res = await POST(req);

    expect(res.status).toBe(200);
    expect(await res.json()).toEqual({ received: true });
    expect(mockSupabase.from('orders').insert).toHaveBeenCalledTimes(1);
    expect(mockSupabase.from('order_details').insert).toHaveBeenCalledTimes(1);
    expect(mockSupabase.rpc).toHaveBeenCalledTimes(1);
    expect(mockResend.emails.send).toHaveBeenCalledTimes(1);
  });

  it('should return 200 and not process the event if it's a duplicate', async () => {
    // First call: processed_stripe_events.insert fails (duplicate key error)
    (mockSupabase.from('processed_stripe_events').insert as jest.Mock).mockResolvedValueOnce({
      error: { code: '23505' }, // PostgreSQL unique_violation error code
    });

    const req = createMockRequest(MOCK_EVENT_ID);
    const res = await POST(req);

    expect(res.status).toBe(200);
    expect(await res.json()).toEqual({ received: true, message: 'Duplicate event' });
    expect(mockSupabase.from('orders').insert).not.toHaveBeenCalled();
    expect(mockSupabase.from('order_details').insert).not.toHaveBeenCalled();
    expect(mockSupabase.rpc).not.toHaveBeenCalled();
    expect(mockResend.emails.send).not.toHaveBeenCalled();
  });

  it('should log an error if webhook signature verification fails', async () => {
    (mockStripe.webhooks.constructEvent as jest.Mock).mockImplementationOnce(() => {
      throw new Error('Invalid signature');
    });

    const req = createMockRequest(MOCK_EVENT_ID);
    const res = await POST(req);

    expect(res.status).toBe(400);
    expect(await res.json()).toEqual({ error: 'Webhook Error: Invalid signature' });
    expect(mockSupabase.from('app_errors').insert).toHaveBeenCalledWith(expect.objectContaining({
      source: 'webhook_signature_verification',
      error_message: 'Invalid signature',
    }));
  });

  it('should log an error if database error occurs during idempotency check', async () => {
    (mockSupabase.from('processed_stripe_events').insert as jest.Mock).mockResolvedValueOnce({
      error: { code: '500', message: 'DB connection error' },
    });

    const req = createMockRequest(MOCK_EVENT_ID);
    const res = await POST(req);

    expect(res.status).toBe(500);
    expect(await res.json()).toEqual({ error: 'Database error during event processing' });
    expect(mockSupabase.from('app_errors').insert).toHaveBeenCalledWith(expect.objectContaining({
      source: 'webhook_idempotency_check',
      error_message: 'DB connection error',
    }));
  });

  it('should handle missing customer email gracefully', async () => {
    (mockStripe.webhooks.constructEvent as jest.Mock).mockReturnValueOnce({
      id: MOCK_EVENT_ID,
      type: 'checkout.session.completed',
      data: {
        object: {
          id: MOCK_SESSION_ID,
          customer_details: { email: null }, // Missing email
          client_reference_id: MOCK_USER_ID,
          amount_total: 1000,
          currency: 'jpy',
        },
      },
    });

    const req = createMockRequest(MOCK_EVENT_ID);
    const res = await POST(req);

    expect(res.status).toBe(200);
    expect(await res.json()).toEqual({ received: true });
    expect(mockSupabase.from('orders').insert).not.toHaveBeenCalled(); // Should not save order
    expect(mockSupabase.from('app_errors').insert).toHaveBeenCalledWith(expect.objectContaining({
      source: 'webhook_order_processing',
      error_message: 'Critical data missing in session (email).',
    }));
  });

  it('should handle guest checkout (null userId) correctly', async () => {
    (mockStripe.webhooks.constructEvent as jest.Mock).mockReturnValueOnce({
      id: MOCK_EVENT_ID,
      type: 'checkout.session.completed',
      data: {
        object: {
          id: MOCK_SESSION_ID,
          customer_details: { email: MOCK_CUSTOMER_EMAIL },
          client_reference_id: null, // Null userId for guest
          amount_total: 1000,
          currency: 'jpy',
        },
      },
    });

    const req = createMockRequest(MOCK_EVENT_ID);
    const res = await POST(req);

    expect(res.status).toBe(200);
    expect(await res.json()).toEqual({ received: true });
    expect(mockSupabase.from('orders').insert).toHaveBeenCalledWith(expect.objectContaining({
      user_id: null, // Expect null user_id
      customer_email: MOCK_CUSTOMER_EMAIL,
    }));
    expect(mockSupabase.from('order_details').insert).toHaveBeenCalledTimes(1);
    expect(mockSupabase.rpc).toHaveBeenCalledTimes(1);
  });
});
