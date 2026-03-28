import { useCallback, useEffect } from 'react';
import {
    ReactFlow,
    useNodesState,
    useEdgesState,
    addEdge,
    Background,
    Controls,
    Connection,
    Edge
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { GraphStore } from '@tangent/knowledge-graph';
import { KnowledgeEntity, EventType } from '@tangent/shared-types';
import { services } from '../services';

interface GraphViewProps {
    store: GraphStore;
}

const initialNodes = [
    { id: '1', position: { x: 0, y: 0 }, data: { label: 'Tangent Root' } },
];
const initialEdges: Edge[] = [];

export function GraphView({ store }: GraphViewProps) {
    const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
    const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);

    const onConnect = useCallback(
        (params: Connection) => setEdges((eds) => addEdge(params, eds)),
        [setEdges],
    );

    useEffect(() => {
        // Load initial state
        const snapshot = store.getSnapshot();
        // snapshot is { entities: [], relations: [] }
        if (snapshot.entities.length > 0) {
            setNodes(snapshot.entities.map((n: KnowledgeEntity) => ({
                id: n.id,
                position: { x: Math.random() * 400, y: Math.random() * 400 },
                data: { label: n.label }
            })));
        }

        // Subscribe to graph events
        const handleEntityCreated = (payload: { entity: KnowledgeEntity }) => {
            const { entity } = payload;
            setNodes((nds) => nds.concat({
                id: entity.id,
                position: { x: Math.random() * 400, y: Math.random() * 400 },
                data: { label: entity.label }
            }));
        };

        const handleRelationCreated = (payload: any) => {
            // TODO: Implement edges
            console.log('Relation created', payload);
        };

        services.bus.on(EventType.ENTITY_CREATED, handleEntityCreated as any);
        services.bus.on(EventType.RELATION_CREATED, handleRelationCreated as any);

        return () => {
            // events.off logic if available
        };
    }, [setNodes, store]);

    return (
        <div style={{ width: '100%', height: '100%' }}>
            <ReactFlow
                nodes={nodes}
                edges={edges}
                onNodesChange={onNodesChange}
                onEdgesChange={onEdgesChange}
                onConnect={onConnect}
            >
                <Controls />
                <Background />
            </ReactFlow>
        </div>
    );
}
