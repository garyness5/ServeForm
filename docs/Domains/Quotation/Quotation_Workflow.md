Quotation Workflow
Purpose

Quotation is the Sales workspace that receives published Proposals from Kitchen.

Kitchen plans and costs the Event.

Kitchen publishes a Proposal.

Sales converts that Proposal into one or more customer quotations.

Quotation is intentionally focused on commercial food proposals. It is not intended to become a complete CRM, accounting package, event-management system, or corporate sales platform.

For many small businesses, the Quotation may be the final customer quotation.

Larger organizations may use the Quotation as the food-service proposal that is incorporated into their existing commercial systems.

System Position
Management
    │
    ▼
Ingredients
    │
Recipes
    │
Dishes
    │
Menus
    │
Events
   ↙  ↘
Proposal  Groceries
    │
Quotation

Events are the operational center of Savveyra.

Proposal is the formal handoff from Kitchen to Sales.

Quotation begins only after a Proposal has been published.

Operational Philosophy

Kitchen and Sales are independent operational departments.

Kitchen is responsible for:

Ingredients
Recipes
Dishes
Menus
Events
Production costing
Operational planning

Sales is responsible for:

Customer proposals
Selling prices
Commercial revisions
Deposits
Terms
Customer communication
Proposal acceptance

Neither department owns the other's workflow.

Kitchen never edits Quotations.

Sales never edits Kitchen planning through Quotation.

Communication between departments occurs through Proposal publication and normal business communication outside the application where necessary.

Ownership
Kitchen Owns
Event composition
Menus
Guest production quantities
Kitchen costs
Allergens
Diet Tags
Operational notes
Event revision history
Sales Owns
Quotations
Selling prices
Quote revisions
Customer notes
Terms
Deposits
Quote numbering
Issue
Acceptance
Shared

Events remain the shared operational record.

Customer, Contact, Venue and Venue Contact are shared master records used by both Kitchen and Sales.

Proposal

Proposal is the official Kitchen publication.

Publishing a Proposal sends the current saved Event to Sales.

Proposal represents a snapshot of the Event at the moment it was published.

Kitchen may continue modifying the Event afterwards.

Sales receives a new Proposal only when Kitchen publishes another revision.

Quotation never reads unsaved Kitchen work.

Proposal Lifecycle
Event

↓

Proposal Published

↓

Sales Receives Proposal

↓

Quotation Created

↓

Customer Decision

Proposal itself is not edited.

Each publication creates a new Proposal snapshot available to Sales.

QuotationList

QuotationList is the Sales inbox.

Each row represents one Event that has at least one published Proposal.

Typical information includes:

Event Name
Event Date
Customer
Venue
Guests
Proposal Revision
Draft Count
Issued Count
Accepted Quote
Kitchen Update Status

Selecting a row opens the Quotation workspace for that Event.

There is no standalone New Quote.

Every Quote originates from a published Proposal.

Quotation Workspace

The Event acts as the container.

Within that Event, Sales may create multiple Quotations.

Typical examples include:

Initial proposal
Budget proposal
Premium proposal
Revised proposal after customer feedback

Only one Quote may be the current Accepted Quote.

Page Layout

The Quotation workspace contains one active Quote at a time.

All editing applies to the selected Draft.

Top Header

The Top Header provides glance-level information.

It displays:

Event Name
Quote Status
Quote Number
Proposal Revision
Kitchen Update Status
Event Date
Guests

The Top Header is informational only.

Editable values belong elsewhere on the page.

Quote Selector

The Quote Selector displays every Quote belonging to the Event.

Typical information includes:

Status
Quote Number
Quote Reference
Quote Date
Valid Until
Quote Total
Balance
Proposal Revision

Selecting a row changes the active Quote.

All page information refreshes to reflect the selected Quote.

Actions

The primary actions are:

Close
Save
Update
Duplicate
Issue
Accept
Delete
Print

Save applies to the complete Draft.

Quotation does not use inline row saving.

Quote Information

Editable Draft information includes:

Quote Reference
Valid Until
Pricing Mode
Event Total Price
Service Charge
Final Due Date

Only Draft Quotes may be edited.

Customer Information

Quotation displays the current Customer information associated with the Event.

Typical information includes:

Customer
Company
Contact
Address
Phone
Mobile
Email
Website

Customer and Contact remain shared master records.

Quotation edits the shared records without taking ownership of them.

Venue Information

Quotation displays the current Venue information associated with the Event.

Typical information includes:

Venue
Address
Venue Contact
Phone
Mobile
Email

Permanent Venue information belongs to the Venue master.

Quote-Specific Venue Instructions

Proposal-specific instructions belong to the Quote rather than the Venue.

Examples include:

Room numbers
Floor numbers
Delivery locations
Setup times
Access instructions
Temporary customer requests

These instructions apply only to the current Quote.

Menus

Quotation imports the active Menus from the published Proposal.

Each Menu may display:

Menu Name
Guests
Price Per Guest
Line Total
Current Kitchen Cost
Diet Tags
Allergens
Status

Price Per Guest is entered by Sales.

Kitchen Cost is displayed for reference only.

Pricing

Quotation supports two pricing methods.

Menu Pricing

Each Menu is priced individually.

Guests × Price Per Guest = Line Total

The Quote Total is the sum of all active Menu totals.

