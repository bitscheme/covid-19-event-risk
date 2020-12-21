/**
 * From https://github.com/appliedbinf/covid19-event-risk-planner
 *
 * @param i infections
 * @param size group size
 * @param pop population
 * @param bias ascertainment bias
 * @param ip infectious period
 * @param period number of days
 * @returns The risk percentage
 */
export default function calcRisk(
  i: number,
  size: number,
  pop: number,
  bias: number,
  ip = 10,
  period = 14
): number {
  const pI = bias * ((i * ip) / period / pop)
  const r = 1 - Math.pow(1 - pI, size)

  return Math.round(r * 100)
}
