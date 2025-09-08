import { Component, OnInit } from '@angular/core';
declare var toastr: any;
declare var $: any;

import { AppService } from "../../utils/app.service";
import { ConstantData } from "../../utils/constant-data";
import { LocalService } from "../../utils/local.service";
import { LoadDataService } from '../../utils/load-data.service';
import { Status } from '../../utils/enum';
import { PaymentMode } from '../../utils/enum';
import { ActionModel ,RequestModel ,StaffLoginModel } from '../../utils/interface';
import { Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';


@Component({
  selector: 'app-medicine-sale-report',
  templateUrl: './medicine-sale-report.component.html',
  styleUrls: ['./medicine-sale-report.component.css']
})
export class MedicineSaleReportComponent implements OnInit {

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
  pageSize = ConstantData.PageSizes;
  itemPerPage: number = this.pageSize[0];
  PaymentModeList = this.loadData.GetEnumList(PaymentMode);
  action: ActionModel = {} as ActionModel;
   staffLogin: StaffLoginModel = {} as StaffLoginModel;
  filteredPatientList: any=[];
  PatientList: any=[];


  constructor(
    private service: AppService,
    private localService: LocalService,
    private loadDataService: LoadDataService,
    private loadData: LoadDataService,
      private router: Router,
     private toastr: ToastrService,
  ) { }

  ngOnInit(): void {
    this.staffLogin = this.localService.getEmployeeDetail();
    this.validiateMenu();
    this.getPatientList();
    this.opd.FromDate = this.loadDataService.loadDateYMD(new Date());
    this.opd.ToDate = this.loadDataService.loadDateYMD(new Date());
    this.getPaymentCollectionList();
    this.opd.PatientType = "0";
    this.opd.PaymentMode = "";
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
  //PatientType: number = 0;
  SaleTotal: any = {};
  getPaymentCollectionList() {
    this.SaleTotal.DiscountAmount = 0;
    this.SaleTotal.TotalAmount = 0;
    this.SaleTotal.CGSTAmount = 0;
    this.SaleTotal.SGSTAmount = 0;
    this.SaleTotal.IGSTAmount = 0;
    this.SaleTotal.PayableAmount = 0;
    this.SaleTotal.PaidAmount = 0;
    this.SaleTotal.DueAmount = 0;
    var data = {
      PatientId : this.opd.PatientId,
      FromDate: this.loadDataService.loadDateYMD(this.opd.FromDate),
      ToDate: this.loadDataService.loadDateYMD(this.opd.ToDate),
      PaymentMode: this.opd.PaymentMode
    }
    this.dataLoading = true;
      var obj: RequestModel = {
    request: this.localService.encrypt(JSON.stringify(data)).toString()
  };
    this.service.getPaymentMedicineCollectionReport(obj).subscribe(r1 => {
      let response = r1 as any;
      if (response.Message == ConstantData.SuccessMessage) {
        this.PaymentMedicineCollectionList = response.PaymentMedicineCollectionReport;
        this.PaymentMedicineCollectionList.forEach((e1: any) => {
          this.SaleTotal.DiscountAmount += e1.DiscountAmount;
          this.SaleTotal.TotalAmount += e1.TotalAmount;
          this.SaleTotal.CGSTAmount += e1.CGST;
          this.SaleTotal.SGSTAmount += e1.SGST;
          this.SaleTotal.IGSTAmount += e1.IGST;
          this.SaleTotal.PayableAmount += e1.PayableAmount;
          this.SaleTotal.PaidAmount += e1.PaidAmount;
          this.SaleTotal.DueAmount += e1.DueAmount;
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


  PaymentMedicineList: any[] = [];
  getPaymentMedicineList(Sale: any) {
    this.dataLoading = true;
        const obj: RequestModel = {
      request: this.localService.encrypt(JSON.stringify(Sale)).toString(),
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

   getPatientList() {
   
    const obj: RequestModel = {
      request: this.localService.encrypt(JSON.stringify({})).toString(),
    };
    this.dataLoading = true;
    this.service.getPatientList(obj).subscribe({
      next: (r1) => {
        let response = r1 as any;
        if (response.Message == ConstantData.SuccessMessage) {
          this.PatientList = response.PatientList;

        } else {
          this.toastr.error(response.Message);
        }
        this.dataLoading = false;
      },
      error: (err) => {
        console.error('API error:', err);
        this.toastr.error('Error while fetching records');
        this.dataLoading = false;
      },
    });
  }

  filterpatientList(value: string) {
    const filterValue = value?.toLowerCase() || '';

    this.filteredPatientList = this.PatientList.filter(
      (option: any) =>
        option.PatientName?.toLowerCase().includes(filterValue) ||
        option.UHID?.toLowerCase().includes(filterValue) ||
        option.ContactNo?.toLowerCase().includes(filterValue)
    );
    console.log(this.filteredPatientList);
    
  }

  afterPatientSelected(event: any) {
    const selectedName = event.option.value;

    const selected = this.PatientList.find(
      (x: any) => x.PatientName === selectedName
    );

    if (selected) {
      this.opd = { ...selected }; 
         this.opd.PatientId = selected.PatientID;
             this.opd.FromDate = this.loadDataService.loadDateYMD(new Date());
    this.opd.ToDate = this.loadDataService.loadDateYMD(new Date());
         
  }
  }

  clearPatient() {
    this.filteredPatientList = this.PatientList;
    // this.Patient.PackageCollectionId = null;
    this.opd.PatientName = '';
    
  }

  printReciept(obj: any) {
      this.service.printMedicineReciept(obj.PaymentCollectionId)
  }

}
