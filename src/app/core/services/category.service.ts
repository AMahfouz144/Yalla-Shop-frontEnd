import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { API_BASE_URL } from '../config/api-base';
import { Category } from '../models/category.model';

const ROOT = `${API_BASE_URL}/Category`;

@Injectable({ providedIn: 'root' })
export class CategoryService {
  constructor(private readonly http: HttpClient) {}

  /** Read-only: active categories for filters and labels. */
  getAll(): Observable<Category[]> {
    return this.http.get<Category[]>(ROOT);
  }

  getById(id: number): Observable<Category> {
    return this.http.get<Category>(`${ROOT}/${id}`);
  }
}
