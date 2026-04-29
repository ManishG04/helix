/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { Appointment } from './Appointment';
import type { Team } from './Team';
import type { User } from './User';
export type AppointmentWithDetails = (Appointment & {
    student?: User;
    faculty?: User;
    team?: Team;
});

