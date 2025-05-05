export interface MoodAnalyticsResponse {
  moodCounts:      MoodAnalytics;
  moodPercentages: MoodAnalytics;
  totalMoods:      number;
  timePeriod:      string;
}

export interface MoodAnalytics {
  Happy?:   number;
  Neutral?:   number;
  Sad? : number;
  Anxious?: number;
  Energetic?:number;
}

export interface MoodTrendsAnalysis {
  timePeriod:               string;
  totalEntries:             number;
  mostCommonMood:           string;
  mostCommonMoodPercentage: number;
  variabilityLevel:         string;
  variabilityScore:         number;
  trendDirection:           string;
  weeklyTrendScore:         number;
}
