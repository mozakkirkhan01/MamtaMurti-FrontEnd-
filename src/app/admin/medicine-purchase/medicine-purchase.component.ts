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
import { debounceTime, Subject } from 'rxjs';

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
  searchInputChanged: Subject<string> = new Subject();
  isEditMode: boolean = false;
  allowMedicineEdit: boolean = false; // Flag to allow medicine edits during purchase edit

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
    this.getCategoryList();
    this.getManufacturerList();
    this.getMedicinTypeList()
    this.employeeDetail = this.localService.getEmployeeDetail();
    this.resetForm();
    this.resetFormPurchaseProduct();
    
    this.route.queryParams.subscribe((params: any) => {
      this.Purchase.PurchaseId = params.id;
      this.redUrl = params.redUrl;
      if (this.Purchase.PurchaseId > 0) {
        this.isEditMode = true;
        this.getPurchaseDetail(this.Purchase.PurchaseId);
      } else {
        this.Purchase.PurchaseId = 0;
        this.isEditMode = false;
      }
    });

    this.searchInputChanged.pipe(debounceTime(300)).subscribe((value) => {
      this.filterMedicineList(value);
    });
  }

  onSearchInput(value: string) {
    this.searchInputChanged.next(value);
  }

  validiateMenu() {
    var obj: RequestModel = {
      request: this.localService
        .encrypt(
          JSON.stringify({
            Url: '/admin/medicine-purchase',
            StaffLoginId: this.staffLogin.StaffLoginId,
          })
        )
        .toString(),
    };
    this.dataLoading = true;
    this.service.validiateMenu(obj).subscribe(
      (response: any) => {
        this.action = this.loadData.validiateMenu(
          response,
          this.toastr,
          this.router
        );
        this.dataLoading = false;
      },
      (err) => {
        this.toastr.error('Error while fetching records');
        this.dataLoading = false;
      }
    );
  }

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
      this.toastr.warning('Fill all the Required Fields.', 'Invalid Form');
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
        this.toastr.error('Error Occurred while fetching data.');
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
    this.Medicine.CategoryId = '';
    this.Medicine.ManufacturerId = '';
    this.Medicine.MedicineTypeId = '';
    this.Medicine.HSNCode = '';
    this.Medicine.MedicineName = '';
    this.showAddCategory = false;
    this.newCategoryName = '';
    this.showAddManufacturer = false;
    this.newManufacturerName = '';
    this.showAddMedicineType = false;
    this.newMedicineTypeName = '';
    this.showAddUnit = false;
    this.newUnitName = '';
    this.newUnitValue = 1;
    if (this.formMedicine) {
      this.formMedicine.control.markAsPristine();
      this.formMedicine.control.markAsUntouched();
    }
    this.submitted = false;
  }

  // Quick Add properties for Add New Medicine modal
  showAddCategory: boolean = false;
  newCategoryName: string = '';

  showAddManufacturer: boolean = false;
  newManufacturerName: string = '';

  showAddMedicineType: boolean = false;
  newMedicineTypeName: string = '';

  showAddUnit: boolean = false;
  newUnitName: string = '';
  newUnitValue: number = 1;

  openNewMedicineModal(): void {
    this.resetMedicine();
    if (this.PurchaseProduct && this.PurchaseProduct.MedicineName) {
      this.Medicine.MedicineName = this.PurchaseProduct.MedicineName.trim();
    }
    $('#modal_popUp').modal('show');
  }

  closeMedicineModal(): void {
    $('#modal_popUp').modal('hide');
  }

  newMedicine() {
    this.openNewMedicineModal();
  }

  toggleAddUnit(show?: boolean) {
    this.showAddUnit = show !== undefined ? show : !this.showAddUnit;
    if (!this.showAddUnit) {
      this.newUnitName = '';
      this.newUnitValue = 1;
    }
  }

  saveQuickUnit() {
    if (!this.newUnitName || !this.newUnitName.trim()) {
      this.toastr.warning('Please enter unit name.');
      return;
    }

    const employeeId = this.employeeDetail ? this.employeeDetail.EmployeeId : (this.staffLogin ? this.staffLogin.StaffId : 0);
    const unitData = {
      UnitName: this.newUnitName.trim(),
      Value: Number(this.newUnitValue) || 1,
      Status: 1,
      CreatedBy: employeeId,
      UpdatedBy: employeeId,
    };

    const obj: RequestModel = {
      request: this.localService.encrypt(JSON.stringify(unitData)).toString(),
    };

    this.dataLoading = true;
    this.service.saveUnit(obj).subscribe(
      (r1: any) => {
        const response = r1 as any;
        if (response.Message === ConstantData.SuccessMessage) {
          this.toastr.success('Unit added successfully.');
          const savedId = response.UnitId;
          this.showAddUnit = false;
          this.newUnitName = '';
          this.newUnitValue = 1;

          var getObj: RequestModel = {
            request: this.localService.encrypt(JSON.stringify({})).toString(),
          };
          this.service.getUnitList(getObj).subscribe((res: any) => {
            if (res.Message === ConstantData.SuccessMessage) {
              this.UnitList = res.UnitList;
              this.Medicine.UnitId = savedId;
            }
          });
        } else {
          this.toastr.error(response.Message);
        }
        this.dataLoading = false;
      },
      (err) => {
        this.toastr.error('Error occurred while saving unit.');
        this.dataLoading = false;
      }
    );
  }

  toggleAddCategory(show?: boolean) {
    this.showAddCategory = show !== undefined ? show : !this.showAddCategory;
    if (!this.showAddCategory) {
      this.newCategoryName = '';
    }
  }

  saveQuickCategory() {
    if (!this.newCategoryName || !this.newCategoryName.trim()) {
      this.toastr.warning('Please enter category name.');
      return;
    }

    const employeeId = this.employeeDetail ? this.employeeDetail.EmployeeId : (this.staffLogin ? this.staffLogin.StaffId : 0);
    const categoryData = {
      CategoryName: this.newCategoryName.trim(),
      Status: 1,
      CreatedBy: employeeId,
      UpdatedBy: employeeId,
    };

    const obj: RequestModel = {
      request: this.localService.encrypt(JSON.stringify(categoryData)).toString(),
    };

    this.dataLoading = true;
    this.service.saveCategory(obj).subscribe(
      (r1: any) => {
        const response = r1 as any;
        if (response.Message === ConstantData.SuccessMessage) {
          this.toastr.success('Category added successfully.');
          const savedId = response.CategoryId;
          this.showAddCategory = false;
          this.newCategoryName = '';

          var getObj: RequestModel = {
            request: this.localService.encrypt(JSON.stringify({})).toString(),
          };
          this.service.getCategoryList(getObj).subscribe((res: any) => {
            if (res.Message === ConstantData.SuccessMessage) {
              this.CategoryList = res.CategoryList;
              this.Medicine.CategoryId = savedId;
            }
          });
        } else {
          this.toastr.error(response.Message);
        }
        this.dataLoading = false;
      },
      (err) => {
        this.toastr.error('Error occurred while saving category.');
        this.dataLoading = false;
      }
    );
  }

  toggleAddManufacturer(show?: boolean) {
    this.showAddManufacturer = show !== undefined ? show : !this.showAddManufacturer;
    if (!this.showAddManufacturer) {
      this.newManufacturerName = '';
    }
  }

  saveQuickManufacturer() {
    if (!this.newManufacturerName || !this.newManufacturerName.trim()) {
      this.toastr.warning('Please enter manufacturer name.');
      return;
    }

    const employeeId = this.employeeDetail ? this.employeeDetail.EmployeeId : (this.staffLogin ? this.staffLogin.StaffId : 0);
    const manData = {
      ManufacturerName: this.newManufacturerName.trim(),
      Status: 1,
      CreatedBy: employeeId,
      UpdatedBy: employeeId,
    };

    const obj: RequestModel = {
      request: this.localService.encrypt(JSON.stringify(manData)).toString(),
    };

    this.dataLoading = true;
    this.service.saveManufacturer(obj).subscribe(
      (r1: any) => {
        const response = r1 as any;
        if (response.Message === ConstantData.SuccessMessage) {
          this.toastr.success('Manufacturer added successfully.');
          const savedId = response.ManufacturerId;
          this.showAddManufacturer = false;
          this.newManufacturerName = '';

          var getObj: RequestModel = {
            request: this.localService.encrypt(JSON.stringify({})).toString(),
          };
          this.service.getManufacturerList(getObj).subscribe((res: any) => {
            if (res.Message === ConstantData.SuccessMessage) {
              this.ManufacturerList = res.ManufacturerList;
              this.Medicine.ManufacturerId = savedId;
            }
          });
        } else {
          this.toastr.error(response.Message);
        }
        this.dataLoading = false;
      },
      (err) => {
        this.toastr.error('Error occurred while saving manufacturer.');
        this.dataLoading = false;
      }
    );
  }

  toggleAddMedicineType(show?: boolean) {
    this.showAddMedicineType = show !== undefined ? show : !this.showAddMedicineType;
    if (!this.showAddMedicineType) {
      this.newMedicineTypeName = '';
    }
  }

  saveQuickMedicineType() {
    if (!this.newMedicineTypeName || !this.newMedicineTypeName.trim()) {
      this.toastr.warning('Please enter medicine type name.');
      return;
    }

    const employeeId = this.employeeDetail ? this.employeeDetail.EmployeeId : (this.staffLogin ? this.staffLogin.StaffId : 0);
    const typeData = {
      MedicineTypeName: this.newMedicineTypeName.trim(),
      Status: 1,
      CreatedBy: employeeId,
      UpdatedBy: employeeId,
    };

    const obj: RequestModel = {
      request: this.localService.encrypt(JSON.stringify(typeData)).toString(),
    };

    this.dataLoading = true;
    this.service.saveMedicineType(obj).subscribe(
      (r1: any) => {
        const response = r1 as any;
        if (response.Message === ConstantData.SuccessMessage) {
          this.toastr.success('Medicine Type added successfully.');
          const savedId = response.MedicineTypeId;
          this.showAddMedicineType = false;
          this.newMedicineTypeName = '';

          var getObj: RequestModel = {
            request: this.localService.encrypt(JSON.stringify({})).toString(),
          };
          this.service.getMedicineTypeList(getObj).subscribe((res: any) => {
            if (res.Message === ConstantData.SuccessMessage) {
              this.MedicineTypeList = res.MedicineTypeList;
              this.Medicine.MedicineTypeId = savedId;
            }
          });
        } else {
          this.toastr.error(response.Message);
        }
        this.dataLoading = false;
      },
      (err) => {
        this.toastr.error('Error occurred while saving medicine type.');
        this.dataLoading = false;
      }
    );
  }

  CategoryList: any[] = [];
  ManufacturerList: any[] = [];
  MedicineTypeList : any[]=[];
  UnitList: any[] = [];
  GSTList: any[] = [];
  MedicineList: any[] = [];
  SupplierList: any[] = [];

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
        this.toastr.error('Error Occurred while fetching data.');
        this.dataLoading = false;
      }
    );
  }

   getMedicinTypeList() {
    this.dataLoading = true;
    var obj: RequestModel = {
      request: this.localService.encrypt(JSON.stringify({})).toString(),
    };
    this.service.getMedicineTypeList(obj).subscribe(
      (r1) => {
        let response = r1 as any;
        if (response.Message == ConstantData.SuccessMessage) {
          this.MedicineTypeList = response.MedicineTypeList;
        } else {
          this.toastr.error(response.Message);
        }
        this.dataLoading = false;
      },
      (err) => {
        this.toastr.error('Error Occurred while fetching data.');
        this.dataLoading = false;
      }
    );
  }

    getManufacturerList() {
    this.dataLoading = true;
    var obj: RequestModel = {
      request: this.localService.encrypt(JSON.stringify({})).toString(),
    };
    this.service.getManufacturerList(obj).subscribe(
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
        this.toastr.error('Error Occurred while fetching data.');
        this.dataLoading = false;
      }
    );
  }
      getCategoryList() {
    this.dataLoading = true;
    var obj: RequestModel = {
      request: this.localService.encrypt(JSON.stringify({})).toString(),
    };
    this.service.getCategoryList(obj).subscribe(
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
        this.toastr.error('Error Occurred while fetching data.');
        this.dataLoading = false;
      }
    );
  }

  getGSTList() {
    this.dataLoading = true;
    var obj: RequestModel = {
      request: this.localService.encrypt(JSON.stringify({})).toString(),
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
        this.toastr.error('Error Occurred while fetching data.');
        this.dataLoading = false;
      }
    );
  }

  saveMedicine() {
    this.submitted = true;
    if (this.formMedicine && this.formMedicine.invalid) {
      this.toastr.warning('Fill all the Required Fields.', 'Invalid Form');
      return;
    }

    if (!this.Medicine.MedicineName || !this.Medicine.MedicineName.trim()) {
      this.toastr.warning('Medicine Name is required.');
      return;
    }

    if (!this.Medicine.HSNCode || !this.Medicine.HSNCode.trim()) {
      this.toastr.warning('HSN Code is required.');
      return;
    }

    if (!this.Medicine.UnitId) {
      this.toastr.warning('Unit is required.');
      return;
    }

    if (!this.Medicine.GSTId) {
      this.toastr.warning('GST is required.');
      return;
    }

    if (!this.Medicine.MedicineTypeId) {
      this.toastr.warning('Medicine Type is required.');
      return;
    }

    const employeeId = this.employeeDetail ? this.employeeDetail.EmployeeId : (this.staffLogin ? this.staffLogin.StaffId : 0);
    this.Medicine.UpdatedBy = employeeId;
    this.Medicine.CreatedBy = employeeId;

    var obj: RequestModel = {
      request: this.localService.encrypt(JSON.stringify(this.Medicine)).toString(),
    };

    this.dataLoading = true;
    this.service.saveMedicine(obj).subscribe(
      (r1) => {
        let response = r1 as any;
        if (response.Message == ConstantData.SuccessMessage) {
          this.toastr.success('Medicine created successfully.');
          $('#modal_popUp').modal('hide');

          const newMedName = this.Medicine.MedicineName;
          const newMedId = response.MedicineId || 0;

          this.getMedicineList(newMedId, newMedName);

          this.resetMedicine();
        } else {
          this.toastr.error(response.Message);
        }
        this.dataLoading = false;
      },
      (err) => {
        this.toastr.error('Error Occurred while saving data.');
        this.dataLoading = false;
      }
    );
  }

  getPurchaseDetail(PurchaseId: number) {
    this.dataLoading = true;
    var obj: RequestModel = {
      request: this.localService
        .encrypt(JSON.stringify({ PurchaseId: PurchaseId }))
        .toString(),
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
          
          // Add editable fields flag
          this.PurchaseProductList.forEach(item => {
            item.AllowEdit = false;
            item.OriginalData = JSON.parse(JSON.stringify(item)); // Store original data
          });
          
          this.Purchase.SupplierId = this.Purchase.SupplierId;
          this.Purchase.SupplierName = this.Purchase.SupplierName;
          this.calculateTotal();
          this.allowMedicineEdit = true; // Allow editing medicines
        } else {
          this.toastr.error(response.Message);
        }
        this.dataLoading = false;
      },
      (err) => {
        this.toastr.error('Error Occurred while fetching data.');
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
    this.isEditMode = false;
    this.allowMedicineEdit = false;
    if (this.formPurchase) {
      this.formPurchase.control.markAsPristine();
      this.formPurchase.control.markAsUntouched();
    }
    this.submitted = false;
  }

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
          this.SupplierDetailList = this.SupplierList;

          if (SupplierId > 0) {
            for (let i = 0; i < this.SupplierList.length; i++) {
              const e = this.SupplierList[i];
              if (e.SupplierId == SupplierId) {
                this.Purchase.SupplierName = e.SupplierName;
                this.Purchase.SupplierId = e.SupplierId;
                break;
              }
            }
          }
        } else {
          this.toastr.error(response.Message);
        }
        this.dataLoading = false;
      },
      (err) => {
        this.toastr.error('Error Occurred while fetching data.');
        this.dataLoading = false;
      }
    );
  }

  getMedicineList(MedicineId?: number, MedicineName?: string) {
    this.dataLoading = true;
    var obj: RequestModel = {
      request: this.localService
        .encrypt(JSON.stringify({ MedicineId: MedicineId || 0 }))
        .toString(),
    };
    this.service.getMedicineList(obj).subscribe(
      (r1) => {
        let response = r1 as any;
        if (response.Message == ConstantData.SuccessMessage) {
          this.MedicineList = response.MedicineList;
          this.MedicineDetailList = this.MedicineList.slice(0, 50);

          if (MedicineId && MedicineId > 0) {
            const found = this.MedicineList.find((e: any) => e.MedicineId == MedicineId);
            if (found) {
              this.applySelectedMedicine(found);
            }
          } else if (MedicineName) {
            const foundByName = this.MedicineList.find(
              (e: any) => e.MedicineName && e.MedicineName.toLowerCase() === MedicineName.toLowerCase().trim()
            );
            if (foundByName) {
              this.applySelectedMedicine(foundByName);
            }
          }
        } else {
          this.toastr.error(response.Message);
        }
        this.dataLoading = false;
      },
      (err) => {
        this.toastr.error('Error Occurred while fetching data.');
        this.dataLoading = false;
      }
    );
  }

  applySelectedMedicine(SelectedMedicine: any) {
    this.PurchaseProduct.MedicineId = SelectedMedicine.MedicineId;
    this.PurchaseProduct.MedicineName = SelectedMedicine.MedicineName;
    this.PurchaseProduct.HSNCode = SelectedMedicine.HSNCode;
    this.PurchaseProduct.UnitId = SelectedMedicine.UnitId;
    this.PurchaseProduct.UnitName = SelectedMedicine.UnitName;
    this.PurchaseProduct.GSTId = SelectedMedicine.GSTId;
    this.PurchaseProduct.ManufacturerId = SelectedMedicine.ManufacturerId;
    this.PurchaseProduct.CategoryId = SelectedMedicine.CategoryId;
    this.PurchaseProduct.MedicineTypeId = SelectedMedicine.MedicineTypeId;
    this.PurchaseProduct.IsNewMedicine = false;
    if (this.PurchaseProduct.GSTId > 0 && this.Purchase.SupplierId > 0) {
      this.calculateGST(this.PurchaseProduct);
    }
  }

  isSubmittedPurchaseProduct: boolean = false;
  @ViewChild('formPurchaseProduct') formPurchaseProduct: NgForm;
  
  resetFormPurchaseProduct() {
    this.PurchaseProduct = {};
    this.PurchaseProduct.UnitId = '';
    this.PurchaseProduct.GSTId = '';
    this.PurchaseProduct.Quantity = 1;
    this.PurchaseProduct.FreeQunatity = 0;
    this.PurchaseProduct.DiscountPercent = 0;
    this.PurchaseProduct.DiscountAmount = 0;
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
      this.SupplierDetailList = this.SupplierList;
    }
  }

  afterSupplierSelected(event: any) {
    this.Purchase.SupplierId = event.option.id;
    this.Purchase.SupplierName = event.option.value;
  }

  clearSupplier() {
    this.SupplierDetailList = this.SupplierList;
    this.Purchase.SupplierId = null;
    this.Purchase.SupplierName = null;
  }

  filterMedicineList(value: any) {
    if (value) {
      const filterValue = value.toLowerCase();
      this.MedicineDetailList = this.MedicineList
        .filter((med) => med.MedicineName.toLowerCase().includes(filterValue))
        .slice(0, 50);
    } else {
      this.MedicineDetailList = this.MedicineList.slice(0, 50);
    }
  }

  afterMedicineSelected(event: any) {
    const selectedValue = event.option.value;
    const selectedId = event.option.id;

    // Check if user clicked the "Add New Medicine" option
    if (selectedId === 'new_medicine_opt' || 
        (!selectedId && selectedValue === this.PurchaseProduct.MedicineName && this.MedicineDetailList.length === 0)) {
      this.openNewMedicineModal();
      return;
    }

    if (typeof selectedId === 'string' && selectedId.startsWith('new_')) {
      this.openNewMedicineModal();
      return;
    }

    if (typeof selectedId === 'string') {
      this.PurchaseProduct.MedicineId = 0;
    } else {
      this.PurchaseProduct.MedicineId = selectedId;
    }
    this.PurchaseProduct.MedicineName = selectedValue;

    var SelectedMedicine = this.MedicineList.find(
      (x: any) => x.MedicineId == this.PurchaseProduct.MedicineId
    );

    if (SelectedMedicine) {
      this.applySelectedMedicine(SelectedMedicine);
    } else {
      this.openNewMedicineModal();
    }
  }

  clearMedicine() {
    this.MedicineDetailList = this.MedicineList.slice(0, 50);
    this.PurchaseProduct.MedicineId = null;
    this.PurchaseProduct.MedicineName = '';
    this.PurchaseProduct.HSNCode = '';
    this.PurchaseProduct.IsNewMedicine = false;
  }

  // Enable editing for a specific product in the list
  enableProductEdit(index: number) {
    this.PurchaseProductList[index].AllowEdit = true;
  }

  // Cancel editing and restore original data
  cancelProductEdit(index: number) {
    const original = this.PurchaseProductList[index].OriginalData;
    Object.assign(this.PurchaseProductList[index], original);
    this.PurchaseProductList[index].AllowEdit = false;
    this.calculateTotal();
  }

  // Mark that medicine data has been updated
  markMedicineUpdated(product: any) {
    product.UpdateMedicine = true;
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
        this.markMedicineUpdated(PurchaseProduct);
      } else {
        this.toastr.error('Supplier is required!!');
      }
    } else {
      this.toastr.error('Selected supplier has no GST No.');
    }
    this.changeCostAmount(PurchaseProduct);
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
    this.changeCostAmount(purchaseProductModel);
  }

  addPurchaseProduct() {
    this.isSubmittedPurchaseProduct = true;
    this.formPurchaseProduct.control.markAllAsTouched();
    
    if (this.formPurchaseProduct.invalid) {
      this.toastr.error('Fill Required Fields.');
      return;
    }
    
    if (
      this.PurchaseProduct.MedicineId == null 
    ) {
      this.toastr.error('Please Select Medicine ');
      return;
    }

    // Create a copy of the product
    const productCopy = JSON.parse(JSON.stringify(this.PurchaseProduct));
    productCopy.AllowEdit = false;
    productCopy.OriginalData = JSON.parse(JSON.stringify(productCopy));
    
    console.log(productCopy);
    
    this.PurchaseProductList.push(productCopy);
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
      this.Purchase.TotalCostAmount += parseFloat(purchase.CostAmount || 0);
      this.Purchase.TotalBasicAmount += parseFloat(purchase.BasicAmount || 0);
      this.Purchase.TotalDiscountAmount += parseFloat(
        purchase.DiscountAmount || 0
      );
      this.Purchase.TotalTaxableAmount += parseFloat(
        purchase.TaxableAmount || 0
      );
      this.Purchase.TotalCGSTAmount += parseFloat(purchase.CGSTAmount || 0);
      this.Purchase.TotalSGSTAmount += parseFloat(purchase.SGSTAmount || 0);
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
    
    if (!isPaidAmount)
      this.Purchase.PaidAmount = this.Purchase.TotalGrandTotal;
    this.Purchase.DuesAmount =
      this.Purchase.TotalGrandTotal - (this.Purchase.PaidAmount || 0);
  }

  RemovePurchaseProduct(index: number) {
    this.PurchaseProductList.splice(index, 1);
    this.calculateTotal();
  }

  savePurchase() {
    this.submitted = true;
    if (this.formPurchase.invalid) {
      this.toastr.warning('Fill all the Required Fields.', 'Invalid Form');
      return;
    }
    if (this.Purchase.PaidAmount == null) {
      this.toastr.warning('Paid Amount is required!!');
      return;
    }
    if (this.PurchaseProductList.length == 0) {
      this.toastr.warning('No product is added!!');
      return;
    }

    var data = {
      Purchase: this.Purchase,
      PurchaseProductList: this.PurchaseProductList,
      CreatedBy: this.staffLogin.StaffId,
      UpdatedBy: this.staffLogin.StaffId,
    };
    console.log( 'Saving Purchase:', data ); // Debug log

    const obj: RequestModel = {
      request: this.localService.encrypt(JSON.stringify(data)).toString(),
    };
    
    this.dataLoading = true;
    this.service.savePurchase(obj).subscribe(
      (r1) => {
        let response = r1 as any;
        if (response.Message == ConstantData.SuccessMessage) {
          if (this.isEditMode) {
            this.toastr.success(
              'Purchase updated successfully.',
              'Operation Success'
            );
          } else {
            this.toastr.success(
              'Purchase created successfully.',
              'Operation Success'
            );
            this.service.PrintMedicinePurchase(response.PurchaseId);
          }
          this.resetForm();
          this.resetFormPurchaseProduct();
          this.router.navigate(['/admin/medicine-purchase-list']);
        } else {
          this.toastr.error(response.Message);
        }
        this.dataLoading = false;
      },
      (err) => {
        this.toastr.error('Error Occurred while fetching data.');
        this.dataLoading = false;
      }
    );
  }
}