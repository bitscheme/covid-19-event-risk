import { BigQueryDate } from "@google-cloud/bigquery"

type Cases = {
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
