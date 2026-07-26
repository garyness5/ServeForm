# Proposal & Quotation Operational Specification

## Purpose

This document defines the complete operational behaviour of the Proposal and Quotation domains within Savveyra.

It specifies ownership, workflow, business rules and responsibilities between Kitchen and Sales.

This document defines operational behaviour only.

Database implementation, Appsmith implementation and PDF implementation are documented elsewhere.

---

# Scope

This specification covers:

- Proposal
- Proposal Revisions
- Proposal publication
- Proposal ownership
- Quotation
- Quote Revisions
- Customer presentation
- PDF generation
- Sales workflow
- historical preservation

This specification does not cover:

- CRM
- accounting
- invoicing
- payment processing
- taxation
- email marketing
- customer relationship management
- sales forecasting
- opportunity management
- inventory
- production planning

These belong to separate systems.

---

# Domain Philosophy

Kitchen and Sales are intentionally independent.

Kitchen exists to determine **what will be produced**.

Quotation exists to determine **how that production is presented commercially**.

Neither subsystem should control the other.

Kitchen never edits commercial information.

Quotation never edits production information.

Both domains preserve their own history independently.

---

# Operational Boundary

Kitchen ends when a Proposal Revision is explicitly published.

Quotation begins when that Proposal Revision is received.

The only information transferred between the domains is the published Proposal Revision.

Nothing else crosses the boundary.

Kitchen does not read Quote data.

Quotation does not read Kitchen working data.

---

# Domain Ownership

## Kitchen owns

- Events
- Menus
- Dishes
- Recipes
- Ingredients
- guest quantities
- production quantities
- Extras
- Proposal Parents
- Proposal Revisions

Kitchen decides:

- menu composition
- production requirements
- operational notes
- Proposal revisions

---

## Quotation owns

- Quote Parents
- Quote Revisions
- selling prices
- customer wording
- commercial comments
- quotation notes
- terms and conditions
- PDF template selection
- quotation layout

Quotation decides only customer-facing information.

Quotation never changes Kitchen information.

---

# Proposal Philosophy

A Proposal is Kitchen's published recommendation for servicing an Event.

It represents exactly what Kitchen wishes Sales to offer the customer.

A Proposal is not a quotation.

It contains operational information prepared by Kitchen.

Once published, that Proposal Revision becomes immutable.

---

# Proposal Parent

A Proposal Parent represents the Proposal for an Event.

It owns the Proposal revision history.

The Proposal Parent remains constant throughout the Event.

New revisions are added beneath the same Proposal Parent.

---

# Proposal Revision

Each Proposal Revision represents one published version of Kitchen's proposal.

A Proposal Revision is an immutable snapshot.

Typical Proposal information includes:

- Event
- Customer
- Contact
- Venue
- Venue Contact
- Event Date
- Menus
- Guest quantities
- Kitchen notes intended for Sales

Once published, the Proposal Revision never changes.

If Kitchen changes anything, a new Proposal Revision is created.

Existing Proposal Revisions remain unchanged.

---

# Publishing

Kitchen explicitly publishes a Proposal Revision.

Publishing creates the boundary between Kitchen and Sales.

Nothing is transferred before publication.

Only published Proposal Revisions are available to Quotation.

Kitchen continues operating independently after publication.

---

# Proposal Independence

Kitchen may continue revising an Event after publishing a Proposal.

Those changes affect only future Proposal Revisions.

Existing Proposal Revisions remain unchanged.

Existing Quotes remain unchanged.

Kitchen never updates existing Quotes automatically.

---

# Quotation Philosophy

Quotation transforms a published Proposal into a professional customer quotation.

Quotation is not another Proposal.

Quotation is the customer-facing presentation of one Proposal Revision.

Quotation allows commercial adjustments while preserving complete historical integrity.

Everything within Quotation exists to produce an accurate customer quotation.

---

# Quote Parent

A Quote Parent represents one quotation.

It owns the Quote revision history.

Alternative quotations for the same Event each have their own Quote Parent.

Each Quote Parent remains independent.

---

# Quote Revision

A Quote Revision represents one version of a quotation.

Draft revisions may be edited.

Historical revisions become read-only.

Historical revisions are never overwritten.

Corrections are made by creating another revision.

Every Quote Revision permanently records the Proposal Revision from which it was created.

That relationship never changes.

---

# Customer Information

Customer information originates from the published Proposal Revision.

When a Quote is created, the Customer information becomes part of that Quote Revision.

Historical Quote Revisions preserve the Customer information that existed when the revision was created.

Later changes to the Address Book never modify historical Quote Revisions.

---

# Contact Information

