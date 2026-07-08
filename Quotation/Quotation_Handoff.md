# Quotation Handoff

## Current Stage

Quotation Supabase foundation is complete.

Appsmith Quotation pages are not yet built.

This handoff is for starting the Appsmith implementation phase from a clean chat.

## Core Architecture

Quotation is a Sales service built on Events.

The Event remains the Kitchen/Operations workspace.

QuotationList is an Event-centered Sales inbox, not a quote list.

Opening a QuotationList row opens the Quotation workspace for that Event.

Inside the workspace, Sales can manage multiple quotes for the same Event:
- Draft
- Issued
- Accepted
- additional Drafts

Kitchen Updates are detected through Event revision numbers. Sales decides whether to import changes into the current Draft or create a new Draft.

Savveyra informs users that changes exist. It does not replace communication between departments.

## Confirmed Business Rules

### Quote Lifecycle

Quote statuses:
- Draft
- Issued
- Accepted

Only Draft quotes are editable.

Issued and Accepted quotes are locked by Supabase.

If a quote needs changes after Issue or Accept, user duplicates it into a new Draft.

### Quote Numbering

Quote numbers are generated only on Issue.

Supabase owns quote numbering through:
- `document_sequences`
- `get_next_document_number(uuid,text)`
- `issue_quote(bigint)`

Appsmith should not generate quote numbers.

### Accepted Quote

Accepting a quote:
- requires the quote to be Issued
- changes the quote to Accepted
- stamps `accepted_at`
- changes the Event status to Accepted
- changes any previous Accepted quote for the same Event back to Issued

### Kitchen Update

Internal fields:
- `evt_items.quotation_revision_no`
- `quo_events.imported_event_revision_no`

User-facing wording:
- Kitchen Update

When a quote’s imported Event revision is older than the Event’s current quotation revision, Kitchen Update is available.

### Update from Kitchen

Use:

```sql
public.update_quote_from_kitchen(p_quote_event_id, p_action)
```

Actions:
- `replace_current`
- `create_new`

Do not build this logic in Appsmith.

### Direct Import

Use:

```sql
public.import_event_to_quote(p_client_id, p_event_id, p_quote_event_id)
```

If `p_quote_event_id` is null, creates new Draft.
If supplied, updates that Draft.

For Appsmith, prefer `update_quote_from_kitchen()` when user is working from an existing Draft.

### Duplicate

Use:

```sql
public.duplicate_quote(p_quote_event_id)
```

Creates a new Draft from any existing quote.

Does not copy:
- quote number
- issued timestamp
- accepted timestamp
- locked status

Copies:
- menus
- prices
- deposits
- notes
- terms
- service charge
- pricing mode

### Draft Editing

Use these functions only:
- `update_quote_header(...)`
- `update_quote_menu(...)`
- `update_quote_deposit(...)`

Do not update `quo_events`, `quo_menus`, or `quo_deposits` directly from Appsmith.

These functions block Issued/Accepted edits at Supabase level.

## Supabase Objects

### Tables

- `quo_event_inbox`
- `quo_events`
- `quo_menus`
- `quo_deposits`
- `document_sequences`

### Views

- `vw_quo_event_inbox`
- `vw_quo_events`
- `vw_quo_menus`
- `vw_quo_menu_components`
- `vw_quo_deposits`
- `vw_quo_quotes_for_event`

### Functions

- `sync_quotation_eligibility(uuid)`
- `refresh_quotation_menus(bigint)`
- `ensure_quotation_deposits(bigint)`
- `import_event_to_quote(uuid,bigint,bigint)`
- `update_quote_from_kitchen(bigint,text)`
- `duplicate_quote(bigint)`
- `issue_quote(bigint)`
- `accept_quote(bigint)`
- `get_next_document_number(uuid,text)`
- `update_quote_header(bigint,text,date,text,numeric,numeric,date,text,text,text)`
- `update_quote_menu(bigint,numeric,text)`
- `update_quote_deposit(bigint,numeric,date,text)`

## Verified Tests

Supabase tests completed successfully:

