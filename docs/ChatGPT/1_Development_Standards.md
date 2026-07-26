Savveyra Development Standards
Purpose

This document defines the standards used to develop, normalize, implement, document, review and maintain Savveyra.

It applies to every domain within the application.

This document defines the development methodology, not the product itself.

Product behaviour belongs in:

Canonical Specifications
Architecture
Domain Rules
Domain Workflow documents

Implementation belongs in:

Supabase
Appsmith
Shared Services
Foundation SQL

This document defines how development decisions are made and how the project evolves over time.

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
    ├── Shared Services
    ├── Supabase
    └── Appsmith

Operational workflow determines the product.

The product determines the architecture.

The architecture determines the implementation.

Implementation must never redefine operational behaviour because implementation is easier.

Technology exists to support operations.

Operations never exist to support technology.

Whenever implementation reveals a better operational model, the documentation should be updated so the stronger model becomes the new project standard.

Normalization is expected throughout the life of the project.

Product Philosophy

Savveyra is an operational planning platform for food-service businesses.

The connected operational workflow is the product.

Every implementation decision should strengthen that workflow rather than create isolated functionality.

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

Operational Before Technical

Whenever a design decision is required, always determine first:

What is the correct operational workflow?

Only afterwards determine:

How should that workflow be implemented?

Operational correctness always has priority over technical convenience.

The preferred implementation is the simplest implementation that correctly supports real food-service operations.

Foundation First

Whenever implementation exposes weaknesses in:

business logic
architecture
ownership
propagation
shared services
earlier domains
published contracts
documentation

correct the foundation before continuing whenever practical.

Never knowingly build additional functionality on a weak foundation.

Normalization exists to strengthen earlier implementation rather than simply add new functionality.

Domain Ownership

Every domain owns one operational responsibility.

Each domain owns:

business rules
validation
lifecycle
publication
downstream contract

Domains communicate only through published information.

Domains should never manipulate another domain's internal implementation.

Every domain exposes a stable operational interface while remaining internally independent.

Published State Philosophy

Every editable domain operates using two distinct states.

Working State

Represents the current editing session.

Working State may contain:

incomplete information
temporary calculations
warnings
experimental changes

Working State affects only the current workspace.

Nothing in Working State propagates downstream.

Published State

Published State represents the last successfully saved business object.

Only Published State:

propagates
participates in costing
participates in production planning
becomes available to downstream domains
becomes available to Output domains

Published State remains unchanged until Save succeeds.

Save Standard

Save represents one complete business action.

A successful Save should normally:

Validate.
Apply business rules.
Write domain data.
Update calculations.
Publish downstream information.
Refresh affected views.
Return the updated Published State.

Either the complete Save succeeds or nothing changes.

Partial business saves should not occur.

Workspace Standard

Editable domains should follow one consistent editing model.

Open
   ↓
Edit Freely
   ↓
Save
   ↓
Refresh

Users should be able to experiment safely without affecting operational planning until Save succeeds.

Closing without saving discards only the Working State.

Published State remains unchanged.

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
Publication
      ↓
Result

Avoid workflows requiring multiple Appsmith queries that reconstruct business behaviour.

Business logic belongs in Supabase whenever practical.

Supabase Responsibilities

Supabase is the operational authority.

Before implementing any business logic in Appsmith, first determine whether it belongs in Supabase.

Whenever practical, Supabase should own:

business rules
validation
lifecycle management
numbering
duplicate behaviour
rename behaviour
replace behaviour
delete behaviour
propagation
publication
snapshot creation
financial calculations
shared calculations
shared services
business integrity
data integrity

Business integrity must never depend upon Appsmith.

Appsmith Responsibilities

Appsmith owns presentation and user interaction.

Typical responsibilities include:

page layout
navigation
tables
forms
modals
buttons
confirmations
warnings
visible state
temporary editing state
refresh behaviour

Appsmith should remain intentionally thin.

Business rules should not be duplicated in Appsmith when Supabase can enforce them.

Thin Appsmith Standard

As the application matures, Appsmith should primarily:

load published views
display information
collect user input
present warnings
present confirmations
call Supabase functions
refresh data

Business behaviour should continue moving into Supabase whenever practical.

Views should expose display-ready information.

Appsmith should rarely reconstruct business logic.

Shared Services Standard

Business behaviour reused across multiple domains should exist once.

Typical Shared Services include:

duplicate
rename
replace
delete
numbering
validation
publication
normalization
status handling
lookup services
impact counting
snapshot creation

Shared Services should remain independent of individual domains.

Future domains should reuse Shared Services rather than creating their own implementations.

Validation Standard

Validation exists to protect operational correctness.

Validation should normally occur in three layers.

User Interface

Provides immediate feedback.

Examples include:

required fields
formatting
obvious omissions
Domain Validation

Protects business rules.

Examples include:

duplicate prevention
circular references
ownership rules
invalid composition
publication rules
Database Validation

Protects data integrity.

Examples include:

foreign keys
constraints
transactions
indexes

Business validation should occur before database constraints whenever practical.

View Strategy

Views represent the presentation boundary between Supabase and Appsmith.

Views should expose display-ready information.

Typical view content includes:

