import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { Router } from '@angular/router';
import { NgForm } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';

declare var toastr: any;
declare var $: any;

import { AppService } from '../../utils/app.service';
import { ConstantData } from '../../utils/constant-data';
import { LocalService } from '../../utils/local.service';
import { LoadDataService } from '../../utils/load-data.service';
import {
  ActionModel,
  StaffLoginModel,
  RequestModel,
} from '../../utils/interface';

@Component({
  selector: 'app-medicine-return',
  templateUrl: './medicine-return.component.html',
  styleUrls: ['./medicine-return.component.css'],
})
export class MedicineReturnComponent implements OnInit {
  dataLoading: boolean = false;
  MedicineBillList: any[];
  BillDetailList: any[];
  Search: string;
  reverse: boolean;
  sortKey: string;
  p: number = 1;
  pageSize = ConstantData.PageSizes;
  itemPerPage: number = this.pageSize[0];
  //SellProduct: any = {};
  Return: any = {};
  submitted: boolean;
  returnItem: any = {};
  employeeDetail: any;
  ReturnList: any[] = [];
  action: ActionModel = {} as ActionModel;
  staffLogin: StaffLoginModel = {} as StaffLoginModel;

  constructor(
    private service: AppService,
    private localService: LocalService,
    private router: Router,
    private loadDataService: LoadDataService,
         private toastr: ToastrService,

  ) {}

  ngOnInit(): void {
    this.staffLogin = this.localService.getEmployeeDetail();
    this.validiateMenu();
    this.getEmployeeList();
    this.returnItem.ReturnDate = this.loadDataService.loadDateYMD(new Date());
  }
  medicine: any = {};

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

  ReturnProduct: any = {};
  addReturnList(productModel: any) {
    var obj = {
      PaymentMedicineId: productModel.PaymentMedicineId,
      PaymentCollectionId: productModel.PaymentCollectionId,
      MedicineStockId: productModel.MedicineStockId,
      UnitId: productModel.UnitId,
      UnitValue: productModel.UnitValue,
      Name: productModel.Name,
      HSNCode: productModel.HSNCode,
      Amount: productModel.Amount,
      GSTId: productModel.GSTId,
      MedicineId: productModel.MedicineId,
      Quantity: productModel.Quantity,
      ReturnQuantity: productModel.Quantity,
      UnitName: productModel.UnitName,
      DiscountPercentages: productModel.DiscountPercentages,
      DiscountAmount: productModel.DiscountAmount,
      TaxableAmount: productModel.TaxableAmount,
      GSTValue: productModel.GSTValue,
      CGSTAmount: productModel.CGSTAmount,
      SGSTAmount: productModel.SGSTAmount,
      IGSTAmount: productModel.IGSTAmount,
      TotalAmount: productModel.TotalAmount,
      
    };
    this.ReturnList.push(obj);
    for (let i = 0; i < this.BillDetailList.length; i++) {
      const e1 = this.BillDetailList[i];
      if (e1.PaymentMedicineId == productModel.PaymentMedicineId) {
        this.BillDetailList.splice(i, 1);
        break;
      }
    }

    for (let i = 0; i < this.ReturnList.length; i++) {
      const e2 = this.ReturnList[i];
      //this.ReturnProduct.Quantity = e2.Quantity;
      this.ReturnProduct.ReturnQuantity = e2.ReturnQuantity;
      //break;
    }
  }

  changeReturnAmount(SellProduct: any) {
    if (SellProduct.AvailableQuantity == 0) {
      toastr.error('No stock is available !!');
      SellProduct.ReturnQuantity = 0;
    }
    if (SellProduct.AvailableQuantity < SellProduct.ReturnQuantity) {
      toastr.error(
        'Quantity should not be more than ' + SellProduct.AvailableQuantity
      );
      SellProduct.ReturnQuantity = 0;
    }
    SellProduct.BasicAmount = this.loadDataService.round(
      SellProduct.ReturnQuantity * SellProduct.Amount,
      2
    );
    SellProduct.DiscountAmount =
      SellProduct.DiscountAmount == null ? 0 : SellProduct.DiscountAmount;
    if (SellProduct.DiscountPercentages != null) {
      SellProduct.DiscountPercentages = SellProduct.DiscountPercentages;
      SellProduct.DiscountAmount = this.loadDataService.round(
        (SellProduct.BasicAmount * SellProduct.DiscountPercentages) / 100,
        2
      );
    }
    SellProduct.TotalAmount = this.loadDataService.round(
      SellProduct.BasicAmount - SellProduct.DiscountAmount,
      0
    );
    var TotalGrossAmount: number = this.loadDataService.round(
      SellProduct.TotalAmount / SellProduct.ReturnQuantity,
      0
    );

    this.calculateGST(SellProduct);
  }

