# Customer / Contact / Venue Workflow

Address Book Workflow
Purpose

The Address Book subsystem manages the people and organizations used throughout Savveyra.

It provides a single, normalized source of Customer, Contact, and Venue information for operational and sales workflows.

The Address Book is an administrative subsystem.

It owns master records.

Other domains consume published Address Book information but never own it.

Scope

The Address Book subsystem includes:

Customers
Contacts
Venues
Customer–Contact associations
Venue–Contact associations

The subsystem supplies information to:

Events
Proposals
Quotations

It does not manage operational planning.

Operational Philosophy

The Address Book exists to eliminate duplicate information while allowing flexible real-world relationships.

The design assumes that:

one person may represent multiple Customers
one person may represent multiple Venues
one Customer may have many Contacts
one Venue may have many Contacts

Relationships are many-to-many where appropriate.

The system should model real business relationships rather than force artificial duplication.

Address Book Ownership

The Address Book owns:

Customer master records
Contact master records
Venue master records
Customer–Contact links
Venue–Contact links

Other domains reference these records but do not own them.

Changes to Address Book records automatically become available wherever the current published records are used.

Historical snapshots remain unchanged.

Customer

A Customer represents the organization or individual receiving Savveyra's services.

Only the Customer Name is required.

All other information is optional.

A Customer may exist without:

Contacts
Venues
Events
Quotations

Customers are master records and remain available until explicitly deleted.

Contact

A Contact represents a person.

There is only one Contact master.

Separate Customer Contact and Venue Contact tables no longer exist conceptually.

A Contact may be linked to:

one Customer
many Customers
one Venue
many Venues
both Customers and Venues
neither Customer nor Venue

Only Contact Name is required.

A Contact may legitimately remain unassigned.

Unassigned Contacts are valid Address Book records.

Venue

A Venue represents a physical location where Events may occur.

Only Venue Name is required.

A Venue may exist without:

Contacts
Customers
Events
Quotations

Venues are master records owned entirely by the Address Book.

Shared Contact Model

Contacts are intentionally shared.

Duplicate Contact records should not be created simply because the same person works with multiple organizations.

Instead, relationships are represented through association tables.

The Contact remains the single source of truth for that person.

This simplifies maintenance while accurately reflecting real business relationships.

Customer–Contact Associations

Customer and Contact relationships are independent.

A Customer may have:

no Contacts
one Contact
many Contacts

A Contact may represent:

one Customer
many Customers

Creating or removing an association does not create or delete either master record.

Associations simply define operational relationships.

Deleting an association removes only the relationship.

The Customer and Contact records remain unchanged.

Venue–Contact Associations

Venue relationships operate identically.

A Venue may have:

no Contacts
one Contact
many Contacts

A Contact may represent:

one Venue
many Venues

Customer associations and Venue associations are completely independent.

The same Contact may legitimately represent both a Customer and a Venue.

Duplicate Philosophy

Duplicate master records should be avoided whenever possible.

When adding new records, the system should encourage reuse of existing Customers, Contacts and Venues.

Normalization is preferred over duplication.

If a matching master record already exists, users should associate with that record rather than creating another.

Events Integration

Events consume Address Book information.

Events do not own Customer, Contact or Venue master records.

Events reference the current published Address Book records while remaining operationally independent.

Customer, Contact and Venue selections within an Event describe the current operational context of that Event.

An Event may exist without:

Customer
Contact
Venue
Venue Contact

Only the Event Name is required.

Proposal Integration

A Proposal is generated from the current published Event.

When a Proposal is created, Address Book information is copied into the Proposal snapshot.

After publication, the Proposal becomes an immutable historical record.

Subsequent Address Book changes do not alter previously published Proposals.

A new Proposal must be published to reflect updated Address Book information.

Quotation Integration

Quotations are owned by the Sales subsystem.

A Quotation receives Address Book information from the Proposal it was created from.

Sales may adjust Customer, Contact or Venue information for the working Quotation when operationally appropriate.

Previously issued Quotation revisions remain historical snapshots.

Current Address Book changes never modify historical Quotations automatically.

Published State

Address Book master records always represent the current published business information.

Other domains consume this published information according to their own lifecycle.

Working changes inside another subsystem do not modify Address Book records.

Address Book remains the authoritative source of current Customer, Contact and Venue information.

Historical Snapshots

Historical business documents preserve the information that existed when they were created.

This includes published:

Proposals
Quotation revisions

Historical documents are never rewritten because master records later changed.

This preserves a complete and accurate business history.

Operational Rules

The Address Book follows these operational principles:

Master records are created once.
Relationships are created as needed.
Relationships may be removed without affecting master records.
Master records should not be duplicated to solve relationship problems.
Only historical business documents preserve snapshots.
Current operational records always use current published master data.
Current vs Historical Information

The Address Book always represents the current business state.

For example:

A Customer changes telephone number.

The Customer record is updated.

Future Events use the updated information.

Previously published Proposals and previously issued Quotation revisions continue to display the historical information captured at the time they were created.

The Address Book is not responsible for historical document preservation.

That responsibility belongs to the publishing process.

Published Data

The Address Book publishes current master information.

Publishing means the information is available for selection by other domains.

It does not imply document publication.

Other subsystems determine when current published Address Book information is copied into their own published documents.

Data Integrity

Relationships must always reference valid master records.

Deleting a Customer, Contact or Venue must not silently invalidate existing historical documents.

Operational records should either:

update to another valid master record,
remove the current relationship where appropriate, or
preserve historical snapshots already published.

The system should always preserve data integrity while avoiding unnecessary duplication.

Administrative Role

The Address Book is an administrative subsystem.

Its primary purpose is maintaining accurate business information.

It does not:

plan Events,
create Menus,
calculate costs,
generate Groceries,
produce Quotations.

It simply provides trusted master information for the operational subsystems.

Current Direction

The Address Book has been normalized around a shared Contact model.

Future development should continue strengthening normalization rather than introducing duplicate entity types.

Implementation should favor:

shared master records,
reusable relationships,
clear ownership,
minimal duplication,
simple operational workflows.

The subsystem should remain lightweight while providing reliable master information to the rest of Savveyra.

Relationship to Other Subsystems

The Address Book supports, but remains independent from:

Kitchen
Events
Proposals
Quotations
Groceries

Changes within those subsystems must not alter Address Book ownership or architecture.

Address Book remains the authoritative source for Customer, Contact and Venue master records throughout the application.