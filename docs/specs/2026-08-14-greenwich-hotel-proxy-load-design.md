# Greenwich Hotel Proxy Load and Tariff Design

## Objective

Construct an auditable hourly hotel load for the rolling period 1 July 2025 to 30 June 2026, then compare the assumed British Gas day/night tariff with the EDF hourly offer represented by proxy MPAN `2356550238119`.

## Source data and status

- Customer meter readings provide actual monthly electricity consumption for January to July 2026: 33,915; 25,404; 28,506; 24,369; 27,819; 24,695; and 33,629 kWh.
- The seven-month total is 198,337 kWh. The annualized target is `198,337 / 7 * 12 = 340,006.285714 kWh`.
- British Gas energy rates are sales assumptions rather than verified contract terms: day `£0.33/kWh`, night `£0.30/kWh`.
- The customer MPAN is unavailable. EDF workbook `edf_total_price_2025Q3_2026Q2_mpan_2356550238119.xlsx` is a pricing proxy only; it does not contain proxy-site load.
- British Gas standing charge, capacity charge, other fixed charges, VAT treatment, and confirmed register schedule are unavailable and must remain excluded or separately marked unquoted. They must not be silently set to confirmed zero.

## Annualization and month mapping

The model covers July 2025 through June 2026 so its timestamps align exactly with the proxy EDF price workbook.

- July 2025 uses the July 2026 actual consumption, 33,629 kWh, as a same-month proxy.
- August through December 2025 each use the observed January-to-July monthly average, `198,337 / 7 = 28,333.857143 kWh`.
- January through June 2026 retain their actual monthly consumption.
- The resulting rolling-year total must equal 340,006.285714 kWh within 0.001 kWh.
- Every estimated or remapped month carries a basis label; no month is presented as actual when it is not.

## Hotel hourly profile

The load is synthetic, not smart-meter data. Reuse the tested hotel archetype in the shared project's `src/hotel_invoice_case.py`, specifically `DEFAULT_WEEKDAY_PROFILE`, `DEFAULT_WEEKEND_PROFILE`, profile validation, and monthly/band normalization logic. Do not reuse the previous hotel's bill totals, tariffs, capacity, identity, or result files.

- Weekday curve: overnight baseload, breakfast ramp and peak, daytime occupied-hotel load, evening occupancy/kitchen peak, then overnight decline.
- Weekend curve: later and broader breakfast/morning demand and a broader evening profile.
- The 24 hourly weights remain visible in the notebook parameters and are labelled as reused synthetic hotel assumptions.

For every calendar month, hourly weights are selected by weekday/weekend and hour. Because the customer source contains total monthly kWh rather than separate registers, the total is first split between night and day using the same selected calendar weights; each band is then normalized over the matching monthly timestamps. This preserves each monthly total exactly, retains the requested characteristic shapes, and avoids importing the previous hotel's observed day/night split. Leap years and weekday counts are handled by timestamps rather than fixed day counts.

## Tariff application

- Night is 00:00 inclusive to 07:00 exclusive at 30 p/kWh.
- Day is 07:00 inclusive to 24:00 exclusive at 33 p/kWh.
- Each interval's British Gas energy cost is `load_kwh * rate_p_kwh / 100`.
- EDF interval price comes from the matching proxy-workbook timestamp and is applied to the same synthetic load.
- Missing timestamps, duplicates, non-hourly spacing, negative loads, or incomplete EDF price coverage stop the calculation.

## Components and outputs

- A focused customer-case module will build monthly targets and British Gas interval energy costs. It will call or minimally generalize the shared tested hotel-profile engine so the established curves and validation remain the single source of truth.
- A generated notebook will expose assumptions first, load and validate source files, construct the rolling profile, apply both tariffs, and show monthly and annual summaries.
- Outputs will include hourly calculation data, monthly reconciliation, annual comparison, and an assumptions/audit table.
- The notebook will distinguish energy-only comparison from a complete invoice comparison because British Gas fixed and other charges are not available.

## Verification

Automated tests will prove:

- the seven-month and annualized totals;
- the rolling-month mapping and basis labels;
- separate weekday and weekend curve selection;
- reuse of the established default hotel profiles without importing the prior hotel's bill totals;
- monthly and annual kWh reconciliation;
- the 00:00 and 07:00 tariff boundaries;
- timestamp uniqueness, hourly continuity, and EDF price coverage;
- monthly cost totals summing to the annual result.

The executed notebook must complete without errors. Its stored outputs and exported workbook/CSV totals must reconcile to independently calculated control totals before results are described as complete.
