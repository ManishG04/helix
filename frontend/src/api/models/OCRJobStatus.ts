/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
export type OCRJobStatus = {
    job_id?: string;
    status?: OCRJobStatus.status;
    created_at?: string;
    completed_at?: string | null;
    /**
     * Number of availability slots extracted
     */
    slots_extracted?: number | null;
    error_message?: string | null;
};
export namespace OCRJobStatus {
    export enum status {
        QUEUED = 'QUEUED',
        PROCESSING = 'PROCESSING',
        COMPLETED = 'COMPLETED',
        FAILED = 'FAILED',
    }
}

