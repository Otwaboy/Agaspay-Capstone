import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Avatar, AvatarFallback } from "../ui/avatar";
import { Users } from "lucide-react";
import { scheduleTaskApi } from "../../services/adminApi";

export default function TodaySchedule() {
  const { data, isLoading } = useQuery({
    queryKey: ['today-tasks'],
    queryFn: scheduleTaskApi.getAll
  });

  const tasks = data?.tasks || [];
  const todayTasks = tasks.filter(task => {
    const taskDate = new Date(task.scheduled_date);
    const today = new Date();
    return taskDate.toDateString() === today.toDateString();
  }).slice(0, 3);

  const hours = Array.from({ length: 13 }, (_, i) => {
    const hour = i + 8;
    return `${hour.toString().padStart(2, '0')}:00`;
  });

  return (
    <Card className="border-none shadow-sm">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg font-semibold">Today's Schedule</CardTitle>
          <span className="text-sm text-gray-500">{new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</span>
        </div>
      </CardHeader>
      <CardContent>
        {/* Time labels */}
        <div className="flex items-center gap-4 mb-4 overflow-x-auto pb-2">
          {hours.map((hour, index) => (
            <div
              key={index}
              className={`text-xs font-medium whitespace-nowrap ${
                index === 4 ? 'text-indigo-600' : 'text-gray-400'
              }`}
            >
              {hour}
            </div>
          ))}
        </div>

        {/* Timeline */}
        <div className="relative">
          {/* Vertical line at current time */}
          <div className="absolute left-[33%] top-0 bottom-0 w-0.5 bg-indigo-600" />
          
          {/* Schedule items */}
          <div className="space-y-4">
            {todayTasks.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <p className="text-sm">No tasks scheduled for today</p>
              </div>
            ) : (
              todayTasks.map((task, index) => (
                <div
                  key={task._id}
                  className={`flex items-center gap-4 p-3 rounded-lg border ${
                    index === 1 ? 'border-indigo-200 bg-indigo-50/50' : 'border-gray-200 bg-white'
                  }`}
                  style={{ marginLeft: `${index * 15}%` }}
                >
                  <div className="flex -space-x-2">
                    <Avatar className="w-8 h-8 border-2 border-white">
                      <AvatarFallback className="bg-blue-100 text-blue-600 text-xs">
                        {task.assigned_to?.first_name?.[0] || 'T'}
                      </AvatarFallback>
                    </Avatar>
                    {task.maintenance_personnel && task.maintenance_personnel.length > 0 && (
                      <Avatar className="w-8 h-8 border-2 border-white">
                        <AvatarFallback className="bg-green-100 text-green-600 text-xs">
                          {task.maintenance_personnel.length}
                        </AvatarFallback>
                      </Avatar>
                    )}
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <h4 className="text-sm font-medium text-gray-900 truncate">
                      {task.title || task.task_description}
                    </h4>
                    <p className="text-xs text-gray-500">
                      {task.zone ? `Zone ${task.zone}` : task.task_type}
                    </p>
                  </div>
                  
                  {task.maintenance_personnel && task.maintenance_personnel.length > 0 && (
                    <div className="flex items-center gap-1 px-2 py-1 bg-indigo-100 rounded-full">
                      <Users className="h-3 w-3 text-indigo-600" />
                      <span className="text-xs font-medium text-indigo-600">
                        {task.maintenance_personnel.length + 1}
                      </span>
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
