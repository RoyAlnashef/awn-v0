# Help Now Form — Smoke Check

Run after implementation. Mark Pass/Fail.

## Automated (logic)

| Check | Result |
|-------|--------|
| `validateHelpNowForm` rejects empty role, location, dateTime | Pass (tsx script) |
| `helpNowFormToCreatePayload` maps dateTime → production, kind urgent | Pass (tsx script) |
| `helpNowToPreviewJob` omits date range badges (empty start/end) | Pass (code review) |

```bash
npx tsx -e "
import { validateHelpNowForm, helpNowFormToCreatePayload, emptyHelpNowForm } from './lib/jobs/help-now.ts';
console.assert(validateHelpNowForm(emptyHelpNowForm) === 'Role is required');
console.assert(validateHelpNowForm({ ...emptyHelpNowForm, role: 'Runner' }) === 'Location is required');
console.assert(validateHelpNowForm({ ...emptyHelpNowForm, role: 'Runner', location: 'LA' }) === 'Date & time is required');
const payload = helpNowFormToCreatePayload({ role: 'Runner', location: 'LA', dateTime: 'Tomorrow 7am', rate: '', details: '' });
console.assert(payload.kind === 'urgent' && payload.production === 'Tomorrow 7am');
console.log('Pass');
"
```

## Manual UI

1. **Header Help Now** — Click Help Now in site header (sm+). Dialog opens with text-only fields (role, location, date & time, rate, details). No Select or DatePicker.
2. **Submit from dialog** — Post urgent request. Toast confirms 48h. Job appears on jobs board and in header Jobs panel urgent carousel with role, location subtitle (date/time), rate, details.
3. **`/jobs/new` Urgent Help** — Toggle Urgent Help. Same simplified fields as dialog. Full Role toggle still shows Select, date pickers, deadline, engagement, draft.
4. **Full Role unchanged** — Posting type Full Role still has role dropdown, dates, application deadline, save draft.
5. **Details limit** — Details field shows `0/280` counter; cannot exceed 280 characters.
6. **Expired urgent** — Expired urgent posts hidden from `GET /api/jobs`; apply returns 400 for expired urgent.

## Files touched

- `components/help-now/help-now-form.tsx`
- `components/help-now/help-now-dialog.tsx`
- `components/help-now/help-now-header-button.tsx`
- `lib/jobs/help-now.ts`
- `components/site-header.tsx`
- `components/jobs/job-form-page.tsx`
- `app/api/jobs/route.ts`
- `app/api/jobs/[id]/route.ts`
- `components/jobs/job-metadata-badges.tsx`
- `components/jobs/job-detail-content.tsx`
- `components/jobs/job-card-preview.tsx`
