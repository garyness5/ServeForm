Event Changelog

This document records significant architectural and operational changes to the Events domain.

Minor implementation changes, bug fixes and formatting updates are intentionally excluded.

Current Architecture

Events are the operational hub of Savveyra.

Events receive completed Kitchen planning through the Composition chain and publish operational information to downstream output domains.

Propagation ends at Events.

Shared Ownership

Events are jointly owned by Kitchen and Sales.

Neither department exclusively owns the Event.

Either may:

Create an Event
Update Event information
Complete Event information

This supports both owner-operated businesses and larger organizations without requiring different workflows.

Minimum Event Requirements

Event creation simplified.

Only one field is required:

Event Name

All remaining information is optional and may be completed later.

Customer, Contact and Venue

Ownership clarified.

Permanent information belongs to Management domains.

Events own only the operational use of:

Customer
Contact
Venue
Venue Contact

Customer, Contact and Venue selections may change during the life of an Event.

Event Components

Confirmed.

Events contain:

Menus

Events never directly contain:

Dishes
Recipes
Ingredients

Composition relationships remain upstream.

Proposal Separation

Proposal introduced as an independent business concept.

Kitchen publishes a Proposal.

Sales receives a Proposal.

Proposal represents the operational handoff between Kitchen and Sales.

Quotation Separation

Quotation removed from the Kitchen workflow.

Sales owns Quotation.

Kitchen has no awareness of:

quotation status
quotation revisions
quotation acceptance

Kitchen communicates only by publishing new Proposal revisions.

Operational Truth

Confirmed.

Events remain the current operational source of truth.

Quotation preserves commercial history.

Events continue evolving independently until production.

Propagation

Propagation confirmed.

Ingredients

↓

Recipes

↓

Dishes

↓

Menus

↓

Events

Propagation stops at Events.

Output domains control their own update behaviour.

Automatic downstream overwrite is not permitted.

Event Revision

Revision handling clarified.

Operational changes advance the Event revision.

Proposal publishes the current revision.

Downstream domains independently determine when to refresh from the latest published Proposal.

Future Development

Future work may include:

lifecycle refinement
archival behaviour
revision management
administrative workflow

The architectural position of Events as the shared operational domain is considered stable.