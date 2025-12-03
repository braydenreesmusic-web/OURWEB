
import React, { useState, useEffect } from 'react';
import { base44 } from '../api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Calendar as CalIcon, Plus, X, Clock, MapPin, Sparkles, Loader2, Heart, Briefcase, Users, ChevronLeft, ChevronRight, Repeat, Link as LinkIcon, Image, ExternalLink, CheckSquare, Shuffle } from 'lucide-react';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameDay, addMonths, subMonths, isSameMonth, isPast } from 'date-fns';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

const categories = [
  { value: 'anniversary', label: 'Anniversary', icon: Heart, color: 'bg-pink-500', textColor: 'text-pink-500', bgLight: 'bg-pink-100' },
  { value: 'together', label: 'Together Time', icon: Users, color: 'bg-purple-500', textColor: 'text-purple-500', bgLight: 'bg-purple-100' },
  { value: 'brayden_work', label: "Brayden's Work", icon: Briefcase, color: 'bg-blue-500', textColor: 'text-blue-500', bgLight: 'bg-blue-100' },
  { value: 'youna_work', label: "Youna's Work", icon: Briefcase, color: 'bg-amber-500', textColor: 'text-amber-500', bgLight: 'bg-amber-100' },
  { value: 'other', label: 'Other', icon: CalIcon, color: 'bg-gray-500', textColor: 'text-gray-500', bgLight: 'bg-gray-100' }
];

const quickAddOptions = [
  { label: '💕 Date Night', title: 'Date Night', category: 'together' },
  { label: '🎉 Anniversary', title: 'Monthly Anniversary', category: 'anniversary', recurring: true },
  { label: '💼 Brayden Work', title: 'Work', category: 'brayden_work' },
  { label: "👩‍💼 Youna Work", title: 'Work', category: 'youna_work' },
  { label: '🍽️ Dinner', title: 'Dinner Together', category: 'together' },
  { label: '🎬 Movie Night', title: 'Movie Night', category: 'together' },
  { label: '✈️ Trip', title: 'Trip', category: 'together' },
  { label: '🏠 Stay Home', title: 'Stay Home Day', category: 'together' }
];

