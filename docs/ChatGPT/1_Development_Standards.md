Savveyra Development Standards
Purpose

This document defines the standards used to develop, normalize, document, and maintain Savveyra.

It applies to every domain within the application.

It defines the development methodology rather than product behavior.

Product behavior belongs in:

Canonical Specifications
Architecture
Domain Rules
Domain Workflow documents

This document defines how development decisions are made, implemented, documented, reviewed, normalized, and maintained throughout the life of the project.

Core Development Philosophy

Operational logic always comes first.

Development follows this hierarchy:

Operational Logic
↓
Canonical Specifications
↓
Domain Rules
↓
Architecture
↓
Implementation
    ├── Supabase
    └── Appsmith

Operational workflow determines the product.

The product determines the architecture.

The architecture determines the implementation.

Implementation must never redefine operational behavior simply because implementation is easier.

Technology exists to support operations.

Operations never exist to support technology.

Whenever implementation exposes weaknesses in an earlier decision, the stronger operational model becomes the new project standard.

Normalization is expected throughout the life of the project.

Product Philosophy

Savveyra is an operational planning platform.

The connected operational workflow is the product.

Every implementation decision should strengthen the connected workflow rather than create isolated functionality.

The application exists to answer practical operational questions before production begins.

Typical questions include:

What does this cost?
What changed?
What must be produced?
What ingredients are required?
What must be purchased?
Which Proposal reflects the current customer agreement?
What is the current operational truth?

Savveyra provides operational truth.

Users make business decisions.

Gary Working Style

Development should assume that complete implementation is more valuable than partial examples.

Whenever possible provide:

complete SQL
complete Appsmith bindings
complete JavaScript
complete procedures
exact objects to replace

Avoid partial edits whenever a complete replacement is simpler and safer.

Keep explanations concise.

Focus on the next implementation step.

Challenge weak operational assumptions rather than agreeing for reassurance.

Documentation is part of the deliverable.

When a foundation is weak, correct the foundation before building on it.

Fresh-eye reviews should occur whenever entering a major implementation stage.

Operational Before Technical

Whenever a design decision is required, first determine:

What is the correct operational workflow?

Only then determine:

How should it be implemented?

Operational correctness always has priority over technical convenience.

The preferred solution is the simplest implementation that correctly supports real food-service operations.

Domain Ownership

Every domain owns one operational responsibility.

Each domain owns:

business rules
validation
lifecycle
publication
downstream contract

Domains communicate only through published information.

Domains should never manipulate another domain's internal implementation directly.

Each domain should expose a stable operational interface while remaining internally independent.

Supabase Responsibilities

Supabase is the operational authority.

Before implementing any business logic in Appsmith, first determine whether it belongs in Supabase.

Whenever practical, Supabase should own:

business rules
validation
lifecycle management
numbering
duplicate behavior
rename behavior
replace behavior
delete behavior
propagation
publication
financial calculations
snapshot creation
update behavior
shared calculations
shared services
business integrity
data integrity

Business integrity should never depend upon Appsmith.

Appsmith Responsibilities

Appsmith owns presentation.

Typical responsibilities include:

page layout
navigation
tables
forms
modals
buttons
warnings
confirmations
user interaction
visible state
refresh behavior

Appsmith should remain intentionally thin.

Business rules should not be duplicated in Appsmith when Supabase can enforce them.

One Business Action = One Supabase Function

A user-facing business action should normally correspond to one Supabase function.

Preferred pattern:

User Action
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

Avoid workflows that require numerous independent queries followed by Appsmith corrections.

Business behavior should remain centralized within Supabase.

Workspace Editing Standard

Operational workspaces should follow one editing model.

Preferred workflow:

Open
↓
Edit Freely
↓
Save
↓
Refresh

The Save action commits the complete workspace.

Inline row-save behavior should be avoided unless the workspace is intentionally row-oriented.

Quotation established this as the preferred editing pattern.

Future operational editors should adopt the same model whenever practical.

Thin Appsmith Standard

As the application matures, Appsmith should primarily:

load data from views
display information
collect user input
present warnings
present confirmations
call Supabase functions
refresh views

Business calculations should continue moving into Supabase.

Views should expose display-ready information whenever practical.

Shared Services Standard

If multiple domains require the same business behavior, implement it once.

Typical shared services include:

numbering
duplicate
rename
replace
delete
validation
status transitions
snapshot creation
normalization
impact counting
lookup services

Shared Services should remain independent of individual domains.

New domains should reuse existing Shared Services rather than creating new implementations.

Foundation First

If implementation reveals weaknesses in:

architecture
shared services
earlier domains
business assumptions
published contracts

correct the foundation before continuing whenever practical.

Do not knowingly build downstream functionality on weak foundations.

Normalization exists to strengthen earlier implementation.

Shared Data / Page-Specific UI Standard

Supabase maintains one shared business model.

Appsmith may present that information differently where workflow or user experience justifies it.

Typical examples include:

Customer modal
Contact modal
Venue modal

Business rules remain shared.

Presentation may differ by page.

