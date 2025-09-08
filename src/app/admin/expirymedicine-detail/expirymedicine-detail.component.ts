import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
declare var $: any;
import { AppService } from "../../utils/app.service";
import { ConstantData } from "../../utils/constant-data";
import { LocalService } from "../../utils/local.service";
import { LoadDataService } from '../../utils/load-data.service';
import { Status } from '../../utils/enum';
import { ActionModel, RequestModel, StaffLoginModel } from '../../utils/interface';
import { ToastrService } from 'ngx-toastr';


import * as XLSX from 'xlsx';
import * as ExcelJS from 'exceljs';
import { Router } from '@angular/router';

let saveAs: any;

import('file-saver').then(module => {
  saveAs = module.saveAs;
}).catch(error => {
  console.error('Failed to load file-saver:', error);
});

@Component({
  selector: 'app-expirymedicine-detail',
  templateUrl: './expirymedicine-detail.component.html',
  styleUrls: ['./expirymedicine-detail.component.css']
})
export class ExpirymedicineDetailComponent implements OnInit {

  exportDate = new Date();
  title = 'export-excel';
  fileName: string;


  setFileName() {
    const dateStr = this.loadData.loadDateYMD(this.exportDate); // Format date as yyyy-mm-dd
    this.fileName = `Expired_Medicine_Report_${dateStr}.xlsx`;
  }

  ExportTOExcel1() {
    // Calculate totals
    const availableQuantity = this.ExpiryMedicineList.reduce((acc, item) => acc + item.AvailableQuantity, 0);
    const mrp = this.ExpiryMedicineList.reduce((acc, item) => acc + item.MRP, 0);
    const costPrice = this.ExpiryMedicineList.reduce((acc, item) => acc + item.CostPrice, 0);

    // Create worksheet data
    const data = [
      [{ t: 's', s: { bold: true, fontSize: 24 }, v: 'SARVODAYA HOSPITAL EXPIRED MEDICINE REPORT' }],
      [],
      ['Expiry Date', 'Medicine', 'Batch No.', 'HSN Code', 'Unit', 'Manufacturer', 'Category', 'Qty.', 'MRP', 'C.P'],
      ...this.ExpiryMedicineList.map(item => [
        this.loadData.loadDateYMD(item.ExpiredDate),
        item.MedicineName,
        item.BatchNo,
        item.HSNCode,
        item.UnitName,
        item.ManufacturerName,
        item.CategoryName,
        item.AvailableQuantity,
        item.MRP,
        item.CostPrice,

      ]),
      [],
      ['Total', '', '', '', '', '', '', availableQuantity, mrp, costPrice] // Footer row with totals
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
  staffLogin: StaffLoginModel = {} as StaffLoginModel;
  StatusList = this.loadData.GetEnumList(Status);
  AllStatusList = Status;
  ExpiryMedicineList: any[];
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
    private router: Router,
    private loadData: LoadDataService,
         private toastr: ToastrService,

  ) {
    this.setFileName();
  }

  ngOnInit(): void {
    this.opd.FromDate = this.loadData.loadDateYMD(new Date());
    this.opd.ToDate = this.loadData.loadDateYMD(new Date());
    this.getExpiryMedicineList();
    this.staffLogin = this.localService.getEmployeeDetail();

  }

  @ViewChild('TABLE', { read: ElementRef }) table: ElementRef;

  onTableDataChange(p: any) {
    this.p = p;
  }

  sort(key: any) {
    this.sortKey = key;
    this.reverse = !this.reverse;
  }

  SaleTotal: any = {};
  PatientType: number = 0;
  getExpiryMedicineList() {
    var data = {
      FromDate: this.loadData.loadDateYMD(this.opd.FromDate),
      ToDate: this.loadData.loadDateYMD(this.opd.ToDate),
    }
    var obj: RequestModel = {
         request: this.localService.encrypt(JSON.stringify(data)).toString()
       }
    this.dataLoading = true;
    this.service.getExpiryMedicineList(obj).subscribe(r1 => {
      let response = r1 as any;
      if (response.Message == ConstantData.SuccessMessage) {
        this.ExpiryMedicineList = response.ExpiryMedicineList;
        this.SaleTotal.AvailableQuantity = 0;
        this.SaleTotal.MRP = 0;
        this.SaleTotal.CostPrice = 0;
        this.ExpiryMedicineList.forEach((e1: any) => {
          this.SaleTotal.AvailableQuantity += e1.AvailableQuantity;
          this.SaleTotal.MRP += e1.MRP;
          this.SaleTotal.CostPrice += e1.CostPrice;
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

}
