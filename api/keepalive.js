/**
 * Keep-alive ping for Supabase.
 *
 * Supabase pauses Free Plan projects after ~7 days of inactivity, and that
 * check is based on real database activity (PostgREST queries that reach
 * Postgres), not on storage or health endpoints. This function performs an
 * UPSERT on a single row so the ping counts as a write query.
 *
 * Triggered daily by the Vercel cron defined in vercel.json.
 */

const RETRY_DELAYS_MS = [0, 1500, 4000];

async function pingDatabase() {
  const { SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY } = process.env;

  if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
    const error = new Error('Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY');
    error.status = 500;
    throw error;
  }

  let lastError;

  for (const delay of RETRY_DELAYS_MS) {
    if (delay > 0) await new Promise((resolve) => setTimeout(resolve, delay));

    try {
      const response = await fetch(`${SUPABASE_URL}/rest/v1/keepalive`, {
        method: 'POST',
        // The row is fixed (id = 1); only pinged_at is refreshed on every run.
        body: JSON.stringify({ id: 1, pinged_at: new Date().toISOString() }),
        cache: 'no-store',
        signal: AbortSignal.timeout(10_000),
        headers: {
          apikey: SUPABASE_SERVICE_ROLE_KEY,
          Authorization: `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
          'Content-Type': 'application/json',
          // INSERT ... ON CONFLICT (id) DO UPDATE SET pinged_at = excluded.pinged_at
          Prefer: 'resolution=merge-duplicates, return=minimal',
          'Cache-Control': 'no-cache, no-store, max-age=0',
          Pragma: 'no-cache'
        }
      });

      if (response.ok) return { attempts: RETRY_DELAYS_MS.indexOf(delay) + 1 };

      // Auth errors never fix themselves: fail fast instead of retrying.
      if (response.status === 401 || response.status === 403) {
        const body = await response.text();
        const error = new Error(`Supabase rejected the ping: ${body}`);
        error.status = response.status;
        throw error;
      }

      lastError = new Error(`Supabase responded ${response.status}: ${await response.text()}`);
    } catch (error) {
      if (error.status === 401 || error.status === 403 || error.status === 500) throw error;
      lastError = error;
    }
  }

  throw lastError;
}

module.exports = async (req, res) => {
  res.setHeader('Cache-Control', 'no-store');

  const { CRON_SECRET } = process.env;
  if (!CRON_SECRET || req.headers.authorization !== `Bearer ${CRON_SECRET}`) {
    return res.status(401).json({ ok: false, error: 'unauthorized' });
  }

  try {
    const { attempts } = await pingDatabase();
    return res.status(200).json({ ok: true, table: 'keepalive', attempts });
  } catch (error) {
    console.error('[keepalive]', error);
    return res.status(error.status || 502).json({ ok: false, error: error.message });
  }
};
