import { Component, OnInit } from '@angular/core';
declare var toastr: any;
declare var $: any;

import { AppService } from "../../utils/app.service";
import { ConstantData } from "../../utils/constant-data";
import { LocalService } from "../../utils/local.service";
import { LoadDataService } from '../../utils/load-data.service';
import { Status } from '../../utils/enum';
import {
  ActionModel,
  StaffLoginModel,
  RequestModel,
} from '../../utils/interface';
import { Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';


@Component({
  selector: 'app-medicine-return-list',
  templateUrl: './medicine-return-list.component.html',
  styleUrls: ['./medicine-return-list.component.css']
})
export class MedicineReturnListComponent implements OnInit {

  Sale: any = {};
  employeeDetail: any;
  StatusList = this.loadData.GetEnumList(Status);
  AllStatusList = Status;
  MedicineReturnList: any[];
  MedicineReturnItemList: any[];
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
         private toastr: ToastrService,
    private loadDataService: LoadDataService,    
    private router: Router,
    
    private loadData: LoadDataService
  ) { }

  ngOnInit(): void {
    this.staffLogin = this.localService.getEmployeeDetail();
    this.validiateMenu();
    this.opd.FromDate = this.loadDataService.loadDateYMD(new Date());
    this.opd.ToDate = this.loadDataService.loadDateYMD(new Date());
    this.getMedicineReturnList();
    this.employeeDetail = this.localService.getEmployeeDetail();
  }

      validiateMenu() {
    var obj: RequestModel = {
      request: this.localService.encrypt(JSON.stringify({ Url: this.router.url,StaffLoginId:this.staffLogin.StaffLoginId })).toString()
    }
    this.dataLoading = true
    this.service.validiateMenu(obj).subscribe((response: any) => {
      this.action = this.loadDataService.validiateMenu(response, this.toastr, this.router)
      this.dataLoading = false;
    }, (err => {
      this.toastr.error("Error while fetching records")
      this.dataLoading = false;
    }))
  }

  editSale(obj: any) {
    this.Sale = obj;
  }

  onTableDataChange(p: any) {
    this.p = p;
  }

  sort(key: any) {
    this.sortKey = key;
    this.reverse = !this.reverse;
  }

  opd: any = {};
  SaleTotal: any = {};
  getMedicineReturnList() {
    this.SaleTotal.TotalDiscountAmount = 0;
    this.SaleTotal.TotalAmount = 0;
    this.SaleTotal.TotalCGSTAmount = 0;
    this.SaleTotal.TotalSGSTAmount = 0;
    this.SaleTotal.TotalIGSTAmount = 0;
    this.SaleTotal.TotalGrossAmount = 0;
    this.SaleTotal.TotalTaxableAmount = 0;
    var data = {
      FromDate: this.loadDataService.loadDateYMD(this.opd.FromDate),
      ToDate: this.loadDataService.loadDateYMD(this.opd.ToDate)
    } 

    var obj: RequestModel = {
      request: this.localService
        .encrypt(JSON.stringify(data))
        .toString(),
    };
    this.dataLoading = true;
    this.service.getMedicineReturnList(obj).subscribe(r1 => {
      let response = r1 as any;
      if (response.Message == ConstantData.SuccessMessage) {
        this.MedicineReturnList = response.MedicineReturnList;
        console.log(this.MedicineReturnList);
        
        this.MedicineReturnList.forEach((e1: any) => {
          this.SaleTotal.TotalTaxableAmount += e1.TotalTaxableAmount;
          this.SaleTotal.TotalDiscountAmount += e1.TotalDiscountAmount;
          this.SaleTotal.TotalAmount += e1.TotalAmount;
          this.SaleTotal.TotalCGSTAmount += e1.TotalCGSTAmount;
          this.SaleTotal.TotalSGSTAmount += e1.TotalSGSTAmount;
          this.SaleTotal.TotalIGSTAmount += e1.TotalIGSTAmount;
          this.SaleTotal.TotalGrossAmount += e1.TotalGrossAmount;
        });
      } else {
        this.toastr.error(response.Message);
      }
      this.dataLoading = false;
    }, (err => {
      this.toastr.error("Error Occured while fetching data.");
      this.dataLoading = false;
    }));
  }

  getMedicineReturnItemList(obj:any) {
    
    this.dataLoading = true;
    this.service.getMedicineReturnItemList(obj).subscribe(r1 => {
      let response = r1 as any;
      if (response.Message == ConstantData.SuccessMessage) {
        this.MedicineReturnItemList = response.MedicineReturnItemList;
        $('#modal_popUp').modal('show');
      } else {
        this.toastr.error(response.Message);
      }
      this.dataLoading = false;
    }, (err => {
      this.toastr.error("Error Occured while fetching data.");
      this.dataLoading = false;
    }));
  }
  
}
