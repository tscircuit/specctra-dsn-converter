import { test, expect } from "bun:test"
import { circuitJsonToPcbSvg } from "circuit-to-svg"
// @ts-ignore
import simpledsn1 from "./simpledsn1.dsn" with { "type": "text" }
import { parseDsnToJson } from "lib"
import { convertDsnJsonToTscircuitSoupJson } from "pcb-json-to-tscircuit-soup-json"
import { writeFileSync } from "node:fs"

test("generate soup and match SVG snapshot", () => {
  const dsnJson = parseDsnToJson(simpledsn1)

  // writeFileSync("simpledsn1.json", JSON.stringify(dsnJson, null, 2))

  const soupElements = convertDsnJsonToTscircuitSoupJson(dsnJson)

  const svg = circuitJsonToPcbSvg(soupElements as any)
  expect(svg).toMatchSvgSnapshot(import.meta.path)
})