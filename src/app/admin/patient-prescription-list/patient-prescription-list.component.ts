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
  PaymentMode,
  Gender
} from '../../utils/enum';
import {
  ActionModel,
  RequestModel,
  StaffLoginModel,
} from '../../utils/interface';
import { Router } from '@angular/router';
declare var $: any;
@Component({
  selector: 'app-patient-prescription-list',
  templateUrl: './patient-prescription-list.component.html',
  styleUrls: ['./patient-prescription-list.component.css']
})
export class PatientPrescriptionListComponent {
  DueDate: any;
  DuePayment: any;
    Deliverystatus: any={};
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
    PatientPrescriptionList: any;
    BillData: any;
    Packages: any;
    Payments: any;
    SurgeryReceiptModel: any;
    Patient: any;
    Filter: any = {};
    filterModel: any = {};
    OpticalTotal: any = {};
    selectedPrescription: any = {};
    OpticalSellListALL: any = {};
    DueBill: any={};
    PatientPrescriptionItems: any;
    GenderList = this.loadData.GetEnumList(Gender);
    AllGenderList = Gender;
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
      this.GetPrescriptionList();
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
      this.service.PrintPrescription(data.PatientPrescriptionId);
    }
  
    GetPrescriptionList() {
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
      const obj: RequestModel = {
        request: this.localService.encrypt(JSON.stringify(this.filterModel)).toString(),
      };
      this.dataLoading = true;
      this.service.GetPrescriptionList(obj).subscribe(
        (r1) => {
          let response = r1 as any;
          if (response.Message === ConstantData.SuccessMessage) {
            this.PatientPrescriptionList = response.PatientPrescriptionList;
            
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
            this.GetPrescriptionList();
          } else {
            this.toastr.error(response.Message);
          }
        },
        (err) => {
          this.toastr.error('Error occured while submitting data');
        }
      );
    }
  
    DeletePatientPrescription(obj: any) {
      if (confirm('Are your sure you want to delete this recored')) {
        var request: RequestModel = {
          request: this.localService.encrypt(JSON.stringify(obj)).toString(),
        };
  
        this.dataLoading = true;
        this.service.deletePatientPrescription(request).subscribe(
          (r1) => {
            let response = r1 as any;
            if (response.Message == ConstantData.SuccessMessage) {
              this.toastr.success('the recored deleted', response.Message);
              this.GetPrescriptionList();
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
      this.router.navigate(['/admin/patient-prescription'], {
        queryParams: {
          id: data.PatientPrescriptionId,
          redUrl: '/admin/patient-prescription-list',
        },
      });
    }
    openViewModal(item: any) {
      this.selectedPrescription = item;
      console.log(this.selectedPrescription);
      
      $('#viewPrescriptionDetailsModal').modal('show');
      this.getPatientPrescriptionItem(item);
    }

    getPatientPrescriptionItem(obj: any) {
      var request: RequestModel = {
        request: this.localService.encrypt(JSON.stringify(obj)).toString(),
      };
      this.dataLoading = true;
      this.service.getPatientPrescriptionItem(request).subscribe(
        (r1) => {
          let response = r1 as any;
          if (response.Message == ConstantData.SuccessMessage) {
            this.PatientPrescriptionItems = response.PatientPrescriptionItems;
  
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
  

    }


