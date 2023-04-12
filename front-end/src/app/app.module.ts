import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { TeamMembersComponent } from './pages/team-members/team-members.component';
import { VersionsDashboardComponent } from './pages/versions-dashboard/versions-dashboard.component';
import { NavbarComponent } from './components/navbar/navbar.component';
import { BreadcrumbModule, BreadcrumbService } from 'xng-breadcrumb';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { MatIconModule } from '@angular/material/icon';
import {MatMenuModule} from '@angular/material/menu';
import {MatButtonModule} from '@angular/material/button';
import { InitiativesComponent } from './pages/initiatives/initiatives.component';
import { InitiativeDetailsComponent } from './pages/initiative-details/initiative-details.component';
import { RiskDashboardComponent } from './pages/risk-dashboard/risk-dashboard.component';
import {MatTableModule} from '@angular/material/table';
import {MatPaginatorModule} from '@angular/material/paginator';
import {MatCheckboxModule} from '@angular/material/checkbox';
import { PublishDialogComponent } from './components/publish-dialog/publish-dialog.component';
import { NewRiskComponent } from './components/new-risk/new-risk.component';
import { NewTeamMemberComponent } from './components/new-team-member/new-team-member.component';
import { NewProposedComponent } from './components/new-proposed/new-proposed.component';
import {MatDialogModule} from '@angular/material/dialog';
import {MatFormFieldModule} from '@angular/material/form-field';
import { ReactiveFormsModule } from '@angular/forms';
import {MatInputModule} from '@angular/material/input';
import {MatSelectModule} from '@angular/material/select';
import {MatRadioModule} from '@angular/material/radio';
import { VersionDetailsComponent } from './pages/version-details/version-details.component';
import {MatTooltipModule} from '@angular/material/tooltip';
import { HttpClientModule } from '@angular/common/http';






@NgModule({
  declarations: [
    AppComponent,
    TeamMembersComponent,
    VersionsDashboardComponent,
    NavbarComponent,
    InitiativesComponent,
    InitiativeDetailsComponent,
    RiskDashboardComponent,
    PublishDialogComponent,
    NewRiskComponent,
    NewTeamMemberComponent,
    NewProposedComponent,
    VersionDetailsComponent
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
    HttpClientModule
  ],
  providers: [
    BreadcrumbService
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }