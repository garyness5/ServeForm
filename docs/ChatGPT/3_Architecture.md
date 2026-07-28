# Savveyra Architecture

## Part 1

# Purpose

Savveyra Architecture defines how the system is organized.

It describes the permanent structural principles that govern how the product is built, how domains interact, how information flows, where responsibilities belong, and how the overall system evolves.

Architecture answers:

- What is the system structure?
- How do domains relate to one another?
- How does information move through the system?
- Where do business responsibilities belong?
- Where does propagation begin and end?
- Which architectural patterns apply across multiple domains?
- How should future development remain consistent with the existing system?

Architecture defines the structural truth of the product.

It does not describe:

- implementation progress
- development status
- Appsmith pages
- SQL procedures
- implementation details

Those belong in domain documentation.

When conflicts occur, the priority is:

```text
Operational Logic
        ↓
Domain Rules
        ↓
Architecture
        ↓
Implementation
```

Operational correctness always takes priority over:

- database convenience
- UI convenience
- technical convenience
- implementation simplicity

The objective is not to build the most technically sophisticated system.

The objective is to build the simplest architecture that correctly supports real operational workflow.

Architecture should remain stable even as implementation evolves.

Technologies, database structures and user interfaces may change.

Architectural principles should remain stable unless the product itself is intentionally redesigned.

---

# Architectural Philosophy

Savveyra is designed around real food-service operations.

The system exists to help operators answer practical questions before production begins:

- What does this cost?
- What do I need to produce?
- What do I need to buy?
- What am I missing?
- What changed?
- What is the current operational truth?

The connected workflow is the product.

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

The architecture exists to preserve that connected meaning.

Preferred design order:

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

Operational workflow comes first.

Technology exists to support the workflow.

The architecture should remain:

- practical
- understandable
- visible
- maintainable

Complexity is acceptable only when it protects genuine operational behaviour.

The goal is not maximum flexibility.

The goal is the simplest architecture that correctly supports the business.

Savveyra provides operational truth.

It does not attempt to manage every business process surrounding that truth.

Users remain responsible for:

- communication
- purchasing decisions
- inventory decisions
- pricing decisions
- management decisions

The system provides information.

Users make decisions.

---

# Engineering Philosophy

Savveyra should become more consistent over time.

Normalization is a continual architectural objective.

Business patterns proven in later domains should become standards for earlier domains wherever practical.

Normalization should occur layer by layer across the entire application rather than one isolated domain at a time.

Key architectural principles include:

- business rules belong in Supabase whenever practical
- Appsmith should remain intentionally thin
- Shared Services are preferred over duplicated logic
- one business action normally maps to one Supabase function
- weak foundations should be corrected before building additional functionality

A domain is complete only when all of the following are aligned:

- operational behaviour
- Supabase foundation
- Appsmith workflow
- documentation

---

# System Structure

Savveyra consists of connected operational domains.

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

Events are the final planning domain.

Events consume Menus.

Events publish operational information to downstream output workflows.

Propagation stops at Events.

Two independent output workflows begin from Events:

```text
Events
   ├── Groceries
   └── Proposal
          ↓
      Quotation
```

Output domains consume published Event information.

Output domains do not participate in propagation.

Each output domain follows its own workflow.

---

# Domain Types

Savveyra separates domains into four architectural groups.

```text
Management
      ↓
Composition
      ↓
Shared Operational
      ↓
Output
```

Each architectural group has a distinct responsibility.

---

## Management Domains

Management Domains maintain reusable business reference information.

Current Management Domains include:

- Customers
- Contacts
- Venues
- Client Helper Lists
- Units
- System Lists

Management Domains:

- publish reference information
- do not participate in costing
- do not participate in composition
- do not participate in propagation
- support operational domains

Management Domains remain intentionally lightweight.

They support operational work without becoming operational workflow themselves.

# Savveyra Architecture

## Part 2

# Composition Domains

Composition Domains create operational work.

They form the primary operational chain.

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

- consumes Published State from upstream
- performs its own business logic
- publishes richer operational information
- becomes the authoritative source for downstream domains

Each domain owns only its own business rules.

No downstream domain may modify upstream information.

---

# Ingredients

Ingredients are the operational foundation.

Ingredients represent purchased products.

Ingredients own:

- purchasing information
- purchase units
- unit cost
- wastage
- operational reference information

Ingredients publish information used throughout the Composition chain.

Nothing exists upstream of Ingredients.

