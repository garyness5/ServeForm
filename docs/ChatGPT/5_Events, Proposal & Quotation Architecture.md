Events, Proposal & Quotation Architecture

Purpose

This document defines the architectural relationship between Events, Proposal and Quotation.

It defines:

ownership
responsibilities
information flow
publication
document creation
snapshots
historical preservation
Kitchen–Sales separation
system boundaries

This document defines architecture.

It does not define:

detailed operational workflow
user interface behaviour
implementation
SQL
Appsmith

Those belong in the appropriate operational and implementation documents.

Architectural Overview

Events, Proposal and Quotation form the transition from operational planning to customer communication.

They deliberately separate operational ownership from commercial ownership while allowing both departments to work from the same business activity.

Composition
      ↓
Events
   ├── Groceries
   └── Proposal
          ↓
      Quotation

Events conclude operational planning.

Proposal publishes Kitchen's operational solution.

Quotation communicates Sales' commercial offer.

Each domain remains independently owned.

Architectural Principles

The architecture is based upon the following principles:

one owner for every business object
one current operational truth
immutable historical documents
independent Kitchen and Sales workflows
explicit business actions
predictable information flow
no hidden synchronization
clear ownership

Operational correctness always takes priority over implementation convenience.

Event Architecture

Events are the operational authority.

Events represent the current operational truth.

Events combine:

Customer
Customer Contact
Venue
Venue Contact
scheduling
Menus
guest planning
operational administration

Events consume published Menu information.

Events publish operational information to downstream Output domains.

Propagation ends at Events.

Event Responsibilities

Events own:

current operational planning
Menu assignments
guest counts
Event scheduling
Event Status
operational administration

Events do not own:

Proposal documents
Quotation documents
commercial pricing
customer negotiations

Events remain the operational source of truth throughout their lifecycle.

Event as a Shared Domain

Events belong to the business.

They are not owned exclusively by Kitchen.

They are not owned exclusively by Sales.

Users from either department may work with Events according to permissions.

The Event remains one shared operational object throughout its lifecycle.

Operational Boundary

Operational propagation follows:

Ingredients
      ↓
Recipes
      ↓
Dishes
      ↓
Menus
      ↓
Events

Propagation intentionally ends at Events.

No information propagates automatically beyond this point.

Everything after Events is created through explicit business actions.

Kitchen Responsibilities

Kitchen owns operational planning.

Kitchen owns:

Ingredients
Recipes
Dishes
Menus
Event operational planning
Proposal creation

Kitchen determines:

production
operational costing
guest production requirements
operational content

Kitchen does not own:

customer quotations
commercial pricing
negotiations
customer acceptance

Kitchen's architectural responsibility ends when it sends a Proposal.

Sales Responsibilities

Sales owns commercial communication.

Sales owns:

Quotations
selling prices
commercial wording
customer communication
customer negotiations

Sales consumes Proposal documents.

Sales never edits Kitchen operational planning.

Kitchen never edits Sales commercial information.

Both departments continue operating independently after a Proposal has been sent.

Proposal Architecture

Proposal is the architectural boundary between Kitchen and Sales.

Proposal is a business document.

It is not a report.

It is not the Event.

It is not a live view.

Proposal captures the operational information that Kitchen intentionally communicates to Sales.

Once created, Proposal exists independently of the Event.

Proposal Ownership

Proposal belongs entirely to Kitchen.

Kitchen is solely responsible for:

creating Proposals
saving Draft Proposals
sending Proposals
Proposal content
Proposal lifecycle

Sales never edits a Proposal.

Proposal Lifecycle

Proposal follows one consistent document lifecycle.

Unsaved

↓

Draft Proposal

↓

Save

↓

Draft Proposal

↓

Send

↓

Proposal

A Draft Proposal remains editable.

A sent Proposal becomes permanent.

Sent Proposals are never edited.

Proposal Identity

A Proposal always has its own identity.

Examples include:

DP-00015
P-00015

Saving updates the existing Draft.

Sending converts the Draft into a sent Proposal by changing only the document prefix.

The document identity remains the same.

Proposal Publication

Sending a Proposal is an explicit business action.

Sending creates a permanent historical document.

Sending does not:

change the Event
lock the Event
prevent further Kitchen planning
create a Quotation
notify Sales automatically

