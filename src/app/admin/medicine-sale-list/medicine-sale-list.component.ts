import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';

declare var $: any;

import { AppService } from '../../utils/app.service';
import { ConstantData } from '../../utils/constant-data';
import { LocalService } from '../../utils/local.service';
import { LoadDataService } from '../../utils/load-data.service';

import { BillStatus, PaymentMode, Status } from '../../utils/enum';
import { ToastrService } from 'ngx-toastr';

import {
  ActionModel,
  RequestModel,
  StaffLoginModel
} from '../../utils/interface';

import * as XLSX from 'xlsx';
import { Router } from '@angular/router';


@Component({
  selector: 'app-medicine-sale-list',
  templateUrl: './medicine-sale-list.component.html',
  styleUrls: ['./medicine-sale-list.component.css']
})
export class MedicineSaleListComponent implements OnInit {

  // ==========================================
  // EXCEL EXPORT
  // ==========================================

  exportDate = new Date();
  title = 'export-excel';
  fileName: string = '';

  setFileName() {

    const dateStr = this.loadData.loadDateYMD(this.exportDate);

    this.fileName = `Pharmacy_Report_${dateStr}.xlsx`;
  }


  ExportTOExcel1() {

    if (
      !this.PaymentMedicineCollectionList ||
      this.PaymentMedicineCollectionList.length === 0
    ) {
      this.toastr.warning('No data available to export.');
      return;
    }

    const discountAmount =
      this.PaymentMedicineCollectionList.reduce(
        (acc, item) => acc + (+item.DiscountAmount || 0),
        0
      );

    const totalAmount =
      this.PaymentMedicineCollectionList.reduce(
        (acc, item) => acc + (+item.TotalAmount || 0),
        0
      );

    const cGST =
      this.PaymentMedicineCollectionList.reduce(
        (acc, item) => acc + (+item.CGST || 0),
        0
      );

    const sGST =
      this.PaymentMedicineCollectionList.reduce(
        (acc, item) => acc + (+item.SGST || 0),
        0
      );

    const iGST =
      this.PaymentMedicineCollectionList.reduce(
        (acc, item) => acc + (+item.IGST || 0),
        0
      );

    const payableAmount =
      this.PaymentMedicineCollectionList.reduce(
        (acc, item) => acc + (+item.PayableAmount || 0),
        0
      );

    const paidAmount =
      this.PaymentMedicineCollectionList.reduce(
        (acc, item) => acc + (+item.PaidAmount || 0),
        0
      );

    const dueAmount =
      this.PaymentMedicineCollectionList.reduce(
        (acc, item) => acc + (+item.DueAmount || 0),
        0
      );


    const data: any[][] = [

      [
        'MAMTA MURTI NATRALAYA PHARMACY REPORT'
      ],

      [],

      [
        'Bill Date',
        'Receipt No',
        'Patient Name',
        'Discount Amount',
        'Taxable Amount',
        'CGST',
        'SGST',
        'IGST',
        'Payable Amount',
        'Paid Amount',
        'Due Amount'
      ],

      ...this.PaymentMedicineCollectionList.map(item => [

        this.loadData.loadDateYMD(item.PaymentDate),

        item.ReceiptNo,

        item.PatientName,

        item.DiscountAmount || 0,

        item.TotalAmount || 0,

        item.CGST || 0,

        item.SGST || 0,

        item.IGST || 0,

        item.PayableAmount || 0,

        item.PaidAmount || 0,

        item.DueAmount || 0

      ]),

      [],

      [

        'TOTAL',

        '',

        '',

        discountAmount,

        totalAmount,

        cGST,

        sGST,

        iGST,

        payableAmount,

        paidAmount,

        dueAmount

      ]

    ];


    const worksheet: XLSX.WorkSheet =
      XLSX.utils.aoa_to_sheet(data);


    worksheet['!cols'] = [

      { wch: 15 },
      { wch: 15 },
      { wch: 30 },
      { wch: 18 },
      { wch: 18 },
      { wch: 12 },
      { wch: 12 },
      { wch: 12 },
      { wch: 18 },
      { wch: 18 },
      { wch: 18 }

    ];


    const workbook: XLSX.WorkBook =
      XLSX.utils.book_new();


    XLSX.utils.book_append_sheet(
      workbook,
      worksheet,
      'Pharmacy Report'
    );


    if (!this.fileName) {

      this.setFileName();

    }


    try {

      XLSX.writeFile(
        workbook,
        this.fileName
      );

      this.toastr.success(
        'Excel file exported successfully.'
      );

    } catch (error) {

      console.error(
        'Error writing Excel file:',
        error
      );

      this.toastr.error(
        'Error exporting Excel file.'
      );

    }

  }


  // ==========================================
  // VARIABLES
  // ==========================================

