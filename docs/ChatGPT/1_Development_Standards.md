# Savveyra Development Standards

## Part 1

# Purpose

This document defines the standards used to develop, document, normalize, implement, review and maintain Savveyra.

It establishes how development decisions are made and how the product evolves over time.

This document defines the development methodology.

It does not define product behaviour.

Product behaviour belongs in:

- Canonical Specifications
- Architecture
- Domain Rules
- Domain Workflow documents

Implementation belongs in:

- Foundation SQL
- Shared Services
- Supabase
- Appsmith

---

# Development Hierarchy

Development follows one consistent hierarchy.

```text
Operational Logic
        ↓
Canonical Specifications
        ↓
Architecture
        ↓
Domain Rules
        ↓
Implementation
```

Operational workflow determines the product.

The product determines the architecture.

The architecture determines the implementation.

Implementation must never redefine operational behaviour because implementation is easier.

Technology exists to support operations.

Operations never exist to support technology.

---

# Product Philosophy

Savveyra is an operational planning platform for food-service businesses.

The connected operational workflow is the product.

Every implementation decision should strengthen that workflow.

The application exists to answer practical operational questions before production begins.

Typical questions include:

- What does this cost?
- What changed?
- What must be produced?
- What ingredients are required?
- What must be purchased?
- Which Proposal was sent?
- Which Quotation was created?
- What is the current operational truth?

Savveyra provides operational truth.

Users make business decisions.

---

# Operational Before Technical

Every design decision begins with one question.

**What is the correct operational workflow?**

Only after that question has been answered should implementation be considered.

Operational correctness always has priority over technical convenience.

The preferred implementation is the simplest implementation that correctly supports real food-service operations.

---

# Foundation First

Whenever implementation exposes weaknesses in:

- operational logic
- documentation
- architecture
- ownership
- publication
- propagation
- shared services
- domain contracts
- normalization

the foundation should be corrected before additional functionality is built whenever practical.

New functionality should never knowingly be built upon weak foundations.

---

# Normalization

Normalization is a continuous process.

Earlier implementation should adopt stronger operational patterns whenever they are discovered.

Normalization may improve:

- documentation
- naming
- ownership
- shared services
- publication
- validation
- workflows
- implementation consistency

The objective is one coherent application rather than independently evolving domains.

---

# Domain Ownership

Every domain owns one operational responsibility.

Each domain owns:

- business rules
- lifecycle
- validation
- publication
- downstream contract

Domains communicate only through published information.

Domains never manipulate another domain's internal implementation.

Each domain exposes a stable operational interface while remaining internally independent.

---

# Working State and Published State

Every editable domain operates using two distinct states.

## Working State

Working State represents the current editing session.

Working State may contain:

- incomplete information
- temporary calculations
- warnings
- experimental changes

Working State affects only the current workspace.

Nothing in Working State becomes available outside the editor.

---

## Published State

Published State represents the last successfully saved business object.

Only Published State:

- propagates
- participates in costing
- participates in production planning
- becomes available downstream
- becomes available to Output domains

Published State remains unchanged until Save completes successfully.

---

# Save Standard

Save represents one complete business action.

A successful Save should normally:

- validate
- apply business rules
- write business data
- perform calculations
- publish information
- refresh affected views
- return the updated Published State

Either the complete Save succeeds or nothing changes.

Partial business saves are not permitted.

---

# Workspace Standard

Every editable domain follows one consistent editing model.

```text
Open

↓

Edit

↓

Save

↓

Refresh
```

Users may experiment freely without affecting operational planning.

Closing without saving discards only the Working State.

Published State remains unchanged.

---

# One Business Action

One user-facing business action should normally correspond to one business function.

Preferred workflow:

```text
User Action

↓

Business Function

↓

Validation

↓

Business Rules

↓

Calculations

↓

Publication

↓

Result
```

Business behaviour should not be reconstructed through multiple client-side actions.

Business actions should execute as complete business transactions.

# Savveyra Development Standards

## Part 2

# Supabase Responsibilities

Supabase is the operational authority.

Whenever practical, Supabase owns:

- business rules
- validation
- lifecycle management
- numbering
- publication
- propagation
- snapshot creation
- calculations
- shared services
- business integrity
- data integrity

Business integrity must never depend upon Appsmith.

---

# Appsmith Responsibilities

Appsmith owns presentation and user interaction.

Typical responsibilities include:

- page layout
- navigation
- tables
- forms
- modals
- buttons
- confirmations
- warnings
- temporary editing state
- refreshing published information

Appsmith should remain intentionally thin.

Business rules should not be duplicated when they can be enforced by Supabase.

---

# Thin Client Standard

As Savveyra matures, Appsmith should primarily:

