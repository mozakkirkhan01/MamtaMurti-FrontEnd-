import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { NgForm } from "@angular/forms";
declare var $: any;

import { AppService } from "../../utils/app.service";
import { ConstantData } from "../../utils/constant-data";
import { LocalService } from "../../utils/local.service";
import { LoadDataService } from '../../utils/load-data.service';
import { PaymentMode } from '../../utils/enum';
import { ActivatedRoute, Router } from '@angular/router';
import { ActionModel ,RequestModel ,StaffLoginModel } from '../../utils/interface';
import { Status , Gender} from '../../utils/enum';
import { ToastrService } from 'ngx-toastr';
import { debounceTime, Subject } from 'rxjs';

@Component({
  selector: 'app-medicine-sale',
  templateUrl: './medicine-sale.component.html',
  styleUrls: ['./medicine-sale.component.css']
})
export class MedicineSaleComponent implements OnInit {
  PaymentCollection: any = {};
  PaymentMedicine: any = {};
  PaymentMedicineList: any[] = [];
  employeeDetail: any;
  dataLoading: boolean = false;
  submitted: boolean;
  Elements: any = {};
  action: ActionModel = {} as ActionModel;
   staffLogin: StaffLoginModel = {} as StaffLoginModel;
  GenderList = this.loadData.GetEnumList(Gender);
  MedicineDetailList: any[];
  PatientListAll: any=[];
  PatientList: any;
  PatientDetailList: any=[];
  filteredPatientList: any=[];
  DoctorDetailList: any[];
  currentPayment: any=[];
    SelectedPaymentCollectionList: any[] = [];
  PaymentModeList = this.loadData.GetEnumList(PaymentMode);
  AllPaymentModeList = PaymentMode;
  searchInputChanged: Subject<string> = new Subject();

   

  constructor(
    private service: AppService,
    private localService: LocalService,
    private loadData: LoadDataService,
    private route: ActivatedRoute,
    private router: Router,    
     private toastr:ToastrService,
    
  ) { }

  ngOnInit(): void {
    this.staffLogin = this.localService.getEmployeeDetail();
    this.validiateMenu();
    this.getGSTList();
    this.getUnitList();
    this.getSearchPatientList();
    this.getSearchIPDPatientList();
    this.getSearchGeneralPatientList(0);
    this.getMedicineList();
    this.getDoctorList();
    this.getPatientList();
    this.employeeDetail = this.localService.getEmployeeDetail();
    this.resetForm();
    this.searchInputChanged.pipe(debounceTime(300)).subscribe(value => {
      this.filterMedicineList(value);
    });
    // var inputDivs: any = document.getElementsByTagName("ng-autocomplete");
    // this.Elements.InputMedicineAutoComplete = inputDivs['MedicineAutoComplete'].childNodes[0].childNodes[0].childNodes[0];
    this.resetFormPaymentMedicine();
    this.PaymentCollection.DiscOnBill = 0;
    console.log("yes here is data");
    this.route.queryParams.subscribe((params: any) => {
      this.PaymentCollection.PurchaseId = params.id;
      this.PaymentCollection.PaymentCollectionId = params.pid;
      this.PaymentCollection.PaymentMedicineId = params.did;
      // console.log(this.PaymentCollection.PaymentCollectionId);
      
      
      this.redUrl = params.redUrl;
      if (this.PaymentCollection.PaymentCollectionId > 0) {
        this.getSaleDetail(this.PaymentCollection.PaymentCollectionId);
        this.getUnitList();
      }
      else {
        this.PaymentCollection.PaymentCollectionId = 0;
      }
    });
  }
  onSearchInput(value: string) {
    this.searchInputChanged.next(value);
  }

  DoctorList: any[];
  getDoctorList() {
    this.dataLoading = true;
     var obj: RequestModel = {
      request: this.localService.encrypt(JSON.stringify({})).toString(),
    };
    this.service.getDoctorList(obj).subscribe(r1 => {
      let response = r1 as any;
      if (response.Message == ConstantData.SuccessMessage) {
        this.DoctorList = response.DoctorList;
      } else {
        this.toastr.error(response.Message);
      }
      this.dataLoading = false;
    }, (err => {
      this.toastr.error("Error Occured while fetching data.");
      this.dataLoading = false;
    }));
  }

  // afterDoctorSelected(selected: any) {
  //   this.PaymentCollection.RefferedBy = selected.DoctorId;
  //   this.PaymentCollection.RefferedByName = selected.DoctorName;
  // }

  // clearDoctor() {
  //   this.PaymentCollection.RefferedBy = null;
  //   this.PaymentCollection.RefferedByName = null;
  // }

