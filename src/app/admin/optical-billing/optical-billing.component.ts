import { Component, ViewChild } from '@angular/core';
import { NgForm } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';
import { AppService } from '../../utils/app.service';
import { ConstantData } from '../../utils/constant-data';
import { Gender, PaymentMode, Status, Category } from '../../utils/enum';
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
  selector: 'app-optical-billing',
  templateUrl: './optical-billing.component.html',
  styleUrls: ['./optical-billing.component.css'],
})
export class OpticalBillingComponent {
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
  CategoryList = this.loadData.GetEnumList(Category);
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
  PatientListAll: any;
  OpticalList: any = [];
  SelectedPaymentDetailList: any = [];
  SelectedPaymentCollectionList: any[] = [];
  redUrl: string = '';

  patientModalData: any = {};
  isPatientSubmitted: boolean = false;

  constructor(
    private service: AppService,
    private toastr: ToastrService,
    private loadData: LoadDataService,
    private localService: LocalService,
    private router: Router,
    private route: ActivatedRoute
  ) {}

  ngOnInit(): void {
    this.staffLogin = this.localService.getEmployeeDetail();
    this.validiateMenu();
    this.resetForm();
    this.getOpticalList();
    this.getPatientListall(0);

    this.route.queryParams.subscribe((params) => {
      const OpticalBillingId = params['id'];
      const data = this.service.getSelectedOpticalData();
      
      if (data && data.GetOpticalBilling && data.GetOpticalBilling.OpticalBillingId == OpticalBillingId) {
        this.Patient = {
          ...data.GetOpticalBilling,
          ...data.GetPaymentCollection,
        };
        if (this.Patient.BillingDate) this.Patient.BillingDate = new Date(this.Patient.BillingDate);
        if (this.Patient.PaymentDate) this.Patient.PaymentDate = new Date(this.Patient.PaymentDate);

        this.SelectedPaymentDetailList = data.GetOpticalsDetails || [];
        this.SelectedPaymentCollectionList = data.GetPaymentDetails || [];
      }
    });
  }

