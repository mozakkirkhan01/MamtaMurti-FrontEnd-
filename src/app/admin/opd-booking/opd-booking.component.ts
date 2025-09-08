import { Component, ViewChild, OnInit } from '@angular/core';
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
  selector: 'app-opd-booking',
  templateUrl: './opd-booking.component.html',
  styleUrls: ['./opd-booking.component.css'],
})
export class OpdBookingComponent implements OnInit {
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
  currentPayment: any = {};
  tempData: any;
  filteredPatientList: any[] = [];
  PatientListAll: any = [];
  AllChargeList: any[] = [];
  SelectedPaymentDetailList: any[] = [];
  SelectedPaymentCollectionList: any[] = [];
  redUrl: string = '';

  @ViewChild('formPatientDetails') formPatientDetails: NgForm;

  constructor(
    private service: AppService,
    private toastr: ToastrService,
    private loadData: LoadDataService,
    private localService: LocalService,
    private router: Router,
    private route: ActivatedRoute
  ) {}

  ngOnInit(): void {
    this.getPatientListall(this.Patient.PatientId);
    this.staffLogin = this.localService.getEmployeeDetail();
    this.validiateMenu();
    this.resetForm();
    this.getChargeList();
    
    this.route.queryParams.subscribe((params: any) => {
      this.Patient.PatientId = params.id;
      this.redUrl = params.redUrl;
      if (this.Patient.PatientId > 0) {
        this.getPatientList(this.Patient.PatientId);
      }
    });

    this.route.queryParams.subscribe((params) => {
      const opdId = params['id'];
      const redUrl = params['redUrl'];
      const data = this.service.getSelectedOpdData();
      if (data && data.GetOpdBooking.OpdId == opdId) {
        this.Patient = {
          ...data.GetOpdBooking,
          ...data.GetPaymentCollection,
        };
        
        this.SelectedPaymentDetailList = data.GetPaymentBookingDetails;
        this.SelectedPaymentCollectionList = data.GetPaymentDetails;
      }
    });
  }

  // Utility methods
  sort(key: any) {
    this.sortKey = key;
    this.reverse = !this.reverse;
  }

  onTableDataChange(p: any) {
    this.p = p;
  }

