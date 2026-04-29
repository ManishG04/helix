/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
export type TimetableUploadResponse = {
    message?: string;
    /**
     * Job ID to track OCR processing status
     */
    job_id?: string;
    status?: TimetableUploadResponse.status;
};
export namespace TimetableUploadResponse {
    export enum status {
        QUEUED = 'QUEUED',
        PROCESSING = 'PROCESSING',
        COMPLETED = 'COMPLETED',
        FAILED = 'FAILED',
    }
}

