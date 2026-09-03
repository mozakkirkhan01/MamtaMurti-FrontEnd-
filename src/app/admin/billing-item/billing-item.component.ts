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
  selector: 'app-billing-item',
  templateUrl: './billing-item.component.html',
  styleUrls: ['./billing-item.component.css']
})
export class BillingItemComponent {
dataLoading: boolean = false;
  PatientList: any = [];
  ChargeList: any = [];
  FeeChargeList: any = [];
  Patient: any = {};
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
  currentPayment: any = [];
  tempData: any;
  filteredPatientList: any[] = [];
  PatientListAll: any;
  BillingList: any = [];

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
    this.getPatientListall(this.Patient.PatientId);
    this.tempData = this.service.getSelectedBillingData();

    this.staffLogin = this.localService.getEmployeeDetail();
    this.validiateMenu();
    this.resetForm();
    this.getBillingList();
    this.route.queryParams.subscribe((params: any) => {
      this.Patient.PatientId = params.id;
      this.redUrl = params.redUrl;
      if (this.Patient.PatientId > 0) {
        this.getPatientList(this.Patient.PatientId);
      }
    });
    this.route.queryParams.subscribe((params) => {
      const BillingItemId = params['id'];
      const redUrl = params['redUrl'];

      const data = this.service.getSelectedBillingData();
      if (data && data.GetBillingItem.BillingItemId == BillingItemId) {
        this.Patient = {
          ...data.GetBillingItem,
          ...data.GetPaymentCollection,
        };
        this.SelectedPaymentDetailList = data.GetBillingItemDetails;
        this.SelectedPaymentCollectionList = data.GetPaymentDetails;
   
      } else {
        // Optional: fallback to fetch data again using surgeryId
      }
      
    });
  }
  validiateMenu() {
    var request: RequestModel = {
      request: this.localService
        .encrypt(
          JSON.stringify({
            Url: '/admin/billing-item',
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

  @ViewChild('formPatientDetails') formPatientDetails: NgForm;
  resetForm() {
    this.Patient = {};
    this.Patient.OpdDate = this.loadData.newloadDateYMD(new Date());

    if (this.formPatientDetails) {
      this.formPatientDetails.control.markAsPristine();
      this.formPatientDetails.control.markAsUntouched();
      this.currentPayment = {};
    }
    this.isSubmitted = false;
  }

  getPatientList(PatientId: number) {
    var data = {
      PatientID: PatientId,
    };
    const obj: RequestModel = {
      request: this.localService.encrypt(JSON.stringify(data)).toString(),
    };

    this.dataLoading = true;

    this.service.getPatientList(obj).subscribe({
      next: (r1) => {
        let response = r1 as any;
        if (response.Message == ConstantData.SuccessMessage) {
          this.PatientList = response.PatientList;

          if (!this.Patient.BillingDate) {
            this.Patient.BillingDate = new Date();
            this.Patient.PaymentDate = new Date();
          }
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

  getBillingList() {
    var obj: RequestModel = {
      request: this.localService.encrypt(JSON.stringify({})).toString(),
    };
    this.dataLoading = true;
    this.service.getBillingList(obj).subscribe(
      (r1) => {
        let response = r1 as any;
        if (response.Message == ConstantData.SuccessMessage) {
          this.BillingList = response.BillingList;
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

  afterBillingSelected(event: any) {
    this.Payment.BillingId = event.option.id;
    this.Payment.BillingName = event.option.value;
    var Transport = this.ChargeList.find(
      (x: any) => x.OptocalId == this.Payment.OptocalId
    );
    this.Payment.BillingName = Transport.BillingName;
    this.Payment.BillingRate = Transport.BillingPrice;
    this.Payment.Description = Transport.BillingDescription;
    this.Payment.Quantity = 1;
    this.Payment.BillingId = Transport.BillingId;
    this.onRateChange();
  }

  filterBillingList(value: any) {
    if (value) {
      const filterValue = value.toLowerCase();
      this.ChargeList = this.BillingList.filter((option: any) =>
        option.BillingName.toLowerCase().includes(filterValue)
      );
    } else {
      this.ChargeList = this.BillingList;
    }
  }
  clearTransportSupplier() {
    this.ChargeList = this.BillingList;
    this.Payment.BillingId = null;
    this.Payment = {};
  }


  recalculateTotals() {
  let totalAmount = 0;
  let totalDiscount = 0;
  let totalLineAmount = 0;

  this.SelectedPaymentDetailList.forEach((item: { Amount: any; Discount: any; LineAmount: any; }) => {
    totalAmount += item.Amount || 0;
    totalDiscount += item.Discount || 0;
    totalLineAmount += item.LineAmount || 0;
  });

  this.Patient.TotalAmount = totalAmount;
  this.Patient.DiscountAmount = totalDiscount;
  this.Patient.PayableAmount = totalLineAmount;
  this.currentPayment.PaidAmount = totalLineAmount;
}


clearCurrentPayment() {
  this.Payment = {
    BillingName: '',
    Rate: 0,
    Quantity: 1,
    Amount: 0,
    Discount: 0,
    LineTotal: 0
  };
}


  SelectedPaymentDetailList: any = [];
  addPaymentDetail() {
    if (this.Payment.Amount == null || this.Payment.Amount == '') {
      this.toastr.error('Please Enter Paid Amount!!!');
      return;
    }
    if (this.Payment.BillingName == null || this.Payment.BillingName == '') {
      this.toastr.error('Please Select Payment Mode!!!');
      return;
    }
    this.Payment.BillingId = this.Payment.BillingId;
    this.SelectedPaymentDetailList.push(this.Payment);
    this.recalculateTotals();  // Call a function to calculate the totals
  this.clearCurrentPayment();
  }



  Removepayment(index: number) {
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

    this.Patient.TotalAmount = TotalAmount;
    this.Patient.DiscountAmount = 0;
    this.Patient.PayableAmount = TotalAmount;
    this.Patient.PaidAmount = 0;
    this.currentPayment.PaidAmount = TotalAmount;
  }

  updatePaymentFields() {
    this.Patient.PayableAmount =
      this.Patient.TotalAmount - this.Patient.DiscountAmount;
    this.Patient.PaidAmount =
      this.Patient.TotalAmount - this.Patient.DiscountAmount;
    this.currentPayment.PaidAmount =
      this.Patient.TotalAmount - this.Patient.DiscountAmount;
  }

  ChangeDuesAmount() {
    this.Patient.DueAmount =
      this.Patient.PayableAmount - this.Patient.PaidAmount;
  }

  saveBillings() {
    this.isSubmitted = true;

    if (
      !this.SelectedPaymentCollectionList ||
      this.SelectedPaymentCollectionList.length === 0
    ) {
      this.toastr.error('Please add at least one payment to the list!');
      return;
    }
    if (
      !this.SelectedPaymentDetailList ||
      this.SelectedPaymentDetailList.length === 0
    ) {
      this.toastr.error(
        'Please add at least one registration charge to the list!'
      );
      return;
    }

    this.Patient.CreatedBy = this.staffLogin.StaffId;
    this.Patient.UpdatedBy = this.staffLogin.StaffId;
    this.Patient.PaymentDate = this.loadData.loadDateYMD(
      this.Patient.PaymentDate
    );

    if (this.tempData != undefined) {
      this.Patient.PaymentCollectionId =
        this.tempData.GetPaymentCollection.PaymentCollectionId;
    }

    const data = {
      GetPatient: this.Patient,
      GetPaymentCollection: this.Patient,
      GetBillingItemDetails: this.SelectedPaymentDetailList,
      GetPaymentDetails: this.SelectedPaymentCollectionList,
    };

    const obj: RequestModel = {
      request: this.localService.encrypt(JSON.stringify(data)).toString(),
    };

    this.dataLoading = true;
    this.service.saveBillingsBill(obj).subscribe(
      (r1) => {
        const response = r1 as any;

        if (response.Message === ConstantData.SuccessMessage) {
          if (this.Patient.OpdId > 0) {
            this.toastr.success('Booking Updated successfully');
            $('hashtag#staticBackdrop').modal('hide');
          } else {
            this.toastr.success('Booking added successfully');
          }
           this.service.PrintBillItem(response.BillingItemId);
          this.SelectedPaymentDetailList = [];
          this.SelectedPaymentCollectionList = [];
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

  SelectedPaymentCollectionList: any[] = [];

addToPaymentList() {
  if (
    
    this.currentPayment.PaidAmount != null &&
    this.currentPayment.PaymentMode
  ) {
    // Calculate the sum of already paid amounts
    const totalPaid = this.SelectedPaymentCollectionList.reduce(
      (sum, payment) => sum + (payment.PaidAmount || 0),
      0
    );

    // Calculate remaining amount
    const remainingAmount = this.Patient.PayableAmount - totalPaid;

  
    if (this.currentPayment.PaidAmount > remainingAmount) {
      alert('Paid amount cannot exceed remaining payable amount!');
      this.currentPayment.PaidAmount = remainingAmount;
      return;
    }

    // Push a copy of the current payment into the list
    this.SelectedPaymentCollectionList.push({ ...this.currentPayment });

    const newTotalPaid = totalPaid + this.currentPayment.PaidAmount;
    const newRemainingAmount = this.Patient.PayableAmount - newTotalPaid;

    // Reset currentPayment
    this.currentPayment = {
      Particular: '',
      Remarks: '',
      PaymentMode: '',
      PaidAmount: newRemainingAmount > 0 ? newRemainingAmount : 0
    };
  } else {
    alert('Please fill all fields!');
  }
}


 removePaymentItem(index: number) {
  const removedItem = this.SelectedPaymentCollectionList[index];

  // Restore the amount to currentPayment.PaidAmount
  if (removedItem && removedItem.PaidAmount != null) {
    this.currentPayment.PaidAmount += removedItem.PaidAmount;
  }

  // Remove the item from the list
  this.SelectedPaymentCollectionList.splice(index, 1);
}


getPatientListall(PatientId: number) {
  var data = {
    PatientID: PatientId,
  };
  const obj: RequestModel = {
    request: this.localService.encrypt(JSON.stringify(data)).toString(),
  };
  this.dataLoading = true;

  this.service.getPatientList(obj).subscribe({
    next: (r1) => {
      let response = r1 as any;
      if (response.Message == ConstantData.SuccessMessage) {
        this.PatientListAll = response.PatientList;
        this.filteredPatientList = [...this.PatientListAll];
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


  filterpatientList(value: string) {
  const filterValue = value?.toLowerCase() || '';

  if (!filterValue) {
    this.filteredPatientList = [...this.PatientListAll];
    return;
  }

  this.filteredPatientList = this.PatientListAll.filter(
    (option: any) =>
      option.PatientName?.toLowerCase().includes(filterValue) ||
      option.UHID?.toLowerCase().includes(filterValue) ||
      option.ContactNo?.toString().toLowerCase().includes(filterValue)
  );
  
}

afterPatientSelected(event: any) {
  const selectedName = event.option.value;

  const selected = this.filteredPatientList.find(
    (x: any) => x.PatientName === selectedName
  );

  if (selected) {
    
    // Assign patient details
    this.Patient = {
      PatientID: selected.PatientID || selected.PatientID,
      PatientName: selected.PatientName,
      Age: selected.Age,
      Gender: selected.Gender,
      Category: selected.Category,
      ContactNo: selected.ContactNo,
      AadharNo: selected.AadharNo,
      Address: selected.Address,
      UHID: selected.UHID,
      PatientGardianName: selected.PatientGardianName,
      BillingDate: this.Patient.BillingDate || new Date(),
      PaymentDate: this.Patient.PaymentDate || new Date()
    };

    // Initialize payment defaults if needed
    if (selected.Rate) {
      this.Payment.BillingRate = selected.Rate || 0;
      this.Payment.Quantity = 1;
      this.onRateChange();
    }
  } else {
    console.error('Patient not found in filtered list');
  }
}

clearPatient() {
  this.filteredPatientList = [...this.PatientListAll];
  this.Patient = {
    BillingDate: new Date(),
    PaymentDate: new Date()
  };
  this.Payment = {};
}



onRateChange() {
  const rate = Number(this.Payment.BillingRate) || 0;
  const qty  = Number(this.Payment.Quantity)    || 0;
  this.Payment.Amount = rate * qty;
  this.updateLineTotal();
}

onQuantityChange() {
  const rate = Number(this.Payment.BillingRate) || 0;
  const qty  = Number(this.Payment.Quantity)    || 0;
  this.Payment.Amount = rate * qty;
  this.updateLineTotal();
}


onDiscountChange() {

  this.Payment.Discount = Number(this.Payment.Discount) || 0;
  this.updateLineTotal();
}

updateLineTotal() {
  const amount = Number(this.Payment.Amount)   || 0;
  const disc   = Number(this.Payment.Discount) || 0;

  let line = amount - disc;
  if (line < 0) line = 0;


  this.Payment.LineAmount = Number(line.toFixed(2));
}

}
