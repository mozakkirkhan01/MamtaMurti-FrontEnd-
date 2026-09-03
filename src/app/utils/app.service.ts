  import { Injectable } from '@angular/core';
  import { HttpClient, HttpHeaders } from "@angular/common/http";
  import { ConstantData } from './constant-data';

  @Injectable({
    providedIn: 'root'
  })
  export class AppService {
    private readonly apiUrl: string = ConstantData.getApiUrl();
    private readonly baseUrl: string = ConstantData.getBaseUrl();
    private readonly headers: HttpHeaders = new HttpHeaders({ 'AppKey': ConstantData.getAdminKey() });
    private selectedSurgeryData: any;
    private selectedOpdData: any;
    private selectedCanteenData: any;
    private selectedOpticalData: any;
    private selectedDsData: any;


    constructor(private http: HttpClient) {
    }

    getImageUrl(): string {
      return ConstantData.getBaseUrl();
    }

  setSelectedSurgeryData(data: any) {
    this.selectedSurgeryData = data;
  }

  getSelectedSurgeryData() {
    return this.selectedSurgeryData;
  }

    setSelectedOpdData(data: any) {
    this.selectedOpdData = data;
  }

  getSelectedOpdData() {
    return this.selectedOpdData;
  }

  setSelectedCanteenData(data: any) {
    this.selectedCanteenData = data;
  }

  getSelectedCanteenData() {
    return this.selectedCanteenData;
  }

  setSelectedOpticalData(data: any) {
    this.selectedOpticalData = data;
    
  }
  getSelectedOpticalData() {
    return this.selectedOpticalData;
  }
  getSelectedDsData() {
    return this.selectedDsData;
  }

  setSelectedDsData(data: any) {
    this.selectedDsData = data;
  }

    setgetSelectedBillingData(data: any) {
    this.selectedOpticalData = data;
  }

  getSelectedBillingData() {
    return this.selectedOpticalData;
  }

    // District
    getDistrictList(obj: any) {
      return this.http.post(this.apiUrl + "District/DistrictList", obj, { headers: this.headers })
    }

    saveDistrict(obj: any) {
      return this.http.post(this.apiUrl + "District/saveDistrict", obj, { headers: this.headers })
    }

    deleteDistrict(obj: any) {
      return this.http.post(this.apiUrl + "District/deleteDistrict", obj, { headers: this.headers })
    }

    // Company
    getCompanyList(obj: any) {
      return this.http.post(this.apiUrl + "Company/CompanyList", obj, { headers: this.headers })
    }

    saveCompany(obj: any) {
      return this.http.post(this.apiUrl + "Company/saveCompany", obj, { headers: this.headers })
    }

    deleteCompany(obj: any) {
      return this.http.post(this.apiUrl + "Company/deleteCompany", obj, { headers: this.headers })
    }

    // Designation 
    getDesignationList(obj: any) {
      return this.http.post(this.apiUrl + "Designation/DesignationList", obj, { headers: this.headers })
    }

    saveDesignation(obj: any) {
      return this.http.post(this.apiUrl + "Designation/saveDesignation", obj, { headers: this.headers })
    }

    deleteDesignation(obj: any) {
      return this.http.post(this.apiUrl + "Designation/deleteDesignation", obj, { headers: this.headers })
    }

    /* ---------------------------------------------------------------------- */

    //Department
    getDepartmentList(obj: any) {
      return this.http.post(this.apiUrl + "Department/DepartmentList", obj, { headers: this.headers })
    }

    saveDepartment(obj: any) {
      return this.http.post(this.apiUrl + "Department/saveDepartment", obj, { headers: this.headers })
    }

    deleteDepartment(obj: any) {
      return this.http.post(this.apiUrl + "Department/deleteDepartment", obj, { headers: this.headers })
    }

    /* ---------------------------------------------------------------------- */

      //Opticals 
    getOpticalList(obj: any) {
      return this.http.post(this.apiUrl + "Opticals/opticalsList", obj, { headers: this.headers })
    }

    saveOptical(obj: any) {
      return this.http.post(this.apiUrl + "Opticals/OpticalSave", obj, { headers: this.headers })
    }

    deleteOptical(obj: any) {
      return this.http.post(this.apiUrl + "Opticals/OpticalDelete", obj, { headers: this.headers })
    }


      //Canteens 
    getCanteenList(obj: any) {
      return this.http.post(this.apiUrl + "Canteen/CanteenList", obj, { headers: this.headers })
    }

    saveCanteen(obj: any) {
      return this.http.post(this.apiUrl + "Canteen/CanteenSave", obj, { headers: this.headers })
    }

    deleteCanteen(obj: any) {
      return this.http.post(this.apiUrl + "Canteen/CanteenDelete", obj, { headers: this.headers })
    }

  // Billing 

      getBillingList(obj: any) {
      return this.http.post(this.apiUrl + "Billing/BillingList", obj, { headers: this.headers })
    }

    saveBilling(obj: any) {
      return this.http.post(this.apiUrl + "Billing/BillingSave", obj, { headers: this.headers })
    }

    deleteBilling(obj: any) {
      return this.http.post(this.apiUrl + "Billing/BillingDelete", obj, { headers: this.headers })
    }

    saveBillingsBill(obj: any) {
      return this.http.post(this.apiUrl + "BillingItem/SaveBillingItem", obj, { headers: this.headers })
    }

    BillingItemList(obj: any) {
      return this.http.post(this.apiUrl + "BillingItem/BillingItemList", obj, { headers: this.headers })
    }

      UpdateListFromBillingItem(obj: any) {
      return this.http.post(this.apiUrl + "BillingItem/UpdateListFromBillingItem", obj, { headers: this.headers })
    }

    billItemSellList(obj: any) {
      return this.http.post(this.apiUrl + "BillingItem/BillItemSellList", obj, { headers: this.headers })
    }

      deleteBillingItem(obj: any) {
      return this.http.post(this.apiUrl + "BillingItem/DeleteBillingItem", obj, { headers: this.headers })
    }


    /* ---------------------------------------------------------------------- */
  // opticals billing 

    saveOpticalsBill(obj: any) {
      return this.http.post(this.apiUrl + "OpticalBilling/SaveOpticalBilling", obj, { headers: this.headers })
    }

      OpticalsBillList(obj: any) {
      return this.http.post(this.apiUrl + "OpticalBilling/OpticalBillingList", obj, { headers: this.headers })
    }

      saveOpticalsBillDue(obj: any) {
      return this.http.post(this.apiUrl + "OpticalBilling/ClearDueAmount", obj, { headers: this.headers })
    }

      DeliveryStatus(obj: any) {
      return this.http.post(this.apiUrl + "OpticalBilling/DeliveryStatus", obj, { headers: this.headers })
    }


    // canteen billing 

    saveCanteenBill(obj: any) {
      return this.http.post(this.apiUrl + "CanteenBilling/SaveCanteenBilling", obj, { headers: this.headers })
    }

      CanteensBillList(obj: any) {
      return this.http.post(this.apiUrl + "CanteenBilling/CanteenBillingList", obj, { headers: this.headers })
    }

      saveCanteensBillDue(obj: any) {
      return this.http.post(this.apiUrl + "CanteenBilling/ClearDueAmount", obj, { headers: this.headers })
    }

    OpticalSellList(obj: any) {
      return this.http.post(this.apiUrl + "OpticalBilling/OpticalSellList", obj, { headers: this.headers })
    }
    OpticalSellListPayment(obj: any) {
      return this.http.post(this.apiUrl + "OpticalBilling/OpticalSellListPayment", obj, { headers: this.headers })
    }

    CanteenSellListPayments(obj: any) {
      return this.http.post(this.apiUrl + "OpticalBilling/OpticalSellListPayment", obj, { headers: this.headers })
    }

    billItemSellListPayment(obj: any) {
      return this.http.post(this.apiUrl + "BillingItem/BillingSellListPayment", obj, { headers: this.headers })
    }


      SurgerySellList(obj: any) {
      return this.http.post(this.apiUrl + "Surgery/SurgerySellList", obj, { headers: this.headers })
    }
    SurgerySellListPayment(obj: any) {
      return this.http.post(this.apiUrl + "Surgery/SurgerySellListPayment", obj, { headers: this.headers })
    }


    DeleteOpticalBilling(obj: any) {
      return this.http.post(this.apiUrl + "OpticalBilling/DeleteOpticalBilling", obj, { headers: this.headers })
    }

      UpdateListFromOptical(obj: any) {
      return this.http.post(this.apiUrl + "OpticalBilling/UpdateListFromOptical", obj, { headers: this.headers })
    }

    //ChargeDetails

    getChargeList(obj: any) {
      return this.http.post(this.apiUrl + "ChargeDetails/ChargeList", obj, { headers: this.headers })
    }

    saveCharge(obj: any) {
      return this.http.post(this.apiUrl + "ChargeDetails/SaveCharge", obj, { headers: this.headers })
    }
    
    deleteCharge(obj: any) {
      return this.http.post(this.apiUrl + "ChargeDetails/DeleteCharge", obj, { headers: this.headers })
    }
    /* ---------------------------------------------------------------------- */

    //OPD booking services
      getOpdList(obj: any) {
      return this.http.post(this.apiUrl + "OpdBooking/OpdBookingList", obj, { headers: this.headers })
    }

    saveOpd(obj: any) {
      return this.http.post(this.apiUrl + "OpdBooking/SaveOpdBooking", obj, { headers: this.headers })
    }

    deleteOpd(obj: any) {
      return this.http.post(this.apiUrl + "OpdBooking/DeleteOpdBooking", obj, { headers: this.headers })
    }

        getOpdAllList(obj: any) {
      return this.http.post(this.apiUrl + "OpdBooking/ListOpd", obj, { headers: this.headers })
    }

    /* ---------------------------------------------------------------------- */

    //PaymentBooking Services
      getPaymentDetailList(obj: any) {
      return this.http.post(this.apiUrl + "PaymentDetail/PaymentDetailList", obj, { headers: this.headers })
    }

    savePaymentBooking(obj: any) {
      return this.http.post(this.apiUrl + "PaymentDetail/SavePaymentDetail", obj, { headers: this.headers })
    }

    deletePaymentBooking(obj: any) {
      return this.http.post(this.apiUrl + "PaymentDetail/DeletePaymentDetail", obj, { headers: this.headers })
    }

    /* ---------------------------------------------------------------------- */

    //PaymentCollection Services
      getPaymentCollection(obj: any) {
      return this.http.post(this.apiUrl + "PaymentCollection/PaymentCollectionList", obj, { headers: this.headers })
    }

    savePaymentCollection(obj: any) {
      return this.http.post(this.apiUrl + "PaymentCollection/SavePaymentCollection", obj, { headers: this.headers })
    }

    deletePaymentCollection(obj: any) {
      return this.http.post(this.apiUrl + "PaymentCollection/DeletePaymentCollection", obj, { headers: this.headers })
    }

    /* ---------------------------------------------------------------------- */

      //PaymentDetails Services
      getPaymentDetail(obj: any) {
      return this.http.post(this.apiUrl + "PaymentDetail/PaymentDetailList", obj, { headers: this.headers })
    }

    savePaymentDetail(obj: any) {
      return this.http.post(this.apiUrl + "PaymentDetail/SavePaymentDetail", obj, { headers: this.headers })
    }

    deletePaymentDetail(obj: any) {
      return this.http.post(this.apiUrl + "PaymentDetail/DeletePaymentDetail", obj, { headers: this.headers })
    }

    /* ---------------------------------------------------------------------- */
  // Surgery

    saveSurgery(obj: any) {
      return this.http.post(this.apiUrl + "Surgery/SaveSurgery", obj, { headers: this.headers })
    }

    getSurgeryDetial(obj: any) {
      return this.http.post(this.apiUrl + "Surgery/SurgeryList", obj, { headers: this.headers })
    }

      getSurgeryRecipt(obj: any) {
      return this.http.post(this.apiUrl + "Surgery/SurgeryReceiptDetails", obj, { headers: this.headers })
    }

      SurgeryBill(obj: any) {
      return this.http.post(this.apiUrl + "Surgery/SurgeryBill", obj, { headers: this.headers })
    }

      getsurgeryAllList(obj: any) {
      return this.http.post(this.apiUrl + "Surgery/ListSurgery", obj, { headers: this.headers })
    }

    deleteSurgeryDetial(obj: any) {
      return this.http.post(this.apiUrl + "Surgery/DeleteSurgery", obj, { headers: this.headers })
    }


      PrintSurgeryBill(ids : any) {
        window.open(this.baseUrl + "report/PrintSurgeryBill/" + ids);
    }

        PrintOpdBill(ids : any) {
        window.open(this.baseUrl + "report/PrintOpdBill/" + ids);
    }

        PrintOpticlalBill(ids : any) {
        window.open(this.baseUrl + "report/PrintOpticalBill/" + ids);
    }

    PrintPrescription(ids : any) {
      window.open(this.baseUrl + "report/PrintPrescriptionReport/" + ids);
  }
      PrintBillItem(ids : any) {
        window.open(this.baseUrl + "report/PrintBillingItem/" + ids);
    }
      PrintCanteenBillItem(ids : any) {
        window.open(this.baseUrl + "report/PrintCanteenBill/" + ids);
    }

        PrintConsentForm(ids : any) {
        window.open(this.baseUrl + "report/PrintConsentForm/" + ids);
    }

        PrintDischargeSummary(ids : any) {
        window.open(this.baseUrl + "report/PrintDischargeSummary/" + ids);
    }

          PrintMedicinePurchase(ids : any) {
        window.open(this.baseUrl + "report/PrintMedicinePurchase/" + ids);
    }
  CanteenSellList(obj: any) {
      return this.http.post(this.apiUrl + "CanteenBilling/CanteenSellList", obj, { headers: this.headers })
    }

    DeleteCanteenBilling(obj: any) {
      return this.http.post(this.apiUrl + "CanteenBilling/DeleteCanteenBilling", obj, { headers: this.headers })
    }

      UpdateListFromCanteen(obj: any) {
      return this.http.post(this.apiUrl + "CanteenBilling/UpdateListFromCanteen", obj, { headers: this.headers })
    }





    
    // Staff
    getStaffList(obj: any) {
      return this.http.post(this.apiUrl + "Staff/StaffList", obj, { headers: this.headers })
    }

    saveStaff(obj: any) {
      return this.http.post(this.apiUrl + "Staff/saveStaff", obj, { headers: this.headers })
    }

    deleteStaff(obj: any) {
      return this.http.post(this.apiUrl + "Staff/deleteStaff", obj, { headers: this.headers })
    }
  /*  ---------------------------------------------------------------------- */

  
    // Patient
    getPatientList(obj: any) {
      return this.http.post(this.apiUrl + "Patient/PatientList", obj, { headers: this.headers })
    }
    savePatient(obj: any) {
      return this.http.post(this.apiUrl + "Patient/SavePatient", obj, { headers: this.headers })
    }
    deletePatient(obj: any) {
      return this.http.post(this.apiUrl + "Patient/DeletePatient", obj, { headers: this.headers })
    }


    //doctor

    getDoctorList(obj: any) {
      return this.http.post(this.apiUrl + "Doctor/DoctorList", obj, { headers: this.headers })
    }
    saveDoctor(obj: any) {
      return this.http.post(this.apiUrl + "Doctor/SaveDoctor", obj, { headers: this.headers })
    }
    deleteDoctor(obj: any) {
      return this.http.post(this.apiUrl + "Doctor/DeleteDoctor", obj, { headers: this.headers })
    }

    // discharge Summary

      DischargeSummary(obj: any) {
      return this.http.post(this.apiUrl + "DischargeSummary/ListDischargeSummary", obj, { headers: this.headers })
    }
    saveDischargeSummary(obj: any) {
      return this.http.post(this.apiUrl + "DischargeSummary/SaveDischargeSummary", obj, { headers: this.headers })
    }
    deleteDischargeSummary(obj: any) {
      return this.http.post(this.apiUrl + "DischargeSummary/deleteDischargeSummaryList", obj, { headers: this.headers })
    }
  // consent 

  getConsentList(obj: any) {
      return this.http.post(this.apiUrl + "Consent/ConsentList", obj, { headers: this.headers })
    }
  saveConsent(obj: any) {
      return this.http.post(this.apiUrl + "Consent/saveConsent", obj, { headers: this.headers })
    }

    deleteConsent(obj: any) {
      return this.http.post(this.apiUrl + "Consent/DeleteConsent", obj, { headers: this.headers })
    }

    //supplier

    
  getSupplierList(obj: any) {
      return this.http.post(this.apiUrl + "supplier/SupplierList", obj, { headers: this.headers })
    }
  saveSupplier(obj: any) {
      return this.http.post(this.apiUrl + "supplier/saveSupplier", obj, { headers: this.headers })
    }

    deleteSupplier(obj: any) {
      return this.http.post(this.apiUrl + "supplier/DeleteSupplier", obj, { headers: this.headers })
    }


    // Purchase Return
    SaveReturnPurchaseProduct(obj: any) {
      return this.http.post(this.apiUrl + "purchaseReturn/SaveReturnProduct", obj, { headers: this.headers })
    }
    getPurchaseReturnReport(obj: any) {
      return this.http.post(this.apiUrl + "purchaseReturn/PurchaseReturnReport", obj, { headers: this.headers })
    }
    getPurchaseReturnItemList(obj: any) {
      return this.http.post(this.apiUrl + "purchaseReturn/PurchaseReturnItemList", obj, { headers: this.headers })
    }
    getPurchaseReturnDetail(obj: any) {
      return this.http.post(this.apiUrl + "purchaseReturn/PurchaseReturnDetail", obj, { headers: this.headers })
    }
    getPurchaseReturnList(obj: any) {
      return this.http.post(this.apiUrl + "purchaseReturn/PurchaseReturnList", obj, { headers: this.headers })
    }

    getPurchaseReport(obj: any) {
      return this.http.post(this.apiUrl + "Purchase/PurchaseReport", obj, { headers: this.headers })
    }

    /* ---------------------------------------------------------------------- */

      // PackageCollection
    getPackageCollection(obj: any) {
      return this.http.post(this.apiUrl + "PackageCollection/PackageCollection", obj, { headers: this.headers })
    }
    savePackageCollection(obj: any) {
      return this.http.post(this.apiUrl + "PackageCollection/SavePackageCollection", obj, { headers: this.headers })
    }
    deletePackageCollection(obj: any) {
      return this.http.post(this.apiUrl + "PackageCollection/DeletePackageCollection", obj, { headers: this.headers })
    }

    /* ---------------------------------------------------------------------- */

      //    // PackageCollection
    getPackageDetial(obj: any) {
      return this.http.post(this.apiUrl + "PackageDetial/PackageDetialList", obj, { headers: this.headers })
    }
    savePackageDetial(obj: any) {
      return this.http.post(this.apiUrl + "PackageDetial/SavePackageDetial", obj, { headers: this.headers })
    }
    deletePackageDetial(obj: any) {
      return this.http.post(this.apiUrl + "PackageDetial/DeletePackageDetial", obj, { headers: this.headers })
    }

    PackageDetailtypeListAll(obj: any) {
      return this.http.post(this.apiUrl + "PackageDetial/PackageDetialList", obj, { headers: this.headers })
    }

    PackageCollectiontypeListAll(obj: any) {
      return this.http.post(this.apiUrl + "PackageDetial/PackageCollectiontypeList", obj, { headers: this.headers })
    }

    /* ---------------------------------------------------------------------- */
    
    
    /* ---------------------------------------------------------------------- */

    // Staff Login
    StaffLogin(obj: any) {
      return this.http.post(this.apiUrl + "StaffLogin/StaffLogin", obj, { headers: this.headers })
    }

    getStaffLoginList(obj: any) {
      return this.http.post(this.apiUrl + "StaffLogin/StaffLoginList", obj, { headers: this.headers })
    }

    saveStaffLogin(obj: any) {
      return this.http.post(this.apiUrl + "StaffLogin/saveStaffLogin", obj, { headers: this.headers })
    }

    deleteStaffLogin(obj: any) {
      return this.http.post(this.apiUrl + "StaffLogin/deleteStaffLogin", obj, { headers: this.headers })
    }

    changePassword(obj: any) {
      return this.http.post(this.apiUrl + "StaffLogin/changePassword", obj, { headers: this.headers })
    }




    ///

  //Sell
    saveReturnProduct(data: any) {
      return this.http.post(this.apiUrl + "returnProduct/SaveReturnProduct", data, { headers: this.headers })

    }
    SaveReturnDirectSell(data: any) {
      return this.http.post(this.apiUrl + "returnDirSell/SaveReturnDirectSell", data, { headers: this.headers })

    }
    saveNewSellItem(obj: any) {
      return this.http.post(this.apiUrl + "returnProduct/SaveNewSellItem", obj, { headers: this.headers })
    }
    saveNewDirectSellItem(obj: any) {
      return this.http.post(this.apiUrl + '/api/returnDirSell/SaveNewDirectSellItem', obj)
    }
    getBillDetailList(obj: any) {
      return this.http.post(this.apiUrl + "returnProduct/BillDetail", obj, { headers: this.headers })
    }   
    getMedicineReturnItemList(obj: any) {
      return this.http.post(this.apiUrl + '/api/returnProduct/MedicineReturnItemList', obj)
    }
    getMedicineReturnList(obj: any) {
      return this.http.post(this.apiUrl + "returnProduct/MedicineReturnList", obj, { headers: this.headers })
    }
    getDirectBillDetail(obj: any) {
      return this.http.post(this.apiUrl + '/api/directSell/DirectBillDetail', obj)
    }
    getDailySellList(SellDateModel: any) {
      return this.http.post(this.apiUrl + '/api/Sell/DailySellList', SellDateModel)
    }
    getDailyDirectSellList(SellDateModel: any) {
      return this.http.post(this.apiUrl + '/api/directSell/DailyDirectSellList', SellDateModel)
    }

    getSellReturnList(obj: any) {
      return this.http.post(this.apiUrl + '/api/returnProduct/SellReturnList', obj)
    }
    getDirectSellReturnList(obj: any) {
      return this.http.post(this.apiUrl + '/api/returnDirSell/DirectSellReturnList', obj)
    }
    getSellList(obj: any) {
      return this.http.post(this.apiUrl + '/api/Sell/SellList', obj)
    }
    getSellDetail(obj: any) {
      return this.http.post(this.apiUrl + '/api/Sell/SellDetail', obj)
    }
    saveSell(obj: any) {
      return this.http.post(this.apiUrl + '/api/Sell/saveSell', obj)
    }
    deleteSell(obj: any) {
      return this.http.post(this.apiUrl + '/api/Sell/deleteSell', obj)
    }
    getSaleDetail(obj: any) {
      return this.http.post(this.apiUrl + 'PaymentCollection/SaleDetail', obj,{ headers: this.headers })
    }
  
    /* ---------------------------------------------------------------------- */

    //PageGroup
    getPageGroupList(obj: any) {
      return this.http.post(this.apiUrl + "PageGroup/PageGroupList", obj, { headers: this.headers })
    }

    savePageGroup(obj: any) {
      return this.http.post(this.apiUrl + "PageGroup/savePageGroup", obj, { headers: this.headers })
    }

    deletePageGroup(obj: any) {
      return this.http.post(this.apiUrl + "PageGroup/deletePageGroup", obj, { headers: this.headers })
    }

    /* ---------------------------------------------------------------------- */

    //Page
    getPageList(obj: any) {
      return this.http.post(this.apiUrl + "Page/PageList", obj, { headers: this.headers })
    }

    savePage(obj: any) {
      return this.http.post(this.apiUrl + "Page/savePage", obj, { headers: this.headers })
    }

    deletePage(obj: any) {
      return this.http.post(this.apiUrl + "Page/deletePage", obj, { headers: this.headers })
    }

    /* ---------------------------------------------------------------------- */

    //Menu
    getUserMenuList(obj: any) {
      return this.http.post(this.apiUrl + "Menu/UserMenuList", obj, { headers: this.headers })
    }

    validiateMenu(obj: any) {
      return this.http.post(this.apiUrl + "Menu/ValidiateMenu", obj, { headers: this.headers })
    }

    getMenuList(obj: any) {
      return this.http.post(this.apiUrl + "Menu/MenuList", obj, { headers: this.headers })
    }

    saveMenu(obj: any) {
      return this.http.post(this.apiUrl + "Menu/saveMenu", obj, { headers: this.headers })
    }

    deleteMenu(obj: any) {
      return this.http.post(this.apiUrl + "Menu/deleteMenu", obj, { headers: this.headers })
    }

    menuUp(obj: any) {
      return this.http.post(this.apiUrl + "Menu/MenuUp", obj, { headers: this.headers })
    }

    menuDown(obj: any) {
      return this.http.post(this.apiUrl + "Menu/MenuDown", obj, { headers: this.headers })
    }

    /* ---------------------------------------------------------------------- */

    //Role
    getRoleList(obj: any) {
      return this.http.post(this.apiUrl + "Role/RoleList", obj, { headers: this.headers })
    }

    saveRole(obj: any) {
      return this.http.post(this.apiUrl + "Role/saveRole", obj, { headers: this.headers })
    }

    deleteRole(obj: any) {
      return this.http.post(this.apiUrl + "Role/deleteRole", obj, { headers: this.headers })
    }

    /* ---------------------------------------------------------------------- */

    //RoleMenu
    getRoleMenuList(obj: any) {
      return this.http.post(this.apiUrl + "RoleMenu/AllRoleMenuList", obj, { headers: this.headers })
    }

    saveRoleMenu(obj: any) {
      return this.http.post(this.apiUrl + "RoleMenu/saveRoleMenu", obj, { headers: this.headers })
    }

    /* ---------------------------------------------------------------------- */

    //StaffLoginRole
    getStaffLoginRoleList(obj: any) {
      return this.http.post(this.apiUrl + "StaffLoginRole/StaffLoginRoleList", obj, { headers: this.headers })
    }

    saveStaffLoginRole(obj: any) {
      return this.http.post(this.apiUrl + "StaffLoginRole/saveStaffLoginRole", obj, { headers: this.headers })
    }

    deleteStaffLoginRole(obj: any) {
      return this.http.post(this.apiUrl + "StaffLoginRole/deleteStaffLoginRole", obj, { headers: this.headers })
    }

    //State
    getStateList(obj: any) {
      return this.http.post(this.apiUrl + "State/StateList", obj, { headers: this.headers })
    }

    saveState(obj: any) {
      return this.http.post(this.apiUrl + "State/saveState", obj, { headers: this.headers })
    }

    deleteState(obj: any) {
      return this.http.post(this.apiUrl + "State/deleteState", obj, { headers: this.headers })
    }

    /* ---------------------------------------------------------------------- */

    //City
    getCityList(obj: any) {
      return this.http.post(this.apiUrl + "City/CityList", obj, { headers: this.headers })
    }

    saveCity(obj: any) {
      return this.http.post(this.apiUrl + "City/saveCity", obj, { headers: this.headers })
    }

    deleteCity(obj: any) {
      return this.http.post(this.apiUrl + "City/deleteCity", obj, { headers: this.headers })
    }

  //get medicine list
      getMedicineTypeList(obj: any) {
      return this.http.post(this.apiUrl + "MedicineType/MedicineTypeList", obj,{ headers: this.headers })
    }
    saveMedicineType(obj: any) {
      return this.http.post(this.apiUrl + "MedicineType/SaveMedicineType", obj,{ headers: this.headers })
    }
    deleteMedicineType(obj: any) {
      return this.http.post(this.apiUrl + "MedicineType/DeleteMedicineType", obj,{ headers: this.headers })
    }



    //unit list 

        getUnitList(obj: any) {
      return this.http.post(this.apiUrl + "Unit/UnitList", obj,{ headers: this.headers })
    }
    saveUnit(obj: any) {
      return this.http.post(this.apiUrl + "Unit/SaveUnit", obj,{ headers: this.headers })
    }
    deleteUnit(obj: any) {
      return this.http.post(this.apiUrl + "Unit/DeleteUnit", obj,{ headers: this.headers })
    }





    // pharmasy

    //Patient Medicine Return

    // getStockCompareReport(obj: any) {
    //   return this.http.post(this.apiUrl + "PaymentCollection/StockCompareReport", obj)
    // }
    getPatientMedicineReturnDetailCollectionList(obj: any) {
      return this.http.post(this.apiUrl + "MedReturn/PatientMedicineReturnDetailCollectionList", obj)
    }
    getPatientMedicineReturnDetailList(obj: any) {
      return this.http.post(this.apiUrl + "MedReturn/PatientMedicineReturnDetailList", obj)
    }
    getPatientMedicineReturnDetailCollectionReport(obj: any) {
      return this.http.post(this.apiUrl + 'MedReturn/PatientMedicineReturnDetailCollectionReport', obj)
    }
    // getMedicineBillList(obj: any) {
    //   return this.http.post(this.apiUrl + 'MedReturn/MedicineBillList', obj)
    // }
    saveMedicalReturnPayment(obj: any) {
      return this.http.post(this.apiUrl + 'MedReturn/saveMedicalReturnPayment', obj)
    }
    deletePatientMedicineReturn(obj: any) {
      return this.http.post(this.apiUrl + 'MedReturn/DeletePatientMedicineReturn', obj)
    }
    getPatientMedicineReturnList(obj: any) {
      return this.http.post(this.apiUrl + 'MedReturn/PatientMedicineReturnList', obj)
    }
    getReturnDetail(obj: any) {
      return this.http.post(this.apiUrl + 'MedReturn/ReturnDetail', obj)
    }

    //PaymentCollection

    getStockCompareReport(obj: any) {
      return this.http.post(this.apiUrl + "PaymentCollection/StockCompareReport", obj)
    }
    getPharmacyReport(obj: any) {
      return this.http.post(this.apiUrl + "PaymentCollection/PharmacyReport", obj)
    }
    getPaymentMedicineCollectionReport(obj: any) {
      return this.http.post(this.apiUrl + "PaymentCollection/PaymentMedicineCollectionReport", obj,{ headers: this.headers })
    }

    getPaymentMedicineCollectionList(obj: any) {
      return this.http.post(this.apiUrl + "PaymentCollection/PaymentMedicineCollectionList", obj,{ headers: this.headers })
    }
    getPaymentCollectionList(obj: any) {
      return this.http.post(this.apiUrl + 'PaymentCollection/PaymentCollectionList', obj)
    }
    getMedicineBillList(obj: any) {
      return this.http.post(this.apiUrl + "returnProduct/MedicineBillList", obj,{ headers: this.headers })
    }
    saveMedicalPayment(obj: any) {
      return this.http.post(this.apiUrl + 'PaymentCollection/saveMedicalPayment', obj,{ headers: this.headers })
    }

    getPaymentMedicineList(obj: any) {
      return this.http.post(this.apiUrl + 'PaymentCollection/PaymentMedicineList', obj,{ headers: this.headers })
    }

    //MedicineStock
    EditMedicineStock(obj: any) {
      return this.http.post(this.apiUrl + 'MedicineStock/EditMedicineStock', obj,{ headers: this.headers })
    }
    getMedicineStockListBySupplier(obj: any) {
      return this.http.post(this.apiUrl + 'MedicineStock/MedicineStockListBySupplier', obj,{ headers: this.headers })
      
    }
    getMedicineStockListForSell(obj: any) {
      return this.http.post(this.apiUrl + 'MedicineStock/MedicineStockListForSell', obj,{ headers: this.headers })
    }
    getMedicineStockListForReturn(obj: any) {
      return this.http.post(this.apiUrl + 'MedicineStock/MedicineStockListForReturn', obj,{ headers: this.headers })
    }
    getMedicineStockList(obj: any) {
      return this.http.post(this.apiUrl + 'MedicineStock/MedicineStockList', obj,{ headers: this.headers })
    }

    //PurchaseProduct
    getPurchaseProductList(obj: any) {
      return this.http.post(this.apiUrl + "PurchaseProduct/PurchaseProductList", obj, { headers: this.headers })

    }
    getPurchaseChallanProductList(obj: any) {
      return this.http.post(this.apiUrl + 'PurchaseProduct/PurchaseChallanProductList', obj)
    }


    //Employee
    // getEmployeeList(obj: any) {
    //   return this.http.post(this.apiUrl + '/api/Employee/EmployeeList', obj)
    // }
    // saveEmployee(obj: any) {
    //   return this.http.post(this.apiUrl + '/api/Employee/saveEmployee', obj)
    // }
    // deleteEmployee(obj: any) {
    //   return this.http.post(this.apiUrl + '/api/Employee/deleteEmployee', obj)
    // }
    // changePassword(obj: any) {
    //   return this.http.post(this.apiUrl + '/api/Employee/changePassword', obj)
    // }
    // employeeLogin(obj: any) {
    //   return this.http.post(this.apiUrl + '/api/Employee/EmployeeLogin', obj)
    // }


    //ProductStock
    getProductStockList(obj: any) {
      return this.http.post(this.apiUrl + '/api/ProductStock/ProductStockList', obj)
    }
    getProductStockDetailList(obj: any) {
      return this.http.post(this.apiUrl + "ProductStock/ProductStockDetailList", obj, { headers: this.headers })
    }

    getProductStockHistoryList(obj: any) {
      return this.http.post(this.apiUrl + '/api/ProductStock/ProductStockHistoryList', obj)
    }



    //Medicine
    getMedicineListForPrescription(obj: any) {
      return this.http.post(this.apiUrl + 'Medicine/MedicineListForPrescription', obj)
    }
    getTestMedicineList(obj: any) {
      return this.http.post(this.apiUrl + 'Medicine/TestMedicineList', obj)
    }
    // getMedicineList(obj: any) {
    //   return this.http.post(this.apiUrl + 'Medicine/MedicineList', obj, { headers: this.headers })
    // }

      getMedicineList(obj: any) {
      return this.http.post(this.apiUrl + "Medicine/MedicineList", obj, { headers: this.headers })
    }

    getSearchMedicine(obj: any) {
      return this.http.post(this.apiUrl + 'Medicine/SearchMedicine', obj)
    }
    saveMedicine(obj: any) {
      return this.http.post(this.apiUrl + "Medicine/SaveMedicine", obj,{ headers: this.headers })
    }
    deleteMedicine(obj: any) {
      return this.http.post(this.apiUrl + "Medicine/DeleteMedicine", obj,{ headers: this.headers })
    }
    ExpiringSoonMedicineList(obj: any) {
      return this.http.post(this.apiUrl + "Medicine/ExpiringSoonMedicineList", obj,{ headers: this.headers })
    }


    // getCategoryList(obj: any) {
    //   return this.http.post(this.apiUrl + 'Medicine/MedicineList', obj)
    // }

    // getUnitList(obj: any) {
    //   return this.http.post(this.apiUrl + 'Medicine/MedicineList', obj)
    // }

    //Manufacturer
    getManufacturerList(obj: any) {
      return this.http.post(this.apiUrl + "Manufacturer/ManufacturerList", obj,{ headers: this.headers })
    }
    saveManufacturer(obj: any) {
      return this.http.post(this.apiUrl + "Manufacturer/SaveManufacturer", obj,{ headers: this.headers })
    }
    deleteManufacturer(obj: any) {
      return this.http.post(this.apiUrl + "Manufacturer/DeleteManufacturer", obj,{ headers: this.headers })
    }


    

    //Unit

    getUnitValueList(obj: any) {
      return this.http.post(this.apiUrl + 'Unit/UnitValueList', obj)
    }

    //GST
    saveGST(obj: any) {
      return this.http.post(this.apiUrl + "gst/saveGST", obj,{ headers: this.headers })
    }
    

    getGSTList(obj: any) {
      return this.http.post(this.apiUrl + 'gst/GstList', obj, { headers: this.headers })
    }

    
    deleteGST(obj: any) {
          return this.http.post(this.apiUrl + 'gst/DeleteGST', obj, { headers: this.headers })
    }


  // print reciept

          printMedicineReciept(ids : any) {
        window.open(this.baseUrl + "report/PrintMedicineSaleBill/" + ids);
    }

    


    // catogery apis ?

  getCategoryList(obj: any) {
      return this.http.post(this.apiUrl + 'Category/CategoryList', obj, { headers: this.headers })
    }

    saveCategory(obj: any) {
      return this.http.post(this.apiUrl + 'Category/SaveCategory', obj, { headers: this.headers })
    }
    deleteCategory(obj: any) {
      return this.http.post(this.apiUrl + 'Category/DeleteCategory', obj, { headers: this.headers })
    }


    //head 
    getHeadList(obj: any) {
      return this.http.post(this.apiUrl + 'Head/PrescriptionHeadList', obj, { headers: this.headers })
    }

    saveHead(obj: any) {
      return this.http.post(this.apiUrl + 'Head/SavePrescriptionHead', obj, { headers: this.headers })
    }
    deleteHead(obj: any) {
      return this.http.post(this.apiUrl + 'Head/DeletePrescriptionHead', obj, { headers: this.headers })
    }


    //item
    getPrescriptionItemList(obj: any) {
      return this.http.post(this.apiUrl + 'PrescriptionItem/PrescriptionItemList', obj, { headers: this.headers })
    }

    savePrescriptionItem(obj: any) {
      return this.http.post(this.apiUrl + 'PrescriptionItem/SavePrescriptionItem', obj, { headers: this.headers })
    }
    deletePrescriptionItem(obj: any) {
      return this.http.post(this.apiUrl + 'PrescriptionItem/DeletePrescriptionItem', obj, { headers: this.headers })
    }
    getPatientPrescriptionList(obj: any) {
      return this.http.post(this.apiUrl + 'PatientPrescription/PrescriptionItemList', obj, { headers: this.headers })
    }

    savePatientPrescription(obj: any) {
      return this.http.post(this.apiUrl + 'PatientPrescription/SavePatientPrescription', obj, { headers: this.headers })
    }
    deletePatientPrescription(obj: any) {
      return this.http.post(this.apiUrl + 'PatientPrescription/DeletePatientPrescription', obj, { headers: this.headers })
    }
    GetPrescriptionList(obj: any) {
      return this.http.post(this.apiUrl + "PatientPrescription/PatientPrescriptionList", obj, { headers: this.headers })
    }
    getPatientPrescriptionItem(obj: any) {
      return this.http.post(this.apiUrl + "PatientPrescription/GetPatientPrescriptionItems", obj, { headers: this.headers })
    }

    GetPatientPrescriptionDetails(obj: any) {
      return this.http.post(this.apiUrl + "PatientPrescription/GetPatientPrescriptionDetails", obj, { headers: this.headers })
    }



      savePurchase(obj: any) {
      return this.http.post(this.apiUrl + 'Purchase/savePurchase', obj, { headers: this.headers })

    }
    getPurchaseDetail(obj: any) {
      return this.http.post(this.apiUrl + 'Purchase/PurchaseDetail', obj, { headers: this.headers })

    }
    getPurchaseList(obj: any) {
      return this.http.post(this.apiUrl + 'Purchase/PurchaseList', obj, { headers: this.headers })
    }

  deletePurchase(obj: any) {
      return this.http.post(this.apiUrl + 'Purchase/deletePurchase', obj, { headers: this.headers })
    }

      getExpiryMedicineList(obj: any) {
      return this.http.post(this.apiUrl + 'Medicine/ExpiryMedicineList', obj, { headers: this.headers })

    }
      getSearchPatientList(obj: any) {
      return this.http.post(this.apiUrl + 'patient/PatientList', obj, { headers: this.headers })

    }
     getExpiringSoonMedicineList(obj: any) {
      return this.http.post(this.apiUrl + 'Medicine/ExpiringSoonMedicineList', obj, { headers: this.headers })

    }




    // General Patient

    deleteGeneralPatient(obj: any) {
      return this.http.post(this.apiUrl + 'generalPatient/DeleteGeneralPatient', obj, { headers: this.headers })
    }
    getSearchGeneralPatientReport(obj: any) {
      return this.http.post(this.apiUrl + 'generalPatient/SearchGeneralPatientReport', obj, { headers: this.headers })
    }
    getGeneralPatientList(obj: any) {
      return this.http.post(this.apiUrl + 'generalPatient/GeneralPatientList', obj, { headers: this.headers })
    }
    getSearchGeneralPatientList(obj: any) {
      return this.http.post(this.apiUrl + 'patient/PatientList', obj, { headers: this.headers })
    }

    saveGeneralPatient(obj: any) {
      return this.http.post(this.apiUrl + 'generalPatient/SaveGeneralPatient', obj, { headers: this.headers })
    }







    getDosageList(obj: any) {
      return this.http.post(this.apiUrl + 'Dosage/DosageList', obj, { headers: this.headers })
    }

    deleteDosage(obj: any) {
      return this.http.post(this.apiUrl + 'Dosage/DeleteDosage', obj, { headers: this.headers })
    }

    saveDosage(obj: any) {
      return this.http.post(this.apiUrl + 'Dosage/SaveDosage', obj, { headers: this.headers })
    }


  }
