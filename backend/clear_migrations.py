import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'backend.settings')
django.setup()

from django.db import connection

# Drop all tables and clear migration history
cursor = connection.cursor()

# Get all table names
cursor.execute("""
    SELECT table_name 
    FROM information_schema.tables 
    WHERE table_schema = 'public'
""")
tables = cursor.fetchall()

# Drop all tables
for table in tables:
    table_name = table[0]
    print(f'Dropping table: {table_name}')
    cursor.execute(f'DROP TABLE IF EXISTS "{table_name}" CASCADE')

# Clear migration history
cursor.execute('DELETE FROM django_migrations')
print('All tables dropped and migration history cleared')

# Now run migrations fresh
from django.core.management import execute_from_command_line

execute_from_command_line(['manage.py', 'migrate'])
