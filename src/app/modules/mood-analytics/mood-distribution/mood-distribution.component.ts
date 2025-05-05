import { ChangeDetectionStrategy, Component, OnInit, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AnalyticsService } from '../../../core/services/analytics.service';
import { MoodAnalyticsResponse } from '../../../core/interfaces/mood-analytics.response';
import { rxResource } from '@angular/core/rxjs-interop';

interface MoodData {
  label: string;
  value: number;
  percent: number;
  color: string;
  icon: string;
}

@Component({
  selector: 'mood-distribution',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './mood-distribution.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MoodDistributionComponent implements OnInit {
  private analyticsService = inject(AnalyticsService);

  // Datos para la visualización
  moods = signal<MoodData[]>([]);

  // Para vista de tabla y gráficos
  viewMode = signal<'chart' | 'table' | 'donut'>('donut');

  // Colores estándar para los estados de ánimo
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

  // Para las animaciones y el renderizado
  animationInProgress = signal(false);

  // Usar el mismo recurso de datos que el componente padre
  analyticsResource = rxResource({
    loader: () => this.analyticsService.getMoodAnalytics(3) // 3 meses por defecto
  });

  ngOnInit(): void {
    // Si hay datos en el recurso de analytics, usamos esos
    if (this.analyticsResource.value()) {
      this.processAnalyticsData(this.analyticsResource.value()!);
    } else {
      // De lo contrario, cargamos datos de demostración
      this.loadDemoData();
    }

  }

  loadDemoData(): void {
    // Simulamos una carga con animación
    this.animationInProgress.set(true);

    setTimeout(() => {
      this.moods.set([
        {
          label: 'Happy',
          value: 42,
          percent: 42,
          color: this.moodColors['Happy'],
          icon: this.moodIcons['Happy'],
        },
        {
          label: 'Neutral',
          value: 28,
          percent: 28,
          color: this.moodColors['Neutral'],
          icon: this.moodIcons['Neutral'],
        },
        {
          label: 'Sad',
          value: 15,
          percent: 15,
          color: this.moodColors['Sad'],
          icon: this.moodIcons['Sad'],
        },
        {
          label: 'Anxious',
          value: 10,
          percent: 10,
          color: this.moodColors['Anxious'],
          icon: this.moodIcons['Anxious'],
        },
        {
          label: 'Energetic',
          value: 5,
          percent: 5,
          color: this.moodColors['Energetic'],
          icon: this.moodIcons['Energetic'],
        },
      ]);

      this.animationInProgress.set(false);
    }, 800);
  }

  processAnalyticsData(data: MoodAnalyticsResponse): void {
    const totalMoods = data.totalMoods || 0;
    const moodCounts = data.moodCounts || {};
    const moodPercentages = data.moodPercentages || {};

    const processedMoods: MoodData[] = [];

    // Procesamos los estados de ánimo estándar que siempre queremos mostrar
    const standardMoods = ['Happy', 'Neutral', 'Sad', 'Anxious', 'Energetic'];

    standardMoods.forEach(mood => {
      const percent = moodPercentages[mood as keyof typeof moodPercentages] || 0;
      const value = moodCounts[mood as keyof typeof moodCounts] || 0;

      processedMoods.push({
        label: mood,
        value: value as number,
        percent: Number(percent.toFixed(1)),
        color: this.moodColors[mood] || this.moodColors['Default'],
        icon: this.moodIcons[mood] || this.moodIcons['Default'],
      });
    });

    // Ordenamos por porcentaje de mayor a menor
    processedMoods.sort((a, b) => b.percent - a.percent);

    this.moods.set(processedMoods);
  }

  toggleView(mode: 'chart' | 'table' | 'donut'): void {
    if (this.viewMode() !== mode) {
      this.animationInProgress.set(true);
      this.viewMode.set(mode);

      // Simulamos el tiempo de la animación
      setTimeout(() => {
        this.animationInProgress.set(false);
      }, 300);
    }
  }

  // Método para obtener el total de entradas
  getTotalEntries(): number {
    return this.moods().reduce((sum, mood) => sum + mood.value, 0);
  }

  // Método para evaluar el balance de estado de ánimo
  getMoodBalance(): number {
    const happy = this.moods().find(m => m.label === 'Happy')?.percent || 0;
    const sad = this.moods().find(m => m.label === 'Sad')?.percent || 0;
    const anxious = this.moods().find(m => m.label === 'Anxious')?.percent || 0;

    return happy - (sad + anxious);
  }

  // Método para acceder a un mood por índice con seguridad
  getMoodAtIndex(index: number): MoodData | undefined {
    if (index < 0 || index >= this.moods().length) {
      return undefined;
    }
    return this.moods()[index];
  }

  // Para gráfico circular: Devuelve la suma de los ángulos de sectores para posicionar etiquetas
  getAngleForLabel(index: number): number {
    const data = this.moods();
    let total = 0;
    for (let i = 0; i < index; i++) {
      total += data[i].percent;
    }
    return total * 3.6; // Convertir porcentaje a grados (360/100)
  }

  // Para gráfico circular: Calcula la posición X para la etiqueta
  getLabelX(index: number): number {
    const mood = this.moods()[index];
    if (!mood) return 100;

    const angle = this.getAngleForLabel(index) + (mood.percent * 1.8);
    const radius = 80;
    return 100 + radius * Math.cos((angle - 90) * Math.PI / 180);
  }

  // Para gráfico circular: Calcula la posición Y para la etiqueta
  getLabelY(index: number): number {
    const mood = this.moods()[index];
    if (!mood) return 100;

    const angle = this.getAngleForLabel(index) + (mood.percent * 1.8);
    const radius = 80;
    return 100 + radius * Math.sin((angle - 90) * Math.PI / 180);
  }

  // Para gráfico de donut: Calcula la circunferencia total
  getCircumference(): number {
    return 2 * Math.PI * 90; // Radio 90
  }

  // Para gráfico de donut: Calcula el offset de inicio para cada segmento
  getStrokeDashoffset(index: number): number {
    const circumference = this.getCircumference();
    const total = this.moods().reduce((sum, m) => sum + m.percent, 0);
    let offset = 0;

    for (let i = 0; i < index; i++) {
      offset += (this.moods()[i].percent / 100) * circumference;
    }

    return offset;
  }

  // Para gráfico de donut: Calcula el largo de cada segmento
  getStrokeDasharray(mood: MoodData): string {
    const circumference = this.getCircumference();
    const strokeLength = (mood.percent / 100) * circumference;
    return `${strokeLength} ${circumference - strokeLength}`;
  }
}