  validiateMenu() {
    var request: RequestModel = {
      request: this.localService
        .encrypt(
          JSON.stringify({
            Url: '/admin/optical-billing',
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
    this.Patient.BillingDate = new Date();
    this.Patient.PaymentDate = new Date();

    if (this.formPatientDetails) {
      this.formPatientDetails.control.markAsPristine();
      this.formPatientDetails.control.markAsUntouched();
    }
    this.currentPayment = {};
    this.isSubmitted = false;
    this.SelectedPaymentDetailList = [];
    this.SelectedPaymentCollectionList = [];
  }

  getOpticalList() {
    var obj: RequestModel = {
      request: this.localService.encrypt(JSON.stringify({})).toString(),
    };
    this.dataLoading = true;
    this.service.getOpticalList(obj).subscribe(
      (r1) => {
        let response = r1 as any;
        if (response.Message == ConstantData.SuccessMessage) {
          this.OpticalList = response.OpticalList;
          this.ChargeList = this.OpticalList;
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
      this.ChargeList = this.OpticalList.filter((option: any) =>
        option.OpticalName.toLowerCase().includes(filterValue)
      );
    } else {
      this.ChargeList = this.OpticalList;
    }
  }

  afterTransportSupplierSelected(event: any) {
    const transportId = event.option.id;
    const transport = this.OpticalList.find(
      (x: any) => x.OpticalId == transportId
    );
    if (transport) {
      this.Payment.OpticalId = transport.OpticalId;
      this.Payment.OpticalName = transport.OpticalName;
      this.Payment.OpticalItemRate = transport.OpticalPrice || transport.Rate || 0;
      this.Payment.Description = transport.Description;
      this.Payment.Quantity = 1;
      this.onRateChange();
    }
  }

  clearTransportSupplier() {
    this.ChargeList = this.OpticalList;
    this.Payment = {};
  }

  onRateChange() {
    if (this.Payment.Quantity && this.Payment.OpticalItemRate) {
      this.Payment.Amount = this.Payment.OpticalItemRate * this.Payment.Quantity;
      this.updateLineTotal();
    }
  }

  onQuantityChange() {
    if (this.Payment.OpticalItemRate && this.Payment.Quantity) {
      this.Payment.Amount = this.Payment.OpticalItemRate * this.Payment.Quantity;
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

  recalculateTotals() {
    let totalAmount = 0;
    let totalDiscount = 0;
    let totalLineTotal = 0;

    this.SelectedPaymentDetailList.forEach((item: any) => {
      totalAmount += item.Amount || 0;
      totalDiscount += item.Discount || 0;
      totalLineTotal += item.LineTotal || 0;
    });

    this.Patient.TotalAmount = totalAmount;
    this.Patient.DiscountAmount = totalDiscount;
    this.Patient.PayableAmount = totalLineTotal;
    this.currentPayment.PaidAmount = totalLineTotal;
  }

  clearCurrentPayment() {
    this.Payment = {
      OpticalName: '',
      OpticalItemRate: 0,
      Quantity: 1,
      Amount: 0,
      Discount: 0,
      LineTotal: 0
    };
  }

  addPaymentDetail() {
    if (this.Payment.Amount == null || this.Payment.Amount === '') {
      this.toastr.error('Please Enter Amount!!!');
      return;
    }
    if (this.Payment.OpticalName == null || this.Payment.OpticalName === '') {
      this.toastr.error('Please Select Optical Name!!!');
      return;
    }
    this.SelectedPaymentDetailList.push({ ...this.Payment });
    this.recalculateTotals();
    this.clearCurrentPayment();
  }

  RemoveHotel(index: number) {
    this.SelectedPaymentDetailList.splice(index, 1);
    this.recalculateTotals();
  }

  addToPaymentList() {
    if (this.currentPayment.PaidAmount != null && this.currentPayment.PaymentMode) {
      const totalPaid = this.SelectedPaymentCollectionList.reduce(
        (sum, payment) => sum + (payment.PaidAmount || 0),
        0
      );
      const remainingAmount = this.Patient.PayableAmount - totalPaid;

      if (this.currentPayment.PaidAmount > remainingAmount) {
        alert('Paid amount cannot exceed remaining payable amount!');
        this.currentPayment.PaidAmount = remainingAmount;
        return;
      }

      this.SelectedPaymentCollectionList.push({ ...this.currentPayment });
      const newTotalPaid = totalPaid + this.currentPayment.PaidAmount;
      const newRemainingAmount = this.Patient.PayableAmount - newTotalPaid;

      this.currentPayment = {
        Remarks: '',
        PaymentMode: '',
        PaidAmount: newRemainingAmount > 0 ? newRemainingAmount : 0
      };
    } else {
      alert('Please fill all payment fields!');
    }
  }

  removePaymentItem(index: number) {
    this.SelectedPaymentCollectionList.splice(index, 1);
  }

  getPatientListall(PatientId: number) {
    var data = { PatientID: PatientId };
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
        this.toastr.error('Error while fetching records');
        this.dataLoading = false;
      },
    });
  }

  filterpatientList(value: string) {
    const filterValue = value?.toLowerCase() || '';
    if (this.PatientListAll) {
      this.filteredPatientList = this.PatientListAll.filter(
        (option: any) =>
          option.PatientName?.toLowerCase().includes(filterValue) ||
          option.UHID?.toLowerCase().includes(filterValue) ||
          option.ContactNo?.toLowerCase().includes(filterValue)
      );
    }
  }

  afterPatientSelected(event: any) {
    const selectedName = event.option.value;
    const selected = this.PatientListAll.find(
      (x: any) => x.PatientName === selectedName
    );

    if (selected) {
      const currentBillingDate = this.Patient.BillingDate;
      const currentPaymentDate = this.Patient.PaymentDate;

      this.Patient = { 
        ...selected,
        BillingDate: currentBillingDate || new Date(),
        PaymentDate: currentPaymentDate || new Date()
      };
      this.Patient.PatientId = selected.PatientID || selected.PatientId;
    }
  }

  clearPatient() {
    this.filteredPatientList = this.PatientListAll;
    this.Patient.PatientName = '';
  }

  openNewPatientModal(): void {
    this.patientModalData = {
      PatientName: this.Patient.PatientName || '',
      Status: 1
    };
    this.Patient.PatientName = '';
    $('#modal_popUp').modal('show');
  }

  closePatientModal(): void {
    this.patientModalData = {};
    this.isPatientSubmitted = false;
    $('#modal_popUp').modal('hide');
  }

  savePatientFromOptical() {
    this.isPatientSubmitted = true;
    if (!this.patientModalData.PatientName || !this.patientModalData.Age || 
        !this.patientModalData.ContactNo || !this.patientModalData.Gender) {
      this.toastr.error('Please fill all required patient fields');
      return;
    }

    this.dataLoading = true;
    this.patientModalData.CreatedBy = this.staffLogin.StaffId;
    this.patientModalData.UpdatedBy = this.staffLogin.StaffId;

    const obj: RequestModel = {
      request: this.localService.encrypt(JSON.stringify(this.patientModalData)).toString(),
    };

    this.service.savePatient(obj).subscribe(
      (r1) => {
        let response = r1 as any;
        if (response.Message == ConstantData.SuccessMessage) {
          this.toastr.success('Patient registered successfully.', 'Success');
          this.getPatientListall(0);
          
          this.Patient.PatientName = this.patientModalData.PatientName;
          this.Patient.PatientId = response.PatientId || response.PatientID;
          
          this.closePatientModal();
        } else {
          this.toastr.error(response.Message);
        }
        this.dataLoading = false;
      },
      (err) => {
        this.toastr.error('Error occurred while saving patient.');
        this.dataLoading = false;
      }
    );
  }

  saveOpticals() {
    this.isSubmitted = true;

    if (!this.SelectedPaymentCollectionList || this.SelectedPaymentCollectionList.length === 0) {
      this.toastr.error('Please add at least one payment collection item!');
      return;
    }
    if (!this.SelectedPaymentDetailList || this.SelectedPaymentDetailList.length === 0) {
      this.toastr.error('Please add at least one optical item!');
      return;
    }

    this.Patient.CreatedBy = this.staffLogin.StaffId;
    this.Patient.UpdatedBy = this.staffLogin.StaffId;

    this.Patient.PaymentDate = this.loadData.loadDateYMD(
      this.Patient.PaymentDate ? this.Patient.PaymentDate : new Date()
    );
    this.Patient.BillingDate = this.loadData.loadDateYMD(
      this.Patient.BillingDate ? this.Patient.BillingDate : new Date()
    );

    const data = {
      GetPatient: this.Patient,
      GetPaymentCollection: this.Patient,
      GetOpticalsDetails: this.SelectedPaymentDetailList,
      GetPaymentDetails: this.SelectedPaymentCollectionList,
    };

    const obj: RequestModel = {
      request: this.localService.encrypt(JSON.stringify(data)).toString(),
    };

    this.dataLoading = true;
    this.service.saveOpticalsBill(obj).subscribe(
      (r1) => {
        const response = r1 as any;
        if (response.Message === ConstantData.SuccessMessage) {
          this.toastr.success('Optical bill saved successfully');
          if (response.OpticalBillingId) {
            this.service.PrintOpticlalBill(response.OpticalBillingId);
          }
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