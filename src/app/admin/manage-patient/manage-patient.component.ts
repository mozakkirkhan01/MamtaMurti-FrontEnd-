import { Component, ViewChild } from '@angular/core';
import { NgForm } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';
import { AppService } from '../../utils/app.service';
import { ConstantData } from '../../utils/constant-data';
import { Gender, Status ,Category} from '../../utils/enum';
import { LoadDataService } from '../../utils/load-data.service';
import { ActionModel, RequestModel, StaffLoginModel } from '../../utils/interface';
import { LocalService } from '../../utils/local.service';
import { Router } from '@angular/router';
declare var $: any

@Component({
  selector: 'app-manage-patient',
  templateUrl: './manage-patient.component.html',
  styleUrls: ['./manage-patient.component.css'],
})
export class ManagePatientComponent {

  dataLoading: boolean = false
  PatientList: any = []
  Patient: any = {}
  isSubmitted = false
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
  action: ActionModel = {} as ActionModel;
  staffLogin: StaffLoginModel = {} as StaffLoginModel;
  AllStatusList = Status;
  AllGenderList = Gender;
  AllCategoryList = Category;

  sort(key: any) {
    this.sortKey = key;
    this.reverse = !this.reverse;
  }

  onTableDataChange(p: any) {
    this.p = p
  }

  constructor(
    private service: AppService,
    private toastr: ToastrService,
    private loadData: LoadDataService,
    private localService: LocalService,
    private router: Router
  ) { }

  ngOnInit(): void {
    this.staffLogin = this.localService.getEmployeeDetail();
    this.validiateMenu();
    this.getPatientList();
    this.resetForm();
  }
  validiateMenu() {
    var request: RequestModel = {
      request: this.localService.encrypt(JSON.stringify({ Url: this.router.url, StaffLoginId: this.staffLogin.StaffLoginId })).toString()
    }
    this.dataLoading = true
    this.service.validiateMenu(request).subscribe((response: any) => {
      this.action = this.loadData.validiateMenu(response, this.toastr, this.router)
      this.dataLoading = false;
    }, (err => {
      this.toastr.error("Error while fetching records")
      this.dataLoading = false;
    }))
  }

  GotoOPDBooking(data: any) {
    // console.log(data.PatientID);
    this.router.navigate(['/admin/opd-booking'], { queryParams: { id: data.PatientID, redUrl: '/admin/manage-patient' } });
  }

  @ViewChild('formPatient') formPatient: NgForm;
  resetForm() {
    this.Patient = {};
    if (this.formPatient) {
      this.formPatient.control.markAsPristine();
      this.formPatient.control.markAsUntouched();
    }
    this.isSubmitted = false
  }

  getPatientList() {
    const obj: RequestModel = {
      request: this.localService.encrypt(JSON.stringify({})).toString()
    };

    // console.log("Sending request:", obj);
    this.dataLoading = true;

    this.service.getPatientList(obj).subscribe({
      next: r1 => {
        // console.log("API Response:", r1);
        let response = r1 as any;
        if (response.Message == ConstantData.SuccessMessage) {
          this.PatientList = response.PatientList;
          console.log(this.PatientList);
          
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


  savePatient() {
    this.isSubmitted = true;
    this.formPatient.control.markAllAsTouched();
    if (this.formPatient.invalid) {
      this.toastr.error("Fill all the required fields !!")
      return
    }
    this.Patient.CreatedBy = this.staffLogin.StaffId;
    this.Patient.UpdatedBy = this.staffLogin.StaffId;
    console.log(this.Patient);
    
    var obj: RequestModel = {
      request: this.localService.encrypt(JSON.stringify(this.Patient)).toString()
    }
    this.dataLoading = true;
    this.service.savePatient(obj).subscribe(r1 => {
      let response = r1 as any
      if (response.Message == ConstantData.SuccessMessage) {
        if (this.Patient.PatientID > 0) {
          this.toastr.success("Patient Updated successfully")
          $('#staticBackdrop').modal('hide')
        } else {
          this.toastr.success("Patient added successfully")
        }
        this.resetForm()
        this.getPatientList()
      } else {
        this.toastr.error(response.Message)
        this.dataLoading = false;
      }
    }, (err => {
      this.toastr.error("Error occured while submitting data")
      this.dataLoading = false;
    }))
  }

  savePatientAndRediectToOPD() {
    this.isSubmitted = true;
    this.formPatient.control.markAllAsTouched();
    if (this.formPatient.invalid) {
      this.toastr.error("Fill all the required fields !!")
      return
    }
    this.Patient.CreatedBy = this.staffLogin.StaffId;
    this.Patient.UpdatedBy = this.staffLogin.StaffId;
    var obj: RequestModel = {
      request: this.localService.encrypt(JSON.stringify(this.Patient)).toString()
    }
    this.dataLoading = true;
    this.service.savePatient(obj).subscribe(r1 => {
      let response = r1 as any
      if (response.Message == ConstantData.SuccessMessage) {
        if (this.Patient.PatientID > 0) {
          this.toastr.success("Patient Updated successfully")
          $('#staticBackdrop').modal('hide')
        } else {
          this.toastr.success("Patient added successfully")
        }

        this.router.navigate(['/admin/opd-booking'], { queryParams: { id: response.PatientID, redUrl: '/admin/manage-patient' } });
        this.resetForm()
        this.getPatientList()
      } else {
        this.toastr.error(response.Message)
        this.dataLoading = false;
      }
    }, (err => {
      this.toastr.error("Error occured while submitting data")
      this.dataLoading = false;
    }))
  }

  deletePatient(obj: any) {
    if (confirm("Are your sure you want to delete this recored")) {
      var request: RequestModel = {
        request: this.localService.encrypt(JSON.stringify(obj)).toString()
      }
      this.dataLoading = true;
      this.service.deletePatient(request).subscribe(r1 => {
        let response = r1 as any
        if (response.Message == ConstantData.SuccessMessage) {
          this.toastr.success("Record Deleted successfully")
          this.getPatientList()
        } else {
          this.toastr.error(response.Message)
          this.dataLoading = false;
        }
      }, (err => {
        this.toastr.error("Error occured while deleteing the recored")
        this.dataLoading = false;
      }))
    }
  }

  editPatient(obj: any) {
    this.resetForm()
    this.Patient = obj
  }





}