  opd: any = {};

  Sale: any = {};

  employeeDetail: any;

  StatusList =
    this.loadData.GetEnumList(Status);

  AllStatusList =
    BillStatus;

  PaymentMode =
    this.loadData.GetEnumList(PaymentMode);

  AllPaymentMode =
    PaymentMode;


  PaymentMedicineCollectionList: any[] = [];

  PaymentMedicineList: any[] = [];

  PaymentMedicineListPaymentList: any[] = [];


  SaleTotal: any = {


    DiscountAmount: 0,

    TotalAmount: 0,

    CGSTAmount: 0,

    SGSTAmount: 0,

    IGSTAmount: 0,

    PayableAmount: 0,

    PaidAmount: 0,

    DueAmount: 0

  };


  dataLoading: boolean = false;

  submitted: boolean = false;

  Search: string = '';

  reverse: boolean = true;

  sortKey: string = 'ReceiptNo';

  p: number = 1;

  action: ActionModel =
    {} as ActionModel;

  pageSize =
    ConstantData.PageSizes;

  staffLogin: StaffLoginModel =
    {} as StaffLoginModel;

  itemPerPage: number =
    this.pageSize[0];


  // ==========================================
  // CONSTRUCTOR
  // ==========================================

  constructor(

    private service: AppService,

    private localService: LocalService,

    private router: Router,

    private loadData: LoadDataService,

    private toastr: ToastrService

  ) {

    this.setFileName();

  }


  // ==========================================
  // INIT
  // ==========================================

  ngOnInit(): void {

    this.staffLogin =
      this.localService.getEmployeeDetail();

    this.validiateMenu();


    this.opd.FromDate =
      this.loadData.loadDateYMD(
        new Date()
      );


    this.opd.ToDate =
      this.loadData.loadDateYMD(
        new Date()
      );


    this.opd.PatientType = 0;


    this.getPaymentCollectionList();

  }


  // ==========================================
  // MENU VALIDATION
  // ==========================================

  validiateMenu() {

    const obj: RequestModel = {

      request:
        this.localService
          .encrypt(
            JSON.stringify({

              Url:
                this.router.url,

              StaffLoginId:
                this.staffLogin.StaffLoginId

            })
          )
          .toString()

    };


    this.dataLoading = true;


    this.service
      .validiateMenu(obj)
      .subscribe(

        (response: any) => {

          this.action =
            this.loadData.validiateMenu(

              response,

              this.toastr,

              this.router

            );


          this.dataLoading = false;

        },

        (err) => {

          console.error(err);

          this.toastr.error(
            'Error while fetching records'
          );

          this.dataLoading = false;

        }

      );

  }


  // ==========================================
  // TABLE REFERENCE
  // ==========================================

  @ViewChild('TABLE', {
    read: ElementRef
  })
  table!: ElementRef;


  // ==========================================
  // EDIT SALE
  // ==========================================

  editSale(obj: any) {

    this.router.navigate(

      [
        '/admin/patient-medicine-sale'
      ],

      {

        queryParams: {

          id:
            obj.OPDPatientId,

          pid:
            obj.PaymentCollectionId,

          did:
            obj.PaymentMedicineId,

          redUrl:
            '/admin/patient-medicine-sale-list'

        }

      }

    );

  }


  // ==========================================
  // PAGINATION
  // ==========================================

  onTableDataChange(
    page: number
  ) {

    this.p = page;

  }


  // ==========================================
  // RECEIPT NUMBER SORTING
  // ==========================================

  sortReceiptNo() {

    if (
      this.sortKey === 'ReceiptNo'
    ) {

      this.reverse =
        !this.reverse;

    } else {

      this.sortKey =
        'ReceiptNo';

      this.reverse =
        true;

    }


    this.sortReceiptNumberList();

  }


  sortReceiptNumberList() {

    if (
      !this.PaymentMedicineCollectionList
    ) {
      return;
    }


    this.PaymentMedicineCollectionList.sort(

      (
        a: any,
        b: any
      ) => {

        const receiptA =
          this.getReceiptNumberValue(
            a.ReceiptNo
          );

        const receiptB =
          this.getReceiptNumberValue(
            b.ReceiptNo
          );


        if (
          this.reverse
        ) {

          return (
            receiptB -
            receiptA
          );

        } else {

          return (
            receiptA -
            receiptB
          );

        }

      }

    );

  }


  getReceiptNumberValue(
    receiptNo: any
  ): number {

    if (
      receiptNo === null ||
      receiptNo === undefined ||
      receiptNo === ''
    ) {

      return 0;

    }


    // Handles:
    // 1
    // 0001
    // REC-001
    // PH-00025

    const match =
      String(receiptNo)
        .match(/\d+/g);


    if (
      !match ||
      match.length === 0
    ) {

      return 0;

    }


    return Number(
      match[
        match.length - 1
      ]
    ) || 0;

  }


