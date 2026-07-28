# Kitchen ↔ Sales Workflow

## Part 1

# Purpose

This document defines the operational workflow between Kitchen and Sales.

It describes how the two departments work together while remaining operationally independent.

It defines:

- responsibilities
- workflow sequence
- Proposal creation
- Proposal publication
- Sales handoff
- operational change requests
- parallel operation
- business communication

This document defines operational workflow.

It does not define:

- architecture
- implementation
- SQL
- Appsmith
- user interface behaviour

Those belong in the Architecture and Operational Specification documents.

---

# Workflow Philosophy

Kitchen and Sales perform different business functions.

Kitchen plans operational delivery.

Sales communicates with customers.

The workflow intentionally separates these responsibilities.

Neither department depends upon the internal work of the other.

Coordination occurs only through Proposal documents and normal business communication.

---

# Department Responsibilities

## Kitchen

Kitchen is responsible for:

- operational planning
- costing
- Ingredients
- Recipes
- Dishes
- Menus
- Event planning
- production requirements
- Proposal creation

Kitchen owns operational accuracy.

---

## Sales

Sales is responsible for:

- customer communication
- commercial pricing
- Quotation preparation
- negotiation
- customer follow-up

Sales owns commercial communication.

---

# Shared Responsibility

Kitchen and Sales work from the same Event.

The Event represents the business activity.

Neither department owns the Event exclusively.

According to permissions, either department may update shared Event information such as:

- Customer
- Contact
- Venue
- Event Date
- Event Notes

Operational ownership and commercial ownership remain separate.

---

# High-Level Workflow

```text
Kitchen Planning

↓

Save Event

↓

Create Proposal

↓

Save Proposal

↓

Send Proposal

↓

Sales Reviews Proposal

↓

Create Quotation

↓

Save Quotation

↓

Send Quotation

↓

Customer Discussion
```

Kitchen and Sales continue working independently throughout the process.

---

# Kitchen Workflow

Kitchen begins by creating or updating an Event.

Kitchen determines:

- Menus
- guest quantities
- production requirements
- operational costing
- production planning

Kitchen may continue refining the Event until the operational information is ready for Sales.

Kitchen then creates a Proposal.

---

# Creating a Proposal

Proposal is created from the current saved Event.

The new Proposal begins as a Draft Proposal.

Kitchen may:

- edit the Proposal
- save repeatedly
- generate PDFs
- continue working later

The Proposal remains editable until it is sent.

---

# Sending a Proposal

Sending communicates Kitchen's current operational solution.

Sending does not mean:

- production has begun
- the customer has accepted
- Sales must immediately use the Proposal
- Kitchen planning has finished

Sending simply publishes the Proposal for Sales.

---

# Kitchen After Sending

Kitchen continues working normally after sending a Proposal.

Kitchen may:

- update the Event
- change Menus
- adjust Recipes
- change guest quantities
- continue operational planning

Previously sent Proposal documents remain unchanged.

If Kitchen wishes to communicate updated operational information, it creates another Proposal.

# Kitchen ↔ Sales Workflow

## Part 2

# Sales Workflow

Sales reviews available sent Proposals.

Sales selects the Proposal that best represents the operational information required for customer communication.

Sales then creates a Draft Quotation from that Proposal.

The Draft Quotation becomes the Sales working document.

---

# Working with a Draft Quotation

Sales may:

- edit commercial wording
- adjust selling prices
- add commercial notes
- generate PDFs
- save repeatedly
- continue editing later

The Draft Quotation remains editable until it is sent.

---

# Sending a Quotation

Sending a Quotation communicates Sales' commercial offer to the customer.

Sending does not:

- modify the Event
- modify the Proposal
- notify Kitchen
- lock operational planning
- begin production

Sending publishes only the commercial document.

---

# Customer Communication

Sales communicates directly with the customer.

Typical activities include:

- presenting pricing
- discussing menu options
- explaining inclusions
- negotiating commercial terms
- answering customer questions
- sending updated Quotations

Kitchen is not involved in routine commercial communication.

Operational questions may be referred to Kitchen when necessary.

---

# Customer Requests Changes

Customer discussions frequently generate requests for change.

Typical requests include:

- different guest quantities
- Menu changes
- additional items
- removed items
- different Event dates
- Venue changes

These requests affect operational planning.

Sales communicates the requested changes to Kitchen through normal business processes.

The request itself does not modify the Event.

---

# Kitchen Reviews the Request

Kitchen evaluates every operational request.

Kitchen determines:

- operational feasibility
- production impact
- costing impact
- scheduling impact

Kitchen may:

- accept the request
- partially accept the request
- decline the request

Operational feasibility always remains a Kitchen decision.

---

# Updating the Event

