import { Component, ViewChild } from '@angular/core';
import { NgForm } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';
import { AppService } from '../../utils/app.service';
import { ConstantData } from '../../utils/constant-data';
import { Gender, Status, BookingStatus, BillStatus ,PaymentStatus,PaymentMode} from '../../utils/enum';
import { LoadDataService } from '../../utils/load-data.service';
import { ActionModel, RequestModel, StaffLoginModel } from '../../utils/interface';
import { LocalService } from '../../utils/local.service';
import { Router } from '@angular/router';
import { AnyCatcher } from 'rxjs/internal/AnyCatcher';
declare var $: any

@Component({
  selector: 'app-opd-list',
  templateUrl: './opd-list.component.html',
  styleUrls: ['./opd-list.component.css']
})
export class OpdListComponent {
  opdList: any = [];
  dataLoading = false;
  PageSize = ConstantData.PageSizes;
  p: number = 1;
  action: ActionModel = {} as ActionModel;
  Search: string = '';
  reverse: boolean = false;
  sortKey: string = '';
  itemPerPage: number = this.PageSize[0];
  staffLogin: StaffLoginModel = {} as StaffLoginModel;
  StatusList = this.loadData.GetEnumList(Status);
  GenderList = this.loadData.GetEnumList(Gender);
   AmountPaymentStatusList = this.loadData.GetEnumList(PaymentStatus);
       PaymentModeList = this.loadData.GetEnumList(PaymentMode);
    isSubmitted = false;
   
  AllStatusList = Status;
  AllGenderList = Gender;
   filterModel: any = {};
  // BookingStatus = this.loadData.GetEnumList(BookingStatus);
  // AllBookingStatus = BookingStatus;

  PaymentStatus = this.loadData.GetEnumList(BillStatus);
  AllPaymentStatus = BillStatus;
  allData: any[] = [];
  pagedData: any[] = [];
  totalAmountPaid: number = 0;
  currentPage: number = 1;
  totalRecords: number = 0;
  OpdTotal: any = {};
  alldata: any;
  DueBill: any={};


  constructor(
    private service: AppService,
    private toastr: ToastrService,
    private loadData: LoadDataService,
    private localService: LocalService,
    private router: Router
  ) { }

  sort(key: any) {
    this.sortKey = key;
    this.reverse = !this.reverse;
  }

  ngOnInit() {
    this.staffLogin = this.localService.getEmployeeDetail();
    this.validiateMenu();
    this.getOpdList();
     this.filterModel = {
      StartFrom: null,
      EndFrom: null,
      PaymentStatus: 0,
    };
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

  getPrint(data:any){
  this.service.PrintOpdBill(data.OpdId)
}


  getOpdList() {
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

    const request: RequestModel = {
      request: this.localService.encrypt(JSON.stringify(data)).toString()
    };

    this.dataLoading = true;

    this.service.getOpdList(request).subscribe({
      next: (r1) => {
        let response = r1 as any;
        if (response.Message === ConstantData.SuccessMessage) {
          this.opdList = response.OpdBookingList;

          this.OpdTotal.PaidAmount = response.PaidAmountTotal;
          this.totalRecords = response.TotalRecords;
           this.OpdTotal.TotalPayableAmount = response.TotalPayableAmount;
          this.OpdTotal.DueAmountTotal = response.DueAmountTotal;
        } else {
          this.toastr.error(response.Message);
        }
        this.dataLoading = false;
      },
      error: (err) => {
        this.toastr.error("Error while fetching records");
        this.dataLoading = false;
      }
    });
  }

DeleteOpdBilling(obj: any) {
    if (confirm('Are your sure you want to delete this recored')) {
      var request: RequestModel = {
        request: this.localService.encrypt(JSON.stringify(obj)).toString(),
      };
      console.log(obj);

      this.dataLoading = true;
      this.service.DeleteOpticalBilling(request).subscribe(
        (r1) => {
          let response = r1 as any;
          if (response.Message == ConstantData.SuccessMessage) {
            this.toastr.success('the recored deleted', response.Message);
            this.getOpdList();
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
  onTableDataChange(event: number) {
    this.p = event;
    this.getOpdList();
  }

  onPageSizeChange() {
    this.p = 1; // reset to first page
    this.getOpdList();
  }

  editPackageCollection(data: any) {
      
  const obj: RequestModel = {
      request: this.localService.encrypt(JSON.stringify(data)).toString(),
    };
  this.service.getOpdAllList(obj).subscribe(
    (response: any) => {
      try {
        this.alldata = response.opd;
        this.service.setSelectedOpdData(this.alldata);
        this.router.navigate(['/admin/opd-booking'], {
          queryParams: { id: this.alldata.GetOpdBooking.OpdId, redUrl: '/admin/opd-List' }
        });

      } catch (error) {
        this.toastr.error(response.Message || "Error processing data.");
      }
    },
    
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
          this.getOpdList();
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

