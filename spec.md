# Specification

## Summary
**Goal:** Fix the PaymentSuccess page to correctly display the quantity selected by the user and compute the total price accordingly.

**Planned changes:**
- Pass the selected quantity from FeaturesPage through CheckoutPage to PaymentSuccess via URL parameters or navigation state.
- Update PaymentSuccess to read the quantity from the passed state/params instead of using a hardcoded value of 1.
- Update the total price displayed on PaymentSuccess to reflect quantity × ₹20,000.
- Default to quantity 1 on PaymentSuccess if no quantity is provided (e.g., direct navigation).

**User-visible outcome:** When a user selects a quantity greater than 1 and completes the simulated payment flow, the PaymentSuccess page correctly shows the chosen quantity and the corresponding total price.
