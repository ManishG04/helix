/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { PaginatedResponse } from '../models/PaginatedResponse';
import type { Project } from '../models/Project';
import type { ProjectCreate } from '../models/ProjectCreate';
import type { ProjectPhase } from '../models/ProjectPhase';
import type { ProjectStatus } from '../models/ProjectStatus';
import type { ProjectUpdate } from '../models/ProjectUpdate';
import type { TeamWithMembers } from '../models/TeamWithMembers';
import type { User } from '../models/User';
import type { CancelablePromise } from '../core/CancelablePromise';
import { OpenAPI } from '../core/OpenAPI';
import { request as __request } from '../core/request';
export class ProjectsService {
    /**
     * List projects
     * Get a paginated list of projects. Students see their team's projects, Faculty see mentored projects, Admins see all.
     * @param page Page number (1-indexed)
     * @param size Number of items per page
     * @param status Filter by project status
     * @param phase Filter by current phase
     * @param mentorId Filter by mentor ID
     * @param search Search by title or description
     * @returns any Projects retrieved successfully
     * @throws ApiError
     */
    public static listProjects(
        page: number = 1,
        size: number = 20,
        status?: ProjectStatus,
        phase?: ProjectPhase,
        mentorId?: string,
        search?: string,
    ): CancelablePromise<(PaginatedResponse & {
        items?: Array<Project>;
    })> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/projects',
            query: {
                'page': page,
                'size': size,
                'status': status,
                'phase': phase,
                'mentor_id': mentorId,
                'search': search,
            },
            errors: {
                401: `Authentication required or token invalid`,
            },
        });
    }
    /**
     * Create a new project
     * Create a new project proposal. Typically done by team leader.
     * @param requestBody
     * @returns Project Project created successfully
     * @throws ApiError
     */
    public static createProject(
        requestBody: ProjectCreate,
    ): CancelablePromise<Project> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/projects',
            body: requestBody,
            mediaType: 'application/json',
            errors: {
                401: `Authentication required or token invalid`,
                403: `Insufficient permissions`,
                422: `Validation error`,
            },
        });
    }
    /**
     * Get project details
     * Retrieve detailed information about a specific project
     * @param projectId Project UUID
     * @returns any Project retrieved successfully
     * @throws ApiError
     */
    public static getProject(
        projectId: string,
    ): CancelablePromise<(Project & {
        mentor?: User;
        team?: TeamWithMembers;
    })> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/projects/{project_id}',
            path: {
                'project_id': projectId,
            },
            errors: {
                401: `Authentication required or token invalid`,
                404: `Resource not found`,
            },
        });
    }
    /**
     * Update project
     * Update project details. Team leaders can update title/description, Faculty can update status/phase.
     * @param projectId Project UUID
     * @param requestBody
     * @returns Project Project updated successfully
     * @throws ApiError
     */
    public static updateProject(
        projectId: string,
        requestBody: ProjectUpdate,
    ): CancelablePromise<Project> {
        return __request(OpenAPI, {
            method: 'PUT',
            url: '/projects/{project_id}',
            path: {
                'project_id': projectId,
            },
            body: requestBody,
            mediaType: 'application/json',
            errors: {
                401: `Authentication required or token invalid`,
                403: `Insufficient permissions`,
                404: `Resource not found`,
                422: `Validation error`,
            },
        });
    }
    /**
     * Delete project
     * Delete a project. Only allowed for PROPOSED projects or by Admin.
     * @param projectId Project UUID
     * @returns void
     * @throws ApiError
     */
    public static deleteProject(
        projectId: string,
    ): CancelablePromise<void> {
        return __request(OpenAPI, {
            method: 'DELETE',
            url: '/projects/{project_id}',
            path: {
                'project_id': projectId,
            },
            errors: {
                401: `Authentication required or token invalid`,
                403: `Insufficient permissions`,
                404: `Resource not found`,
            },
        });
    }
    /**
     * Approve project
     * Approve a proposed project. Faculty/Admin only.
     * @param projectId Project UUID
     * @returns Project Project approved successfully
     * @throws ApiError
     */
    public static approveProject(
        projectId: string,
    ): CancelablePromise<Project> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/projects/{project_id}/approve',
            path: {
                'project_id': projectId,
            },
            errors: {
                401: `Authentication required or token invalid`,
                403: `Insufficient permissions`,
                404: `Resource not found`,
                409: `Project already approved`,
            },
        });
    }
    /**
     * Advance project phase
     * Move project to the next phase. Faculty mentor only.
     * @param projectId Project UUID
     * @returns Project Project phase advanced successfully
     * @throws ApiError
     */
    public static advanceProjectPhase(
        projectId: string,
    ): CancelablePromise<Project> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/projects/{project_id}/advance-phase',
            path: {
                'project_id': projectId,
            },
            errors: {
                401: `Authentication required or token invalid`,
                403: `Insufficient permissions`,
                404: `Resource not found`,
                409: `Project already in final phase or not approved`,
            },
        });
    }
}
