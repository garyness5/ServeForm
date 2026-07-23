Current Status

Shared Contact architecture complete.

Migration complete.

Views complete.

ContactList complete.

Contact modal complete.

Save and Save & New working.

-----------------------------------------

Current Foundation

contacts

customer_contact_links

venue_contact_links

vw_contacts

vw_customer_contacts

vw_venue_contacts

save_contact_master()

-----------------------------------------

Verified

Migration

Customer links

Venue links

FK conversion

ContactList

Shared Contact save

-----------------------------------------

Next Work

VenueList

CustomerList

Quotation Contact modal

Quotation Venue modal

Event Contact selector

Customer selector improvements

-----------------------------------------

Important Decisions

One Contact.

Many Customer associations.

Many Venue associations.

Contact may remain unassigned.

Quotation assigns Contacts per Quote.

Customer and Venue only provide filtered lists.

Do not duplicate Contacts.

Reuse existing Contacts whenever possible.

-----------------------------------------

Do Not

Remove migration tables.

Remove compatibility views.

Delete customer_contacts.

Delete Venue contact text.

These remain until every dependent page has been converted.