- load published views
- display information
- collect user input
- present warnings
- present confirmations
- call business functions
- refresh displayed information

Business behaviour should continue moving into Supabase whenever practical.

Views should expose display-ready information.

---

# Shared Services

Business behaviour reused across multiple domains should exist once.

Typical Shared Services include:

- duplicate
- rename
- replace
- delete
- numbering
- publication
- validation
- normalization
- status handling
- lookup services
- impact counting
- snapshot creation

Shared Services should remain independent of individual domains.

Future domains should reuse Shared Services instead of implementing their own versions.

---

# Validation

Validation protects operational correctness.

Validation normally exists in three layers.

```text
User Interface

↓

Business Validation

↓

Database Integrity
```

Each layer has a different responsibility.

---

## User Interface Validation

User Interface validation provides immediate feedback.

Typical examples include:

- required fields
- formatting
- obvious omissions
- user guidance

Interface validation improves usability.

It does not protect business integrity.

---

## Business Validation

Business Validation protects operational rules.

Typical examples include:

- duplicate prevention
- ownership rules
- publication rules
- circular references
- invalid composition
- incompatible units

Business Validation belongs primarily within Supabase.

---

## Database Integrity

Database Integrity protects stored information.

Typical mechanisms include:

- primary keys
- foreign keys
- constraints
- indexes
- transactions

Database Integrity protects the data.

It should not become the primary implementation of business rules.

---

# View Strategy

Views represent the presentation boundary between Supabase and Appsmith.

Views should expose display-ready information.

Typical view content includes:

- display labels
- summaries
- counts
- warnings
- operational indicators
- calculated values
- derived display fields
- current Published State

Appsmith should display published information rather than reconstruct business logic.

Views form part of the published contract between Supabase and Appsmith.

---

# Shared Business Model

Supabase maintains one shared business model.

Appsmith may present that information differently where workflow requires it.

Business rules remain shared.

Presentation may vary.

One business object may legitimately have multiple user interfaces.

---

# Lookup Objects

Reusable lookup objects should follow one consistent interaction model.

Preferred controls are:

- **+** — Add
- **i** — View / Edit

The control determines its behaviour from context rather than requiring separate Add and Edit actions.

Future lookup domains should adopt the same interaction model whenever practical.

---

# CRUD Standard

Every editable domain should provide a consistent operational experience.

Standard business actions include:

- Create
- Read
- Update
- Duplicate
- Rename
- Replace
- Delete
- Change Status

Where identical behaviour exists, domains should call Shared Services rather than implement domain-specific logic.

Users should experience consistent behaviour throughout the application.

# Savveyra Development Standards

## Part 3

# Foundation SQL Standard

Each domain maintains one current Foundation SQL file.

Example:

```text
SQL/
└── Customer/
    └── Customer_Foundation.sql
```

Foundation SQL represents the rebuildable definition of the current domain.

Foundation SQL should contain:

- tables
- constraints
- indexes
- views
- business functions
- shared services where appropriate
- comments
- optional smoke tests

Foundation SQL filenames are never versioned.

Version history belongs to Git.

---

# Documentation Standard

Savveyra documentation exists in three categories.

## Permanent Foundation Documents

Foundation Documents define the product itself.

They change only when the product changes.

Current Foundation Documents include:

- Development Standards
- Canonical Specifications
- Architecture
- Domain Rules
- Events, Proposal & Quotation Architecture
- Kitchen ↔ Sales Workflow

These documents define the product.

They remain implementation-independent.

---

## Domain Documents

Each domain maintains its own implementation documentation.

Typical structure:

```text
SQL/
└── Customer/
    ├── Customer_Foundation.sql
    ├── Customer_Workflow.md
    └── Customer_Changelog.md
```

### Foundation SQL

The rebuildable SQL implementation for the domain.

### Workflow

The current operational behaviour of the domain.

### Changelog

Meaningful implementation history affecting that domain.

---

## Temporary Development Documents

Temporary documents exist only to continue development.

Typical examples include:

- Start of Chat
- Handoff

Temporary documents never redefine the product.

Implementation status belongs only in the Handoff.

---

# Markdown Standard

Markdown is the authoritative editable documentation format.

Other formats such as DOCX and PDF exist only for:

- printing
- distribution
- customer release
- legacy compatibility

Markdown remains the editable master copy.

---

# Git Standard

No important implementation should exist only in:

- chat history
- the live database
- Appsmith Cloud

At each milestone:

- update Foundation SQL
- update documentation
- commit Appsmith
- commit Git
- synchronize local copies

Git becomes the permanent implementation history.

---

# Start of Chat Standard

The Start of Chat serves as the cover page for the next development session.

It should:

- identify the documentation package
- explain the purpose of each document
- specify the reading order
- direct the reader to the Handoff

