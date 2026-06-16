import { list, put, del } from '@vercel/blob';

// One blob per puzzle under puzzles/<id>.json. A save is an isolated put and a
// delete is an isolated del, so concurrent or rapid operations can never drop a
// sibling puzzle the way a single shared read-modify-write file would. list()
// uses the strongly-consistent metadata API; per-puzzle content is immutable
// (a re-save overwrites only its own blob), so content caching is harmless.
const PREFIX = 'puzzles/';
const TOKEN = () => process.env.BLOB_READ_WRITE_TOKEN;

// Ids are server-generated as pz_<base36>_<6 chars>. Restrict to this charset
// so a crafted id (e.g. "../foo") can never escape the puzzles/ prefix when
// interpolated into the blob pathname.
const VALID_ID = /^[A-Za-z0-9_]{1,40}$/;

function pathFor(id) { return `${PREFIX}${id}.json`; }

async function readAll() {
  const { blobs } = await list({ prefix: PREFIX, access: 'private' });
  const items = await Promise.all(blobs.map(async b => {
    const res = await fetch(b.url + (b.url.includes('?') ? '&' : '?') + 'v=' + Date.now(), {
      headers: { Authorization: `Bearer ${TOKEN()}` },
      cache: 'no-store',
    });
    if (!res.ok) { console.error('blob read failed', b.url, res.status); return null; }
    try { return await res.json(); } catch (e) { console.error('blob parse failed', b.url, e); return null; }
  }));
  return items.filter(Boolean).sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));
}

function isValidPuzzle(p) {
  if (!p || typeof p !== 'object') return false;
  if (typeof p.name !== 'string' || !p.name.trim()) return false;
  if (!Array.isArray(p.grid) || p.grid.length < 1 || p.grid.length > 40) return false;
  if (!p.grid.every(row => Array.isArray(row) && row.length <= 40)) return false;
  if (!Array.isArray(p.words) || p.words.length > 300) return false;
  if (!p.words.every(w => w && typeof w.word === 'string' && Array.isArray(w.cells))) return false;
  if (p.id != null && !VALID_ID.test(p.id)) return false;
  return true;
}

export default async function handler(req, res) {
  res.setHeader('Cache-Control', 'no-store');
  try {
    if (req.method === 'GET') {
      return res.status(200).json({ version: 1, puzzles: await readAll() });
    }

    if (req.method === 'POST') {
      const p = req.body && typeof req.body === 'object' ? req.body : null;
      if (!isValidPuzzle(p)) return res.status(400).json({ error: 'Invalid puzzle' });

      const now = Date.now();
      const id = p.id || `pz_${now.toString(36)}_${Math.random().toString(36).slice(2, 8)}`;
      const puzzle = {
        id,
        name: p.name.slice(0, 80),
        lang: p.lang === 'he' ? 'he' : 'en',
        rows: p.rows | 0,
        cols: p.cols | 0,
        grid: p.grid,
        words: p.words,
        createdAt: p.createdAt || now,
        updatedAt: now,
      };
      await put(pathFor(id), JSON.stringify(puzzle), {
        access: 'private',
        allowOverwrite: true,
        addRandomSuffix: false,
        contentType: 'application/json',
      });
      return res.status(200).json(puzzle);
    }

    if (req.method === 'DELETE') {
      const id = req.query?.id;
      if (!id || !VALID_ID.test(id)) return res.status(400).json({ error: 'Invalid id' });
      await del(pathFor(id), { token: TOKEN() });
      return res.status(200).json({ ok: true });
    }

    res.setHeader('Allow', 'GET, POST, DELETE');
    return res.status(405).json({ error: 'Method not allowed' });
  } catch (err) {
    return res.status(500).json({ error: 'Server error', detail: String(err?.message || err) });
  }
}
