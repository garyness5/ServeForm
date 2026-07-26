Savveyra Architecture
Purpose
This document defines the architectural model of Savveyra.
It explains:
•	how the application is organized 
•	domain ownership 
•	information flow 
•	publication 
•	propagation 
•	shared services 
•	system boundaries 
•	implementation principles 
This document describes architecture.
It does not describe implementation progress, SQL, Appsmith pages, or development status.
Those belong in implementation documentation.
________________________________________
Architectural Philosophy
Savveyra is built around a single principle:
Every business object has one owner.
Ownership determines:
•	who creates information 
•	who changes information 
•	who publishes information 
•	who consumes information 
Ownership is never shared.
Downstream domains consume published information but never become owners of that information.
This separation keeps business rules predictable and prevents conflicting implementations.
________________________________________
High-Level Architecture
Savveyra consists of four architectural layers.
Management
        ↓
Composition
        ↓
Shared Operational Domain
        ↓
Output
Each layer has one clearly defined responsibility.
Layers communicate only through published information.
________________________________________
Management Layer
The Management Layer stores reusable business reference information.
Current Management domains include:
•	Customers 
•	Contacts 
•	Venues 
•	Client Helper Lists 
•	Units 
•	System Lists 
These domains provide reference information for operational work.
They do not participate in composition.
They do not participate in costing.
They do not publish operational history.
________________________________________
Composition Layer
The Composition Layer creates operational work.
Current Composition domains are:
Ingredients
      ↓
Recipes
      ↓
Dishes
      ↓
Menus
Each level builds upon the published information of the previous level.
Each level becomes more operationally meaningful.
Composition always moves downward.
No downstream domain modifies upstream information.
________________________________________
Shared Operational Layer
The Shared Operational Layer consists of Events.
Events combine reusable operational information into real business work.
Events connect:
•	Customers 
•	Contacts 
•	Venues 
•	Menus 
•	scheduling 
•	guest planning 
•	operational administration 
Events represent actual operational commitments.
Propagation ends here.
________________________________________
Output Layer
Output domains consume published Event information.
Current Output domains include:
Events
   ├── Groceries
   └── Proposal
          ↓
      Quotation
Output domains never publish information upstream.
Output domains own their own historical records.
Output domains may refresh from Events when appropriate.
Output domains never alter Event history.
________________________________________
Domain Independence
Each domain should remain independently understandable.
Every domain owns:
•	business rules 
•	validation 
•	publication 
•	lifecycle 
•	numbering 
•	historical records 
•	user workflow 
Domains should communicate through published contracts rather than direct implementation knowledge.
A downstream domain should not require knowledge of how an upstream domain is internally implemented.
________________________________________
Published Contracts
Every domain publishes a defined contract.
A published contract contains only the information required by downstream consumers.
The contract intentionally hides internal implementation.
Typical published information includes:
•	identifiers 
•	names 
•	summaries 
•	calculated values 
•	operational status 
•	published costs 
•	published quantities 
Downstream domains depend upon published contracts rather than internal tables.
This separation allows implementation to evolve without changing downstream behaviour.
________________________________________
Information Flow
Information moves only in one direction.
Management
      ↓
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
Outputs
No downstream domain modifies upstream information.
Feedback between departments occurs through business workflow rather than automatic data propagation.
This keeps operational ownership clear.
________________________________________
Composition Architecture
Composition domains build increasingly complex operational objects.
Each layer consumes reusable published objects.
Example:
Ingredient

Tomatoes
Cheese
Basil

↓

Recipe

Tomato Sauce

↓

Dish

Lasagna

↓

Menu

Italian Buffet
Each level publishes a new operational object.
The lower-level objects remain independently reusable.
This compositional architecture minimizes duplication while preserving operational flexibility.
Domain Ownership
Every business object has one authoritative owner.
Ownership determines:
•	creation 
•	modification 
•	validation 
•	publication 
•	lifecycle 
•	historical responsibility 
Ownership never changes because another domain consumes that information.
Customer
Owns:
•	customer identity 
•	customer details 
•	customer status 
Does not own:
•	Events 
•	Quotations 
•	Proposals 
________________________________________
Contact
Owns:
•	people 
•	contact information 
Does not own:
•	Customers 
•	Venues 
Relationships are maintained through association tables.
________________________________________
Venue
Owns:
•	venue identity 
•	venue details 
Does not own:
•	Events 
•	Proposals 
•	Quotations 
________________________________________
Ingredient
Owns:
•	purchasing information 
•	purchase cost 
•	purchase unit 
•	wastage 
•	operational ingredient information 
________________________________________
Recipe
Owns:
•	recipe composition 
•	recipe yield 
•	recipe costing 
•	manually assigned diet tags 
Publishes reusable production outputs.
________________________________________
Dish
Owns:
•	dish composition 
•	dish costing 
Publishes reusable service items.
________________________________________
Menu
Owns:
•	menu composition 
•	menu costing 
Publishes reusable guest offerings.
________________________________________
Event
Owns:
•	operational planning 
•	event scheduling 
•	guest planning 
•	current operational assignments 
•	current operational state 
Events are the operational authority.
________________________________________
Proposal
Owns:
•	Kitchen publication snapshots 
Proposal never owns the Event.
Proposal records what Kitchen intentionally published.
________________________________________
Quotation
Owns:
•	commercial presentation 
•	selling prices 
•	revisions 
•	quotation numbering 
•	customer communication 
Quotation never owns Kitchen planning.
________________________________________
Published State
Every editable domain has two states.
Working State
The temporary editing workspace.
Working State:
•	may be incomplete 
•	may contain errors 
•	may be abandoned 
•	is never consumed downstream 
________________________________________
Published State
Published State represents operational truth.
Published State:
•	passed validation 
•	was successfully saved 
•	is available downstream 
•	replaces the previous Published State 
Downstream domains always consume Published State.
Never Working State.
________________________________________
Publication Pipeline
Publication follows one consistent model.
Working State

