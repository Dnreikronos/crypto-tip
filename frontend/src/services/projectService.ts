import { getAuthHeaders } from "@/lib/auth";
import { z } from "zod";

const userSchema = z.object({
  id: z.string(),
  name: z.string(),
  email: z.string().email(),
});

const projectSchema = z.object({
  id: z.string(),
  title: z.string(),
  description: z.string(),
  goal: z.number(),
  wallet_addr: z.string(),
  project_link: z.string().url().optional(),
  repo_link: z.string().url().optional(),
  image_url: z.string().optional(),
  created_at: z.string(),
  updated_at: z.string(),
  raised: z.number().default(0),
  creator: userSchema.optional(),
});

const paginatedResponseSchema = z.object({
  projects: z.array(projectSchema),
  pagination: z.object({
    total: z.number(),
    page: z.number(),
    limit: z.number(),
    pages: z.number(),
  }),
});

export interface ProjectInput {
  title: string;
  description: string;
  goal: string;
  wallet_addr: string;
  project_link?: string;
  repo_link?: string;
  image_url?: string;
}

export type ProjectResponse = z.infer<typeof projectSchema>;

export type PaginatedResponse = z.infer<typeof paginatedResponseSchema>;

const API_URL = process.env.NEXT_PUBLIC_API_URL || "";

/**
 * Creates a new project
 * @param projectData Project data to be created
 * @returns Created project data
 * @throws Error if the request fails
 */
export async function createProject(
  projectData: ProjectInput,
): Promise<ProjectResponse> {
  const headers = await getAuthHeaders();

  const formattedData = {
    ...projectData,
    goal:
      typeof projectData.goal === "string"
        ? parseFloat(projectData.goal)
        : projectData.goal,
  };

  const response = await fetch(`${API_URL}/projects`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...headers,
    },
    body: JSON.stringify(formattedData),
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.error || "Failed to create project");
  }

  return response.json();
}

/**
 * Gets all projects with pagination
 * @param page Page number (1-based)
 * @param limit Number of items per page
 * @returns Paginated list of projects
 * @throws Error if the request fails
 */
export async function getProjects(
  page: number = 1,
  limit: number = 10,
): Promise<PaginatedResponse> {
  const headers = await getAuthHeaders();

  const response = await fetch(
    `${API_URL}/projects?page=${page}&limit=${limit}`,
    {
      headers,
    },
  );

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.error || "Failed to fetch projects");
  }

  const data = await response.json();
  return paginatedResponseSchema.parse(data);
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
    throw new Error(errorData.error || "Failed to fetch project");
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
export async function updateProject(
  id: string,
  projectData: Partial<ProjectInput>,
): Promise<ProjectResponse> {
  const headers = await getAuthHeaders();

  const formattedData = {
    ...projectData,
    goal:
      projectData.goal && typeof projectData.goal === "string"
        ? parseFloat(projectData.goal)
        : projectData.goal,
  };

  const response = await fetch(`${API_URL}/projects/${id}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      ...headers,
    },
    body: JSON.stringify(formattedData),
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.error || "Failed to update project");
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
    method: "DELETE",
    headers,
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.error || "Failed to delete project");
  }
}