Contact information follows the same rules.

The Quote stores the Contact information associated with that revision.

Changes to Contact master records affect future work only.

Historical Quote Revisions remain unchanged.

---

# Venue Information

Venue information is copied from the Proposal Revision into the Quote Revision.

Historical Quote Revisions preserve the Venue information used at that time.

Future changes to Venue records do not modify previously saved Quote Revisions.

---

# Selling Prices

Kitchen costing and customer selling prices are intentionally independent.

Kitchen calculates production cost.

Quotation determines customer selling price.

Changing selling prices never changes:

- Kitchen costs
- production costs
- Menu costing
- Recipe costing
- Ingredient costing

Commercial pricing belongs entirely to the Quote.

---

# Kitchen Extras

Kitchen Extras exist only for production.

Extras represent additional food prepared beyond the quoted guest quantity.

Extras are never:

- customer guests
- billable quantities
- quotation quantities

Quotation always prices guest quantities.

Production Extras remain a Kitchen-only concept.

---

# Customer Presentation

Quotation may improve customer presentation without affecting Kitchen.

Examples include:

- clearer menu wording
- simplified descriptions
- customer comments
- commercial notes
- Terms and Conditions
- layout changes

These changes belong exclusively to the Quote.

Kitchen data remains unchanged.

---

# Information That Cannot Change

Quotation must never modify:

- Proposal Revision
- Menu composition
- Dish composition
- Recipes
- Ingredients
- Kitchen notes
- production quantities
- Proposal history

If Kitchen changes any operational information, it must create another Proposal Revision.

Quotation decides whether to create another Quote Revision from that Proposal.

---

# Working Copy

A Quote is edited as a working copy.

Changes remain local until Save.

Unsaved edits never affect:

- Proposal
- historical Quote Revisions
- generated PDFs

The working copy exists only within the current editing session.

---

# Dirty State

A Quote becomes dirty whenever the working copy differs from the last saved revision.

Examples include:

- selling price changes
- wording edits
- comments
- Terms and Conditions
- template changes

Dirty state disappears immediately after Save.

---

# Saving

Save commits the current working copy.

If the Quote is still a Draft, Save updates that Draft.

If the current revision is already Final, Save creates a new Draft revision.

Historical revisions are never modified.

---

# Save & New

Save & New:

- saves the current Quote
- creates a new Quote from the current Proposal Revision
- opens the new Quote immediately

The previously saved Quote remains unchanged.

---

# Duplicate

Duplicate creates a completely new Quote Parent.

The duplicated Quote:

- begins as Draft
- receives its own Quote history
- becomes completely independent

Future revisions never affect the original Quote.

---

# Delete

Only Draft revisions may be deleted.

Historical Quote Revisions remain permanent.

If deleting the only Draft removes every revision beneath a Quote Parent, that Quote Parent may also be removed.

---

# Navigation

Leaving a dirty Quote displays the standard Savveyra confirmation:

- Save
- Discard
- Cancel

This behaviour is consistent throughout the application.

---

# Quote Numbering

Each Quote Parent owns one Quote Number.

Every revision beneath that Quote shares the same Quote Number.

Only the Revision Number changes.

Example:

Quote 00125 Revision 1

Quote 00125 Revision 2

Quote 00125 Revision 3

Revision numbers are never reused.

---

# Traceability

Every Quote Revision permanently stores:

- originating Proposal Parent
- originating Proposal Revision

This relationship is immutable.

Savveyra must always be able to answer:

- Which Proposal produced this Quote?
- Which revision did the customer receive?
- What exactly did that quotation contain?

These answers always come from saved Quote Revisions.

---

# Creating Quotes

A Quote is always created from one published Proposal Revision.

The Proposal Revision becomes the permanent source for that Quote Revision.

Creating a Quote copies the Proposal information required for customer presentation.

Once created, the Quote becomes independent of future Proposal changes.

---

# Multiple Quotes

An Event may have:

- no Quotes
- one Quote
- multiple Quotes

Multiple Quotes allow alternative commercial proposals for the same Event.

Examples include:

- Premium Package
- Economy Package
- Customer Revision
- Seasonal Promotion

Each Quote maintains its own independent revision history.

---

# New Proposal Revisions

Kitchen may publish another Proposal Revision at any time.

Existing Quotes are never updated automatically.

When a newer Proposal becomes available, Quotation simply informs the user.

The user decides whether to:

- continue using the current Quote
- create a new Quote
- create a new Quote Revision based on the newer Proposal

No automatic replacement occurs.

---

# Proposal Selection

When creating a new Quote, the newest Proposal Revision should be selected by default.

