export interface DashboardStats {
  totalUsers:    BlogPosts;
  blogPosts:     BlogPosts;
  moodEntries:   BlogPosts;
  healthCenters: BlogPosts;
}

export interface BlogPosts {
  currentValue:     number;
  percentageChange: number;
}

export interface UserMoodStats {
  date:  Date;
  count: number;
}
export interface DailyBlogsStats {
  date:  Date;
  count: number;
}