It should not contain implementation details.

Implementation status belongs only in the Handoff.

---

# Handoff Standard

The Handoff records only the current implementation state.

It should contain:

- current milestone
- current implementation status
- completed work
- verified decisions
- current blocker, if any
- known issues
- assumptions requiring validation
- modified files
- immediate next implementation step
- recommended resume order

The Handoff should allow development to continue immediately without reconstructing previous discussions.

---

# Fresh-Eye Review

Fresh-eye reviews should occur:

- before beginning a new domain
- before major implementation stages
- after significant architectural changes
- after extended development sessions
- whenever implementation becomes assumption-driven
- whenever conflicting assumptions are discovered

Typical review questions include:

- Does implementation still match operational workflow?
- Do the Canonical Specifications still define the product?
- Does the Architecture still represent the preferred model?
- Are business rules duplicated?
- Should logic move into Shared Services?
- Should logic move into Supabase?
- Can duplicated implementation be normalized?
- Are naming conventions still consistent?
- Has a stronger operational pattern emerged?
- Are we building on a weak foundation?

Fresh-eye reviews exist to improve the product rather than validate previous implementation.

---

# Normalization Philosophy

Savveyra is intentionally normalized throughout its development.

Normalization strengthens consistency across the application.

Typical normalization areas include:

- documentation
- shared services
- naming
- CRUD behaviour
- lookup objects
- editors
- component tables
- publication
- propagation
- output workflows
- cross-domain consistency

Whenever a stronger operational pattern is discovered, earlier domains should gradually adopt it.

# Savveyra Development Standards

## Part 4

# Scope Discipline

Savveyra intentionally remains focused on operational planning.

It is not intended to become:

- Accounting
- ERP
- CRM
- Inventory Management
- Purchase Order Management
- Supplier Ordering
- Warehouse Management
- Payroll
- Human Resources
- Production Scheduling
- Point of Sale
- Internal Messaging

Savveyra provides operational truth.

Users remain responsible for business decisions.

---

# Design Principles

Every development decision should strengthen:

- operational correctness
- simplicity
- visibility
- predictability
- maintainability
- normalization
- reuse
- clear ownership
- stable published contracts
- historical accuracy

Software should be simplified around the user's operational workflow.

The user's workflow should never be simplified merely to make implementation easier.

Operational correctness always takes priority over technical convenience.

---

# Consistency Standard

Similar operational behaviour should always produce similar implementation.

Users should not need to learn different workflows for equivalent business actions.

Consistency should exist across:

- editors
- lookup objects
- CRUD operations
- numbering
- publication
- validation
- status handling
- navigation
- confirmations
- warnings

Consistency improves usability, reduces training and simplifies maintenance.

---

# Ownership Standard

Every business object has one authoritative owner.

Only the owning domain may:

- create
- modify
- validate
- publish
- define lifecycle
- define business rules

Downstream domains consume published information.

Ownership never transfers because another domain uses that information.

---

# Historical Integrity

Current operational information and historical information are equally important.

Current information supports:

- planning
- costing
- production
- purchasing preparation

Historical information supports:

- customer communication
- auditing
- comparison
- legal reference
- operational history

Historical information must never be rewritten to match current operational information.

---

# Simplicity Standard

Savveyra should remain as simple as operational correctness allows.

Complexity should exist only when it provides genuine operational value.

Where multiple correct solutions exist, the preferred solution is the one that:

- is easiest to understand
- is easiest to maintain
- strengthens normalization
- reduces duplication
- improves consistency

---

# Long-Term Maintainability

Implementation decisions should support long-term maintenance.

Whenever practical:

- reuse existing Shared Services
- reuse existing architectural patterns
- reuse existing workflows
- avoid duplicated business logic
- strengthen documentation

Maintainability should improve continuously as the application evolves.

---

# Documentation Synchronization

Documentation should evolve with the product.

When operational behaviour changes:

1. Update Foundation Documents.
2. Update Domain Documentation.
3. Update Foundation SQL where required.
4. Update implementation.
5. Update the Handoff.

Documentation should accurately describe the current product at every development milestone.

---

# Completion Standard

A development stage is complete only when:

- operational behaviour is correct
- documentation reflects the product
- architecture remains consistent
- Foundation SQL has been updated
- Supabase implementation is correct
- Appsmith implementation is correct
- user workflow has been validated
- Git has been updated
- local copies have been synchronized
- known issues have been documented
- the next Handoff has been prepared

Implementation alone does not complete a development stage.

---

# Guiding Principle

Every development decision should strengthen the connected operational workflow.

The objective is continuous development on a stable, normalized and fully documented foundation.

The documentation, architecture and implementation should evolve together while remaining consistent with the operational model.

