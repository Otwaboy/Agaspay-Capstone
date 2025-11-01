import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Badge } from "../components/ui/badge";
import { Calendar, Clock, MapPin, CheckCircle, AlertCircle } from "lucide-react";
import MeterReaderSidebar from "../components/layout/meter-reader-sidebar";
import MeterReaderTopHeader from "../components/layout/meter-reader-top-header";
import { apiClient } from "../lib/api";
import { format, isToday, isTomorrow, isPast } from "date-fns";

export default function MeterReaderSchedule() {
  const { data: authUser } = useQuery({
    queryKey: ["auth-user"],
    queryFn: async () => {
      const response = await apiClient.getUserAccount();
      return response.data;
    }
  }); 

  const { data: scheduleData, isLoading } = useQuery({
    queryKey: ["meter-reader-schedule"],
    queryFn: async () => {
      const response = await apiClient.get("/api/schedule-tasks");
      return response.data;
    }
  });

  const meterReaderZone = authUser?.user?.assigned_zone;
  const tasks = scheduleData?.tasks || [];

  const myTasks = tasks.filter((task) => 
    task.zone === meterReaderZone
  );

  const upcomingTasks = myTasks.filter((task) => !isPast(new Date(task.scheduled_date)));
  const completedTasks = myTasks.filter((task) => task.status === "completed");

  const getDateBadge = (date) => {
    if (isToday(new Date(date))) {
      return <Badge className="bg-red-500">Today</Badge>;
    } else if (isTomorrow(new Date(date))) {
      return <Badge className="bg-orange-500">Tomorrow</Badge>;
    } else {
      return <Badge variant="outline">{format(new Date(date), "MMM dd")}</Badge>;
    }
  };

  const getStatusBadge = (status) => {
    const styles = {
      pending: "bg-yellow-500",
      in_progress: "bg-blue-500",
      completed: "bg-green-500",
      cancelled: "bg-gray-500"
    };
    return <Badge className={styles[status] || "bg-gray-500"}>{status}</Badge>;
  };

  return (
    <div className="flex h-screen bg-gradient-to-br from-blue-50 via-white to-cyan-50">
      <MeterReaderSidebar />

      <div className="flex-1 flex flex-col overflow-hidden relative">
        <div className="absolute top-20 right-20 w-64 h-64 bg-blue-200 rounded-full blur-3xl opacity-30 pointer-events-none"></div>
        <div className="absolute bottom-20 left-20 w-96 h-96 bg-cyan-200 rounded-full blur-3xl opacity-20 pointer-events-none"></div>
        
        <MeterReaderTopHeader />

        <main className="flex-1 overflow-auto p-6 relative z-10">
          <div className="max-w-7xl mx-auto">
            <div className="mb-8">
              <h1 className="text-3xl font-bold text-gray-900">Reading Schedule</h1>
              <p className="text-gray-600 mt-2">Zone {meterReaderZone} Route Planning</p>
            </div>

            <div className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <Card className="bg-gradient-to-br from-blue-500 to-blue-600 text-white shadow-lg">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm opacity-90">Upcoming Tasks</p>
                      <p className="text-3xl font-bold mt-1">{upcomingTasks.length}</p>
                    </div>
                    <Clock className="h-10 w-10 opacity-80" />
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-br from-green-500 to-green-600 text-white shadow-lg">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm opacity-90">Completed</p>
                      <p className="text-3xl font-bold mt-1">{completedTasks.length}</p>
                    </div>
                    <CheckCircle className="h-10 w-10 opacity-80" />
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-br from-purple-500 to-purple-600 text-white shadow-lg">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm opacity-90">Total Tasks</p>
                      <p className="text-3xl font-bold mt-1">{myTasks.length}</p>
                    </div>
                    <Calendar className="h-10 w-10 opacity-80" />
                  </div>
                </CardContent>
              </Card>
            </div>

            {isLoading ? (
              <Card>
                <CardContent className="p-8 text-center">
                  <p className="text-gray-500">Loading schedule...</p>
                </CardContent>
              </Card>
            ) : myTasks.length === 0 ? (
              <Card>
                <CardContent className="p-8 text-center">
                  <Calendar className="h-12 w-12 mx-auto text-gray-300 mb-3" />
                  <p className="text-gray-500">No scheduled tasks</p>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-3">
                {myTasks.map((task) => (
                  <Card key={task._id} className="hover:shadow-md transition-shadow">
                    <CardContent className="p-4">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                        <div className="flex-1 space-y-2">
                          <div className="flex items-center space-x-2 flex-wrap gap-2">
                            <h3 className="font-semibold text-lg">{task.task_name || "Meter Reading Task"}</h3>
                            {getDateBadge(task.scheduled_date)}
                            {getStatusBadge(task.status)}
                          </div>
                          
                          <p className="text-sm text-gray-600">{task.description || "Regular meter reading schedule"}</p>
                          
                          <div className="flex items-center space-x-4 text-sm text-gray-500">
                            <div className="flex items-center space-x-1">
                              <MapPin className="h-4 w-4" />
                              <span>Zone {task.zone || meterReaderZone}</span>
                            </div>
                            <div className="flex items-center space-x-1">
                              <Calendar className="h-4 w-4" />
                              <span>{format(new Date(task.scheduled_date), "MMM dd, yyyy")}</span>
                            </div>
                            {task.scheduled_time && (
                              <div className="flex items-center space-x-1">
                                <Clock className="h-4 w-4" />
                                <span>{task.scheduled_time}</span>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>
          </div>
        </main>
      </div>
    </div>
  );
}
