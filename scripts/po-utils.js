#!/usr/bin/env node

/**
 * PO File Import/Export Utilities for LinguiJS
 * 
 * This script provides utilities to:
 * 1. Export PO files for translators
 * 2. Import translated PO files back into the project
 * 3. Validate PO files
 * 4. Generate translation statistics
 */

import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const LOCALES_DIR = path.join(__dirname, '../src/locales');
const SUPPORTED_LOCALES = ['en', 'tr', 'nl', 'sv', 'de', 'fr', 'fa'];

/**
 * Copy PO files to a translator-friendly directory structure
 */
function exportPOFiles() {
  const exportDir = path.join(__dirname, '../translations-export');
  
  // Create export directory
  if (!fs.existsSync(exportDir)) {
    fs.mkdirSync(exportDir, { recursive: true });
  }

  console.log('🚀 Exporting PO files for translators...\n');

  SUPPORTED_LOCALES.forEach(locale => {
    const sourceFile = path.join(LOCALES_DIR, locale, 'messages.po');
    const targetFile = path.join(exportDir, `${locale}.po`);
    
    if (fs.existsSync(sourceFile)) {
      fs.copyFileSync(sourceFile, targetFile);
      console.log(`✅ Exported ${locale}.po`);
    } else {
      console.log(`⚠️  Warning: ${sourceFile} not found`);
    }
  });

  // Generate POT template file from English PO file
  const enPoFile = path.join(exportDir, 'en.po');
  const potFile = path.join(exportDir, 'brisker.pot');
  
  if (fs.existsSync(enPoFile)) {
    try {
      execSync(`msgfilter -i "${enPoFile}" -o "${potFile}" true --keep-header`, {
        stdio: 'pipe',
        cwd: exportDir
      });
      console.log('✅ Generated brisker.pot template file');
    } catch (error) {
      console.log('⚠️  Warning: Failed to generate POT file. Install gettext tools with: brew install gettext');
      console.log('   Alternatively, you can use en.po as a template for new languages.');
    }
  }

  // Create README for translators
  const readmeContent = `# Translation Files

This directory contains PO files for translation.

## Files:
- \`brisker.pot\` - Translation template (use this for new languages)
${SUPPORTED_LOCALES.map(locale => `- \`${locale}.po\` - ${locale.toUpperCase()} translations`).join('\n')}

## How to translate:

### For existing languages:
1. Open the PO file for your language (e.g., tr.po for Turkish)
2. Translate the empty \`msgstr ""\` entries
3. Keep the \`msgid\` entries unchanged
4. Save the file
5. Send the translated file back

### For new languages:
1. Copy \`brisker.pot\` to \`[language-code].po\` (e.g., \`fr.po\` for French)
2. Update the header with your language information
3. Translate all \`msgstr ""\` entries
4. Send the completed file back

## Tools:
- [Poedit](https://poedit.net/) - GUI editor for PO files
- [Lokalize](https://apps.kde.org/lokalize/) - KDE translation tool
- Any text editor (VS Code, Sublime Text, etc.)

## Notes:
- Keep HTML tags and placeholders unchanged
- Maintain the same number of placeholders
- Test your translations before submitting
- The POT file is a template - don't translate it directly
`;

  fs.writeFileSync(path.join(exportDir, 'README.md'), readmeContent);
  console.log('✅ Created README.md for translators');
  console.log(`\n📁 Files exported to: ${exportDir}`);
  console.log('💡 The brisker.pot file can be used as a template for new language translations');
}

/**
 * Import translated PO files back into the project
 */
function importPOFiles() {
  const exportDir = path.join(__dirname, '../translations-export');
  
  if (!fs.existsSync(exportDir)) {
    console.log('❌ Export directory not found. Run export first.');
    return;
  }

  console.log('🔄 Importing translated PO files...\n');

  SUPPORTED_LOCALES.forEach(locale => {
    const sourceFile = path.join(exportDir, `${locale}.po`);
    const targetFile = path.join(LOCALES_DIR, locale, 'messages.po');
    
    if (fs.existsSync(sourceFile)) {
      // Create target directory if it doesn't exist
      const targetDir = path.dirname(targetFile);
      if (!fs.existsSync(targetDir)) {
        fs.mkdirSync(targetDir, { recursive: true });
      }
      
      fs.copyFileSync(sourceFile, targetFile);
      console.log(`✅ Imported ${locale}.po`);
    } else {
      console.log(`⚠️  Warning: ${sourceFile} not found`);
    }
  });

  // Compile translations
  try {
    console.log('\n🔨 Compiling translations...');
    execSync('npx lingui compile', { stdio: 'inherit', cwd: path.join(__dirname, '..') });
    console.log('✅ Translations compiled successfully');
  } catch (error) {
    console.log('❌ Failed to compile translations:', error.message);
  }
}

/**
 * Validate PO files for common issues
 */
function validatePOFiles() {
  console.log('🔍 Validating PO files...\n');

  SUPPORTED_LOCALES.forEach(locale => {
    const filePath = path.join(LOCALES_DIR, locale, 'messages.po');
    
    if (!fs.existsSync(filePath)) {
      console.log(`❌ ${locale}: File not found`);
      return;
    }

    const content = fs.readFileSync(filePath, 'utf8');
    const lines = content.split('\n');
    
    let msgidCount = 0;
    let translatedCount = 0;
    let emptyTranslations = [];
    let currentMsgid = '';
    
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim();
      
      if (line.startsWith('msgid ') && !line.includes('msgid ""')) {
        msgidCount++;
        currentMsgid = line.replace('msgid "', '').replace('"', '');
      } else if (line.startsWith('msgstr ')) {
        const msgstr = line.replace('msgstr "', '').replace('"', '');
        if (msgstr && msgstr !== currentMsgid) {
          translatedCount++;
        } else if (!msgstr && currentMsgid) {
          emptyTranslations.push(currentMsgid);
        }
      }
    }
    
    const translationPercent = msgidCount > 0 ? Math.round((translatedCount / msgidCount) * 100) : 0;
    
    console.log(`📊 ${locale.toUpperCase()}:`);
    console.log(`   Total messages: ${msgidCount}`);
    console.log(`   Translated: ${translatedCount} (${translationPercent}%)`);
    console.log(`   Missing: ${msgidCount - translatedCount}`);
    
    if (emptyTranslations.length > 0 && emptyTranslations.length <= 5) {
      console.log(`   Examples of missing translations: ${emptyTranslations.slice(0, 5).join(', ')}`);
    }
    console.log('');
  });
}

/**
 * Extract strings and update catalogs
 */
function updateCatalogs() {
  console.log('🔄 Extracting strings and updating catalogs...\n');
  
  try {
    execSync('npx lingui extract', { stdio: 'inherit', cwd: path.join(__dirname, '..') });
    console.log('\n✅ Catalogs updated successfully');
    
    // Show statistics
    validatePOFiles();
  } catch (error) {
    console.log('❌ Failed to update catalogs:', error.message);
  }
}

// Command line interface
const command = process.argv[2];

switch (command) {
  case 'export':
    exportPOFiles();
    break;
  case 'import':
    importPOFiles();
    break;
  case 'validate':
    validatePOFiles();
    break;
  case 'update':
    updateCatalogs();
    break;
  default:
    console.log(`
🌍 PO File Utilities for LinguiJS

Usage: node po-utils.js <command>

Commands:
  export    Export PO files for translators
  import    Import translated PO files back into project
  validate  Validate PO files and show translation statistics
  update    Extract strings and update catalogs

Examples:
  node po-utils.js export
  node po-utils.js validate
  node po-utils.js import
  node po-utils.js update
`);
}