  // ==========================================
  // GET PAYMENT COLLECTION LIST
  // ==========================================

  getPaymentCollectionList() {

    const data = {

      FromDate:
        this.loadData.loadDateYMD(
          this.opd.FromDate
        ),

      ToDate:
        this.loadData.loadDateYMD(
          this.opd.ToDate
        )

    };


    const obj: RequestModel = {

      request:
        this.localService
          .encrypt(
            JSON.stringify(data)
          )
          .toString()

    };


    this.dataLoading = true;


    this.service
      .getPaymentMedicineCollectionList(
        obj
      )
      .subscribe({

        next: (r1) => {

          const response =
            r1 as any;


          if (
            response.Message ===
            ConstantData.SuccessMessage
          ) {


            this.PaymentMedicineCollectionList =
              response.PaymentMedicineCollectionList || [];


            // Default sorting:
            // Latest / Highest Receipt Number First

            this.sortKey =
              'ReceiptNo';

            this.reverse =
              true;


            this.sortReceiptNumberList();


            // Reset totals

            this.SaleTotal = {

              DiscountAmount: 0,

              TotalAmount: 0,

              CGSTAmount: 0,

              SGSTAmount: 0,

              IGSTAmount: 0,

              PayableAmount: 0,

              PaidAmount: 0,

              DueAmount: 0

            };


            // Calculate totals

            this.PaymentMedicineCollectionList
              .forEach(

                (e1: any) => {

                  this.SaleTotal.DiscountAmount +=
                    Number(
                      e1.DiscountAmount
                    ) || 0;


                  this.SaleTotal.TotalAmount +=
                    Number(
                      e1.TotalAmount
                    ) || 0;


                  this.SaleTotal.CGSTAmount +=
                    Number(
                      e1.CGST
                    ) || 0;


                  this.SaleTotal.SGSTAmount +=
                    Number(
                      e1.SGST
                    ) || 0;


                  this.SaleTotal.IGSTAmount +=
                    Number(
                      e1.IGST
                    ) || 0;


                  this.SaleTotal.PayableAmount +=
                    Number(
                      e1.PayableAmount
                    ) || 0;


                  this.SaleTotal.PaidAmount +=
                    Number(
                      e1.PaidAmount
                    ) || 0;


                  this.SaleTotal.DueAmount +=
                    Number(
                      e1.DueAmount
                    ) || 0;

                }

              );


          } else {

            this.PaymentMedicineCollectionList = [];

            this.toastr.error(
              response.Message
            );

          }


          this.dataLoading =
            false;

        },


        error: (
          err
        ) => {

          console.error(err);


          this.PaymentMedicineCollectionList =
            [];


          this.toastr.error(
            'Error occurred while fetching data.'
          );


          this.dataLoading =
            false;

        }

      });

  }


  // ==========================================
  // SALE DETAILS
  // ==========================================

  getPaymentMedicineList(
    Sale: any
  ) {

    this.dataLoading =
      true;


    const obj: RequestModel = {

      request:
        this.localService
          .encrypt(
            JSON.stringify(Sale)
          )
          .toString()

    };


    this.service
      .getPaymentMedicineList(
        obj
      )
      .subscribe(

        (r1) => {

          const response =
            r1 as any;


          if (
            response.Message ===
            ConstantData.SuccessMessage
          ) {

            this.PaymentMedicineList =
              response.PaymentMedicineList || [];


            this.PaymentMedicineListPaymentList =
              response.PaymentMedicineListPaymentList || [];


            $('#modal_popUp')
              .modal('show');


          } else {

            this.toastr.error(
              response.Message
            );

          }


          this.dataLoading =
            false;

        },


        (err) => {

          console.error(err);


          this.toastr.error(
            'Error Occurred while fetching data.'
          );


          this.dataLoading =
            false;

        }

      );

  }


  // ==========================================
  // PRINT RECEIPT
  // ==========================================

  printReciept(
    obj: any
  ) {

    this.service
      .printMedicineReciept(
        obj.PaymentCollectionId
      );

  }


  // ==========================================
  // PAYMENT MODE
  // ==========================================

  getPaymentModes(
    modes: any[]
  ): string {

    if (
      !modes ||
      modes.length === 0
    ) {

      return '';

    }


    return modes
      .map(

        m =>
          this.AllPaymentMode[m]

      )
      .join(', ');

  }


  // ==========================================
  // PAYMENT REMARKS
  // ==========================================

  getPaymentDetailRemarks(
    remarks: string[]
  ): string {

    if (
      !remarks ||
      remarks.length === 0
    ) {

      return '';

    }


    return remarks.join(
      ', '
    );

  }

}