One business object may legitimately have multiple user interfaces.

Lookup Object Standard

Reusable lookup objects should follow one consistent interaction model.

Preferred controls:

+

means

Add

and

i

means

View / Edit

The same control should determine its behavior from current context rather than requiring separate Add and Edit controls.

This interaction model should be adopted by future lookup domains whenever practical.

View Strategy

Supabase views should expose display-ready information.

Views should provide, where appropriate:

labels
calculated totals
warning flags
counts
summaries
current versus historical indicators
operational status
derived display values

Appsmith should display information rather than recreate business calculations.

Foundation SQL Standard

Each domain should maintain one current Foundation SQL file.

Example:

SQL/Quotation/
    Quotation_Foundation.sql

Foundation SQL represents the rebuildable definition of the current domain.

Foundation SQL should contain:

tables
constraints
indexes
functions
views
shared services where appropriate
comments
optional smoke tests

Foundation SQL files are never versioned in their filenames.

Git maintains version history.

Documentation Standard

Documentation is divided into three categories.

1. Permanent Foundation Documents

These define the product itself and change only when the product changes.

Current foundation documents include:

Development Standards
Canonical Specifications
Architecture
Domain Rules
Events / Proposal / Quotation Architecture
Kitchen ↔ Sales Workflow
2. Domain Documents

Each domain maintains its own implementation documents.

Typical structure:

SQL/DomainName/

DomainName_Foundation.sql
DomainName_Workflow.md
DomainName_Changelog.md
Foundation SQL

Current rebuildable SQL implementation.

Workflow

Current operational behavior.

Changelog

Meaningful operational history.

3. Temporary Documents

Temporary documents exist only to continue development.

These include:

Handoff
Start of Chat

The Handoff describes the current implementation state.

The Start of Chat introduces the documentation package and directs the next development session to the Handoff.

Neither document should redefine the product.

Markdown Standard

Markdown is the authoritative documentation format.

DOCX and PDF exist only for:

printing
distribution
customer release
legacy compatibility

Markdown remains the editable master source.

Git Standard

No important implementation should exist only in:

chat history
live database
Appsmith cloud

At each milestone:

update Foundation SQL
update documentation
commit Appsmith
commit Git
synchronize local copies

Git becomes the permanent implementation history.

Chat Completion Standard

A development stage is complete only when:

implementation is operationally stable
foundation weaknesses have been corrected
affected documentation has been updated
Foundation SQL has been updated
Git has been updated
local copies have been synchronized
the next Handoff has been prepared

Coding alone does not complete a development stage.

Start of Chat Standard

The Start of Chat is a cover page for the next development session.

It should:

identify the documentation package
explain the purpose of each document
specify the reading order
direct the reader to the Handoff for current implementation status

The Start of Chat should not contain implementation details.

Implementation status belongs only in the Handoff.

Handoff Standard

The Handoff records the current implementation state.

It should include:

current implementation status
completed work
current blockers
immediate next task
known issues
assumptions requiring validation
files affected during the session

The Handoff should contain only the information necessary to continue development immediately.

Fresh-Eye Review

Fresh-eye reviews should occur:

before beginning a major implementation stage
after significant architectural changes
after extended development sessions
before beginning a new domain
whenever implementation exposes conflicting assumptions

Questions should include:

Does implementation still match operational workflow?
Do Canonical Specifications still describe the product?
Does Architecture still reflect the preferred operational model?
Are business rules duplicated?
Should logic move into Supabase?
Can Shared Services replace duplicated implementation?
Are naming conventions still consistent?
Have later discoveries improved earlier assumptions?
Are we about to build on weak foundations?

Fresh-eye reviews exist to improve the product rather than validate previous decisions.

Normalization Philosophy

Savveyra was intentionally developed domain by domain.

Normalization should occur layer by layer across the application.

Preferred normalization order:

Documentation
Shared Services
Naming
CRUD
Lookup Objects
Editors
Component Tables
Propagation
Output Workflows
Cross-Domain Review

The strongest operational implementation discovered becomes the preferred project standard.

Earlier domains should gradually adopt stronger patterns whenever operationally beneficial.

Scope Discipline

Savveyra should remain intentionally focused.

It should not become:

Accounting
ERP
CRM
Inventory Management
Purchase Order Management
Payroll
Production Scheduling
Supplier Ordering
Internal Messaging
Warehouse Management
Point of Sale

Savveyra provides operational truth.

Users remain responsible for business decisions.

Design Principles

Development should always support:

operational correctness
simplicity
visibility
predictability
maintainability
normalization
reuse

Never simplify the user's workflow merely to simplify the software.

Instead:

Simplify the software around the user's real workflow.

Operational correctness always takes priority over technical convenience.

Completion Definition

A development stage is complete only when:

operational behavior is correct
Supabase implementation is correct
Appsmith implementation is correct
user workflow has been validated
documentation is synchronized
Foundation SQL is current
Git is current
local copies are synchronized
known issues are documented
the next development session can continue immediately without reconstructing previous work

The objective is continuous development on a stable, fully documented foundation.