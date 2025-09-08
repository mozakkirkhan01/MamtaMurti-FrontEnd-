// import { Component } from '@angular/core';
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
  selector: 'app-optical-add',
  templateUrl: './optical-add.component.html',
  styleUrls: ['./optical-add.component.css']
})
export class OpticalAddComponent {
 dataLoading: boolean = false
  OpticalList: any = []
  Optical: any = {}
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
    this.getOpticalList();
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

  @ViewChild('formDepartment') formOptical: NgForm;
  resetForm() {
    this.Optical = {}
    if (this.formOptical) {
      this.formOptical.control.markAsPristine();
      this.formOptical.control.markAsUntouched();
    }
    this.isSubmitted = false
    this.Optical.Status = 1
  }

  sort(key: any) {
    this.sortKey = key;
    this.reverse = !this.reverse;
  }

  onTableDataChange(p: any) {
    this.p = p
  }

  getOpticalList() {
    var obj: RequestModel = {
      request: this.localService.encrypt(JSON.stringify({ })).toString()
    }
    this.dataLoading = true
    this.service.getOpticalList(obj).subscribe(r1 => {
      let response = r1 as any
      if (response.Message == ConstantData.SuccessMessage) {
        this.OpticalList = response.OpticalList;
        console.log(response.OpticalList);
        
      } else {
        this.toastr.error(response.Message)
      }
      this.dataLoading = false
    }, (err => {
      this.toastr.error("Error while fetching records")
    }))
  }

  saveOptical() {
    this.isSubmitted = true;
      // this.formOptical.control.markAllAsTouched();
      // if (this.formOptical.invalid) {
      //   this.toastr.error("Fill all the required fields !!")
      //   return
      // }
    this.Optical.CreatedBy = this.staffLogin.StaffId;
    this.Optical.UpdatedBy = this.staffLogin.StaffId;

   
    
    var obj: RequestModel = {
      request: this.localService.encrypt(JSON.stringify(this.Optical)).toString()
    }

   
    
    this.service.saveOptical(obj).subscribe(r1 => {
      let response = r1 as any
      if (response.Message == ConstantData.SuccessMessage) {
        if (this.Optical.OpticalId > 0) {
          this.toastr.success("Optical detail updated successfully")
          
        } else {
          this.toastr.success("Optical added successfully")
        }
        $('#staticBackdrop').modal('hide')
        this.resetForm()
        this.getOpticalList();

      } else {
        this.toastr.error(response.Message)
      }
    }, (err => {
      this.toastr.error("Error occured while submitting data")
    }))
  }

  deleteOptical(obj: any) {
    if (confirm("Are your sure you want to delete this recored")) {
      var request: RequestModel = {
        request: this.localService.encrypt(JSON.stringify(obj)).toString()
      }
      this.dataLoading = true;
      this.service.deleteOptical(request).subscribe(r1 => {
        let response = r1 as any
        if (response.Message == ConstantData.SuccessMessage) {
          this.toastr.success("Record Deleted successfully")
          this.getOpticalList()
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

  editOpticals(obj: any) {
    this.resetForm()
    this.Optical = obj

  }
}