If Kitchen accepts the requested changes, Kitchen updates the Event.

Typical updates include:

- Menu changes
- guest quantity changes
- Recipe adjustments
- scheduling changes
- Customer changes
- Contact changes
- Venue changes

Saving the Event updates the current operational truth.

Existing Proposal and Quotation documents remain unchanged.

---

# Creating Another Proposal

If Kitchen wishes to communicate the updated operational information, Kitchen creates another Proposal.

The new Proposal:

- begins as a Draft Proposal
- receives a new Proposal Number
- receives its own lifecycle
- remains independent of previous Proposals

Kitchen edits the new Draft as required.

When ready, Kitchen sends the new Proposal.

Earlier Proposal documents remain unchanged.

---

# Sales After Receiving Another Proposal

Receiving another Proposal does not automatically change Sales' work.

Sales may decide to:

- continue using the current Quotation
- create a new Quotation from the new Proposal
- prepare alternative Quotations
- discuss the new Proposal with the customer

These decisions belong entirely to Sales.

---

# Parallel Operation

Kitchen and Sales intentionally operate in parallel.

```text
Kitchen

Proposal 1
        │
        ├────► Sales creates Quotation
        │
continues planning
        │
Proposal 2
        │
        └────► Sales decides whether to use it
```

Neither department blocks the other.

The only formal synchronization point is the sending of a Proposal.

---

# Event Progress

The Event continues to evolve independently of customer communication.

Operational changes may continue until production requires planning to stop.

Typical ongoing changes include:

- production refinements
- Menu substitutions
- Recipe improvements
- scheduling adjustments
- Customer changes
- Contact changes
- Venue changes

Kitchen always works from the current saved Event.

Sales always works from the Proposal it has selected.

# Kitchen ↔ Sales Workflow

## Part 3

# Customer Acceptance

Customer acceptance belongs entirely to Sales.

Acceptance means the customer has agreed to the commercial offer presented by Sales.

Acceptance does not:

- lock the Event
- prevent Kitchen planning
- prevent another Proposal from being created
- prevent another Quotation from being created
- automatically begin production

Operational planning continues according to the Event lifecycle.

---

# Administrative Changes

Administrative changes may still occur after customer acceptance.

Examples include:

- corrected Customer information
- updated Contact information
- corrected Venue information
- spelling corrections
- formatting improvements

Administrative changes affect only the document being edited.

Previously sent documents remain unchanged.

---

# Event Completion

Kitchen completes operational work according to the Event lifecycle.

Sales completes commercial work according to the Quotation lifecycle.

These lifecycles remain independent.

For example:

- a customer may accept a Quotation before Kitchen production begins
- Kitchen may complete production while Sales finishes administrative work

Neither department's progress determines the other's workflow.

---

# Operational Communication

Communication between Kitchen and Sales is always intentional.

Operational changes are communicated by creating and sending another Proposal.

Commercial discussions occur directly between Sales and the customer.

The system intentionally avoids hidden synchronization.

Each department always knows which document it is working from.

---

# Operational Independence

Kitchen and Sales intentionally operate independently.

Kitchen focuses on:

- operational planning
- production
- costing
- delivery

Sales focuses on:

- customer communication
- commercial presentation
- pricing
- negotiation

Neither department waits for the other unless new operational information must be exchanged.

---

# Event as the Shared Workspace

The Event remains the shared operational workspace throughout its lifecycle.

Kitchen and Sales may both contribute information according to permissions.

Typical Kitchen information includes:

- Menu planning
- guest planning
- production planning
- operational notes

Typical Sales information includes:

- Customer
- Contact
- Venue
- scheduling coordination

The Event always represents the current operational truth.

Proposal and Quotation represent historical business documents created from that truth.

---

# Current Operational Truth

Current operational truth is represented by the current saved Event.

This information continues to evolve as planning progresses.

Saving the Event updates the current operational truth.

---

# Historical Business Documents

Historical business documents are represented by:

- sent Proposals
- sent Quotations

Each document permanently preserves the information that existed when it was sent.

Historical documents never change.

Current operational truth and historical business documents intentionally coexist.

---

# Multiple Proposal Workflow

An Event may produce any number of Proposal documents.

Example:

```text
Event

↓

Proposal A

↓

Proposal B

↓

Proposal C
```

Each Proposal:

- has its own Proposal Number
- begins as a Draft
- is sent independently
- remains permanently available

Proposal documents never replace one another.

---

# Multiple Quotation Workflow

Sales may create multiple Quotations during customer discussions.

Example:

```text
Proposal A

├── Quotation A
├── Quotation B
└── Quotation C
```

Each Quotation:

- has its own Quotation Number
- begins as a Draft
- is sent independently
- remains permanently available

