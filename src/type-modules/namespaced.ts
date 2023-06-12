import { TypeNamespace } from "../type-factory.js";
import { NamedTypeFactory, TypeModule, TypeModuleContext } from "../type-module.js";

export class NamespacedTypeModule implements TypeModule {
    constructor(
        public readonly name: string,
        public readonly modules: TypeModule[]
    ) { }

    init(context: TypeModuleContext): NamedTypeFactory[] {
        const cache = new Map<TypeNamespace | undefined, TypeNamespace>()
        const namespaced = (namespace: TypeNamespace | undefined) => {
            if (cache.has(namespace))
                return cache.get(namespace)!
            else {
                const namespaced = new TypeNamespace(this.name, namespace)
                cache.set(namespace, namespaced)
                return namespaced
            }
        }

        return this.modules
            .flatMap(module => module.init(context))
            .map(({ name, namespace, factory }) => ({
                name,
                namespace: namespaced(namespace),
                factory
            }))
    }
}