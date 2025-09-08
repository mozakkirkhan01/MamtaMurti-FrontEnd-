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
import { Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';


@Component({
  selector: 'app-medicine',
  templateUrl: './medicine.component.html',
  styleUrls: ['./medicine.component.css']
})
export class MedicineComponent implements OnInit {
  Medicine: any = {};
  employeeDetail: any;
  StatusList = this.loadData.GetEnumList(Status);
  AllStatusList = Status;
  MedicineList: any={};
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
  GstChargeList: any =[];
  CategoryChargeList: any =[];
  UnitChargeList: any =[];
  ManufacturerChargeList: any =[];
  MedicineTypeChargeList: any =[];
  CategoryList: any=[];
  UnitList: any=[];
  GSTList: any= [];
  ManufacturerList: any= [];
  MedicineTypeList: any=[];

  constructor(
    private service: AppService,
    private localService: LocalService,
    private loadData: LoadDataService,
    private router: Router,
     private toastr: ToastrService,
  ) { }

  ngOnInit(): void {
    this.staffLogin = this.localService.getEmployeeDetail();
    this.validiateMenu();
    this.getMedicineList();
    this.getCategoryList();
    this.getUnitList();
    this.getManufacturerList();
    this.getGSTList();
    this.getMedicineTypeList();
    this.resetForm();
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

  @ViewChild('formMedicine') formMedicine: NgForm;
  resetForm() {
    this.Medicine = {};
    this.Medicine.Status = 1;
    this.Medicine.UnitId = "";
    this.Medicine.GSTId = "";
    this.Medicine.CategoryId = "";
    this.Medicine.ManufacturerId = "";
    if (this.formMedicine) {
      this.formMedicine.control.markAsPristine();
      this.formMedicine.control.markAsUntouched();
    }
    this.submitted = false
  }

  newMedicine() {
    this.resetForm();
    $('#modal_popUp').modal('show');
  }

  editMedicine(obj: any) {
    this.Medicine = obj;
    $('#modal_popUp').modal('show');
  }

  onTableDataChange(p: any) {
    this.p = p;
  }

  sort(key: any) {
    this.sortKey = key;
    this.reverse = !this.reverse;
  }

getMedicineList() {
  
  var obj: RequestModel = {
    request: this.localService.encrypt(JSON.stringify({ })).toString()
  };
  console.log(obj);
  this.dataLoading = true;
  this.service.getMedicineList(obj).subscribe(r1 => {
    let response = r1 as any;
    if (response.Message == ConstantData.SuccessMessage) {
      this.MedicineList = response.MedicineList;
      console.log(response.MedicineList);
      
    } else {
      this.toastr.error(response.Message);
    }
    this.dataLoading = false;
  }, (err => {
    this.toastr.error("Error Occurred while fetching data.");
    this.dataLoading = false;
  }));
}



  // CategoryList: any[] = [];
  // getCategoryList() {
  //   this.dataLoading = true;
  //   this.service.getCategoryList({}).subscribe(r1 => {
  //     let response = r1 as any;
  //     if (response.Message == ConstantData.SuccessMessage) {
  //       this.CategoryList = response.CategoryList;
  //     } else {
  //       toastr.error(response.Message);
  //     }
  //     this.dataLoading = false;
  //   }, (err => {
  //     toastr.error("Error Occured while fetching data.");
  //     this.dataLoading = false;
  //   }));
  // }

  



  // UnitList: any[] = [];
  // getUnitList() {
  //   this.dataLoading = true;
  //   this.service.getUnitList({}).subscribe(r1 => {
  //     let response = r1 as any;
  //     if (response.Message == ConstantData.SuccessMessage) {
  //       this.UnitList = response.UnitList;
  //     } else {
  //       toastr.error(response.Message);
  //     }
  //     this.dataLoading = false;
  //   }, (err => {
  //     toastr.error("Error Occured while fetching data.");
  //     this.dataLoading = false;
  //   }));
  // }

 

  saveMedicine() {
    this.submitted = true;
    if (this.formMedicine.invalid) {
      this.toastr.warning("Fill all the Required Fields.", "Invailid Form")
      this.dataLoading = false;
      return;
    }
      this.Medicine.CreatedBy = this.staffLogin.StaffId;
    this.Medicine.UpdatedBy = this.staffLogin.StaffId;
    console.log(this.Medicine);
     var obj: RequestModel = {
         request: this.localService.encrypt(JSON.stringify(this.Medicine)).toString()
       }
    this.dataLoading = true;
    this.service.saveMedicine(obj).subscribe(r1 => {
      let response = r1 as any;
      if (response.Message == ConstantData.SuccessMessage) {
        if (this.Medicine.MedicineId > 0) {
          this.toastr.success("Medicine Updated detail successfully.");
          $('#modal_popUp').modal('hide');
        } else {
          this.toastr.success("Medicine created successfully.");
         this.dataLoading = false;
          $('#modal_popUp').modal('hide');
          this.Medicine.MedicineId = null;
          this.Medicine.Name = "";
          this.Medicine.HSNCode = "";
          if (this.formMedicine) {
            this.formMedicine.control.markAsPristine();
            this.formMedicine.control.markAsUntouched();
          }
          this.submitted = false
        }
        this.getMedicineList();
      } else {
        toastr.error(response.Message);
        this.dataLoading = false;
      }
    }, (err => {
      toastr.error("Error Occured while fetching data.");
      this.dataLoading = false;
    }));
  }

  // deleteMedicine(obj: any) {
  //   if (confirm("Are you sure want to delete this record") == true) {
  //     this.dataLoading = true;
  //     this.service.deleteMedicine(obj).subscribe(r1 => {
  //       let response = r1 as any;
  //       if (response.Message == ConstantData.SuccessMessage) {
  //         toastr.success("One record deleted successfully.");
  //         this.getMedicineList();
  //       } else {
  //         toastr.error(response.Message);
  //       }
  //       this.dataLoading = false;
  //     }, (err => {
  //       toastr.error("Error Occured while fetching data.");
  //       this.dataLoading = false;
  //     }));
  //   }
  // }

   deleteMedicine(obj: any) {
     if (confirm("Are your sure you want to delete this recored")) {
       var request: RequestModel = {
         request: this.localService.encrypt(JSON.stringify(obj)).toString()
       }
       this.dataLoading = true;
       this.service.deleteMedicine(request).subscribe(r1 => {
         let response = r1 as any
         if (response.Message == ConstantData.SuccessMessage) {
           this.toastr.success("Record Deleted successfully")
           this.getMedicineList()
         } else {
           this.toastr.error(response.Message)
           this.dataLoading = false;
         }
       }, (err => {
         this.toastr.error("Error occured while deleteing the recored")
         this.dataLoading = false;
       }))
     }
   }

    getGSTList() {
    const obj: RequestModel = {
      request: this.localService.encrypt(JSON.stringify({})).toString()
    };

    console.log("Sending request:", obj);
    this.dataLoading = true;

    this.service.getGSTList(obj).subscribe({
      next: r1 => {
        // console.log("API Response:", r1);
        let response = r1 as any;
        if (response.Message == ConstantData.SuccessMessage) {
          this.GSTList = response.GSTList;
          console.log(this.GSTList);
          
        } else {
          this.toastr.error(response.Message);
        }
        this.dataLoading = false;
      },
      error: err => {
        console.error("API error:", err);
        this.toastr.error("Error while fetching records");
        this.dataLoading = false;
      }
    });
  }

  getCategoryList() {
  const obj: RequestModel = {
    request: this.localService.encrypt(JSON.stringify({})).toString()
  };

  this.dataLoading = true;

  this.service.getCategoryList(obj).subscribe({
    next: r1 => {
      let response = r1 as any;
      if (response.Message == ConstantData.SuccessMessage) {
        this.CategoryList = response.CategoryList;
        console.log(this.CategoryList);
        
      } else {
        this.toastr.error(response.Message);
      }
      this.dataLoading = false;
    },
    error: err => {
      console.error("API error:", err);
      this.toastr.error("Error while fetching records");
      this.dataLoading = false;
    }
  });
}

    getUnitList() {
      const obj: RequestModel = {
        request: this.localService.encrypt(JSON.stringify({})).toString()
      };
  
      console.log("Sending request:", obj);
      this.dataLoading = true;
  
      this.service.getUnitList(obj).subscribe({
        next: r1 => {
          // console.log("API Response:", r1);
          let response = r1 as any;
          if (response.Message == ConstantData.SuccessMessage) {
            this.UnitList = response.UnitList;
            console.log(this.UnitList);
            
          } else {
            this.toastr.error(response.Message);
          }
          this.dataLoading = false;
        },
        error: err => {
          console.error("API error:", err);
          this.toastr.error("Error while fetching records");
          this.dataLoading = false;
        }
      });
    }

    getManufacturerList() {
   const obj: RequestModel = {
     request: this.localService.encrypt(JSON.stringify({})).toString()
   };
 
   this.dataLoading = true;
 
   this.service.getManufacturerList(obj).subscribe({
     next: r1 => {
       let response = r1 as any;
       if (response.Message == ConstantData.SuccessMessage) {
         this.ManufacturerList = response.ManufacturerList;
         console.log();
         
       } else {
         this.toastr.error(response.Message);
       }
       this.dataLoading = false;
     },
     error: err => {
       console.error("API error:", err);
       this.toastr.error("Error while fetching records");
       this.dataLoading = false;
     }
   });
 }

 getMedicineTypeList() {
  const obj: RequestModel = {
    request: this.localService.encrypt(JSON.stringify({})).toString()
  };

  this.dataLoading = true;

  this.service.getMedicineTypeList(obj).subscribe({
    next: r1 => {
      let response = r1 as any;
      if (response.Message == ConstantData.SuccessMessage) {
        this.MedicineTypeList = response.MedicineTypeList;
        console.log(response.MedicineTypeList);
        
      } else {
        this.toastr.error(response.Message);
      }
      this.dataLoading = false;
    },
    error: err => {
      console.error("API error:", err);
      this.toastr.error("Error while fetching records");
      this.dataLoading = false;
    }
  });
}

    filterGstList(value: any) {
    if (value) {
      const GSTfilterValue = value.toLowerCase();
      this.GstChargeList = this.GSTList.filter((option: any) =>
        option.GSTName.toLowerCase().includes(GSTfilterValue)
      );
    } else {
      this.GstChargeList = this.GSTList;
    }
  }

    afterGSTSelected(event: any) {
    this.Medicine.GSTId = event.option.id;
    this.Medicine.GSTName = event.option.value;
    var Transport = this.GstChargeList.find(
      (x: any) => x.GSTId == this.Medicine.GSTId
    );
    this.Medicine.GSTName = Transport.GSTName;
    this.Medicine.GSTId = Transport.GSTId;
  }

   clearGST() {
    this.GstChargeList = this.GSTList;
    this.Medicine.GSTId = null;
    this.Medicine.GSTName = "";
  }

      filterCategoryList(value: any) {
    if (value) {
      const CatfilterValue = value.toLowerCase();
      this.CategoryChargeList = this.CategoryList.filter((option: any) =>
        option.CategoryName.toLowerCase().includes(CatfilterValue)
      );
    } else {
      this.CategoryChargeList = this.CategoryList;
    }
  }

    afterCategorySelected(event: any) {
    this.Medicine.CategoryId = event.option.id;
    this.Medicine.CategoryName = event.option.value;
    var Transport = this.CategoryChargeList.find(
      (x: any) => x.CategoryId == this.Medicine.CategoryId
    );
    this.Medicine.CategoryName = Transport.CategoryName;
    this.Medicine.CategoryId = Transport.CategoryId;
  }

   clearCategory() {
    this.CategoryChargeList = this.CategoryList;
    this.Medicine.CategoryId = null;
    this.Medicine.CategoryName = "";
  }

      filterUnitList(value: any) {
    if (value) {
      const UnitfilterValue = value.toLowerCase();
      this.UnitChargeList = this.UnitList.filter((option: any) =>
        option.UnitName.toLowerCase().includes(UnitfilterValue)
      );
    } else {
      this.UnitChargeList = this.UnitList;
    }
  }

    afterUnitSelected(event: any) {
    this.Medicine.UnitId = event.option.id;
    this.Medicine.UnitName = event.option.value;
    var Transport = this.UnitChargeList.find(
      (x: any) => x.UnitId == this.Medicine.UnitId
    );
    this.Medicine.UnitName = Transport.UnitName;
    this.Medicine.UnitId = Transport.UnitId;
  }

   clearUnit() {
    this.UnitChargeList = this.UnitList;
    this.Medicine.UnitId = null;
    this.Medicine.UnitName = "";
  }


  


   filterManufacturerList(value: any) {
    if (value) {
      const ManfilterValue = value.toLowerCase();
      this.ManufacturerChargeList = this.ManufacturerList.filter((option: any) =>
        option.ManufacturerName.toLowerCase().includes(ManfilterValue)
      );
    } else {
      this.ManufacturerChargeList = this.ManufacturerList;
    }
  }

    afterManufacturerSelected(event: any) {
    this.Medicine.ManufacturerId = event.option.id;
    this.Medicine.ManufacturerName = event.option.value;
    var Transport = this.ManufacturerChargeList.find(
      (x: any) => x.ManufacturerId == this.Medicine.ManufacturerId
    );
    this.Medicine.ManufacturerName = Transport.ManufacturerName;
    this.Medicine.ManufacturerId = Transport.ManufacturerId;
  }

   clearManufacturer() {
    this.ManufacturerChargeList = this.ManufacturerList;
    this.Medicine.ManufacturerId = null;
    this.Medicine.ManufacturerName = "";
  }

   filterMedicineTypeList(value: any) {
    if (value) {
      const ManfilterValue = value.toLowerCase();
      this.MedicineTypeChargeList = this.MedicineTypeList.filter((option: any) =>
        option.MedicineTypeName.toLowerCase().includes(ManfilterValue)
      );
    } else {
      this.MedicineTypeChargeList = this.MedicineTypeList;
    }
  }

    afterMedicineTypeSelected(event: any) {
    this.Medicine.MedicineTypeId = event.option.id;
    this.Medicine.MedicineTypeName = event.option.value;
    var Transport = this.MedicineTypeChargeList.find(
      (x: any) => x.MedicineTypeId == this.Medicine.MedicineTypeId
    );
    this.Medicine.MedicineTypeName = Transport.MedicineTypeName;
    this.Medicine.MedicineTypeId = Transport.MedicineTypeId;
  }

   clearMedicineType() {
    this.MedicineTypeChargeList = this.MedicineTypeList;
    this.Medicine.MedicineTypeId = null;
    this.Medicine.MedicineTypeName = "";
  }


}