Everything ultimately returns to Ingredients.

---

# Recipes

Recipes transform purchased Ingredients into reusable production outputs.

Recipes may contain:

- Ingredients
- Recipes (Sub-Recipes)

Recipes own:

- production yield
- production costing
- allergen aggregation
- manually assigned diet tags
- production summaries

Recipes publish reusable production information.

Recipes may never directly or indirectly contain themselves.

---

# Dishes

Dishes represent prepared food intended for service.

Dishes may contain:

- Ingredients
- Recipes

Dishes own:

- production costing
- production summaries
- service preparation

Dishes publish reusable service items.

---

# Menus

Menus represent reusable guest offerings.

Menus may contain:

- Ingredients
- Recipes
- Dishes

Menus own:

- guest offering structure
- menu costing
- production summaries

Menus intentionally do not own guest quantities.

Menus remain reusable templates.

---

# Events

Events are the final Composition Domain.

Events consume Menus.

Events combine:

- operational planning
- scheduling
- Customer
- Customer Contact
- Venue
- Venue Contact
- guest planning
- Menu assignments

Events become the current operational truth.

Propagation stops at Events.

---

# Output Domains

Output Domains consume published Event information.

Current Output Domains are:

```text
Events
   ├── Groceries
   └── Proposal
          ↓
      Quotation
```

Output Domains:

- never publish upstream
- never participate in propagation
- own their own lifecycle
- own their own historical records

Each Output Domain determines when it refreshes from Events.

---

# Ownership

Every business object has exactly one authoritative owner.

Ownership includes:

- business rules
- validation
- lifecycle
- publication
- downstream contract

Only the owning domain may modify its information.

Downstream domains consume published information.

Ownership never transfers because another domain uses the information.

Examples:

- Ingredients own ingredient information.
- Recipes own recipe information.
- Menus own menu information.
- Events own Event information.
- Proposal owns Proposal documents.
- Quotation owns Quotation documents.

---

# Information Flow

Information flows in one direction.

```text
Publish

↓

Consume

↓

Publish

↓

Consume
```

Each domain consumes Published State from upstream.

Each domain publishes its own Published State.

Information never flows upstream.

Propagation exists only within the Composition chain.

Output Domains consume published information but never republish operational changes upstream.

---

# Published State

Published State is the architectural boundary between domains.

Published State is:

- validated
- internally consistent
- authoritative
- available for downstream consumption

Unpublished work remains private to the editing workspace.

Downstream domains consume only Published State.

This separation prevents incomplete work from affecting downstream operations.

# Savveyra Architecture

## Part 3

# Working State

Working State represents the private editing environment of a business object.

Working State:

- belongs to the current editor
- may be incomplete
- may contain temporary calculations
- may contain unsaved changes
- has no effect on downstream domains

Working State exists only until publication.

Downstream domains never consume Working State.

---

# Publication

Publication is the architectural transition between Working State and Published State.

Publication performs:

- business validation
- calculation
- normalization
- summary generation
- downstream availability

Only successfully published information becomes available outside the current workspace.

Publication establishes the new Current Operational Truth.

---

# Propagation

Propagation distributes Published State through the Composition chain.

Propagation exists only within:

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

Propagation never extends beyond Events.

Output Domains refresh independently.

---

# Output Architecture

Output Domains intentionally operate differently from Composition Domains.

Composition Domains continually publish Current Operational Truth.

Output Domains create operational outputs from that truth.

Current Output Domains are:

- Groceries
- Proposal
- Quotation

Each Output Domain owns its own workflow.

Each Output Domain determines when published Event information should be refreshed.

Output Domains intentionally remain independent of one another.

---

# Groceries Architecture

Groceries consumes published Event information.

Groceries transforms production requirements into purchasing preparation.

Its workflow is intentionally separated into four stages.

```text
Events
      ↓
Groceries
      ↓
Order
      ↓
Print
```

Each stage has a distinct responsibility.

The workflow separates:

- Event selection
- ingredient expansion
- purchasing preparation
- printable purchasing lists

Groceries intentionally excludes:

- inventory
- purchasing
- supplier ordering

Users determine what should actually be purchased.

---

# Proposal Architecture

Proposal belongs entirely to Kitchen.

Proposal consumes published Event information.

Proposal creates historical Kitchen communication.

Proposal owns:

- Draft Proposals
- sent Proposals
- Proposal history

Kitchen continues to own operational planning after a Proposal has been sent.

Proposal represents published operational information at one point in time.

