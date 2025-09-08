import { Component, ViewChild } from '@angular/core';
import { ToastrService } from 'ngx-toastr';
import { AppService } from '../../utils/app.service';
import { ConstantData } from '../../utils/constant-data';
import { NgForm } from '@angular/forms';
import { LocalService } from '../../utils/local.service';
import { LoadDataService } from '../../utils/load-data.service';
import { Status } from '../../utils/enum';
import {
  ActionModel,
  RequestModel,
  StaffLoginModel,
} from '../../utils/interface';
import { Router } from '@angular/router';
declare var $: any;

@Component({
  selector: 'app-surgery-package',
  templateUrl: './surgery-package.component.html',
  styleUrls: ['./surgery-package.component.css'],
})
export class SurgeryPackageComponent {
  dataLoading: boolean = false;
  PackageDetialList: any = [];
  PackageDetial: any = {};
  ChargeList: any = []
  isSubmitted = false;
  StatusList = this.loadData.GetEnumList(Status);
  PageSize = ConstantData.PageSizes;
  p: number = 1;
  Search: string = '';
  reverse: boolean = false;
  sortKey: string = '';
  itemPerPage: number = this.PageSize[0];
  action: ActionModel = {} as ActionModel;
  staffLogin: StaffLoginModel = {} as StaffLoginModel;
  AllStatusList = Status;
  Product: any = {};
  PackageCollectionListall: any[] = [];
  constructor(
    private service: AppService,
    private toastr: ToastrService,
    private loadData: LoadDataService,
    private localService: LocalService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.staffLogin = this.localService.getEmployeeDetail();
    this.validiateMenu();
    this.getPackageDetial();
    this.resetForm();
    // this.PackageCollectiontypeList({})
  }

  validiateMenu() {
    var obj: RequestModel = {
      request: this.localService
        .encrypt(
          JSON.stringify({
            Url: this.router.url,
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

  @ViewChild('formDepartment') formPackageCollection: NgForm;
  resetForm() {
    this.PackageDetial = {};
    if (this.formPackageCollection) {
      this.formPackageCollection.control.markAsPristine();
      this.formPackageCollection.control.markAsUntouched();
    }
    this.isSubmitted = false;
    this.PackageDetial.Status = 1;
  }

  sort(key: any) {
    this.sortKey = key;
    this.reverse = !this.reverse;
  }

  onTableDataChange(p: any) {
    this.p = p;
  }

  getPackageDetial() {
    var obj: RequestModel = {
      request: this.localService.encrypt(JSON.stringify({})).toString(),
    };
    this.dataLoading = true;
    this.service.getPackageDetial(obj).subscribe(
      (r1) => {
        let response = r1 as any;
        if (response.Message == ConstantData.SuccessMessage) {
          this.PackageDetialList = response.PackageDetialList;
          // console.log(this.PackageDetialList);
        } else {
          this.toastr.error(response.Message);
        }
        this.dataLoading = false;
      },
      (err) => {
        this.toastr.error('Error while fetching records');
      }
    );
  }

  savePackageCollection() {
    this.isSubmitted = true;
    // this.formPackageCollection.control.markAllAsTouched();
    // if (this.formPackageCollection.invalid) {
    //   this.toastr.error("Fill all the required fields !!")
    //   return
    // }
    this.PackageDetial.CreatedBy = this.staffLogin.StaffId;
    this.PackageDetial.UpdatedBy = this.staffLogin.StaffId;

    console.log(this.PackageDetial);
    

    var obj: RequestModel = {
      request: this.localService
        .encrypt(JSON.stringify(this.PackageDetial))
        .toString(),
    };

    this.service.savePackageDetial(obj).subscribe(
      (r1) => {
        let response = r1 as any;
        if (response.Message == ConstantData.SuccessMessage) {
          if (this.PackageDetial.PackageDetialId > 0) {
            this.toastr.success('Package detail updated successfully');
          } else {
            this.toastr.success('Package Collection added successfully');
          }
          $('#staticBackdrop').modal('hide');
          this.resetForm();
          this.getPackageDetial();
        } else {
          this.toastr.error(response.Message);
        }
      },
      (err) => {
        this.toastr.error('Error occured while submitting data');
      }
    );
  }

  deletePackageDetial(obj: any) {
    if (confirm('Are your sure you want to delete this recored')) {
      var request: RequestModel = {
        request: this.localService.encrypt(JSON.stringify(obj)).toString(),
      };
      this.dataLoading = true;
      this.service.deletePackageDetial(request).subscribe(
        (r1) => {
          let response = r1 as any;
          if (response.Message == ConstantData.SuccessMessage) {
            this.toastr.success('Record Deleted successfully');
            this.getPackageDetial();
          } else {
            this.toastr.error(response.Message);
            this.dataLoading = false;
          }
        },
        (err) => {
          this.toastr.error('Error occured while deleteing the recored');
          this.dataLoading = false;
        }
      );
    }
  }

  editPackageCollection(obj: any) {
    this.resetForm();
    this.PackageDetial = obj;
  }

  

  afterPackageCollectionHeadSelected(item: any) {
    this.Product.PackageCollectionId = item.PackageCollectionId;
    this.Product.PackageName = item.PackageName;
  }


filterPackageCollectionList(value: string) {
  if (value) {
    const filterValue = value.toLowerCase();
    this.ChargeList = this.PackageCollectionListall.filter((option: any) =>
      option.PackageName.toLowerCase().includes(filterValue)
    );
  } else {
    this.ChargeList = this.PackageCollectionListall;
  }
}
afterPackageCollectionSelected(event: any) {
  const selectedPackage = this.ChargeList.find(
    (x: any) => x.PackageName === event.option.value
  );

  if (selectedPackage) {
    this.PackageDetial.PackageCatogeryName = selectedPackage.PackageCollectionId;
    this.PackageDetial.PackageName = selectedPackage.PackageName;
  }
}

  clearTransportSupplier() {
  this.ChargeList = this.PackageCollectionListall;
  this.PackageDetial.PackageCollectionId = null;
  this.PackageDetial.PackageName = '';
}
  PackageCollectiontypeList() {
    this.service.PackageCollectiontypeListAll({}).subscribe((res: any) => {
      this.PackageCollectionListall = res.PackageCollectionList || [];
      console.log(this.PackageCollectionListall);
    });
  }
}