↓

Validation

↓

Save

↓

Published State

↓

Downstream Availability
No downstream propagation occurs before successful publication.
________________________________________
Propagation Architecture
Propagation exists only within the Composition chain.
Ingredients
      ↓
Recipes
      ↓
Dishes
      ↓
Menus
      ↓
Events
Propagation ends at Events.
Nothing propagates automatically beyond Events.
Output domains determine their own refresh behaviour.
________________________________________
Refresh Architecture
Output domains intentionally refresh rather than propagate.
Example:
Events

↓

Update All

↓

Groceries
or
Kitchen

↓

Publish Proposal

↓

Sales

↓

Create Quotation
Refresh is an intentional business action.
Automatic propagation beyond Events does not exist.
________________________________________
Snapshot Architecture
Some domains intentionally preserve historical truth.
Current snapshot domains include:
•	Proposal 
•	Quotation 
Snapshots are immutable.
Creating a new snapshot never modifies previous snapshots.
Historical records always preserve what existed when published.
Current operational truth and historical truth coexist.
Neither replaces the other.
________________________________________
Shared Services
Business behaviour used across multiple domains should exist once.
Typical Shared Services include:
•	duplicate detection 
•	rename 
•	replace 
•	delete 
•	numbering 
•	validation 
•	publication 
•	normalization 
•	impact counting 
•	snapshot creation 
•	status handling 
Shared Services reduce duplicated business logic and improve consistency.
Domain-specific behaviour should exist only where operational differences genuinely require it.
Validation Architecture
Validation protects operational correctness.
Validation exists in three layers.
User Interface
        ↓
Business Validation
        ↓
Database Integrity
Each layer has a different responsibility.
________________________________________
User Interface Validation
The user interface provides immediate feedback.
Typical examples include:
•	required fields 
•	invalid formats 
•	obvious omissions 
•	user guidance 
Interface validation improves usability.
It is not responsible for protecting business integrity.
________________________________________
Business Validation
Business validation protects operational rules.
Typical examples include:
•	duplicate prevention 
•	circular references 
•	ownership rules 
•	publication rules 
•	invalid composition 
•	incompatible units 
•	workflow restrictions 
Business validation belongs primarily in Supabase.
________________________________________
Database Integrity
Database integrity protects stored data.
Typical mechanisms include:
•	primary keys 
•	foreign keys 
•	constraints 
•	transactions 
•	indexes 
Database integrity should never become the primary implementation of business rules.
________________________________________
Save Architecture
Every editable domain follows the same Save model.
Load Published State

↓

User Editing

↓

Validation

↓

Save

↓

Publish

↓

