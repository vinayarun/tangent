# Tangent Architecture

## Core Philosophy

Tangent is built around one central idea:

> The Knowledge Graph + Conversation Engine is the product core. UI is replaceable.

---

## High-Level System Overview

User Interface
↓
Visualization Plugins
↓
Knowledge Graph Engine
↓
Conversation Engine
↓
Persistence + AI Providers


---

## Core Modules

### 1. Conversation Engine

Responsible for:

- Maintaining full conversation transcript
- Supporting branching nodes
- Managing context snapshots
- Emitting structured events

---

### 2. Knowledge Graph Engine

Responsible for:

- Extracting structured knowledge from conversations
- Maintaining concept relationships
- Generating layered summaries
- Versioning knowledge states

---

### 3. AI Context Compression Layer

Responsible for:

- Selecting relevant conversation context
- Generating summaries for AI prompts
- Model-agnostic prompt packaging

---

### 4. AI Provider Layer

Responsibilities:

- Adapter pattern for multiple LLM providers
- Normalized request/response interface
- Plugin-based provider registration

---

### 5. Visualization Framework

Responsibilities:

- Plugin-based cognitive views
- Event subscription architecture
- Independent UI modules

---

### 6. Persistence Layer

Stores:

- Full compressed transcripts
- Knowledge graph
- Summaries
- Branch metadata

---

### 7. Desktop Shell

Responsibilities:

- Cross-platform container
- Plugin host
- UI workspace orchestration

---

## Event-Driven Design

Modules communicate via structured events:

- ConversationUpdated
- KnowledgeGraphUpdated
- SummaryGenerated
- BranchCreated

---

## Architectural Goals

- Replaceable UI
- Strong typing across modules
- Plugin-first extensibility
- Local-first storage
- Open-source friendly modularity
