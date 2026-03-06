import logger from '../lib/logger';
import supabase from '../lib/supabase';
import { Entity, EntityRelationship, Observation } from '../lib/types';
import { generateId } from '../lib/utils';

export class RelationshipMapper {
  /**
   * Discover and map entity relationships from observations
   */
  async mapRelationships(observations: Observation[]): Promise<EntityRelationship[]> {
    try {
      const relationships: EntityRelationship[] = [];

      // Extract entities from observations
      const entities = await this.extractEntities(observations);

      // Find relationships between entities
      for (let i = 0; i < entities.length; i++) {
        for (let j = i + 1; j < entities.length; j++) {
          const relationship = await this.findRelationship(entities[i], entities[j], observations);
          if (relationship) {
            relationships.push(relationship);
          }
        }
      }

      logger.info('Relationships mapped', { count: relationships.length });
      return relationships;
    } catch (error) {
      logger.error('Failed to map relationships', { error });
      return [];
    }
  }

  /**
   * Extract entities from observations
   */
  private async extractEntities(observations: Observation[]): Promise<Entity[]> {
    const entityMap = new Map<string, Entity>();

    for (const obs of observations) {
      const extractedEntities = this.extractEntitiesFromObservation(obs);
      
      for (const entity of extractedEntities) {
        const key = `${entity.entity_type}:${entity.identifier}`;
        
        if (entityMap.has(key)) {
          // Update existing entity
          const existing = entityMap.get(key)!;
          existing.observation_count++;
          existing.last_observed_at = new Date();
        } else {
          entityMap.set(key, entity);
        }
      }
    }

    return Array.from(entityMap.values());
  }

  /**
   * Extract entities from a single observation
   */
  private extractEntitiesFromObservation(observation: Observation): Entity[] {
    const entities: Entity[] = [];
    const payload = observation.payload;

    // Extract user entities
    if (payload.user_id || payload.username) {
      entities.push({
        id: generateId(),
        entity_type: 'user',
        identifier: payload.user_id || payload.username,
        name: payload.user_name || payload.username,
        attributes: {
          email: payload.email,
          role: payload.role,
        },
        metadata: {},
        confidence_score: 90,
        first_observed_at: observation.observed_at,
        last_observed_at: observation.observed_at,
        observation_count: 1,
        status: 'active',
        created_at: new Date(),
        updated_at: new Date(),
      });
    }

    // Extract service entities
    if (payload.service || payload.service_name) {
      entities.push({
        id: generateId(),
        entity_type: 'service',
        identifier: payload.service || payload.service_name,
        name: payload.service_name,
        attributes: {
          version: payload.version,
          environment: payload.environment,
        },
        metadata: {},
        confidence_score: 95,
        first_observed_at: observation.observed_at,
        last_observed_at: observation.observed_at,
        observation_count: 1,
        status: 'active',
        created_at: new Date(),
        updated_at: new Date(),
      });
    }

    // Extract host entities
    if (payload.host || payload.hostname || payload.server) {
      entities.push({
        id: generateId(),
        entity_type: 'host',
        identifier: payload.host || payload.hostname || payload.server,
        name: payload.hostname || payload.server,
        attributes: {
          ip_address: payload.ip_address,
          region: payload.region,
        },
        metadata: {},
        confidence_score: 85,
        first_observed_at: observation.observed_at,
        last_observed_at: observation.observed_at,
        observation_count: 1,
        status: 'active',
        created_at: new Date(),
        updated_at: new Date(),
      });
    }

    return entities;
  }

  /**
   * Find relationship between two entities
   */
  private async findRelationship(
    sourceEntity: Entity,
    targetEntity: Entity,
    observations: Observation[]
  ): Promise<EntityRelationship | null> {
    // Find co-occurring observations
    const coOccurrences = observations.filter(obs => {
      const payload = obs.payload;
      return this.observationContainsEntity(payload, sourceEntity) &&
             this.observationContainsEntity(payload, targetEntity);
    });

    if (coOccurrences.length === 0) return null;

    // Determine relationship type
    const relationshipType = this.determineRelationshipType(sourceEntity, targetEntity, coOccurrences);
    
    const relationship: EntityRelationship = {
      id: generateId(),
      source_entity_id: sourceEntity.id,
      target_entity_id: targetEntity.id,
      relationship_type: relationshipType,
      properties: this.extractRelationshipProperties(coOccurrences),
      strength: this.calculateRelationshipStrength(coOccurrences.length, observations.length),
      first_observed_at: coOccurrences[0].observed_at,
      last_observed_at: coOccurrences[coOccurrences.length - 1].observed_at,
      observation_count: coOccurrences.length,
      created_at: new Date(),
      updated_at: new Date(),
    };

    // Store relationship in database
    await this.storeRelationship(relationship);

    return relationship;
  }

