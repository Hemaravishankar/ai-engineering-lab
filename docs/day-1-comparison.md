# AI Coding Experiment Comparison: Pagination Implementation

**Date:** 2026-10-22  
**Comparison Target:** `experiment/without-instructions` vs `experiment/with-instructions`  
**Commits Analyzed:**
- `experiment/without-instructions`: `fd8fd7e` (*Save working book API baseline*)
- `experiment/with-instructions`: `b29f020` (*Implement pagination for books API and add input validation; create AGENTS.md for project instructions*)

---

## 1. Executive Summary & Objective

The objective of this experiment was to evaluate the implementation of pagination on the `GET /books` endpoint under two conditions:
1. **Without instructions (`experiment/without-instructions`)**: The agent worked from the task specification without persistent repository instructions (`AGENTS.md`).
2. **With instructions (`experiment/with-instructions`)**: The agent worked with persistent project guidance defined in `AGENTS.md`, emphasizing separation of concerns, strict input validation, comprehensive test coverage, and pre-implementation planning.

Both branches successfully implemented pagination and passed all automated test suites. However, tangible differences emerged in code architecture, input validation strictness, and test suite organization.

---

## 2. Validation Differences in `src/server.js`

### Code Architecture & Separation of Concerns
- **`without-instructions`**:
  - The validation helper `isPositiveInteger` is defined **inside** the `app.get("/books", ...)` request handler.
  - As a result, the function is re-instantiated on every incoming HTTP request.
  - Validation and parsing are separate steps: `isPositiveInteger` checks validity as a boolean, and then `parseInt(param, 10)` parses the value downstream.
- **`with-instructions`**:
  - The validation helper `parsePositiveInteger` is extracted to a **top-level function** outside the request handler.
  - Aligns with the `AGENTS.md` directive: *"Keep route handlers simple and maintain clear separation of concerns."*
  - Combines validation and parsing into a single call returning the parsed integer or `null`.

### Input Handling & Regular Expressions
- **`without-instructions`**:
  ```javascript
  const isPositiveInteger = (val) => {
    if (typeof val === "number") {
      return Number.isInteger(val) && val > 0;
    }
    if (typeof val !== "string") return false;
    const trimmed = val.trim();
    if (!/^\d+$/.test(trimmed)) return false;
    const num = Number(trimmed);
    return num > 0 && Number.isSafeInteger(num);
  };
  ```
  - Applies `.trim()` before regex matching, accepting parameters with leading/trailing whitespace (e.g., `?page=%205%20`).
  - Uses `/^\d+$/`, which allows leading zeros (e.g., `"01"` or `"007"`), relying on subsequent `Number()` conversion and `num > 0` check.
  - Performs an explicit `typeof val === "number"` branch, which is largely redundant in Express query parsing unless query parsers produce numbers.
- **`with-instructions`**:
  ```javascript
  function parsePositiveInteger(value) {
    if (typeof value !== "string") {
      return null;
    }
    if (!/^[1-9]\d*$/.test(value)) {
      return null;
    }
    const num = Number(value);
    if (!Number.isSafeInteger(num) || num <= 0) {
      return null;
    }
    return num;
  }
  ```
  - Uses `/^[1-9]\d*$/`, strictly disallowing leading zeros (rejects `"0"`, `"01"`, etc. at the regex level).
  - Does not trim whitespace, strictly rejecting query strings with padded spaces (e.g., `" 1 "`).
  - Immediately rejects non-string queries (e.g., duplicate query params like `?page=1&page=2` which Express parses as an array).

### Error Responses
- **`without-instructions`**: Returns `{ error: "Page must be a positive integer" }` and `{ error: "Limit must be a positive integer" }`.
- **`with-instructions`**: Returns `{ error: "Invalid page parameter" }` and `{ error: "Invalid limit parameter" }`.

---

## 3. Test Coverage & Organization in `tests/server.test.js`

### Test Count & Structure
- **`without-instructions` (10 tests)**:
  - 3 baseline tests (`/health`, book creation, missing field validation).
  - 7 pagination tests inside a single `describe("GET /books pagination")` block.
  - Setup: Uses `beforeAll` to seed 11 books (combined with 1 from baseline = 12 total).
  - Invalid inputs: Tested using `for...of` loops iterating over arrays of invalid inputs (`["0", "-1", "-10", "abc", "1.5", ""]`) inside two test cases (`rejects invalid page values` and `rejects invalid limit values`).
- **`with-instructions` (15 tests)**:
  - 3 baseline tests (`/health`, book creation, missing field validation).
  - 1 explicit regression test verifying that existing behavior and response format are preserved when pagination parameters are omitted.
  - 11 pagination tests inside `describe("Pagination")`.
  - Setup: Uses an explicit `it("seeds additional books for pagination tests")` test to add 14 books (15 total).
  - Invalid inputs: Broken out into dedicated, individual test cases for each failure category:
    - `rejects zero values with HTTP 400`
    - `rejects negative values with HTTP 400`
    - `rejects non-numeric values with HTTP 400`
    - `rejects decimal values with HTTP 400`
    - `rejects empty string values with HTTP 400`

