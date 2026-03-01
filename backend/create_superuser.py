import os
import django


os.environ.setdefault("DJANGO_SETTINGS_MODULE", "settings")
django.setup()

from django.contrib.auth import get_user_model  # noqa: E402


def ensure_superuser():
    username = os.environ.get("DJANGO_SUPERUSER_USERNAME")
    email = os.environ.get("DJANGO_SUPERUSER_EMAIL")
    password = os.environ.get("DJANGO_SUPERUSER_PASSWORD")

    if not username or not email or not password:
        print("Superuser env vars not set. Skipping superuser creation.")
        return

    User = get_user_model()
    user, created = User.objects.get_or_create(
        username=username,
        defaults={
            "email": email,
            "is_staff": True,
            "is_superuser": True,
            "user_type": "admin",
        },
    )

    if created:
        user.set_password(password)
        user.save()
        print(f"Created superuser: {username}")
        return

    changed = False
    if user.email != email:
        user.email = email
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
        print(f"Updated superuser: {username}")
    else:
        print(f"Superuser already up to date: {username}")


if __name__ == "__main__":
    ensure_superuser()
