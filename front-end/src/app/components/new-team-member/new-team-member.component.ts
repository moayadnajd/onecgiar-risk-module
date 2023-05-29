import { Component, Inject } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';

@Component({
  selector: 'app-new-team-member',
  templateUrl: './new-team-member.component.html',
  styleUrls: ['./new-team-member.component.scss']
})
export class NewTeamMemberComponent {
  constructor(
    public fb: FormBuilder,
    private dialogRef: MatDialogRef<NewTeamMemberComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any = {}
  ) {}


  Roles: any[] = [
    {value: 'Lead / Coordinator', viewValue: 'Lead / Coordinator'},
    {value: 'Team Member', viewValue: 'Team Member'},
    {value: 'Co-leader', viewValue: 'Co-leader'}
  ];


  memberForm: any;
  populateMemberForm() {
    this.memberForm = this.fb.group({
      email: [(this.data.role == 'add')? '' : this.data.member.email , [Validators.required, Validators.email]],
      userRole : [(this.data.role == 'add')? '' : this.data.member.role, Validators.required]
    })
  }

  submit() {
    this.memberForm.markAllAsTouched();
    this.memberForm.updateValueAndValidity();
    if(this.memberForm.valid) {
      this.dialogRef.close({role: this.data.role, formValue: this.memberForm.value});      
    }
  }

  ngOnInit() {
    this.populateMemberForm()
  }
}
