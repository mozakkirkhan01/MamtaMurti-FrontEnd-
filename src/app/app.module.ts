import { CUSTOM_ELEMENTS_SCHEMA, NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';
import { ToastrModule, provideToastr } from 'ngx-toastr';
import { BrowserAnimationsModule, provideAnimations } from '@angular/platform-browser/animations';
import { NgxPaginationModule } from "ngx-pagination";
import { MaterialModule } from './material/material.module';
import { HashLocationStrategy, LocationStrategy } from '@angular/common';
import { AppService } from './utils/app.service';
import { AdminDashboardComponent } from './admin/admin-dashboard/admin-dashboard.component';
import { AdminLoginComponent } from './admin/admin-login/admin-login.component';
import { AdminMasterComponent } from './admin/admin-master/admin-master.component';
import { ChangePasswordComponent } from './admin/change-password/change-password.component';
import { CityComponent } from './admin/city/city.component';
import { DepartmentComponent } from './admin/department/department.component';
import { DesignationComponent } from './admin/designation/designation.component';
import { MenuComponent } from './admin/menu/menu.component';
import { PageComponent } from './admin/page/page.component';
import { PageGroupComponent } from './admin/page-group/page-group.component';
import { RoleComponent } from './admin/role/role.component';
import { RoleMenuComponent } from './admin/role-menu/role-menu.component';
import { StaffLoginComponent } from './admin/staff-login/staff-login.component';
import { StateComponent } from './admin/state/state.component';
import { PageNotFoundComponent } from './component/page-not-found/page-not-found.component';
import { ProgressComponent } from './component/progress/progress.component';
import { EnumCasePipe } from './pipes/enum-case.pipe';
import { MoneyPipe } from './pipes/money.pipe';
import { StaffComponent } from './admin/staff/staff.component';
import { OrderByPipe } from './pipes/order-by.pipe';
import { FilterPipe } from './pipes/filter.pipe';
import { CompanyComponent } from './admin/company/company.component';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { DateAdapter, MAT_DATE_FORMATS, MAT_DATE_LOCALE, MatNativeDateModule } from '@angular/material/core';
import { NgxMatDatetimePickerModule, NgxMatNativeDateModule, NgxMatTimepickerModule } from '@angular-material-components/datetime-picker';
import { ManagePatientComponent } from './admin/manage-patient/manage-patient.component';
import { OpdBookingComponent } from './admin/opd-booking/opd-booking.component';
import { OpticalAddComponent } from './admin/optical-add/optical-add.component';
import { PackageBillComponent } from './admin/package-bill/package-bill.component';
import { OpdListComponent } from './admin/opd-list/opd-list.component';
import { SurgeryListComponent } from './admin/surgery-list/surgery-list.component';
import { GstComponent } from './admin/gst/gst.component';
import { OpticalBillingComponent } from './admin/optical-billing/optical-billing.component';
import { OpticalBillingListComponent } from './admin/optical-billing-list/optical-billing-list.component';
import { OpticalBillingListTodayComponent } from './admin/optical-billing-list-today/optical-billing-list-today.component';
import { MedicineComponent } from './admin/medicine/medicine.component';
import { Category } from './utils/enum';
import { CategoryComponent } from './admin/category/category.component';
import { SurgeryListTodayComponent } from './admin/surgery-list-today/surgery-list-today.component';
import { OpdListTodayComponent } from './admin/opd-list-today/opd-list-today.component';
import { BillItemComponent } from './admin/bill-item/bill-item.component';
import { BillingItemComponent } from './admin/billing-item/billing-item.component';
import { BillingItemListComponent } from './admin/billing-item-list/billing-item-list.component';
import { BillingItemListTodayComponent } from './admin/billing-item-list-today/billing-item-list-today.component';
import { SurgeryPackageComponent } from './admin/surgery-package/surgery-package.component';
import { SurgeryBillComponent } from './admin/surgery-bill/surgery-bill.component';
import { ConsentFormComponent } from './admin/consent-form/consent-form.component';
import { DoctorComponent } from './admin/doctor/doctor.component';
import { DischargeSummaryComponent } from './admin/discharge-summary/discharge-summary.component';
import { DischargeSummaryListComponent } from './admin/discharge-summary-list/discharge-summary-list.component';
import { ManufacturerComponent } from './admin/manufacturer/manufacturer.component';
import { MedicineTypeListComponent } from './admin/medicine-type-list/medicine-type-list.component';
import { UnitComponent } from './admin/unit/unit.component';
import { SupplierComponent } from './admin/supplier/supplier.component';
import { MedicinePurchaseComponent } from './admin/medicine-purchase/medicine-purchase.component';
import { MedicinePurchaseListComponent } from './admin/medicine-purchase-list/medicine-purchase-list.component';
import { MedicineReturnComponent } from './admin/medicine-return/medicine-return.component';
import { PurchaseReturnComponent } from './admin/purchase-return/purchase-return.component';
import { PurchaseReturnListComponent } from './admin/purchase-return-list/purchase-return-list.component';
import { MedicineStockListComponent } from './admin/medicine-stock-list/medicine-stock-list.component';
import { ExpirymedicineDetailComponent } from './admin/expirymedicine-detail/expirymedicine-detail.component';
import { MedicineSaleComponent } from './admin/medicine-sale/medicine-sale.component';
import { MedicineSaleListComponent } from './admin/medicine-sale-list/medicine-sale-list.component';
import { MedicineReturnListComponent } from './admin/medicine-return-list/medicine-return-list.component';
import { MedicinePurchaseReportComponent } from './admin/medicine-purchase-report/medicine-purchase-report.component';
import { MedicineSaleReportComponent } from './admin/medicine-sale-report/medicine-sale-report.component';
import { CanteenComponent } from './admin/canteen/canteen.component';
import { CanteenSellComponent } from './admin/canteen-sell/canteen-sell.component';
import { CanteenBillingListComponent } from './admin/canteen-billing-list/canteen-billing-list.component';
import { PrescriptionHeadComponent } from './admin/prescription-head/prescription-head.component';
import { PrescriptionItemComponent } from './admin/prescription-item/prescription-item.component';
import { PatientPrescriptionComponent } from './admin/patient-prescription/patient-prescription.component';
import { PatientPrescriptionListComponent } from './admin/patient-prescription-list/patient-prescription-list.component';
import { DosageComponent } from './admin/dosage/dosage.component';
import { CustomDatePipe } from './utils/custom-date.pipe';
@NgModule({
  declarations: [
    SurgeryPackageComponent,
    UnitComponent,
    AppComponent,
    CategoryComponent,
    GstComponent,
    MedicineComponent,
    AdminDashboardComponent,
    AdminLoginComponent,
    AdminMasterComponent,
    ChangePasswordComponent,
    CityComponent,
    DepartmentComponent,
    DesignationComponent,
    MenuComponent,
    PageComponent,
    PageGroupComponent,
    RoleComponent,
    RoleMenuComponent,
    StaffLoginComponent,
    StateComponent,
    PageNotFoundComponent,
    ProgressComponent,
    EnumCasePipe,
    MoneyPipe,
    StaffComponent,
    OrderByPipe,
    FilterPipe,
    CompanyComponent,
    ManagePatientComponent,
    OpdBookingComponent,
    OpticalAddComponent,
    PackageBillComponent,
    OpdListComponent,
    SurgeryListComponent,
    OpticalBillingComponent,
    OpticalBillingListComponent,
    OpticalBillingListTodayComponent,
    SurgeryListTodayComponent,
    OpdListTodayComponent,
    BillItemComponent,
    BillingItemComponent,
    BillingItemListComponent,
    BillingItemListTodayComponent,
    SurgeryBillComponent,
    ConsentFormComponent,
    DoctorComponent,
    DischargeSummaryComponent,
    DischargeSummaryListComponent,
    ManufacturerComponent,
    MedicineTypeListComponent,
    SupplierComponent,
    MedicinePurchaseComponent,
    MedicinePurchaseListComponent,
    MedicineReturnComponent,
    PurchaseReturnComponent,
    PurchaseReturnListComponent,
    MedicineStockListComponent,
    ExpirymedicineDetailComponent,
    MedicineSaleComponent,
    MedicineSaleListComponent,
    MedicineReturnListComponent,
    MedicinePurchaseReportComponent,
    MedicineSaleReportComponent,
    CanteenComponent,
    CanteenSellComponent,
    CanteenBillingListComponent,
    PrescriptionHeadComponent,
    PrescriptionItemComponent,
    PatientPrescriptionComponent,
    PatientPrescriptionListComponent,
    DosageComponent,
    CustomDatePipe,
  ],
  imports: [
    
    BrowserModule,
    AppRoutingModule,
    FormsModule,
    ReactiveFormsModule,
    HttpClientModule,
    ToastrModule,
    BrowserAnimationsModule,
    MaterialModule,
    ToastrModule.forRoot(),
    NgxPaginationModule,
    MatDatepickerModule,
    MatInputModule,
    MatNativeDateModule,
    NgxMatDatetimePickerModule,
    NgxMatNativeDateModule,
    NgxMatTimepickerModule,
    MatFormFieldModule
    
  ],
  providers: [AppService, { provide: LocationStrategy, useClass: HashLocationStrategy },
    { provide: MAT_DATE_LOCALE, useValue: 'en-GB' },
    provideAnimations(),
    provideToastr()
  ],
  bootstrap: [AppComponent],
  schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class AppModule { }
