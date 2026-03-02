#!/usr/bin/env node

/**
 * Fix translation files by restoring original English variable names.
 * The Google Translate API incorrectly translated {{variable}} placeholders.
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const LOCALES_DIR = path.join(__dirname, '../src/i18n/locales');
const EN_FILE = path.join(LOCALES_DIR, 'en.json');

// Load English as reference
const enContent = JSON.parse(fs.readFileSync(EN_FILE, 'utf-8'));

// Get all JSON files except English
const localeFiles = fs.readdirSync(LOCALES_DIR)
  .filter(f => f.endsWith('.json') && f !== 'en.json');

let totalFixes = 0;

for (const file of localeFiles) {
  const filePath = path.join(LOCALES_DIR, file);
  const content = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
  let fixes = 0;
  
  for (const [key, enValue] of Object.entries(enContent)) {
    if (typeof enValue !== 'string') continue;
    
    // Find all {{variable}} in English
    const enVars = enValue.match(/\{\{[^}]+\}\}/g) || [];
    if (enVars.length === 0) continue;
    
    const translatedValue = content[key];
    if (typeof translatedValue !== 'string') continue;
    
    // Find all {{variable}} in translated (might be translated variable names)
    const translatedVars = translatedValue.match(/\{\{[^}]+\}\}/g) || [];
    
    // If same number of variables, replace them in order
    if (translatedVars.length === enVars.length) {
      let fixedValue = translatedValue;
      for (let i = 0; i < enVars.length; i++) {
        if (translatedVars[i] !== enVars[i]) {
          fixedValue = fixedValue.replace(translatedVars[i], enVars[i]);
          fixes++;
        }
      }
      content[key] = fixedValue;
    } else if (translatedVars.length === 0 && enVars.length > 0) {
      // Variables were completely removed - this is a problem
      // Try to find where they should go based on English structure
      console.log(`  Warning: ${key} lost variables in ${file}`);
    }
  }
  
  if (fixes > 0) {
    fs.writeFileSync(filePath, JSON.stringify(content, null, 2));
    console.log(`✓ ${file}: Fixed ${fixes} variable placeholders`);
    totalFixes += fixes;
  } else {
    console.log(`✓ ${file}: No fixes needed`);
  }
}

console.log(`\nTotal fixes: ${totalFixes}`);
