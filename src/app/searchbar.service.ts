import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { AttData } from './model/att-data';

@Injectable({
  providedIn: 'root'
})
export class SearchbarService {
  private baseUrl = 'http://localhost:4200'; 

  constructor(private http: HttpClient) { }

  searchAttractions(attractionName: string): Observable<AttData[]> {
    const url = `${this.baseUrl}/attraction-dashboard?search=${attractionName}`;
    return this.http.get<AttData[]>(url);
  }
}
