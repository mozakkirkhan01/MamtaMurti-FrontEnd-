import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
declare var toastr: any;
declare var $: any;

import { AppService } from "../../utils/app.service";
import { ConstantData } from "../../utils/constant-data";
import { LocalService } from "../../utils/local.service";
import { LoadDataService } from '../../utils/load-data.service';
import { Status } from '../../utils/enum';
import { ToastrService } from 'ngx-toastr';
import { ActionModel ,RequestModel ,StaffLoginModel } from '../../utils/interface';

import * as XLSX from 'xlsx';
import * as ExcelJS from 'exceljs';
import { Router } from '@angular/router';
import { query } from '@angular/animations';

let saveAs: any;

import('file-saver').then(module => {
  saveAs = module.saveAs;
}).catch(error => {
  console.error('Failed to load file-saver:', error);
});

@Component({
  selector: 'app-medicine-sale-list',
  templateUrl: './medicine-sale-list.component.html',
  styleUrls: ['./medicine-sale-list.component.css']
})
export class MedicineSaleListComponent implements OnInit {

  exportDate = new Date();
  title = 'export-excel';
  fileName: string;


  setFileName() {
    const dateStr = this.loadData.loadDateYMD(this.exportDate); // Format date as yyyy-mm-dd
    this.fileName = `Pharmacy_Report_${dateStr}.xlsx`;
  }

  ExportTOExcel1() {
    // Calculate totals
    const discountAmount = this.PaymentMedicineCollectionList.reduce((acc, item) => acc + item.DiscountAmount, 0);
    const totalAmount = this.PaymentMedicineCollectionList.reduce((acc, item) => acc + item.TotalAmount, 0);
    const cGST = this.PaymentMedicineCollectionList.reduce((acc, item) => acc + item.CGST, 0);
    const sGST = this.PaymentMedicineCollectionList.reduce((acc, item) => acc + item.SGST, 0);
    const iGST = this.PaymentMedicineCollectionList.reduce((acc, item) => acc + item.IGST, 0);
    const payableAmount = this.PaymentMedicineCollectionList.reduce((acc, item) => acc + item.PayableAmount, 0);
    const paidAmount = this.PaymentMedicineCollectionList.reduce((acc, item) => acc + item.PaidAmount, 0);
    const dueAmount = this.PaymentMedicineCollectionList.reduce((acc, item) => acc + item.DueAmount, 0);

    // Create worksheet data
    const data = [
      [{ t: 's', s: { bold: true, fontSize: 24 }, v: 'MJM MULTISPECIALITY HOSPITAL PHARMACY REPORT' }],
      [],
      ['BillDate', 'ReceiptNo', 'PatientName', 'Disc.Amt.', 'Taxable Amount', 'CGST', 'SGST', 'IGST', 'PayableAmount', 'PaidAmount', 'DueAmount'],
      ...this.PaymentMedicineCollectionList.map(item => [
        this.loadData.loadDateYMD(item.PaymentDate),
        item.ReceiptNo,
        item.PatientName,
        item.DiscountAmount,
        item.TotalAmount,
        item.CGST,
        item.SGST,
        item.IGST,
        item.PayableAmount,
        item.PaidAmount,
        item.DueAmount,
      ]),
      [],
      ['Total', '', '', discountAmount, totalAmount, cGST, sGST, iGST, payableAmount, paidAmount, dueAmount, '']
    ];

    // Convert data to a worksheet using XLSX utils
    const worksheet: XLSX.WorkSheet = XLSX.utils.aoa_to_sheet(data);

    // Create a new workbook using XLSX
    const workbook: XLSX.WorkBook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'data');

    // Ensure the file name is valid
    if (!this.fileName) {
      console.error('File name is not defined');
      return;
    }

