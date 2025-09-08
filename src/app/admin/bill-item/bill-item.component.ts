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
  selector: 'app-bill-item',
  templateUrl: './bill-item.component.html',
  styleUrls: ['./bill-item.component.css']
})
export class BillItemComponent {
dataLoading: boolean = false
  BillingList: any = []
  Billing: any = {}
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
    this.getBillingList();
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

  @ViewChild('formBilling') formBilling: NgForm;

  resetForm() {
    this.Billing = {}
    if (this.formBilling) {
      this.formBilling.control.markAsPristine();
      this.formBilling.control.markAsUntouched();
    }
    this.isSubmitted = false
    this.Billing.Status = 1
  }

  sort(key: any) {
    this.sortKey = key;
    this.reverse = !this.reverse;
  }

  onTableDataChange(p: any) {
    this.p = p
  }

  getBillingList() {
    var obj: RequestModel = {
      request: this.localService.encrypt(JSON.stringify({ })).toString()
    }
    this.dataLoading = true
    this.service.getBillingList(obj).subscribe(r1 => {
      let response = r1 as any
      if (response.Message == ConstantData.SuccessMessage) {
        this.BillingList = response.BillingList;
        
      } else {
        this.toastr.error(response.Message)
      }
      this.dataLoading = false
    }, (err => {
      this.toastr.error("Error while fetching records")
    }))
  }

  saveBilling() {
    this.isSubmitted = true;

    if(this.Billing.BillingId > 0){
      this.Billing.UpdatedBy = this.staffLogin.StaffId
    }
    this.Billing.CreatedBy = this.staffLogin.StaffId;

   
    
    var obj: RequestModel = {
      request: this.localService.encrypt(JSON.stringify(this.Billing)).toString()
    }

   
    
    this.service.saveBilling(obj).subscribe(r1 => {
      let response = r1 as any
      if (response.Message == ConstantData.SuccessMessage) {
        if (this.Billing.BillingId > 0) {
          this.toastr.success("Billing detail updated successfully")
          
        } else {
          this.toastr.success("Billing added successfully")
        }
        $('#staticBackdrop').modal('hide')
        this.resetForm()
        this.getBillingList();

      } else {
        this.toastr.error(response.Message)
      }
    }, (err => {
      this.toastr.error("Error occured while submitting data")
    }))
  }

  deleteBilling(obj: any) {
    if (confirm("Are your sure you want to delete this recored")) {
      var request: RequestModel = {
        request: this.localService.encrypt(JSON.stringify(obj)).toString()
      }
      this.dataLoading = true;
      this.service.deleteBilling(request).subscribe(r1 => {
        let response = r1 as any
        if (response.Message == ConstantData.SuccessMessage) {
          this.toastr.success("Record Deleted successfully")
          this.getBillingList()
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

  editBillings(obj: any) {
    this.resetForm()
    this.Billing = obj

  }
}
