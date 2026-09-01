import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';

import { AppService } from '../../utils/app.service';
import { ConstantData } from '../../utils/constant-data';
import { LocalService } from '../../utils/local.service';
import { LoadDataService } from '../../utils/load-data.service';
import { Status } from '../../utils/enum';
import { RequestModel, StaffLoginModel } from '../../utils/interface';
import { ToastrService } from 'ngx-toastr';

import * as XLSX from 'xlsx';

@Component({
  selector: 'app-expirymedicine-detail',
  templateUrl: './expirymedicine-detail.component.html',
  styleUrls: ['./expirymedicine-detail.component.css'],
})
export class ExpirymedicineDetailComponent implements OnInit {
  @ViewChild('TABLE', { read: ElementRef })
  table!: ElementRef;

  // =========================================================
  // EXPORT
  // =========================================================

  exportDate: Date = new Date();

  title: string = 'export-excel';

  fileName: string = '';

  // =========================================================
  // FORM / FILTER
  // =========================================================

  opd: any = {
    FromDate: null,
    ToDate: null,
  };

  Sale: any = {};

  // =========================================================
  // LOGIN
  // =========================================================

  staffLogin: StaffLoginModel = {} as StaffLoginModel;

  // =========================================================
  // STATUS
  // =========================================================

  StatusList = this.loadData.GetEnumList(Status);

  AllStatusList = Status;

  // =========================================================
  // LIST
  // =========================================================

  ExpiryMedicineList: any[] = [];

  // =========================================================
  // TOTAL
  // =========================================================

  SaleTotal: any = {
    AvailableQuantity: 0,
    MRP: 0,
    CostPrice: 0,
  };

  // =========================================================
  // UI
  // =========================================================

  dataLoading: boolean = false;

  submitted: boolean = false;

  Search: string = '';

  reverse: boolean = false;

  sortKey: string = '';

  // =========================================================
  // PAGINATION
  // =========================================================

  p: number = 1;

  pageSize = ConstantData.PageSizes;

  itemPerPage: number = this.pageSize?.[0] || 10;

  // =========================================================
  // CONSTRUCTOR
  // =========================================================

  constructor(
    private service: AppService,
    private localService: LocalService,
    private loadData: LoadDataService,
    private toastr: ToastrService,
  ) {
    this.setFileName();
  }

  // =========================================================
  // INIT
  // =========================================================

  ngOnInit(): void {
    const today = new Date();

    const oneMonthLater = new Date();

    oneMonthLater.setMonth(today.getMonth() + 1);

    this.opd.FromDate = today;

    this.opd.ToDate = oneMonthLater;

    this.staffLogin = this.localService.getEmployeeDetail();

    // Always keep list initialized
    this.ExpiryMedicineList = [];

    this.resetTotals();

    this.getExpiryMedicineList();

    this.checkExpiringSoonAlert();
  }

  // =========================================================
  // FILE NAME
  // =========================================================

  setFileName(): void {
    const dateStr = this.loadData.loadDateYMD(this.exportDate);

    this.fileName = `Expiry_Medicine_Report_${dateStr}.xlsx`;
  }

  // =========================================================
  // RESET TOTAL
  // =========================================================

  resetTotals(): void {
    this.SaleTotal = {
      AvailableQuantity: 0,
      MRP: 0,
      CostPrice: 0,
    };
  }

  // =========================================================
  // PAGINATION
  // =========================================================

  onTableDataChange(page: number): void {
    this.p = page;
  }

  // =========================================================
  // SORT
  // =========================================================

  sort(key: string): void {
    if (!key) {
      return;
    }

    if (this.sortKey === key) {
      this.reverse = !this.reverse;
    } else {
      this.sortKey = key;

      this.reverse = false;
    }

    /*
     * We can safely sort here without depending
     * on a custom Angular sorting pipe.
     */

    if (!Array.isArray(this.ExpiryMedicineList)) {
      this.ExpiryMedicineList = [];
      return;
    }

    this.ExpiryMedicineList = [...this.ExpiryMedicineList].sort(
      (a: any, b: any) => {
        const aValue = a?.[key];

        const bValue = b?.[key];

        if (aValue === null || aValue === undefined) {
          return 1;
        }

        if (bValue === null || bValue === undefined) {
          return -1;
        }

        if (typeof aValue === 'string' && typeof bValue === 'string') {
          const result = aValue.localeCompare(bValue, undefined, {
            numeric: true,
            sensitivity: 'base',
          });

          return this.reverse ? -result : result;
        }

        if (aValue < bValue) {
          return this.reverse ? 1 : -1;
        }

        if (aValue > bValue) {
          return this.reverse ? -1 : 1;
        }

        return 0;
      },
    );

    /*
     * After changing the data order,
     * return pagination to page 1.
     */
    this.p = 1;
  }

  // =========================================================
  // GET EXPIRY MEDICINE LIST
  // =========================================================

