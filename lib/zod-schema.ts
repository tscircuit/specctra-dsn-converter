import { z } from "zod"

export const YamlBool = z
  .enum(["true", "false", "yes", "no", "on", "off"])
  .or(z.boolean())
  .transform((v) => {
    if (typeof v === "boolean") return v
    if (v === "true" || v === "yes" || v === "on") return true
    return false
  })

// Parser schema
export const ParserSchema = z.object({
  string_quote: z.string().optional(),
  space_in_quoted_tokens: YamlBool.optional(),
  host_cad: z.string().optional(),
  host_version: z.string().optional(),
  constant: z.array(z.tuple([z.string(), z.string()])).optional(),
  write_resolution: z.array(z.tuple([z.string(), z.number()])).optional(),
  routes_include: z
    .array(z.enum(["testpoint", "guides", "image_conductor"]))
    .optional(),
  wires_include: z.string().optional(),
  case_sensitive: YamlBool.optional(),
  rotate_first: YamlBool.optional(),
})

// Resolution schema
export const ResolutionSchema = z
  .array(z.string())
  .or(z.record(z.string(), z.any()))
  .transform((a: any) => {
    if (Array.isArray(a)) {
      return {
        unit: a[0],
        value: parseFloat(a[1]!),
      }
    } else {
      return a
    }
  })
  .pipe(
    z.object({
      unit: z.string(),
      value: z.number(),
    })
  )

// Layer schema
export const LayerSchema = z.object({
  name: z.string(),
  type: z.string(),
  properties: z
    .array(
      z.object({
        index: z.number(),
      })
    )
    .optional(),
})

// Boundary schema
export const BoundarySchema = z.object({
  path: z.array(z.number()), // Coordinates as numbers
})

// Keepout schema
export const KeepoutSchema = z.object({
  type: z.string(),
  polygon: z.array(z.number()), // Coordinates as numbers
})

// Via schema
export const ViaSchema = z.object({
  name: z.string(),
  types: z.array(z.string()),
})

// Rule schema
export const RuleSchema = z.object({
  width: z.number(),
  clearances: z
    .array(
      z.object({
        value: z.number(),
        type: z.string().optional(),
      })
    )
    .optional(),
})

// Structure schema
export const StructureSchema = z.object({
  layers: z.array(LayerSchema),
  boundary: BoundarySchema,
  keepout: KeepoutSchema.optional(),
  vias: z.array(ViaSchema),
  rules: z.array(RuleSchema).optional(),
})

// Placement schema
export const PlacementSchema = z.object({
  components: z.array(
    z.object({
      name: z.string(),
      places: z.array(
        z.object({
          reference: z.string(),
          x: z.number(),
          y: z.number(),
          side: z.string(),
          rotation: z.number(),
          partNumber: z.string(),
        })
      ),
    })
  ),
})

// Image schema
export const ImageSchema = z.object({
  name: z.string(),
  outlines: z
    .array(
      z.object({
        signal: z.string(),
        path: z.array(z.number()), // Coordinates as numbers
      })
    )
    .optional(),
  pins: z
    .array(
      z.object({
        shape: z.string(),
        rotate: z.number().optional(),
        name: z.string(),
        x: z.number(),
        y: z.number(),
      })
    )
    .optional(),
})

// Padstack schema
export const PadstackSchema = z.object({
  name: z.string(),
  shapes: z.array(
    z.object({
      type: z.string(),
      layer: z.string(),
      dimensions: z.array(z.number()),
    })
  ),
  attach: z.string().optional(),
})

// Library schema
export const LibrarySchema = z.object({
  images: z.array(ImageSchema),
  padstacks: z.array(PadstackSchema),
})

// Net schema
export const NetSchema = z.object({
  name: z.string(),
  pins: z.array(z.string()),
})

// Network schema
export const NetworkSchema = z.object({
  nets: z.array(NetSchema),
  classes: z
    .array(
      z.object({
        class_id: z.string(),
        nets: z.array(z.string()),
      })
    )
    .optional(),
  groups: z
    .array(
      z.object({
        group_id: z.string(),
        fromtos: z
          .array(
            z.object({
              from: z.string(),
              to: z.string(),
            })
          )
          .optional(),
      })
    )
    .optional(),
})

// Wire schema
export const WireSchema = z.object({
  layer: z.string(),
  path: z.array(z.number()), // Coordinates as numbers
  net: z.string(),
  type: z.string().optional(),
})

// Wiring schema
export const WiringSchema = z.object({
  wires: z.array(WireSchema),
  vias: z
    .array(
      z.object({
        name: z.string(),
        net: z.string(),
        type: z.string(),
        x: z.number(),
        y: z.number(),
      })
    )
    .optional(),
})

// Main PCB Design schema
export const PCBDesignSchema = z
  .object({
    pcb: z.string(),
    file: z.string(),
    parser: ParserSchema,
    resolution: ResolutionSchema,
    unit: z.string(),
    structure: StructureSchema,
    placement: PlacementSchema,
    library: LibrarySchema,
    network: NetworkSchema,
    wiring: WiringSchema,
  })
  // TEMPORARY partial(): until parser is totally complete TODO
  .partial()
