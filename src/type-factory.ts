import { ForSchemaOptions, Schema, Type } from "avsc";
import { NamedTypeFactory, TypeModule, TypeModuleContext } from "./type-module.js";

export class NamedTypeFactoryRegistry {
    private readonly registry = new Map<TypeFactory, NamedTypeFactory>()

    //TODO: critical issue:
    // A union type (used for an inheritable class) cannot reference itself
    // because it cannot be named.
    // https://issues.apache.org/jira/browse/AVRO-248
    name(factory: TypeFactory) {
        const { name, namespace } = this.registry.get(factory)!
        return (namespace ? (namespace.toString() + ".") : "") + name
    }

    add(factory: NamedTypeFactory) {
        this.registry.set(factory.factory, factory)
    }
}

export interface TypeFactoryModuleContext extends TypeModuleContext {
    registry: NamedTypeFactoryRegistry
    opts: Partial<ForSchemaOptions>
}

export class TypeNamespace {
    constructor(
        public readonly name: string,
        public readonly parent?: TypeNamespace
    ) { }

    toString(): string {
        if (this.parent)
            return this.parent.toString() + "." + this.name
        else
            return this.name
    }
}

export interface TypeFactory {
    make(context: TypeFactoryModuleContext): Schema
    postInit(type: Type): void
}

export abstract class TypeFactoryModule implements TypeFactory, TypeModule {
    constructor(
        public readonly name: string,
        public readonly namespace?: TypeNamespace
    ) { }

    init(context: TypeModuleContext): NamedTypeFactory[] {
        return [{
            name: this.name,
            namespace: this.namespace,
            factory: this
        }]
    }

    abstract make(context: TypeFactoryModuleContext): Schema
    postInit(type: Type) { }
}