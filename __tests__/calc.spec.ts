import fetchCalcRisk from "../src/lib"
import calcRisk from "../src/lib/calc-risk"

require("dotenv").config()

describe("event risk", () => {
  test("can calc risk", async () => {
    const result = calcRisk(1000, 10, 100000, 5, 10, 14)

    expect(result).toBe(30)
  })
  test("can fetch and calc risk", async () => {
    const result = await fetchCalcRisk({
      bigQueryOptions: {
        keyFile: process.env.GCP_KEY_FILE,
        projectId: process.env.GCP_PROJECT_ID,
      },
      date: new Date(),
      groupSize: 100,
      ascertainmentBias: 5,
      infectiousPeriod: 10,
      period: 14,
      level1: "OK",
      level2: "Tulsa County",
    })

    expect(result.score).toBeGreaterThan(0)
    expect(result.dates.length).toBeGreaterThanOrEqual(14)
  })
})
