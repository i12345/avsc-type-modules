import { schema, Type, Schema } from "avsc"
import { TypeFactory, TypeFactoryModule, TypeNamespace, TypeFactoryModuleContext } from "../type-factory.js"

// after node_modules/avsc/types/index.d.ts

export type TypeFactorySchema =
    schema.PrimitiveType |
    TypeFactory |
    {
        type: "record"
        name: string
        fields: Record<string, TypeFactorySchema>
    } |
    {
        type: "array"
        items: TypeFactorySchema
    } |
    {
        type: "map"
        values: TypeFactorySchema
    } |
    {
        type: "enum"
        name: string
        symbols: string[]
    } |
    {
        type: "fixed"
        name: string
        size: number
    } |
    TypeFactorySchema[]

export function record(name: string, fields: Record<string, TypeFactorySchema>): TypeFactorySchema {
    return {
        type: "record",
        name,
        fields
    }
}

export function array(items: TypeFactorySchema): TypeFactorySchema {
    return {
        type: "array",
        items
    }
}

export class SchemaTypeFactoryModule extends TypeFactoryModule {
    constructor(
        public readonly schema: TypeFactorySchema,
        name: string,
        namespace?: TypeNamespace
    ) {
        if (typeof schema === 'object' && 'name' in schema) {
            if (name === undefined)
                name = schema.name
            else if (schema.name !== name)
                throw new Error("Schema name must match type factory name")
        }
        
        super(name, namespace)
    }

    make(context: TypeFactoryModuleContext): Schema {
        function translateSchema(schema: TypeFactorySchema): Schema {
            if (typeof schema === 'string')
                return schema
            else if (schema instanceof Array) {
                const translated = schema.map(translateSchema)
                if (translated.some(translated => translated instanceof Type))
                    throw new Error("only avro schema types can be referenced in unions")
                return translated as schema.DefinedType[]
            }
            else if ('make' in schema)
                return context.registry.name(schema)!
            else if (schema.type === "record")
                return {
                    type: "record",
                    name: schema.name,
                    fields: Object.entries(schema.fields).map(([name, type]) => ({
                        name,
                        type: translateSchema(type)
                    }))
                }
            else if (schema.type === 'array')
                return {
                    type: 'array',
                    items: translateSchema(schema.items)
                }
            else if (schema.type === 'map')
                return {
                    type: 'map',
                    values: translateSchema(schema.values)
                }
            else if (schema.type === 'enum')
                return {
                    type: 'enum',
                    name: schema.name,
                    symbols: schema.symbols
                }
            else if (schema.type === 'fixed')
                return {
                    type: 'fixed',
                    name: schema.name,
                    size: schema.size
                }
            else throw new Error()
        }

        return Type.forSchema(translateSchema(this.schema), context.opts)
    }
}