The user may intentionally select an earlier Proposal Revision.

Older Proposal Revisions remain valid sources for new Quotes.

Savveyra never assumes the newest Proposal is always the correct Proposal.

---

# Proposal and Quote Independence

Proposal Revisions and Quote Revisions maintain completely independent revision histories.

Creating a Proposal Revision never creates a Quote Revision.

Creating a Quote Revision never creates a Proposal Revision.

Kitchen and Sales remain operationally independent throughout the Event lifecycle.

---

# Historical Integrity

Historical information must always be reproducible.

Savveyra must preserve:

- the Proposal used
- the Quote produced
- the customer information
- the commercial pricing
- the wording
- the template used

Historical Quote Revisions must always reproduce exactly what the customer received.

Historical information is never reconstructed from current master data.

---

# PDF Generation

The final product of the Quotation domain is a PDF.

PDF generation always uses:

- one saved Quote Revision
- one selected PDF template

PDF generation never reads directly from Appsmith widgets.

The generated PDF always represents the saved Quote Revision.

---

# Unsaved Changes

If unsaved changes exist before generating a PDF, Savveyra requires the user to:

- Save
- Discard
- Cancel

A PDF must never be generated from unsaved data.

This guarantees that every generated quotation can be reproduced later.

---

# PDF Templates

Templates control presentation only.

Templates never contain business logic.

Templates never calculate pricing.

Templates never modify Quote data.

Multiple templates may present the same Quote differently while representing identical business information.

---

# Template Selection

Template selection belongs to the Quote Revision.

Changing the template changes only presentation.

The business information remains identical.

The selected template becomes part of the saved Quote Revision.

---

# Printing

Savveyra generates a PDF.

Printing occurs from the user's PDF viewer.

Savveyra does not print directly from Appsmith.

The normal workflow is:

Save Quote

↓

Generate PDF

↓

Open PDF

↓

Print or Export

---

# Export

Export produces the generated PDF.

Export never:

- modifies Quote history
- creates another Quote Revision
- changes Proposal information

Export simply produces another copy of the saved quotation.

---

# Customer Document

The customer receives only customer-facing information.

Examples include:

- Customer
- Contact
- Venue
- Event
- Menus
- Guest quantities
- Selling prices
- Customer comments
- Terms and Conditions

The customer never sees:

- Kitchen costing
- production costs
- Recipes
- Ingredients
- internal notes
- database identifiers
- revision history
- dirty state

---

# Quote Workflow

The normal operational workflow is:

Kitchen publishes Proposal

↓

Quotation receives Proposal

↓

Create Quote

↓

Review imported information

↓

Enter selling prices

↓

Adjust wording

↓

Add customer comments

↓

Review Terms & Conditions

↓

Save

↓

Generate PDF

↓

Print or Export

This is the complete operational workflow of the Quotation domain.

---

# User Interface Behaviour

The Quotation page is the final working page before producing a customer quotation.

It should encourage reviewing, refining and producing the finished document rather than feeling like a data-entry form.

The interface should remain consistent with every other Savveyra domain.

---

# Page Layout

A typical Quote page consists of:

- Header
- Proposal Summary
- Quote Details
- Menu Section
- Comments
- Terms & Conditions
- Totals
- Action Buttons

The exact visual layout may evolve without changing the operational behaviour.

---

# Header

The Header provides immediate context.

Typical information includes:

- Quote Number
- Revision Number
- Quote Date
- Customer
- Contact
- Venue
- Venue Contact
- Event
- Event Date

The user should immediately know which quotation is being edited.

---

# Proposal Summary

The Proposal Summary displays the information received from Kitchen.

Its purpose is reference only.

Editing a Quote never edits the Proposal Summary.

Proposal information remains visually distinguishable from Quote-owned information.

---

# Quote Details

Quote Details contain commercial information owned by the Quote.

Typical fields include:

- selling prices
- customer wording
- quotation comments
- quote date
- optional commercial information

Changes affect only the Quote Revision.

Kitchen information remains unchanged.

---

# Menu Section

The Menu section is the primary focus of the quotation.

It presents the menus exactly as the customer will receive them.

Quotation may improve wording or presentation.

Kitchen Menu definitions remain unchanged.

---

# Comments

Comments provide customer-specific information.

Examples include:

- special requests
- optional services
- delivery information
- presentation notes

Comments belong entirely to the Quote.

---

# Terms & Conditions

Terms & Conditions are customer-facing information.

They belong exclusively to the Quote.

Changing Terms & Conditions never changes Proposal data.

Default Terms & Conditions may be supplied from Settings.

---

# Totals

Totals shown within the Quote are commercial totals.

