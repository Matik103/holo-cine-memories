#!/usr/bin/env node

/**
 * Fix untranslated strings by translating them via Google Translate API
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const LOCALES_DIR = path.join(__dirname, '../src/i18n/locales');
const EN_FILE = path.join(LOCALES_DIR, 'en.json');

const enContent = JSON.parse(fs.readFileSync(EN_FILE, 'utf-8'));

// Keys that need fixing per language
const toFix = {
  ar: ['auth.passwordsDontMatch'],
  ht: ['vault.activity.rating'],
  ja: ['mystery.mysteryUpdatedDesc'],
  zh: [
    'cookies.howWeUse.authentication.description',
    'cookies.howWeUse.preferences.description', 
    'cookies.howWeUse.analytics.description',
    'cookies.types.session.description',
    'cookies.types.persistent.description',
    'cookies.types.thirdParty.description',
    'cookies.contact.description',
    'dataUsage.collection.description',
    'dataUsage.collection.item1'
  ]
};

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

async function fixLanguage(lang, keys) {
  const filePath = path.join(LOCALES_DIR, `${lang}.json`);
  const content = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
  
  console.log(`\nFixing ${lang.toUpperCase()}:`);
  
  for (const key of keys) {
    const enValue = enContent[key];
    if (!enValue) continue;
    
    // Extract variables to preserve them
    const vars = enValue.match(/\{\{[^}]+\}\}/g) || [];
    
    // Replace variables with placeholders before translation
    let textToTranslate = enValue;
    vars.forEach((v, i) => {
      textToTranslate = textToTranslate.replace(v, `__VAR${i}__`);
    });
    
    // Translate
    let translated = await translateText(textToTranslate, lang);
    
    // Restore variables
    vars.forEach((v, i) => {
      translated = translated.replace(`__VAR${i}__`, v);
      translated = translated.replace(`__var${i}__`, v); // lowercase variant
    });
    
    content[key] = translated;
    console.log(`  ✓ ${key}`);
    
    // Small delay
    await new Promise(r => setTimeout(r, 100));
  }
  
  fs.writeFileSync(filePath, JSON.stringify(content, null, 2));
  console.log(`  Saved ${lang}.json`);
}

async function main() {
  for (const [lang, keys] of Object.entries(toFix)) {
    await fixLanguage(lang, keys);
  }
  console.log('\nDone!');
}

main().catch(console.error);
