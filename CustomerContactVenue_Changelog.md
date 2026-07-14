# Customer / Contact / Venue Changelog

## Purpose

Records meaningful operational and architectural changes for the Customer / Contact / Venue domain.

Git remains the permanent technical history.

This changelog records business decisions and implementation milestones.

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