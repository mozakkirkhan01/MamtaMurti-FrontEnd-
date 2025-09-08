import { Component, ViewChild } from '@angular/core';
import { NgForm } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';
import { AppService } from '../../utils/app.service';
import { ConstantData } from '../../utils/constant-data';
import { Gender, PaymentMode, Status,Category } from '../../utils/enum';
import { LoadDataService } from '../../utils/load-data.service';
import {
  ActionModel,
  RequestModel,
  StaffLoginModel,
} from '../../utils/interface';
import { LocalService } from '../../utils/local.service';
import { ActivatedRoute, Router } from '@angular/router';
declare var $: any;
@Component({
  selector: 'app-canteen-sell',
  templateUrl: './canteen-sell.component.html',
  styleUrls: ['./canteen-sell.component.css']
})
export class CanteenSellComponent {
  dataLoading: boolean = false;
    CanteenList: any = [];
    ChargeList: any = [];
    FeeChargeList: any = [];
    Canteen: any = {};
    Payment: any = {};
    isSubmitted = false;
    PageSize = ConstantData.PageSizes;
    p: number = 1;
    Search: string = '';
    reverse: boolean = false;
    sortKey: string = '';
    itemPerPage: number = this.PageSize[0];
    StateList: any[] = [];
    filterState: any[] = [];
    StatusList = this.loadData.GetEnumList(Status);
    GenderList = this.loadData.GetEnumList(Gender);
    PaymentModeList = this.loadData.GetEnumList(PaymentMode);
    action: ActionModel = {} as ActionModel;
    staffLogin: StaffLoginModel = {} as StaffLoginModel;
    AllStatusList = Status;
    AllGenderList = Gender;
    AllCategoryList = Category;
    AllPaymentModeList = PaymentMode;
    currentPayment: any = {};
    tempData: any;
    filteredCanteenList: any[] = [];
    CanteenListAll: any;
  ItemChargeList: any=[];
  
    sort(key: any) {
      this.sortKey = key;
      this.reverse = !this.reverse;
    }
  
    onTableDataChange(p: any) {
      this.p = p;
    }
  
    constructor(
      private service: AppService,
      private toastr: ToastrService,
      private loadData: LoadDataService,
      private localService: LocalService,
      private router: Router,
      private route: ActivatedRoute
    ) {}
  
    redUrl: string = '';
  
