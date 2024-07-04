import { librarySchema, imageSchema, padstackSchema } from "../zod-schema"
import type { Library, Image, Padstack } from "../types"
import { parseShape } from "./shape"
import { parseKeepout } from "./keepout"

export function parseSexprLibrary(elements: any[]): Library {
  const parsed: Library = elements.reduce((acc: Library, element) => {
    const [key, ...value] = element
    switch (key) {
      case "image":
        acc.push({ image: parseImage(value) })
        break
      case "padstack":
        acc.push({ padstack: parsePadstack(value) })
        break
      default:
        console.warn(`Unexpected key in library: ${key}`)
    }
    return acc
  }, [])

  return librarySchema.parse(parsed)
}

function parseImage(value: any[]): Image {
  const [name, ...elements] = value
  const image: Partial<Image> = { name }

  elements.forEach((element) => {
    const [key, ...data] = element
    switch (key) {
      case "side":
        image.side = data[0]
        break
      case "outline":
        if (!image.outlines) image.outlines = []
        image.outlines.push(parseShape(data[0]))
        break
      case "pin":
        if (!image.pins) image.pins = []
        image.pins.push(parsePin(data))
        break
      case "keepout":
        if (!image.keepouts) image.keepouts = []
        image.keepouts.push(parseKeepout(data))
        break
      default:
        console.warn(`Unexpected key in image: ${key}`)
    }
  })

  return imageSchema.parse(image)
}

function parsePin(data: any[]): NonNullable<Image["pins"]>[number] {
  const pin: NonNullable<Image["pins"]>[number] = {
    type: data[0],
    id: "",
    x: 0,
    y: 0,
  }

  if (Array.isArray(data[1]) && data[1][0] === "rotate") {
    pin.rotate = parseFloat(data[1][1])
    ;[, , pin.id, pin.x, pin.y] = data
  } else {
    ;[, pin.id, pin.x, pin.y] = data
  }

  pin.x = parseFloat(pin.x as any)
  pin.y = parseFloat(pin.y as any)

  return pin
}

function parsePadstack(value: any[]): Padstack {
  const [name, ...elements] = value
  const padstack: Partial<Padstack> = { name, shapes: [] }

  elements.forEach((element) => {
    const [key, ...data] = element
    switch (key) {
      case "shape":
        padstack.shapes!.push(parseShape(data[0]))
        break
      case "attach":
        padstack.attach = data[0]
        break
      default:
        console.warn(`Unexpected key in padstack: ${key}`)
    }
  })

  return padstackSchema.parse(padstack)
}