Each sent Proposal is immutable.

Future operational changes require a new Draft Proposal.

---

# Quotation Architecture

Quotation belongs entirely to Sales.

Quotation consumes Proposal snapshots.

Quotation owns:

- Draft Quotations
- sent Quotations
- commercial wording
- selling prices
- quotation history

Sales intentionally operates independently from Kitchen after receiving a Proposal.

Kitchen does not participate in commercial workflow.

Sales does not modify Kitchen planning.

---

# Snapshot Architecture

Snapshots preserve historical business communication.

Snapshots intentionally separate:

- Current Operational Truth
- Historical Operational Truth

Current Operational Truth continues changing.

Historical snapshots never change.

Current snapshot-producing domains include:

- Proposal
- Quotation

Each snapshot preserves exactly what existed when it was created.

Snapshots are permanent business records.

---

# Current Operational Truth

Current Operational Truth always represents the latest published operational information.

It supports:

- production
- costing
- planning
- grocery preparation
- future Proposal creation

Current Operational Truth continually evolves.

Historical snapshots remain permanently unchanged.

The architecture intentionally maintains both simultaneously.

# Savveyra Architecture

## Part 4

# Shared Services

Shared Services provide reusable business behaviour across multiple domains.

A Shared Service performs one business function that is common to more than one domain.

Typical Shared Services include:

- Duplicate
- Rename
- Replace
- Delete
- Number generation
- Publication
- Validation
- Status management
- Snapshot creation
- Lookup services
- Impact counting

Shared Services should remain domain-independent whenever practical.

Domains should call Shared Services rather than implement duplicate business logic.

---

# Management Architecture

Management Domains provide reusable reference information to operational domains.

Management information is intentionally separate from operational workflow.

Management Domains include:

- Customers
- Contacts
- Venues
- Client Helper Lists
- Units
- System Lists

Management Domains:

- publish reusable reference information
- do not participate in propagation
- do not own operational workflow
- do not own costing

Operational domains consume Management information without transferring ownership.

---

# Address Book Architecture

The Address Book consists of three coordinated domains:

```text
Customers
     ↕
Contacts
     ↕
Venues
```

Each domain owns its own master records.

Relationships are maintained through linking rather than duplication.

A Contact represents one real person.

A Contact may be associated with:

- one or more Customers
- one or more Venues

Customers, Contacts and Venues remain independent business objects.

Operational domains consume these records without changing ownership.

---

# View Architecture

Views form the presentation boundary between Supabase and Appsmith.

Views expose Published State.

Views should contain display-ready information whenever practical.

Typical view content includes:

- display names
- calculated values
- summaries
- counts
- status indicators
- warnings
- derived display information

Views represent the published contract consumed by Appsmith.

Changes to view structure should preserve compatibility whenever practical.

When structural changes are required, the preferred approach is to recreate the view rather than alter the published contract unpredictably.

---

# Appsmith Architecture

Appsmith provides the presentation layer.

Primary responsibilities include:

- navigation
- page layout
- forms
- tables
- editing
- confirmations
- warnings
- user interaction

Appsmith should remain intentionally thin.

Business behaviour belongs primarily within Supabase.

Appsmith should consume Published State rather than recreate business logic.

---

# Supabase Architecture

Supabase is the operational engine.

Supabase owns:

- business rules
- validation
- publication
- propagation
- calculations
- snapshot creation
- numbering
- lifecycle management
- shared services
- data integrity

Operational behaviour should exist once within Supabase whenever practical.

This architecture minimizes duplicated business logic across user interfaces.

---

# Architectural Evolution

Savveyra is expected to evolve while preserving architectural consistency.

Future development should:

- strengthen normalization
- reduce duplication
- improve Shared Services
- simplify domain interaction
- improve maintainability
- preserve operational correctness

Architectural improvements should strengthen existing patterns rather than introduce competing approaches.

When stronger architectural patterns emerge, earlier implementations should gradually adopt them.

---

# Architectural Stability

The architecture should remain stable even as implementation changes.

Changes to:

- SQL
- Appsmith
- technologies
- infrastructure

should not require changes to the architectural model unless the operational product itself changes.

Stable architecture allows implementation to evolve without redefining the product.

---

# Guiding Principle

Every architectural decision should strengthen the connected operational workflow.

The architecture exists to support real operational practice, maintain clear ownership, preserve historical accuracy and provide a stable foundation for long-term development.

Operational correctness always takes priority over implementation convenience.

