import { POST } from '../route';
import { cookies } from 'next/headers';
import Stripe from 'stripe';
import { createServerClient } from '@supabase/ssr';
import { createClient as createAdminClient } from '@/lib/supabaseClient';

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

// Mock next/headers to control cookies
jest.mock('next/headers', () => ({
  cookies: jest.fn(),
}));

// Mock @supabase/ssr to control Supabase client behavior
jest.mock('@supabase/ssr', () => ({
  createServerClient: jest.fn(() => ({
    auth: {
      getSession: jest.fn(),
    },
    from: jest.fn(() => ({
      select: jest.fn(() => ({
        eq: jest.fn(() => ({
          single: jest.fn(),
        })),
      })),
    })),
  })),
}));

// Mock stripe
jest.mock('stripe', () => {
  const StripeMock = jest.fn(() => ({
    checkout: {
      sessions: {
        create: jest.fn(),
      },
    },
  }));
  StripeMock.Checkout = {
    SessionCreateParams: { LineItem: {} },
  };
  return StripeMock;
});

// Mock admin client for error logging
jest.mock('@/lib/supabaseClient', () => ({
  createClient: jest.fn(() => ({
    from: jest.fn(() => ({
      insert: jest.fn(() => ({
        then: jest.fn(),
      })),
    })),
  })),
}));

const mockSupabase = createServerClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!, {
  cookies: {
    get: jest.fn(),
  },
});

const mockStripe = new Stripe('sk_test_mock');

const mockAdminSupabase = createAdminClient();