  /**
   * Check if observation contains entity
   */
  private observationContainsEntity(payload: Record<string, any>, entity: Entity): boolean {
    const identifier = entity.identifier.toLowerCase();
    const payloadStr = JSON.stringify(payload).toLowerCase();
    return payloadStr.includes(identifier);
  }

  /**
   * Determine relationship type between entities
   */
  private determineRelationshipType(
    sourceEntity: Entity,
    targetEntity: Entity,
    observations: Observation[]
  ): 'depends_on' | 'communicates_with' | 'owns' | 'accesses' | 'deployed_on' {
    // Service to service relationships
    if (sourceEntity.entity_type === 'service' && targetEntity.entity_type === 'service') {
      return 'communicates_with';
    }

    // Service to host relationships
    if (sourceEntity.entity_type === 'service' && targetEntity.entity_type === 'host') {
      return 'deployed_on';
    }

    // User to resource relationships
    if (sourceEntity.entity_type === 'user') {
      return 'accesses';
    }

    // Default
    return 'communicates_with';
  }

  /**
   * Extract relationship properties from observations
   */
  private extractRelationshipProperties(observations: Observation[]): Record<string, any> {
    const properties: Record<string, any> = {
      interaction_count: observations.length,
    };

    // Extract common properties
    const protocols = new Set<string>();
    const methods = new Set<string>();

    for (const obs of observations) {
      if (obs.payload.protocol) protocols.add(obs.payload.protocol);
      if (obs.payload.method) methods.add(obs.payload.method);
    }

    if (protocols.size > 0) properties.protocols = Array.from(protocols);
    if (methods.size > 0) properties.methods = Array.from(methods);

    return properties;
  }

  /**
   * Calculate relationship strength
   */
  private calculateRelationshipStrength(coOccurrences: number, totalObservations: number): number {
    const ratio = coOccurrences / totalObservations;
    return Math.min(100, ratio * 100);
  }

  /**
   * Store relationship in database
   */
  private async storeRelationship(relationship: EntityRelationship): Promise<void> {
    if (!supabase) return;

    try {
      const { error } = await supabase
        .from('entity_relationships')
        .upsert([relationship], {
          onConflict: 'source_entity_id,target_entity_id',
        });

      if (error) throw error;
    } catch (error) {
      logger.error('Failed to store relationship', { error });
    }
  }

  /**
   * Build dependency graph
   */
  async buildDependencyGraph(rootEntityId: string, maxDepth: number = 3): Promise<any> {
    if (!supabase) return null;

    const graph = {
      nodes: new Map<string, Entity>(),
      edges: [] as EntityRelationship[],
    };

    await this.traverseDependencies(rootEntityId, graph, 0, maxDepth);

    return {
      nodes: Array.from(graph.nodes.values()),
      edges: graph.edges,
    };
  }

  /**
   * Recursively traverse dependencies
   */
  private async traverseDependencies(
    entityId: string,
    graph: { nodes: Map<string, Entity>; edges: EntityRelationship[] },
    depth: number,
    maxDepth: number
  ): Promise<void> {
    if (depth >= maxDepth || graph.nodes.has(entityId)) return;

    // Fetch entity
    const { data: entity, error: entityError } = await supabase!
      .from('entities')
      .select('*')
      .eq('id', entityId)
      .single();

    if (entityError || !entity) return;

    graph.nodes.set(entityId, entity);

    // Fetch relationships
    const { data: relationships, error: relError } = await supabase!
      .from('entity_relationships')
      .select('*')
      .eq('source_entity_id', entityId);

    if (relError || !relationships) return;

    graph.edges.push(...relationships);

    // Traverse dependencies
    for (const rel of relationships) {
      await this.traverseDependencies(rel.target_entity_id, graph, depth + 1, maxDepth);
    }
  }
}
