# Multiple descriptions, cleaner media, and account menu

## What will change
- Replace the single short-description field with a repeatable description list, including add and remove controls.
- Save all descriptions with each prompt while keeping the first description available for existing cards and search.
- Show saved descriptions as separate paragraphs on the prompt detail page.
- Make pasted image links preview reliably in the add/edit form, with a clear fallback if the link cannot be displayed.
- Stop repeating the same attached image or video beside every prompt block; show one main media preview per prompt page.
- Replace the separate navbar Add Prompt and logout buttons with one user icon. Its menu will show the user name first, then Add Prompt, then Log out.

## Database update
- Add a `descriptions` JSON column to prompts with an empty-list default.
- Preserve existing content by copying each current short description into the new list.
- Keep current access rules unchanged and grant access to the new column through the existing table permissions.

## Compatibility
- Existing prompts continue to display correctly.
- Editing an older prompt loads its current short description as the first description.
- The Add Prompt action remains visible only after login; the existing admin-only page protection remains unchanged.

## Verification
- Test adding, removing, saving, and reopening multiple descriptions.
- Test a pasted image URL in the form preview.
- Confirm prompt pages show one media preview and multiple text prompts without repeated media.
- Confirm the user menu order and logout behavior on desktop and mobile.