export default function Schedule() {
  const queryClient = useQueryClient();
  const [user, setUser] = useState(null);
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [showForm, setShowForm] = useState(false);
  const [showEventDetail, setShowEventDetail] = useState(null);
  const [showDateJar, setShowDateJar] = useState(false);
  const [pulledIdea, setPulledIdea] = useState(null);
  const [newIdea, setNewIdea] = useState('');
  const [naturalInput, setNaturalInput] = useState('');
  const [formData, setFormData] = useState({
    title: '', date: format(new Date(), 'yyyy-MM-dd'), time: '', location: '', notes: '', link: '', category: 'other', is_recurring: false
  });
  const [parsing, setParsing] = useState(false);
  const [activeTab, setActiveTab] = useState('calendar');

  useEffect(() => {
    base44.auth.me().then(setUser).catch(() => {});
  }, []);

  const { data: events = [] } = useQuery({
    queryKey: ['events'],
    queryFn: () => base44.entities.Event.list('date')
  });

  const { data: dateIdeas = [] } = useQuery({
    queryKey: ['dateIdeas'],
    queryFn: () => base44.entities.DateIdea.list('-created_date')
  });

  const { data: tasks = [] } = useQuery({
    queryKey: ['tasks'],
    queryFn: () => base44.entities.SharedTask.list('-created_date')
  });

  const createEventMutation = useMutation({
    mutationFn: (data) => base44.entities.Event.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['events'] });
      setShowForm(false);
      resetForm();
    }
  });

  const updateEventMutation = useMutation({
    mutationFn: ({ id, data }) => base44.entities.Event.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['events'] });
      setShowEventDetail(null);
    }
  });

  const deleteEventMutation = useMutation({
    mutationFn: (id) => base44.entities.Event.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['events'] });
      setShowEventDetail(null);
    }
  });

  const createIdeaMutation = useMutation({
    mutationFn: (idea) => base44.entities.DateIdea.create({ idea, added_by: user?.full_name }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['dateIdeas'] });
      setNewIdea('');
    }
  });

  const useIdeaMutation = useMutation({
    mutationFn: (id) => base44.entities.DateIdea.update(id, { is_used: true, used_date: format(new Date(), 'yyyy-MM-dd') }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['dateIdeas'] })
  });

  const resetForm = () => {
    setFormData({ title: '', date: format(selectedDate || new Date(), 'yyyy-MM-dd'), time: '', location: '', notes: '', link: '', category: 'other', is_recurring: false });
  };

  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(currentMonth);
  const daysInMonth = eachDayOfInterval({ start: monthStart, end: monthEnd });
  const startDay = monthStart.getDay();
  const calendarDays = [...Array(startDay).fill(null), ...daysInMonth];

  const getEventsForDate = (date) => {
    if (!date) return [];
    return events.filter(event => {
      const eventDate = new Date(event.date);
      if (isSameDay(eventDate, date)) return true;
      if (event.is_recurring && eventDate.getDate() === date.getDate()) return true;
      return false;
    });
  };

  const getCategoryInfo = (cat) => categories.find(c => c.value === cat) || categories[4];

  const handleSubmit = (e) => {
    e.preventDefault();
    createEventMutation.mutate(formData);
  };

  const handleQuickAdd = (option) => {
    setFormData({ ...formData, title: option.title, category: option.category, is_recurring: option.recurring || false, date: format(selectedDate || new Date(), 'yyyy-MM-dd') });
    setShowForm(true);
  };

  const handleNaturalLanguage = async (e) => {
    e.preventDefault();
    if (!naturalInput.trim()) return;
    setParsing(true);
    const result = await base44.integrations.Core.InvokeLLM({
      prompt: `Parse this event: "${naturalInput}". Today: ${format(new Date(), 'yyyy-MM-dd')}. Extract title, date (YYYY-MM-DD), time (HH:MM), location. Category from: anniversary, together, brayden_work, youna_work, other. JSON only.`,
      response_json_schema: { type: "object", properties: { title: { type: "string" }, date: { type: "string" }, time: { type: "string" }, location: { type: "string" }, category: { type: "string" } }, required: ["title", "date"] }
    });
    setFormData({ ...formData, title: result.title || '', date: result.date || format(selectedDate || new Date(), 'yyyy-MM-dd'), time: result.time || '', location: result.location || '', category: result.category || 'other' });
    setNaturalInput('');
    setParsing(false);
    setShowForm(true);
  };

  const pullRandomIdea = () => {
    const unusedIdeas = dateIdeas.filter(i => !i.is_used);
    if (unusedIdeas.length === 0) return;
    const random = unusedIdeas[Math.floor(Math.random() * unusedIdeas.length)];
    setPulledIdea(random);
  };

  const scheduleIdea = (idea) => {
    setFormData({ ...formData, title: idea.idea, category: 'together', date: format(new Date(), 'yyyy-MM-dd') });
    useIdeaMutation.mutate(idea.id);
    setPulledIdea(null);
    setShowDateJar(false);
    setShowForm(true);
  };

  const selectedDateEvents = getEventsForDate(selectedDate);

  return (
    <div className="min-h-screen flex justify-center bg-gradient-to-br from-pink-50 via-purple-50 to-blue-50">
      <div className="w-full max-w-4xl px-4 pb-24 space-y-4" style={{ paddingBottom: 'calc(env(safe-area-inset-bottom, 0px) + 6rem)' }}>
        <div className="flex items-center justify-between pt-4">
          <h1 className="text-3xl font-bold gradient-text">Schedule</h1>
          <div className="flex gap-2">
            <Button onClick={() => setShowDateJar(true)} variant="outline" className="rounded-full h-10 px-4 border-pink-200 text-pink-500">
              <Shuffle className="w-4 h-4 mr-1" /> Date Jar
            </Button>
            <Button onClick={() => { resetForm(); setShowForm(true); }} className="bg-gradient-to-r from-pink-500 to-purple-500 text-white rounded-full h-10 px-4">
              <Plus className="w-4 h-4" />
            </Button>
          </div>
        </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid grid-cols-2 bg-gray-100 rounded-xl p-1">
          <TabsTrigger value="calendar" className="rounded-lg data-[state=active]:bg-white">Calendar</TabsTrigger>
          <TabsTrigger value="lists" className="rounded-lg data-[state=active]:bg-white">Lists</TabsTrigger>
        </TabsList>

        <TabsContent value="calendar" className="space-y-4 mt-4">
          <form onSubmit={handleNaturalLanguage} className="glass-card rounded-2xl p-3">
            <div className="flex gap-2">
              <Input value={naturalInput} onChange={(e) => setNaturalInput(e.target.value)} placeholder='Try: "Dinner Friday 7pm at Olive Garden"' disabled={parsing} className="flex-1 rounded-xl h-10" />
              <Button type="submit" disabled={!naturalInput.trim() || parsing} className="bg-gradient-to-r from-pink-500 to-purple-500 text-white rounded-xl px-4 h-10">
                {parsing ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
              </Button>
            </div>
          </form>

          <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
            {quickAddOptions.map((option, i) => (
              <Button key={i} variant="outline" onClick={() => handleQuickAdd(option)} className="rounded-full whitespace-nowrap text-sm h-8 border-gray-200">
                {option.label}
              </Button>
            ))}
          </div>

          <div className="glass-card rounded-2xl p-4">
            <div className="flex items-center justify-between mb-4">
              <Button variant="ghost" size="icon" onClick={() => setCurrentMonth(subMonths(currentMonth, 1))} className="rounded-full h-8 w-8">
                <ChevronLeft className="w-5 h-5" />
              </Button>
              <h2 className="text-lg font-bold text-gray-800">{format(currentMonth, 'MMMM yyyy')}</h2>
              <Button variant="ghost" size="icon" onClick={() => setCurrentMonth(addMonths(currentMonth, 1))} className="rounded-full h-8 w-8">
                <ChevronRight className="w-5 h-5" />
              </Button>
            </div>

            <div className="grid grid-cols-7 gap-1 mb-2">
              {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((day, i) => (
                <div key={i} className="text-center text-xs font-semibold text-gray-400 py-1">{day}</div>
              ))}
            </div>

            <div className="grid grid-cols-7 gap-1">
              {calendarDays.map((day, i) => {
                const dayEvents = day ? getEventsForDate(day) : [];
                const isToday = day && isSameDay(day, new Date());
                const isSelected = day && selectedDate && isSameDay(day, selectedDate);
                return (
                  <button key={i} onClick={() => day && setSelectedDate(day)} disabled={!day}
                    className={`aspect-square rounded-xl text-sm flex flex-col items-center justify-center ${!day ? 'invisible' : isToday ? 'bg-gradient-to-br from-pink-500 to-purple-500 text-white font-bold shadow-md' : isSelected ? 'bg-pink-100 text-pink-700 font-semibold ring-2 ring-pink-400' : 'bg-gray-50 hover:bg-gray-100 text-gray-700'}`}>
                    <span>{day && format(day, 'd')}</span>
                    {dayEvents.length > 0 && (
                      <div className="flex gap-0.5 mt-0.5">
                        {dayEvents.slice(0, 3).map((e, idx) => (
                          <div key={idx} className={`w-1.5 h-1.5 rounded-full ${getCategoryInfo(e.category).color}`} />
                        ))}
                      </div>
                    )}
                  </button>
                );
              })}
            </div>

            <div className="flex flex-wrap gap-2 mt-3 pt-3 border-t border-gray-100">
              {categories.map((cat) => (
                <div key={cat.value} className="flex items-center gap-1 text-xs text-gray-500">
                  <div className={`w-2 h-2 rounded-full ${cat.color}`} />
                  <span>{cat.label}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between px-1">
              <h2 className="font-bold text-gray-800">{selectedDate ? format(selectedDate, 'EEEE, MMM d') : 'Select a date'}</h2>
              <Button variant="ghost" size="sm" onClick={() => { setFormData({ ...formData, date: format(selectedDate || new Date(), 'yyyy-MM-dd') }); setShowForm(true); }} className="text-pink-500 h-8">
                <Plus className="w-4 h-4" />
              </Button>
            </div>

            {selectedDateEvents.length > 0 ? selectedDateEvents.map((event) => {
              const catInfo = getCategoryInfo(event.category);
              const Icon = catInfo.icon;
              return (
                <div key={event.id} onClick={() => setShowEventDetail(event)} className={`rounded-xl p-3 ${catInfo.bgLight} border-l-4 ${catInfo.color.replace('bg-', 'border-')} cursor-pointer hover:shadow-md smooth-transition`}>
                  <div className="flex items-center gap-3">
                    <div className={`w-9 h-9 rounded-lg ${catInfo.color} flex items-center justify-center`}>
                      <Icon className="w-4 h-4 text-white" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <h3 className="font-semibold text-gray-800 truncate">{event.title}</h3>
                        {event.is_recurring && <Repeat className="w-3 h-3 text-gray-400" />}
                        {event.link && <LinkIcon className="w-3 h-3 text-gray-400" />}
                      </div>
                      <div className="flex gap-2 text-xs text-gray-500">
                        {event.time && <span>{event.time}</span>}
                        {event.location && <span>• {event.location}</span>}
                      </div>
                    </div>
                  </div>
                </div>
              );
            }) : (
              <div className="text-center py-6 text-gray-400">
                <CalIcon className="w-8 h-8 mx-auto mb-2 opacity-50" />
                <p className="text-sm">No events</p>
              </div>
            )}
          </div>
        </TabsContent>

        <TabsContent value="lists" className="mt-4">
          <SharedTaskLists user={user} tasks={tasks} queryClient={queryClient} />
        </TabsContent>
      </Tabs>

      {/* Add Event Dialog */}
      <Dialog open={showForm} onOpenChange={setShowForm}>
        <DialogContent className="glass-card max-w-md max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="gradient-text text-xl">Add Event</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-3 pt-2">
            <Input placeholder="Event title" value={formData.title} onChange={(e) => setFormData({ ...formData, title: e.target.value })} required className="rounded-xl h-10" />
            <Select value={formData.category} onValueChange={(value) => setFormData({ ...formData, category: value })}>
              <SelectTrigger className="rounded-xl h-10"><SelectValue /></SelectTrigger>
              <SelectContent>
                {categories.map((cat) => (
                  <SelectItem key={cat.value} value={cat.value}>
                    <div className="flex items-center gap-2"><div className={`w-3 h-3 rounded-full ${cat.color}`} />{cat.label}</div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <div className="grid grid-cols-2 gap-2">
              <Input type="date" value={formData.date} onChange={(e) => setFormData({ ...formData, date: e.target.value })} required className="rounded-xl h-10" />
              <Input type="time" value={formData.time} onChange={(e) => setFormData({ ...formData, time: e.target.value })} className="rounded-xl h-10" />
            </div>
            <Input placeholder="Location" value={formData.location} onChange={(e) => setFormData({ ...formData, location: e.target.value })} className="rounded-xl h-10" />
            <Input placeholder="Link (reservation, tickets...)" value={formData.link} onChange={(e) => setFormData({ ...formData, link: e.target.value })} className="rounded-xl h-10" />
            <Textarea placeholder="Notes..." value={formData.notes} onChange={(e) => setFormData({ ...formData, notes: e.target.value })} className="rounded-xl min-h-[60px]" />
            <div className="flex items-center justify-between p-2 bg-gray-50 rounded-xl">
              <div className="flex items-center gap-2"><Repeat className="w-4 h-4 text-gray-500" /><span className="text-sm">Repeat monthly</span></div>
              <Switch checked={formData.is_recurring} onCheckedChange={(checked) => setFormData({ ...formData, is_recurring: checked })} />
            </div>
            <div className="flex gap-2 pt-1">
              <Button type="button" variant="outline" onClick={() => setShowForm(false)} className="flex-1 rounded-xl h-10">Cancel</Button>
              <Button type="submit" className="flex-1 bg-gradient-to-r from-pink-500 to-purple-500 text-white rounded-xl h-10">Save</Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Event Detail Dialog */}
      <EventDetailDialog event={showEventDetail} onClose={() => setShowEventDetail(null)} onUpdate={updateEventMutation} onDelete={deleteEventMutation} categories={categories} />

      {/* Date Jar Dialog */}
      <Dialog open={showDateJar} onOpenChange={setShowDateJar}>
        <DialogContent className="glass-card max-w-sm">
          <DialogHeader>
            <DialogTitle className="gradient-text text-xl flex items-center gap-2">🫙 Date Night Jar</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            {pulledIdea ? (
              <div className="bg-gradient-to-br from-pink-100 to-purple-100 rounded-2xl p-5 text-center">
                <p className="text-2xl mb-2">🎉</p>
                <p className="text-lg font-semibold text-gray-800 mb-4">{pulledIdea.idea}</p>
                <div className="flex gap-2">
                  <Button variant="outline" onClick={() => setPulledIdea(null)} className="flex-1 rounded-xl">Try Again</Button>
                  <Button onClick={() => scheduleIdea(pulledIdea)} className="flex-1 bg-gradient-to-r from-pink-500 to-purple-500 text-white rounded-xl">Schedule It!</Button>
                </div>
              </div>
            ) : (
              <>
                <Button onClick={pullRandomIdea} disabled={dateIdeas.filter(i => !i.is_used).length === 0} className="w-full h-16 bg-gradient-to-r from-pink-500 to-purple-500 text-white rounded-2xl text-lg">
                  <Shuffle className="w-5 h-5 mr-2" /> Pull a Date Idea!
                </Button>
                <p className="text-center text-gray-400 text-sm">{dateIdeas.filter(i => !i.is_used).length} ideas in jar</p>
              </>
            )}
            <div className="border-t pt-4">
              <p className="text-sm font-medium text-gray-600 mb-2">Add new idea:</p>
              <div className="flex gap-2">
                <Input value={newIdea} onChange={(e) => setNewIdea(e.target.value)} placeholder="Picnic in the park..." className="flex-1 rounded-xl h-10" />
                <Button onClick={() => newIdea && createIdeaMutation.mutate(newIdea)} disabled={!newIdea} className="rounded-xl h-10 px-4 bg-pink-500 text-white">Add</Button>
              </div>
            </div>
            {dateIdeas.length > 0 && (
              <div className="max-h-40 overflow-y-auto space-y-1">
                {dateIdeas.slice(0, 10).map((idea) => (
                  <div key={idea.id} className={`text-sm p-2 rounded-lg ${idea.is_used ? 'bg-gray-100 text-gray-400 line-through' : 'bg-pink-50 text-gray-700'}`}>
                    {idea.idea}
                  </div>
                ))}
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
      </div>
    </div>
  );
}

function SharedTaskLists({ user, tasks, queryClient }) {
  const [newTask, setNewTask] = useState('');
  const [selectedList, setSelectedList] = useState('general');

  const lists = [
    { value: 'general', label: 'To-Do', icon: '📝' },
    { value: 'groceries', label: 'Groceries', icon: '🛒' },
    { value: 'chores', label: 'Chores', icon: '🧹' },
    { value: 'movies', label: 'Movies to Watch', icon: '🎬' }
  ];

  const createTaskMutation = useMutation({
    mutationFn: (data) => base44.entities.SharedTask.create(data),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['tasks'] }); setNewTask(''); }
  });

  const toggleTaskMutation = useMutation({
    mutationFn: ({ id, completed }) => base44.entities.SharedTask.update(id, { is_completed: !completed, completed_by: !completed ? user?.full_name : null }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['tasks'] })
  });

  const deleteTaskMutation = useMutation({
    mutationFn: (id) => base44.entities.SharedTask.delete(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['tasks'] })
  });

  const filteredTasks = tasks.filter(t => t.list_type === selectedList);

  return (
    <div className="space-y-4">
      <div className="flex gap-2 overflow-x-auto pb-1">
        {lists.map((list) => (
          <Button key={list.value} variant={selectedList === list.value ? 'default' : 'outline'} onClick={() => setSelectedList(list.value)}
            className={`rounded-full whitespace-nowrap h-9 ${selectedList === list.value ? 'bg-gradient-to-r from-pink-500 to-purple-500 text-white' : 'border-gray-200'}`}>
            {list.icon} {list.label}
          </Button>
        ))}
      </div>

      <div className="flex gap-2">
        <Input value={newTask} onChange={(e) => setNewTask(e.target.value)} placeholder="Add item..." className="flex-1 rounded-xl h-10"
          onKeyPress={(e) => e.key === 'Enter' && newTask && createTaskMutation.mutate({ title: newTask, list_type: selectedList, added_by: user?.full_name })} />
        <Button onClick={() => newTask && createTaskMutation.mutate({ title: newTask, list_type: selectedList, added_by: user?.full_name })} disabled={!newTask} className="bg-pink-500 text-white rounded-xl h-10 px-4">
          <Plus className="w-4 h-4" />
        </Button>
      </div>

      <div className="space-y-2">
        {filteredTasks.map((task) => (
          <div key={task.id} className={`glass-card rounded-xl p-3 flex items-center gap-3 ${task.is_completed ? 'opacity-60' : ''}`}>
            <button onClick={() => toggleTaskMutation.mutate({ id: task.id, completed: task.is_completed })}
              className={`w-6 h-6 rounded-lg border-2 flex items-center justify-center ${task.is_completed ? 'bg-green-500 border-green-500' : 'border-gray-300'}`}>
              {task.is_completed && <CheckSquare className="w-4 h-4 text-white" />}
            </button>
            <div className="flex-1 min-w-0">
              <p className={`font-medium ${task.is_completed ? 'line-through text-gray-400' : 'text-gray-800'}`}>{task.title}</p>
              <p className="text-xs text-gray-400">{task.added_by}</p>
            </div>
            <Button variant="ghost" size="icon" onClick={() => deleteTaskMutation.mutate(task.id)} className="text-gray-400 hover:text-red-500 h-8 w-8">
              <X className="w-4 h-4" />
            </Button>
          </div>
        ))}
        {filteredTasks.length === 0 && (
          <div className="text-center py-8 text-gray-400">
            <CheckSquare className="w-8 h-8 mx-auto mb-2 opacity-50" />
            <p className="text-sm">No items yet</p>
          </div>
        )}
      </div>
    </div>
  );
}

function EventDetailDialog({ event, onClose, onUpdate, onDelete, categories }) {
  const [memoryNote, setMemoryNote] = useState(event?.memory_note || '');
  const [uploading, setUploading] = useState(false);

  if (!event) return null;

  const catInfo = categories.find(c => c.value === event.category) || categories[4];
  const Icon = catInfo.icon;
  const isPastEvent = isPast(new Date(event.date));

  const handlePhotoUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    const { file_url } = await base44.integrations.Core.UploadFile({ file });
    onUpdate.mutate({ id: event.id, data: { memory_photo: file_url } });
    setUploading(false);
  };

  return (
    <Dialog open={!!event} onOpenChange={onClose}>
      <DialogContent className="glass-card max-w-md max-h-[90vh] overflow-y-auto">
        <div className={`-mx-6 -mt-6 p-4 ${catInfo.bgLight}`}>
          <div className="flex items-center gap-3">
            <div className={`w-12 h-12 rounded-xl ${catInfo.color} flex items-center justify-center`}>
              <Icon className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-800">{event.title}</h2>
              <p className="text-gray-500 text-sm">{format(new Date(event.date), 'EEEE, MMMM d, yyyy')}</p>
            </div>
          </div>
        </div>

        <div className="space-y-4 pt-2">
          {event.time && <div className="flex items-center gap-3 text-gray-600"><Clock className="w-4 h-4" />{event.time}</div>}
          {event.location && <div className="flex items-center gap-3 text-gray-600"><MapPin className="w-4 h-4" />{event.location}</div>}
          {event.link && (
            <a href={event.link} target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 text-pink-500 hover:underline">
              <ExternalLink className="w-4 h-4" />Open Link
            </a>
          )}
          {event.notes && <div className="bg-gray-50 rounded-xl p-3 text-gray-700 text-sm">{event.notes}</div>}

          {isPastEvent && (
            <div className="border-t pt-4">
              <h3 className="font-semibold text-gray-800 mb-3 flex items-center gap-2"><Heart className="w-4 h-4 text-pink-500" /> Memory</h3>
              {event.memory_photo && <img src={event.memory_photo} alt="" className="w-full h-40 object-cover rounded-xl mb-3" />}
              <label className="block mb-3">
                <input type="file" accept="image/*" onChange={handlePhotoUpload} className="hidden" />
                <div className="flex items-center justify-center gap-2 p-3 border-2 border-dashed border-gray-200 rounded-xl cursor-pointer hover:border-pink-300 text-gray-500 text-sm">
                  {uploading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Image className="w-4 h-4" />}
                  {event.memory_photo ? 'Change photo' : 'Add photo'}
                </div>
              </label>
              <Textarea value={memoryNote} onChange={(e) => setMemoryNote(e.target.value)} onBlur={() => onUpdate.mutate({ id: event.id, data: { memory_note: memoryNote } })} placeholder="Write about this memory..." className="rounded-xl" />
            </div>
          )}

          <div className="flex gap-2 pt-2">
            <Button variant="outline" onClick={() => onDelete.mutate(event.id)} className="rounded-xl border-red-200 text-red-500 hover:bg-red-50">Delete</Button>
            <Button onClick={onClose} className="flex-1 bg-gradient-to-r from-pink-500 to-purple-500 text-white rounded-xl">Close</Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
