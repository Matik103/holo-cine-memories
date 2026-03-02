#!/usr/bin/env node

/**
 * Script to generate static translation files for all supported languages.
 * Run this once to generate all locale files, then bundle them with the app.
 * 
 * Usage: node scripts/generate-translations.js
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const LANGUAGES = [
  { code: 'es', name: 'Spanish' },
  { code: 'fr', name: 'French' },
  { code: 'pt', name: 'Portuguese' },
  { code: 'de', name: 'German' },
  { code: 'zh', name: 'Chinese' },
  { code: 'ja', name: 'Japanese' },
  { code: 'ko', name: 'Korean' },
  { code: 'ar', name: 'Arabic' },
  { code: 'hi', name: 'Hindi' },
  { code: 'ht', name: 'Haitian Creole' },
  { code: 'id', name: 'Indonesian' },
];

const LOCALES_DIR = path.join(__dirname, '../src/i18n/locales');
const EN_FILE = path.join(LOCALES_DIR, 'en.json');

async function translateText(text, targetLang) {
  const url = `https://translate.googleapis.com/translate_a/single?client=gtx&sl=en&tl=${targetLang}&dt=t&q=${encodeURIComponent(text)}`;
  
  try {
    const response = await fetch(url);
    if (!response.ok) return text;
    
    const data = await response.json();
    if (data && data[0]) {
      const parts = data[0].filter(p => p && p[0]).map(p => p[0]);
      return parts.join('');
    }
    return text;
  } catch {
    return text;
  }
}

async function translateBatch(entries, targetLang, batchSize = 5) {
  const results = {};
  
  for (let i = 0; i < entries.length; i += batchSize) {
    const batch = entries.slice(i, i + batchSize);
    
    console.log(`  Translating ${i + 1}-${Math.min(i + batchSize, entries.length)} of ${entries.length}...`);
    
    const translations = await Promise.all(
      batch.map(async ([key, value]) => {
        const translated = await translateText(value, targetLang);
        return [key, translated];
      })
    );
    
    translations.forEach(([key, value]) => {
      results[key] = value;
    });
    
    // Small delay between batches
    if (i + batchSize < entries.length) {
      await new Promise(r => setTimeout(r, 200));
    }
  }
  
  return results;
}

async function generateTranslation(langCode, langName, forceRegenerate = false) {
  const outputFile = path.join(LOCALES_DIR, `${langCode}.json`);
  
  // Check if file exists and is not just a copy of English
  if (fs.existsSync(outputFile) && !forceRegenerate) {
    const existingContent = fs.readFileSync(outputFile, 'utf-8');
    const enContent = fs.readFileSync(EN_FILE, 'utf-8');
    
    // If file is different from English, skip
    if (existingContent !== enContent) {
      console.log(`✓ ${langName} (${langCode}) - already translated, skipping`);
      return;
    }
    console.log(`⚠ ${langName} (${langCode}) - placeholder detected, regenerating...`);
  }
  
  console.log(`\nGenerating ${langName} (${langCode})...`);
  
  const enContent = JSON.parse(fs.readFileSync(EN_FILE, 'utf-8'));
  const entries = Object.entries(enContent);
  
  const translated = await translateBatch(entries, langCode);
  
  fs.writeFileSync(outputFile, JSON.stringify(translated, null, 2));
  console.log(`✓ ${langName} (${langCode}) - saved to ${langCode}.json`);
}

async function main() {
  console.log('=== CineMind Translation Generator ===\n');
  console.log(`Source: ${EN_FILE}`);
  console.log(`Output: ${LOCALES_DIR}\n`);
  
  for (const lang of LANGUAGES) {
    await generateTranslation(lang.code, lang.name);
  }
  
  console.log('\n=== Done! ===');
  console.log('All translation files have been generated.');
  console.log('These files are now bundled with the app for instant language switching.');
}

main().catch(console.error);
