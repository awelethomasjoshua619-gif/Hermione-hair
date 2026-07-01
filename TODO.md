# TODO

## CORS fix for admin PATCH returning CORS/502
- [x] Update `backend/src/index.ts` CORS options to be non-throwing for disallowed origins.

- [x] Ensure preflight OPTIONS are handled consistently for all routes.

- [x] Re-run backend locally (if possible) to verify no CORS errors for PATCH.

- [ ] Redeploy and test PATCH from frontend.

