/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { ProjectPhase } from './ProjectPhase';
import type { ProjectStatus } from './ProjectStatus';
export type ProjectUpdate = {
    title?: string;
    description?: string | null;
    mentor_id?: string | null;
    status?: ProjectStatus;
    current_phase?: ProjectPhase;
};

