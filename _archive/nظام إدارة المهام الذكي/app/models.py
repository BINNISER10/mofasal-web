"""
نماذج البيانات لنظام إدارة المهام
"""

from app import db
from datetime import datetime

class Task(db.Model):
    """نموذج المهمة"""
    
    id = db.Column(db.Integer, primary_key=True)
    title = db.Column(db.String(200), nullable=False)
    description = db.Column(db.Text, nullable=True)
    due_date = db.Column(db.DateTime, nullable=True)
    priority = db.Column(db.String(20), nullable=False, default='متوسطة')  # منخفضة, متوسطة, عالية
    created_at = db.Column(db.DateTime, nullable=False, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, nullable=False, default=datetime.utcnow, onupdate=datetime.utcnow)
    completed = db.Column(db.Boolean, nullable=False, default=False)
    
    def to_dict(self):
        """تحويل الكائن إلى قاموس للتحويل إلى JSON"""
        return {
            'id': self.id,
            'title': self.title,
            'description': self.description,
            'due_date': self.due_date.isoformat() if self.due_date else None,
            'priority': self.priority,
            'created_at': self.created_at.isoformat(),
            'updated_at': self.updated_at.isoformat(),
            'completed': self.completed
        }
    
    def __repr__(self):
        return f'<Task {self.title}>'