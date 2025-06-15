"use client";

import { z } from "zod";
import Cookies from "js-cookie";

const ProjectSchema = z.object({
  id: z.string(),
  title: z.string(),
  description: z.string(),
  goal: z.number(),
  raised: z.number(),
  created_at: z.coerce.date(),
  image_url: z.string().optional(),
  project_link: z.string().optional(),
  repo_link: z.string().optional(),
  user: z
    .object({
      id: z.string(),
      name: z.string(),
      email: z.string(),
    })
    .optional(),
});

const ProjectsSchema = z.array(ProjectSchema);
export type Project = z.infer<typeof ProjectSchema>;

export async function getProjects() {
  if (typeof window === "undefined") {
    return [];
  }

  const token = Cookies.get("token");
  if (!token) return [];

  const res = await fetch("http://localhost:9090/user/projects", {
    headers: {
      Authorization: `Bearer ${token}`,
    },
    credentials: "include",
    cache: "no-store",
  });

  if (!res.ok) throw new Error("Failed to fetch projects");
  const data = await res.json();
  return ProjectsSchema.parse(data);
}
