import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Calendar as CalendarIcon, ArrowLeft, ArrowRight, Plus } from 'lucide-react';
import { useToast } from "@/hooks/use-toast";
import { 
  getCalendarItems, 
  scheduleProject,
  getAllProjects,
  type DatabaseProject 
} from "@/services/projectService";

export default function Calendar() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [calendarItems, setCalendarItems] = useState<any[]>([]);
  const [approvedProjects, setApprovedProjects] = useState<DatabaseProject[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    loadCalendarData();
  }, [currentDate]);

  const loadCalendarData = async () => {
    try {
      setLoading(true);
      
      // Get calendar items for the current month
      const startOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
      const endOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0);
      
      const [calendarData, projectsData] = await Promise.all([
        getCalendarItems(startOfMonth.toISOString().split('T')[0], endOfMonth.toISOString().split('T')[0]),
        getAllProjects()
      ]);
      
      setCalendarItems(calendarData);
      setApprovedProjects(projectsData.filter(p => p.approved));
    } catch (error) {
      console.error('Error loading calendar:', error);
      toast({
        title: "Errore",
        description: "Impossibile caricare il calendario",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleScheduleProject = async (projectId: string, date: string) => {
    try {
      await scheduleProject(projectId, date);
      await loadCalendarData();
      toast({
        title: "Progetto programmato",
        description: "Il progetto è stato programmato con successo",
      });
    } catch (error) {
      console.error('Error scheduling project:', error);
      toast({
        title: "Errore",
        description: "Impossibile programmare il progetto",
        variant: "destructive",
      });
    }
  };

  const getDaysInMonth = () => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();

    const days = [];
    
    // Add empty cells for days before the first day of the month
    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push(null);
    }
    
    // Add days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      days.push(new Date(year, month, day));
    }
    
    return days;
  };

  const getItemsForDate = (date: Date) => {
    const dateString = date.toISOString().split('T')[0];
    return calendarItems.filter(item => item.scheduled_date === dateString);
  };

  const navigateMonth = (direction: 'prev' | 'next') => {
    setCurrentDate(prev => {
      const newDate = new Date(prev);
      if (direction === 'prev') {
        newDate.setMonth(newDate.getMonth() - 1);
      } else {
        newDate.setMonth(newDate.getMonth() + 1);
      }
      return newDate;
    });
  };

  const monthNames = [
    'Gennaio', 'Febbraio', 'Marzo', 'Aprile', 'Maggio', 'Giugno',
    'Luglio', 'Agosto', 'Settembre', 'Ottobre', 'Novembre', 'Dicembre'
  ];

  const dayNames = ['Dom', 'Lun', 'Mar', 'Mer', 'Gio', 'Ven', 'Sab'];

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p className="text-ig-text-secondary">Caricamento calendario...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container max-w-7xl mx-auto py-8 px-4">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold">Calendario Pubblicazioni</h1>
            <p className="text-ig-text-secondary mt-2">
              Programma i tuoi contenuti approvati
            </p>
          </div>
          <div className="flex gap-2">
            <Button asChild variant="outline">
              <a href="/archive">
                Archivio
              </a>
            </Button>
            <Button asChild>
              <a href="/">
                Nuovo Progetto
              </a>
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Calendar */}
          <div className="lg:col-span-3">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <Button variant="outline" size="sm" onClick={() => navigateMonth('prev')}>
                      <ArrowLeft className="h-4 w-4" />
                    </Button>
                    <h2 className="text-xl font-semibold">
                      {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
                    </h2>
                    <Button variant="outline" size="sm" onClick={() => navigateMonth('next')}>
                      <ArrowRight className="h-4 w-4" />
                    </Button>
                  </div>
                  <Button
                    onClick={() => setCurrentDate(new Date())}
                    variant="outline"
                    size="sm"
                  >
                    Oggi
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-7 gap-1 mb-4">
                  {dayNames.map(day => (
                    <div key={day} className="p-2 text-center text-sm font-medium text-ig-text-secondary">
                      {day}
                    </div>
                  ))}
                </div>
                
                <div className="grid grid-cols-7 gap-1">
                  {getDaysInMonth().map((date, index) => (
                    <CalendarDay
                      key={index}
                      date={date}
                      items={date ? getItemsForDate(date) : []}
                      onScheduleProject={handleScheduleProject}
                      approvedProjects={approvedProjects}
                    />
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar - Approved Projects */}
          <div className="lg:col-span-1">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Plus className="h-5 w-5" />
                  Contenuti Approvati
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {approvedProjects.length === 0 ? (
                  <p className="text-sm text-ig-text-secondary">
                    Nessun contenuto approvato disponibile
                  </p>
                ) : (
                  approvedProjects.map(project => (
                    <ProjectCard
                      key={project.id}
                      project={project}
                      onSchedule={(date) => handleScheduleProject(project.id, date)}
                    />
                  ))
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}

interface CalendarDayProps {
  date: Date | null;
  items: any[];
  onScheduleProject: (projectId: string, date: string) => void;
  approvedProjects: DatabaseProject[];
}

function CalendarDay({ date, items, onScheduleProject, approvedProjects }: CalendarDayProps) {
  if (!date) {
    return <div className="aspect-square" />;
  }

  const isToday = date.toDateString() === new Date().toDateString();
  const isPast = date < new Date(new Date().setHours(0, 0, 0, 0));

  return (
    <div 
      className={`
        aspect-square border border-border p-1 bg-card hover:bg-muted transition-colors
        ${isToday ? 'bg-primary/10 border-primary' : ''}
        ${isPast ? 'opacity-50' : ''}
      `}
    >
      <div className="h-full flex flex-col">
        <div className={`text-sm font-medium ${isToday ? 'text-primary' : ''}`}>
          {date.getDate()}
        </div>
        
        <div className="flex-1 space-y-1 mt-1">
          {items.slice(0, 2).map((item, index) => (
            <div
              key={index}
              className={`
                text-xs p-1 rounded truncate
                ${item.projects.type === 'post' ? 'bg-blue-100 text-blue-800' : ''}
                ${item.projects.type === 'carousel' ? 'bg-green-100 text-green-800' : ''}
                ${item.projects.type === 'reel' ? 'bg-purple-100 text-purple-800' : ''}
              `}
              title={item.projects.title}
            >
              {item.projects.title || item.projects.type}
            </div>
          ))}
          
          {items.length > 2 && (
            <div className="text-xs text-ig-text-secondary">
              +{items.length - 2} altri
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

interface ProjectCardProps {
  project: DatabaseProject;
  onSchedule: (date: string) => void;
}

function ProjectCard({ project, onSchedule }: ProjectCardProps) {
  const getProjectThumbnail = () => {
    if (project.type === 'reel' && project.cover?.src) {
      return project.cover.src;
    }
    if (project.media?.files && project.media.files.length > 0) {
      return project.media.files[0].src;
    }
    return "/placeholder.svg";
  };

  const handleDragStart = (e: React.DragEvent) => {
    e.dataTransfer.setData('text/plain', project.id);
  };

  return (
    <div
      draggable
      onDragStart={handleDragStart}
      className="p-2 border border-border rounded-lg cursor-move hover:bg-muted transition-colors"
    >
      <div className="flex gap-2">
        <div className="w-12 h-12 bg-gray-100 rounded overflow-hidden flex-shrink-0">
          <img
            src={getProjectThumbnail()}
            alt={project.title || 'Progetto'}
            className="w-full h-full object-cover"
          />
        </div>
        
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium truncate">
            {project.title || `Progetto ${project.type}`}
          </p>
            <Badge
              variant={project.type === 'reel' ? 'default' : 'secondary'}
              className="mt-1 text-xs"
            >
            {project.type === 'post' ? 'Post' : project.type === 'carousel' ? 'Carosello' : 'Reel'}
          </Badge>
        </div>
      </div>
    </div>
  );
}