import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class BackendApiService {

  constructor(
    private http: HttpClient,
  ) { }

  public list(path: string): Observable<string[]> {
    return this.http.get('http://localhost:8000/list' + path, {
      responseType: 'text'
    }).pipe(
      map(e => JSON.parse(e)),
    );
  }

  public read(path: string): Observable<string> {
    return this.http.get('http://localhost:8000/read' + path, {
      responseType: 'text'
    });
  }

  public write(path: string, content: string): Observable<void> {
    return this.http.post<void>('http://localhost:8000/write' + path, content);
  }
}
