import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
declare var toastr: any;
declare var $: any;
import { NgForm } from "@angular/forms";
import { AppService } from "../../utils/app.service";
import { ConstantData } from "../../utils/constant-data";
import { LocalService } from "../../utils/local.service";
import { Status } from '../../utils/enum';
import { Router } from '@angular/router';
import { ActionModel, StaffLoginModel, RequestModel } from '../../utils/interface';
import { LoadDataService } from '../../utils/load-data.service';
import { ToastrService } from 'ngx-toastr';



import * as XLSX from 'xlsx';
import * as ExcelJS from 'exceljs';

let saveAs: any;

import('file-saver').then(module => {
  saveAs = module.saveAs;
}).catch(error => {
  console.error('Failed to load file-saver:', error);
});


@Component({
  selector: 'app-medicine-stock-list',
  templateUrl: './medicine-stock-list.component.html',
  styleUrls: ['./medicine-stock-list.component.css']
})
export class MedicineStockListComponent implements OnInit {
  exportDate = new Date();
  title = 'export-excel';
  fileName: string;


  ExportTOExcel1() {
    // Calculate totals
    const finalAmount = this.MedicineStockList.reduce((acc, item) => acc + item.FinalAmount, 0);
    const finalCP = this.MedicineStockList.reduce((acc, item) => acc + item.FinalCP, 0);

    const ws: XLSX.WorkSheet = XLSX.utils.aoa_to_sheet([
      [{ t: 's', s: { bold: true, sz: 24 }, v: 'MJM MULTISPECIALITY HOSPITAL PHARMACY STOCK REPORT' }], // Header row with big font
      [], // Empty row for spacing
      // Data rows
      ['Medicine','HSN','Batch', 'Exp. Date','MRP','C.P','Available Stock(In Pcs)','Unit','Total MRP','Total C.P'],
      ...this.MedicineStockList.map(item => [
        item.Name,
        item.HSNCode,
        item.BatchNo,
        this.loadData.loadDateYMD(item.ExpiredDate),
        item.MRP,
        item.CostPrice,
        item.AvailableQuantity,
        item.UnitName,
        item.FinalAmount,
        item.FinalCP,
      ]),
      [], // Empty row for spacing
      ['Total', '', '', '', '', '', '', '', finalAmount,finalCP] // Footer row with totals
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
    const dateStr = this.loadData.loadDateYMD(this.exportDate); // Format date as yyyy-mm-dd
    this.fileName = `Pharmacy_Stock_Report_${dateStr}.xlsx`;
  }
  @ViewChild('TABLE', { read: ElementRef }) table: ElementRef;


  MedicineStock: any = {};
  StatusList = this.loadData.GetEnumList(Status);
  AllStatusList = Status;
  MedicineStockList: any[];
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
    this.getMedicineStockList();
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


  editMedicineStock(obj: any) {
    this.MedicineStock = obj;
  }

  onTableDataChange(p: any) {
    this.p = p;
  }

  sort(key: any) {
    this.sortKey = key;
    this.reverse = !this.reverse;
  }

  Total: any = {};
  getMedicineStockList() {
    this.Total.FinalAmount = 0;
    this.Total.FinalCP = 0;
    this.dataLoading = true;
      var obj: RequestModel = {
    request: this.localService.encrypt(JSON.stringify({ })).toString()
  };
    this.service.getMedicineStockList(obj).subscribe(r1 => {
      let response = r1 as any;
      if (response.Message == ConstantData.SuccessMessage) {
        this.MedicineStockList = response.MedicineStockList;
        for (let index = 0; index < this.MedicineStockList.length; index++) {
          const element = this.MedicineStockList[index];
          this.Total.FinalAmount += element.FinalAmount;
          this.Total.FinalCP += element.FinalCP;

        }
        this.Total.FinalAmount = this.loadData.round(this.Total.FinalAmount, 2);
        this.Total.FinalCP = this.loadData.round(this.Total.FinalCP, 2);
      } else {
        this.toastr.error(response.Message);
      }
      this.dataLoading = false;
    }, (err => {
      this.toastr.error("Error Occured while fetching data.");
      this.dataLoading = false;
    }));
  }

  resetForm(form?: NgForm) {
    this.Head = {};
    this.submitted = false;
  }

  Head: any = {};
  editStock(obj: any) {
    this.Head = obj;
    this.Head.ExpiredDate = this.loadData.loadDateYMD(obj.ExpiredDate);
    this.Head.ManufacturedDate = this.loadData.loadDateYMD(obj.ManufacturedDate);
    $('#modal_popUp').modal('show');
  }

  EditMedicineStock(form: NgForm) {
    this.submitted = true;
    if (form.invalid) {
      this.toastr.warning("Fill all the Required Fields.", "Invailid Form")
      this.dataLoading = false;
      return;
    }
    this.Head.UpdatedBy = this.staffLogin.StaffId;
    var obj: RequestModel = {
         request: this.localService.encrypt(JSON.stringify(this.Head)).toString()
       }

    this.dataLoading = true;
    this.service.EditMedicineStock(obj).subscribe(r1 => {
      let response = r1 as any;
      if (response.Message == ConstantData.SuccessMessage) {
        this.toastr.success("One record created successfully.", "Operation Success");
        this.resetForm();

        $('#modal_popUp').modal('hide');
        this.getMedicineStockList();
      } else {
        this.toastr.error(response.Message);
        this.dataLoading = false;
      }
    }, (err => {
      this.toastr.error("Error Occured while fetching data.");
      this.dataLoading = false;
    }));
  }

}

