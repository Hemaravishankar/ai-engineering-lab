# Feature Specification: Search Books by Title

## 1. Objective

Extend the existing `GET /books` endpoint to allow clients to search books by title while preserving the existing response format and pagination behavior.

## 2. Current behavior

- `GET /books` returns a JSON array of books.
- Pagination uses `page` and `limit`.
- The existing default values and validation behavior must remain unchanged.
- Existing clients that do not supply a search parameter must continue to work.

The implementation agent must inspect the current source code and tests to confirm these behaviors before making changes.

## 3. Functional requirements

### FR-1: Optional title search

- Support an optional `search` query parameter.
- Example: `GET /books?search=clean`.
- Search only the existing book title field.
- Match titles case-insensitively.
- A book matches when its title contains the search text.
- Do not modify or delete stored books during a search.

### FR-2: Compatibility

- When `search` is omitted, preserve the existing `GET /books` behavior.
- Keep the response as a JSON array, not a new response object.
- Preserve the existing `page` and `limit` defaults and validation rules.

### FR-3: Pagination and filtering

- Apply title filtering before pagination.
- Pagination must operate on the filtered results.
- Existing pagination parameters must continue to work with the search parameter.

### FR-4: Input handling

- Accept a single string for `search`.
- Reject duplicate `search` query parameters with HTTP 400.
- Treat an empty or whitespace-only search value as no search filter.
- Return a clear JSON error message for an invalid search parameter.
- Do not change the existing validation behavior of `page` or `limit`.

### FR-5: Scope

- Do not add a database or external service.
- Do not add dependencies unless necessary and approved.
- Do not change unrelated endpoints or refactor unrelated code.

## 4. Acceptance criteria

- [ ] `GET /books` still returns the existing JSON array.
- [ ] Searching matches title text without case sensitivity.
- [ ] Partial title matches are supported.
- [ ] A search with no matches returns an empty array.
- [ ] Search filtering happens before pagination.
- [ ] Search works together with `page` and `limit`.
- [ ] An omitted search parameter preserves existing behavior.
- [ ] Empty and whitespace-only search values behave as specified.
- [ ] Duplicate search parameters return HTTP 400.
- [ ] Existing tests continue to pass.
- [ ] Automated tests cover successful searches, invalid input, no matches, and combined search/pagination.
- [ ] No unrelated files or functionality are changed.

## 5. Test scenarios

1. Search for a complete title.
2. Search using only part of a title.
3. Search using different letter casing.
4. Search for a title that does not exist.
5. Search with an empty value.
6. Search with whitespace only.
7. Supply the search parameter more than once.
8. Combine search with page and limit.
9. Verify pagination is applied after filtering.
10. Call the endpoint without search and verify backward compatibility.
11. Run the complete existing test suite.

## 6. Definition of done

The implementation is complete only when the acceptance criteria are verified, automated tests pass, the final diff is reviewed, and the completion report lists changed files, test commands, actual results, and any remaining limitations.