  removeRetutnList(i: number) {
    this.ReturnList.splice(i, 1);
  }

  EmployeeList: any[] = [];
  getEmployeeList(CustomerId?: number) {
    this.dataLoading = true;

    var obj: RequestModel = {
      request: this.localService
        .encrypt(JSON.stringify({ Status: 1 }))
        .toString(),
    };
    this.service.getStaffLoginList(obj).subscribe(
      (r1) => {
        let response = r1 as any;
        if (response.Message == ConstantData.SuccessMessage) {
          this.EmployeeList = response.StaffLoginList;
        } else {
          this.toastr.error(response.Message);
        }
        this.dataLoading = false;
      },
      (err) => {
        this.toastr.error('Error Occured while fetching data.');
        this.dataLoading = false;
      }
    );
  }

  SellProductList: any[] = [];
  ProductStockList: any[] = [];
  isProductSubmitted: boolean = false;

  changeDiscountAmount(SellProduct: any) {
    if (SellProduct.ItemType == 1) {
      SellProduct.DiscountPercentages =
        (SellProduct.DiscountAmount * 100) / SellProduct.BasicAmount;
      SellProduct.TotalAmount = this.loadDataService.round(
        SellProduct.BasicAmount - SellProduct.DiscountAmount,
        2
      );
      var TotalGrossAmount: number = this.loadDataService.round(
        SellProduct.TotalAmount / SellProduct.Quantity,
        2
      );
      // if (TotalGrossAmount < 1000)
      //   SellProduct.GSTValue = 5;
      // else
      //   SellProduct.GSTValue = 12;
    } else {
      SellProduct.DiscountPercentages =
        (SellProduct.DiscountAmount * 100) / SellProduct.BasicAmount;
      SellProduct.TotalAmount = this.loadDataService.round(
        SellProduct.BasicAmount - SellProduct.DiscountAmount,
        2
      );
      var TotalGrossAmount: number = this.loadDataService.round(
        SellProduct.TotalAmount / SellProduct.Quantity,
        2
      );
      // SellProduct.GSTValue = 5;
    }
    this.calculateGST(SellProduct);
  }

  @ViewChild('formProductElement') formProductElement: ElementRef;

  changeReturnSellingPrice(SellProduct: any) {
    if (SellProduct.AvailableQuantity == 0) {
      this.toastr.error('No stock is available !!');
      SellProduct.ReturnQuantity = 0;
    }
    if (SellProduct.AvailableQuantity < SellProduct.ReturnQuantity) {
      this.toastr.error(
        'Quantity should not be more than ' + SellProduct.AvailableQuantity
      );
      SellProduct.ReturnQuantity = 0;
    }
    SellProduct.TaxableAmount = this.loadDataService.round(
      SellProduct.ReturnQuantity * SellProduct.Amount,
      2
    );
    SellProduct.DiscountAmount =
      SellProduct.DiscountAmount == null ? 0 : SellProduct.DiscountAmount;
    if (SellProduct.DiscountPercentages != null) {
      SellProduct.DiscountPercentages = SellProduct.DiscountPercentages;
      SellProduct.DiscountAmount = this.loadDataService.round(
        (SellProduct.TaxableAmount * SellProduct.DiscountPercentages) / 100,
        2
      );
    }
    SellProduct.TotalAmount = this.loadDataService.round(
      SellProduct.TaxableAmount - SellProduct.DiscountAmount,
      2
    );
    var TotalGrossAmount: number = this.loadDataService.round(
      SellProduct.TotalAmount / SellProduct.ReturnQuantity,
      0
    );
    SellProduct.GSTPercentage = SellProduct.GSTValue;

    this.calculateGST(SellProduct);
  }

