"""
النظام الذكي لإدارة المهام
Smart Task Management System

هذا الملف هو نقطة الدخول لتشغيل التطبيق.
"""

from app import create_app

app = create_app()

if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0', port=5000)