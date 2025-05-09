import { Component, computed, effect, inject, signal } from '@angular/core';
import { DashboardService } from '../../core/services/dashboard.service';
import { JsonPipe, NgClass, DatePipe, DecimalPipe, KeyValuePipe, CommonModule } from '@angular/common';
import { NgxEchartsModule } from 'ngx-echarts';
import { EChartsOption } from 'echarts';
import { DashboardStats, UserMoodStats, DailyBlogsStats } from '../../core/interfaces/dashboard-http.interface';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [ NgxEchartsModule, DecimalPipe, CommonModule],
  templateUrl: './dashboard-page.component.html',
})
export default class DashboardPageComponent {
  private dashboardService = inject(DashboardService);

  dashboardStats = this.dashboardService.dashboardStats;
  blogStats = this.dashboardService.blogStats;
  userMoodStats = this.dashboardService.userMoodStats;

  totalUsers = computed(() => {
    const stats = this.dashboardStats();
    console.log('Dashboard stats for users:', stats); 
    return stats && stats.totalUsers ? stats.totalUsers.currentValue : 0;
  });

  totalUsersChange = computed(() => {
    const stats = this.dashboardStats();
    return stats && stats.totalUsers ? stats.totalUsers.percentageChange : 0;
  });

  blogPosts = computed(() => {
    const stats = this.dashboardStats();
    return stats && stats.blogPosts ? stats.blogPosts.currentValue : 0;
  });

  blogPostsChange = computed(() => {
    const stats = this.dashboardStats();
    return stats && stats.blogPosts ? stats.blogPosts.percentageChange : 0;
  });

  moodEntries = computed(() => {
    const stats = this.dashboardStats();
    return stats && stats.moodEntries ? stats.moodEntries.currentValue : 0;
  });

  moodEntriesChange = computed(() => {
    const stats = this.dashboardStats();
    return stats && stats.moodEntries ? stats.moodEntries.percentageChange : 0;
  });

  healthCenters = computed(() => {
    const stats = this.dashboardStats();
    return stats && stats.healthCenters ? stats.healthCenters.currentValue : 0;
  });

  healthCentersChange = computed(() => {
    const stats = this.dashboardStats();
    return stats && stats.healthCenters ? stats.healthCenters.percentageChange : 0;
  });

  activeTab = signal('Mood States');
  chartOption = signal<EChartsOption>({});
  blogChartOption = signal<EChartsOption>({});
  isLoading = signal(true);

  mostActiveDayFormatted = computed(() => {
    const mostActiveDay = this.getMostActiveDay();
    if (!mostActiveDay || !mostActiveDay.date) return 'N/A';
    return new Date(mostActiveDay.date).toLocaleDateString();
  });

  mostActiveDayCount = computed(() => {
    const mostActiveDay = this.getMostActiveDay();
    return mostActiveDay ? mostActiveDay.count : 0;
  });

  constructor() {
    effect(() => {
      const moodStatsData = this.userMoodStats();
      if (moodStatsData && Array.isArray(moodStatsData) && moodStatsData.length > 0) {
        this.updateMoodChart(moodStatsData);
        this.isLoading.set(false);
      }
    });

    effect(() => {
      const blogStatsData = this.blogStats();
      if (blogStatsData && Array.isArray(blogStatsData) && blogStatsData.length > 0) {
        this.updateBlogChart(blogStatsData);
        this.isLoading.set(false);
      }
    });

    effect(() => {
      if (this.dashboardStats()) {
        console.log('Dashboard stats loaded:', this.dashboardStats());
        this.isLoading.set(false);
      }
    });
  }

  setActiveTab(tab: string): void {
    this.activeTab.set(tab);
  }

  getTotalBlogPosts(): number {
    const stats = this.blogStats();
    if (!stats || !Array.isArray(stats) || stats.length === 0) return 0;

    return stats.reduce(function(sum, item) {
      return sum + (item.count || 0);
    }, 0);
  }

  getMostActiveDay(): DailyBlogsStats | null {
    const stats = this.blogStats();
    if (!stats || !Array.isArray(stats) || stats.length === 0) {
      return null;
    }

    return stats.reduce(function(max, current) {
      return (current.count || 0) > (max.count || 0) ? current : max;
    }, stats[0]);
  }

  getDailyAverage(): number {
    const stats = this.blogStats();
    if (!stats || !Array.isArray(stats) || stats.length === 0) {
      return 0;
    }

    const totalPosts = this.getTotalBlogPosts();
    const daysWithPosts = stats.filter(function(item) {
      return (item.count || 0) > 0;
    }).length;

    if (daysWithPosts === 0) return 0;

    return totalPosts / daysWithPosts;
  }

  hasBlogStats(): boolean {
    const stats = this.blogStats();
    return !!(stats && Array.isArray(stats) && stats.length > 0);
  }



  updateMoodChart(data: UserMoodStats[]): void {
    if (!data || !Array.isArray(data) || data.length === 0) return;

    const dates = data.map(item => new Date(item.date).toLocaleDateString());
    const counts = data.map(item => item.count);

    this.chartOption.set({
      tooltip: {
        trigger: 'axis',
        axisPointer: {
          type: 'shadow'
        }
      },
      grid: {
        left: '3%',
        right: '4%',
        bottom: '3%',
        containLabel: true
      },
      xAxis: {
        type: 'category',
        data: dates,
        axisLabel: {
          rotate: 45,
          interval: 2
        }
      },
      yAxis: {
        type: 'value'
      },
      series: [
        {
          name: 'Daily Mood Entries',
          type: 'bar',
          data: counts,
          itemStyle: {
            color: '#90CDF4'
          },
          emphasis: {
            itemStyle: {
              color: '#3182CE'
            }
          }
        }
      ],
      color: ['#90CDF4']
    });
  }

  updateBlogChart(data: DailyBlogsStats[]): void {
    if (!data || !Array.isArray(data) || data.length === 0) return;

    // Format data for chart
    const dates = data.map(item => new Date(item.date).toLocaleDateString());
    const counts = data.map(item => item.count);

    this.blogChartOption.set({
      tooltip: {
        trigger: 'axis',
        axisPointer: {
          type: 'line'
        }
      },
      grid: {
        left: '3%',
        right: '4%',
        bottom: '3%',
        containLabel: true
      },
      xAxis: {
        type: 'category',
        data: dates,
        axisLabel: {
          rotate: 45,
          interval: 3
        }
      },
      yAxis: {
        type: 'value'
      },
      series: [
        {
          name: 'Blog Posts',
          type: 'line',
          smooth: true,
          data: counts,
          areaStyle: {
            color: {
              type: 'linear',
              x: 0,
              y: 0,
              x2: 0,
              y2: 1,
              colorStops: [{
                offset: 0,
                color: 'rgba(129, 140, 248, 0.5)'
              }, {
                offset: 1,
                color: 'rgba(129, 140, 248, 0.1)'
              }]
            }
          },
          itemStyle: {
            color: '#818cf8'
          },
          emphasis: {
            itemStyle: {
              color: '#6366f1'
            }
          }
        }
      ],
      color: ['#818cf8']
    });
  }
}
