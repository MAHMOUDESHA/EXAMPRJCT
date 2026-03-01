web: gunicorn wsgi:application --log-file - --bind 0.0.0.0:$PORT
release: cd backend && python manage.py migrate && python create_superuser.py
