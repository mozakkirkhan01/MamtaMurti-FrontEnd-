import { Component, ViewChild } from '@angular/core';
import { NgForm } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';
import { AppService } from '../../utils/app.service';
import { ConstantData } from '../../utils/constant-data';
import { Status } from '../../utils/enum';
import { LoadDataService } from '../../utils/load-data.service';
import { ActionModel, RequestModel, StaffLoginModel } from '../../utils/interface';
import { LocalService } from '../../utils/local.service';
import { Router } from '@angular/router';
declare var $: any;


@Component({
  selector: 'app-unit',
  templateUrl: './unit.component.html',
  styleUrls: ['./unit.component.css']
})
export class UnitComponent  {
   dataLoading: boolean = false;
   
    UnitList: any[] = [];
    Unit: any = {};
    isSubmitted = false;
    PageSize = ConstantData.PageSizes;
    p: number = 1;
    Search: string = '';
    reverse: boolean = false;
    sortKey: string = '';
    itemPerPage: number = this.PageSize[0];
    StatusList = this.loadData.GetEnumList(Status);
    AllStatusList = Status;
    action: ActionModel = {} as ActionModel;
    staffLogin: StaffLoginModel = {} as StaffLoginModel;
  
    constructor(
      private service: AppService,
      private toastr: ToastrService,
      private localService: LocalService,
      private loadData: LoadDataService,
      private router: Router
    ) { }
  
    ngOnInit(): void {
      this.staffLogin = this.localService.getEmployeeDetail();
      this.validiateMenu();
      this.getUnitList();
      this.resetForm();
    }
  
   validiateMenu() {
      var request: RequestModel = {
        request: this.localService.encrypt(JSON.stringify({ Url: this.router.url, StaffLoginId: this.staffLogin.StaffLoginId })).toString()
      }
      this.dataLoading = true
      this.service.validiateMenu(request).subscribe((response: any) => {
        this.action = this.loadData.validiateMenu(response, this.toastr, this.router)
        this.dataLoading = false;
      }, (err => {
        this.toastr.error("Error while fetching records")
        this.dataLoading = false;
      }))
    }
  
    sort(key: any) {
      this.sortKey = key;
      this.reverse = !this.reverse;
    }
  
    onTableDataChange(p: any) {
      this.p = p;
    }
  
    @ViewChild('formUnit') formUnit: NgForm;
    resetForm() {
      this.Unit = {};
      this.Unit.Status = 1;
      if (this.formUnit) {
        this.formUnit.control.markAsPristine();
        this.formUnit.control.markAsUntouched();
      }
      this.isSubmitted = false;
    }
  
    newUnit() {
      this.resetForm();
      $('#modal_popUp').modal('show');
    }
  
    editUnit(obj: any) {
      this.resetForm();
      this.Unit = obj;
      $('#modal_popUp').modal('show');
    }
  
  
    getUnitList() {
      const obj: RequestModel = {
        request: this.localService.encrypt(JSON.stringify({})).toString()
      };
  
      console.log("Sending request:", obj);
      this.dataLoading = true;
  
      this.service.getUnitList(obj).subscribe({
        next: r1 => {
          // console.log("API Response:", r1);
          let response = r1 as any;
          if (response.Message == ConstantData.SuccessMessage) {
            this.UnitList = response.UnitList;
            console.log(this.UnitList);
            
          } else {
            this.toastr.error(response.Message);
          }
          this.dataLoading = false;
        },
        error: err => {
          console.error("API error:", err);
          this.toastr.error("Error while fetching records");
          this.dataLoading = false;
        }
      });
    }
  
  
      saveUnit () {
        this.isSubmitted = true;
        this.formUnit.control.markAllAsTouched();
        if (this.formUnit.invalid) {
          this.toastr.error("Fill all the required fields !!")
          return
        }
        this.Unit.CreatedBy = this.staffLogin.StaffId;
        this.Unit.UpdatedBy = this.staffLogin.StaffId;
        var obj: RequestModel = {
          request: this.localService.encrypt(JSON.stringify(this.Unit)).toString()
        }
        this.dataLoading = true;
        this.service.saveUnit(obj).subscribe(r1 => {
          let response = r1 as any
          if (response.Message == ConstantData.SuccessMessage) {
            if (this.Unit.UnitId > 0) {
              this.toastr.success("Unit Updated successfully")
              $('#staticBackdrop').modal('hide')
            } else {
              this.toastr.success("Unit added successfully")
            }
            this.resetForm()
            this.getUnitList();
          } else {
            this.toastr.error(response.Message)
            this.dataLoading = false;
          }
        }, (err => {
          this.toastr.error("Error occured while submitting data")
          this.dataLoading = false;
        }))
      }
    
  
  
  
  
      deleteUnit(obj: any) {
      if (confirm("Are your sure you want to delete this recored")) {
        var request: RequestModel = {
          request: this.localService.encrypt(JSON.stringify(obj)).toString()
        }
        this.dataLoading = true;
        this.service.deleteUnit(request).subscribe(r1 => {
          let response = r1 as any
          if (response.Message == ConstantData.SuccessMessage) {
            this.toastr.success("Record Deleted successfully")
            this.getUnitList()
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
}


