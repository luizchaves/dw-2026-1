import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';

import { AuthService } from './auth.service';
import { Host, HostDetails, HostPayload, PingResult } from './models';

@Injectable({ providedIn: 'root' })
export class HostApiService {
  constructor(
    private readonly http: HttpClient,
    private readonly auth: AuthService,
  ) {}

  listHosts(): Observable<Host[]> {
    return this.http.get<Host[]>('/api/hosts', { headers: this.authHeaders() });
  }

  createHost(payload: HostPayload): Observable<Host> {
    return this.http.post<Host>('/api/hosts', payload, {
      headers: this.authHeaders().set('Content-Type', 'application/json'),
    });
  }

  deleteHost(id: string): Observable<void> {
    return this.http.delete<void>(`/api/hosts/${id}`, {
      headers: this.authHeaders(),
    });
  }

  readDetails(id: string): Observable<HostDetails> {
    return this.http.get<HostDetails>(`/api/hosts/${id}/details?limit=30`, {
      headers: this.authHeaders(),
    });
  }

  pingHost(id: string, count: number): Observable<PingResult> {
    return this.http.get<PingResult>(`/api/hosts/${id}/ping?count=${count}`, {
      headers: this.authHeaders(),
    });
  }

  private authHeaders(): HttpHeaders {
    const token = this.auth.token();

    return token ? new HttpHeaders({ Authorization: `Bearer ${token}` }) : new HttpHeaders();
  }
}
