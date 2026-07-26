Savveyra Canonical Specifications
Purpose
This document defines the product truth of Savveyra.
It answers:
•	What is Savveyra? 
•	What problems does it solve? 
•	Who is it designed for? 
•	What domains exist? 
•	How do those domains relate to one another? 
•	What operational workflow does the product support? 
•	What is intentionally outside the scope of the product? 
Canonical Specifications define the product itself.
They do not describe:
•	implementation 
•	SQL 
•	Supabase 
•	Appsmith 
•	user interface 
•	development progress 
Those belong in implementation documentation.
If implementation differs from these specifications, implementation should eventually be corrected.
Canonical Specifications define what Savveyra is intended to be.
________________________________________
Product Summary
Savveyra is an operational planning platform for food-service businesses.
It combines:
•	operational planning 
•	food costing 
•	production planning 
•	purchasing preparation 
•	Kitchen Proposal creation 
•	customer quotation preparation 
into one connected operational workflow.
Its primary purpose is to help operators understand the operational consequences of planning decisions before production begins.
Savveyra answers practical operational questions such as:
•	What does this cost? 
•	What must be produced? 
•	What ingredients are required? 
•	What must be purchased? 
•	What information is missing? 
•	What changed? 
•	Which Proposal was sent to Sales? 
•	Which Quotation was created from that Proposal? 
•	What is the current operational truth? 
Costing is an important capability.
Operational planning remains the primary purpose of the system.
The connected operational workflow is the product.
________________________________________
Core Value Proposition
Savveyra connects every stage of food-service planning into one operational chain.
Ingredients
      ↓
Recipes
      ↓
Dishes
      ↓
Menus
      ↓
Events
   ├── Groceries
   └── Proposal
          ↓
      Quotation
Each domain adds operational meaning.
Each domain consumes the published information of the previous domain.
The result is one continuously connected operational workflow.
________________________________________
Target Users
Savveyra is designed primarily for food-service operators requiring practical operational planning without enterprise software complexity.
Typical businesses include:
•	Caterers 
•	Banquet Departments 
•	Hotels 
•	Country Clubs 
•	Conference Centres 
•	Private Chefs 
•	Commissary Kitchens 
•	Boutique Food Manufacturers 
•	Corporate Catering Operations 
•	Meal Preparation Businesses 
Typical users include:
•	Executive Chefs 
•	Banquet Chefs 
•	Sous Chefs 
•	Kitchen Managers 
•	Catering Owners 
•	Production Managers 
•	Event Coordinators 
Large organizations may continue using existing:
•	ERP 
•	CRM 
•	Accounting 
•	Purchasing 
•	Sales systems 
while using Savveyra for operational planning.
Small operators may use Savveyra as their complete operational platform.
________________________________________
What Savveyra Is
Savveyra is:
•	a food costing system 
•	a recipe costing system 
•	a production planning system 
•	a menu planning system 
•	an Event planning system 
•	a grocery preparation system 
•	a purchasing preparation system 
•	a Kitchen Proposal system 
•	a customer Quotation system 
•	a connected operational planning platform 
Savveyra helps users understand operational consequences before production begins.
The application provides operational truth.
Users make business decisions.
________________________________________
What Savveyra Is Not
Savveyra is intentionally not:
•	Inventory Management 
•	Accounting Software 
•	ERP 
•	CRM 
•	Payroll 
•	Warehouse Management 
•	Supplier Ordering 
•	Purchase Order Management 
•	Production Scheduling 
•	Human Resources 
•	Point of Sale 
Inventory intentionally remains outside the product boundary.
Savveyra determines operational requirements.
Users decide:
•	what inventory already exists 
•	what should be purchased 
•	how much should be purchased 
•	which supplier should be used 
•	when purchasing should occur 
This separation keeps Savveyra focused on operational planning.
________________________________________
Product Philosophy
Savveyra is designed around operational truth.
The application accurately represents the work required to perform an Event.
Users remain responsible for business decisions.
Savveyra informs.
Users decide.
Operational correctness always takes priority over technical convenience.
The preferred workflow is the simplest workflow that correctly supports real operational practice.
Complexity should exist only when it provides genuine operational value.
Every feature should directly contribute to one or more of:
•	planning 
•	costing 
•	production 
•	purchasing preparation 
•	customer communication 
•	operational visibility 
•	historical traceability
System Domains
Savveyra is organized into four architectural groups.
Management
      ↓