Sending simply publishes the operational information that Kitchen has chosen to communicate.

Proposal Snapshot

Every Proposal represents one saved state of one Event.

The Proposal stores its own snapshot of the operational information available when it was created.

Later changes to:

Ingredients
Recipes
Dishes
Menus
Event information

never modify an existing Proposal.

Kitchen communicates updated operational information by creating another Proposal.

Proposal Permanence

A sent Proposal is immutable.

It always represents exactly what Kitchen sent.

It remains permanently available for:

viewing
printing
exporting
comparison
auditing
historical reference

A sent Proposal is never modified.

Draft Proposal Behaviour

Draft Proposals remain editable.

Users may:

continue editing
save repeatedly
generate PDFs
delete the Draft
send the Proposal

Deleting a Draft removes only that Draft.

Sent Proposals are never deleted.

Proposal History

Every sent Proposal is a permanent historical document.

Historical Proposals remain available for:

viewing
printing
exporting
comparison
auditing
operational reference

Historical documents are never rewritten.

Historical accuracy always takes priority over convenience.

Continuing Kitchen Planning

Sending a Proposal does not end Kitchen planning.

Kitchen may continue to:

edit the Event
modify Menus
adjust Recipes
update guest quantities
revise production planning

These changes affect only the current saved Event.

Previously sent Proposals remain unchanged.

When Kitchen wishes to communicate updated operational information, it creates another Proposal.

Creating Another Proposal

Creating another Proposal always begins with the current saved Event.

The new Proposal is created as a new Draft Proposal.

It receives:

a new document number
a new lifecycle
its own historical identity

The previous Proposal remains unchanged.

Proposal documents never replace one another.

Event Relationship

One Event may produce:

no Proposals
one Proposal
many Proposals

Each Proposal represents an independent publication of the Event at a particular point in time.

There is no concept of a current Proposal.

The current operational truth always remains the Event.

Proposal Independence

Proposal is independent after it has been sent.

Subsequent changes to:

Ingredients
Recipes
Dishes
Menus
Event details
guest quantities

never update existing Proposals.

Every Proposal permanently represents the operational information that Kitchen intentionally communicated.

Quotation Architecture

Quotation belongs entirely to Sales.

Quotation is a business document.

Quotation is created from one sent Proposal.

Quotation never uses:

the live Event
live Menus
live Kitchen planning

This separation protects commercial work from ongoing operational planning.

Quotation Ownership

Sales is solely responsible for:

creating Quotations
saving Draft Quotations
sending Quotations
commercial wording
selling prices
customer communication
Quotation lifecycle

Kitchen never edits a Quotation.

Quotation Lifecycle

Quotation follows the same document lifecycle as Proposal.

Unsaved

↓

Draft Quotation

↓

Save

↓

Draft Quotation

↓

Send

↓

Quotation

A Draft Quotation remains editable.

A sent Quotation becomes permanent.

Sent Quotations are never edited.

Quotation Identity

Quotation maintains its own document identity.

Examples include:

DQ-00027
Q-00027

Saving updates the existing Draft.

Sending changes only the document prefix.

The document identity remains the same.

Quotation Snapshot

Quotation stores its own snapshot of the Proposal from which it was created.

The stored information includes the operational information required for commercial communication.

Once created, the Quotation becomes independent.

Later changes to:

the Event
Menus
Recipes
Proposal documents

never update an existing Quotation.

Quotation Permanence

A sent Quotation is immutable.

It permanently records exactly what Sales communicated.

Sent Quotations remain available for:

viewing
printing
exporting
comparison
auditing
customer history

Sent Quotations are never modified.

Draft Quotation Behaviour

Draft Quotations remain editable.

Users may:

continue editing
save repeatedly
generate PDFs
delete the Draft
send the Quotation

Deleting a Draft removes only that Draft.

Sent Quotations are never deleted.

Proposal → Quotation Relationship

The relationship is intentionally one-way.

Event

↓

Proposal

↓

Quotation

One Proposal may produce:

no Quotations
one Quotation
many Quotations

Each Quotation is created from exactly one sent Proposal.

Creating Another Quotation

Creating another Quotation from the same Proposal creates:

a new Draft Quotation
a new document number
a new independent document

Existing Quotations remain unchanged.

Quotations never replace one another.

Commercial Independence

Sales owns all commercial information.

