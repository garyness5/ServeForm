## Address Book Normalization Addendum

The original project documentation describes the operational philosophy of the Address Book correctly; however, the implementation has since been significantly normalized.

During this development phase, work intentionally stepped back from Events and Quotation to complete the Address Book as a proper subsystem before continuing downstream.

CustomerList, ContactList and VenueList are no longer treated as separate implementations.

They now operate as one unified Address Book subsystem with a common architecture, common CRUD workflow, common status management, common filtering behaviour, common duplicate handling, common delete workflow and common user experience.

The most significant architectural change is that Contacts are now fully shared across the application. Customer and Venue pages no longer own Contact information. Instead, they consume the single Contact master and manage only Customer–Contact and Venue–Contact relationships.

This work did not introduce new business rules for Events, Proposal or Quotation.

Instead, it established a stable and reusable administrative foundation that those downstream domains will consume.

All future Address Book changes are expected to be small operational refinements resulting from Events, Proposal or Quotation implementation rather than further redesign of the Address Book itself.
