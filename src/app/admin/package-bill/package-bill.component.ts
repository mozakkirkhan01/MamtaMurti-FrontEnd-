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
  selector: 'app-package-bill',
  templateUrl: './package-bill.component.html',
  styleUrls: ['./package-bill.component.css'],
})
export class PackageBillComponent {
  dataLoading: boolean = false;
  PatientList: any = [];

  AllChargeList: any[] = [];
  FeeChargeList: any = [];
  PatientListAll: any = [];
  Patient: any = {};
  Package: any = {};

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
  filteredPatientList: any[] = [];
  PackageDetail: any = {};
  PackageList: any;
  PackageDetial: any;
  PackageDetialList: any[] = [];
  ChargeList: any;
  filteredPackageList: any[] = [];
  PaymentCollection: any;
  tempData: any;

  SelectedPaymentDetailList: any[] = [];
  SelectedPaymentCollectionList: any[] = [];

  @ViewChild('formPatientDetails') formPatientDetails: NgForm;
  @ViewChild('formPaymentDetails') formPaymentDetails: NgForm;
  @ViewChild('formPaymentCollection') formPaymentCollection: NgForm;

  redUrl: string = '';

  constructor(
    private service: AppService,
    private toastr: ToastrService,
    private loadData: LoadDataService,
    private localService: LocalService,
    private router: Router,
    private route: ActivatedRoute
  ) {}

  sort(key: any) {
    this.sortKey = key;
    this.reverse = !this.reverse;
  }

  onTableDataChange(p: any) {
    this.p = p;
  }

  ngOnInit(): void {
    this.staffLogin = this.localService.getEmployeeDetail();
    this.validiateMenu();
    this.tempData = this.service.getSelectedSurgeryData();

    this.resetForm();
    this.initializeCurrentPayment();
    this.getPackageList(this.Package.PackageDetailId);
    this.getPatientList(this.Patient.PatientId);
    
    this.route.queryParams.subscribe((params: any) => {
      this.Patient.PatientId = params.id;
      this.redUrl = params.redUrl;
      if (this.Patient.PatientId > 0) {
        this.getPatientList(this.Patient.PatientId);
      }
    });

    this.route.queryParams.subscribe((params) => {
      const surgeryId = params['id'];
      const redUrl = params['redUrl'];

      const data = this.service.getSelectedSurgeryData();
      if (data && data.GetSurgery.SurgeryId == surgeryId) {
        this.Patient = data.GetSurgery;
        this.Package = data.GetPaymentCollection;
        this.SelectedPaymentDetailList = data.GetPackageBookingDetail || [];
        this.SelectedPaymentCollectionList = data.GetPaymentDetails || [];
      }
    });
  }

