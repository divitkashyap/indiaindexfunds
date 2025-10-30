// Script to find valid ISINs from mf.captnemo.in API
// This will help us discover real, working ISIN numbers

const https = require('https');

// Known valid ISIN that we can use as a reference
const KNOWN_VALID_ISIN = 'INF194KB1DP9';

// Common ISIN patterns for Indian mutual funds
// Format: INF<3-digit-AMC-code><K|F|L><2-char><3-char>
const AMC_CODES = {
  'ICICI': ['109'],
  'SBI': ['200', '204'],  
  'HDFC': ['179', '955'],
  'Axis': ['846'],
  'UTI': ['789'],
  'Reliance': ['204', '237'],
  'DSP': ['740'],
  'Kotak': ['174'],
  'Aditya Birla': ['090'],
  'Franklin Templeton': ['255']
};

// Generate potential ISINs to test
function generatePotentialISINs() {
  const isins = [];
  
  // Try different combinations
  Object.entries(AMC_CODES).forEach(([fund, codes]) => {
    codes.forEach(code => {
      // Try different patterns
      const patterns = [
        `INF${code}K01`,
        `INF${code}F01`, 
        `INF${code}L01`,
        `INF${code}KB1`,
        `INF${code}KE1`
      ];
      
      patterns.forEach(pattern => {
        // Generate different suffixes
        for (let i = 0; i < 50; i++) {
          const suffix1 = String.fromCharCode(65 + (i % 26)); // A-Z
          const suffix2 = String.fromCharCode(65 + ((i + 1) % 26));
          const num = (i % 10);
          
          isins.push(`${pattern}${suffix1}${suffix2}${num}`);
          isins.push(`${pattern}${suffix1}${num}${suffix2}`);
        }
      });
    });
  });
  
  return isins;
}

// Test an ISIN
function testISIN(isin) {
  return new Promise((resolve) => {
    const url = `https://mf.captnemo.in/nav/${isin}`;
    
    https.get(url, (res) => {
      let data = '';
      
      res.on('data', (chunk) => {
        data += chunk;
      });
      
      res.on('end', () => {
        try {
          const parsed = JSON.parse(data);
          if (parsed.error) {
            resolve(null);
          } else {
            resolve({
              isin: parsed.ISIN,
              name: parsed.name,
              nav: parsed.nav,
              date: parsed.date
            });
          }
        } catch (e) {
          resolve(null);
        }
      });
    }).on('error', () => {
      resolve(null);
    });
  });
}

// Main function to find valid ISINs
async function findValidISINs() {
  console.log('Starting ISIN discovery...');
  
  // First, test our known valid ISIN
  console.log('Testing known valid ISIN...');
  const knownResult = await testISIN(KNOWN_VALID_ISIN);
  if (knownResult) {
    console.log('✅ Known ISIN works:', knownResult);
  } else {
    console.log('❌ Known ISIN failed - check internet connection');
    return;
  }
  
  const potentialISINs = generatePotentialISINs();
  console.log(`Generated ${potentialISINs.length} potential ISINs to test`);
  
  const validISINs = [];
  const batchSize = 10;
  const delay = 500; // 500ms delay between batches
  
  for (let i = 0; i < potentialISINs.length; i += batchSize) {
    const batch = potentialISINs.slice(i, i + batchSize);
    console.log(`Testing batch ${Math.floor(i/batchSize) + 1}/${Math.ceil(potentialISINs.length/batchSize)}`);
    
    const promises = batch.map(isin => testISIN(isin));
    const results = await Promise.all(promises);
    
    results.forEach((result, index) => {
      if (result) {
        console.log('✅ Found valid ISIN:', result);
        validISINs.push(result);
      }
    });
    
    // Add delay to avoid overwhelming the API
    if (i + batchSize < potentialISINs.length) {
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }
  
  console.log(`\nFound ${validISINs.length} valid ISINs:`);
  validISINs.forEach(fund => {
    console.log(`ISIN: ${fund.isin}, Name: ${fund.name}`);
  });
  
  // Output in TypeScript format
  console.log('\n--- TypeScript Format ---');
  validISINs.forEach(fund => {
    const category = categorizeFromName(fund.name);
    console.log(`{
  isin: '${fund.isin}',
  expectedName: '${fund.name}',
  category: '${category.category}',
  subCategory: '${category.subCategory}',
  benchmarkIndex: '${category.benchmark}',
  fundHouse: '${category.fundHouse}'
},`);
  });
}

// Helper function to categorize fund from name
function categorizeFromName(name) {
  const nameUpper = name.toUpperCase();
  
  let category = 'Large Cap';
  let subCategory = 'Equity Fund';
  let benchmark = 'NIFTY 50';
  let fundHouse = 'Unknown';
  
  // Determine fund house
  if (nameUpper.includes('ICICI')) fundHouse = 'ICICI Prudential';
  else if (nameUpper.includes('SBI')) fundHouse = 'SBI';
  else if (nameUpper.includes('HDFC')) fundHouse = 'HDFC';
  else if (nameUpper.includes('AXIS')) fundHouse = 'Axis';
  else if (nameUpper.includes('UTI')) fundHouse = 'UTI';
  else if (nameUpper.includes('RELIANCE')) fundHouse = 'Reliance';
  else if (nameUpper.includes('DSP')) fundHouse = 'DSP';
  else if (nameUpper.includes('KOTAK')) fundHouse = 'Kotak';
  else if (nameUpper.includes('BANDHAN')) fundHouse = 'Bandhan';
  
  // Determine fund type
  if (nameUpper.includes('INDEX')) subCategory = 'Index Fund';
  else if (nameUpper.includes('ETF')) subCategory = 'ETF';
  
  // Determine category and benchmark
  if (nameUpper.includes('MIDCAP')) {
    category = 'Mid Cap';
    benchmark = 'NIFTY MIDCAP 150';
  } else if (nameUpper.includes('SMALLCAP')) {
    category = 'Small Cap';
    benchmark = 'NIFTY SMALLCAP 250';
  } else if (nameUpper.includes('BANK')) {
    category = 'Banking & Financial';
    benchmark = 'NIFTY BANK';
  } else if (nameUpper.includes('IT')) {
    category = 'Technology';
    benchmark = 'NIFTY IT';
  } else if (nameUpper.includes('PHARMA')) {
    category = 'Pharmaceutical';
    benchmark = 'NIFTY PHARMA';
  } else if (nameUpper.includes('NEXT 50')) {
    benchmark = 'NIFTY NEXT 50';
  } else if (nameUpper.includes('MOMENTUM')) {
    category = 'Multi Cap';
    benchmark = 'NIFTY200 MOMENTUM 30';
  }
  
  return { category, subCategory, benchmark, fundHouse };
}

// Run the discovery
findValidISINs().catch(console.error);