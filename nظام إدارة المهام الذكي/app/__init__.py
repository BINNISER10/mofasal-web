"""
تهيئة تطبيق إدارة المهام
"""

import os
from flask import Flask
from flask_sqlalchemy import SQLAlchemy
from flask_wtf.csrf import CSRFProtect
from dotenv import load_dotenv

# تحميل متغيرات البيئة
load_dotenv()

# تهيئة الإضافات
db = SQLAlchemy()
csrf = CSRFProtect()

def create_app():
    """إنشاء وتكوين تطبيق Flask"""
    app = Flask(__name__)
    
    # تكوين التطبيق
    app.config['SECRET_KEY'] = os.environ.get('SECRET_KEY') or 'dev-secret-key-change-in-production'
    app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///tasks.db'
    app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
    app.config['WTF_CSRF_TIME_LIMIT'] = None
    
    # تهيئة الإضافات مع التطبيق
    db.init_app(app)
    csrf.init_app(app)
    
    # تسجيل المسارات
    from app import routes
    app.register_blueprint(routes.bp)
    
    # إنشاء جداول قاعدة البيانات
    with app.app_context():
        db.create_all()
        
        # تفعيل الحفظ التلقائي إلى مجلد AUTOCORE SYSTEM FILES
        from app.utils import setup_auto_backup
        setup_auto_backup(app)
    
    return app