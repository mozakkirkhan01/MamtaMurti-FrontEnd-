import { Component, ViewChild } from '@angular/core';
import { NgForm } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';
import { AppService } from '../../utils/app.service';
import { ConstantData } from '../../utils/constant-data';
import { LoadDataService } from '../../utils/load-data.service';
import { Status } from '../../utils/enum';
import { ActionModel, RequestModel, StaffLoginModel } from '../../utils/interface';
import { LocalService } from '../../utils/local.service';
import { Router } from '@angular/router';
declare var $: any;

@Component({
  selector: 'app-dosage',
  templateUrl: './dosage.component.html',
  styleUrls: ['./dosage.component.css']
})
export class DosageComponent {

  dataLoading: boolean = false;
  DosageList: any = [];
  Dosage: any = {};
  isSubmitted = false;

  StatusList = this.loadData.GetEnumList(Status);
  AllStatusList = Status;

  PageSize = ConstantData.PageSizes;
  p: number = 1;
  Search: string = '';
  reverse: boolean = false;
  sortKey: string = '';
  itemPerPage: number = this.PageSize[0];

  action: ActionModel = {} as ActionModel;
  staffLogin: StaffLoginModel = {} as StaffLoginModel;

  constructor(
    private service: AppService,
    private toastr: ToastrService,
    private loadData: LoadDataService,
    private localService: LocalService,
    private router: Router
  ) { }

  ngOnInit(): void {
    this.staffLogin = this.localService.getEmployeeDetail();
    this.validiateMenu();
    this.getDosageList();
    this.resetForm();
  }

  validiateMenu() {
    var obj: RequestModel = {
      request: this.localService.encrypt(
        JSON.stringify({ Url: this.router.url, StaffLoginId: this.staffLogin.StaffLoginId })
      ).toString()
    };

    this.dataLoading = true;
    this.service.validiateMenu(obj).subscribe((response: any) => {
      this.action = this.loadData.validiateMenu(response, this.toastr, this.router);
      this.dataLoading = false;
    }, _ => {
      this.toastr.error("Error while fetching records");
      this.dataLoading = false;
    });
  }

  @ViewChild('formDosage') formDosage!: NgForm;

  resetForm() {
    this.Dosage = {};
    if (this.formDosage) {
      this.formDosage.control.markAsPristine();
      this.formDosage.control.markAsUntouched();
    }
    this.isSubmitted = false;
    this.Dosage.Status = 1;
  }

  sort(key: any) {
    this.sortKey = key;
    this.reverse = !this.reverse;
  }

  onTableDataChange(p: any) {
    this.p = p;
  }

  // ==========================
  // GET DOSAGE LIST
  // ==========================
  getDosageList() {
    var obj: RequestModel = {
      request: this.localService.encrypt(JSON.stringify({})).toString()
    };

    this.dataLoading = true;
    this.service.getDosageList(obj).subscribe((r1: any) => {
      if (r1.Message == ConstantData.SuccessMessage) {
        this.DosageList = r1.DosageList;
        console.log(this.DosageList);
        
      } else {
        this.toastr.error(r1.Message);
      }
      this.dataLoading = false;
    }, _ => {
      this.toastr.error("Error while fetching records");
      this.dataLoading = false;
    });
  }

  // ==========================
  // SAVE / UPDATE DOSAGE
  // ==========================
  saveDosage() {
    this.isSubmitted = true;
    this.formDosage.control.markAllAsTouched();

    if (this.formDosage.invalid) {
      this.toastr.error("Fill all the required fields !!");
      return;
    }

    var obj: RequestModel = {
      request: this.localService.encrypt(JSON.stringify(this.Dosage)).toString()
    };

    this.service.saveDosage(obj).subscribe((r1: any) => {
      if (r1.Message == ConstantData.SuccessMessage) {
        if (this.Dosage.DosageId > 0) {
          this.toastr.success("Dosage updated successfully");
          $('#staticBackdrop').modal('hide');
        } else {
          this.toastr.success("Dosage added successfully");
        }
        this.resetForm();
        this.getDosageList();
      } else {
        this.toastr.error(r1.Message);
      }
    }, _ => {
      this.toastr.error("Error occurred while submitting data");
    });
  }

  // ==========================
  // DELETE DOSAGE
  // ==========================
  deleteDosage(obj: any) {
    if (confirm("Are you sure you want to delete this record?")) {
      var request: RequestModel = {
        request: this.localService.encrypt(JSON.stringify(obj)).toString()
      };

      this.dataLoading = true;
      this.service.deleteDosage(request).subscribe((r1: any) => {
        if (r1.Message == ConstantData.SuccessMessage) {
          this.toastr.success("Record deleted successfully");
          this.getDosageList();
        } else {
          this.toastr.error(r1.Message);
        }
        this.dataLoading = false;
      }, _ => {
        this.toastr.error("Error occurred while deleting the record");
        this.dataLoading = false;
      });
    }
  }

  editDosage(obj: any) {
    this.resetForm();
    this.Dosage = { ...obj };
  }
}
