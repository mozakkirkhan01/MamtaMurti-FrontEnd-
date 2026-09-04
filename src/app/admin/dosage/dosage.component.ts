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
  DosageList: any[] = [];
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
    const obj: RequestModel = {
      request: this.localService.encrypt(
        JSON.stringify({
          Url: this.router.url,
          StaffLoginId: this.staffLogin.StaffLoginId
        })
      ).toString()
    };

    this.dataLoading = true;
    this.service.validiateMenu(obj).subscribe({
      next: (response: any) => {
        this.action = this.loadData.validiateMenu(response, this.toastr, this.router);
        this.dataLoading = false;
      },
      error: () => {
        this.toastr.error("Error while fetching records");
        this.dataLoading = false;
      }
    });
  }

  @ViewChild('formDosage') formDosage!: NgForm;

  resetForm() {
    this.Dosage = { Status: 1 };
    this.isSubmitted = false;

    if (this.formDosage) {
      this.formDosage.control.markAsPristine();
      this.formDosage.control.markAsUntouched();
    }
  }

  sort(key: string) {
    this.sortKey = key;
    this.reverse = !this.reverse;
  }

  onTableDataChange(page: number) {
    this.p = page;
  }

  // ==========================
  // GET DOSAGE LIST
  // ==========================
  getDosageList() {
    const obj: RequestModel = {
      request: this.localService.encrypt(JSON.stringify({})).toString()
    };

    this.dataLoading = true;
    this.service.getDosageList(obj).subscribe({
      next: (r1: any) => {
        if (r1.Message === ConstantData.SuccessMessage) {
          this.DosageList = r1.DosageList || [];
        } else {
          this.toastr.error(r1.Message);
        }
        this.dataLoading = false;
      },
      error: () => {
        this.toastr.error("Error while fetching records");
        this.dataLoading = false;
      }
    });
  }

  // ==========================
  // SAVE / UPDATE DOSAGE
  // ==========================
  saveDosage() {
    this.isSubmitted = true;
    this.formDosage.control.markAllAsTouched();

    if (this.formDosage.invalid) {
      this.toastr.warning("Please fill all required fields.");
      return;
    }

    this.Dosage.CreatedBy = this.staffLogin.StaffId;
    this.Dosage.UpdatedBy = this.staffLogin.StaffId;

    const obj: RequestModel = {
      request: this.localService.encrypt(JSON.stringify(this.Dosage)).toString()
    };

    this.dataLoading = true;
    this.service.saveDosage(obj).subscribe({
      next: (r1: any) => {
        if (r1.Message === ConstantData.SuccessMessage) {
          if (this.Dosage.DosageId > 0) {
            this.toastr.success("Dosage updated successfully");
          } else {
            this.toastr.success("Dosage added successfully");
          }
          $('#staticBackdrop').modal('hide');
          this.resetForm();
          this.getDosageList();
        } else {
          this.toastr.error(r1.Message);
        }
        this.dataLoading = false;
      },
      error: () => {
        this.toastr.error("Error occurred while submitting data");
        this.dataLoading = false;
      }
    });
  }

  // ==========================
  // DELETE DOSAGE
  // ==========================
  deleteDosage(item: any) {
    if (confirm("Are you sure you want to delete this record?")) {
      const request: RequestModel = {
        request: this.localService.encrypt(JSON.stringify(item)).toString()
      };

      this.dataLoading = true;
      this.service.deleteDosage(request).subscribe({
        next: (r1: any) => {
          if (r1.Message === ConstantData.SuccessMessage) {
            this.toastr.success("Record deleted successfully");
            this.getDosageList();
          } else {
            this.toastr.error(r1.Message);
          }
          this.dataLoading = false;
        },
        error: () => {
          this.toastr.error("Error occurred while deleting the record");
          this.dataLoading = false;
        }
      });
    }
  }

  // ==========================
  // EDIT DOSAGE
  // ==========================
  editDosage(item: any) {
    this.resetForm();
    this.Dosage = { ...item };
  }
}