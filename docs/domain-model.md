📄 Tangent Domain Model Specification (Draft v0.1)
1. Purpose

This document defines the canonical domain model for Tangent.

It establishes:

Core cognitive entities

Structural relationships between entities

Invariants that must hold across all modules

Conceptual boundaries between domains

This specification serves as the authoritative reference for:

Conversation Engine

Knowledge Graph Engine

AI Context Compression

Plugin APIs

Persistence Layer

2. Design Principles
2.1 Local-First Knowledge Ownership

All entities must support local persistence.

2.2 Branching Thought Representation

The system models conversations as non-linear thought graphs.

2.3 Multi-Layer Understanding

All information may exist in compressed or expanded forms.

2.4 Model-Agnostic AI Integration

Domain entities must remain independent of specific AI providers.

3. Domain Overview

Tangent consists of five core domains:

Conversation Domain
Knowledge Domain
Reasoning Domain
Summary Domain
Event Domain

4. Conversation Domain

The Conversation Domain represents the unfolding interaction between user and AI.

4.1 ConversationSession
Purpose

Represents a complete research or thinking session.

Relationships

Contains multiple ConversationNodes

Contains Branches

Required Fields

id

createdAt

updatedAt

title

4.2 ConversationNode
Purpose

Represents a single conversational step.

This is the fundamental unit of Tangent.

Relationships

Belongs to one ConversationSession

Has zero or one parent node

May have multiple child nodes

May reference Knowledge Entities

May contain Summary Layers

Required Fields

id

sessionId

content

role (user, assistant, system)

timestamp

Optional Fields

metadata

linkedKnowledgeIds

summaryIds

Invariants

Root node must have no parent

All other nodes must have exactly one parent

Nodes must form a directed acyclic graph

4.3 Branch
Purpose

Represents divergence of thought from a specific node.

Relationships

Originates from a ConversationNode

Contains multiple descendant nodes

Required Fields

id

rootNodeId

createdAt

5. Knowledge Domain

Represents structured understanding extracted from conversation.

5.1 KnowledgeEntity
Purpose

Represents a concept, topic, or idea.

Relationships

May connect to other KnowledgeEntities

May be referenced by ConversationNodes

May contain Claims and Evidence

Required Fields

id

label

type (concept, topic, question, etc.)

5.2 KnowledgeRelation
Purpose

Represents conceptual relationship between entities.

Required Fields

id

sourceEntityId

targetEntityId

relationType

6. Reasoning Domain

Captures argumentative and analytical structure.

6.1 Claim
Purpose

Represents an assertion or conclusion.

Relationships

Supported or contradicted by Evidence

Associated with KnowledgeEntities

May originate from ConversationNodes

Required Fields

id

statement

confidenceScore (optional)

6.2 Evidence
Purpose

Represents supporting or contradicting information.

Required Fields

id

content

sourceType (conversation, external, inference)

7. Summary Domain

Represents compressed understanding across different abstraction levels.

7.1 SummaryLayer
Purpose

Stores progressive abstraction of information.

Levels

Sentence

Paragraph

Synthesis

Relationships

Associated with ConversationNodes or Branches

May reference KnowledgeEntities

Required Fields

id

summaryLevel

content

generatedAt

8. Event Domain

Represents state change notifications across system modules.

8.1 DomainEvent
Purpose

Represents atomic change in system state.

Required Fields

id

eventType

payload

timestamp

9. Cross-Domain Linking

Entities must support cross referencing:

ConversationNodes ↔ KnowledgeEntities

KnowledgeEntities ↔ Claims

Claims ↔ Evidence

Branches ↔ Summaries

10. Identity and Versioning

All domain entities must:

Use globally unique identifiers

Support version metadata

Support future collaborative editing

11. Extensibility Requirements

All domain entities must support:

Plugin-defined metadata fields

Schema-safe extensions

12. Future Considerations

(Not required for v1)

Multi-user collaboration

Knowledge graph merging

Temporal reasoning overlays

Provenance tracking