  validiateMenu() {
    var request: RequestModel = {
      request: this.localService
        .encrypt(
          JSON.stringify({
            Url: '/admin/PackageBill',
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
    this.PackageDetail = {};
    this.Package = {};
    this.Patient = {};
    
    if (this.formPatientDetails) {
      this.formPatientDetails.control.markAsPristine();
      this.formPatientDetails.control.markAsUntouched();
    }
    
    if (this.formPaymentDetails) {
      this.formPaymentDetails.control.markAsPristine();
      this.formPaymentDetails.control.markAsUntouched();
    }
    
    if (this.formPaymentCollection) {
      this.formPaymentCollection.control.markAsPristine();
      this.formPaymentCollection.control.markAsUntouched();
    }
    
    this.isSubmitted = false;
  }

  initializeCurrentPayment() {
    this.currentPayment = {
      Particular: '',
      Remarks: '',
      PaymentMode: '',
      PaidAmount: 0
    };
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
          this.PatientListAll = response.PatientList;
          
          if (!this.Package.PaymentDate) {
            this.Package.PaymentDate = new Date();
          }
          if (!this.Patient.SurgeryDate) {
            this.Patient.SurgeryDate = new Date();
          }
          
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

  // Enhanced addPaymentDetail method
  addPaymentDetail() {
    // Validate required fields
    if (!this.Package.Price || this.Package.Price <= 0) {
      this.toastr.error('Please select a valid package with price!');
      return;
    }
    
    if (!this.Package.PackageName || this.Package.PackageName.trim() === '') {
      this.toastr.error('Please select a package!');
      return;
    }


    // Create a copy to avoid reference issues
    const packageToAdd = { 
      ...this.Package,
      tempId: Date.now() 
    };
    
    this.SelectedPaymentDetailList.push(packageToAdd);
    this.CalculateTotalAmount();
    this.resetPackageForm();
    this.updateCurrentPaymentAmount();
  }

  // Enhanced RemovePackage method
  RemovePackage(index: number) {
    if (confirm('Are you sure you want to remove this package?')) {
      this.SelectedPaymentDetailList.splice(index, 1);
      this.CalculateTotalAmount();
      this.toastr.info('Package removed successfully');
    }
  }

  // Improved resetPackageForm method
  resetPackageForm() {
    this.Package = {
      PackageName: '',
      Price: null,
      Description: '',
      PackageDetailId: null,
      TotalAmount: this.Package.TotalAmount || 0,
      DiscountAmount: this.Package.DiscountAmount || 0,
      PayableAmount: this.Package.PayableAmount || 0,
      PaymentDate: this.Package.PaymentDate || new Date()
    };
    
    if (this.formPaymentDetails) {
      this.formPaymentDetails.control.markAsPristine();
      this.formPaymentDetails.control.markAsUntouched();
    }
  }

  // Improved CalculateTotalAmount method
  CalculateTotalAmount() {
    const totalAmount = this.SelectedPaymentDetailList.reduce((sum, item) => {
      return sum + (parseFloat(item.Price) || 0);
    }, 0);

    this.Package.TotalAmount = totalAmount;
    
    // Reset discount if no items
    if (this.SelectedPaymentDetailList.length === 0) {
      this.Package.DiscountAmount = 0;
    }
    
    this.updatePaymentFields();
  }

  // Enhanced updatePaymentFields method
  updatePaymentFields() {
    // Ensure discount doesn't exceed total
    if (this.Package.DiscountAmount > this.Package.TotalAmount) {
      this.Package.DiscountAmount = this.Package.TotalAmount;
      this.toastr.warning('Discount cannot exceed total amount!');
    }
    
    // Ensure discount is not negative
    if (this.Package.DiscountAmount < 0) {
      this.Package.DiscountAmount = 0;
    }

    this.Package.PayableAmount = this.Package.TotalAmount - (this.Package.DiscountAmount || 0);
    this.updateCurrentPaymentAmount();
  }

  // New method to handle current payment amount
  updateCurrentPaymentAmount() {
    const totalPaidSoFar = this.SelectedPaymentCollectionList.reduce((sum, item) => {
      return sum + (parseFloat(item.PaidAmount) || 0);
    }, 0);
    
    const remainingAmount = this.Package.PayableAmount - totalPaidSoFar;
    this.currentPayment.PaidAmount = Math.max(0, remainingAmount);
  }

  // Enhanced validateCurrentPaymentAmount method
  validateCurrentPaymentAmount(): void {
    const totalPaidAmount = this.SelectedPaymentCollectionList.reduce(
      (sum, item) => sum + (parseFloat(item.PaidAmount) || 0),
      0
    );

    const remainingAmount = this.Package.PayableAmount - totalPaidAmount;

    if (this.currentPayment.PaidAmount > remainingAmount) {
      this.currentPayment.PaidAmount = remainingAmount;
      this.toastr.warning(`Amount cannot exceed remaining balance: ${remainingAmount}`);
    }

    if (this.currentPayment.PaidAmount < 0) {
      this.currentPayment.PaidAmount = 0;
    }
  }

  // Enhanced addToPaymentList method
  addToPaymentList() {
    if (
      !this.currentPayment.PaymentMode ||
      this.currentPayment.PaidAmount == null || 
      this.currentPayment.PaidAmount <= 0
    ) {
      this.toastr.error('Please fill all required fields with valid values!');
      return;
    }

    // Validate payment amount doesn't exceed payable amount
    const totalPaidAmount = this.SelectedPaymentCollectionList.reduce(
      (sum, item) => sum + (parseFloat(item.PaidAmount) || 0),
      0
    );

    const totalAfterThisPayment = totalPaidAmount + parseFloat(this.currentPayment.PaidAmount);
    
    if (totalAfterThisPayment > this.Package.PayableAmount) {
      this.toastr.error('Total payment amount cannot exceed payable amount!');
      return;
    }

    // Add the payment to the list
    this.SelectedPaymentCollectionList.push({ 
      ...this.currentPayment,
      PaidAmount: parseFloat(this.currentPayment.PaidAmount)
    });

    // Reset current payment form
    this.initializeCurrentPayment();
    this.updateCurrentPaymentAmount();
    
  }

  removePaymentItem(index: number) {
    if (confirm('Are you sure you want to remove this payment?')) {
      this.SelectedPaymentCollectionList.splice(index, 1);
      this.updateCurrentPaymentAmount();
      this.toastr.info('Payment removed successfully');
    }
  }

  // Enhanced saveSurgery method
  saveSurgery() {
    this.isSubmitted = true;

    // Validate payment details list
    if (!this.SelectedPaymentDetailList || this.SelectedPaymentDetailList.length === 0) {
      this.toastr.error('Please add at least one package to the list!');
      return;
    }

    // Validate payment collection list
    if (!this.SelectedPaymentCollectionList || this.SelectedPaymentCollectionList.length === 0) {
      this.toastr.error('Please add at least one payment to the list!');
      return;
    }

    // Validate patient selection
    if (!this.Patient.PatientName) {
      this.toastr.error('Please select a patient!');
      return;
    }

    // Validate total payment amount
    const totalPayments = this.SelectedPaymentCollectionList.reduce((sum, item) => {
      return sum + (parseFloat(item.PaidAmount) || 0);
    }, 0);

   

    // Prepare data for submission
    this.Patient.CreatedBy = this.staffLogin.StaffId;
    this.Patient.UpdatedBy = this.staffLogin.StaffId;
    this.Patient.SurgeryDate = this.loadData.loadDateYMD(this.Patient.SurgeryDate);
    this.Package.PaymentDate = this.loadData.loadDateYMD(this.Package.PaymentDate);
    
    if (this.tempData !== undefined) {
      this.Package.PaymentCollectionId = this.tempData.GetPaymentCollection.PaymentCollectionId;
    }
    this.Package.CreatedBy = this.staffLogin.StaffId;

    const data = {
      GetSurgery: this.Patient,
      GetPaymentCollection: this.Package,
      GetPackageBookingDetail: this.SelectedPaymentDetailList,
      GetPaymentDetails: this.SelectedPaymentCollectionList,
    };


    const obj: RequestModel = {
      request: this.localService.encrypt(JSON.stringify(data)).toString(),
    };

    this.dataLoading = true;
    this.service.saveSurgery(obj).subscribe(
      (r1) => {
        const response = r1 as any;
        if (response.Message === ConstantData.SuccessMessage) {
          this.toastr.success(
            this.Patient.OpdId > 0 ? 'Booking updated successfully' : 'Booking added successfully'
          );
          
          this.service.PrintSurgeryBill(response.SurgeryId);
          this.resetAllForms();
          $('hashtag#staticBackdrop').modal('hide');
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

  // Method to reset all forms
  resetAllForms() {
    this.SelectedPaymentDetailList = [];
    this.SelectedPaymentCollectionList = [];
    this.initializeCurrentPayment();
    this.resetForm();
    this.resetPackageForm();
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

  clearPatient() {
    this.Patient = {};
    this.filteredPatientList = [...this.PatientListAll];
  }

  afterPatientSelected(event: any) {
    const selectedName = event.option.value;
    const selected = this.PatientListAll.find(
      (x: any) => x.PatientName === selectedName
    );

    if (selected) {
      this.Patient = { ...selected };
      this.getPatientList(this.Patient.PatientID);
    }
  }

  getPackageList(PackageDetailId: number) {
    var data = {
      PackageDetailID: PackageDetailId,
    };
    const obj: RequestModel = {
      request: this.localService.encrypt(JSON.stringify(data)).toString(),
    };

    this.dataLoading = true;

    this.service.PackageDetailtypeListAll(obj).subscribe({
      next: (r1) => {
        let response = r1 as any;
        if (response.Message == ConstantData.SuccessMessage) {
          this.PackageDetialList = response.PackageDetialList;
          this.filteredPackageList = [...this.PackageDetialList];
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

  filterpackageList(value: string) {
    const filterValue = value?.toLowerCase() || '';
    this.filteredPackageList = this.PackageDetialList.filter(
      (option: any) =>
        option.PackageName?.toLowerCase().includes(filterValue) ||
        option.PackageCode?.toLowerCase().includes(filterValue)
    );
  }

  afterPackageSelected(event: any) {
    const selectedName = event.option.value;
    const selected = this.PackageDetialList.find(
      (x: any) => x.PackageName === selectedName
    );

    if (selected) {
      this.Package = { 
        ...this.Package,
        ...selected 
      };
    }
  }

  PackageClear() {
    this.resetPackageForm();
    this.filteredPackageList = [...this.PackageDetialList];
  }

  // Getter methods for calculated values
  get totalPaidAmount(): number {
    return this.SelectedPaymentCollectionList.reduce(
      (sum, item) => sum + (parseFloat(item.PaidAmount) || 0),
      0
    );
  }

  get remainingPayableAmount(): number {
    return this.Package.PayableAmount - this.totalPaidAmount;
  }

  get isPaymentComplete(): boolean {
    return Math.abs(this.remainingPayableAmount) < 0.01;
  }
}