  calculateGST(SellProduct: any) {
    SellProduct.TotalGSTAmount = 0;
    SellProduct.CGSTAmount = 0;
    SellProduct.SGSTAmount = 0;
    SellProduct.IGSTAmount = 0;
    SellProduct.TaxableAmount = 0;

    if (SellProduct.GSTValue > 0) {
      SellProduct.TaxableAmount = this.loadDataService.round(
        SellProduct.TotalAmount *
          (100 / (100 + parseFloat(SellProduct.GSTValue))),
        2
      );
      SellProduct.TotalGSTAmount =
        SellProduct.TotalAmount - SellProduct.TaxableAmount;
      //SellProduct.TotalGSTAmount = this.loadDataService.round((SellProduct.TotalAmount - (SellProduct.TotalAmount * (100 / (100 + parseFloat(SellProduct.GSTValue))))),2);
      //SellProduct.TaxableAmount = this.loadDataService.round((SellProduct.TotalAmount - SellProduct.TotalGSTAmount),2);
      //if (gstCode == 20) {
      SellProduct.CGSTAmount = this.loadDataService.round(
        SellProduct.TotalGSTAmount / 2,
        2
      );
      SellProduct.SGSTAmount = this.loadDataService.round(
        SellProduct.TotalGSTAmount / 2,
        2
      );
      // } else {
      //SellProduct.IGSTAmount = SellProduct.TotalGSTAmount;
      //}
    } else {
      SellProduct.TaxableAmount = SellProduct.TotalAmount;
    }
    SellProduct.TotalGSTAmount =
      SellProduct.CGSTAmount + SellProduct.SGSTAmount + SellProduct.IGSTAmount;
    //SellProduct.TotalAmount = this.loadDataService.round(SellProduct.TaxableAmount + SellProduct.TotalGSTAmount, 2);
    this.calculateTotal();
  }

  IsVisible: boolean = false;
  ShowHide() {
    this.IsVisible = this.IsVisible ? false : true;
    //this.resetForm();

    // this.returnItem.EmployeeId = this.employeeDetail.EmployeeId;
  }

  resetForm() {
    this.returnItem = {};
    // this.returnItem.SellId = 0;
    // this.returnItem.Status = "1";
    // this.returnItem.CustomerId = "";
    // this.returnItem.CustomerName = "Cash";
    this.returnItem.EmployeeId = this.employeeDetail.EmployeeId;
    this.returnItem.ReturnDate = this.loadDataService.loadDateYMD(new Date());
    this.submitted = false;
    this.ReturnList = [];
    $('#MobileNo').focus();
    $('#MobileNo').keypress(function (event: any) {});
  }

  getProductStockDetailList() {
    this.dataLoading = true;
    var obj: RequestModel = {
      request: this.localService
        .encrypt(JSON.stringify({ Status: 1 }))
        .toString(),
    };
    this.service.getProductStockDetailList(obj).subscribe(
      (r1) => {
        let response = r1 as any;
        if (response.Message == ConstantData.SuccessMessage) {
          this.ProductStockList = response.ProductStockList;
          this.ProductStockList.map(
            (c1) =>
              (c1.SearchProduct = `${c1.StockCode} - ${c1.Name}- ${c1.SizeName} - ${c1.HSNCode}`)
          );
        } else {
          this.toastr.error(response.Message);
        }
        this.dataLoading = false;
      },
      (err) => {
        this.toastr.error('Error Occured while fetching data.');
        this.dataLoading = false;
      }
    );
  }

