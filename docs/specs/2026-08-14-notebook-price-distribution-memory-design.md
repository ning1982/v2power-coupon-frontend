# Notebook price distribution and project memory design

## Locked price-source rule

Use the rolling Wholesale period 2025 Q3-Q4 plus 2026 Q1-Q2. When a customer MPAN is supplied, construct a customer-specific EDF curve using the matching DUoS schedule. When no MPAN is supplied, use the default EDF curve.

## Notebook chart

Add one reproducible chart section to the York House notebook. Read the customer EDF hourly workbook, remove TPI for the agreed comparison view, split observations into weekday and weekend, calculate hourly mean/P5/P95, and plot blue weekday and orange weekend mean lines with separate P5-P95 bands. Overlay the customer tariff as a step line: 19.57 p/kWh from 00:00 through 06:59 and 25.67 p/kWh from 07:00 onward. All chart values exclude VAT.

## Validation

The notebook source must contain both quantiles, both customer tariff values, day-type classification, and the fixed rolling source path. The generated notebook must retain the same cells after rebuilding.