Quotation documents never replace one another.

---

# Proposal Selection

Creating another Proposal does not invalidate previous Proposals.

Sales chooses which Proposal to use when creating a new Quotation.

This allows Sales to:

- continue existing negotiations
- compare operational alternatives
- prepare different commercial offers
- adopt updated operational information when appropriate

Creating another Proposal provides additional operational information without forcing commercial action.

---

# Operational Decision Points

Kitchen decisions include:

- production feasibility
- costing
- Menu composition
- Recipe composition
- operational scheduling
- Event readiness

Sales decisions include:

- customer pricing
- commercial presentation
- Quotation timing
- negotiation strategy

Each department owns its own decisions.

---

# Communication Principles

Communication between departments is always deliberate.

Typical communication includes:

- Kitchen sends a Proposal.
- Sales requests operational changes.
- Kitchen evaluates operational feasibility.
- Kitchen creates another Proposal if required.
- Sales creates another Quotation if required.

The workflow intentionally avoids hidden assumptions.

Users should always know:

- who initiated the change
- why the change occurred
- which Proposal was used
- which Quotation was sent

# Kitchen ↔ Sales Workflow

## Part 4

# Document Ownership

Every document has a single owner.

Ownership defines who is responsible for creating, maintaining and publishing that document.

| Document | Owner |
|----------|-------|
| Event | Kitchen and Sales (shared) |
| Proposal | Kitchen |
| Quotation | Sales |

Ownership never transfers between departments.

---

# Event Ownership

The Event is the only shared operational workspace.

Both Kitchen and Sales may update Event information according to user permissions.

Shared Event information includes:

- Customer
- Contact
- Venue
- Event Date
- Event Notes

Kitchen remains responsible for operational planning.

Sales remains responsible for commercial communication.

---

# Proposal Ownership

Proposal belongs exclusively to Kitchen.

Kitchen controls:

- creation
- editing
- saving
- sending
- publication

Sales cannot modify Proposal content.

Sales consumes Proposal information exactly as published.

---

# Quotation Ownership

Quotation belongs exclusively to Sales.

Sales controls:

- creation
- editing
- saving
- sending
- customer communication

Kitchen cannot modify Quotation content.

Kitchen receives no automatic updates from Quotation activity.

---

# Information Flow

Business information always flows in one direction.

```text
Kitchen

↓

Event

↓

Proposal

↓

Sales

↓

Quotation

↓

Customer
```

Information never flows in reverse through the system.

---

# Operational Requests

Operational requests originate outside the system workflow.

Typical examples include:

- customer requests
- production concerns
- scheduling conflicts
- pricing discussions

The receiving department evaluates the request before making any system changes.

No request automatically updates business documents.

---

# Kitchen Response

Kitchen evaluates operational requests against:

- production capacity
- ingredient availability
- staffing
- scheduling
- costing

Kitchen may:

- approve the request
- modify the request
- decline the request

Only approved operational changes become part of the Event.

---

# Sales Response

Sales evaluates commercial requests against:

- customer expectations
- pricing strategy
- profitability
- commercial policy

Sales may:

- prepare another Quotation
- continue negotiations
- request another Proposal
- close the opportunity

Commercial decisions remain entirely within the Sales workflow.

---

# Workflow Independence

Kitchen planning does not stop while Sales negotiates.

Sales negotiations do not stop while Kitchen continues planning.

Both departments continue working independently.

Communication occurs only when new information must be exchanged.

---

# Proposal Publication

Sending a Proposal communicates Kitchen's current operational solution.

Proposal publication provides Sales with a stable operational reference.

Proposal publication does not:

- freeze the Event
- stop Kitchen planning
- create a Quotation
- notify the customer

Proposal publication simply makes the Proposal available for Sales.

---

# Quotation Publication

Sending a Quotation communicates Sales' commercial offer.

Quotation publication does not:

- change the Event
- change the Proposal
- change Kitchen planning
- begin production

Quotation publication simply communicates the commercial offer to the customer.

---

# Parallel Business Processes

Kitchen and Sales intentionally perform different business processes.

Kitchen process:

```text
Plan

↓

Save Event

↓

Create Proposal

↓

Send Proposal

↓

Continue Planning
```

Sales process:

```text
Receive Proposal

↓

Create Quotation

↓

Send Quotation

↓

Continue Customer Communication
```

The two processes remain independent while sharing common business information through Proposal documents.

---

# Workflow Objectives

The Kitchen ↔ Sales workflow is designed to provide:

- clear ownership
- predictable responsibilities
- independent department workflows
- permanent historical documents
- controlled business communication
- traceable operational decisions
- consistent customer communication

Each department performs its own responsibilities without interfering with the responsibilities of the other.

