import { Component, ViewChild } from '@angular/core';
import { MatPaginator } from '@angular/material/paginator';
import { MatTableDataSource } from '@angular/material/table';
import { ActivatedRoute, Router } from '@angular/router';
import { InitiativesService } from 'src/app/services/initiatives.service';

@Component({
  selector: 'app-versions-dashboard',
  templateUrl: './versions-dashboard.component.html',
  styleUrls: ['./versions-dashboard.component.scss']
})
export class VersionsDashboardComponent {
  constructor(
    public router: Router,
    public activatedRoute: ActivatedRoute,
    private initiativeService : InitiativesService
    ) {
    
  }

  

  

  initiative_name:string='';
  displayedColumns: string[] = ['Version', 'Publish Reason', 'Creation Date', 'Creation By', 'Actions'];
  dataSource = new MatTableDataSource<any>([
  ]);

  openNewMemberDialog() {

  }
  @ViewChild(MatPaginator) paginator: any;

  path: any = '';
  initiativeId: any;
 async ngOnInit() {
    this.path = window.location.pathname
    const params:any =  this.activatedRoute.parent?.snapshot.params
  
    const iniitaves = await this.initiativeService.getInitiatives(params.id)
    console.log(iniitaves);
    this.initiativeId = params.id;
    this.dataSource.paginator = this.paginator;
   
    this.initiative_name =  iniitaves[0].name;
    this.dataSource.data = iniitaves;

  }
}
