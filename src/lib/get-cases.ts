import dayjs, { Dayjs } from "dayjs"
import utc from "dayjs/plugin/utc"
import { Cases } from "../lib/query"

dayjs.extend(utc)

const notFoundMessage = "No data found in dataset"
const YMD = "YYYY-MM-DD"

/**
 * Determines the target and prior cases data from a set of cases
 *
 * @param date The target date in UTC
 * @param cases The cases dataset
 * @param period The number of days in the period
 * @returns The result
 */
export default async function getCases(
  date: Date,
  cases: Cases[],
  period?: 14
): Promise<{ target: Cases; prior: Cases }> {
  const toMidnight = (d: Dayjs) => {
    return d.set("h", 0).set("m", 0).set("s", 0).set("ms", 0)
  }

  const findCaseByDate = (d: Dayjs) =>
    cases.find(({ date }) => date.value === d.format(YMD))

  const targetDate = toMidnight(dayjs(date).utc())
  const target = findCaseByDate(targetDate)

  if (!target) {
    throw new Error(
      `${notFoundMessage} for [latest] ${targetDate.toISOString()}`
    )
  }

  const priorDate = targetDate.add(-period, "d")
  const prior = findCaseByDate(priorDate)

  if (!prior) {
    throw new Error(`${notFoundMessage} for [prior] ${priorDate.toISOString()}`)
  }

  return {
    target,
    prior,
  }
}
