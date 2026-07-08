Quotation_Changelog.md

============================================================
QUOTATION DOMAIN CHANGE LOG
============================================================

v0.1.56
------------------------------------------------------------

Status
------
Quotation Supabase Foundation completed.

Major Additions
---------------
• Event-centered quotation architecture.
• Quotation Inbox.
• Multiple quotations per Event.
• Draft / Issued / Accepted workflow.
• Kitchen Update detection.
• Imported Event Revision tracking.
• Shared document numbering service.
• Draft-only editing functions.
• Quotation financial calculations.
• Per-menu pricing.
• Event total pricing.
• Deposit framework.
• Shared document numbering (get_next_document_number).

New Tables
----------
• quo_event_inbox
• quo_events
• quo_menus
• quo_deposits
• document_sequences

New Views
---------
• vw_quo_event_inbox
• vw_quo_events
• vw_quo_menus
• vw_quo_menu_components
• vw_quo_deposits
• vw_quo_quotes_for_event

New Functions
-------------
• sync_quotation_eligibility()
• import_event_to_quote()
• refresh_quotation_menus()
• ensure_quotation_deposits()
• update_quote_from_kitchen()
• duplicate_quote()
• issue_quote()
• accept_quote()
• update_quote_header()
• update_quote_menu()
• update_quote_deposit()
• get_next_document_number()

Design Decisions
----------------
• Event remains the Kitchen conversation.
• Quotations are Sales snapshots.
• Kitchen Updates are notification only.
• Business rules enforced in Supabase.
• Appsmith responsible for UI only.
• One business action = one Supabase function.
• Shared numbering service introduced.

Verification
------------
✓ Import
✓ Duplicate
✓ Issue
✓ Accept
✓ Lock protection
✓ Kitchen Update detection
✓ Revision tracking
✓ Financial calculations
✓ Number generation
