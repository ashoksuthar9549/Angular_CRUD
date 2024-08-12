import { Component, EventEmitter, OnInit, Output } from '@angular/core';

@Component({
  selector: 'app-search-user',
  templateUrl: './search-user.component.html',
  styleUrl: './search-user.component.scss'
})
export class SearchUserComponent implements OnInit {

  @Output() searchQuery = new EventEmitter<any>();
  ngOnInit(){
  }

  searchUser(username: string, email: string, phoneNumber: string, isActive: string) {
    const searchParams = {
      username: username,
      email: email,
      phoneNumber: phoneNumber,
      isActive: isActive
    }
    this.searchQuery?.emit(searchParams);
  }
}
