import calcRisk from "../src/lib/calc-risk"
import getCases from "../src/lib/get-cases"
import query from "../src/lib/query"

require("dotenv").config()

describe("event risk", () => {
  test("can calc risk", async () => {
    const result = calcRisk(1000, 10, 100000, 5, 10, 14)

    expect(result).toBe(30)
  })
  test("can fetch and calc risk", async () => {
    const data = await query(
      {
        keyFile: process.env.GCP_KEY_FILE,
        projectId: process.env.GCP_PROJECT_ID,
      },
      "OK",
      "Tulsa County",
      14
    )
    expect(data.length).toBeGreaterThanOrEqual(14)

    const { target, prior } = await getCases(new Date(), data, 14)

    expect(target.cumulative_confirmed).toBeGreaterThan(0)
    expect(prior.cumulative_confirmed).toBeGreaterThan(0)

    const score = calcRisk(
      target.cumulative_confirmed - prior.cumulative_confirmed,
      1000,
      target.total_pop,
      5,
      10,
      14
    )

    expect(score).toBeGreaterThan(0)
  })
})