### Reporting & Failure Diagnostics
- In `with-instructions`, if validation fails for a specific input class (such as decimal numbers), Vitest reports the exact failing scenario by test name. In `without-instructions`, a failure in the loop terminates the test at the first failure, obscuring whether subsequent inputs would have passed or failed.
- In `with-instructions`, custom pagination is tested across three pages (`page=1&limit=5`, `page=2&limit=5`, `page=3&limit=5`), whereas `without-instructions` tested page 2 only.

---

## 4. Test Results

Both implementations were executed via `npm test` (`vitest run`):

| Branch | Test Files | Total Tests | Passed | Failed | Status |
| :--- | :---: | :---: | :---: | :---: | :---: |
| `experiment/without-instructions` | 1 | 10 | 10 | 0 | **PASSED** |
| `experiment/with-instructions` | 1 | 15 | 15 | 0 | **PASSED** |

Both test suites executed cleanly with zero failures.

---

## 5. Repository Instructions & Task Files (`AGENTS.md` and `gemini.md`)

- **`experiment/without-instructions`**:
  - `AGENTS.md` was **not present**.
  - `gemini.md` was updated in commit `fd8fd7e`, replacing the Task 1 prompt with the Task 2 pagination specification and acceptance criteria.
- **`experiment/with-instructions`**:
  - `gemini.md` was **removed**.
  - `AGENTS.md` was **added** as a persistent project instructions file, defining guidelines for coding standards, input validation, testing practices, safety constraints, and completion reporting.
  - *Observation:* `AGENTS.md` contains PowerShell wrapper script artifacts (`@' ... '@ | Set-Content -Encoding utf8 AGENTS.md`) at the head and tail of the file, stemming from how the file was generated.

---

## 6. Potential Weaknesses & Edge Cases

### Shared Weaknesses
1. **Lack of Test Data Isolation:** Neither implementation isolates test data via `beforeEach` resets or transactional rollbacks. Tests depend on the sequential accumulation of in-memory state.
2. **Missing Pagination Metadata:** Neither implementation provides envelope metadata (such as `totalItems`, `totalPages`, `hasNextPage`) or RFC 5988 `Link` headers. Both return raw arrays (`res.json(books.slice(...))`). While this adheres to preserving the existing response schema, it is a functional limitation for real-world consumers.
3. **Offset Shifting:** Both implementations use offset-based slicing on an in-memory array. Concurrent insertions or deletions could cause item shifting between pages.

### Specific Weaknesses
- **`without-instructions`**:
  - *Permissive Parsing:* Allows leading zeros (`"01"`) and trims whitespace (`" 5 "`), which may mask malformed query strings.
  - *Loop-Based Assertions:* Bundling multiple test assertions into loops reduces failure granularity in CI/CD reports.
  - *Handler Bloat:* Inline helper definition causes unnecessary function reallocation per request.
- **`with-instructions`**:
  - *Whitespace Inflexibility:* Strict rejection of whitespace might reject otherwise harmless user input if a client sends padded query values.
  - *Side-Effect in Test Block:* Seeding test data in an `it()` test block rather than a `beforeAll()` lifecycle hook violates idiomatic testing standards and creates order-dependent side effects.

---

## 7. Balanced Conclusion: Did Project Instructions Help?

### Evidence of Benefit
- **Architectural Quality:** The instruction to *"Keep route handlers simple and maintain clear separation of concerns"* directly correlated with extracting `parsePositiveInteger` into a modular helper, avoiding per-request function reallocation.
- **Test Suite Granularity:** The directive to *"Cover successful cases, invalid input, and relevant edge cases"* led to an increase from 10 to 15 tests, splitting bulk loops into self-documenting test cases and explicitly testing backward compatibility.
- **Process Discipline:** In `with-instructions`, the agent strictly adhered to inspecting the repository, formulating and presenting a plan, seeking explicit approval, and delivering a structured completion report.

### Evidence of Neutrality / Limitations
- **Functional Correctness:** The branch without instructions also met all primary acceptance criteria and passed all 10 of its tests without bugs. The instructions did not prevent any critical defect that the unguided model otherwise introduced.
- **Architecture Limits:** Instructions did not prevent imperfect test patterns (such as seeding data in an `it` block) or address the underlying test isolation limitation noted in the codebase comments.

### Final Assessment
The project instructions in `AGENTS.md` provided meaningful value in code maintainability, test reporting quality, and procedural consistency. However, they functioned as an architectural polish and testing standard rather than a prerequisite for basic functional correctness.