Kitchen production costing remains independent.

Quotation determines what the customer sees.

---

# Action Buttons

Typical Quote actions include:

- Save
- Save & New
- Duplicate
- Generate PDF
- Export PDF
- Close

Additional actions should only be introduced when genuine operational requirements arise.

---

# Revision Awareness

The current Quote Revision should always be visible.

The user should never need to search to determine:

- Quote Number
- Revision Number
- Draft or Final status

The current editing state should always be obvious.

---

# Proposal Awareness

The originating Proposal Revision should also be visible.

The user should always know which Proposal Revision is being quoted.

This provides immediate historical context.

---

# Historical Revisions

Historical Quote Revisions remain available for viewing.

Historical revisions are read-only.

Historical revisions may always be regenerated into PDFs.

Historical revisions are never edited.

---

# Draft Revisions

Draft revisions remain editable.

Draft status should be visually distinguishable from Final revisions.

Users should always understand whether they are editing a Draft or viewing history.

---

# Refresh Behaviour

Refreshing the page reloads the most recently saved Quote Revision.

Unsaved changes are discarded unless first saved.

This behaviour matches the remainder of Savveyra.

---

# Proposal Updates

If Kitchen publishes another Proposal Revision while a Quote is open, Quotation simply informs the user.

The current Quote continues unchanged.

The user decides whether another Quote Revision should be created later.

No interruption occurs.

---

# Accepted Quotations

Normally only one Quote represents the customer's accepted quotation for an Event.

Changing the accepted Quote never deletes previous Quotes.

Historical records remain available.

Acceptance records the customer's commercial decision.

It does not alter Proposal history.

---

# Consistency

Quotation should behave exactly like every other Savveyra page.

Examples include:

- Save behaviour
- Dirty-state handling
- Duplicate
- Revision philosophy
- Close confirmation

Users should never learn different behaviour simply because they entered the Quotation module.

---

# Design Principles

The Quotation page should always allow the user to understand:

- which Proposal is being quoted
- which Quote is open
- which Revision is being viewed
- whether changes have been saved
- whether the quotation is ready for PDF generation

There should never be uncertainty about the current state of the quotation.

---

# Settings Integration

Quotation may obtain default values from the Settings module.

Typical configurable defaults include:

- company name
- company logo
- quotation numbering
- default PDF template
- default Terms & Conditions
- default introductory wording

These values provide starting points only.

Once a Quote Revision is saved, the values used become part of that Quote Revision.

---

# Company Branding

Company branding belongs to Settings.

Typical branding includes:

- company name
- logo
- address
- telephone
- email
- website

Templates determine how branding is displayed.

Changing company branding affects future Quotes.

Historical Quote Revisions preserve the branding that was saved with that revision.

---

# Quote Numbering

Quote numbering is generated using the Settings configuration.

Each Quote Parent receives one permanent Quote Number.

Every revision beneath that Quote Parent shares the same Quote Number.

Only the Revision Number changes.

Quote numbers are never reused.

---

# Default Values

Settings may provide defaults for:

- Terms & Conditions
- introductory wording
- default template
- standard comments

Users may modify these values for individual Quotes.

Changes affect only the current Quote Revision.

---

# Language

The architecture supports future multi-language capability.

Language belongs to the Quote Revision.

Historical Quote Revisions preserve the language used when they were created.

Changing the application's default language does not modify historical Quotes.

---

# Currency

Monetary values stored within a Quote represent business data.

Currency formatting is presentation.

Templates determine how monetary values are displayed.

Changing presentation never changes stored selling prices.

---

# Date Formatting

Dates are stored independently of presentation.

Templates determine how dates appear to customers.

Regional formatting should remain a presentation concern.

---

# Future Attachments

Future versions may support customer-facing attachments.

Examples include:

- sample menus
- venue layouts
- photographs
- promotional material

Attachments are optional additions.

They do not change the operational behaviour of the Quote.

---

# Future Templates

Additional quotation templates may be introduced at any time.

New templates extend presentation only.

Existing Quote Revisions remain valid regardless of future templates.

Historical quotations continue to reproduce correctly.

---

# Future Expansion

Future enhancements should extend the existing architecture rather than replacing it.

Examples include:

- richer layouts
- additional branding
- optional customer sections
- localization
- multiple currencies

These enhancements should not require redesigning the Proposal or Quote architecture.

---

# Module Relationships

## Events

Events remain the operational centre of Savveyra.

Quotation supports Events through published Proposals.

Quotation never becomes an Event management module.

---

## Menus

Kitchen owns Menu definitions.

Quotation presents Menus to the customer.

