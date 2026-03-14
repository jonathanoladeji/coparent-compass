module.exports = async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const apiKey = process.env.Coparent_Comp_Key;
  if (!apiKey) return res.status(500).json({ error: 'API key not configured. Add Coparent_Comp_Key to Vercel environment variables.' });

  try {
    let body = req.body;
    if (typeof body === 'string') {
      try { body = JSON.parse(body); } catch(e) {
        return res.status(400).json({ error: 'Invalid JSON body' });
      }
    }
    if (!body || typeof body !== 'object') {
      return res.status(400).json({ error: 'Request body is missing or not an object' });
    }

    // ── Creator pass verification (separate action, no Anthropic call needed) ──
    if (body._action === 'verify_creator') {
      const creatorPass = process.env.CREATOR_PASS;
      if (!creatorPass) return res.status(200).json({ ok: false, reason: 'not_configured' });
      const match = body._pass === creatorPass;
      return res.status(200).json({ ok: match });
    }

    // Only send web search beta header when needed
    const usesWebSearch = Array.isArray(body.tools) &&
      body.tools.some(t => t.type === 'web_search_20250305');

    const headers = {
      'Content-Type': 'application/json',
      'x-api-key': apiKey,
      'anthropic-version': '2023-06-01',
    };
    if (usesWebSearch) headers['anthropic-beta'] = 'web-search-2025-03-05';

    // Strip internal fields before forwarding to Anthropic
    const { _action, _pass, ...anthropicBody } = body;

    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers,
      body: JSON.stringify(anthropicBody),
    });

    const data = await response.json();
    if (!response.ok) return res.status(response.status).json(data);
    return res.status(200).json(data);

  } catch (error) {
    return res.status(500).json({ error: 'Proxy error: ' + error.message });
  }
};
