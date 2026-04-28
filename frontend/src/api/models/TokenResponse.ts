/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { User } from './User';
export type TokenResponse = {
    access_token?: string;
    token_type?: string;
    /**
     * Token expiry time in seconds
     */
    expires_in?: number;
    user?: User;
};

