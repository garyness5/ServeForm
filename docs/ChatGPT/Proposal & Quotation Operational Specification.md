# Proposal & Quotation Operational Specification

## Purpose

This document defines the complete operational behaviour of the Proposal and Quotation domains within Savveyra.

It defines:

ownership
lifecycle
business rules
workflow
document behaviour
Kitchen and Sales responsibilities
historical preservation

This document defines operational behaviour only.

Database implementation, Appsmith implementation, SQL, PDF generation and email implementation are documented elsewhere.

Scope

This specification covers:

Proposal
Quotation
document lifecycle
ownership
workflow
snapshots
customer information
commercial information
document numbering
historical preservation
operational boundaries

This specification does not cover:

CRM
accounting
invoicing
payment processing
taxation
inventory
purchasing
production planning
marketing
customer relationship management

These belong to separate systems.

Operational Philosophy

Kitchen and Sales perform different operational responsibilities.

Kitchen determines:

what will be produced
how it will be produced
operational planning
production costing

Sales determines:

how that production is presented commercially
customer pricing
commercial wording
customer communication

Neither department owns the other's information.

Both departments remain operationally independent while working from the same Event.

Operational Boundary

The Event is the shared operational workspace.

Proposal is Kitchen's published document.

Quotation is Sales' commercial document.

Information flows only in one direction.

Kitchen
      ↓
Proposal
      ↓
Sales
      ↓
Quotation

Kitchen never edits Quotation.

Sales never edits Proposal.

Neither department edits the other's historical documents.

Domain Ownership
Event owns
operational planning
customer assignment
contact assignment
venue assignment
venue contact assignment
menu assignments
guest quantities
scheduling
operational administration

Events represent the current operational truth.

Proposal owns
Kitchen document
operational snapshot
document lifecycle
document numbering
sent history

Proposal belongs entirely to Kitchen.

Quotation owns
Sales document
commercial presentation
selling prices
customer wording
commercial notes
Terms and Conditions
document lifecycle
document numbering
sent history

Quotation belongs entirely to Sales.

Event Relationship

Events remain the operational centre of Savveyra.

Proposal and Quotation never replace the Event.

The Event continues evolving throughout its operational life.

Proposal and Quotation simply record what was communicated at particular points in time.

Proposal Purpose

Proposal is Kitchen's operational offer to Sales.

It communicates:

what Kitchen intends to produce
current menus
guest quantities
operational notes intended for Sales
operational costing information required by Sales

Proposal is not a quotation.

Proposal is not customer communication.

Proposal is an internal Kitchen-to-Sales document.

Quotation Purpose

Quotation is Sales' customer-facing document.

Quotation communicates:

what the customer will receive
commercial pricing
customer wording
Terms and Conditions
customer notes
presentation

Quotation is never operational planning.

Quotation never changes Kitchen information.

Shared Event Information

Both Proposal and Quotation originate from the current saved Event.

Typical shared information includes:

Event Name
Customer
Contact
Venue
Venue Contact
Event Date
Event Time
Format
Menu assignments
Guest quantities

After a document is created, it owns its own snapshot of that information.

Future Event changes never modify existing documents.

Current Operational Truth

The Event always represents the current operational truth.

Kitchen continues updating the Event whenever operational changes occur.

Saving the Event updates the current operational truth.

Existing Proposal and Quotation documents remain unchanged.

Historical Operational Truth

Proposal and Quotation preserve historical operational truth.

Historical documents permanently represent exactly what existed when they were created.

Historical information is never reconstructed from current Event data.

Historical documents always reproduce their own saved information.

Proposal Lifecycle

Every Proposal follows one lifecycle.

Unsaved

↓

Draft

↓

Sent

Draft Proposals remain editable.

Sent Proposals become permanent historical records.

Quotation Lifecycle

Every Quotation follows the same lifecycle.

Unsaved

↓

Draft

↓

Sent

Draft Quotations remain editable.

Sent Quotations become permanent historical records.

Working State

Proposal and Quotation both use a Working State.

Working State may contain:

incomplete edits
temporary calculations
wording changes
unsaved pricing
temporary notes

Working State belongs only to the current editing session.

Working State never affects historical documents.

Save

Save creates or updates the current Draft.

Save does not send the document.

Save does not create historical records.

Save simply updates the current Draft.

A Draft may be saved any number of times.

Send

Send represents publication of the document.

Sending:

permanently records the document
creates historical truth
prevents further editing
changes Draft to Sent

Once sent, the document becomes read-only.

It is never edited again.

