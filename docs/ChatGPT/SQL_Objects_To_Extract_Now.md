# SQL Objects to Extract Now

## Build now: CustomerContactVenue_Foundation.sql

Pull the complete live definitions for the Customer / Contact / Venue domain.

### Known tables
- public.customers
- public.contacts
- public.customer_contact_links
- public.venues
- public.venue_contact_links

### Compatibility / migration objects
Inspect and include only while still required by dependencies:
- public.customer_contacts
- public.contact_migration_map
- public.venue_contact_migration_map

### Known views
- public.vw_customers
- public.vw_contacts
- public.vw_customer_contacts
- public.vw_venue_contacts
- public.vw_venues

### Known functions / triggers
- public.save_contact_master
- public.set_customer_normalized_name
- public.trg_set_customer_normalized_name

Also pull every additional function, trigger, constraint, index, policy, sequence, and dependent view that references the known tables. Do not rely only on the known-name list.

---

## Update now: Quotation_Foundation.sql

The existing file is old. Pull the complete live Quotation domain and compare it with the old Foundation file.

Pull:
- every table whose name begins with `quo_`
- every view whose name begins with `vw_quo_`
- every function or procedure whose name contains `quote`, `quotation`, or begins with `quo_`
- all constraints, foreign keys, indexes, triggers, policies, sequences, and dependent objects for those tables
- dependencies from Event objects used for quote eligibility, quote creation/import, Kitchen Update, and acceptance

Do not overwrite the old file blindly. Reconcile live Supabase against it, test the rebuilt script, then replace it as the authoritative Foundation file.

---

## Do not build yet: Events_Foundation.sql

A complete Events Foundation can wait until the Events / Quotation phase is finished because Event integration may still change.

For current Quotation work, inspect only the affected Event objects when needed, especially:
- public.evt_items
- public.vw_evt_items
- functions that save Event administrative assignments
- functions or views used by Quotation eligibility
- functions that create/import/update Quotes from Events
- Kitchen Update / revision functions
- acceptance logic that writes back to Event status

After Quotation and Event integration are operationally complete, extract the full Events domain and build Events_Foundation.sql.
