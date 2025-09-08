import { Component, OnInit, ViewChild } from '@angular/core';
import { NgForm } from "@angular/forms";
declare var toastr: any;
declare var $: any;
import { ToastrService } from 'ngx-toastr';
import { AppService } from "../../utils/app.service";
import { ConstantData } from "../../utils/constant-data";
import { LocalService } from "../../utils/local.service";
import { LoadDataService } from '../../utils/load-data.service';
import { Status } from '../../utils/enum';
import { ActionModel, RequestModel, StaffLoginModel } from '../../utils/interface';
import { Router } from '@angular/router';

@Component({
  selector: 'app-prescription-item',
  templateUrl: './prescription-item.component.html',
  styleUrls: ['./prescription-item.component.css']
})
export class PrescriptionItemComponent implements OnInit {
  // Changed from Head to PrescriptionItem to match the purpose
  PrescriptionItem: any = {};
  employeeDetail: any;
  StatusList = this.loadData.GetEnumList(Status);
  AllStatusList = Status;
  HeadList: any[] = []; // This will contain the prescription heads
  PrescriptionItemList: any[] = []; // This will contain the prescription items
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
  
  // For autocomplete filtering
  filteredHeadList: any[] = [];

  constructor(
    private service: AppService,
    private localService: LocalService,
    private router: Router,
    private loadData: LoadDataService,
    private toastr: ToastrService,
  ) { }

  ngOnInit(): void {
    this.staffLogin = this.localService.getEmployeeDetail();
    this.validiateMenu();
    this.getHeadList(); // Get prescription heads for dropdown
    this.getPrescriptionItemList(); // Get prescription items for table
    this.employeeDetail = this.localService.getEmployeeDetail();
    this.resetForm();
  }

