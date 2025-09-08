import { Component, OnInit, ViewChild } from '@angular/core';
import { NgForm } from '@angular/forms';
declare var $: any;
declare var toastr: any;
import { AppService } from '../../utils/app.service';
import { ConstantData } from '../../utils/constant-data';
import { LocalService } from '../../utils/local.service';
import { LoadDataService } from '../../utils/load-data.service';
import { ActivatedRoute, Router } from '@angular/router';
import {
  ActionModel,
  RequestModel,
  StaffLoginModel,
} from '../../utils/interface';
import { ToastrService } from 'ngx-toastr';

import { Status } from '../../utils/enum';

@Component({
  selector: 'app-medicine-purchase',
  templateUrl: './medicine-purchase.component.html',
  styleUrls: ['./medicine-purchase.component.css'],
})
export class MedicinePurchaseComponent implements OnInit {
  Medicine: any = {};
  Purchase: any = {};
  PurchaseProduct: any = {};
  PurchaseProductList: any[] = [];
  employeeDetail: any;
  dataLoading: boolean = false;
  submitted: boolean;
  action: ActionModel = {} as ActionModel;
  staffLogin: StaffLoginModel = {} as StaffLoginModel;
  StatusList = this.loadData.GetEnumList(Status);
  AllStatusList = Status;
  filteredMedicineList: any = [];
  MedicineDetailList: any = [];
  SupplierDetailList: any[] = [];

  constructor(
    private service: AppService,
    private localService: LocalService,
    private loadData: LoadDataService,
    private route: ActivatedRoute,
    private router: Router,
    private toastr: ToastrService
  ) {}

