import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { TeamMembersComponent } from './pages/team-members/team-members.component';
import { VersionsDashboardComponent } from './pages/versions-dashboard/versions-dashboard.component';
import {
  LoginDialog,
  NavbarComponent,
} from './components/navbar/navbar.component';
import { BreadcrumbModule, BreadcrumbService } from 'xng-breadcrumb';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { MatButtonModule } from '@angular/material/button';
import { InitiativesComponent } from './pages/initiatives/initiatives.component';
import {
  InitiativeDetailsComponent,
  PublishDialog,
} from './pages/initiative-details/initiative-details.component';
import { MatTableModule } from '@angular/material/table';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { NewRiskComponent } from './components/new-risk/new-risk.component';
import { NewTeamMemberComponent } from './components/new-team-member/new-team-member.component';
import { NewProposedComponent } from './components/new-proposed/new-proposed.component';
import { MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatRadioModule } from '@angular/material/radio';
import { VersionDetailsComponent } from './pages/version-details/version-details.component';
import { MatTooltipModule } from '@angular/material/tooltip';
import { HttpClientModule, HTTP_INTERCEPTORS } from '@angular/common/http';
import { ConfirmComponent } from './components/confirm/confirm.component';
import { ToastrModule } from 'ngx-toastr';
import { Safe } from './pipes/safe';
import { MatCardModule } from '@angular/material/card';
import {MatProgressBarModule} from '@angular/material/progress-bar';
import {MatSlideToggleModule} from '@angular/material/slide-toggle';
import { MatDividerModule } from '@angular/material/divider';
import { RiskTableComponent } from './components/risk-table/risk-table.component';
import { SearchInitiativesComponent } from './components/search-initiatives/search-initiatives.component';
import { SearchRisksComponent } from './components/search-risks/search-risks.component';
import { AdminComponent } from './pages/admin/admin.component';
import { UsersComponent } from './pages/admin/users/users.component';
import { GeneralTabelComponent } from './components/general-tabel/general-tabel.component';
import { GeneralFormComponent } from './components/general-form/general-form.component';
import { UserFormComponent } from './pages/admin/users/user-form/user-form.component';
import { CategoriesComponent } from './pages/admin/categories/categories.component';
import { CategoryFormComponent } from './pages/admin/categories/category-form/category-form.component';
import { HttpRequestInterceptor } from './services/http-request-interceptor';
import { SearchUsersComponent } from './pages/admin/users/search-users/search-users.component';
import { EmailsComponent } from './pages/admin/emails/emails.component';
import { EmailBodyDialogComponent } from './components/email-body-dialog/email-body-dialog.component';
import { AnnouncementComponent } from './pages/admin/announcement/announcement.component';
import { NgxEditorModule } from 'ngx-editor';
import { HomeComponent } from './pages/home/home.component';
import { AnnouncementFormComponent } from './pages/admin/announcement/announcement-form/announcement-form.component';
import { SendEmailFormComponent } from './pages/admin/announcement/send-email-form/send-email-form.component';
import { SettingComponent } from './pages/admin/setting/setting.component';
import { AppSocket } from './services/socket.service';
import { AvatarModule, AvatarSource } from 'ngx-avatars';
const avatarSourcesOrder = [AvatarSource.INITIALS];
import { MitigationStatusComponent } from './pages/admin/mitigation-status/mitigation-status.component';
import { MitigationFormComponent } from './pages/admin/mitigation-status/mitigation-form/mitigation-form.component';
import { NgSelectModule } from '@ng-select/ng-select';
import { DragDropModule } from '@angular/cdk/drag-drop';

import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { HighchartsChartModule } from 'highcharts-angular';
import { DashboardComponent } from './pages/admin/dashboard/dashboard.component';
import { FilterActionsPipe } from './components/general-tabel/filter-actions.pipe';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { SatPopoverModule } from '@ncstate/sat-popover';
import { PopoverInfoComponent } from './components/new-risk/popover-info/popover-info.component';
import { GlossaryComponent } from './pages/admin/glossary/glossary.component';
import { GlossaryFormComponent } from './pages/admin/glossary/glossary-form/glossary-form.component';
import { GlossaryUserComponent } from './pages/glossary-user/glossary-user.component';
import { FAQComponent } from './pages/admin/faq/faq.component';
import { FaqFormComponent } from './pages/admin/faq/faq-form/faq-form.component';
import { MatExpansionModule } from '@angular/material/expansion';
import { FAQUserComponent } from './pages/faq-user/faq-user.component';
import { RiskDashboardComponent } from './pages/risk-dashboard/risk-dashboard.component';

@NgModule({
  declarations: [
    AppComponent,
    TeamMembersComponent,
    VersionsDashboardComponent,
    NavbarComponent,
    InitiativesComponent,
    InitiativeDetailsComponent,
    NewRiskComponent,
    NewTeamMemberComponent,
    NewProposedComponent,
    VersionDetailsComponent,
    LoginDialog,
    ConfirmComponent,
    GeneralFormComponent,
    UserFormComponent,
    PublishDialog,
    Safe,
    RiskTableComponent,
    SearchInitiativesComponent,
    SearchRisksComponent,
    AdminComponent,
    UsersComponent,
    GeneralTabelComponent,
    CategoriesComponent,
    CategoryFormComponent,
    SearchUsersComponent,EmailsComponent,
    EmailBodyDialogComponent,
    AnnouncementComponent,
    HomeComponent,
    AnnouncementFormComponent,
    SendEmailFormComponent,
    SettingComponent,
    MitigationStatusComponent,
    MitigationFormComponent,
    DashboardComponent,
    FilterActionsPipe,
    PopoverInfoComponent,
    GlossaryComponent,
    GlossaryFormComponent,
    GlossaryUserComponent,
    FAQComponent,
    FaqFormComponent,
    FAQUserComponent,
    RiskDashboardComponent,
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    BreadcrumbModule,
    BrowserAnimationsModule,
    MatIconModule,
    MatMenuModule,
    MatButtonModule,
    MatTableModule,
    MatPaginatorModule,
    MatCheckboxModule,
    MatDialogModule,
    MatFormFieldModule,
    ReactiveFormsModule,
    MatInputModule,
    MatSelectModule,
    MatRadioModule,
    MatTooltipModule,
    HttpClientModule,
    FormsModule,
    MatCardModule,
    MatDividerModule,
    MatProgressBarModule,
    MatExpansionModule,
    MatPaginatorModule,
    MatSlideToggleModule,
    NgxEditorModule,
    ToastrModule.forRoot(),
    AvatarModule.forRoot({
      sourcePriorityOrder: avatarSourcesOrder
    }),
    NgSelectModule,
    DragDropModule,
    
    MatDatepickerModule,
    MatNativeDateModule,
    HighchartsChartModule,
    NoopAnimationsModule,
    SatPopoverModule
  ],
  providers: [BreadcrumbService, AppSocket,  MatDatepickerModule, 
    { provide: HTTP_INTERCEPTORS, useClass: HttpRequestInterceptor, multi: true }
  ],
  bootstrap: [AppComponent],
})
export class AppModule {}
