import { Component } from '@angular/core';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-search',
  templateUrl: './search.component.html',
})
export class SearchComponent {
  paperA = '';
  paperB = '';
  queryType = 'citation';
  customQuery = '';
  result: any;

  constructor(private http: HttpClient) {}

  search() {
    // Validate Paper A input
    if (!this.paperA) {
      alert('Paper A ID is required!');
      return;
    }

    const payload = {
      paperA: this.paperA,
      paperB: this.paperB,
      queryType: this.queryType,
      customQuery: this.customQuery,
    };

    this.http.post<any>('http://localhost:3000/query', payload)
      .subscribe({
        next: data => {
          this.result = data;
        },
        error: (err) => {
          console.error('Error occurred:', err);
          alert('An error occurred while processing your request. Please check the console for details.');
        }
      });
  }
}
