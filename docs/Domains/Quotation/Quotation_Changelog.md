# Quotation Changelog

## Purpose

This document records meaningful changes to the Quotation domain.

It is not a replacement for Git history.

Git remains the permanent technical history. This changelog summarizes operational, architectural, and implementation milestones required to understand the current domain.

---

## v0.1.60 — Quotation Administrative Workspace and Shared Event Model

**Date:** 2026-07-10

### Operational Changes

* Reframed Events as the only shared operational domain between Kitchen and Sales/Admin.
* Confirmed that either department may create or complete an Event.
* Confirmed that only Event Name is required to begin an Event.
* Reframed Quotation as the Kitchen Proposal output rather than a full CRM or corporate quotation system.
* Confirmed that small operators may use the proposal directly while larger operations may incorporate it into their existing quotation systems.
* Confirmed multiple proposal tracking per Event as a core Quotation behavior.
* Clarified current operational cost versus historical captured cost.
* Identified future Menu normalization:

```text
COGS + Kitchen Adjustment = Kitchen Price
```

### Supabase Changes

* Added:

```sql
public.quo_events.venue_instructions text
```

* Added and tested bulk Menu save function:

```sql
public.update_quote_menus_bulk(bigint,jsonb)
```

* Updated Foundation SQL to include:

  * `venue_instructions` table definition/migration
  * `venue_instructions` in `duplicate_quote(...)`
  * `venue_instructions` in `update_quote_header(...)`
  * `venue_instructions` in `vw_quo_events`
  * bulk Menu save function
  * updated smoke-test function list

### Appsmith Changes

* Built `QuotationList` and `Quotation` pages.
* Added Event-centered Quotation inbox.
* Added Event-to-Quotation navigation.
* Added Quote selector for multiple Quotes per Event.
* Added selected Quote loading.
* Added Quote header editing.
* Added main Save behavior.
* Replaced inline Menu row saving with one main Save action.
* Confirmed saving:

  * Quote Reference
  * header fields
  * Customer Notes
  * Internal Notes
  * Terms
  * Menu Price per Guest
  * Menu Notes
* Rebuilt `tblQuoteMenus` after removing stale inline-save bindings.
* Hid Menu Notes pending final operational review.
* Added Quotation administrative layout:

  * Quote Data
  * Customer/Contact information
  * Venue information
  * Quote-specific Venue Instructions
* Copied Customer, Contact, and Venue modals into Quotation using Quotation-specific widget names.
* Established `+ / i` as the Add / View-Edit lookup pattern.
* Added action buttons for Close, Save, Update, Duplicate, Issue, Accept, Delete, and Print.

### Known Open Work

* Remove hard-coded client UUIDs from Quotation queries.
* Complete Venue Instructions save/load integration.
* Wire copied Customer, Contact, and Venue modals.
* Complete Financials and Deposits.
* Wire Update, Duplicate, Issue, Accept, Delete, and Print.
* Review accepted-proposal communication back to Kitchen.
* Build shared Print/PDF procedure for Quotation and Groceries.

---

## v0.1.59 — Quotation Administrative Workspace Normalization

### Changes

* Added Top Header design.
* Added Customer information container.
* Added Venue information container.
* Added copied page-specific Customer, Contact, and Venue modals.
* Standardized Quotation modal widget naming.
* Added `+ / i` lookup-button pattern.
* Confirmed permanent Venue data remains in Venue master.
* Confirmed room/floor/setup instructions belong to the Quote context.

---

## v0.1.58 — Main Save and Menu Pricing

### Changes

* Wired selected Draft Quote header save.
* Added bulk Menu save behavior.
* Replaced inline row-save approach with the main page Save action.
* Confirmed Price per Guest persists after save and refresh.
* Confirmed Menu Notes persist after save and refresh.
* Kept Menu Notes in Supabase but hid them in Appsmith pending final review.

---

## v0.1.57 — Appsmith Workspace Skeleton

### Changes

* Created `QuotationList`.
* Created `Quotation` workspace.
* Added Quotation inbox queries.
* Added Event selection and navigation.
* Added selected Event query.
* Added Quote selector query and table.
* Added selected Quote query.
* Added initial workspace sections:

  * Header
  * Quote Selector
  * Actions
  * Quote Data
  * Menus
  * Financials
  * Notes and Terms
* Added Customer Notes, Terms, and Internal Notes RTE widgets.

---

## v0.1.56 — Supabase Foundation Complete

**Date:** 2026-07-07

### Foundation

* Created Event-centered Quotation inbox.
* Enabled multiple Quotes per Event.
* Implemented lifecycle:

```text
Draft → Issued → Accepted
```

* Enforced Draft-only editing.
* Added Supabase-owned Quote numbering.
* Added shared `document_sequences` service.
* Added Kitchen Update revision tracking.
* Added Event import/update behavior.
* Added duplicate behavior.
* Added Issue behavior.
* Added Accept behavior.
* Ensured only one current Accepted Quote per Event.
* Updated Event Status to Accepted when a Quote is accepted.
* Added Quotation tables, views, functions, constraints, and indexes.
* Tested lifecycle, locking, numbering, calculations, inbox, and selector behavior.
