/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { AvailabilitySource } from './AvailabilitySource';
import type { AvailabilityStatus } from './AvailabilityStatus';
import type { FacultyAvailabilityBase } from './FacultyAvailabilityBase';
export type FacultyAvailability = (FacultyAvailabilityBase & {
    id?: string;
    /**
     * Duration in minutes (calculated from end_time - start_time)
     */
    slot_duration?: number;
    status?: AvailabilityStatus;
    source?: AvailabilitySource;
    created_at?: string;
    faculty_id?: string;
});