    ngOnInit(): void {
      this.getCanteenListall(this.Canteen.CanteenId);
      this.Payment.Quantity = 1;
      this.tempData = this.service.getSelectedOpticalData();
  
      this.staffLogin = this.localService.getEmployeeDetail();
      this.validiateMenu();
      this.resetForm();
      this.getCanteenList(this.Canteen.CanteenId);
      this.route.queryParams.subscribe((params: any) => {
        this.Canteen.CanteenId = params.id;
        this.redUrl = params.redUrl;
        if (this.Canteen.CanteenId > 0) {
          this.getCanteenList(this.Canteen.CanteenId);
        }
        this.Canteen.InvoiceDate = new Date();
              this.Canteen.PaymentDate = new Date();
      });
      this.route.queryParams.subscribe((params) => {
        const CanteenBillingId = params['id'];
        const redUrl = params['redUrl'];
  
        const data = this.service.getSelectedCanteenData();
        if (data && data.GetCanteenBilling.CanteenBillingId == CanteenBillingId) {
          this.Canteen = {
            ...data.GetCanteenBilling,
            ...data.GetPaymentCollection,
          };
          this.SelectedPaymentDetailList = data.GetCanteensDetails;
          this.currentPayment = data.GetPaymentDetails[0];
     
        } else {
          // Optional: fallback to fetch data again using surgeryId
        }
        
      });

      this.currentPayment.PaymentMode = 1;
      this.Canteen.CustomerName = "cash";
    }
    validiateMenu() {
      var request: RequestModel = {
        request: this.localService
          .encrypt(
            JSON.stringify({
              Url: '/admin/canteen-billing',
              StaffLoginId: this.staffLogin.StaffLoginId,
            })
          )
          .toString(),
      };
      this.dataLoading = true;
      this.service.validiateMenu(request).subscribe(
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
  
    @ViewChild('formCanteenDetails') formCanteenDetails: NgForm;
    resetForm() {
      this.Canteen = {};
      if (this.formCanteenDetails) {
        this.formCanteenDetails.control.markAsPristine();
        this.formCanteenDetails.control.markAsUntouched();
      }
      this.isSubmitted = false;
    }
  
    getCanteenList(CanteenId: number) {
      var data = {
        CanteenID: CanteenId,
      };
      const obj: RequestModel = {
        request: this.localService.encrypt(JSON.stringify(data)).toString(),
      };
  
      this.dataLoading = true;
  
      this.service.getCanteenList(obj).subscribe({
        next: (r1) => {
          let response = r1 as any;
          if (response.Message == ConstantData.SuccessMessage) {
            this.CanteenList = response.CanteenList;
            
  
          } else {
            this.toastr.error(response.Message);
          }
          this.dataLoading = false;
        },
        error: (err) => {
          console.error('API error:', err);
          this.toastr.error('Error while fetching records');
          this.dataLoading = false;
        },
      });
    }
  
    // getCanteenList() {
    //   var obj: RequestModel = {
    //     request: this.localService.encrypt(JSON.stringify({})).toString(),
    //   };
    //   this.dataLoading = true;
    //   this.service.getCanteenList(obj).subscribe(
    //     (r1) => {
    //       let response = r1 as any;
    //       if (response.Message == ConstantData.SuccessMessage) {
    //         this.CanteenList = response.CanteenList;
    //       } else {
    //         this.toastr.error(response.Message);
    //       }
    //       this.dataLoading = false;
    //     },
    //     (err) => {
    //       this.toastr.error('Error while fetching records');
    //     }
    //   );
    // }
  
    afterTransportSupplierSelected(event: any) {
      this.Payment.ItemId = event.option.id;
      this.Payment.ItemName = event.option.value;
      var Transport = this.ChargeList.find(
        (x: any) => x.ItemId == this.Payment.ItemId
      );
      this.Payment.ItemName = Transport.ItemName;
      this.Payment.Rate = Transport.Rate;
      this.Payment.Description = Transport.Description;
      this.Payment.ItemId = Transport.ItemId;
      this.onRateChange();
    }
  
    filterCanteenList(value: any) {
      if (value) {
        const filterValue = value.toLowerCase();
        this.ChargeList = this.CanteenList.filter((option: any) =>
          option.OpticalName.toLowerCase().includes(filterValue)
        );
      } else {
        this.ChargeList = this.CanteenList;
      }
    }
    clearTransportSupplier() {
      this.ChargeList = this.CanteenList;
      this.Payment.ItemId = null;
      this.Payment.Quantity = 1 ;
      this.Payment.ItemName = "" ;
      this.Payment.Rate = "" ;
    }
  
  
    recalculateTotals() {
    let totalAmount = 0;
    let totalDiscount = 0;
    let totalLineTotal = 0;
  
    this.SelectedPaymentDetailList.forEach((item: { TotalAmount: any; Discount: any; LineTotal: any; }) => {
      totalAmount += item.TotalAmount || 0;
      totalDiscount += item.Discount || 0;
      totalLineTotal += item.LineTotal || 0;
    });
  
    this.Canteen.TotalAmount = totalAmount;
    this.Canteen.DiscountAmount = totalDiscount;
    this.Canteen.PayableAmount = totalLineTotal;
    this.currentPayment.PaidAmount = totalAmount;
  }
  
  
  clearCurrentPayment() {
    this.Payment = {
      ItemName:'',
      Rate: 0,
      Quantity: 1,
      TotalAmount: 0,
      Discount: 0,
      LineTotal: 0
    };
  }
  
  
    SelectedPaymentDetailList: any = [];
    addPaymentDetail() {
      if (this.Payment.TotalAmount == null || this.Payment.TotalAmount == '') {
        this.toastr.error('Please Enter Paid Amount!!!');
        return;
      }
      if (this.Payment.ItemName == null || this.Payment.OpticalName == '') {
        this.toastr.error('Please Select Item !!!');
        return;
      }
      this.Payment.ItemId = this.Payment.ItemId;
      this.SelectedPaymentDetailList.push(this.Payment);
      this.recalculateTotals();  // Call a function to calculate the totals
    this.clearCurrentPayment();
    }
  
  
  
    RemoveHotel(index: number) {
      this.SelectedPaymentDetailList.splice(index, 1);
      this.CalculateTotalAmount();
    }
  
    resetHotelPayment() {
      this.Payment = {};
      this.isSubmitted = false;
    }
  
    CalculateTotalAmount() {
      let TotalAmount = 0;
  
      for (let i = 0; i < this.SelectedPaymentDetailList.length; i++) {
        const paymentDetail = this.SelectedPaymentDetailList[i];
        TotalAmount += parseFloat(paymentDetail.Amount) || 0;
      }
  
      this.Canteen.TotalAmount = TotalAmount;
      this.Canteen.DiscountAmount = 0;
      this.Canteen.PayableAmount = TotalAmount;
      this.Canteen.PaidAmount = 0;
      this.currentPayment.PaidAmount = TotalAmount;
    }
  
    updatePaymentFields() {
      this.Canteen.PayableAmount =
        this.Canteen.TotalAmount - this.Canteen.DiscountAmount;
      this.Canteen.PaidAmount =
        this.Canteen.TotalAmount - this.Canteen.DiscountAmount;
      this.currentPayment.PaidAmount =
        this.Canteen.TotalAmount - this.Canteen.DiscountAmount;
    }
  
    ChangeDuesAmount() {
      this.Canteen.DueAmount =
        this.Canteen.PayableAmount - this.Canteen.PaidAmount;
    }
  
    saveCanteen() {
      this.isSubmitted = true;
  
      if (
        !this.SelectedPaymentDetailList ||
        this.SelectedPaymentDetailList.length === 0
      ) {
        this.toastr.error(
          'Please add at least Item to the list!'
        );
        return;
      }
  
      this.Canteen.CreatedBy = this.staffLogin.StaffId;
      this.Canteen.UpdatedBy = this.staffLogin.StaffId;
      this.Canteen.PaymentDate = this.loadData.loadDateYMD(
        this.Canteen.PaymentDate
      );
  
      if (this.tempData != undefined) {
        this.Canteen.PaymentCollectionId =
          this.tempData.GetPaymentCollection.PaymentCollectionId;
      }
  
      const data = {
        GetBilling: this.Canteen,
        GetPaymentCollection: this.Canteen,
        GetCanteenDetails: this.SelectedPaymentDetailList,
        GetPaymentDetails: this.currentPayment,
      };
  
      const obj: RequestModel = {
        request: this.localService.encrypt(JSON.stringify(data)).toString(),
      };
  
      this.dataLoading = true;
      this.service.saveCanteenBill(obj).subscribe(
        (r1) => {
          const response = r1 as any;
  
          if (response.Message === ConstantData.SuccessMessage) {
            if (this.Canteen.CanteenBillingId > 0) {
              this.toastr.success('Item Updated successfully');
              $('hashtag#staticBackdrop').modal('hide');
            } else {
              this.toastr.success('Item added successfully');
            }
            //  this.service.PrintOpticlalBill(response.OpticalBillingId);
            this.SelectedPaymentDetailList = [];
            this.resetForm();
          } else {
            this.toastr.error(response.Message);
          }
  
          this.dataLoading = false;
        },
        (err) => {
          this.toastr.error('Error occurred while submitting data');
          this.dataLoading = false;
        }
      );
    }
  
  
    getCanteenListall(CanteenId: number) {
      var data = {
        CanteenID: CanteenId,
      };
      const obj: RequestModel = {
        request: this.localService.encrypt(JSON.stringify(data)).toString(),
      };
      this.dataLoading = true;
  
      this.service.getCanteenList(obj).subscribe({
        next: (r1) => {
          let response = r1 as any;
          if (response.Message == ConstantData.SuccessMessage) {
            this.CanteenListAll = response.CanteenList;
            this.filteredCanteenList = [...this.CanteenListAll];
          } else {
            this.toastr.error(response.Message);
          }
          this.dataLoading = false;
        },
        error: (err) => {
          console.error('API error:', err);
          this.toastr.error('Error while fetching records');
          this.dataLoading = false;
        },
      });
    }
  
    // filterCanteenList(value: string) {
    //   const filterValue = value?.toLowerCase() || '';
  
    //   this.filteredCanteenList = this.CanteenListAll.filter(
    //     (option: any) =>
    //       option.CanteenName?.toLowerCase().includes(filterValue) ||
    //       option.UHID?.toLowerCase().includes(filterValue) ||
    //       option.ContactNo?.toLowerCase().includes(filterValue)
    //   );
    // }
  
    afterCanteenSelected(event: any) {
      const selectedName = event.option.value;
  
      const selected = this.CanteenListAll.find(
        (x: any) => x.CanteenName === selectedName
      );
  
      if (selected) {
        this.Canteen = { ...selected }; // assign full Canteen object
        this.getCanteenList(this.Canteen.CanteenID); // optional
      }
      if (selected) {
      this.Payment.Rate = selected.Rate || 0;  // get the rate from your selected option
      this.Payment.Quantity = 1;
      this.onRateChange();  // calculate Amount and LineTotal
    }
    }
  
    clearCanteen() {
      this.ChargeList = this.CanteenListAll;
      // this.Canteen.PackageCollectionId = null;
      this.Canteen.CanteenName = '';
    }
  
  
  
  
    // my code 
    onRateChange() {
      if (this.Payment.Quantity && this.Payment.Rate) {
        this.Payment.TotalAmount = this.Payment.Rate * this.Payment.Quantity;
        this.updateLineTotal();
      }
    }
  
    onQuantityChange() {
      if (this.Payment.Rate && this.Payment.Quantity) {
        this.Payment.TotalAmount = this.Payment.Rate * this.Payment.Quantity;
        this.updateLineTotal();
      }
    }
  
    onDiscountChange() {
      this.updateLineTotal();
    }
  
    updateLineTotal() {
      this.Payment.LineTotal =
        (this.Payment.Amount || 0) - (this.Payment.Discount || 0);
    }

    filterItemList(value: any) {
    if (value) {
      const ItemfilterValue = value.toLowerCase();
      this.ItemChargeList = this.CanteenList.filter((option: any) =>
        option.ItemName.toLowerCase().includes(ItemfilterValue)
      );
    } else {
      this.ItemChargeList = this.CanteenList;
    }
  }

    afterItemSelected(event: any) {
    this.Payment.ItemId = event.option.id;
    this.Payment.ItemName = event.option.value;
    var Transport = this.ItemChargeList.find(
      (x: any) => x.ItemId == this.Payment.ItemId
    );
    this.Payment.ItemName = Transport.ItemName;
    this.Payment.ItemId = Transport.ItemId;
     this.Payment.ItemName = Transport.ItemName;
      this.Payment.Rate = Transport.Rate;
      this.Payment.Description = Transport.Description;
      this.Payment.ItemId = Transport.ItemId;
      this.onRateChange();
  }

   clearItem() {
    this.ItemChargeList = this.CanteenList;
      this.Payment.ItemId = null;
      this.Payment.Quantity = 1 ;
      this.Payment.ItemName = "" ;
      this.Payment.Rate = "" ;
  }
}
