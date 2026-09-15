# Smoke Check — Accept Application with DM

## Recruiter flow

- [ ] Open `/jobs/[id]` as job poster with a pending applicant
- [ ] Click **Review** — drawer opens with Accept / Maybe / Decline
- [ ] Click **Accept** — footer switches to note composer; drawer stays open
- [ ] Click **Cancel** — returns to Accept / Maybe / Decline; status unchanged
- [ ] Click **Accept** again, leave note empty, click **Start the conversation** — validation error shown
- [ ] Enter note, click **Start the conversation** — toast success, badge shows Accepted, footer shows success + **View conversation**
- [ ] **View conversation** opens `/messages?conversation=...` with note and job attachment
- [ ] Drawer remains open after accept

## Applicant notifications

- [ ] Applicant sees **Application accepted** in Notifications → Jobs tab
- [ ] Applicant sees DM notification in Notifications → All / Mentions tab
- [ ] Tapping Jobs notification opens message thread
- [ ] Tapping DM notification opens same thread

## Edge cases

- [ ] Maybe / Decline still work without compose step
- [ ] Re-accepting an already-approved application returns an error