    // Write the workbook to a file
    try {
      XLSX.writeFile(workbook, this.fileName);
    } catch (error) {
      console.error('Error writing the file:', error);
    }
  }

  opd: any = {};
  Sale: any = {};
  employeeDetail: any;
  StatusList = this.loadData.GetEnumList(Status);
  AllStatusList = Status;
  PaymentMedicineCollectionList: any[];
  dataLoading: boolean = false;
  submitted: boolean;
  Search: string;
  reverse: boolean;
  sortKey: string;
  p: number = 1;
  action: ActionModel = {} as ActionModel;
  pageSize = ConstantData.PageSizes;
   staffLogin: StaffLoginModel = {} as StaffLoginModel;
  itemPerPage: number = this.pageSize[0];


  constructor(
    private service: AppService,
    private localService: LocalService,
    private router: Router,
    private loadData: LoadDataService,
     private toastr: ToastrService,

  ) {
    this.setFileName();
  }

  ngOnInit(): void {
    this.staffLogin = this.localService.getEmployeeDetail();
    this.validiateMenu();
    this.opd.FromDate = this.loadData.loadDateYMD(new Date());
    this.opd.ToDate = this.loadData.loadDateYMD(new Date());
    this.opd.PatientType = 0;
    this.getPaymentCollectionList();
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

  @ViewChild('TABLE', { read: ElementRef }) table: ElementRef;
  editSale(obj: any) {
    //this.Sale = obj;
    this.router.navigate(['/admin/patient-medicine-sale'],
      {
        queryParams: {
          id: obj.OPDPatientId,
          pid: obj.PaymentCollectionId,
          did: obj.PaymentMedicineId,
          redUrl: '/admin/patient-medicine-sale-list'
        }
        
      });
      console.log(obj);
  }

  onTableDataChange(p: any) {
    this.p = p;
  }

  sort(key: any) {
    this.sortKey = key;
    this.reverse = !this.reverse;
  }

  SaleTotal: any = {};
  //PatientType: number = 0;
  getPaymentCollectionList() {
    var data = {
      FromDate: this.loadData.loadDateYMD(this.opd.FromDate),
      ToDate: this.loadData.loadDateYMD(this.opd.ToDate),
    }
      var obj: RequestModel = {
    request: this.localService.encrypt(JSON.stringify(data)).toString()
  };
    this.dataLoading = true;
    this.service.getPaymentMedicineCollectionList(obj).subscribe(r1 => {
      let response = r1 as any;
      if (response.Message == ConstantData.SuccessMessage) {
        this.PaymentMedicineCollectionList = response.PaymentMedicineCollectionList;
        this.SaleTotal.DiscountAmount = 0;
        this.SaleTotal.TotalAmount = 0;
        this.SaleTotal.CGSTAmount = 0;
        this.SaleTotal.SGSTAmount = 0;
        this.SaleTotal.IGSTAmount = 0;
        this.SaleTotal.PayableAmount = 0;
        this.SaleTotal.PaidAmount = 0;
        this.SaleTotal.DueAmount = 0;
        this.PaymentMedicineCollectionList.forEach((e1: any) => {
          this.SaleTotal.DiscountAmount += e1.DiscountAmount;
          this.SaleTotal.TotalAmount += e1.TotalAmount;
          this.SaleTotal.CGSTAmount += e1.CGSTAmount;
          this.SaleTotal.SGSTAmount += e1.SGSTAmount;
          this.SaleTotal.IGSTAmount += e1.IGSTAmount;
          this.SaleTotal.PayableAmount += e1.PayableAmount;
          this.SaleTotal.PaidAmount += e1.PaidAmount;
          this.SaleTotal.DueAmount += e1.DueAmount;
        });
      } else {
        toastr.error(response.Message);
      }
      this.dataLoading = false;
    }, (err => {
      toastr.error("Error Occured while fetching data.");
      this.dataLoading = false;
    }));
  }


  PaymentMedicineList: any[] = [];
  getPaymentMedicineList(Sale: any) {
    this.dataLoading = true;
          var obj: RequestModel = {
    request: this.localService.encrypt(JSON.stringify(Sale)).toString()
  };
    this.service.getPaymentMedicineList(obj).subscribe(r1 => {
      let response = r1 as any;
      if (response.Message == ConstantData.SuccessMessage) {
        this.PaymentMedicineList = response.PaymentMedicineList;
        
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

  printReciept(obj: any) {
      this.service.printMedicineReciept(obj.PaymentCollectionId)
  }
  // deleteSale(obj: any) {
  //   if (confirm("Are you sure want to delete this record") == true) {
  //     this.dataLoading = true;
  //     this.service.deleteSale(obj).subscribe(r1 => {
  //       let response = r1 as any;
  //       if (response.Message == ConstantData.SuccessMessage) {
  //         toastr.success("One record deleted successfully.");
  //         this.getPaymentCollectionList();
  //       } else {
  //         toastr.error(response.Message);
  //       }
  //       this.dataLoading = false;
  //     }, (err => {
  //       toastr.error("Error Occured while fetching data.");
  //       this.dataLoading = false;
  //     }));
  //   }
  // }

}

