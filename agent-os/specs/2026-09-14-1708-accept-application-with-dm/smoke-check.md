# Smoke Check — Accept Application with DM

## Recruiter flow

- [x] Open `/jobs/[id]` as job poster with a pending applicant
- [x] Click **Review** — drawer opens with Accept / Maybe / Decline
- [x] Click **Accept** — footer switches to note composer; drawer stays open
- [x] Click **Cancel** — returns to Accept / Maybe / Decline; status unchanged
- [x] Click **Accept** again, leave note empty, click **Start the conversation** — validation error shown
- [x] Enter note, click **Start the conversation** — toast success, badge shows Accepted, footer shows success + **View conversation**
- [x] **View conversation** opens `/messages?conversation=...` with note and job attachment
- [x] Drawer remains open after accept

## Applicant notifications

- [x] Applicant sees **Application accepted** in Notifications → Jobs tab
- [x] Applicant sees DM notification in Notifications → All / Mentions tab
- [x] Tapping Jobs notification opens message thread
- [x] Tapping DM notification opens same thread

## Edge cases

- [x] Maybe / Decline still work without compose step
- [x] Re-accepting an already-approved application returns an error
