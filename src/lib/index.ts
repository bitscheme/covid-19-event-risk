import { BigQueryOptions } from "@google-cloud/bigquery"
import dayjs, { Dayjs } from "dayjs"
import utc from "dayjs/plugin/utc"

dayjs.extend(utc)

import calcRisk from "./calc-risk"
import query from "./query"

const notFoundMessage = "No data found in BiqQuery dataset"
const YMD = "YYYY-MM-DD"

/**
 * Estimates the event risk for an observation date
 * using historical and forecast case data
 * from Google COVID-19 BigQuery public datasets
 * @param bigQueryOptions The BigQuery auth params
 * @param date The observation date in UTC
 * @param groupSize The group size
 * @param ascertainmentBias The ascertainment bias
 * @param infectiousPeriod The infectious period
 * @param period The number of days in the observation period
 * @param level1 The level 1 administrative area
 * @param level2 The level 2 administrative area
 * @returns The result
 */
export default async function ({
  bigQueryOptions,
  date,
  groupSize,
  ascertainmentBias,
  infectiousPeriod,
  period,
  level1,
  level2,
}: {
  bigQueryOptions: BigQueryOptions
  date: Date
  groupSize: number
  ascertainmentBias?: 5
  infectiousPeriod?: 10
  period?: 14
  level1: string
  level2: string
}) {
  const rows = await query(bigQueryOptions, level1, level2, period)

  if (rows.length === 0) {
    throw new Error(notFoundMessage)
  }

  // ensure there were enough dates returned to calculate risk
  if (rows.length < period) {
    throw new Error(`Unexpected row count=${rows.length}`)
  }

  const toMidnight = (d: Dayjs) => {
    return d.set("h", 0).set("m", 0).set("s", 0).set("ms", 0)
  }

  const bestAvailableDate = (d: Dayjs) => {
    // try for actual
    let res = rows.find(
      (r) => r.forecast_date?.value === null && r.date.value === d.format(YMD)
    )

    // fallback to forecast
    if (!res) {
      res = rows.find((r) => r.date.value === d.format(YMD))
    }

    return res
  }

  const today = toMidnight(dayjs().utc())
  const observationDate = toMidnight(dayjs(date).utc())

  if (today > observationDate) {
    throw new Error(`The observation date has already passed`)
  }

  const latest = bestAvailableDate(observationDate)

  if (!latest) {
    throw new Error(
      `${notFoundMessage} for [latest] ${observationDate.toISOString()}`
    )
  }

  const pastObservationDate = observationDate.add(-period, "d")
  const past = bestAvailableDate(pastObservationDate)

  if (!past) {
    throw new Error(
      `${notFoundMessage} for [past] ${pastObservationDate.toISOString()}`
    )
  }

  const score = calcRisk(
    latest.cumulative_confirmed - past.cumulative_confirmed,
    groupSize,
    latest.total_pop,
    ascertainmentBias,
    infectiousPeriod,
    period
  )
  const result = {
    locationKey: `US_${level1}_${latest.county_fips_code}`,
    population: latest.total_pop,
    score,
    dates: rows.map((r) => ({
      date: `${r.date?.value}T00:00:00Z`,
      forecastDate: r.forecast_date
        ? `${r.forecast_date.value}T00:00:00Z`
        : null,
      new: r.new_confirmed,
      cumulative: r.cumulative_confirmed,
    })),
  }

  return result
}
