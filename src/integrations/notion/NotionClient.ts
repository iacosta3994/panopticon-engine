import { Client } from '@notionhq/client';
import logger from '../../lib/logger';
import { NotionPage, NotionDatabase } from './types';

export class NotionClient {
  private client: Client | null = null;
  private databaseId: string;
  private pageId: string;

  constructor() {
    const apiKey = process.env.NOTION_API_KEY;
    this.databaseId = process.env.NOTION_DATABASE_ID || '';
    this.pageId = process.env.NOTION_PAGE_ID || '';

    if (apiKey) {
      this.client = new Client({ auth: apiKey });
      logger.info('Notion client initialized');
    } else {
      logger.warn('Notion API key not configured');
    }
  }

  /**
   * Create a new page
   */
  async createPage(parentId: string, title: string, content: any[]): Promise<string | null> {
    if (!this.client) return null;

    try {
      const response = await this.client.pages.create({
        parent: { page_id: parentId },
        properties: {
          title: {
            title: [{ text: { content: title } }],
          },
        },
        children: content,
      });

      logger.info('Notion page created', { pageId: response.id, title });
      return response.id;
    } catch (error) {
      logger.error('Failed to create Notion page', { error });
      return null;
    }
  }

  /**
   * Add content to existing page
   */
  async appendBlocks(pageId: string, blocks: any[]): Promise<void> {
    if (!this.client) return;

    try {
      await this.client.blocks.children.append({
        block_id: pageId,
        children: blocks,
      });

      logger.info('Blocks appended to Notion page', { pageId, blockCount: blocks.length });
    } catch (error) {
      logger.error('Failed to append blocks to Notion page', { error });
    }
  }

  /**
   * Create database entry
   */
  async createDatabaseEntry(properties: Record<string, any>): Promise<string | null> {
    if (!this.client || !this.databaseId) return null;

    try {
      const response = await this.client.pages.create({
        parent: { database_id: this.databaseId },
        properties,
      });

      logger.info('Database entry created', { entryId: response.id });
      return response.id;
    } catch (error) {
      logger.error('Failed to create database entry', { error });
      return null;
    }
  }

  /**
   * Query database
   */
  async queryDatabase(filter?: any): Promise<any[]> {
    if (!this.client || !this.databaseId) return [];

    try {
      const response = await this.client.databases.query({
        database_id: this.databaseId,
        filter,
      });

      return response.results;
    } catch (error) {
      logger.error('Failed to query database', { error });
      return [];
    }
  }

  /**
   * Update page properties
   */
  async updatePage(pageId: string, properties: Record<string, any>): Promise<void> {
    if (!this.client) return;

    try {
      await this.client.pages.update({
        page_id: pageId,
        properties,
      });

      logger.info('Notion page updated', { pageId });
    } catch (error) {
      logger.error('Failed to update Notion page', { error });
    }
  }

  /**
   * Get page content
   */
  async getPageContent(pageId: string): Promise<any[]> {
    if (!this.client) return [];

    try {
      const response = await this.client.blocks.children.list({
        block_id: pageId,
      });

      return response.results;
    } catch (error) {
      logger.error('Failed to get page content', { error });
      return [];
    }
  }

  /**
   * Check if client is configured
   */
  isConfigured(): boolean {
    return this.client !== null;
  }

  /**
   * Get default database ID
   */
  getDatabaseId(): string {
    return this.databaseId;
  }

  /**
   * Get default page ID
   */
  getPageId(): string {
    return this.pageId;
  }
}
