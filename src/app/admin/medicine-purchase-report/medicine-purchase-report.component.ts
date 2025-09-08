import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
declare var toastr: any;
declare var $: any;

import { AppService } from "../../utils/app.service";
import { ConstantData } from "../../utils/constant-data";
import { LocalService } from "../../utils/local.service";
import { LoadDataService } from '../../utils/load-data.service';
import { Status } from '../../utils/enum';

import * as XLSX from 'xlsx';
import * as ExcelJS from 'exceljs';
import { ActionModel, StaffLoginModel,RequestModel } from '../../utils/interface';
import { Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';


let saveAs: any;

import('file-saver').then(module => {
  saveAs = module.saveAs;
}).catch(error => {
  console.error('Failed to load file-saver:', error);
});

@Component({
  selector: 'app-medicine-purchase-report',
  templateUrl: './medicine-purchase-report.component.html',
  styleUrls: ['./medicine-purchase-report.component.css']
})
export class MedicinePurchaseReportComponent implements OnInit {

  exportDate = new Date();
  title = 'export-excel';
  fileName: string;


  ExportTOExcel1() {
    // Calculate totals
    const paidAmount = this.PurchaseList.reduce((acc, item) => acc + item.PaidAmount, 0);

    const ws: XLSX.WorkSheet = XLSX.utils.aoa_to_sheet([
      [{ t: 's', s: { bold: true, sz: 24 }, v: 'MJM MULTISPECIALITY HOSPITAL PHARMACY PURCHASE REPORT' }], // Header row with big font
      [], // Empty row for spacing
      // Data rows
      ['Inv. Date','Inv NO','Supplier', 'Net Amount'],
      ...this.PurchaseList.map(item => [
        this.loadDataService.loadDateYMD(item.InvoiceDate),
        item.InvoiceNo,
        item.SupplierName,
        item.PaidAmount,
      ]),
      [], // Empty row for spacing
      ['Total', '', '', paidAmount] // Footer row with totals
    ]);

    // Apply big font to the header row
    ws['!rows'] = [{ hpx: 80 }]; // Set row height to make text big

    // Create a new workbook
    const wb: XLSX.WorkBook = { Sheets: { 'data': ws }, SheetNames: ['data'] };

    // Change the font color of the header row to blue using ExcelJS
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('data');
    const headerRow = worksheet.getRow(1);
    headerRow.eachCell({ includeEmpty: true }, (cell, colNumber) => {
      cell.alignment = { vertical: 'middle', horizontal: 'center' };
    });

    // Convert the workbook to a buffer
    workbook.xlsx.writeBuffer().then((buffer: ArrayBuffer) => {
      // Convert buffer to Blob and save as Excel file
      const data: Blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8' });
      const fileName = this.fileName; // Change this to your desired file name
      XLSX.writeFile(wb, fileName);
      saveAs(data, fileName);
    });
  }

  setFileName() {
    const dateStr = this.loadDataService.loadDateYMD(this.exportDate); // Format date as yyyy-mm-dd
    this.fileName = `Pharmacy_Purchase_Report_${dateStr}.xlsx`;
  }
  @ViewChild('TABLE', { read: ElementRef }) table: ElementRef;


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
   staffLogin: StaffLoginModel = {} as StaffLoginModel;
  SupplierDetailList: any[];


  constructor(
    private service: AppService,
    private localService: LocalService,
    private loadDataService: LoadDataService,
    private loadData: LoadDataService,
    private router: Router,     
    private toastr: ToastrService,

  ) 
  { 
    this.setFileName();
  }

  ngOnInit(): void {
    this.staffLogin = this.localService.getEmployeeDetail();
    this.validiateMenu();
    this.opd.FromDate = this.loadDataService.loadDateYMD(new Date());
    this.opd.ToDate = this.loadDataService.loadDateYMD(new Date());
    this.getPurchaseList();
    this.getSupplierList();
    this.employeeDetail = this.localService.getEmployeeDetail();
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

  opd: any = {};
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

    var data = {
      FromDate: this.loadDataService.loadDateYMD(this.opd.FromDate),
      ToDate: this.loadDataService.loadDateYMD(this.opd.ToDate),
      SupplierId: this.Purchase.SupplierId
    }
      var obj: RequestModel = {
    request: this.localService.encrypt(JSON.stringify(data)).toString()
  };

    this.dataLoading = true;
    this.service.getPurchaseReport(obj).subscribe(r1 => {
      let response = r1 as any;
      if (response.Message == ConstantData.SuccessMessage) {
        this.PurchaseList = response.PurchaseReport;
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
      this.toastr.error("Error Occured while fetching data.");
      this.dataLoading = false;
    }));
  }

  SupplierList: any[] = [];
  getSupplierList() {
    this.dataLoading = true;
      var obj: RequestModel = {
    request: this.localService.encrypt(JSON.stringify({ })).toString()
  };
    this.service.getSupplierList(obj).subscribe(r1 => {
      let response = r1 as any;
      if (response.Message == ConstantData.SuccessMessage) {
        this.SupplierList = response.SupplierList;
      } else {
        this.toastr.error(response.Message);
      }
      this.dataLoading = false;
    }, (err => {
      this.toastr.error("Error Occured while fetching data.");
      this.dataLoading = false;
    }));
  }

  // afterSupplierSelected(selected: any) {
  //   this.Purchase.SupplierId = selected.SupplierId;
  //   this.Purchase.SupplierName = selected.SupplierName;
  //   this.Purchase.SearchSupplier = selected.SearchSupplier;
  // }

  // clearSupplier() {
  //   this.Purchase.SupplierId = null;
  //   this.Purchase.SupplierName = null;
  //   this.Purchase.SearchSupplier = null;
  // }

  PurchaseProductList: any[] = [];
  getPurchaseProductList(purchase: any) {
    this.dataLoading = true;
         var obj: RequestModel = {
    request: this.localService.encrypt(JSON.stringify(purchase)).toString()
  };
    this.service.getPurchaseProductList(obj).subscribe(r1 => {
      let response = r1 as any;
      if (response.Message == ConstantData.SuccessMessage) {
        this.PurchaseProductList = response.PurchaseProductList;
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
          this.getPurchaseList();
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

  filterSupplierList(value: any) {
    if (value) {
      const SupplierfilterValue = value.toLowerCase();
      this.SupplierDetailList = this.SupplierList.filter((option: any) =>
        option.SupplierName.toLowerCase().includes(SupplierfilterValue)
      );
    } else {
    }
  }

  afterSupplierSelected(event: any) {
    this.Purchase.SupplierId = event.option.id;
    this.Purchase.SupplierName = event.option.value;
    var selected = this.SupplierDetailList.find(
      (x: any) => x.PurchaseId == this.Purchase.PurchaseId
    );
   this.Purchase.SupplierId = selected.SupplierId;
    this.Purchase.SupplierName = selected.SupplierName;
    this.Purchase.SearchSupplier = selected.SearchSupplier;
  }

  clearSupplier() {
    this.SupplierDetailList = this.SupplierList;
       this.Purchase.SupplierId = null;
    this.Purchase.SupplierName = null;
    this.Purchase.SearchSupplier = null;
  }

}
