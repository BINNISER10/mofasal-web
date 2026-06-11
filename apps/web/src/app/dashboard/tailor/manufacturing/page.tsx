'use client';
import React, { useState, useEffect } from 'react';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { useAppStore } from '@/lib/stores/appStore';
import { formatCurrency } from '@/lib/utils/formatting';
import { Settings, Play, Pause, CheckCircle, Clock, Loader2, User } from 'lucide-react';
import toast from 'react-hot-toast';

interface ManufacturingTask {
  id: string;
  orderId: string;
  orderNumber: string;
  stage: string;
  status: string;
  assignedTo?: string;
  estimatedHours?: number;
  actualHours?: number;
  startedAt?: string;
  completedAt?: string;
}

const STAGES = [
  { id: 'CUTTING_FABRIC', labelAr: 'قص القماش', labelEn: 'Cutting Fabric', color: '#F57C00' },
  { id: 'SEWING_ASSEMBLY', labelAr: 'الخياطة والتجميع', labelEn: 'Sewing Assembly', color: '#735B4D' },
  { id: 'IRONING_FINISHING', labelAr: 'الكي والتشطيب', labelEn: 'Ironing & Finishing', color: '#00373E' },
  { id: 'PACKING_WRAPPING', labelAr: 'التغليف والتعبئة', labelEn: 'Packing & Wrapping', color: '#1A6470' },
];

const FALLBACK_TASKS: ManufacturingTask[] = [
  {
    id: '1',
    orderId: 'ord-1',
    orderNumber: 'MUF-1284',
    stage: 'CUTTING_FABRIC',
    status: 'IN_PROGRESS',
    assignedTo: 'علي محمد',
    estimatedHours: 2,
    actualHours: 1.5,
    startedAt: '2024-01-15T09:00:00Z',
  },
  {
    id: '2',
    orderId: 'ord-2',
    orderNumber: 'MUF-1283',
    stage: 'SEWING_ASSEMBLY',
    status: 'PENDING',
    assignedTo: 'فيصل الحربي',
    estimatedHours: 4,
  },
  {
    id: '3',
    orderId: 'ord-3',
    orderNumber: 'MUF-1282',
    stage: 'IRONING_FINISHING',
    status: 'COMPLETED',
    assignedTo: 'ماجد الشمري',
    estimatedHours: 1,
    actualHours: 1,
    startedAt: '2024-01-14T14:00:00Z',
    completedAt: '2024-01-14T15:00:00Z',
  },
];

