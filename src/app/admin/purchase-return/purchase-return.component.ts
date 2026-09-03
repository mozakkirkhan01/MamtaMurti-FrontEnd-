import { Component, OnInit, ViewChild } from '@angular/core';
import { NgForm } from "@angular/forms";
declare var toastr: any;
declare var $: any;

import { AppService } from "../../utils/app.service";
import { ConstantData } from "../../utils/constant-data";
import { LocalService } from "../../utils/local.service";
import { LoadDataService } from '../../utils/load-data.service';
import { Status } from '../../utils/enum';
import { ActionModel ,RequestModel ,StaffLoginModel } from '../../utils/interface';
import { ActivatedRoute, Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';



@Component({
  selector: 'app-purchase-return',
  templateUrl: './purchase-return.component.html',
  styleUrls: ['./purchase-return.component.css']
})
export class PurchaseReturnComponent implements OnInit {

  Purchase: any = {};
  PurchaseProduct: any = {};
  PurchaseProductList: any[] = [];
  employeeDetail: any;
  dataLoading: boolean = false;
  submitted: boolean;
  staffLogin: StaffLoginModel = {} as StaffLoginModel;
  action: ActionModel = {} as ActionModel;
  SupplierDetailList: any=[];
  MedicineDetailList: any[];

  
  

  constructor(
    private service: AppService,
    private localService: LocalService,
    private loadData: LoadDataService,
    private route: ActivatedRoute,
    private router: Router,
    private toastr: ToastrService,

  ) { }

  redUrl: string;
  ngOnInit(): void {
    this.staffLogin = this.localService.getEmployeeDetail();

    this.validiateMenu(); 
    this.getGSTList();
    this.getMedicineList();
    this.getSupplierList();
    this.getUnitList();
    this.resetForm();
    this.resetFormPurchaseProduct();
    this.route.queryParams.subscribe((params: any) => {
      this.Purchase.PurchaseId = params.id;
      this.redUrl = params.redUrl;
      if (this.Purchase.PurchaseId > 0)
        this.getPurchaseDetail(this.Purchase.PurchaseId);
      else
        this.Purchase.PurchaseId = 0;
    });
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

  getPurchaseDetail(PurchaseId: number) {

    this.dataLoading = true;
    this.service.getPurchaseDetail({ PurchaseId: PurchaseId }).subscribe(r1 => {
      let response = r1 as any;
      if (response.Message == ConstantData.SuccessMessage) {
        this.Purchase = response.Purchase;
        this.Purchase.InvoiceDate = this.loadData.loadDateYMD(this.Purchase.InvoiceDate);
        this.PurchaseProductList = response.PurchaseProductList;
        this.PurchaseProductList.map(x => x.SearchProduct = `${x.ProductName} - ${x.HSNCode}`);
        this.Purchase.SupplierId = this.Purchase.SupplierId;
        // this.setSupplier();
        this.calculateTotal();
      } else {
        this.toastr.error(response.Message);
      }
      this.dataLoading = false;
    }, (err => {
      this.toastr.error("Error Occured while fetching data.");
      this.dataLoading = false;
    }));
  }

  @ViewChild('formPurchase') formPurchase: NgForm;
  resetForm() {
    this.PurchaseProductList = [];
    this.Purchase = {};
    this.Purchase.Status = 1;
    this.Purchase.InvoiceDate = this.loadData.loadDateYMD(new Date());
    this.Purchase.SupplierId = "";
    if (this.formPurchase) {
      this.formPurchase.control.markAsPristine();
      this.formPurchase.control.markAsUntouched();
    }
    this.submitted = false
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

  MedicineStockListBySupplier: any[] = [];
  getMedicineStockListBySupplier() {
    let SupplierId = this.Purchase.SupplierId
    
    
  var obj: RequestModel = {
    request: this.localService.encrypt(JSON.stringify({ SupplierId})).toString()
  };
    this.dataLoading = true;
    this.service.getMedicineStockListBySupplier(obj).subscribe(r1 => {
      let response = r1 as any;
      if (response.Message == ConstantData.SuccessMessage) {
        this.MedicineStockListBySupplier = response.MedicineStockListBySupplier;
        this.MedicineStockListBySupplier.map(x1 => x1.SearchMedicineForReturn = `${x1.MedicineName} - ${x1.HSNCode}`)
      } else {
        this.toastr.error(response.Message);
      }
      this.dataLoading = false;
    }, (err => {
      this.toastr.error("Error Occured while fetching data.");
      this.dataLoading = false;
    }));
  }


  UnitList: any[] = [];
  getUnitList() {
    this.dataLoading = true;
          var obj: RequestModel = {
    request: this.localService.encrypt(JSON.stringify({ })).toString()
  };
    this.service.getUnitList(obj).subscribe(r1 => {
      let response = r1 as any;
      if (response.Message == ConstantData.SuccessMessage) {
        this.UnitList = response.UnitList;
      } else {
        this.toastr.error(response.Message);
      }
      this.dataLoading = false;
    }, (err => {
      this.toastr.error("Error Occured while fetching data.");
      this.dataLoading = false;
    }));
  }


  GSTList: any[] = [];
  getGSTList() {
    this.dataLoading = true;
      var obj: RequestModel = {
    request: this.localService.encrypt(JSON.stringify({ })).toString()
  };
    this.service.getGSTList(obj).subscribe(r1 => {
      let response = r1 as any;
      if (response.Message == ConstantData.SuccessMessage) {
        this.GSTList = response.GSTList;
      } else {
        this.toastr.error(response.Message);
      }
      this.dataLoading = false;
    }, (err => {
      this.toastr.error("Error Occured while fetching data.");
      this.dataLoading = false;
    }));
  }

  MedicineList: any[] = [];
  getMedicineList() {
    this.dataLoading = true;
         var obj: RequestModel = {
    request: this.localService.encrypt(JSON.stringify({})).toString()
  };
    this.service.getMedicineList(obj).subscribe(r1 => {
      let response = r1 as any;
      if (response.Message == ConstantData.SuccessMessage) {
        this.MedicineList = response.MedicineList;
        this.MedicineList.map(x1 => x1.SearchMedicine = `${x1.Name} - ${x1.HSNCode}`)
      } else {
        this.toastr.error(response.Message);
      }
      this.dataLoading = false;
    }, (err => {
      this.toastr.error("Error Occured while fetching data.");
      this.dataLoading = false;
    }));
  }

  isSubmittedPurchaseProduct: boolean = false;
  @ViewChild('formPurchaseProduct') formPurchaseProduct: NgForm;
  resetFormPurchaseProduct() {
    this.PurchaseProduct = {};
    this.PurchaseProduct.UnitId = "";
    this.PurchaseProduct.GSTId = "";
    if (this.formPurchaseProduct) {
      this.formPurchaseProduct.control.markAsPristine();
      this.formPurchaseProduct.control.markAsUntouched();
    }
    this.isSubmittedPurchaseProduct = false;
  }

  // afterMedicineSelected(selected: any) {
  //   this.PurchaseProduct.InvoiceNo = selected.InvoiceNo;
  //   this.PurchaseProduct.MedicineStockId = selected.MedicineStockId;
  //   this.PurchaseProduct.MedicineId = selected.MedicineId;
  //   this.PurchaseProduct.MedicineName = selected.MedicineName;
  //   this.PurchaseProduct.UnitId = selected.UnitId;
  //   this.PurchaseProduct.GSTId = selected.GSTId;
  //   this.PurchaseProduct.GSTValue = selected.GSTValue;
  //   this.PurchaseProduct.UnitName = selected.UnitName;
  //   this.PurchaseProduct.HSNCode = selected.HSNCode;
  //   this.PurchaseProduct.BatchNo = selected.BatchNo;
  //   this.PurchaseProduct.MRP = selected.MRP;
  //   this.PurchaseProduct.Rate = selected.Rate;
  //   this.PurchaseProduct.DiscountPercent = selected.DiscountPercent;
  //   this.PurchaseProduct.CostPrice = this.loadData.round((this.PurchaseProduct.Rate * ((100 - (selected.DiscountPercent ?? 0)) / 100)), 2);
  //   this.PurchaseProduct.GSTValue = selected.GSTValue;
  //   this.PurchaseProduct.SGSTAmount = selected.SGSTAmount;
  //   this.PurchaseProduct.CGSTAmount = selected.CGSTAmount;
  //   this.PurchaseProduct.IGSTAmount = selected.IGSTAmount;
  //   this.PurchaseProduct.ExpiredDate = this.loadData.loadDateYMD(selected.ExpiredDate);
  //   this.PurchaseProduct.SearchMedicineForReturn = selected.SearchMedicineForReturn;
  // }

  // clearMedicine() {
  //   this.PurchaseProduct.MedicineId = null;
  //   this.PurchaseProduct.UnitId = null;
  //   this.PurchaseProduct.HSNCode = null;
  //   this.PurchaseProduct.SearchMedicine = null;
  //   this.PurchaseProduct.UnitName = null;
  // }

  changeCostAmount(purchaseProductModel: any) {
    //purchaseProductModel.DiscountAmount = this.loadData.round((purchaseProductModel.DiscountAmount == undefined ? 0 : purchaseProductModel.DiscountAmount), 2);
    purchaseProductModel.BasicAmount = this.loadData.round((purchaseProductModel.Quantity * purchaseProductModel.CostPrice), 2);
    purchaseProductModel.TaxableAmount = this.loadData.round(purchaseProductModel.BasicAmount, 2);
    this.calculateGST();
  }

  gstPercentChange() {
    if (this.PurchaseProduct.GSTId > 0) {
      if (this.Purchase.SupplierId > 0) {
        this.calculateGST();
      }
      else {
        this.toastr.error("Supplier is required!!")
      }
    }
    else {
      this.toastr.error("Selected supplier has no GST No.")
    }
  }
//Return Purchase
  calculateGST() {
    this.PurchaseProduct.TotalGSTAmount = 0;
    this.PurchaseProduct.CGSTAmount = 0;
    this.PurchaseProduct.SGSTAmount = 0;
    this.PurchaseProduct.IGSTAmount = 0;
    this.PurchaseProduct.GrandTotal = 0;

    if (this.PurchaseProduct.GSTId > 0) {
      if (this.Purchase.SupplierId > 0) {
        var selectedSupplier = this.SupplierList.filter(x => x.SupplierId == this.Purchase.SupplierId)[0];
        var gstCode = null;
        var TotalGSTAmount = 0;
        if (selectedSupplier && selectedSupplier.GSTNo != null) {
          gstCode = selectedSupplier.GSTNo.substring(0, 2);
          var selectedGST = this.GSTList.filter(x => x.GSTId == this.PurchaseProduct.GSTId)[0];
          this.PurchaseProduct.GSTName = selectedGST.GSTName;
          this.PurchaseProduct.GSTValue = selectedGST.GSTValue;
          TotalGSTAmount = this.loadData.round((this.PurchaseProduct.TaxableAmount * selectedGST.GSTValue) / 100, 2);
        }
        if (gstCode == 20) {
          this.PurchaseProduct.CGSTAmount = this.loadData.round(TotalGSTAmount / 2, 2);
          this.PurchaseProduct.SGSTAmount = this.loadData.round(TotalGSTAmount / 2, 2);
        } else {
          this.PurchaseProduct.IGSTAmount = TotalGSTAmount;
        }
      }
    }
    this.PurchaseProduct.TotalGSTAmount = this.loadData.round(this.PurchaseProduct.CGSTAmount + this.PurchaseProduct.SGSTAmount + this.PurchaseProduct.IGSTAmount, 2);
    this.PurchaseProduct.GrandTotal = this.loadData.round(this.PurchaseProduct.TaxableAmount + this.PurchaseProduct.CGSTAmount + this.PurchaseProduct.SGSTAmount + (this.PurchaseProduct.IGSTAmount > 0 ? this.PurchaseProduct.IGSTAmount : 0), 2);
  }

  changeDiscountAmount(purchaseProductModel: any) {
    purchaseProductModel.DiscountPercent = this.loadData.round(purchaseProductModel.DiscountAmount * 100 / purchaseProductModel.BasicAmount, 2);
  }

  addPurchaseProduct() {
    this.isSubmittedPurchaseProduct = true;
    this.formPurchaseProduct.control.markAllAsTouched();
    if (this.formPurchaseProduct.invalid) {
      this.toastr.error("Fill Required Fields.");
      return;
    }
    if (this.PurchaseProduct.MedicineId == 0 || this.PurchaseProduct.MedicineId == null) {
      this.toastr.error("Please Select Medicine Name")
      return;
    }

    if (this.Purchase.SupplierId == 0 || this.Purchase.SupplierId == null) {
      this.toastr.error("Please Select Suppier First !!")
      return;
    }

    //Check Label Code
    //for (var i = 0; i < this.PurchaseProductItemList.length; i++) {
    //    if (this.PurchaseProductItemList[i].BatchNo == this.PurchaseProduct.BatchNo) {
    //        this.toastr.error("Batch No. is already exist.")
    //        return;
    //    }
    //}

    this.PurchaseProductList.push(this.PurchaseProduct);
    this.resetFormPurchaseProduct();
    this.calculateTotal();
  }

  calculateTotal(isPaidAmount?: boolean) {
    this.Purchase.TotalCostAmount = 0;
    this.Purchase.TotalBasicAmount = 0;
    this.Purchase.TotalDiscountAmount = 0;
    this.Purchase.TotalTaxableAmount = 0;
    this.Purchase.TotalCGSTAmount = 0;
    this.Purchase.TotalSGSTAmount = 0;
    this.Purchase.TotalIGSTAmount = 0;
    this.Purchase.TotalGrandTotal = 0;
    this.Purchase.DuesAmount = 0;
    this.PurchaseProductList.forEach(purchase => {
      this.Purchase.TotalCostAmount += parseFloat(purchase.CostPrice);
      this.Purchase.TotalBasicAmount += parseFloat(purchase.BasicAmount);
      this.Purchase.TotalDiscountAmount += parseFloat(purchase.DiscountAmount);
      this.Purchase.TotalTaxableAmount += parseFloat(purchase.TaxableAmount);
      this.Purchase.TotalCGSTAmount += parseFloat(purchase.CGSTAmount);
      this.Purchase.TotalSGSTAmount += parseFloat(purchase.SGSTAmount);
      this.Purchase.TotalIGSTAmount += parseFloat((purchase.IGSTAmount > 0 ? purchase.IGSTAmount : 0));
    })
    this.Purchase.TotalGrandTotal = this.loadData.round(this.Purchase.TotalTaxableAmount + this.Purchase.TotalCGSTAmount + this.Purchase.TotalSGSTAmount + this.Purchase.TotalIGSTAmount, 0);
    if (!isPaidAmount)
      this.Purchase.PaidAmount = this.Purchase.TotalGrandTotal;
    this.Purchase.DuesAmount = this.Purchase.TotalGrandTotal - this.Purchase.PaidAmount;
  }

  RemovePurchaseProduct(index: number) {
    this.PurchaseProductList.splice(index, 1);
    this.calculateTotal();
  }

  SaveReturnPurchaseProduct() {
    this.submitted = true;
    if (this.formPurchase.invalid) {
      this.toastr.warning("Fill all the Required Fields.", "Invailid Form")
      return;
    }
    
    if (this.PurchaseProductList.length == 0) {
      this.toastr.warning("No product is added!!");
      return;
    }
    var data = {
      Return: this.Purchase,
      ReturnItem: this.PurchaseProductList,
      EmployeeId: this.staffLogin.StaffId
    }
    
         var obj: RequestModel = {
    request: this.localService.encrypt(JSON.stringify(data)).toString()
  };
    this.dataLoading = true;
    this.service.SaveReturnPurchaseProduct(obj).subscribe(r1 => {
      let response = r1 as any;
      if (response.Message == ConstantData.SuccessMessage) {
        this.toastr.success("One record created successfully.", "Operation Success");
        this.resetForm();
        this.resetFormPurchaseProduct();
      } else {
        this.toastr.error(response.Message);
      }
      this.dataLoading = false;
    }, (err => {
      this.toastr.error("Error Occured while fetching data.");
      this.dataLoading = false;
    }));
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
    var Transport = this.SupplierDetailList.find(
      (x: any) => x.PurchaseId == this.Purchase.PurchaseId
    );
    this.Purchase.SupplierName = Transport.SupplierName;
    this.Purchase.SupplierId = Transport.SupplierId;
  }

  clearSupplier() {
    this.SupplierDetailList = this.SupplierList;
    this.Purchase.SupplierId = null;
    this.Purchase.SupplierName = null;
    this.PurchaseProduct.HSNCode = null;
    this.Purchase.SearchSupplier = null;
  }


  onSupplierSelected(supplierName: string, supplierId: string) {
  this.Purchase.SupplierName = supplierName;
  this.Purchase.SupplierId = supplierId;

  this.getMedicineStockListBySupplier();
  this.calculateGST();
}

  filterMedicineList(value: any) {
    if (value) {
      const MedicinefilterValue = value.toLowerCase();
      this.MedicineDetailList = this.MedicineStockListBySupplier.filter((option: any) =>
        option.MedicineName.toLowerCase().includes(MedicinefilterValue)
      );
    } else {
      this.MedicineDetailList = this.MedicineList;
    }
  }

afterMedicineSelected(event: any) {
    
    this.PurchaseProduct.MedicineId = event.option.id;
    this.PurchaseProduct.MedicineName = event.option.value;
    var selected = this.MedicineStockListBySupplier.find(
      (x: any) => x.MedicineId == this.PurchaseProduct.MedicineId
    );
   
    this.Purchase.MedicineName = selected.MedicineName;
    // this.Purchase.SupplierId = SelectedMedicine.SupplierId;
    // this.Purchase.SupplierName = SelectedMedicine.SupplierName;
    // this.Purchase.SearchSupplier = SelectedMedicine.SearchSupplier;
        this.PurchaseProduct.InvoiceNo = selected.InvoiceNo;
    this.PurchaseProduct.MedicineStockId = selected.MedicineStockId;
    this.PurchaseProduct.MedicineId = selected.MedicineId;
    this.PurchaseProduct.UnitId = selected.UnitId;
    this.PurchaseProduct.GSTId = selected.GSTId;
    this.PurchaseProduct.GSTValue = selected.GSTValue;
    this.PurchaseProduct.UnitName = selected.UnitName;
    this.PurchaseProduct.HSNCode = selected.HSNCode;
    this.PurchaseProduct.BatchNo = selected.BatchNo;
    this.PurchaseProduct.MRP = selected.MRP;
    this.PurchaseProduct.Rate = selected.Rate;
    this.PurchaseProduct.DiscountPercent = selected.DiscountPercent;
    this.PurchaseProduct.CostPrice = this.loadData.round((this.PurchaseProduct.Rate * ((100 - (selected.DiscountPercent ?? 0)) / 100)), 2);
    this.PurchaseProduct.GSTValue = selected.GSTValue;
    this.PurchaseProduct.SGSTAmount = selected.SGSTAmount;
    this.PurchaseProduct.CGSTAmount = selected.CGSTAmount;
    this.PurchaseProduct.IGSTAmount = selected.IGSTAmount;
    this.PurchaseProduct.ExpiredDate = this.loadData.loadDateYMD(selected.ExpiredDate);
    this.PurchaseProduct.SearchMedicineForReturn = selected.SearchMedicineForReturn;
    

  }

  // afterMedicineSelected(selected: any) {
  //   this.PurchaseProduct.MedicineId = selected.MedicineId;
  //   this.PurchaseProduct.Name = selected.Name;
  //   this.PurchaseProduct.UnitId = selected.UnitId;
  //   if (selected.GSTId)
  //     this.PurchaseProduct.GSTId = selected.GSTId;
  //   this.PurchaseProduct.UnitName = selected.UnitName;
  //   this.PurchaseProduct.HSNCode = selected.HSNCode;
  //   this.PurchaseProduct.SearchMedicine = selected.SearchMedicine;
  // }

  clearMedicine() {
    this.MedicineDetailList = this.MedicineStockListBySupplier;
    this.PurchaseProduct.MedicineId = null;
    this.PurchaseProduct.MedicineName = '';
    this.PurchaseProduct.HSNCode = '';
  }
}
