"""
وظائف المساعدة لتطبيق إدارة المهام
"""

import os
import shutil
import sqlite3
from datetime import datetime
from flask import current_app, request

def setup_auto_backup(app):
    """إعداد الحفظ التلقائي لقاعدة البيانات إلى مجلد AUTOCORE SYSTEM FILES"""
    
    # الحصول على مسار مجلد الحفظ من متغيرات البيئة أو الإعدادات الافتراضية
    backup_folder = os.environ.get('AUTOCORE_BACKUP_FOLDER') or \
                    'G:/My Drive/OPEN CODE/MOFASAL/AUTOCORE SYSTEM FILES'
    
    # التأكد من وجود المجلد
    if not os.path.exists(backup_folder):
        try:
            os.makedirs(backup_folder)
        except Exception as e:
            app.logger.warning(f"لا يمكن إنشاء مجلد الحجز الاحتياطي: {e}")
            return
    
    # مسار قاعدة البيانات
    db_path = os.path.join(os.path.dirname(__file__), '..', 'tasks.db')
    db_path = os.path.abspath(db_path)
    
    def backup_database():
        """نسخ قاعدة البيانات إلى مجلد الحجز"""
        if not os.path.exists(db_path):
            return
        
        try:
            timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
            backup_filename = f"tasks_backup_{timestamp}.db"
            backup_path = os.path.join(backup_folder, backup_filename)
            
            # نسخ ملف قاعدة البيانات
            shutil.copy2(db_path, backup_path)
            
            # الاحتفاظ بأحدث 5 نسخ احتياطية فقط
            backups = sorted([
                f for f in os.listdir(backup_folder) 
                if f.startswith('tasks_backup_') and f.endswith('.db')
            ])
            
            if len(backups) > 5:
                for old_backup in backups[:-5]:
                    try:
                        os.remove(os.path.join(backup_folder, old_backup))
                    except Exception:
                        pass
                        
            app.logger.info(f"تم إنشاء نسخة احتياطية: {backup_filename}")
        except Exception as e:
            app.logger.error(f"فشل في إنشاء النسخة الاحتياطية: {e}")
    
    # تخزين وظيفة النسخ الاحتياطي في التطبيق للاستخدام اليدوي إذا لزم الأمر
    app.backup_database = backup_database
    
    # جدولة النسخ الاحتياطي بعد كل طلب يعدل البيانات
    @app.after_request
    def after_request(response):
        # تنفيذ النسخ الاحتياطي فقط للطلبات التي تعدل البيانات
        if request.method in ['POST', 'PUT', 'DELETE', 'PATCH']:
            try:
                backup_database()
            except Exception as e:
                app.logger.error(f"فشل في النسخ الاحتياطي التلقائي بعد الطلب: {e}")
        return response

def get_backup_folder():
    """الحصول على مسار مجلد الحجز الاحتياطي"""
    return os.environ.get('AUTOCORE_BACKUP_FOLDER') or \
           'G:/My Drive/OPEN CODE/MOFASAL/AUTOCORE SYSTEM FILES'