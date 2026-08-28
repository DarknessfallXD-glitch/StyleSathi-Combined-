# Unit 6: Subscription + Usage Limits

Owners: Utsav (backend), Reejana (frontend wiring)

## Goal

Verify Stripe subscription and daily usage-limit enforcement on the backend, and reflect plan/billing state in the subscription screen.

## Implementation

- Backend: confirm `api/subscription.py` + `services/subscriber.py` handle plan selection and enforce `daily_limit` / `user_usage`.
- Frontend: wire `subscription.tsx` to display current plan, upgrade options, and remaining daily usage.
- Reflect usage limits in try-on and search flows where applicable.

## Dependencies

- Stripe keys configured.
- Units 1–5 complete.

## Verify when done

- [ ] Setting a plan persists for the user
- [ ] Daily usage limit increments and blocks when exceeded
- [ ] Subscription screen reflects state
- [ ] Update `context/progress-tracker.md`
