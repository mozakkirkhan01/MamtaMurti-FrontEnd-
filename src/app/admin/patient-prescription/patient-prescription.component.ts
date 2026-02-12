import { Component, ViewChild } from '@angular/core';
import { NgForm } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';
import { AppService } from '../../utils/app.service';
import { ConstantData } from '../../utils/constant-data';
import { Gender, PaymentMode, Status, Category } from '../../utils/enum';
import { LoadDataService } from '../../utils/load-data.service';
import {
  ActionModel,
  RequestModel,
  StaffLoginModel,
} from '../../utils/interface';
import { LocalService } from '../../utils/local.service';
import { ActivatedRoute, Router } from '@angular/router';
declare var $: any;

@Component({
  selector: 'app-patient-prescription',
  templateUrl: './patient-prescription.component.html',
  styleUrls: ['./patient-prescription.component.css']
})
export class PatientPrescriptionComponent {

  clearForm() {
    this.Patient = [];
    this.lensEntry = {};
    this.SelectedPrescriptionList = [];
    this.SelectedMedicineList = [];
  }

  dataLoading: boolean = false;
  PatientList: any = [];
  ChargeList: any = [];
  Patient: any = {};
  Payment: any = {};
  isSubmitted = false;
  PageSize = ConstantData.PageSizes;
  p: number = 1;
  Search: string = '';
  reverse: boolean = false;
  sortKey: string = '';
  itemPerPage: number = this.PageSize[0];
  StateList: any[] = [];
  filterState: any[] = [];
  StatusList = this.loadData.GetEnumList(Status);
  GenderList = this.loadData.GetEnumList(Gender);
  action: ActionModel = {} as ActionModel;
  staffLogin: StaffLoginModel = {} as StaffLoginModel;
  AllStatusList = Status;
  AllGenderList = Gender;
  AllCategoryList = Category;
  filteredPatientList: any[] = [];
  PatientListAll: any;
  PrescriptionItem: any = {
    PrescriptionHeadId: null,
    PrescriptionHeadName: '',
    PrescriptionItemId: null,
    PrescriptionItemName: ''
  };
  SelectedPrescriptionList: any[] = [];
  filteredHeadList: any[] = [];
  HeadList: any[] = [];
  PrescriptionItemList: any = [];

  // **NEW: Medicine Related Properties**
  MedicineItem: any = {
    PrescriptionMedicineDetailId: 0,
    MedicineId: null,
    MedicineName: '',
    DosageId: null,
    DosageName: '',
    TimingFreqDuration: ''
  };
  SelectedMedicineList: any[] = [];
  MedicineList: any[] = [];
  filteredMedicineList: any[] = [];
  DosageList: any[] = [];
  filteredDosageList: any[] = [];

  lensEntry: any = {
    RE_DV_SPH: '',
    RE_DV_CYL: '',
    RE_DV_AXIS: '',
    RE_DV_V: '',
    RE_NV_SPH: '',
    RE_NV_CYL: '',
    RE_NV_AXIS: '',
    RE_NV_V: '',

    LE_DV_SPH: '',
    LE_DV_CYL: '',
    LE_DV_AXIS: '',
    LE_DV_V: '',
    LE_NV_SPH: '',
    LE_NV_CYL: '',
    LE_NV_AXIS: '',
    LE_NV_V: '',

    PD: '',
    Lens: ''
  };

  sort(key: any) {
    this.sortKey = key;
    this.reverse = !this.reverse;
  }

  onTableDataChange(p: any) {
    this.p = p;
  }

  constructor(
    private service: AppService,
    private toastr: ToastrService,
    private loadData: LoadDataService,
    private localService: LocalService,
    private router: Router,
    private route: ActivatedRoute
  ) { }

  redUrl: string = '';

  ngOnInit(): void {
    this.staffLogin = this.localService.getEmployeeDetail();
    this.getPatientListall(this.Patient.PatientId);
    this.validiateMenu();
    this.resetForm();
    this.getHeadList();
    this.getPrescriptionItemList();
    this.getMedicineList();
    this.getDosageList();

    this.route.queryParams.subscribe((params) => {
      const PatientPrescriptionId = params['id'];
      const redUrl = params['redUrl'];

      if (PatientPrescriptionId) {
        var request: RequestModel = {
          request: this.localService.encrypt(JSON.stringify({ PatientPrescriptionId: PatientPrescriptionId })).toString(),
        };
        this.dataLoading = true;
        this.service.GetPatientPrescriptionDetails(request).subscribe(
          (r1) => {
            let response = r1 as any;
            if (response.Message == ConstantData.SuccessMessage) {
              this.Patient = response.PatientPrescriptionAll.GetPatient;
              this.lensEntry = response.PatientPrescriptionAll.GetPatient;
              this.SelectedPrescriptionList = response.PatientPrescriptionAll.GetPatientPrescriptionDetails;
              this.SelectedMedicineList = response.PatientPrescriptionAll.GetMedicineDetails || [];
              console.log(this.SelectedMedicineList);
              
              this.dataLoading = false;
            } else {
              this.toastr.error('Error occured while Fetching  the recored');
            }
          },
          (err) => {
            this.toastr.error('Error occured while Fetching  the recored');
            this.dataLoading = false;
          }
        );
      }
    });
  }

