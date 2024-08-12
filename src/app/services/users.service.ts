import { Injectable, signal } from "@angular/core";
// import { User } from "../common/user.model";
import { environment } from "../environments/environment.prod";
import { HttpClient, HttpHeaders, HttpParams } from "@angular/common/http";

@Injectable({providedIn: 'root'})
export class UsersService {

    private users = signal<any>([]);
    totalUsers = signal<number>(0);
    totalPages = signal<number>(0);
    currentPage = signal<number>(0);
    limit = signal<number>(10);
    sortField = signal<string>('username');
    sortOrder = signal<string>('asc');
    errorMessage = signal<string>('');

    allUsers = this.users.asReadonly();

    apiUrl = environment.apiUrl;
    authToken = environment.authToken;

    constructor(private http: HttpClient) {}


    // get all users with pagination
    getUsers(filter: any = {}, page: number = 1, limit: number = 10, sortField: string = 'username', sortOrder: string = 'asc'){
        const headers = new HttpHeaders({
            'Authorization': `Bearer ${this.authToken}`
        });
        let params = new HttpParams()
            .set('page', page.toString())
            .set('limit', limit.toString())
            .set('sortField', sortField)
            .set('sortOrder', sortOrder)
            if (filter.username) {
                params = params.set('username', filter.username);
            }
            if (filter.email) {
                params = params.set('email', filter.email);
            }
            if (filter.phoneNumber) {
                params = params.set('phoneNumber', filter.phoneNumber);
            }
            if (filter.isActive == 'true') {
                params = params.set('isActive', true);
            } else if (filter.isActive == 'false') {
                params = params.set('isActive', false);
            }
        
        return this.http.get(`${this.apiUrl}/users/`, {headers, params})
            .subscribe({
                next: (response: any) => {
                this.users.set(response.users);
                this.totalUsers.set(response.totalUsers);
                this.totalPages.set(response.totalPages);
                this.currentPage.set(response.currentPage);
                },
                error: (error: Error) => {
                    this.errorMessage.set(error.message);
                }
            });
    }

    getUser(id: number) {
        const headers = new HttpHeaders({
            'Authorization': `Bearer ${this.authToken}`
        });
        
        return this.http.get(`${this.apiUrl}/users/${id}`, {headers})
    }

    setUser(user: any){
        const headers = new HttpHeaders({
            'Authorization': `Bearer ${this.authToken}`
        });

        return this.http.post(`${this.apiUrl}/users`,{...user}, {headers})
        .subscribe({
            next: (resData) => {
                this.users.update((users) => [...users, resData]);
            },
            error: (error: any) => {
                this.errorMessage.set(error?.error?.message);
            },
        });
    }

    deleteUser(id: number) {
        const headers = new HttpHeaders({
            'Authorization': `Bearer ${this.authToken}`
        });
        
        return this.http.delete(`${this.apiUrl}/users/${id}`, {headers})
        .subscribe({
            next: (resData) => {
                this.users.update((users) => users.filter((user: { id: number }) => user.id !== id));
            },
            error: (error: Error) => {
                this.errorMessage.set(error.message);
            },
        });
    }

    editUser(user: any) {
        const headers = new HttpHeaders({
            'Authorization': `Bearer ${this.authToken}`
        });
        
        return this.http.put(`${this.apiUrl}/users/${user.id}`, {...user}, {headers})
        .subscribe({
            next: (resData) => {
                this.users.update((users) => users.map((u: any) => u.id === user.id ? {...u, ...user} : u));
            },
            error: (error: Error) => {
                this.errorMessage.set(error.message);
            },
        });
    }

    updateStatus(id: number, status: boolean) {
        const headers = new HttpHeaders({
            'Authorization': `Bearer ${this.authToken}`
        });

        
        return this.http.patch(`${this.apiUrl}/users/${id}/toggle`, {isActive: status}, {headers})
        .subscribe({
            next: (resData) => {
                this.users.update((users) => users.map((u: any) => u.id === id ? {...u, isActive: !status} : u));
            },
            error: (error: Error) => {
                this.errorMessage.set(error.message);
            },
        });
    }
}