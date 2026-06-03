"""
مسارات تطبيق إدارة المهام
"""

from flask import Blueprint, render_template, request, redirect, url_for, flash, jsonify
from app import db
from app.models import Task
from datetime import datetime
import json

bp = Blueprint('main', __name__)

@bp.route('/')
def index():
    """الصفحة الرئيسية - عرض جميع المهام"""
    # الحصول على معلمات التصفية
    filter_status = request.args.get('filter', 'all')  # all, active, completed
    filter_priority = request.args.get('priority', 'all')  # all, low, medium, high
    search_query = request.args.get('q', '').strip()
    
    # بناء الاستعلام
    query = Task.query
    
    if filter_status == 'active':
        query = query.filter_by(completed=False)
    elif filter_status == 'completed':
        query = query.filter_by(completed=True)
    
    if filter_priority != 'all':
        query = query.filter_by(priority=filter_priority)
    
    if search_query:
        search_term = f"%{search_query}%"
        query = query.filter(
            db.or_(
                Task.title.ilike(search_term),
                Task.description.ilike(search_term)
            )
        )
    
    # ترتيب المهام: أولاً غير المكتملة حسب التاريخ (الأحدث أولاً)، ثم المكتملة
    tasks = query.order_by(Task.completed.asc(), Task.created_at.desc()).all()
    
    return render_template('index.html', 
                         tasks=tasks,
                         filter_status=filter_status,
                         filter_priority=filter_priority,
                         search_query=search_query)

@bp.route('/add', methods=['POST'])
def add_task():
    """إضافة مهمة جديدة"""
    title = request.form.get('title', '').strip()
    description = request.form.get('description', '').strip()
    due_date_str = request.form.get('due_date', '').strip()
    priority = request.form.get('priority', 'متوسطة')
    
    # التحقق من صحة البيانات
    if not title:
        flash('عنوان المهمة مطلوب', 'error')
        return redirect(url_for('main.index'))
    
    # تحويل تاريخ الاستحقاق
    due_date = None
    if due_date_str:
        try:
            due_date = datetime.strptime(due_date_str, '%Y-%m-%d')
        except ValueError:
            flash('تنسيق التاريخ غير صحيح. استخدم YYYY-MM-DD', 'error')
            return redirect(url_for('main.index'))
    
    # إنشاء وحفظ المهمة
    task = Task(
        title=title,
        description=description if description else None,
        due_date=due_date,
        priority=priority
    )
    
    db.session.add(task)
    db.session.commit()
    
    flash('تم إضافة المهمة بنجاح', 'success')
    return redirect(url_for('main.index'))

@bp.route('/edit/<int:task_id>', methods=['GET', 'POST'])
def edit_task(task_id):
    """تعديل مهمة موجودة"""
    task = Task.query.get_or_404(task_id)
    
    if request.method == 'POST':
        title = request.form.get('title', '').strip()
        description = request.form.get('description', '').strip()
        due_date_str = request.form.get('due_date', '').strip()
        priority = request.form.get('priority', 'متوسطة')
        
        # التحقق من صحة البيانات
        if not title:
            flash('عنوان المهمة مطلوب', 'error')
            return render_template('edit.html', task=task)
        
        # تحويل تاريخ الاستحقاق
        due_date = None
        if due_date_str:
            try:
                due_date = datetime.strptime(due_date_str, '%Y-%m-%d')
            except ValueError:
                flash('تنسيق التاريخ غير صحيح. استخدم YYYY-MM-DD', 'error')
                return render_template('edit.html', task=task)
        
        # تحديث المهمة
        task.title = title
        task.description = description if description else None
        task.due_date = due_date
        task.priority = priority
        
        db.session.commit()
        
        flash('تم تحديث المهمة بنجاح', 'success')
        return redirect(url_for('main.index'))
    
    return render_template('edit.html', task=task)

@bp.route('/delete/<int:task_id>', methods=['POST'])
def delete_task(task_id):
    """حذف مهمة"""
    task = Task.query.get_or_404(task_id)
    db.session.delete(task)
    db.session.commit()
    
    flash('تم حذف المهمة بنجاح', 'success')
    return redirect(url_for('main.index'))

@bp.route('/toggle/<int:task_id>', methods=['POST'])
def toggle_task(task_id):
    """تبديل حالة المهمة (مكتملة/غير مكتملة)"""
    task = Task.query.get_or_404(task_id)
    task.completed = not task.completed
    db.session.commit()
    
    return jsonify({
        'success': True,
        'completed': task.completed
    })

@bp.route('/clear_completed', methods=['POST'])
def clear_completed():
    """حذف جميع المهام المكتملة"""
    completed_tasks = Task.query.filter_by(completed=True).all()
    for task in completed_tasks:
        db.session.delete(task)
    db.session.commit()
    
    flash(f'تم حذف {len(completed_tasks)} مهمة مكتملة', 'success')
    return redirect(url_for('main.index'))