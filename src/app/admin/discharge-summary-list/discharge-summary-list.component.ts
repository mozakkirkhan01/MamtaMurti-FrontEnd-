import { Component, ViewChild } from '@angular/core';
import { ToastrService } from 'ngx-toastr';
import { AppService } from '../../utils/app.service';
import { ConstantData } from '../../utils/constant-data';
import { NgForm } from '@angular/forms';
import { LocalService } from '../../utils/local.service';
import { LoadDataService } from '../../utils/load-data.service';
import { BillStatus, Status,PaymentStatus,PaymentMode, Gender } from '../../utils/enum';
import {
  ActionModel,
  RequestModel,
  StaffLoginModel,
} from '../../utils/interface';
import { Router } from '@angular/router';
declare var $: any;
@Component({
  selector: 'app-discharge-summary-list',
  templateUrl: './discharge-summary-list.component.html',
  styleUrls: ['./discharge-summary-list.component.css']
})
export class DischargeSummaryListComponent {

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
    AllStatusList =  Status;
    AllGenderList = Gender;
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
  alldata: any=[];

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
    this.getDischargeSummary();

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
          
      this.service.PrintDischargeSummary(data);
    }








    
    getDischargeSummary() {

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

      var obj: RequestModel = {
        request: this.localService.encrypt(JSON.stringify(this.filterModel)).toString(),
      };
      this.dataLoading = true;
      this.service.DischargeSummary(obj).subscribe(
        (r1) => {
          let response = r1 as any;
          if (response.Message == ConstantData.SuccessMessage) {
            this.TotalRecords = response.dischargeSummaryList;
          
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

    editPackageCollection(data: any) {

    const obj: RequestModel = {
      request: this.localService.encrypt(JSON.stringify(data)).toString(),
    };
    this.service.DischargeSummary(obj).subscribe(
      (response: any) => {
        try {
          this.alldata = response.dischargeSummaryList;

          this.service.setSelectedDsData(this.alldata);
        if(this.alldata && this.alldata.length > 0)  {
          const item = this.alldata[0];
        

          this.router.navigate(['/admin/discharge-summary'], {
            queryParams: {
              id: item.DischargeSummaryId,
              redUrl: '/admin/discharge-summary-list',
            },
          })};
        } catch (error) {
          this.toastr.error(response.Message || 'Error processing data.');
        }
      },
      (error) => {
        this.toastr.error('API call failed');
      }
    );
  }



  
    deleteDischargeSummaryList(obj: any) {
      if (confirm('Are your sure you want to delete this recored')) {
        var request: RequestModel = {
          request: this.localService.encrypt(JSON.stringify(obj)).toString(),
        };
        this.dataLoading = true;
        this.service.deleteDischargeSummary(request).subscribe(
          (r1) => {
            let response = r1 as any;
            if (response.Message == ConstantData.SuccessMessage) {
              this.toastr.success("Discharge Summary Deleted successfully");
              this.getDischargeSummary();
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
  
  
}