  calculateTotal() {
    this.returnItem.TotalAmount = 0;
    this.returnItem.TotalDiscountAmount = 0;
    this.returnItem.TotalTaxableAmount = 0;
    this.returnItem.TotalCGSTAmount = 0;
    this.returnItem.TotalSGSTAmount = 0;
    this.returnItem.TotalIGSTAmount = 0;
    this.returnItem.TotalGrossAmount = 0;
    this.returnItem.RoundOff = 0;
    this.returnItem.GrandTotal = 0;
    this.returnItem.PaymentCollectionId = 0;

    this.ReturnList.forEach((e1: any) => {
      this.returnItem.TotalAmount += e1.Amount;
      this.returnItem.TotalDiscountAmount += e1.DiscountAmount;
      this.returnItem.TotalTaxableAmount += e1.TaxableAmount;
      this.returnItem.TotalCGSTAmount += e1.CGSTAmount;
      this.returnItem.TotalSGSTAmount += e1.SGSTAmount;
      this.returnItem.TotalIGSTAmount += e1.IGSTAmount;
      this.returnItem.TotalGrossAmount += e1.TotalAmount;
      this.returnItem.PaymentCollectionId = e1.PaymentCollectionId;
    });
    this.returnItem.TotalAmount = this.loadDataService.round(
      this.returnItem.TotalAmount,
      2
    );
    this.returnItem.TotalDiscountAmount = this.loadDataService.round(
      this.returnItem.TotalDiscountAmount,
      2
    );
    this.returnItem.TotalCGSTAmount = this.loadDataService.round(
      this.returnItem.TotalCGSTAmount,
      2
    );
    this.returnItem.TotalSGSTAmount = this.loadDataService.round(
      this.returnItem.TotalSGSTAmount,
      2
    );
    this.returnItem.TotalIGSTAmount = this.loadDataService.round(
      this.returnItem.TotalIGSTAmount,
      2
    );
    this.returnItem.TotalTaxableAmount = this.loadDataService.round(
      this.returnItem.TotalTaxableAmount,
      2
    );
    this.returnItem.TotalGrossAmount = this.loadDataService.round(
      this.returnItem.TotalGrossAmount,
      2
    );
    this.returnItem.GrandTotal = this.loadDataService.round(
      this.returnItem.TotalGrossAmount
    );
    this.returnItem.RoundOff = this.loadDataService.round(
      this.returnItem.GrandTotal - this.returnItem.TotalGrossAmount,
      2
    );
  }

  removeData(list: any[], index: number) {
    list.splice(index, 1);
    this.calculateTotal();
  }

  getMedicineBillList() {
    this.dataLoading = true;
    var obj: RequestModel = {
      request: this.localService.encrypt(JSON.stringify({})).toString(),
    };
    this.service.getMedicineBillList(obj).subscribe(
      (r1) => {
        let response = r1 as any;
        if (response.Message == ConstantData.SuccessMessage) {
          this.MedicineBillList = response.MedicineBillList;
        } else {
          this.toastr.error(response.Message);
        }
        this.dataLoading = false;
      },
      (err) => {
        this.toastr.error('Error Occured while fetching data.');
        this.dataLoading = false;
      }
    );
  }

  getBillDetailList() {
    this.dataLoading = true;
    const payload = {
      ReceiptNo: this.medicine.ReceiptNo,
      Status: 1,
    };
    const obj: RequestModel = {
      request: this.localService.encrypt(JSON.stringify(payload)).toString(),
    };
    this.service.getBillDetailList(obj).subscribe(
      (r1) => {
        let response = r1 as any;
        if (response.Message == ConstantData.SuccessMessage) {
          this.BillDetailList = response.BillDetailList;
          
        } else {
          this.toastr.error(response.Message);
        }
        this.dataLoading = false;
      },
      (err) => {
        this.toastr.error('Error Occured while fetching data.');
        this.dataLoading = false;
      }
    );
  }

  resetReturn() {
    this.ReturnList = [];
    this.ReturnProduct = {};
    this.BillDetailList = [];
  }

  redUrl: string;

  openPopup() {
    $('#modal_popUp').modal('show');
  }

  SaveReturnProduct() {
    this.calculateTotal();
    this.submitted = true;
    this.dataLoading = true;
    this.returnItem.ReceiptNo = this.medicine.ReceiptNo;

    var data = {
      //returnItem: this.returnItem,
      //SellProductList: this.SellProductList,
      EmployeeId: this.staffLogin.StaffId,
      returns: this.returnItem,
      returnItems: this.ReturnList,
      Quantity: this.ReturnProduct.Quantity,
    };
    
    var obj: RequestModel = {
          request: this.localService.encrypt(JSON.stringify(data)).toString(),
        };
    this.service.saveReturnProduct(obj).subscribe(
      (r1) => {
        let response = r1 as any;
        if (response.Message == ConstantData.SuccessMessage) {
          this.toastr.success("Your item is return successfully!!");
          //this.service.printNewSellInvoice(response.SellId);
          if (this.redUrl) this.router.navigate([this.redUrl]);
          // form2.reset();
          // form.reset();
          var empId = this.returnItem.EmployeeId;
          this.resetForm();
          this.returnItem.EmployeeId = empId;
          this.resetReturn();
          $('#modal_popUp').modal('hide');
          //this.getProductStockDetailList();
        } else {
          this.toastr.error(response.Message);
        }
        //this.getBillDetailList();
        this.dataLoading = false;
      },
      (err) => {
        this.toastr.error('Error occured while fetching data.');
        this.dataLoading = false;
      }
    );
  }
}