export default function ManufacturingPage() {
  const { isRTL } = useAppStore();
  const [tasks, setTasks] = useState<ManufacturingTask[]>(FALLBACK_TASKS);
  const [loading, setLoading] = useState(false);
  const [selectedStage, setSelectedStage] = useState<string | null>(null);

  const filteredTasks = selectedStage
    ? tasks.filter((t) => t.stage === selectedStage)
    : tasks;

  const getStageConfig = (stageId: string) => STAGES.find((s) => s.id === stageId) || STAGES[0];
  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'PENDING':
        return <Badge variant="warning" size="sm">{isRTL ? 'قيد الانتظار' : 'Pending'}</Badge>;
      case 'IN_PROGRESS':
        return <Badge variant="primary" size="sm">{isRTL ? 'قيد التنفيذ' : 'In Progress'}</Badge>;
      case 'COMPLETED':
        return <Badge variant="success" size="sm">{isRTL ? 'مكتمل' : 'Completed'}</Badge>;
      default:
        return <Badge variant="neutral" size="sm">{status}</Badge>;
    }
  };

  const handleStartTask = async (taskId: string) => {
    setTasks((prev) =>
      prev.map((t) =>
        t.id === taskId
          ? { ...t, status: 'IN_PROGRESS', startedAt: new Date().toISOString() }
          : t
      )
    );
    toast.success(isRTL ? 'بدأت المهمة' : 'Task started');
  };

  const handleCompleteTask = async (taskId: string) => {
    setTasks((prev) =>
      prev.map((t) =>
        t.id === taskId
          ? { ...t, status: 'COMPLETED', completedAt: new Date().toISOString() }
          : t
      )
    );
    toast.success(isRTL ? 'اكتملت المهمة' : 'Task completed');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-[#00373E]">{isRTL ? 'مراحل التصنيع' : 'Manufacturing Stages'}</h2>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" icon={<Settings size={16} />}>
            {isRTL ? 'إعدادات' : 'Settings'}
          </Button>
        </div>
      </div>

      {/* Stage Filter */}
      <div className="flex gap-2 overflow-x-auto pb-2">
        <button
          onClick={() => setSelectedStage(null)}
          className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors ${
            !selectedStage
              ? 'bg-[#00373E] text-white'
              : 'bg-white text-[#735B4D] border border-[#D0D6D7]/30'
          }`}
        >
          {isRTL ? 'الكل' : 'All'}
        </button>
        {STAGES.map((stage) => (
          <button
            key={stage.id}
            onClick={() => setSelectedStage(stage.id)}
            className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors ${
              selectedStage === stage.id
                ? 'text-white'
                : 'bg-white text-[#735B4D] border border-[#D0D6D7]/30'
            }`}
            style={selectedStage === stage.id ? { backgroundColor: stage.color } : {}}
          >
            {isRTL ? stage.labelAr : stage.labelEn}
          </button>
        ))}
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {STAGES.map((stage) => {
          const stageTasks = tasks.filter((t) => t.stage === stage.id);
          const completed = stageTasks.filter((t) => t.status === 'COMPLETED').length;
          const inProgress = stageTasks.filter((t) => t.status === 'IN_PROGRESS').length;
          return (
            <Card key={stage.id} className="p-5">
              <div className="flex items-center gap-3">
                <div
                  className="w-10 h-10 rounded-xl flex items-center justify-center"
                  style={{ backgroundColor: stage.color + '20', color: stage.color }}
                >
                  <Settings size={22} />
                </div>
                <div>
                  <p className="text-sm text-[#735B4D]">{isRTL ? stage.labelAr : stage.labelEn}</p>
                  <p className="text-lg font-bold text-[#00373E]">
                    {completed}/{stageTasks.length} {isRTL ? 'مكتمل' : 'done'}
                  </p>
                  {inProgress > 0 && (
                    <p className="text-xs text-[#F57C00]">{inProgress} {isRTL ? 'قيد التنفيذ' : 'in progress'}</p>
                  )}
                </div>
              </div>
            </Card>
          );
        })}
      </div>

      {/* Tasks Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {filteredTasks.map((task) => {
          const stageConfig = getStageConfig(task.stage);
          return (
            <Card key={task.id} className="p-5">
              <div className="flex items-start justify-between mb-3">
                <div>
                  <p className="font-bold text-[#00373E]">{task.orderNumber}</p>
                  <p className="text-sm text-[#735B4D]">{isRTL ? stageConfig.labelAr : stageConfig.labelEn}</p>
                </div>
                {getStatusBadge(task.status)}
              </div>

              {task.assignedTo && (
                <div className="flex items-center gap-2 text-sm text-[#735B4D] mb-3">
                  <User size={14} />
                  <span>{task.assignedTo}</span>
                </div>
              )}

              <div className="grid grid-cols-2 gap-3 mb-4 text-sm">
                <div>
                  <p className="text-[#735B4D]">{isRTL ? 'المقدّر' : 'Estimated'}</p>
                  <p className="font-semibold text-[#00373E]">{task.estimatedHours}h</p>
                </div>
                {task.actualHours && (
                  <div>
                    <p className="text-[#735B4D]">{isRTL ? 'الفعلي' : 'Actual'}</p>
                    <p className="font-semibold text-[#00373E]">{task.actualHours}h</p>
                  </div>
                )}
              </div>

              {task.startedAt && (
                <div className="flex items-center gap-2 text-xs text-[#735B4D] mb-4">
                  <Clock size={12} />
                  <span>{isRTL ? 'بدأ في' : 'Started'}: {new Date(task.startedAt).toLocaleDateString('ar')}</span>
                </div>
              )}

              <div className="flex gap-2">
                {task.status === 'PENDING' && (
                  <Button
                    variant="primary"
                    size="sm"
                    fullWidth
                    icon={<Play size={14} />}
                    onClick={() => handleStartTask(task.id)}
                  >
                    {isRTL ? 'ابدأ' : 'Start'}
                  </Button>
                )}
                {task.status === 'IN_PROGRESS' && (
                  <Button
                    variant="success"
                    size="sm"
                    fullWidth
                    icon={<CheckCircle size={14} />}
                    onClick={() => handleCompleteTask(task.id)}
                  >
                    {isRTL ? 'أكمل' : 'Complete'}
                  </Button>
                )}
                {task.status === 'COMPLETED' && (
                  <Button variant="outline" size="sm" fullWidth disabled>
                    {isRTL ? 'مكتمل' : 'Completed'}
                  </Button>
                )}
              </div>
            </Card>
          );
        })}
        {filteredTasks.length === 0 && (
          <Card className="p-8 text-center text-[#735B4D] md:col-span-2 lg:col-span-3">
            {isRTL ? 'لا توجد مهام' : 'No tasks found'}
          </Card>
        )}
      </div>
    </div>
  );
}
