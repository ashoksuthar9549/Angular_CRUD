import { Component } from '@angular/core';
import { UsersService } from '../../../services/users.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-users',
  templateUrl: './users.component.html',
  styleUrl: './users.component.scss'
})
export class UsersComponent {
  
  users = this.usersService.allUsers;
  totalUsers = this.usersService.totalUsers;
  totalPages = this.usersService.totalPages;
  currentPage = this.usersService.currentPage;
  limit = this.usersService.limit;
  sortField = this.usersService.sortField;
  sortOrder = this.usersService.sortOrder;
  isFetching: boolean = false;
  searchData: any = '';

  constructor(private usersService: UsersService, private router: Router) {}

  ngOnInit() {
    this.getUsers();
  }

  // get all users with pagination
  getUsers(page: number = 1) {
    this.isFetching = true
    this.usersService.getUsers(this.searchData, page, this.limit(), this.sortField(), this.sortOrder());
    this.isFetching = false
  }

  deleteUser(i: number) {
    this.usersService.deleteUser(i);
  }

  editUserData(user: any) {
    this.router.navigate(['/edit', user.id]);
  }

  changeStatus(user: any) {
    this.usersService.updateStatus(user.id, user.isActive);
  }

  onPageChange(page: number) {
    this.isFetching = true
    this.getUsers(page);
    this.isFetching = false
  }

  onLimitChange(limit: any) {
    const limitValue = limit.target.value;
    this.usersService.getUsers(this.searchData, 1, limitValue);
  }

   onSortChange(sortField: string) {
    if (this.sortField() === sortField) {
      this.sortOrder.set(this.sortOrder() === 'asc' ? 'desc' : 'asc');
    } else {
      this.sortField.set(sortField);
      this.sortOrder.set('asc');
    }
    this.getUsers(this.currentPage());  
  } 

  searchFilter(searchData: any) {
    this.usersService.getUsers(searchData);
    this.searchData = searchData;
  }
}
