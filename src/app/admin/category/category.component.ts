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
  selector: 'app-category',
  templateUrl: './category.component.html',
  styleUrls: ['./category.component.css']
})
export class CategoryComponent implements OnInit {
  Category: any = {};
  employeeDetail: any;
  StatusList = this.loadData.GetEnumList(Status);
  AllStatusList= Status;
  CategoryList: any[];
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
    this.getCategoryList();
    this.employeeDetail = this.localService.getEmployeeDetail();
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

  @ViewChild('formCategory') formCategory: NgForm;
  resetForm() {
    this.Category = {};
    this.Category.Status = 1
    if (this.formCategory) {
      this.formCategory.control.markAsPristine();
      this.formCategory.control.markAsUntouched();
    }
    this.submitted = false
  }

  newCategory() {
    this.resetForm();
    $('#modal_popUp').modal('show');
  }

  editCategory(obj: any) {
    this.Category = obj;
    $('#modal_popUp').modal('show');
  }

  onTableDataChange(p: any) {
    this.p = p;
  }

  sort(key: any) {
    this.sortKey = key;
    this.reverse = !this.reverse;
  }

getCategoryList() {
  const obj: RequestModel = {
    request: this.localService.encrypt(JSON.stringify({})).toString()
  };

  this.dataLoading = true;

  this.service.getCategoryList(obj).subscribe({
    next: r1 => {
      let response = r1 as any;
      if (response.Message == ConstantData.SuccessMessage) {
        this.CategoryList = response.CategoryList;
        
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


  saveCategory() {
    this.submitted = true;
    if (this.formCategory.invalid) {
      toastr.warning("Fill all the Required Fields.", "Invailid Form")
      this.dataLoading = false;
      return;
    }
    this.Category.UpdatedBy = this.employeeDetail.EmployeeId;
    this.Category.CreatedBy = this.employeeDetail.EmployeeId;
    this.dataLoading = true;
    var obj: RequestModel = {
        request: this.localService.encrypt(JSON.stringify(this.Category)).toString()
      }
    this.service.saveCategory(obj).subscribe(r1 => {
      let response = r1 as any;
      
      if (response.Message == ConstantData.SuccessMessage) {
       if (this.Category.CategoryId > 0) {
            this.toastr.success("Category Updated successfully")
            $('#staticBackdrop').modal('hide')
          } else {
            this.toastr.success("Category added successfully")
          }
        this.getCategoryList();
        this.dataLoading = false;
        $('#staticBackdrop').modal('hide');
      } else {
        toastr.error(response.Message);
      }
    }, (err => {
      toastr.error("Error Occured while fetching data.");
      this.dataLoading = false;
    }));
  }

  
  deleteCategory(obj: any) {
    if (confirm("Are your sure you want to delete this recored")) {
      var request: RequestModel = {
        request: this.localService.encrypt(JSON.stringify(obj)).toString()
      }
      this.dataLoading = true;
      this.service.deleteCategory(request).subscribe(r1 => {
        let response = r1 as any
        if (response.Message == ConstantData.SuccessMessage) {
          this.toastr.success("Record Deleted successfully")
          this.getCategoryList()
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