  validiateMenu() {
    var request: RequestModel = {
      request: this.localService
        .encrypt(
          JSON.stringify({
            Url: '/admin/patient-prescription',
            StaffLoginId: this.staffLogin.StaffLoginId,
          })
        )
        .toString(),
    };
    this.dataLoading = true;
    this.service.validiateMenu(request).subscribe(
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

  @ViewChild('formPatientDetails') formPatientDetails: NgForm;
  resetForm() {
    this.Patient = {};
    this.Patient.OpdDate = this.loadData.newloadDateYMD(new Date());

    if (this.formPatientDetails) {
      this.formPatientDetails.control.markAsPristine();
      this.formPatientDetails.control.markAsUntouched();
    }
    this.isSubmitted = false;
  }

  getPatientList(PatientId: number) {
    var data = {
      PatientID: PatientId,
    };
    const obj: RequestModel = {
      request: this.localService.encrypt(JSON.stringify(data)).toString(),
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

  afterPrescriptionItemSelected(event: any) {
    this.PrescriptionItem.PrescriptionItemId = event.option.id;
    this.PrescriptionItem.PrescriptionItemName = event.option.value;
    var Transport = this.ChargeList.find(
      (x: any) => x.PrescriptionItemId == this.PrescriptionItem.PrescriptionItemId
    );
    this.PrescriptionItem.PrescriptionItemName = Transport.PrescriptionItemName;
    if (this.PrescriptionItem.PrescriptionHeadId == null || this.PrescriptionItem.PrescriptionHeadId == '') {
      this.PrescriptionItem.PrescriptionHeadId = Transport.PrescriptionHeadId;
      this.PrescriptionItem.PrescriptionHeadName = Transport.PrescriptionHeadName;
    }
  }

  filterPrescriptionItemList(value: any) {
    if (value) {
      const filterValue = value.toLowerCase();
      this.ChargeList = this.PrescriptionItemList.filter((option: any) =>
        option.PrescriptionItemName.toLowerCase().includes(filterValue)
      );
    } else {
      this.ChargeList = this.PrescriptionItemList;
    }
  }

  clearPrescriptionItemSelection() {
    this.ChargeList = this.PrescriptionItemList;
    this.PrescriptionItem.PrescriptionItemName = '';
    this.PrescriptionItem.PrescriptionItemId = null;
  }

  addPrescriptionDetail() {
    if (this.PrescriptionItem.PrescriptionHeadName == null || this.PrescriptionItem.PrescriptionHeadName == '') {
      this.toastr.error('Please Select Prescription Head!!!');
      return;
    }
    if (this.PrescriptionItem.PrescriptionItemName == null || this.PrescriptionItem.PrescriptionItemName == '') {
      this.toastr.error('Please Select Prescription Item Name!!!');
      return;
    }

    const prescriptionItemCopy = { ...this.PrescriptionItem };
    this.SelectedPrescriptionList.push(prescriptionItemCopy);

    this.clearHeadSelection();
    this.clearPrescriptionItemSelection();
  }

  RemoveHotel(index: number) {
    this.SelectedPrescriptionList.splice(index, 1);
  }

  resetHotelPayment() {
    this.Payment = {};
    this.isSubmitted = false;
  }

  savePatientPrescription() {
    this.isSubmitted = true;

    if (this.Patient.PatientID == null || this.Patient.PatientID == '') {
      this.toastr.error('Please Select Patient!!!');
      return;
    }
    if (this.lensEntry == null || this.lensEntry == '') {
      this.toastr.error('Please fill at least one eye prescription!!!');
      return;
    }
    if (
      !this.SelectedPrescriptionList ||
      this.SelectedPrescriptionList.length === 0
    ) {
      this.toastr.error(
        'Please add at least one prescription charge to the list!'
      );
      return;
    }

    this.Patient.CreatedBy = this.staffLogin.StaffId;
    this.Patient.UpdatedBy = this.staffLogin.StaffId;
    this.Patient.PrescriptionDate = this.loadData.loadDateYMD(this.Patient.PrescriptionDate);

    const data = {
      GetPatient: { ...this.Patient, ...this.lensEntry },
      GetPatientPrescriptionDetails: this.SelectedPrescriptionList,
      GetMedicineDetails: this.SelectedMedicineList
    };

    const obj: RequestModel = {
      request: this.localService.encrypt(JSON.stringify(data)).toString(),
    };

    this.dataLoading = true;
    this.service.savePatientPrescription(obj).subscribe(
      (r1) => {
        const response = r1 as any;

        if (response.Message === ConstantData.SuccessMessage) {
          if (this.Patient.PatientPrescriptionId > 0) {
            this.toastr.success('Prescription Updated successfully');
            $('hashtag#staticBackdrop').modal('hide');
          } else {
            this.toastr.success('Prescription added successfully');
          }
          this.service.PrintPrescription(response.PatientPrescriptionId);
          this.SelectedPrescriptionList = [];
          this.SelectedMedicineList = [];
          this.resetForm();
        } else {
          this.toastr.error(response.Message);
        }

        this.dataLoading = false;
      },
      (err) => {
        this.toastr.error('Error occurred while submitting data');
        this.dataLoading = false;
      }
    );
  }

  getPatientListall(PatientId: number) {
    var data = {
      PatientID: PatientId,
    };
    const obj: RequestModel = {
      request: this.localService.encrypt(JSON.stringify(data)).toString(),
    };
    this.dataLoading = true;

    this.service.getPatientList(obj).subscribe({
      next: (r1) => {
        let response = r1 as any;
        if (response.Message == ConstantData.SuccessMessage) {
          this.PatientListAll = response.PatientList;
          this.filteredPatientList = [...this.PatientListAll];
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

    this.filteredPatientList = this.PatientListAll.filter(
      (option: any) =>
        option.PatientName?.toLowerCase().includes(filterValue) ||
        option.UHID?.toLowerCase().includes(filterValue) ||
        option.ContactNo?.toLowerCase().includes(filterValue)
    );
  }

  afterPatientSelected(event: any) {
    const selectedName = event.option.value;

    const selected = this.PatientListAll.find(
      (x: any) => x.PatientName === selectedName
    );

    if (selected) {
      this.Patient = { ...selected };
    }
    if (selected) {
      this.Payment.OpticalItemRate = selected.Rate || 0;
      this.Payment.Quantity = 1;
      this.onRateChange();
    }
  }

  clearPatient() {
    this.filteredPatientList = this.PatientListAll;
    this.Patient = {};
  }

  onRateChange() {
    if (this.Payment.Quantity && this.Payment.OpticalItemRate) {
      this.Payment.Amount = this.Payment.OpticalItemRate * this.Payment.Quantity;
      this.updateLineTotal();
    }
  }

  onQuantityChange() {
    if (this.Payment.OpticalItemRate && this.Payment.Quantity) {
      this.Payment.Amount = this.Payment.OpticalItemRate * this.Payment.Quantity;
      this.updateLineTotal();
    }
  }

  onDiscountChange() {
    this.updateLineTotal();
  }

  updateLineTotal() {
    this.Payment.LineTotal =
      (this.Payment.Amount || 0) - (this.Payment.Discount || 0);
  }

  afterHeadSelected(event: any) {
    const selectedHead = this.HeadList.find(head => head.PrescriptionHeadId == event.option.id);
    if (selectedHead) {
      this.PrescriptionItem.PrescriptionHeadId = selectedHead.PrescriptionHeadId;
      this.PrescriptionItem.PrescriptionHeadName = selectedHead.PrescriptionHeadName;
    }

    this.getPrescriptionItemList(this.PrescriptionItem.PrescriptionHeadId);
  }

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

  clearHeadSelection() {
    this.filteredHeadList = [...this.HeadList];
    this.PrescriptionItem.PrescriptionHeadId = null;
    this.PrescriptionItem.PrescriptionHeadName = '';
    this.ChargeList = [];
  }

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

  getPrescriptionItemList(PrescriptionHeadId?: number) {
    const obj: RequestModel = {
      request: this.localService.encrypt(JSON.stringify({ PrescriptionHeadId: PrescriptionHeadId })).toString()
    };

    this.dataLoading = true;
    this.service.getPrescriptionItemList(obj).subscribe({
      next: r1 => {
        let response = r1 as any;
        if (response.Message == ConstantData.SuccessMessage) {
          this.PrescriptionItemList = response.PrescriptionItemList || [];
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

  // **NEW: Medicine Related Methods**
  getMedicineList() {
    const obj: RequestModel = {
      request: this.localService.encrypt(JSON.stringify({})).toString()
    };

    this.dataLoading = true;
    this.service.getMedicineList(obj).subscribe({
      next: r1 => {
        let response = r1 as any;
        if (response.Message == ConstantData.SuccessMessage) {
          this.MedicineList = response.MedicineList || [];
          this.filteredMedicineList = this.MedicineList;
        } else {
          this.toastr.error(response.Message);
        }
        this.dataLoading = false;
      },
      error: err => {
        console.error("API error:", err);
        this.toastr.error("Error while fetching medicine records");
        this.dataLoading = false;
      }
    });
  }

  getDosageList() {
    const obj: RequestModel = {
      request: this.localService.encrypt(JSON.stringify({})).toString()
    };

    this.dataLoading = true;
    this.service.getDosageList(obj).subscribe({
      next: r1 => {
        let response = r1 as any;
        if (response.Message == ConstantData.SuccessMessage) {
          this.DosageList = response.DosageList || [];
          this.filteredDosageList = [...this.DosageList];
        } else {
          this.toastr.error(response.Message);
        }
        this.dataLoading = false;
      },
      error: err => {
        console.error("API error:", err);
        this.toastr.error("Error while fetching dosage records");
        this.dataLoading = false;
      }
    });
  }

filterMedicineList(value: any) {

  if (!this.MedicineList || this.MedicineList.length === 0) {
    this.filteredMedicineList = this.MedicineList;
    
    return;
  }

  if (value) {
    const filterValue = value.toLowerCase();
    this.filteredMedicineList = this.MedicineList.filter((option: any) =>
      option.MedicineName?.toLowerCase().includes(filterValue)
    );
  } else {
    this.filteredMedicineList =this.MedicineList;
  }
}


afterMedicineSelected(event: any) {

  const selectedMedicine = this.MedicineList.find(
    (x: any) => x.MedicineId === event.option.id
  );

  if (selectedMedicine) {
    this.MedicineItem.MedicineId = selectedMedicine.MedicineId;
    this.MedicineItem.MedicineName = selectedMedicine.MedicineName;

    // ⭐ STORE CATEGORY
    this.MedicineItem.CategoryId = selectedMedicine.CategoryId;
    this.MedicineItem.CategoryName = selectedMedicine.CategoryName;
  }
}

  clearMedicineSelection() {
    this.filteredMedicineList =this.MedicineList;
    this.MedicineItem.MedicineId = null;
    this.MedicineItem.MedicineName = '';
  }

  filterDosageList(value: any) {
    if (value) {
      const filterValue = value.toLowerCase();
      this.filteredDosageList = this.DosageList.filter((option: any) =>
        option.DosageName.toLowerCase().includes(filterValue)
      );
    } else {
      this.filteredDosageList =this.DosageList;
    }
  }

  afterDosageSelected(event: any) {
    this.MedicineItem.DosageId = event.option.id;
    this.MedicineItem.DosageName = event.option.value;
  }

  clearDosageSelection() {
    this.filteredDosageList =this.DosageList;
    this.MedicineItem.DosageId = null;
    this.MedicineItem.DosageName = '';
  }

  addMedicineDetail() {
    if (!this.MedicineItem.MedicineName) {
      this.toastr.error('Please Select Medicine!!!');
      return;
    }
    if (!this.MedicineItem.DosageName) {
      this.toastr.error('Please Select Dosage!!!');
      return;
    }
    if (!this.MedicineItem.TimingFreqDuration) {
      this.toastr.error('Please Enter Timing/Frequency/Duration!!!');
      return;
    }

    const medicineItemCopy = { ...this.MedicineItem };
    this.SelectedMedicineList.push(medicineItemCopy);

    this.clearMedicineForm();
  }

  clearMedicineForm() {
    this.MedicineItem = {
      PrescriptionMedicineDetailId: 0,
      MedicineId: null,
      MedicineName: '',
      DosageId: null,
      DosageName: '',
      TimingFreqDuration: ''
    };
    this.clearMedicineSelection();
    this.clearDosageSelection();
  }

  RemoveMedicine(index: number) {
    this.SelectedMedicineList.splice(index, 1);
  }

  saveLensEntry() {
    if (!this.lensEntry.RE_DV_SPH && !this.lensEntry.LE_DV_SPH) {
      this.toastr.error('Please fill at least one eye prescription');
      return;
    }
    this.toastr.success('Lens entry saved successfully');
    $('#lensEntryModal').modal('hide');
  }

  clearLensEntry() {
    this.lensEntry = {
      RE_DV_SPH: '',
      RE_DV_CYL: '',
      RE_DV_AXIS: '',
      RE_DV_V: '',
      RE_NV_SPH: '',
      RE_NV_CYL: '',
      RE_NV_AXIS: '',
      RE_NV_V: '',

      LE_DV_SPH: '',
      LE_DV_CYL: '',
      LE_DV_AXIS: '',
      LE_DV_V: '',
      LE_NV_SPH: '',
      LE_NV_CYL: '',
      LE_NV_AXIS: '',
      LE_NV_V: '',

      PD: '',
      Lens: ''
    };
  }

  closeLensEntryModal() {
    $('#lensEntryModal').modal('hide');
  }

  addLensEntry() {
    $('#lensEntryModal').modal('show');
  }
}