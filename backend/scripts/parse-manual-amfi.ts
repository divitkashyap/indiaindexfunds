import fs from 'fs';
import path from 'path';

type AmfiRow = {
  schemeCode: string;
  isinDivGrowth?: string;
  isinDivReinv?: string;
  schemeName: string;
  nav: number;
  date: string;
  rta?: string;
  rtaCode?: string;
  amc?: string;
};

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
  const headerIndex = lines.findIndex(l => /Scheme Code;/i.test(l));

  if (headerIndex >= 0) {
    const header = lines[headerIndex];
    console.log('📋 AMFI Header found:', header);
    const headerParts = header.split(';').map(h => h.trim().toLowerCase());
    console.log('📋 Column indices:', headerParts.map((h, i) => `${i}: ${h}`).join(', '));
  }

  const dataLines = headerIndex >= 0 ? lines.slice(headerIndex + 1) : lines;

  const rows: AmfiRow[] = [];
  let skippedCount = 0;

  for (const line of dataLines) {
    const parts = line.split(';');
    if (parts.length < 6) {
      skippedCount++;
      continue;
    }

    const schemeCode = parts[0]?.trim();
    const isinDivGrowth = parts[1]?.trim();
    const isinDivReinv = parts[2]?.trim();
    const schemeName = parts[3]?.trim();
    const navStr = parts[4]?.trim();
    const date = parts[5]?.trim();

    const nav = parseFloat(navStr || '');
    if (Number.isNaN(nav)) {
      skippedCount++;
      continue;
    }

    // Skip rows where scheme name is missing or looks like an ISIN
    if (!schemeName || /^IN[A-Z0-9]{10}$/i.test(schemeName)) {
      skippedCount++;
      continue;
    }

    let amc: string | undefined;
    const amcMatch = schemeName.match(/^([A-Z\s&]+(?:MUTUAL FUND|MF|ASSET MANAGEMENT))/i);
    if (amcMatch) {
      amc = amcMatch[1].trim();
    } else {
      const words = schemeName.split(/\s+/);
      if (words.length >= 2) {
        amc = words.slice(0, 2).join(' ');
      }
    }

    rows.push({
      schemeCode,
      schemeName,
      isinDivGrowth: isinDivGrowth || undefined,
      isinDivReinv: isinDivReinv || undefined,
      nav,
      date: date || '',
      amc,
    });
  }

  console.log(`✅ Parsed ${rows.length} valid rows (skipped ${skippedCount} invalid)`);
  return rows;
}

async function main() {
  const inputPath = path.join(__dirname, '..', 'data', 'NAVAll.txt');
  const outputPath = path.join(__dirname, '..', 'data', 'index-funds-cache.json');

  if (!fs.existsSync(inputPath)) {
    console.error('❌ NAVAll.txt not found!');
    console.log('\n📝 Steps to fix:');
    console.log('1. Open in Chrome: https://www.amfiindia.com/spages/NAVAll.txt');
    console.log('2. Right-click → Save As');
    console.log(`3. Save to: ${inputPath}`);
    console.log('4. Run this script again');
    process.exit(1);
  }

  console.log('📖 Reading manually downloaded NAVAll.txt...');
  const text = fs.readFileSync(inputPath, 'utf8');

  console.log('🔍 Parsing AMFI data...');
  const all = parseAmfiNavAll(text);
  console.log(`Found ${all.length} total funds`);

  const uniqueByIsin = new Map<string, AmfiRow>();
  for (const row of all) {
    if (!row.schemeName) continue;
    const key = row.isinDivGrowth || row.isinDivReinv || `${row.schemeCode}:${row.schemeName}`;
    if (!uniqueByIsin.has(key)) uniqueByIsin.set(key, row);
  }

  const indexFunds = Array.from(uniqueByIsin.values()).map(r => ({
    schemeCode: r.schemeCode,
    schemeName: r.schemeName,
    isin: r.isinDivGrowth || r.isinDivReinv || null,
    nav: r.nav,
    date: r.date,
    amc: r.amc || null,
  }));

  console.log(`✅ Found ${indexFunds.length} index funds`);

  const cache = {
    count: indexFunds.length,
    funds: indexFunds,
    generatedAt: new Date().toISOString(),
    source: 'manual-download',
  };

  fs.writeFileSync(outputPath, JSON.stringify(cache, null, 2));
  console.log(`💾 Wrote cache to ${outputPath}`);
  console.log('\n🎉 Done! Your API will now use this cached data.');
}

main().catch(console.error);
