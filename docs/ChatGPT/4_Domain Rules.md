Savveyra Domain Rules
Purpose
This document defines the operational rules governing every business domain within Savveyra.
It defines:
•	domain ownership 
•	lifecycle rules 
•	publication rules 
•	propagation rules 
•	status behaviour 
•	deletion behaviour 
•	inactive behaviour 
•	downstream behaviour 
This document defines business behaviour.
It does not describe implementation, SQL, Appsmith pages, or development status.
Those belong in implementation documentation.
________________________________________
Domain Philosophy
Every domain exists for one operational purpose.
Each domain owns:
•	one business object 
•	one lifecycle 
•	one published contract 
•	one downstream responsibility 
Domains should never duplicate ownership.
Each business rule should have one authoritative implementation.
________________________________________
Domain Hierarchy
Current domains are:
Management

• Customers
• Contacts
• Venues
• Client Helper Lists
• Units

↓

Composition

• Ingredients
• Recipes
• Dishes
• Menus

↓

Shared Operational

• Events

↓

Output

• Groceries
• Proposal
• Quotation
Each layer consumes only Published information from upstream.
________________________________________
General Domain Rules
Every editable domain follows the same operational model.
Each domain has:
•	Working State 
•	Published State 
Only Published State is available downstream.
Unsaved edits remain local.
Publication occurs only after a successful Save.
________________________________________
Save Rule
Save performs the complete business action.
Save should:
•	validate 
•	calculate 
•	publish 
•	update downstream published information where appropriate 
•	replace the previous Published State 
Closing without saving changes nothing outside the editor.
________________________________________
Status Rule
Every domain owns its own Status.
Status belongs only to the owning domain.
Status should describe the operational lifecycle of that domain.
One domain's Status never controls another domain's Status unless explicitly defined.
________________________________________
Active / Inactive Rule
Where supported, Active determines operational availability.
Inactive means:
•	the object still exists 
•	historical references remain valid 
•	downstream references remain intact 
•	the object is unavailable for new selection 
Inactive is not Delete.
Inactive objects remain recoverable.
________________________________________
Delete Rule
Delete removes the object from future operational use.
Delete never rewrites history.
Historical records remain unchanged.
Current downstream behaviour depends upon the consuming domain.
Deletion should always preserve operational visibility.
Users should be able to identify that an object was deleted rather than silently losing information.
________________________________________
Rename Rule
Rename changes the display name only.
Rename never creates a new object.
Rename preserves:
•	identity 
•	relationships 
•	historical references 
•	downstream references 
Only the display value changes.
________________________________________
Replace Rule
Replace transfers operational usage from one object to another.
Replace preserves downstream usability while removing future dependence upon the original object.
Replace should occur as one business transaction.
Partial replacement should never occur.
________________________________________
Duplicate Rule
Duplicate creates a new independent object.
The duplicated object receives:
•	a new identifier 
•	its own lifecycle 
•	its own future history 
Duplicate never shares ownership with the original object.
Future changes remain independent.
Name Rule
Names identify business objects for users.
Internal identifiers identify business objects for the system.
Names should be unique within their domain after normalization.
Normalization should ignore differences such as:
•	case 
•	leading and trailing spaces 
•	repeated spaces 
•	supported accent variations 
Changing only capitalization or spelling variations of the same object is permitted.
Renaming one object to collide with another normalized name is not permitted.
________________________________________
Ownership Rule
Every business object has exactly one owner.
Only the owning domain may change:
•	business information 
•	lifecycle 
•	status 
•	publication 
•	business rules 
Downstream domains consume published information.
They never become owners of that information.
________________________________________
Publication Rule
Publication makes information available outside the owning domain.
Only Published State may be consumed downstream.
Publication occurs only after:
•	validation succeeds 
•	Save succeeds 
•	business rules complete successfully 
Publication replaces the previous Published State.
________________________________________
Working State Rule
Working State belongs only to the current editing session.
Working State may contain:
•	incomplete information 
•	invalid information 
•	temporary calculations 
•	unsaved edits 
Working State never affects downstream domains.
Closing without saving discards Working State.
________________________________________
Current State Rule
Published State always represents current operational truth.
Current operational truth continues to change as users save new information.
Downstream composition domains automatically consume current Published information according to propagation rules.
________________________________________
Historical Rule
Historical records intentionally preserve previous operational truth.
Historical records never update themselves to match current information.
Examples include:
•	Proposal revisions 
•	Quotation revisions 
Historical records exist for comparison, auditing and customer reference.
________________________________________
Propagation Rule
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
Propagation occurs only after successful publication.
Propagation never extends beyond Events.
________________________________________
Refresh Rule
Output domains intentionally refresh rather than propagate.
Examples include:
•	Update All (Groceries) 
•	Publish Proposal 
•	Create Proposal Revision 
•	Create Quotation 
Refresh is always initiated by a deliberate business action.
This protects users from unexpected downstream changes.
________________________________________
Snapshot Rule
Snapshot domains preserve the Published State that existed when the snapshot was created.
Snapshots are immutable.
A later Save never modifies an existing snapshot.
New information always produces a new snapshot rather than changing historical records.
________________________________________
Validation Rule
Business validation protects operational correctness.
Validation should prevent:
•	duplicate objects 
•	invalid ownership 
•	circular composition 
•	incompatible units 
•	invalid publication 
•	structurally invalid relationships 
Warnings should be preferred where incomplete information is operationally acceptable.
Blocking validation should be reserved for situations that would produce impossible or invalid business data.
________________________________________
Visibility Rule
The system should favour visibility over hidden behaviour.
Users should always be able to understand:
•	what exists 
•	what changed 
•	what is missing 
•	what is inactive 
•	what has been deleted 
•	what requires attention 
The system should expose operational problems rather than silently correcting them.
Management Domain Rules
Customer
Customer represents the organization or person receiving the service.
Required:
•	Name 
Optional:
•	all other information 
A Customer may exist without:
•	Contacts 
•	Events 
•	Quotations 
Customers remain reusable across the application.
Deleting a Customer never rewrites historical records.
If a Customer is inactive, it remains visible historically but is unavailable for new selection.
________________________________________
Contact
A Contact represents a real person.
Required:
•	Name 
A Contact may be associated with:
•	zero Customers 
•	one Customer 
•	many Customers 
•	zero Venues 
•	one Venue 
•	many Venues 
A Contact is not owned by a Customer or Venue.
Relationships are independent.
If a Contact is selected while no Customer exists, the application may create a matching Customer when appropriate.
The same operational behaviour applies to Venues.
________________________________________
Venue
A Venue represents the physical location of an Event.
Required:
•	Name 
Venues remain reusable.
A Venue may exist before being used by an Event.
Deleting a Venue never changes historical Event information.
Inactive Venues remain unavailable for future selection while preserving historical references.
________________________________________
Helper List Rules
Client Helper Lists provide reusable client-owned lookup values.
Typical examples include:
•	Ingredient Categories 
•	Packaging 
•	Suppliers 
•	Client Diet Tags 
System-owned helper data remains protected from client modification.
Client-owned helper data supports:
•	Add 
•	Rename 
•	Replace (where appropriate) 
•	Delete 
Replace should preserve downstream usability.
Delete should remove future availability while applying the appropriate downstream business rule.
________________________________________
Unit Rules
Units are global system-owned data.
Clients do not create Units.
Each Unit belongs to one Unit Type.
Examples:
Weight
•	g 
•	kg 
•	oz 
•	lb 
Volume
•	ml 
•	L 
•	cup 
Count
•	each 
•	dozen 
•	portion 
•	person 
Conversions are permitted only within the same Unit Type.
Cross-type conversions are not permitted.
________________________________________
Ingredient Rules
Ingredients represent purchased products.
Required to create:
•	Name 
Operationally, ingredient maintenance typically also requires:
•	Category 
•	Purchase Quantity 
•	Purchase Unit 
•	Purchase Cost 
Ingredients publish:
•	purchasing information 
•	wastage 
•	cost per base unit 
•	operational information 
Ingredients remain reusable across every downstream composition domain.
________________________________________
Ingredient Status Rules
Inactive Ingredients:
•	remain historically valid 
•	remain in existing compositions 
•	cannot be selected for new compositions 
Deleted Ingredients:
•	remain visible where historically referenced 
•	are no longer operationally usable 
•	no longer contribute operational costing until replaced 
The consuming domain determines how deleted Ingredients appear to users.
Visibility is preferred over silent removal.
________________________________________
Ingredient Wastage Rules
Each Ingredient may define a default wastage percentage.
Component rows may choose to:
•	apply wastage 
•	ignore wastage 
This allows one Ingredient to support multiple operational use cases without creating duplicate Ingredient records.
The default behaviour is to apply wastage.
Users may intentionally override this for specific component rows.
________________________________________
Composition Rules
Composition domains build reusable operational objects.
Composition always consumes Published child objects.
Composition objects never embed independent copies of child objects.
Published child information remains authoritative until replaced by a later Published State.
Composition remains reusable throughout the operational chain.
Recipe Rules
Recipes transform Ingredients and Sub-Recipes into reusable production outputs.
Required to create:
•	Name 
Operationally, a completed Recipe normally includes:
•	Category 
•	Yield Quantity 
•	Yield Unit 
Recipes may contain:
•	Ingredients 
•	Sub-Recipes 
Recipes may not contain:
•	themselves 
•	indirect circular references 
Recipes publish:
•	Yield 
•	Cost per Unit 
•	Total Cost 
•	Allergen Summary 
•	Manually Assigned Diet Tags 
•	Operational Status 
Recipes remain reusable throughout the application.
________________________________________
Recipe Component Rules
Each component row represents one published child object.
Each row contains:
•	Item 
•	Item Type 
•	Quantity 
•	Unit 
•	Apply Wastage 
•	Status 
Rows may remain incomplete while editing.
Incomplete rows should normally warn rather than block Save unless they create an impossible operational state.
Duplicate components within the same Recipe are not permitted.
________________________________________
Recipe Yield Rules
Yield represents the usable production output.
Yield consists of:
•	Quantity 
•	Unit 
Yield Units must come from the global Unit list.
Cost per Unit is calculated from:
Total Recipe Cost