Commercial information includes:

selling prices
discounts
commercial wording
customer notes
Terms and Conditions

Kitchen never owns this information.

Kitchen planning remains completely independent of Sales commercial activity.

Quotation History

Every sent Quotation is a permanent historical document.

Historical Quotations remain available for:

viewing
printing
exporting
comparison
auditing
customer reference

Historical documents are never rewritten.

Historical accuracy always takes priority over convenience.

Creating a New Quotation

Creating another Quotation always begins with a sent Proposal.

The new Quotation is created as a new Draft Quotation.

It receives:

a new document number
a new lifecycle
its own historical identity

Existing Quotations remain unchanged.

Customer, Contact and Venue

While planning, Customer, Contact and Venue belong to the Event.

When a Proposal is created, the current Event assignments become part of the Proposal snapshot.

When a Quotation is created, those assignments become part of the Quotation snapshot.

Each document permanently owns its own copy of:

Customer
Contact
Venue
Venue Contact

Later changes to the Event never modify existing Proposal or Quotation documents.

Address Information

Address information follows the same snapshot model.

Each Proposal stores the address information that existed when it was created.

Each Quotation stores the address information received from its Proposal.

Later Address Book changes affect only future documents.

Historical documents always preserve the information that existed when they were created.

Current Operational Truth

The current operational truth always belongs to the Event.

The Event continues to evolve as operational planning progresses.

Typical changes include:

guest quantities
Menu changes
Recipe changes
scheduling changes
Customer changes
Contact changes
Venue changes

Saving the Event updates the current operational truth.

Existing Proposal and Quotation documents remain unchanged.

Historical Operational Truth

Historical operational truth exists within Proposal and Quotation documents.

Proposal preserves the operational information Kitchen communicated.

Quotation preserves the commercial information Sales communicated.

Historical documents never become the current operational truth.

Current and historical information intentionally coexist.

Kitchen–Sales Independence

Kitchen and Sales are architecturally independent.

Kitchen owns:

production planning
operational costing
Menus
Events
Proposal documents

Sales owns:

Quotations
customer pricing
customer communication
commercial presentation

Neither department owns the other's information.

Information Boundary

Proposal is the only architectural boundary between Kitchen and Sales.

Kitchen communicates by sending a Proposal.

Sales communicates with customers by sending a Quotation.

No commercial information flows back into Kitchen planning.

No unpublished Kitchen planning becomes visible to Sales.

Proposal Creation Boundary

Proposal creation is always initiated by Kitchen.

Proposal is always created from the current saved Event.

Proposal never reads from:

an unsaved Event
another Proposal
a Quotation

Each Proposal represents a fresh publication of the current operational planning.

Quotation Creation Boundary

Quotation creation is always initiated by Sales.

Quotation is always created from one sent Proposal.

Quotation never reads from:

the live Event
another Quotation
unsaved Proposal changes

Each Quotation represents a commercial document based upon one Proposal.

Information Flow

Information always moves in one direction.

Ingredients
      ↓
Recipes
      ↓
Dishes
      ↓
Menus
      ↓
Events
      ↓
Proposal
      ↓
Quotation

Information never flows in reverse.

Commercial information never propagates into operational planning.

Refresh Boundary

Events continue to receive automatic operational propagation from upstream Composition domains.

Proposal and Quotation do not.

Proposal and Quotation are created only through explicit user actions.

There is no automatic refresh after document creation.

Editing Boundary

Events remain editable throughout operational planning.

Draft Proposals remain editable until sent.

Draft Quotations remain editable until sent.

Sent Proposal and Quotation documents are permanently read-only.

Editing a sent document always creates a new Draft document.

The original document remains unchanged.

Delete Boundary

Only Draft documents may be deleted.

Deleting a Draft removes only that Draft.

Sent documents remain permanently available.

Deletion never affects:

Events
other Proposals
other Quotations

Historical information is never removed.

Duplicate Boundary

Duplicating a Proposal creates:

a new Draft Proposal
a new document number
copied content

Duplicating a Quotation creates:

a new Draft Quotation
a new document number
copied content

Duplicated documents always begin as Drafts.

PDF Boundary

PDF generation belongs to Proposal and Quotation.

PDFs are always generated from the saved document.

PDF generation never changes:

document status
document numbering
document history

