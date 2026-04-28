/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { ProjectBase } from './ProjectBase';
import type { ProjectPhase } from './ProjectPhase';
import type { ProjectStatus } from './ProjectStatus';
export type Project = (ProjectBase & {
    id?: string;
    mentor_id?: string | null;
    status?: ProjectStatus;
    current_phase?: ProjectPhase;
    created_at?: string;
});

