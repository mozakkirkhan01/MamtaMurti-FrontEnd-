import { Component, OnInit,ViewChild } from '@angular/core';
import { NgForm } from "@angular/forms";
declare var toastr: any;
declare var $: any;
import { ToastrService } from 'ngx-toastr';
import { AppService } from "../../utils/app.service";
import { ConstantData } from "../../utils/constant-data";
import { LocalService } from "../../utils/local.service";
import { LoadDataService } from '../../utils/load-data.service';
import { Status } from '../../utils/enum';
import { ActionModel,RequestModel, StaffLoginModel } from '../../utils/interface';
import { Router } from '@angular/router';

@Component({
  selector: 'app-medicine-type-list',
  templateUrl: './medicine-type-list.component.html',
  styleUrls: ['./medicine-type-list.component.css']
})
export class MedicineTypeListComponent {
 MedicineType: any = {};
  employeeDetail: any;
  StatusList = this.loadData.GetEnumList(Status);
  AllStatusList= Status;
  MedicineTypeList: any[];
  dataLoading: boolean = false;
  submitted: boolean;
  Search: string;
  reverse: boolean;
  sortKey: string;
  p: number = 1;
  pageSize = ConstantData.PageSizes;
  itemPerPage: number = this.pageSize[0];
  action: ActionModel = {} as ActionModel;
  staffLogin: StaffLoginModel = {} as StaffLoginModel;


  constructor(
    private service: AppService,
    private localService: LocalService,
    private router: Router,
    private loadData:LoadDataService,
      private toastr: ToastrService,
  ) { }

  ngOnInit(): void {
    this.staffLogin = this.localService.getEmployeeDetail();
    this.validiateMenu();
    this.getMedicineTypeList();
    this.resetForm();
  }

   validiateMenu() {
     var obj: RequestModel = {
       request: this.localService.encrypt(JSON.stringify({ Url: this.router.url,StaffLoginId:this.staffLogin.StaffLoginId })).toString()
     }
     this.dataLoading = true
     this.service.validiateMenu(obj).subscribe((response: any) => {
       this.action = this.loadData.validiateMenu(response, this.toastr, this.router)
       this.dataLoading = false;
     }, (err => {
       this.toastr.error("Error while fetching records")
       this.dataLoading = false;
     }))
   }

  @ViewChild('formMedicineType') formMedicineType: NgForm;
  resetForm() {
    this.MedicineType = {};
    this.MedicineType.Status = 1
    if (this.formMedicineType) {
      this.formMedicineType.control.markAsPristine();
      this.formMedicineType.control.markAsUntouched();
    }
    this.submitted = false
  }

  newMedicineType() {
    this.resetForm();
    $('#modal_popUp').modal('show');
  }

  editMedicineType(obj: any) {
    this.MedicineType = obj;
    $('#modal_popUp').modal('show');
  }

  onTableDataChange(p: any) {
    this.p = p;
  }

  sort(key: any) {
    this.sortKey = key;
    this.reverse = !this.reverse;
  }

getMedicineTypeList() {
  const obj: RequestModel = {
    request: this.localService.encrypt(JSON.stringify({})).toString()
  };

  this.dataLoading = true;

  this.service.getMedicineTypeList(obj).subscribe({
    next: r1 => {
      let response = r1 as any;
      if (response.Message == ConstantData.SuccessMessage) {
        this.MedicineTypeList = response.MedicineTypeList;
        console.log(response.MedicineTypeList);
        
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


  saveMedicineType() {
    this.submitted = true;
    if (this.formMedicineType.invalid) {
      toastr.warning("Fill all the Required Fields.", "Invailid Form")
      this.dataLoading = false;
      return;
    }
          this.MedicineType.CreatedBy = this.staffLogin.StaffId;
      this.MedicineType.UpdatedBy = this.staffLogin.StaffId;
    this.dataLoading = true;
    console.log(this.MedicineType);
    
    var obj: RequestModel = {
        request: this.localService.encrypt(JSON.stringify(this.MedicineType)).toString()
      }
    this.service.saveMedicineType(obj).subscribe(r1 => {
      let response = r1 as any;
      console.log(response);
      
      if (response.Message == ConstantData.SuccessMessage) {
       if (this.MedicineType.MedicineTypeId > 0) {
            this.toastr.success("MedicineType Updated successfully")
            $('#staticBackdrop').modal('hide')
            this.dataLoading = false;
          } else {
            this.toastr.success("MedicineType added successfully")
          }
        this.getMedicineTypeList();
        $('#staticBackdrop').modal('hide');
      } else {
        toastr.error(response.Message);
      }
    }, (err => {
      toastr.error("Error Occured while fetching data.");
      this.dataLoading = false;
    }));
  }

  
  deleteMedicineType(obj: any) {
    if (confirm("Are your sure you want to delete this recored")) {
      var request: RequestModel = {
        request: this.localService.encrypt(JSON.stringify(obj)).toString()
      }
      this.dataLoading = true;
      this.service.deleteMedicineType(request).subscribe(r1 => {
        let response = r1 as any
        if (response.Message == ConstantData.SuccessMessage) {
          this.toastr.success("Record Deleted successfully")
          this.getMedicineTypeList()
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

}
