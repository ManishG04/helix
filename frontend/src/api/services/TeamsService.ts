/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { JoinTeamRequest } from '../models/JoinTeamRequest';
import type { PaginatedResponse } from '../models/PaginatedResponse';
import type { Team } from '../models/Team';
import type { TeamBase } from '../models/TeamBase';
import type { TeamCreate } from '../models/TeamCreate';
import type { TeamMember } from '../models/TeamMember';
import type { TeamMemberAdd } from '../models/TeamMemberAdd';
import type { TeamWithMembers } from '../models/TeamWithMembers';
import type { CancelablePromise } from '../core/CancelablePromise';
import { OpenAPI } from '../core/OpenAPI';
import { request as __request } from '../core/request';
export class TeamsService {
    /**
     * List teams
     * Get a list of teams. Students see their teams, Faculty see teams of mentored projects.
     * @param page Page number (1-indexed)
     * @param size Number of items per page
     * @param projectId Filter by project ID
     * @returns any Teams retrieved successfully
     * @throws ApiError
     */
    public static listTeams(
        page: number = 1,
        size: number = 20,
        projectId?: string,
    ): CancelablePromise<(PaginatedResponse & {
        items?: Array<Team>;
    })> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/teams',
            query: {
                'page': page,
                'size': size,
                'project_id': projectId,
            },
            errors: {
                401: `Authentication required or token invalid`,
            },
        });
    }
    /**
     * Create a new team
     * Create a new team for a project. Creator becomes team leader.
     * @param requestBody
     * @returns Team Team created successfully
     * @throws ApiError
     */
    public static createTeam(
        requestBody: TeamCreate,
    ): CancelablePromise<Team> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/teams',
            body: requestBody,
            mediaType: 'application/json',
            errors: {
                401: `Authentication required or token invalid`,
                403: `Insufficient permissions`,
                409: `Project already has a team`,
                422: `Validation error`,
            },
        });
    }
    /**
     * Get team details
     * Retrieve detailed information about a team including members
     * @param teamId Team UUID
     * @returns TeamWithMembers Team retrieved successfully
     * @throws ApiError
     */
    public static getTeam(
        teamId: string,
    ): CancelablePromise<TeamWithMembers> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/teams/{team_id}',
            path: {
                'team_id': teamId,
            },
            errors: {
                401: `Authentication required or token invalid`,
                404: `Resource not found`,
            },
        });
    }
    /**
     * Update team
     * Update team details. Team leader only.
     * @param teamId Team UUID
     * @param requestBody
     * @returns Team Team updated successfully
     * @throws ApiError
     */
    public static updateTeam(
        teamId: string,
        requestBody: TeamBase,
    ): CancelablePromise<Team> {
        return __request(OpenAPI, {
            method: 'PUT',
            url: '/teams/{team_id}',
            path: {
                'team_id': teamId,
            },
            body: requestBody,
            mediaType: 'application/json',
            errors: {
                401: `Authentication required or token invalid`,
                403: `Insufficient permissions`,
                404: `Resource not found`,
            },
        });
    }
    /**
     * Delete team
     * Delete a team. Team leader or Admin only.
     * @param teamId Team UUID
     * @returns void
     * @throws ApiError
     */
    public static deleteTeam(
        teamId: string,
    ): CancelablePromise<void> {
        return __request(OpenAPI, {
            method: 'DELETE',
            url: '/teams/{team_id}',
            path: {
                'team_id': teamId,
            },
            errors: {
                401: `Authentication required or token invalid`,
                403: `Insufficient permissions`,
                404: `Resource not found`,
            },
        });
    }
    /**
     * List team members
     * Get all members of a team
     * @param teamId Team UUID
     * @returns TeamMember Team members retrieved successfully
     * @throws ApiError
     */
    public static listTeamMembers(
        teamId: string,
    ): CancelablePromise<Array<TeamMember>> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/teams/{team_id}/members',
            path: {
                'team_id': teamId,
            },
            errors: {
                401: `Authentication required or token invalid`,
                404: `Resource not found`,
            },
        });
    }
    /**
     * Add team member
     * Add a member to the team. Team leader only.
     * @param teamId Team UUID
     * @param requestBody
     * @returns TeamMember Member added successfully
     * @throws ApiError
     */
    public static addTeamMember(
        teamId: string,
        requestBody: TeamMemberAdd,
    ): CancelablePromise<TeamMember> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/teams/{team_id}/members',
            path: {
                'team_id': teamId,
            },
            body: requestBody,
            mediaType: 'application/json',
            errors: {
                401: `Authentication required or token invalid`,
                403: `Insufficient permissions`,
                404: `Resource not found`,
                409: `User already in a team or team is full`,
            },
        });
    }
    /**
     * Remove team member
     * Remove a member from the team. Team leader or self-removal only.
     * @param teamId Team UUID
     * @param userId User UUID
     * @returns void
     * @throws ApiError
     */
    public static removeTeamMember(
        teamId: string,
        userId: string,
    ): CancelablePromise<void> {
        return __request(OpenAPI, {
            method: 'DELETE',
            url: '/teams/{team_id}/members/{user_id}',
            path: {
                'team_id': teamId,
                'user_id': userId,
            },
            errors: {
                401: `Authentication required or token invalid`,
                403: `Insufficient permissions`,
                404: `Resource not found`,
            },
        });
    }
    /**
     * Transfer team leadership
     * Transfer team leadership to another member. Current leader only.
     * @param teamId Team UUID
     * @param requestBody
     * @returns TeamWithMembers Leadership transferred successfully
     * @throws ApiError
     */
    public static transferLeadership(
        teamId: string,
        requestBody: {
            new_leader_id: string;
        },
    ): CancelablePromise<TeamWithMembers> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/teams/{team_id}/transfer-leadership',
            path: {
                'team_id': teamId,
            },
            body: requestBody,
            mediaType: 'application/json',
            errors: {
                401: `Authentication required or token invalid`,
                403: `Insufficient permissions`,
                404: `Resource not found`,
            },
        });
    }
    /**
     * Join team using code
     * Join a team using the unique join code
     * @param requestBody
     * @returns TeamWithMembers Joined team successfully
     * @throws ApiError
     */
    public static joinTeam(
        requestBody: JoinTeamRequest,
    ): CancelablePromise<TeamWithMembers> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/teams/join',
            body: requestBody,
            mediaType: 'application/json',
            errors: {
                401: `Authentication required or token invalid`,
                404: `Invalid join code`,
                409: `Already in a team or team is full`,
            },
        });
    }
    /**
     * Regenerate join code
     * Generate a new join code for the team. Team leader only.
     * @param teamId Team UUID
     * @returns any Join code regenerated successfully
     * @throws ApiError
     */
    public static regenerateJoinCode(
        teamId: string,
    ): CancelablePromise<{
        join_code?: string;
    }> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/teams/{team_id}/regenerate-code',
            path: {
                'team_id': teamId,
            },
            errors: {
                401: `Authentication required or token invalid`,
                403: `Insufficient permissions`,
                404: `Resource not found`,
            },
        });
    }
}
