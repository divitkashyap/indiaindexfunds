import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';
import fetch from 'node-fetch';

dotenv.config();

type AmfiRow = {
  schemeCode: string;
  isinDivGrowth?: string;
  isinDivReinv?: string;
  schemeName: string;
  nav: number;
  date: string;
  amc?: string;
};

const AMFI_NAV_ALL_URL = process.env.AMFI_NAV_URL || 'https://www.amfiindia.com/spages/NAVAll.txt';
const AMFI_FETCH_TIMEOUT_MS = 10000;

function isIndexLikeName(name: string): boolean {
  const n = name.toLowerCase();
  return (
    n.includes('index') ||
    n.includes('nifty') ||
    n.includes('sensex') ||
    n.includes('etf') ||
    n.includes('benchmark') ||
    n.includes('nse') ||
    n.includes('bse')
  );
}

function parseAmfiNavAll(text: string): AmfiRow[] {
  const lines = text.split(/\r?\n/).filter(l => l.trim().length > 0);
  const headerIndex = lines.findIndex(l => /Scheme Code;Scheme Name/i.test(l));
  const dataLines = headerIndex >= 0 ? lines.slice(headerIndex + 1) : lines;

  const rows: AmfiRow[] = [];
  for (const line of dataLines) {
    const parts = line.split(';');
    if (parts.length < 6) continue;
    const [schemeCode, schemeName, isinDivGrowth, isinDivReinv, navStr, date, , , amc] = parts;
    const nav = parseFloat(navStr);
    if (Number.isNaN(nav)) continue;
    rows.push({
      schemeCode: schemeCode?.trim(),
      schemeName: schemeName?.trim(),
      isinDivGrowth: isinDivGrowth?.trim() || undefined,
      isinDivReinv: isinDivReinv?.trim() || undefined,
      nav,
      date: date?.trim(),
      amc: amc?.trim(),
    });
  }
  return rows;
}

async function fetchAmfiAll(): Promise<AmfiRow[]> {
  // Prefer local NAVAll.txt if available
  const localPath = path.join(__dirname, '..', 'data', 'NAVAll.txt');
  if (fs.existsSync(localPath)) {
    const text = fs.readFileSync(localPath, 'utf8');
    if (text && text.length > 1000) {
      console.log(`[daily-fund-sync] Using local NAVAll.txt at ${localPath}`);
      return parseAmfiNavAll(text);
    }
  }

  const controller = new AbortController();
  const to = setTimeout(() => controller.abort(), AMFI_FETCH_TIMEOUT_MS);
  try {
    const res = await fetch(AMFI_NAV_ALL_URL, {
      headers: {
        'User-Agent': 'indiaindexfunds/1.0 (+https://github.com/divitkashyap/indiaindexfunds)',
      },
      signal: controller.signal,
    });
    if (!res.ok) {
      throw new Error(`AMFI fetch failed with status ${res.status}`);
    }
    const text = await res.text();
    if (!text || text.length < 1000) {
      throw new Error(`AMFI payload too small (${text.length} bytes)`);
    }
    return parseAmfiNavAll(text);
  } finally {
    clearTimeout(to);
  }
}

async function main() {
  try {
    console.log('[daily-fund-sync] Fetching AMFI NAVAll...');
    const all = await fetchAmfiAll();

    const uniqueByIsin = new Map<string, AmfiRow>();
    for (const row of all) {
      if (!row.schemeName) continue;
      if (!isIndexLikeName(row.schemeName)) continue;
      const key = row.isinDivGrowth || row.isinDivReinv || `${row.schemeCode}:${row.schemeName}`;
      if (!uniqueByIsin.has(key)) uniqueByIsin.set(key, row);
    }

    const list = Array.from(uniqueByIsin.values()).map(r => ({
      schemeCode: r.schemeCode,
      schemeName: r.schemeName,
      isin: r.isinDivGrowth || r.isinDivReinv || null,
      nav: r.nav,
      date: r.date,
      amc: r.amc || null,
    }));

    const outDir = path.join(__dirname, '..', 'data');
    const outPath = path.join(outDir, 'index-funds-cache.json');
    if (!fs.existsSync(outDir)) {
      fs.mkdirSync(outDir, { recursive: true });
    }

    const payload = {
      generatedAt: new Date().toISOString(),
      count: list.length,
      funds: list,
    };

    fs.writeFileSync(outPath, JSON.stringify(payload, null, 2), 'utf8');
    console.log(`[daily-fund-sync] Wrote ${list.length} funds to ${outPath}`);
  } catch (err) {
    console.error('[daily-fund-sync] Failed:', err);
    process.exitCode = 1;
  }
}

void main();