Composition
      ↓
Shared Operational Domain
      ↓
Output
Each group owns one clearly defined operational responsibility.
Each domain owns:
•	its own business rules 
•	its own validation 
•	its own lifecycle 
•	its own publication 
•	its own downstream contract 
Each domain publishes only the information required by downstream consumers.
________________________________________
Management Domains
Management Domains maintain reusable business reference information.
Current Management Domains include:
•	Customers 
•	Contacts 
•	Venues 
•	Client Helper Lists 
•	Units 
•	System Lists 
Customers, Contacts and Venues form one coordinated management domain.
Customers own reusable customer information.
Contacts own reusable people.
Venues own reusable venue information.
Relationships between them are maintained through association tables.
One Contact represents one real person.
A Contact may be associated with:
•	one Customer 
•	multiple Customers 
•	one Venue 
•	multiple Venues 
•	both Customers and Venues 
•	neither 
Only Name is required to create:
•	Customer 
•	Contact 
•	Venue 
Management Domains support operational planning.
They do not participate in:
•	costing 
•	composition 
•	propagation 
________________________________________
Composition Domains
Composition Domains create operational work.
Current Composition Domains are:
Ingredients
      ↓
Recipes
      ↓
Dishes
      ↓
Menus
      ↓
Events
Each Composition Domain consumes published information from upstream domains.
Each Composition Domain publishes richer operational information downstream.
Composition Domains create the operational planning chain.
________________________________________
Ingredients
Ingredients are the operational foundation of Savveyra.
Everything begins with Ingredients.
Everything ultimately returns to Ingredients.
Ingredients represent purchased products.
Ingredients publish:
•	purchasing information 
•	costing 
•	purchase units 
•	wastage 
•	operational information 
used throughout the operational chain.
________________________________________
Recipes
Recipes transform purchased Ingredients into reusable production outputs.
Recipes may contain:
•	Ingredients 
•	Recipes (Sub-Recipes) 
Recipes publish:
•	yield 
•	cost per unit 
•	allergens 
•	manually assigned diet tags 
•	production summaries 
Recipes remain reusable production building blocks.
Recipes may never directly or indirectly contain themselves.
________________________________________
Dishes
Dishes represent prepared food intended for service.
Dishes may contain:
•	Ingredients 
•	Recipes 
Dishes publish:
•	costing 
•	production summaries 
•	operational information 
Dishes remain reusable.
________________________________________
Menus
Menus represent guest offerings.
Menus may contain:
•	Ingredients 
•	Recipes 
•	Dishes 
Menus publish:
•	guest offering 
•	operational costing 
•	production summaries 
Guest counts do not belong to Menus.
Menus remain reusable templates.
________________________________________
Shared Operational Domain
Events form the Shared Operational Domain.
Events belong to the business.
They are not owned by Kitchen.
They are not owned by Sales.
Kitchen, Sales or Administration may create and maintain Events according to permissions.
Only Event Name is required to begin an Event.
Events combine:
•	Customer 
•	Customer Contact 
•	Venue 
•	Venue Contact 
•	Use Customer Address 
•	scheduling 
•	menus 
•	guest planning 
•	operational administration 
Events become the operational source of truth for downstream operational workflows.
Propagation ends at Events.
________________________________________
Output Domains
Output Domains consume published Event information.
Current Output Domains include:
Events
   ├── Groceries
   └── Proposal
          ↓
      Quotation
