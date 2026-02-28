from django.http import HttpResponse
from django.middleware.csrf import get_token

def get_csrf_token(request):
    """
    View to get CSRF token. 
    Django automatically sets CSRF cookie for authenticated users,
    but this endpoint ensures it's set for JWT-based authentication.
    """
    get_token(request)
    return HttpResponse(status=204)
