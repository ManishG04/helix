/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { AvailabilityStatus } from '../models/AvailabilityStatus';
import type { DayOfWeek } from '../models/DayOfWeek';
import type { FacultyAvailability } from '../models/FacultyAvailability';
import type { FacultyAvailabilityCreate } from '../models/FacultyAvailabilityCreate';
import type { FacultyAvailabilityUpdate } from '../models/FacultyAvailabilityUpdate';
import type { CancelablePromise } from '../core/CancelablePromise';
import { OpenAPI } from '../core/OpenAPI';
import { request as __request } from '../core/request';
export class FacultyAvailabilityService {
    /**
     * Get current user's availability
     * Get the authenticated faculty member's availability slots
     * @param status Filter by slot status
     * @param dayOfWeek Filter by day of week
     * @returns FacultyAvailability Availability slots retrieved successfully
     * @throws ApiError
     */
    public static getMyAvailability(
        status?: AvailabilityStatus,
        dayOfWeek?: DayOfWeek,
    ): CancelablePromise<Array<FacultyAvailability>> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/faculty/availability',
            query: {
                'status': status,
                'day_of_week': dayOfWeek,
            },
            errors: {
                401: `Authentication required or token invalid`,
                403: `Not a faculty member`,
            },
        });
    }
    /**
     * Add availability slot
     * Manually add a new availability slot. Faculty only.
     * @param requestBody
     * @returns FacultyAvailability Availability slot added successfully
     * @throws ApiError
     */
    public static addAvailability(
        requestBody: FacultyAvailabilityCreate,
    ): CancelablePromise<FacultyAvailability> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/faculty/availability',
            body: requestBody,
            mediaType: 'application/json',
            errors: {
                401: `Authentication required or token invalid`,
                403: `Insufficient permissions`,
                409: `Overlapping slot exists`,
                422: `Validation error`,
            },
        });
    }
    /**
     * Get faculty member's availability
     * Get a specific faculty member's active availability slots (for students to book appointments)
     * @param userId User UUID
     * @param dayOfWeek Filter by day of week
     * @returns FacultyAvailability Availability slots retrieved successfully
     * @throws ApiError
     */
    public static getFacultyAvailability(
        userId: string,
        dayOfWeek?: DayOfWeek,
    ): CancelablePromise<Array<FacultyAvailability>> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/faculty/{user_id}/availability',
            path: {
                'user_id': userId,
            },
            query: {
                'day_of_week': dayOfWeek,
            },
            errors: {
                401: `Authentication required or token invalid`,
                404: `Resource not found`,
            },
        });
    }
    /**
     * Get availability slot details
     * Get details of a specific availability slot
     * @param availabilityId Faculty Availability UUID
     * @returns FacultyAvailability Availability slot retrieved successfully
     * @throws ApiError
     */
    public static getAvailabilitySlot(
        availabilityId: string,
    ): CancelablePromise<FacultyAvailability> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/faculty/availability/{availability_id}',
            path: {
                'availability_id': availabilityId,
            },
            errors: {
                401: `Authentication required or token invalid`,
                404: `Resource not found`,
            },
        });
    }
    /**
     * Update availability slot
     * Update an existing availability slot. Faculty owner only.
     * @param availabilityId Faculty Availability UUID
     * @param requestBody
     * @returns FacultyAvailability Availability slot updated successfully
     * @throws ApiError
     */
    public static updateAvailability(
        availabilityId: string,
        requestBody: FacultyAvailabilityUpdate,
    ): CancelablePromise<FacultyAvailability> {
        return __request(OpenAPI, {
            method: 'PUT',
            url: '/faculty/availability/{availability_id}',
            path: {
                'availability_id': availabilityId,
            },
            body: requestBody,
            mediaType: 'application/json',
            errors: {
                401: `Authentication required or token invalid`,
                403: `Insufficient permissions`,
                404: `Resource not found`,
                409: `Overlapping slot exists`,
            },
        });
    }
    /**
     * Delete availability slot
     * Delete an availability slot. Faculty owner only. Cannot delete if appointments are scheduled.
     * @param availabilityId Faculty Availability UUID
     * @returns void
     * @throws ApiError
     */
    public static deleteAvailability(
        availabilityId: string,
    ): CancelablePromise<void> {
        return __request(OpenAPI, {
            method: 'DELETE',
            url: '/faculty/availability/{availability_id}',
            path: {
                'availability_id': availabilityId,
            },
            errors: {
                401: `Authentication required or token invalid`,
                403: `Insufficient permissions`,
                404: `Resource not found`,
                409: `Cannot delete - appointments exist for this slot`,
            },
        });
    }
    /**
     * Bulk add availability slots
     * Add multiple availability slots at once. Faculty only.
     * @param requestBody
     * @returns any Availability slots added successfully
     * @throws ApiError
     */
    public static bulkAddAvailability(
        requestBody: {
            slots: Array<FacultyAvailabilityCreate>;
        },
    ): CancelablePromise<{
        /**
         * Number of slots created
         */
        created?: number;
        /**
         * Number of slots skipped due to conflicts
         */
        skipped?: number;
        slots?: Array<FacultyAvailability>;
    }> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/faculty/availability/bulk',
            body: requestBody,
            mediaType: 'application/json',
            errors: {
                401: `Authentication required or token invalid`,
                403: `Insufficient permissions`,
            },
        });
    }
    /**
     * Bulk delete availability slots
     * Delete multiple availability slots. Faculty only.
     * @param requestBody
     * @returns any Availability slots deleted
     * @throws ApiError
     */
    public static bulkDeleteAvailability(
        requestBody: {
            slot_ids: Array<string>;
        },
    ): CancelablePromise<{
        deleted?: number;
        /**
         * Slots skipped due to existing appointments
         */
        skipped?: number;
    }> {
        return __request(OpenAPI, {
            method: 'DELETE',
            url: '/faculty/availability/bulk',
            body: requestBody,
            mediaType: 'application/json',
            errors: {
                401: `Authentication required or token invalid`,
                403: `Insufficient permissions`,
            },
        });
    }
}
