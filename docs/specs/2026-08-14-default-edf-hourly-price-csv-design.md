# Default EDF hourly price CSV design

## Purpose

Create one program-ready hourly CSV derived from the existing EDF source model without modifying the source workbook.

## Data contract

- One row per existing hourly timestamp in `5. HH Price Build`.
- `wholesale_gbp_per_mwh` and `duos_gbp_per_mwh` are the two replaceable customer/data-team inputs.
- All other price components are explicit numeric columns in GBP/MWh.
- CCL is stored as `ccl_gbp_per_mwh = 7.75`, converted from `0.775 p/kWh`.
- TNUoS variable is `7.01 GBP/MWh`; TNUoS fixed is excluded from this hourly variable-price file.
- Losses are `6.06%` and apply to the same NBP components as sheet `7. Cost Components`.
- TPI defaults to `2 p/kWh = 20 GBP/MWh` and appears once.

## Calculation

`nbp_before_losses` equals wholesale, supplier costs, NEC components, corrected CCL, TPI, and residual. `nbp_after_losses = nbp_before_losses * 1.0606`. `total_price_gbp_per_mwh = nbp_after_losses + duos + tnuos_variable`.

## Validation

- Preserve source timestamps and Wholesale values.
- Calibrate the default DUoS hourly profile to a simple mean of `20.93 GBP/MWh`.
- Assert CCL conversion, component reconciliation, numeric completeness, unique timestamps, and sorted hourly spacing; disclose any source gap rather than silently inventing data.