Generating a PDF is a presentation action only.

Architectural Independence

The architecture intentionally avoids hidden dependencies.

Kitchen may continue planning indefinitely.

Sales may continue customer communication indefinitely.

Neither workflow blocks the other.

Coordination occurs only through creating and sending Proposal documents.

Architectural Benefits

Separating Events, Proposal and Quotation provides:

clear ownership
predictable information flow
permanent historical records
independent Kitchen and Sales workflows
immutable business documents
simplified implementation
easier future expansion

The architecture favors explicit business actions over hidden synchronization.

Users always know:

what is current
what is historical
who owns the information
which document they are working with

Creating a New Proposal

Creating a new Proposal always begins with the current saved Event.

A new Proposal creates a completely independent Draft Proposal.

The new Proposal:

receives a new Proposal Number
begins in Draft status
receives its own lifecycle
owns its own future history

Existing Proposal documents remain unchanged.

Editing a Sent Proposal

Sent Proposal documents are never edited.

When a user chooses to edit a sent Proposal, Savveyra creates a new Draft Proposal.

The new Draft:

receives a new Proposal Number
contains a copy of the selected Proposal
becomes an independent working document

The original Proposal remains permanently unchanged.

Proposal Numbering

Proposal numbering belongs exclusively to the Proposal domain.

Examples include:

DP-00015
P-00015

Saving a Draft never changes its number.

Sending changes only the document prefix.

The numeric identity remains unchanged.

Creating a New Quotation

Creating a new Quotation always begins with a sent Proposal.

A new Quotation creates a completely independent Draft Quotation.

The new Quotation:

receives a new Quotation Number
begins in Draft status
receives its own lifecycle
owns its own future history

Existing Quotation documents remain unchanged.

Editing a Sent Quotation

Sent Quotation documents are never edited.

When a user chooses to edit a sent Quotation, Savveyra creates a new Draft Quotation.

The new Draft:

receives a new Quotation Number
contains a copy of the selected Quotation
becomes an independent working document

The original Quotation remains permanently unchanged.

Quotation Numbering

Quotation numbering belongs exclusively to the Quotation domain.

Examples include:

DQ-00027
Q-00027

Saving a Draft never changes its number.

Sending changes only the document prefix.

The numeric identity remains unchanged.

Working Documents

Draft Proposal and Draft Quotation documents represent working documents.

Working documents:

may be edited
may be saved repeatedly
may generate PDFs
may be duplicated
may be deleted

Working documents never affect historical documents.

Historical Documents

Sent Proposal and sent Quotation documents represent historical business records.

Historical documents:

are read-only
may be viewed
may be printed
may be exported
may be duplicated

Historical documents are never modified.

Save Boundary

Saving updates the current Draft document.

Save does not:

create another Proposal
create another Quotation
create historical records
notify another department

Save updates only the current Draft.

Send Boundary

Sending publishes the current Draft.

Sending creates the permanent historical document.

Sending does not:

modify the Event
modify another Proposal
modify another Quotation
create another document

Sending changes only the status of the current Draft.

Duplicate Boundary

Duplicate creates a completely new Draft document.

Duplicate copies the current document contents.

Duplicate always creates:

a new document number
a new Draft
an independent lifecycle

The original document remains unchanged.

Delete Boundary

Delete applies only to Draft documents.

Deleting a Draft permanently removes that Draft.

Deleting a Draft never affects:

the Event
sent Proposals
sent Quotations
other Draft documents

Historical records are never deleted.

Naming

Duplicated documents use incremental names.

Examples include:

Wedding Proposal
Wedding Proposal Copy
Wedding Proposal Copy 2

and

Wedding Quote
Wedding Quote Copy
Wedding Quote Copy 2

Naming exists only to help users distinguish working documents.

Document numbering remains the authoritative business identifier.

Architectural Consistency

Proposal and Quotation intentionally follow the same architectural model.

Both support:

Working documents
Historical documents
Save
Send
Duplicate
Delete Draft
immutable history

Users should experience identical document behaviour throughout both domains.

Architectural Objective

The architecture exists to separate:

operational planning
commercial communication
current operational truth
historical business records

Each business object owns one responsibility.

Each document owns one history.

Each department owns one workflow.

The resulting architecture remains predictable, auditable, and independent while supporting one connected operational planning system.