÷

Yield Quantity
Recipes without sufficient information to calculate Cost per Unit remain valid operational objects but cannot contribute downstream Line Cost until costing becomes available.
________________________________________
Recipe Cost Rules
Recipe Total Cost equals the sum of all valid component Line Costs.
Components without cost contribute:
•	no Line Cost 
•	no value to Total Cost 
The calculated Recipe Cost therefore represents the total of all currently costed components.
As upstream Published costs become available, Recipe costing updates automatically after publication.
________________________________________
Recipe Diet Tag Rules
Diet Tags assigned directly to the Recipe belong to the Recipe.
Contained Diet Tags inherited from child components are informational only.
Automatic promotion of Diet Tags is intentionally not performed.
Users determine whether the completed Recipe qualifies for a Diet Tag.
________________________________________
Recipe Allergen Rules
Recipe Allergens are automatically derived.
The published Allergen Summary contains the unique union of all child Allergens.
Users do not manually assign Allergens to Recipes.
________________________________________
Recipe Publication Rules
Only Published Recipes are available downstream.
Saving a Recipe publishes:
•	current composition 
•	current costing 
•	current yield 
•	current summaries 
Unsaved edits remain local to the editor.
________________________________________
Dish Rules
Dishes represent prepared food intended for service.
Required to create:
•	Name 
Dishes may contain:
•	Ingredients 
•	Recipes 
Dishes publish:
•	Total Cost 
•	Cost per Unit 
•	Allergen Summary 
•	Manually Assigned Diet Tags 
•	Operational Status 
Dishes remain reusable.
Their operational behaviour mirrors Recipes wherever practical.
________________________________________
Menu Rules
Menus represent reusable guest offerings.
Required to create:
•	Name 
Menus may contain:
•	Ingredients 
•	Recipes 
•	Dishes 
Menus do not own guest counts.
Guest planning belongs to Events.
Menus publish:
•	operational composition 
•	operational costing 
•	production summaries 
Menus remain reusable templates for multiple Events.
Event Rules
Events represent real operational work.
Events are the operational authority for planning.
Required to create:
•	Event Name 
All other information is optional.
Events may include:
•	Customer 
•	Customer Contact 
•	Venue 
•	Venue Contact 
•	Use Customer Address 
•	Event Date 
•	Event Time 
•	Format 
•	Menus 
•	Guest Counts 
•	Operational Notes 
Events remain valid even when partially completed.
Users determine how much information is required for their operation.
________________________________________
Event Ownership Rules
Events own:
•	current operational assignments 
•	guest planning 
•	menu selection 
•	operational scheduling 
•	Event Status 
Events do not own:
•	Proposal history 
•	Quotation history 
•	selling prices 
Events represent the current operational truth.
________________________________________
Event Menu Rules
Events consume published Menus.
Menus remain reusable.
Each Event may contain:
•	one Menu 
•	multiple Menus 
Guest Counts belong to each Menu assignment rather than the Menu itself.
Kitchen production may include production extras.
Guest Counts always represent actual guests rather than production quantities.
________________________________________
Event Status Rules
Event Status represents Kitchen operational progress.
Typical lifecycle includes:
•	Draft 
•	Ordered 
•	Closed 
Event Status belongs exclusively to the Event.
Proposal publication does not determine Event Status.
Quotation Status does not determine Event Status.
________________________________________
Event Propagation Rules
Events consume Published Menu information.
Published upstream changes propagate automatically through:
•	Ingredients 
•	Recipes 
•	Dishes 
•	Menus 
until reaching Events.
Propagation ends at Events.
No automatic propagation exists beyond this point.
________________________________________
Event Publication Rules
Saving an Event publishes:
•	current operational planning 
•	current Menu assignments 
•	current guest planning 
•	current Event information 
Published Events become available to downstream Output domains.
________________________________________
Groceries Rules
Groceries prepares purchasing requirements.
Groceries intentionally does not perform purchasing.
Groceries owns:
•	Event eligibility 
•	Event selection 
•	ingredient requirement preparation 
•	purchasing preparation 
•	grocery printing 
Inventory remains outside the application boundary.
________________________________________
Grocery Event Rules
Only Events meeting the required operational conditions appear in Groceries.
Current eligibility requires:
•	Event Active 
•	appropriate Event Status 
Eligible Events appear in the Event selection queue.
Selection alone does not generate grocery requirements.
________________________________________
Grocery Update Rules
Update All performs the operational refresh.
Update All:
•	checks selected Events 
•	refreshes Event information 
•	rebuilds ingredient requirements 
•	updates aggregated purchasing requirements 
•	applies current Published operational information 
Update All is the only mechanism that refreshes downstream Grocery information.
________________________________________
Grocery Manual Entry Rules
Users manually determine purchasing quantities.
Savveyra calculates:
•	required quantities 
Users determine:
•	quantity to purchase 
This intentionally separates operational planning from purchasing decisions.
Inventory is never assumed.
________________________________________
Grocery Print Rules
Print contains only information intentionally sent from Order.
Print remains independent after creation.
If upstream operational changes require rebuilding Order, Print may be cleared according to the defined rebuild rules.
Users intentionally decide when purchasing information is ready for printing.
Proposal Rules
Purpose
Proposal is the operational publication created by Kitchen.
Proposal communicates the operational solution that Kitchen is prepared to deliver.
Proposal is not a quotation.
Proposal contains no commercial ownership.
Proposal forms the architectural boundary between Kitchen and Sales.
________________________________________
Proposal Ownership
Proposal belongs entirely to Kitchen.
Kitchen owns:
•	publication 
•	Proposal revisions 
•	operational content 
•	production information 
Sales consumes Proposal snapshots.
Sales never modifies a Proposal.
________________________________________
Proposal Creation Rules
A Proposal is created from the current Published Event.
Proposal captures a snapshot of:
•	Event information 
•	Customer 
•	Contact 
•	Venue 
•	Venue Contact 
•	Menu selections 
•	Guest Counts 
•	production information 
•	costing information intended for Sales 
Proposal represents Kitchen's published operational recommendation at that moment.
________________________________________
Proposal Snapshot Rules
Every Proposal is immutable.
After publication:
•	Proposal content never changes 
•	Event edits never update existing Proposals 
•	Menu edits never update existing Proposals 
•	Recipe edits never update existing Proposals 
Kitchen publishes a new Proposal whenever operational changes need to be communicated.
________________________________________
Proposal Revision Rules
Multiple Proposal revisions may exist for one Event.
Each revision remains an independent historical record.
Older Proposals remain available for:
•	comparison 
•	auditing 
•	customer history 
•	operational reference 
Proposal revisions never overwrite previous revisions.
________________________________________
Proposal Publication Rules
Proposal publication is an intentional business action.
Publishing a Proposal does not:
•	change Event Status 
•	change Kitchen planning 
•	create a Quotation 
•	notify Sales automatically 
Publication simply makes a Proposal available for Sales.
________________________________________
Kitchen After Publication
Kitchen continues working independently after publishing.
Kitchen may:
•	edit the Event 
•	edit Menus 
•	edit Recipes 
•	publish another Proposal 
Kitchen never edits previously published Proposals.
Kitchen always works from current Published operational information.
________________________________________
Sales Rules
Sales operates independently from Kitchen.
Sales owns:
•	customer communication 
•	commercial presentation 
•	selling prices 
•	quotation revisions 
•	quotation numbering 
•	quotation history 
Sales does not own Kitchen planning.
Sales never edits Kitchen operational data.
________________________________________
Quotation Rules
Quotation is the commercial document produced by Sales.
Quotation is created from one Proposal snapshot.
Quotation owns:
•	commercial wording 
•	prices presented to customers 
•	discounts 
•	commercial notes 
•	quotation numbering 
•	quotation revisions 
Quotation is independent after creation.
________________________________________
Quotation Snapshot Rules
Quotation preserves the Proposal used to create it.
Kitchen changes never update existing Quotations.
If Sales wishes to use newer Kitchen planning, Sales creates a new Quotation from a newer Proposal.
Historical Quotations remain unchanged.
________________________________________
Quotation Status Rules
Quotation Status represents Sales workflow.
Typical lifecycle:
•	Draft 
•	Issued 
•	Accepted 
•	Declined 
•	Withdrawn 
Quotation Status belongs only to Quotation.
Quotation Status never changes Event Status.
________________________________________
Quotation Revision Rules
Administrative revisions may occur after issue.
Each revision preserves:
•	quotation number 
•	historical sequence 
Revision numbering distinguishes versions while preserving the original quotation identity.
Accepted Quotations remain Accepted after permitted administrative revisions unless business policy explicitly changes their commercial outcome.
________________________________________
Proposal–Quotation Relationship
One Proposal may produce:
•	zero Quotations 
•	one Quotation 
•	multiple Quotations 
Each Quotation references exactly one Proposal snapshot.
The relationship is intentionally one-way.
Kitchen does not track Sales activity through the Proposal.
Sales does not receive unpublished Kitchen information.
________________________________________
Operational Boundary Rule
Proposal is the only formal system boundary between Kitchen and Sales.
Everything before Proposal belongs to Kitchen.
Everything after Proposal belongs to Sales.
Business communication outside the system may request Kitchen changes, but those requests do not modify existing Proposal or Quotation history.
A new Proposal is required whenever Kitchen wishes to communicate updated operational information.

