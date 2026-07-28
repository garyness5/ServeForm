# Savveyra Domain Rules

## Part 1

# Purpose

This document defines the operational rules governing every domain within Savveyra.

Domain Rules specify:

- ownership
- responsibilities
- lifecycle
- publication
- downstream behaviour
- relationships
- operational boundaries

Domain Rules describe how each business object behaves.

They do not describe:

- implementation
- SQL
- Appsmith
- user interface
- development status

Those belong in implementation documentation.

When implementation differs from these rules, implementation should eventually be corrected.

---

# Domain Ownership

Every domain owns one distinct business responsibility.

Ownership includes:

- business rules
- validation
- lifecycle
- publication
- downstream contract

Ownership never transfers because another domain uses the information.

Downstream domains consume published information.

Only the owning domain may modify it.

---

# Domain Hierarchy

Savveyra consists of connected operational domains.

```text
Management
      ↓
Composition
      ↓
Shared Operational
      ↓
Output
```

The primary operational chain is:

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

Events publish information to independent output workflows.

```text
Events
   ├── Groceries
   └── Proposal
          ↓
      Quotation
```

Each domain owns only its own business rules.

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

Management Domains:

- publish reusable reference information
- support operational domains
- do not participate in propagation
- do not own costing
- do not own composition

Management information remains independent from operational workflow.

---

# Customer

Customer represents the business or individual receiving the service.

Customer owns:

- customer identity
- customer reference information

Only Name is required to create a Customer.

Customer information is reusable across all Events and Quotations.

Customer records remain independent from individual Events.

---

# Contact

Contact represents a real person.

Contact owns:

- person identity
- reusable contact information

Only Name is required to create a Contact.

A Contact may be linked to:

- one Customer
- multiple Customers
- one Venue
- multiple Venues

Contacts are reusable business records.

A Contact is never used independently of an operational context.

---

# Venue

Venue represents the location where work occurs.

Venue owns:

- venue identity
- reusable venue information

Only Name is required to create a Venue.

Venue information is reusable across multiple Events.

Venue records remain independent from operational planning.

---

# Address Book

Customers, Contacts and Venues together form the Address Book.

Each domain owns its own master records.

Relationships are maintained through links rather than duplication.

Operational domains consume Address Book information without changing ownership.

The Address Book provides reusable reference information for Events and Quotation.

---

# Client Helper Lists

Client Helper Lists provide reusable client-owned lookup information.

Typical examples include:

- Categories
- Packaging
- Suppliers
- Client-defined Diet Tags

Helper Lists support operational workflow.

Helper Lists do not own operational behaviour.

Each helper item remains independently reusable throughout the application.

# Savveyra Domain Rules

## Part 2

# System Lists

System Lists provide globally managed reference information.

Typical examples include:

- Units
- Allergens
- System Diet Tags
- other system-owned lookup values

System Lists are shared across all clients.

Clients consume System Lists but do not own them.

---

# Units

Units define measurable quantities throughout Savveyra.

Units own:

- unit names
- abbreviations
- conversion factors
- unit types

Unit Types include:

- Weight
- Volume
- Count

Conversions are permitted only within the same Unit Type.

Examples:

- kg ↔ lb
- L ↔ mL
- ea ↔ dozen

Conversions between different Unit Types are not permitted.

Units are globally managed.

---

# Allergens

Allergens are globally managed.

Allergens represent internationally recognized allergen classifications.

Allergens:

- are system owned
- are not client editable
- automatically aggregate through Composition Domains

Each parent object publishes the unique allergen summary of its components.

---

# Diet Tags

Diet Tags consist of two categories.

## System Diet Tags

System Diet Tags are globally managed.

Examples include:

- Vegetarian
- Vegan
- Gluten Free

System Diet Tags are not editable by clients.

---

## Client Diet Tags

Clients may create their own Diet Tags.

Examples include:

- School Approved
- Low Sodium
- Chef Special

Client Diet Tags remain client owned.

Recipes own their manually assigned Diet Tags.

Diet Tags do not automatically propagate from child components to parent objects.

Only Allergens automatically aggregate.

---

# Composition Domains

Composition Domains create operational work.

The Composition chain is:

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

Each Composition Domain:

- consumes Published State
- performs business logic
- publishes operational information
- becomes the authoritative source for downstream domains

Each domain owns only its own information.

---

# Ingredient

Ingredients represent purchased products.

Ingredients own:

- purchasing information
- purchase units
- purchase cost
- wastage
- operational reference information

Only Name and Category are required to create an Ingredient.

Incomplete Ingredients may exist.

Once costing information becomes available, downstream calculations automatically use the current Published State.

Ingredients are reusable throughout the application.

---

# Recipe

Recipes transform purchased Ingredients into reusable production outputs.

Recipes may contain:

- Ingredients
- Recipes (Sub-Recipes)

Recipes publish:

- yield
- cost per unit
- allergen summary
- manually assigned diet tags
- production information

Recipes may never directly or indirectly contain themselves.

Duplicate child components are not permitted.

Recipes remain reusable production building blocks.

---

# Dish

Dishes represent prepared food intended for service.

Dishes may contain:

- Ingredients
- Recipes

Dishes publish:

- production costing
- production summaries
- operational information

Duplicate child components are not permitted.

Dishes remain reusable.

---

# Menu

Menus represent reusable guest offerings.

Menus may contain:

- Ingredients
- Recipes
- Dishes

Menus own:

- guest offering structure
- menu costing
- operational summaries

Guest quantities belong to Events rather than Menus.

Duplicate child components are not permitted.

Menus remain reusable templates.

# Savveyra Domain Rules

## Part 3

# Event

Events are the final Composition Domain.

Events represent operational work.

Only Event Name is required to create an Event.

