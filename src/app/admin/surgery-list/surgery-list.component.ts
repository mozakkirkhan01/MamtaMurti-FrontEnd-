import { Component, ViewChild } from '@angular/core';
import { ToastrService } from 'ngx-toastr';
import { AppService } from '../../utils/app.service';
import { ConstantData } from '../../utils/constant-data';
import { NgForm } from '@angular/forms';
import { LocalService } from '../../utils/local.service';
import { LoadDataService } from '../../utils/load-data.service';
import { BillStatus, Status,PaymentStatus,PaymentMode } from '../../utils/enum';
import {
  ActionModel,
  RequestModel,
  StaffLoginModel,
} from '../../utils/interface';
import { Router } from '@angular/router';
declare var $: any;
@Component({
  selector: 'app-surgery-list',
  templateUrl: './surgery-list.component.html',
  styleUrls: ['./surgery-list.component.css']
})
export class SurgeryListComponent {
  DueBill: any = {};
  dataLoading: boolean = false;
    PackageDetialList: any = [];
    PackageDetial: any = {};
    ChargeList: any = []
    isSubmitted = false;
    StatusList = this.loadData.GetEnumList(Status);
    PageSize = ConstantData.PageSizes;
    p: number = 1;
    Search: string = '';
    reverse: boolean = true;
    sortKey: string = '';
    itemPerPage: number = this.PageSize[0];
    action: ActionModel = {} as ActionModel;
    staffLogin: StaffLoginModel = {} as StaffLoginModel;
    PaymentModeList = this.loadData.GetEnumList(PaymentMode);
     AmountPaymentStatusList = this.loadData.GetEnumList(PaymentStatus);
    AllStatusList =  BillStatus;
    Product: any = {};
    PackageCollectionListall: any[] = [];
  TotalRecords: any;
  BillData: any;
  Packages: any;
  Payments: any;
  SurgeryReceiptModel: any;
  Patient: any;
  filterModel: any = {};
    SurgeryTotal: any = {};

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
      this.getSurgeryDetial();
      this.resetForm();
       this.filterModel = {
      StartFrom: null,
      EndFrom: null,
      PaymentStatus: 0,
    };
      // this.PackageCollectiontypeList({})
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
  

    getPrint(data:any){
      this.service.PrintSurgeryBill(data.SurgeryId)
    }








    
    getSurgeryDetial() {

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
      var obj: RequestModel = {
        request: this.localService.encrypt(JSON.stringify(data)).toString(),
      };
      this.dataLoading = true;
      this.service.getSurgeryDetial(obj).subscribe(
        (r1) => {
          let response = r1 as any;
          if (response.Message == ConstantData.SuccessMessage) {
            this.TotalRecords = response.SurgeryList;
          this.SurgeryTotal.PaidAmount = response.PaidAmountTotal;
          this.SurgeryTotal.TotalPayableAmount = response.TotalPayableAmount;
          this.SurgeryTotal.DueAmountTotal = response.DueAmountTotal;
          this.SurgeryTotal.DiscountAmountTotal = response.DiscountAmountTotal;
          this.SurgeryTotal.AmountTotal = response.AmountTotal;
          
          
            console.log(response.SurgeryList);
            console.log(this.TotalRecords);
          } else {
            this.toastr.error(response.Message);
          }
          this.dataLoading = false;
        },
        (err) => {
          this.toastr.error('Error while fetching records');
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
  
      console.log(this.PackageDetial);
      
  
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
            this.getSurgeryDetial();
          } else {
            this.toastr.error(response.Message);
          }
        },
        (err) => {
          this.toastr.error('Error occured while submitting data');
        }
      );
    }
  
    deleteSurgeryDetials(obj: any) {
      if (confirm('Are your sure you want to delete this recored')) {
        var request: RequestModel = {
          request: this.localService.encrypt(JSON.stringify(obj)).toString(),
        };
        this.dataLoading = true;
        this.service.deleteSurgeryDetial(request).subscribe(
          (r1) => {
            let response = r1 as any;
            if (response.Message == ConstantData.SuccessMessage) {
              this.toastr.success(response.message);
              this.getSurgeryDetial();
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
  this.service.getsurgeryAllList(obj).subscribe(
    (response: any) => {
      try {
        this.alldata = response.Surgery;
        

        // Store in a shared service (better approach)
        this.service.setSelectedSurgeryData(this.alldata);
        console.log("mera datra",this.alldata);
        

        // Then navigate using only necessary params
        this.router.navigate(['/admin/surgery-bill'], {
          queryParams: { id: this.alldata.GetSurgery.SurgeryId, redUrl: '/admin/surgery-List' }
        });

      } catch (error) {
        this.toastr.error(response.Message || "Error processing data.");
      }
    },
    (error) => {
      this.toastr.error("API call failed");
    }
  );


 
}

 openViewModalForDue(item: any) {
    console.log(item);
    this.DueBill = item;
    this.DueBill.PaymentDate= new Date();
    $('#viewDueModal').modal('show');
  }

  
    
    ClearDueAmount(obj: any) {
    console.log(obj);

    this.DueBill = obj;
    this.DueBill.CreatedBy = this.staffLogin.StaffId;
    this.DueBill.PaymentDate = this.loadData.loadDateYMD(
        this.DueBill.PaymentDate);
    
    var request: RequestModel = {
      request: this.localService.encrypt(JSON.stringify(this.DueBill)).toString(),
    };
    this.dataLoading = true;
    this.service.saveOpticalsBillDue(request).subscribe(
      (r1) => {
        let response = r1 as any;
        if (response.Message == ConstantData.SuccessMessage) {
          this.dataLoading = false;
          this.toastr.success("Due amount cleared successfully");
          this.getSurgeryDetial();
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