  getSaleDetail(PaymentCollectionId: number) {

    this.dataLoading = true;
         var obj: RequestModel = {
      request: this.localService.encrypt(JSON.stringify({ PaymentCollectionId: PaymentCollectionId })).toString(),
    };
    this.service.getSaleDetail(obj).subscribe(r1 => {
      let response = r1 as any;
      if (response.Message == ConstantData.SuccessMessage) {
        this.PaymentCollection = response.PaymentCollection;
        this.PaymentCollection.PaymentDate = this.loadData.loadDateYMD(this.PaymentCollection.PaymentDate);
        this.PaymentMedicineList = response.PaymentMedicineList;
        this.SelectedPaymentCollectionList = response.SelectedPaymentCollectionList;
        console.log(this.PaymentMedicineList);
        console.log(this.PaymentCollection);
        
        
        // this.PaymentMedicineList[0].UnitId = 23;
        // for (let i = 0; i < this.PaymentMedicineList.length; i++) {
        //   const e = this.PaymentMedicineList[i];
        //   //if (e.PaymentMedicineId == PaymentMedicineId) {
        //     const UnitId = e.UnitId;
        //     break;
        //   //}
        // }
      } else {
        this.toastr.error(response.Message);
      }
      this.dataLoading = false;
    }, (err => {
      this.toastr.error("Error Occured while fetching data.");
      this.dataLoading = false;
    }));
  }

