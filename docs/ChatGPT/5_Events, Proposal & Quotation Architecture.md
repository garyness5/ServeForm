Events, Proposal & Quotation Architecture
Purpose
This document defines the architectural relationship between Events, Proposal and Quotation.
It describes:
•	ownership 
•	responsibilities 
•	information flow 
•	publication 
•	snapshots 
•	refresh boundaries 
•	historical preservation 
•	Kitchen–Sales separation 
This document defines architecture.
It does not describe detailed operational workflows or user interface behaviour.
Those belong in the Proposal & Quotation Operational Specification.
________________________________________
Architectural Overview
Events, Proposal and Quotation represent the transition from operational planning to customer communication.
They deliberately separate operational ownership from commercial ownership.
Composition
      ↓
Events
   ├── Groceries
   └── Proposal
          ↓
      Quotation
Events conclude operational planning.
Proposal publishes Kitchen's operational work.
Quotation converts that published work into commercial communication.
Each domain remains independently owned.
________________________________________
Architectural Principles
The architecture is built upon the following principles:
•	one owner per business object 
•	one published operational truth 
•	immutable historical snapshots 
•	independent Kitchen and Sales workflows 
•	clear publication boundaries 
•	no hidden synchronization 
•	predictable user actions 
These principles take precedence over implementation convenience.
________________________________________
Event Architecture
Events form the operational authority.
Events own the current operational state of work.
Events combine:
•	Customer 
•	Customer Contact 
•	Venue 
•	Venue Contact 
•	operational scheduling 
•	Menus 
•	guest planning 
•	Event administration 
Events consume published Menu information.
Events publish operational information to downstream domains.
Propagation ends at Events.
________________________________________
Event Responsibilities
Events own:
•	current operational planning 
•	Menu assignments 
•	guest counts 
•	Event scheduling 
•	Event Status 
•	operational administration 
Events do not own:
•	Proposal history 
•	Proposal revisions 
•	Quotation history 
•	commercial pricing 
•	customer negotiations 
Events remain the operational source of truth throughout their lifecycle.
________________________________________
Event as Shared Domain
Events intentionally belong to neither Kitchen nor Sales.
They belong to the business.
Kitchen users may manage Events.
Sales users may manage Events where permissions allow.
Administrative users may manage Events.
The Event remains one shared operational object.
No department owns the Event itself.
________________________________________
Operational Boundary
Propagation through operational planning follows:
Ingredients
      ↓
Recipes
      ↓
Dishes
      ↓
Menus
      ↓
Events
Propagation intentionally stops at Events.
Beyond Events, downstream information is created only through explicit business actions.
This prevents unexpected downstream changes.
________________________________________
Kitchen Responsibilities
Kitchen owns operational planning.
Kitchen owns:
•	Ingredients 
•	Recipes 
•	Dishes 
•	Menus 
•	Event operational planning 
•	Proposal publication 
Kitchen determines:
•	production 
•	operational costing 
•	guest production requirements 
•	operational content 
Kitchen does not own customer quotations.
Kitchen does not own customer negotiations.
Kitchen's responsibility ends when it publishes a Proposal.
________________________________________
Sales Responsibilities
Sales owns commercial communication.
Sales owns:
•	Quotations 
•	customer pricing 
•	commercial wording 
•	quotation revisions 
•	quotation numbering 
•	customer negotiation 
Sales consumes Proposal snapshots.
Sales never edits Kitchen operational information.
Kitchen never edits Sales commercial information.
Both departments operate independently after Proposal publication.
________________________________________
Proposal Architecture
Proposal forms the architectural boundary between Kitchen and Sales.
Proposal is not merely a report.
Proposal is a published business object.
Proposal captures the operational information Kitchen intentionally communicates to Sales.
Proposal exists independently of the Event after publication.
Proposal never becomes the Event.
Proposal never replaces the Event.
Proposal preserves the Event at a particular Published State.
Proposal Ownership
Proposal belongs entirely to Kitchen.
Kitchen is solely responsible for:
•	creating Proposals 
•	publishing Proposals 
•	Proposal revisions 
•	Proposal content 
•	Proposal lifecycle 
Proposal does not belong to Sales.
Proposal is the completed operational solution that Kitchen has chosen to publish.
________________________________________
Proposal Purpose
Proposal communicates operational intent.
Its purpose is to communicate to Sales:
•	what Kitchen intends to produce 
•	what is included 
•	operational pricing information 
•	production assumptions 
•	guest information 
•	Event context 
Proposal intentionally excludes Sales decisions such as:
•	selling price 
•	discounts 
•	negotiation 
•	commercial wording 
•	customer acceptance 
Those belong to Quotation.
________________________________________
Proposal Publication
Proposal publication is an explicit business action.
Publication creates a new immutable Proposal snapshot.
Publication does not:
•	change the Event 
•	lock the Event 
•	prevent Kitchen editing 
•	create a Quotation 
•	change Quotation Status 
•	notify Sales automatically 
Publication simply creates a new operational snapshot that Sales may choose to use.
________________________________________
Proposal Snapshot Architecture
Every Proposal represents one Published State of one Event.
A Proposal contains the operational information that existed at publication time.
Later changes to:
•	Ingredients 
•	Recipes 
•	Dishes 
•	Menus 
•	Event information 
never modify an existing Proposal.
Instead, Kitchen publishes another Proposal when appropriate.
Each Proposal therefore represents a complete historical operational snapshot.
________________________________________
Proposal History
Proposal history is permanent.
Previous Proposals remain available for:
•	comparison 
•	auditing 
•	operational reference 
•	customer history 
•	internal review 
No Proposal is ever rewritten.
Historical accuracy takes priority over convenience.
________________________________________
Kitchen Workflow After Publication
Publishing a Proposal does not end Kitchen planning.
Kitchen may continue to:
•	edit the Event 
•	modify Menus 
•	adjust Recipes 
•	update guest counts 
•	revise production planning 
These changes affect only the current Published Event after Save.
Previously published Proposals remain unchanged.
When Kitchen wishes to communicate updated operational information, it publishes another Proposal.
________________________________________
Quotation Architecture
Quotation belongs entirely to Sales.
Quotation consumes one Proposal snapshot.
Quotation does not consume the live Event.
Quotation does not consume live Menus.
Quotation does not consume live Kitchen planning.
Quotation is therefore insulated from ongoing operational changes.
________________________________________
Quotation Purpose
Quotation converts operational information into commercial communication.
Quotation owns:
•	selling prices 
•	commercial presentation 
•	customer-facing wording 
•	commercial notes 
•	revision history 
•	quotation numbering 
Kitchen never owns these responsibilities.
________________________________________
Proposal → Quotation Relationship
The relationship is intentionally one-way.
Event
      ↓
