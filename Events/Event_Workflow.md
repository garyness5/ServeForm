# Event Workflow

## Purpose

Events are the operational center of Savveyra.

They are the point where operational planning and business administration meet.

Events consume the completed Kitchen planning created upstream and publish operational information to downstream output domains.

Events are the only shared operational domain within the application.

---

# Position Within Savveyra

```text
Management

↓

Ingredients

↓

Recipes

↓

Dishes

↓

Menus

↓

Events

↙             ↘

Groceries   Quotation
```

Propagation ends at Events.

Everything downstream consumes published Event information.

Nothing downstream publishes information back upstream automatically.

---

# Operational Responsibility

Events own the operational description of a specific job.

Typical information includes:

* Event Name
* Customer
* Contact
* Venue
* Event Date
* Guest Counts
* Menus
* Operational Notes
* Internal Notes
* Status

Events intentionally combine operational planning with business administration.

---

# Shared Operational Domain

Events belong to the business.

They are not owned exclusively by Kitchen.

They are not owned exclusively by Sales/Admin.

Either department may:

* create an Event
* complete an Event
* maintain Event information

This allows Savveyra to work equally well for:

* one-person businesses
* multi-person businesses
* multi-department organizations

without requiring different workflows.

---

# Minimum Required Information

Only one field is required to begin an Event:

```text
Event Name
```

Everything else may be completed later.

Typical workflow:

Kitchen:

* creates Event
* adds Menus

Sales:

* completes Customer
* Contact
* Venue
* scheduling

or

Sales:

* creates Event

Kitchen:

* later builds operational planning

Both workflows are equally valid.

---

# Event Components

Events contain:

* Menus

Events do not directly contain:

* Recipes
* Dishes
* Ingredients

Those relationships already exist through the Composition chain.

---

# Operational Truth

Events represent the current operational truth.

Whenever upstream planning changes:

Ingredients

↓

Recipes

↓

Dishes

↓

Menus

↓

Events

the current saved Event reflects the latest operational planning.

Events remain the operational source of truth until production.

---

# Relationship to Quotation

Quotation consumes Event information.

Quotation creates one or more commercial Kitchen Proposals.

Each proposal belongs to the Event.

Events do not belong to Quotation.

Quotation never becomes the operational source of truth.

Current relationship:

```text
Event

↓

Quote 1 (Draft)

Quote 2 (Issued)

Quote 3 (Accepted)
```

One Event may contain many Quotes.

Quotation preserves historical commercial snapshots.

Events continue representing the current operational plan.

---

# Relationship to Groceries

Groceries consumes Event information independently from Quotation.

Groceries determines:

* ingredient requirements
* purchasing preparation

Quotation determines:

* customer proposal

Neither output workflow modifies the other.

---

# Propagation

Propagation exists only through the Composition chain.

Propagation stops at Events.

Output domains determine their own update behavior.

Quotation uses:

Kitchen Update

Groceries uses:

Update All

Neither performs automatic overwrite.

Users remain in control.

---

# Event Lifecycle

Current operational lifecycle is intentionally simple.

Typical progression:

```text
Draft

↓

Planning

↓

Ordered

↓

Completed

↓

Archived (future)
```

Exact statuses may continue evolving as Events are normalized.

The important architectural principle is that Event lifecycle belongs to Events.

Output domains consume Event status but do not own it.

---

# Event Publication

Events publish information required by downstream domains.

Typical published information:

* Event Name
* Customer
* Contact
* Venue
* Date
* Guest Counts
* Menus
* Current operational costs
* Allergen summaries
* Diet Tag summaries
* Operational revision

Downstream domains should consume published information rather than internal Event implementation.

---

# Event Revision

Events maintain the current operational revision.

Whenever operational information changes:

* guest counts
* menus
* composition
* costing

the Event revision advances.

Output domains determine how they respond.

Quotation compares revisions and offers:

Kitchen Update Available

Groceries refreshes through:

Update All

Automatic downstream overwrite is intentionally avoided.

---

# Event Ownership

Permanent business information remains in Management domains.

Customer owns:

* Customer information

Contact owns:

* Contact information

Venue owns:

* permanent Venue information

Events own:

* the operational use of those records

Temporary Event information belongs to Events rather than Management.

---

# Event Notes

Operational notes remain Event-specific.

Examples:

* access time
* delivery sequence
* production reminders
* event logistics

Permanent venue information remains in Venue.

Temporary event information remains in Events.

---

# Future Direction

Future Event normalization will include:

* complete lifecycle review
* administrative behavior
* Event revision handling
* customer workflow
* quotation interaction
* grocery interaction
* output synchronization
* archival behavior

The architectural position of Events as the shared operational domain is considered stable.

Future work should build upon this foundation rather than redefining it.

# End of Document
