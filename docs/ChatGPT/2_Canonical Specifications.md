# Savveyra Canonical Specifications

## Part 1

# Purpose

This document defines the product truth of Savveyra.

It answers:

- What is Savveyra?
- What problems does it solve?
- Who is it designed for?
- What domains exist?
- How do those domains relate to one another?
- What operational workflow does the product support?
- What is intentionally outside the scope of the product?

Canonical Specifications define the product itself.

They do not describe:

- implementation
- SQL
- Supabase
- Appsmith
- user interface
- development progress

Those belong in implementation documentation.

If implementation differs from these specifications, implementation should eventually be corrected.

---

# Product Summary

Savveyra is an operational planning platform for food-service businesses.

It combines:

- operational planning
- food costing
- production planning
- purchasing preparation
- Kitchen Proposal creation
- customer Quotation preparation

into one connected operational workflow.

Its primary purpose is to help operators understand the operational consequences of planning decisions before production begins.

Savveyra answers practical operational questions such as:

- What does this cost?
- What must be produced?
- What ingredients are required?
- What must be purchased?
- What information is missing?
- What changed?
- Which Proposal was sent?
- Which Quotation was created?
- What is the current operational truth?

Costing is an important capability.

Operational planning remains the primary purpose of the system.

The connected operational workflow is the product.

---

# Core Value Proposition

Savveyra connects every stage of food-service planning into one operational chain.

```text
Ingredients
      ↓
Recipes
      ↓
Dishes
      ↓
Menus
      ↓
Events
   ├── Groceries
   └── Proposal
          ↓
      Quotation
```

Each domain adds operational meaning.

Each domain consumes the Published State of the previous domain.

The result is one continuously connected operational workflow.

---

# Target Users

Savveyra is designed primarily for food-service operators requiring practical operational planning without enterprise software complexity.

Typical businesses include:

- Caterers
- Banquet Departments
- Hotels
- Country Clubs
- Conference Centres
- Private Chefs
- Commissary Kitchens
- Boutique Food Manufacturers
- Corporate Catering Operations
- Meal Preparation Businesses

Typical users include:

- Executive Chefs
- Banquet Chefs
- Sous Chefs
- Kitchen Managers
- Catering Owners
- Production Managers
- Event Coordinators

Larger organizations may continue using existing:

- ERP
- CRM
- Accounting
- Purchasing
- Sales systems

while using Savveyra for operational planning.

Small operators may use Savveyra as their complete operational platform.

---

# What Savveyra Is

Savveyra is:

- a food costing system
- a recipe costing system
- a production planning system
- a menu planning system
- an Event planning system
- a grocery preparation system
- a purchasing preparation system
- a Kitchen Proposal system
- a customer Quotation system
- a connected operational planning platform

Savveyra helps users understand operational consequences before production begins.

The application provides operational truth.

Users make business decisions.

---

# What Savveyra Is Not

Savveyra is intentionally not:

- Inventory Management
- Accounting Software
- ERP
- CRM
- Payroll
- Warehouse Management
- Supplier Ordering
- Purchase Order Management
- Production Scheduling
- Human Resources
- Point of Sale

Inventory intentionally remains outside the product boundary.

Savveyra determines operational requirements.

Users decide:

- what inventory already exists
- what should be purchased
- how much should be purchased
- which supplier should be used
- when purchasing should occur

This separation keeps Savveyra focused on operational planning.

---

# Product Philosophy

Savveyra is designed around operational truth.

The application accurately represents the work required to perform an Event.

Users remain responsible for business decisions.

Savveyra informs.

Users decide.

Operational correctness always takes priority over technical convenience.

The preferred workflow is the simplest workflow that correctly supports real operational practice.

Complexity should exist only when it provides genuine operational value.

Every feature should directly contribute to one or more of:

- planning
- costing
- production
- purchasing preparation
- customer communication
- operational visibility
- historical traceability

# Savveyra Canonical Specifications

## Part 2

# System Domains

Savveyra is organized into four architectural groups.

```text
Management
      ↓
Composition
      ↓
Shared Operational
      ↓
Output
```

Each group owns one clearly defined operational responsibility.

Each domain owns:

- business rules
- validation
- lifecycle
- publication
- downstream contract

Each domain publishes only the information required by downstream consumers.

---

# Management Domains

Management Domains maintain reusable business reference information.

Current Management Domains include:

- Customers
- Contacts
- Venues
- Client Helper Lists
- Units
- System Lists

Customers, Contacts and Venues form one coordinated management domain.

Customers own reusable customer information.

Contacts own reusable people.

Venues own reusable venue information.

Relationships between them are maintained through association tables.

A Contact represents one real person.

A Contact may be associated with:

- one Customer
- multiple Customers
- one Venue
- multiple Venues
- both Customers and Venues

Only Name is required to create:

