import { Component } from '@angular/core';

@Component({
  selector: 'app-circle-row',
  templateUrl: './circle-row.component.html',
  styleUrls: ['./circle-row.component.css']
})
export class CircleRowComponent {
  progress: number = 0;

  updateLoader(progress: number): void {
    this.progress = progress;
  }
}