Immutable Documents

Sent documents are immutable.

They may always be:

viewed
printed
exported
regenerated

They may never be:

edited
overwritten
renamed
deleted

Their purpose is permanent historical preservation.

Creating a Proposal

A Proposal is always created from one Event.

Each Proposal belongs to exactly one Event.

An Event may have:

no Proposals
one Proposal
many Proposals

Each Proposal is an independent document.

No Proposal replaces another Proposal.

Creating a Quotation

A Quotation is always created from one Proposal.

Each Quotation belongs to exactly one Proposal.

A Proposal may produce:

no Quotations
one Quotation
many Quotations

Each Quotation is an independent document.

Add

Selecting Add Proposal creates a new empty Proposal workspace.

The Proposal is associated with the selected Event.

No Proposal Number exists until the first successful Save.

The Proposal begins in an Unsaved state.

The user builds the Proposal before saving.

The same behaviour applies to Quotation.

Save Behaviour

The first successful Save creates:

a Proposal Number
Draft status
the initial saved document

Subsequent Saves continue updating the same Draft.

Saving never creates another Proposal.

Saving never creates another Quotation.

Saving simply updates the current Draft.

Sending a Proposal

Sending a Proposal changes:

Draft

↓

Sent

The Proposal Number remains unchanged.

Only the document status changes.

After Send:

the Proposal becomes read-only
Sales may create Quotations from it
Kitchen may no longer edit it
Sending a Quotation

Sending a Quotation changes:

Draft

↓

Sent

The Quotation Number remains unchanged.

After Send:

the Quotation becomes read-only
the customer document becomes permanent
the Quotation becomes historical
Editing Draft Documents

Draft documents remain fully editable.

Typical edits include:

wording
menus
notes
customer information
pricing
Terms and Conditions
presentation

There is no limit to the number of Saves before Send.

Editing Sent Documents

Sent documents cannot be edited.

If the user opens a Sent Proposal or Quotation and makes changes, those changes occur only in the current workspace.

The original Sent document remains unchanged.

Saving Changes to a Sent Document

If changes are saved while viewing a Sent document:

A completely new Draft document is created automatically.

The original Sent document remains unchanged.

Example:

P-00015

↓

User edits

↓

Save

↓

DP-00016

The same behaviour applies to Quotations.

Example:

Q-00027

↓

User edits

↓

Save

↓

DQ-00028

The new Draft becomes the active document.

The original Sent document remains historical.

Duplicate

Duplicate creates a completely new Draft document.

Duplicate copies:

header information
menus
notes
commercial information
Terms and Conditions

Duplicate creates:

new document number
new lifecycle
new history

Future changes never affect the original document.

Delete

Only Draft documents may be deleted.

Deleting a Draft removes only that Draft.

Sent documents are never deleted.

Historical documents remain permanently available.

Clear

Clear affects only the current workspace.

Clear never changes:

saved Drafts
Sent documents
Event information
historical records
Close

Closing a document with unsaved changes displays the standard confirmation:

Save
Discard
Cancel

This behaviour is identical throughout Savveyra.

Document Numbering

Proposal numbering belongs to Proposal.

Quotation numbering belongs to Quotation.

Database identifiers remain independent.

User-facing numbers are configured through Settings.

Draft Prefix

Draft documents display a Draft prefix.

Example:

DP-00015

or

DQ-00008

The document remains editable.

Sent Prefix

After Send, only the prefix changes.

Example:

DP-00015

↓

P-00015

or

DQ-00008

↓

Q-00008

The numeric portion never changes.

Number Assignment

Numbers are assigned on the first successful Save.

Numbers are never reused.

Deleted Draft numbers remain retired.

Historical numbering remains continuous.

Document Independence

Every Proposal is independent.

Every Quotation is independent.

There is no parent document.

There are no revision numbers.

Every document owns:

its own number
its own lifecycle
its own history

Historical relationships exist only through references to their originating Event or Proposal.

Event Relationship

An Event may continue changing after a Proposal or Quotation has been created.

Typical changes include:

menus
guest quantities
scheduling
customer information
venue information

These changes affect only the current Event.

Existing documents remain unchanged.

Current Documents

The latest Draft always represents the current working document.

Sent documents represent historical communication.

Both forms of information are equally important.

Current Drafts support ongoing work.

Sent documents support historical reference.

Historical Preservation

Every Sent Proposal permanently preserves:

Event information
menu information
customer information
notes
operational content

Every Sent Quotation permanently preserves:

