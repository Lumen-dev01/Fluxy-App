import { useState, useEffect } from 'react'
import { ChevronLeft, ChevronRight, Plus } from 'lucide-react'
import { useAuth } from '../../context/AuthContext'
import { taskService } from '../../services/supabaseService'

const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
const MONTHS = ['January','February','March','April','May','June','July','August','September','October','November','December']

export default function CalendarPage() {
  const { user } = useAuth()
  const [currentDate, setCurrentDate] = useState(new Date())
  const [tasks, setTasks] = useState([])
  const [selectedDay, setSelectedDay] = useState(null)

  useEffect(() => {
    if (!user) return
    taskService.getByUser(user.id).then(setTasks).catch(console.error)
  }, [user])

  const year = currentDate.getFullYear()
  const month = currentDate.getMonth()
  const firstDay = new Date(year, month, 1).getDay()
  const daysInMonth = new Date(year, month + 1, 0).getDate()
  const today = new Date()

  const prevMonth = () => setCurrentDate(new Date(year, month - 1))
  const nextMonth = () => setCurrentDate(new Date(year, month + 1))

  const getTasksForDay = (day) => {
    const dateStr = `${year}-${String(month + 1).padStart(2,'0')}-${String(day).padStart(2,'0')}`
    return tasks.filter(t => t.due_date?.startsWith(dateStr))
  }

  const dayTasks = selectedDay ? getTasksForDay(selectedDay) : []

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-zinc-100">Calendar</h1>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-4 gap-6">
        {/* Calendar grid */}
        <div className="xl:col-span-3 glass-card p-6">
          {/* Month nav */}
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-semibold text-zinc-100">{MONTHS[month]} {year}</h2>
            <div className="flex gap-2">
              <button onClick={prevMonth} className="p-2 rounded-lg hover:bg-white/5 text-zinc-400 hover:text-zinc-200 transition-all"><ChevronLeft size={18} /></button>
              <button onClick={() => setCurrentDate(new Date())} className="px-3 py-1.5 text-xs rounded-lg bg-violet-600/20 text-violet-300 hover:bg-violet-600/30 transition-all">Today</button>
              <button onClick={nextMonth} className="p-2 rounded-lg hover:bg-white/5 text-zinc-400 hover:text-zinc-200 transition-all"><ChevronRight size={18} /></button>
            </div>
          </div>

          {/* Day headers */}
          <div className="grid grid-cols-7 mb-2">
            {DAYS.map(d => (
              <div key={d} className="text-center text-xs font-semibold text-zinc-600 py-2">{d}</div>
            ))}
          </div>

          {/* Days grid */}
          <div className="grid grid-cols-7 gap-1">
            {/* Empty cells before first day */}
            {Array.from({ length: firstDay }).map((_, i) => (
              <div key={`empty-${i}`} className="aspect-square" />
            ))}

            {/* Day cells */}
            {Array.from({ length: daysInMonth }).map((_, i) => {
              const day = i + 1
              const isToday = day === today.getDate() && month === today.getMonth() && year === today.getFullYear()
              const isSelected = day === selectedDay
              const dayTaskList = getTasksForDay(day)

              return (
                <button
                  key={day}
                  onClick={() => setSelectedDay(day === selectedDay ? null : day)}
                  className={`aspect-square rounded-xl flex flex-col items-center justify-start p-1.5 text-sm transition-all ${
                    isSelected ? 'bg-violet-600 text-white' :
                    isToday ? 'bg-violet-600/20 text-violet-300 ring-1 ring-violet-500/50' :
                    'hover:bg-white/5 text-zinc-400 hover:text-zinc-200'
                  }`}
                >
                  <span className="font-medium leading-none mb-1">{day}</span>
                  {dayTaskList.length > 0 && (
                    <div className="flex gap-0.5 flex-wrap justify-center">
                      {dayTaskList.slice(0, 3).map(t => (
                        <div key={t.id} className={`w-1.5 h-1.5 rounded-full ${
                          t.priority === 'high' ? 'bg-red-400' :
                          t.priority === 'medium' ? 'bg-amber-400' : 'bg-emerald-400'
                        } ${isSelected ? 'opacity-80' : ''}`} />
                      ))}
                    </div>
                  )}
                </button>
              )
            })}
          </div>
        </div>

        {/* Day tasks panel */}
        <div className="glass-card p-5">
          <h3 className="font-semibold text-zinc-200 mb-4">
            {selectedDay
              ? `${MONTHS[month]} ${selectedDay}`
              : 'Select a day'}
          </h3>

          {selectedDay ? (
            dayTasks.length === 0 ? (
              <div className="text-center py-10">
                <p className="text-sm text-zinc-600">No tasks on this day</p>
              </div>
            ) : (
              <div className="space-y-3">
                {dayTasks.map(task => (
                  <div key={task.id} className="bg-white/3 rounded-xl p-3 border border-white/5">
                    <p className="text-sm font-medium text-zinc-200">{task.title}</p>
                    <div className="flex items-center gap-2 mt-1.5">
                      <span className={task.priority === 'high' ? 'badge-high' : task.priority === 'medium' ? 'badge-medium' : 'badge-low'}>
                        {task.priority}
                      </span>
                      {task.projects && <span className="text-xs text-violet-400">{task.projects.name}</span>}
                    </div>
                  </div>
                ))}
              </div>
            )
          ) : (
            <div className="space-y-2">
              <p className="text-xs text-zinc-600 mb-3">Upcoming tasks</p>
              {tasks.slice(0, 6).map(t => (
                <div key={t.id} className="flex items-center gap-2 py-1.5">
                  <div className={`w-2 h-2 rounded-full flex-shrink-0 ${t.priority === 'high' ? 'bg-red-400' : t.priority === 'medium' ? 'bg-amber-400' : 'bg-emerald-400'}`} />
                  <p className="text-xs text-zinc-400 truncate">{t.title}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
