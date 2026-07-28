
# Savveyra Development Handoff

## Purpose

This document is the developer bootstrap for continuing Savveyra.

It should allow a new ChatGPT session with no project history to resume productive implementation within approximately 30 minutes.

This document intentionally contains implementation state rather than permanent product specifications.

Permanent product behaviour belongs in the Foundation Documents.

---

# Default Development Mode

Unless the user explicitly requests an architectural review, assume the product architecture is settled.

Development should focus on implementation, normalization, testing and completion.

Challenge implementation decisions when they conflict with operational workflow, maintainability or the established architecture.

Do not reopen settled architectural decisions unless new business requirements genuinely require it.

When multiple technically valid solutions exist, prefer the one most consistent with the existing architecture rather than introducing a new pattern.

---

# Source of Truth

When documentation, SQL and implementation disagree, the priority is:

1. Foundation Documents define the product behaviour.
2. Foundation SQL defines the intended implementation.
3. Live implementation should be brought into alignment with the above.

If a conflict appears, correct the implementation rather than redefining the documented architecture unless the user explicitly changes the product specification.

---

# Current Milestone

The project has completed its first major normalization phase.

The product direction is now considered stable enough to continue implementation without further architectural redesign.

Current focus is transitioning from architectural normalization back into implementation.

The immediate implementation target is:

```text
Address Book
        ↓
Events
        ↓
Proposal
        ↓
Quotation
```

before continuing through the remaining application.

---

# Completed During This Chat

The permanent documentation set has been rewritten and normalized.

Completed documents:

- Development Standards
- Canonical Specifications
- Architecture
- Domain Rules

These four documents now replace the previous versions and are considered authoritative.

The earlier documentation should not be used except as historical reference.

The previous Proposal/Quotation revision model has been completely replaced.

---

# Settled Architecture (Treat As Law)

The following should not be reconsidered unless the product itself changes.

## Overall Workflow

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

Propagation ends at Events.

Proposal and Quotation are Output Domains.

---

## Working State vs Published State

Unsaved edits belong only to the editor.

Only Published State is consumed downstream.

---

## Proposal

Proposal belongs entirely to Kitchen.

Kitchen owns Proposal.

Proposal communicates Kitchen planning to Sales.

Proposal is never a commercial document.

---

## Quotation

Quotation belongs entirely to Sales.

Quotation communicates with customers.

Kitchen and Sales intentionally remain operationally independent.

---

## Snapshot Model

The previous revision model is obsolete.

Current model:

Draft Proposal

↓

Sent Proposal (new immutable historical document)

↓

Later changes

↓

New Draft Proposal

↓

New Sent Proposal

Exactly the same model applies to Quotation.

Every sent Proposal and every sent Quotation is:

- independently numbered
- immutable
- permanent

Sending creates a new historical document.

Sending never mutates an existing document.

---

## Propagation

Automatic propagation exists only through:

Ingredients

↓

Recipes

↓

Dishes

↓

Menus

↓

Events

Propagation never extends beyond Events.

Output Domains determine their own refresh behaviour.

---

## Ownership

Every domain owns exactly one business responsibility.

Only the owning domain defines:

- lifecycle
- validation
- publication
- downstream contract

Downstream domains consume published information.

Ownership never transfers.

---

# Address Book Status

Address Book normalization is **not yet finalized**.

A separate Address Book Addendum will accompany this documentation.

That addendum becomes the authority for:

- CustomerList
- ContactList
- VenueList

including:

- interactions between those three pages
- ownership of shared Address Book behaviour
- linking rules
- editing rules

However:

Events and Quotation should continue to follow the behaviour described in the current Foundation Documents unless the Addendum explicitly states otherwise.

The Addendum changes Address Book internals, not the operational use of Address Book records within Events or Quotation.

---

# Current Supabase State

Overall architecture is stable.

General direction:

- move business rules into Supabase
- keep Appsmith intentionally thin
- reuse Shared Services
- continue domain normalization

Views represent the published contract consumed by Appsmith.

Business logic should not migrate into Appsmith unless absolutely necessary.

---

# Current Appsmith State

Appsmith should primarily:

- display Published State
- collect user input
- present warnings
- present confirmations
- call Supabase business functions
- refresh display

Avoid implementing business rules inside Appsmith where Supabase can own them.

---

# Contracts That Must Not Be Broken

## vw_ Views

Treat view column order as an interface contract.

Whenever practical:

- append new columns
- avoid reordering existing columns

If structural changes are required:

drop and recreate the view rather than relying on CREATE OR REPLACE VIEW that changes column order.

---

## Published State

Downstream domains consume Published State only.

Never allow downstream calculations to consume editor Working State.

---

## Shared Services

Operations such as:

- Rename
- Replace
- Duplicate
- Delete

