import { BigQuery, BigQueryDate, BigQueryOptions } from "@google-cloud/bigquery"
import { UNITED_STATES_CODES } from "./constants"

/**
 * The COVID-19 infection cases extracted from BigQuery
 */
export type Cases = {
  // the observation date
  date: BigQueryDate
  // if cases have been forecasted, the date in which published
  forecast_date?: BigQueryDate
  // fips code
  county_fips_code: string
  // total number of new cases
  new_confirmed: number
  // total cumulative number of confirmed cases
  cumulative_confirmed: number
  // county census population
  total_pop: number
}

/**
 * Queries Google COVID-19 open dataset data
 * for historical and forecasted cases in the United States
 * The result set is a continuous series of observation dates representing
 * new and cumulative cases, and if those cases were
 *  - forecast by Google (forecast_date != null)
 *  - reported by state county agencies (forecast_date = null)
 *
 * @param bigQueryOptions The BigQuery options
 * @param level1 The state abbreviation
 * @param level2 The county
 * @param period The number of days in the window
 * @returns The result
 */
export default async function query(
  bigQueryOptions: BigQueryOptions,
  level1: string,
  level2: string,
  period: number
): Promise<Array<Cases>> {
  const state = UNITED_STATES_CODES[level1]
  const sql = `
DECLARE fips_code DEFAULT (
  SELECT county_fips_code
  FROM \`bigquery-public-data.census_utility.fips_codes_all\`
  WHERE state_fips_code in (
    SELECT state_fips_code
    FROM \`bigquery-public-data.census_utility.fips_codes_all\`
    WHERE area_name = '${state}'
  ) AND area_name = '${level2}'
);

DECLARE max_reported_date DEFAULT (
  SELECT
    MAX(date)
  FROM
    \`bigquery-public-data.covid19_open_data.covid19_open_data\`
  WHERE
    subregion2_code = fips_code
    AND cumulative_confirmed IS NOT NULL
  )
;

-- get reported
SELECT
  date,
  NULL AS forecast_date,
  a.subregion2_code AS county_fips_code,
  a.new_confirmed,
  a.cumulative_confirmed,
  CAST(b.total_pop AS int64) AS total_pop
FROM
  \`bigquery-public-data.covid19_open_data.covid19_open_data\` a
INNER JOIN
  \`bigquery-public-data.census_bureau_acs.county_2018_5yr\` b
ON
  date >= DATE_ADD(CURRENT_DATE(), INTERVAL ${-period} DAY)
  AND a.subregion2_code = b.geo_id
  AND b.geo_id = fips_code
  AND a.cumulative_confirmed IS NOT NULL

UNION ALL

-- get forecast
SELECT
  a.prediction_date AS date,
  a.forecast_date,
  county_fips_code,
  CAST(CEILING(new_confirmed) AS int64) AS new_confirmed,
  CAST(CEILING(cumulative_confirmed) AS int64) AS cumulative_confirmed,
  CAST(total_pop AS int64) AS total_pop,
FROM
  \`bigquery-public-data.covid19_public_forecasts.county_28d\` a
INNER JOIN
  \`bigquery-public-data.census_bureau_acs.county_2018_5yr\` b
ON
  a.county_fips_code = fips_code
  AND a.prediction_date > max_reported_date
  AND a.county_fips_code = b.geo_id
  AND a.cumulative_confirmed IS NOT NULL
ORDER BY
  date ASC`

  // Run the query as a job
  const bq = new BigQuery(bigQueryOptions)

  const [job] = await bq.createQueryJob({
    query: sql,
    jobTimeoutMs: 5000,
    location: "US",
  })

  // Wait for the query to finish
  const [result] = await job.getQueryResults({
    timeoutMs: 10000,
  })

  return result
}
