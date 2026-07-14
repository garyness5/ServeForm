# Savveyra Development Standards

## Purpose

This document defines how Savveyra should be developed, normalized, documented, and handed off between development sessions.

It applies to every domain of the application.

It defines the development methodology rather than product behavior.

Product behavior belongs in:

* Canonical Specifications
* Architecture
* Domain Rules
* Individual Domain Workflow documents

This document defines how development decisions are made, implemented, documented, normalized, and maintained throughout the life of the project.

---

# Core Development Philosophy

Operational logic always comes first.

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

Technology exists to support operational workflow.

Technical convenience must never replace operational correctness.

The objective is not to build the most technically sophisticated system.

The objective is to build the simplest architecture that correctly supports real food-service operations.

Whenever implementation exposes weaknesses in earlier assumptions, the stronger operational model becomes the new standard.

Development should continually normalize the application toward the strongest operational solution discovered.

---

# Product Philosophy

Savveyra is an operational planning system.

The connected operational workflow is the product.

Every implementation decision should strengthen the connected workflow rather than create isolated features.

The application exists to answer practical operational questions before production begins.

Typical questions include:

* What does this cost?
* What changed?
* What must be produced?
* What ingredients are required?
* What must be purchased?
* What proposal reflects the current customer agreement?
* What is the current operational truth?

The application provides information.

The user makes business decisions.

---

# Gary Working Style

Gary is not a programmer.

Development should therefore:

* Provide complete SQL.
* Provide complete Appsmith bindings.
* Provide complete JavaScript.
* Prefer replacing complete procedures rather than partial edits.
* Identify the exact procedure or query to replace.
* Keep explanations concise.
* Focus on the next implementation step.
* Push back when operational reasoning appears weak.
* Never agree merely for reassurance.
* Treat documentation as part of the deliverable.
* Prefer correcting weak foundations rather than building on them.
* Encourage fresh-eye reviews at the beginning of major implementation stages.

---

# Operational Before Technical

Whenever a design question arises, ask:

```text
What is the correct operational workflow?
```

before asking:

```text
How should this be implemented?
```

Operational workflow determines architecture.

Architecture determines implementation.

Implementation should not redefine operational behavior simply because implementation is easier.

---

# Domain Ownership

Each domain owns one operational responsibility.

Domains communicate through published information rather than direct internal access.

Each domain should expose stable interfaces.

Internal implementation should remain independent.

A domain should never directly manipulate another domain's operational information.

---

# Shared Operational Domain

Events are the only shared operational domain.

Everything before Events is primarily Kitchen planning.

Everything after Events consists of downstream output workflows.

Either Kitchen or Sales/Admin may:

* create an Event
* complete an Event
* maintain Event administrative information

Only Event Name is required to begin an Event.

Customer, Contact, Venue, scheduling, menus, guests, and other information may be completed later by whichever department possesses the information.

This shared ownership should remain the preferred operational model throughout future development.

---

# Supabase Responsibility

Supabase owns business rules.

Before implementing logic in Appsmith always ask:

```text
Can this rule live entirely in Supabase?
```

If yes, it normally belongs there.

Supabase should own:

* validation
* lifecycle management
* numbering
* duplicate behavior
* rename behavior
* replace behavior
* delete behavior
* propagation
* financial calculations
* snapshot creation
* update behavior
* shared calculations
* shared services
* business integrity
* data integrity

The database should remain capable of protecting the business even if Appsmith contains errors.

---

# Appsmith Responsibility

Appsmith owns presentation.

Typical responsibilities include:

* layout
* buttons
* tables
* modals
* navigation
* warnings
* confirmations
* user interaction
* visible state
* page flow
* refresh behavior

Appsmith should remain intentionally thin.

Business rules should not be duplicated in Appsmith whenever Supabase can enforce them.

---

# One Business Action = One Supabase Function

A user-facing business action should normally map to one Supabase function.

Preferred:

```text
Button
↓
Supabase Function
↓
Validation
↓
Business Rules
↓
Calculations
↓
Result
```

Avoid workflows requiring numerous independent queries followed by Appsmith corrections.

Business behavior should remain centralized.

---

# Workspace Editing Standard

When users edit a complete operational workspace, the preferred model is:

```text
User edits freely

↓

One Save

↓

One Supabase business action
```

Inline row saving should be avoided unless the domain is intentionally designed around independent row editing.

Quotation established this as the preferred workspace editing pattern.

Other editor pages should be reviewed against this standard during normalization.

---

# Thin Appsmith Standard

As the application matures, Appsmith should primarily:

* load data from views
* display information
* collect user input
* present warnings
* call Supabase
* refresh views

Business calculations should continue moving toward Supabase.

Views should expose display-ready information whenever practical.

---

# Shared Services Before Duplicate Logic

If multiple domains require the same business behavior, implement it once.

Examples include:

* document numbering
* duplicate behavior
* rename
* replace
* delete
* normalized name checking
* impact counting
* archive routines
* snapshot services
* validation
* status transitions

Shared services reduce maintenance and improve consistency.

---

# Fix Foundation Problems Immediately

If implementation reveals weaknesses in:

* architecture
* shared services
* earlier domains
* business assumptions

correct the foundation before continuing whenever practical.

Do not knowingly build downstream functionality on weak logic.

