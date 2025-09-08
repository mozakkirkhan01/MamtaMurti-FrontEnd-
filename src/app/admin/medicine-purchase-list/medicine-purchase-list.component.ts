import { Component, OnInit, ViewChild } from '@angular/core';
declare var toastr: any;
declare var $: any;

import { AppService } from "../../utils/app.service";
import { ConstantData } from "../../utils/constant-data";
import { LocalService } from "../../utils/local.service";
import { LoadDataService } from '../../utils/load-data.service';
import { Status } from '../../utils/enum';
import { Route, Router } from '@angular/router';
import { ActionModel, StaffLoginModel,RequestModel } from '../../utils/interface';
import { ToastrService } from 'ngx-toastr';


@Component({
  selector: 'app-medicine-purchase-list',
  templateUrl: './medicine-purchase-list.component.html',
  styleUrls: ['./medicine-purchase-list.component.css']
})
export class MedicinePurchaseListComponent implements OnInit {
  Purchase: any = {};
  employeeDetail: any;
  StatusList = this.loadData.GetEnumList(Status);
  AllStatusList = Status;
  PurchaseList: any[];
  dataLoading: boolean = false;
  submitted: boolean;
  Search: string;
  reverse: boolean;
  sortKey: string;
  p: number = 1;
  pageSize = ConstantData.PageSizes;
  itemPerPage: number = this.pageSize[0];
  action: ActionModel = {} as ActionModel;
  StaffLogin: StaffLoginModel = {} as StaffLoginModel;

  constructor(
    private service: AppService,
    private localService: LocalService,
    private loadData: LoadDataService,
    private router: Router,     
    private toastr: ToastrService,
    
  ) { }

  ngOnInit(): void {
    this.StaffLogin = this.localService.getEmployeeDetail();
    this.validiateMenu();
    this.getPurchaseList();
    this.employeeDetail = this.localService.getEmployeeDetail();
  }

  // validiateMenu() {
  //   var obj = {
  //     Url: this.router.url,
  //     //Url: "/admin/employee",
  //     EmployeeId: this.StaffLogin.StaffId
  //   }
  //   this.dataLoading = true
  //   this.service.validiateMenu(obj).subscribe((response: any) => {
  //     this.action = this.loadData.validiateMenu(response, toastr, this.router)
  //     this.dataLoading = false;
  //   }, (err => {
  //     toastr.error("Error while fetching records")
  //     this.dataLoading = false;
  //   }))
  // }

    validiateMenu() {
    var obj: RequestModel = {
      request: this.localService.encrypt(JSON.stringify({ Url: this.router.url,StaffLoginId:this.StaffLogin.StaffLoginId })).toString()
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
  
  editPurchase(obj: any) {
    // this.Purchase = obj;
    this.router.navigate(['/admin/medicine-purchase'], { queryParams: { id: obj.PurchaseId,redUrl:'/admin/medicine-purchase-list' } });
  }

  onTableDataChange(p: any) {
    this.p = p;
  }

  sort(key: any) {
    this.sortKey = key;
    this.reverse = !this.reverse;
  }

  PurchaseTotal: any = {};
  getPurchaseList() {
    this.PurchaseTotal.TotalBasicAmount = 0;
    this.PurchaseTotal.TotalDiscountAmount = 0;
    this.PurchaseTotal.TotalTaxableAmount = 0;
    this.PurchaseTotal.TotalCGSTAmount = 0;
    this.PurchaseTotal.TotalSGSTAmount = 0;
    this.PurchaseTotal.TotalIGSTAmount = 0;
    this.PurchaseTotal.TotalGrandTotal = 0;
    this.PurchaseTotal.PaidAmount = 0;
    this.PurchaseTotal.DuesAmount = 0;
    this.dataLoading = true;
      var obj: RequestModel = {
          request: this.localService.encrypt(JSON.stringify({})).toString(),
        };
    this.service.getPurchaseList(obj).subscribe(r1 => {
      let response = r1 as any;
      if (response.Message == ConstantData.SuccessMessage) {
        this.PurchaseList = response.PurchaseList;
        console.log(this.PurchaseList);
        
        this.PurchaseList.forEach((e1: any) => {
          this.PurchaseTotal.TotalBasicAmount += e1.TotalBasicAmount;
          this.PurchaseTotal.TotalDiscountAmount += e1.TotalDiscountAmount;
          this.PurchaseTotal.TotalTaxableAmount += e1.TotalTaxableAmount;
          this.PurchaseTotal.TotalCGSTAmount += e1.TotalCGSTAmount;
          this.PurchaseTotal.TotalSGSTAmount += e1.TotalSGSTAmount;
          this.PurchaseTotal.TotalIGSTAmount += e1.TotalIGSTAmount;
          this.PurchaseTotal.TotalGrandTotal += e1.TotalGrandTotal;
          this.PurchaseTotal.PaidAmount += e1.PaidAmount;
          this.PurchaseTotal.DuesAmount += e1.DuesAmount;
        });
      } else {
        this.toastr.error(response.Message);
      }
      this.dataLoading = false;
    }, (err => {
      toastr.error("Error Occured while fetching data.");
      this.dataLoading = false;
    }));
  }

    getPrint(data:any){
      this.service.PrintMedicinePurchase(data.PurchaseId)
    }


  PurchaseProductList: any[] = [];
  getPurchaseProductList(purchase: any) {
    this.dataLoading = true;
    var PurchaseId = purchase.PurchaseId;
     var obj: RequestModel = {
      request: this.localService.encrypt(JSON.stringify({PurchaseId})).toString()
    }
    this.service.getPurchaseProductList(obj).subscribe(r1 => {
      let response = r1 as any;
      if (response.Message == ConstantData.SuccessMessage) {
        this.PurchaseProductList = response.PurchaseProductList;
        $('#modal_popUp').modal('show');
      } else {
        toastr.error(response.Message);
      }
      this.dataLoading = false;
    }, (err => {
      toastr.error("Error Occured while fetching data.");
      this.dataLoading = false;
    }));
  }

  deletePurchase(data: any) {
    if (confirm("Are you sure want to delete this record") == true) {
      this.dataLoading = true;
        var obj: RequestModel = {
      request: this.localService.encrypt(JSON.stringify({data})).toString(),
    };
      this.service.deletePurchase(obj).subscribe(r1 => {
        let response = r1 as any;
        if (response.Message == ConstantData.SuccessMessage) {
          toastr.success("One record deleted successfully.");
          this.getPurchaseList();
        } else {
          toastr.error(response.Message);
        }
        this.dataLoading = false;
      }, (err => {
        toastr.error("Error Occured while fetching data.");
        this.dataLoading = false;
      }));
    }
  }

}