Quotation never edits Menu composition.

---

## Recipes

Recipes belong entirely to Kitchen.

Recipe information never appears within the customer quotation.

---

## Ingredients

Ingredients belong entirely to Kitchen.

Ingredient information is never required by the Quotation domain.

---

## Groceries

Groceries is an operational purchasing module.

Quotation has no dependency on Groceries.

Changes within Groceries never affect existing Quotes.

---

## Inventory

Inventory, if implemented, remains independent.

Inventory affects production.

Quotation affects customer communication.

Neither owns the other's data.

---

# Architectural Independence

Each Savveyra module has one clear responsibility.

Kitchen prepares operational information.

Proposal publishes operational intent.

Quotation prepares customer communication.

Templates control presentation.

The PDF engine produces the finished customer document.

No module should assume responsibilities belonging to another.

---

# Design Principles

The Quotation domain is intentionally simple.

Whenever multiple implementations satisfy the same business requirement, the simpler implementation should be preferred.

Complexity should only be introduced when it provides genuine operational value.

---

# Explicit User Control

Commercial decisions always belong to the user.

Savveyra provides information, consistency and historical preservation.

Savveyra never makes commercial decisions automatically.

Examples include:

- selecting a Proposal Revision
- creating a Quote
- creating a Quote Revision
- generating a PDF
- selecting a template
- accepting a quotation

All significant business actions require explicit user action.

---

# Predictable Behaviour

The same user action should always produce the same result.

Generating a PDF from the same saved Quote Revision using the same template should always produce the same document.

Business behaviour should never depend upon hidden state.

---

# No Hidden Automation

Quotation avoids hidden automation.

Examples:

Kitchen publishes another Proposal Revision.

↓

Quotation notifies the user.

↓

The user decides what to do.

Savveyra never silently:

- replaces Proposal information
- updates existing Quotes
- creates Quote Revisions
- changes selling prices
- regenerates customer documents

---

# Historical Accuracy

Historical accuracy takes precedence over convenience.

Savveyra must always preserve the ability to reproduce:

- the originating Proposal
- the Quote Revision
- customer information
- commercial pricing
- wording
- selected template

Historical information must never silently change because master data later changed.

---

# Separation of Responsibilities

Every layer has one clear responsibility.

Kitchen:

- operational planning
- production
- Proposal creation

Quotation:

- customer presentation
- commercial pricing
- quotation history

Templates:

- presentation

PDF Engine:

- document generation

Settings:

- defaults

Address Book:

- master Customer
- Contact
- Venue records

Responsibilities should never overlap.

---

# Single Source of Truth

Every piece of information has one owner.

Examples:

Proposal information belongs to the Proposal Revision.

Commercial information belongs to the Quote Revision.

Customer master information belongs to the Address Book.

Presentation belongs to the PDF Template.

Defaults belong to Settings.

Information should never have competing owners.

---

# User Confidence

The interface should always allow the user to understand:

- which Proposal Revision is open
- which Quote Revision is open
- whether changes are saved
- whether the document is Draft or Final
- whether a newer Proposal exists
- when the quotation is ready for PDF generation

The user should never be uncertain about the state of their quotation.

---

# Maintainability

Business rules should remain centralized.

Operational behaviour should be documented once.

Presentation should remain separate from business logic.

Future development should extend the architecture rather than replace it.

---

# Operational Boundary

Savveyra's responsibility ends when the customer quotation has been successfully produced.

Activities beyond that belong to other systems.

Examples include:

- CRM
- email campaigns
- negotiations
- accounting
- invoicing
- payment collection
- customer follow-up
- revenue reporting

These systems may integrate with Savveyra but remain outside the Quotation domain.

---

# Final Operational Summary

The complete operational flow is:

Kitchen prepares the Event

↓

Kitchen creates Proposal Revisions

↓

Kitchen explicitly publishes a Proposal Revision

↓

Quotation receives the Proposal Revision

↓

User creates a Quote

↓

User enters commercial information

↓

User saves the Quote Revision

↓

Savveyra generates a PDF from the saved Quote Revision

↓

User prints or exports the finished quotation

This completes the operational responsibility of the Proposal and Quotation domains.

---

# Final Architectural Statement

Proposal and Quotation intentionally separate operational planning from customer communication.

Kitchen determines **what will be produced**.

Quotation determines **how it will be presented commercially**.

Proposal Revisions preserve Kitchen history.

Quote Revisions preserve Sales history.

Both histories remain independent while maintaining complete traceability between them.

This separation is fundamental to Savveyra and should remain unchanged unless future business requirements clearly demonstrate the need for a different operational model.

---

