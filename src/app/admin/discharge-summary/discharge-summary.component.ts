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
  selector: 'app-discharge-summary',
  templateUrl: './discharge-summary.component.html',
  styleUrls: ['./discharge-summary.component.css']
})
export class DischargeSummaryComponent {
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
    DepartmentList: any=[];
  
    @ViewChild('formPatientDetails') formPatientDetails: NgForm;
    @ViewChild('formPaymentDetails') formPaymentDetails: NgForm;
    @ViewChild('formPaymentCollection') formPaymentCollection: NgForm;
  
    redUrl: string = '';
  DoctorList: any=[];
  
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
      this.resetForm();
      this.getPatientList(this.Patient.PatientId);
      this.getDepartmentList();
      this.getDoctorList();

        this.route.queryParams.subscribe((params) => {
      const DischargeSummaryId = params['id'];
      console.log(DischargeSummaryId);
      
      const redUrl = params['redUrl'];

      const data = this.service.getSelectedDsData();

       if(data && data.length > 0) {
    const item = data[0];
      console.log(item.DischargeSummaryId);
      
      
      if (item.DischargeSummaryId == DischargeSummaryId) {
        this.Patient = item;
      } else {
        console.log("your data not match");
      }
    }
    });

    }
  
    validiateMenu() {
      var request: RequestModel = {
        request: this.localService
          .encrypt(
            JSON.stringify({
              Url: '/admin/discharge-summary',
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
            if (!this.Patient.DischargeDate) {
              this.Patient.DischargeDate = new Date();
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


  
 
  
    saveDischargeSummary() {

      if(this.Patient.DischargeSummaryId > 0){
      this.Patient.UpdatedBy = this.staffLogin.StaffId;
      }
     
      this.Patient.CreatedBy = this.staffLogin.StaffId;
      this.Patient.SurgeryDate = this.loadData.loadDateYMD(this.Patient.SurgeryDate);
      this.Patient.DischargeDate = this.loadData.loadDateYMD(this.Patient.DischargeDate);
    
      console.log('Submitting data:', this.Patient);
  
      const obj: RequestModel = {
        request: this.localService.encrypt(JSON.stringify(this.Patient)).toString(),
      };
  
      this.dataLoading = true;
      this.service.saveDischargeSummary(obj).subscribe(
        (r1) => {
          const response = r1 as any;
          if (response.Message === ConstantData.SuccessMessage) {
            this.service.PrintDischargeSummary(response.DischargeSummaryId);
            this.toastr.success(
              this.Patient.DischargeSummaryId > 0 ? 'Discharge Summary updated successfully' : 'Discharge Summary successfully'
            );
            
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
      this.resetForm();
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
  
    
    getDepartmentList() {
    var obj: RequestModel = {
      request: this.localService.encrypt(JSON.stringify({ })).toString()
    }
    this.dataLoading = true
    this.service.getDepartmentList(obj).subscribe(r1 => {
      let response = r1 as any
      if (response.Message == ConstantData.SuccessMessage) {
        this.DepartmentList = response.DepartmentList;
      } else {
        this.toastr.error(response.Message)
      }
      this.dataLoading = false
    }, (err => {
      this.toastr.error("Error while fetching records")
    }))
  }
    filterpackageList(value: string) {
      const filterValue = value?.toLowerCase() || '';
      this.filteredPackageList = this.PackageDetialList.filter(
        (option: any) =>
          option.PackageName?.toLowerCase().includes(filterValue) ||
          option.PackageCode?.toLowerCase().includes(filterValue)
      );
    }

    getDoctorList() {
    const obj: RequestModel = {
      request: this.localService.encrypt(JSON.stringify({})).toString()
    };

    // console.log("Sending request:", obj);
    this.dataLoading = true;

    this.service.getDoctorList(obj).subscribe({
      next: r1 => {
        // console.log("API Response:", r1);
        let response = r1 as any;
        if (response.Message == ConstantData.SuccessMessage) {
          this.DoctorList = response.DoctorList;
          // console.log(this.DoctorList);
          
        } else {
          this.toastr.error(response.Message);
        }
        this.dataLoading = false;
      },
      error: err => {
        console.error("API error:", err);
        this.toastr.error("Error while fetching records");
        this.dataLoading = false;
      }
    });
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
