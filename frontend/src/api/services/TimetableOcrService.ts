/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { FacultyAvailability } from '../models/FacultyAvailability';
import type { FacultyAvailabilityCreate } from '../models/FacultyAvailabilityCreate';
import type { OCRJobStatus } from '../models/OCRJobStatus';
import type { TimetableUploadResponse } from '../models/TimetableUploadResponse';
import type { CancelablePromise } from '../core/CancelablePromise';
import { OpenAPI } from '../core/OpenAPI';
import { request as __request } from '../core/request';
export class TimetableOcrService {
    /**
     * Upload timetable for OCR processing
     * Upload a timetable image for OCR processing to automatically extract availability slots.
     * The image is processed asynchronously via AWS Lambda and SQS.
     * Supported formats: PNG, JPG, JPEG, PDF (first page only)
     *
     * @param formData
     * @returns TimetableUploadResponse Timetable uploaded and queued for processing
     * @throws ApiError
     */
    public static uploadTimetable(
        formData: {
            /**
             * Timetable image file (PNG, JPG, JPEG, or PDF)
             */
            file: Blob;
        },
    ): CancelablePromise<TimetableUploadResponse> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/faculty/timetable/upload',
            formData: formData,
            mediaType: 'multipart/form-data',
            errors: {
                400: `Invalid file format or file too large`,
                401: `Authentication required or token invalid`,
                403: `Insufficient permissions`,
            },
        });
    }
    /**
     * Get OCR processing status
     * Check the status of a timetable OCR processing job
     * @param jobId OCR Job UUID
     * @returns OCRJobStatus OCR job status retrieved
     * @throws ApiError
     */
    public static getOcrStatus(
        jobId: string,
    ): CancelablePromise<OCRJobStatus> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/faculty/timetable/ocr-status/{job_id}',
            path: {
                'job_id': jobId,
            },
            errors: {
                401: `Authentication required or token invalid`,
                403: `Insufficient permissions`,
                404: `Resource not found`,
            },
        });
    }
    /**
     * Get OCR extracted slots for review
     * Get the availability slots extracted by OCR for review before confirmation
     * @param jobId OCR Job UUID
     * @returns any OCR results retrieved
     * @throws ApiError
     */
    public static getOcrResults(
        jobId: string,
    ): CancelablePromise<{
        job_id?: string;
        status?: string;
        extracted_slots?: Array<FacultyAvailabilityCreate>;
    }> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/faculty/timetable/ocr-results/{job_id}',
            path: {
                'job_id': jobId,
            },
            errors: {
                401: `Authentication required or token invalid`,
                404: `Resource not found`,
                409: `OCR processing not yet complete`,
            },
        });
    }
    /**
     * Confirm OCR extracted slots
     * Confirm and save the OCR extracted availability slots (optionally with modifications)
     * @param jobId OCR Job UUID
     * @param requestBody
     * @returns any Availability slots confirmed and saved
     * @throws ApiError
     */
    public static confirmOcrResults(
        jobId: string,
        requestBody: {
            /**
             * List of slots to save (can be modified from OCR results)
             */
            confirmed_slots: Array<FacultyAvailabilityCreate>;
        },
    ): CancelablePromise<{
        created?: number;
        slots?: Array<FacultyAvailability>;
    }> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/faculty/timetable/ocr-confirm/{job_id}',
            path: {
                'job_id': jobId,
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
}