Normalization exists specifically to strengthen earlier implementation.

---

# Shared Data Model / Page-Specific UI Standard

Supabase should maintain one shared business model.

Appsmith may use page-specific user interfaces when platform limitations or user experience justify duplication.

Typical examples include:

* Customer modal
* Contact modal
* Venue modal

Business rules remain shared.

Presentation may differ by page.

This became the preferred architecture during Quotation normalization.

---

# Lookup Object Standard

Shared lookup objects should follow a consistent interaction model.

Preferred button behavior:

```text
+
```

means:

```text
Add
```

and

```text
i
```

means:

```text
View / Edit
```

The same button should determine its behavior from current context rather than requiring separate Add and Edit buttons.

This standard currently applies to:

* Customers
* Contacts
* Venues

Additional lookup domains should adopt the same interaction pattern whenever practical.

# View Strategy

Supabase views should expose display-ready information.

Views should provide:

* labels
* calculated totals
* warning flags
* counts
* summaries
* current versus imported values
* operational status
* display-ready derived values

Appsmith should display information rather than recreate business calculations.

---

# Foundation SQL Standard

Each domain should maintain one current Foundation SQL file.

Example:

```text
SQL/Quotation/
    Quotation_Foundation.sql
```

Foundation SQL represents the rebuildable definition of the current domain.

Foundation SQL should include:

* tables
* constraints
* indexes
* functions
* views
* shared services where appropriate
* comments
* optional smoke tests

Foundation SQL files are never versioned in their filename.

Git maintains historical versions.

---

# Domain Documentation Standard

Each domain should maintain its own documentation package.

Typical structure:

```text
SQL/DomainName/

DomainName_Foundation.sql
DomainName_Workflow.md
DomainName_Changelog.md
DomainName_Handoff.md
```

## Foundation

Current SQL implementation.

## Workflow

Current operational behavior.

## Changelog

Meaningful operational history.

## Handoff

Current implementation state and continuation notes.

Documentation should always describe the current implementation.

---

# Markdown Standard

Markdown is the master documentation format.

DOCX or PDF should be generated only when required for:

* distribution
* printing
* customer release
* legacy compatibility

Markdown should remain the authoritative editable source.

---

# Git Standard

No important implementation should exist only in:

* chat history
* live database
* Appsmith cloud

At each milestone:

* update SQL
* update documentation
* commit Appsmith
* commit Git
* synchronize local copies

Git becomes the permanent implementation history.

---

# Chat Completion Standard

A chat is complete only when:

* implementation is stable
* foundation weaknesses are corrected
* affected documentation is updated
* Foundation SQL is updated
* Git is updated
* local copies are synchronized
* the next chat package has been prepared

Coding alone does not complete a development stage.

---

# Start of Chat Package

A Start of Chat package should include only the information required for the next implementation stage.

Typical contents:

* Development Standards
* current Workflow
* current Foundation SQL
* current Handoff
* Start of Chat summary

Additional documents should be included only when implementation requires them.

Avoid unnecessarily large exports.

---

# Start of Chat Summary

The summary should explain:

1. Where the previous chat began.
2. What was completed.
3. Current project status.
4. Current blockers.
5. Immediate next work.
6. Following stage.
7. Files included.
8. Areas requiring fresh-eye review.
9. User working style reminders.

The objective is to begin implementation immediately rather than reconstruct previous conversations.

---

# Fresh-Eye Review

Fresh-eye reviews should occur:

* at the beginning of major implementation stages
* after significant architectural changes
* after long development sessions
* before beginning a new domain

Questions should include:

* Does implementation still match operational workflow?
* Are business rules duplicated?
* Should logic move into Supabase?
* Can shared services replace duplicated code?
* Are naming conventions still consistent?
* Have later discoveries improved earlier assumptions?
* Are we about to build on weak foundations?

Fresh-eye review is intended to improve the product rather than merely validate existing work.

---

# Normalization Philosophy

Savveyra was intentionally built domain by domain.

Normalization should occur layer by layer across the application.

Recommended normalization order:

1. Project documentation
2. Shared services
3. Naming
4. CRUD
5. Lists
6. Editors
7. Component tables
8. Propagation
9. Output workflows
10. Cross-domain review

The strongest operational implementation discovered becomes the preferred project standard.

Earlier domains should gradually adopt stronger later patterns whenever operationally beneficial.

---

# Scope Discipline

Savveyra should remain intentionally focused.

It should not become:

* Accounting
* ERP
* CRM
* Inventory Management
* Purchase Order Management
* Payroll
* Production Scheduling
* Supplier Ordering
* Internal Messaging
* Warehouse Management
* Point of Sale

Savveyra provides operational truth.

Users remain responsible for business decisions.

---

# Design Principle

Never simplify the user's workflow merely to simplify the software.

Instead:

Simplify the software around the user's real workflow.

Operational correctness always takes priority over technical convenience.

---

# Completion Definition

A development stage is complete only when:

* operational behavior is correct
* Supabase implementation is correct
* Appsmith implementation is correct
* user workflow is validated
* documentation is synchronized
* Foundation SQL is current
* Git is current
* local copies are synchronized
* known issues are documented
* the next chat can continue immediately without reconstructing previous work

The objective is continuous development on a stable, fully documented foundation.

# End of Document