  validiateMenu() {
    var request: RequestModel = {
      request: this.localService
        .encrypt(
          JSON.stringify({
            Url: '/admin/opd-booking',
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

  resetForm() {
    this.Patient = {};
    this.Patient.OpdDate = this.loadData.newloadDateYMD(new Date());
    this.Patient.PaymentDate = this.loadData.newloadDateYMD(new Date());
    this.currentPayment = {};

    // Initialize all payment amounts to 0
    this.Patient.TotalAmount = 0;
    this.Patient.DiscountAmount = 0;
    this.Patient.PayableAmount = 0;
    this.Patient.PaidAmount = 0;
    this.Patient.DueAmount = 0;

    if (this.formPatientDetails) {
      this.formPatientDetails.control.markAsPristine();
      this.formPatientDetails.control.markAsUntouched();
    }
    this.isSubmitted = false;
  }

  // Patient related methods
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

          for (let i = 0; i < this.PatientList.length; i++) {
            const e = this.PatientList[i];
            this.Patient.PatientName = e.PatientName;
            this.Patient.Age = e.Age;
            this.Patient.Gender = e.Gender;
            this.Patient.Address = e.Address;
            this.Patient.ContactNo = e.ContactNo;
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

  filterpatientList(value: string) {
    const filterValue = value?.toLowerCase() || '';

    this.filteredPatientList = this.PatientListAll.filter(
      (option: any) =>
        option.PatientName?.toLowerCase().includes(filterValue) ||
        option.UHID?.toLowerCase().includes(filterValue) ||
        option.ContactNo?.toLowerCase().includes(filterValue)
    );
  }

  afterPatientSelected(event: any) {
    const selectedName = event.option.value;
    const selected = this.PatientListAll.find(
      (x: any) => x.PatientName === selectedName
    );

    if (selected) {
      this.Patient = { ...selected };
      this.getPatientList(this.Patient.PatientID);
      this.Patient.OpdDate = new Date();
      this.Patient.PaymentDate = new Date();
      
      // Reset payment amounts when new patient is selected
      this.resetPaymentAmounts();
    }
  }

  clearPatient() {
    this.ChargeList = this.PatientListAll;
    this.Patient.PatientName = '';
    this.resetPaymentAmounts();
  }

  // Charge related methods
  getChargeList() {
    var obj: RequestModel = {
      request: this.localService.encrypt(JSON.stringify({})).toString(),
    };
    this.dataLoading = true;
    this.service.getChargeList(obj).subscribe(
      (r1) => {
        let response = r1 as any;
        if (response.Message == ConstantData.SuccessMessage) {
          this.AllChargeList = response.ChargeList;
          this.AllChargeList.map(
            (x1) => (x1.SearchCharge = `${x1.Particular} - ${x1.Description}`)
          );
          this.ChargeList = this.AllChargeList;
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

  filterTransportSupplierList(value: any) {
    if (value) {
      const filterValue = value.toLowerCase();
      this.ChargeList = this.AllChargeList.filter((option: any) =>
        option.SearchCharge.toLowerCase().includes(filterValue)
      );
    } else {
      this.ChargeList = this.AllChargeList;
    }
    this.Payment.RegistrationChargeId = 0;
  }

  afterTransportSupplierSelected(event: any) {
    this.Payment.RegistrationChargeId = event.option.id;
    this.Payment.Particular = event.option.value;
    var Transport = this.ChargeList.find(
      (x: any) => x.RegistrationChargeId == this.Payment.RegistrationChargeId
    );
    this.Payment.Particular = Transport.Particular;
    this.Payment.Amount = Transport.Amount;
    this.Payment.Description = Transport.Description;
    this.Payment.RegistraionChargeId = Transport.RegistrationChargeId;
  }

  clearTransportSupplier() {
    this.ChargeList = this.AllChargeList;
    this.Payment.RegistrationChargeId = null;
    this.Payment = {};
  }

  // **UPDATED PAYMENT CALCULATION METHODS**

  // Reset all payment amounts to 0
  private resetPaymentAmounts() {
    this.Patient.TotalAmount = 0;
    this.Patient.DiscountAmount = 0;
    this.Patient.PayableAmount = 0;
    this.Patient.PaidAmount = 0;
    this.Patient.DueAmount = 0;
    this.currentPayment.PaidAmount = 0;
  }

  private calculateAllAmounts() {
    // Step 1: Calculate Total Amount from payment details
    this.calculateTotalAmount();
    
    // Step 2: Calculate Payable Amount (Total - Discount)
    this.calculatePayableAmount();
    
    // Step 3: Calculate Paid Amount from payment collections
    this.calculatePaidAmount();
    
    // Step 4: Calculate Due Amount (Payable - Paid)
    this.calculateDueAmount();
    
    // Step 5: Update current payment amount with remaining due
    this.updateCurrentPaymentAmount();
  }

  // Calculate total amount from selected payment details
  private calculateTotalAmount() {
    let totalAmount = 0;
    for (let i = 0; i < this.SelectedPaymentDetailList.length; i++) {
      const paymentDetail = this.SelectedPaymentDetailList[i];
      totalAmount += parseFloat(paymentDetail.Amount) || 0;
    }
    this.Patient.TotalAmount = totalAmount;
  }

  // Calculate payable amount (Total - Discount)
  private calculatePayableAmount() {
    const discount = parseFloat(this.Patient.DiscountAmount?.toString()) || 0;
    this.Patient.PayableAmount = Math.max(0, this.Patient.TotalAmount - discount);
    this.currentPayment.PaidAmount = Math.max(0, this.Patient.TotalAmount - discount);

  }

  // Calculate total paid amount from payment collections
  private calculatePaidAmount() {
    let paidAmount = 0;
    for (let i = 0; i < this.SelectedPaymentCollectionList.length; i++) {
      const payment = this.SelectedPaymentCollectionList[i];
      paidAmount += parseFloat(payment.PaidAmount) || 0;
    }
    this.Patient.PaidAmount = paidAmount;
  }

  // Calculate due amount (Payable - Paid)
  private calculateDueAmount() {
    this.Patient.DueAmount = Math.max(0, this.Patient.PayableAmount - this.Patient.PaidAmount);
  }

  // Update current payment amount with remaining due amount
  private updateCurrentPaymentAmount() {
    // Only auto-fill if current payment amount is not manually set
    if (!this.currentPayment.PaidAmount || this.currentPayment.PaidAmount <= 0) {
      this.currentPayment.PaidAmount = this.Patient.DueAmount;
    }
  }

  // **UPDATED PUBLIC METHODS THAT TRIGGER CALCULATIONS**

  // Payment Detail methods - Updated to trigger full calculation
  addPaymentDetail() {
    if (this.Payment.Amount == null || this.Payment.Amount == '') {
      this.toastr.error('Please Enter Amount!!!');
      return;
    }
    if (this.Payment.Particular == null || this.Payment.Particular == '') {
      this.toastr.error('Please Select Charge!!!');
      return;
    }

    // Check if charge already exists
    const existingIndex = this.SelectedPaymentDetailList.findIndex(
      (item) => item.RegistrationChargeId === this.Payment.RegistrationChargeId
    );

    if (existingIndex === -1) {
      this.Payment.RegistrationChargeId = this.Payment.RegistrationChargeId;
      this.SelectedPaymentDetailList.push({ ...this.Payment });
      
      // **UPDATED**: Trigger full calculation cascade
      this.calculateAllAmounts();
      this.resetHotelPayment();
    } else {
      this.toastr.error('This charge is already added!');
    }
  }

  RemoveHotel(index: number) {
    this.SelectedPaymentDetailList.splice(index, 1);
    
    // **UPDATED**: Trigger full calculation cascade
    this.calculateAllAmounts();
  }

  resetHotelPayment() {
    this.Payment = {};
    this.isSubmitted = false;
  }

  // **NEW METHOD**: Called when discount amount changes
  onDiscountChange() {
    // Recalculate all amounts when discount changes
    this.calculateAllAmounts();
  }

  // **UPDATED**: Payment Collection methods
  updatePaymentAmount() {
    // Auto-fill the paid amount with remaining due amount
    this.currentPayment.PaidAmount = this.Patient.DueAmount;
  }

  addToPaymentList() {
    if (
      this.currentPayment.PaidAmount == null ||
      !this.currentPayment.PaymentMode
    ) {
      this.toastr.error('Please fill all required fields!');
      return;
    }

    const paidAmount = parseFloat(this.currentPayment.PaidAmount);
    
    // Validate payment amount doesn't exceed due amount
    if (paidAmount > this.Patient.DueAmount) {
      this.toastr.error(`Payment amount cannot exceed due amount of ₹${this.Patient.DueAmount}`);
      return;
    }

    if (paidAmount <= 0) {
      this.toastr.error('Payment amount must be greater than 0');
      return;
    }

    // Add to payment collection list
    this.SelectedPaymentCollectionList.push({ ...this.currentPayment });
    // **UPDATED**: Trigger full calculation cascade
    this.calculateAllAmounts();

    

    // Reset current payment
    this.currentPayment = {};
  }

  removePaymentItem(index: number) {
    this.SelectedPaymentCollectionList.splice(index, 1);
    
    // **UPDATED**: Trigger full calculation cascade
    this.calculateAllAmounts();
  }

  // **LEGACY METHODS - Kept for backward compatibility but now call new calculation methods**
  
  // This method is kept for backward compatibility
  CalculateTotalAmount() {
    this.calculateAllAmounts();
  }

  // This method is kept for backward compatibility  
  updatePaymentFields() {
    this.calculateAllAmounts();
  }

  // This method is kept for backward compatibility
  ChangeDuesAmount() {
    this.calculateDueAmount();
  }

  // This method is kept for backward compatibility
  updatePayment() {
    this.updateCurrentPaymentAmount();
  }

  // Save OPD - No changes needed
  saveOpd() {
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
      this.toastr.error('Please add at least one registration charge to the list!');
      return;
    }

    this.Patient.CreatedBy = this.staffLogin.StaffId;
    this.Patient.UpdatedBy = this.staffLogin.StaffId;
    this.Patient.PaymentDate = this.loadData.loadDateYMD(this.Patient.PaymentDate);
    this.Patient.OpdDate = this.loadData.loadDateYMD(this.Patient.OpdDate);

    if (this.tempData != undefined) {
      this.Patient.PaymentCollectionId = this.tempData.GetPaymentCollection.PaymentCollectionId;
    }

    const data = {
      GetOpdBooking: this.Patient,
      GetPaymentCollection: this.Patient,
      GetPaymentBookingDetails: this.SelectedPaymentDetailList,
      GetPaymentDetails: this.SelectedPaymentCollectionList,
    };


    const obj: RequestModel = {
      request: this.localService.encrypt(JSON.stringify(data)).toString(),
    };

    this.dataLoading = true;
    this.service.saveOpd(obj).subscribe(
      (r1) => {
        const response = r1 as any;

        if (response.Message === ConstantData.SuccessMessage) {
          if (this.Patient.OpdId > 0) {
            this.toastr.success('Booking Updated successfully');
            $('#staticBackdrop').modal('hide');
          } else {
            this.toastr.success('Booking added successfully');
          }
          
          this.service.PrintOpdBill(response.OpdId);
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
}