Events own:

- Customer selection
- Customer Contact selection
- Venue selection
- Venue Contact selection
- scheduling
- guest planning
- Menu assignments
- operational administration

Events consume Menus.

Events publish information to:

- Groceries
- Proposal

Propagation ends at Events.

Events remain the current operational truth until operational work is complete.

---

# Customer Selection

Customer selection is optional.

An Event may exist without a Customer.

The selected Customer provides operational context.

Changing the Customer affects the current Event only.

Historical Proposal and Quotation documents remain unchanged.

---

# Customer Contact Selection

Customer Contact selection is optional.

The selected Contact represents the operational contact for the Event.

Contacts remain independent Address Book records.

Changing the Customer Contact affects only the current Event.

Historical documents preserve the original Contact.

---

# Venue Selection

Venue selection is optional.

The selected Venue identifies where the operational work occurs.

Venues remain reusable Address Book records.

Changing the Venue affects only the current Event.

Historical documents remain unchanged.

---

# Venue Contact Selection

Venue Contact selection is optional.

Venue Contact identifies the operational contact at the Venue.

Venue Contacts remain reusable Address Book records.

Historical documents preserve the original Venue Contact.

---

# Guest Planning

Guest quantities belong to Events.

Menus remain reusable.

Events determine how many guests each assigned Menu serves.

Kitchen production calculations originate from Event guest quantities.

---

# Extras

Kitchen Extras represent production buffer quantities.

Extras exist only for production purposes.

Examples include:

- damaged portions
- unexpected guests
- production safety margin

Extras affect Kitchen production.

Extras do not affect commercial selling quantities.

Proposal and Quotation are based on planned guest quantities rather than Kitchen Extras.

---

# Groceries

Groceries consumes published Event information.

Groceries transforms production requirements into purchasing preparation.

Groceries owns:

- eligible Events
- Event selection
- ingredient expansion
- purchasing preparation
- printable purchasing lists

Groceries intentionally excludes:

- inventory
- supplier ordering
- purchase orders

Users remain responsible for purchasing decisions.

---

# Grocery Workflow

Groceries follows four operational stages.

```text
Events
      ↓
Groceries
      ↓
Order
      ↓
Print
```

Each stage owns one operational responsibility.

Changes to selected Events require the downstream Grocery workflow to refresh.

Print represents the final purchasing preparation output.

---

# Proposal

Proposal belongs entirely to Kitchen.

Proposal owns:

- Draft Proposals
- sent Proposals
- Proposal history

Proposal is created from the current published Event.

Proposal communicates Kitchen planning to Sales.

Proposal is not a commercial document.

Proposal is an operational document.

Each sent Proposal is permanently immutable.

Future Kitchen changes require a new Draft Proposal.

# Savveyra Domain Rules

## Part 4

# Quotation

Quotation belongs entirely to Sales.

Quotation owns:

- Draft Quotations
- sent Quotations
- commercial pricing
- customer presentation
- quotation history

Quotation is created from a selected Proposal.

Quotation consumes Proposal snapshots rather than live Event information.

Kitchen planning remains independent after the Proposal has been published.

Sales owns all commercial communication with the customer.

---

# Proposal Lifecycle

Kitchen creates a Draft Proposal from the current published Event.

A Draft Proposal may be edited freely.

Sending the Draft creates a new immutable sent Proposal.

Each sent Proposal:

- receives its own permanent Proposal number
- represents one historical business document
- can never be edited

Further Kitchen changes require a new Draft Proposal with its own Draft Proposal number.

Every sent Proposal permanently preserves the information communicated to Sales.

---

# Quotation Lifecycle

Sales creates a Draft Quotation from a selected Proposal.

A Draft Quotation may be edited freely.

Sending the Draft creates a new immutable sent Quotation.

Each sent Quotation:

- receives its own permanent Quotation number
- represents one historical business document
- can never be edited

Further commercial changes require a new Draft Quotation with its own Draft Quotation number.

Every sent Quotation permanently preserves the information communicated to the customer.

---

# Current Operational Truth

Current Operational Truth always represents the latest Published State within the operational workflow.

Current Operational Truth supports:

- costing
- production planning
- Event management
- grocery preparation
- future Proposal creation

Current Operational Truth continually evolves as operational work changes.

Historical business documents remain permanently unchanged.

---

# Historical Business Documents

Historical business documents preserve exactly what was communicated at the time they were sent.

Historical documents:

- are immutable
- are independently numbered
- remain permanently available
- are never regenerated from current operational information

Proposal and Quotation both produce permanent historical business documents.

Historical records provide operational traceability and customer communication history.

---

# Publication Rules

Only Published State may be consumed by downstream domains.

Publication performs:

- business validation
- calculation
- summary generation
- normalization
- downstream availability

Unpublished work remains private to the editing workspace.

Publication establishes the new Current Operational Truth.

---

# Propagation Rules

Automatic propagation exists only within the Composition chain.

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

Propagation updates:

- costing
- production summaries
- operational calculations
- published downstream information

Propagation ends at Events.

Output domains determine their own refresh behaviour.

---

# Output Independence

Groceries, Proposal and Quotation are independent Output Domains.

Each Output Domain:

- owns its own workflow
- owns its own lifecycle
- owns its own historical records
- consumes published upstream information
- never publishes information upstream

Changes within one Output Domain do not automatically affect another Output Domain.

---

# Guiding Principle

Every domain owns one clearly defined business responsibility.

Ownership remains clear.

Information flows in one direction.

Published information becomes the authoritative source for downstream domains.

Historical business documents permanently preserve business communication.

Current Operational Truth and Historical Operational Truth coexist throughout the life of the system.

Together these rules provide a consistent operational foundation for the entire Savveyra platform.