Output Domains:
•	never publish upstream 
•	own their own refresh behaviour 
•	own their own historical records 
•	remain operationally independent 
Proposal forms the operational boundary between Kitchen and Sales.
Quotation consumes Proposal snapshots rather than live Kitchen information.
Events
Events represent operational work.
Events consume Menus.
Events combine:
•	Customer assignment 
•	Customer Contact assignment 
•	Venue assignment 
•	Venue Contact assignment 
•	Use Customer Address 
•	scheduling 
•	guest planning 
•	operational administration 
•	production planning 
Events publish:
•	operational planning 
•	Proposal snapshots 
•	Groceries information 
Events are the final planning domain.
Propagation ends at Events.
Events remain the operational source of truth until operational work is complete.
________________________________________
Groceries
Groceries converts Event production requirements into purchasing preparation.
Groceries intentionally separates:
•	Event eligibility 
•	Event selection 
•	ingredient requirements 
•	purchasing preparation 
•	printing 
Groceries assists purchasing.
Groceries intentionally excludes:
•	inventory 
•	purchasing 
•	supplier ordering 
Users remain responsible for purchasing decisions.
________________________________________
Proposal
Proposal belongs to Kitchen.
Proposal represents a published snapshot of Kitchen planning.
Proposal is the operational boundary between Kitchen and Sales.
Proposal contains the operational information Kitchen intends Sales to use.
Proposal is not a commercial quotation.
Proposal is not owned by Sales.
Kitchen may publish multiple Proposal revisions during the life of an Event.
Each Proposal remains an independent historical snapshot.
________________________________________
Quotation
Quotation belongs entirely to Sales.
Quotation consumes Proposal snapshots rather than live Kitchen information.
Quotation owns:
•	customer communication 
•	selling prices 
•	commercial wording 
•	commercial notes 
•	quotation numbering 
•	quotation revisions 
•	quotation history 
•	customer presentation 
Quotation is intentionally not:
•	CRM 
•	Sales pipeline 
•	Accounting 
•	Tax engine 
•	Invoicing 
•	Payment tracking 
Small operators may use Quotation directly.
Larger organizations may incorporate Quotation into their existing commercial workflow.
Kitchen does not know:
•	Quotation status 
•	quotation revisions 
•	quotation numbering 
•	customer negotiations 
Sales does not see unpublished Kitchen work.
________________________________________
Operational Workflow
Savveyra follows one connected operational workflow.
Ingredients
      ↓
Recipes
      ↓
Dishes
      ↓
Menus
      ↓
Events
   ├── Groceries
   └── Proposal
          ↓
      Quotation