  validiateMenu() {
    var obj: RequestModel = {
      request: this.localService.encrypt(JSON.stringify({ 
        Url: this.router.url, 
        StaffLoginId: this.staffLogin.StaffLoginId 
      })).toString()
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

  @ViewChild('formHead') formHead: NgForm;
  
  resetForm() {
    this.PrescriptionItem = {};
    this.PrescriptionItem.Status = 1;
    this.filteredHeadList = [...this.HeadList]; // Reset filtered list
    if (this.formHead) {
      this.formHead.control.markAsPristine();
      this.formHead.control.markAsUntouched();
    }
    this.submitted = false;
  }

  newPrescriptionItem() {
    this.resetForm();
    $('#staticBackdrop').modal('show');
  }

  editPrescriptionItem(obj: any) {
    this.PrescriptionItem = { ...obj }; // Create a copy to avoid direct mutation
    // Set the head name for autocomplete display
    const selectedHead = this.HeadList.find(head => head.PrescriptionHeadId === obj.PrescriptionHeadId);
    if (selectedHead) {
      this.PrescriptionItem.PrescriptionHeadName = selectedHead.PrescriptionHeadName;
    }
    $('#staticBackdrop').modal('show');
  }

  onTableDataChange(p: any) {
    this.p = p;
  }

  sort(key: any) {
    this.sortKey = key;
    this.reverse = !this.reverse;
  }

  // Get prescription heads for dropdown
  getHeadList() {
    const obj: RequestModel = {
      request: this.localService.encrypt(JSON.stringify({})).toString()
    };

    this.dataLoading = true;
    this.service.getHeadList(obj).subscribe({
      next: r1 => {
        let response = r1 as any;
        if (response.Message == ConstantData.SuccessMessage) {
          this.HeadList = response.PrescriptionHeadList || [];
          this.filteredHeadList = [...this.HeadList];
          console.log('Head List:', this.HeadList);
        } else {
          this.toastr.error(response.Message);
        }
        this.dataLoading = false;
      },
      error: err => {
        console.error("API error:", err);
        this.toastr.error("Error while fetching head records");
        this.dataLoading = false;
      }
    });
  }

  // Get prescription items for table display
  getPrescriptionItemList() {
    const obj: RequestModel = {
      request: this.localService.encrypt(JSON.stringify({})).toString()
    };

    this.dataLoading = true;
    this.service.getPrescriptionItemList(obj).subscribe({
      next: r1 => {
        let response = r1 as any;
        if (response.Message == ConstantData.SuccessMessage) {
          this.PrescriptionItemList = response.PrescriptionItemList || [];
          console.log('Prescription Item List:', this.PrescriptionItemList);
        } else {
          this.toastr.error(response.Message);
        }
        this.dataLoading = false;
      },
      error: err => {
        console.error("API error:", err);
        this.toastr.error("Error while fetching prescription item records");
        this.dataLoading = false;
      }
    });
  }

  // Save prescription item (not head)
  savePrescriptionItem() {
    this.submitted = true;
    if (this.formHead.invalid) {
      this.toastr.warning("Fill all the Required Fields.", "Invalid Form");
      return;
    }

    // Ensure we have the head ID
    if (!this.PrescriptionItem.PrescriptionHeadId) {
      this.toastr.warning("Please select a prescription head.", "Invalid Form");
      return;
    }

    this.PrescriptionItem.UpdatedBy = this.employeeDetail.EmployeeId;
    this.PrescriptionItem.CreatedBy = this.employeeDetail.EmployeeId;
    this.dataLoading = true;

    var obj: RequestModel = {
      request: this.localService.encrypt(JSON.stringify(this.PrescriptionItem)).toString()
    }

    this.service.savePrescriptionItem(obj).subscribe(r1 => {
      let response = r1 as any;
      
      if (response.Message == ConstantData.SuccessMessage) {
        if (this.PrescriptionItem.PrescriptionItemId > 0) {
          this.toastr.success("Prescription Item Updated successfully");
        } else {
          this.toastr.success("Prescription Item added successfully");
        }
        this.getPrescriptionItemList();
        this.resetForm();
        $('#staticBackdrop').modal('hide');
      } else {
        this.toastr.error(response.Message);
      }
      this.dataLoading = false;
    }, (err => {
      this.toastr.error("Error occurred while saving data.");
      this.dataLoading = false;
    }));
  }

  // Delete prescription item
  deletePrescriptionItem(obj: any) {
    if (confirm("Are you sure you want to delete this record?")) {
      var request: RequestModel = {
        request: this.localService.encrypt(JSON.stringify(obj)).toString()
      }
      this.dataLoading = true;
      this.service.deletePrescriptionItem(request).subscribe(r1 => {
        let response = r1 as any
        if (response.Message == ConstantData.SuccessMessage) {
          this.toastr.success("Record Deleted successfully");
          this.getPrescriptionItemList();
        } else {
          this.toastr.error(response.Message);
        }
        this.dataLoading = false;
      }, (err => {
        this.toastr.error("Error occurred while deleting the record");
        this.dataLoading = false;
      }))
    }
  }

  // Handle head selection from autocomplete
  afterHeadSelected(event: any) {
    const selectedHead = this.HeadList.find(head => head.PrescriptionHeadId == event.option.id);
    if (selectedHead) {
      this.PrescriptionItem.PrescriptionHeadId = selectedHead.PrescriptionHeadId;
      this.PrescriptionItem.PrescriptionHeadName = selectedHead.PrescriptionHeadName;
    }
  }

  // Filter heads for autocomplete
  filterHeadList(value: any) {
    if (value) {
      const filterValue = value.toLowerCase();
      this.filteredHeadList = this.HeadList.filter((option: any) =>
        option.PrescriptionHeadName.toLowerCase().includes(filterValue)
      );
    } else {
      this.filteredHeadList = [...this.HeadList];
    }
  }

  // Clear head selection
  clearHeadSelection() {
    this.filteredHeadList = [...this.HeadList];
    this.PrescriptionItem.PrescriptionHeadId = null;
    this.PrescriptionItem.PrescriptionHeadName = '';
  }
}