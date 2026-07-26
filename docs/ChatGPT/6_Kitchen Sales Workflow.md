Kitchen ↔ Sales Workflow
Purpose
This document defines the operational workflow between Kitchen and Sales.
It describes how the two departments work together while remaining operationally independent.
It explains:
•	responsibilities 
•	workflow sequence 
•	Proposal publication 
•	Sales handoff 
•	change requests 
•	parallel operation 
•	operational communication 
This document describes business workflow.
It does not define architecture or detailed business rules.
Those are defined in:
•	Events, Proposal & Quotation Architecture 
•	Proposal & Quotation Operational Specification 
________________________________________
Workflow Philosophy
Kitchen and Sales perform different jobs.
Kitchen plans and produces food.
Sales communicates with customers.
The workflow intentionally separates these responsibilities.
Neither department should depend upon the internal work of the other.
Coordination occurs only through published Proposals and normal business communication.
________________________________________
Department Responsibilities
Kitchen
Kitchen is responsible for:
•	operational planning 
•	costing 
•	Recipes 
•	Dishes 
•	Menus 
•	Event planning 
•	production requirements 
•	Proposal publication 
Kitchen owns operational accuracy.
________________________________________
Sales
Sales is responsible for:
•	customer communication 
•	commercial pricing 
•	quotation preparation 
•	negotiation 
•	quotation revisions 
•	customer acceptance 
Sales owns commercial communication.
________________________________________
Shared Responsibility
Both departments share the same Event.
The Event represents the business activity.
Neither department owns the Event exclusively.
Depending on permissions, either department may update shared Event information such as:
•	Customer 
•	Contact 
•	Venue 
•	Event Date 
•	operational notes 
Operational ownership and commercial ownership remain separate even when both departments work on the same Event.
________________________________________
High-Level Workflow
The normal workflow is:
Kitchen Planning

↓

Save Event

↓

Publish Proposal

↓

Sales Reviews Proposal

↓

Create Quotation

↓

Customer Discussion

↓

Customer Decision
Kitchen and Sales continue working independently after Proposal publication.
________________________________________
Kitchen Workflow
Kitchen begins by creating or updating an Event.
Kitchen determines:
•	Menus 
•	guest counts 
•	production requirements 
•	costing 
•	operational planning 
Kitchen may continue refining the Event until satisfied that the operational information is ready for Sales.
At that point, Kitchen publishes a Proposal.
________________________________________
Proposal Publication
Publishing a Proposal communicates Kitchen's current operational solution.
Publishing does not mean:
•	production has begun 
•	the customer has approved 
•	Sales must use the Proposal immediately 
Publishing simply makes a Proposal available to Sales.
Kitchen may publish additional Proposals whenever operational changes need to be communicated.
________________________________________
Sales Workflow
Sales reviews available Proposals.
Sales chooses the Proposal that best represents the operational information required for customer communication.
Sales creates a Quotation from that Proposal.
Sales then performs all commercial work independently from Kitchen.
________________________________________
Customer Communication
Sales communicates directly with the customer.
Typical activities include:
•	presenting pricing 
•	discussing options 
•	negotiating 
•	answering commercial questions 
•	revising quotations 
Kitchen is not involved in routine commercial communication.
Operational questions may still be referred back to Kitchen when required.
________________________________________
Customer Requests Changes
Customer discussions frequently generate change requests.
Typical requests include:
•	different guest counts 
•	menu changes 
•	additional dishes 
•	removed items 
•	different Event dates 
•	venue changes 
These requests belong to operational planning.
Sales communicates the requested changes to Kitchen through normal business processes.
The request itself does not modify the Event.
Kitchen Receives Change Requests
Kitchen evaluates requested operational changes.
Kitchen determines:
•	operational feasibility 
•	production impact 
•	costing impact 
•	scheduling impact 
Kitchen may:
•	accept the requested changes 
•	partially accept them 
•	reject them 
The decision remains an operational decision.
Sales communicates with the customer.
Kitchen determines operational capability.
________________________________________
Updating the Event
If Kitchen accepts operational changes, Kitchen updates the Event.
Typical updates include:
•	Menu changes 
•	guest count changes 
•	Recipe adjustments 
•	scheduling changes 
•	Customer changes 
•	Contact changes 
•	Venue changes 
Saving the Event updates the current Published operational truth.
Existing Proposals remain unchanged.
Existing Quotations remain unchanged.
________________________________________
Publishing a Revised Proposal
When updated operational information should be communicated to Sales, Kitchen publishes another Proposal.
The revised Proposal becomes a new historical snapshot.
Previous Proposals remain available.
Kitchen does not replace or edit earlier Proposals.
Sales decides whether the revised Proposal should become the basis for future customer communication.
________________________________________
Sales After a Revised Proposal
Receiving a revised Proposal does not automatically change Sales' work.
Sales may decide to:
•	continue using the current Quotation 
•	create a revised Quotation 
•	prepare an alternative Quotation 
•	withdraw an earlier Quotation 
•	discuss the revised Proposal with the customer 
These are commercial decisions owned by Sales.
________________________________________
Parallel Operation
Kitchen and Sales intentionally work in parallel.
Example:
Kitchen

Proposal 1
        │
        ├────► Sales prepares Quotation
        │
continues planning
        │
Proposal 2
        │
        └────► Sales decides whether to use it