commercial wording
selling prices
customer information
Terms and Conditions
presentation information

Historical documents are never rebuilt from current master data.

They always display exactly what was saved.

Proposal Snapshot

A Proposal captures the saved operational state of the Event at the moment the Proposal is first saved.

The Proposal stores its own copy of:

Event information
Customer
Contact
Venue
Venue Contact
Event Date
Event Time
Format
selected Menus
guest quantities
Proposal notes

Future Event changes never modify an existing Proposal.

Quotation Snapshot

A Quotation captures the saved state of the Proposal from which it was created.

The Quotation stores its own copy of:

Proposal information
Customer
Contact
Venue
Venue Contact
Menu information
guest quantities
commercial wording
selling prices
Terms and Conditions

Future Proposal changes never modify an existing Quotation.

Customer Information

Customer information is copied from the Event into the Proposal.

When a Quotation is created, Customer information is copied from the Proposal into the Quotation.

Each document owns its own Customer snapshot.

Changing the Address Book never changes existing documents.

Contact Information

Contact information follows the same behaviour.

Each document stores its own Contact information.

Later Contact changes affect future work only.

Historical documents remain unchanged.

Venue Information

Venue information follows the same behaviour.

Each document stores its own Venue information.

Later Venue changes never modify existing documents.

Venue Contact

Venue Contact behaves identically.

Each document permanently stores the Venue Contact used when it was created.

Address Information

Address information follows the same snapshot behaviour.

Every saved document preserves:

Customer address
Venue address
telephone numbers
email addresses

Future Address Book edits affect only future documents.

Historical documents remain unchanged.

Kitchen Information

Kitchen owns:

menu composition
production information
costing
guest quantities
operational notes

Sales never edits Kitchen information.

If Kitchen information changes, Kitchen creates another Proposal.

Existing Proposals remain unchanged.

Existing Quotations remain unchanged.

Commercial Information

Sales owns:

selling prices
commercial wording
quotation notes
customer comments
payment information
Terms and Conditions

Kitchen never edits commercial information.

Selling Prices

Kitchen production costing and customer selling prices are intentionally independent.

Kitchen determines production cost.

Sales determines customer price.

Changing selling prices never changes:

Ingredient costs
Recipe costs
Dish costs
Menu costs
Event costs

Commercial pricing belongs entirely to the Quotation.

Guest Quantities

Guest quantities originate from the Event.

Proposal stores the guest quantities that existed when it was created.

Quotation stores the guest quantities received from the Proposal.

Historical documents always preserve those quantities.

Production Extras

Kitchen production Extras belong only to Kitchen.

Extras represent additional production required for operational reasons.

Examples include:

production buffer
damaged plates
unexpected guests
staff meals

Production Extras never become quotation quantities.

Sales prices actual guest quantities only.

Menus

Proposal stores the Menu information intended for Sales.

Quotation presents that Menu information to the customer.

Quotation may improve presentation.

Quotation never changes Kitchen Menu definitions.

Menu Descriptions

Kitchen owns Menu definitions.

Quotation may use customer-friendly wording when presenting those Menus.

Changing customer wording never changes the Menu itself.

Proposal Notes

Proposal Notes are operational communication from Kitchen to Sales.

Proposal Notes belong to Proposal.

Quotation may use that information while preparing customer communication.

Proposal Notes never change after the Proposal has been saved.

Customer Notes

Customer Notes belong entirely to Quotation.

Customer Notes are not operational planning.

Kitchen never edits Customer Notes.

Terms and Conditions

Terms and Conditions belong entirely to Quotation.

Default Terms and Conditions may be supplied from Settings.

Users may modify them for individual Quotations.

Changing Terms and Conditions never affects Proposal information.

Document Templates

Templates determine presentation only.

Templates never contain business rules.

Templates never calculate prices.

Templates never modify Proposal or Quotation information.

Multiple templates may present the same document differently while representing identical business information.

Company Branding

Company branding belongs to Settings.

Typical branding includes:

company name
logo
address
telephone
email
website

Branding is copied into each document when required.

Historical documents preserve the branding that existed when they were created.

Default Values

Settings may provide defaults for:

introductory wording
Terms and Conditions
default template
standard comments

Users may modify these values within individual Drafts.

Historical documents preserve the values that were saved.

Currency

Stored monetary values represent business information.

Currency formatting is presentation.

Changing currency presentation never changes stored prices.

Dates

Dates are stored independently from presentation.

Regional formatting belongs to the document template.

Historical documents preserve the stored dates regardless of future formatting changes.

