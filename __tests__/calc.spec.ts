import calcRisk from "../src/lib"

require("dotenv").config()

describe("event risk", () => {
  test("can fetch and calc risk", async () => {
    const result = await calcRisk({
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
    expect(result.dates.length).toBeGreaterThan(0)
  })
})
