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
  selector: 'app-supplier',
  templateUrl: './supplier.component.html',
  styleUrls: ['./supplier.component.css']
})
export class SupplierComponent {
  ChargeList: any;
   dataLoading: boolean = false
    SupplierList: any = []
    Supplier: any = []
    isSubmitted = false
    PageSize = ConstantData.PageSizes;
    p: number = 1;
    Search: string = '';
    reverse: boolean = false;
    sortKey: string = '';
    itemPerPage: number = this.PageSize[0];
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
    filteredStateList: any[] = [];
  StateChargeList: any=[];
  StateList: any=[];
   
  
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
      this.getSupplierList();
      this.getStateList();
  
      this.resetForm();
    }
     validiateMenu() {
      var request: RequestModel = {
        request: this.localService
          .encrypt(
            JSON.stringify({
              Url: '/admin/supplier',
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
  
  
    @ViewChild('formSupplier') formSupplier: NgForm;
    resetForm() {
      this.Supplier = {};
      if (this.formSupplier) {
        this.formSupplier.control.markAsPristine();
        this.formSupplier.control.markAsUntouched();
      }
      this.isSubmitted = false
    }
  
    getSupplierList() {
      const obj: RequestModel = {
        request: this.localService.encrypt(JSON.stringify({})).toString()
      };
      this.dataLoading = true;
      this.service.getSupplierList(obj).subscribe({
        next: r1 => {
          // console.log("API Response:", r1);
          let response = r1 as any;
          if (response.Message == ConstantData.SuccessMessage) {
            this.SupplierList = response.SupplierList;
            console.log(this.SupplierList);
            
            
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
  
  
    saveSupplier() {
      this.isSubmitted = true;
      this.formSupplier.control.markAllAsTouched();
      if (this.formSupplier.invalid) {
        this.toastr.error("Fill all the required fields !!")
        return
      }
      this.Supplier.CreatedBy = this.staffLogin.StaffId;
      this.Supplier.UpdatedBy = this.staffLogin.StaffId;
      this.Supplier.JoinDate = this.loadData.loadDateYMD(this.Supplier.JoinDate);
      console.log(this.Supplier);
      
      var obj: RequestModel = {
        request: this.localService.encrypt(JSON.stringify(this.Supplier)).toString()
      }
      this.dataLoading = true;
      this.service.saveSupplier(obj).subscribe(r1 => {
        let response = r1 as any
        if (response.Message == ConstantData.SuccessMessage) {
          if (this.Supplier.Supplierid > 0) {
            this.toastr.success("Supplier Updated successfully")
            $('#staticBackdrop').modal('hide')
          } else {
            this.toastr.success("Supplier added successfully")
          }
          this.resetForm()
          this.getSupplierList()
        } else {
          this.toastr.error(response.Message)
          this.dataLoading = false;
        }
      }, (err => {
        this.toastr.error("Error occured while submitting data")
        this.dataLoading = false;
      }))
    }
    deleteSupplier(obj: any) {
      if (confirm("Are your sure you want to delete this recored")) {
        var request: RequestModel = {
          request: this.localService.encrypt(JSON.stringify(obj)).toString()
        }
        this.dataLoading = true;
        this.service.deleteSupplier(request).subscribe(r1 => {
          let response = r1 as any
          if (response.Message == ConstantData.SuccessMessage) {
            this.toastr.success("Record Deleted successfully")
            this.getSupplierList()
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
  
    editSupplier(obj: any) {
      this.resetForm()
      this.Supplier = obj
      console.log(this.Supplier);
      
    }
  
  getStateList() {
    var obj: RequestModel = {
      request: this.localService.encrypt(JSON.stringify({ })).toString()
    }
    this.dataLoading = true
    this.service.getStateList(obj).subscribe(r1 => {
      let response = r1 as any
      if (response.Message == ConstantData.SuccessMessage) {
        this.StateList = response.StateList;
      } else {
        this.toastr.error(response.Message)
      }
      this.dataLoading = false;
    }, (err => {
      this.toastr.error("Error while fetching records")
      this.dataLoading = false;
    }))
  }
  

       filterStateList(value: any) {
    if (value) {
      const StatefilterValue = value.toLowerCase();
      this.StateChargeList = this.StateList.filter((option: any) =>
        option.StateName.toLowerCase().includes(StatefilterValue)
      );
    } else {
      this.StateChargeList = this.StateList;
    }
  }

      afterStateSelected(event: any) {
    this.Supplier.StateId = event.option.id;
    this.Supplier.StateName = event.option.value;
    var Transport = this.StateChargeList.find(
      (x: any) => x.StateId == this.Supplier.StateId
    );
    this.Supplier.StateName = Transport.StateName;
    this.Supplier.StateId = Transport.StateId;
  }

   clearState() {
    this.StateChargeList = this.StateList;
    this.Supplier.StateId = null;
    this.Supplier.StateName = "";
  }
  
     getPrint(data:any){
        // this.service.PrintSupplierForm(data.SupplierId)
      }
  
}