Event Pricing

Menus remain visible.

Sales enters one total Event price.

The Menu breakdown remains informational.

Kitchen Cost

Kitchen Cost remains visible throughout the Draft.

The purpose is to provide current operational costing while Sales prepares customer pricing.

Kitchen Cost is never edited within Quotation.

Future Menu normalization will calculate:

COGS
+
Kitchen Adjustment
=
Kitchen Price

Quotation consumes the resulting Kitchen Price without requiring knowledge of how Kitchen calculated it.

Kitchen Update

Kitchen Update indicates that a newer Proposal has been published since the current Draft was created or last refreshed.

Kitchen Update never modifies a Quote automatically.

It simply informs Sales that newer operational information is available.

Kitchen Update Actions
Update Current Draft

Refreshes the selected Draft using the latest published Proposal.

Where possible, Quote-owned values such as:

Selling Prices
Customer Notes
Terms
Deposits

remain unchanged.

Operational information is refreshed from the latest Proposal.

Create New Draft

Creates a new Draft from the latest published Proposal.

The existing Draft remains unchanged.

This supports multiple commercial proposals for the same Event.

Ignore

Sales may choose to continue working with the existing Draft.

No changes are made.

Quote Lifecycle
Draft

↓

Issued

↓

Accepted
Draft

Draft is the editable working document.

Sales may:

Save
Update
Duplicate
Change pricing
Edit customer information
Edit venue instructions
Edit customer notes
Edit terms
Edit deposits
Print draft copies
Delete

Only Draft Quotes are editable.

Issued

Issuing a Quote creates the official customer proposal.

When a Quote is Issued:

Quote Number is generated
Issue Date is recorded
The Quote becomes locked
The Proposal snapshot is preserved

Issued Quotes cannot be edited.

Any revisions require creating a new Draft.

Accepted

Accepted identifies the Proposal selected by the customer.

When a Quote is Accepted:

Acceptance Date is recorded
Previous Accepted Quote becomes Issued
Only one Accepted Quote exists for an Event

Acceptance affects the commercial workflow only.

Kitchen planning continues independently.

Quote Numbering

Official Quote Numbers are generated only when a Quote is Issued.

Drafts never consume Quote Numbers.

Quote Numbers are:

Client specific
Sequential
Permanent
Unique
Never reused

Quote Reference remains an optional user-entered field.

Financials

Quotation provides commercial calculations.

It is not an accounting system.

Fields include:

Subtotal
Service Charge
Quote Total
Deposit 1
Deposit 2
Deposit 3
Balance
Final Due Date
Quote Total = Subtotal + Service Charge

Balance = Quote Total − Deposits

Taxes are intentionally excluded.

Notes

Quotation contains three note sections.

Customer Notes

Visible to the customer.

Terms

Customer-facing terms and conditions.

Default Terms may be supplied from Settings and edited for individual Quotes.

Internal Notes

Internal business information.

Internal Notes never appear on customer output.

Customer, Contact and Venue

Customer, Contact, Venue and Venue Contact are shared business records.

They are not owned by Quotation.

Quotation displays and updates the shared records using page-specific Appsmith dialogs while all business rules remain in Supabase.

Standard button behavior:

+ — Create a new record
i — View or edit the linked record

The same Customer, Contact and Venue may be used by many Events and many Quotations.

Relationship to Groceries

Proposal creates two independent downstream workflows.

Proposal
├── Groceries
└── Quotation

Groceries supports purchasing and production.

Quotation supports customer proposals and sales.

Neither workflow depends on the other.

Neither workflow updates the other.

Neither workflow publishes information back into Kitchen.

Print and PDF

Quotation supports customer-facing printed and PDF documents.

Printing is based on the selected Quote snapshot.

Issued and Accepted Quotes always reproduce the exact document that was presented to the customer.

Future revisions never modify historical customer documents.

Print layout is independent of the editing layout.

The same Print/PDF framework will be shared with Groceries.

Supabase Responsibilities

Supabase owns:

Proposal publication
Proposal import
Quote lifecycle
Quote numbering
Quote locking
Proposal revision tracking
Kitchen Update detection
Financial calculations
Duplicate behavior
Quote validation
Snapshot integrity
Database security
Business rules
Appsmith Responsibilities

Appsmith owns:

Page layout
Navigation
Tables
Forms
Buttons
Dialogs
Confirmations
Warnings
Display formatting
User interaction

Appsmith does not duplicate business logic owned by Supabase.

Key Database Objects
Tables
quo_event_inbox
quo_events
quo_menus
quo_deposits
document_sequences
Views
vw_quo_event_inbox
vw_quo_events
vw_quo_menus
vw_quo_menu_components
vw_quo_deposits
vw_quo_quotes_for_event
Functions
sync_quotation_eligibility()
publish_event_proposal()
import_event_to_quote()
update_quote_from_proposal()
duplicate_quote()
issue_quote()
accept_quote()
update_quote_header()
update_quote_menus_bulk()
update_quote_deposit()
get_next_document_number()
Current Direction

Quotation is intentionally limited to managing commercial food-service proposals.

Kitchen owns production.

Sales owns customer quotations.

Proposal is the only formal handoff between the two departments.

This separation keeps operational planning and commercial negotiation independent while allowing both departments to work from the same Event.