Refresh Views
Save is the only action that changes Published State.
Closing a page without saving never changes Published State.
________________________________________
Workspace Architecture
Every editor operates as an isolated workspace.
A workspace may contain:
•	incomplete information 
•	temporary edits 
•	deleted rows awaiting confirmation 
•	unsaved calculations 
Until Save completes successfully, the workspace affects nothing outside itself.
Multiple users therefore continue working from stable Published State rather than partially completed edits.
________________________________________
View Architecture
Views form the presentation boundary between Supabase and Appsmith.
Views should expose information already prepared for display.
Typical view content includes:
•	names 
•	summaries 
•	calculated values 
•	counts 
•	warnings 
•	display labels 
•	operational indicators 
•	published status 
Views intentionally hide implementation details.
Appsmith should consume views rather than reconstruct business logic.
________________________________________
Function Architecture
Business actions should be implemented as business functions.
Examples include:
•	Save Recipe 
•	Save Menu 
•	Publish Proposal 
•	Refresh Groceries 
•	Create Quotation 
•	Rename Helper 
•	Replace Helper 
Business functions should represent complete business actions rather than individual SQL statements.
This improves consistency, reuse and transaction safety.
________________________________________
Transaction Architecture
Each business action should execute as one transaction whenever practical.
Typical transaction responsibilities include:
•	validation 
•	business rules 
•	updates 
•	propagation 
•	publication 
•	logging 
•	rollback on failure 
Partial business updates should never become Published State.
Either the business action succeeds completely or nothing changes.
________________________________________
Reuse Architecture
Whenever identical business behaviour exists, it should be implemented once.
Examples include:
•	duplicate detection 
•	rename 
•	replace 
•	delete 
•	numbering 
•	status changes 
•	publication 
•	normalization 
New domains should reuse existing architectural patterns rather than introducing new implementations without operational justification.
________________________________________
Numbering Architecture
User-facing numbering belongs to the owning domain.
Examples include:
•	Proposal Number 
•	Quotation Number 
Internal database identifiers remain independent of user-facing numbering.
Business numbering should support future configuration without affecting internal relationships.
Internal identifiers exist for data integrity.
User-facing numbers exist for business communication.
________________________________________
Status Architecture
Status belongs to the owning domain.
Status should describe the operational lifecycle of that domain.
Examples include:
Event Status
•	Draft 
•	Ordered 
•	Closed 
Quotation Status
•	Draft 
•	Issued 
•	Accepted 
•	Declined 
•	Withdrawn 
Proposal publication does not determine Event Status.
Quotation Status does not determine Event Status.
Each domain manages its own lifecycle independently.
CRUD Architecture
Every editable domain should present a consistent operational experience.
Standard business actions include:
•	Create 
•	Read 
•	Update 
•	Duplicate 
•	Rename 
•	Replace 
•	Delete 
•	Change Status 
Users should encounter the same behaviour across all domains wherever practical.
Operational differences should exist only where the business process genuinely requires them.
________________________________________
Lookup Architecture
Lookup objects provide reusable reference information.
Examples include:
•	Categories 
•	Suppliers 
•	Packaging 
•	Client Helper Lists 
•	Units 
Lookup objects should follow one consistent interaction model.
Preferred actions are:
•	+ — Create 
•	i — View / Edit 
The interface determines whether the object already exists and opens the appropriate workflow.
Users should not have to learn different lookup behaviour for different domains.
________________________________________
Component Architecture
Composition domains use a common component model.
Component rows represent published child objects rather than embedded copies.
Typical component information includes:
•	Item 
•	Item Type 
•	Quantity 
•	Unit 
•	Status 
•	Line Cost 
Component tables intentionally remain simple.
Complex business behaviour belongs to the owning domain rather than individual component rows.
________________________________________
Reference Architecture
References connect business objects.
References always point to Published objects.
Relationships should remain stable even as Published State changes.
Historical snapshots intentionally replace live references where historical accuracy is required.
Examples:
•	Recipe Components reference Ingredients. 
•	Menu Components reference Recipes or Dishes. 
•	Events reference Menus. 
•	Proposal stores snapshots. 
•	Quotation references Proposal snapshots. 
________________________________________
Historical Architecture
Savveyra preserves both current and historical operational truth.
Current operational truth supports planning.
Historical operational truth supports:
•	customer communication 
•	auditing 
•	comparison 
•	legal reference 
•	operational history 
Historical information should never be rewritten to match current information.
Historical records describe what actually existed at that point in time.
________________________________________
Kitchen–Sales Boundary
Kitchen and Sales are architecturally independent.
Kitchen owns:
•	production planning 
•	costing 
•	menus 
•	events 
•	Proposal publication 
Sales owns:
•	quotations 
•	selling prices 
•	revisions 
•	customer communication 
Proposal is the only architectural connection.
Kitchen never depends upon Sales.
Sales never depends upon unpublished Kitchen work.
Communication outside Proposal occurs through normal business processes rather than automatic system integration.
________________________________________
Refresh Boundaries
Not every downstream change occurs automatically.
The architecture intentionally distinguishes between:
Propagation
Automatic movement of Published information through the Composition chain.
and
Refresh
Intentional rebuilding of downstream operational information.
Examples include:
•	Update All (Groceries) 
•	Publish Proposal 
•	Create Proposal Revision 
•	Create Quotation 
Refresh is always an explicit business action.
________________________________________
Extensibility
Future domains should fit the existing architecture.
New domains should:
•	define one owner 
•	publish one downstream contract 
•	reuse Shared Services 
•	follow the Save model 
•	follow the Published State model 
•	define clear lifecycle ownership 
Architecture should become more consistent as the product grows.
New functionality should strengthen existing architectural patterns rather than introduce competing ones.
________________________________________
Architectural Principles
Every architectural decision should strengthen:
•	clear ownership 
•	operational correctness 
•	predictable behaviour 
•	normalization 
•	reuse 
•	maintainability 
•	stable published contracts 
•	historical accuracy 
•	simple user workflows 
Implementation details may change over time.
These architectural principles should remain stable.
________________________________________
Architectural Objective
Savveyra is designed as a connected operational planning platform.
Its architecture deliberately separates:
•	ownership 
•	publication 
•	propagation 
•	refresh 
•	historical preservation 
•	commercial workflow 
This separation allows each domain to evolve independently while remaining part of one coherent operational workflow.
The architecture exists to support real operational practice rather than technical convenience.

