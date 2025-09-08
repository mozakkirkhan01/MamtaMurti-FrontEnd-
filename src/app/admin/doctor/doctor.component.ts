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
  selector: 'app-doctor',
  templateUrl: './doctor.component.html',
  styleUrls: ['./doctor.component.css']
})
export class DoctorComponent {
dataLoading: boolean = false
  DoctorList: any = []
  Doctor: any = {}
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
    this.getDoctorList();
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
    // console.log(data.DoctorID);
    this.router.navigate(['/admin/opd-booking'], { queryParams: { id: data.DoctorID, redUrl: '/admin/manage-Doctor' } });
  }

  @ViewChild('formDoctor') formDoctor: NgForm;
  resetForm() {
    this.Doctor = {};
    if (this.formDoctor) {
      this.formDoctor.control.markAsPristine();
      this.formDoctor.control.markAsUntouched();
    this.Doctor.JoiningDate = new Date();

    }
    this.isSubmitted = false
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


  saveDoctor() {
    this.isSubmitted = true;
    this.formDoctor.control.markAllAsTouched();
    if (this.formDoctor.invalid) {
      this.toastr.error("Fill all the required fields !!")
      return
    }
    this.Doctor.CreatedBy = this.staffLogin.StaffId;
    this.Doctor.UpdatedBy = this.staffLogin.StaffId;
    console.log(this.Doctor);
    
    var obj: RequestModel = {
      request: this.localService.encrypt(JSON.stringify(this.Doctor)).toString()
    }
    this.dataLoading = true;
    this.service.saveDoctor(obj).subscribe(r1 => {
      let response = r1 as any
      if (response.Message == ConstantData.SuccessMessage) {
        if (this.Doctor.DoctorID > 0) {
          this.toastr.success("Doctor Updated successfully")
          $('#staticBackdrop').modal('hide')
        } else {
          this.toastr.success("Doctor added successfully")
        }
        this.resetForm()
        this.getDoctorList()
      } else {
        this.toastr.error(response.Message)
        this.dataLoading = false;
      }
    }, (err => {
      this.toastr.error("Error occured while submitting data")
      this.dataLoading = false;
    }))
  }

  saveDoctorAndRediectToOPD() {
    this.isSubmitted = true;
    this.formDoctor.control.markAllAsTouched();
    if (this.formDoctor.invalid) {
      this.toastr.error("Fill all the required fields !!")
      return
    }

    if(this.Doctor.DoctorID > 0) {
      this.Doctor.UpdatedBy = this.staffLogin.StaffId;
    }
    this.Doctor.CreatedBy = this.staffLogin.StaffId;
    
    var obj: RequestModel = {
      request: this.localService.encrypt(JSON.stringify(this.Doctor)).toString()
    }
    this.dataLoading = true;
    this.service.saveDoctor(obj).subscribe(r1 => {
      let response = r1 as any
      if (response.Message == ConstantData.SuccessMessage) {
        if (this.Doctor.DoctorID > 0) {
          this.toastr.success("Doctor Updated successfully")
          $('#staticBackdrop').modal('hide')
        } else {
          this.toastr.success("Doctor added successfully")
        }

        this.router.navigate(['/admin/opd-booking'], { queryParams: { id: response.DoctorID, redUrl: '/admin/manage-Doctor' } });
        this.resetForm()
        this.getDoctorList()
      } else {
        this.toastr.error(response.Message)
        this.dataLoading = false;
      }
    }, (err => {
      this.toastr.error("Error occured while submitting data")
      this.dataLoading = false;
    }))
  }

  deleteDoctor(obj: any) {
    if (confirm("Are your sure you want to delete this recored")) {
      var request: RequestModel = {
        request: this.localService.encrypt(JSON.stringify(obj)).toString()
      }
      this.dataLoading = true;
      this.service.deleteDoctor(request).subscribe(r1 => {
        let response = r1 as any
        if (response.Message == ConstantData.SuccessMessage) {
          this.toastr.success("Record Deleted successfully")
          this.getDoctorList()
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

  editDoctor(obj: any) {
    this.resetForm()
    this.Doctor = obj
  }




}
