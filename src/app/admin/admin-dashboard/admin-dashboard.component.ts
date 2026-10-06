import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AppService } from '../../utils/app.service';
import { ConstantData } from '../../utils/constant-data';
import { LocalService } from '../../utils/local.service';
import { LoadDataService } from '../../utils/load-data.service';
import { RequestModel } from '../../utils/interface';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-admin-dashboard',
  templateUrl: './admin-dashboard.component.html',
  styleUrls: ['./admin-dashboard.component.css']
})
export class AdminDashboardComponent implements OnInit {
  dataLoading: boolean = false;
  currentDate: Date = new Date();

  metrics: any = {
    TotalPatients: 0,
    TodayPatients: 0,
    TotalRevenue: 0,
    TodayRevenue: 0,
    TotalDue: 0,
    TotalOpdVisits: 0,
    TodayOpdVisits: 0,
    TotalPharmacySales: 0,
    TodayPharmacySales: 0,
    TotalOpticalSales: 0,
    TodayOpticalSales: 0,
    TotalSurgeries: 0
  };

  departmentRevenue: any = {
    PharmacyRevenue: 0,
    OpdRevenue: 0,
    OpticalRevenue: 0,
    SurgeryRevenue: 0,
    OtherRevenue: 0
  };

  weeklyTrend: any[] = [];
  recentTransactions: any[] = [];
  lowStockMedicines: any[] = [];
  doctors: any[] = [];

  pharmacyShare: number = 0;
  opdShare: number = 0;
  opticalShare: number = 0;
  otherShare: number = 0;
  maxWeeklyAmount: number = 1;

  constructor(
    private service: AppService,
    private localService: LocalService,
    public loadData: LoadDataService,
    private toastr: ToastrService,
    private router: Router
  ) { }

  ngOnInit(): void {
    this.getDashboardData();
  }

  getDashboardData(): void {
    this.dataLoading = true;
    const obj: RequestModel = {
      request: this.localService.encrypt(JSON.stringify({})).toString(),
    };

    this.service.getDashboardData(obj).subscribe({
      next: (r1: any) => {
        const response = r1 as any;
        if (response.Message === ConstantData.SuccessMessage) {
          this.metrics = response.Metrics || this.metrics;
          this.departmentRevenue = response.DepartmentRevenue || this.departmentRevenue;
          this.weeklyTrend = response.WeeklyTrend || [];
          this.recentTransactions = response.RecentTransactions || [];
          this.lowStockMedicines = response.LowStockMedicines || [];
          this.doctors = response.Doctors || [];

          const totalRev = Number(this.metrics.TotalRevenue) || 1;
          this.pharmacyShare = Math.min(100, Math.round(((Number(this.departmentRevenue.PharmacyRevenue) || 0) / totalRev) * 100));
          this.opdShare = Math.min(100, Math.round(((Number(this.departmentRevenue.OpdRevenue) || 0) / totalRev) * 100));
          this.opticalShare = Math.min(100, Math.round(((Number(this.departmentRevenue.OpticalRevenue) || 0) / totalRev) * 100));
          this.otherShare = Math.max(0, 100 - (this.pharmacyShare + this.opdShare + this.opticalShare));

          if (this.weeklyTrend.length > 0) {
            this.maxWeeklyAmount = Math.max(...this.weeklyTrend.map(d => Number(d.TotalCollected) || 0), 1);
          }
        } else {
          this.toastr.error(response.Message || 'Failed to load dashboard data');
        }
        this.dataLoading = false;
      },
      error: (err: any) => {
        this.toastr.error('Error occurred while fetching dashboard statistics.');
        this.dataLoading = false;
      }
    });
  }

  getBarHeight(amount: number): number {
    if (!this.maxWeeklyAmount || this.maxWeeklyAmount === 0) return 10;
    const pct = Math.round((Number(amount) / this.maxWeeklyAmount) * 100);
    return Math.max(12, Math.min(100, pct));
  }

  navigate(url: string): void {
    this.router.navigate([url]);
  }

  printReceipt(item: any): void {
    if (!item || !item.PaymentCollectionId) return;
    if (item.PaymentType === 5) {
      this.service.printMedicineReciept(item.PaymentCollectionId);
    } else if (item.PaymentType === 1) {
      window.open(ConstantData.getBaseUrl() + 'report/PrintOpdBill/' + item.PaymentCollectionId);
    } else if (item.PaymentType === 3) {
      window.open(ConstantData.getBaseUrl() + 'report/PrintOpticalBill/' + item.PaymentCollectionId);
    } else if (item.PaymentType === 2) {
      window.open(ConstantData.getBaseUrl() + 'report/PrintSurgeryBill/' + item.PaymentCollectionId);
    } else {
      window.open(ConstantData.getBaseUrl() + 'report/PrintBillingItem/' + item.PaymentCollectionId);
    }
  }
}
