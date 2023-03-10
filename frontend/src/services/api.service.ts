import axios from "axios-observable";
import Vue from 'vue'
import {Observable, of} from "rxjs";
import {catchError, first, map} from "rxjs/operators";
import router from "@/router";
import AuthTokenPersistentStorageService from '@/services/persistent-storage/auth-token.service';

export interface ApiResponse<T> {
    code: number,
    data: T,
    metadata: unknown
}

export abstract class ApiService {
    public static setAxiosAuthToken(token: string) {
        axios.defaults.headers.common['authorization'] = `Bearer ${token}`;
    }

    public static get<T>(url: string): Observable<T> {
        return axios.get<ApiResponse<T>>(`${process.env.VUE_APP_API}/${url}`).pipe(
            first(),
            map(res => res.data.data as T),
            catchError(error => this.handleError<T>(error))
        );
    }

    public static delete<T>(url: string): Observable<unknown | T> {
        return axios.delete<ApiResponse<T>>(`${process.env.VUE_APP_API}/${url}`).pipe(
            first(),
            map(res => res.data.data as T),
            catchError(error => this.handleError<T>(error))
        );
    }

    public static post<T>(url: string, body: unknown): Observable<T> {
        return axios.post<ApiResponse<T>>(`${process.env.VUE_APP_API}/${url}`, body).pipe(
            first(),
            map(res => res.data.data as T),
            catchError(error => this.handleError<T>(error))
        );
    }

    public static put<T>(url: string, body: T): Observable<unknown | T> {
        return axios.put<ApiResponse<T>>(`${process.env.VUE_APP_API}/${url}`, body).pipe(
            first(),
            map(res => res.data.data as T),
            catchError(error => this.handleError<T>(error))
        );
    }

    private static handleError<T>(response: any) {
        if (response.message === 'Request failed with status code 403') {
            AuthTokenPersistentStorageService.clear();
            router.push('/rebalancer');
        }
        if (response && response.message) {
            Vue.$toast.error(response.message)
        }
        return of({}) as Observable<T>;
    }
}
