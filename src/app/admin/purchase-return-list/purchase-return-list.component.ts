import { Component, OnInit } from '@angular/core';
declare var toastr: any;
declare var $: any; 
import { AppService } from "../../utils/app.service";
import { ConstantData } from "../../utils/constant-data";
import { LocalService } from "../../utils/local.service";
import { LoadDataService } from '../../utils/load-data.service';
import { Status } from '../../utils/enum';
import { ToastrService } from 'ngx-toastr';
import {
  ActionModel,
  RequestModel,
  StaffLoginModel,
} from '../../utils/interface';


@Component({
  selector: 'app-purchase-return-list',
  templateUrl: './purchase-return-list.component.html',
  styleUrls: ['./purchase-return-list.component.css']
})
export class PurchaseReturnListComponent implements OnInit {

  Purchase: any = {};
  employeeDetail: any;
  StatusList = this.loadData.GetEnumList(Status);
  AllStatusList = Status;
  PurchaseReturnReport: any[];
  dataLoading: boolean = false;
  submitted: boolean;
  Search: string;
  reverse: boolean;
  sortKey: string;
  p: number = 1;
  pageSize = ConstantData.PageSizes;
  itemPerPage: number = this.pageSize[0];


  constructor(
    private service: AppService,
    private localService: LocalService,
    private loadDataService: LoadDataService,
    private loadData: LoadDataService,
    private toastr: ToastrService,

  ) { }

  ngOnInit(): void {
    this.opd.FromDate = this.loadDataService.loadDateYMD(new Date());
    this.opd.ToDate = this.loadDataService.loadDateYMD(new Date());
    this.getPurchaseReturnReport();
    this.employeeDetail = this.localService.getEmployeeDetail();
  }

  editPurchase(obj: any) {
    this.Purchase = obj;
  }

  onTableDataChange(p: any) {
    this.p = p;
  }

  sort(key: any) {
    this.sortKey = key;
    this.reverse = !this.reverse;
  }

  opd: any = {};
  PurchaseTotal: any = {};
  getPurchaseReturnReport() {
    this.PurchaseTotal.TotalCostAmount = 0;
    this.PurchaseTotal.TotalTaxableAmount = 0;
    this.PurchaseTotal.TotalCGSTAmount = 0;
    this.PurchaseTotal.TotalSGSTAmount = 0;
    this.PurchaseTotal.TotalIGSTAmount = 0;
    this.PurchaseTotal.TotalGrandTotal = 0;

    var data = {
      FromDate: this.loadDataService.loadDateYMD(this.opd.FromDate),
      ToDate: this.loadDataService.loadDateYMD(this.opd.ToDate)
    } 

    this.dataLoading = true;
    var obj: RequestModel = {
          request: this.localService.encrypt(JSON.stringify({data})).toString(),
        };
    this.service.getPurchaseReturnReport(obj).subscribe(r1 => {
      let response = r1 as any;
      if (response.Message == ConstantData.SuccessMessage) {
        this.PurchaseReturnReport = response.PurchaseReturnReport;
        this.PurchaseReturnReport.forEach((e1: any) => {
          this.PurchaseTotal.TotalCostAmount += e1.TotalCostAmount;
          this.PurchaseTotal.TotalDiscountAmount += e1.TotalDiscountAmount;
          this.PurchaseTotal.TotalTaxableAmount += e1.TotalTaxableAmount;
          this.PurchaseTotal.TotalCGSTAmount += e1.TotalCGSTAmount;
          this.PurchaseTotal.TotalSGSTAmount += e1.TotalSGSTAmount;
          this.PurchaseTotal.TotalIGSTAmount += e1.TotalIGSTAmount;
          this.PurchaseTotal.TotalGrandTotal += e1.TotalGrandTotal;
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


  PurchaseReturnItemList: any[] = [];
  getPurchaseReturnItemList(PurchaseReturnId: any) {
    this.dataLoading = true;
     var obj: RequestModel = {
          request: this.localService.encrypt(JSON.stringify({PurchaseReturnId})).toString(),
        };
    this.service.getPurchaseReturnItemList(obj).subscribe(r1 => {
      let response = r1 as any;
      if (response.Message == ConstantData.SuccessMessage) {
        this.PurchaseReturnItemList = response.PurchaseReturnItemList;
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

  deletePurchase(obj: any) {
    if (confirm("Are you sure want to delete this record") == true) {
      this.dataLoading = true;
      this.service.deletePurchase(obj).subscribe(r1 => {
        let response = r1 as any;
        if (response.Message == ConstantData.SuccessMessage) {
          this.toastr.success("One record deleted successfully.");
          this.getPurchaseReturnReport();
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

}