Neither department blocks the other.
The only formal synchronization point is Proposal publication.
________________________________________
Event Progress
The Event continues to evolve independently of customer communication.
Operational changes may continue until production requires them to stop.
Typical ongoing changes include:
•	production refinements 
•	Menu substitutions 
•	Recipe improvements 
•	scheduling adjustments 
•	staffing considerations 
Kitchen continues working from the current Published Event.
Sales continues working from the selected Proposal.
________________________________________
Customer Acceptance
Customer acceptance belongs entirely to Sales.
Acceptance means the customer has agreed to the commercial proposal presented by Sales.
Acceptance does not:
•	lock the Event 
•	prevent Kitchen planning 
•	prevent future Proposal publication 
•	automatically begin production 
Operational workflow continues according to the Event lifecycle.
________________________________________
Administrative Changes After Acceptance
Administrative changes may still occur after customer acceptance.
Examples include:
•	corrected customer details 
•	revised contact information 
•	spelling corrections 
•	quotation formatting improvements 
Commercial revisions follow Quotation rules.
Operational revisions follow Event and Proposal rules.
Each department remains responsible for its own information.
________________________________________
Event Completion
Kitchen completes operational work according to the Event lifecycle.
Sales completes commercial work according to the Quotation lifecycle.
These lifecycles remain independent.
For example:
•	a customer may accept a Quotation before Kitchen production begins 
•	Kitchen may complete production while Sales is still finalizing administrative paperwork 
The workflow intentionally avoids forcing one department's progress to determine the other's.
________________________________________
Communication Principles
Communication between Kitchen and Sales should always be explicit.
Operational changes are communicated by publishing a new Proposal.
Commercial decisions are communicated through normal business processes.
The system intentionally avoids hidden synchronization or automatic assumptions about departmental intent.
Each department always knows which version of the operational plan it is working from.
Operational Independence
The workflow deliberately allows Kitchen and Sales to operate independently.
Kitchen focuses on operational delivery.
Sales focuses on customer communication.
Neither department waits for the other unless new operational information must be exchanged.
This independence improves:
•	responsiveness 
•	accountability 
•	operational flexibility 
•	historical traceability 
________________________________________
Event as the Shared Workspace
The Event remains the shared operational workspace throughout its lifecycle.
Kitchen and Sales may both contribute information according to permissions.
Examples include:
Kitchen:
•	Menu planning 
•	guest planning 
•	production planning 
•	operational notes 
Sales:
•	Customer 
•	Contact 
•	Venue 
•	scheduling coordination 
•	customer-facing notes where appropriate 
The Event always represents the current operational truth.
Proposal and Quotation represent historical publications derived from that truth.
________________________________________
Current Truth vs Historical Truth
The workflow intentionally distinguishes between two equally important concepts.
Current Operational Truth
Represented by the current Published Event.
This information continues to evolve as planning progresses.
________________________________________
Historical Operational Truth
Represented by:
•	Proposal snapshots 
•	Quotation revisions 
Historical records preserve exactly what existed at the moment they were created.
Neither replaces the other.
________________________________________
Multiple Proposal Workflow
An Event may generate multiple Proposals during its lifecycle.
Example:
Event

↓

Proposal 1

↓

Proposal 2

↓

Proposal 3
Each Proposal captures a different Published State of the Event.
Older Proposals remain available for comparison and reference.
Kitchen never edits an existing Proposal.
________________________________________
Multiple Quotation Workflow
Sales may create multiple Quotations during customer negotiations.
Example:
Proposal 2

├── Quotation A
├── Quotation B
└── Quotation C
Each Quotation represents a separate commercial communication.
Sales determines which Quotation best supports customer discussions.
Kitchen remains unaware of these commercial decisions unless communication occurs outside the system.
________________________________________
Proposal Selection
Publishing a new Proposal does not invalidate previous Proposals.
Sales chooses which Proposal to use.
This allows Sales to:
•	continue existing negotiations 
•	compare operational revisions 
•	prepare alternative commercial options 
•	delay adopting operational changes until appropriate 
Proposal publication provides additional operational information rather than forcing commercial action.
________________________________________
Operational Decision Points
Kitchen decisions include:
•	production feasibility 
•	costing 
•	Menu composition 
•	Recipe composition 
•	operational scheduling 
•	Event readiness 
Sales decisions include:
•	customer pricing 
•	commercial presentation 
•	quotation timing 
•	quotation revisions 
•	negotiation strategy 
Each department owns its own decision-making process.
________________________________________
Communication Principles
Communication between departments should always be intentional.
Typical communication includes:
•	Kitchen publishes a new Proposal. 
•	Sales requests operational changes. 
•	Kitchen confirms operational feasibility. 
•	Sales informs the customer. 
•	Kitchen publishes revised operational information if required. 
The workflow intentionally avoids hidden assumptions.
Users should always know:
•	who initiated the change 
•	why it occurred 
•	which Proposal is being used 
•	which Quotation is current 
________________________________________
Workflow Objectives
The Kitchen ↔ Sales workflow is designed to:
•	maintain clear departmental ownership 
•	preserve historical accuracy 
•	support parallel work 
•	avoid accidental data coupling 
•	simplify customer communication 
•	simplify operational planning 
•	provide an auditable business history 
Operational planning and commercial communication remain connected through deliberate publication rather than continuous synchronization.
________________________________________
Workflow Summary
Kitchen owns operational planning.
Sales owns commercial communication.
The Event remains the current operational truth.
Proposal communicates Kitchen's published operational solution.
Quotation communicates Sales' commercial offer.
The workflow intentionally separates operational planning from commercial activity while allowing both departments to work together efficiently through clearly defined business actions and historical snapshots.

