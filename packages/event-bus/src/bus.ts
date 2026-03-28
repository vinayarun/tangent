// Removed Node.js 'events' dependency for browser compatibility

export type EventKey = string | symbol;
export type EventHandler<T = any> = (payload: T) => void;

export interface IEventBus {
    on<T>(event: EventKey, handler: EventHandler<T>): void;
    off<T>(event: EventKey, handler: EventHandler<T>): void;
    emit<T>(event: EventKey, payload: T): void;
}

export class EventBus implements IEventBus {
    private listeners: Map<EventKey, EventHandler[]> = new Map();

    constructor() {
        // No-op
    }

    on<T>(event: EventKey, handler: EventHandler<T>): void {
        if (!this.listeners.has(event)) {
            this.listeners.set(event, []);
        }
        this.listeners.get(event)!.push(handler as EventHandler);
    }

    off<T>(event: EventKey, handler: EventHandler<T>): void {
        const handlers = this.listeners.get(event);
        if (handlers) {
            this.listeners.set(
                event,
                handlers.filter((h) => h !== handler)
            );
        }
    }

    emit<T>(event: EventKey, payload: T): void {
        const handlers = this.listeners.get(event);
        if (handlers) {
            handlers.forEach((handler) => {
                try {
                    handler(payload);
                } catch (error) {
                    console.error(`Error in event handler for ${String(event)}:`, error);
                }
            });
        }
    }
}

// Singleton instance
export const globalEventBus = new EventBus();
