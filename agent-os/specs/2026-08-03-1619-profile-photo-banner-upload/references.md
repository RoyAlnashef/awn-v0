# References for Profile Photo & Banner Upload

## Similar Implementations

### AvatarUploadField

- **Location:** `components/users/avatar-upload-field.tsx`
- **Relevance:** Existing upload UI pattern in the project — hidden `<input type="file">`, FormData, MIME validation. Does not include crop step.
- **Key patterns:** File input accept attribute, file size/type validation, loading states.

### PersonProfileCard

- **Location:** `components/people/person-profile-card.tsx`
- **Relevance:** The render target. Hero area (`<div className="h-24 bg-muted" />`) becomes the banner display. Avatar rendered via `<Avatar>/<AvatarImage>` with `person.avatar`.

### AccountProfileProvider

- **Location:** `components/account/account-profile-provider.tsx`
- **Relevance:** Draft state provider. `updateDraft(patch: Partial<Person>)` is the mechanism for writing avatar/banner changes to the preview.

### avatar-actions.ts

- **Location:** `lib/users/avatar-actions.ts`
- **Relevance:** Server-side upload pattern to Supabase Storage (for future persistence). MIME and size validation approach to follow.
