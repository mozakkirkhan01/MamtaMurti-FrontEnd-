import { Component, ViewChild } from '@angular/core';
import { ToastrService } from 'ngx-toastr';
import { AppService } from '../../utils/app.service';
import { ConstantData } from '../../utils/constant-data';
import { NgForm } from '@angular/forms';
import { LocalService } from '../../utils/local.service';
import { LoadDataService } from '../../utils/load-data.service';

import {
  BillStatus,
  Status,
  PaymentStatus,
  DeliveryStatus,
  PaymentMode
} from '../../utils/enum';
import {
  ActionModel,
  RequestModel,
  StaffLoginModel,
} from '../../utils/interface';
import { Router } from '@angular/router';
declare var $: any;
@Component({
  selector: 'app-canteen-billing-list',
  templateUrl: './canteen-billing-list.component.html',
  styleUrls: ['./canteen-billing-list.component.css']
})
export class CanteenBillingListComponent {
  DueDate: any;
  DuePayment: any;
    Deliverystatus: any={};
  clearPayment() {
  throw new Error('Method not implemented.');
  }
    dataLoading: boolean = false;
    PackageDetialList: any = [];
    PackageDetial: any = {};
    ChargeList: any = [];
    isSubmitted = false;
    StatusList = this.loadData.GetEnumList(Status);
    AmountPaymentStatusList = this.loadData.GetEnumList(PaymentStatus);
    DeliveryStatusList = this.loadData.GetEnumList(DeliveryStatus);
    PaymentModeList = this.loadData.GetEnumList(PaymentMode);
    PageSize = ConstantData.PageSizes;
    p: number = 1;
    Search: string = '';
    reverse: boolean = true;
    sortKey: string = '';
    itemPerPage: number = this.PageSize[0];
    action: ActionModel = {} as ActionModel;
    staffLogin: StaffLoginModel = {} as StaffLoginModel;
    AllStatusList = BillStatus;
    Product: any = {};
    PackageCollectionListall: any[] = [];
    TotalRecords: any;
    BillData: any;
    Packages: any;
    Payments: any;
    SurgeryReceiptModel: any;
    Patient: any;
    Filter: any = {};
    filterModel: any = {};
    CanteenTotal: any = {};
    selectedBill: any = {};
    CanteenSellListALL: any = {};
    DueBill: any={};
    constructor(
      private service: AppService,
      private toastr: ToastrService,
      private loadData: LoadDataService,
      private localService: LocalService,
      private router: Router
    ) {}
  
    ngOnInit(): void {
      this.staffLogin = this.localService.getEmployeeDetail();
      this.validiateMenu();
      this.resetForm();
  
      // Initialize pagination defaults
      this.p = 1;
      this.itemPerPage = 10; // Or your default
  
      // Initialize filter model
      this.filterModel = {
        StartFrom: null,
        EndFrom: null,
        PaymentStatus: 0,
      };
  
      // Fetch data
      this.getCateenBillList();
    }
    getDeliveryStatus(value: number): string {
      const status = this.DeliveryStatusList.find((x) => x.Key === value);
      return status ? status.Value : '-';
    }
  
    validiateMenu() {
      var obj: RequestModel = {
        request: this.localService
          .encrypt(
            JSON.stringify({
              Url: this.router.url,
              StaffLoginId: this.staffLogin.StaffLoginId,
            })
          )
          .toString(),
      };
      this.dataLoading = true;
      this.service.validiateMenu(obj).subscribe(
        (response: any) => {
          this.action = this.loadData.validiateMenu(
            response,
            this.toastr,
            this.router
          );
          this.dataLoading = false;
        },
        (err) => {
          this.toastr.error('Error while fetching records');
          this.dataLoading = false;
        }
      );
    }
  
    @ViewChild('formDepartment') formPackageCollection: NgForm;
    resetForm() {
      this.PackageDetial = {};
      if (this.formPackageCollection) {
        this.formPackageCollection.control.markAsPristine();
        this.formPackageCollection.control.markAsUntouched();
      }
      this.isSubmitted = false;
      this.PackageDetial.Status = 1;
    }
  
    sort(key: any) {
      this.sortKey = key;
      this.reverse = !this.reverse;
    }
  
    onTableDataChange(p: any) {
      this.p = p;
    }
  
    getPrint(data: any) {
      this.service.PrintCanteenBillItem(data.CanteenBillingId);
    }
  
    getCateenBillList() {
      if (this.filterModel.StartFrom) {
        this.filterModel.StartFrom = this.loadData.loadDateYMD(
          this.filterModel.StartFrom
        );
      }
      if (this.filterModel.EndFrom) {
        this.filterModel.EndFrom = this.loadData.loadDateYMD(
          this.filterModel.EndFrom
        );
      }
  
      const requestPayload = JSON.stringify(this.filterModel);
      const data = {
        requestPayload,
        Page: this.p,
        PageSize: this.itemPerPage,
      };
  
      const obj: RequestModel = {
        request: this.localService.encrypt(JSON.stringify(data)).toString(),
      };
  
      this.dataLoading = true;
      this.service.CanteensBillList(obj).subscribe(
        (r1) => {
          let response = r1 as any;
          if (response.Message === ConstantData.SuccessMessage) {
            this.TotalRecords = response.CanteenBillingList;
            
            this.CanteenTotal.TotalAmount = response.PaidAmountTotal;
          } else {
            this.toastr.error(response.Message);
          }
          this.dataLoading = false;
        },
        (err) => {
          this.toastr.error('Error while fetching records');
          this.dataLoading = false;
        }
      );
    }
  
