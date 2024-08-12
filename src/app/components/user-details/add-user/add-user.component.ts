import { Component, OnInit } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { UsersService } from '../../../services/users.service';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-add-user',
  templateUrl: './add-user.component.html',
  styleUrls: ['./add-user.component.scss']
})
export class AddUserComponent implements OnInit {

  addUserForm!: FormGroup;
  isEdit: boolean = false;
  userId: number | undefined;
  
  constructor(private usersService: UsersService, private route: ActivatedRoute) {}
  errorMessage = this.usersService.errorMessage;
  
  ngOnInit() {
    this.addUserForm = new FormGroup({
      'username': new FormControl('', Validators.required),
      'email': new FormControl('', [Validators.required, Validators.email]),
      'phoneNumber': new FormControl('', Validators.required),
      'isActive': new FormControl(true, Validators.required)
    });


    this.route.params.subscribe(params => {
      this.userId = +params['id'];
      if (this.userId) {
        this.isEdit = true;
        this.usersService.getUser(this.userId)
          .subscribe({
            next: (user) => {
              this.addUserForm.patchValue(user);
            },
            error: (error: Error) => {
              this.errorMessage.set(error.message);
            }
          })
      }
    });
  }
  
  onSubmit() {
    if (this.addUserForm.valid) {
      if (this.isEdit && this.userId) {
        this.usersService.editUser({...this.addUserForm.value, id: this.userId});
        if(this.addUserForm.get('isActive')?.value) {
          this.usersService.updateStatus(this.userId, this.addUserForm.get('isActive')?.value);
        } else{
          this.usersService.updateStatus(this.userId, !this.addUserForm.get('isActive')?.value);
        }
        this.isEdit = false;
      } else {
        this.usersService.setUser(this.addUserForm.value);
      }
      this.addUserForm.reset();
    }
  }
}
