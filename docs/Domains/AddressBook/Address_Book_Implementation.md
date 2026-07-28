## Address Book Implementation

The Address Book is implemented as a single administrative subsystem.

It consists of three master record pages:

* Customers
* Contacts
* Venues

These pages intentionally share the same architecture, behaviour and user experience.

Each page is an implementation of the same administrative pattern rather than an independent application.

### Common Page Behaviour

CustomerList, ContactList and VenueList all provide the same operational workflow.

Each page supports:

* Add New
* Edit
* Duplicate
* Delete
* Save
* Save & New
* Cancel

Where practical, behaviour should remain identical across all three domains.

### Shared User Experience

The Address Book follows one consistent user experience.

All three pages share:

* Common page layout.
* Common modal behaviour.
* Common duplicate warning workflow.
* Common delete confirmation workflow.
* Common Active/Inactive behaviour.
* Common filtering behaviour.
* Common loading and refresh behaviour.
* Common navigation.

Users should not need to learn different behaviours when moving between Customer, Contact and Venue management.

### Contact Management

Contacts are maintained through a single Contact master.

Customer and Venue records do not own Contact information.

Instead, Customer–Contact and Venue–Contact relationship tables define operational associations between existing master records.

Creating or removing an association affects only the relationship.

Customer, Contact and Venue master records remain independent.

### Ownership

Address Book pages are responsible only for maintaining master records.

Events, Proposals and Quotations consume Address Book information but never edit Address Book master records directly.

Address Book remains the authoritative source of current Customer, Contact and Venue information throughout the application.

### Completion

The Address Book subsystem is considered complete for the current development phase.

Future changes are expected to be minor refinements resulting from downstream operational requirements rather than further architectural redesign.
