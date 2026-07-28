# Customer / Contact / Venue Changelog

## Purpose

Records meaningful operational and architectural changes for the Customer / Contact / Venue domain.

Git remains the permanent technical history.

This changelog records business decisions and implementation milestones.

--------------------------------------------------

---

## v0.1.72 — Address Book Normalization Complete

Date:
2026-07-28

Operational Changes

• Completed normalization of CustomerList, ContactList and VenueList.

• Established the Address Book as a unified administrative subsystem.

• Standardized Customer, Contact and Venue page architecture.

• Standardized CRUD behaviour across all three domains.

• Standardized duplicate warning workflow.

• Standardized delete confirmation behaviour.

• Standardized Active/Inactive management.

• Standardized filtering behaviour (default = All).

• Standardized loading and refresh behaviour.

• Completed shared Contact relationship implementation.

• Completed Customer–Contact and Venue–Contact relationship management.

• Removed obsolete page-specific implementations in favour of shared patterns.

---

Appsmith

Completed

CustomerList normalization.

ContactList normalization.

VenueList normalization.

Shared page behaviour.

Shared modal behaviour.

Shared status update implementation.

Shared query patterns.

Shared JS architecture.

Widget naming normalization.

---

Result

The Address Book subsystem is considered complete for the current phase.

Future development is expected to consist only of minor adjustments required by Events, Proposal and Quotation integration.

The next major architectural phase continues with the operational flow:

Events → Proposal → Quotation → PDF Engine.


--------------------------------------------------

## v0.1.64 — Contact Master Normalization

Date:
2026-07-13

Operational Changes

• Introduced one shared Contact master.

• Customer Contacts and Venue Contacts now use the same Contact table.

• A Contact represents one person.

• Contacts may be:

    Customer contacts

    Venue contacts

    Both

    Unassigned

• Only Contact Name is required.

• Customer and Venue associations are optional.

• Existing associations are preserved.

• Quote and Event Contact assignments remain independent of Contact ownership.

--------------------------------------------------

Supabase

Added

contacts

customer_contact_links

venue_contact_links

vw_contacts

vw_venue_contacts

save_contact_master()

Migration maps

Migrated all existing Customer Contacts.

Migrated all Venue Contacts.

Converted Event Contact FK.

Converted Quote Contact FK.

Added venue_contact_id support.

--------------------------------------------------

Appsmith

Rebuilt ContactList.

Unified Customer and Venue Contacts.

Added Type.

Added Linked To.

Added optional Customer / Venue association.

Added unassigned Contact support.

Replaced Customer-only save logic.

--------------------------------------------------

Known Open Work

VenueList conversion

Quotation Contact modal

Quotation Venue modal

Event Contact selector

CustomerList modernization

VenueList modernization