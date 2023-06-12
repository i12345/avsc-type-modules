import { TypeFactory, TypeNamespace } from "./type-factory.js"

export class TypeImplementations {
    readonly implementations = new Map<TypeFactory, TypeFactory[]>()

    for(base: TypeFactory) {
        const direct = this.implementations.get(base)
        if (direct === undefined)
            return []
        
        const implementations = [...direct]
        
        for (const implementation of direct)
            implementations.push(...this.for(implementation))
        
        return implementations
    }

    add(implementation: TypeFactory, base: TypeFactory) {
        if (this.implementations.has(base))
            this.implementations.get(base)!.push(implementation)
        else this.implementations.set(base, [implementation])
    }
}

export interface TypeModuleContext {
    implementations: TypeImplementations
}

export interface NamedTypeFactory {
    name: string
    namespace?: TypeNamespace
    factory: TypeFactory
}

export interface TypeModule {
    init(context: TypeModuleContext): NamedTypeFactory[]
}