display labels
summaries
counts
warnings
operational indicators
calculated values
derived display fields
current published information

Appsmith should display published information rather than reconstruct calculations.

Views form part of the published contract between Supabase and Appsmith.

Shared Data / Page-Specific UI Standard

Supabase maintains one shared business model.

Appsmith may legitimately present that information differently where workflow requires it.

Examples include:

Customer modal
Contact modal
Venue modal

Business rules remain shared.

Presentation may vary.

One business object may have multiple user interfaces.

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

The same control should determine its behaviour from context rather than requiring separate Add and Edit controls.

Future lookup domains should adopt the same interaction model whenever practical.

CRUD Standard

Every domain should expose a consistent operational CRUD experience.

Typical operations include:

Create
Read
Update
Duplicate
Rename
Replace
Delete
Status Change

Where identical behaviour exists, CRUD should call Shared Services rather than implement domain-specific logic.

Users should experience consistent behaviour regardless of domain.

Foundation SQL Standard

Each domain maintains one current Foundation SQL file.

Example:

SQL/Customer/
    Customer_Foundation.sql

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

Foundation SQL filenames are never versioned.

Git maintains implementation history.

Documentation Standard

Savveyra documentation exists in three categories.

1. Permanent Foundation Documents

These define the product itself.

They change only when the product changes.

Current foundation documents include:

Development Standards
Canonical Specifications
Architecture
Domain Rules
Events / Proposal / Quotation Architecture
Kitchen ↔ Sales Workflow

These documents define the product and should remain implementation-independent.

2. Domain Documents

Each domain maintains its own implementation documentation.

Typical structure:

SQL/Customer/
    Customer_Foundation.sql
    Customer_Workflow.md
    Customer_Changelog.md
Foundation SQL

The rebuildable SQL implementation for the domain.

Workflow

Current operational behaviour.

Changelog

Meaningful implementation history affecting that domain.

3. Temporary Development Documents

Temporary documents exist only to continue development.

Typical examples include:

Handoff
Start of Chat

The Handoff records the current implementation state.

The Start of Chat introduces the documentation package and directs development to the Handoff.

Temporary documents must never redefine the product.

Markdown Standard

Markdown is the authoritative editable documentation format.

DOCX and PDF exist only for:

printing
distribution
customer release
legacy compatibility

Markdown remains the editable master copy.

Git Standard

No important implementation should exist only in:

chat history
the live database
Appsmith cloud

At each milestone:

update Foundation SQL
update documentation
commit Appsmith
commit Git
synchronize local copies

Git becomes the permanent implementation history.

Start of Chat Standard

The Start of Chat is a cover page for the next development session.

It should:

identify the documentation package
explain the purpose of each document
specify the reading order
direct the reader to the Handoff

It should not contain implementation details.

Implementation status belongs only in the Handoff.

Handoff Standard

The Handoff records only the current implementation state.

It should contain:

current milestone
current implementation status
work completed during the previous chat
verified decisions
current blocker, if any
known issues
assumptions requiring validation
files modified
immediate next implementation step
recommended resume order

The Handoff should allow development to continue immediately without reconstructing previous discussions.

Fresh-Eye Review

Fresh-eye reviews should occur:

before beginning a new domain
before major implementation stages
after significant architectural changes
after extended development sessions
whenever implementation becomes assumption-driven
whenever implementation exposes conflicting assumptions

Typical questions include:

Does implementation still match operational workflow?
Do Canonical Specifications still describe the product?
Does Architecture still reflect the preferred model?
Are business rules duplicated?
Should logic move into Supabase?
Can Shared Services replace duplicated implementation?
Are naming conventions still consistent?
Has a stronger operational pattern emerged?
Are we about to build on a weak foundation?

Fresh-eye reviews exist to improve the product rather than validate previous work.

Normalization Philosophy

Savveyra is intentionally being normalized domain by domain.

Normalization should strengthen consistency across the entire application.

Typical normalization order:

Documentation
Shared Services
Naming
CRUD
Lookup Objects
Editors
Component Tables
Publication
Propagation
Output Workflows
Cross-domain Review

Whenever a stronger operational pattern is discovered, earlier domains should gradually adopt it.

Scope Discipline

Savveyra intentionally remains focused.

It is not intended to become:

Accounting
ERP
CRM
Inventory Management
Purchase Order Management
Payroll
Warehouse Management
Supplier Ordering
Point of Sale
Human Resources
Production Scheduling
Internal Messaging

Savveyra provides operational truth.

Users remain responsible for business decisions.

Design Principles

Every development decision should strengthen:

operational correctness
simplicity
visibility
predictability
maintainability
normalization
reuse
clear ownership
stable published contracts

Never simplify the user's workflow merely to simplify the software.

Instead:

Simplify the software around the user's real workflow.

Operational correctness always takes priority over technical convenience.

Completion Standard

A development stage is complete only when:

operational behaviour is correct
Supabase implementation is correct
Appsmith implementation is correct
user workflow has been validated
documentation has been synchronized
Foundation SQL has been updated
Git has been updated
local copies have been synchronized
known issues have been documented
the next Handoff has been prepared

Implementation alone does not complete a development stage.

The objective is continuous development on a stable, fully documented foundation.