- Customer
- Contact
- Venue

Management Domains support operational planning.

They do not participate in:

- costing
- composition
- propagation

---

# Composition Domains

Composition Domains create operational work.

Current Composition Domains are:

```text
Ingredients
      ↓
Recipes
      ↓
Dishes
      ↓
Menus
      ↓
Events
```

Each Composition Domain consumes Published information from upstream domains.

Each Composition Domain publishes richer operational information downstream.

Composition Domains create the operational planning chain.

---

# Ingredients

Ingredients are the operational foundation of Savveyra.

Everything begins with Ingredients.

Everything ultimately returns to Ingredients.

Ingredients represent purchased products.

Ingredients publish:

- purchasing information
- costing
- purchase units
- wastage
- operational information

used throughout the operational chain.

---

# Recipes

Recipes transform purchased Ingredients into reusable production outputs.

Recipes may contain:

- Ingredients
- Recipes (Sub-Recipes)

Recipes publish:

- yield
- cost per unit
- allergen summary
- manually assigned diet tags
- production summaries

Recipes remain reusable production building blocks.

Recipes may never directly or indirectly contain themselves.

---

# Dishes

Dishes represent prepared food intended for service.

Dishes may contain:

- Ingredients
- Recipes

Dishes publish:

- costing
- production summaries
- operational information

Dishes remain reusable.

---

# Menus

Menus represent reusable guest offerings.

Menus may contain:

- Ingredients
- Recipes
- Dishes

Menus publish:

- guest offering
- operational costing
- production summaries

Guest counts do not belong to Menus.

Menus remain reusable templates.

---

# Shared Operational Domain

Events form the Shared Operational Domain.

Events belong to the business.

They are not owned by Kitchen.

They are not owned by Sales.

Kitchen, Sales and Administration may create and maintain Events according to permissions.

Only Event Name is required to begin an Event.

Events combine:

- Customer
- Customer Contact
- Venue
- Venue Contact
- scheduling
- guest planning
- Menu assignments
- operational administration

Events become the operational source of truth for downstream workflows.

Propagation ends at Events.

---

# Output Domains

Output Domains consume published Event information.

Current Output Domains include:

```text
Events
   ├── Groceries
   └── Proposal
          ↓
      Quotation
```

Output Domains:

- never publish upstream
- own their own refresh behaviour
- own their own historical records
- remain operationally independent

Proposal forms the operational boundary between Kitchen and Sales.

Quotation consumes Proposal snapshots rather than live Kitchen information.

# Savveyra Canonical Specifications

## Part 3

# Events

Events represent operational work.

Events consume Menus.

Events combine:

- Customer assignment
- Customer Contact assignment
- Venue assignment
- Venue Contact assignment
- scheduling
- guest planning
- operational administration
- production planning

Events publish:

- operational planning
- Proposal snapshots
- Groceries information

Events are the final planning domain.

Propagation ends at Events.

Events remain the current operational truth until operational work is complete.

---

# Groceries

Groceries converts Event production requirements into purchasing preparation.

Groceries intentionally separates:

- Event eligibility
- Event selection
- ingredient requirements
- purchasing preparation
- printing

Groceries assists purchasing.

Groceries intentionally excludes:

- inventory
- purchasing
- supplier ordering

Users remain responsible for purchasing decisions.

---

# Proposal

Proposal belongs to Kitchen.

Proposal represents a published snapshot of Kitchen planning.

Proposal is the operational boundary between Kitchen and Sales.

Proposal contains the operational information Kitchen intends Sales to use.

Proposal is not a commercial quotation.

Proposal is not owned by Sales.

Kitchen may create any number of Proposals during the life of an Event.

Each Proposal is an independent business document.

Each sent Proposal is an immutable historical snapshot.

---

# Quotation

Quotation belongs entirely to Sales.

Quotation is created from one Proposal.

Quotation owns:

- customer communication
- selling prices
- commercial wording
- commercial notes
- customer presentation

Quotation is intentionally not:

- CRM
- Sales pipeline
- Accounting
- Tax engine
- Invoicing
- Payment tracking

Small operators may use Quotation directly.

Larger organizations may incorporate Quotation into their existing commercial workflow.

Kitchen does not know:

- Quotation status
- customer negotiations
- commercial pricing

Sales does not see unpublished Kitchen work.

---

# Operational Workflow

Savveyra follows one connected operational workflow.

```text
Ingredients
      ↓
Recipes
      ↓
Dishes
      ↓
Menus
      ↓
Events
   ├── Groceries
   └── Proposal
          ↓
      Quotation
```

Kitchen planning and Sales communication intentionally remain separate.

Kitchen owns operational planning.

Sales owns commercial communication.

Proposal forms the operational boundary between the two.

Kitchen may continue planning after publishing a Proposal.

Sales continues working from the selected Proposal until it intentionally creates a new Quotation from another Proposal.