Proposal 1
      ↓
Quotation A

Proposal 2
      ↓
Quotation B
One Proposal may produce:
•	no Quotations 
•	one Quotation 
•	multiple Quotations 
Each Quotation is always based upon exactly one Proposal snapshot.
Quotation history therefore reflects exactly what Sales chose to communicate.
________________________________________
Kitchen–Sales Independence
Kitchen and Sales intentionally operate independently.
Kitchen does not know:
•	whether a Proposal became a Quotation 
•	quotation numbering 
•	quotation revisions 
•	customer negotiations 
•	quotation acceptance 
Sales does not know:
•	unpublished Kitchen edits 
•	Kitchen working state 
•	unsaved operational changes 
The only shared business object is the published Proposal.
This separation prevents accidental coupling between operational planning and commercial communication.
Quotation Independence
Once created, a Quotation becomes an independent Sales document.
Subsequent Kitchen activity does not affect existing Quotations.
Examples include changes to:
•	Ingredients 
•	Recipes 
•	Dishes 
•	Menus 
•	Event details 
•	Guest Counts 
•	Proposal revisions 
None of these automatically update an existing Quotation.
Sales decides whether to continue using the current Proposal or create a new Quotation from a newer Proposal.
________________________________________
Historical Preservation
The architecture intentionally preserves both current and historical operational truth.
Current operational truth exists within the Event.
Historical operational truth exists within:
•	Proposal snapshots 
•	Quotation revisions 
This allows the system to answer questions such as:
•	What was Kitchen planning at that time? 
•	Which Proposal did Sales receive? 
•	Which Proposal produced this Quotation? 
•	What changed between Proposal revisions? 
•	What did the customer actually receive? 
Historical records are never rewritten.
________________________________________
Customer, Contact and Venue Architecture
Customer, Contact and Venue information belongs to the Event while it is being planned.
When a Proposal is published, the current Event assignments become part of the Proposal snapshot.
When a Quotation is created, Sales receives those assignments as the starting commercial context.
After creation, the Quotation owns its own Customer, Contact and Venue assignments.
Sales may change them without affecting the Event.
Likewise, Kitchen may change the Event assignments without affecting existing Proposals or Quotations.
This separation allows operational planning and commercial communication to evolve independently while preserving historical accuracy.
________________________________________
Event Evolution
Events continue to evolve throughout operational planning.
Typical changes include:
•	guest counts 
•	menu changes 
•	production adjustments 
•	scheduling changes 
•	Customer changes 
•	Contact changes 
•	Venue changes 
These changes affect only the current Published Event.
Existing Proposal and Quotation history remains unchanged.
When Kitchen wishes Sales to work from updated operational information, Kitchen publishes a new Proposal.
________________________________________
Commercial Evolution
Sales continues commercial work independently.
Typical commercial changes include:
•	pricing revisions 
•	discounts 
•	commercial notes 
•	customer negotiations 
•	revised presentation 
•	quotation revisions 
These changes belong exclusively to Quotation.
Kitchen planning is unaffected.
________________________________________
Information Boundaries
Each domain exposes only the information required downstream.
Event publishes to Proposal
•	operational planning 
•	Event context 
•	Menu information 
•	production information 
•	operational costing 
•	guest planning 
________________________________________
Proposal publishes to Quotation
•	published operational snapshot 
•	Event context 
•	operational pricing basis 
•	production summaries 
________________________________________
Quotation publishes nothing upstream
Quotation is the final business document in this workflow.
No commercial information propagates back into operational planning.
________________________________________
Architectural Independence
The architecture intentionally avoids hidden dependencies.
Kitchen may continue planning indefinitely.
Sales may continue negotiating indefinitely.
Neither workflow blocks the other.
Coordination occurs only through the publication of a new Proposal and the deliberate decision by Sales to use that Proposal.
This allows each department to operate at its own pace while maintaining a clear and auditable history.
________________________________________
Architectural Benefits
Separating Events, Proposal and Quotation provides:
•	clear ownership 
•	predictable information flow 
•	historical traceability 
•	independent Kitchen and Sales workflows 
•	immutable operational snapshots 
•	controlled commercial revisions 
•	reduced business coupling 
•	simpler implementation 
•	easier future expansion 
The architecture favors explicit business actions over hidden synchronization.
Users always understand which information is current, which information is historical, and who owns each stage of the workflow.
________________________________________
Architectural Summary
The Event remains the operational source of truth.
Proposal represents Kitchen's published operational truth at a specific point in time.
Quotation represents Sales' commercial communication based on one Proposal.
These three domains intentionally remain independent while forming one connected operational workflow.
The architecture preserves both operational flexibility and historical accuracy without coupling Kitchen planning to Sales activity.

