import { Component } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-sidebar',
  templateUrl: './sidebar.component.html',
  styleUrl: './sidebar.component.scss'
})
export class SidebarComponent {

  addEditLabel: string = 'Add';

  constructor(private router: Router) {}

  ngOnInit() {
    this.router.events.subscribe(() => {
        const url = this.router.url;
        if (url.includes('add-user')) {
            this.addEditLabel = 'Add';
        } else if (url.includes('edit')) {
            this.addEditLabel = 'Edit';
        } else {
            this.addEditLabel = 'Add';
        }
    });
  }

}
