# Firebase Security Specification - VoteGuide AI

## 1. Data Invariants
- A session document ID must be a valid UUID.
- Messages must be a list of objects.
- `createdAt` and `updatedAt` must be server-generated timestamps.
- Maximum message size and history length must be enforced.

## 2. The "Dirty Dozen" Payloads (Targeting sessions/{sessionId})

1. **Identity Spoofing**: Attempt to create a session with a `sessionId` field that doesn't match the URL path ID.
2. **Path Poisoning**: Create a session with a 2KB junk string as the document ID.
3. **Shadow Update**: Add `isAdmin: true` to a session document during update.
4. **Timestamp Fraud**: Send a client-side `createdAt` timestamp from 2010.
5. **State Shortcut**: Update a session's `updatedAt` without changing anything else, or bypassing validation.
6. **Relational Break**: (Not applicable here as we only have one collection)
7. **Type Mismatch**: Send `messages` as a string instead of a list.
8. **Size Explosion**: Send a 2MB message in the `messages` list.
9. **Key Omission**: Create a session without the `language` field.
10. **Replay Attack**: Attempt to set `createdAt` on an update.
11. **PII Leak**: (Not applicable, but will ensure only the "owner" (creator) can read - though since there's no auth, we rely on knowing the ID).
12. **Blanket Read**: Querying `collection('sessions')` without a specific document ID.

## 3. Test Runner (firestore.rules.test.ts)
(Will be implemented in the codebase)