---

# Information Flow

Information flows in one direction.

Upstream domains publish information.

Downstream domains consume Published State.

Automatic propagation exists only within the Composition chain.

Propagation ends at Events.

Proposal publishes immutable historical snapshots.

Quotation is created from Proposal snapshots rather than live Kitchen planning.

Output domains determine their own refresh behaviour.

Savveyra intentionally distinguishes between:

- Current Operational Truth
- Historical Operational Truth

Both are equally important.

Current Operational Truth supports planning.

Historical Operational Truth supports:

- customer communication
- auditing
- comparison
- legal reference
- operational history

---

# Product Boundaries

Included:

- Food Costing
- Recipe Costing
- Production Planning
- Menu Planning
- Event Planning
- Grocery Preparation
- Purchasing Preparation
- Kitchen Proposal Publishing
- Customer Quotations
- Operational Reporting
- Shared Business Reference Management

Excluded:

- Inventory Management
- Purchase Orders
- Accounting
- ERP
- CRM
- Payroll
- Warehouse Management
- Supplier Ordering
- Production Scheduling
- Human Resources
- Point of Sale

Savveyra intentionally remains focused on operational planning.

---

# Product Principles

Every feature should strengthen one or more of:

- operational planning
- costing accuracy
- production visibility
- purchasing preparation
- customer communication
- historical accuracy
- operational consistency

Features should not exist merely because they are technically possible.

Every feature should provide genuine operational value.

# Savveyra Canonical Specifications

## Part 4

# Business Object Lifecycle

Every major business object follows a consistent lifecycle.

The lifecycle defines:

- creation
- working state
- publication
- downstream consumption
- historical preservation

Business objects remain editable while in their working state.

Published information becomes available only after successful publication.

Historical documents remain permanently unchanged.

---

# Published State

Published State is the authoritative operational information made available to downstream domains.

Published State:

- has passed business validation
- is internally consistent
- is available for downstream consumption
- represents the current operational truth

Unsaved or unpublished changes remain private to the editing workspace.

Downstream domains never consume unpublished information.

---

# Working State

Working State represents the user's current editing session.

Working State may contain:

- incomplete information
- temporary calculations
- unsaved changes
- experimental edits

Working State exists only for the current editor.

It has no effect on downstream domains until published.

---

# Propagation

Automatic propagation exists only within the Composition Domains.

```text
Ingredients
      ↓
Recipes
      ↓
Dishes
      ↓
Menus
      ↓
Events
```

When a Composition Domain publishes new information:

- downstream calculations update
- downstream summaries update
- downstream published information reflects the latest operational truth

Propagation never extends beyond Events.

Output Domains determine their own refresh behaviour.

---

# Snapshot Principle

Some domains intentionally create historical snapshots.

Snapshots preserve the exact information available at the time they are created.

A snapshot is never updated to reflect later operational changes.

Snapshots preserve:

- historical accuracy
- customer communication
- auditing
- operational traceability

Proposal and Quotation both operate as snapshot-based business documents.

---

# Proposal Lifecycle

Kitchen creates a Draft Proposal from the current published Event.

A Draft Proposal may be edited freely.

Sending the Draft creates a new immutable sent Proposal.

Each sent Proposal:

- receives its own permanent Proposal number
- becomes historical immediately
- can never be edited

Further Kitchen changes require a new Draft Proposal.

Each Draft Proposal receives its own Draft Proposal number.

Every sent Proposal represents one independent historical business document.

---

# Quotation Lifecycle

Sales creates a Draft Quotation from a selected Proposal.

A Draft Quotation may be edited freely.

Sending the Draft creates a new immutable sent Quotation.

Each sent Quotation:

- receives its own permanent Quotation number
- becomes historical immediately
- can never be edited

Later commercial changes require a new Draft Quotation.

Each Draft Quotation receives its own Draft Quotation number.

Every sent Quotation represents one independent historical business document.

---

# Numbering Principles

Draft and sent documents are different business objects.

Each receives its own permanent identifier.

Typical examples include:

```text
Draft Proposal
DP-00031

↓

Sent Proposal
P-00112
```

```text
Draft Quotation
DQ-00008

↓

Sent Quotation
Q-00057
```

Sending never changes the identity of an existing document.

Sending creates a new historical document.

---

# Historical Documents

Historical documents preserve exactly what the recipient received.

Historical documents are:

- immutable
- independently numbered
- permanently retained
- legally and operationally significant

Historical documents are never regenerated from current operational information.

They remain accurate records of business communication at the time they were sent.

---

# Current Operational Truth

Current Operational Truth always represents the latest published operational information.

Current Operational Truth supports:

- costing
- production planning
- Event management
- grocery preparation
- future Proposals

Historical documents remain separate from Current Operational Truth.

Both are maintained throughout the life of the system.

