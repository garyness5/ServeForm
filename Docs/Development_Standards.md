# Savveyra Development Standards

## Purpose

This document defines how Savveyra should be developed, normalized, documented, and handed off between development sessions.

It applies to all domains.

It does not define product behavior. Product behavior belongs in:
- Canonical Specifications
- Architecture
- Domain Rules
- Domain Workflow documents

This document defines the development method.

## Core Development Philosophy

Operational logic comes first.

The preferred order is:

```text
Operational Logic
↓
Domain Rules
↓
Architecture
↓
Supabase
↓
Appsmith
```

Technical convenience must not override operational correctness.

The product should remain simple, practical, visible, and operationally correct.

## Gary Working Style

- Gary is not a programmer.
- Provide exact SQL, Appsmith bindings, JavaScript, and replacement instructions.
- Prefer “replace this whole query/procedure” over abstract guidance.
- Keep explanations concise and focused on the next concrete step.
- Push back when operational logic seems weak or inconsistent.
- Do not agree just for reassurance.
- Operational workflow matters more than technical neatness.
- If something needs to be fixed, fix it now rather than knowingly building on a weak foundation.
- Fresh-eye reviews are encouraged at the start of a new stage.
- Documentation is part of the deliverable, not an afterthought.

## Supabase Responsibility

Supabase owns business rules.

Before implementing logic in Appsmith, ask:

```text
Can this business rule live entirely in Supabase?
```

If yes, it should normally live in Supabase.

Supabase should own:
- validation
- save rules
- delete rules
- duplicate rules
- rename/replace rules
- numbering
- status transitions
- lifecycle rules
- quote issue/accept logic
- snapshot integrity
- propagation calculations
- financial calculations
- rebuild/update logic
- edit protection
- shared services

The database should protect the business even if Appsmith has a bug.

## Appsmith Responsibility

Appsmith owns the user experience.

Appsmith should handle:
- buttons
- modals
- warnings
- navigation
- display logic
- selected rows
- visible/hidden containers
- user confirmation
- page flow

Appsmith should not own critical business rules when Supabase can enforce them.

## One Business Action = One Supabase Function

A user-facing business action should normally map to one Supabase function.

Preferred:

```text
Appsmith button
↓
Supabase function
↓
Supabase validates, updates, calculates, returns result
```

Avoid:

```text
Appsmith button
↓
Query A
Query B
Query C
Query D
JavaScript correction
```

The second pattern makes rules harder to test and easier to break.

## Shared Services Before Duplicated Logic

If a rule or process can reasonably serve more than one domain, build it as a shared service.

Examples:
- document numbering
- normalized-name checking
- duplicate behavior
- replace behavior
- status handling
- impact counts
- helper propagation
- archive/snapshot routines

Avoid copying similar logic into multiple domains.

## Fix Foundation Problems Immediately

If implementation reveals a weakness in a prior domain, shared service, or architectural assumption, fix the foundation before continuing.

Do not knowingly build on weak logic.

It is acceptable to step back into another domain if that domain is causing problems in the current work.

This avoids carrying technical or operational debt downstream.

## Thin Appsmith Standard

As the project matures, Appsmith should become thinner.

A mature Appsmith page should mostly:
- load data from views
- display it
- collect user input
- show warnings/modals
- call Supabase functions
- refresh data

A mature Appsmith page should not contain large amounts of duplicate business logic.

## View Strategy

Use Supabase views to prepare display-ready data for Appsmith.

Views should simplify Appsmith pages by exposing:
- current labels
- calculated totals
- status flags
- warning flags
- counts
- display summaries
- current vs imported state
- user-facing derived values

Appsmith should not calculate what Supabase can provide reliably.

## Foundation SQL Policy

Each domain should eventually have one current Foundation SQL file.

Example:

```text
SQL/Quotation/Quotation_Foundation.sql
```

The Foundation SQL represents the current rebuildable definition of that domain.

It should include:
- tables
- columns
- constraints
- indexes
- functions
- views
- shared services used by the domain if appropriate
- comments/section headings
- optional smoke-test queries at the end

Foundation SQL files are not version-numbered in the filename.

Git stores historical versions.

