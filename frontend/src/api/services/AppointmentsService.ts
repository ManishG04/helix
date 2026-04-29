/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { Appointment } from '../models/Appointment';
import type { AppointmentCreate } from '../models/AppointmentCreate';
import type { AppointmentStatus } from '../models/AppointmentStatus';
import type { AppointmentUpdate } from '../models/AppointmentUpdate';
import type { AppointmentWithDetails } from '../models/AppointmentWithDetails';
import type { PaginatedResponse } from '../models/PaginatedResponse';
import type { CancelablePromise } from '../core/CancelablePromise';
import { OpenAPI } from '../core/OpenAPI';
import { request as __request } from '../core/request';
export class AppointmentsService {
    /**
     * List appointments
     * Get a list of appointments.
     * - Students see their own appointments
     * - Faculty see appointments where they are the faculty
     * - Admins see all appointments
     *
     * @param page Page number (1-indexed)
     * @param size Number of items per page
     * @param status Filter by appointment status
     * @param dateFrom Filter appointments from this date
     * @param dateTo Filter appointments until this date
     * @param facultyId Filter by faculty ID
     * @param teamId Filter by team ID
     * @returns any Appointments retrieved successfully
     * @throws ApiError
     */
    public static listAppointments(
        page: number = 1,
        size: number = 20,
        status?: AppointmentStatus,
        dateFrom?: string,
        dateTo?: string,
        facultyId?: string,
        teamId?: string,
    ): CancelablePromise<(PaginatedResponse & {
        items?: Array<AppointmentWithDetails>;
    })> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/appointments',
            query: {
                'page': page,
                'size': size,
                'status': status,
                'date_from': dateFrom,
                'date_to': dateTo,
                'faculty_id': facultyId,
                'team_id': teamId,
            },
            errors: {
                401: `Authentication required or token invalid`,
            },
        });
    }
    /**
     * Book an appointment
     * Book a new appointment with a faculty member
     * @param requestBody
     * @returns Appointment Appointment booked successfully
     * @throws ApiError
     */
    public static createAppointment(
        requestBody: AppointmentCreate,
    ): CancelablePromise<Appointment> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/appointments',
            body: requestBody,
            mediaType: 'application/json',
            errors: {
                401: `Authentication required or token invalid`,
                404: `Faculty or slot not found`,
                409: `Time slot not available or conflicts with existing appointment`,
                422: `Validation error`,
            },
        });
    }
    /**
     * Get appointment details
     * Retrieve detailed information about a specific appointment
     * @param appointmentId Appointment UUID
     * @returns AppointmentWithDetails Appointment retrieved successfully
     * @throws ApiError
     */
    public static getAppointment(
        appointmentId: string,
    ): CancelablePromise<AppointmentWithDetails> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/appointments/{appointment_id}',
            path: {
                'appointment_id': appointmentId,
            },
            errors: {
                401: `Authentication required or token invalid`,
                403: `Insufficient permissions`,
                404: `Resource not found`,
            },
        });
    }
    /**
     * Update appointment
     * Update appointment details. Students can update purpose, Faculty can update status.
     * @param appointmentId Appointment UUID
     * @param requestBody
     * @returns Appointment Appointment updated successfully
     * @throws ApiError
     */
    public static updateAppointment(
        appointmentId: string,
        requestBody: AppointmentUpdate,
    ): CancelablePromise<Appointment> {
        return __request(OpenAPI, {
            method: 'PUT',
            url: '/appointments/{appointment_id}',
            path: {
                'appointment_id': appointmentId,
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
     * Cancel appointment
     * Cancel a pending appointment. Only the student who booked or admin can cancel.
     * @param appointmentId Appointment UUID
     * @returns void
     * @throws ApiError
     */
    public static cancelAppointment(
        appointmentId: string,
    ): CancelablePromise<void> {
        return __request(OpenAPI, {
            method: 'DELETE',
            url: '/appointments/{appointment_id}',
            path: {
                'appointment_id': appointmentId,
            },
            errors: {
                401: `Authentication required or token invalid`,
                403: `Insufficient permissions`,
                404: `Resource not found`,
                409: `Cannot cancel - appointment already accepted or past`,
            },
        });
    }
    /**
     * Accept appointment
     * Accept a pending appointment request. Faculty only.
     * @param appointmentId Appointment UUID
     * @returns Appointment Appointment accepted successfully
     * @throws ApiError
     */
    public static acceptAppointment(
        appointmentId: string,
    ): CancelablePromise<Appointment> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/appointments/{appointment_id}/accept',
            path: {
                'appointment_id': appointmentId,
            },
            errors: {
                401: `Authentication required or token invalid`,
                403: `Insufficient permissions`,
                404: `Resource not found`,
                409: `Appointment already processed`,
            },
        });
    }
    /**
     * Reject appointment
     * Reject a pending appointment request. Faculty only.
     * @param appointmentId Appointment UUID
     * @param requestBody
     * @returns Appointment Appointment rejected successfully
     * @throws ApiError
     */
    public static rejectAppointment(
        appointmentId: string,
        requestBody?: {
            /**
             * Optional reason for rejection
             */
            reason?: string;
        },
    ): CancelablePromise<Appointment> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/appointments/{appointment_id}/reject',
            path: {
                'appointment_id': appointmentId,
            },
            body: requestBody,
            mediaType: 'application/json',
            errors: {
                401: `Authentication required or token invalid`,
                403: `Insufficient permissions`,
                404: `Resource not found`,
                409: `Appointment already processed`,
            },
        });
    }
    /**
     * Get available appointment slots
     * Get available time slots for a faculty member on a specific date
     * @param facultyId Faculty member's user ID
     * @param date Date to check availability
     * @returns any Available slots retrieved successfully
     * @throws ApiError
     */
    public static getAvailableSlots(
        facultyId: string,
        date: string,
    ): CancelablePromise<Array<{
        slot_id?: string;
        start_time?: string;
        end_time?: string;
        is_available?: boolean;
    }>> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/appointments/available-slots',
            query: {
                'faculty_id': facultyId,
                'date': date,
            },
            errors: {
                401: `Authentication required or token invalid`,
                404: `Faculty not found`,
            },
        });
    }
}
