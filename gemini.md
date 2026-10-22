Implement pagination for the existing GET /books endpoint.

First, inspect the existing implementation and tests. Then propose a plan. Do not edit files until I approve the plan.

Requirements:

1. Support page and limit query parameters.
2. Defaults: page = 1 and limit = 10 when pagination parameters are omitted.
3. Return only the requested page of books.
4. Return HTTP 400 for invalid values, including zero, negative numbers, and non-numeric input.
5. Preserve existing API behaviour when pagination parameters are omitted, except for the explicitly required default pagination behaviour.
6. Add automated tests for default pagination, custom pagination, invalid values, and existing behaviour.
7. Follow existing project conventions and error-handling patterns.
8. Do not add dependencies or perform unrelated refactoring.

Acceptance criteria:

- GET /books uses the documented default page and limit.
- GET /books?page=2&limit=5 returns the correct second page.
- Invalid page and limit values return HTTP 400.
- Existing tests continue to pass.
- New tests cover the requirements.
- All relevant tests pass.

Before implementation, show me:
- The files you plan to change.
- The proposed logic.
- The test cases you will add.
- Any ambiguity or compatibility risk.

After approval, implement the smallest safe change, run the relevant tests, inspect the final diff, and report the actual results. Never claim a test passed unless you ran it successfully.