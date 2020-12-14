# COVID-19 Event Risk

Estimates the chance (0-100%) that at least one COVID-19 positive individual will be present at an event on a given date. Historical and forecasted U.S. infection cases data is extracted from the [Google COVID-19 Open Data dataset](https://cloud.google.com/blog/products/data-analytics/free-public-datasets-for-covid19) using BigQuery.

County population data taken from U.S. Census Bureau ACS 2018 5yr estimates.

The event risk concept was developed by
[Joshua Weitz](https://biosciences.gatech.edu/people/joshua-weitz) (Georgia Institute of Technology, Biological Sciences, GT-BIOS).

The event risk calculation is taken from from the [COVID-19 Event Risk Planner](https://github.com/appliedbinf/covid19-event-risk-planner).

## Install

```sh
npm i @bitscheme/covid-19-event-risk
```

For your GCP project, ensure you have enabled the [BiqQuery API](https://console.cloud.google.com/flows/enableapi?apiid=bigquery)

## Example Usage

```js
import calcRisk from "@bitscheme/covid-19-event-risk"

calcRisk(
  bigQueryOptions: {
    keyFilename: "/path/to/gcp_key_file.json",
    projectId: "my_gcp_project_id",
  },
  date: new Date(),
  groupSize: 100,
  level1: "OK",
  level2: "Tulsa County",
)
  .then(({ score }) => console.log("risk score", score))
  .catch((e) => console.log(e.message))
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
