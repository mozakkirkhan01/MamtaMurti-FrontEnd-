import { Component, ViewChild } from '@angular/core';
import { ToastrService } from 'ngx-toastr';
import { AppService } from '../../utils/app.service';
import { ConstantData } from '../../utils/constant-data';
import { NgForm } from '@angular/forms';
import { LocalService } from '../../utils/local.service';
import { LoadDataService } from '../../utils/load-data.service';
import { Status } from '../../utils/enum';
import { ActionModel, RequestModel, StaffLoginModel } from '../../utils/interface';
import { Router } from '@angular/router';
declare var $: any;

@Component({
  selector: 'app-canteen',
  templateUrl: './canteen.component.html',
  styleUrls: ['./canteen.component.css']
})
export class CanteenComponent {
 dataLoading: boolean = false
  CanteenList: any = []
  Canteen: any = {}
  isSubmitted = false
  StatusList = this.loadData.GetEnumList(Status);
  PageSize = ConstantData.PageSizes;
  p: number = 1;
  Search: string = '';
  reverse: boolean = false;
  sortKey: string = '';
  itemPerPage: number = this.PageSize[0];
  action: ActionModel = {} as ActionModel;
  staffLogin: StaffLoginModel = {} as StaffLoginModel;
  AllStatusList = Status;
  constructor(
    private service: AppService,
    private toastr: ToastrService,
    private loadData: LoadDataService,
    private localService:LocalService,
    private router: Router
  ) { }

  ngOnInit(): void {
    this.staffLogin = this.localService.getEmployeeDetail();
    this.validiateMenu();
    this.getCanteenList();
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

  @ViewChild('formDepartment') formCanteen: NgForm;
  resetForm() {
    this.Canteen = {}
    if (this.formCanteen) {
      this.formCanteen.control.markAsPristine();
      this.formCanteen.control.markAsUntouched();
    }
    this.isSubmitted = false
    this.Canteen.Status = 1
  }

  sort(key: any) {
    this.sortKey = key;
    this.reverse = !this.reverse;
  }

  onTableDataChange(p: any) {
    this.p = p
  }

  getCanteenList() {
    var obj: RequestModel = {
      request: this.localService.encrypt(JSON.stringify({ })).toString()
    }
    this.dataLoading = true
    this.service.getCanteenList(obj).subscribe(r1 => {
      let response = r1 as any
      if (response.Message == ConstantData.SuccessMessage) {
        this.CanteenList = response.CanteenList;
        
      } else {
        this.toastr.error(response.Message)
      }
      this.dataLoading = false
    }, (err => {
      this.toastr.error("Error while fetching records")
    }))
  }

  saveCanteen() {
    this.isSubmitted = true;
      // this.formCanteen.control.markAllAsTouched();
      // if (this.formCanteen.invalid) {
      //   this.toastr.error("Fill all the required fields !!")
      //   return
      // }
    this.Canteen.CreatedBy = this.staffLogin.StaffId;
    this.Canteen.UpdatedBy = this.staffLogin.StaffId;

   
    
    var obj: RequestModel = {
      request: this.localService.encrypt(JSON.stringify(this.Canteen)).toString()
    }

   
    
    this.service.saveCanteen(obj).subscribe(r1 => {
      let response = r1 as any
      if (response.Message == ConstantData.SuccessMessage) {
        if (this.Canteen.CanteenId > 0) {
          this.toastr.success("Canteen detail updated successfully")
          
        } else {
          this.toastr.success("Canteen added successfully")
        }
        $('#staticBackdrop').modal('hide')
        this.resetForm()
        this.getCanteenList();

      } else {
        this.toastr.error(response.Message)
      }
    }, (err => {
      this.toastr.error("Error occured while submitting data")
    }))
  }

  deleteCanteen(obj: any) {
    if (confirm("Are your sure you want to delete this recored")) {
      var request: RequestModel = {
        request: this.localService.encrypt(JSON.stringify(obj)).toString()
      }
      this.dataLoading = true;
      this.service.deleteCanteen(request).subscribe(r1 => {
        let response = r1 as any
        if (response.Message == ConstantData.SuccessMessage) {
          this.toastr.success("Record Deleted successfully")
          this.getCanteenList()
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

  editCanteens(obj: any) {
    this.resetForm()
    this.Canteen = obj

  }
}