  redUrl: string;
  ngOnInit(): void {
    this.staffLogin = this.localService.getEmployeeDetail();
    this.validiateMenu();
    this.getStateList();
    this.getGSTList();
    this.getMedicineList(0);
    this.getSupplierList(0);
    this.getUnitList();
    // this.getCategoryList();
    // this.getManufacturerList();
    this.employeeDetail = this.localService.getEmployeeDetail();
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
      request: this.localService.encrypt(JSON.stringify({ Url: "/admin/medicine-purchase",StaffLoginId:this.staffLogin.StaffLoginId })).toString()
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

  // Supplier
  @ViewChild('formSupplier') formSupplier: NgForm;

  Supplier: any = {};

  StateList: any[] = [];
  getStateList() {
    var obj: RequestModel = {
      request: this.localService.encrypt(JSON.stringify({})).toString(),
    };
    this.dataLoading = true;
    this.service.getStateList(obj).subscribe(
      (r1) => {
        let response = r1 as any;
        if (response.Message == ConstantData.SuccessMessage) {
          this.StateList = response.StateList;
        } else {
          this.toastr.error(response.Message);
        }
        this.dataLoading = false;
      },
      (err) => {
        this.toastr.error('Error while fetching records');
        this.dataLoading = false;
      }
    );
  }

  resetSupplier() {
    this.Supplier = {};
    this.Supplier.Status = 1;
    this.Supplier.StateId = '';
    if (this.StateList.length > 0) {
      this.Supplier.StateId = this.StateList[0].StateId;
    }
    this.Supplier.JoinDate = this.loadData.loadDateYMD(new Date());
    if (this.formSupplier) {
      this.formSupplier.control.markAsPristine();
      this.formSupplier.control.markAsUntouched();
    }
    this.submitted = false;
  }

  newSupplier() {
    this.resetSupplier();
    $('#modal_supplier').modal('show');
  }

  saveSupplier() {
    this.submitted = true;
    if (this.formSupplier.invalid) {
      this.toastr.warning('Fill all the Required Fields.', 'Invailid Form');
      this.dataLoading = false;
      return;
    }
    this.Supplier.UpdatedBy = this.employeeDetail.EmployeeId;
    this.Supplier.CreatedBy = this.employeeDetail.EmployeeId;
    this.dataLoading = true;
    this.service.saveSupplier(this.Supplier).subscribe(
      (r1) => {
        let response = r1 as any;
        if (response.Message == ConstantData.SuccessMessage) {
          this.toastr.success(
            'One record created successfully.',
            'Operation Success'
          );
          this.resetSupplier();
          this.getSupplierList(response.SupplierId);
          $('#modal_supplier').modal('hide');
        } else {
          this.toastr.error(response.Message);
          this.dataLoading = false;
        }
      },
      (err) => {
        this.toastr.error('Error Occured while fetching data.');
        this.dataLoading = false;
      }
    );
  }

  @ViewChild('formMedicine') formMedicine!: NgForm;

  resetMedicine() {
    this.Medicine = {};
    this.Medicine.Status = 1;
    this.Medicine.UnitId = '';
    this.Medicine.GSTId = '';
    this.Medicine.SizeId = '';
    this.Medicine.CategoryId = '';
    // this.Medicine.MinimumQuantity = 0;
    this.Medicine.ManufacturerId = '';
    if (this.formMedicine) {
      this.formMedicine.control.markAsPristine();
      this.formMedicine.control.markAsUntouched();
    }
    this.submitted = false;
  }

  newMedicine() {
    this.resetMedicine();
    $('#modal_popUp').modal('show');
  }

  CategoryList: any[] = [];
  getCategoryList() {
    this.dataLoading = true;
    this.service.getCategoryList({}).subscribe(
      (r1) => {
        let response = r1 as any;
        if (response.Message == ConstantData.SuccessMessage) {
          this.CategoryList = response.CategoryList;
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

  ManufacturerList: any[] = [];
  getManufacturerList() {
    this.dataLoading = true;
    this.service.getManufacturerList({}).subscribe(
      (r1) => {
        let response = r1 as any;
        if (response.Message == ConstantData.SuccessMessage) {
          this.ManufacturerList = response.ManufacturerList;
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

  saveMedicine() {
    this.submitted = true;
    if (this.formMedicine.invalid) {
      this.toastr.warning('Fill all the Required Fields.', 'Invailid Form');
      this.dataLoading = false;
      return;
    }
    this.Medicine.UpdatedBy = this.employeeDetail.EmployeeId;
    this.Medicine.CreatedBy = this.employeeDetail.EmployeeId;
    this.dataLoading = true;
    this.service.saveMedicine(this.Medicine).subscribe(
      (r1) => {
        let response = r1 as any;
        if (response.Message == ConstantData.SuccessMessage) {
          if (this.Medicine.MedicineId > 0) {
            this.toastr.success('Product detail updated successfully.');
            $('#modal_popUp').modal('hide');
          } else {
            this.toastr.success('Product created successfully.');
            $('#modal_popUp').modal('hide');
            this.getMedicineList(response.MedicineId);
            this.Medicine.MedicineId = null;
            this.Medicine.Name = '';
            this.Medicine.HSNCode = '';
            if (this.formMedicine) {
              this.formMedicine.control.markAsPristine();
              this.formMedicine.control.markAsUntouched();
            }
            this.submitted = false;
          }
          this.getMedicineList(response.MedicineId);
        } else {
          this.toastr.error(response.Message);
          this.dataLoading = false;
        }
      },
      (err) => {
        this.toastr.error('Error Occured while fetching data.');
        this.dataLoading = false;
      }
    );
  }

  getPurchaseDetail(PurchaseId: number) {
    this.dataLoading = true;
       var obj: RequestModel = {
      request: this.localService.encrypt(JSON.stringify({ PurchaseId: PurchaseId })).toString(),
    };
    this.service.getPurchaseDetail(obj).subscribe(
      (r1) => {
        let response = r1 as any;
        if (response.Message == ConstantData.SuccessMessage) {
          this.Purchase = response.Purchase;
          this.Purchase.InvoiceDate = this.loadData.loadDateYMD(
            this.Purchase.InvoiceDate
          );
          this.PurchaseProductList = response.PurchaseProductList;
          this.PurchaseProductList.map(
            (x) => (x.SearchProduct = `${x.ProductName} - ${x.HSNCode}`)
          );
          this.Purchase.SupplierId = this.Purchase.SupplierId;
          this.Purchase.SupplierAutoComplete = this.Purchase.SupplierName;
          // this.setSupplier();
          this.calculateTotal();
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

  @ViewChild('formPurchase') formPurchase: NgForm;
  resetForm() {
    this.PurchaseProductList = [];
    this.Purchase = {};
    this.Purchase.Status = 1;
    this.Purchase.InvoiceDate = this.loadData.loadDateYMD(new Date());
    this.Purchase.SupplierId = '';
    if (this.formPurchase) {
      this.formPurchase.control.markAsPristine();
      this.formPurchase.control.markAsUntouched();
    }
    this.submitted = false;
  }

  SupplierList: any[] = [];
  getSupplierList(SupplierId: number) {
    this.dataLoading = true;
    var obj: RequestModel = {
      request: this.localService.encrypt(JSON.stringify({})).toString(),
    };
    this.service.getSupplierList(obj).subscribe(
      (r1) => {
        let response = r1 as any;
        if (response.Message == ConstantData.SuccessMessage) {
          this.SupplierList = response.SupplierList;

          for (let i = 0; i < this.SupplierList.length; i++) {
            const e = this.SupplierList[i];
            if (e.SupplierId == SupplierId) {
              this.Purchase.SupplierAutoComplete = e;
              this.Purchase.SupplierId = e.SupplierId;
              this.SupplierList.map((x1) => x1.SupplierName);
              this.afterSupplierSelected(e);
              break;
            }
          }
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
  UnitList: any[] = [];
  getUnitList() {
    this.dataLoading = true;
    var obj: RequestModel = {
      request: this.localService.encrypt(JSON.stringify({})).toString(),
    };
    this.service.getUnitList(obj).subscribe(
      (r1) => {
        let response = r1 as any;
        if (response.Message == ConstantData.SuccessMessage) {
          this.UnitList = response.UnitList;
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

  GSTList: any[] = [];
  getGSTList() {
    this.dataLoading = true;
    var obj: RequestModel = {
      request: this.localService
        .encrypt(JSON.stringify({}))
        .toString(),
    };
    this.service.getGSTList(obj).subscribe(
      (r1) => {
        let response = r1 as any;
        if (response.Message == ConstantData.SuccessMessage) {
          this.GSTList = response.GSTList;
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

  MedicineList: any[] = [];
  getMedicineList(MedicineId: number) {
    this.dataLoading = true;
    var obj: RequestModel = {
      request: this.localService
        .encrypt(JSON.stringify({ MedicineId: MedicineId }))
        .toString(),
    };
    this.service.getMedicineList(obj).subscribe(
      (r1) => {
        let response = r1 as any;
        if (response.Message == ConstantData.SuccessMessage) {
          this.MedicineList = response.MedicineList;
          this.filterMedicineList(this.Medicine.MedicineName);

          for (let i = 0; i < this.MedicineList.length; i++) {
            const e = this.MedicineList[i];
            if (e.MedicineId == MedicineId) {
              this.PurchaseProduct.MedicineAutoComplete = e;
              this.PurchaseProduct.MedicineId = e.MedicineId;
              this.MedicineList.map(
                (x1) => (x1.SearchMedicine = `${x1.Name} - ${x1.HSNCode}`)
              );
              //this.Purchase.SearchPatient = e.SearchPatient;
              //const eventObj = { MedicineId: e.MedicineId, /* other properties */ };
              this.afterMedicineSelected(e);
              break;
            }
          }
          this.MedicineList.map(
            (x1) => (x1.SearchMedicine = `${x1.Name} - ${x1.HSNCode}`)
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

  isSubmittedPurchaseProduct: boolean = false;
  @ViewChild('formPurchaseProduct') formPurchaseProduct: NgForm;
  resetFormPurchaseProduct() {
    this.PurchaseProduct = {};
    this.PurchaseProduct.UnitId = '';
    this.PurchaseProduct.GSTId = '';
    if (this.formPurchaseProduct) {
      this.formPurchaseProduct.control.markAsPristine();
      this.formPurchaseProduct.control.markAsUntouched();
    }
    this.isSubmittedPurchaseProduct = false;
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

  filterMedicineList(value: any) {
    if (value) {
      const MedicinefilterValue = value.toLowerCase();
      this.MedicineDetailList = this.MedicineList.filter((option: any) =>
        option.MedicineName.toLowerCase().includes(MedicinefilterValue)
      );
    } else {
      this.MedicineDetailList = this.MedicineList;
    }
  }

  afterMedicineSelected(event: any) {
    
    this.Medicine.MedicineId = event.option.id;
    this.Medicine.MedicineName = event.option.value;
    var SelectedMedicine = this.MedicineDetailList.find(
      (x: any) => x.MedicineId == this.Medicine.MedicineId
    );
   
    this.Purchase.MedicineName = SelectedMedicine.MedicineName;
    // this.Purchase.SupplierId = SelectedMedicine.SupplierId;
    // this.Purchase.SupplierName = SelectedMedicine.SupplierName;
    // this.Purchase.SearchSupplier = SelectedMedicine.SearchSupplier;
    this.PurchaseProduct.HSNCode = SelectedMedicine.HSNCode;
    this.PurchaseProduct.UnitId = SelectedMedicine.UnitId;
    this.PurchaseProduct.UnitName = SelectedMedicine.UnitName;
    this.PurchaseProduct.GSTId = SelectedMedicine.GSTId;
    this.PurchaseProduct.MedicineId = SelectedMedicine.MedicineId;

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
    this.MedicineDetailList = this.MedicineList;
    this.PurchaseProduct.MedicineId = null;
    this.PurchaseProduct.MedicineName = '';
    this.PurchaseProduct.HSNCode = '';
  }

  changeCostAmount(purchaseProductModel: any) {
    purchaseProductModel.BasicAmount = this.loadData.round(
      purchaseProductModel.Quantity * purchaseProductModel.Rate,
      2
    );
    purchaseProductModel.DiscountAmount = this.loadData.round(
      purchaseProductModel.DiscountAmount == undefined
        ? 0
        : purchaseProductModel.DiscountAmount,
      2
    );
    if (purchaseProductModel.DiscountPercent != null) {
      purchaseProductModel.DiscountPercent =
        purchaseProductModel.DiscountPercent;
      purchaseProductModel.DiscountAmount = this.loadData.round(
        (purchaseProductModel.BasicAmount *
          purchaseProductModel.DiscountPercent) /
          100,
        2
      );
    }
    purchaseProductModel.TaxableAmount = this.loadData.round(
      purchaseProductModel.BasicAmount - purchaseProductModel.DiscountAmount,
      2
    );
    this.calculateGST(purchaseProductModel);
  }

  gstPercentChange(PurchaseProduct: any) {
    if (PurchaseProduct.GSTId > 0) {
      if (this.Purchase.SupplierId > 0) {
        this.calculateGST(PurchaseProduct);
      } else {
        this.toastr.error('Supplier is required!!');
      }
    } else {
      this.toastr.error('Selected supplier has no GST No.');
    }
  }

  calculateGST(PurchaseProduct: any) {
    PurchaseProduct.TotalGSTAmount = 0;
    PurchaseProduct.CGSTAmount = 0;
    PurchaseProduct.SGSTAmount = 0;
    PurchaseProduct.IGSTAmount = 0;
    PurchaseProduct.GrandTotal = 0;

    if (PurchaseProduct.GSTId > 0) {
      if (this.Purchase.SupplierId > 0) {
        var selectedSupplier = this.SupplierList.filter(
          (x) => x.SupplierId == this.Purchase.SupplierId
        )[0];
        var gstCode = null;
        var TotalGSTAmount = 0;
        if (selectedSupplier && selectedSupplier.GSTNo != null) {
          gstCode = selectedSupplier.GSTNo.substring(0, 2);
          var selectedGST = this.GSTList.filter(
            (x) => x.GSTId == PurchaseProduct.GSTId
          )[0];
          PurchaseProduct.GSTName = selectedGST.GSTName;
          PurchaseProduct.GSTValue = selectedGST.GSTValue;
          TotalGSTAmount = this.loadData.round(
            (PurchaseProduct.TaxableAmount * selectedGST.GSTValue) / 100,
            2
          );
        }
        if (gstCode == 20) {
          PurchaseProduct.CGSTAmount = this.loadData.round(
            TotalGSTAmount / 2,
            2
          );
          PurchaseProduct.SGSTAmount = this.loadData.round(
            TotalGSTAmount / 2,
            2
          );
        } else {
          PurchaseProduct.IGSTAmount = TotalGSTAmount;
        }
      }
    }
    PurchaseProduct.TotalGSTAmount = this.loadData.round(
      PurchaseProduct.CGSTAmount +
        PurchaseProduct.SGSTAmount +
        PurchaseProduct.IGSTAmount,
      2
    );
    PurchaseProduct.GrandTotal = this.loadData.round(
      PurchaseProduct.TaxableAmount +
        PurchaseProduct.CGSTAmount +
        PurchaseProduct.SGSTAmount +
        (PurchaseProduct.IGSTAmount > 0 ? PurchaseProduct.IGSTAmount : 0),
      2
    );
    PurchaseProduct.CostAmount = this.loadData.round(
      PurchaseProduct.GrandTotal / PurchaseProduct.Quantity,
      2
    );
    this.calculateTotal();
  }

  changeDiscountAmount(purchaseProductModel: any) {
    purchaseProductModel.DiscountPercent = this.loadData.round(
      (purchaseProductModel.DiscountAmount * 100) /
        purchaseProductModel.BasicAmount,
      2
    );
  }

  addPurchaseProduct() {
    this.isSubmittedPurchaseProduct = true;
    this.formPurchaseProduct.control.markAllAsTouched();
    if (this.formPurchaseProduct.invalid) {
      this.toastr.error('Fill Required Fields.');
      return;
    }
    if (
      this.PurchaseProduct.MedicineId == 0 ||
      this.PurchaseProduct.MedicineName == null
    ) {
      this.toastr.error('Please Select Medicine Name');
      return;
    }

    // if (this.Purchase.SupplierId == 0 || this.Purchase.SupplierId == null) {
    //   this.toastr.error("Please Select Suppier First !!")
    //   return;
    // }

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
    this.PurchaseProductList.forEach((purchase) => {
      this.Purchase.TotalCostAmount += parseFloat(purchase.CostAmount);
      this.Purchase.TotalBasicAmount += parseFloat(purchase.BasicAmount);
      this.Purchase.TotalDiscountAmount += parseFloat(purchase.DiscountAmount);
      this.Purchase.TotalTaxableAmount += parseFloat(purchase.TaxableAmount);
      this.Purchase.TotalCGSTAmount += parseFloat(purchase.CGSTAmount);
      this.Purchase.TotalSGSTAmount += parseFloat(purchase.SGSTAmount);
      this.Purchase.TotalIGSTAmount += parseFloat(
        purchase.IGSTAmount > 0 ? purchase.IGSTAmount : 0
      );
    });
    this.Purchase.TotalGrandTotal = this.loadData.round(
      this.Purchase.TotalTaxableAmount +
        this.Purchase.TotalCGSTAmount +
        this.Purchase.TotalSGSTAmount +
        this.Purchase.TotalIGSTAmount,
      0
    );
    if (!isPaidAmount) this.Purchase.PaidAmount = this.Purchase.TotalGrandTotal;
    this.Purchase.DuesAmount =
      this.Purchase.TotalGrandTotal - this.Purchase.PaidAmount;
  }

  RemovePurchaseProduct(index: number) {
    this.PurchaseProductList.splice(index, 1);
    this.calculateTotal();
  }

  savePurchase() {
    this.submitted = true;
    if (this.formPurchase.invalid) {
      this.toastr.warning('Fill all the Required Fields.', 'Invailid Form');
      return;
    }
    if (this.Purchase.PaidAmount == null) {
      this.toastr.warning('Paid  Amount is required!!');
      return;
    }
    if (this.PurchaseProductList.length == 0) {
      this.toastr.warning('No product is added!!');
      return;
    }

    var data = {
      Purchase: this.Purchase,
      PurchaseProductList: this.PurchaseProductList,
      CreatedBy : this.staffLogin.StaffId,
       UpdatedBy : this.staffLogin.StaffId
    };
      const obj: RequestModel = {
      request: this.localService.encrypt(JSON.stringify(data)).toString(),
    };
    this.dataLoading = true;
    this.service.savePurchase(obj).subscribe(
      (r1) => {
        let response = r1 as any;
        if (response.Message == ConstantData.SuccessMessage) {
          this.toastr.success(
            'One record created successfully.',
            'Operation Success'
          );
          
          this.service.PrintMedicinePurchase(response.PurchaseId);

          this.resetForm();
          this.resetFormPurchaseProduct();
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
}