  getExpiryMedicineList(): void {
    /*
     * Make sure dates exist before sending request.
     */

    if (!this.opd || !this.opd.FromDate || !this.opd.ToDate) {
      this.toastr.error('Please select From Date and To Date.');

      return;
    }

    const data = {
      FromDate: this.loadData.loadDateYMD(this.opd.FromDate),

      ToDate: this.loadData.loadDateYMD(this.opd.ToDate),
    };

    const obj: RequestModel = {
      request: this.localService.encrypt(JSON.stringify(data)).toString(),
    };

    this.dataLoading = true;

    this.service.getExpiryMedicineList(obj).subscribe({
      next: (r1: any) => {
        const response = r1 as any;

        if (response && response.Message === ConstantData.SuccessMessage) {
          /*
           * VERY IMPORTANT:
           * Always force array.
           */

          this.ExpiryMedicineList = Array.isArray(response.ExpiryMedicineList)
            ? response.ExpiryMedicineList
            : [];

          this.calculateTotals();
        } else {
          this.ExpiryMedicineList = [];

          this.resetTotals();

          this.toastr.error(
            response?.Message || 'Unable to fetch expiry medicine list.',
          );
        }

        this.dataLoading = false;
      },

      error: (err: any) => {
        console.error('Expiry Medicine API Error:', err);

        this.ExpiryMedicineList = [];

        this.resetTotals();

        this.dataLoading = false;

        this.toastr.error(
          'Error occurred while fetching expiry medicine data.',
        );
      },
    });
  }

  // =========================================================
  // CALCULATE TOTAL
  // =========================================================

  calculateTotals(): void {
    /*
     * Safety check
     */

    if (!Array.isArray(this.ExpiryMedicineList)) {
      this.ExpiryMedicineList = [];
    }

    this.SaleTotal = {
      AvailableQuantity: 0,

      MRP: 0,

      CostPrice: 0,
    };

    this.ExpiryMedicineList.forEach((item: any) => {
      this.SaleTotal.AvailableQuantity += Number(item?.AvailableQuantity) || 0;

      this.SaleTotal.MRP += Number(item?.MRP) || 0;

      this.SaleTotal.CostPrice += Number(item?.CostPrice) || 0;
    });
  }

  // =========================================================
  // EXPIRING SOON ALERT
  // =========================================================

  checkExpiringSoonAlert(): void {
    const today = new Date();

    const oneMonthLater = new Date();

    oneMonthLater.setMonth(today.getMonth() + 1);

    const data = {
      FromDate: this.loadData.loadDateYMD(today),

      ToDate: this.loadData.loadDateYMD(oneMonthLater),
    };

    const obj: RequestModel = {
      request: this.localService.encrypt(JSON.stringify(data)).toString(),
    };

   
  }

  // =========================================================
  // EXPORT TO EXCEL
  // =========================================================

  ExportTOExcel1(): void {
    if (!Array.isArray(this.ExpiryMedicineList)) {
      this.ExpiryMedicineList = [];
    }

    const availableQuantity = this.ExpiryMedicineList.reduce(
      (acc: number, item: any) => acc + (Number(item?.AvailableQuantity) || 0),
      0,
    );

    const mrp = this.ExpiryMedicineList.reduce(
      (acc: number, item: any) => acc + (Number(item?.MRP) || 0),
      0,
    );

    const costPrice = this.ExpiryMedicineList.reduce(
      (acc: number, item: any) => acc + (Number(item?.CostPrice) || 0),
      0,
    );

    const data: any[][] = [
      ['MAMTA MURTI NETRALAYA EXPIRY MEDICINE REPORT'],

      [],

      [
        'Expiry Date',
        'Medicine',
        'Batch No.',
        'HSN Code',
        'Unit',
        'Manufacturer',
        'Category',
        'Qty.',
        'MRP',
        'C.P',
      ],

      ...this.ExpiryMedicineList.map((item: any) => [
        item?.ExpiredDate ? this.loadData.loadDateYMD(item.ExpiredDate) : '',

        item?.MedicineName || '',

        item?.BatchNo || '',

        item?.HSNCode || '',

        item?.UnitName || '',

        item?.ManufacturerName || '',

        item?.CategoryName || '',

        Number(item?.AvailableQuantity) || 0,

        Number(item?.MRP) || 0,

        Number(item?.CostPrice) || 0,
      ]),

      [],

      ['Total', '', '', '', '', '', '', availableQuantity, mrp, costPrice],
    ];

    const worksheet: XLSX.WorkSheet = XLSX.utils.aoa_to_sheet(data);

    const workbook: XLSX.WorkBook = XLSX.utils.book_new();

    XLSX.utils.book_append_sheet(workbook, worksheet, 'Expiry Medicine');

    /*
     * Column widths
     */

    worksheet['!cols'] = [
      { wch: 15 },
      { wch: 25 },
      { wch: 15 },
      { wch: 15 },
      { wch: 12 },
      { wch: 25 },
      { wch: 20 },
      { wch: 12 },
      { wch: 15 },
      { wch: 15 },
    ];

    /*
     * Merge title
     */

    worksheet['!merges'] = [
      {
        s: { r: 0, c: 0 },
        e: { r: 0, c: 9 },
      },
    ];

    if (!this.fileName) {
      this.setFileName();
    }

    try {
      XLSX.writeFile(workbook, this.fileName);
    } catch (error) {
      console.error('Error writing Excel file:', error);

      this.toastr.error('Unable to export Excel file.');
    }
  }
}
