import { Component, ViewChild } from '@angular/core';
import { ToastrService } from 'ngx-toastr';
import { AppService } from '../../utils/app.service';
import { ConstantData } from '../../utils/constant-data';
import { NgForm } from '@angular/forms';
import { LocalService } from '../../utils/local.service';
import { LoadDataService } from '../../utils/load-data.service';
import { Status } from '../../utils/enum';
import { ActionModel, RequestModel, StaffLoginModel } from '../../utils/interface';
import { Router } from '@angular/router';
declare var $: any; 
@Component({
  selector: 'app-package-collection',
  templateUrl: './package-collection.component.html',
  styleUrls: ['./package-collection.component.css']
})
export class PackageCollectionComponent {
    dataLoading: boolean = false
      PackageCollectionList: any = []
      PackageCollection: any = {}
      isSubmitted = false
      StatusList = this.loadData.GetEnumList(Status);
      PageSize = ConstantData.PageSizes;
      p: number = 1;
      Search: string = '';
      reverse: boolean = false;
      sortKey: string = '';
      itemPerPage: number = this.PageSize[0];
      action: ActionModel = {} as ActionModel;
      staffLogin: StaffLoginModel = {} as StaffLoginModel;
      AllStatusList = Status;
      constructor(
        private service: AppService,
        private toastr: ToastrService,
        private loadData: LoadDataService,
        private localService:LocalService,
        private router: Router
      ) { }
    
      ngOnInit(): void {
        this.staffLogin = this.localService.getEmployeeDetail();
        this.validiateMenu();
        this.getPackageCollection();
        this.resetForm();
      }
      
      validiateMenu() {
        var obj: RequestModel = {
          request: this.localService.encrypt(JSON.stringify({ Url: this.router.url,StaffLoginId:this.staffLogin.StaffLoginId })).toString()
        }
        this.dataLoading = true
        this.service.validiateMenu(obj).subscribe((response: any) => {
          this.action = this.loadData.validiateMenu(response, this.toastr, this.router)
          this.dataLoading = false;
        }, (err => {
          this.toastr.error("Error while fetching records")
          this.dataLoading = false;
        }))
      }
    
      @ViewChild('formDepartment') formPackageCollection: NgForm;
      resetForm() {
        this.PackageCollection = {}
        if (this.formPackageCollection) {
          this.formPackageCollection.control.markAsPristine();
          this.formPackageCollection.control.markAsUntouched();
        }
        this.isSubmitted = false
        this.PackageCollection.Status = 1
      }
    
      sort(key: any) {
        this.sortKey = key;
        this.reverse = !this.reverse;
      }
    
      onTableDataChange(p: any) {
        this.p = p
      }
    
      getPackageCollection() {
        var obj: RequestModel = {
          request: this.localService.encrypt(JSON.stringify({ })).toString()
        }
        this.dataLoading = true
        this.service.getPackageCollection(obj).subscribe(r1 => {
          let response = r1 as any
          if (response.Message == ConstantData.SuccessMessage) {
            this.PackageCollectionList = response.PackageCollectionList;
            console.log(this.PackageCollectionList);
            
          } else {
            this.toastr.error(response.Message)
          }
          this.dataLoading = false
        }, (err => {
          this.toastr.error("Error while fetching records")
        }))
      }
    
      savePackageCollection() {
        this.isSubmitted = true;
          // this.formPackageCollection.control.markAllAsTouched();
          // if (this.formPackageCollection.invalid) {
          //   this.toastr.error("Fill all the required fields !!")
          //   return
          // }
        this.PackageCollection.CreatedBy = this.staffLogin.StaffId;
        this.PackageCollection.UpdatedBy = this.staffLogin.StaffId;
    
       
        
        var obj: RequestModel = {
          request: this.localService.encrypt(JSON.stringify(this.PackageCollection)).toString()
        }
    
       
        
        this.service.savePackageCollection(obj).subscribe(r1 => {
          let response = r1 as any
          if (response.Message == ConstantData.SuccessMessage) {
            if (this.PackageCollection.PackageCollectionId > 0) {
              this.toastr.success("Package Collection detail updated successfully")
              
            } else {
              this.toastr.success("Package Collection added successfully")
            }
            $('#staticBackdrop').modal('hide')
            this.resetForm()
            this.getPackageCollection();
    
          } else {
            this.toastr.error(response.Message)
          }
        }, (err => {
          this.toastr.error("Error occured while submitting data")
        }))
      }
    
      deletePackageCollection(obj: any) {
        if (confirm("Are your sure you want to delete this recored")) {
          var request: RequestModel = {
            request: this.localService.encrypt(JSON.stringify(obj)).toString()
          }
          this.dataLoading = true;
          this.service.deletePackageCollection(request).subscribe(r1 => {
            let response = r1 as any
            if (response.Message == ConstantData.SuccessMessage) {
              this.toastr.success("Record Deleted successfully")
              this.getPackageCollection()
            } else {
              this.toastr.error(response.Message)
              this.dataLoading = false;
            }
          }, (err => {
            this.toastr.error("Error occured while deleteing the recored")
            this.dataLoading = false;
          }))
        }
      }
    
      editPackageCollection(obj: any) {
        this.resetForm()
        this.PackageCollection = obj
    
      }
}
