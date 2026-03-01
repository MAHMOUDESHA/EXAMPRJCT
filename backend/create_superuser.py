import os
import django


os.environ.setdefault("DJANGO_SETTINGS_MODULE", "settings")
django.setup()

from django.contrib.auth import get_user_model  # noqa: E402
from accounts.models import Student, Teacher  # noqa: E402


def ensure_superuser():
    username = os.environ.get("DJANGO_SUPERUSER_USERNAME")
    email = os.environ.get("DJANGO_SUPERUSER_EMAIL")
    password = os.environ.get("DJANGO_SUPERUSER_PASSWORD")

    if not username or not email or not password:
        print("Superuser env vars not set. Skipping superuser creation.")
        return

    User = get_user_model()
    user = User.objects.filter(username__iexact=username).first() or User.objects.filter(email__iexact=email).first()
    created = False
    if not user:
        user = User(username=username, email=email)
        created = True

    changed = created
    if user.username != username:
        user.username = username
        changed = True
    if user.email != email:
        user.email = email
        changed = True
    if not user.is_active:
        user.is_active = True
        changed = True
    if not user.is_staff:
        user.is_staff = True
        changed = True
    if not user.is_superuser:
        user.is_superuser = True
        changed = True
    if getattr(user, "user_type", None) != "admin":
        user.user_type = "admin"
        changed = True

    # Keep password in sync with env value
    if not user.check_password(password):
        user.set_password(password)
        changed = True

    if changed:
        user.save()
        print(f"{'Created' if created else 'Updated'} superuser: {username}")
    else:
        print(f"Superuser already up to date: {username}")


def _unique_employee_id():
    import random
    import string

    candidate = "TEA" + "".join(random.choices(string.digits, k=6))
    while Teacher.objects.filter(employee_id=candidate).exists():
        candidate = "TEA" + "".join(random.choices(string.digits, k=6))
    return candidate


def sync_legacy_accounts():
    User = get_user_model()
    synced = 0
    created_students = 0
    created_teachers = 0

    # Keep user.registration_number aligned with Student profile data.
    for student in Student.objects.select_related("user").all():
        if student.user_id and student.registration_number and student.user.registration_number != student.registration_number:
            student.user.registration_number = student.registration_number
            student.user.save(update_fields=["registration_number"])
            synced += 1

    # Create missing Student profile for legacy student users when possible.
    for user in User.objects.filter(user_type="student"):
        if not Student.objects.filter(user=user).exists() and user.registration_number:
            if not Student.objects.filter(registration_number=user.registration_number).exists():
                full_name = (f"{user.first_name} {user.last_name}").strip() or user.username
                Student.objects.create(
                    user=user,
                    full_name=full_name,
                    registration_number=user.registration_number,
                )
                created_students += 1

    # Create missing Teacher profile for legacy teacher users.
    for user in User.objects.filter(user_type="teacher"):
        if not Teacher.objects.filter(user=user).exists():
            name = (f"{user.first_name} {user.last_name}").strip() or user.username
            Teacher.objects.create(
                user=user,
                name=name,
                employee_id=_unique_employee_id(),
            )
            created_teachers += 1

    print(
        "Legacy sync complete:",
        f"registration_synced={synced},",
        f"students_created={created_students},",
        f"teachers_created={created_teachers}",
    )


if __name__ == "__main__":
    ensure_superuser()
    sync_legacy_accounts()
