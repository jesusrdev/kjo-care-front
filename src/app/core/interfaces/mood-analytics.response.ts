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
