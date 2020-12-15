# COVID-19 Event Risk

This repository provides a TypeScript module to estimate the chance (0-100%) that at least one COVID-19 positive individual will be present at an event on a given date.

Historical and forecasted U.S. infection cases data are extracted from the [Google COVID-19 Open Data dataset](https://cloud.google.com/blog/products/data-analytics/free-public-datasets-for-covid19) using BigQuery.

County population data are taken from U.S. Census Bureau ACS 2018 5yr estimates.

The event risk concept was developed by
[Joshua Weitz](https://biosciences.gatech.edu/people/joshua-weitz) (Georgia Institute of Technology, Biological Sciences, GT-BIOS).

The event risk calculation is taken from from the [COVID-19 Event Risk Planner](https://github.com/appliedbinf/covid19-event-risk-planner).

## Documentation

[API](https://bitscheme.github.io/covid-19-event-risk/globals.html)

## Install

```sh
npm i @bitscheme/covid-19-event-risk
```

For your GCP project, ensure you have enabled the [BiqQuery API](https://console.cloud.google.com/flows/enableapi?apiid=bigquery)

## Example

```js
import { calcRisk, query, getCases } from "@bitscheme/covid-19-event-risk"

// extracts cases and population data from BigQuery
const data = await query(
  {
    keyFile: "/path/to/gcp_key_file.json",
    projectId: "my_gcp_project_id",
  },
  "OK",
  "Tulsa County",
  14
)

// determines the target (t-0) and prior (t-14) cases in the 14 day period
const { target, prior } = await getCases(new Date(), data, 14)

// calculates risk score
const score = calcRisk(
  target.cumulative_confirmed - prior.cumulative_confirmed,
  1000, // group size
  target.total_pop, // county population
  5, // ascertainment bias
  10, // infectious period in days
  14 // period in days
)
```

## Unit Test

```sh
git clone https://github.com/bitscheme/covid-19-event-risk
cd covid-19-event-risk
cat > .env <<- EOM
GCP_PROJECT_ID=my_gcp_project_id
GCP_KEY_FILE=/path/to/gcp_key_file.json
EOM
yarn
yarn test
```

## Tasks

- [ ] Support historical cases data queries
- [ ] Publish package to npm
