import { Component, ViewChild } from '@angular/core';
import { NgForm } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';
import { AppService } from '../../utils/app.service';
import { ConstantData } from '../../utils/constant-data';
import { Gender, Status ,Category,Eye} from '../../utils/enum';
import { LoadDataService } from '../../utils/load-data.service';
import { ActionModel, RequestModel, StaffLoginModel } from '../../utils/interface';
import { LocalService } from '../../utils/local.service';
import { Router } from '@angular/router';
declare var $: any
@Component({
  selector: 'app-consent-form',
  templateUrl: './consent-form.component.html',
  styleUrls: ['./consent-form.component.css']
})
export class ConsentFormComponent {
  ChargeList: any;
GotoOPDBooking(_t70: any) {
throw new Error('Method not implemented.');
}
 dataLoading: boolean = false
  ConsentList: any = []
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
  EyeList = this.loadData.GetEnumList(Eye);
  GenderList = this.loadData.GetEnumList(Gender);
  CategoryList = this.loadData.GetEnumList(Category);
  action: ActionModel = {} as ActionModel;
  staffLogin: StaffLoginModel = {} as StaffLoginModel;
  AllStatusList = Status;
  AllGenderList = Gender;
  AllEyeList = Eye;
  filteredPatientList: any[] = [];
  PatientListAll: any;
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
    this.getConsentList();
    this.getPatientListall(this.Patient.PatientId);

    this.resetForm();
  }
   validiateMenu() {
    var request: RequestModel = {
      request: this.localService
        .encrypt(
          JSON.stringify({
            Url: '/admin/consent-form',
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


  @ViewChild('formPatient') formPatient: NgForm;
  resetForm() {
    this.Patient = {};
    if (this.formPatient) {
      this.formPatient.control.markAsPristine();
      this.formPatient.control.markAsUntouched();
    }
    this.isSubmitted = false
  }

  getConsentList() {
    const obj: RequestModel = {
      request: this.localService.encrypt(JSON.stringify({})).toString()
    };
    this.dataLoading = true;
    this.service.getConsentList(obj).subscribe({
      next: r1 => {
        // console.log("API Response:", r1);
        let response = r1 as any;
        if (response.Message == ConstantData.SuccessMessage) {
          this.ConsentList = response.ConsentList;
          
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


  saveConsent() {
    this.isSubmitted = true;
    this.formPatient.control.markAllAsTouched();
    if (this.formPatient.invalid) {
      this.toastr.error("Fill all the required fields !!")
      return
    }
    this.Patient.CreatedBy = this.staffLogin.StaffId;
    this.Patient.UpdatedBy = this.staffLogin.StaffId;
    this.Patient.ConsentDate = this.loadData.loadDateYMD(this.Patient.ConsentDate);
    this.Patient.RelationDate = this.loadData.loadDateYMD(this.Patient.RelationDate);
    this.Patient.CounsellorDate = this.loadData.loadDateYMD(this.Patient.CounsellorDate);
    console.log(this.Patient);
    
    var obj: RequestModel = {
      request: this.localService.encrypt(JSON.stringify(this.Patient)).toString()
    }
    this.dataLoading = true;
    this.service.saveConsent(obj).subscribe(r1 => {
      let response = r1 as any
      if (response.Message == ConstantData.SuccessMessage) {
        if (this.Patient.Consentid > 0) {
          this.toastr.success("Consent Updated successfully")
          $('#staticBackdrop').modal('hide')
        } else {
          this.toastr.success("Consent added successfully")
        }
        this.resetForm()
        this.getConsentList()
      } else {
        this.toastr.error(response.Message)
        this.dataLoading = false;
      }
    }, (err => {
      this.toastr.error("Error occured while submitting data")
      this.dataLoading = false;
    }))
  }
  deleteConsent(obj: any) {
    if (confirm("Are your sure you want to delete this recored")) {
      var request: RequestModel = {
        request: this.localService.encrypt(JSON.stringify(obj)).toString()
      }
      this.dataLoading = true;
      this.service.deleteConsent(request).subscribe(r1 => {
        let response = r1 as any
        if (response.Message == ConstantData.SuccessMessage) {
          this.toastr.success("Record Deleted successfully")
          this.getConsentList()
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
    console.log(this.Patient);
    
  }

  getPatientListall(PatientId: number) {
    var data = {
      PatientID: PatientId,
    };
    const obj: RequestModel = {
      request: this.localService.encrypt(JSON.stringify(data)).toString(),
    };
    // console.log("Sending request:", obj);
    this.dataLoading = true;

    this.service.getPatientList(obj).subscribe({
      next: (r1) => {
        // console.log("API Response:", r1);
        let response = r1 as any;
        if (response.Message == ConstantData.SuccessMessage) {
          this.PatientListAll = response.PatientList;
          this.filteredPatientList = [...this.PatientListAll];
          // console.log(this.filteredPatientList);
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
      this.Patient = { ...selected }; // assign full patient object
    }
    if (selected) {
      this.Patient.ConsentDate = new Date();
      this.Patient.RelationDate = new Date();
      this.Patient.CounsellorDate = new Date();
  }
  }


  clearPatient() {
    this.Patient.PatientName = '';
  }

   getPrint(data:any){
      this.service.PrintConsentForm(data.ConsentId)
    }

}
