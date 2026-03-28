import { Plugin, TangentContext } from '@tangent/shared-types';
import { IEventBus } from '@tangent/event-bus';

export class PluginRegistry {
    private plugins: Map<string, Plugin> = new Map();
    private context: TangentContext;

    constructor(eventBus: IEventBus) {
        this.context = {
            eventBus,
            workspace: {} // Placeholder for workspace API
        };
    }

    async register(plugin: Plugin): Promise<void> {
        if (this.plugins.has(plugin.metadata.id)) {
            throw new Error(`Plugin ${plugin.metadata.id} already registered`);
        }

        try {
            await plugin.activate(this.context);
            this.plugins.set(plugin.metadata.id, plugin);
            console.log(`Plugin ${plugin.metadata.id} activated`);
        } catch (error) {
            console.error(`Failed to activate plugin ${plugin.metadata.id}:`, error);
            throw error;
        }
    }

    async unregister(pluginId: string): Promise<void> {
        const plugin = this.plugins.get(pluginId);
        if (!plugin) return;

        if (plugin.deactivate) {
            await plugin.deactivate();
        }
        this.plugins.delete(pluginId);
    }

    getPlugin(id: string): Plugin | undefined {
        return this.plugins.get(id);
    }

    getAllPlugins(): Plugin[] {
        return Array.from(this.plugins.values());
    }
}
