/**
 * Base Entity Interface
 * 
 * All domain entities must extend this interface.
 * Ensures consistent identity, versioning, and metadata support.
 */
export interface BaseEntity {
    /** Globally unique identifier (UUID v4) */
    id: string;

    /** Creation timestamp */
    createdAt: Date;

    /** Last update timestamp */
    updatedAt: Date;

    /** Version number, incremented on updates */
    version: number;

    /** Extensible metadata for plugins and custom fields */
    metadata?: Record<string, unknown>;
}
