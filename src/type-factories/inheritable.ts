import { Schema } from "avsc"
import { TypeFactoryModule, TypeNamespace, TypeFactoryModuleContext } from "../type-factory.js"

export class InheritableTypeFactoryModule extends TypeFactoryModule {
    constructor(
        name: string,
        namespace?: TypeNamespace
    ) {
        super(name, namespace)
    }

    make(context: TypeFactoryModuleContext): Schema {
        return context.implementations.for(this).map(context.registry.name)
    }
}