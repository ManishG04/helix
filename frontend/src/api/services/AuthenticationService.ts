/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { LoginRequest } from '../models/LoginRequest';
import type { PasswordChangeRequest } from '../models/PasswordChangeRequest';
import type { RefreshTokenRequest } from '../models/RefreshTokenRequest';
import type { SuccessResponse } from '../models/SuccessResponse';
import type { TokenResponse } from '../models/TokenResponse';
import type { User } from '../models/User';
import type { UserCreate } from '../models/UserCreate';
import type { CancelablePromise } from '../core/CancelablePromise';
import { OpenAPI } from '../core/OpenAPI';
import { request as __request } from '../core/request';
export class AuthenticationService {
    /**
     * Register a new user
     * Create a new user account. Students can self-register, Faculty/Admin require admin approval.
     * @param requestBody
     * @returns User User registered successfully
     * @throws ApiError
     */
    public static register(
        requestBody: UserCreate,
    ): CancelablePromise<User> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/auth/register',
            body: requestBody,
            mediaType: 'application/json',
            errors: {
                400: `Invalid request data`,
                409: `Email already registered`,
                422: `Validation error`,
            },
        });
    }
    /**
     * User login
     * Authenticate user and receive JWT tokens
     * @param requestBody
     * @returns TokenResponse Login successful
     * @throws ApiError
     */
    public static login(
        requestBody: LoginRequest,
    ): CancelablePromise<TokenResponse> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/auth/login',
            body: requestBody,
            mediaType: 'application/json',
            errors: {
                401: `Invalid credentials`,
                422: `Validation error`,
            },
        });
    }
    /**
     * Refresh access token
     * Get a new access token using refresh token
     * @param requestBody
     * @returns TokenResponse Token refreshed successfully
     * @throws ApiError
     */
    public static refreshToken(
        requestBody: RefreshTokenRequest,
    ): CancelablePromise<TokenResponse> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/auth/refresh',
            body: requestBody,
            mediaType: 'application/json',
            errors: {
                401: `Authentication required or token invalid`,
            },
        });
    }
    /**
     * User logout
     * Invalidate current session/tokens
     * @returns SuccessResponse Logged out successfully
     * @throws ApiError
     */
    public static logout(): CancelablePromise<SuccessResponse> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/auth/logout',
            errors: {
                401: `Authentication required or token invalid`,
            },
        });
    }
    /**
     * Change password
     * Change the current user's password
     * @param requestBody
     * @returns SuccessResponse Password changed successfully
     * @throws ApiError
     */
    public static changePassword(
        requestBody: PasswordChangeRequest,
    ): CancelablePromise<SuccessResponse> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/auth/change-password',
            body: requestBody,
            mediaType: 'application/json',
            errors: {
                400: `Current password incorrect`,
                401: `Authentication required or token invalid`,
            },
        });
    }
}
