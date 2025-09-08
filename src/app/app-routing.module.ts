import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AdminLoginComponent } from './admin/admin-login/admin-login.component';
import { PageNotFoundComponent } from './component/page-not-found/page-not-found.component';
import { AdminMasterComponent } from './admin/admin-master/admin-master.component';
import { AdminDashboardComponent } from './admin/admin-dashboard/admin-dashboard.component';
import { DesignationComponent } from './admin/designation/designation.component';
import { DepartmentComponent } from './admin/department/department.component';
import { StaffComponent } from './admin/staff/staff.component';
import { StaffLoginComponent } from './admin/staff-login/staff-login.component';
import { PageGroupComponent } from './admin/page-group/page-group.component';
import { PageComponent } from './admin/page/page.component';
import { MenuComponent } from './admin/menu/menu.component';
import { RoleComponent } from './admin/role/role.component';
import { RoleMenuComponent } from './admin/role-menu/role-menu.component';
import { StateComponent } from './admin/state/state.component';
import { CityComponent } from './admin/city/city.component';
import { ChangePasswordComponent } from './admin/change-password/change-password.component';
import { CompanyComponent } from './admin/company/company.component';
import { ManagePatientComponent } from './admin/manage-patient/manage-patient.component';
import { OpdBookingComponent } from './admin/opd-booking/opd-booking.component';
import { OpticalAddComponent } from './admin/optical-add/optical-add.component';
import { OpdListComponent } from './admin/opd-list/opd-list.component';
import { SurgeryListComponent } from './admin/surgery-list/surgery-list.component';
import { GstComponent } from './admin/gst/gst.component';
import { OpticalBillingComponent } from './admin/optical-billing/optical-billing.component';
import { OpticalBillingListComponent } from './admin/optical-billing-list/optical-billing-list.component';
import { OpticalBillingListTodayComponent } from './admin/optical-billing-list-today/optical-billing-list-today.component';
import { MedicineComponent } from './admin/medicine/medicine.component';
import { CategoryComponent } from './admin/category/category.component';
import { OpdListTodayComponent } from './admin/opd-list-today/opd-list-today.component';
import { SurgeryListTodayComponent } from './admin/surgery-list-today/surgery-list-today.component';
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

const routes: Routes = [
  { path: '', redirectTo: "/admin-login", pathMatch: 'full' },
  { path: 'admin-login', component: AdminLoginComponent },
  {
    path: 'admin', component: AdminMasterComponent, children: [
      { path: 'gst', component: GstComponent },
      { path: 'supplier', component: SupplierComponent },
      { path: 'medicine-purchase', component: MedicinePurchaseComponent },
      { path: 'medicine-purchase/:id', component: MedicinePurchaseComponent },
      { path: 'medicine-purchase-list', component: MedicinePurchaseListComponent },
      { path: 'medicine-purchase-report', component: MedicinePurchaseReportComponent },
      { path: 'purchase-return', component: PurchaseReturnComponent },
      { path: 'purchase-return-list', component: PurchaseReturnListComponent },
      { path: 'patient-medicine-return', component: MedicineReturnComponent },
      { path: 'patient-medicine-return-list', component: MedicineReturnListComponent },
      { path: 'patient-medicine-sale', component: MedicineSaleComponent },
      { path: 'patient-medicine-sale-list', component: MedicineSaleListComponent },
      { path: 'patient-medicine-sale-Report', component: MedicineSaleReportComponent },
      { path: 'unit', component: UnitComponent },
      { path: 'medicine-type-list', component: MedicineTypeListComponent },
      { path: 'medicine-stock-list', component: MedicineStockListComponent },
      { path: 'expiry-medicine-list', component: ExpirymedicineDetailComponent },
      { path: 'manufacturer', component: ManufacturerComponent },
      { path: 'discharge-summary', component: DischargeSummaryComponent },
      { path: 'discharge-summary-list', component: DischargeSummaryListComponent },
      { path: 'doctor', component: DoctorComponent },
      { path: 'consent-form', component: ConsentFormComponent },
      { path: 'bill-item', component: BillItemComponent },
      { path: 'billing-item', component: BillingItemComponent },
      { path: 'billing-item-list', component: BillingItemListComponent },
      { path: 'billing-item-list-today', component: BillingItemListTodayComponent },
      { path: 'category', component:CategoryComponent },
      { path: 'medicine', component: MedicineComponent },
      { path: 'admin-dashboard', component: AdminDashboardComponent },
      { path: 'designation', component: DesignationComponent },
      { path: 'department', component: DepartmentComponent },
      { path: 'staff', component: StaffComponent },
      { path: 'staffLogin', component: StaffLoginComponent },
      { path: 'page-group', component: PageGroupComponent },
      { path: 'page', component: PageComponent },
      { path: 'menu', component: MenuComponent },
      { path: 'role', component: RoleComponent },
      { path: 'role-menu', component: RoleMenuComponent },
      { path: 'role-menu/:id', component: RoleMenuComponent },
      { path: 'state', component: StateComponent },
      { path: 'city', component: CityComponent },
      { path: 'change-password', component: ChangePasswordComponent },
      { path: 'company', component: CompanyComponent },
      { path: 'manage-patient', component: ManagePatientComponent },
      { path: 'opd-booking', component: OpdBookingComponent},
      {path:'OpticalAdd',component:OpticalAddComponent},
      {path:'surgery-package',component:SurgeryPackageComponent},
      {path:'surgery-bill',component:SurgeryBillComponent},
      {path:'opd-List',component:OpdListComponent},
      {path:'opd-List-today', component: OpdListTodayComponent },
      {path:'surgery-List',component:SurgeryListComponent},
      {path:'surgery-List-today',component:SurgeryListTodayComponent},
      {path:'optical-billing',component:OpticalBillingComponent},
      {path:'optical-billing-list',component:OpticalBillingListComponent},
      {path:'optical-billing-list-today',component:OpticalBillingListTodayComponent},
      {path:'canteen',component:CanteenComponent},
      {path:'canteen-billing',component:CanteenSellComponent},
      {path:'canteen-billing-list',component:CanteenBillingListComponent},
      {path:'prescription-head',component:PrescriptionHeadComponent},
      {path:'prescription-item',component:PrescriptionItemComponent},
      {path:'patient-prescription',component:PatientPrescriptionComponent},
      {path:'patient-prescription-list',component:PatientPrescriptionListComponent},
    ]
  },
  { path: 'page-not-found', component: PageNotFoundComponent },
  { path: '**', component: PageNotFoundComponent }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
