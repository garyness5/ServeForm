Savveyra Development Handoff
Purpose
This document allows development to continue immediately in a new ChatGPT conversation.
It contains only the current implementation state.
It is temporary.
Everything here should be assumed to be replaced by the next development handoff.
Permanent product knowledge belongs in the supporting documentation.
________________________________________
Current Project State
The project is currently in the normalization phase.
The objective is not to add new functionality.
The objective is to normalize the entire application so every domain follows the same architecture, ownership model and implementation standards before continuing feature development.
This normalization now begins with documentation.
The documentation rewritten during this chat establishes the new project foundation.
Future implementation should follow these documents rather than older discussions.
________________________________________
Documentation Status
The following documents have been completely rewritten during this chat.
Completed:
•	Development Standards 
•	Canonical Specifications 
•	Architecture 
•	Domain Rules 
•	Events, Proposal & Quotation Architecture 
•	Kitchen ↔ Sales Workflow 
These documents should now be considered the authoritative project documentation.
The remaining major document is:
•	Proposal & Quotation Operational Specification 
It should be rewritten next.
The previous version should not be patched.
It should be rewritten from the beginning using the architectural decisions established during this chat.
No Addendum document is required.
________________________________________
Most Important Architectural Decisions
The following decisions are now considered settled.
Do not redesign these without strong operational justification.
Published State
Every editable domain has:
•	Working State 
•	Published State 
Only Published State is available downstream.
Unsaved work never propagates.
Save publishes.
________________________________________
Propagation Boundary
Propagation exists only through:
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
________________________________________
Refresh Boundary
Output domains refresh intentionally.
Examples:
•	Update All (Groceries) 
•	Publish Proposal 
•	Create Quotation 
Refresh is always an explicit business action.
There is no automatic downstream synchronization beyond Events.
________________________________________
Proposal
Proposal is:
•	a business object 
•	a Kitchen publication 
•	an immutable snapshot 
Proposal is not:
•	a report 
•	a live Event 
•	owned by Sales 
Kitchen publishes Proposals.
Sales consumes Proposals.
________________________________________
Quotation
Quotation belongs entirely to Sales.
Quotation consumes Proposal snapshots.
Quotation never consumes live Kitchen planning.
Kitchen changes never update existing Quotations.
________________________________________
Kitchen / Sales Separation
Kitchen owns:
•	operational planning 
•	costing 
•	production 
Sales owns:
•	commercial communication 
•	customer pricing 
•	quotations 
Proposal is the only formal system boundary.
Kitchen and Sales intentionally operate independently.
Current Implementation State
This handoff assumes the existing Supabase/Appsmith application is available.
Development is continuing from the current implementation.
This is not a greenfield project.
The objective is to normalize and strengthen the existing application while preserving working functionality.
________________________________________
Current Development Phase
The project has moved beyond architecture exploration.
The overall architecture is now considered stable.
Current work should focus on implementing that architecture consistently across all domains.
Avoid introducing domain-specific exceptions unless there is clear operational justification.
________________________________________
Documentation Authority
When implementation questions arise, use the following precedence:
1.	Handoff (current development state) 
2.	Development Standards 
3.	Architecture 
4.	Domain Rules 
5.	Canonical Specifications 
6.	Domain-specific documents 
Older chats should not be treated as authoritative if they conflict with these documents.
________________________________________
Current Normalization Status
The project has completed normalization of its architectural documentation.
The following documents are now considered complete and authoritative:
•	Development Standards 
•	Canonical Specifications 
•	Architecture 
•	Domain Rules 
•	Events, Proposal & Quotation Architecture 
•	Kitchen ↔ Sales Workflow 
The remaining document to rewrite is:
•	Proposal & Quotation Operational Specification 
After that, implementation should continue using the rewritten documentation as the reference.
________________________________________
Architecture Status
The following architectural concepts are now considered settled.
Do not redesign unless a genuine operational problem is discovered.
Published State
Every editable domain has:
•	Working State 
•	Published State 
Users edit Working State.
Only Published State is visible downstream.
Save publishes.
Unsaved changes never propagate.
________________________________________
Ownership
Each domain owns its own data.
Domains publish information.
Downstream domains consume published information.
Downstream domains never edit upstream ownership.
________________________________________
Propagation
Automatic propagation exists only through the operational chain:
Ingredient
↓
Recipe
↓
Dish
↓
Menu
↓
Event
Propagation stops at Event.
Everything beyond Event refreshes only through explicit business actions.
________________________________________
Snapshot Philosophy
Snapshots are immutable.
Current live data remains editable.
Historical publications never change.
This applies to:
•	Proposal 
•	Quotation revisions 
•	future historical documents 
________________________________________
Current Technology Stack
Application:
•	Appsmith 
Database:
•	Supabase 
•	PostgreSQL 
Source Control:
•	Git 
•	GitHub 
The application already contains substantial production logic.
Normalizing existing code is preferred over rewriting working functionality.
________________________________________
Database Contracts
The following contracts must be preserved unless there is strong justification.
View Contracts
Treat vw_ views as interface contracts.
Prefer adding new columns to the end.
If structure must change:
•	Drop and recreate the view. 
•	Do not casually reorder existing columns. 
Many Appsmith pages depend on the existing column order.
________________________________________
Shared Procedures
Prefer shared database procedures.
Examples include:
•	Save 
•	Duplicate 
•	Rename 
•	Replace 
•	Delete 
•	propagation logic 
Avoid creating domain-specific copies of common logic.
________________________________________
Thin Client Principle
Business logic belongs in Supabase whenever practical.
Appsmith should primarily:
•	collect input 
•	display output 
•	call shared procedures 
•	manage user interaction 
Avoid moving business rules into JavaScript unless there is a clear UI requirement.
________________________________________
Existing Code Philosophy
The codebase already contains significant working functionality.
Before replacing existing logic:
•	understand why it exists 
•	verify whether it already satisfies the new architecture 
•	normalize where possible rather than rewrite by default 
Working code should not be replaced simply because it could be written differently.
Immediate Development Priorities
The documentation normalization completed during this chat establishes the architectural baseline.
Development should now return to implementation.
The next major task is to rewrite:
Proposal & Quotation Operational Specification
This document should be written from scratch using the newly established architecture.
Do not attempt to merge it with previous versions.
Once complete, implementation can continue using the normalized documentation.
________________________________________
Areas Intentionally Deferred
The following areas are intentionally incomplete.
Do not attempt to solve them unless they become the current implementation task.
•	PDF generation 
•	Email delivery 
•	Proposal document formatting 
•	Quotation document formatting 
•	Advanced reporting 
•	Inventory management 
•	Purchasing 
•	Packaging optimisation 
•	Accounting integration 
•	CRM expansion beyond current Customer, Contact and Venue scope 
•	Permission refinement 
•	Multi-language support 
These are future features.
Avoid introducing architecture now for problems that do not yet exist.
________________________________________
Known Architectural Rules
The following rules repeatedly emerged during development and should be considered implementation constraints.
Operational Correctness First
Business workflow is the primary requirement.
Implementation should adapt to the workflow.
Do not simplify operational behaviour simply because implementation becomes easier.
________________________________________
Normalize Before Expanding
When working inside a domain:
•	remove duplication 
•	strengthen ownership 
•	improve consistency 
•	simplify future implementation 
Avoid creating exceptions for a single page or domain.
________________________________________
Shared Before Local
If functionality already exists elsewhere:
•	extend the shared implementation 
•	avoid copying code 
Examples include:
•	save logic 
•	duplicate 
•	replace 
•	delete 
•	validation 
•	propagation 
________________________________________
Published Data Only
Downstream domains must always consume Published State.
Never consume another domain's Working State.
This rule should not be bypassed for convenience.
________________________________________
Snapshots Are Immutable
Once published:
•	Proposal 
•	historical Quotation revisions 
•	future historical documents 
must never silently change because upstream information changes.
Historical accuracy always has priority over convenience.
________________________________________
Implementation Risks
The most likely mistakes when continuing development are:
Reintroducing automatic propagation
Propagation intentionally ends at Events.
Everything beyond Events refreshes through explicit business actions.
________________________________________
Blurring ownership
Each domain owns its own data.
Downstream domains consume published information but do not own it.
________________________________________
Treating Proposal as a report
Proposal is an immutable business object.
It is not a printable view of the current Event.
________________________________________
Treating Quotation as part of Kitchen
Quotation belongs entirely to Sales.
Kitchen has no visibility into Sales activity beyond publishing Proposals.
________________________________________
Moving business rules into Appsmith
Business rules should remain in Supabase whenever practical.
Appsmith should remain a thin client.
________________________________________
Creating special-case logic
If a problem appears unique to one page, first determine whether it is actually a shared architectural problem.
Prefer improving shared behaviour over adding page-specific exceptions.
________________________________________
Verification Before Implementing
Before making significant changes, verify that the proposed solution:
•	follows the Development Standards 
•	preserves ownership 
•	preserves Published State behaviour 
•	preserves snapshot behaviour 
•	avoids unnecessary duplication 
•	keeps business logic primarily in Supabase 
•	does not introduce new architectural exceptions 
•	aligns with the normalized documentation rather than older discussions 
If the answer to any of these is "no," reconsider the implementation before proceeding.
Current Implementation Mindset
The application already contains significant working functionality.
The objective is not to replace working code because a different implementation is possible.
The objective is to move the application toward a consistent architecture while preserving operational behaviour.
Before replacing existing code, determine whether it can be normalized instead.
________________________________________
Existing Excel Workbook
The original Excel/VBA workbook remains the primary operational reference.
Its purpose is to explain business behaviour, not implementation.
When reviewing Excel:
•	extract operational rules 
•	ignore Excel-specific technical limitations 
•	avoid copying VBA architecture into the new application 
The new implementation should achieve the same operational outcome using cleaner architecture.
________________________________________
Current Design Principles
The following principles have consistently produced the best implementation decisions.
Consistency
Users should experience the same behaviour across every domain.
Equivalent actions should work the same way everywhere.
________________________________________
Predictability
The system should behave consistently.
Users should not need to remember special cases.
________________________________________
Ownership
Every piece of data should have a single owner.
Published information flows downstream.
Ownership never flows downstream.
________________________________________
Simplicity
Simple workflows are preferred.
Avoid introducing configuration or options unless they provide clear operational value.
________________________________________
Reusability
Whenever a solution can reasonably become shared infrastructure, prefer that approach over a domain-specific implementation.
________________________________________
Naming Conventions
Continue following the established naming conventions throughout the project.
Examples include:
Database
•	*_items 
•	*_components 
•	vw_* 
•	shared procedures where possible 
Application
•	consistent page naming 
•	consistent action naming 
•	consistent modal behaviour 
•	consistent button behaviour 
Do not introduce alternative naming patterns within new domains.
________________________________________
Implementation Expectations
When implementing new functionality:
•	use complete shared procedures 
•	avoid duplicated SQL 
•	avoid duplicated JavaScript 
•	avoid page-specific business logic 
•	document significant architectural decisions when they establish a new project-wide pattern 
Small implementation details generally do not require documentation updates.
Architecture changes do.
________________________________________
Reading Order
This handoff should be read first.
Only consult additional documentation when needed.
Suggested order:
1.	Handoff 
2.	Development Standards 
3.	Architecture 
4.	Domain Rules 
5.	Domain-specific document relevant to the current task 
The Canonical Specifications document should primarily be used when clarification is needed regarding overall product direction rather than implementation.
________________________________________
Ready to Continue
After reading this handoff, the next ChatGPT should be able to:
•	understand the current project direction 
•	understand the architectural boundaries 
•	understand the implementation philosophy 
•	understand the project owner's preferred working style 
•	identify the next documentation task 
•	continue implementation without reviewing previous conversations 
This handoff intentionally contains only the information needed to resume development from the current point. It should be replaced by a new handoff after the next significant development session.
Current Development Checkpoint
Last Completed Work
The architectural documentation has been fully normalized and rewritten.
The following documents are now considered authoritative:
•	Development Standards 
•	Canonical Specifications 
•	Architecture 
•	Domain Rules 
•	Events, Proposal & Quotation Architecture 
•	Kitchen ↔ Sales Workflow 
These replace previous versions and should be used as the reference for future implementation.
________________________________________
Current Task
The next documentation task is:
Proposal & Quotation Operational Specification
It should be rewritten from the beginning using the normalized architecture established during this session.
Do not patch or extend the previous version.
Once completed, implementation should resume.
________________________________________
Current Implementation Status
The application already contains substantial functionality.
Current effort is focused on normalizing the existing implementation rather than adding major new functionality.
Continue improving consistency across domains instead of redesigning working areas unnecessarily.
________________________________________
Settled Decisions
The following decisions should be treated as complete unless genuine operational problems are discovered.
•	Working State and Published State architecture. 
•	Save publishes. 
•	Unsaved changes never propagate. 
•	Propagation ends at Events. 
•	Proposal is an immutable Kitchen publication. 
•	Quotation belongs entirely to Sales. 
•	Kitchen and Sales remain operationally independent. 
•	Business logic belongs primarily in Supabase. 
•	Appsmith remains a thin client. 
•	Shared solutions are preferred over domain-specific implementations. 
These decisions should not be revisited during normal implementation.
________________________________________
Known Temporary Areas
Some areas remain intentionally incomplete.
Examples include:
•	Proposal & Quotation Operational Specification documentation. 
•	PDF generation. 
•	Email delivery. 
•	Inventory management. 
•	Purchasing. 
•	Advanced reporting. 
•	Permission refinement. 
These are deferred by design.
Do not build supporting architecture until they become active development tasks.
________________________________________
Known Technical Debt
Some implementation may still reflect earlier architecture.
When encountered:
•	normalize it where practical 
•	avoid introducing additional technical debt 
•	prefer moving toward shared procedures and consistent ownership 
Do not rewrite working functionality solely for stylistic reasons.
________________________________________
Before Changing Existing Code
Always determine:
•	Is this already working correctly? 
•	Can it be normalized instead of replaced? 
•	Does the change strengthen consistency? 
•	Does it preserve ownership? 
•	Does it preserve Published State? 
•	Does it align with the normalized documentation? 
If the answer to any of these is No, reconsider the implementation before proceeding.
________________________________________
Resume Point
Development should continue from the current implementation using the rewritten documentation as the authoritative reference.
There is no need to reconstruct previous conversations unless investigating historical decisions that are not covered by the documentation.
The next ChatGPT should be able to begin productive implementation immediately after reading this Handoff and, where necessary, the supporting documents.
________________________________________

Working With the Project Owner
•	The project owner is not a programmer. Provide complete SQL, Appsmith code, or procedures rather than partial snippets or abstract guidance. 
•	The project owner has deep operational knowledge of hospitality and catering workflows. Treat business logic as authoritative and challenge technical assumptions before changing operational behavior. 
•	Prefer complete replacements over patches, shared solutions over one-off fixes, and normalization over exceptions. 
•	Keep explanations concise. Focus on what changes, where it changes, and why it matters. 
•	Constructive disagreement is encouraged. If a proposed solution is weak, explain why and propose a better alternative. 
•	The goal is a clean, maintainable architecture rather than the fastest implementation.