## Domain Documentation Package

Each domain should eventually have:

```text
SQL/DomainName/
    DomainName_Foundation.sql
    DomainName_Changelog.md
    DomainName_Workflow.md
    DomainName_Handoff.md
```

### Foundation

Current SQL implementation.

### Changelog

Domain history. Append new entries when the domain changes meaningfully.

### Workflow

Current user/business behavior of the domain.

### Handoff

Current technical/domain implementation notes needed to resume work.

The Handoff should include what remains open at the end.

## Markdown Standard

New documentation should be maintained in Markdown during development.

Markdown is the master format.

DOCX and PDF are generated only when needed for sharing, printing, release, or legacy document updates.

For legacy DOCX documents, updated text may be provided for manual copy/paste.

## Git / Repository Standard

Nothing important should exist only in chat history or only in the live Supabase database.

At a milestone:
- update relevant SQL files
- update relevant Markdown files
- commit Appsmith
- commit SQL/docs to GitHub
- save local copies

GitHub and the local computer should mirror the same project structure.

## Chat Transition Standard

A chat is not complete just because the code works.

A chat is complete when:
- implementation is stable for the current stage
- known foundation problems are fixed
- affected docs are updated
- affected SQL files are updated
- GitHub is updated
- local copies are updated
- the Start of Chat package for the next chat is prepared

## Start of Chat Package

The Start of Chat package is what gets sent to a new chat.

It should include only what the next chat needs.

Typical package:
- Development Standards
- current domain Workflow
- current domain Foundation SQL
- current domain Handoff
- Start of Chat summary

Optional, only when needed:
- Canonical Specifications
- Architecture
- Domain Rules
- Appsmith JSON exports
- old historical docs

Do not send heavy JSON/Appsmith exports unless specifically needed.

## Start of Chat Summary

The Start of Chat summary should explain:

1. Where the previous chat started.
2. What was completed.
3. Where the project is now.
4. Current blockers, if any.
5. Immediate next work.
6. Next stage after that.
7. Files being sent and why.
8. Areas requiring fresh-eye review.
9. User working style reminders.

## Fresh-Eye Review Standard

At the start of a major new stage, perform a fresh-eye review.

Fresh-eye review should ask:
- Does the current implementation match the current rules?
- Is any logic duplicated unnecessarily?
- Should business logic move from Appsmith to Supabase?
- Is any domain-specific logic actually shared logic?
- Is naming still consistent?
- Are there old assumptions that are now wrong?
- Are we about to build on a weak foundation?

Fresh-eye review is especially important after a long chat or after a major architecture change.

## Normalization Philosophy

Savveyra was built domain by domain.

Normalization should happen layer by layer across domains.

Do not normalize one whole domain in isolation if doing so risks downstream disruption.

Recommended normalization layers:
1. Project standards and documentation.
2. Supabase shared services.
3. Naming conventions.
4. CRUD behavior.
5. List behavior.
6. Editor/header behavior.
7. Component table behavior.
8. Propagation/rebuild behavior.
9. Output modules.
10. Final cross-domain review.

## Normalization Rule

If a later domain developed a better pattern, that pattern becomes a candidate standard for earlier domains.

Quotation introduced several standards that may become project-wide:
- business rules in Supabase
- shared document numbering
- domain foundation SQL
- domain workflow/changelog/handoff package
- thin Appsmith pages
- one business action = one Supabase function

Older domains should be reviewed against these standards during normalization.

## Scope Discipline

Savveyra should not become:
- accounting software
- CRM
- inventory management
- purchase order management
- internal messaging
- ERP
- payroll
- scheduling
- POS

When a feature starts drifting into one of these areas, stop and ask whether it belongs in Savveyra.

Savveyra should provide operational truth and practical planning outputs.

Users remain responsible for business decisions and communication.

## Design Principle

Never simplify the user's real workflow just to simplify the software.

Simplify the software around the user's real workflow.

## Completion Definition

A domain or stage is not complete until:
- Supabase behavior is correct
- Appsmith behavior is correct
- user workflow is validated
- downstream impact is understood
- documentation is updated
- foundation SQL is saved
- GitHub/local copies are updated
- known issues are listed or resolved
