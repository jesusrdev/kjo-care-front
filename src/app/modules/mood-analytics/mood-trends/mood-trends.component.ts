import { ChangeDetectionStrategy, Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AnalyticsService } from '../../../core/services/analytics.service';
import { rxResource } from '@angular/core/rxjs-interop';

interface TrendPoint {
  date: Date;
  moods: {
    [key: string]: number;
  };
  dominant: string;
}

interface MoodTrend {
  label: string;
  color: string;
  icon: string;
  points: number[];
  trend: 'up' | 'down' | 'stable';
  change: number;
}

@Component({
  selector: 'mood-trends',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './mood-trends.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MoodTrendsComponent implements OnInit {
  private analyticsService = inject(AnalyticsService);

  // Datos para la visualización
  trendData = signal<TrendPoint[]>([]);
  moodTrends = signal<MoodTrend[]>([]);

  // Períodos de tiempo para visualizar
  timeRangeOptions = signal<string[]>(['Last Week', 'Last Month', 'Last 3 Months', 'Last Year']);
  selectedTimeRange = signal<string>('Last Month');

  // Colores estándar para estados de ánimo
  moodColors: Record<string, string> = {
    Happy: '#68D391',
    Neutral: '#90CDF4',
    Sad: '#9F7AEA',
    Anxious: '#FBD38D',
    Energetic: '#F6AD55',
    Default: '#A3A3A3',
  };

  // Iconos para cada estado de ánimo
  moodIcons: Record<string, string> = {
    Happy: 'sentiment_very_satisfied',
    Neutral: 'sentiment_neutral',
    Sad: 'sentiment_dissatisfied',
    Anxious: 'flutter_dash',
    Energetic: 'bolt',
    Default: 'mood',
  };

  // Días de la semana
  weekdays = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];

  // Animación de carga
  loading = signal<boolean>(false);

  // Recurso para datos analíticos
  analyticsResource = rxResource({
    loader: () => this.analyticsService.getMoodAnalytics(this.getMonthsForRange())
  });

  // Para las estadísticas
  overallTrend = signal<'up' | 'down' | 'stable'>('stable');
  positivityRate = signal<number>(0);
  moodVariability = signal<number>(0);

  ngOnInit(): void {
    this.loading.set(true);
    // Cargar datos de demostración
    this.generateDemoData();

    setTimeout(() => {
      this.loading.set(false);
    }, 800);


  }

  generateDemoData() {
    const now = new Date();
    const timePoints = this.getTimePoints();

    // Generar puntos de tendencia para cada fecha
    const trendPoints: TrendPoint[] = [];

    for (let i = 0; i < timePoints; i++) {
      const date = new Date();
      date.setDate(now.getDate() - (timePoints - i));

      const happyValue = 30 + Math.sin(i * 0.5) * 20 + Math.random() * 10;
      const neutralValue = 20 + Math.cos(i * 0.3) * 15 + Math.random() * 5;
      const sadValue = 10 + Math.sin(i * 0.2 + 2) * 10 + Math.random() * 8;
      const anxiousValue = 15 + Math.cos(i * 0.4 + 1) * 10 + Math.random() * 5;
      const energeticValue = 25 + Math.sin(i * 0.6 + 3) * 15 + Math.random() * 7;

      // Encontrar el estado de ánimo dominante
      const moods = {
        Happy: happyValue,
        Neutral: neutralValue,
        Sad: sadValue,
        Anxious: anxiousValue,
        Energetic: energeticValue
      };

      const dominant = Object.entries(moods).reduce((a, b) => a[1] > b[1] ? a : b)[0];

      trendPoints.push({
        date,
        moods,
        dominant
      });
    }

    this.trendData.set(trendPoints);

    // Calcular tendencias para cada estado de ánimo
    this.calculateMoodTrends(trendPoints);

    // Calcular estadísticas generales
    this.calculateOverallStats(trendPoints);
  }

  calculateMoodTrends(data: TrendPoint[]) {
    const moodTrends: MoodTrend[] = [];
    const standardMoods = ['Happy', 'Neutral', 'Sad', 'Anxious', 'Energetic'];

    standardMoods.forEach(mood => {
      // Extraer puntos para este estado de ánimo
      const points = data.map(point => point.moods[mood] || 0);

      // Calcular el cambio
      const firstHalf = points.slice(0, Math.floor(points.length / 2));
      const secondHalf = points.slice(Math.floor(points.length / 2));
      const firstAvg = firstHalf.reduce((sum, val) => sum + val, 0) / firstHalf.length;
      const secondAvg = secondHalf.reduce((sum, val) => sum + val, 0) / secondHalf.length;
      const change = ((secondAvg - firstAvg) / firstAvg) * 100;

      // Determinar la tendencia
      let trend: 'up' | 'down' | 'stable' = 'stable';
      if (change > 5) trend = 'up';
      else if (change < -5) trend = 'down';

      moodTrends.push({
        label: mood,
        color: this.moodColors[mood] || this.moodColors['Default'],
        icon: this.moodIcons[mood] || this.moodIcons['Default'],
        points,
        trend,
        change: Math.round(change * 10) / 10,
      });
    });

    // Ordenar por puntuación más alta en el último punto
    moodTrends.sort((a, b) => b.points[b.points.length - 1] - a.points[a.points.length - 1]);

    this.moodTrends.set(moodTrends);
  }

  calculateOverallStats(data: TrendPoint[]) {
    // Calcular la tasa de positividad (proporción de estados de ánimo positivos)
    let positiveCount = 0;
    data.forEach(point => {
      if (point.dominant === 'Happy' || point.dominant === 'Energetic') {
        positiveCount++;
      }
    });

    this.positivityRate.set(Math.round((positiveCount / data.length) * 100));

    // Calcular la variabilidad (cuántos cambios de estado de ánimo dominante hay)
    let changes = 0;
    for (let i = 1; i < data.length; i++) {
      if (data[i].dominant !== data[i-1].dominant) {
        changes++;
      }
    }

    this.moodVariability.set(Math.round((changes / (data.length - 1)) * 100));

    // Determinar tendencia general
    const happyTrend = this.moodTrends().find(m => m.label === 'Happy')?.trend || 'stable';
    const sadTrend = this.moodTrends().find(m => m.label === 'Sad')?.trend || 'stable';
    const anxiousTrend = this.moodTrends().find(m => m.label === 'Anxious')?.trend || 'stable';

    if ((happyTrend === 'up' && (sadTrend === 'down' || anxiousTrend === 'down')) ||
        (this.positivityRate() > 60 && this.positivityRate() > this.moodVariability())) {
      this.overallTrend.set('up');
    } else if ((happyTrend === 'down' && (sadTrend === 'up' || anxiousTrend === 'up')) ||
               (this.positivityRate() < 40 && this.positivityRate() < this.moodVariability())) {
      this.overallTrend.set('down');
    } else {
      this.overallTrend.set('stable');
    }
  }

  updateTimeRange(range: string) {
    this.selectedTimeRange.set(range);
    this.loading.set(true);

    // Simular recarga de datos
    setTimeout(() => {
      this.generateDemoData();
      this.loading.set(false);
    }, 600);
  }

  getTimePoints(): number {
    switch(this.selectedTimeRange()) {
      case 'Last Week': return 7;
      case 'Last Month': return 30;
      case 'Last 3 Months': return 90;
      case 'Last Year': return 52; // Usar semanas para años para que sea manejable
      default: return 30;
    }
  }

  getMonthsForRange(): number {
    switch(this.selectedTimeRange()) {
      case 'Last Week': return 0.25;
      case 'Last Month': return 1;
      case 'Last 3 Months': return 3;
      case 'Last Year': return 12;
      default: return 1;
    }
  }

  // Obtener las etiquetas para el eje X basado en el rango de tiempo
  getXAxisLabels(): string[] {
    const data = this.trendData();
    const timeRange = this.selectedTimeRange();

    if (!data.length) return [];

    const labels: string[] = [];

    switch (timeRange) {
      case 'Last Week':
        return data.map(point => this.weekdays[point.date.getDay()]);
      case 'Last Month':
        if (data.length > 10) {
          // Mostrar solo algunas fechas para evitar amontonamiento
          for (let i = 0; i < data.length; i += 3) {
            labels.push(`${data[i].date.getDate()}/${data[i].date.getMonth() + 1}`);
          }
          if (labels[labels.length - 1] !== `${data[data.length - 1].date.getDate()}/${data[data.length - 1].date.getMonth() + 1}`) {
            labels.push(`${data[data.length - 1].date.getDate()}/${data[data.length - 1].date.getMonth() + 1}`);
          }
        } else {
          data.forEach(point => {
            labels.push(`${point.date.getDate()}/${point.date.getMonth() + 1}`);
          });
        }
        return labels;
      case 'Last 3 Months':
        // Agrupar por semanas
        for (let i = 0; i < data.length; i += 7) {
          labels.push(`${data[i].date.getDate()}/${data[i].date.getMonth() + 1}`);
        }
        if (labels[labels.length - 1] !== `${data[data.length - 1].date.getDate()}/${data[data.length - 1].date.getMonth() + 1}`) {
          labels.push(`${data[data.length - 1].date.getDate()}/${data[data.length - 1].date.getMonth() + 1}`);
        }
        return labels;
      case 'Last Year':
        // Agrupar por meses
        const monthNames = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];
        const months: { [key: string]: boolean } = {};

        data.forEach(point => {
          const monthKey = `${monthNames[point.date.getMonth()]}`;
          if (!months[monthKey]) {
            months[monthKey] = true;
            labels.push(monthKey);
          }
        });
        return labels;
      default:
        return data.map((_, i) => i.toString());
    }
  }

  // Función para normalizar los puntos de datos para mostrarlos en la gráfica
  normalizePoints(points: number[], maxHeight: number = 100): number[] {
    if (!points.length) return [];
    const max = Math.max(...points);
    return points.map(p => (p / max) * maxHeight);
  }

  // Generar path SVG para la gráfica
  generatePath(points: number[], maxHeight: number = 100): string {
    const normalized = this.normalizePoints(points, maxHeight);
    const width = 100 / (normalized.length - 1);

    return normalized.map((point, i) => {
      const x = i * width;
      const y = maxHeight - point;
      return `${i === 0 ? 'M' : 'L'} ${x} ${y}`;
    }).join(' ');
  }

  // Generar área bajo la curva para gráficas
  generateArea(points: number[], maxHeight: number = 100): string {
    const path = this.generatePath(points, maxHeight);
    const width = 100;
    return `${path} L ${width} ${maxHeight} L 0 ${maxHeight} Z`;
  }

  // Métodos para conseguir el color de la tarjeta según la tendencia
  getTrendColor(trend: 'up' | 'down' | 'stable'): string {
    switch (trend) {
      case 'up': return 'border-success';
      case 'down': return 'border-error';
      default: return 'border-base-300';
    }
  }

  getTrendIcon(trend: 'up' | 'down' | 'stable'): string {
    switch (trend) {
      case 'up': return 'trending_up';
      case 'down': return 'trending_down';
      default: return 'trending_flat';
    }
  }

  getTrendText(trend: 'up' | 'down' | 'stable'): string {
    switch (trend) {
      case 'up': return 'text-success';
      case 'down': return 'text-error';
      default: return 'text-base-content';
    }
  }
}