  validiateMenu() {
    var obj: RequestModel = {
      request: this.localService.encrypt(JSON.stringify({ Url:"/admin/patient-medicine-sale",StaffLoginId:this.staffLogin.StaffLoginId })).toString()
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


  keyPress(event: any) {
    var keycode = (event.keyCode ? event.keyCode : event.which);
    if (keycode == '43') {
      this.addMedicine();
      setTimeout(() => {
        this.PaymentMedicine = {};
      }, 100);
    } else if (event.ctrlKey && keycode == "10") {
      if (this.PaymentCollection.SearchPatient && this.PaymentMedicineList.length > 0) {
        this.saveMedicalPayment();
      } else {
        if (this.Elements.InputPatientAutoComplete == null) {
          var inputDivs: any = document.getElementsByTagName("ng-autocomplete");
          this.Elements.InputPatientAutoComplete = inputDivs['PatientAutoComplete'].childNodes[0].childNodes[0].childNodes[0];
        }
        this.Elements.InputPatientAutoComplete.focus();
      }
    }
    // if (keycode == '13') {
    //   if (event.currentTarget.name == 'MobileNo') {
    //     // const ele = this.formProductElement.nativeElement[0];
    //     // if (ele)
    //     //   ele.focus();
    //   } else if (event.currentTarget.name == 'Quantity') {
    //     // const ele = this.formProductElement.nativeElement['addProduct'];
    //     // if (ele)
    //     //   ele.focus();
    //   }
    // }
  }

  @ViewChild('formPaymentCollection') formPaymentCollection: NgForm;
  resetForm() {
    this.PaymentMedicineList = [];
    this.PaymentCollection = {};
    this.PaymentCollection.PaymentMode = 1;
    this.PaymentCollection.RefferedByName = "SELF";
    this.PaymentCollection.BillingOf = 1;
    this.PaymentCollection.PaymentDate = this.loadData.loadDateYMD(new Date());
    if (this.formPaymentCollection) {
      this.formPaymentCollection.control.markAsPristine();
      this.formPaymentCollection.control.markAsUntouched();
    }
    this.submitted = false;
    this.Elements.InputPatientAutoComplete = null;
  }

  isSubmittedPaymentMedicine: boolean = false;
  @ViewChild('formPaymentMedicine') formPaymentMedicine: NgForm;
  resetFormPaymentMedicine() {
    this.PaymentMedicine = {};
    this.PaymentMedicine.UnitId = "";
    this.PaymentMedicine.GSTId = "";
    if (this.formPaymentMedicine) {
      this.formPaymentMedicine.control.markAsPristine();
      this.formPaymentMedicine.control.markAsUntouched();
    }
    this.isSubmittedPaymentMedicine = false;
    //this.Elements.InputMedicineAutoComplete.focus();
  }

  // afterMedicineSelected(selected: any) {
  //   this.PaymentMedicine.MedicineId = selected.MedicineId;
  //   this.PaymentMedicine.UnitId = selected.UnitId;
  //   //this.PaymentMedicine.UnitId = 5;
  //   this.PaymentMedicine.UnitName = selected.UnitName;
  //   this.PaymentMedicine.HSNCode = selected.HSNCode;
  //   this.PaymentMedicine.SearchMedicine = selected.SearchMedicine;
  //   this.getMedicineStockList();
  // }

  // clearMedicine() {
  //   this.PaymentMedicine.MedicineId = null;
  //   this.PaymentMedicine.UnitId = null;
  //   this.PaymentMedicine.HSNCode = null;
  //   this.PaymentMedicine.SearchMedicine = null;
  //   this.PaymentMedicine.UnitName = null;
  // }

  addMedicine() {
    this.MedicineStockList.forEach(x => {
      if (x.Quantity > 0) {
        //var newQty = x.Quantity * x.UnitValue;
        x.SearchMedicine = this.PaymentMedicine.SearchMedicine;
        x.HSNCode = this.PaymentMedicine.HSNCode;
        this.PaymentMedicineList.push(x);
      }
    });
    this.MedicineStockList = [];
    if (this.PaymentCollection.PaymentCollectionId == 0)
      this.PaymentMedicine = {};
    this.calulateTotal();
    this.Elements.InputMedicineAutoComplete.focus();
  }

  removePaymentMedicine(index: number) {
    this.PaymentMedicineList.splice(index, 1);
    this.calulateTotal();
    this.Elements.InputMedicineAutoComplete.focus();
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
getMedicineList(){
    this.dataLoading = true;
    var obj: RequestModel = {
      request: this.localService
        .encrypt(JSON.stringify({}))
        .toString(),
    };
    this.service.getMedicineList(obj).subscribe(
      (r1) => {
        let response = r1 as any;
        if (response.Message == ConstantData.SuccessMessage) {
          this.MedicineList = response.MedicineList;

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

  MedicineStockList: any[] = [];
  getMedicineStockList() {
    var data = {
      MedicineId: this.PaymentMedicine.MedicineId,
    }
     var obj: RequestModel = {
      request: this.localService.encrypt(JSON.stringify(data)).toString(),
    };
    this.dataLoading = true;
    this.service.getMedicineStockListForSell(obj).subscribe(r1 => {
      let response = r1 as any;
      if (response.Message == ConstantData.SuccessMessage) {
        this.MedicineStockList = response.MedicineStockList;
        
        this.MedicineStockList.forEach(e1 => {
          //e1.SellingUnitId = 5;
          e1.UnitId = 5;
          e1.SellingUnitId = e1.UnitId;
          e1.UnitList = this.UnitList.filter(x2 => x2.UnitId == e1.UnitId || x2.Value == 1);
          //e1.UnitList = this.UnitList.filter(x2 => x2.UnitId == e1.UnitId || x2.Value == 1);
        });
        // this.MedicineStockList.map(x1 => x1.SellingUnitId = `${x1.Name} - ${x1.HSNCode}`)
      } else {
        this.toastr.error(response.Message);
      }
      this.dataLoading = false;
    }, (err => {
      this.toastr.error("Error Occured while fetching data.");
      this.dataLoading = false;
    }));
  }

  changeQuantity(PaymentMedicineModel: any, IsDiscountAmountChange?: boolean) {
    PaymentMedicineModel.Unit = {};
    for (var i = 0; i < this.UnitList.length; i++) {
      if (this.UnitList[i].UnitId == PaymentMedicineModel.UnitId) {
        PaymentMedicineModel.Unit = this.UnitList[i];
        PaymentMedicineModel.UnitValue = this.UnitList[i].Value;
        PaymentMedicineModel.UnitId = this.UnitList[i].UnitId;
        //PaymentMedicineModel.UnitId = 5;
        break;
      }
    }
    var newQty = this.loadData.round(PaymentMedicineModel.Quantity * PaymentMedicineModel.UnitValue, 2);
    if (newQty > PaymentMedicineModel.AvailableQuantity) {
      this.toastr.error("Quantity should be less than Available Quantity")
      PaymentMedicineModel.Quantity = 0;
      return;
    }
    if (PaymentMedicineModel.Unit.Value != PaymentMedicineModel.PurchaseUnitValue)
      PaymentMedicineModel.Amount = this.loadData.round(PaymentMedicineModel.MRP * PaymentMedicineModel.Unit.Value / PaymentMedicineModel.PurchaseUnitValue, 2);
    else
      PaymentMedicineModel.Amount = PaymentMedicineModel.MRP;
    PaymentMedicineModel.BasicAmount = this.loadData.round(PaymentMedicineModel.Quantity * PaymentMedicineModel.Amount, 2);

    if (IsDiscountAmountChange) {
      PaymentMedicineModel.DiscountPercentages = this.loadData.round(PaymentMedicineModel.DiscountAmount * 100 / PaymentMedicineModel.TotalAmount, 2);
    } else if (PaymentMedicineModel.DiscountPercentages > 0) {
      PaymentMedicineModel.DiscountAmount = this.loadData.round(PaymentMedicineModel.BasicAmount * PaymentMedicineModel.DiscountPercentages / 100, 2);
    }
    else if (PaymentMedicineModel.DiscountPercentages == 0) {
      PaymentMedicineModel.DiscountAmount = this.loadData.round(PaymentMedicineModel.BasicAmount * PaymentMedicineModel.DiscountPercentages / 100, 2);
    }

    PaymentMedicineModel.TotalAmount = this.loadData.round((PaymentMedicineModel.Quantity * PaymentMedicineModel.Amount) - (PaymentMedicineModel.DiscountAmount > 0 ? PaymentMedicineModel.DiscountAmount : 0), 2);
    this.calculateGST(PaymentMedicineModel);
  }

  calculateGST(PaymentMedicine: any) {
    PaymentMedicine.TotalGSTAmount = 0;
    if (PaymentMedicine.GSTId > 0) {
      var selectedGST = this.GSTList.filter(x => x.GSTId == PaymentMedicine.GSTId)[0];
      PaymentMedicine.GSTName = selectedGST.GSTName;
      PaymentMedicine.TotalGSTAmount = this.loadData.round(PaymentMedicine.TotalAmount - (PaymentMedicine.TotalAmount * 100 / (100 + selectedGST.GSTValue)), 2);
      PaymentMedicine.CGSTAmount = this.loadData.round(PaymentMedicine.TotalGSTAmount / 2, 2);
      PaymentMedicine.SGSTAmount = this.loadData.round(PaymentMedicine.TotalGSTAmount / 2, 2);
      PaymentMedicine.IGSTAmount = 0;
    }
    PaymentMedicine.TaxableAmount = this.loadData.round(PaymentMedicine.TotalAmount - PaymentMedicine.TotalGSTAmount, 2);
    this.calulateTotal();
  }

  changeDiscountAmount(PaymentMedicineModel: any) {
    PaymentMedicineModel.DiscountPercentages = this.loadData.round(PaymentMedicineModel.DiscountAmount * 100 / PaymentMedicineModel.BasicAmount, 2);
  }

  // changeDiscountPercentage(PaymentMedicineModel:any){
  //   this.changeQuantity(PaymentMedicineModel)
  // }

  calulateTotal(isPaidAmount?: boolean) {
    this.PaymentCollection.DueAmount = 0;
    this.PaymentCollection.DiscOnBill = 0;
    this.PaymentCollection.TotalAmount = 0;
    this.PaymentCollection.DiscountAmount = 0;
    this.PaymentCollection.CGSTAmount = 0;
    this.PaymentCollection.SGSTAmount = 0;
    this.PaymentCollection.IGSTAmount = 0;
    this.PaymentCollection.PayableAmount = 0;
    this.PaymentCollection.AfterDueAmount = 0;
    // this.PaymentMedicineList.forEach(p1 => {
    //   this.PaymentCollection.TotalAmount += p1.TaxableAmount;
    //   this.PaymentCollection.DiscountAmount += p1.DiscountAmount > 0 ? p1.DiscountAmount : 0;
    //   this.PaymentCollection.CGSTAmount += p1.CGSTAmount > 0 ? p1.CGSTAmount : 0;
    //   this.PaymentCollection.SGSTAmount += p1.SGSTAmount > 0 ? p1.SGSTAmount : 0;
    //   this.PaymentCollection.IGSTAmount += p1.IGSTAmount > 0 ? p1.IGSTAmount : 0;
    //   this.PaymentCollection.PayableAmount += p1.TotalAmount;
    // });
    // //if (this.PaymentCollection.PaidAmount != null && this.PaymentCollection.PaidAmount != undefined)
    // this.PaymentCollection.CGSTAmount = this.loadData.round(this.PaymentCollection.CGSTAmount, 2);
    // this.PaymentCollection.SGSTAmount = this.loadData.round(this.PaymentCollection.SGSTAmount, 2);
    // this.PaymentCollection.IGSTAmount = this.loadData.round(this.PaymentCollection.IGSTAmount, 2);
    // this.PaymentCollection.RoundOffPayableAmount = this.loadData.round(this.PaymentCollection.PayableAmount);

    // if (!isPaidAmount && this.PaymentCollection.BillingOf != 2) {
    //   this.PaymentCollection.PaidAmount = this.PaymentCollection.RoundOffPayableAmount;
    //   this.PaymentCollection.DueAmount = this.loadData.round(this.PaymentCollection.RoundOffPayableAmount - this.PaymentCollection.PaidAmount, 2);
    // }
    // else{
    //   this.PaymentCollection.PaymentMode = 4;
    //   this.PaymentCollection.PaidAmount = 0;
    //   this.PaymentCollection.DueAmount = this.loadData.round(this.PaymentCollection.RoundOffPayableAmount - this.PaymentCollection.PaidAmount, 2);
    // }

    if (this.PaymentCollection.BillingOf != 2) {
      this.PaymentMedicineList.forEach(p1 => {
        this.PaymentCollection.TotalAmount += p1.TaxableAmount;
        this.PaymentCollection.DiscountAmount += p1.DiscountAmount > 0 ? p1.DiscountAmount : 0;
        this.PaymentCollection.CGSTAmount += p1.CGSTAmount > 0 ? p1.CGSTAmount : 0;
        this.PaymentCollection.SGSTAmount += p1.SGSTAmount > 0 ? p1.SGSTAmount : 0;
        this.PaymentCollection.IGSTAmount += p1.IGSTAmount > 0 ? p1.IGSTAmount : 0;
        this.PaymentCollection.PayableAmount += p1.TotalAmount;
      });
      //if (this.PaymentCollection.PaidAmount != null && this.PaymentCollection.PaidAmount != undefined)
      this.PaymentCollection.CGSTAmount = this.loadData.round(this.PaymentCollection.CGSTAmount, 2);
      this.PaymentCollection.SGSTAmount = this.loadData.round(this.PaymentCollection.SGSTAmount, 2);
      this.PaymentCollection.IGSTAmount = this.loadData.round(this.PaymentCollection.IGSTAmount, 2);
      this.PaymentCollection.NetPayableAmount = this.loadData.round(this.PaymentCollection.PayableAmount);

      if (!isPaidAmount) {
        if (this.PaymentCollection.DiscOnBill > 0) {
          this.PaymentCollection.PayableAmount = (this.PaymentCollection.NetPayableAmount - this.PaymentCollection.DiscOnBill);
          this.currentPayment.PaidAmount = (this.PaymentCollection.NetPayableAmount - this.PaymentCollection.DiscOnBill);
          
        }
        else {
          this.PaymentCollection.PayableAmount = (this.PaymentCollection.NetPayableAmount);
          this.currentPayment.PaidAmount = (this.PaymentCollection.NetPayableAmount);
        }
      }
      this.PaymentCollection.PaymentMode = 1;
      this.PaymentCollection.DueAmount = this.loadData.round(this.PaymentCollection.NetPayableAmount - this.PaymentCollection.PayableAmount - this.PaymentCollection.DiscOnBill, 2)??0;


    }

    // else {
    //   this.PaymentMedicineList.forEach(p1 => {
    //     this.PaymentCollection.TotalAmount += p1.TaxableAmount;
    //     this.PaymentCollection.DiscountAmount += p1.DiscountAmount > 0 ? p1.DiscountAmount : 0;
    //     this.PaymentCollection.CGSTAmount += p1.CGSTAmount > 0 ? p1.CGSTAmount : 0;
    //     this.PaymentCollection.SGSTAmount += p1.SGSTAmount > 0 ? p1.SGSTAmount : 0;
    //     this.PaymentCollection.IGSTAmount += p1.IGSTAmount > 0 ? p1.IGSTAmount : 0;
    //     this.PaymentCollection.PayableAmount += p1.TotalAmount;
    //   });
    //   //if (this.PaymentCollection.PaidAmount != null && this.PaymentCollection.PaidAmount != undefined)
    //   this.PaymentCollection.CGSTAmount = this.loadData.round(this.PaymentCollection.CGSTAmount, 2);
    //   this.PaymentCollection.SGSTAmount = this.loadData.round(this.PaymentCollection.SGSTAmount, 2);
    //   this.PaymentCollection.IGSTAmount = this.loadData.round(this.PaymentCollection.IGSTAmount, 2);
    //   this.PaymentCollection.NetPayableAmount = this.loadData.round(this.PaymentCollection.PayableAmount);

    //   if (!isPaidAmount)
    //     this.PaymentCollection.PaidAmount = 0;
    //   if (this.PaymentCollection.DiscOnBill > 0) {
    //     this.PaymentCollection.AfterDueAmount = (this.PaymentCollection.NetPayableAmount - this.PaymentCollection.DiscOnBill);
    //   }
    //   else {
    //     this.PaymentCollection.AfterDueAmount = (this.PaymentCollection.NetPayableAmount);
    //   }
    //   this.PaymentCollection.PaymentMode = 4;
    //   this.PaymentCollection.DueAmount = this.loadData.round(this.PaymentCollection.AfterDueAmount, 2);
    // }

    else {
      this.PaymentMedicineList.forEach(p1 => {
        this.PaymentCollection.TotalAmount += p1.TaxableAmount;
        this.PaymentCollection.DiscountAmount += p1.DiscountAmount > 0 ? p1.DiscountAmount : 0;
        this.PaymentCollection.CGSTAmount += p1.CGSTAmount > 0 ? p1.CGSTAmount : 0;
        this.PaymentCollection.SGSTAmount += p1.SGSTAmount > 0 ? p1.SGSTAmount : 0;
        this.PaymentCollection.IGSTAmount += p1.IGSTAmount > 0 ? p1.IGSTAmount : 0;
        this.PaymentCollection.PayableAmount += p1.TotalAmount;
      });
    
      this.PaymentCollection.CGSTAmount = this.loadData.round(this.PaymentCollection.CGSTAmount, 2);
      this.PaymentCollection.SGSTAmount = this.loadData.round(this.PaymentCollection.SGSTAmount, 2);
      this.PaymentCollection.IGSTAmount = this.loadData.round(this.PaymentCollection.IGSTAmount, 2);
      this.PaymentCollection.NetPayableAmount = this.loadData.round(this.PaymentCollection.PayableAmount);
    
      // Initial load when `isPaidAmount` is false
      if (!isPaidAmount) {
        this.PaymentCollection.PaidAmount = 0; // Initialize PaidAmount as 0
        if (this.PaymentCollection.DiscOnBill > 0) {
          this.PaymentCollection.AfterDueAmount = (this.PaymentCollection.NetPayableAmount - this.PaymentCollection.DiscOnBill);
        } else {
          this.PaymentCollection.AfterDueAmount = this.PaymentCollection.NetPayableAmount;
        }
        this.PaymentCollection.PaymentMode = 4;
        this.PaymentCollection.DueAmount = this.loadData.round(this.PaymentCollection.AfterDueAmount, 2)??0; // Set DueAmount initially

      } 
      
      // Recalculate when PaidAmount is updated
      else {
        if (this.PaymentCollection.PaidAmount > 0) {
          // Recalculate DueAmount when PaidAmount is updated by user
          this.PaymentCollection.DueAmount = this.loadData.round(this.PaymentCollection.NetPayableAmount - this.PaymentCollection.PaidAmount - this.PaymentCollection.DiscOnBill, 2)??0;

        } else {
          // If PaidAmount is still 0 or undefined, retain the original logic
          if (this.PaymentCollection.DiscOnBill > 0) {
            this.PaymentCollection.AfterDueAmount = this.PaymentCollection.NetPayableAmount - this.PaymentCollection.DiscOnBill;
          } else {
            this.PaymentCollection.AfterDueAmount = this.PaymentCollection.NetPayableAmount;
          }
          this.PaymentCollection.DueAmount = this.loadData.round(this.PaymentCollection.AfterDueAmount, 2)??0;

        }
      }
    }
    this.PaymentCollection.CGST = this.PaymentCollection.CGSTAmount;
    this.PaymentCollection.SGST = this.PaymentCollection.SGSTAmount;
    this.PaymentCollection.IGST = this.PaymentCollection.IGSTAmount;
    this.PaymentCollection.TotalAmount = this.PaymentCollection.NetPayableAmount;
    
    
  }


  AllGeneralPatientList: any[] = [];
  getSearchGeneralPatientList(GeneralPatientId: number) {
    var data = {
      IsPatient: true,
    }
    this.dataLoading = true;
     var obj: RequestModel = {
      request: this.localService.encrypt(JSON.stringify(data)).toString(),
    };
    this.service.getSearchGeneralPatientList(obj).subscribe(r1 => {
      let response = r1 as any;
      if (response.Message == ConstantData.SuccessMessage) {
        this.AllGeneralPatientList = response.AllPatientList;
        for (let i = 0; i < this.AllGeneralPatientList.length; i++) {
          const e = this.AllGeneralPatientList[i];
          if (e.GeneralPatientId == GeneralPatientId) {
            this.PaymentMedicine.GenerealPatientAutoComplete = e;
            this.PaymentCollection.GeneralPatientId = e.GeneralPatientId;
            this.PaymentCollection.SearchPatient = e.SearchPatient;
            break;
          }
        }
      } else {
        this.toastr.error(response.Message);
      }
      this.dataLoading = false;
    }, (err => {
      this.toastr.error("Error Occured while fetching data.");
      this.dataLoading = false;
    }));
  }

  afterGeneralPatientSelected(item: any) {
    this.PaymentCollection.GeneralPatientId = item.GeneralPatientId;
    //this.PaymentCollection.IPDPatientId = item.IPDPatientId;
    this.PaymentCollection.SearchPatient = item.SearchPatient;
  }

  clearGeneralPatient() {
    this.PaymentCollection.GeneralPatientId = null;
    this.PaymentCollection.SearchPatient = null;
    //this.PaymentCollection.IPDPatientId = null;
  }


  AllIPDPatientList: any[] = [];
  getSearchIPDPatientList() {
    var data = {
      //IsPatient: true,
      IsIPDPatient: true,
    }
    this.dataLoading = true;
     var obj: RequestModel = {
      request: this.localService.encrypt(JSON.stringify(data)).toString(),
    };
    this.service.getSearchPatientList(obj).subscribe(r1 => {
      let response = r1 as any;
      if (response.Message == ConstantData.SuccessMessage) {
        this.AllIPDPatientList = response.AllPatientList;
      } else {
        this.toastr.error(response.Message);
      }
      this.dataLoading = false;
    }, (err => {
      this.toastr.error("Error Occured while fetching data.");
      this.dataLoading = false;
    }));
  }

  afterIPDPatientSelected(item: any) {
    //this.PaymentCollection.PatientId = item.PatientId;
    this.PaymentCollection.IPDPatientId = item.IPDPatientId;
    this.PaymentCollection.SearchPatient = item.SearchPatient;
  }

  clearIPDPatient() {
    //this.PaymentCollection.PatientId = null;
    this.PaymentCollection.SearchPatient = null;
    this.PaymentCollection.IPDPatientId = null;
  }



  AllPatientList: any[] = [];
  getSearchPatientList() {
    var data = {
      //IsPatient: true,
      IsOPDPatient: true,
    }

    this.dataLoading = true;
     var obj: RequestModel = {
      request: this.localService.encrypt(JSON.stringify(data)).toString(),
    };
    this.service.getSearchPatientList(obj).subscribe(r1 => {
      let response = r1 as any;
      if (response.Message == ConstantData.SuccessMessage) {
        this.AllPatientList = response.AllPatientList;
      } else {
        this.toastr.error(response.Message);
      }
      this.dataLoading = false;
    }, (err => {
      this.toastr.error("Error Occured while fetching data.");
      this.dataLoading = false;
    }));
  }

  // afterPatientSelected(item: any) {
  //   //this.PaymentCollection.PatientId = item.PatientId;
  //   this.PaymentCollection.OPDPatientId = item.OPDPatientId;
  //   this.PaymentCollection.SearchPatient = item.SearchPatient;
  // }

  // clearPatient() {
  //   //this.PaymentCollection.PatientId = null;
  //   this.PaymentCollection.SearchPatient = null;
  //   this.PaymentCollection.OPDPatientId = null;
  // }

  openPatientForm() {
    $('#modal_popUp').modal('show')
  }

  patient: any = {};

  resetPatient() {
    this.patient = {};
  }
  redUrl: string;

  savePatient() {
    this.submitted = true;
    this.dataLoading = true;
     var obj: RequestModel = {
      request: this.localService.encrypt(JSON.stringify(this.patient)).toString(),
    };
    this.service.saveGeneralPatient(obj).subscribe(r1 => {
      let response = r1 as any;
      if (response.Message == ConstantData.SuccessMessage) {
        this.toastr.success("Patient record created successfully.", "Operation Success");
        //this.service.printDayCareBill(response.OPDPatientId);
        //this.service.printDichargeSummary(response.OPDPatientId);
        if (this.redUrl)
          this.router.navigate([this.redUrl]);
        var empId = this.employeeDetail.EmployeeId;
        this.resetPatient();
        //this.resetForm();
        this.employeeDetail.EmployeeId = empId;

        this.getSearchGeneralPatientList(response.GeneralPatientId);

        $('#modal_popUp').modal('hide')
      } else {
        this.toastr.error(response.Message);
      }
      this.dataLoading = false;
    }, (err => {
      this.toastr.error("Error Occured while fetching data.");
      this.dataLoading = false;
    }));
  }


  saveMedicalPayment() {
    this.submitted = true;
    this.formPaymentCollection.control.markAllAsTouched();
    if (this.formPaymentCollection.invalid) {
      this.toastr.warning("Fill all the Required Fields.", "Invailid Form")
      return;
    }
    if (this.PaymentCollection.PatientId == null) {
      this.toastr.warning("Invalid Patients!!");
      return;
    }

    if (this.PaymentCollection.PayableAmount == null) {
      this.toastr.warning("Paid  Amount is required!!");
      return;
    }
    if (this.PaymentMedicineList.length == 0) {
      this.toastr.warning("No product is added!!");
      return;
    }
    var data = {
      PaymentCollection: this.PaymentCollection,
      PaymentMedicineList: this.PaymentMedicineList,
      EmployeeId: this.staffLogin.StaffId,
      GetPaymentDetails: this.SelectedPaymentCollectionList,
    }
    
    this.dataLoading = true;
     var obj: RequestModel = {
      request: this.localService.encrypt(JSON.stringify(data)).toString(),
    };
    this.service.saveMedicalPayment(obj).subscribe(r1 => {
      let response = r1 as any;
      if (response.Message == ConstantData.SuccessMessage) {
        this.toastr.success("One record created successfully.", "Operation Success");
        
          this.service.printMedicineReciept(response.PaymentCollectionId);
        this.resetForm();
        this.resetFormPaymentMedicine();
      } else {
        this.toastr.error(response.Message);
      }
      this.dataLoading = false;
    }, (err => {
      this.toastr.error("Error Occured while fetching data.");
      this.dataLoading = false;
    }));
  }

  filterMedicineList(value: any) {
    if (value) {
      const filterValue = value.toLowerCase();
      this.MedicineDetailList = this.MedicineList
      .filter(med => med.MedicineName.toLowerCase().includes(filterValue))
      .slice(0, 50);
    } else {
      this.MedicineDetailList = this.MedicineList.slice(0, 50);
    }
  }

  afterMedicineSelected(event: any) {
    this.PaymentMedicine.MedicineId = event.option.id;
    this.PaymentMedicine.MedicineName = event.option.value;
    var SelectedMedicine = this.MedicineDetailList.find(
      (x: any) => x.MedicineId == this.PaymentMedicine.MedicineId
    );
  this.PaymentMedicine.MedicineId = SelectedMedicine.MedicineId;
    this.PaymentMedicine.UnitId = SelectedMedicine.UnitId;
    this.PaymentMedicine.UnitName = SelectedMedicine.UnitName;
    this.PaymentMedicine.HSNCode = SelectedMedicine.HSNCode;
    this.PaymentMedicine.SearchMedicine = SelectedMedicine.SearchMedicine;
    this.getMedicineStockList();
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
    this.MedicineDetailList = this.MedicineList.slice(0, 50);
    this.PaymentMedicine.MedicineId = null;
    this.PaymentMedicine.MedicineName = null;
    this.PaymentMedicine.UnitId = null;
    this.PaymentMedicine.HSNCode = null;
    this.PaymentMedicine.SearchMedicine = null;
    this.PaymentMedicine.UnitName = null;
    this.MedicineStockList = [];
  }
  addToPaymentList() {
  if (
    
    this.currentPayment.PaidAmount != null &&
    this.currentPayment.PaymentMode
  ) {
    // Calculate the sum of already paid amounts
    const totalPaid = this.SelectedPaymentCollectionList.reduce(
      (sum, payment) => sum + (payment.PaidAmount || 0),
      0
    );

    // Calculate remaining amount
    const remainingAmount = this.PaymentCollection.PayableAmount - totalPaid;

    // Validate that PaidAmount does not exceed remaining
    if (this.currentPayment.PaidAmount > remainingAmount) {
      alert('Paid amount cannot exceed remaining payable amount!');
      this.currentPayment.PaidAmount = remainingAmount;
      return;
    }

    // Push a copy of the current payment into the list
    this.SelectedPaymentCollectionList.push({ ...this.currentPayment });

    // Calculate the new remaining amount after this payment
    const newTotalPaid = totalPaid + this.currentPayment.PaidAmount;
    const newRemainingAmount = this.PaymentCollection.PayableAmount - newTotalPaid;

    // Reset currentPayment
    this.currentPayment = {
      Remarks: '',
      PaymentMode: '',
      PaidAmount: newRemainingAmount > 0 ? newRemainingAmount : 0
    };
  } else {
    alert('Please fill all fields!');
  }
}

removePaymentItem(index: number) {
  const removedItem = this.SelectedPaymentCollectionList[index];

  // Restore the amount to currentPayment.PaidAmount
  if (removedItem && removedItem.PaidAmount != null) {
    this.currentPayment.PaidAmount += removedItem.PaidAmount;
  }

  // Remove the item from the list
  this.SelectedPaymentCollectionList.splice(index, 1);
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
    
  }

  afterPatientSelected(event: any) {
    const selectedName = event.option.value;

    const selected = this.PatientList.find(
      (x: any) => x.PatientName === selectedName
    );

    if (selected) {
      this.PaymentMedicine = { ...selected }; 
         this.PaymentCollection.PatientId = selected.PatientID;
         
  }
  }

  clearPatient() {
    this.PatientDetailList = this.PatientList;
    // this.Patient.PackageCollectionId = null;
    this.PaymentMedicine.PatientName = '';
    
  }

  // getDoctorList() {
  //   const obj: RequestModel = {
  //     request: this.localService.encrypt(JSON.stringify({})).toString()
  //   };

  //   // console.log("Sending request:", obj);
  //   this.dataLoading = true;

  //   this.service.getDoctorList(obj).subscribe({
  //     next: r1 => {
  //       // console.log("API Response:", r1);
  //       let response = r1 as any;
  //       if (response.Message == ConstantData.SuccessMessage) {
  //         this.DoctorList = response.DoctorList;
  //         // console.log(this.DoctorList);
          
  //       } else {
  //         this.toastr.error(response.Message);
  //       }
  //       this.dataLoading = false;
  //     },
  //     error: err => {
  //       console.error("API error:", err);
  //       this.toastr.error("Error while fetching records");
  //       this.dataLoading = false;
  //     }
  //   });
  // }

  filterDoctorList(value: any) {
    if (value) {
      const DoctorfilterValue = value.toLowerCase();
      this.DoctorDetailList = this.DoctorList.filter((option: any) =>
        option.DoctorName.toLowerCase().includes(DoctorfilterValue)
      );
    } else {
      this.DoctorDetailList = this.DoctorList;
    }
  }

    afterDoctorSelected(event: any) {
    this.PaymentCollection.DoctorId = event.option.id;
    this.PaymentCollection.DoctorName = event.option.value;
    var selected = this.DoctorDetailList.find(
      (x: any) => x.DoctorId == this.PaymentCollection.DoctorId
    );
    this.PaymentCollection.DoctorName = selected.DoctorName;
    this.PaymentCollection.DoctorId = selected.DoctorId;
    this.PaymentCollection.RefferedBy = selected.DoctorId;
      this.PaymentCollection.RefferedByName = selected.DoctorName;
  }

   clearDoctor() {
    this.DoctorDetailList = this.DoctorList;
    this.PaymentCollection.DoctorId = null;
    this.PaymentCollection.DoctorName = "";
    this.PaymentCollection.RefferedBy = null;
    this.PaymentCollection.RefferedByName = null;
  }
}
