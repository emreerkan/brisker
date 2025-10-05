# Translation Files

This directory contains PO files for translation.

## Files:
- `brisker.pot` - Translation template (use this for new languages)
- `en.po` - EN translations
- `tr.po` - TR translations
- `nl.po` - NL translations

## How to translate:

### For existing languages:
1. Open the PO file for your language (e.g., tr.po for Turkish)
2. Translate the empty `msgstr ""` entries
3. Keep the `msgid` entries unchanged
4. Save the file
5. Send the translated file back

### For new languages:
1. Copy `brisker.pot` to `[language-code].po` (e.g., `fr.po` for French)
2. Update the header with your language information
3. Translate all `msgstr ""` entries
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
