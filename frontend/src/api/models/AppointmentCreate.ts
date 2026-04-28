/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
export type AppointmentCreate = {
    /**
     * ID of the faculty availability slot
     */
    slot_id: string;
    date: string;
    start_time: string;
    end_time: string;
    purpose?: string | null;
    faculty_id: string;
    /**
     * Optional team ID if booking on behalf of a team
     */
    team_id?: string | null;
};