    savePackageCollection() {
      this.isSubmitted = true;
      // this.formPackageCollection.control.markAllAsTouched();
      // if (this.formPackageCollection.invalid) {
      //   this.toastr.error("Fill all the required fields !!")
      //   return
      // }
      this.PackageDetial.CreatedBy = this.staffLogin.StaffId;
      this.PackageDetial.UpdatedBy = this.staffLogin.StaffId;
  
  
      var obj: RequestModel = {
        request: this.localService
          .encrypt(JSON.stringify(this.PackageDetial))
          .toString(),
      };
  
      this.service.savePackageDetial(obj).subscribe(
        (r1) => {
          let response = r1 as any;
          if (response.Message == ConstantData.SuccessMessage) {
            if (this.PackageDetial.PackageDetialId > 0) {
              this.toastr.success('Package detail updated successfully');
            } else {
              this.toastr.success('Package Collection added successfully');
            }
            $('#staticBackdrop').modal('hide');
            this.resetForm();
            this.getCateenBillList();
          } else {
            this.toastr.error(response.Message);
          }
        },
        (err) => {
          this.toastr.error('Error occured while submitting data');
        }
      );
    }
  
    DeleteCanteenBilling(obj: any) {
      if (confirm('Are your sure you want to delete this recored')) {
        var request: RequestModel = {
          request: this.localService.encrypt(JSON.stringify(obj)).toString(),
        };
  
        this.dataLoading = true;
        this.service.DeleteCanteenBilling(request).subscribe(
          (r1) => {
            let response = r1 as any;
            if (response.Message == ConstantData.SuccessMessage) {
              this.toastr.success('the recored deleted', response.Message);
              this.getCateenBillList();
            } else {
              this.toastr.error(response.Message);
              this.dataLoading = false;
            }
          },
          (err) => {
            this.toastr.error('Error occured while deleteing the recored');
            this.dataLoading = false;
          }
        );
      }
    }
  
    alldata: any;
  
    editPackageCollection(data: any) {
  
      const obj: RequestModel = {
        request: this.localService.encrypt(JSON.stringify(data)).toString(),
      };
      this.service.UpdateListFromCanteen(obj).subscribe(
        (response: any) => {
          try {
            this.alldata = response.CanteenList;
  
            // Store in a shared service (better approach)
            this.service.setSelectedCanteenData(this.alldata);
            // Then navigate using only necessary params
            this.router.navigate(['/admin/canteen-billing'], {
              queryParams: {
                id: this.alldata.GetCanteenBilling.CanteenBillingId,
                redUrl: '/admin/canteen-billing-list',
              },
            });
          } catch (error) {
            this.toastr.error(response.Message || 'Error processing data.');
          }
        },
        (error) => {
          this.toastr.error('API call failed');
        }
      );
    }
    openViewModal(item: any) {
      this.selectedBill = item;
      $('#viewDetailsModal').modal('show');
      this.CanteenSellList(item);
    }
  
    CanteenSellList(obj: any) {
      var request: RequestModel = {
        request: this.localService.encrypt(JSON.stringify(obj)).toString(),
      };
      this.dataLoading = true;
      this.service.CanteenSellList(request).subscribe(
        (r1) => {
          let response = r1 as any;
          if (response.Message == ConstantData.SuccessMessage) {
            this.CanteenSellListALL = response.CanteenSellList;
  
            this.dataLoading = false;
          } else {
            this.toastr.error('Error occured while Fetching  the recored');
          }
        },
        (err) => {
          this.toastr.error('Error occured while Fetching  the recored');
          this.dataLoading = false;
        }
      );
    }
  
    openViewModalForDue(item: any) {
      this.DueBill = item;
      this.DueBill.PaymentDate= new Date();
      $('#viewDueModal').modal('show');
    }
  
      DeliveryModal(item: any) {
      this.Deliverystatus = item;
      
       this.Deliverystatus.DeliveryDate=new Date();
      $('#DeliveryModal').modal('show');
    }
  
    DeliveryStatusUpdate(obj:any){
      this.Deliverystatus.DeliveryStatuss = obj.DeliveryStatus;  
      this.Deliverystatus.DeliveryDate= this.loadData.loadDateYMD(this.Deliverystatus.DeliveryDate);
      
        var request: RequestModel = {
        request: this.localService.encrypt(JSON.stringify(this.Deliverystatus)).toString(),
      };
      this.dataLoading = true;
      this.service.DeliveryStatus(request).subscribe(
        (r1) => {
          let response = r1 as any;
          if (response.Message == ConstantData.SuccessMessage) {
            this.dataLoading = false;
            this.toastr.success("Canteen Delivered successfully");
            this.getCateenBillList();
          } else {
            this.toastr.error('Error occured while Fetching  the recored');
          }
        },
        (err) => {
          this.toastr.error('Error occured while Fetching  the recored');
          this.dataLoading = false;
        }
      );
    }
  
  
    ClearDueAmount(obj: any) {
  
      this.DueBill = obj;
      this.DueBill.CreatedBy = this.staffLogin.StaffId;
      this.DueBill.PaymentDate = this.loadData.loadDateYMD(
          this.DueBill.PaymentDate);
      
      var request: RequestModel = {
        request: this.localService.encrypt(JSON.stringify(this.DueBill)).toString(),
      };
      this.dataLoading = true;
      this.service.saveCanteensBillDue(request).subscribe(
        (r1) => {
          let response = r1 as any;
          if (response.Message == ConstantData.SuccessMessage) {
            this.dataLoading = false;
            this.toastr.success("Due amount cleared successfully");
            this.getCateenBillList();
          } else {
            this.toastr.error('Error occured while Clearing  the Due');
          }
        },
        (err) => {
          this.toastr.error('Error occured while Fetching  the recored');
          this.dataLoading = false;
        }
      );
    }
}
