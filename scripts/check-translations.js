#!/usr/bin/env node

/**
 * Comprehensive check for translation issues:
 * 1. Missing variable placeholders
 * 2. Keys that exist in English but not in translations
 * 3. Empty or placeholder values
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const LOCALES_DIR = path.join(__dirname, '../src/i18n/locales');
const EN_FILE = path.join(LOCALES_DIR, 'en.json');

const enContent = JSON.parse(fs.readFileSync(EN_FILE, 'utf-8'));
const enKeys = Object.keys(enContent);

const localeFiles = fs.readdirSync(LOCALES_DIR)
  .filter(f => f.endsWith('.json') && f !== 'en.json');

const issues = [];

for (const file of localeFiles) {
  const lang = file.replace('.json', '');
  const filePath = path.join(LOCALES_DIR, file);
  const content = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
  
  for (const key of enKeys) {
    const enValue = enContent[key];
    const transValue = content[key];
    
    // Check for missing keys
    if (transValue === undefined) {
      issues.push({ lang, key, issue: 'MISSING_KEY', enValue });
      continue;
    }
    
    // Check for empty values
    if (typeof transValue === 'string' && transValue.trim() === '') {
      issues.push({ lang, key, issue: 'EMPTY_VALUE', enValue });
      continue;
    }
    
    // Check for missing variables
    if (typeof enValue === 'string') {
      const enVars = (enValue.match(/\{\{[^}]+\}\}/g) || []).sort();
      const transVars = (transValue.match(/\{\{[^}]+\}\}/g) || []).sort();
      
      if (enVars.length > 0 && transVars.length !== enVars.length) {
        issues.push({ 
          lang, 
          key, 
          issue: 'MISSING_VARIABLES', 
          expected: enVars.join(', '),
          found: transVars.join(', ') || 'none',
          enValue,
          transValue
        });
      }
    }
    
    // Check if translation is same as English (might be untranslated)
    if (transValue === enValue && enValue.length > 20) {
      // Only flag longer strings that are identical
      issues.push({ lang, key, issue: 'POSSIBLY_UNTRANSLATED', enValue });
    }
  }
}

// Group issues by type
const byType = {};
for (const issue of issues) {
  if (!byType[issue.issue]) byType[issue.issue] = [];
  byType[issue.issue].push(issue);
}

console.log('=== Translation Issues Report ===\n');

for (const [type, typeIssues] of Object.entries(byType)) {
  console.log(`\n### ${type} (${typeIssues.length} issues) ###`);
  
  // Group by language
  const byLang = {};
  for (const issue of typeIssues) {
    if (!byLang[issue.lang]) byLang[issue.lang] = [];
    byLang[issue.lang].push(issue);
  }
  
  for (const [lang, langIssues] of Object.entries(byLang)) {
    console.log(`\n  ${lang.toUpperCase()}:`);
    for (const issue of langIssues.slice(0, 10)) {
      if (type === 'MISSING_VARIABLES') {
        console.log(`    - ${issue.key}`);
        console.log(`      Expected: ${issue.expected}`);
        console.log(`      Found: ${issue.found}`);
        console.log(`      Value: "${issue.transValue.substring(0, 80)}..."`);
      } else {
        console.log(`    - ${issue.key}: "${(issue.enValue || '').substring(0, 50)}..."`);
      }
    }
    if (langIssues.length > 10) {
      console.log(`    ... and ${langIssues.length - 10} more`);
    }
  }
}

console.log(`\n\n=== Summary ===`);
console.log(`Total issues: ${issues.length}`);
for (const [type, typeIssues] of Object.entries(byType)) {
  console.log(`  ${type}: ${typeIssues.length}`);
}
