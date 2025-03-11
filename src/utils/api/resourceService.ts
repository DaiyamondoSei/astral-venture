
/**
 * Resource Service Factory
 * 
 * Creates type-safe CRUD services for API resources
 */

import { ApiClient, ResourceService, ApiError } from './types';
import { Result } from '../result/Result';
import { apiClient } from './apiClient';

/**
 * Create a resource service for type-safe CRUD operations
 * 
 * @param basePath - The base API path for the resource
 * @param client - Optional custom API client
 * @returns A type-safe resource service
 */
export function createResourceService<
  T extends { id: ID },
  ID = string,
  CreateDTO = Omit<T, 'id'>,
  UpdateDTO = Partial<T>
>(
  basePath: string,
  client: ApiClient = apiClient
): ResourceService<T, ID, CreateDTO, UpdateDTO> {
  return {
    async getAll(): Promise<Result<T[], ApiError>> {
      return client.get<T[]>(basePath);
    },
    
    async getById(id: ID): Promise<Result<T, ApiError>> {
      return client.get<T>(`${basePath}/${id}`);
    },
    
    async create(data: CreateDTO): Promise<Result<T, ApiError>> {
      return client.post<T, CreateDTO>(basePath, data);
    },
    
    async update(id: ID, data: UpdateDTO): Promise<Result<T, ApiError>> {
      return client.put<T, UpdateDTO>(`${basePath}/${id}`, data);
    },
    
    async remove(id: ID): Promise<Result<void, ApiError>> {
      return client.delete<void>(`${basePath}/${id}`);
    }
  };
}

/**
 * Type-safe function to create a custom service with additional methods
 * 
 * @param basePath - The base API path for the resource
 * @param customMethods - Custom methods to add to the service
 * @param client - Optional custom API client
 * @returns A type-safe resource service with custom methods
 */
export function createCustomService<
  T extends { id: ID },
  ID = string,
  CreateDTO = Omit<T, 'id'>,
  UpdateDTO = Partial<T>,
  CustomMethods = {}
>(
  basePath: string,
  customMethods: (client: ApiClient, basePath: string) => CustomMethods,
  client: ApiClient = apiClient
): ResourceService<T, ID, CreateDTO, UpdateDTO> & CustomMethods {
  const baseService = createResourceService<T, ID, CreateDTO, UpdateDTO>(basePath, client);
  const customService = customMethods(client, basePath);
  
  return {
    ...baseService,
    ...customService
  };
}
