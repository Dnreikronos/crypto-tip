import { getAuthHeaders } from '@/lib/auth';

export interface ProjectInput {
  title: string;
  description: string;
  goal: string;
  wallet_addr: string;
  project_link?: string;
  repo_link?: string;
}

export interface ProjectResponse {
  id: string;
  title: string;
  description: string;
  goal: number;
  wallet_addr: string;
  project_link: string;
  repo_link: string;
  created_at: string;
  updated_at: string;
  raised: number;
  creator?: {
    id: string;
    name: string;
    email: string;
  };
}

const API_URL = process.env.NEXT_PUBLIC_API_URL || '';

/**
 * Creates a new project
 * @param projectData Project data to be created
 * @returns Created project data
 * @throws Error if the request fails
 */
export async function createProject(projectData: ProjectInput): Promise<ProjectResponse> {
  const headers = await getAuthHeaders();
  
  // Convert goal to number if it's a string
  const formattedData = {
    ...projectData,
    goal: typeof projectData.goal === 'string' ? parseFloat(projectData.goal) : projectData.goal,
  };

  const response = await fetch(`${API_URL}/projects`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...headers,
    },
    body: JSON.stringify(formattedData),
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.error || 'Failed to create project');
  }

  return response.json();
}

/**
 * Gets all projects
 * @returns List of projects
 * @throws Error if the request fails
 */
export async function getProjects(): Promise<ProjectResponse[]> {
  const headers = await getAuthHeaders();
  
  const response = await fetch(`${API_URL}/projects`, {
    headers,
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.error || 'Failed to fetch projects');
  }

  return response.json();
}

/**
 * Gets a specific project by ID
 * @param id Project ID
 * @returns Project data
 * @throws Error if the request fails
 */
export async function getProject(id: string): Promise<ProjectResponse> {
  const headers = await getAuthHeaders();
  
  const response = await fetch(`${API_URL}/projects/${id}`, {
    headers,
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.error || 'Failed to fetch project');
  }

  return response.json();
}

/**
 * Updates a project
 * @param id Project ID
 * @param projectData Project data to update
 * @returns Updated project data
 * @throws Error if the request fails
 */
export async function updateProject(id: string, projectData: Partial<ProjectInput>): Promise<ProjectResponse> {
  const headers = await getAuthHeaders();
  
  // Convert goal to number if it's a string
  const formattedData = {
    ...projectData,
    goal: projectData.goal && typeof projectData.goal === 'string' 
      ? parseFloat(projectData.goal) 
      : projectData.goal,
  };

  const response = await fetch(`${API_URL}/projects/${id}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      ...headers,
    },
    body: JSON.stringify(formattedData),
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.error || 'Failed to update project');
  }

  return response.json();
}

/**
 * Deletes a project
 * @param id Project ID
 * @returns Success status
 * @throws Error if the request fails
 */
export async function deleteProject(id: string): Promise<void> {
  const headers = await getAuthHeaders();
  
  const response = await fetch(`${API_URL}/projects/${id}`, {
    method: 'DELETE',
    headers,
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.error || 'Failed to delete project');
  }
}