Language

Future language support belongs to individual documents.

Changing application language never changes historical documents.

Each saved document preserves the language used when it was created.

PDF Generation

The final output of both Proposal and Quotation is a PDF.

PDF generation always uses the saved document.

PDF generation never reads directly from the editing workspace.

Every generated PDF must always be reproducible from its saved document.

Generating a PDF

PDF generation follows one consistent workflow.

Save

↓

Generate PDF

↓

Open PDF

↓

Print or Export

The generated PDF always represents the current saved document.

Unsaved Changes

If unsaved changes exist when generating a PDF, the user is prompted to:

Save
Discard
Cancel

A PDF is never generated from unsaved information.

This guarantees that every PDF can always be reproduced later.

Printing

Printing is performed from the user's PDF viewer.

Savveyra generates the PDF.

Savveyra does not print directly.

Export

Export creates another copy of the saved PDF.

Export never:

changes the document
creates another document
changes document status
modifies historical records

Export is a presentation function only.

Customer Document

Customer-facing documents include only customer information.

Typical information includes:

Customer
Contact
Venue
Event
Menus
Guest Quantities
Selling Prices
Customer Notes
Terms and Conditions

Customer documents never display:

Kitchen costs
production costs
Recipes
Ingredients
internal notes
database identifiers
Proposal Layout

Proposal is an internal Kitchen-to-Sales document.

Typical sections include:

Header
Event Summary
Customer Information
Menu Summary
Operational Notes
Totals

The visual layout may change without changing operational behaviour.

Quotation Layout

Quotation is a customer-facing document.

Typical sections include:

Header
Customer Information
Event Summary
Menu Presentation
Commercial Totals
Customer Notes
Terms and Conditions

The visual layout may change without changing operational behaviour.

Header Information

The document header provides immediate context.

Typical information includes:

Document Number
Document Status
Document Date
Event Name
Customer
Venue

The user should always know which document is open.

Menu Presentation

Quotation presents Menu information to the customer.

Presentation may include:

improved wording
grouped menu sections
simplified descriptions

Presentation changes never modify Kitchen Menu definitions.

Commercial Totals

Quotation displays customer-facing totals.

Commercial totals belong entirely to Sales.

Kitchen production costing remains independent.

Action Buttons

Typical actions include:

Save
Save & New
Duplicate
Send
Generate PDF
Export PDF
Close

The same operational behaviour should be used throughout Savveyra.

Current Status

The current document status should always be visible.

Possible statuses are:

Unsaved
Draft
Sent

The current state should never be ambiguous.

Refresh

Refreshing the page reloads the current saved Draft.

Unsaved changes are discarded unless first saved.

This behaviour matches every other editable domain.

Proposal Updates

Creating another Proposal never modifies existing Proposals.

Sales may continue working from any existing Proposal.

Kitchen simply creates another Proposal whenever updated operational information needs to be communicated.

Multiple Proposals

An Event may contain multiple Proposals.

Example:

Event

↓

DP-00015

↓

P-00015

↓

DP-00016

↓

P-00016

↓

DP-00017

Each Proposal is a separate document.

Each preserves its own history.

Multiple Quotations

A Proposal may produce multiple Quotations.

Examples include:

Standard
Premium
Economy

Each Quotation is completely independent.

Each has its own document number.

Each has its own Draft and Sent lifecycle.

Proposal Selection

When creating a new Quotation, the newest Sent Proposal is selected by default.

The user may choose any Sent Proposal.

Older Proposals remain valid.

Creating a Quotation never changes the selected Proposal.

Historical Documents

Historical documents are always available for:

viewing
printing
exporting
comparison
auditing

Historical documents are never edited.

Traceability

Savveyra must always be able to answer:

Which Event produced this Proposal?
Which Proposal produced this Quotation?
What exactly was sent?
When was it sent?

These answers come from saved historical documents.

Operational Independence

Kitchen continues planning independently.

Sales continues customer communication independently.

Neither department blocks the other.

Coordination occurs only through creating and sending Proposal documents.

Customer Communication

Sales owns all customer communication.

Typical activities include:

presenting the Quotation
discussing pricing
explaining menu options
negotiating commercial terms
answering customer questions

Kitchen participates only when operational clarification is required.

Operational Change Requests

Customers frequently request operational changes.

Examples include:

guest quantity changes
Menu changes
additional items
removed items
Event date changes
Venue changes

These requests belong to operational planning.

Sales communicates the requested changes to Kitchen through normal business processes.

The request itself does not change the Event.