Kitchen planning and Sales communication intentionally remain separate.
Kitchen owns operational planning.
Sales owns commercial communication.
Proposal forms the operational boundary between the two.
Kitchen may continue planning after publishing a Proposal.
Sales continues working from the selected Proposal until it explicitly chooses another Proposal.
________________________________________
Information Flow
Information flows in one direction.
Upstream domains publish information.
Downstream domains consume published information.
Propagation occurs only through the Composition chain.
Propagation ends at Events.
Proposal publishes immutable snapshots.
Quotation consumes Proposal snapshots rather than live Kitchen planning.
Output domains determine their own refresh behaviour.
Savveyra intentionally distinguishes between:
•	Current Operational Truth 
•	Historical Operational Truth 
Both are equally important.
Current Operational Truth supports planning.
Historical Operational Truth supports:
•	customer communication 
•	auditing 
•	comparison 
•	legal reference 
•	operational history 
________________________________________
Product Boundaries
Included:
•	Food Costing 
•	Recipe Costing 
•	Production Planning 
•	Menu Planning 
•	Event Planning 
•	Grocery Preparation 
•	Purchasing Preparation 
•	Kitchen Proposal Publishing 
•	Customer Quotations 
•	Operational Reporting 
•	Shared Business Reference Management 
Excluded:
•	Inventory Management 
•	Purchase Orders 
•	Accounting 
•	ERP 
•	CRM 
•	Payroll 
•	Warehouse Management 
•	Supplier Ordering 
•	Production Scheduling 
•	Human Resources 
•	Point of Sale 
Savveyra intentionally remains focused on operational planning.
________________________________________
Product Principles
Every feature should improve one or more of:
•	operational planning 
•	costing accuracy 
•	production visibility 
•	purchasing preparation 
•	customer communication 
•	historical accuracy 
•	operational consistency 
Features should not exist merely because they are technically possible.
Every feature should provide genuine operational value.
________________________________________
User Experience Principles
Savveyra is designed for busy operators.
The application should require the minimum practical amount of data entry.
Users should always understand:
•	what they are editing 
•	what will change 
•	what will not change 
•	what requires saving 
•	what is current 
•	what is historical 
Warnings are generally preferred over unnecessary blocking.
Operational visibility is preferred over hidden automation.
The application should remain predictable.
Users should never be surprised by automatic behaviour.
Data Philosophy
Savveyra stores operational information rather than accounting information.
Current information always represents the latest Published State.
Historical information always represents the Published State that existed when the historical document was created.
Neither replaces the other.
Current information supports:
•	planning 
•	costing 
•	production 
•	purchasing preparation 
Historical information supports:
•	customer communication 
•	auditing 
•	comparison 
•	legal reference 
•	operational history 
Both forms of information are equally important.
________________________________________
Ownership Philosophy
Every piece of information has one owner.
Only the owning domain may change that information.
Downstream domains consume published information.
Ownership never transfers because downstream domains use that information.
Typical examples include:
Ingredients own:
•	purchasing information 
•	purchase costing 
•	wastage 
Recipes own:
•	composition 
•	yield 
•	costing 
•	manually assigned diet tags 
Menus own:
•	menu composition 
Events own:
•	operational planning 
•	scheduling 
•	guest planning 
Proposal owns:
•	Kitchen publication snapshots 
Quotation owns:
•	customer communication 
•	selling prices 
•	commercial presentation 
•	quotation history 
Clear ownership prevents conflicting business rules and duplicated logic.
________________________________________
Publication Philosophy
Publication creates the operational contract between domains.
Only Published information is available downstream.
Unsaved work remains local to the editing workspace.
Publication should occur only after a successful Save.
Published information forms the operational truth consumed by downstream domains.
________________________________________
Snapshot Philosophy
Some domains intentionally publish snapshots rather than live references.
Current snapshot domains include:
•	Proposal 
•	Quotation 
Snapshots preserve the Published State that existed at the moment they were created.
Later operational changes never modify existing snapshots.
Historical accuracy always takes priority over maintaining live links.
________________________________________
Product Growth
Future domains should adopt existing architectural patterns.
New functionality should reuse:
•	Shared Services 
•	Shared Validation 
•	Shared CRUD 
•	Shared Numbering 
•	Shared Publication 
•	Shared Status Handling 
•	Shared Lookup Services 
•	Shared Propagation 
Consistency should increase as Savveyra grows.
New functionality should extend existing architecture rather than replace it.
________________________________________
Success Criteria
Savveyra succeeds when users can confidently answer:
•	What does this cost? 
•	What must I produce? 
•	What ingredients are required? 
•	What must I purchase? 
•	Which Proposal was sent to Sales? 
•	Which Proposal produced this Quotation? 
•	What changed? 
•	What is the current operational truth? 
These answers should be available:
•	quickly 
•	accurately 
•	consistently 
without requiring users to reconstruct operational history themselves.
________________________________________
Product Vision
Savveyra is designed to become the most practical operational planning platform for food-service businesses.
Its objective is not to become the largest enterprise hospitality management system.
Its objective is to become the most practical operational planning platform for operators requiring:
•	accurate costing 
•	production planning 
•	purchasing preparation 
•	Event planning 
•	Proposal management 
•	customer Quotations 
without unnecessary enterprise complexity.
Every future enhancement should strengthen the connected operational workflow.
The connected operational workflow is the product.

