/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { AppointmentBase } from './AppointmentBase';
import type { AppointmentStatus } from './AppointmentStatus';
export type Appointment = (AppointmentBase & {
    id?: string;
    slot_id?: string;
    status?: AppointmentStatus;
    student_id?: string;
    faculty_id?: string;
    team_id?: string | null;
});

