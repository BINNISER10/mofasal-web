import express, { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import path from 'path';
import fs from 'fs';
import cors from 'cors';

const app = express();
const prisma = new PrismaClient();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));

// مسار ملف قاعدة البيانات ومجلد النسخ الاحتياطي
const DB_FILE = path.resolve(__dirname, '../prisma/tasks.db');
const BACKUP_DIR = fs.existsSync('G:/My Drive/OPEN CODE/MOFASAL/AUTOCORE SYSTEM FILES')
  ? 'G:/My Drive/OPEN CODE/MOFASAL/AUTOCORE SYSTEM FILES'
  : path.resolve(__dirname, '../../AUTOCORE SYSTEM FILES');

// دالة النسخ الاحتياطي التلقائي
const backupDatabase = () => {
  if (!fs.existsSync(DB_FILE)) {
    console.log(`Database file not found at: ${DB_FILE}`);
    return;
  }
  try {
    if (!fs.existsSync(BACKUP_DIR)) {
      fs.mkdirSync(BACKUP_DIR, { recursive: true });
    }
    
    // تنسيق التاريخ والوقت لتسمية الملف
    const now = new Date();
    const timestamp = `${now.getFullYear()}${(now.getMonth() + 1).toString().padStart(2, '0')}${now.getDate().toString().padStart(2, '0')}_${now.getHours().toString().padStart(2, '0')}${now.getMinutes().toString().padStart(2, '0')}${now.getSeconds().toString().padStart(2, '0')}`;
    const backupFilename = `tasks_backup_${timestamp}.db`;
    const backupPath = path.join(BACKUP_DIR, backupFilename);
    
    // نسخ ملف قاعدة البيانات
    fs.copyFileSync(DB_FILE, backupPath);
    console.log(`Successfully backed up database to: ${backupFilename}`);

    // الاحتفاظ بأحدث 5 نسخ احتياطية فقط وحذف القديم
    const files = fs.readdirSync(BACKUP_DIR)
      .filter(f => f.startsWith('tasks_backup_') && f.endsWith('.db'))
      .map(f => {
        const filePath = path.join(BACKUP_DIR, f);
        return {
          name: f,
          time: fs.statSync(filePath).mtime.getTime()
        };
      })
      .sort((a, b) => a.time - b.time); // الأقدم أولاً

    if (files.length > 5) {
      const toDelete = files.slice(0, files.length - 5);
      toDelete.forEach(f => {
        try {
          fs.unlinkSync(path.join(BACKUP_DIR, f.name));
          console.log(`Deleted old backup: ${f.name}`);
        } catch (err) {
          console.error(`Failed to delete old backup ${f.name}:`, err);
        }
      });
    }
  } catch (err) {
    console.error('Backup failed:', err);
  }
};

// Middleware لتنفيذ الحفظ الاحتياطي التلقائي بعد أي طلب تعديل ناجح
app.use((req, res, next) => {
  res.on('finish', () => {
    if (['POST', 'PUT', 'DELETE', 'PATCH'].includes(req.method) && res.statusCode >= 200 && res.statusCode < 300) {
      console.log(`Modifying request detected (${req.method} ${req.originalUrl}). Triggering auto backup...`);
      // تنفيذ النسخ الاحتياطي بعد ثانية لضمان كتابة البيانات بالكامل وقفل الملف
      setTimeout(backupDatabase, 1000);
    }
  });
  next();
});

// APIs لإدارة المهام

// 1. جلب قائمة المهام مع الفلترة والبحث
app.get('/api/tasks', async (req: Request, res: Response) => {
  try {
    const filterStatus = req.query.filter as string || 'all'; // all, active, completed
    const filterPriority = req.query.priority as string || 'all'; // all, منخفضة, متوسطة, عالية
    const searchQuery = req.query.q as string || '';

    // بناء كائن الشروط لـ Prisma
    const whereClause: any = {};

    // فلترة الحالة
    if (filterStatus === 'active') {
      whereClause.completed = false;
    } else if (filterStatus === 'completed') {
      whereClause.completed = true;
    }

    // فلترة الأولوية
    if (filterPriority !== 'all') {
      whereClause.priority = filterPriority;
    }

    // بحث بالاسم أو الوصف
    if (searchQuery) {
      whereClause.OR = [
        { title: { contains: searchQuery } },
        { description: { contains: searchQuery } }
      ];
    }

    // جلب البيانات: أولاً غير المكتملة، ثم المكتملة، ومرتبة تنازلياً حسب تاريخ الإنشاء
    const tasks = await prisma.task.findMany({
      where: whereClause,
      orderBy: [
        { completed: 'asc' },
        { createdAt: 'desc' }
      ]
    });

    res.json({ success: true, tasks });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// 2. إضافة مهمة جديدة
app.post('/api/tasks', async (req: Request, res: Response) => {
  try {
    const { title, description, dueDate, priority } = req.body;

    if (!title || !title.trim()) {
      return res.status(400).json({ success: false, error: 'عنوان المهمة مطلوب' });
    }

    const task = await prisma.task.create({
      data: {
        title: title.trim(),
        description: description ? description.trim() : null,
        dueDate: dueDate ? new Date(dueDate) : null,
        priority: priority || 'متوسطة'
      }
    });

    res.status(201).json({ success: true, task });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// 3. تعديل مهمة
app.put('/api/tasks/:id', async (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id);
    const { title, description, dueDate, priority } = req.body;

    if (!title || !title.trim()) {
      return res.status(400).json({ success: false, error: 'عنوان المهمة مطلوب' });
    }

    const task = await prisma.task.update({
      where: { id },
      data: {
        title: title.trim(),
        description: description ? description.trim() : null,
        dueDate: dueDate ? new Date(dueDate) : null,
        priority: priority || 'متوسطة'
      }
    });

    res.json({ success: true, task });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// 4. حذف مهمة
app.delete('/api/tasks/:id', async (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id);
    await prisma.task.delete({
      where: { id }
    });
    res.json({ success: true, message: 'تم حذف المهمة بنجاح' });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// 5. تبديل حالة المهمة (مكتملة / غير مكتملة)
app.post('/api/tasks/:id/toggle', async (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id);
    const existingTask = await prisma.task.findUnique({ where: { id } });
    
    if (!existingTask) {
      return res.status(404).json({ success: false, error: 'المهمة غير موجودة' });
    }

    const task = await prisma.task.update({
      where: { id },
      data: {
        completed: !existingTask.completed
      }
    });

    res.json({ success: true, completed: task.completed, task });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// 6. حذف جميع المهام المكتملة
app.post('/api/tasks/clear-completed', async (req: Request, res: Response) => {
  try {
    const deleteResult = await prisma.task.deleteMany({
      where: { completed: true }
    });
    res.json({ success: true, message: `تم حذف ${deleteResult.count} مهمة مكتملة` });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// تشغيل الخادم
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