- Created Draft quote from Event.
- Created multiple Draft quotes for one Event.
- Set per-menu selling prices.
- Confirmed quote subtotal, service charge, quote total, and balance.
- Duplicated quote.
- Issued quote with manual old numbering.
- Replaced numbering with Supabase-owned numbering.
- Issued quote with automatic quote number.
- Accepted quote.
- Confirmed previous Accepted quote returns to Issued.
- Confirmed Event status becomes Accepted.
- Confirmed Issued/Accepted header edits are blocked.
- Confirmed Issued/Accepted menu edits are blocked.
- Confirmed Issued/Accepted deposit edits are blocked.
- Confirmed QuotationList inbox view.
- Confirmed quote selector view.

## Current Test Data Notes

Event `39` / BMO1 has test quotes:
- Quote 7: Draft, total 0
- Quote 8: Draft, total 140500
- Quote 9: Issued, SAV-001001
- Quote 10: Accepted, SAV-001002

This is test data only.

Before real beta data, test rows can be cleaned if needed.

Document sequence currently has:
- document_type: `quote`
- prefix: `SAV-`
- next_number: `1003`
- padding: `6`

## Appsmith Build Plan

### Page 1 — QuotationList

Data source:
- `vw_quo_event_inbox`

Purpose:
- Sales inbox
- one row per Event
- show Kitchen Update status
- show quote counts
- show accepted quote number
- Open button loads Quotation workspace for selected Event

Suggested columns:
- Event Name
- Customer / Company
- Event Date
- Event Status
- Draft Count
- Issued Count
- Accepted Quote
- Kitchen Update
- Open

### Page 2 — Quotation Workspace

Data sources:
- `vw_quo_events`
- `vw_quo_quotes_for_event`
- `vw_quo_menus`
- `vw_quo_menu_components`
- `vw_quo_deposits`

Header:
- Event/customer/venue/date
- financial summary
- right container for quote selector / Kitchen Update / warnings

Quote selector:
- use `vw_quo_quotes_for_event`
- show Draft / Issued / Accepted
- show quote number where available
- show quote total
- show Kitchen Update indicator

Quote editor:
- only editable if quote_status = Draft
- locked visual state for Issued/Accepted

### Buttons / Actions

Open Event from QuotationList:
- store selected `event_id`
- navigate to Quotation workspace
- load event quotes

Create first Draft:
- call `import_event_to_quote(client_id,event_id,null)`

Update Current Draft:
- call `update_quote_from_kitchen(current_quote_event_id,'replace_current')`

Create New Draft from Kitchen Update:
- call `update_quote_from_kitchen(current_quote_event_id,'create_new')`

Duplicate Quote:
- call `duplicate_quote(current_quote_event_id)`

Save Header:
- call `update_quote_header(...)`

Save Menu Row:
- call `update_quote_menu(...)`

Save Deposit:
- call `update_quote_deposit(...)`

Issue:
- confirm modal
- call `issue_quote(current_quote_event_id)`
- Supabase returns quote number

Accept:
- allowed only if Issued
- confirm modal
- call `accept_quote(current_quote_event_id)`

Print:
- later page/output
- source should be selected quote

## UI Philosophy

Appsmith should be thin.

Appsmith:
- displays data
- controls modals
- calls Supabase functions
- navigates pages

Supabase:
- enforces business rules
- calculates financials
- locks quotes
- issues numbers
- accepts quotes
- handles Kitchen Update import
- prevents invalid edits

## Important Warnings for Next Chat

Do not rebuild Quotation as a quote-centered list.

QuotationList must remain Event-centered.

Do not let Appsmith directly update quote tables.

Do not generate quote numbers in Appsmith.

Do not add messaging/communication workflow.

Kitchen Update is only a data notification.

Do not expand into CRM, accounting, sales pipeline, or purchase orders.

## Immediate Next Step

Start Appsmith build with QuotationList using:

```sql
select *
from public.vw_quo_event_inbox
where client_id = '{{ appsmith.store.current_client_id }}'::uuid
order by event_date nulls last, lower(event_name);
```

Then build the Quotation workspace page around selected `event_id`.