should continue moving toward shared implementation.

Avoid duplicating business logic.

---

## Operational Ownership

Kitchen owns:

- Ingredients
- Recipes
- Dishes
- Menus
- Events
- Proposal

Sales owns:

- Quotation

This separation is intentional.

---

# Current Technical Debt

Mostly implementation debt rather than architectural debt.

Remaining work includes:

- continue Shared Service normalization
- continue SQL normalization
- continue Appsmith simplification
- continue moving business logic into Supabase

Architecture should no longer be redesigned while completing these tasks.

---

# Current Blockers

No architectural blocker currently exists.

Implementation may continue.

Only known pending clarification:

Address Book Addendum.

---

# Current Assumptions Requiring Validation

Only validate assumptions when implementation reaches them.

Current examples include:

- final Address Book page interaction details
- Address Book internal normalization after Addendum
- future PDF generation mechanics
- future email generation mechanics

Do not redesign settled architecture while validating implementation details.

---

# Immediate Next Task

Wait for the Address Book Addendum.

Then:

normalize

- CustomerList
- ContactList
- VenueList

using:

- Foundation Documents
- Address Book Addendum

After Address Book normalization:

continue implementation beginning with Events.

---

# Reading Order

A new ChatGPT should read only:

1. Handoff
2. Address Book Addendum (when available)
3. Development Standards
4. Canonical Specifications
5. Architecture
6. Domain Rules

Then begin implementation.

There should be no need to reconstruct earlier conversations.

---

# Areas Intentionally Deferred

These are known future work.

Do not redesign them now.

- PDF generation
- Email generation
- Print engine implementation
- Supplier ordering
- Inventory
- Purchase Orders
- Accounting
- CRM
- ERP integration
- Production scheduling

The architecture already assumes these boundaries.

---

# What Not To Redesign

Do not redesign:

- Proposal lifecycle
- Quotation lifecycle
- Output Domain independence
- Working State / Published State
- propagation ending at Events
- ownership model
- snapshot model
- Shared Service direction
- thin Appsmith philosophy
- Supabase-first business logic

These are considered settled.

---

# Common Mistakes Future ChatGPT Is Likely To Make

Avoid these assumptions.

- Proposal is **not** converted into Quotation.
- Proposal is **not** edited after sending.
- Sent documents are **never** edited.
- Proposal revisions do **not** exist.
- Quotation revisions do **not** exist.
- Kitchen never sees Sales workflow.
- Sales never edits Kitchen planning.
- Events are shared operational objects.
- Propagation never extends beyond Events.
- Groceries, Proposal and Quotation are independent Output Domains.
- Appsmith is not the business engine.
- Business logic belongs in Supabase whenever practical.

---

# User Working Style

The user brings the operational and kitchen expertise.

Expect the user to challenge technical decisions if they weaken real operational workflow.

The user prefers collaboration rather than agreement.

Push back when implementation weakens:

- operational correctness
- normalization
- consistency
- maintainability

The user values constructive disagreement over reassurance.

---

# User Strengths

- Strong operational understanding of commercial kitchens.
- Excellent workflow analysis.
- Detects inconsistencies across domains quickly.
- Thinks in complete end-to-end business processes rather than isolated screens.
- Very strong at normalization once patterns become visible.
- Willing to revisit earlier work to strengthen the foundation.

---

# User Weaknesses

- Not a programmer.
- May not recognize implementation constraints without explanation.
- Prefers exact code or SQL rather than abstract discussion.
- Can unintentionally continue refining architecture beyond the point where implementation should resume.

Help by translating operational requirements into technical implementation while resisting unnecessary redesign.

---

# Preferred Working Style

The user prefers:

- exact SQL
- exact Appsmith changes
- exact procedure names
- complete code rather than fragments
- concise explanations
- implementation first, discussion second

When the user says:

- "OK"
- "I agree"
- "Let's continue"

continue immediately to the next implementation step.

Do not restate previous reasoning.

When implementation appears to conflict with operational logic:

challenge it.

The user expects technical pushback when appropriate.

The objective is finding the best solution, not agreeing quickly.

---

# Final Reminder

Do not treat this project as a greenfield design exercise.

The architecture has already been normalized.

Continue building on the established foundation.

Improve implementation.

Avoid reopening settled architectural decisions unless the user explicitly changes the product itself.

------------

# Known Implementation Issues

The current implementation still contains remnants of the previous Proposal/Quotation architecture.

Known examples include:

- QuotationList still references legacy tables/views in places.
- Some Proposal/Quotation SQL and Appsmith components still assume the previous revision-based workflow.
- Proposal and Quotation implementation should be reviewed against the new Foundation Documents before further feature development.

Treat the Foundation Documents as authoritative.
If implementation conflicts with the documented architecture, update the implementation rather than changing the documentation.