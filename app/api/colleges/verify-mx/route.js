import dns from 'dns';
import { NextResponse } from 'next/server';

// Ensure standard reliable DNS resolvers (Google & Cloudflare) for consistent MX resolution across local networks
const dnsResolver = new dns.Resolver();
dnsResolver.setServers(['8.8.8.8', '1.1.1.1', '8.8.4.4']);

const resolveMxAsync = (domain) => {
  return new Promise((resolve) => {
    dnsResolver.resolveMx(domain, (err, addresses) => {
      if (err || !addresses || addresses.length === 0) {
        resolve({ valid: false, addresses: [], error: err ? err.code : 'NO_MX_RECORDS' });
      } else {
        const sorted = addresses.sort((a, b) => a.priority - b.priority);
        resolve({ valid: true, addresses: sorted, error: null });
      }
    });
  });
};

export async function POST(request) {
  try {
    const body = await request.json();
    const { email, domain } = body;

    let targetDomain = domain;
    if (!targetDomain && email && email.includes('@')) {
      targetDomain = email.split('@')[1].trim().toLowerCase();
    }

    if (!targetDomain) {
      return NextResponse.json(
        { error: 'Email or domain parameter is required', success: false },
        { status: 400 }
      );
    }

    const startTime = Date.now();
    const result = await resolveMxAsync(targetDomain);
    const lookupDurationMs = Date.now() - startTime;

    return NextResponse.json({
      success: true,
      domain: targetDomain,
      hasMxRecords: result.valid,
      mxRecords: result.addresses,
      lookupDurationMs,
      deliverabilityScore: result.valid ? (result.addresses.length > 1 ? 100 : 85) : 0,
      status: result.valid ? 'ACTIVE_MAIL_SERVER' : 'NO_MAIL_SERVER',
      primaryServer: result.addresses.length > 0 ? result.addresses[0].exchange : null
    });
  } catch (error) {
    return NextResponse.json(
      { error: 'MX lookup failed: ' + error.message, success: false },
      { status: 500 }
    );
  }
}