describe('POST /api/checkout/quick-buy', () => {
  // Helper to create a mock NextRequest
  const createMockRequest = (body: any, headers: Record<string, string> = {}) => {
    const req = new NextRequest('http://localhost/api/checkout/quick-buy', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...headers },
      body: JSON.stringify(body),
    });
    // Mock req.json() as it's called internally
    (req.json as jest.Mock) = jest.fn(() => Promise.resolve(body));
    return req;
  };

  beforeEach(() => {
    jest.clearAllMocks();
    (cookies as jest.Mock).mockReturnValue({
      get: jest.fn(),
    });
    (createServerClient as jest.Mock).mockReturnValue(mockSupabase);
    (Stripe as jest.Mock).mockReturnValue(mockStripe);
    (createAdminClient as jest.Mock).mockReturnValue(mockAdminSupabase);
  });

  it('should return 401 if user is not authenticated', async () => {
    (mockSupabase.auth.getSession as jest.Mock).mockResolvedValueOnce({
      data: { session: null },
      error: null,
    });

    const req = createMockRequest({ productId: 'prod1', quantity: 1 });
    const res = await POST(req);

    expect(res.status).toBe(401);
    expect(await res.json()).toEqual({ error: 'Unauthorized' });
  });

  it('should return 400 if productId or quantity is missing', async () => {
    (mockSupabase.auth.getSession as jest.Mock).mockResolvedValueOnce({
      data: { session: { user: { id: 'user1' } } },
      error: null,
    });

    const req1 = createMockRequest({ quantity: 1 });
    const res1 = await POST(req1);
    expect(res1.status).toBe(400);
    expect(await res1.json()).toEqual({ error: 'Product ID and a valid quantity are required' });

    const req2 = createMockRequest({ productId: 'prod1' });
    const res2 = await POST(req2);
    expect(res2.status).toBe(400);
    expect(await res2.json()).toEqual({ error: 'Product ID and a valid quantity are required' });

    const req3 = createMockRequest({ productId: 'prod1', quantity: 0 });
    const res3 = await POST(req3);
    expect(res3.status).toBe(400);
    expect(await res3.json()).toEqual({ error: 'Product ID and a valid quantity are required' });
  });

  it('should return 400 if product is not found', async () => {
    (mockSupabase.auth.getSession as jest.Mock).mockResolvedValueOnce({
      data: { session: { user: { id: 'user1' } } },
      error: null,
    });
    (mockSupabase.from as jest.Mock).mockReturnValueOnce({
      select: jest.fn(() => ({
        eq: jest.fn(() => ({
          single: jest.fn().mockResolvedValueOnce({ data: null, error: { message: 'Not found' } }),
        })),
      })),
    });

    const req = createMockRequest({ productId: 'nonexistent', quantity: 1 });
    const res = await POST(req);

    expect(res.status).toBe(500);
    expect(await res.json()).toEqual({ error: 'Product with ID nonexistent not found.' });
  });

  it('should return 400 if product has insufficient stock', async () => {
    (mockSupabase.auth.getSession as jest.Mock).mockResolvedValueOnce({
      data: { session: { user: { id: 'user1' } } },
      error: null,
    });
    (mockSupabase.from as jest.Mock).mockReturnValueOnce({
      select: jest.fn(() => ({
        eq: jest.fn(() => ({
          single: jest.fn().mockResolvedValueOnce({
            data: { id: 'prod1', name: 'Test Product', stock_quantity: 5, stripe_price_id: 'price_123' },
            error: null,
          }),
        })),
      })),
    });

    const req = createMockRequest({ productId: 'prod1', quantity: 10 });
    const res = await POST(req);

    expect(res.status).toBe(400);
    expect(await res.json()).toEqual({ error: 'Insufficient stock for Test Product. Only 5 available.' });
  });

  it('should return 400 if product is missing stripe_price_id', async () => {
    (mockSupabase.auth.getSession as jest.Mock).mockResolvedValueOnce({
      data: { session: { user: { id: 'user1' } } },
      error: null,
    });
    (mockSupabase.from as jest.Mock).mockReturnValueOnce({
      select: jest.fn(() => ({
        eq: jest.fn(() => ({
          single: jest.fn().mockResolvedValueOnce({
            data: { id: 'prod1', name: 'Test Product', stock_quantity: 10, stripe_price_id: null },
            error: null,
          }),
        })),
      })),
    });

    const req = createMockRequest({ productId: 'prod1', quantity: 5 });
    const res = await POST(req);

    expect(res.status).toBe(500);
    expect(await res.json()).toEqual({ error: `Product 'Test Product' is not configured for sale.` });
  });

  it('should return Stripe checkout URL on success', async () => {
    (mockSupabase.auth.getSession as jest.Mock).mockResolvedValueOnce({
      data: { session: { user: { id: 'user1' } } },
      error: null,
    });
    (mockSupabase.from as jest.Mock).mockReturnValueOnce({
      select: jest.fn(() => ({
        eq: jest.fn(() => ({
          single: jest.fn().mockResolvedValueOnce({
            data: { id: 'prod1', name: 'Test Product', stock_quantity: 10, stripe_price_id: 'price_123' },
            error: null,
          }),
        })),
      })),
    });
    (mockStripe.checkout.sessions.create as jest.Mock).mockResolvedValueOnce({
      url: 'https://checkout.stripe.com/session_id',
    });

    const req = createMockRequest({ productId: 'prod1', quantity: 5 });
    const res = await POST(req);

    expect(res.status).toBe(200);
    expect(await res.json()).toEqual({ url: 'https://checkout.stripe.com/session_id' });
    expect(mockStripe.checkout.sessions.create).toHaveBeenCalledWith({
      payment_method_types: ['card'],
      line_items: [{
        price: 'price_123',
        quantity: 5,
      }],
      mode: 'payment',
      success_url: expect.any(String),
      cancel_url: expect.any(String),
      billing_address_collection: 'required',
      client_reference_id: 'user1',
    });
  });

  it('should log error to Supabase on failure', async () => {
    (mockSupabase.auth.getSession as jest.Mock).mockResolvedValueOnce({
      data: { session: null }, // Simulate unauthorized
      error: null,
    });

    const req = createMockRequest({ productId: 'prod1', quantity: 1 });
    await POST(req);

    expect(mockAdminSupabase.from).toHaveBeenCalledWith('app_errors');
    expect(mockAdminSupabase.from().insert).toHaveBeenCalledWith(expect.objectContaining({
      source: 'quick_buy_api',
      error_message: 'Unauthorized',
    }));
  });
});