import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  createProject,
  getProjects,
  getProject,
  updateProject,
  deleteProject,
  ProjectInput,
  ProjectResponse,
} from "@/services/projectService";

const PROJECTS_KEY = ["projects"] as const;
const MY_PROJECTS_KEY = ["my-projects"] as const;
const PROJECT_KEY = (id: string) => ["project", id] as const;

/** CREATE */
export function useCreateProject() {
  const queryClient = useQueryClient();

  return useMutation<ProjectResponse, Error, ProjectInput>({
    mutationFn: createProject,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: PROJECTS_KEY });
      queryClient.invalidateQueries({ queryKey: MY_PROJECTS_KEY });
    },
  });
}

/** READ ALL */
export function useProjects(page: number = 1, limit: number = 10) {
  return useQuery<ProjectResponse[], Error>({
    queryKey: [...PROJECTS_KEY, page, limit],
    queryFn: () => getProjects(page, limit).then((data) => data.projects),
  });
}

/** READ ONE */
export function useProject(id: string) {
  return useQuery<ProjectResponse, Error>({
    queryKey: PROJECT_KEY(id),
    queryFn: () => getProject(id),
  });
}

/** UPDATE */
export function useUpdateProject() {
  const queryClient = useQueryClient();

  return useMutation<
    ProjectResponse, // return type
    Error, // error type
    { id: string; data: Partial<ProjectInput> } // variables
  >({
    mutationFn: ({ id, data }) => updateProject(id, data),
    onSuccess: (updated) => {
      queryClient.setQueryData(PROJECT_KEY(updated.id), updated);
      queryClient.invalidateQueries({ queryKey: PROJECTS_KEY });
    },
  });
}

/** DELETE */
export function useDeleteProject() {
  const queryClient = useQueryClient();

  return useMutation<void, Error, string>({
    mutationFn: deleteProject,
    onSuccess: (_, deletedId) => {
      queryClient.removeQueries({ queryKey: PROJECT_KEY(deletedId) });
      queryClient.invalidateQueries({ queryKey: PROJECTS_KEY });
    },
  });
}
