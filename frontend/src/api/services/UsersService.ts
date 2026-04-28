/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { PaginatedResponse } from '../models/PaginatedResponse';
import type { User } from '../models/User';
import type { UserRole } from '../models/UserRole';
import type { UserUpdate } from '../models/UserUpdate';
import type { CancelablePromise } from '../core/CancelablePromise';
import { OpenAPI } from '../core/OpenAPI';
import { request as __request } from '../core/request';
export class UsersService {
    /**
     * Get current user profile
     * Retrieve the authenticated user's profile information
     * @returns User User profile retrieved successfully
     * @throws ApiError
     */
    public static getCurrentUser(): CancelablePromise<User> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/users/me',
            errors: {
                401: `Authentication required or token invalid`,
            },
        });
    }
    /**
     * Update current user profile
     * Update the authenticated user's profile information
     * @param requestBody
     * @returns User Profile updated successfully
     * @throws ApiError
     */
    public static updateCurrentUser(
        requestBody: UserUpdate,
    ): CancelablePromise<User> {
        return __request(OpenAPI, {
            method: 'PUT',
            url: '/users/me',
            body: requestBody,
            mediaType: 'application/json',
            errors: {
                401: `Authentication required or token invalid`,
                422: `Validation error`,
            },
        });
    }
    /**
     * List all users
     * Get a paginated list of users. Admin only or filtered by role.
     * @param page Page number (1-indexed)
     * @param size Number of items per page
     * @param role Filter users by role
     * @param search Search by name or email
     * @returns any Users retrieved successfully
     * @throws ApiError
     */
    public static listUsers(
        page: number = 1,
        size: number = 20,
        role?: UserRole,
        search?: string,
    ): CancelablePromise<(PaginatedResponse & {
        items?: Array<User>;
    })> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/users',
            query: {
                'page': page,
                'size': size,
                'role': role,
                'search': search,
            },
            errors: {
                401: `Authentication required or token invalid`,
                403: `Insufficient permissions`,
            },
        });
    }
    /**
     * Get user by ID
     * Retrieve a specific user's profile
     * @param userId User UUID
     * @returns User User retrieved successfully
     * @throws ApiError
     */
    public static getUserById(
        userId: string,
    ): CancelablePromise<User> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/users/{user_id}',
            path: {
                'user_id': userId,
            },
            errors: {
                401: `Authentication required or token invalid`,
                404: `Resource not found`,
            },
        });
    }
    /**
     * Delete user
     * Delete a user account. Admin only.
     * @param userId User UUID
     * @returns void
     * @throws ApiError
     */
    public static deleteUser(
        userId: string,
    ): CancelablePromise<void> {
        return __request(OpenAPI, {
            method: 'DELETE',
            url: '/users/{user_id}',
            path: {
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
     * List faculty members
     * Get a list of all faculty members (for student use when searching mentors)
     * @param page Page number (1-indexed)
     * @param size Number of items per page
     * @param search Search by name or academic interests
     * @returns any Faculty list retrieved successfully
     * @throws ApiError
     */
    public static listFaculty(
        page: number = 1,
        size: number = 20,
        search?: string,
    ): CancelablePromise<(PaginatedResponse & {
        items?: Array<User>;
    })> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/users/faculty',
            query: {
                'page': page,
                'size': size,
                'search': search,
            },
            errors: {
                401: `Authentication required or token invalid`,
            },
        });
    }
    /**
     * Admin - List all users
     * Admin only - Get all users with advanced filtering
     * @param page Page number (1-indexed)
     * @param size Number of items per page
     * @param role
     * @param createdAfter
     * @param createdBefore
     * @returns any Users retrieved successfully
     * @throws ApiError
     */
    public static adminListUsers(
        page: number = 1,
        size: number = 20,
        role?: UserRole,
        createdAfter?: string,
        createdBefore?: string,
    ): CancelablePromise<(PaginatedResponse & {
        items?: Array<User>;
    })> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/admin/users',
            query: {
                'page': page,
                'size': size,
                'role': role,
                'created_after': createdAfter,
                'created_before': createdBefore,
            },
            errors: {
                401: `Authentication required or token invalid`,
                403: `Insufficient permissions`,
            },
        });
    }
    /**
     * Admin - Get system statistics
     * Admin only - Get overall system statistics
     * @returns any Statistics retrieved successfully
     * @throws ApiError
     */
    public static getSystemStats(): CancelablePromise<{
        total_users?: number;
        users_by_role?: {
            STUDENT?: number;
            FACULTY?: number;
            ADMIN?: number;
        };
        total_projects?: number;
        projects_by_status?: {
            PROPOSED?: number;
            APPROVED?: number;
            COMPLETED?: number;
        };
        total_teams?: number;
        total_appointments?: number;
        appointments_by_status?: {
            PENDING?: number;
            ACCEPTED?: number;
            REJECTED?: number;
        };
    }> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/admin/stats',
            errors: {
                401: `Authentication required or token invalid`,
                403: `Insufficient permissions`,
            },
        });
    }
}