Kitchen Response

Kitchen evaluates every requested operational change.

Kitchen determines:

operational feasibility
production impact
costing impact
scheduling impact

Kitchen may:

accept the request
partially accept the request
reject the request

Operational decisions belong entirely to Kitchen.

Updating the Event

When Kitchen accepts a change, the Event is updated.

Typical updates include:

Menu changes
guest quantity changes
scheduling changes
Customer changes
Contact changes
Venue changes

Saving the Event updates the current operational truth.

Previously saved Proposals remain unchanged.

Previously saved Quotations remain unchanged.

Creating Another Proposal

When Kitchen wishes to communicate updated operational information, another Proposal is created.

The new Proposal becomes an independent Draft.

The previous Proposal remains unchanged.

Kitchen decides when operational information is ready to send.

Sales After Receiving Another Proposal

Receiving another Proposal never changes Sales work automatically.

Sales may:

continue using the current Quotation
create a new Quotation
compare Proposals
prepare alternative Quotations
send another Quotation

These are commercial decisions owned entirely by Sales.

Parallel Operation

Kitchen and Sales intentionally work independently.

Example:

Kitchen

Proposal A
      │
      ├────► Sales prepares Quotation
      │
continues planning
      │
Proposal B
      │
      └────► Sales decides whether to use it

Neither department blocks the other.

Customer Acceptance

Customer acceptance belongs entirely to Sales.

Acceptance records the customer's commercial decision.

Acceptance does not:

lock the Event
stop Kitchen planning
prevent another Proposal
prevent another Quotation

Kitchen continues following the Event lifecycle.

Administrative Changes

Administrative changes may occur after a document has been sent.

Examples include:

corrected spelling
corrected telephone number
corrected email address
updated company branding

These changes are made by creating another Draft document.

Previously Sent documents remain unchanged.

Event Completion

Kitchen completes operational work according to the Event lifecycle.

Sales completes commercial work according to the Quotation lifecycle.

These lifecycles remain independent.

Current Operational Truth

The current Event always represents today's operational planning.

It continues changing until operational work is complete.

Historical Operational Truth

Every Sent Proposal permanently records:

what Kitchen communicated
when it was communicated
who received it

Every Sent Quotation permanently records:

what Sales communicated
when it was communicated
exactly what the customer received

Neither historical record is ever modified.

Current vs Historical Information

Current information supports:

planning
costing
scheduling
production

Historical information supports:

auditing
comparison
customer reference
legal reference

Both are equally important.

User Confidence

Users should always understand:

which document is open
whether it is Draft or Sent
whether changes have been saved
whether another Proposal exists
whether another Quotation exists

The current document state should never be uncertain.

Consistency

Proposal and Quotation follow the same operational behaviour as every other editable Savveyra domain.

Consistent behaviour includes:

Save
Duplicate
Delete
Close confirmation
Working State
Published history

Users should never learn different behaviour because they entered Proposal or Quotation.

Design Principles

Proposal and Quotation are designed around:

operational correctness
simplicity
visibility
predictability
historical accuracy
clear ownership

The user always controls significant business actions.

Savveyra never performs hidden commercial or operational decisions.

Explicit User Actions

The following actions always require user confirmation:

Save
Send
Duplicate
Delete Draft
Generate PDF
Export PDF

Savveyra never performs these actions automatically.

Maintainability

Business rules should remain centralized.

Operational behaviour should remain separate from presentation.

Templates control presentation only.

Settings provide defaults only.

Business ownership never overlaps.

Single Source of Truth

Every piece of information has one owner.

Examples:

Event owns operational planning.

Proposal owns Kitchen communication.

Quotation owns customer communication.

Settings own default values.

Address Book owns reusable Customer, Contact and Venue records.

Templates own presentation.

Ownership never transfers because another document uses the information.

Operational Boundary

Savveyra's responsibility ends when the customer document has been successfully produced.

Activities beyond this point belong to other systems.

Examples include:

CRM
invoicing
accounting
payment collection
marketing
customer follow-up

These systems may integrate with Savveyra but remain outside the Proposal and Quotation domains.

Operational Summary

The operational workflow is:

Create Event

↓

Save Event

↓

Create Proposal

↓

Save Proposal

↓

Send Proposal

↓

Create Quotation

↓

Save Quotation

↓

Send Quotation

↓

Generate PDF

↓

Print or Export

Proposal communicates Kitchen's operational solution.

Quotation communicates Sales' commercial offer.

Kitchen and Sales remain operationally independent while sharing the same Event.