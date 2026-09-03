import { Component, OnInit,ViewChild } from '@angular/core';
import { NgForm } from "@angular/forms";
declare var toastr: any;
declare var $: any;
import { ToastrService } from 'ngx-toastr';
import { AppService } from "../../utils/app.service";
import { ConstantData } from "../../utils/constant-data";
import { LocalService } from "../../utils/local.service";
import { LoadDataService } from '../../utils/load-data.service';
import { Status } from '../../utils/enum';
import { ActionModel,RequestModel, StaffLoginModel } from '../../utils/interface';
import { Router } from '@angular/router';

@Component({
  selector: 'app-prescription-head',
  templateUrl: './prescription-head.component.html',
  styleUrls: ['./prescription-head.component.css']
})
export class PrescriptionHeadComponent {
 Head: any = {};
  employeeDetail: any;
  StatusList = this.loadData.GetEnumList(Status);
  AllStatusList= Status;
  HeadList: any[];
  dataLoading: boolean = false;
  submitted: boolean;
  Search: string;
  reverse: boolean;
  sortKey: string;
  p: number = 1;
  pageSize = ConstantData.PageSizes;
  itemPerPage: number = this.pageSize[0];
  action: ActionModel = {} as ActionModel;
  staffLogin: StaffLoginModel = {} as StaffLoginModel;


  constructor(
    private service: AppService,
    private localService: LocalService,
    private router: Router,
    private loadData:LoadDataService,
      private toastr: ToastrService,
  ) { }

  ngOnInit(): void {
    this.staffLogin = this.localService.getEmployeeDetail();
    this.validiateMenu();
    this.getHeadList();
    this.employeeDetail = this.localService.getEmployeeDetail();
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

  @ViewChild('formHead') formHead: NgForm;
  resetForm() {
    this.Head = {};
    this.Head.Status = 1
    if (this.formHead) {
      this.formHead.control.markAsPristine();
      this.formHead.control.markAsUntouched();
    }
    this.submitted = false
  }

  newHead() {
    this.resetForm();
    $('#modal_popUp').modal('show');
  }

  editHead(obj: any) {
    this.Head = obj;
    $('#modal_popUp').modal('show');
  }

  onTableDataChange(p: any) {
    this.p = p;
  }

  sort(key: any) {
    this.sortKey = key;
    this.reverse = !this.reverse;
  }

getHeadList() {
  const obj: RequestModel = {
    request: this.localService.encrypt(JSON.stringify({})).toString()
  };

  this.dataLoading = true;

  this.service.getHeadList(obj).subscribe({
    next: r1 => {
      let response = r1 as any;
      if (response.Message == ConstantData.SuccessMessage) {
        this.HeadList = response.PrescriptionHeadList;
        
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


  saveHead() {
    this.submitted = true;
    if (this.formHead.invalid) {
      toastr.warning("Fill all the Required Fields.", "Invailid Form")
      this.dataLoading = false;
      return;
    }
    this.Head.UpdatedBy = this.employeeDetail.EmployeeId;
    this.Head.CreatedBy = this.employeeDetail.EmployeeId;
    this.dataLoading = true;
    var obj: RequestModel = {
        request: this.localService.encrypt(JSON.stringify(this.Head)).toString()
      }
    this.service.saveHead(obj).subscribe(r1 => {
      let response = r1 as any;
      
      if (response.Message == ConstantData.SuccessMessage) {
       if (this.Head.HeadId > 0) {
            this.toastr.success("Head Updated successfully")
            $('#staticBackdrop').modal('hide')
          } else {
            this.toastr.success("Head added successfully")
          }
        this.getHeadList();
        this.dataLoading = false;
        $('#staticBackdrop').modal('hide');
      } else {
        toastr.error(response.Message);
      }
    }, (err => {
      toastr.error("Error Occured while fetching data.");
      this.dataLoading = false;
    }));
  }

  
  deleteHead(obj: any) {
    if (confirm("Are your sure you want to delete this recored")) {
      var request: RequestModel = {
        request: this.localService.encrypt(JSON.stringify(obj)).toString()
      }
      this.dataLoading = true;
      this.service.deleteHead(request).subscribe(r1 => {
        let response = r1 as any
        if (response.Message == ConstantData.SuccessMessage) {
          this.toastr.success("Record Deleted successfully")
          this.getHeadList()
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
