import { Component, OnInit } from '@angular/core';
import { FormGroup, FormBuilder, Validators, ReactiveFormsModule, FormControl } from '@angular/forms';
import { Auth } from 'src/app/models/auth';
import { AuthService } from 'src/app/services/auth/auth.service';
import { ChatService } from 'src/app/services/chat.service';
import { environment } from 'src/environments/environment.development';
import { ModalService } from '../_modal';


@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export default class HomeComponent implements OnInit  {
  userLoginForm: FormGroup = new FormGroup({
    name: new FormControl(''),
    password: new FormControl('')
  });
  userSignupForm: FormGroup = new FormGroup({
    name: new FormControl(''),
    password: new FormControl(''),
    repeatedPassword: new FormControl('')
  });
  submittedLogin = false;
  submittedSignup = false;
  apiErrorMessages: string[] = [];
  openChat = false;
  isSignup = false;
  loginTextValue: string = '';
  passwordTextValue: string = '';
  signupLoginTextValue: string = '';
  signupLoginEmailValue: string = '';
  signupPasswordTextValue: string = '';
  confirmPasswordTextValue: string = '';

  constructor(private formBuilder: FormBuilder, private chatService: ChatService, private authService: AuthService, private modalService: ModalService) {}

  ngOnInit(): void {
    this.checkLogin();
    this.initializeForms();
  }

  initializeForms() {
    this.userLoginForm = this.formBuilder.group({
      name: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(15)]],
      password: ['', [Validators.required, Validators.minLength(6), Validators.maxLength(20)]],
    });

    this.userSignupForm = this.formBuilder.group({
      email: [''],
      name: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(15)]],
      password: ['', [Validators.required, Validators.minLength(6), Validators.maxLength(20)]],
      confirmPassword: ['', [Validators.required, Validators.minLength(6), Validators.maxLength(20)]],
    }, {validator: this.checkIfMatchingPasswords('password', 'confirmPassword')});
  }

  checkLogin() {
    if (this.authService.isLoggedIn) {
      this.chatService.myName = this.authService.getUserName();
      this.openChat = true;
      this.userLoginForm.reset();
      this.submittedLogin = false;
    }
  }

  submitLoginForm() {
    this.submittedLogin = true;
    this.apiErrorMessages = []

    if (this.userLoginForm.valid) {
      let loginUser: Auth = {
        name: this.userLoginForm.controls['name'].value,
        password: this.userLoginForm.controls['password'].value,
        role: "User",
        clientURI: `http://localhost:4200/authentication/emailconfirmation`
      };

      this.authService.login(loginUser).subscribe({
        next: (response) => {
          this.authService.setToken();
          if (this.authService.isLoggedIn) {
            this.chatService.registerUser(this.userLoginForm.value).subscribe({
              next: () => {
                this.chatService.myName = this.userLoginForm.get('name')?.value;
                this.openChat = true;
                this.userLoginForm.reset();
                this.submittedLogin = false;
              },
              error: error => {
                if (typeof(error.error) !== 'object') {
                  this.apiErrorMessages.push(error.error);
                }
              }
            });
          }
          else {
            if (response === 3) {
              this.openModal('confirm-email');
            } else {
              this.apiErrorMessages.push("Wrong name or password");
            }
          }
        },
        error: error => {
          if (typeof(error.error) !== 'object') {
          }
        }
      });
    }
  }

  submitSignupForm() {
    this.submittedSignup = true;
    this.apiErrorMessages = []

    if (this.userSignupForm.valid) {
      let newUser: Auth = {
        name: this.userSignupForm.controls['name'].value,
        email: this.userSignupForm.controls['email'].value,
        password: this.userSignupForm.controls['password'].value,
        role: "User",
        clientURI: `http://localhost:4200/authentication/emailconfirmation`
      };

      this.authService.signup(newUser).subscribe(
      {
        next: (response) => {
          this.authService.setToken();
          if (this.authService.isLoggedIn) {
            this.chatService.registerUser(this.userSignupForm.value).subscribe({
              next: () => {
                this.chatService.myName = this.userSignupForm.get('name')?.value;
                this.chatService.myEmail = this.userSignupForm.get('email')?.value;
                this.openChat = true;
                this.userSignupForm.reset();
                this.submittedSignup = false;
              },
              error: error => {
                if (typeof(error.error) !== 'object') {
                  this.apiErrorMessages.push(error.error);
                }
              }
            });
          }
          else {
            if (response === 3) {
              this.openModal('confirm-email');
            } else {
              this.apiErrorMessages.push("Unknown error occurred. Try again later");
            }
          }
        },
        error: error => {
          if (typeof(error.error) !== 'object') {
          }
        }
      });
    }
  }

  closeChat() {
    this.authService.logout().subscribe({
      next: () => {},
      error: error => {
        if (typeof(error.error) !== 'object') {
          this.apiErrorMessages.push(error.error);
        }
      }
    });

    this.openChat = false;
  }

  toggleSignupWindow() {
    if (this.isSignup) {
      this.isSignup = false;
    } else {
      this.isSignup = true;
    }
  }

  checkIfMatchingPasswords(passwordKey: string, passwordConfirmationKey: string) {
    return (group: FormGroup) => {
      let passwordInput = group.controls[passwordKey],
          passwordConfirmationInput = group.controls[passwordConfirmationKey];
      if (passwordInput.value !== passwordConfirmationInput.value) {
        return passwordConfirmationInput.setErrors({notEquivalent: true})
      }
      else {
          return passwordConfirmationInput.setErrors(null);
      }
    }
  }

  openModal(id: string) {
    this.modalService.open(id);
  }

  closeModal(id: string) {
    this.modalService.close(id);
  }
}
