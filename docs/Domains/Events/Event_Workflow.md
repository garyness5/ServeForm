Event Workflow
Purpose

Events are the operational hub of Savveyra.

They connect Kitchen planning with the business operation and act as the final operational layer before information is published to downstream output domains.

Events are the only domain shared between Kitchen and Sales.

Position Within Savveyra
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

Proposal      Groceries
               │
               ▼
           Quotation

Propagation ends at Events.

Events publish information downstream.

Nothing downstream updates Events automatically.

Operational Responsibility

Events own the operational definition of a specific job.

Typical Event information includes:

Event Name
Customer
Customer Contact
Venue
Venue Contact
Event Date
Event Format
Guest Counts
Menus
Operational Notes
Internal Notes
Status

Events intentionally combine operational planning with business administration.

Shared Operational Domain

Events belong to the business rather than a department.

Kitchen and Sales may both:

create Events
maintain Events
complete Event information

This allows Savveyra to support:

owner-operated businesses
small teams
larger multi-department organizations

using the same workflow.

Minimum Required Information

Only one field is required to create an Event.

Event Name

All other information is optional and may be completed later.

Typical workflows include:

Kitchen creates the Event and later Sales completes the customer information.

or

Sales creates the Event and later Kitchen completes the operational planning.

Both workflows are fully supported.

Event Components

Events contain:

Menus

Events never directly contain:

Dishes
Recipes
Ingredients

Those relationships already exist through the Composition chain.

Customer, Contact and Venue

Customer, Contact, Venue and Venue Contact are optional.

Events own the operational use of these records.

Permanent business information remains within the Management domains.

If only a Contact is selected, that Contact also becomes the operational Customer for the Event.

Customer and Contact remain independent selections and may change throughout the life of the Event.

Operational Truth

Events represent the current operational truth.

Current saved upstream changes flow through:

Ingredients

↓

Recipes

↓

Dishes

↓

Menus

↓

Events

Events remain the operational source of truth until production.

Proposal Publication

When Kitchen planning reaches a suitable point, the Event publishes a Proposal.

The Proposal is a snapshot of the current operational information sent to Sales.

Publishing a Proposal does not transfer ownership of the Event.

Kitchen continues managing the Event independently.

Relationship to Proposal

Proposal is the controlled handoff between Kitchen and Sales.

Kitchen publishes.

Sales receives.

After publication the two domains operate independently until another Proposal is published.

Events may publish multiple Proposal revisions during their lifecycle.

Relationship to Quotation

Quotation begins when Sales receives a published Proposal.

Sales owns all Quotation activity.

Kitchen is not aware of:

quotation status
quotation revisions
accepted quotations
declined quotations

If operational changes are required, Kitchen publishes a new Proposal.

Quotation preserves its own historical versions independently of the Event.

Relationship to Groceries

Groceries consumes Event information independently of Proposal and Quotation.

Groceries determines purchasing requirements.

Groceries never modifies the Event.

Propagation

Propagation exists only through the Composition chain.

Ingredients

↓

Recipes

↓

Dishes

↓

Menus

↓

Events

Propagation stops at Events.

Output domains manage their own refresh process.

Proposal is manually published.

Groceries refreshes through Update All.

Quotation refreshes through Kitchen Update.

Automatic downstream overwrite is intentionally avoided.

Event Lifecycle

Current operational lifecycle remains intentionally simple.

Typical progression:

Draft

↓

Planning

↓

Ordered

↓

Completed

↓

Archived (future)

Event Status belongs exclusively to Events.

Downstream domains may use Event Status but do not own it.

Event Publication

Events publish operational information including:

Event Name
Customer
Contact
Venue
Venue Contact
Event Date
Event Format
Guest Counts
Menus
Current Costs
Allergen Summary
Diet Tag Summary
Operational Revision

Downstream domains consume published information rather than internal Event implementation.

Event Revision

Events maintain the current operational revision.

Changes such as:

Guest Counts
Menus
Operational Details
Costing

advance the Event revision.

Proposal publishes the current revision.

Groceries and Quotation determine independently when to refresh from the latest published information.

Event Ownership

Permanent records belong to their Management domains.

Events own only their operational use.

Customer owns Customer information.

Contact owns Contact information.

Venue owns Venue information.

Events own the operational context for a specific Event.

Event Notes

Operational notes remain Event-specific.

Examples include:

access instructions
delivery sequence
production reminders
logistics
setup information

Permanent notes remain with their Management records.

Temporary operational notes remain with the Event.

Future Direction

Future Event development may include:

lifecycle refinement
archival behaviour
administrative workflow
revision management

The architectural position of Events as Savveyra's shared operational domain is considered stable.